import re
import os
import json
import logging
from typing import AsyncGenerator

from langchain_groq import ChatGroq
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Memory extraction — pure regex, zero extra LLM calls
# ---------------------------------------------------------------------------

MEMORY_PATTERNS = [
    (r"(?i)my name is (\w+)", "name"),
    (r"(?i)(?:i am|i'm|call me) (\w+)(?:\s|,|\.)", "name"),
    (r"(?i)(?:preparing|studying|aiming) for (MDCAT|NUMS|medical)", "exam_goal"),
    (r"(?i)(MDCAT|NUMS) (?:is my goal|preparation|exam)", "exam_goal"),
    (r"(?i)(?:weak|struggling|bad|poor) (?:at|in) ([\w\s]{2,30}?)(?:\.|,|$|\n)", "weak_subject"),
    (r"(?i)(?:good|strong|best|excel) (?:at|in) ([\w\s]{2,30}?)(?:\.|,|$|\n)", "strong_subject"),
    (r"(?i)prefer (?:to (?:learn|study|explain) in |)(urdu|english|hindi)", "preferred_language"),
    (r"(?i)(?:i am|i'm) in (?:class|grade|year) (\w+)", "grade"),
    (r"(?i)(?:class|grade|year) (\d+)(?:th|st|nd|rd)?", "grade"),
    (r"(?i)my (?:target|goal|aim) (?:is|of|score) (.{5,60}?)(?:\.|$)", "learning_goal"),
    (r"(?i)(?:study|studies|studying) (\d+) hours?", "study_hours"),
]


def extract_memory_from_message(message: str) -> dict:
    """Extract key-value memory facts from a user message using regex patterns."""
    extracted: dict = {}
    for pattern, key in MEMORY_PATTERNS:
        if key in extracted:
            continue
        match = re.search(pattern, message)
        if match:
            value = match.group(match.lastindex).strip()
            if len(value) > 1:
                extracted[key] = value
    return extracted


# ---------------------------------------------------------------------------
# LLM + Tool Setup
# ---------------------------------------------------------------------------

def get_llm(streaming: bool = True) -> ChatGroq:
    return ChatGroq(
        model=os.getenv("GROQ_Model", "llama-3.3-70b-versatile"),
        groq_api_key=os.getenv("GROQ_API_KEY"),
        max_tokens=800,
        streaming=streaming,
    )


def get_search_tool() -> DuckDuckGoSearchRun:
    return DuckDuckGoSearchRun(max_results=3)


def build_system_prompt(memory_context: str) -> str:
    base = (
        "You are PrepCat AI, an expert tutor for Pakistani medical entrance exams "
        "(MDCAT and NUMS). Be friendly, patient, and educational. "
        "Explain concepts step by step with clear examples. "
        "Use simple language. When you need current or real-time information, use the search tool. "
        "Never make up facts. Always encourage the student."
    )
    if memory_context:
        base += f"\n\nAbout this student:\n{memory_context}"
    return base


def build_messages(system: str, session_history: list, current_message: str) -> list:
    """Build message list with sliding window (last 6 messages)."""
    msgs = [SystemMessage(content=system)]
    # Sliding window — last 6 messages only
    for msg in session_history[-6:]:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if role == "user":
            msgs.append(HumanMessage(content=content))
        elif role == "assistant":
            msgs.append(AIMessage(content=content))
    msgs.append(HumanMessage(content=current_message))
    return msgs


# ---------------------------------------------------------------------------
# Streaming Agent with optional tool use
# ---------------------------------------------------------------------------

async def stream_agent_response(
    message: str,
    session_history: list,
    memory_context: str,
) -> AsyncGenerator[str, None]:
    """
    Streams the AI response as SSE-formatted data chunks.
    The agent decides autonomously whether to use DuckDuckGo.
    """
    llm = get_llm(streaming=True)
    search_tool = get_search_tool()
    llm_with_tools = llm.bind_tools([search_tool])

    system = build_system_prompt(memory_context)
    messages = build_messages(system, session_history, message)

    try:
        # ── Phase 1: Stream first LLM response ──────────────────────────────
        collected_chunks = []
        tool_calls_accumulator = {}  # id → {name, args_str}
        streamed_content = ""
        has_tool_call = False

        async for chunk in llm_with_tools.astream(messages):
            collected_chunks.append(chunk)

            # Accumulate tool call fragments
            if chunk.tool_call_chunks:
                for tc_chunk in chunk.tool_call_chunks:
                    tc_id = tc_chunk.get("id") or tc_chunk.get("index", 0)
                    if tc_id not in tool_calls_accumulator:
                        tool_calls_accumulator[tc_id] = {
                            "id": tc_chunk.get("id", str(tc_id)),
                            "name": tc_chunk.get("name", ""),
                            "args_str": "",
                        }
                    if tc_chunk.get("name"):
                        tool_calls_accumulator[tc_id]["name"] = tc_chunk["name"]
                    if tc_chunk.get("args"):
                        tool_calls_accumulator[tc_id]["args_str"] += tc_chunk["args"]
                    has_tool_call = True

            # Stream content only if no tool call is happening
            elif chunk.content and not has_tool_call:
                streamed_content += chunk.content
                yield f"data: {json.dumps({'type': 'content', 'data': chunk.content})}\n\n"

        # ── Phase 2: If tool call requested, execute + stream final answer ──
        if has_tool_call and tool_calls_accumulator:
            yield f"data: {json.dumps({'type': 'status', 'data': '🔍 Searching the web...'})}\n\n"

            # Reconstruct full AI message from chunks
            full_ai_message = collected_chunks[0]
            for c in collected_chunks[1:]:
                full_ai_message = full_ai_message + c
            messages.append(full_ai_message)

            # Execute each tool and add results
            for tc_id, tc in tool_calls_accumulator.items():
                try:
                    args = json.loads(tc["args_str"]) if tc["args_str"] else {}
                    query = args.get("query", args.get("__arg1", message))
                    search_result = search_tool.run(query)
                except Exception as e:
                    search_result = f"Search failed: {str(e)}"

                messages.append(
                    ToolMessage(content=search_result, tool_call_id=tc["id"])
                )

            # Stream the final answer after tool use
            plain_llm = get_llm(streaming=True)
            async for chunk in plain_llm.astream(messages):
                if chunk.content:
                    yield f"data: {json.dumps({'type': 'content', 'data': chunk.content})}\n\n"

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    except Exception as e:
        logger.error(f"Agent error: {e}")
        try:
            status_data = '\n\n_Note: Search is currently unavailable, answering from memory..._\n\n'
            status_json = json.dumps({'type': 'status', 'data': status_data})
            yield f"data: {status_json}\n\n"
            plain_llm = get_llm(streaming=True)
            fallback_msgs = build_messages(system, session_history, message)
            async for chunk in plain_llm.astream(fallback_msgs):
                if chunk.content:
                    content_json = json.dumps({'type': 'content', 'data': chunk.content})
                    yield f"data: {content_json}\n\n"
            done_json = json.dumps({'type': 'done'})
            yield f"data: {done_json}\n\n"
        except Exception as fallback_e:
            logger.error(f"Fallback error: {fallback_e}")
            err_json = json.dumps({'type': 'error', 'data': 'Something went wrong. Please try again.'})
            yield f"data: {err_json}\n\n"
            done_json = json.dumps({'type': 'done'})
            yield f"data: {done_json}\n\n"

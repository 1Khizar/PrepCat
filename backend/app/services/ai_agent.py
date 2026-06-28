import re
import os
import json
import logging
import random
from typing import AsyncGenerator, Optional
from app.models.config import AIConfiguration
from sqlalchemy.orm import Session

from langchain_groq import ChatGroq
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage

logger = logging.getLogger(__name__)

# Greeting detection and responses
GREETING_PATTERNS = [
    r'^(hi|hello|hey|howdy|greetings|good\s+(morning|afternoon|evening))\b',
    r'^(assalamu\s+alaikum|salam|wa\s+alaikum\s+assalam)\b',
    r'^hi\s+there\b',
    r'^hey\s+there\b',
    r'^hello\s+there\b',
]

GREETING_RESPONSES = [
    "Hello! I'm PrepCat AI, your friendly tutor for MDCAT and NUMS preparation. How can I help you study today? 😊",
    "Hi there! Welcome to PrepCat. I'm here to help you with Biology, Physics, Chemistry, and English for your medical entrance exams. What would you like to learn? 📚",
    "Hey! Great to see you. I'm PrepCat AI, ready to assist you with your MDCAT/NUMS preparation. What subject are we working on today? ✨",
    "Assalamu Alaikum! I'm PrepCat AI, here to help you excel in your MDCAT and NUMS exams. How can I support your studies today? 🎯",
    "Hello! Welcome to PrepCat. I'm your AI tutor for medical entrance preparation. What would you like to explore today? 💪",
]

def is_greeting(message: str) -> bool:
    """Check if the message is a greeting."""
    message_lower = message.strip().lower()
    for pattern in GREETING_PATTERNS:
        if re.search(pattern, message_lower):
            return True
    return False

def get_greeting_response() -> str:
    """Get a random friendly greeting response."""
    return random.choice(GREETING_RESPONSES)

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

def get_llm(streaming: bool = True, config: AIConfiguration = None) -> ChatGroq:
    temp = config.temperature if config else 0.3
    tokens = config.max_tokens if config else 600
    top_p = config.top_p if config else 0.8
    
    return ChatGroq(
        model=os.getenv("GROQ_Model", "llama-3.3-70b-versatile"),
        groq_api_key=os.getenv("GROQ_API_KEY"),
        max_tokens=tokens,
        temperature=temp,
        top_p=top_p,
        streaming=streaming,
    )


def get_search_tool() -> DuckDuckGoSearchRun:
    return DuckDuckGoSearchRun(max_results=3)


def build_system_prompt(memory_context: str, config: AIConfiguration = None) -> str:
    if config and config.system_prompt:
        base = config.system_prompt
    else:
        base = (
            "You are PrepCat AI, an expert tutor for Pakistani medical entrance exams (MDCAT and NUMS). "
            "You are friendly, welcoming, encouraging, and provide PRECISE, CONCISE, and ACCURATE answers.\n\n"
            "You are LIMITED to answering questions related to the following topics ONLY:\n"
            "- MDCAT and NUMS exams (format, dates, advice, structure)\n"
            "- Biology\n- Physics\n- Chemistry\n- English\n\n"
            "If a user greets you, respond warmly as PrepCat AI and invite them to ask questions about their studies.\n\n"
            "If a user asks a question that is NOT related to these topics, politely decline and reply exactly with: "
            "'I can only answer questions related to MDCAT, NUMS, and their subjects (Biology, Physics, Chemistry, and English). "
            "Do you have a concept or question related to those?'\n\n"
            "GUIDELINES FOR ANSWERING:\n"
            "1. Be PRECISE and CONCISE - get to the point quickly\n"
            "2. Use clear, simple language\n"
            "3. Focus on accuracy and facts\n"
            "4. Explain concepts step by step with relevant examples when necessary\n"
            "5. Avoid unnecessary fluff or verbose introductions\n"
            "6. When you need current or real-time information, use the search tool\n"
            "7. Never make up facts\n"
            "8. Always encourage the student and keep a positive, supportive tone"
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
    db: Session = None,
) -> AsyncGenerator[str, None]:
    """
    Streams the AI response as SSE-formatted data chunks.
    The agent decides autonomously whether to use DuckDuckGo.
    """
    # Check if it's a greeting first
    if is_greeting(message) and len(session_history) == 0:
        greeting_response = get_greeting_response()
        # Stream the greeting response character by character for better UX
        for char in greeting_response:
            yield f"data: {json.dumps({'type': 'content', 'data': char})}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        return
    
    # Fetch config if db is provided
    config = None
    if db:
        config = db.query(AIConfiguration).first()
    
    system = build_system_prompt(memory_context, config)
    
    try:
        llm = get_llm(streaming=True, config=config)
        search_tool = get_search_tool()
        llm_with_tools = llm.bind_tools([search_tool])

        messages = build_messages(system, session_history, message)

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
            plain_llm = get_llm(streaming=True, config=config)
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
            plain_llm = get_llm(streaming=True, config=config)
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

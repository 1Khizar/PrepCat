from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy import insert
from pydantic import BaseModel
from typing import List, Optional
import json
import logging
import os
import time

from app.db.session import get_db
from app.models.ai_memory import UserMemory, AIInteraction
from app.models.user import User as UserModel
from app.models.config import AIConfiguration
from app.api.auth import get_current_user
from app.services.ai_agent import (
    stream_agent_response,
    extract_memory_from_message,
    get_llm,
)
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI Tutor"])


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    session_history: List[ChatMessage] = []


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_user_memory(db: Session, user_id: int) -> str:
    """Load all memory rows for a user and format as a readable string."""
    rows = db.query(UserMemory).filter(UserMemory.user_id == user_id).all()
    if not rows:
        return ""
    lines = [f"- {r.memory_key.replace('_', ' ').title()}: {r.memory_value}" for r in rows]
    return "\n".join(lines)


def upsert_memory(db: Session, user_id: int, key: str, value: str):
    """Insert or update a memory record for the user."""
    try:
        existing = (
            db.query(UserMemory)
            .filter(UserMemory.user_id == user_id, UserMemory.memory_key == key)
            .first()
        )
        if existing:
            existing.memory_value = value
        else:
            db.add(UserMemory(user_id=user_id, memory_key=key, memory_value=value))
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Memory upsert failed: {e}")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

async def save_interaction(
    db: Session,
    user_id: int,
    question: str,
    response: str,
    start_time: float,
):
    """Save the AI interaction to the database (runs in background)."""
    try:
        model_used = os.getenv("GROQ_Model", "llama-3.3-70b-versatile")
        response_time_ms = int((time.time() - start_time) * 1000)
        
        interaction = AIInteraction(
            user_id=user_id,
            question=question,
            response=response,
            model_used=model_used,
            response_time_ms=response_time_ms,
        )
        db.add(interaction)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to save interaction: {e}")
        db.rollback()


async def track_and_stream(
    db: Session,
    user_id: int,
    question: str,
    stream_gen: AsyncGenerator[str, None],
    start_time: float,
) -> AsyncGenerator[str, None]:
    """Stream the response while collecting it to save to database."""
    full_response = ""
    try:
        async for chunk in stream_gen:
            yield chunk
            # Try to extract the content from the SSE chunk
            if chunk.startswith("data: "):
                try:
                    data = json.loads(chunk[6:].strip())
                    if data.get("type") == "content":
                        full_response += data.get("data", "")
                except:
                    pass
    finally:
        # Save after streaming is complete
        if full_response:
            await save_interaction(db, user_id, question, full_response, start_time)


@router.post("/chat")
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """
    Streaming chat endpoint. Returns SSE text/event-stream.
    Each chunk: data: {"type": "content"|"status"|"done"|"error", "data": "..."}
    """
    start_time = time.time()
    
    # 1. Extract memory from this message (cheap regex — no LLM call)
    extracted = extract_memory_from_message(request.message)
    for key, value in extracted.items():
        upsert_memory(db, current_user.id, key, value)

    # 2. Load full memory context for system prompt
    memory_context = load_user_memory(db, current_user.id)

    # 3. Build history as plain dicts for the agent
    history = [{"role": m.role, "content": m.content} for m in request.session_history]

    # 4. Get stream generator
    stream_gen = stream_agent_response(request.message, history, memory_context, db)

    # 5. Stream and track
    return StreamingResponse(
        track_and_stream(db, current_user.id, request.message, stream_gen, start_time),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/memory")
def get_memory(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Return all stored memory facts for the current user."""
    rows = db.query(UserMemory).filter(UserMemory.user_id == current_user.id).all()
    return {
        "user_id": current_user.id,
        "memories": [
            {"key": r.memory_key, "value": r.memory_value}
            for r in rows
        ],
    }


@router.delete("/memory")
def clear_memory(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    """Clear all stored memory for the current user."""
    db.query(UserMemory).filter(UserMemory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Memory cleared"}


# ---------------------------------------------------------------------------
# Admin — AI Tutor Config & Health
# ---------------------------------------------------------------------------

class AIConfigUpdate(BaseModel):
    model: Optional[str] = None
    api_key: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    system_prompt: Optional[str] = None


def require_admin(current_user: UserModel = Depends(get_current_user)):
    role = current_user.role
    # role is stored as a plain string in DB; handle both str and enum
    role_str = role.value if hasattr(role, "value") else str(role)
    if role_str != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/admin/config")
def get_ai_config(db: Session = Depends(get_db), current_user: UserModel = Depends(require_admin)):
    """Return the current active Groq model, masked API key, and database config."""
    api_key = os.getenv("GROQ_API_KEY", "")
    masked = f"{'*' * (len(api_key) - 4)}{api_key[-4:]}" if len(api_key) > 4 else "****"
    
    # Get database config
    config = db.query(AIConfiguration).first()
    if not config:
        config = AIConfiguration()
        db.add(config)
        db.commit()
        db.refresh(config)
    
    return {
        "model": os.getenv("GROQ_Model", "llama-3.3-70b-versatile"),
        "api_key_masked": masked,
        "api_key_set": bool(api_key),
        "temperature": config.temperature,
        "max_tokens": config.max_tokens,
        "top_p": config.top_p,
        "system_prompt": config.system_prompt
    }


@router.post("/admin/config")
def update_ai_config(
    config: AIConfigUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin),
):
    """Update the active Groq model, API key, and/or database config."""
    updated = []
    
    # Update env vars
    if config.model:
        os.environ["GROQ_Model"] = config.model
        updated.append(f"model → {config.model}")
    if config.api_key:
        os.environ["GROQ_API_KEY"] = config.api_key
        updated.append("api_key → updated")
    
    # Update database config
    db_config = db.query(AIConfiguration).first()
    if not db_config:
        db_config = AIConfiguration()
        db.add(db_config)
    
    if config.temperature is not None:
        db_config.temperature = config.temperature
        updated.append(f"temperature → {config.temperature}")
    if config.max_tokens is not None:
        db_config.max_tokens = config.max_tokens
        updated.append(f"max_tokens → {config.max_tokens}")
    if config.top_p is not None:
        db_config.top_p = config.top_p
        updated.append(f"top_p → {config.top_p}")
    if config.system_prompt is not None:
        db_config.system_prompt = config.system_prompt
        updated.append("system_prompt → updated")
    
    db.commit()
    
    if not updated:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    return {"message": "Config updated", "changes": updated}


@router.post("/admin/health")
async def ai_health_check(db: Session = Depends(get_db), current_user: UserModel = Depends(require_admin)):
    """
    Sends a short test message to the configured Groq model.
    Returns status, response_time_ms, model used, and a snippet.
    """
    model = os.getenv("GROQ_Model", "llama-3.3-70b-versatile")
    
    # Get database config
    config = db.query(AIConfiguration).first()
    
    try:
        llm = get_llm(streaming=False, config=config)
        start = time.time()
        result = await llm.ainvoke([HumanMessage(content="Reply with only the word: OK")])
        elapsed_ms = int((time.time() - start) * 1000)
        snippet = result.content[:200] if result.content else "(empty response)"
        return {
            "status": "ok",
            "model": model,
            "response_time_ms": elapsed_ms,
            "snippet": snippet,
        }
    except Exception as e:
        return {
            "status": "error",
            "model": model,
            "response_time_ms": None,
            "error": str(e),
        }

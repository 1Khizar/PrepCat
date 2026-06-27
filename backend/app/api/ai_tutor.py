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
from app.models.ai_memory import UserMemory
from app.models.user import User as UserModel
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
    # 1. Extract memory from this message (cheap regex — no LLM call)
    extracted = extract_memory_from_message(request.message)
    for key, value in extracted.items():
        upsert_memory(db, current_user.id, key, value)

    # 2. Load full memory context for system prompt
    memory_context = load_user_memory(db, current_user.id)

    # 3. Build history as plain dicts for the agent
    history = [{"role": m.role, "content": m.content} for m in request.session_history]

    # 4. Stream response
    return StreamingResponse(
        stream_agent_response(request.message, history, memory_context),
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


def require_admin(current_user: UserModel = Depends(get_current_user)):
    role = current_user.role
    # role is stored as a plain string in DB; handle both str and enum
    role_str = role.value if hasattr(role, "value") else str(role)
    if role_str != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/admin/config")
def get_ai_config(current_user: UserModel = Depends(require_admin)):
    """Return the current active Groq model and a masked API key."""
    api_key = os.getenv("GROQ_API_KEY", "")
    masked = f"{'*' * (len(api_key) - 4)}{api_key[-4:]}" if len(api_key) > 4 else "****"
    return {
        "model": os.getenv("GROQ_Model", "llama-3.3-70b-versatile"),
        "api_key_masked": masked,
        "api_key_set": bool(api_key),
    }


@router.post("/admin/config")
def update_ai_config(
    config: AIConfigUpdate,
    current_user: UserModel = Depends(require_admin),
):
    """Update the active Groq model and/or API key at runtime (in-memory)."""
    updated = []
    if config.model:
        os.environ["GROQ_Model"] = config.model
        updated.append(f"model → {config.model}")
    if config.api_key:
        os.environ["GROQ_API_KEY"] = config.api_key
        updated.append("api_key → updated")
    if not updated:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    return {"message": "Config updated", "changes": updated}


@router.post("/admin/health")
async def ai_health_check(current_user: UserModel = Depends(require_admin)):
    """
    Sends a short test message to the configured Groq model.
    Returns status, response_time_ms, model used, and a snippet.
    """
    model = os.getenv("GROQ_Model", "llama-3.3-70b-versatile")
    try:
        llm = get_llm(streaming=False)
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

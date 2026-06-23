from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy import insert
from pydantic import BaseModel
from typing import List
import json
import logging

from app.db.session import get_db
from app.models.ai_memory import UserMemory
from app.models.user import User as UserModel
from app.api.auth import get_current_user
from app.services.ai_agent import (
    stream_agent_response,
    extract_memory_from_message,
)

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

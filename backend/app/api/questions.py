from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.question import Question

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.get("/")
def read_questions(db: Session = Depends(get_db)):
    return db.query(Question).all()

@router.get("/{question_id}")
def read_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q

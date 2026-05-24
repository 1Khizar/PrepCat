from pydantic import BaseModel
from typing import List, Optional

class QuestionBase(BaseModel):
    subject: str
    topic: str
    subtopic: Optional[str] = None
    question_text: str
    options: List[str]
    correct_option_index: int
    explanation: Optional[str] = None
    is_past_paper: bool = False
    paper_year: Optional[int] = None
    paper_board: Optional[str] = None
    difficulty: str = "Medium"

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    subject: Optional[str] = None
    topic: Optional[str] = None
    question_text: Optional[str] = None
    options: Optional[List[str]] = None
    correct_option_index: Optional[int] = None

class Question(QuestionBase):
    id: int

    class Config:
        from_attributes = True

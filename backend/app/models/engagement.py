from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Float, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class UserActivity(Base):
    __tablename__ = "user_activity"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_date = Column(Date, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activities")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    score = Column(Float)
    total_questions = Column(Integer)
    correct_answers = Column(Integer)
    
    # Store detailed analytics like {"topic_id": count}
    analytics_data = Column(JSON, nullable=True) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="attempts")

class SavedPaper(Base):
    __tablename__ = "saved_papers"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    paper_id = Column(Integer, ForeignKey("past_papers.id"), primary_key=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="saved_papers")
    paper = relationship("PastPaper", back_populates="bookmarked_by")

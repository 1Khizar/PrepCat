from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.session import Base

class PastPaper(Base):
    __tablename__ = "past_papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    year = Column(Integer)
    exam_type = Column(String, index=True)   # "MDCAT" or "NUMS"
    
    # Linked to Subject table for scalability
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    subject = Column(String, index=True) # Keeping the string for backward compatibility/quick lookup
    
    file_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    subject_rel = relationship("Subject", back_populates="past_papers")
    bookmarked_by = relationship("SavedPaper", back_populates="paper")

from sqlalchemy import Column, Integer, String, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Scalable Link to Topic -> Chapter -> Subject
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    
    # Keeping strings for quick queries
    subject = Column(String, index=True)  # Biology, Chemistry, etc.
    topic = Column(String, index=True)
    subtopic = Column(String, nullable=True)
    
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of strings: ["Option A", "Option B", ...]
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    
    is_past_paper = Column(Boolean, default=False)
    paper_year = Column(Integer, nullable=True)
    paper_board = Column(String, nullable=True)  # UHS, NUMS, etc.
    difficulty = Column(String, default="Medium")

    # Relationships
    topic_rel = relationship("Topic", back_populates="questions")

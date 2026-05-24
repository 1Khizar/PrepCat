from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) # e.g., Biology
    slug = Column(String, unique=True) # e.g., 'biology'
    color_hex = Column(String, default="#000000")
    icon_name = Column(String, nullable=True) # Lucide icon name
    
    chapters = relationship("Chapter", back_populates="subject", cascade="all, delete-orphan")
    past_papers = relationship("PastPaper", back_populates="subject_rel")

class Chapter(Base):
    __tablename__ = "chapters"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    name = Column(String, index=True)
    slug = Column(String)
    
    subject = relationship("Subject", back_populates="chapters")
    topics = relationship("Topic", back_populates="chapter", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    name = Column(String, index=True)
    slug = Column(String)
    
    chapter = relationship("Chapter", back_populates="topics")
    questions = relationship("Question", back_populates="topic_rel")

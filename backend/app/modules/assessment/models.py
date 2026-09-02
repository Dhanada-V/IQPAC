import uuid
from sqlalchemy import Column, String, Boolean, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class AssessmentSession(Base):
    __tablename__ = 'sessions'
    __table_args__ = {'schema': 'assessment'}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('auth.users.id', ondelete='CASCADE'), nullable=False)
    status = Column(String, nullable=False) # 'in_progress' or 'completed'
    started_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    total_score = Column(Numeric, nullable=True)

class AssessmentResponse(Base):
    __tablename__ = 'responses'
    __table_args__ = {'schema': 'assessment'}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey('assessment.sessions.id', ondelete='CASCADE'), nullable=False)
    question_id = Column(String, nullable=False) 
    selected_answer = Column(String, nullable=False)
    is_correct = Column(Boolean, nullable=True)
    answered_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

class AssessmentQuestion(Base):
    __tablename__ = 'questions'
    __table_args__ = {'schema': 'assessment'}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_answer = Column(String(1), nullable=False)
    explanation_text = Column(Text, nullable=True)

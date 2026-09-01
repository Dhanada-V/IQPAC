from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class AssessmentStartResponse(BaseModel):
    session_id: UUID
    candidate_id: UUID
    status: str
    started_at: datetime
    questions: List[dict]

class AssessmentAnswerRequest(BaseModel):
    session_id: UUID
    question_id: str
    selected_answer: str

class AssessmentAnswerResponse(BaseModel):
    response_id: UUID
    session_id: UUID
    question_id: str
    selected_answer: str
    answered_at: datetime

class AssessmentCompleteRequest(BaseModel):
    session_id: UUID

class AssessmentCompleteResponse(BaseModel):
    session_id: UUID
    status: str
    completed_at: datetime
    total_score: Optional[float] = None

class AssessmentScoreResponse(BaseModel):
    session_id: UUID
    candidate_id: UUID
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_score: Optional[float] = None
    total_questions: Optional[int] = None
    correct_answers: Optional[int] = None

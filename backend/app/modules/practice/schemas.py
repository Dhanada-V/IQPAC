from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class PracticeModuleItem(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    domain: str
    total_questions: Optional[int] = None

class PracticeQuestionItem(BaseModel):
    question_id: str
    prompt: str
    options: List[str]

class PracticeQuestionsResponse(BaseModel):
    module_id: UUID
    title: str
    questions: List[PracticeQuestionItem]

class PracticeCheckAnswerRequest(BaseModel):
    question_id: str
    selected_answer: str

class PracticeCheckAnswerResponse(BaseModel):
    question_id: str
    selected_answer: str
    is_correct: bool
    correct_answer: str
    explanation: str

class PracticeAnswerItem(BaseModel):
    question_id: str
    selected_answer: str

class PracticeSubmitRequest(BaseModel):
    answers: List[PracticeAnswerItem]

class PracticeAttemptResponse(BaseModel):
    attempt_id: UUID
    candidate_id: UUID
    module_id: UUID
    total_attempted: int
    correct_answers: int
    incorrect_answers: int
    accuracy_percentage: float
    score: Optional[float] = None
    feedback: Optional[str] = None
    attempted_at: datetime

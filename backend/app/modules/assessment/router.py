from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.core.database import get_db
from app.modules.assessment.schemas import (
    AssessmentStartResponse,
    AssessmentAnswerRequest,
    AssessmentAnswerResponse,
    AssessmentCompleteRequest,
    AssessmentCompleteResponse,
    AssessmentScoreResponse
)
from app.modules.assessment import services

router = APIRouter(prefix="/assessment", tags=["Assessment"])

@router.post("/start", response_model=AssessmentStartResponse, status_code=status.HTTP_200_OK)
async def start_assessment(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    POST /api/assessment/start (Protected: Bearer)
    Starts a new assessment session for the candidate.
    """
    candidate_id = UUID(current_user["id"])
    return services.start_assessment_session(db, candidate_id)

@router.post("/answer", response_model=AssessmentAnswerResponse, status_code=status.HTTP_200_OK)
async def answer_question(payload: AssessmentAnswerRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    POST /api/assessment/answer (Protected: Bearer)
    Submits an answer for a specific question within an active assessment session.
    """
    candidate_id = UUID(current_user["id"])
    return services.answer_assessment_question(db, payload, candidate_id)

@router.post("/complete", response_model=AssessmentCompleteResponse, status_code=status.HTTP_200_OK)
async def complete_assessment(payload: AssessmentCompleteRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    POST /api/assessment/complete (Protected: Bearer)
    Finalizes and completes an assessment session.
    """
    candidate_id = UUID(current_user["id"])
    return services.complete_assessment_session(db, payload, candidate_id)

@router.get("/score/{session_id}", response_model=AssessmentScoreResponse, status_code=status.HTTP_200_OK)
async def get_score(session_id: UUID, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    GET /api/assessment/score/{session_id} (Protected: Bearer)
    Retrieves the score and summary of a completed assessment session.
    """
    candidate_id = UUID(current_user["id"])
    return services.get_assessment_score(db, session_id, candidate_id)

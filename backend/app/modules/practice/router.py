from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.modules.practice.schemas import (
    PracticeModuleItem,
    PracticeQuestionsResponse,
    PracticeSubmitRequest,
    PracticeAttemptResponse
)

router = APIRouter(prefix="/practice", tags=["Practice"])

@router.get("/modules", response_model=List[PracticeModuleItem], status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def list_modules(current_user: dict = Depends(get_current_user)):
    """
    GET /api/practice/modules (Protected: Bearer)
    Lists all available practice modules.
    """
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not Implemented")

@router.get("/modules/{id}/questions", response_model=PracticeQuestionsResponse, status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_module_questions(id: UUID, current_user: dict = Depends(get_current_user)):
    """
    GET /api/practice/modules/{id}/questions (Protected: Bearer)
    Retrieves questions for a specific practice module.
    """
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not Implemented")

@router.post("/modules/{id}/submit", response_model=PracticeAttemptResponse, status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def submit_module_attempt(id: UUID, payload: PracticeSubmitRequest, current_user: dict = Depends(get_current_user)):
    """
    POST /api/practice/modules/{id}/submit (Protected: Bearer)
    Submits an attempt for a practice module and receives score & feedback.
    """
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not Implemented")

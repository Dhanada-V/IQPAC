from uuid import UUID, uuid4
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.practice.models import PracticeModule, PracticeAttempt
from app.modules.practice.schemas import (
    PracticeModuleItem,
    PracticeQuestionsResponse,
    PracticeQuestionItem,
    PracticeCheckAnswerRequest,
    PracticeCheckAnswerResponse,
    PracticeSubmitRequest,
    PracticeAttemptResponse
)

router = APIRouter(prefix="/practice", tags=["Practice"])

@router.get("/modules", response_model=List[PracticeModuleItem], status_code=status.HTTP_200_OK)
async def list_modules(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GET /api/practice/modules (Protected: Bearer)
    Lists active practice modules.
    """
    modules = (
        db.query(PracticeModule)
        .filter(PracticeModule.is_active.is_(True))
        .order_by(PracticeModule.title.asc())
        .all()
    )
    return [
        PracticeModuleItem(
            id=module.id,
            title=module.title,
            description=module.description,
            domain=module.domain,
            total_questions=len(module.questions) if module.questions else 0,
        )
        for module in modules
    ]

@router.get("/modules/{id}/questions", response_model=PracticeQuestionsResponse, status_code=status.HTTP_200_OK)
async def get_module_questions(
    id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GET /api/practice/modules/{id}/questions (Protected: Bearer)
    Retrieves questions for a specific practice module.
    Correct answers and explanations are explicitly excluded from this response.
    """
    module = db.query(PracticeModule).filter(PracticeModule.id == id, PracticeModule.is_active.is_(True)).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Practice module not found."
        )

    raw_questions = module.questions or []
    sanitized_questions = [
        PracticeQuestionItem(
            question_id=str(q.get("question_id", idx)),
            prompt=q.get("prompt", ""),
            options=q.get("options", [])
        )
        for idx, q in enumerate(raw_questions)
    ]

    return PracticeQuestionsResponse(
        module_id=module.id,
        title=module.title,
        questions=sanitized_questions
    )

@router.post("/modules/{id}/check-answer", response_model=PracticeCheckAnswerResponse, status_code=status.HTTP_200_OK)
async def check_question_answer(
    id: UUID,
    payload: PracticeCheckAnswerRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    POST /api/practice/modules/{id}/check-answer (Protected: Bearer)
    Evaluates candidate's selected answer for a specific question and returns feedback.
    """
    module = db.query(PracticeModule).filter(PracticeModule.id == id, PracticeModule.is_active.is_(True)).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Practice module not found."
        )

    raw_questions = module.questions or []
    target_q = None
    for idx, q in enumerate(raw_questions):
        q_id = str(q.get("question_id", idx))
        if q_id == payload.question_id:
            target_q = q
            break

    if not target_q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question not found in specified practice module."
        )

    correct_ans = str(target_q.get("correct_answer", ""))
    is_correct = (payload.selected_answer.strip().lower() == correct_ans.strip().lower())
    explanation = target_q.get("explanation", "No explanation provided for this question.")

    return PracticeCheckAnswerResponse(
        question_id=payload.question_id,
        selected_answer=payload.selected_answer,
        is_correct=is_correct,
        correct_answer=correct_ans,
        explanation=explanation
    )

@router.post("/modules/{id}/submit", response_model=PracticeAttemptResponse, status_code=status.HTTP_200_OK)
async def submit_module_attempt(
    id: UUID,
    payload: PracticeSubmitRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    POST /api/practice/modules/{id}/submit (Protected: Bearer)
    Finalizes a practice module attempt, persists it to practice.attempts, and returns learning summary metrics.
    """
    module = db.query(PracticeModule).filter(PracticeModule.id == id, PracticeModule.is_active.is_(True)).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Practice module not found."
        )

    raw_questions = module.questions or []
    questions_by_id = {
        str(q.get("question_id", idx)): q for idx, q in enumerate(raw_questions)
    }

    correct_count = 0
    total_attempted = len(payload.answers)

    for item in payload.answers:
        q_data = questions_by_id.get(item.question_id)
        if q_data and q_data.get("correct_answer", "").strip().lower() == item.selected_answer.strip().lower():
            correct_count += 1

    incorrect_count = total_attempted - correct_count
    accuracy = (correct_count / total_attempted * 100.0) if total_attempted > 0 else 0.0

    feedback_text = (
        f"Completed practice with {correct_count}/{total_attempted} correct answers "
        f"({accuracy:.1f}% accuracy)."
    )

    # Candidate ID from current_user or default UUID
    user_id_str = current_user.get("id") if isinstance(current_user, dict) else None
    try:
        candidate_uuid = UUID(user_id_str) if user_id_str else UUID("123e4567-e89b-12d3-a456-426614174000")
    except (ValueError, TypeError):
        candidate_uuid = UUID("123e4567-e89b-12d3-a456-426614174000")

    attempt = PracticeAttempt(
        id=uuid4(),
        candidate_id=candidate_uuid,
        module_id=module.id,
        score=accuracy,
        feedback=feedback_text,
        attempted_at=datetime.now(timezone.utc)
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return PracticeAttemptResponse(
        attempt_id=attempt.id,
        candidate_id=attempt.candidate_id,
        module_id=attempt.module_id,
        total_attempted=total_attempted,
        correct_answers=correct_count,
        incorrect_answers=incorrect_count,
        accuracy_percentage=round(accuracy, 2),
        score=float(attempt.score) if attempt.score is not None else round(accuracy, 2),
        feedback=attempt.feedback,
        attempted_at=attempt.attempted_at
    )

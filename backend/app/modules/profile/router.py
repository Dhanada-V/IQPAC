from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.modules.profile.models import Profile
from app.modules.profile.schemas import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/profile", tags=["Profile"])


def _current_user_id(current_user) -> UUID:
    raw_id = (
        current_user["id"]
        if isinstance(current_user, dict)
        else getattr(current_user, "id", None)
    )

    if raw_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UUID(str(raw_id)) if isinstance(raw_id, str) else raw_id


@router.get("", response_model=ProfileResponse)
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GET /api/profile (Protected: Bearer)
    Retrieves candidate profile for current user; 404 if no row exists yet.
    """
    user_uuid = _current_user_id(current_user)

    profile = db.query(Profile).filter(Profile.user_id == user_uuid).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    return profile


@router.put("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    PUT /api/profile (Protected: Bearer)
    Upserts candidate personal_details, education_details, skills, and resume_url.
    """
    user_uuid = _current_user_id(current_user)

    profile = db.query(Profile).filter(Profile.user_id == user_uuid).first()

    if not profile:
        profile = Profile(
            user_id=user_uuid,
            personal_details=(
                payload.personal_details
                if payload.personal_details is not None
                else {}
            ),
            education_details=(
                payload.education_details
                if payload.education_details is not None
                else {}
            ),
            skills=payload.skills if payload.skills is not None else [],
            resume_url=payload.resume_url,
        )
        db.add(profile)
    else:
        if payload.personal_details is not None:
            profile.personal_details = payload.personal_details

        if payload.education_details is not None:
            profile.education_details = payload.education_details

        if payload.skills is not None:
            profile.skills = payload.skills

        if payload.resume_url is not None:
            profile.resume_url = payload.resume_url

        profile.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(profile)

    return profile

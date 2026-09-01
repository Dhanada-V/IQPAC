from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.modules.profile.schemas import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=ProfileResponse, status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """
    GET /api/profile (Protected: Bearer)
    Retrieves candidate profile.
    """
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not Implemented")

@router.put("", response_model=ProfileResponse, status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def update_profile(payload: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """
    PUT /api/profile (Protected: Bearer)
    Updates candidate profile details.
    """
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not Implemented")

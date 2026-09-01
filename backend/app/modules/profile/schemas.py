from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class ProfileUpdate(BaseModel):
    personal_details: Optional[Dict[str, Any]] = None
    education_details: Optional[Dict[str, Any]] = None
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = None

class ProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    personal_details: Dict[str, Any]
    education_details: Dict[str, Any]
    skills: List[str]
    resume_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

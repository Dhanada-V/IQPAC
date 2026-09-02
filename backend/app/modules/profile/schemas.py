from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID

class ProfileUpdate(BaseModel):
    personal_details: Optional[Dict[str, Any]] = None
    education_details: Optional[Dict[str, Any]] = None
    skills: Optional[List[str]] = None
    resume_url: Optional[str] = None

class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    personal_details: Dict[str, Any] = Field(default_factory=dict)
    education_details: Dict[str, Any] = Field(default_factory=dict)
    skills: List[str] = Field(default_factory=list)
    resume_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

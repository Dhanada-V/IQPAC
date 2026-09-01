from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    mobile_number: str
    college: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    graduation_year: Optional[int] = None

class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    mobile_number: str
    college: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    graduation_year: Optional[int] = None
    email_verified: bool = False
    created_at: datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

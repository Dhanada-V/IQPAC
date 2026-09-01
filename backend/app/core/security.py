from typing import Optional
from datetime import timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_scheme = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Stub signature for creating JWT access tokens.
    No other module reimplements this signature.
    """
    return "stubbed_jwt_token"

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> dict:
    """
    Dependency stub for retrieving the current authenticated user.
    No other module reimplements this signature.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "candidate@iqpac.com",
        "full_name": "Stub Candidate"
    }

from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.modules.auth.schemas import RegisterRequest, UserResponse, LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def register(payload: RegisterRequest):
    """
    POST /api/auth/register (Public)
    Registers a new candidate user account.
    """
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not Implemented")

@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def login(payload: LoginRequest):
    """
    POST /api/auth/login (Public)
    Authenticates user credentials and returns a JWT access token.
    """
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not Implemented")

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    GET /api/auth/me (Protected: Bearer)
    Returns details of the currently authenticated user.
    """
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not Implemented")

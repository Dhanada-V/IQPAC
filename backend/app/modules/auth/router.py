from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash, verify_password, create_access_token
from app.modules.auth.models import User
from app.modules.auth.schemas import RegisterRequest, UserResponse, LoginRequest, LoginResponse, UserLoginInfo

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    POST /api/auth/register (Public)
    Registers a new candidate user account.
    """
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(payload.password)
    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        mobile_number=payload.mobile_number,
        college=payload.college,
        degree=payload.degree,
        department=payload.department,
        graduation_year=payload.graduation_year,
        password_hash=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    POST /api/auth/login (Public)
    Authenticates user credentials and returns a JWT access token.
    """
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserLoginInfo(
            id=user.id,
            email=user.email,
            full_name=user.full_name
        )
    )

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_me(current_user: User = Depends(get_current_user)):
    """
    GET /api/auth/me (Protected: Bearer)
    Returns details of the currently authenticated user.
    """
    return current_user

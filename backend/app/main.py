from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.modules.auth.router import router as auth_router
from app.modules.profile.router import router as profile_router
from app.modules.assessment.router import router as assessment_router
from app.modules.practice.router import router as practice_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="iQPAC Student Module - Shared Foundation MVP API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include module routers under /api
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(assessment_router, prefix=settings.API_V1_STR)
app.include_router(practice_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to iQPAC Student Module API",
        "docs": "/docs",
        "contract": "See /docs/API_CONTRACT.md"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

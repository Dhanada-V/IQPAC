import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import uuid

# Assuming the app has a main entry point like app.main.app
from app.main import app
from app.core.database import Base, get_db
from app.core.security import get_current_user
from app.modules.assessment.models import AssessmentQuestion
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID

# Mock the auth.users table for SQLite testing
class MockUser(Base):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'auth'}
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)


# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Mock user dependency
TEST_USER = {
    "id": str(uuid.uuid4()),
    "email": "test@example.com",
    "full_name": "Test User"
}
def override_get_current_user():
    return TEST_USER

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    # SQLite does not support schemas. We must clear the schema from all tables
    # so that create_all() doesn't fail with "unknown database".
    for table in Base.metadata.tables.values():
        table.schema = None
        
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Seed 20 questions
    for i in range(1, 21):
        q = AssessmentQuestion(
            id=str(uuid.uuid4()),
            question_text=f"Question {i}",
            option_a="A", option_b="B", option_c="C", option_d="D",
            correct_answer="A",
            explanation_text="Explanation"
        )
        db.add(q)
    db.commit()
    db.close()
    
    yield
    
    Base.metadata.drop_all(bind=engine)

def test_assessment_flow():
    # 1. Start session
    response = client.post("/api/assessment/start")
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert len(data["questions"]) == 20
    
    session_id = data["session_id"]
    questions = data["questions"]
    
    # 2. Answer 20 questions (14 correct -> 70%)
    for i, q in enumerate(questions):
        answer = "A" if i < 14 else "B" # 14 correct, 6 incorrect
        resp = client.post("/api/assessment/answer", json={
            "session_id": session_id,
            "question_id": q["id"],
            "selected_answer": answer
        })
        assert resp.status_code == 200
        
    # 3. Complete session
    comp_resp = client.post("/api/assessment/complete", json={"session_id": session_id})
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert comp_data["status"] == "completed"
    assert comp_data["total_score"] == 14
    
    # 4. Get Score / Explanation
    score_resp = client.get(f"/api/assessment/score/{session_id}")
    assert score_resp.status_code == 200
    score_data = score_resp.json()
    assert score_data["total_score"] == 14
    assert score_data["total_questions"] == 20
    assert score_data["correct_answers"] == 14

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import uuid

from app.main import app
from app.core.database import Base, get_db
from app.modules.assessment.models import AssessmentQuestion

# Setup test DB (PostgreSQL)
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/test_db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    # Create schemas in the test DB
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS auth;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS candidate;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS practice;"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS assessment;"))
        conn.commit()

    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
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
    # 0. Register and Login to get a real token
    register_resp = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "test_e2e@example.com",
        "password": "testpassword",
        "mobile_number": "1234567890",
    })
    
    login_resp = client.post("/api/auth/login", json={
        "email": "test_e2e@example.com",
        "password": "testpassword"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 0.5 Create Profile
    prof_resp = client.put("/api/profile", json={
        "personal_details": {"bio": "hello"},
        "education_details": {"degree": "BTech"},
        "skills": ["Python"]
    }, headers=headers)
    assert prof_resp.status_code in [200, 201]

    # 1. Start session
    response = client.post("/api/assessment/start", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert len(data["questions"]) == 20
    
    session_id = data["session_id"]
    questions = data["questions"]
    
    # 2. Answer 20 questions (14 correct -> 70%)
    for i, q in enumerate(questions):
        answer = "A" if i < 14 else "B"
        resp = client.post("/api/assessment/answer", json={
            "session_id": session_id,
            "question_id": q["id"],
            "selected_answer": answer
        }, headers=headers)
        assert resp.status_code == 200
        
    # 3. Complete session
    comp_resp = client.post("/api/assessment/complete", json={"session_id": session_id}, headers=headers)
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert comp_data["status"] == "completed"
    assert comp_data["total_score"] == 14
    
    # 4. Get Score / Explanation
    score_resp = client.get(f"/api/assessment/score/{session_id}", headers=headers)
    assert score_resp.status_code == 200

    # 5. Practice Questions
    pract_resp = client.get("/api/practice/modules", headers=headers)
    if pract_resp.status_code == 200:
        modules = pract_resp.json()
        if modules:
            mod_id = modules[0]["id"]
            client.get(f"/api/practice/modules/{mod_id}", headers=headers)

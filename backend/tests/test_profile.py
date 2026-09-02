
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.sql import text

from app.main import app
from app.core.database import SessionLocal
from app.core.security import get_current_user


TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000"


async def mock_get_current_user():
    return {
        "id": TEST_USER_ID,
        "email": "candidate@iqpac.com",
        "full_name": "Stub Candidate",
    }


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    app.dependency_overrides[get_current_user] = mock_get_current_user

    db = SessionLocal()

    try:
        # Clean up any previous test profile first.
        # This ensures GET initially returns 404 even if a previous
        # test run was interrupted before cleanup.
        db.execute(
            text(
                """
                DELETE FROM candidate.profiles
                WHERE user_id = :id
                """
            ),
            {"id": TEST_USER_ID},
        )

        # Seed test user in auth.users for ForeignKey integrity.
        db.execute(
            text(
                """
                INSERT INTO auth.users
                    (id, full_name, email, mobile_number, password_hash)
                VALUES
                    (
                        :id,
                        'Stub Candidate',
                        'candidate@iqpac.com',
                        '+1234567890',
                        'hash'
                    )
                ON CONFLICT (id) DO NOTHING
                """
            ),
            {"id": TEST_USER_ID},
        )

        db.commit()

    finally:
        db.close()

    yield

    # Clean up test candidate profile after the test.
    db = SessionLocal()

    try:
        db.execute(
            text(
                """
                DELETE FROM candidate.profiles
                WHERE user_id = :id
                """
            ),
            {"id": TEST_USER_ID},
        )

        db.commit()

    finally:
        db.close()

    app.dependency_overrides.clear()


def test_profile_endpoints():
    client = TestClient(app)

    # ------------------------------------------------------------------
    # 1. GET /api/profile when no profile exists -> 404 Not Found
    # ------------------------------------------------------------------
    res_get_initial = client.get("/api/profile")

    assert res_get_initial.status_code == 404
    assert res_get_initial.json()["detail"] == "Candidate profile not found"

    # ------------------------------------------------------------------
    # 2. PUT /api/profile -> 200 OK (Creates profile)
    # ------------------------------------------------------------------
    create_payload = {
        "personal_details": {
            "bio": "Aspiring Software Engineer",
            "location": "New York, USA",
            "linkedin": "https://linkedin.com/in/janedoe",
        },
        "education_details": {
            "gpa": 3.8,
            "achievements": ["Dean's List 2024"],
        },
        "skills": [
            "Python",
            "FastAPI",
            "React",
            "PostgreSQL",
        ],
        "resume_url": "https://storage.example.com/resumes/jane_doe.pdf",
    }

    res_put_create = client.put(
        "/api/profile",
        json=create_payload,
    )

    assert res_put_create.status_code == 200

    data_created = res_put_create.json()

    assert data_created["user_id"] == TEST_USER_ID
    assert (
        data_created["personal_details"]["bio"]
        == "Aspiring Software Engineer"
    )
    assert data_created["skills"] == [
        "Python",
        "FastAPI",
        "React",
        "PostgreSQL",
    ]
    assert (
        data_created["resume_url"]
        == "https://storage.example.com/resumes/jane_doe.pdf"
    )

    # ------------------------------------------------------------------
    # 3. GET /api/profile -> 200 OK (Retrieves created profile)
    # ------------------------------------------------------------------
    res_get_created = client.get("/api/profile")

    assert res_get_created.status_code == 200

    data_retrieved = res_get_created.json()

    assert data_retrieved["user_id"] == TEST_USER_ID
    assert (
        data_retrieved["personal_details"]["location"]
        == "New York, USA"
    )

    # ------------------------------------------------------------------
    # 4. PUT /api/profile -> 200 OK (Updates existing profile)
    # ------------------------------------------------------------------
    update_payload = {
        "personal_details": {
            "bio": "Software Engineer specializing in Python & React",
            "location": "New York, USA",
            "linkedin": "https://linkedin.com/in/janedoe",
        },
        "education_details": {
            "gpa": 3.9,
            "achievements": [
                "Dean's List 2024",
                "Hackathon Winner",
            ],
        },
        "skills": [
            "Python",
            "FastAPI",
            "React",
            "PostgreSQL",
            "Docker",
        ],
        "resume_url": "https://storage.example.com/resumes/jane_doe_v2.pdf",
    }

    res_put_update = client.put(
        "/api/profile",
        json=update_payload,
    )

    assert res_put_update.status_code == 200

    data_updated = res_put_update.json()

    assert data_updated["education_details"]["gpa"] == 3.9
    assert "Docker" in data_updated["skills"]
    assert (
        data_updated["resume_url"]
        == "https://storage.example.com/resumes/jane_doe_v2.pdf"
    )

    # ------------------------------------------------------------------
    # 5. PUT /api/profile with malformed skills -> 422
    # ------------------------------------------------------------------
    malformed_skills_payload = {
        "personal_details": {
            "bio": "Test",
            "location": "New York, USA",
            "linkedin": "https://linkedin.com/in/janedoe",
        },
        "education_details": {
            "gpa": 3.9,
            "achievements": [],
        },
        # Invalid: skills should be a list, not a string.
        "skills": "Python",
        "resume_url": "https://storage.example.com/resumes/jane_doe.pdf",
    }

    res_malformed_skills = client.put(
        "/api/profile",
        json=malformed_skills_payload,
    )

    assert res_malformed_skills.status_code == 422

    # ------------------------------------------------------------------
    # 6. PUT /api/profile with partial payload -> preserves other fields
    # ------------------------------------------------------------------
    partial_payload = {
        "skills": ["Python", "FastAPI", "React", "Docker", "AWS"],
    }
    res_partial = client.put("/api/profile", json=partial_payload)
    assert res_partial.status_code == 200
    data_partial = res_partial.json()
    assert data_partial["skills"] == ["Python", "FastAPI", "React", "Docker", "AWS"]
    # Verify personal_details and education_details were preserved
    assert data_partial["personal_details"]["bio"] == "Software Engineer specializing in Python & React"
    assert data_partial["education_details"]["gpa"] == 3.9

    # ------------------------------------------------------------------
    # 7. PUT /api/profile with empty skills list
    # ------------------------------------------------------------------
    empty_skills_payload = {
        "skills": []
    }
    res_empty_skills = client.put("/api/profile", json=empty_skills_payload)
    assert res_empty_skills.status_code == 200
    assert res_empty_skills.json()["skills"] == []
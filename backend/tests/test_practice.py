import uuid
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, JSON
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB

# SQLite compilation fallbacks for PostgreSQL JSONB in unit tests
@compiles(JSONB, 'sqlite')
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

from app.main import app
from app.core.database import Base, get_db
from app.modules.practice.models import PracticeModule, PracticeAttempt

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

@event.listens_for(engine, "connect")
def attach_schemas(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("ATTACH DATABASE ':memory:' AS practice;")
    cursor.close()

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


class PracticeModuleTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        PracticeModule.__table__.c.id.server_default = None
        PracticeModule.__table__.c.questions.server_default = None
        PracticeAttempt.__table__.c.id.server_default = None

    def setUp(self):
        Base.metadata.create_all(bind=engine)
        self.db = TestingSessionLocal()

        self.module_id = uuid.UUID("523e4567-e89b-12d3-a456-426614174004")
        self.db.query(PracticeModule).delete()

        module = PracticeModule(
            id=self.module_id,
            title="Programming Test Module",
            description="Test module for practice questions.",
            domain="Programming",
            is_active=True,
            questions=[
                {
                    "question_id": "q1",
                    "prompt": "What is the average time complexity of dict lookup in Python?",
                    "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
                    "correct_answer": "O(1)",
                    "explanation": "Python dicts use hash tables giving O(1) average lookup."
                },
                {
                    "question_id": "q2",
                    "prompt": "Which keyword defines an async function?",
                    "options": ["async", "await", "def"],
                    "correct_answer": "async",
                    "explanation": "Use 'async def' for coroutines."
                }
            ]
        )
        self.db.add(module)
        self.db.commit()
        self.client = TestClient(app)
        self.auth_headers = {"Authorization": "Bearer stubbed_jwt_token"}

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=engine)

    def test_list_practice_modules(self):
        response = self.client.get("/api/practice/modules", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Programming Test Module")
        self.assertEqual(data[0]["total_questions"], 2)

    def test_get_module_questions_strips_answers(self):
        module_id_str = "523e4567-e89b-12d3-a456-426614174004"
        response = self.client.get(f"/api/practice/modules/{module_id_str}/questions", headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["module_id"], module_id_str)
        self.assertEqual(len(data["questions"]), 2)
        q1 = data["questions"][0]
        self.assertEqual(q1["question_id"], "q1")
        self.assertNotIn("correct_answer", q1)
        self.assertNotIn("explanation", q1)

    def test_get_module_questions_not_found(self):
        random_id = str(uuid.uuid4())
        response = self.client.get(f"/api/practice/modules/{random_id}/questions", headers=self.auth_headers)
        self.assertEqual(response.status_code, 404)

    def test_check_answer_correct(self):
        module_id_str = "523e4567-e89b-12d3-a456-426614174004"
        payload = {"question_id": "q1", "selected_answer": "O(1)"}
        response = self.client.post(f"/api/practice/modules/{module_id_str}/check-answer", json=payload, headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["is_correct"])
        self.assertEqual(data["correct_answer"], "O(1)")
        self.assertIn("explanation", data)

    def test_check_answer_incorrect(self):
        module_id_str = "523e4567-e89b-12d3-a456-426614174004"
        payload = {"question_id": "q1", "selected_answer": "O(n)"}
        response = self.client.post(f"/api/practice/modules/{module_id_str}/check-answer", json=payload, headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertFalse(data["is_correct"])
        self.assertEqual(data["correct_answer"], "O(1)")

    def test_submit_module_attempt(self):
        module_id_str = "523e4567-e89b-12d3-a456-426614174004"
        payload = {
            "answers": [
                {"question_id": "q1", "selected_answer": "O(1)"},
                {"question_id": "q2", "selected_answer": "def"}
            ]
        }
        response = self.client.post(f"/api/practice/modules/{module_id_str}/submit", json=payload, headers=self.auth_headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_attempted"], 2)
        self.assertEqual(data["correct_answers"], 1)
        self.assertEqual(data["incorrect_answers"], 1)
        self.assertEqual(data["accuracy_percentage"], 50.0)


if __name__ == "__main__":
    unittest.main()

# iQPAC Student Module - API Contract

This document defines the REST API contract for the iQPAC Student Module MVP. 

All endpoints accept and return JSON payload unless specified otherwise.
Base URL: `/api`

---

## Authentication & Authorization Header

- Public routes: `POST /api/auth/register`, `POST /api/auth/login`
- Protected routes: **ALL OTHER ROUTES** require the HTTP Header:
  ```http
  Authorization: Bearer <jwt_access_token>
  ```

---

## Response Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation error or invalid request payload.
- `401 Unauthorized`: Invalid or missing Authorization token.
- `404 Not Found`: Requested resource does not exist.
- `501 Not Implemented`: Shared contract stub response during MVP skeleton phase.

### Standard 501 Stub Response Structure
```json
{
  "detail": "Not Implemented"
}
```

---

## 1. Auth Module (`/api/auth`)

### 1.1 Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth Required**: No (Public)
- **Request Body**:
```json
{
  "full_name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!",
  "mobile_number": "+1234567890",
  "college": "State University",
  "degree": "B.Tech",
  "department": "Computer Science",
  "graduation_year": 2025
}
```
- **Response `201 Created`**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "full_name": "Jane Doe",
  "email": "jane.doe@example.com",
  "mobile_number": "+1234567890",
  "college": "State University",
  "degree": "B.Tech",
  "department": "Computer Science",
  "graduation_year": 2025,
  "email_verified": false,
  "created_at": "2026-09-01T08:00:00Z"
}
```

---

### 1.2 Login User
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth Required**: No (Public)
- **Request Body**:
```json
{
  "email": "jane.doe@example.com",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "jane.doe@example.com",
    "full_name": "Jane Doe"
  }
}
```

---

### 1.3 Get Current User (`me`)
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Request Body**: None
- **Response `200 OK`**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "full_name": "Jane Doe",
  "email": "jane.doe@example.com",
  "mobile_number": "+1234567890",
  "college": "State University",
  "degree": "B.Tech",
  "department": "Computer Science",
  "graduation_year": 2025,
  "email_verified": false,
  "created_at": "2026-09-01T08:00:00Z"
}
```

---

## 2. Profile Module (`/api/profile`)

### 2.1 Get Candidate Profile
- **Method**: `GET`
- **Path**: `/api/profile`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Request Body**: None
- **Response `200 OK`**:
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "personal_details": {
    "bio": "Aspiring Software Engineer",
    "location": "New York, USA",
    "linkedin": "https://linkedin.com/in/janedoe"
  },
  "education_details": {
    "gpa": 3.8,
    "achievements": ["Dean's List 2024"]
  },
  "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
  "resume_url": "https://storage.example.com/resumes/jane_doe.pdf",
  "created_at": "2026-09-01T08:00:00Z",
  "updated_at": "2026-09-01T08:00:00Z"
}
```

---

### 2.2 Update Candidate Profile
- **Method**: `PUT`
- **Path**: `/api/profile`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Request Body**:
```json
{
  "personal_details": {
    "bio": "Software Engineer specializing in Python & React",
    "location": "New York, USA",
    "linkedin": "https://linkedin.com/in/janedoe"
  },
  "education_details": {
    "gpa": 3.9,
    "achievements": ["Dean's List 2024", "Hackathon Winner"]
  },
  "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
  "resume_url": "https://storage.example.com/resumes/jane_doe_v2.pdf"
}
```
- **Response `200 OK`**:
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "personal_details": {
    "bio": "Software Engineer specializing in Python & React",
    "location": "New York, USA",
    "linkedin": "https://linkedin.com/in/janedoe"
  },
  "education_details": {
    "gpa": 3.9,
    "achievements": ["Dean's List 2024", "Hackathon Winner"]
  },
  "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
  "resume_url": "https://storage.example.com/resumes/jane_doe_v2.pdf",
  "created_at": "2026-09-01T08:00:00Z",
  "updated_at": "2026-09-01T08:10:00Z"
}
```

---

## 3. Assessment Module (`/api/assessment`)

### 3.1 Start Assessment Session
- **Method**: `POST`
- **Path**: `/api/assessment/start`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Request Body**: `{}`
- **Response `201 Created`**:
```json
{
  "session_id": "323e4567-e89b-12d3-a456-426614174002",
  "candidate_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "in_progress",
  "started_at": "2026-09-01T08:15:00Z",
  "questions": [
    {
      "question_id": "q101",
      "text": "What is the primary function of FastAPI dependency injection?",
      "options": ["Database migrations", "Managing dependencies and security", "Frontend rendering", "ORM mapping"]
    }
  ]
}
```

---

### 3.2 Answer Assessment Question
- **Method**: `POST`
- **Path**: `/api/assessment/answer`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Request Body**:
```json
{
  "session_id": "323e4567-e89b-12d3-a456-426614174002",
  "question_id": "q101",
  "selected_answer": "Managing dependencies and security"
}
```
- **Response `200 OK`**:
```json
{
  "response_id": "423e4567-e89b-12d3-a456-426614174003",
  "session_id": "323e4567-e89b-12d3-a456-426614174002",
  "question_id": "q101",
  "selected_answer": "Managing dependencies and security",
  "answered_at": "2026-09-01T08:16:00Z"
}
```

---

### 3.3 Complete Assessment Session
- **Method**: `POST`
- **Path**: `/api/assessment/complete`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Request Body**:
```json
{
  "session_id": "323e4567-e89b-12d3-a456-426614174002"
}
```
- **Response `200 OK`**:
```json
{
  "session_id": "323e4567-e89b-12d3-a456-426614174002",
  "status": "completed",
  "completed_at": "2026-09-01T08:20:00Z",
  "total_score": 85.5
}
```

---

### 3.4 Get Assessment Score
- **Method**: `GET`
- **Path**: `/api/assessment/score/{session_id}`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Path Parameter**: `session_id` (UUID)
- **Request Body**: None
- **Response `200 OK`**:
```json
{
  "session_id": "323e4567-e89b-12d3-a456-426614174002",
  "candidate_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "started_at": "2026-09-01T08:15:00Z",
  "completed_at": "2026-09-01T08:20:00Z",
  "total_score": 85.5,
  "total_questions": 10,
  "correct_answers": 8
}
```

---

## 4. Practice Module (`/api/practice`)

### 4.1 List Practice Modules
- **Method**: `GET`
- **Path**: `/api/practice/modules`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Request Body**: None
- **Response `200 OK`**:
```json
[
  {
    "id": "523e4567-e89b-12d3-a456-426614174004",
    "title": "Python Basics & Data Structures",
    "description": "Practice foundational Python concepts including lists, dicts, and async syntax.",
    "total_questions": 5
  }
]
```

---

### 4.2 Get Practice Module Questions
- **Method**: `GET`
- **Path**: `/api/practice/modules/{id}/questions`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Path Parameter**: `id` (UUID)
- **Request Body**: None
- **Response `200 OK`**:
```json
{
  "module_id": "523e4567-e89b-12d3-a456-426614174004",
  "title": "Python Basics & Data Structures",
  "questions": [
    {
      "question_id": "pq1",
      "prompt": "What is the time complexity of dict lookup in Python?",
      "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"]
    }
  ]
}
```

---

### 4.3 Submit Practice Module Attempt
- **Method**: `POST`
- **Path**: `/api/practice/modules/{id}/submit`
- **Auth Required**: Yes (`Authorization: Bearer <jwt>`)
- **Path Parameter**: `id` (UUID)
- **Request Body**:
```json
{
  "answers": [
    {
      "question_id": "pq1",
      "selected_answer": "O(1)"
    }
  ]
}
```
- **Response `200 OK`**:
```json
{
  "attempt_id": "623e4567-e89b-12d3-a456-426614174005",
  "candidate_id": "123e4567-e89b-12d3-a456-426614174000",
  "module_id": "523e4567-e89b-12d3-a456-426614174004",
  "score": 100.0,
  "feedback": "Great job! Excellent understanding of Python data structures.",
  "attempted_at": "2026-09-01T08:25:00Z"
}
```

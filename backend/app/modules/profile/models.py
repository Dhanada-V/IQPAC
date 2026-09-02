import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth", "extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = {"schema": "candidate"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("auth.users.id"), unique=True, nullable=False)
    personal_details = Column(JSONB, nullable=False, default=dict)
    education_details = Column(JSONB, nullable=False, default=dict)
    skills = Column(JSONB, nullable=False, default=list)
    resume_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

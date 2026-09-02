from sqlalchemy import Boolean, Column, DateTime, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.core.database import Base


class PracticeModule(Base):
    __tablename__ = "modules"
    __table_args__ = {"schema": "practice"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    questions = Column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    domain = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("CURRENT_TIMESTAMP"))


class PracticeAttempt(Base):
    __tablename__ = "attempts"
    __table_args__ = {"schema": "practice"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    candidate_id = Column(UUID(as_uuid=True), nullable=False)
    module_id = Column(UUID(as_uuid=True), nullable=False)
    score = Column(Numeric, nullable=True)
    feedback = Column(Text, nullable=True)
    attempted_at = Column(DateTime(timezone=True), nullable=False, server_default=text("CURRENT_TIMESTAMP"))


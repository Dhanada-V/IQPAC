"""Initial Schema Execution

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-01 08:00:00.000000

"""
import os
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Resolve path to docs/schema.sql relative to repo root
    current_dir = os.path.dirname(os.path.abspath(__file__))
    schema_path = os.path.abspath(os.path.join(current_dir, "..", "..", "..", "docs", "schema.sql"))
    if not os.path.exists(schema_path):
        # Fallback search path if executed inside docker container
        schema_path = os.path.abspath(os.path.join(current_dir, "..", "..", "docs", "schema.sql"))
    
    if os.path.exists(schema_path):
        with open(schema_path, "r", encoding="utf-8") as f:
            sql_statements = f.read()
        op.execute(sql_statements)
    else:
        raise FileNotFoundError(f"Schema DDL file not found at {schema_path}")

def downgrade() -> None:
    op.execute("DROP SCHEMA IF EXISTS practice CASCADE;")
    op.execute("DROP SCHEMA IF EXISTS assessment CASCADE;")
    op.execute("DROP SCHEMA IF EXISTS candidate CASCADE;")
    op.execute("DROP SCHEMA IF EXISTS auth CASCADE;")

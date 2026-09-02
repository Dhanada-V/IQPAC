"""Practice modules Day 1 columns, index, and seed data

Revision ID: 002_practice_modules_day1
Revises: 001_initial_schema
Create Date: 2026-09-01 14:54:00.000000

"""
from typing import Sequence, Union

from alembic import op

revision: str = "002_practice_modules_day1"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SEED_TITLES = (
    "Quantitative Aptitude",
    "Logical Reasoning",
    "Verbal Ability",
    "Programming",
)


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS practice;")
    op.execute(
        """
        ALTER TABLE practice.modules
            ADD COLUMN IF NOT EXISTS domain VARCHAR(255) NOT NULL DEFAULT 'General',
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
        """
    )
    op.execute(
        """
        CREATE INDEX IF NOT EXISTS ix_practice_modules_is_active
            ON practice.modules (is_active);
        """
    )
    op.execute(
        """
        INSERT INTO practice.modules (title, description, domain, is_active)
        SELECT seed.title, seed.description, seed.domain, TRUE
        FROM (
            VALUES
                (
                    'Quantitative Aptitude',
                    'Practice numerical ability, arithmetic, and data interpretation.',
                    'Quantitative'
                ),
                (
                    'Logical Reasoning',
                    'Practice puzzles, patterns, and analytical reasoning.',
                    'Logical Reasoning'
                ),
                (
                    'Verbal Ability',
                    'Practice grammar, vocabulary, and reading comprehension.',
                    'Verbal'
                ),
                (
                    'Programming',
                    'Practice coding fundamentals, data structures, and problem solving.',
                    'Programming'
                )
        ) AS seed(title, description, domain)
        WHERE NOT EXISTS (
            SELECT 1 FROM practice.modules existing WHERE existing.title = seed.title
        );
        """
    )


def downgrade() -> None:
    titles = ", ".join("'" + title.replace("'", "''") + "'" for title in SEED_TITLES)
    op.execute(f"DELETE FROM practice.modules WHERE title IN ({titles});")
    op.execute("DROP INDEX IF EXISTS practice.ix_practice_modules_is_active;")
    op.execute(
        """
        ALTER TABLE practice.modules
            DROP COLUMN IF EXISTS domain,
            DROP COLUMN IF EXISTS is_active,
            DROP COLUMN IF EXISTS created_at,
            DROP COLUMN IF EXISTS updated_at;
        """
    )

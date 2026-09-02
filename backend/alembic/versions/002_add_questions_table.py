"""add_questions_table_and_seed

Revision ID: 002_add_questions
Revises: 001_initial_schema
Create Date: 2026-09-02 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import uuid

# revision identifiers, used by Alembic.
revision: str = '002_add_questions'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    questions_table = op.create_table('questions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('option_a', sa.Text(), nullable=False),
        sa.Column('option_b', sa.Text(), nullable=False),
        sa.Column('option_c', sa.Text(), nullable=False),
        sa.Column('option_d', sa.Text(), nullable=False),
        sa.Column('correct_answer', sa.String(length=1), nullable=False),
        sa.Column('explanation_text', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        schema='assessment'
    )

    # Seed 20 placeholder questions
    seed_data = []
    for i in range(1, 21):
        seed_data.append({
            'id': str(uuid.uuid4()),
            'question_text': f'Placeholder MCQ Question {i}: What is the correct answer?',
            'option_a': 'Option A',
            'option_b': 'Option B',
            'option_c': 'Option C',
            'option_d': 'Option D',
            'correct_answer': 'A',
            'explanation_text': f'Explanation for question {i}: The correct answer is A because this is a placeholder.'
        })

    op.bulk_insert(questions_table, seed_data)


def downgrade() -> None:
    op.drop_table('questions', schema='assessment')

"""Merge multiple heads from different branches

Revision ID: d0227dafa829
Revises: ('002_add_questions', '003_practice_questions_seed')
Create Date: 2026-09-02 20:41:03.354197

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd0227dafa829'
down_revision: Union[str, None] = ('002_add_questions', '003_practice_questions_seed')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass

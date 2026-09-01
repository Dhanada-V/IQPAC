"""Practice questions seed data migration

Revision ID: 003_practice_questions_seed
Revises: 002_practice_modules_day1
Create Date: 2026-09-01 22:00:00.000000

"""
import json
from typing import Sequence, Union
from alembic import op

revision: str = "003_practice_questions_seed"
down_revision: Union[str, None] = "002_practice_modules_day1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SEED_QUESTIONS = {
    "Quantitative Aptitude": [
        {
            "question_id": "quant_1",
            "prompt": "If a car travels at a speed of 60 km/h, how far will it travel in 2.5 hours?",
            "options": ["120 km", "140 km", "150 km", "160 km"],
            "correct_answer": "150 km",
            "explanation": "Distance = Speed × Time = 60 km/h × 2.5 h = 150 km."
        },
        {
            "question_id": "quant_2",
            "prompt": "What is 15% of 400?",
            "options": ["50", "60", "70", "80"],
            "correct_answer": "60",
            "explanation": "15% of 400 = (15 / 100) × 400 = 60."
        },
        {
            "question_id": "quant_3",
            "prompt": "Solve for x: 3x + 9 = 24",
            "options": ["3", "4", "5", "6"],
            "correct_answer": "5",
            "explanation": "3x = 24 - 9 = 15, so x = 15 / 3 = 5."
        }
    ],
    "Logical Reasoning": [
        {
            "question_id": "log_1",
            "prompt": "Complete the series: 2, 4, 8, 16, 32, __",
            "options": ["48", "50", "64", "128"],
            "correct_answer": "64",
            "explanation": "Each term in the series is multiplied by 2. 32 × 2 = 64."
        },
        {
            "question_id": "log_2",
            "prompt": "If CAT is coded as 3120, how is DOG coded (A=1, B=2, ..., Z=26)?",
            "options": ["4157", "4147", "41515", "3157"],
            "correct_answer": "4157",
            "explanation": "D=4, O=15, G=7. Concatenated position numbers give 4157."
        }
    ],
    "Verbal Ability": [
        {
            "question_id": "verb_1",
            "prompt": "Select the antonym for the word 'EXPAND':",
            "options": ["Enlarge", "Contract", "Extend", "Develop"],
            "correct_answer": "Contract",
            "explanation": "'Contract' means to decrease in size, which is the exact opposite of 'Expand'."
        },
        {
            "question_id": "verb_2",
            "prompt": "Choose the correctly spelled word:",
            "options": ["Accomodate", "Accommodate", "Acommodate", "Accommodat"],
            "correct_answer": "Accommodate",
            "explanation": "The correct spelling has double 'c' and double 'm': Accommodate."
        }
    ],
    "Programming": [
        {
            "question_id": "prog_1",
            "prompt": "What is the average time complexity of key lookup in a Python dictionary?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
            "correct_answer": "O(1)",
            "explanation": "Python dictionaries utilize hash tables, providing average O(1) time complexity for lookups."
        },
        {
            "question_id": "prog_2",
            "prompt": "Which keyword in Python is used to define an asynchronous function?",
            "options": ["async", "await", "yield", "concurrent"],
            "correct_answer": "async",
            "explanation": "The 'async def' syntax declares a coroutine/asynchronous function in Python."
        },
        {
            "question_id": "prog_3",
            "prompt": "What data structure operates on a First-In, First-Out (FIFO) basis?",
            "options": ["Stack", "Queue", "Tree", "Graph"],
            "correct_answer": "Queue",
            "explanation": "A Queue processes elements in First-In, First-Out (FIFO) order."
        }
    ]
}


def upgrade() -> None:
    for title, questions in SEED_QUESTIONS.items():
        questions_json = json.dumps(questions).replace("'", "''")
        title_escaped = title.replace("'", "''")
        op.execute(
            f"""
            UPDATE practice.modules
            SET questions = '{questions_json}'::jsonb
            WHERE title = '{title_escaped}';
            """
        )


def downgrade() -> None:
    for title in SEED_QUESTIONS.keys():
        title_escaped = title.replace("'", "''")
        op.execute(
            f"""
            UPDATE practice.modules
            SET questions = '[]'::jsonb
            WHERE title = '{title_escaped}';
            """
        )

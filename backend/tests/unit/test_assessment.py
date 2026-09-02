import pytest
from app.modules.assessment.services import PASS_THRESHOLD

def test_pass_threshold_value():
    assert PASS_THRESHOLD == 0.70

def test_score_calculation():
    # Simulate a scenario with 14 correct out of 20
    correct = 14
    total = 20
    score_percentage = correct / total
    
    # Check if 14/20 passes
    assert score_percentage >= PASS_THRESHOLD
    
    # Check if 13/20 fails
    correct = 13
    score_percentage = correct / total
    assert score_percentage < PASS_THRESHOLD

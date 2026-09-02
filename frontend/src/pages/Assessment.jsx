import React, { useState } from 'react';

export default function Assessment() {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');

  // Start the assessment
  const startAssessment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'http://localhost:8000/api/assessment/start',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to start assessment (Status: ${response.status})`
        );
      }

      const data = await response.json();

      console.log('Assessment start response:', data);

      setSession(data);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit the answer for the current question
  const submitAnswer = async () => {
    if (!session || !session.questions) return;

    if (!selectedAnswer) {
      setError('Please select an answer before continuing.');
      return;
    }

    const question = session.questions[currentQuestion];

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        'http://localhost:8000/api/assessment/answer',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: session.session_id,
            question_id: question.id,
            selected_answer: selectedAnswer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to submit answer (Status: ${response.status})`
        );
      }

      console.log('Answer submitted successfully');

      // Move to next question
      if (currentQuestion < session.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        // Last question
        await completeAssessment();
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Complete the assessment
  const completeAssessment = async () => {
    try {
      const response = await fetch(
        'http://localhost:8000/api/assessment/complete',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: session.session_id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to complete assessment (Status: ${response.status})`
        );
      }

      const data = await response.json();

      console.log('Assessment completed:', data);

      // Save session ID for the Score page
      localStorage.setItem(
        'assessment_session_id',
        session.session_id
      );

      setSession((prev) => ({
        ...prev,
        status: 'completed',
        result: data,
      }));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // If assessment has not started
  if (!session) {
    return (
      <div className="page-card">
        <span className="badge">Assessment Module</span>

        <div className="page-header">
          <h1 className="page-title">Assessment</h1>

          <p className="page-subtitle">
            Test your skills with the iQPAC candidate assessment.
          </p>
        </div>

        {error && (
          <div
            style={{
              marginTop: '20px',
              padding: '14px 16px',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#fca5a5',
              background: '#1f1720',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: '24px',
            padding: '48px 24px',
            textAlign: 'center',
            background: '#111a2d',
            border: '1px solid #293653',
            borderRadius: '16px',
          }}
        >
          <div style={{ fontSize: '42px', marginBottom: '20px' }}>
            📝
          </div>

          <h2 style={{ marginBottom: '12px' }}>
            Ready to Begin?
          </h2>

          <p
            style={{
              color: '#8fa8cf',
              marginBottom: '24px',
            }}
          >
            Start your assessment to receive a set of questions.
            Select the best answer for each question.
          </p>

          <button
            className="primary-button"
            onClick={startAssessment}
            disabled={loading}
          >
            {loading ? 'Starting...' : '🚀 Start Assessment'}
          </button>
        </div>
      </div>
    );
  }

  // Assessment completed
  if (session.status === 'completed') {
    return (
      <div className="page-card">
        <span className="badge">Assessment Module</span>

        <div className="page-header">
          <h1 className="page-title">Assessment Completed</h1>

          <p className="page-subtitle">
            Your assessment has been submitted successfully.
          </p>
        </div>

        <div
          style={{
            marginTop: '24px',
            padding: '40px',
            textAlign: 'center',
            background: '#111a2d',
            border: '1px solid #293653',
            borderRadius: '16px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            🎉
          </div>

          <h2>Well Done!</h2>

          <p
            style={{
              color: '#8fa8cf',
              marginTop: '12px',
            }}
          >
            You have completed the iQPAC assessment.
          </p>
        </div>
      </div>
    );
  }

  // Get current question
  const question = session.questions?.[currentQuestion];

  if (!question) {
    return (
      <div className="page-card">
        <span className="badge">Assessment Module</span>

        <h1 className="page-title">Assessment</h1>

        <div
          style={{
            marginTop: '24px',
            padding: '20px',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#fca5a5',
          }}
        >
          No question data was returned from the server.
        </div>
      </div>
    );
  }

  const totalQuestions = session.questions.length;
  const questionNumber = currentQuestion + 1;
  const progress = (questionNumber / totalQuestions) * 100;

  // Convert API option fields into an array
  const options = [
    {
      key: 'A',
      value: question.option_a,
    },
    {
      key: 'B',
      value: question.option_b,
    },
    {
      key: 'C',
      value: question.option_c,
    },
    {
      key: 'D',
      value: question.option_d,
    },
  ].filter((option) => option.value);

  return (
    <div className="page-card">
      <span className="badge">Assessment Module</span>

      <div className="page-header">
        <h1 className="page-title">iQPAC Assessment</h1>

        <p className="page-subtitle">
          Answer each question carefully before moving to the next one.
        </p>
      </div>

      {/* Progress */}
      <div style={{ marginTop: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            color: '#8fa8cf',
          }}
        >
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>

          <span>
            {Math.round(progress)}%
          </span>
        </div>

        <div
          style={{
            height: '7px',
            background: '#293653',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: '#6c63ff',
              borderRadius: '10px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: '20px',
            padding: '14px 16px',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#fca5a5',
            background: '#1f1720',
          }}
        >
          {error}
        </div>
      )}

      {/* Question */}
      <div
        style={{
          marginTop: '24px',
          padding: '28px',
          background: '#111a2d',
          border: '1px solid #293653',
          borderRadius: '16px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            lineHeight: '1.5',
            marginBottom: '24px',
          }}
        >
          {question.question_text}
        </h2>

        {/* Options */}
        {options.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gap: '14px',
            }}
          >
            {options.map((option) => {
              const isSelected = selectedAnswer === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSelectedAnswer(option.key)}
                  style={{
                    width: '100%',
                    padding: '16px 18px',
                    textAlign: 'left',
                    borderRadius: '10px',
                    border: isSelected
                      ? '2px solid #6c63ff'
                      : '1px solid #293653',
                    background: isSelected
                      ? '#25204d'
                      : '#151f33',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '15px',
                  }}
                >
                  <strong
                    style={{
                      display: 'inline-block',
                      marginRight: '12px',
                      color: '#8b82ff',
                    }}
                  >
                    {option.key}.
                  </strong>

                  {option.value}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '16px',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#fca5a5',
            }}
          >
            No answer options were returned for this question.
          </div>
        )}

        {/* Next / Submit button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '24px',
          }}
        >
          <button
            className="primary-button"
            onClick={submitAnswer}
            disabled={!selectedAnswer || submitting || options.length === 0}
          >
            {submitting
              ? 'Submitting...'
              : questionNumber === totalQuestions
                ? 'Submit Assessment ✓'
                : 'Next Question →'}
          </button>
        </div>
      </div>

      {/* Debug information */}
      <div
        className="route-info"
        style={{ marginTop: '24px' }}
      >
        Route: /assessment | Endpoints: POST /api/assessment/start,
        POST /api/assessment/answer, POST /api/assessment/complete
      </div>
    </div>
  );
}
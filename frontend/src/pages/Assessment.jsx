import React, { useState } from 'react';

export default function Assessment() {
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');

  // =========================
  // START ASSESSMENT
  // =========================
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

  // =========================
  // SUBMIT CURRENT ANSWER
  // =========================
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
        await completeAssessment();
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // COMPLETE ASSESSMENT
  // =========================
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

  // =========================
  // START SCREEN
  // =========================
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
          <div className="error-message">
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: '24px',
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--surface-dark)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              fontSize: '42px',
              marginBottom: '20px',
            }}
          >
            📝
          </div>

          <h2
            style={{
              color: 'var(--text-main)',
              marginBottom: '12px',
            }}
          >
            Ready to Begin?
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
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
            {loading
              ? 'Starting...'
              : '🚀 Start Assessment'}
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // COMPLETED SCREEN
  // =========================
  if (session.status === 'completed') {
    return (
      <div className="page-card">
        <span className="badge">Assessment Module</span>

        <div className="page-header">
          <h1 className="page-title">
            Assessment Completed
          </h1>

          <p className="page-subtitle">
            Your assessment has been submitted successfully.
          </p>
        </div>

        <div
          style={{
            marginTop: '24px',
            padding: '40px',
            textAlign: 'center',
            background: 'var(--surface-dark)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}
          >
            🎉
          </div>

          <h2
            style={{
              color: 'var(--text-main)',
            }}
          >
            Well Done!
          </h2>

          <p
            style={{
              color: 'var(--text-muted)',
              marginTop: '12px',
            }}
          >
            You have completed the iQPAC assessment.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // CURRENT QUESTION
  // =========================
  const question = session.questions?.[currentQuestion];

  if (!question) {
    return (
      <div className="page-card">
        <span className="badge">Assessment Module</span>

        <h1 className="page-title">Assessment</h1>

        <div className="error-message">
          No question data was returned from the server.
        </div>
      </div>
    );
  }

  const totalQuestions = session.questions.length;
  const questionNumber = currentQuestion + 1;
  const progress =
    (questionNumber / totalQuestions) * 100;

  // =========================
  // OPTIONS
  // =========================
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

  // =========================
  // QUESTION SCREEN
  // =========================
  return (
    <div className="page-card">
      <span className="badge">Assessment Module</span>

      <div className="page-header">
        <h1 className="page-title">
          iQPAC Assessment
        </h1>

        <p className="page-subtitle">
          Answer each question carefully before moving
          to the next one.
        </p>
      </div>

      {/* Progress */}
      <div
        style={{
          marginTop: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>

          <span>
            {Math.round(progress)}%
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="error-message"
          style={{
            marginTop: '20px',
          }}
        >
          {error}
        </div>
      )}

      {/* Question Card */}
      <div
        style={{
          marginTop: '24px',
          padding: '28px',
          background: 'var(--surface-dark)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            lineHeight: '1.5',
            marginBottom: '24px',
            color: 'var(--text-main)',
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
              const isSelected =
                selectedAnswer === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() =>
                    setSelectedAnswer(option.key)
                  }
                  style={{
                    width: '100%',
                    padding: '16px 18px',
                    textAlign: 'left',
                    borderRadius: '10px',

                    border: isSelected
                      ? '2px solid var(--primary-color)'
                      : '1px solid var(--border-color)',

                    background: isSelected
                      ? 'var(--primary-light)'
                      : 'var(--surface-card)',

                    color: 'var(--text-main)',

                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '15px',
                  }}
                >
                  <strong
                    style={{
                      display: 'inline-block',
                      marginRight: '12px',
                      color: 'var(--primary-color)',
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
          <div className="error-message">
            No answer options were returned for this
            question.
          </div>
        )}

        {/* Next Button */}
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
            disabled={
              !selectedAnswer ||
              submitting ||
              options.length === 0
            }
          >
            {submitting
              ? 'Submitting...'
              : questionNumber === totalQuestions
                ? 'Submit Assessment ✓'
                : 'Next Question →'}
          </button>
        </div>
      </div>

      {/* Debug / Route Info */}
      <div
        className="route-info"
        style={{
          marginTop: '24px',
        }}
      >
        Route: /assessment | Endpoints:
        POST /api/assessment/start,
        POST /api/assessment/answer,
        POST /api/assessment/complete
      </div>
    </div>
  );
}
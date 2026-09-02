import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Score() {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchScore = async () => {
      setLoading(true);
      setError(null);

      try {
        /*
         * Get the session ID saved after completing the assessment.
         */
        const sessionId = localStorage.getItem('assessment_session_id');

        if (!sessionId) {
          throw new Error(
            'No completed assessment session was found. Please complete an assessment first.'
          );
        }

        const response = await fetch(
          `http://localhost:8000/api/assessment/score/${sessionId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        console.log('Score API response:', data);

        if (!response.ok) {
          throw new Error(
            data.detail ||
              data.message ||
              `Failed to load score (Status: ${response.status})`
          );
        }

        setScore(data);
      } catch (err) {
        console.error('Score error:', err);
        setError(err.message || 'Unable to load assessment score.');
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [token]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="page-card">
        <span className="badge">Assessment Module</span>

        <div className="page-header">
          <h1 className="page-title">Assessment Score</h1>
          <p className="page-subtitle">
            Loading your assessment result...
          </p>
        </div>

        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading score...</span>
        </div>
      </div>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <div className="page-card">
        <span className="badge">Assessment Module</span>

        <div className="page-header">
          <h1 className="page-title">Assessment Score</h1>
          <p className="page-subtitle">
            We could not load your assessment result.
          </p>
        </div>

        <div className="alert-box alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>

        <Link
          to="/assessment"
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Take Assessment
        </Link>
      </div>
    );
  }

  /*
   * No score
   */
  if (!score) {
    return (
      <div className="page-card">
        <span className="badge">Assessment Module</span>

        <div className="page-header">
          <h1 className="page-title">Assessment Score</h1>
          <p className="page-subtitle">
            No assessment result is available.
          </p>
        </div>

        <div className="empty-state">
          <div className="empty-icon">📊</div>

          <h3>No Score Available</h3>

          <p
            style={{
              color: 'var(--text-muted)',
              margin: '0.5rem 0 1.5rem',
            }}
          >
            Complete an assessment to view your score.
          </p>

          <Link
            to="/assessment"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Start Assessment
          </Link>
        </div>
      </div>
    );
  }

  /*
   * Support common API field names.
   */
  const totalQuestions =
    score.total_questions ??
    score.total ??
    score.question_count ??
    0;

  const correctAnswers =
    score.correct_answers ??
    score.correct ??
    score.correct_count ??
    0;

  const incorrectAnswers =
    score.incorrect_answers ??
    score.incorrect ??
    score.incorrect_count ??
    Math.max(totalQuestions - correctAnswers, 0);

  const percentage =
    score.percentage ??
    score.score_percentage ??
    (totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0);

  const finalScore =
    score.score ??
    score.total_score ??
    correctAnswers;

  return (
    <div className="page-card">
      <span className="badge">Assessment Module</span>

      <div className="page-header">
        <h1 className="page-title">Assessment Score</h1>

        <p className="page-subtitle">
          Here is your iQPAC assessment result.
        </p>
      </div>

      {/* Main Score */}
      <div
        style={{
          marginTop: '24px',
          padding: '40px 24px',
          textAlign: 'center',
          background: '#111a2d',
          border: '1px solid #293653',
          borderRadius: '16px',
        }}
      >
        <div
          style={{
            fontSize: '56px',
            fontWeight: '800',
            color: '#818cf8',
          }}
        >
          {finalScore}
        </div>

        <div
          style={{
            marginTop: '4px',
            color: '#8fa8cf',
            fontSize: '15px',
          }}
        >
          Your Score
        </div>

        <div
          style={{
            marginTop: '12px',
            fontSize: '28px',
            fontWeight: '700',
            color: '#ffffff',
          }}
        >
          {percentage}%
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid" style={{ marginTop: '24px' }}>
        <div className="metric-box metric-accent">
          <span className="metric-value">
            {totalQuestions}
          </span>
          <span className="metric-label">
            Total Questions
          </span>
        </div>

        <div className="metric-box metric-success">
          <span className="metric-value">
            {correctAnswers}
          </span>
          <span className="metric-label">
            Correct
          </span>
        </div>

        <div className="metric-box metric-warning">
          <span className="metric-value">
            {incorrectAnswers}
          </span>
          <span className="metric-label">
            Incorrect
          </span>
        </div>

        <div className="metric-box metric-accent">
          <span className="metric-value">
            {percentage}%
          </span>
          <span className="metric-label">
            Percentage
          </span>
        </div>
      </div>

      {/* Result message */}
      <div
        className="status-panel"
        style={{ marginTop: '24px' }}
      >
        <h3 className="section-heading">
          Assessment Summary
        </h3>

        <p style={{ color: 'var(--text-muted)' }}>
          You answered {correctAnswers} out of {totalQuestions}{' '}
          questions correctly.
        </p>

        {percentage >= 80 ? (
          <div className="alert-box alert-success">
            🎉 Excellent performance! Keep up the great work.
          </div>
        ) : percentage >= 50 ? (
          <div className="alert-box alert-info">
            👍 Good attempt! Continue practicing to improve your score.
          </div>
        ) : (
          <div className="alert-box alert-error">
            💪 Keep practicing. You can improve your result with more
            preparation.
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '24px',
          flexWrap: 'wrap',
        }}
      >
        <Link
          to="/assessment"
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Retake Assessment
        </Link>

        <Link
          to="/profile"
          className="btn btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          View Profile
        </Link>
      </div>

      <div className="route-info" style={{ marginTop: '24px' }}>
        Route: /score | Endpoint: GET /api/assessment/score/{'{session_id}'}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchPracticeModules } from './Practice';

export default function PracticeModule() {
  const { moduleId } = useParams();
  const location = useLocation();

  const [moduleInfo, setModuleInfo] = useState(location.state?.module || null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const [completionSummary, setCompletionSummary] = useState(null);

  // Get the real logged-in token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');

    return {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };
  };

  useEffect(() => {
    let isMounted = true;
    setStatus('loading');
    setErrorMessage('');

    const fetchModuleDetails = async () => {
      try {
        let currentMod = location.state?.module;

        if (!currentMod || currentMod.id !== moduleId) {
          const modules = await fetchPracticeModules();

          currentMod = (Array.isArray(modules) ? modules : []).find(
            (m) => m.id === moduleId
          );
        }

        if (!currentMod) {
          if (isMounted) {
            setErrorMessage('Practice module not found.');
            setStatus('error');
          }
          return;
        }

        if (isMounted) {
          setModuleInfo(currentMod);
        }

        // Load practice questions using the real token
        const qRes = await fetch(
          `/api/practice/modules/${moduleId}/questions`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!qRes.ok) {
          throw new Error(
            `Failed to load questions (${qRes.status}).`
          );
        }

        const qData = await qRes.json();

        if (isMounted) {
          setQuestions(qData.questions || []);
          setStatus('success');
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(
            err.message || 'Unable to load practice questions.'
          );
          setStatus('error');
        }
      }
    };

    fetchModuleDetails();

    return () => {
      isMounted = false;
    };
  }, [moduleId, location.state]);

  const handleSelectOption = (option) => {
    if (feedback) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = async () => {
    if (!selectedOption || isSubmitting || !questions[currentIndex]) {
      return;
    }

    setIsSubmitting(true);
    const currentQ = questions[currentIndex];

    try {
      const response = await fetch(
        `/api/practice/modules/${moduleId}/check-answer`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question_id: currentQ.question_id,
            selected_answer: selectedOption,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to verify answer (${response.status}).`
        );
      }

      const fbData = await response.json();

      setFeedback(fbData);

      setRecordedAnswers((prev) => [
        ...prev,
        {
          question_id: currentQ.question_id,
          selected_answer: selectedOption,
        },
      ]);
    } catch (err) {
      alert(
        err.message || 'An error occurred while submitting your answer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setSelectedOption('');
    setCurrentIndex((prev) => prev + 1);
  };

  const handleFinishPractice = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/practice/modules/${moduleId}/submit`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: recordedAnswers,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to complete practice session (${response.status}).`
        );
      }

      const summaryData = await response.json();

      setCompletionSummary(summaryData);
    } catch (err) {
      alert(
        err.message || 'Unable to submit final practice results.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="page-card">
      <span className="badge">Practice Module</span>

      <div className="page-header">
        {moduleInfo ? (
          <>
            <h1 className="page-title">{moduleInfo.title}</h1>

            <p className="page-subtitle">
              {moduleInfo.description ||
                'Practice session in progress.'}
            </p>
          </>
        ) : (
          <>
            <h1 className="page-title">Practice Session</h1>

            <p className="page-subtitle">
              Test your knowledge with practice questions.
            </p>
          </>
        )}
      </div>

      {status === 'loading' && (
        <p className="status-message" role="status">
          Loading practice questions…
        </p>
      )}

      {status === 'error' && (
        <div className="status-panel status-error" role="alert">
          <p>{errorMessage}</p>

          <Link
            className="btn btn-secondary"
            to="/practice"
          >
            Back to Practice
          </Link>
        </div>
      )}

      {status === 'success' && questions.length === 0 && (
        <div className="status-panel" role="status">
          <p>
            No questions are currently available for this module.
          </p>

          <Link
            className="btn btn-secondary"
            to="/practice"
          >
            Back to Practice
          </Link>
        </div>
      )}

      {status === 'success' && completionSummary && (
        <div className="completion-card">
          <h2 className="completion-title">
            🎉 Practice Complete!
          </h2>

          <p className="completion-subtitle">
            {completionSummary.feedback}
          </p>

          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-value">
                {completionSummary.total_attempted}
              </span>

              <span className="metric-label">
                Questions Attempted
              </span>
            </div>

            <div className="metric-box metric-success">
              <span className="metric-value">
                {completionSummary.correct_answers}
              </span>

              <span className="metric-label">
                Correct Answers
              </span>
            </div>

            <div className="metric-box metric-warning">
              <span className="metric-value">
                {completionSummary.incorrect_answers}
              </span>

              <span className="metric-label">
                Incorrect Answers
              </span>
            </div>

            <div className="metric-box metric-accent">
              <span className="metric-value">
                {completionSummary.accuracy_percentage}%
              </span>

              <span className="metric-label">
                Accuracy Rate
              </span>
            </div>
          </div>

          <div className="completion-actions">
            <Link
              className="btn btn-primary"
              to="/practice"
            >
              Back to Practice Home
            </Link>
          </div>
        </div>
      )}

      {status === 'success' &&
        !completionSummary &&
        currentQuestion && (
          <div className="practice-question-wrapper">
            <div className="question-progress-bar">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentIndex + 1) /
                        questions.length) *
                      100
                      }%`,
                  }}
                />
              </div>
            </div>

            <div className="question-card">
              <h2 className="question-prompt">
                {currentQuestion.prompt}
              </h2>

              <div
                className="options-list"
                role="radiogroup"
                aria-label="Question Options"
              >
                {currentQuestion.options.map(
                  (option, idx) => {
                    const isSelected =
                      selectedOption === option;

                    let optionClass =
                      'option-button';

                    if (isSelected) {
                      optionClass += ' selected';
                    }

                    if (feedback) {
                      if (
                        option ===
                        feedback.correct_answer
                      ) {
                        optionClass += ' correct';
                      } else if (
                        isSelected &&
                        !feedback.is_correct
                      ) {
                        optionClass += ' incorrect';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        className={optionClass}
                        onClick={() =>
                          handleSelectOption(option)
                        }
                        disabled={feedback !== null}
                        aria-checked={isSelected}
                        role="radio"
                      >
                        <span className="option-indicator">
                          {String.fromCharCode(65 + idx)}
                        </span>

                        <span className="option-text">
                          {option}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {!feedback ? (
                <div className="question-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCheckAnswer}
                    disabled={
                      !selectedOption || isSubmitting
                    }
                  >
                    {isSubmitting
                      ? 'Checking…'
                      : 'Submit Answer'}
                  </button>
                </div>
              ) : (
                <div
                  className={`feedback-card ${feedback.is_correct
                      ? 'feedback-correct'
                      : 'feedback-incorrect'
                    }`}
                >
                  <div className="feedback-header">
                    <span className="feedback-badge">
                      {feedback.is_correct
                        ? '✓ Correct Answer'
                        : '✕ Incorrect'}
                    </span>

                    <p className="feedback-answer-info">
                      <strong>
                        Correct Answer:
                      </strong>{' '}
                      {feedback.correct_answer}
                    </p>
                  </div>

                  <p className="feedback-explanation">
                    <strong>Explanation:</strong>{' '}
                    {feedback.explanation}
                  </p>

                  <div
                    className="question-actions"
                    style={{ marginTop: '1.25rem' }}
                  >
                    {!isLastQuestion ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNextQuestion}
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleFinishPractice}
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? 'Saving…'
                          : 'Finish Practice'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
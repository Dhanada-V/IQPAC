import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchPracticeModules } from './Practice';

export default function PracticeModule() {
  const { moduleId } = useParams();
  const location = useLocation();
  const [module, setModule] = useState(location.state?.module || null);
  const [status, setStatus] = useState(location.state?.module ? 'success' : 'loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (location.state?.module?.id === moduleId) {
      setModule(location.state.module);
      setStatus('success');
      return;
    }

    setStatus('loading');
    fetchPracticeModules()
      .then((data) => {
        const match = (Array.isArray(data) ? data : []).find((item) => item.id === moduleId);
        if (!match) {
          setModule(null);
          setErrorMessage('This practice module could not be found.');
          setStatus('error');
          return;
        }
        setModule(match);
        setStatus('success');
      })
      .catch((error) => {
        setModule(null);
        setErrorMessage(error.message || 'Unable to load this practice module.');
        setStatus('error');
      });
  }, [moduleId, location.state]);

  return (
    <div className="page-card">
      <span className="badge">Practice Module</span>
      <div className="page-header">
        {status === 'success' && module ? (
          <>
            <h1 className="page-title">{module.title}</h1>
            <p className="page-subtitle">{module.description || 'No description provided.'}</p>
          </>
        ) : (
          <>
            <h1 className="page-title">Practice Module</h1>
            <p className="page-subtitle">Review this module before questions are available.</p>
          </>
        )}
      </div>

      {status === 'loading' && (
        <p className="status-message" role="status">Loading practice module…</p>
      )}

      {status === 'error' && (
        <div className="status-panel status-error" role="alert">
          <p>{errorMessage}</p>
          <Link className="btn btn-secondary" to="/practice">Back to Practice</Link>
        </div>
      )}

      {status === 'success' && module && (
        <section className="practice-questions-panel" aria-labelledby="practice-questions-heading">
          <h2 id="practice-questions-heading" className="section-heading">Practice Questions</h2>
          <p className="placeholder-copy">Questions will appear here.</p>
        </section>
      )}
    </div>
  );
}

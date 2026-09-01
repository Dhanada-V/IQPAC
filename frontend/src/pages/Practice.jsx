import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Temporary fallback if the backend is unreachable. Keep false in normal Day 1 work.
const USE_MOCK_MODULES = false;

const MOCK_MODULES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Quantitative Aptitude',
    domain: 'Quantitative',
    description: 'Practice numerical ability, arithmetic, and data interpretation.',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Logical Reasoning',
    domain: 'Logical Reasoning',
    description: 'Practice puzzles, patterns, and analytical reasoning.',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Verbal Ability',
    domain: 'Verbal',
    description: 'Practice grammar, vocabulary, and reading comprehension.',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    title: 'Programming',
    domain: 'Programming',
    description: 'Practice coding fundamentals, data structures, and problem solving.',
  },
];

export async function fetchPracticeModules() {
  if (USE_MOCK_MODULES) {
    return MOCK_MODULES;
  }

  const response = await fetch('/api/practice/modules', {
    headers: {
      Authorization: 'Bearer stubbed_jwt_token',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load practice modules (${response.status}).`);
  }

  return response.json();
}

export default function Practice() {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const loadModules = () => {
    setStatus('loading');
    setErrorMessage('');
    fetchPracticeModules()
      .then((data) => {
        setModules(Array.isArray(data) ? data : []);
        setStatus('success');
      })
      .catch((error) => {
        setModules([]);
        setErrorMessage(error.message || 'Unable to load practice modules.');
        setStatus('error');
      });
  };

  useEffect(() => {
    loadModules();
  }, []);

  const startPractice = (module) => {
    navigate(`/practice/${module.id}`, { state: { module } });
  };

  return (
    <div className="page-card">
      <span className="badge">Practice Module</span>
      <div className="page-header">
        <h1 className="page-title">Practice</h1>
        <p className="page-subtitle">Practice your skills and improve your weak areas.</p>
      </div>

      {status === 'loading' && (
        <p className="status-message" role="status">Loading practice modules…</p>
      )}

      {status === 'error' && (
        <div className="status-panel status-error" role="alert">
          <p>{errorMessage}</p>
          <button type="button" className="btn btn-secondary" onClick={loadModules}>
            Retry
          </button>
        </div>
      )}

      {status === 'success' && modules.length === 0 && (
        <p className="status-message" role="status">No practice modules are available yet.</p>
      )}

      {status === 'success' && modules.length > 0 && (
        <div className="module-grid">
          {modules.map((module) => (
            <article className="module-card" key={module.id}>
              <p className="module-domain">{module.domain}</p>
              <h2 className="module-name">{module.title}</h2>
              <p className="module-description">
                {module.description || 'No description provided.'}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => startPractice(module)}
              >
                Start Practice
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

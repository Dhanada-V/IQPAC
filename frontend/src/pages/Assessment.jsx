import React from 'react';

export default function Assessment() {
  return (
    <div className="page-card">
      <span className="badge">Assessment Module</span>
      <div className="page-header">
        <h1 className="page-title">Assessment Page</h1>
        <p className="page-subtitle">Start assessment, answer question stream, and submit complete session stub.</p>
      </div>
      <div className="route-info">
        Route: /assessment | Endpoints: POST /api/assessment/start, POST /api/assessment/answer, POST /api/assessment/complete
      </div>
    </div>
  );
}

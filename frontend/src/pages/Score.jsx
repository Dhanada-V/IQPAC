import React from 'react';

export default function Score() {
  return (
    <div className="page-card">
      <span className="badge">Assessment Module</span>
      <div className="page-header">
        <h1 className="page-title">Assessment Score Page</h1>
        <p className="page-subtitle">View assessment score breakdown and summary stub.</p>
      </div>
      <div className="route-info">
        Route: /score | Endpoint: GET /api/assessment/score/&#123;session_id&#125;
      </div>
    </div>
  );
}

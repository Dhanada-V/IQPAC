import React from 'react';

export default function Practice() {
  return (
    <div className="page-card">
      <span className="badge">Practice Module</span>
      <div className="page-header">
        <h1 className="page-title">Practice Questions Page</h1>
        <p className="page-subtitle">Practice modules catalog, question attempts, and automated feedback stub.</p>
      </div>
      <div className="route-info">
        Route: /practice | Endpoints: GET /api/practice/modules, GET /api/practice/modules/&#123;id&#125;/questions, POST /api/practice/modules/&#123;id&#125;/submit
      </div>
    </div>
  );
}

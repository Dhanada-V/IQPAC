import React from 'react';

export default function Profile() {
  return (
    <div className="page-card">
      <span className="badge">Candidate Module</span>
      <div className="page-header">
        <h1 className="page-title">Profile Page</h1>
        <p className="page-subtitle">Candidate personal details, education background, and skills stub.</p>
      </div>
      <div className="route-info">
        Route: /profile | Endpoints: GET /api/profile, PUT /api/profile
      </div>
    </div>
  );
}

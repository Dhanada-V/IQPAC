import React from 'react';

export default function Login() {
  return (
    <div className="page-card">
      <span className="badge">Auth Module</span>
      <div className="page-header">
        <h1 className="page-title">Login Page</h1>
        <p className="page-subtitle">Candidate user authentication and JWT token retrieval stub.</p>
      </div>
      <div className="route-info">
        Route: /login | Endpoint: POST /api/auth/login
      </div>
    </div>
  );
}

import React from 'react';

export default function Register() {
  return (
    <div className="page-card">
      <span className="badge">Auth Module</span>
      <div className="page-header">
        <h1 className="page-title">Register Page</h1>
        <p className="page-subtitle">Student account registration form & onboarding flow stub.</p>
      </div>
      <div className="route-info">
        Route: /register | Endpoint: POST /api/auth/register
      </div>
    </div>
  );
}

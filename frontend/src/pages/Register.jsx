import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    mobile_number: '',
    college: '',
    degree: '',
    department: '',
    graduation_year: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        graduation_year: formData.graduation_year
          ? parseInt(formData.graduation_year)
          : null,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 'Failed to register'
        );
      }

      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-card register-card"
      style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        className="page-header"
        style={{ textAlign: 'center' }}
      >
        <span className="badge">Candidate Registration</span>

        <h1 className="page-title">
          Create an Account
        </h1>

        <p className="page-subtitle">
          Join iQPAC to start your assessment journey.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="alert-box alert-error"
          role="alert"
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          className="alert-box alert-success"
          role="status"
        >
          <span>✅</span>
          <span>
            Registration successful! Redirecting to login...
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="register-form"
      >
        {/* =========================
            BASIC INFORMATION
           ========================= */}

        <div className="register-section">
          <h2 className="section-heading">
            Basic Information
          </h2>

          <div className="form-grid">

            {/* Full Name */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="full_name"
              >
                Full Name *
              </label>

              <input
                id="full_name"
                type="text"
                name="full_name"
                className="form-input"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="email"
              >
                Email *
              </label>

              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="password"
              >
                Password *
              </label>

              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
            </div>

            {/* Mobile */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="mobile_number"
              >
                Mobile Number *
              </label>

              <input
                id="mobile_number"
                type="tel"
                name="mobile_number"
                className="form-input"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="Enter mobile number"
                required
              />
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="form-divider" />

        {/* =========================
            EDUCATION INFORMATION
           ========================= */}

        <div className="register-section">
          <h2 className="section-heading">
            Education Information
          </h2>

          <div className="form-grid">

            {/* College */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="college"
              >
                College
                <span className="optional-label">
                  Optional
                </span>
              </label>

              <input
                id="college"
                type="text"
                name="college"
                className="form-input"
                value={formData.college}
                onChange={handleChange}
                placeholder="Enter your college"
              />
            </div>

            {/* Degree */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="degree"
              >
                Degree
                <span className="optional-label">
                  Optional
                </span>
              </label>

              <input
                id="degree"
                type="text"
                name="degree"
                className="form-input"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. B.Tech"
              />
            </div>

            {/* Department */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="department"
              >
                Department
                <span className="optional-label">
                  Optional
                </span>
              </label>

              <input
                id="department"
                type="text"
                name="department"
                className="form-input"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Computer Science"
              />
            </div>

            {/* Graduation Year */}
            <div className="form-group">
              <label
                className="form-label"
                htmlFor="graduation_year"
              >
                Graduation Year
                <span className="optional-label">
                  Optional
                </span>
              </label>

              <input
                id="graduation_year"
                type="number"
                name="graduation_year"
                className="form-input"
                value={formData.graduation_year}
                onChange={handleChange}
                placeholder="e.g. 2027"
              />
            </div>

          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary register-submit"
          disabled={loading}
        >
          {loading
            ? 'Creating Account...'
            : 'Create Account'}
        </button>

      </form>

      {/* Login Link */}
      <p className="register-login-text">
        Already have an account?{' '}

        <button
          type="button"
          className="register-login-link"
          onClick={() => navigate('/login')}
        >
          Login here
        </button>
      </p>
    </div>
  );
}
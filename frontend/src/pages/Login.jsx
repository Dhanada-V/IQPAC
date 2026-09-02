import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          'Login failed. Please check your email and password.'
        );
      }

      // Store JWT token
      localStorage.setItem('access_token', data.access_token);

      // Store user information
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirect after successful login
      navigate('/profile');

    } catch (err) {
      setError(
        err.message || 'Unable to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-card"
      style={{ maxWidth: '520px', margin: '0 auto' }}
    >
      <span className="badge">Auth Module</span>

      <div className="page-header">
        <h1 className="page-title">Welcome Back</h1>

        <p className="page-subtitle">
          Login to your iQPAC candidate account.
        </p>
      </div>

      {error && (
        <div
          className="alert-box alert-error"
          style={{ marginBottom: '1.5rem' }}
        >
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address *
          </label>

          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password *
          </label>

          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Login button */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

      </form>

      <p
        style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          color: 'var(--text-muted)',
        }}
      >
        Don't have an account?{' '}

        <Link
          to="/register"
          style={{
            color: '#818cf8',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Register here
        </Link>
      </p>
    </div>
  );
}
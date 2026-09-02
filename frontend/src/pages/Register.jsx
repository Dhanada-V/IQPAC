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
    graduation_year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to register');
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Create an Account</h1>
        <p className="page-subtitle">Join iQPAC to start your assessment journey.</p>
      </div>

      {error && <div style={{ color: '#ff4d4f', padding: '10px', background: 'rgba(255, 77, 79, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
      {success && <div style={{ color: '#52c41a', padding: '10px', background: 'rgba(82, 196, 26, 0.1)', borderRadius: '8px', marginBottom: '20px' }}>Registration successful! Redirecting to login...</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Full Name *</label>
            <input 
              type="text" 
              name="full_name" 
              value={formData.full_name} 
              onChange={handleChange} 
              required
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #2d3748', background: '#1a202c', color: 'white' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Email *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #2d3748', background: '#1a202c', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Password *</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #2d3748', background: '#1a202c', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Mobile Number *</label>
            <input 
              type="tel" 
              name="mobile_number" 
              value={formData.mobile_number} 
              onChange={handleChange} 
              required
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #2d3748', background: '#1a202c', color: 'white' }}
            />
          </div>
        </div>

        <hr style={{ borderColor: '#2d3748', margin: '10px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', color: '#a0aec0' }}>College (Optional)</label>
            <input 
              type="text" 
              name="college" 
              value={formData.college} 
              onChange={handleChange} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #2d3748', background: '#1a202c', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Degree (Optional)</label>
            <input 
              type="text" 
              name="degree" 
              value={formData.degree} 
              onChange={handleChange} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #2d3748', background: '#1a202c', color: 'white' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Department (Optional)</label>
            <input 
              type="text" 
              name="department" 
              value={formData.department} 
              onChange={handleChange} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #2d3748', background: '#1a202c', color: 'white' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Graduation Year (Optional)</label>
            <input 
              type="number" 
              name="graduation_year" 
              value={formData.graduation_year} 
              onChange={handleChange} 
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #2d3748', background: '#1a202c', color: 'white' }}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            marginTop: '20px', 
            padding: '12px', 
            background: '#6366f1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    linkedin: '',
    gpa: '',
    achievements: '',
    skills: '',
    resume_url: '',
  });

  const token = localStorage.getItem('token') || 'stubbed_jwt_token';

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        setProfile(null);
      } else if (!response.ok) {
        throw new Error(`Failed to load profile (Status: ${response.status})`);
      } else {
        const data = await response.json();
        setProfile(data);
        populateForm(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data) => {
    const personal = data.personal_details || {};
    const education = data.education_details || {};
    const skillsList = Array.isArray(data.skills) ? data.skills.join(', ') : '';
    const achievementsList = Array.isArray(education.achievements)
      ? education.achievements.join(', ')
      : education.achievements || '';

    setFormData({
      bio: personal.bio || '',
      location: personal.location || '',
      linkedin: personal.linkedin || '',
      gpa: education.gpa !== undefined && education.gpa !== null ? String(education.gpa) : '',
      achievements: achievementsList,
      skills: skillsList,
      resume_url: data.resume_url || '',
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Parse achievements and skills from comma-separated string
    const skillsArray = formData.skills
      ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const achievementsArray = formData.achievements
      ? formData.achievements.split(',').map((a) => a.trim()).filter(Boolean)
      : [];

    const payload = {
      personal_details: {
        bio: formData.bio,
        location: formData.location,
        linkedin: formData.linkedin,
      },
      education_details: {
        gpa: formData.gpa !== '' ? parseFloat(formData.gpa) : null,
        achievements: achievementsArray,
      },
      skills: skillsArray,
      resume_url: formData.resume_url || null,
    };

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to save profile (${response.status})`);
      }

      const updated = await response.json();
      setProfile(updated);
      populateForm(updated);
      setIsEditing(false);
      setSuccess('Candidate profile saved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    setFormData({
      bio: '',
      location: '',
      linkedin: '',
      gpa: '',
      achievements: '',
      skills: '',
      resume_url: '',
    });
    setIsEditing(true);
  };

  return (
    <div className="page-card">
      <div className="page-header-row">
        <div>
          <span className="badge">Candidate Module</span>
          <h1 className="page-title">Candidate Profile</h1>
          <p className="page-subtitle">Manage personal details, education background, skills, and resume.</p>
        </div>
        {!loading && profile && !isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
        {!loading && isEditing && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setIsEditing(false);
              if (profile) populateForm(profile);
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {success && (
        <div className="alert-box alert-success">
          <span>✅</span> {success}
        </div>
      )}

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading candidate profile...</span>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                className="form-textarea"
                placeholder="Brief summary of your professional background and interests"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. New York, USA"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="text"
                name="linkedin"
                className="form-input"
                placeholder="e.g. https://linkedin.com/in/janedoe"
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">GPA</label>
              <input
                type="number"
                step="0.01"
                name="gpa"
                className="form-input"
                placeholder="e.g. 3.8"
                value={formData.gpa}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Achievements (comma-separated)</label>
              <input
                type="text"
                name="achievements"
                className="form-input"
                placeholder="e.g. Dean's List 2024, Hackathon Winner"
                value={formData.achievements}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Skills (comma-separated)</label>
              <input
                type="text"
                name="skills"
                className="form-input"
                placeholder="e.g. Python, FastAPI, React, PostgreSQL, Docker"
                value={formData.skills}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Resume URL</label>
              <input
                type="text"
                name="resume_url"
                className="form-input"
                placeholder="e.g. https://storage.example.com/resumes/jane_doe.pdf"
                value={formData.resume_url}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </form>
      ) : !profile ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Candidate Profile Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
            You have not set up your candidate profile yet. Create one to highlight your skills and achievements.
          </p>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            ✨ Create Candidate Profile
          </button>
        </div>
      ) : (
        <div className="profile-grid">
          <div className="profile-card-section">
            <h3>👤 Personal Details</h3>
            <div className="info-item">
              <span className="info-label">Bio</span>
              <span className="info-value">
                {profile.personal_details?.bio || 'Not provided'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">
                {profile.personal_details?.location || 'Not provided'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">LinkedIn</span>
              <span className="info-value">
                {profile.personal_details?.linkedin ? (
                  <a
                    href={profile.personal_details.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#818cf8', textDecoration: 'none' }}
                  >
                    {profile.personal_details.linkedin}
                  </a>
                ) : (
                  'Not provided'
                )}
              </span>
            </div>
          </div>

          <div className="profile-card-section">
            <h3>🎓 Education & Achievements</h3>
            <div className="info-item">
              <span className="info-label">GPA</span>
              <span className="info-value">
                {profile.education_details?.gpa ?? 'Not provided'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Achievements</span>
              <span className="info-value">
                {Array.isArray(profile.education_details?.achievements) &&
                profile.education_details.achievements.length > 0
                  ? profile.education_details.achievements.join(', ')
                  : 'None listed'}
              </span>
            </div>
          </div>

          <div className="profile-card-section" style={{ gridColumn: '1 / -1' }}>
            <h3>🛠️ Technical Skills</h3>
            {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
              <div className="skills-container">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="skill-chip">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <span className="info-value">No skills listed yet</span>
            )}
          </div>

          <div className="profile-card-section" style={{ gridColumn: '1 / -1' }}>
            <h3>📄 Resume & Metadata</h3>
            <div className="info-item">
              <span className="info-label">Resume Link</span>
              <span className="info-value">
                {profile.resume_url ? (
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#818cf8', textDecoration: 'none' }}
                  >
                    {profile.resume_url} 🔗
                  </a>
                ) : (
                  'No resume URL uploaded'
                )}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '2rem',
                marginTop: '1rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              <span>Created: {new Date(profile.created_at).toLocaleString()}</span>
              <span>Updated: {new Date(profile.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="route-info">
        Route: /profile | Endpoints: GET /api/profile, PUT /api/profile
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    linkedin: '',
    gpa: '',
    achievements: '',
    skills: '',
    resume_url: '',
  });

  // Get JWT token saved during login
  const token = localStorage.getItem('access_token');

  // --------------------------------------------------
  // Populate form from profile data
  // --------------------------------------------------
  const populateForm = (data) => {
    const personal = data.personal_details || {};
    const education = data.education_details || {};

    const skillsList = Array.isArray(data.skills)
      ? data.skills.join(', ')
      : '';

    const achievementsList = Array.isArray(education.achievements)
      ? education.achievements.join(', ')
      : education.achievements || '';

    setFormData({
      bio: personal.bio || '',
      location: personal.location || '',
      linkedin: personal.linkedin || '',
      gpa:
        education.gpa !== undefined && education.gpa !== null
          ? String(education.gpa)
          : '',
      achievements: achievementsList,
      skills: skillsList,
      resume_url: data.resume_url || '',
    });
  };

  // --------------------------------------------------
  // Load candidate profile
  // --------------------------------------------------
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    if (!token) {
      setError('You are not logged in. Please login first.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.status === 404) {
        // User is logged in but does not have a profile yet
        setProfile(null);
        return;
      }

      if (response.status === 401) {
        throw new Error('Your login session has expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(
          `Failed to load profile (Status: ${response.status})`
        );
      }

      const data = await response.json();

      setProfile(data);
      populateForm(data);
    } catch (err) {
      console.error('Profile loading error:', err);
      setError(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  // Load profile when page opens
  useEffect(() => {
    fetchProfile();
  }, []);

  // --------------------------------------------------
  // Handle form changes
  // --------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Create / Update profile
  // --------------------------------------------------
  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('You are not logged in. Please login first.');
      setSaving(false);
      return;
    }

    // Convert comma-separated skills into array
    const skillsArray = formData.skills
      ? formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
      : [];

    // Convert comma-separated achievements into array
    const achievementsArray = formData.achievements
      ? formData.achievements
        .split(',')
        .map((achievement) => achievement.trim())
        .filter(Boolean)
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
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        throw new Error('Your login session has expired. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.detail ||
          errorData.message ||
          `Failed to save profile (Status: ${response.status})`
        );
      }

      const updatedProfile = await response.json();

      setProfile(updatedProfile);
      populateForm(updatedProfile);
      setIsEditing(false);
      setSuccess('Candidate profile saved successfully!');

    } catch (err) {
      console.error('Profile save error:', err);
      setError(err.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Create new profile
  // --------------------------------------------------
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

    setError(null);
    setSuccess(null);
    setIsEditing(true);
  };

  // --------------------------------------------------
  // Cancel editing
  // --------------------------------------------------
  const handleCancel = () => {
    setIsEditing(false);
    setError(null);

    if (profile) {
      populateForm(profile);
    }
  };

  // --------------------------------------------------
  // Loading screen
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="page-card">
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading candidate profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-card">

      {/* Header */}
      <div className="page-header-row">
        <div>
          <span className="badge">Candidate Module</span>

          <h1 className="page-title">
            Candidate Profile
          </h1>

          <p className="page-subtitle">
            Manage personal details, education background,
            skills, and resume.
          </p>
        </div>

        {/* Edit button */}
        {!isEditing && profile && (
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </button>
        )}

        {/* Cancel button */}
        {isEditing && (
          <button
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Success message */}
      {success && (
        <div className="alert-box alert-success">
          <span>✅</span>
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert-box alert-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* ==================================================
          CREATE / EDIT PROFILE FORM
          ================================================== */}
      {isEditing ? (
        <form onSubmit={handleSave}>

          <div className="form-grid">

            {/* Bio */}
            <div className="form-group full-width">
              <label className="form-label">
                Bio
              </label>

              <textarea
                name="bio"
                className="form-textarea"
                placeholder="Brief summary of your professional background and interests"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">
                Location
              </label>

              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. Kerala, India"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* LinkedIn */}
            <div className="form-group">
              <label className="form-label">
                LinkedIn Profile URL
              </label>

              <input
                type="url"
                name="linkedin"
                className="form-input"
                placeholder="https://linkedin.com/in/yourname"
                value={formData.linkedin}
                onChange={handleChange}
              />
            </div>

            {/* GPA */}
            <div className="form-group">
              <label className="form-label">
                GPA
              </label>

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

            {/* Achievements */}
            <div className="form-group">
              <label className="form-label">
                Achievements
              </label>

              <input
                type="text"
                name="achievements"
                className="form-input"
                placeholder="e.g. Hackathon Winner, Dean's List"
                value={formData.achievements}
                onChange={handleChange}
              />
            </div>

            {/* Skills */}
            <div className="form-group full-width">
              <label className="form-label">
                Skills
              </label>

              <input
                type="text"
                name="skills"
                className="form-input"
                placeholder="e.g. Python, FastAPI, React, PostgreSQL, Docker"
                value={formData.skills}
                onChange={handleChange}
              />

              <small style={{ color: 'var(--text-muted)' }}>
                Separate skills using commas.
              </small>
            </div>

            {/* Resume */}
            <div className="form-group full-width">
              <label className="form-label">
                Resume URL
              </label>

              <input
                type="url"
                name="resume_url"
                className="form-input"
                placeholder="https://example.com/resume.pdf"
                value={formData.resume_url}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* Save button */}
          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              gap: '1rem',
            }}
          >
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
          </div>

        </form>

      ) : !profile ? (

        /* ==================================================
           NO PROFILE
           ================================================== */
        <div className="empty-state">

          <div className="empty-icon">
            📁
          </div>

          <h3>
            No Candidate Profile Found
          </h3>

          <p
            style={{
              color: 'var(--text-muted)',
              margin: '0.5rem 0 1.5rem',
            }}
          >
            You have not set up your candidate profile yet.
            Create one to highlight your skills and achievements.
          </p>

          <button
            className="btn btn-primary"
            onClick={handleCreateNew}
          >
            ✨ Create Candidate Profile
          </button>

        </div>

      ) : (

        /* ==================================================
           DISPLAY PROFILE
           ================================================== */
        <div className="profile-grid">

          {/* Personal Details */}
          <div className="profile-card-section">

            <h3>
              👤 Personal Details
            </h3>

            <div className="info-item">
              <span className="info-label">
                Bio
              </span>

              <span className="info-value">
                {profile.personal_details?.bio ||
                  'Not provided'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Location
              </span>

              <span className="info-value">
                {profile.personal_details?.location ||
                  'Not provided'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                LinkedIn
              </span>

              <span className="info-value">
                {profile.personal_details?.linkedin ? (
                  <a
                    href={profile.personal_details.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#818cf8',
                      textDecoration: 'none',
                    }}
                  >
                    {profile.personal_details.linkedin}
                  </a>
                ) : (
                  'Not provided'
                )}
              </span>
            </div>

          </div>

          {/* Education */}
          <div className="profile-card-section">

            <h3>
              🎓 Education & Achievements
            </h3>

            <div className="info-item">
              <span className="info-label">
                GPA
              </span>

              <span className="info-value">
                {profile.education_details?.gpa ??
                  'Not provided'}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">
                Achievements
              </span>

              <span className="info-value">
                {Array.isArray(
                  profile.education_details?.achievements
                ) &&
                  profile.education_details.achievements.length > 0
                  ? profile.education_details.achievements.join(', ')
                  : 'None listed'}
              </span>
            </div>

          </div>

          {/* Skills */}
          <div
            className="profile-card-section"
            style={{ gridColumn: '1 / -1' }}
          >

            <h3>
              🛠️ Technical Skills
            </h3>

            {Array.isArray(profile.skills) &&
              profile.skills.length > 0 ? (

              <div className="skills-container">

                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="skill-chip"
                  >
                    {skill}
                  </span>
                ))}

              </div>

            ) : (
              <span className="info-value">
                No skills listed yet
              </span>
            )}

          </div>

          {/* Resume */}
          <div
            className="profile-card-section"
            style={{ gridColumn: '1 / -1' }}
          >

            <h3>
              📄 Resume & Metadata
            </h3>

            <div className="info-item">

              <span className="info-label">
                Resume Link
              </span>

              <span className="info-value">

                {profile.resume_url ? (

                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#818cf8',
                      textDecoration: 'none',
                    }}
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
                flexWrap: 'wrap',
              }}
            >

              {profile.created_at && (
                <span>
                  Created:{' '}
                  {new Date(
                    profile.created_at
                  ).toLocaleString()}
                </span>
              )}

              {profile.updated_at && (
                <span>
                  Updated:{' '}
                  {new Date(
                    profile.updated_at
                  ).toLocaleString()}
                </span>
              )}

            </div>

          </div>

        </div>
      )}

      {/* API information */}
      <div className="route-info">
        Route: /profile | Endpoints: GET /api/profile, PUT /api/profile
      </div>

    </div>
  );
}
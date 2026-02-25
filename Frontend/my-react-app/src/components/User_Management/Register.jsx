import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedCareerPath: '',
    // Hidden fields for backend compatibility
    university: 'Not Specified',
    degreeProgram: 'Not Specified',
    yearLevel: 1,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const careerPaths = [
    { value: 'Software Engineer', label: 'Software Engineer' },
    { value: 'Data Scientist', label: 'Data Scientist' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'IT Consultant', label: 'IT Consultant' },
    { value: 'DevOps Engineer', label: 'DevOps Engineer' },
    { value: 'Cloud Architect', label: 'Cloud Architect' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Password Confirmation Check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          university: formData.university,
          degreeProgram: formData.degreeProgram,
          yearLevel: formData.yearLevel,
          selectedCareerPath: formData.selectedCareerPath
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessage(data.message || 'Registration successful!');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <header className="register-header">
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">Join the Skill Bridge community and start growing.</p>
        </header>

        {message && <p className="form-success">{message}</p>}
        {error && <p className="form-error">{error}</p>}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="selectedCareerPath">Selected Career Path</label>
            <select
              id="selectedCareerPath"
              className="form-select"
              value={formData.selectedCareerPath}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select a career path</option>
              {careerPaths.map((path) => (
                <option key={path.value} value={path.value}>
                  {path.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary register-btn" disabled={loading}>
            {loading ? (
              'Creating Account...'
            ) : (
              <>
                <UserPlus size={20} className="btn-icon" /> Register
              </>
            )}
          </button>
        </form>

        <footer className="register-footer">
          <p>
            Already have an account? <Link to="/login" className="link-accent">Sign In</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Register;

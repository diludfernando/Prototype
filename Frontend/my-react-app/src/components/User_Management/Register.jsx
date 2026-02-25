import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    specialization: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:8081/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const text = await response.text();
        setMessage(text || 'Registration successful!');
        // Redirect to login after a short delay
        setTimeout(() => navigate('/login'), 1500);
      } else {
        const errText = await response.text();
        setError(errText || 'Registration failed. Please try again.');
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="johndoe123"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization</label>
            <select
              id="specialization"
              className="form-select"
              value={formData.specialization}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select your field</option>
              <option value="development">Software Development</option>
              <option value="design">UI/UX Design</option>
              <option value="marketing">Digital Marketing</option>
              <option value="data">Data Science</option>
              <option value="business">Business Strategy</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="name@company.com"
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
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
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
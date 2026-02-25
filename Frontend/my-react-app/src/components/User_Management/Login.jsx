import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- HARDCODED CREDENTIALS ---
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "admin123";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // 1. Check for Hardcoded Admin First
    if (formData.username === ADMIN_USER && formData.password === ADMIN_PASS) {
      localStorage.setItem('username', ADMIN_USER);
      setMessage('Admin Login successful!');
      setTimeout(() => navigate('/admin'), 1500);
      setLoading(false);
      return; // Stop here so it doesn't call the API
    }

    // 2. If not admin, proceed to API call for regular users
    try {
      const response = await fetch('http://localhost:8081/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      if (response.ok && text === 'Login successful!') {
        localStorage.setItem('username', formData.username);
        setMessage(text);
        setTimeout(() => navigate('/services'), 1500);
      } else {
        setError(text || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Enter your credentials to access Skill Bridge</p>
        </header>

        {message && <p className="form-success" style={{ color: 'green' }}>{message}</p>}
        {error && <p className="form-error" style={{ color: 'red' }}>{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="e.g. alex_skill"
              value={formData.username}
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

          <div className="form-actions">
            <a href="#forgot" className="link-text">Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <footer className="login-footer">
          <p>
            Don't have an account? <a href="/register" className="link-accent">Join Skill Bridge</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
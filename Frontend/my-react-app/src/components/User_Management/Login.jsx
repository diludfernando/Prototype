import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const adminEmail = 'admin@skillbridge.lk';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isDisabledAccountError = /disabled|deactivated|inactive/i.test(error);
  const prefilledConcernMessage = [
    'Hello Admin,',
    '',
    'I am unable to log in because my account appears to be disabled.',
    'Please review and reactivate my account.',
    '',
    `Account Email: ${formData.email || '[Enter your email]'}`,
    '',
    'Thank you.'
  ].join('\n');
  const contactAdminHref = `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=${encodeURIComponent(adminEmail)}&su=${encodeURIComponent('Account Reactivation Request')}&body=${encodeURIComponent(prefilledConcernMessage)}`;

  const openAdminContact = (e) => {
    e.preventDefault();
    window.open(contactAdminHref, '_blank', 'noopener,noreferrer');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('username', formData.email);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userId', data.data.userId);
        localStorage.setItem('role', data.data.role);

        setMessage(data.message || 'Login successful!');
        const userRole = data.data.role;
        if (userRole === 'STUDENT' || userRole === 'ROLE_STUDENT') {
          try {
            const checkResponse = await fetch('http://localhost:8081/api/student/profile/check-mandatory', {
              headers: { 'Authorization': `Bearer ${data.data.token}` }
            });
            const checkData = await checkResponse.json();
            
            if (checkResponse.ok && checkData.success && checkData.data === true) {
              setTimeout(() => navigate('/services'), 1500);
            } else {
              setTimeout(() => navigate('/complete-profile'), 1500);
            }
          } catch (err) {
            console.error("Error checking student profile status:", err);
            setTimeout(() => navigate('/complete-profile'), 1500);
          }
        } else if (userRole === 'COUNSELOR' || userRole === 'ROLE_COUNSELOR') {
          try {
            const checkResponse = await fetch('http://localhost:8081/api/counselor/profile/check-mandatory', {
              headers: { 'Authorization': `Bearer ${data.data.token}` }
            });
            const checkData = await checkResponse.json();
            
            if (checkResponse.ok && checkData.success && checkData.data === true) {
              // Profile is complete, go to profile page (dashboard pending)
              setTimeout(() => navigate('/counselor/profile'), 1500);
            } else {
              // Profile is NOT complete, go to completion page
              setTimeout(() => navigate('/counselor/complete-profile'), 1500);
            }
          } catch (checkErr) {
            console.error("Error checking profile status:", checkErr);
            setTimeout(() => navigate('/counselor/complete-profile'), 1500); // Fallback
          }
        } else if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
          setTimeout(() => navigate('/admin'), 1500);
        } else {
          setTimeout(() => navigate('/services'), 1500);
        }
      } else {
        setError(data.message || 'Login failed. Please try again.');
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
          <Link to="/" className="login-home-button">Back to Home</Link>
          <p className="login-eyebrow">Skill Bridge Lanka</p>
          <span className="login-badge">
            <ShieldCheck size={14} />
            Secure Access
          </span>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to continue to your dashboard</p>
        </header>

        {message && <p className="form-success" role="status" aria-live="polite">{message}</p>}
        {error && !isDisabledAccountError && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}
        {error && isDisabledAccountError && (
          <div className="disabled-account-card" role="alert" aria-live="assertive">
            <h3 className="disabled-account-title">Account Access Disabled</h3>
            <p className="disabled-account-text">{error}</p>
            <a className="disabled-account-contact-btn" href={contactAdminHref} target="_blank" rel="noreferrer noopener" onClick={openAdminContact}>
              Contact Admin
            </a>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} autoComplete="on" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrap">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="e.g. alex@skillbridge.lk"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <label className="remember-check">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="link-text">Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !formData.email || !formData.password}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <footer className="login-footer">
          <p>
            Don't have an account? <Link to="/register" className="link-accent">Join Skill Bridge</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;

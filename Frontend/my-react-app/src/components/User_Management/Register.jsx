import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import './Register.css';

const getPasswordChecks = (password) => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecial: /[@#$%^&*]/.test(password),
});

const getPasswordStrength = (password, checks) => {
  if (!password) {
    return { score: 0, label: '' };
  }

  let score = Object.values(checks).filter(Boolean).length;

  if (password.length >= 12) {
    score += 1;
  }

  if (score <= 2) {
    return { score, label: 'Weak' };
  }

  if (score <= 4) {
    return { score, label: 'Medium' };
  }

  return { score, label: 'Strong' };
};

const isAcceptablePasswordStrength = (label) => label === 'Medium' || label === 'Strong';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedCareerPath: '',
    // Hidden fields for backend compatibility
    university: '',
    degreeProgram: '',
    yearLevel: 1,
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const currentPasswordChecks = getPasswordChecks(formData.password);
  const passwordStrength = getPasswordStrength(formData.password, currentPasswordChecks);

  const careerPaths = [
    { value: 'Software Engineer', label: 'Software Engineer' },
    { value: 'Data Scientist', label: 'Data Scientist' },
    { value: 'UI/UX Designer', label: 'UI/UX Designer' },
    { value: 'IT Consultant', label: 'IT Consultant' },
    { value: 'DevOps Engineer', label: 'DevOps Engineer' },
    { value: 'Cloud Architect', label: 'Cloud Architect' },
  ];

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    if (fieldErrors[id]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordChecks = getPasswordChecks(formData.password);
    const passwordStrengthForSubmit = getPasswordStrength(formData.password, passwordChecks);

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
    } else if (/\d/.test(formData.fullName)) {
      nextErrors.fullName = 'Full name cannot contain numbers';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      nextErrors.password = 'Password is required';
    } else if (!isAcceptablePasswordStrength(passwordStrengthForSubmit.label)) {
      nextErrors.password = 'Password must be medium or strong. Weak passwords are not allowed.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.selectedCareerPath) {
      nextErrors.selectedCareerPath = 'Please select a career path';
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const nextFieldErrors = validateForm();
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
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
        setFieldErrors({});
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
              aria-invalid={Boolean(fieldErrors.fullName)}
              required
            />
            {fieldErrors.fullName && <p className="field-error">{fieldErrors.fullName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.email)}
              required
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="register-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Enter a strong password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.password)}
                required
              />
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            {formData.password.length > 0 && (
                <div className="password-requirements" aria-live="polite">
                  <div className="password-strength-row">
                    <span className="password-strength-label">Strength: {passwordStrength.label}</span>
                    <span className="password-strength-score">{Math.min(passwordStrength.score, 6)}/6</span>
                  </div>
                  <div className="password-strength-track" role="progressbar" aria-valuemin="0" aria-valuemax="6" aria-valuenow={Math.min(passwordStrength.score, 6)}>
                    <div
                        className={`password-strength-fill strength-${passwordStrength.label.toLowerCase()}`}
                        style={{ width: `${(Math.min(passwordStrength.score, 6) / 6) * 100}%` }}
                    />
                  </div>
                  <p className="password-requirements-title">For a stronger password, include:</p>
                  <ul>
                    <li className={currentPasswordChecks.minLength ? 'met' : 'unmet'}>Minimum 8 characters (12+ for strong)</li>
                    <li className={currentPasswordChecks.hasUppercase ? 'met' : 'unmet'}>At least 1 uppercase letter (A-Z)</li>
                    <li className={currentPasswordChecks.hasLowercase ? 'met' : 'unmet'}>At least 1 lowercase letter (a-z)</li>
                    <li className={currentPasswordChecks.hasNumber ? 'met' : 'unmet'}>At least 1 number (0-9)</li>
                    <li className={currentPasswordChecks.hasSpecial ? 'met' : 'unmet'}>At least 1 special character (@#$%^&*)</li>
                  </ul>
                </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="register-password-wrap">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                required
              />
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="selectedCareerPath">Selected Career Path</label>
            <select
              id="selectedCareerPath"
              className="form-select"
              value={formData.selectedCareerPath}
              onChange={handleChange}
              aria-invalid={Boolean(fieldErrors.selectedCareerPath)}
              required
            >
              <option value="" disabled>Select a career path</option>
              {careerPaths.map((path) => (
                <option key={path.value} value={path.value}>
                  {path.label}
                </option>
              ))}
            </select>
            {fieldErrors.selectedCareerPath && <p className="field-error">{fieldErrors.selectedCareerPath}</p>}
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

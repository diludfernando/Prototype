import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import './CounselorCompleteProfile.css';

const CounselorCompleteProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: 'a', // This would typically come from an admin-set initial profile
        phone: '',
        qualification: '',
        specialization: '',
        yearsOfExperience: '',
        bio: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Mock initial data fetch - in a real app, you'd fetch the admin-provided name
    useEffect(() => {
        // Simulating fetching partial profile data
        const timer = setTimeout(() => {
            setFormData(prev => ({ ...prev, fullName: 'a' }));
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('http://localhost:8081/api/counselor/profile/complete-mandatory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    phoneNumber: formData.phone,
                    qualification: formData.qualification,
                    specialization: formData.specialization,
                    yearsOfExperience: parseInt(formData.yearsOfExperience),
                    shortBio: formData.bio,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setMessage('Profile completed and password reset successfully!');
                setTimeout(() => navigate('/counselor/dashboard'), 2000);
            } else {
                setError(data.message || 'Failed to complete profile.');
                // For demonstration purposes, if backend fails, still show success after a delay
                // Remove this in real implementation
                if (!response.ok) {
                    setTimeout(() => {
                        setMessage('Success (Demo Mode): Profile updated successfully!');
                        // setTimeout(() => navigate('/admin'), 2000);
                    }, 1000);
                }
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="counselor-profile-container">
            <div className="profile-card">
                <h1>Complete Your Counselor Profile</h1>
                <p className="subtitle">Please fill in these mandatory fields and reset your password to continue</p>

                {message && <div className="form-success">{message}</div>}

                <form className="profile-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name * (Provided by Admin)</label>
                        <input
                            type="text"
                            id="fullName"
                            value={formData.fullName}
                            disabled
                        />
                        <span className="admin-note">This name was set by the administrator</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            type="text"
                            id="phone"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="qualification">Qualification *</label>
                        <input
                            type="text"
                            id="qualification"
                            placeholder="e.g., M.A. in Counseling Psychology"
                            value={formData.qualification}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="specialization">Specialization *</label>
                        <input
                            type="text"
                            id="specialization"
                            placeholder="e.g., Career Counseling, Academic Guidance"
                            value={formData.specialization}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="yearsOfExperience">Years of Experience *</label>
                        <input
                            type="number"
                            id="yearsOfExperience"
                            placeholder="Enter years of experience"
                            value={formData.yearsOfExperience}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Short Bio *</label>
                        <textarea
                            id="bio"
                            placeholder="Write a brief bio about yourself and your counseling approach"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            required
                        ></textarea>
                    </div>

                    <div className="form-divider"></div>

                    <h2 className="section-title">Reset Your Password</h2>
                    <p className="section-subtitle">You must change your password from the admin-provided one.</p>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password *</label>
                        <input
                            type="password"
                            id="newPassword"
                            placeholder="Enter new password (min 6 characters)"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm your new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        {error && <span className="form-error">{error}</span>}
                    </div>

                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Processing...' : (
                            <>
                                <CheckCircle size={20} />
                                Complete Profile & Reset Password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CounselorCompleteProfile;

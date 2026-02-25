import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, X, CheckCircle } from 'lucide-react';
import './EditProfile.css';

const EditProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        university: '',
        degreeProgram: '',
        yearLevel: '',
        selectedCareerPath: '',
        careerGoals: '',
        skills: '',
        interests: '',
        about: '',
        gpa: '',
        linkedinUrl: '',
        githubUrl: '',
        profileImageUrl: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('http://localhost:8081/api/student/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    const profile = data.data;
                    setFormData({
                        fullName: profile.fullName || '',
                        phone: profile.phone || '',
                        university: profile.university || '',
                        degreeProgram: profile.degreeProgram || '',
                        yearLevel: profile.yearLevel ? profile.yearLevel.toString() : '',
                        selectedCareerPath: profile.selectedCareerPath || '',
                        careerGoals: profile.careerGoals || '',
                        skills: profile.skills || '',
                        interests: profile.interests || '',
                        about: profile.about || '',
                        gpa: profile.gpa ? profile.gpa.toString() : '',
                        linkedinUrl: profile.linkedinUrl || '',
                        githubUrl: profile.githubUrl || '',
                        profileImageUrl: profile.profileImageUrl || ''
                    });
                } else {
                    setError('Failed to load profile data.');
                }
            } catch (err) {
                setError('Unable to connect to the server.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const calculateCompletion = () => {
        const coreFields = [
            'fullName', 'phone', 'university', 'degreeProgram',
            'yearLevel', 'gpa', 'selectedCareerPath', 'careerGoals',
            'skills', 'interests', 'about'
        ];

        let completedCount = 0;
        coreFields.forEach(field => {
            if (formData[field] !== null && formData[field] !== '' && formData[field] !== undefined) {
                completedCount++;
            }
        });

        const percentage = ((completedCount / coreFields.length) * 100).toFixed(1);
        return { percentage, completedCount, total: coreFields.length };
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/student/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    yearLevel: formData.yearLevel ? parseInt(formData.yearLevel) : null,
                    gpa: formData.gpa ? parseFloat(formData.gpa) : null
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setMessage('Profile updated successfully!');
                setTimeout(() => navigate('/view-profile'), 1500);
            } else {
                setError(data.message || 'Failed to update profile.');
            }
        } catch (err) {
            setError('An error occurred. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="edit-profile-loading">
            <div className="spinner"></div>
            <p>Loading profile form...</p>
        </div>
    );

    const completion = calculateCompletion();

    return (
        <div className="edit-profile-page">
            <div className="edit-container">
                <header className="edit-header">
                    <h1>Student Profile</h1>
                    <p>Edit your personal information</p>
                </header>

                <div className="edit-card completion-summary">
                    <div className="completion-header">
                        <h3>Profile Completion</h3>
                        <span className="percentage">{completion.percentage}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${completion.percentage}%` }}></div>
                    </div>
                    <p className="stats">{completion.completedCount} of {completion.total} fields completed</p>
                </div>

                <div className="edit-card profile-pic-section">
                    <div className="pic-circle">
                        <User size={32} />
                    </div>
                    <div className="pic-text">
                        <h3>Profile Picture</h3>
                        <p>No profile picture set. Click "Edit Profile" to add one.</p>
                    </div>
                </div>

                {message && <div className="alert success">{message}</div>}
                {error && <div className="alert error">{error}</div>}

                <form className="edit-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="phone">Phone</label>
                            <input
                                type="text"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="university">University</label>
                            <input
                                type="text"
                                id="university"
                                value={formData.university}
                                onChange={handleChange}
                                placeholder="Enter university"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="degreeProgram">Degree Program</label>
                            <input
                                type="text"
                                id="degreeProgram"
                                value={formData.degreeProgram}
                                onChange={handleChange}
                                placeholder="Enter degree program"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="yearLevel">Year Level</label>
                            <select id="yearLevel" value={formData.yearLevel} onChange={handleChange}>
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                                <option value="5">5th Year</option>
                            </select>
                        </div>
                    </div>

                    <div className="input-group full">
                        <label htmlFor="selectedCareerPath">Selected Career Path</label>
                        <input
                            type="text"
                            id="selectedCareerPath"
                            value={formData.selectedCareerPath}
                            onChange={handleChange}
                            placeholder="e.g. UI/UX Design"
                        />
                    </div>

                    <div className="input-group full">
                        <label htmlFor="careerGoals">Career Goals</label>
                        <textarea
                            id="careerGoals"
                            value={formData.careerGoals}
                            onChange={handleChange}
                            placeholder="Describe your career goals"
                        ></textarea>
                    </div>

                    <div className="input-group full">
                        <label htmlFor="skills">Skills</label>
                        <textarea
                            id="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="List your skills"
                        ></textarea>
                    </div>

                    <div className="input-group full">
                        <label htmlFor="interests">Interests</label>
                        <textarea
                            id="interests"
                            value={formData.interests}
                            onChange={handleChange}
                            placeholder="List your interests"
                        ></textarea>
                    </div>

                    <div className="input-group full">
                        <label htmlFor="about">About (Optional)</label>
                        <textarea
                            id="about"
                            value={formData.about}
                            onChange={handleChange}
                            placeholder="Tell us about yourself"
                        ></textarea>
                    </div>

                    <div className="input-group">
                        <label htmlFor="gpa">GPA (Optional)</label>
                        <input
                            type="text"
                            id="gpa"
                            value={formData.gpa}
                            onChange={handleChange}
                            placeholder="Enter your GPA (0-4)"
                        />
                    </div>

                    <div className="input-group full">
                        <label htmlFor="linkedinUrl">LinkedIn URL (Optional)</label>
                        <input
                            type="text"
                            id="linkedinUrl"
                            value={formData.linkedinUrl}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/yourprofile"
                        />
                    </div>

                    <div className="input-group full">
                        <label htmlFor="githubUrl">GitHub URL (Optional)</label>
                        <input
                            type="text"
                            id="githubUrl"
                            value={formData.githubUrl}
                            onChange={handleChange}
                            placeholder="https://github.com/yourusername"
                        />
                    </div>

                    <div className="input-group full">
                        <label htmlFor="profileImageUrl">Profile Image URL (Optional)</label>
                        <input
                            type="text"
                            id="profileImageUrl"
                            value={formData.profileImageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={saving}>
                            {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                        <button type="button" className="cancel-btn" onClick={() => navigate('/view-profile')}>
                            <X size={18} /> Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;

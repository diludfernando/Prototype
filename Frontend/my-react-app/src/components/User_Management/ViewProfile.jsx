import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit, ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import './ViewProfile.css';

const ViewProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    setProfile(data.data);
                } else {
                    setError(data.message || 'Failed to fetch profile data');
                }
            } catch (err) {
                setError('An error occurred while connecting to the server');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const calculateCompletion = () => {
        if (!profile) return { percentage: 0, completedCount: 0, total: 11 };

        const coreFields = [
            'fullName', 'phone', 'university', 'degreeProgram',
            'yearLevel', 'gpa', 'selectedCareerPath', 'careerGoals',
            'skills', 'interests', 'about'
        ];

        let completedCount = 0;
        coreFields.forEach(field => {
            if (profile[field] !== null && profile[field] !== '' && profile[field] !== undefined) {
                completedCount++;
            }
        });

        const percentage = ((completedCount / coreFields.length) * 100).toFixed(1);
        return { percentage, completedCount, total: coreFields.length };
    };

    if (loading) return (
        <div className="profile-loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
        </div>
    );

    if (error) return (
        <div className="profile-error-container">
            <div className="error-card">
                <h2>Oops!</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
            </div>
        </div>
    );

    const completion = calculateCompletion();

    const renderValue = (value) => {
        if (value === null || value === '' || value === undefined) {
            return <span className="not-provided">Not provided</span>;
        }
        return value;
    };

    return (
        <div className="view-profile-page">
            <div className="profile-container">
                <header className="profile-view-header">
                    <div className="header-left">
                        <h1>Student Profile</h1>
                        <p className="subtitle">View your personal information</p>
                    </div>
                    <button className="edit-profile-btn" onClick={() => navigate('/edit-profile')}>
                        <Edit size={18} />
                        <span>Edit Profile</span>
                    </button>
                </header>

                <div className="profile-content-grid">
                    {/* Completion Status Card */}
                    <div className="profile-card completion-card">
                        <div className="completion-info">
                            <h3>Profile Completion</h3>
                            <span className="completion-percentage">{completion.percentage}%</span>
                        </div>
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${completion.percentage}%` }}
                            ></div>
                        </div>
                        <p className="completion-stats">
                            {completion.completedCount} of {completion.total} fields completed
                        </p>
                    </div>

                    {/* Profile Picture Box */}
                    <div className="profile-card picture-card">
                        <div className="profile-picture-circle">
                            <User size={40} />
                        </div>
                        <div className="picture-info">
                            <h3>Profile Picture</h3>
                            <p>No profile picture set. Click "Edit Profile" to add one.</p>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <section className="info-section">
                        <h2 className="section-title">Personal Information</h2>
                        <div className="info-grid">
                            <div className="info-group">
                                <label>Full Name</label>
                                <p className="info-value">{renderValue(profile?.fullName)}</p>
                            </div>
                            <div className="info-group">
                                <label>Phone</label>
                                <p className="info-value">{renderValue(profile?.phone)}</p>
                            </div>
                        </div>
                    </section>

                    <div className="section-divider"></div>

                    {/* Academic Information */}
                    <section className="info-section">
                        <h2 className="section-title">Academic Information</h2>
                        <div className="info-grid">
                            <div className="info-group">
                                <label>University</label>
                                <p className="info-value">{renderValue(profile?.university)}</p>
                            </div>
                            <div className="info-group">
                                <label>Degree Program</label>
                                <p className="info-value">{renderValue(profile?.degreeProgram)}</p>
                            </div>
                            <div className="info-group">
                                <label>Year Level</label>
                                <p className="info-value">
                                    {profile?.yearLevel ? `${profile.yearLevel}${profile.yearLevel === 1 ? 'st' : profile.yearLevel === 2 ? 'nd' : profile.yearLevel === 3 ? 'rd' : 'th'} Year` : <span className="not-provided">Not provided</span>}
                                </p>
                            </div>
                            <div className="info-group">
                                <label>GPA</label>
                                <p className="info-value">{renderValue(profile?.gpa)}</p>
                            </div>
                        </div>
                    </section>

                    <div className="section-divider"></div>

                    {/* Career Information */}
                    <section className="info-section">
                        <h2 className="section-title">Career Information</h2>
                        <div className="info-group full-width">
                            <label>Selected Career Path</label>
                            <p className="info-value highlighted">{renderValue(profile?.selectedCareerPath)}</p>
                        </div>
                        <div className="info-group full-width mt-4">
                            <label>Career Goals</label>
                            <p className="info-value">{renderValue(profile?.careerGoals)}</p>
                        </div>
                        <div className="info-group full-width mt-4">
                            <label>Skills</label>
                            <p className="info-value">{renderValue(profile?.skills)}</p>
                        </div>
                        <div className="info-group full-width mt-4">
                            <label>Interests</label>
                            <p className="info-value">{renderValue(profile?.interests)}</p>
                        </div>
                    </section>

                    <div className="section-divider"></div>

                    {/* Additional Information */}
                    <section className="info-section">
                        <h2 className="section-title">Additional Information</h2>
                        <div className="info-group full-width">
                            <label>About</label>
                            <p className="info-value">{renderValue(profile?.about)}</p>
                        </div>
                        <div className="info-grid mt-4">
                            <div className="info-group">
                                <label>LinkedIn</label>
                                <p className="info-value">{renderValue(profile?.linkedinUrl)}</p>
                            </div>
                            <div className="info-group">
                                <label>GitHub</label>
                                <p className="info-value">{renderValue(profile?.githubUrl)}</p>
                            </div>
                        </div>
                        <div className="info-group full-width mt-4">
                            <label>Profile Image URL</label>
                            <p className="info-value">{renderValue(profile?.profileImageUrl)}</p>
                        </div>
                    </section>

                    <div className="profile-actions-bottom">
                        <button className="back-services-btn" onClick={() => navigate('/services')}>
                            <ArrowLeft size={18} />
                            <span>Back to Services</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewProfile;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, GraduationCap, PhoneCall, Sparkles, Target } from 'lucide-react';
import './CompleteProfile.css';

const CompleteProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        university: '',
        degreeProgram: '',
        yearLevel: '',
        careerGoals: '',
        skills: '',
        interests: '',
        phone: '',
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    React.useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('You must be logged in to access this page.');
                setFetching(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:8081/api/student/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (response.ok && data.success) {
                    const profile = data.data;
                    const cleanValue = (val) => (val === 'Not Specified' ? '' : (val || ''));
                    
                    setFormData({
                        university: cleanValue(profile.university),
                        degreeProgram: cleanValue(profile.degreeProgram),
                        yearLevel: profile.yearLevel ? profile.yearLevel.toString() : '',
                        careerGoals: cleanValue(profile.careerGoals),
                        skills: cleanValue(profile.skills),
                        interests: cleanValue(profile.interests),
                        phone: '',
                    });
                } else {
                    setError('Failed to fetch profile details.');
                }
            } catch (err) {
                setError('Unable to connect to the server.');
            } finally {
                setFetching(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        if (fieldErrors[id]) {
            setFieldErrors(prev => {
                const nextErrors = { ...prev };
                delete nextErrors[id];
                return nextErrors;
            });
        }
    };

    const validateForm = () => {
        const nextErrors = {};
        const phoneRegex = /^(?:\+94|94|0)[1-9][0-9]{8}$/;
        const numericOnlyRegex = /^\d+$/;
        const yearLevelValue = formData.yearLevel ? parseInt(formData.yearLevel, 10) : null;

        if (!formData.university.trim()) {
            nextErrors.university = 'University is required';
        } else if (numericOnlyRegex.test(formData.university.trim())) {
            nextErrors.university = 'University name cannot be only numbers';
        }

        if (!formData.degreeProgram.trim()) {
            nextErrors.degreeProgram = 'Degree program is required';
        }

        if (!formData.yearLevel) {
            nextErrors.yearLevel = 'Year level is required';
        } else if (yearLevelValue === null || yearLevelValue < 1 || yearLevelValue > 7) {
            nextErrors.yearLevel = 'Year level must be between 1 and 7';
        }

        if (!formData.phone.trim()) {
            nextErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone.trim())) {
            nextErrors.phone = 'Enter a valid Sri Lankan phone number';
        }

        if (!formData.careerGoals.trim()) {
            nextErrors.careerGoals = 'Career goals are required';
        }

        if (!formData.skills.trim()) {
            nextErrors.skills = 'Skills are required';
        }

        if (!formData.interests.trim()) {
            nextErrors.interests = 'Interests are required';
        }

        return nextErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const nextFieldErrors = validateForm();
        setFieldErrors(nextFieldErrors);

        if (Object.keys(nextFieldErrors).length > 0) {
            return;
        }

        setLoading(true);

        const yearLevelValue = parseInt(formData.yearLevel, 10);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to complete your profile.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8081/api/student/profile/complete-mandatory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    yearLevel: yearLevelValue
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setMessage('Profile completed successfully!');
                setTimeout(() => navigate('/services'), 1500);
            } else {
                setError(data.message || 'Failed to complete profile. Please try again.');
            }
        } catch (err) {
            setError('Unable to connect to the server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="complete-profile-page">
                <div className="complete-profile-card" style={{ textAlign: 'center' }}>
                    <p>Loading your profile information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="complete-profile-page">
            <div className="complete-profile-card">
                <header className="complete-profile-header">
                    <span className="complete-profile-kicker"><Sparkles size={14} /> Student onboarding</span>
                    <h1 className="complete-profile-title">Complete your profile</h1>
                    <p className="complete-profile-subtitle">Add your academic and career details to unlock personalized services.</p>
                </header>

                <section className="complete-profile-overview">
                    <p><GraduationCap size={16} /> Improve recommendation quality with accurate university and degree details.</p>
                    <p><Target size={16} /> Match opportunities better by defining goals, skills, and interests.</p>
                    <p><PhoneCall size={16} /> Keep your contact number updated for mentorship and support coordination.</p>
                </section>

                {message && <p className="form-success">{message}</p>}
                {error && <p className="form-error">{error}</p>}

                <form className="complete-profile-form" onSubmit={handleSubmit} noValidate>
                    <p className="complete-profile-form-hint"><BookOpen size={14} /> Fields marked with * are required to continue.</p>

                    <div className="form-row-grid">
                    <div className="form-group">
                        <label htmlFor="university">University *</label>
                        <input
                            type="text"
                            id="university"
                            placeholder="Enter your university name"
                            value={formData.university}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.university)}
                        />
                        {fieldErrors.university && <span className="field-error">{fieldErrors.university}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="degreeProgram">Degree Program *</label>
                        <input
                            type="text"
                            id="degreeProgram"
                            placeholder="Enter your degree program"
                            value={formData.degreeProgram}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.degreeProgram)}
                        />
                        {fieldErrors.degreeProgram && <span className="field-error">{fieldErrors.degreeProgram}</span>}
                    </div>
                    </div>

                    <div className="form-row-grid">
                    <div className="form-group">
                        <label htmlFor="yearLevel">Year Level *</label>
                        <select
                            id="yearLevel"
                            className="form-select"
                            value={formData.yearLevel}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.yearLevel)}
                        >
                            <option value="" disabled>Select year level</option>
                            {[1, 2, 3, 4].map(level => (
                                <option key={level} value={level}>Year {level}</option>
                            ))}
                        </select>
                        {fieldErrors.yearLevel && <span className="field-error">{fieldErrors.yearLevel}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            type="text"
                            id="phone"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.phone)}
                        />
                        {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                    </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="careerGoals">Career Goals *</label>
                        <textarea
                            id="careerGoals"
                            placeholder="Describe your career goals"
                            value={formData.careerGoals}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.careerGoals)}
                        ></textarea>
                        {fieldErrors.careerGoals && <span className="field-error">{fieldErrors.careerGoals}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="skills">Skills *</label>
                        <textarea
                            id="skills"
                            placeholder="List your skills (e.g., JavaScript, Python, React)"
                            value={formData.skills}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.skills)}
                        ></textarea>
                        {fieldErrors.skills && <span className="field-error">{fieldErrors.skills}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="interests">Interests *</label>
                        <textarea
                            id="interests"
                            placeholder="Describe your interests"
                            value={formData.interests}
                            onChange={handleChange}
                            aria-invalid={Boolean(fieldErrors.interests)}
                        ></textarea>
                        {fieldErrors.interests && <span className="field-error">{fieldErrors.interests}</span>}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            'Processing...'
                        ) : (
                            <>
                                <CheckCircle size={20} className="btn-icon" /> Complete Profile
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
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
                    setFormData({
                        university: profile.university || '',
                        degreeProgram: profile.degreeProgram || '',
                        yearLevel: profile.yearLevel ? profile.yearLevel.toString() : '',
                        careerGoals: profile.careerGoals || '',
                        skills: profile.skills || '',
                        interests: profile.interests || '',
                        phone: profile.phone || '',
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

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
                    yearLevel: formData.yearLevel ? parseInt(formData.yearLevel) : null
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
                    <h1 className="complete-profile-title">Complete Your Profile</h1>
                    <p className="complete-profile-subtitle">Please fill in these mandatory fields to continue</p>
                </header>

                {message && <p className="form-success">{message}</p>}
                {error && <p className="form-error">{error}</p>}

                <form className="complete-profile-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="university">University *</label>
                        <input
                            type="text"
                            id="university"
                            placeholder="Enter your university name"
                            value={formData.university}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="degreeProgram">Degree Program *</label>
                        <input
                            type="text"
                            id="degreeProgram"
                            placeholder="Enter your degree program"
                            value={formData.degreeProgram}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="yearLevel">Year Level *</label>
                        <select
                            id="yearLevel"
                            className="form-select"
                            value={formData.yearLevel}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select year level</option>
                            {[1, 2, 3, 4, 5, 6, 7].map(level => (
                                <option key={level} value={level}>Year {level}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="careerGoals">Career Goals *</label>
                        <textarea
                            id="careerGoals"
                            placeholder="Describe your career goals"
                            value={formData.careerGoals}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="skills">Skills *</label>
                        <textarea
                            id="skills"
                            placeholder="List your skills (e.g., JavaScript, Python, React)"
                            value={formData.skills}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="interests">Interests *</label>
                        <textarea
                            id="interests"
                            placeholder="Describe your interests"
                            value={formData.interests}
                            onChange={handleChange}
                            required
                        ></textarea>
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

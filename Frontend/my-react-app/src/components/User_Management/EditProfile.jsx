import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, X, CheckCircle, ArrowLeft } from 'lucide-react';
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
    const [resettingPassword, setResettingPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

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
                    const clean = (val) => (val === 'Not Specified' ? '' : (val || ''));
                    const profile = data.data;
                    setFormData({
                        fullName: clean(profile.fullName),
                        phone: clean(profile.phone),
                        university: clean(profile.university),
                        degreeProgram: clean(profile.degreeProgram),
                        yearLevel: profile.yearLevel ? profile.yearLevel.toString() : '',
                        selectedCareerPath: clean(profile.selectedCareerPath),
                        careerGoals: clean(profile.careerGoals),
                        skills: clean(profile.skills),
                        interests: clean(profile.interests),
                        about: clean(profile.about),
                        gpa: profile.gpa ? profile.gpa.toString() : '',
                        linkedinUrl: clean(profile.linkedinUrl),
                        githubUrl: clean(profile.githubUrl),
                        profileImageUrl: clean(profile.profileImageUrl)
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
            'skills', 'interests', 'about', 'profileImageUrl', 'linkedinUrl', 'githubUrl'
        ];

        let completedCount = 0;
        coreFields.forEach(field => {
            const val = formData[field];
            if (val !== null && val !== '' && val !== undefined && val !== 'Not Specified') {
                completedCount++;
            }
        });

        const percentage = ((completedCount / coreFields.length) * 100).toFixed(1);
        return { percentage, completedCount, total: coreFields.length };
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                profileImageUrl: reader.result || ''
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        const confirmed = window.confirm('Are you sure you want to remove your profile photo?');
        if (!confirmed) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            profileImageUrl: ''
        }));
    };

    const handlePasswordChange = (e) => {
        const { id, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        setPasswordError('');

        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('Please fill in all password fields.');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters.');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New password and confirmation do not match.');
            return;
        }

        setResettingPassword(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8081/api/student/profile/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordData)
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setPasswordMessage('Password reset successfully.');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setPasswordError(data.message || 'Failed to reset password.');
            }
        } catch (err) {
            setPasswordError('An error occurred. Please check your connection.');
        } finally {
            setResettingPassword(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');
        setFieldErrors({});

        const phoneRegex = /^(?:\+94|94|0)[1-9][0-9]{8}$/;
        const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i;
        const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/.*$/i;
        const numericOnlyRegex = /^\d+$/;
        const trimmedPhone = formData.phone.trim();
        const trimmedUniversity = formData.university.trim();
        const trimmedDegreeProgram = formData.degreeProgram.trim();
        const trimmedCareerGoals = formData.careerGoals.trim();
        const trimmedSkills = formData.skills.trim();
        const trimmedInterests = formData.interests.trim();
        const trimmedLinkedinUrl = formData.linkedinUrl.trim();
        const trimmedGithubUrl = formData.githubUrl.trim();
        const yearLevelValue = formData.yearLevel ? parseInt(formData.yearLevel, 10) : null;
        const gpaValue = formData.gpa ? parseFloat(formData.gpa) : null;
        const validationErrors = {};

        if (!trimmedPhone) {
            validationErrors.phone = 'Phone number is required';
        }

        if (!trimmedUniversity) {
            validationErrors.university = 'University is required';
        }

        if (!trimmedDegreeProgram) {
            validationErrors.degreeProgram = 'Degree program is required';
        }

        if (yearLevelValue === null || Number.isNaN(yearLevelValue)) {
            validationErrors.yearLevel = 'Year level is required';
        }

        if (!trimmedCareerGoals) {
            validationErrors.careerGoals = 'Career goals are required';
        }

        if (!trimmedSkills) {
            validationErrors.skills = 'Skills are required';
        }

        if (!trimmedInterests) {
            validationErrors.interests = 'Interests are required';
        }

        if (trimmedPhone && !phoneRegex.test(trimmedPhone)) {
            validationErrors.phone = 'Enter a valid Sri Lankan phone number';
        }

        if (trimmedUniversity && numericOnlyRegex.test(trimmedUniversity)) {
            validationErrors.university = 'University name cannot be only numbers';
        }

        if (yearLevelValue !== null && (yearLevelValue < 1 || yearLevelValue > 7)) {
            validationErrors.yearLevel = 'Year level must be between 1 and 7';
        }

        if (gpaValue !== null && (Number.isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4)) {
            validationErrors.gpa = 'GPA must be between 0.0 and 4.0';
        }

        if (trimmedLinkedinUrl && !linkedinRegex.test(trimmedLinkedinUrl)) {
            validationErrors.linkedinUrl = 'LinkedIn URL must be a valid linkedin.com link';
        }

        if (trimmedGithubUrl && !githubRegex.test(trimmedGithubUrl)) {
            validationErrors.githubUrl = 'GitHub URL must be a valid github.com link';
        }

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            setSaving(false);
            return;
        }

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
                    phone: trimmedPhone,
                    linkedinUrl: trimmedLinkedinUrl,
                    githubUrl: trimmedGithubUrl,
                    yearLevel: yearLevelValue,
                    gpa: gpaValue
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
                    <button
                        type="button"
                        className="back-profile-btn"
                        onClick={() => navigate('/view-profile')}
                    >
                        <ArrowLeft size={16} /> Back to Profile
                    </button>
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
                        {formData.profileImageUrl ? (
                            <img src={formData.profileImageUrl} alt="Profile" className="profile-preview-image" />
                        ) : (
                            <User size={32} />
                        )}
                    </div>
                    <div className="pic-text">
                        <h3>Profile Photo</h3>
                        <p>Upload a profile photo from your device.</p>
                        <div className="photo-actions">
                            <input
                                type="file"
                                id="profileImage"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="photo-upload-input"
                            />
                            <button
                                type="button"
                                className="cancel-btn remove-photo-btn"
                                onClick={handleRemovePhoto}
                                disabled={!formData.profileImageUrl}
                            >
                                Remove Photo
                            </button>
                        </div>
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
                            <label htmlFor="phone">Phone *</label>
                            <input
                                type="text"
                                id="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                required
                            />
                            {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="university">University *</label>
                            <input
                                type="text"
                                id="university"
                                value={formData.university}
                                onChange={handleChange}
                                placeholder="Enter university"
                                required
                            />
                            {fieldErrors.university && <p className="field-error">{fieldErrors.university}</p>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="degreeProgram">Degree Program *</label>
                            <input
                                type="text"
                                id="degreeProgram"
                                value={formData.degreeProgram}
                                onChange={handleChange}
                                placeholder="Enter degree program"
                                required
                            />
                            {fieldErrors.degreeProgram && <p className="field-error">{fieldErrors.degreeProgram}</p>}
                        </div>
                        <div className="input-group">
                            <label htmlFor="yearLevel">Year Level *</label>
                            <select id="yearLevel" value={formData.yearLevel} onChange={handleChange} required>
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                                <option value="5">5th Year</option>
                            </select>
                            {fieldErrors.yearLevel && <p className="field-error">{fieldErrors.yearLevel}</p>}
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
                        <label htmlFor="careerGoals">Career Goals *</label>
                        <textarea
                            id="careerGoals"
                            value={formData.careerGoals}
                            onChange={handleChange}
                            placeholder="Describe your career goals"
                            required
                        ></textarea>
                        {fieldErrors.careerGoals && <p className="field-error">{fieldErrors.careerGoals}</p>}
                    </div>

                    <div className="input-group full">
                        <label htmlFor="skills">Skills *</label>
                        <textarea
                            id="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            placeholder="List your skills"
                            required
                        ></textarea>
                        {fieldErrors.skills && <p className="field-error">{fieldErrors.skills}</p>}
                    </div>

                    <div className="input-group full">
                        <label htmlFor="interests">Interests *</label>
                        <textarea
                            id="interests"
                            value={formData.interests}
                            onChange={handleChange}
                            placeholder="List your interests"
                            required
                        ></textarea>
                        {fieldErrors.interests && <p className="field-error">{fieldErrors.interests}</p>}
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
                        {fieldErrors.gpa && <p className="field-error">{fieldErrors.gpa}</p>}
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
                        {fieldErrors.linkedinUrl && <p className="field-error">{fieldErrors.linkedinUrl}</p>}
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
                        {fieldErrors.githubUrl && <p className="field-error">{fieldErrors.githubUrl}</p>}
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

                <div className="edit-card password-reset-section">
                    <h3>Reset Password</h3>
                    <p>Reset your account password if needed.</p>

                    {passwordMessage && <div className="alert success password-alert">{passwordMessage}</div>}
                    {passwordError && <div className="alert error password-alert">{passwordError}</div>}

                    <form className="password-reset-form" onSubmit={handlePasswordReset}>
                        <div className="input-group full">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                type="password"
                                id="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                            />
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        <div className="form-actions password-actions">
                            <button type="submit" className="save-btn" disabled={resettingPassword}>
                                {resettingPassword ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;

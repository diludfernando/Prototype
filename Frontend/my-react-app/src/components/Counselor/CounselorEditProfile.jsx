import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Search,
  Bell,
  LayoutDashboard,
  User,
  ArrowLeft,
  Phone,
  GraduationCap,
  Briefcase,
  BadgeCheck,
  CalendarDays,
  Link as LinkIcon,
  Save,
  Camera
} from 'lucide-react';
import './CounselorDashboard.css';

const CounselorEditProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordResetSaving, setPasswordResetSaving] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  const [profileFieldErrors, setProfileFieldErrors] = useState({});
  const [passwordResetMessage, setPasswordResetMessage] = useState('');
  const [passwordResetError, setPasswordResetError] = useState('');
  const profileFeedbackRef = useRef(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    qualification: '',
    specialization: '',
    yearsOfExperience: '',
    shortBio: '',
    availability: '',
    linkedinUrl: '',
    profileImageUrl: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const initialsSource = profile?.fullName || localStorage.getItem('username') || 'AU';
  const counselorInitials = initialsSource
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('') || 'AU';

  const displayValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    return value;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfileError('You must be logged in to view your profile.');
        return;
      }

      setProfileLoading(true);
      setProfileError('');

      try {
        const response = await fetch('http://localhost:8081/api/counselor/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setProfile(data.data);
          setEditForm({
            fullName: data.data.fullName || '',
            phoneNumber: data.data.phoneNumber || '',
            qualification: data.data.qualification || '',
            specialization: data.data.specialization || '',
            yearsOfExperience: data.data.yearsOfExperience ?? '',
            shortBio: data.data.shortBio || '',
            availability: data.data.availability || '',
            linkedinUrl: data.data.linkedinUrl || '',
            profileImageUrl: data.data.profileImageUrl || ''
          });
        } else {
          setProfileError(data.message || 'Failed to load counselor profile.');
        }
      } catch (error) {
        setProfileError('Unable to connect to the server.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
    setProfileFieldErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setProfileSaveError('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({
        ...prev,
        profileImageUrl: reader.result || ''
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfileImage = () => {
    const confirmed = window.confirm('Are you sure you want to remove your profile photo?');
    if (!confirmed) {
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      profileImageUrl: ''
    }));
  };

  const scrollToProfileFeedback = () => {
    setTimeout(() => {
      profileFeedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  };

  const focusFirstMissingField = (errors) => {
    const fieldOrder = ['fullName', 'phoneNumber', 'qualification', 'specialization', 'yearsOfExperience', 'shortBio'];
    const firstMissingField = fieldOrder.find((field) => errors[field]);
    if (!firstMissingField) {
      return;
    }

    setTimeout(() => {
      const inputElement = document.getElementById(firstMissingField);
      inputElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputElement?.focus();
    }, 0);
  };

  const saveProfileChanges = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileSaveError('You must be logged in to update your profile.');
      scrollToProfileFeedback();
      return;
    }

    const trimmedFullName = editForm.fullName.trim();
    const trimmedPhoneNumber = editForm.phoneNumber.trim();
    const trimmedQualification = editForm.qualification.trim();
    const trimmedSpecialization = editForm.specialization.trim();
    const trimmedShortBio = editForm.shortBio.trim();
    const trimmedAvailability = editForm.availability.trim();
    const trimmedLinkedinUrl = editForm.linkedinUrl.trim();
    const yearsOfExperienceValue = editForm.yearsOfExperience === ''
        ? null
        : parseInt(editForm.yearsOfExperience, 10);

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/i;

    const missingFieldErrors = {
      fullName: !trimmedFullName ? 'Full Name is required.' : '',
      phoneNumber: !trimmedPhoneNumber ? 'Phone Number is required.' : '',
      qualification: !trimmedQualification ? 'Qualification is required.' : '',
      specialization: !trimmedSpecialization ? 'Specialization is required.' : '',
      yearsOfExperience: yearsOfExperienceValue === null ? 'Years of Experience is required.' : '',
      shortBio: !trimmedShortBio ? 'Bio is required.' : ''
    };

    const hasMissingFields = Object.values(missingFieldErrors).some(Boolean);
    if (hasMissingFields) {
      setProfileFieldErrors(missingFieldErrors);
      setProfileSaveError('');
      focusFirstMissingField(missingFieldErrors);
      return;
    }

    setProfileFieldErrors({});

    if (!phoneRegex.test(trimmedPhoneNumber)) {
      setProfileSaveError('Phone number must be 10-15 digits and can start with +.');
      scrollToProfileFeedback();
      return;
    }

    if (Number.isNaN(yearsOfExperienceValue) || yearsOfExperienceValue < 0 || yearsOfExperienceValue > 50) {
      setProfileSaveError('Years of experience must be between 0 and 50.');
      scrollToProfileFeedback();
      return;
    }

    if (trimmedLinkedinUrl && !linkedinRegex.test(trimmedLinkedinUrl)) {
      setProfileSaveError('LinkedIn URL must be a valid linkedin.com link.');
      scrollToProfileFeedback();
      return;
    }

    setProfileSaving(true);
    setProfileSaveError('');
    setProfileSaveMessage('');

    try {
      const payload = {
        fullName: trimmedFullName,
        phoneNumber: trimmedPhoneNumber,
        qualification: trimmedQualification,
        specialization: trimmedSpecialization,
        yearsOfExperience: yearsOfExperienceValue,
        shortBio: trimmedShortBio,
        availability: trimmedAvailability,
        linkedinUrl: trimmedLinkedinUrl,
        profileImageUrl: editForm.profileImageUrl
      };

      const response = await fetch('http://localhost:8081/api/counselor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProfile(data.data);
        setProfileSaveMessage('Profile updated successfully.');
        scrollToProfileFeedback();
        setTimeout(() => {
          navigate('/counselor/profile');
        }, 1500);
      } else {
        setProfileSaveError(data.message || 'Failed to update profile.');
        scrollToProfileFeedback();
      }
    } catch (error) {
      setProfileSaveError('Unable to connect to the server.');
      scrollToProfileFeedback();
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordFormChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetCounselorPassword = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setPasswordResetError('You must be logged in to reset your password.');
      return;
    }

    setPasswordResetError('');
    setPasswordResetMessage('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordResetError('Please fill in all password fields.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordResetError('New password must be at least 6 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordResetError('New password and confirmation do not match.');
      return;
    }

    setPasswordResetSaving(true);
    try {
      const response = await fetch('http://localhost:8081/api/counselor/profile/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordForm)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPasswordResetMessage('Password reset successfully.');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordResetError(data.message || 'Failed to reset password.');
      }
    } catch (error) {
      setPasswordResetError('Unable to connect to the server.');
    } finally {
      setPasswordResetSaving(false);
    }
  };

  return (
      <div className="counselor-dashboard">
        {/* Sidebar */}
        <aside className="c-sidebar">
          <div className="c-sidebar-brand">
            <div className="c-brand-logo">SB</div>
            <span className="c-brand-name">Skill Bridge</span>
          </div>

          <nav className="c-sidebar-nav">
            <button
                className="c-nav-item"
                onClick={() => navigate('/counselor/dashboard')}
            >
              <LayoutDashboard size={20} /> <span>Dashboard</span>
            </button>

            <button
                className="c-nav-item active"
                onClick={() => navigate('/counselor/profile')}
            >
              <User size={20} /> <span>Profile</span>
            </button>

          </nav>

          <div className="c-sidebar-footer">
            <button className="c-logout-button" onClick={handleLogout}>
              <LogOut size={20} /> <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="c-main-content">
          {/* Top Header */}
          <header className="c-top-header">
            <div className="c-search-bar">
              <Search size={18} className="c-text-muted" />
              <input type="text" placeholder="Search analytics..." />
            </div>
            <div className="c-header-actions">
              <button className="c-icon-button">
                <Bell size={20} />
              </button>
              <button className="c-header-logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
              <div className="c-user-profile">
                <div className="c-avatar">
                  {editForm.profileImageUrl ? (
                      <img src={editForm.profileImageUrl} alt="Counselor" className="c-avatar-image" />
                  ) : (
                      counselorInitials
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="c-content-body">
            <div className="c-profile-page c-edit-profile-page">
              <div className="c-page-header c-edit-page-header">
                <button
                    className="c-back-link"
                    onClick={() => navigate('/counselor/profile')}
                >
                  <ArrowLeft size={18} />
                  Back to Profile
                </button>
                <h1>Edit Counselor Profile</h1>
                <p>Update your professional information and profile details.</p>
              </div>

              <div ref={profileFeedbackRef}></div>

              {profileLoading && <p className="c-inline-state">Loading profile...</p>}
              {!profileLoading && profileError && <p className="c-inline-state c-inline-error">{profileError}</p>}
              {!profileLoading && !profileError && profileSaveError && <p className="c-inline-state c-inline-error">{profileSaveError}</p>}
              {!profileLoading && !profileError && profileSaveMessage && <p className="c-inline-state c-inline-success">{profileSaveMessage}</p>}

              {!profileLoading && !profileError && profile && (
                  <>
                    <section className="c-profile-card c-profile-top-card">
                      <div className="c-profile-top">
                        <div className="c-profile-avatar-lg">
                          {editForm.profileImageUrl ? (
                              <img src={editForm.profileImageUrl} alt="Counselor" className="c-profile-avatar-image" />
                          ) : (
                              counselorInitials
                          )}
                        </div>
                        <div className="c-profile-top-meta">
                          <div className="c-profile-titleblock">
                            <h2>{displayValue(editForm.fullName)}</h2>
                            <p>Counselor · Live Preview</p>
                          </div>
                          <div className="c-photo-actions">
                            <input
                                id="profileImage"
                                name="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageUpload}
                                className="c-photo-upload-input"
                            />
                            <button
                                type="button"
                                className="c-btn-secondary"
                                onClick={handleRemoveProfileImage}
                                disabled={!editForm.profileImageUrl || profileSaving}
                            >
                              Remove Photo
                            </button>
                            <span className="c-photo-helper">Use a clear profile image for better visibility.</span>
                          </div>
                          <div className="c-profile-bio-inline-wrap">
                            <h3 className="c-profile-section-title">Bio</h3>
                            <p className="c-profile-bio">{displayValue(editForm.shortBio)}</p>
                          </div>
                          <div className="c-profile-highlights" role="list" aria-label="Counselor edit preview highlights">
                            <div className="c-highlight-chip" role="listitem">
                              <Briefcase size={14} />
                              <span>{displayValue(editForm.specialization)}</span>
                            </div>
                            <div className="c-highlight-chip" role="listitem">
                              <BadgeCheck size={14} />
                              <span>{displayValue(editForm.yearsOfExperience)} years</span>
                            </div>
                            <div className="c-highlight-chip" role="listitem">
                              <CalendarDays size={14} />
                              <span>{displayValue(editForm.availability)}</span>
                            </div>
                            <div className="c-highlight-chip" role="listitem">
                              <GraduationCap size={14} />
                              <span>{displayValue(editForm.qualification)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="c-profile-card c-edit-main-card">
                      <h3 className="c-profile-section-title">Edit Professional Details</h3>
                      <p className="c-edit-helper-text">Keep your profile complete and up to date so students can trust your expertise.</p>
                      <p className="c-form-hint">Fields marked with <span className="c-required-mark">*</span> are required.</p>

                      <div className="c-form-row">
                        <div className="c-form-group">
                          <label htmlFor="fullName"><User size={14} /> Full Name <span className="c-required-mark">*</span></label>
                          <input
                              id="fullName"
                              name="fullName"
                              type="text"
                              className={profileFieldErrors.fullName ? 'c-input-error' : ''}
                              value={editForm.fullName}
                              onChange={handleEditFormChange}
                          />
                          {profileFieldErrors.fullName && <p className="c-field-error">{profileFieldErrors.fullName}</p>}
                        </div>
                        <div className="c-form-group">
                          <label htmlFor="phoneNumber"><Phone size={14} /> Phone Number <span className="c-required-mark">*</span></label>
                          <input
                              id="phoneNumber"
                              name="phoneNumber"
                              type="text"
                              className={profileFieldErrors.phoneNumber ? 'c-input-error' : ''}
                              value={editForm.phoneNumber}
                              onChange={handleEditFormChange}
                          />
                          {profileFieldErrors.phoneNumber && <p className="c-field-error">{profileFieldErrors.phoneNumber}</p>}
                        </div>
                      </div>

                      <div className="c-form-row">
                        <div className="c-form-group">
                          <label htmlFor="qualification"><GraduationCap size={14} /> Qualification <span className="c-required-mark">*</span></label>
                          <input
                              id="qualification"
                              name="qualification"
                              type="text"
                              className={profileFieldErrors.qualification ? 'c-input-error' : ''}
                              value={editForm.qualification}
                              onChange={handleEditFormChange}
                          />
                          {profileFieldErrors.qualification && <p className="c-field-error">{profileFieldErrors.qualification}</p>}
                        </div>
                        <div className="c-form-group">
                          <label htmlFor="specialization"><Briefcase size={14} /> Specialization <span className="c-required-mark">*</span></label>
                          <input
                              id="specialization"
                              name="specialization"
                              type="text"
                              className={profileFieldErrors.specialization ? 'c-input-error' : ''}
                              value={editForm.specialization}
                              onChange={handleEditFormChange}
                          />
                          {profileFieldErrors.specialization && <p className="c-field-error">{profileFieldErrors.specialization}</p>}
                        </div>
                      </div>

                      <div className="c-form-row">
                        <div className="c-form-group">
                          <label htmlFor="yearsOfExperience"><BadgeCheck size={14} /> Years of Experience <span className="c-required-mark">*</span></label>
                          <input
                              id="yearsOfExperience"
                              name="yearsOfExperience"
                              type="number"
                              min="0"
                              max="50"
                              className={profileFieldErrors.yearsOfExperience ? 'c-input-error' : ''}
                              value={editForm.yearsOfExperience}
                              onChange={handleEditFormChange}
                          />
                          {profileFieldErrors.yearsOfExperience && <p className="c-field-error">{profileFieldErrors.yearsOfExperience}</p>}
                        </div>
                        <div className="c-form-group">
                          <label htmlFor="availability"><CalendarDays size={14} /> Availability</label>
                          <input
                              id="availability"
                              name="availability"
                              type="text"
                              placeholder="e.g. Weekdays 9:00 AM - 5:00 PM"
                              value={editForm.availability}
                              onChange={handleEditFormChange}
                          />
                        </div>
                        <div className="c-form-group">
                          <label htmlFor="linkedinUrl"><LinkIcon size={14} /> LinkedIn URL</label>
                          <input
                              id="linkedinUrl"
                              name="linkedinUrl"
                              type="url"
                              placeholder="https://linkedin.com/in/your-profile"
                              value={editForm.linkedinUrl}
                              onChange={handleEditFormChange}
                          />
                        </div>
                      </div>

                      <div className="c-form-group">
                        <label htmlFor="shortBio">Bio <span className="c-required-mark">*</span></label>
                        <textarea
                            id="shortBio"
                            name="shortBio"
                            rows="4"
                            className={profileFieldErrors.shortBio ? 'c-input-error' : ''}
                            value={editForm.shortBio}
                            onChange={handleEditFormChange}
                        />
                        {profileFieldErrors.shortBio && <p className="c-field-error">{profileFieldErrors.shortBio}</p>}
                      </div>

                      <div className="c-profile-actions">
                        <button
                            className="c-btn-secondary"
                            onClick={() => navigate('/counselor/profile')}
                            disabled={profileSaving}
                        >
                          Cancel
                        </button>
                        <button
                            className="c-btn-primary"
                            onClick={saveProfileChanges}
                            disabled={profileSaving}
                        >
                          {profileSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                        </button>
                      </div>
                    </section>

                    <section className="c-profile-card c-password-reset-card c-edit-password-card">
                      <h3 className="c-profile-section-title">Reset Password</h3>
                      <p className="c-edit-helper-text">Reset your account password if needed.</p>

                      {passwordResetError && <p className="c-inline-state c-inline-error">{passwordResetError}</p>}
                      {passwordResetMessage && <p className="c-inline-state c-inline-success">{passwordResetMessage}</p>}

                      <div className="c-form-group">
                        <label htmlFor="currentPassword">Current Password *</label>
                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordFormChange}
                        />
                      </div>

                      <div className="c-form-row c-password-reset-row">
                        <div className="c-form-group">
                          <label htmlFor="newPassword">New Password *</label>
                          <input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordFormChange}
                          />
                        </div>

                        <div className="c-form-group">
                          <label htmlFor="confirmPassword">Confirm New Password *</label>
                          <input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordFormChange}
                          />
                        </div>
                      </div>

                      <div className="c-profile-actions c-password-reset-actions">
                        <button
                            className="c-btn-primary"
                            onClick={resetCounselorPassword}
                            disabled={passwordResetSaving}
                        >
                          {passwordResetSaving ? 'Resetting...' : 'Reset Password'}
                        </button>
                      </div>
                    </section>
                  </>
              )}

              {!profileLoading && !profileError && !profile && (
                  <p className="c-inline-state">No profile data available.</p>
              )}
            </div>
          </div>
        </main>
      </div>
  );
};

export default CounselorEditProfile;

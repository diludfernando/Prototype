import React, { useEffect, useState } from 'react';
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
  const [profileSaveError, setProfileSaveError] = useState('');
  const [profileSaveMessage, setProfileSaveMessage] = useState('');
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    qualification: '',
    specialization: '',
    yearsOfExperience: '',
    shortBio: '',
    linkedinUrl: '',
    profileImageUrl: ''
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

  const saveProfileChanges = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileSaveError('You must be logged in to update your profile.');
      return;
    }

    setProfileSaving(true);
    setProfileSaveError('');
    setProfileSaveMessage('');

    try {
      const payload = {
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
        qualification: editForm.qualification,
        specialization: editForm.specialization,
        yearsOfExperience: editForm.yearsOfExperience === '' ? null : parseInt(editForm.yearsOfExperience, 10),
        shortBio: editForm.shortBio,
        linkedinUrl: editForm.linkedinUrl,
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
        setTimeout(() => {
          navigate('/counselor/profile');
        }, 1500);
      } else {
        setProfileSaveError(data.message || 'Failed to update profile.');
      }
    } catch (error) {
      setProfileSaveError('Unable to connect to the server.');
    } finally {
      setProfileSaving(false);
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
        {/* Top Header removed */}

        {/* Dashboard Content */}
        <div className="c-content-body">
          <div className="c-profile-page">
            <div className="c-page-header">
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
                          <GraduationCap size={14} />
                          <span>{displayValue(editForm.qualification)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="c-profile-card">
                  <h3 className="c-profile-section-title">Edit Professional Details</h3>
                  <p className="c-edit-helper-text">Keep your profile complete and up to date so students can trust your expertise.</p>

                  <div className="c-form-row">
                    <div className="c-form-group">
                      <label htmlFor="fullName"><User size={14} /> Full Name</label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={editForm.fullName}
                        onChange={handleEditFormChange}
                      />
                    </div>
                    <div className="c-form-group">
                      <label htmlFor="phoneNumber"><Phone size={14} /> Phone Number</label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="text"
                        value={editForm.phoneNumber}
                        onChange={handleEditFormChange}
                      />
                    </div>
                  </div>

                  <div className="c-form-row">
                    <div className="c-form-group">
                      <label htmlFor="qualification"><GraduationCap size={14} /> Qualification</label>
                      <input
                        id="qualification"
                        name="qualification"
                        type="text"
                        value={editForm.qualification}
                        onChange={handleEditFormChange}
                      />
                    </div>
                    <div className="c-form-group">
                      <label htmlFor="specialization"><Briefcase size={14} /> Specialization</label>
                      <input
                        id="specialization"
                        name="specialization"
                        type="text"
                        value={editForm.specialization}
                        onChange={handleEditFormChange}
                      />
                    </div>
                  </div>

                  <div className="c-form-row">
                    <div className="c-form-group">
                      <label htmlFor="yearsOfExperience"><BadgeCheck size={14} /> Years of Experience</label>
                      <input
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        type="number"
                        min="0"
                        max="50"
                        value={editForm.yearsOfExperience}
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
                    <label htmlFor="shortBio">Bio</label>
                    <textarea
                      id="shortBio"
                      name="shortBio"
                      rows="4"
                      value={editForm.shortBio}
                      onChange={handleEditFormChange}
                    />
                  </div>

                  <div className="c-form-group">
                    <label htmlFor="profileImage"><Camera size={14} /> Profile Photo</label>
                    <input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                    />
                    <span className="c-form-hint">Use a clear profile image for better visibility.</span>
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

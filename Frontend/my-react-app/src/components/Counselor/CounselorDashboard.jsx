import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  LogOut,
  Search,
  Bell,
  Phone,
  GraduationCap,
  Briefcase,
  BadgeCheck,
  CalendarDays,
  Link as LinkIcon,
  Clock
} from 'lucide-react';
import CounsellingManagement from './CounsellingManagement';
import './CounselorDashboard.css';

const CounselorDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const displayValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    return value;
  };

  const isProvided = (value) => value !== null && value !== undefined && value !== '';

  const initialsSource = profile?.fullName || localStorage.getItem('username') || 'AU';
  const counselorInitials = initialsSource
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('') || 'AU';

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
        } else {
          setProfileError(data.message || 'Failed to load counselor profile.');
        }
      } catch {
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
                className={`c-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
            >
              <User size={20} /> <span>Profile</span>
            </button>
            <button
                className={`c-nav-item ${activeTab === 'counselling' ? 'active' : ''}`}
                onClick={() => setActiveTab('counselling')}
            >
              <Clock size={20} /> <span>Counselling</span>
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
            {activeTab === 'profile' && (
                <div className="c-profile-page">
                  <div className="c-page-header">
                    <h1>Counselor Profile</h1>
                    <p>View your professional information and profile details.</p>
                  </div>

                  {!profileLoading && !profileError && profile && (
                      <div className="c-profile-actions">
                        <button className="c-btn-primary" onClick={() => navigate('/counselor/edit-profile')}>
                          Edit Profile
                        </button>
                      </div>
                  )}

                  {profileLoading && <p className="c-inline-state">Loading profile...</p>}
                  {!profileLoading && profileError && <p className="c-inline-state c-inline-error">{profileError}</p>}

                  {!profileLoading && !profileError && profile && (
                      <>
                        <section className="c-profile-card c-profile-top-card">
                          <div className="c-profile-top">
                            <div className="c-profile-avatar-lg">
                              {profile.profileImageUrl ? (
                                  <img src={profile.profileImageUrl} alt="Counselor" className="c-profile-avatar-image" />
                              ) : (
                                  counselorInitials
                              )}
                            </div>
                            <div className="c-profile-top-meta">
                              <div className="c-profile-titleblock">
                                <h2>{displayValue(profile.fullName)}</h2>
                                <p>Counselor</p>
                              </div>
                              <div className="c-profile-bio-inline-wrap">
                                <h3 className="c-profile-section-title">Bio</h3>
                                <p className="c-profile-bio">{displayValue(profile.shortBio)}</p>
                              </div>
                              <div className="c-profile-highlights" role="list" aria-label="Counselor quick highlights">
                                <div className="c-highlight-chip" role="listitem">
                                  <Briefcase size={14} />
                                  <span>{displayValue(profile.specialization)}</span>
                                </div>
                                <div className="c-highlight-chip" role="listitem">
                                  <BadgeCheck size={14} />
                                  <span>{displayValue(profile.yearsOfExperience)} years</span>
                                </div>
                                <div className="c-highlight-chip" role="listitem">
                                  <CalendarDays size={14} />
                                  <span>{displayValue(profile.availability)}</span>
                                </div>
                                <div className="c-highlight-chip" role="listitem">
                                  <GraduationCap size={14} />
                                  <span>{displayValue(profile.qualification)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </section>

                        <section className="c-profile-card">
                          <h3 className="c-profile-section-title">Professional Details</h3>
                          <div className="c-profile-grid">
                            <div className="c-profile-field">
                              <span className="c-profile-label"><Phone size={14} /> Phone Number</span>
                              {isProvided(profile.phoneNumber) ? (
                                  <a className="c-profile-link" href={`tel:${profile.phoneNumber}`}>{profile.phoneNumber}</a>
                              ) : (
                                  <span className="c-profile-value">Not specified</span>
                              )}
                            </div>
                            <div className="c-profile-field">
                              <span className="c-profile-label"><GraduationCap size={14} /> Qualification</span>
                              <span className="c-profile-value">{displayValue(profile.qualification)}</span>
                            </div>
                            <div className="c-profile-field">
                              <span className="c-profile-label"><Briefcase size={14} /> Specialization</span>
                              <span className="c-profile-value">{displayValue(profile.specialization)}</span>
                            </div>
                            <div className="c-profile-field">
                              <span className="c-profile-label"><BadgeCheck size={14} /> Years of Experience</span>
                              <span className="c-profile-value">{displayValue(profile.yearsOfExperience)}</span>
                            </div>
                            <div className="c-profile-field">
                              <span className="c-profile-label"><CalendarDays size={14} /> Availability</span>
                              <span className="c-profile-value">{displayValue(profile.availability)}</span>
                            </div>
                          </div>
                        </section>

                        <section className="c-profile-card">
                          <h3 className="c-profile-section-title">Links</h3>
                          <div className="c-profile-grid">
                            <div className="c-profile-field">
                              <span className="c-profile-label"><LinkIcon size={14} /> LinkedIn</span>
                              {isProvided(profile.linkedinUrl) ? (
                                  <a
                                      className="c-profile-link"
                                      href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                                      target="_blank"
                                      rel="noreferrer"
                                  >
                                    {profile.linkedinUrl}
                                  </a>
                              ) : (
                                  <span className="c-profile-value">Not specified</span>
                              )}
                            </div>
                          </div>
                        </section>
                      </>
                  )}

                  {!profileLoading && !profileError && !profile && (
                      <p className="c-inline-state">No profile data available.</p>
                  )}
                </div>
            )}

            {activeTab === 'counselling' && <CounsellingManagement />}
          </div>
        </main>
      </div>
  );
};

export default CounselorDashboard;

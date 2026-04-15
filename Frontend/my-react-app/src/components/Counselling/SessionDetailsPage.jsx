import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Mail, Briefcase, Award, ChevronLeft, ShieldCheck, Tag, Info, CreditCard } from 'lucide-react';
import './SessionDetailsPage.css';

const SessionDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [counsellor, setCounsellor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch Session
                const sessionRes = await fetch(`http://localhost:8083/api/counselling/session/${id}`);
                if (!sessionRes.ok) throw new Error('Session not found');
                const sessionData = await sessionRes.json();
                setSession(sessionData);

                // Fetch Counsellor
                const counsellorRes = await fetch(`http://localhost:8083/api/counselling/counsellor/${sessionData.counsellorId}`);
                if (counsellorRes.ok) {
                    const counsellorData = await counsellorRes.json();
                    setCounsellor(counsellorData);
                }
            } catch (err) {
                console.error("Error fetching details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    if (loading) return (
        <div className="details-loading">
            <div className="spinner"></div>
            <p>Gathering session details...</p>
        </div>
    );

    if (!session) return (
        <div className="details-error">
            <Info size={48} />
            <h2>Session Not Found</h2>
            <button className="btn btn-primary" onClick={() => navigate('/counselling')}>Back to Sessions</button>
        </div>
    );

    return (
        <div className="session-details-container animate-fade-in">
            <div className="details-glass-wrapper">
                <button className="back-nav-btn" onClick={() => navigate('/counselling')}>
                    <ChevronLeft size={20} />
                    <span>Manage Sessions</span>
                </button>

                <div className="details-layout">
                    {/* Header Section */}
                    <header className="details-header">
                        <div className="session-id-tag">Session #{id}</div>
                        <h1 className="text-4xl font-bold mt-2">Appointment Overview</h1>
                        <p className="subtitle">Detailed view of your career guidance session with {session.counsellorName}</p>
                    </header>

                    <div className="details-grid">
                        {/* Session Details Card */}
                        <section className="details-card session-info-card">
                            <div className="card-top-icon">
                                <Calendar size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-6">Session Information</h2>
                            <div className="info-rows">
                                <div className="detail-row">
                                    <label><Calendar size={18} /> Date</label>
                                    <span className="value">{session.sessionDate}</span>
                                </div>
                                <div className="detail-row">
                                    <label><Clock size={18} /> Time Slot</label>
                                    <span className="value">{session.timeSlot}</span>
                                </div>
                                <div className="detail-row">
                                    <label><ShieldCheck size={18} /> Status</label>
                                    <span className={`status-pill ${session.status?.toLowerCase() || 'booked'}`}>
                                        {session.status || 'BOOKED'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <label><Tag size={18} /> Category</label>
                                    <span className="value">IT Career Counselling</span>
                                </div>
                                <div className="detail-row">
                                    <label><CreditCard size={18} /> Payment</label>
                                    <span className={`payment-pill ${session.paymentStatus?.toLowerCase() || (session.isFree ? 'free' : 'pending')}`}>
                                        {session.paymentStatus || (session.isFree ? 'FREE' : 'PENDING')}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Counsellor Details Card */}
                        <section className="details-card counsellor-info-card">
                            <div className="card-top-icon">
                                <User size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-6">Counsellor Profile</h2>

                            <div className="counsellor-profile-header">
                                <div className="profile-avatar">
                                    <User size={40} />
                                </div>
                                <div className="profile-name-group">
                                    <h3>{session.counsellorName}</h3>
                                    <p className="specialization-badge">{counsellor?.specialization || 'IT Career Expert'}</p>
                                </div>
                            </div>

                            <div className="info-rows mt-4">
                                <div className="detail-row">
                                    <label><Mail size={18} /> Email Address</label>
                                    <span className="value">{counsellor?.email || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <label><Award size={18} /> Experience</label>
                                    <span className="value">{counsellor?.experienceYears || '5+'} Years</span>
                                </div>
                                <div className="detail-row">
                                    <label><Briefcase size={18} /> Specialization</label>
                                    <span className="value">{counsellor?.specialization || 'General IT Counselling'}</span>
                                </div>
                            </div>

                            <div className="counsellor-bio mt-6">
                                <label><Info size={16} /> About</label>
                                <p>
                                    Expert in guiding students through the complex landscape of IT careers.
                                    Specializes in {counsellor?.specialization?.toLowerCase() || 'providing personalized career paths'}
                                    and industry-standard profile optimization.
                                </p>
                            </div>
                        </section>
                    </div>

                    <footer className="details-footer">
                        <p className="text-muted text-sm">
                            Need help? Contact support if you itemize any discrepancies in your appointment details.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default SessionDetailsPage;

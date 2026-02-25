import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, CreditCard, Tag, ChevronLeft } from 'lucide-react';
import './BookingPage.css';

const BookingPage = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8083/api/counselling/all')
            .then(res => res.json())
            .then(data => {
                setSessions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching sessions:", err);
                setLoading(false);
            });
    }, []);

    const getCounsellorName = (id) => {
        const names = {
            1: 'Dr. Alan Turing',
            2: 'Ada Lovelace',
            3: 'Grace Hopper'
        };
        return names[id] || `Counsellor #${id}`;
    };
    return (
        <div className="booking-page animate-fade-in">
            <div className="container">
                <button className="back-btn-booking" onClick={() => navigate('/services')}>
                    <ChevronLeft size={20} />
                    <span>Back to Services</span>
                </button>
                <header className="booking-header text-center">
                    <h1 className="text-4xl font-bold">My Counselling Sessions</h1>
                    <p className="text-lg text-muted">Manage your career guidance appointments and track your progress.</p>
                    <button className="btn btn-primary mt-4" onClick={() => navigate('/counselling/newbooking')}>
                        <Calendar size={20} />
                        <span>Book New Session</span>
                    </button>
                </header>

                <div className="booking-grid">
                    {loading ? (
                        <p className="text-center w-full">Loading sessions...</p>
                    ) : sessions.length === 0 ? (
                        <p className="text-center w-full">No sessions booked yet.</p>
                    ) : (
                        sessions.map((session) => (
                            <div key={session.id} className="booking-card">
                                <div className="card-top">
                                    <div className="counsellor-info">
                                        <div className="avatar-placeholder">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">{getCounsellorName(session.counsellorId)}</h3>
                                            <p className="session-type">IT Career Counselling</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="info-item">
                                        <Calendar size={18} className="text-accent" />
                                        <span>{session.sessionDate}</span>
                                    </div>
                                    <div className="info-item">
                                        <Clock size={18} className="text-accent" />
                                        <span>{session.timeSlot}</span>
                                    </div>
                                </div>

                                <div className="card-footer-booking">
                                    <div className="status-badges">
                                        <span className={`badge-status ${session.status?.toLowerCase() || 'booked'}`}>
                                            {session.status || 'BOOKED'}
                                        </span>
                                        <span className={`badge-payment ${session.paymentStatus?.toLowerCase() || (session.isFree ? 'free' : 'pending')}`}>
                                            <Tag size={14} />
                                            {session.paymentStatus || (session.isFree ? 'FREE' : 'PENDING')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;

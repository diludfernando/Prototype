import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LineChart, BookOpen, ChevronRight, Target, Compass, LogOut, User } from 'lucide-react';
import './UserServices.css';

const UserServices = () => {
    const navigate = useNavigate();

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        // Use capture phase to ensure it runs reliably
        document.addEventListener('click', handleClickOutside, true);
        return () => document.removeEventListener('click', handleClickOutside, true);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const services = [
        {
            id: 'assessment',
            title: 'Skill Assessment',
            description: 'Test your knowledge across various technologies and track your progress.',
            icon: <GraduationCap size={40} className="service-icon" />,
            path: '/assessment',
            label: 'Start Quiz'
        },
        {
            id: 'progress-dashboard',
            title: 'Progress Dashboard',
            description: 'View your readiness score, leaderboard rank, job recommendations, and skill gaps in one place.',
            icon: <LineChart size={40} className="service-icon" />,
            path: '/progress-dashboard',
            label: 'View Dashboard'
        },
        {
            id: 'elearning',
            title: 'E-learning Materials',
            description: 'Access a curated collection of learning resources and tutorials.',
            icon: <BookOpen size={40} className="service-icon" />,
            path: '/learning-resources',
            label: 'Start Learning'
        },
        {
            id: 'counselling',
            title: 'Counselling',
            description: 'Get personalized guidance to navigate your career journey.',
            icon: <Compass size={40} className="service-icon" />,
            path: '/counselling',
            label: 'Start Counselling'
        },
        {
            id: 'Skill Gap Analizys',
            title: 'Skill Gap Analysis',
            description: 'Check the real gap between your skills and your dream job',
            icon: <Target size={40} className="service-icon" />,
            path: '/skill-gap-analysis',
            label: 'Start'
        }
    ];

    const email = localStorage.getItem('username') || 'User';
    const displayName = email.includes('@') ? email.split('@')[0] : email;
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    return (
        <div className="services-page animate-fade-in">
            <div className="container">
                <header className="services-header">
                    <div className="header-top-actions">
                        <div className="new-profile-menu-wrapper" ref={dropdownRef}>
                            <div 
                                className="profile-trigger-container"
                                onClick={() => setShowDropdown(!showDropdown)}
                            >
                                <span className="profile-greeting">Hi, {formattedName}</span>
                                <button 
                                    className={`new-profile-avatar-btn ${showDropdown ? 'active' : ''}`}
                                    aria-label="Profile Menu"
                                >
                                    <User size={24} />
                                </button>
                            </div>

                            {showDropdown && (
                                <div className="new-profile-dropdown">
                                    <div className="new-dropdown-header">
                                        <p>My Account</p>
                                    </div>
                                    <div className="new-dropdown-body">
                                        <button 
                                            className="new-dropdown-btn"
                                            onClick={() => navigate('/view-profile')}
                                        >
                                            <User size={18} />
                                            <span>View Profile</span>
                                        </button>
                                        <button 
                                            className="new-dropdown-btn logout"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <h1 className="text-4xl font-bold">Your Learning Hub</h1>
                        <p className="text-lg text-muted">Select a service to bootstrap your career growth.</p>
                    </div>
                </header>

                <div className="services-grid">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="service-card"
                            onClick={() => navigate(service.path)}
                        >
                            <div className="card-content">
                                <div className="icon-wrapper">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold">{service.title}</h3>
                                <p className="service-description">{service.description}</p>
                            </div>

                            <div className="card-footer">
                                <span className="footer-label">{service.label}</span>
                                <ChevronRight size={18} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserServices;

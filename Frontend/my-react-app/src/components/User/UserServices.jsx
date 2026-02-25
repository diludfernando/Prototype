import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, BookOpen, ChevronRight, BookAlert, Compass, LogOut, User } from 'lucide-react';
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
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
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
            id: 'jobs',
            title: 'Available Jobs',
            description: 'Find career opportunities tailored to your skills and preferences.',
            icon: <Briefcase size={40} className="service-icon" />,
            path: '/jobs',
            label: 'Explore Jobs'
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
        }
    ];

    return (
        <div className="services-page animate-fade-in">
            <div className="container">
                <header className="services-header">
                    <div className="header-top-actions">
                        <div
                            className={`profile-header-section ${showDropdown ? 'active' : ''}`}
                            ref={dropdownRef}
                            onClick={toggleDropdown}
                        >
                            <div className="profile-icon-container">
                                <User size={24} className="profile-icon-placeholder" />
                            </div>

                            {showDropdown && (
                                <div className="profile-dropdown-menu animate-slide-up">
                                    <button
                                        className="dropdown-item"
                                        onClick={() => navigate('/view-profile')}
                                    >
                                        <User size={16} />
                                        <span>View Profile</span>
                                    </button>
                                    <div className="dropdown-divider"></div>
                                    <button
                                        className="dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
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

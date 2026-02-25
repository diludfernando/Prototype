import React, { useState } from 'react';
import {
    GraduationCap,
    BookOpen,
    CheckCircle,
    Clock,
    Target,
    TrendingUp
} from 'lucide-react';
import './MyCourses.css';

const MyCourses = () => {
    const [activeTab, setActiveTab] = useState('All Courses');

    const stats = [
        { id: 1, label: 'Total Enrolled', value: '0', icon: <GraduationCap size={24} /> },
        { id: 2, label: 'In Progress', value: '0', icon: <BookOpen size={24} /> },
        { id: 3, label: 'Completed', value: '0', icon: <CheckCircle size={24} /> },
        { id: 4, label: 'Learning Hours', value: '0h', icon: <Clock size={24} /> },
        { id: 5, label: 'Avg Progress', value: '0%', icon: <Target size={24} /> },
        { id: 6, label: 'Completion Rate', value: '0%', icon: <TrendingUp size={24} /> }
    ];

    const tabs = ['All Courses', 'In Progress', 'Completed'];

    return (
        <div className="my-courses-dashboard">
            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map(stat => (
                    <div key={stat.id} className="stat-card">
                        <div className="stat-icon-wrapper">
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sub-Tabs Navigation */}
            <div className="dashboard-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area - Empty State for now */}
            <div className="courses-empty-state">
                <div className="empty-icon-large">
                    <GraduationCap size={80} strokeWidth={1} />
                </div>
                <h3 className="empty-title">No enrolled courses</h3>
                <p className="empty-text">
                    Start learning by enrolling in courses from the Learning Resources page
                </p>
            </div>
        </div>
    );
};

export default MyCourses;

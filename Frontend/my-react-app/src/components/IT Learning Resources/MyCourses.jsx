import React, { useState, useEffect } from 'react';
import {
    GraduationCap,
    BookOpen,
    CheckCircle,
    Clock,
    Target,
    TrendingUp,
    Loader2
} from 'lucide-react';
import './MyCourses.css';

const MyCourses = () => {
    const [activeTab, setActiveTab] = useState('All Courses');
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mock userId for prototype - in a real app this would come from auth context
    const userId = 1;

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8084/api/enrollments/user/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch enrollments');
                const data = await response.json();

                // For each enrollment, fetch the course details
                const enrichedEnrollments = await Promise.all(data.map(async (enrollment) => {
                    const courseRes = await fetch(`http://localhost:8084/api/courses/${enrollment.courseId}`);
                    const courseData = await courseRes.json();
                    return { ...enrollment, course: courseData };
                }));

                setEnrollments(enrichedEnrollments);
            } catch (err) {
                console.error('Error fetching enrollments:', err);
                setError('Failed to load your courses.');
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [userId]);

    const stats = [
        { id: 1, label: 'Total Enrolled', value: enrollments.length.toString(), icon: <GraduationCap size={24} /> },
        { id: 2, label: 'In Progress', value: enrollments.filter(e => e.completed === 0).length.toString(), icon: <BookOpen size={24} /> },
        { id: 3, label: 'Completed', value: enrollments.filter(e => e.completed === 1).length.toString(), icon: <CheckCircle size={24} /> },
        { id: 4, label: 'Learning Hours', value: '12h', icon: <Clock size={24} /> }, // Placeholder
        { id: 5, label: 'Avg Progress', value: enrollments.length > 0 ? `${Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length)}%` : '0%', icon: <Target size={24} /> },
        { id: 6, label: 'Completion Rate', value: enrollments.length > 0 ? `${Math.round((enrollments.filter(e => e.completed === 1).length / enrollments.length) * 100)}%` : '0%', icon: <TrendingUp size={24} /> }
    ];

    const tabs = ['All Courses', 'In Progress', 'Completed'];

    const filteredEnrollments = enrollments.filter(e => {
        if (activeTab === 'In Progress') return e.completed === 0;
        if (activeTab === 'Completed') return e.completed === 1;
        return true;
    });

    if (loading) return <div className="loading-state"><Loader2 className="animate-spin" size={48} /><p>Loading your learning journey...</p></div>;

    return (
        <div className="my-courses-dashboard">
            <div className="stats-grid">
                {stats.map(stat => (
                    <div key={stat.id} className="stat-card">
                        <div className="stat-icon-wrapper">{stat.icon}</div>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

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

            <div className="courses-container">
                {filteredEnrollments.length > 0 ? (
                    <div className="enrolled-grid">
                        {filteredEnrollments.map(e => (
                            <div key={e.enrollmentId} className="enrolled-card">
                                <h3>{e.course?.title}</h3>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${e.progress}%` }}></div>
                                </div>
                                <span>{e.progress}% Complete</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="courses-empty-state">
                        <div className="empty-icon-large"><GraduationCap size={80} strokeWidth={1} /></div>
                        <h3 className="empty-title">No courses found</h3>
                        <p className="empty-text">Start learning by enrolling in courses from the Learning Resources page</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;

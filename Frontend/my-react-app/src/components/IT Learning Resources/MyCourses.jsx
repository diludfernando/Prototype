import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    GraduationCap, BookOpen, CheckCircle, Clock,
    Target, TrendingUp, Loader2, Trophy, Link2,
    Flag, ExternalLink, Star, Award, ChevronRight
} from 'lucide-react';
import './MyCourses.css';
import { getCourseImage } from '../../utils/courseImage';

const MILESTONES = [
    { value: 0,   label: 'Not Started', icon: '🎯', color: '#94a3b8' },
    { value: 25,  label: '25% Done',    icon: '📖', color: '#f59e0b' },
    { value: 50,  label: '50% Done',    icon: '⚡', color: '#3b82f6' },
    { value: 75,  label: '75% Done',    icon: '🔥', color: '#f97316' },
    { value: 100, label: 'Completed',   icon: '🏆', color: '#10b981' },
];

const getMilestone = (progress) =>
    MILESTONES.find(m => m.value === progress) || MILESTONES[0];

const MyCourses = () => {
    const [activeTab, setActiveTab] = useState('All Courses');
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [learningHours, setLearningHours] = useState(0);

    const userId = 1;

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8084/api/enrollments/user/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch enrollments');
                const data = await response.json();

                const enrichedEnrollments = await Promise.all(data.map(async (enrollment) => {
                    try {
                        const courseRes = await fetch(`http://localhost:8084/api/courses/${enrollment.courseId}`);
                        if (!courseRes.ok) return null;
                        const courseData = await courseRes.json();
                        return { ...enrollment, course: courseData };
                    } catch {
                        return null;
                    }
                }));

                const validEnrollments = enrichedEnrollments.filter(e => e !== null);
                setEnrollments(validEnrollments);

                // Calculate learning hours from lesson durations × progress
                let totalMinutes = 0;
                for (const enrollment of validEnrollments) {
                    try {
                        const lessonsRes = await fetch(`http://localhost:8084/api/lessons/course/${enrollment.courseId}`);
                        if (lessonsRes.ok) {
                            const lessons = await lessonsRes.json();
                            const totalCourseDuration = lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
                            totalMinutes += (totalCourseDuration * enrollment.progress) / 100;
                        }
                    } catch { /* skip */ }
                }
                setLearningHours(Math.round(totalMinutes / 60 * 10) / 10);
            } catch (err) {
                console.error('Error fetching enrollments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [userId]);

    const stats = [
        {
            id: 1, label: 'Total Enrolled', value: enrollments.length.toString(),
            icon: <GraduationCap size={18} />,
            iconBg: 'rgba(14,165,233,0.1)', iconColor: 'var(--color-accent)',
            sub: 'courses tracked'
        },
        {
            id: 2, label: 'In Progress', value: enrollments.filter(e => e.progress > 0 && e.completed !== 1 && e.progress !== 100).length.toString(),
            icon: <BookOpen size={18} />,
            iconBg: 'rgba(245,158,11,0.1)', iconColor: '#F59E0B',
            sub: 'actively learning'
        },
        {
            id: 3, label: 'Completed', value: enrollments.filter(e => e.completed === 1 || e.progress === 100).length.toString(),
            icon: <CheckCircle size={18} />,
            iconBg: 'rgba(16,185,129,0.1)', iconColor: '#10B981',
            sub: 'courses finished'
        },
        {
            id: 4, label: 'Learning Hours', value: learningHours > 0 ? `${learningHours}h` : '0h',
            icon: <Clock size={18} />,
            iconBg: 'rgba(14,165,233,0.08)', iconColor: 'var(--color-accent)',
            sub: 'estimated time'
        },
        {
            id: 5, label: 'Avg Progress', value: enrollments.length > 0 ? `${Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrollments.length)}%` : '0%',
            icon: <Target size={18} />,
            iconBg: 'rgba(14,165,233,0.05)', iconColor: 'var(--color-accent-hover)',
            sub: 'across all courses'
        },
        {
            id: 6, label: 'Completion Rate', value: enrollments.length > 0 ? `${Math.round((enrollments.filter(e => e.completed === 1 || e.progress === 100).length / enrollments.length) * 100)}%` : '0%',
            icon: <TrendingUp size={18} />,
            iconBg: 'rgba(16,185,129,0.1)', iconColor: '#059669',
            sub: 'of enrolled courses'
        },
    ];

    const tabs = ['All Courses', 'In Progress', 'Completed'];

    const filteredEnrollments = enrollments.filter(e => {
        const isCompleted = e.completed === 1 || e.progress === 100;
        const isInProgress = e.progress > 0 && !isCompleted;
        if (activeTab === 'In Progress') return isInProgress;
        if (activeTab === 'Completed') return isCompleted;
        return true;
    });

    if (loading) return (
        <div className="loading-state">
            <Loader2 className="animate-spin" size={48} />
            <p>Loading your learning journey...</p>
        </div>
    );

    return (
        <div className="my-courses-dashboard">
            {/* Overview section */}
            <div className="overview-section">
                <div className="overview-heading">
                    <h2 className="mc-section-title">Learning <span className="mc-title-accent">Overview</span></h2>
                    <p className="overview-sub">Track your enrolled courses, progress, and completion insights.</p>
                </div>
                <div className="stats-grid">
                    {stats.map(stat => (
                        <div key={stat.id} className="stat-card">
                            <div className="stat-icon-wrapper" style={{ background: stat.iconBg, color: stat.iconColor }}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                                {stat.sub && <span className="stat-sub">{stat.sub}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`dashboard-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                        <span className="tab-count">
                            {tab === 'All Courses' ? enrollments.length
                                : tab === 'In Progress' ? enrollments.filter(e => e.progress > 0 && !(e.completed === 1 || e.progress === 100)).length
                                : enrollments.filter(e => e.completed === 1 || e.progress === 100).length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="courses-container">
                {filteredEnrollments.length > 0 ? (
                    <div className="enrolled-grid">
                        {filteredEnrollments.map(e => {
                            const progress = e.progress ?? 0;
                            const isCompleted = e.completed === 1 || progress === 100;
                            const milestone = getMilestone(progress);
                            const hasCert = !!e.certificateUrl;

                            const skills = e.course?.skillsCovered?.split(',').map(s => s.trim()).filter(Boolean) || [];
                            const providerInitials = e.course?.provider?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                            return (
                                <div key={e.enrollmentId} className={`ec-card ${isCompleted ? 'ec-completed' : ''}`}>
                                    {/* Image */}
                                    <Link to={`/learning-resources/${e.courseId}`} className="ec-image-wrap">
                                        <img src={getCourseImage(e.course?.category, e.course?.id)} alt={e.course?.title} className="ec-image" />

                                        {/* Top badges */}
                                        <div className="ec-badges-top">
                                            <span className="ec-category-badge">{e.course?.category}</span>
                                            <span className="ec-milestone-badge" style={{ background: milestone.color }}>
                                                {milestone.icon}
                                            </span>
                                        </div>

                                        {/* Progress strip */}
                                        <div className="ec-progress-strip">
                                            <div className="ec-progress-fill" style={{ width: `${progress}%`, background: milestone.color }} />
                                        </div>
                                    </Link>

                                    {/* Body */}
                                    <div className="ec-body">
                                        {/* Provider row */}
                                        <div className="ec-provider-row">
                                            <span className="ec-provider-avatar">{providerInitials}</span>
                                            <span className="ec-provider-name">{e.course?.provider}</span>
                                            <span className={`ec-level-badge ${e.course?.difficultyLevel?.toLowerCase()}`}>
                                                <Award size={11} />{e.course?.difficultyLevel}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <Link to={`/learning-resources/${e.courseId}`} className="ec-title-link">
                                            <h3 className="ec-title">{e.course?.title}</h3>
                                        </Link>

                                        {/* Skills */}
                                        <div className="ec-skills">
                                            {skills.slice(0, 3).map((s, i) => (
                                                <span key={i} className="ec-skill-tag">{s}</span>
                                            ))}
                                            {skills.length > 3 && <span className="ec-skill-more">+{skills.length - 3}</span>}
                                        </div>

                                        {/* Meta row */}
                                        <div className="ec-meta-row">
                                            <span className="ec-meta-item" style={{ color: milestone.color }}>
                                                {milestone.icon} {milestone.label}
                                            </span>
                                            {hasCert && (
                                                <a href={e.certificateUrl} target="_blank" rel="noopener noreferrer" className="ec-cert-link">
                                                    <Trophy size={12} /> Certified
                                                </a>
                                            )}
                                            {e.enrollmentType === 'Purchased Externally' && (
<<<<<<< HEAD
                                                <span className="ec-purchased-badge">
                                                    {e.verificationStatus === 'PENDING' ? '⏳ Pending Approval' :
                                                     e.verificationStatus === 'REJECTED' ? '❌ Rejected' : '💳 Purchased'}
                                                </span>
=======
                                                <span className="ec-purchased-badge">💳 Purchased</span>
>>>>>>> 7c6a26328449520cc6c2dec12723b27a760eebec
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="ec-footer">
                                        <span className="ec-progress-pct">{progress}% done</span>
                                        <div className="ec-footer-actions">
                                            {e.course?.url && (
                                                <a href={e.course.url} target="_blank" rel="noopener noreferrer" className="ec-ext-btn" title={`Go to ${e.course.provider}`}>
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            <Link to={`/learning-resources/${e.courseId}`} className="ec-cta">
                                                {isCompleted ? <><CheckCircle size={14} /> View Course</> : <><Flag size={14} /> Continue</>}
                                                <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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

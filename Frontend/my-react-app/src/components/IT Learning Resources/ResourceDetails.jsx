import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, Star, Clock, Award, Globe, ExternalLink,
    Heart, Share2, CheckCircle, XCircle, MessageSquare, StickyNote,
    Loader2, ChevronDown, ChevronUp, BookOpen, Target,
    Link2, Trophy, Flag
} from 'lucide-react';
import './ResourceDetails.css';
import { getCourseImage } from '../../utils/courseImage';

const MILESTONES = [
    { value: 0,   label: 'Not Started',  icon: '🎯' },
    { value: 25,  label: '25% Done',     icon: '📖' },
    { value: 50,  label: '50% Done',     icon: '⚡' },
    { value: 75,  label: '75% Done',     icon: '🔥' },
    { value: 100, label: 'Completed',    icon: '🏆' },
];

const ResourceDetails = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, reviewText: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [lessons, setLessons] = useState([]);
    const [curriculumOpen, setCurriculumOpen] = useState(true);
    const [certUrl, setCertUrl] = useState('');
    const [certUrlState, setCertUrlState] = useState(null); // null | 'valid' | 'invalid'
    const [certUrlError, setCertUrlError] = useState('');
    const [showCertModal, setShowCertModal] = useState(false);
    const [showMilestoneConfirm, setShowMilestoneConfirm] = useState(null);
    const [updatingProgress, setUpdatingProgress] = useState(false);
    const [showPurchaseForm, setShowPurchaseForm] = useState(false);
    const [purchaseData, setPurchaseData] = useState({ purchaseProofUrl: '', orderId: '' });
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const userId = 1;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const courseRes = await fetch(`http://localhost:8084/api/courses/${id}`);
                if (!courseRes.ok) throw new Error('Course not found');
                setCourse(await courseRes.json());

                const enrollRes = await fetch(`http://localhost:8084/api/enrollments/user/${userId}`);
                const enrollData = await enrollRes.json();
                const enrollment = enrollData.find(e => e.courseId === parseInt(id));
                setIsEnrolled(!!enrollment);
                setEnrollmentData(enrollment || null);
                if (enrollment?.certificateUrl) setCertUrl(enrollment.certificateUrl);

                const notesRes = await fetch(`http://localhost:8084/api/notes/user/${userId}/course/${id}`);
                setNotes(notesRes.ok ? await notesRes.json() : []);

                const reviewsRes = await fetch(`http://localhost:8084/api/reviews/course/${id}`);
                setReviews(reviewsRes.ok ? await reviewsRes.json() : []);

                const favRes = await fetch(`http://localhost:8084/api/favorites/user/${userId}`);
                const favData = await favRes.json();
                const fav = favData.find(f => f.courseId === parseInt(id));
                if (fav) { setIsFavorite(true); setFavoriteId(fav.favoriteId); }

                const lessonsRes = await fetch(`http://localhost:8084/api/lessons/course/${id}`);
                if (lessonsRes.ok) setLessons(await lessonsRes.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const doEnroll = async () => {
        try {
            const res = await fetch('http://localhost:8084/api/enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: parseInt(id), userId, progress: 0, completed: 0 })
            });
            if (res.ok) {
                const enrollment = await res.json();
                setIsEnrolled(true);
                setEnrollmentData(enrollment);
            }
        } catch (err) { console.error(err); }
    };

    const handleEnroll = () => {
        if (course.price > 0) {
            if (course.url) window.open(course.url, '_blank', 'noopener,noreferrer');
            return;
        }
        setShowEnrollModal(true);
    };

    const confirmEnroll = async () => {
        setShowEnrollModal(false);
        await doEnroll();
        showToastMsg('Enrolled! Start tracking your progress.');
    };

    const handlePurchaseSubmit = async (e) => {
        e.preventDefault();

        // Validate certificate URL using existing validateCertUrl logic
        const validation = validateCertUrl(purchaseData.purchaseProofUrl.trim());
        if (!validation.valid) {
            showToastMsg(`⚠️ ${validation.msg}`);
            return;
        }

        try {
            const res = await fetch('http://localhost:8084/api/enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: parseInt(id),
                    userId,
                    progress: 0,
                    completed: 0,
                    enrollmentType: 'Purchased Externally',
                    purchaseProofUrl: purchaseData.purchaseProofUrl.trim(),
                    orderId: null
                })
            });
            if (res.ok) {
                const enrollment = await res.json();
                setIsEnrolled(true);
                setEnrollmentData(enrollment);
                setShowPurchaseForm(false);
                setPurchaseData({ purchaseProofUrl: '', orderId: '' });
                showToastMsg('Purchase submitted! Awaiting admin approval before you can track progress.');
            } else {
                const errText = await res.text();
                showToastMsg(`⚠️ ${errText}`);
            }
        } catch (err) { console.error(err); }
    };

    const handleMilestone = (milestoneValue) => {
        if (!enrollmentData || updatingProgress) return;
        if (milestoneValue <= (enrollmentData.progress || 0)) return;
        setShowMilestoneConfirm(milestoneValue);
    };

    const confirmMilestone = async () => {
        const milestoneValue = showMilestoneConfirm;
        setShowMilestoneConfirm(null);
        if (!milestoneValue) return;
        setUpdatingProgress(true);
        try {
            const isCompleted = milestoneValue === 100 ? 1 : 0;
            const updated = {
                enrollmentId: enrollmentData.enrollmentId,
                courseId: enrollmentData.courseId,
                userId: enrollmentData.userId,
                progress: milestoneValue,
                completed: isCompleted,
                completedDate: enrollmentData.completedDate || null,
                certificateUrl: enrollmentData.certificateUrl || null
            };
            const res = await fetch(`http://localhost:8084/api/enrollments/${enrollmentData.enrollmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            });
            if (res.ok) {
                const saved = await res.json();
                setEnrollmentData(saved);
                if (milestoneValue === 100) setShowCertModal(true);
                showToastMsg(`Progress updated to ${milestoneValue}%!`);
            } else {
                showToastMsg('Failed to update progress. Try again.');
            }
        } catch (err) { console.error(err); }
        setUpdatingProgress(false);
    };

    const validateCertUrl = (url) => {
        const knownPlatforms = [
            { domain: 'coursera.org',    patterns: ['/verify/', '/certificate/'] },
            { domain: 'udemy.com',       patterns: ['/certificate/'] },
            { domain: 'linkedin.com',    patterns: ['/learning/certificates/', '/in/'] },
            { domain: 'edx.org',         patterns: ['/certificates/'] },
            { domain: 'freecodecamp.org',patterns: ['/certification/'] },
            { domain: 'credential.net',  patterns: ['/'] },
            { domain: 'credly.com',      patterns: ['/badges/'] },
        ];
        try {
            const u = new URL(url);
            const match = knownPlatforms.find(p => u.hostname.includes(p.domain));
            if (!match) return { valid: false, msg: 'URL must be from a recognized platform (Coursera, Udemy, LinkedIn, edX, freeCodeCamp, Credly, etc.)' };
            const hasPath = match.patterns.some(p => u.pathname.includes(p));
            if (!hasPath) return { valid: false, msg: `Invalid ${match.domain} certificate URL format.` };
            return { valid: true };
        } catch {
            return { valid: false, msg: 'Please enter a valid URL.' };
        }
    };

    const handleCertUrlChange = (e) => {
        const val = e.target.value;
        setCertUrl(val);
        if (!val.trim()) {
            setCertUrlState(null);
            setCertUrlError('');
            return;
        }
        const result = validateCertUrl(val.trim());
        if (result.valid) {
            setCertUrlState('valid');
            setCertUrlError('');
        } else {
            setCertUrlState('invalid');
            setCertUrlError(result.msg);
        }
    };

    const handleCertSubmit = async (e) => {
        e.preventDefault();
        if (!certUrl.trim()) return;

        const validation = validateCertUrl(certUrl.trim());
        if (!validation.valid) {
            showToastMsg(`⚠️ ${validation.msg}`);
            return;
        }

        try {
            const payload = {
                enrollmentId: enrollmentData.enrollmentId,
                courseId: enrollmentData.courseId,
                userId: enrollmentData.userId,
                progress: enrollmentData.progress,
                completed: enrollmentData.completed,
                completedDate: enrollmentData.completedDate || null,
                certificateUrl: certUrl.trim()
            };
            const res = await fetch(`http://localhost:8084/api/enrollments/${enrollmentData.enrollmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const saved = await res.json();
                setEnrollmentData(saved);
                setShowCertModal(false);
                showToastMsg('Certificate submitted! Updating your skills...');

                // Auto-update user skills from course skillsCovered
                if (course?.skillsCovered) {
                    const proficiency = course.difficultyLevel === 'Advanced' ? 'Advanced'
                        : course.difficultyLevel === 'Intermediate' ? 'Intermediate' : 'Beginner';

                    const skills = course.skillsCovered.split(',').map(s => s.trim()).filter(Boolean);

                    // Fetch existing skills to avoid duplicates
                    const existingRes = await fetch(`http://localhost:8084/api/skills/user/${userId}`);
                    const existingSkills = existingRes.ok ? await existingRes.json() : [];

                    for (const skillName of skills) {
                        const existing = existingSkills.find(
                            s => s.skillName?.toLowerCase() === skillName.toLowerCase()
                        );
                        if (!existing) {
                            await fetch('http://localhost:8084/api/skills', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId,
                                    skillName,
                                    proficiencyLevel: proficiency,
                                    acquiredFromCourseId: parseInt(id)
                                })
                            });
                        }
                    }
                    showToastMsg('Certificate verified! Skills updated in your profile.');
                }
            }
        } catch (err) { console.error(err); }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            const res = await fetch('http://localhost:8084/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: parseInt(id), userId, noteText: newNote })
            });
            if (res.ok) {
                setNotes([...notes, await res.json()]);
                setNewNote('');
                setShowNoteModal(false);
                showToastMsg('Note saved!');
            }
        } catch (err) { console.error(err); }
    };

    const handleToggleFavorite = async () => {
        try {
            if (isFavorite) {
                await fetch(`http://localhost:8084/api/favorites/${favoriteId}`, { method: 'DELETE' });
                setIsFavorite(false); setFavoriteId(null);
            } else {
                const res = await fetch('http://localhost:8084/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseId: parseInt(id), userId })
                });
                if (res.ok) { const f = await res.json(); setIsFavorite(true); setFavoriteId(f.favoriteId); }
            }
        } catch (err) { console.error(err); }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showToastMsg('Course link copied to clipboard!');
        } catch { showToastMsg('Failed to copy link'); }
    };

    const handleAddReview = async () => {
        if (!newReview.reviewText.trim()) return;
        try {
            const res = await fetch('http://localhost:8084/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: parseInt(id), userId, ...newReview })
            });
            if (res.ok) {
                setReviews([...reviews, await res.json()]);
                setNewReview({ rating: 5, reviewText: '' });
                setShowReviewForm(false);
                setShowReviewModal(false);
                showToastMsg('Review submitted!');
            }
        } catch (err) { console.error(err); }
    };

    const showToastMsg = (msg) => {
        setToastMessage(msg); setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    if (loading) return <div className="loading-container"><Loader2 className="animate-spin" size={48} /><p>Loading course details...</p></div>;
    if (error) return <div className="error-container"><h2>Error</h2><p>{error}</p><Link to="/learning-resources" className="btn-back">Go Back</Link></div>;

    const totalMinutes = lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;
    const durationLabel = totalHours > 0 ? `${totalHours}h ${remainingMins}m` : totalMinutes > 0 ? `${totalMinutes}m` : null;
    const progress = enrollmentData?.progress || 0;
    const isCourseCompleted = progress === 100 || enrollmentData?.completed === 1;
    const currentMilestoneIdx = MILESTONES.findIndex(m => m.value === progress);

    return (
        <div className="resource-details-page">
            {showToast && (
                <div className="toast-notification">
                    <CheckCircle size={20} /><span>{toastMessage}</span>
                </div>
            )}

            {/* Milestone Confirm Modal */}
            {showMilestoneConfirm !== null && (
                <div className="modal-overlay" onClick={() => setShowMilestoneConfirm(null)}>
                    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-title-icon" style={{ background: '#F0FDF4' }}>
                                    <span style={{ fontSize: '1.4rem' }}>{MILESTONES.find(m => m.value === showMilestoneConfirm)?.icon}</span>
                                </div>
                                <div>
                                    <div className="modal-title">Update Progress</div>
                                    <div className="modal-subtitle">{course?.title}</div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowMilestoneConfirm(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-helper">
                                Mark your progress as <strong>{MILESTONES.find(m => m.value === showMilestoneConfirm)?.label}</strong>? This will update your learning tracker to <strong>{showMilestoneConfirm}%</strong>.
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={confirmMilestone} disabled={updatingProgress}>
                                {updatingProgress ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                                &nbsp;Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Certificate Modal */}
            {showCertModal && (
                <div className="modal-overlay" onClick={() => setShowCertModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-title-icon" style={{ background: '#FFFBEB' }}>
                                    <Trophy size={22} color="#D97706" />
                                </div>
                                <div>
                                    <div className="modal-title">Submit Certificate</div>
                                    <div className="modal-subtitle">{course?.title}</div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => { setShowCertModal(false); setCertUrlState(null); setCertUrlError(''); }}>✕</button>
                        </div>
                        <form onSubmit={handleCertSubmit}>
                            <div className="modal-body">
                                <div className="modal-helper">
                                    Paste your certificate URL from <strong>{course?.provider}</strong> to verify completion and auto-update your skills profile.
                                </div>
                                <div>
                                    <label className="modal-label">Certificate URL <span className="required-mark">*</span></label>
                                    <input
                                        className={`modal-input${certUrlState === 'valid' ? ' input-valid' : certUrlState === 'invalid' ? ' input-invalid' : ''}`}
                                        type="url"
                                        placeholder="https://coursera.org/verify/... or udemy.com/certificate/..."
                                        value={certUrl}
                                        onChange={handleCertUrlChange}
                                        autoFocus
                                    />
                                    {certUrlState === 'valid' && (
                                        <p className="input-success-msg">✓ Valid certificate URL</p>
                                    )}
                                    {certUrlState === 'invalid' && (
                                        <p className="input-error-msg">✕ {certUrlError}</p>
                                    )}
                                    <div className="platform-pills">
                                        {['Coursera', 'Udemy', 'LinkedIn', 'edX', 'freeCodeCamp', 'Credly'].map(p => (
                                            <span key={p} className="platform-pill">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn-primary" disabled={!certUrl.trim() || certUrlState === 'invalid'}>
                                    <Trophy size={15} />&nbsp;Submit &amp; Update Skills
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Purchase Proof Modal */}
            {showPurchaseForm && (
                <div className="modal-overlay" onClick={() => setShowPurchaseForm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-title-icon" style={{ background: '#EFF6FF' }}>
                                    <CheckCircle size={22} color="#0EA5E9" />
                                </div>
                                <div>
                                    <div className="modal-title">Confirm Purchase</div>
                                    <div className="modal-subtitle">{course.title}</div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowPurchaseForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handlePurchaseSubmit}>
                            <div className="modal-body">
                                <div className="modal-helper">
                                    You completed this course on <strong>{course.provider}</strong>. Submit your certificate URL so the admin can verify and approve your enrollment.
                                </div>
                                <div>
                                    <label className="modal-label">Certificate URL <span className="required-mark">*</span></label>
                                    <input
                                        className="modal-input"
                                        type="url"
                                        placeholder="e.g. https://udemy.com/certificate/UC-XXXXXXXX"
                                        value={purchaseData.purchaseProofUrl}
                                        onChange={e => setPurchaseData({ ...purchaseData, purchaseProofUrl: e.target.value })}
                                        required
                                    />
                                    <p className="modal-meta">Found in your course completion email or on the platform's certificate page</p>
                                    <div className="platform-pills" style={{ marginTop: '0.5rem' }}>
                                        {['Udemy', 'Coursera', 'LinkedIn', 'edX', 'freeCodeCamp', 'Credly'].map(p => (
                                            <span key={p} className="platform-pill">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn-primary">
                                    <CheckCircle size={15} />&nbsp;Submit for Approval
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Enroll Confirmation Modal */}
            {showEnrollModal && (
                <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
                    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-title-icon" style={{ background: '#F0F9FF' }}>
                                    <span style={{ fontSize: '1.4rem' }}>🎓</span>
                                </div>
                                <div>
                                    <div className="modal-title">Enroll for Free</div>
                                    <div className="modal-subtitle">{course?.title}</div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowEnrollModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-helper">
                                You're enrolling in this free course on <strong>{course?.provider}</strong>. SkillBridge will track your progress and let you submit your certificate when done.
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={confirmEnroll}>
                                <CheckCircle size={15} />&nbsp;Enroll Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Note Modal */}
            {showNoteModal && (
                <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-title-icon" style={{ background: '#F0FDF4' }}>
                                    <StickyNote size={22} color="#16A34A" />
                                </div>
                                <div>
                                    <div className="modal-title">Add Study Note</div>
                                    <div className="modal-subtitle">{course?.title}</div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowNoteModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <label className="modal-label">Your Note</label>
                                <textarea
                                    className="modal-input modal-textarea"
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                    placeholder="Jot down key concepts, questions, or insights..."
                                    rows={4}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={handleAddNote} disabled={!newNote.trim()}>
                                <CheckCircle size={15} />&nbsp;Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Review Modal */}
            {showReviewModal && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <div className="modal-title-icon" style={{ background: '#FFFBEB' }}>
                                    <Star size={22} color="#F59E0B" fill="#F59E0B" />
                                </div>
                                <div>
                                    <div className="modal-title">Write a Review</div>
                                    <div className="modal-subtitle">{course?.title}</div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setShowReviewModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <label className="modal-label">Your Rating</label>
                                <div className="modal-star-row">
                                    {[1,2,3,4,5].map(star => (
                                        <Star
                                            key={star}
                                            size={28}
                                            fill={star <= newReview.rating ? '#F59E0B' : 'none'}
                                            color="#F59E0B"
                                            style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    ))}
                                    <span className="modal-rating-label">{newReview.rating}/5</span>
                                </div>
                            </div>
                            <div>
                                <label className="modal-label">Your Review</label>
                                <textarea
                                    className="modal-input modal-textarea"
                                    value={newReview.reviewText}
                                    onChange={e => setNewReview({ ...newReview, reviewText: e.target.value })}
                                    placeholder="Share what you learned, what was great, what could be better..."
                                    rows={4}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={handleAddReview} disabled={!newReview.reviewText.trim()}>
                                <Star size={15} />&nbsp;Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="container">
                <Link to="/learning-resources" className="back-link">
                    <ChevronLeft size={20} /> Back to Resources
                </Link>

                <div className="details-grid">
                    {/* ── Left Column ── */}
                    <div className="details-main">
                        <div className="resource-hero">
                            <img src={getCourseImage(course.category, course.id)} alt={course.title} className="hero-image" />
                            <div className="hero-badge-container">
                                <span className="category-badge">{course.category}</span>
                                {course.price === 0
                                    ? <span className="free-badge">FREE</span>
                                    : <span className="paid-badge">PAID</span>
                                }
                            </div>
                        </div>

                        {/* Course Info */}
                        <div className="content-card glass">
                            <h1 className="resource-title">{course.title}</h1>
                            <div className="provider-info">
                                <span className="provider-label">Offered by</span>
                                <span className="provider-name">{course.provider}</span>
                            </div>
                            <div className="skills-section">
                                <h3>What you'll learn</h3>
                                <div className="skills-grid">
                                    {course.skillsCovered?.split(',').map((skill, i) => (
                                        <div key={i} className="skill-item">
                                            <CheckCircle size={16} className="text-secondary" />
                                            <span>{skill.trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Progress Tracker — enrolled and approved only */}
                        {isEnrolled && 
                         enrollmentData?.verificationStatus !== 'PENDING' && 
                         enrollmentData?.verificationStatus !== 'REJECTED' && (
                            <div className="content-card glass milestone-section">
                                <div className="milestone-section-header">
                                    <div>
                                        <h3><Flag size={18} /> Learning Progress</h3>
                                        <p className="milestone-hint">
                                            Study on <strong>{course.provider}</strong> and tap a stage to update your progress.
                                        </p>
                                    </div>
                                    <div className="progress-ring-wrap">
                                        <svg viewBox="0 0 44 44" className="progress-ring">
                                            <circle cx="22" cy="22" r="18" className="ring-bg" />
                                            <circle cx="22" cy="22" r="18" className="ring-fill"
                                                strokeDasharray={`${(progress / 100) * 113} 113`} />
                                        </svg>
                                        <span className="ring-pct">{progress}%</span>
                                    </div>
                                </div>

                                {/* Horizontal stepper */}
                                <div className="stepper-track">
                                    {MILESTONES.map((m, idx) => {
                                        const isActive = progress === m.value;
                                        const isDone = progress > m.value;
                                        const isNext = MILESTONES[currentMilestoneIdx + 1]?.value === m.value;
                                        return (
                                            <React.Fragment key={m.value}>
                                                <div className={`stepper-node ${isActive ? 'active' : ''} ${isDone ? 'done' : ''} ${isNext ? 'next' : ''}`}>
                                                    <button
                                                        className="stepper-circle"
                                                        onClick={() => handleMilestone(m.value)}
                                                        disabled={isDone || isActive || updatingProgress}
                                                        title={isDone ? 'Already passed' : isActive ? 'Current stage' : `Mark as ${m.label}`}
                                                    >
                                                        {isDone ? <CheckCircle size={16} /> : <span>{m.icon}</span>}
                                                    </button>
                                                    <span className="stepper-label">{m.label}</span>
                                                </div>
                                                {idx < MILESTONES.length - 1 && (
                                                    <div className={`stepper-connector ${progress > m.value ? 'filled' : ''}`} />
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>

                                {/* Cert row */}
                                {isCourseCompleted && (
                                    <div className="cert-row">
                                        {enrollmentData?.certificateUrl ? (
                                            <div className="cert-submitted-row">
                                                <CheckCircle size={16} className="cert-check" />
                                                <span>Certificate verified</span>
                                                <a href={enrollmentData.certificateUrl} target="_blank" rel="noopener noreferrer" className="cert-view-link">
                                                    <Link2 size={13} /> View
                                                </a>
                                            </div>
                                        ) : (
                                            <button className="btn-submit-cert" onClick={() => setShowCertModal(true)}>
                                                <Trophy size={15} /> Submit Certificate URL
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Course Syllabus — always visible */}
                        {lessons.length > 0 && (
                            <div className="curriculum-section content-card glass">
                                <div className="curriculum-header" onClick={() => setCurriculumOpen(o => !o)}>
                                    <div>
                                        <h3><BookOpen size={18} /> Course Syllabus</h3>
                                        <span className="curriculum-meta">
                                            {lessons.length} topics{durationLabel ? ` · ${durationLabel} estimated` : ''}
                                        </span>
                                    </div>
                                    {curriculumOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                {curriculumOpen && (
                                    <div className="curriculum-list">
                                        {lessons.map((lesson, index) => (
                                            <div key={lesson.lessonId} className="curriculum-item">
                                                <div className="curriculum-item-left">
                                                    <span className="lesson-index">{index + 1}</span>
                                                    <span className="lesson-title-text">{lesson.title}</span>
                                                </div>
                                                {lesson.durationMinutes > 0 && (
                                                    <span className="lesson-dur">
                                                        <Clock size={12} /> {lesson.durationMinutes} min
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Study Notes — enrolled and approved only */}
                        {isEnrolled && 
                         enrollmentData?.verificationStatus !== 'PENDING' && 
                         enrollmentData?.verificationStatus !== 'REJECTED' && (
                            <div className="notes-section content-card glass">
                                <div className="notes-section-header">
                                    <h3><StickyNote size={20} /> My Study Notes</h3>
                                    <button className="btn-add-note" onClick={() => setShowNoteModal(true)}>
                                        + Add Note
                                    </button>
                                </div>
                                <div className="notes-list">
                                    {notes.length === 0 && (
                                        <div className="no-notes-state">
                                            <StickyNote size={32} strokeWidth={1} />
                                            <p>No notes yet. Add your first note while studying.</p>
                                        </div>
                                    )}
                                    {notes.map(note => (
                                        <div key={note.noteId} className="note-card">
                                            <p>{note.noteText}</p>
                                            <span className="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right Sidebar ── */}
                    <div className="sticky-sidebar">
                        <div className="info-card glass">
                            <div className="card-top">
                                <div className="rating-block">
                                    <div className="rating-value">
                                        <Star size={22} fill="#F59E0B" color="#F59E0B" />
                                        <span>{course.rating || 'N/A'}</span>
                                    </div>
                                    <span className="rating-count">({reviews.length} reviews)</span>
                                </div>
                                <div className="action-buttons">
                                    <button className={`icon-btn ${isFavorite ? 'active' : ''}`} onClick={handleToggleFavorite}>
                                        <Heart size={20} fill={isFavorite ? '#EF4444' : 'none'} color={isFavorite ? '#EF4444' : 'currentColor'} />
                                    </button>
                                    <button className="icon-btn" onClick={handleShare}><Share2 size={20} /></button>
                                </div>
                            </div>

                            <div className="meta-list">
                                <div className="meta-item">
                                    <Award size={20} />
                                    <div className="meta-info">
                                        <span className="meta-label">Difficulty</span>
                                        <span className={`meta-value ${course.difficultyLevel?.toLowerCase()}`}>{course.difficultyLevel}</span>
                                    </div>
                                </div>
                                <div className="meta-item">
                                    <Globe size={20} />
                                    <div className="meta-info">
                                        <span className="meta-label">Price</span>
                                        <span className="meta-value">{course.price > 0 ? `Rs. ${course.price}` : 'Free'}</span>
                                    </div>
                                </div>
                                {durationLabel && (
                                    <div className="meta-item">
                                        <Target size={20} />
                                        <div className="meta-info">
                                            <span className="meta-label">Duration</span>
                                            <span className="meta-value">{durationLabel} · {lessons.length} topics</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isEnrolled ? (
                                <>
                                    {enrollmentData?.verificationStatus === 'PENDING' && (
                                        <div className="enrollment-status-badge pending">
                                            <Clock size={16} />
                                            <span>Awaiting Admin Approval</span>
                                        </div>
                                    )}
                                    {enrollmentData?.verificationStatus === 'REJECTED' && (
                                        <div className="enrollment-status-badge rejected">
                                            <XCircle size={16} />
                                            <span>Purchase Rejected — Contact Support</span>
                                        </div>
                                    )}
                                    {(enrollmentData?.verificationStatus === 'APPROVED' || 
                                      (enrollmentData?.enrollmentType !== 'Purchased Externally' && enrollmentData?.verificationStatus !== 'REJECTED')) && (
                                        <>
                                            <div className="enrollment-status-badge">
                                                <CheckCircle size={16} />
                                                <span>{isCourseCompleted ? 'Course Completed!' : `Enrolled · ${progress}% Complete`}</span>
                                            </div>
                                            {course.url ? (
                                                <a href={course.url} target="_blank" rel="noopener noreferrer" className="btn-go-to-course">
                                                    <ExternalLink size={18} />
                                                    Continue on {course.provider}
                                                </a>
                                            ) : (
                                                <div className="no-link-notice">
                                                    No external link set for this course yet.
                                                </div>
                                            )}
                                            <p className="disclaimer">Update your progress milestones below as you learn on {course.provider}.</p>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {course.price > 0 ? (
                                        <>
                                            <a href={course.url} target="_blank" rel="noopener noreferrer" className="enroll-btn">
                                                <ExternalLink size={18} /> Go to {course.provider} — Rs. {course.price}
                                            </a>
                                            {!showPurchaseForm ? (
                                                <button className="btn-track-course" onClick={() => setShowPurchaseForm(true)}>
                                                    <CheckCircle size={16} /> I Already Purchased This
                                                </button>
                                            ) : null}
                                            <p className="disclaimer">Purchase on {course.provider} to learn. Track your progress here and submit your certificate when done.</p>
                                        </>
                                    ) : (
                                        <>
                                            <button className="enroll-btn" onClick={handleEnroll}>
                                                Enroll for Free <ExternalLink size={18} />
                                            </button>
                                            {course.url && (
                                                <a href={course.url} target="_blank" rel="noopener noreferrer" className="btn-preview-course w-full">
                                                    <Globe size={16} /> Preview on {course.provider}
                                                </a>
                                            )}
                                            <p className="disclaimer">Enroll to track your progress, take notes, and submit your certificate.</p>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Reviews — visible to all, write only for enrolled */}
                        <div className="reviews-card content-card glass">
                            <div className="reviews-header">
                                <h3><MessageSquare size={18} /> Student Reviews</h3>
                                <div className="reviews-header-right">
                                    <span className="reviews-count">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                                    {isEnrolled && (
                                        <button className="btn-add-review" onClick={() => setShowReviewModal(true)}>Write a Review</button>
                                    )}
                                    {!isEnrolled && (
                                        <span className="review-enroll-hint">Enroll to write a review</span>
                                    )}
                                </div>
                            </div>
                            {showReviewForm && (
                                <div className="review-form">
                                    <div className="rating-input">
                                        <label>Your Rating:</label>
                                        <div className="star-rating">
                                            {[1,2,3,4,5].map(star => (
                                                <Star key={star} size={22} fill={star <= newReview.rating ? "#F59E0B" : "none"} color="#F59E0B" style={{ cursor: 'pointer' }} onClick={() => setNewReview({ ...newReview, rating: star })} />
                                            ))}
                                        </div>
                                    </div>
                                    <textarea value={newReview.reviewText} onChange={e => setNewReview({ ...newReview, reviewText: e.target.value })} placeholder="Share your experience with this course..." rows="4" />
                                    <div className="review-form-actions">
                                        <button className="btn-cancel" onClick={() => { setShowReviewForm(false); setNewReview({ rating: 5, reviewText: '' }); }}>Cancel</button>
                                        <button className="btn-submit" onClick={handleAddReview}>Submit Review</button>
                                    </div>
                                </div>
                            )}
                            {reviews.length > 0 ? (
                                <div className="reviews-list">
                                    {reviews.map(review => (
                                        <div key={review.reviewId} className="review-item">
                                            <div className="review-top">
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "#F59E0B" : "none"} color="#F59E0B" />)}
                                                </div>
                                                <span className="review-stars-label">{review.rating}/5</span>
                                            </div>
                                            <p className="review-text">{review.reviewText}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-reviews-state">
                                    <MessageSquare size={32} strokeWidth={1} />
                                    <p>No reviews yet.</p>
                                    <span>{isEnrolled ? 'Be the first to share your experience!' : 'Enroll in this course to leave a review.'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetails;

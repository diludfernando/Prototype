import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, Star, Clock, Award, Globe,
    ExternalLink, Heart, Share2, BookOpen,
    CheckCircle, MessageSquare, StickyNote, Loader2
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
    }, [id, userId]);

    const handleEnroll = async () => {
        try {
            const response = await fetch('http://localhost:8084/api/enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: parseInt(id),
                    userId,
                    progress: 0,
                    completed: 0
                })
            });
            if (response.ok) setIsEnrolled(true);
        } catch (err) {
            console.error('Enrollment error:', err);
        }
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

                        <div className="notes-section content-card glass">
                            <h3><StickyNote size={20} /> My Study Notes</h3>
                            <div className="add-note">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Write a new note..."
                                />
                                <button onClick={handleAddNote}>Add Note</button>
                            </div>
                            <div className="notes-list">
                                {notes.map(note => (
                                    <div key={note.noteId} className="note-card">
                                        <p>{note.noteText}</p>
                                        <span className="note-date">{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                                <div className="enrollment-status">
                                    <CheckCircle size={20} className="text-secondary" />
                                    <span>You are enrolled in this course</span>
                                    <button className="btn-secondary w-full mt-4">Continue Learning</button>
                                </div>
                            ) : (
                                <button className="enroll-btn" onClick={handleEnroll}>
                                    Enroll for {course.cost > 0 ? `$${course.cost}` : 'Free'}
                                    <ExternalLink size={20} />
                                </button>
                            )}

                            <p className="disclaimer">Get unlimited access to top courses with our premium subscription.</p>
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

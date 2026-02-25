import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, Star, Clock, Award, Globe,
    ExternalLink, Heart, Share2, BookOpen,
    CheckCircle, MessageSquare, StickyNote, Loader2
} from 'lucide-react';
import './ResourceDetails.css';

const ResourceDetails = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [reviews, setReviews] = useState([]);

    // Mock userId for prototype
    const userId = 1;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                // Fetch course
                const courseRes = await fetch(`http://localhost:8084/api/courses/${id}`);
                if (!courseRes.ok) throw new Error('Course not found');
                const courseData = await courseRes.json();
                setCourse(courseData);

                // Fetch enrollment status
                const enrollRes = await fetch(`http://localhost:8084/api/enrollments/user/${userId}`);
                const enrollData = await enrollRes.json();
                const enrollment = enrollData.find(e => e.courseId === parseInt(id));
                setIsEnrolled(!!enrollment);

                // Fetch notes
                const notesRes = await fetch(`http://localhost:8084/api/notes/user/${userId}/course/${id}`);
                const notesData = await notesRes.json();
                setNotes(notesData);

                // Fetch reviews
                const reviewsRes = await fetch(`http://localhost:8084/api/reviews/course/${id}`);
                const reviewsData = await reviewsRes.json();
                setReviews(reviewsData);

            } catch (err) {
                console.error('Error fetching details:', err);
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
                    userId: userId,
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
            const response = await fetch('http://localhost:8084/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: parseInt(id),
                    userId: userId,
                    noteText: newNote
                })
            });
            if (response.ok) {
                const addedNote = await response.json();
                setNotes([...notes, addedNote]);
                setNewNote('');
            }
        } catch (err) {
            console.error('Error adding note:', err);
        }
    };

    if (loading) return <div className="loading-container"><Loader2 className="animate-spin" size={48} /><p>Loading course details...</p></div>;
    if (error) return <div className="error-container"><h2>Error</h2><p>{error}</p><Link to="/learning-resources" className="btn-back">Go Back</Link></div>;

    return (
        <div className="resource-details-page">
            <div className="container">
                <Link to="/learning-resources" className="back-link">
                    <ChevronLeft size={20} /> Back to Resources
                </Link>

                <div className="details-grid">
                    <div className="details-main">
                        <div className="resource-hero">
                            <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80" alt={course.title} className="hero-image" />
                            <div className="hero-badge-container">
                                <span className="category-badge">{course.category}</span>
                                {course.cost === 0 && <span className="free-badge">FREE</span>}
                            </div>
                        </div>

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
                                            <CheckCircle size={18} className="text-secondary" />
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

                    <div className="sticky-sidebar">
                        <div className="info-card glass">
                            <div className="card-top">
                                <div className="rating-block">
                                    <div className="rating-value">
                                        <Star size={24} fill="#F59E0B" color="#F59E0B" />
                                        <span>{course.rating || 'N/A'}</span>
                                    </div>
                                    <span className="rating-count">({reviews.length} reviews)</span>
                                </div>
                                <div className="action-buttons">
                                    <button className="icon-btn"><Heart size={20} /></button>
                                    <button className="icon-btn"><Share2 size={20} /></button>
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
                                        <span className="meta-value">{course.cost > 0 ? `$${course.cost}` : 'Free'}</span>
                                    </div>
                                </div>
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

                        <div className="reviews-card info-card glass mt-6">
                            <h3><MessageSquare size={20} /> Recent Reviews</h3>
                            {reviews.length > 0 ? reviews.map(review => (
                                <div key={review.reviewId} className="review-item">
                                    <div className="review-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < review.rating ? "#F59E0B" : "none"} color="#F59E0B" />
                                        ))}
                                    </div>
                                    <p>{review.reviewText}</p>
                                </div>
                            )) : <p>No reviews yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetails;

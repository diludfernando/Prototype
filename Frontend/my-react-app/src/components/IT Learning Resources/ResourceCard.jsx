import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ExternalLink, Heart, Award, BookOpen, ChevronRight } from 'lucide-react';
import './ResourceCard.css';
import { getCourseImage } from '../../utils/courseImage';

const PROVIDER_INITIALS = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const ResourceCard = ({ resource }) => {
    const [isFav, setIsFav] = useState(false);
    const [favId, setFavId] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const userId = 1;

    useEffect(() => {
        // Check favorite
        fetch(`http://localhost:8084/api/favorites/user/${userId}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                const f = data.find(f => f.courseId === resource.id);
                if (f) { setIsFav(true); setFavId(f.favoriteId); }
            }).catch(() => {});

        // Check enrollment for progress
        fetch(`http://localhost:8084/api/enrollments/user/${userId}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => {
                const e = data.find(e => e.courseId === resource.id);
                if (e) setEnrollment(e);
            }).catch(() => {});
    }, [resource.id]);

    const toggleFav = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (isFav) {
                await fetch(`http://localhost:8084/api/favorites/${favId}`, { method: 'DELETE' });
                setIsFav(false); setFavId(null);
            } else {
                const res = await fetch('http://localhost:8084/api/favorites', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseId: resource.id, userId })
                });
                if (res.ok) { const f = await res.json(); setIsFav(true); setFavId(f.favoriteId); }
            }
        } catch {}
    };

    const progress = enrollment?.progress ?? null;
    const isCompleted = enrollment?.completed === 1 || progress === 100;
    const skills = resource.skillsCovered?.split(',').map(s => s.trim()).filter(Boolean) || [];

    return (
        <div className="rc-card">
            {/* Image */}
            <Link to={`/learning-resources/${resource.id}`} className="rc-image-wrap">
                <img src={getCourseImage(resource.category, resource.id)} alt={resource.title} className="rc-image" />

                {/* Overlay badges */}
                <div className="rc-badges-top">
                    <span className="rc-category-badge">{resource.category}</span>
                    {resource.price === 0
                        ? <span className="rc-price-badge free">FREE</span>
                        : <span className="rc-price-badge paid">PAID</span>
                    }
                </div>

                {/* Favorite button */}
                <button className={`rc-fav-btn ${isFav ? 'active' : ''}`} onClick={toggleFav} title={isFav ? 'Remove from favorites' : 'Add to favorites'}>
                    <Heart size={15} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : 'white'} />
                </button>

                {/* Progress bar on image bottom if enrolled */}
                {progress !== null && (
                    <div className="rc-progress-strip">
                        <div className="rc-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                )}
            </Link>

            {/* Body */}
            <div className="rc-body">
                {/* Provider row */}
                <div className="rc-provider-row">
                    <span className="rc-provider-avatar">{PROVIDER_INITIALS(resource.provider)}</span>
                    <span className="rc-provider-name">{resource.provider}</span>
                    <span className={`rc-level-badge ${resource.difficultyLevel?.toLowerCase()}`}>
                        <Award size={11} />{resource.difficultyLevel}
                    </span>
                </div>

                {/* Title */}
                <Link to={`/learning-resources/${resource.id}`} className="rc-title-link">
                    <h3 className="rc-title">{resource.title}</h3>
                </Link>

                {/* Skills */}
                <div className="rc-skills">
                    {skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="rc-skill-tag">{s}</span>
                    ))}
                    {skills.length > 3 && <span className="rc-skill-more">+{skills.length - 3}</span>}
                </div>

                {/* Icon row: rating */}
                <div className="rc-meta-row">
                    <span className="rc-meta-item">
                        <Star size={13} fill="#f59e0b" color="#f59e0b" />
                        {resource.rating ?? 'N/A'}
                    </span>
                    {progress !== null && (
                        <span className="rc-meta-item rc-progress-label">
                            <BookOpen size={13} />
                            {isCompleted ? 'Completed' : `${progress}% done`}
                        </span>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="rc-footer">
                <span className="rc-price">
                    {resource.price > 0 ? `Rs. ${resource.price.toLocaleString()}` : 'Free'}
                </span>
                <Link to={`/learning-resources/${resource.id}`} className="rc-cta">
                    {enrollment ? 'Continue' : 'View Course'}
                    <ChevronRight size={15} />
                </Link>
            </div>
        </div>
    );
};

export default ResourceCard;

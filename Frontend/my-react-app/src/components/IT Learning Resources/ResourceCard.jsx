import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Globe, ExternalLink, Award } from 'lucide-react';
import './ResourceCard.css';

const ResourceCard = ({ resource }) => {
    // Generate a placeholder image based on category if no image is available
    const getPlaceholderImage = (category) => {
        const categories = {
            'Programming': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',
            'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80',
            'Cybersecurity': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80',
            'Data Science': 'https://images.unsplash.com/photo-1551288049-bbda38a5f85f?w=500&q=80',
            'Cloud Computing': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80'
        };
        return categories[category] || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80';
    };

    return (
        <div className="resource-card shadow-sm hover-up">
            <Link to={`/learning-resources/${resource.id}`} className="card-link-wrapper">
                <div className="card-image-wrapper">
                    <img src={getPlaceholderImage(resource.category)} alt={resource.title} className="card-image" />
                    <div className="card-badge">{resource.category}</div>
                    {resource.cost === 0 && <div className="free-badge">FREE</div>}
                </div>

                <div className="card-content">
                    <div className="card-provider">{resource.provider}</div>
                    <h3 className="card-title">{resource.title}</h3>

                    <div className="card-meta">
                        <div className="meta-item">
                            <Star className="meta-icon text-yellow" size={16} fill="currentColor" />
                            <span>{resource.rating || 'N/A'}</span>
                        </div>
                        <div className="meta-item">
                            <Award className="meta-icon" size={16} />
                            <span className={`difficulty-badge ${resource.difficultyLevel?.toLowerCase()}`}>
                                {resource.difficultyLevel}
                            </span>
                        </div>
                    </div>

                    <div className="card-skills">
                        {resource.skillsCovered?.split(',').slice(0, 3).map((skill, index) => (
                            <span key={index} className="skill-tag">{skill.trim()}</span>
                        ))}
                    </div>
                </div>
            </Link>

            <div className="card-footer">
                <div className="price-info">
                    {resource.cost > 0 ? `$${resource.cost}` : 'Free'}
                </div>
                <Link to={`/learning-resources/${resource.id}`} className="btn-view">
                    View Course <ExternalLink size={14} />
                </Link>
            </div>
        </div>
    );
};

export default ResourceCard;

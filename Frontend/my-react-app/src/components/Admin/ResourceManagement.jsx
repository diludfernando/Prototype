import React, { useState } from 'react';
import './ResourceManagement.css';

const ResourceManagement = () => {
    const [formData, setFormData] = useState({
        title: '',
        provider: '',
        category: 'Programming',
        difficultyLevel: 'Beginner',
        duration: '',
        costType: 'Free',
        rating: 0,
        skillsCovered: '',
        courseUrl: '',
        language: 'English',
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8084/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Resource added successfully!');
                handleCancel();
            } else {
                alert('Failed to add resource. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Is the backend running?');
        }
    };

    const handleCancel = () => {
        // Reset form or navigate back
        setFormData({
            title: '',
            provider: '',
            category: 'Programming',
            difficultyLevel: 'Beginner',
            duration: '',
            costType: 'Free',
            rating: 0,
            skillsCovered: '',
            courseUrl: '',
            language: 'English',
            description: ''
        });
    };

    return (
        <div className="resource-management">
            <div className="resource-header">
                <h2>Add New Resource</h2>
                <div className="header-underline"></div>
                <p className="subtitle">Fill in the details to add a new learning resource</p>
            </div>

            <div className="resource-card shadow-lg">
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Complete Python Bootcamp"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Provider *</label>
                            <input
                                type="text"
                                name="provider"
                                value={formData.provider}
                                onChange={handleInputChange}
                                placeholder="e.g., Udemy, Coursera"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category *</label>
                            <select name="category" value={formData.category} onChange={handleInputChange}>
                                <option value="Programming">Programming</option>
                                <option value="Design">Design</option>
                                <option value="Business">Business</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Personal Development">Personal Development</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Difficulty Level *</label>
                            <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleInputChange}>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Duration *</label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                placeholder="e.g., 10 hours, 6 weeks"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Cost Type *</label>
                            <select name="costType" value={formData.costType} onChange={handleInputChange}>
                                <option value="Free">Free</option>
                                <option value="Paid">Paid</option>
                                <option value="Subscription">Subscription</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Rating (0-5)</label>
                            <input
                                type="number"
                                name="rating"
                                min="0"
                                max="5"
                                step="0.1"
                                value={formData.rating}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Skills Covered</label>
                            <input
                                type="text"
                                name="skillsCovered"
                                value={formData.skillsCovered}
                                onChange={handleInputChange}
                                placeholder="e.g., Python, Django, REST APIs (comma-separated)"
                            />
                            <small className="form-hint">Separate multiple skills with commas</small>
                        </div>

                        <div className="form-group full-width">
                            <label>Course URL</label>
                            <input
                                type="url"
                                name="courseUrl"
                                value={formData.courseUrl}
                                onChange={handleInputChange}
                                placeholder="https://udemy.com/course-name"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Language</label>
                            <select name="language" value={formData.language} onChange={handleInputChange}>
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Provide a detailed description of the course..."
                                rows="5"
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="btn-submit">Add Resource</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceManagement;

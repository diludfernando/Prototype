import React, { useState } from 'react';
import './ResourceManagement.css';

const ResourceManagement = () => {
    const [formData, setFormData] = useState({
        title: '',
        provider: '',
        category: 'Programming',
        difficultyLevel: 'Beginner',
        cost: 0,
        rating: 0,
        skillsCovered: '',
        courseLink: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'cost' || name === 'rating' ? parseFloat(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8084/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Course added successfully!');
                handleCancel();
            } else {
                alert('Failed to add course. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred. Is the backend running?');
        }
    };

    const handleCancel = () => {
        setFormData({
            title: '',
            provider: '',
            category: 'Programming',
            difficultyLevel: 'Beginner',
            cost: 0,
            rating: 0,
            skillsCovered: '',
            courseLink: ''
        });
    };

    return (
        <div className="resource-management">
            <div className="resource-header">
                <h2>Add New Course</h2>
                <div className="header-underline"></div>
                <p className="subtitle">Fill in the details to add a new course to the catalog</p>
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
                                <option value="Data Science">Data Science</option>
                                <option value="Cloud Computing">Cloud Computing</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                                <option value="Design">Design</option>
                                <option value="Business">Business</option>
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
                            <label>Cost ($) *</label>
                            <input
                                type="number"
                                name="cost"
                                min="0"
                                step="0.01"
                                value={formData.cost}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
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
                                name="courseLink"
                                value={formData.courseLink}
                                onChange={handleInputChange}
                                placeholder="https://udemy.com/course-name"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="btn-submit">Add Course</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceManagement;

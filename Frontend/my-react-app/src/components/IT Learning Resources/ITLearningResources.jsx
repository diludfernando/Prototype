import React, { useState, useEffect } from 'react';
import { Search, Book, ChevronDown, AlertCircle, Heart, GraduationCap, Loader2 } from 'lucide-react';
import './ITLearningResources.css';
import MyCourses from './MyCourses';
import ResourceCard from './ResourceCard';

const ITLearningResources = () => {
    const [activeSection, setActiveSection] = useState('All Resources');
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [difficulty, setDifficulty] = useState('All');
    const [cost, setCost] = useState('All');
    const [sortBy, setSortBy] = useState('Newest First');

    // Data fetching state
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8084/api/resources');
                if (!response.ok) {
                    throw new Error('Failed to fetch resources');
                }
                const data = await response.json();
                setResources(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching resources:', err);
                setError('Failed to load courses. Please make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    // Filtering logic
    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = category === 'All' || resource.category === category;
        const matchesDifficulty = difficulty === 'All' || resource.difficultyLevel === difficulty;
        const matchesCost = cost === 'All' || resource.costType === cost;

        return matchesSearch && matchesCategory && matchesDifficulty && matchesCost;
    });

    // Sorting logic
    const sortedResources = [...filteredResources].sort((a, b) => {
        if (sortBy === 'A-Z') return a.title.localeCompare(b.title);
        if (sortBy === 'Z-A') return b.title.localeCompare(a.title);
        if (sortBy === 'Newest First') return b.id - a.id; // Assuming higher ID is newer
        if (sortBy === 'Oldest First') return a.id - b.id;
        return 0;
    });

    return (
        <div className="resources-page">
            <div className="container">
                {/* Header */}
                <header className="resources-header">
                    <h1 className="resources-title">
                        {activeSection === 'All Resources' ? 'IT Learning Resources' : 'My Courses'}
                    </h1>
                    <p className="resources-subtitle">
                        {activeSection === 'All Resources'
                            ? `Explore ${resources.length}+ courses to advance your IT career`
                            : 'Track your learning progress'
                        }
                    </p>
                </header>

                {/* Sub-navigation Bar */}
                <nav className="resources-subnav">
                    <button
                        className={`subnav-link ${activeSection === 'All Resources' ? 'active' : ''}`}
                        onClick={() => setActiveSection('All Resources')}
                    >
                        <Book size={18} />
                        <span>All Resources</span>
                    </button>
                    <button
                        className={`subnav-link ${activeSection === 'My Favorites' ? 'active' : ''}`}
                        onClick={() => setActiveSection('My Favorites')}
                    >
                        <Heart size={18} />
                        <span>My Favorites</span>
                    </button>
                    <button
                        className={`subnav-link ${activeSection === 'My Courses' ? 'active' : ''}`}
                        onClick={() => setActiveSection('My Courses')}
                    >
                        <GraduationCap size={18} />
                        <span>My Courses</span>
                    </button>
                </nav>

                {activeSection === 'All Resources' ? (
                    <>
                        {error && (
                            <div className="error-alert">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Filter Section */}
                        <div className="filter-section">
                            <div className="search-container">
                                <Search className="search-icon" size={24} strokeWidth={1.5} />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search courses by title, provider, or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="filters-grid">
                                <div className="filter-group">
                                    <label className="filter-label">Category</label>
                                    <div className="filter-select-wrapper">
                                        <select
                                            className="filter-select"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                        >
                                            <option value="All">All</option>
                                            <option value="Programming">Programming</option>
                                            <option value="Cybersecurity">Cybersecurity</option>
                                            <option value="Cloud Computing">Cloud Computing</option>
                                            <option value="Data Science">Data Science</option>
                                            <option value="Design">Design</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={20} />
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">Difficulty</label>
                                    <div className="filter-select-wrapper">
                                        <select
                                            className="filter-select"
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value)}
                                        >
                                            <option value="All">All</option>
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={20} />
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">Cost</label>
                                    <div className="filter-select-wrapper">
                                        <select
                                            className="filter-select"
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                        >
                                            <option value="All">All</option>
                                            <option value="Free">Free</option>
                                            <option value="Paid">Paid</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={20} />
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">Sort By</label>
                                    <div className="filter-select-wrapper">
                                        <select
                                            className="filter-select"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="Newest First">Newest First</option>
                                            <option value="Oldest First">Oldest First</option>
                                            <option value="A-Z">A-Z</option>
                                            <option value="Z-A">Z-A</option>
                                        </select>
                                        <ChevronDown className="select-icon" size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="loading-state">
                                <Loader2 className="animate-spin text-accent" size={48} />
                                <p>Fetching amazing resources for you...</p>
                            </div>
                        )}

                        {/* Count Info */}
                        {!loading && !error && (
                            <div className="results-info">
                                Showing {sortedResources.length} of {resources.length} resources
                            </div>
                        )}

                        {/* Resources Grid */}
                        {!loading && !error && sortedResources.length > 0 ? (
                            <div className="resources-grid">
                                {sortedResources.map(resource => (
                                    <ResourceCard key={resource.id} resource={resource} />
                                ))}
                            </div>
                        ) : !loading && !error && (
                            <div className="empty-state">
                                <div className="empty-icon-wrapper">
                                    <Book size={64} strokeWidth={1} />
                                </div>
                                <h2 className="empty-title">No resources found</h2>
                                <p className="empty-description">
                                    Try adjusting your filters or search terms
                                </p>
                            </div>
                        )}
                    </>
                ) : activeSection === 'My Courses' ? (
                    <MyCourses />
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon-wrapper">
                            <AlertCircle size={64} strokeWidth={1} />
                        </div>
                        <h2 className="empty-title">{activeSection} is coming soon</h2>
                        <p className="empty-description">
                            We are working hard to bring this feature to you!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ITLearningResources;


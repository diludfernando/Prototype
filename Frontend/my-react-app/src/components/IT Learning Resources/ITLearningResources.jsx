import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Book, ChevronDown, AlertCircle, Heart, GraduationCap, Loader2, Home, BookOpen, DollarSign, Tag, Sparkles } from 'lucide-react';
import './ITLearningResources.css';
import MyCourses from './MyCourses';
import ResourceCard from './ResourceCard';
import Recommended from './Recommended';

const ITLearningResources = () => {
    const [activeSection, setActiveSection] = useState('All Resources');
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [difficulty, setDifficulty] = useState('All');
    const [cost, setCost] = useState('All');
    const [sortBy, setSortBy] = useState('Newest First');
    const [resources, setResources] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = 1;

    useEffect(() => {
        const fetchResources = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8084/api/courses');
                if (!response.ok) throw new Error('Failed to fetch courses');
                setResources(await response.json());
                setError(null);
            } catch (err) {
                setError('Failed to load courses. Please make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        const fetchFavorites = async () => {
            try {
                const response = await fetch(`http://localhost:8084/api/favorites/user/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    const enriched = await Promise.all(data.map(async (fav) => {
                        try {
                            const courseRes = await fetch(`http://localhost:8084/api/courses/${fav.courseId}`);
                            if (!courseRes.ok) return null;
                            return { ...fav, course: await courseRes.json() };
                        } catch { return null; }
                    }));
                    setFavorites(enriched.filter(f => f !== null));
                }
            } catch (err) { console.error(err); }
        };

        fetchResources();
        fetchFavorites();
    }, [userId]);

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.skillsCovered?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'All' || r.category === category;
        const matchesDifficulty = difficulty === 'All' || r.difficultyLevel === difficulty;
        const matchesCost = cost === 'All' || (cost === 'Free' ? r.price === 0 : r.price > 0);
        return matchesSearch && matchesCategory && matchesDifficulty && matchesCost;
    });

    const sortedResources = [...filteredResources].sort((a, b) => {
        if (sortBy === 'A-Z') return a.title.localeCompare(b.title);
        if (sortBy === 'Z-A') return b.title.localeCompare(a.title);
        if (sortBy === 'Newest First') return b.id - a.id;
        if (sortBy === 'Oldest First') return a.id - b.id;
        return 0;
    });

    const tabs = [
        { key: 'All Resources', icon: <Book size={16} />, count: resources.length },
        { key: 'My Favorites', icon: <Heart size={16} />, count: favorites.length },
        { key: 'My Courses', icon: <GraduationCap size={16} />, count: null },
        { key: 'Recommended', icon: <Sparkles size={16} />, count: null },
    ];

    return (
        <div className="resources-page">
            {/* Sticky inner navbar */}
            <div className="resources-sticky-nav">
                <div className="resources-sticky-nav-inner">
                    <div className="sticky-nav-left">
                        <Link to="/services" className="sticky-nav-home" title="Back to User Services">
                            <Home size={16} />
                        </Link>
                        <span className="sticky-nav-divider" />
                        <span className="sticky-nav-brand">Skill<span>Bridge</span></span>
                    </div>
                    <div className="sticky-nav-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                className={`sticky-nav-tab ${activeSection === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveSection(tab.key)}
                            >
                                {tab.icon}
                                <span>{tab.key}</span>
                                {tab.count !== null && tab.count > 0 && (
                                    <span className="sticky-nav-count">{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="resources-content">
                {activeSection === 'All Resources' && (
                    <>
                        <header className="resources-header">
                            <h1 className="resources-title">
                                IT Learning <span className="resources-title-accent">Resources</span>
                            </h1>
                            <p className="resources-subtitle">
                                {resources.length}+ curated courses to advance your IT career
                            </p>
                        </header>

                        {/* Summary cards */}
                        {!loading && resources.length > 0 && (
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <div className="summary-icon" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-accent)' }}>
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-value">{resources.length}</span>
                                        <span className="summary-label">Total Courses</span>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                                        <DollarSign size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-value">{resources.filter(r => r.price === 0).length}</span>
                                        <span className="summary-label">Free Courses</span>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                                        <Tag size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-value">{[...new Set(resources.map(r => r.category))].length}</span>
                                        <span className="summary-label">Categories</span>
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                                        <GraduationCap size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-value">{favorites.length}</span>
                                        <span className="summary-label">Saved</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="error-alert">
                                <AlertCircle size={18} /><span>{error}</span>
                            </div>
                        )}

                        <div className="filter-section">
                            <div className="search-container">
                                <Search className="search-icon" size={18} strokeWidth={2} />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search by title, provider, or skill..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filters-grid">
                                {[
                                    { label: 'Category', value: category, setter: setCategory, options: ['All', 'Programming', 'Cybersecurity', 'Cloud Computing', 'Data Science', 'Design'] },
                                    { label: 'Difficulty', value: difficulty, setter: setDifficulty, options: ['All', 'Beginner', 'Intermediate', 'Advanced'] },
                                    { label: 'Cost', value: cost, setter: setCost, options: ['All', 'Free', 'Paid'] },
                                    { label: 'Sort By', value: sortBy, setter: setSortBy, options: ['Newest First', 'Oldest First', 'A-Z', 'Z-A'] },
                                ].map(f => (
                                    <div key={f.label} className="filter-group">
                                        <label className="filter-label">{f.label}</label>
                                        <div className="filter-select-wrapper">
                                            <select className="filter-select" value={f.value} onChange={e => f.setter(e.target.value)}>
                                                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                            <ChevronDown className="select-icon" size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <Loader2 className="animate-spin" size={40} color="var(--color-accent)" />
                                <p>Loading courses...</p>
                            </div>
                        ) : (
                            <>
                                {!error && (
                                    <div className="results-info">
                                        Showing {sortedResources.length} of {resources.length} courses
                                    </div>
                                )}
                                {sortedResources.length > 0 ? (
                                    <div className="resources-grid">
                                        {sortedResources.map(resource => (
                                            <ResourceCard key={resource.id} resource={resource} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon-wrapper"><Book size={40} strokeWidth={1} /></div>
                                        <h2 className="empty-title">No courses found</h2>
                                        <p className="empty-description">Try adjusting your filters or search terms</p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {activeSection === 'My Courses' && <MyCourses />}

                {activeSection === 'Recommended' && (
                    <Recommended allCourses={resources} />
                )}

                {activeSection === 'My Favorites' && (
                    <div className="favorites-section">
                        <header className="resources-header">
                            <h1 className="resources-title">My <span className="resources-title-accent">Favorites</span></h1>
                            <p className="resources-subtitle">Courses you've saved for later</p>
                        </header>
                        {loading ? (
                            <div className="loading-state">
                                <Loader2 className="animate-spin" size={40} color="var(--color-accent)" />
                            </div>
                        ) : favorites.length > 0 ? (
                            <>
                                <div className="results-info">{favorites.length} saved course{favorites.length !== 1 ? 's' : ''}</div>
                                <div className="resources-grid">
                                    {favorites.map(fav => <ResourceCard key={fav.favoriteId} resource={fav.course} />)}
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon-wrapper"><Heart size={40} strokeWidth={1} /></div>
                                <h2 className="empty-title">No favorites yet</h2>
                                <p className="empty-description">Click the heart icon on any course to save it here</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ITLearningResources;


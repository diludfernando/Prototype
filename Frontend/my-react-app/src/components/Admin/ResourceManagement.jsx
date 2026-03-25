import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X, BookOpen, ChevronLeft, Search } from 'lucide-react';
import './ResourceManagement.css';

const emptyForm = {
    title: '', provider: '', category: 'Programming',
    difficultyLevel: 'Beginner', cost: 0, rating: 0,
    skillsCovered: '', courseLink: ''
};

const emptyLesson = { title: '', description: '', videoUrl: '', durationMinutes: 0 };

const CATEGORIES = ['All', 'Programming', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Design', 'Business'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function getInitials(title) {
    return title?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';
}

function getInitialsBg(title) {
    const colors = ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444'];
    let hash = 0;
    for (let c of (title || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

const ResourceManagement = () => {
    const [courses, setCourses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);

    // filters
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [filterProvider, setFilterProvider] = useState('All');
    const [sortBy, setSortBy] = useState('id');

    // lesson state
    const [managingLessons, setManagingLessons] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [lessonForm, setLessonForm] = useState(emptyLesson);

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch('http://localhost:8084/api/courses');
            setCourses(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchLessons = async (courseId) => {
        try {
            const res = await fetch(`http://localhost:8084/api/lessons/course/${courseId}`);
            setLessons(res.ok ? await res.json() : []);
        } catch (e) { setLessons([]); }
    };

    // derived stats
    const totalCourses = courses.length;
    const freeCourses = courses.filter(c => !(c.price || c.cost)).length;
    const paidCourses = totalCourses - freeCourses;
    const avgRating = totalCourses
        ? (courses.reduce((s, c) => s + (c.rating || 0), 0) / totalCourses).toFixed(1)
        : '0.0';

    const providers = ['All', ...Array.from(new Set(courses.map(c => c.provider).filter(Boolean)))];

    const filtered = courses
        .filter(c => {
            const q = search.toLowerCase();
            if (q && !c.title?.toLowerCase().includes(q) && !c.provider?.toLowerCase().includes(q)) return false;
            if (filterCategory !== 'All' && c.category !== filterCategory) return false;
            if (filterDifficulty !== 'All' && c.difficultyLevel !== filterDifficulty) return false;
            if (filterProvider !== 'All' && c.provider !== filterProvider) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'title') return a.title?.localeCompare(b.title);
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'price') return (b.price || b.cost || 0) - (a.price || a.cost || 0);
            return a.id - b.id;
        });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'cost' || name === 'rating' ? parseFloat(value) : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title, provider: formData.provider,
                category: formData.category, difficultyLevel: formData.difficultyLevel,
                price: parseFloat(formData.cost) || 0, rating: parseFloat(formData.rating) || 0,
                skillsCovered: formData.skillsCovered, url: formData.courseLink
            };
            const endpoint = editingId ? `http://localhost:8084/api/courses/${editingId}` : 'http://localhost:8084/api/courses';
            const res = await fetch(endpoint, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) { handleCancel(); fetchCourses(); }
            else alert('Failed to save course.');
        } catch (e) { alert('Error. Is the backend running?'); }
    };

    const handleEdit = (course) => {
        setFormData({
            title: course.title, provider: course.provider, category: course.category,
            difficultyLevel: course.difficultyLevel,
            cost: course.price ?? course.cost ?? 0,
            rating: course.rating || 0,
            skillsCovered: course.skillsCovered || '',
            courseLink: course.url || course.courseLink || ''
        });
        setEditingId(course.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this course?')) return;
        try {
            const res = await fetch(`http://localhost:8084/api/courses/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCourses();
            else alert('Failed to delete.');
        } catch (e) { alert('Error deleting.'); }
    };

    const handleCancel = () => { setFormData(emptyForm); setEditingId(null); setShowForm(false); };

    const openLessonManager = (course) => { setManagingLessons(course); fetchLessons(course.id); };
    const closeLessonManager = () => {
        setManagingLessons(null); setLessons([]); setShowLessonForm(false);
        setEditingLessonId(null); setLessonForm(emptyLesson);
    };

    const handleLessonInput = (e) => {
        const { name, value } = e.target;
        setLessonForm({ ...lessonForm, [name]: name === 'durationMinutes' ? parseInt(value) || 0 : value });
    };

    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...lessonForm, courseId: managingLessons.id };
            const url = editingLessonId
                ? `http://localhost:8084/api/lessons/${editingLessonId}`
                : 'http://localhost:8084/api/lessons';
            const res = await fetch(url, {
                method: editingLessonId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setShowLessonForm(false); setEditingLessonId(null);
                setLessonForm(emptyLesson); fetchLessons(managingLessons.id);
            } else alert('Failed to save lesson.');
        } catch (e) { alert('Error saving lesson.'); }
    };

    const handleEditLesson = (lesson) => {
        setLessonForm({
            title: lesson.title || '', description: lesson.description || '',
            videoUrl: lesson.videoUrl || '', durationMinutes: lesson.durationMinutes || 0
        });
        setEditingLessonId(lesson.lessonId);
        setShowLessonForm(true);
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Delete this lesson?')) return;
        try {
            const res = await fetch(`http://localhost:8084/api/lessons/${lessonId}`, { method: 'DELETE' });
            if (res.ok) fetchLessons(managingLessons.id);
            else alert('Failed to delete lesson.');
        } catch (e) { alert('Error deleting lesson.'); }
    };

    // ── Lesson Manager View ──
    if (managingLessons) {
        return (
            <div className="rm-page">
                <div className="rm-header">
                    <div>
                        <button className="btn-back-lessons" onClick={closeLessonManager}>
                            <ChevronLeft size={16} /> Back to Courses
                        </button>
                        <h2 className="rm-title">Lessons</h2>
                        <p className="rm-subtitle">{managingLessons.title}</p>
                    </div>
                    {!showLessonForm && (
                        <button className="btn-add-new" onClick={() => setShowLessonForm(true)}>
                            <Plus size={18} /> Add Lesson
                        </button>
                    )}
                </div>

                {showLessonForm && (
                    <div className="rm-card form-card">
                        <div className="form-header">
                            <h3>{editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}</h3>
                            <button type="button" className="btn-close" onClick={() => { setShowLessonForm(false); setEditingLessonId(null); setLessonForm(emptyLesson); }}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleLessonSubmit}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Lesson Title *</label>
                                    <input type="text" name="title" value={lessonForm.title} onChange={handleLessonInput} placeholder="e.g., Introduction to Variables" required />
                                </div>
                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea name="description" value={lessonForm.description} onChange={handleLessonInput} placeholder="Brief description of this lesson..." rows="3" />
                                </div>
                                <div className="form-group">
                                    <label>Duration (minutes)</label>
                                    <input type="number" name="durationMinutes" min="0" value={lessonForm.durationMinutes} onChange={handleLessonInput} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => { setShowLessonForm(false); setEditingLessonId(null); setLessonForm(emptyLesson); }}>Cancel</button>
                                <button type="submit" className="btn-submit">{editingLessonId ? 'Update Lesson' : 'Add Lesson'}</button>
                            </div>
                        </form>
                    </div>
                )}

                {!showLessonForm && (
                    <div className="rm-card table-card">
                        <div className="table-card-header">
                            <span className="table-count">{lessons.length} lessons</span>
                        </div>
                        {lessons.length > 0 ? (
                            <div className="rm-table-wrap">
                                <table className="rm-table">
                                    <thead>
                                        <tr>
                                            <th>#</th><th>Title</th><th>Duration</th><th>Video URL</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lessons.map((lesson, i) => (
                                            <tr key={lesson.lessonId}>
                                                <td className="td-id">{i + 1}</td>
                                                <td className="td-title">{lesson.title}</td>
                                                <td>{lesson.durationMinutes} min</td>
                                                <td className="td-url">
                                                    {lesson.videoUrl
                                                        ? <span className="url-preview">{lesson.videoUrl}</span>
                                                        : <span className="no-video">No video</span>}
                                                </td>
                                                <td>
                                                    <div className="action-btns">
                                                        <button type="button" className="act-btn act-edit" onClick={() => handleEditLesson(lesson)} title="Edit"><Edit2 size={14} /></button>
                                                        <button type="button" className="act-btn act-delete" onClick={() => handleDeleteLesson(lesson.lessonId)} title="Delete"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state"><p>No lessons yet. Click "Add Lesson" to add the first one.</p></div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ── Main Course List View ──
    return (
        <div className="rm-page">
            {/* Header */}
            <div className="rm-header">
                <div>
                    <h2 className="rm-title">Manage Courses</h2>
                    <p className="rm-subtitle">Add, edit, or remove courses from the catalog</p>
                </div>
                {!showForm && (
                    <button className="btn-add-new" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Add New Course
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            {!showForm && (
                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-value">{totalCourses}</span>
                        <span className="stat-label">Total Courses</span>
                    </div>
                    <div className="stat-card stat-free">
                        <span className="stat-value">{freeCourses}</span>
                        <span className="stat-label">Free Courses</span>
                    </div>
                    <div className="stat-card stat-paid">
                        <span className="stat-value">{paidCourses}</span>
                        <span className="stat-label">Paid Courses</span>
                    </div>
                    <div className="stat-card stat-rating">
                        <span className="stat-value">⭐ {avgRating}</span>
                        <span className="stat-label">Avg Rating</span>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="rm-card form-card">
                    <div className="form-header">
                        <h3>{editingId ? 'Edit Course' : 'Add New Course'}</h3>
                        <button type="button" className="btn-close" onClick={handleCancel}><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Title *</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Complete Python Bootcamp" required />
                            </div>
                            <div className="form-group">
                                <label>Provider *</label>
                                <input type="text" name="provider" value={formData.provider} onChange={handleInputChange} placeholder="e.g., Udemy, Coursera" required />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select name="category" value={formData.category} onChange={handleInputChange}>
                                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Difficulty Level *</label>
                                <select name="difficultyLevel" value={formData.difficultyLevel} onChange={handleInputChange}>
                                    {DIFFICULTIES.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cost (Rs.) *</label>
                                <input type="number" name="cost" min="0" step="0.01" value={formData.cost} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Rating (0–5)</label>
                                <input type="number" name="rating" min="0" max="5" step="0.1" value={formData.rating} onChange={handleInputChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Skills Covered</label>
                                <input type="text" name="skillsCovered" value={formData.skillsCovered} onChange={handleInputChange} placeholder="e.g., Python, Django, REST APIs (comma-separated)" />
                                <small className="form-hint">Separate multiple skills with commas</small>
                            </div>
                            <div className="form-group full-width">
                                <label>Course URL</label>
                                <input type="url" name="courseLink" value={formData.courseLink} onChange={handleInputChange} placeholder="https://udemy.com/course-name" />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                            <button type="submit" className="btn-submit">{editingId ? 'Update Course' : 'Add Course'}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters + Table */}
            {!showForm && (
                <div className="rm-card table-card">
                    {/* Filter row */}
                    <div className="filter-row">
                        <div className="search-box">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                        </select>
                        <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
                            {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'All' ? 'All Levels' : d}</option>)}
                        </select>
                        <select value={filterProvider} onChange={e => setFilterProvider(e.target.value)}>
                            {providers.map(p => <option key={p} value={p}>{p === 'All' ? 'All Providers' : p}</option>)}
                        </select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="id">Sort: Default</option>
                            <option value="title">Sort: Title</option>
                            <option value="rating">Sort: Rating</option>
                            <option value="price">Sort: Price</option>
                        </select>
                    </div>

                    <div className="table-card-header">
                        <span className="table-count">{filtered.length} of {totalCourses} courses</span>
                    </div>

                    {filtered.length > 0 ? (
                        <div className="rm-table-wrap">
                            <table className="rm-table">
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Provider</th>
                                        <th>Category</th>
                                        <th>Difficulty</th>
                                        <th>Price</th>
                                        <th>Rating</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(course => {
                                        const bg = getInitialsBg(course.title);
                                        const price = course.price || course.cost || 0;
                                        return (
                                            <tr key={course.id}>
                                                <td>
                                                    <div className="td-course">
                                                        <div className="course-avatar" style={{ background: bg }}>
                                                            {getInitials(course.title)}
                                                        </div>
                                                        <span className="td-title">{course.title}</span>
                                                    </div>
                                                </td>
                                                <td className="td-provider">{course.provider}</td>
                                                <td><span className="badge badge-category">{course.category}</span></td>
                                                <td><span className={`badge badge-${course.difficultyLevel?.toLowerCase()}`}>{course.difficultyLevel}</span></td>
                                                <td className="td-price">
                                                    {price === 0
                                                        ? <span className="badge badge-free">FREE</span>
                                                        : <span>Rs. {price}</span>}
                                                </td>
                                                <td className="td-rating">⭐ {course.rating || '—'}</td>
                                                <td>
                                                    <div className="action-btns">
                                                        <button type="button" className="act-btn act-lessons" onClick={() => openLessonManager(course)} title="Manage lessons"><BookOpen size={14} /></button>
                                                        <button type="button" className="act-btn act-edit" onClick={() => handleEdit(course)} title="Edit course"><Edit2 size={14} /></button>
                                                        <button type="button" className="act-btn act-delete" onClick={() => handleDelete(course.id)} title="Delete course"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>{search || filterCategory !== 'All' || filterDifficulty !== 'All' || filterProvider !== 'All'
                                ? 'No courses match your filters.'
                                : 'No courses found. Click "Add New Course" to get started.'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResourceManagement;

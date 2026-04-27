import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react';
import './QuestionManagement.css';

const QuestionManagement = () => {
    const [questions, setQuestions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [formData, setFormData] = useState({
        content: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: '',
        category: 'Java',
        level: 'Easy'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterLevel, setFilterLevel] = useState('All');


    const API_URL = 'http://localhost:8082/api/questions';

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            content: '',
            option1: '',
            option2: '',
            option3: '',
            option4: '',
            correctAnswer: '',
            category: 'Java',
            level: 'Easy'
        });
        setEditingQuestion(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = editingQuestion ? 'PUT' : 'POST';
        const url = editingQuestion ? `${API_URL}/${editingQuestion.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchQuestions();
                setIsModalOpen(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error saving question:', error);
        }
    };

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setFormData({
            content: question.content,
            option1: question.option1,
            option2: question.option2,
            option3: question.option3,
            option4: question.option4,
            correctAnswer: question.correctAnswer,
            category: question.category,
            level: question.level
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    fetchQuestions();
                }
            } catch (error) {
                console.error('Error deleting question:', error);
            }
        }
    };

    const filteredQuestions = questions.filter(q => {
        const content = q.content || '';
        const category = q.category || '';
        const level = q.level || '';

        const matchesSearch = content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            category.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = filterCategory === 'All' || 
                              category.toLowerCase() === filterCategory.toLowerCase();
        
        const matchesLevel = filterLevel === 'All' || 
                           level.toLowerCase() === filterLevel.toLowerCase();

        return matchesSearch && matchesCategory && matchesLevel;
    });


    // Stats
    const totalQuestions = questions.length;
    const easyCount = questions.filter(q => q.level?.toLowerCase() === 'easy').length;
    const mediumCount = questions.filter(q => q.level?.toLowerCase() === 'medium').length;
    const hardCount = questions.filter(q => q.level?.toLowerCase() === 'hard').length;


    return (
        <div className="rm-page">
            <div className="rm-header">
                <div>
                    <h2 className="rm-title">Manage Questions</h2>
                    <p className="rm-subtitle">Add, edit, or remove questions from the assessment bank</p>
                </div>
                {!isModalOpen && (
                    <button className="btn-add-new" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                        <Plus size={18} /> Add New Question
                    </button>
                )}
            </div>

            {!isModalOpen && (
                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-value">{totalQuestions}</span>
                        <span className="stat-label">Total Questions</span>
                    </div>
                    <div className="stat-card stat-free">
                        <span className="stat-value">{easyCount}</span>
                        <span className="stat-label">Easy Level</span>
                    </div>
                    <div className="stat-card stat-paid">
                        <span className="stat-value">{mediumCount}</span>
                        <span className="stat-label">Medium Level</span>
                    </div>
                    <div className="stat-card stat-rating">
                        <span className="stat-value">{hardCount}</span>
                        <span className="stat-label">Hard Level</span>
                    </div>
                </div>
            )}

            <div className="rm-card table-card">
                <div className="filter-row">
                    <div className="search-box">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search questions or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="All">All Categories</option>
                        <option value="Java">Java</option>
                        <option value="HTML">HTML</option>
                        <option value="CSS">CSS</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="React">React</option>
                        <option value="Python">Python</option>
                        <option value="SQL">SQL</option>
                        <option value="Spring Boot">Spring Boot</option>
                        <option value="Node.js">Node.js</option>
                        <option value="AWS">AWS</option>
                        <option value="Git">Git</option>
                        <option value="Docker">Docker</option>
                        <option value="Kubernetes">Kubernetes</option>
                        <option value="C#">C#</option>
                        <option value="C++">C++</option>
                    </select>
                    <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
                        <option value="All">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <div className="table-card-header">
                    <span className="table-count">{filteredQuestions.length} of {totalQuestions} questions</span>
                </div>

                <div className="rm-table-wrap">
                    <table className="rm-table">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Category</th>
                                <th>Level</th>
                                <th>Correct Answer</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.map((q) => (
                                <tr key={q.id}>
                                    <td className="td-title" style={{ maxWidth: '400px', whiteSpace: 'normal' }}>
                                        {q.content}
                                    </td>
                                    <td><span className="badge badge-category">{q.category}</span></td>
                                    <td>
                                        <span className={`badge badge-${q.level.toLowerCase()}`}>
                                            {q.level}
                                        </span>
                                    </td>
                                    <td className="td-price" style={{ color: '#0ea5e9' }}>{q.correctAnswer}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="act-btn act-edit" onClick={() => handleEdit(q)} title="Edit">
                                                <Pencil size={14} />
                                            </button>
                                            <button className="act-btn act-delete" onClick={() => handleDelete(q.id)} title="Delete">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content animate-fade-in">
                        <div className="modal-header">
                            <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Question Content</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter question text here..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Option 1</label>
                                    <input type="text" name="option1" value={formData.option1} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Option 2</label>
                                    <input type="text" name="option2" value={formData.option2} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Option 3</label>
                                    <input type="text" name="option3" value={formData.option3} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Option 4</label>
                                    <input type="text" name="option4" value={formData.option4} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Correct Answer</label>
                                    <input type="text" name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} required placeholder="Must match one of the options" />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange}>
                                        <option value="Java">Java</option>
                                        <option value="HTML">HTML</option>
                                        <option value="CSS">CSS</option>
                                        <option value="JavaScript">JavaScript</option>
                                        <option value="React">React</option>
                                        <option value="Python">Python</option>
                                        <option value="SQL">SQL</option>
                                        <option value="Spring Boot">Spring Boot</option>
                                        <option value="Node.js">Node.js</option>
                                        <option value="AWS">AWS</option>
                                        <option value="Git">Git</option>
                                        <option value="Docker">Docker</option>
                                        <option value="Kubernetes">Kubernetes</option>
                                        <option value="C#">C#</option>
                                        <option value="C++">C++</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Level</label>
                                    <select name="level" value={formData.level} onChange={handleInputChange}>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingQuestion ? 'Update Question' : 'Save Question'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionManagement;

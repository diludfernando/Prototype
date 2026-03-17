import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Brain, Trophy, ChevronLeft } from 'lucide-react';
import './LevelSelection.css';

const LevelSelection = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = React.useState('Java');

    const handleLevelSelect = (level) => {
        if (level === 'easy') {
            navigate(`/assessment/beginner?category=${selectedCategory}`);
        } else if (level === 'medium') {
            navigate(`/assessment/intermediate?category=${selectedCategory}`)

        } else if (level === 'hard') {
            navigate(`/assessment/advanced?category=${selectedCategory}`);
        } else {
            navigate(`/assessment/quiz?category=${selectedCategory}`, { state: { level } });
        }
    };

    const handleBack = () => {
        navigate('/services');
    };

    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8082/api/questions/categories');
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                    if (data.length > 0 && selectedCategory === 'Java') {
                        setSelectedCategory(data[0]); // Default to first available category
                    }
                } else {
                    console.error('Failed to fetch categories');
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const levels = [
        {
            id: 'easy',
            title: 'Beginner',
            icon: <GraduationCap size={48} />,
            description: 'New to web development? Start here with fundamental concepts.',
            color: 'var(--color-accent)',
            questions: '10 Questions'

        },
        {
            id: 'medium',
            title: 'Intermediate',
            icon: <Brain size={48} />,
            description: 'Test your practical knowledge and problem-solving skills.',
            color: '#f59e0b', // Amber
            questions: '15 Questions'
        },
        {
            id: 'hard',
            title: 'Advanced',
            icon: <Trophy size={48} />,
            description: 'Deep dive into complex topics and edge cases.',
            color: '#ef4444', // Red
            questions: '20 Questions'
        }
    ];

    return (
        <div className="level-selection-container">
            <div className="back-button-wrapper">
                <button className="back-button" onClick={handleBack}>
                    <ChevronLeft size={20} />
                    <span>Back to Services</span>
                </button>
            </div>

            <div className="level-header">
                <h1>Select Your Level</h1>
                <p>Choose a category and difficulty level to start your assessment.</p>
            </div>

            <div className="category-selection">
                <h3>Choose Category</h3>
                <div className="category-buttons">
                    {isLoadingCategories ? (
                        <p>Loading categories...</p>
                    ) : categories.length > 0 ? (
                        categories.map((cat) => (
                            <button
                                key={cat}
                                className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))
                    ) : (
                        <p>No categories found.</p>
                    )}
                </div>
            </div>

            <div className="levels-grid">
                {levels.map((level) => (
                    <div
                        key={level.id}
                        className="level-card"
                        onClick={() => handleLevelSelect(level.id)}
                    >
                        <div className="level-icon" style={{ Color: level.color }}>
                            {level.icon}
                        </div>
                        <h2>{level.title}</h2>
                        <p>{level.description}</p>
                        <div className="level-footer">
                            <span>{level.questions}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LevelSelection;

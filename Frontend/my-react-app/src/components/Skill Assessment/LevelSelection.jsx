import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Brain, Trophy, ChevronLeft, Lock } from 'lucide-react';
import './LevelSelection.css';

const LevelSelection = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = React.useState('Java');
    const [skillProgress, setSkillProgress] = useState(null);

    const fetchSkillProgress = async (category) => {
        const username = localStorage.getItem('username');
        if (!username || !category) return;

        try {
            const response = await fetch(`http://localhost:8082/api/progress/${username}/category/${encodeURIComponent(category)}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`Fetched progress for ${category}:`, data);
                setSkillProgress(data);
            }
        } catch (error) {
            console.error('Error fetching skill progress:', error);
        }
    };

    useEffect(() => {
        fetchSkillProgress(selectedCategory);
    }, [selectedCategory]);

    const isLevelLocked = (levelId) => {
        if (!skillProgress) return levelId !== 'easy'; 
        
        const highest = skillProgress.highestLevelPassed?.toLowerCase() || 'none';
        console.log(`Checking lock for ${levelId}, Highest Passed: ${highest}`);
        
        if (levelId === 'easy') return false; // Beginner is always open
        
        // Intermediate (medium) unlocks if Beginner (easy) or higher is passed
        if (levelId === 'medium') {
            return !['beginner', 'intermediate', 'advanced'].includes(highest);
        }
        
        // Advanced (hard) unlocks if Intermediate (medium) or higher is passed
        if (levelId === 'hard') {
            return !['intermediate', 'advanced'].includes(highest);
        }
        
        return false;
    };

    const handleLevelSelect = (level) => {
        if (isLevelLocked(level)) {
            alert("Please clear the previous level first!");
            return;
        }

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
                        className={`level-card ${isLevelLocked(level.id) ? 'locked' : ''}`}
                        onClick={() => handleLevelSelect(level.id)}
                    >
                        {isLevelLocked(level.id) && (
                            <div className="lock-overlay">
                                <Lock size={32} />
                            </div>
                        )}
                        <div className="level-icon" style={{ color: level.color }}>
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

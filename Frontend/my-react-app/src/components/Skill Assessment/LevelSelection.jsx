import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Brain, Trophy } from 'lucide-react';
import './LevelSelection.css';

const LevelSelection = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = React.useState('Java');

    const handleLevelSelect = (level) => {
        if (level === 'easy') {
            navigate(`/assessment/beginner?category=${selectedCategory}`);
        } else if(level === 'medium'){
            navigate(`/assessment/intermediate?category=${selectedCategory}`)

        } else if (level === 'hard') {
            navigate(`/assessment/advanced?category=${selectedCategory}`);
        } else {
            navigate(`/assessment/quiz?category=${selectedCategory}`, { state: { level } });
        }
    };

    const categories = ['Java', 'HTML', 'CSS', 'JavaScript', 'React'];

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
            <div className="level-header">
                <h1>Select Your Level</h1>
                <p>Choose a category and difficulty level to start your assessment.</p>
            </div>

            <div className="category-selection">
                <h3>Choose Category</h3>
                <div className="category-buttons">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
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

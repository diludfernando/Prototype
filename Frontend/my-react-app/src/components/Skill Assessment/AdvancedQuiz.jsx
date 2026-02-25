import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, AlertCircle, RotateCcw, ArrowLeft, ChevronRight, Award, Star, CheckCircle, Target, ShieldCheck } from 'lucide-react';
import './AdvancedQuiz.css';

const AdvancedQuiz = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category') || 'Java';
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedback, setFeedback] = useState({ title: '', message: '' });
    const [isSavingResult, setIsSavingResult] = useState(false);

    useEffect(() => {
        const fetchAdvancedQuestions = async () => {
            try {
                // Fetching Hard level questions for the category
                const response = await fetch(`http://localhost:8082/api/questions?level=Hard&category=${category}`);
                if (!response.ok) throw new Error('Failed to fetch advanced questions');
                const data = await response.json();

                if (data.length === 0) {
                    setError(`No advanced level questions for ${category} available at the moment.`);
                } else {
                    const mappedQuestions = data.map(q => ({
                        id: q.id,
                        question: q.content,
                        options: [q.option1, q.option2, q.option3, q.option4],
                        correctAnswer: [q.option1, q.option2, q.option3, q.option4].indexOf(q.correctAnswer)
                    }));
                    // Advanced quiz usually has more questions, taking up to 20
                    setQuestions(mappedQuestions.slice(0, 20));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAdvancedQuestions();
    }, [category]);

    const handleOptionClick = (index) => {
        setSelectedOption(index);
    };

    const handleNextQuestion = () => {
        if (selectedOption !== null) {
            let currentScore = score;
            if (selectedOption === questions[currentQuestion].correctAnswer) {
                currentScore = score + 1;
                setScore(currentScore);
            }

            goToNext(currentScore);
        }
    };

    const handleSkip = () => {
        goToNext(score);
    };

    const goToNext = (currentScore) => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
            setSelectedOption(null);
        } else {
            handleQuizCompletion(currentScore);
        }
    };

    const handleQuizCompletion = async (finalScore) => {
        setIsSavingResult(true);

        // --- HARDCODED FEEDBACK LOGIC ---
        const percentage = (finalScore / questions.length) * 100;
        let localTitle, localMessage;

        if (percentage >= 95) {
            localTitle = "Legendary Elite Performance!";
            localMessage = "Unsurpassed mastery. You have officially conquered the summit of our advanced curriculum.";
        } else if (percentage >= 85) {
            localTitle = "Elite Precision!";
            localMessage = "Exceptional performance. Your command of the material is clearly in the top tier of practitioners.";
        } else if (percentage >= 70) {
            localTitle = "Advanced Practitioner!";
            localMessage = "Strong command! You've successfully navigated a highly challenging assessment with notable skill.";
        } else {
            localTitle = "Advanced Challenge";
            localMessage = "You've tackled high-level questions. Focus on the core advanced patterns to elevate your performance!";
        }

        setFeedback({ title: localTitle, message: localMessage });
        // --------------------------------

        try {
            const username = localStorage.getItem('username') || 'Expert User';
            await fetch('http://localhost:8082/api/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    score: finalScore,
                    totalQuestions: questions.length,
                    category,
                    level: 'Advanced'
                }),
            });
            setShowScore(true);
        } catch (err) {
            console.error('Error saving result:', err);
            setShowScore(true);
        } finally {
            setIsSavingResult(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowScore(false);
        setSelectedOption(null);
    };

    const getResultIcon = () => {
        const percentage = (score / questions.length) * 100;
        if (percentage >= 90) return <Award size={80} color="#0ea5e9" />;
        if (percentage >= 70) return <Trophy size={80} color="#0ea5e9" />;
        return <ShieldCheck size={80} color="#0ea5e9" />;
    };

    if (loading) {
        return (
            <div className="advanced-quiz-page">
                <div className="quiz-premium-card loading text-center">
                    <div className="loader mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-slate-600">Loading Elite Assessment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="advanced-quiz-page">
                <div className="quiz-premium-card error text-center">
                    <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
                    <h2 className="text-2xl font-bold mb-2">Notice</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button className="action-btn-premium mx-auto" onClick={() => navigate('/services')}>
                        Return to Hub
                    </button>
                </div>
            </div>
        );
    }

    const title = feedback.title;
    const msg = feedback.message;
    const icon = getResultIcon();
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="advanced-quiz-page typography-inter advanced-theme">
            {isSavingResult ? (
                <div className="quiz-premium-card loading text-center">
                    <div className="loader mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-slate-600">Processing Elite Credentials...</p>
                </div>
            ) : showScore ? (
                <div className="quiz-premium-card results-fade-in">
                    <div className="results-premium-redesign">
                        <div className="results-header-premium">
                            <div className="trophy-badge-container">
                                {icon}
                            </div>
                            <h2 className="result-title-premium-new">{title}</h2>
                            <p className="result-message-premium-new">{msg}</p>
                        </div>

                        <div className="results-main-content">
                            <div className="score-ring-wrapper">
                                <svg className="progress-ring" width="160" height="160">
                                    <circle
                                        className="progress-ring__circle-bg"
                                        stroke="#f1f5f9"
                                        strokeWidth="12"
                                        fill="transparent"
                                        r="70"
                                        cx="80"
                                        cy="80"
                                    />
                                    <circle
                                        className="progress-ring__circle"
                                        stroke="url(#advancedScoreGradient)"
                                        strokeWidth="12"
                                        strokeDasharray={`${2 * Math.PI * 70}`}
                                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / questions.length)}`}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r="70"
                                        cx="80"
                                        cy="80"
                                    />
                                    <defs>
                                        <linearGradient id="advancedScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#0ea5e9" />
                                            <stop offset="100%" stopColor="#38bdf8" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="score-ring-text">
                                    <span className="score-num-big">{score}</span>
                                    <span className="score-total-small">/ {questions.length}</span>
                                </div>
                            </div>

                            <div className="results-stats-grid">
                                <div className="stat-item-premium">
                                    <div className="stat-icon-wrapper accuracy" style={{ color: '#0ea5e9' }}>
                                        <Target size={20} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{Math.round((score / questions.length) * 100)}%</span>
                                        <span className="stat-label">Expertise</span>
                                    </div>
                                </div>
                                <div className="stat-item-premium">
                                    <div className="stat-icon-wrapper correct" style={{ color: '#0ea5e9' }}>
                                        <CheckCircle size={20} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{score}</span>
                                        <span className="stat-label">Mastered</span>
                                    </div>
                                </div>
                                <div className="stat-item-premium">
                                    <div className="stat-icon-wrapper total" style={{ color: '#0ea5e9' }}>
                                        <Award size={20} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{questions.length}</span>
                                        <span className="stat-label">Total Challenges</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="result-actions-premium-new">
                            <button className="btn-retake-premium" onClick={resetQuiz} style={{ borderColor: '#0ea5e9', color: '#0ea5e9' }}>
                                <RotateCcw size={18} /> Re-challenge
                            </button>
                            <button className="btn-finish-premium" onClick={() => navigate('/services')} style={{ backgroundColor: '#0ea5e9' }}>
                                Master Dashboard <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="quiz-layout-wrapper">
                    <div className="quiz-top-info">
                        <span className="info-text">Challenge {currentQuestion + 1} of {questions.length}</span>
                        <span className="info-text">{Math.round(progress)}% Complete</span>
                    </div>

                    <div className="full-width-progress">
                        <div className="progress-fill-main" style={{ width: `${progress}%`, backgroundColor: '#0ea5e9' }}></div>
                    </div>

                    <div className="quiz-premium-card redesigned-card advanced-border">
                        <div className="card-header-grid">
                            <div className="flex items-center gap-1 text-sky-600 font-bold">
                                <ShieldCheck size={16} /> Elite Level
                            </div>
                            <div className="timer-display"></div>
                            <span className="difficulty-badge" style={{ backgroundColor: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd' }}>Advanced</span>
                        </div>

                        <div className="question-centering">
                            <h2 className="main-question-text">{questions[currentQuestion].question}</h2>
                        </div>

                        <div className="options-grid-redesigned">
                            {questions[currentQuestion].options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`modern-option-btn advanced-option ${selectedOption === index ? 'selected-advanced' : ''}`}
                                    onClick={() => handleOptionClick(index)}
                                >
                                    <span className="option-index">{String.fromCharCode(65 + index)}</span>
                                    <span className="option-label">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="quiz-footer-actions">
                        <button className="skip-btn" onClick={handleSkip}>
                            <RotateCcw size={18} /> Skip
                        </button>
                        <button
                            className="next-question-btn"
                            onClick={handleNextQuestion}
                            disabled={selectedOption === null}
                            style={{ backgroundColor: '#0ea5e9' }}
                        >
                            Next Challenge <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedQuiz;

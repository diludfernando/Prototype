import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, AlertCircle, RotateCcw, ArrowLeft, ChevronRight, Award, Star, CheckCircle, Target } from 'lucide-react';
import './BeginnerQuiz.css';

const BeginnerQuiz = () => {
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
    const [timeLeft, setTimeLeft] = useState(0); // Timer state
    const [feedback, setFeedback] = useState({ title: '', message: '' });
    const [isSavingResult, setIsSavingResult] = useState(false);

    useEffect(() => {
        const fetchBeginnerQuestions = async () => {
            try {
                const response = await fetch(`http://localhost:8082/api/questions?level=Easy&category=${category}`);
                if (!response.ok) throw new Error('Failed to fetch beginner questions');
                const data = await response.json();

                if (data.length === 0) {
                    setError(`No beginner level questions for ${category} available at the moment.`);
                } else {
                    const mappedQuestions = data.map(q => ({
                        id: q.id,
                        question: q.content,
                        options: [q.option1, q.option2, q.option3, q.option4],
                        correctAnswer: [q.option1, q.option2, q.option3, q.option4].indexOf(q.correctAnswer)
                    }));
                    setQuestions(mappedQuestions.slice(0, 10));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBeginnerQuestions();
    }, []);



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

        if (percentage === 100) {
            localTitle = "Absolute Perfection!";
            localMessage = "You've mastered the basics! Ready for the Intermediate challenge?";
        } else if (percentage >= 80) {
            localTitle = "Excellent Work!";
            localMessage = "You have a solid foundation. Keep pushing forward!";
        } else if (percentage >= 50) {
            localTitle = "Good Job!";
            localMessage = "You're on the right track. A bit more practice and you'll be an expert.";
        } else {
            localTitle = "Keep Learning!";
            localMessage = "Review the basics and try again. Practice makes perfect.";
        }

        setFeedback({ title: localTitle, message: localMessage });
        // --------------------------------

        try {
            const username = localStorage.getItem('username') || 'Anonymous';
            await fetch('http://localhost:8082/api/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    score: finalScore,
                    totalQuestions: questions.length,
                    category,
                    level: 'Beginner'
                }),
            });
            // We just fire-and-forget the save now, or at least don't wait for its feedback
            setShowScore(true);
        } catch (err) {
            console.error('Error saving result:', err);
            setShowScore(true); // Still show score even if save fails
        } finally {
            setIsSavingResult(false);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowScore(false);
        setSelectedOption(null);
        setTimeLeft(0);
    };

    const getResultIcon = () => {
        const percentage = (score / questions.length) * 100;
        if (percentage === 100) return <Award size={80} color="#f59e0b" />;
        if (percentage >= 80) return <Trophy size={80} color="#f59e0b" />;
        if (percentage >= 50) return <Star size={80} color="#f59e0b" />;
        return <RotateCcw size={80} color="#64748b" />;
    };

    if (loading) {
        return (
            <div className="beginner-quiz-page">
                <div className="quiz-premium-card loading text-center">
                    <div className="loader mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-slate-600">Preparing your professional assessment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="beginner-quiz-page">
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
        <div className="beginner-quiz-page typography-inter">
            {isSavingResult ? (
                <div className="quiz-premium-card loading text-center">
                    <div className="loader mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-slate-600">Registering your professional results...</p>
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
                            {/* Score Ring Section */}
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
                                        stroke="url(#scoreGradient)"
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
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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

                            {/* Stats Grid */}
                            <div className="results-stats-grid">
                                <div className="stat-item-premium">
                                    <div className="stat-icon-wrapper accuracy">
                                        <Target size={20} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{Math.round((score / questions.length) * 100)}%</span>
                                        <span className="stat-label">Accuracy</span>
                                    </div>
                                </div>
                                <div className="stat-item-premium">
                                    <div className="stat-icon-wrapper correct">
                                        <CheckCircle size={20} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{score}</span>
                                        <span className="stat-label">Correct</span>
                                    </div>
                                </div>
                                <div className="stat-item-premium">
                                    <div className="stat-icon-wrapper total">
                                        <Award size={20} />
                                    </div>
                                    <div className="stat-info">
                                        <span className="stat-value">{questions.length}</span>
                                        <span className="stat-label">Total</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="result-actions-premium-new">
                            <button className="btn-retake-premium" onClick={resetQuiz}>
                                <RotateCcw size={18} /> Retake Assessment
                            </button>
                            <button className="btn-finish-premium" onClick={() => navigate('/services')}>
                                Return to Dashboard <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="quiz-layout-wrapper">
                    {/* Top Progress Info */}
                    <div className="quiz-top-info">
                        <span className="info-text">Question {currentQuestion + 1} of {questions.length}</span>
                        <span className="info-text">{Math.round(progress)}% Complete</span>
                    </div>

                    <div className="full-width-progress">
                        <div className="progress-fill-main" style={{ width: `${progress}%` }}></div>
                    </div>

                    {/* Centered Quiz Card */}
                    <div className="quiz-premium-card redesigned-card beginner-border">
                        <div className="card-header-grid">
                            <span className="points-badge">Points are graded</span>
                            <div className="timer-display">


                            </div>
                            <span className="difficulty-badge">Beginner</span>
                        </div>

                        <div className="question-centering">
                            <h2 className="main-question-text">{questions[currentQuestion].question}</h2>
                        </div>

                        <div className="options-grid-redesigned">
                            {questions[currentQuestion].options.map((option, index) => (
                                <button
                                    key={index}
                                    className={`modern-option-btn ${selectedOption === index ? 'selected' : ''}`}
                                    onClick={() => handleOptionClick(index)}
                                >
                                    <span className="option-index">{String.fromCharCode(65 + index)}</span>
                                    <span className="option-label">{option}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="quiz-footer-actions">
                        <button className="skip-btn" onClick={handleSkip}>
                            <RotateCcw size={18} /> Skip
                        </button>
                        <button
                            className="next-question-btn"
                            onClick={handleNextQuestion}
                            disabled={selectedOption === null}
                        >
                            Next Question <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BeginnerQuiz;

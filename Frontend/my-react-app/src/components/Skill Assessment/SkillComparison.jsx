import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    CheckCircle2,
    AlertCircle,
    Circle,
    Zap,
    Target,
    Award,
    Briefcase,
    ArrowRight,
    Loader2
} from 'lucide-react';
import './SkillComparison.css';

const SkillComparison = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false); // New state for analysis button loading

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            const username = localStorage.getItem('username');
            const targetRole = location.state?.targetRole;

            if (!username || !targetRole) {
                setLoading(false);
                return;
            }

            try {
                // Call the new Skill Gap Analysis API
                const url = `http://localhost:8082/api/gap-analysis?username=${username}&jobTitle=${encodeURIComponent(targetRole)}`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    // The backend now returns: 
                    // targetRole, matchPercentage, analysis (array of GapAnalysisResult), and userSkills

                    const jobRequirements = data.analysis.map(res => ({
                        name: res.language,
                        importance: res.requiredLevel || "High",
                        isMatched: res.matched,
                        message: res.message
                    }));

                    setMatchData({
                        targetRole: data.targetRole,
                        matchPercentage: data.matchPercentage,
                        userSkills: data.userSkills,
                        jobRequirements
                    });
                }
            } catch (err) {
                console.error('Error fetching comparison data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [location.state]);

    if (loading) {
        return (
            <div className="skill-comparison-page flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-accent mb-4 mx-auto" size={48} />
                    <p className="text-lg text-muted">Calculating your skill gap...</p>
                </div>
            </div>
        );
    }

    // Default mock data if no real data could be matched
    const defaultData = {
        targetRole: location.state?.targetRole || "Frontend Developer",
        matchPercentage: 0,
        userSkills: [],
        jobRequirements: []
    };

    const data = matchData || defaultData;

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        // Simulate analysis process delay
        setTimeout(() => {
            setIsAnalyzing(false);
            navigate('/gap-results', { state: { matchData: data } });
        }, 2000);
    };

    return (
        <div className="skill-comparison-page animate-fade-in">
            <div className="container">
                <button className="back-btn" onClick={() => navigate('/skill-gap-analysis')}>
                    <ChevronLeft size={18} />
                    Back to Selection
                </button>

                <header className="comparison-header">
                    <div className="header-content">
                        <div className="title-section">
                            <span className="badge">Role Comparison</span>
                            <h1>{data.targetRole}</h1>
                            <p className="subtitle">Detailed skill gap analysis between you and the industry requirements.</p>
                        </div>

                        <div className="score-card">
                            <div className="score-circle">
                                <svg viewBox="0 0 36 36" className="circular-chart">
                                    <path className="circle-bg"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path className="circle"
                                        strokeDasharray={`${data.matchPercentage}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <text x="18" y="20.35" className="percentage">{data.matchPercentage}%</text>
                                </svg>
                            </div>
                            <div className="score-info">
                                <h3>Match Score</h3>
                                <p>Overall Compatibility</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="comparison-grid">
                    {/* Your Skills */}
                    <div className="comparison-column user-column">
                        <div className="column-header">
                            <div className="icon-box user-icon">
                                <Award size={24} />
                            </div>
                            <h2>Your Skills</h2>
                        </div>
                        <div className="skills-list">
                            {data.userSkills.map((skill, idx) => (
                                <div key={idx} className="skill-row animate-slide-right" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div className="skill-info">
                                        <span className="skill-name">{skill.name}</span>
                                        <span className="skill-level">{skill.level}</span>
                                    </div>
                                    <div className={`status-icon ${skill.status}`}>
                                        {skill.status === 'matched' ? <CheckCircle2 size={18} /> : <Circle size={18} className="outline" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="comparison-divider">
                        <div className="divider-line"></div>
                        <div className="vs-badge">VS</div>
                        <div className="divider-line"></div>
                    </div>

                    {/* Job Requirements */}
                    <div className="comparison-column job-column">
                        <div className="column-header">
                            <div className="icon-box job-icon">
                                <Target size={24} />
                            </div>
                            <h2>Job Requirements</h2>
                        </div>
                        <div className="skills-list">
                            {data.jobRequirements.map((req, idx) => (
                                <div key={idx} className="skill-row animate-slide-left" style={{ animationDelay: `${idx * 0.1}s` }}>
                                    <div className="skill-info">
                                        <span className="skill-name">{req.name}</span>
                                        <span className={`importance-tag ${req.importance.toLowerCase()}`}>
                                            {req.importance} Priority
                                        </span>
                                        {req.message && req.message !== 'Skill matched!' && (
                                            <div className="text-xs text-red-500 font-medium mt-1">{req.message}</div>
                                        )}
                                    </div>
                                    <div className={`status-icon ${req.isMatched ? 'success' : 'warning'}`}>
                                        {req.isMatched ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="action-footer">
                    <button 
                        className={`btn-primary analyze-btn ${isAnalyzing ? 'analyzing' : ''}`} 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                Analysing Gap...
                                <Loader2 size={20} className="animate-spin" />
                            </>
                        ) : (
                            <>
                                Skill Gap Analysis
                                <Zap size={20} />
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SkillComparison;

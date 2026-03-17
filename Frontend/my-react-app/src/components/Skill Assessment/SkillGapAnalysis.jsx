import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Briefcase, ChevronLeft, CheckCircle, XCircle } from 'lucide-react';
import './SkillGapAnalysis.css';

const SkillGapAnalysis = () => {
    const navigate = useNavigate();
    const [currentRole, setCurrentRole] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);

    const handleAnalyze = (e) => {
        e.preventDefault();
        if (!currentRole || !targetRole) return;

        setIsAnalyzing(true);
        // Simulate an API call or analysis process
        setTimeout(() => {
            setResults({
                matchPercentage: 65,
                matchedSkills: ['JavaScript', 'React', 'HTML/CSS', 'Problem Solving'],
                missingSkills: ['Node.js', 'System Architecture', 'AWS', 'GraphQL']
            });
            setIsAnalyzing(false);
        }, 1500);
    };

    const handleBack = () => {
        navigate('/services');
    };

    return (
        <div className="skill-gap-page animate-fade-in">
            <div className="container">
                <button className="back-button" onClick={handleBack}>
                    <ChevronLeft size={20} />
                    <span>Back to Services</span>
                </button>

                <header className="skill-gap-header text-center whitespace-pre-line">
                    <div className="icon-container mx-auto">
                        <Target size={48} className="header-icon" />
                    </div>
                    <h1 className="text-4xl font-bold">Skill Gap Analysis</h1>
                    <p className="text-lg text-muted mt-2">Discover what it takes to land your dream job.</p>
                </header>

                {!results ? (
                    <div className="analysis-form-card">
                        <form onSubmit={handleAnalyze}>
                            <div className="form-group">
                                <label htmlFor="currentRole">Current Role</label>
                                <div className="input-wrapper">
                                    <Briefcase size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        id="currentRole"
                                        placeholder="e.g. Frontend Developer"
                                        value={currentRole}
                                        onChange={(e) => setCurrentRole(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="targetRole">Dream Job (Target Role)</label>
                                <div className="input-wrapper">
                                    <Target size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        id="targetRole"
                                        placeholder="e.g. Full Stack Engineer"
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`btn-primary w-full ${isAnalyzing ? 'analyzing' : ''}`}
                                disabled={isAnalyzing || !currentRole || !targetRole}
                            >
                                {isAnalyzing ? 'Analyzing...' : 'Analyze My Gap'}
                                {!isAnalyzing && <ArrowRight size={20} />}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="results-container animate-slide-up">
                        <div className="results-header text-center">
                            <h2 className="text-2xl font-bold">Analysis Complete</h2>
                            <p className="text-muted">You are a {results.matchPercentage}% match for a {targetRole} role.</p>

                            <div className="progress-bar-container mt-4">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${results.matchPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="skills-grid mt-8">
                            <div className="skills-card matched">
                                <h3><CheckCircle size={20} /> Skills You Have</h3>
                                <ul className="skills-list">
                                    {results.matchedSkills.map((skill, index) => (
                                        <li key={index} className="skill-item has-skill">{skill}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="skills-card missing">
                                <h3><XCircle size={20} /> Skills You Need</h3>
                                <ul className="skills-list">
                                    {results.missingSkills.map((skill, index) => (
                                        <li key={index} className="skill-item need-skill">{skill}</li>
                                    ))}
                                </ul>
                                <button className="btn-outline mt-4 w-full" onClick={() => navigate('/learning-resources')}>
                                    Find Learning Resources
                                </button>
                            </div>
                        </div>

                        <div className="text-center mt-8">
                            <button className="btn-secondary" onClick={() => setResults(null)}>
                                Try Another Role
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillGapAnalysis;

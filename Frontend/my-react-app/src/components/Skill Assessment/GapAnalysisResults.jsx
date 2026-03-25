import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, Zap, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import './GapAnalysisResults.css';

const GapAnalysisResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const matchData = location.state?.matchData;

    if (!matchData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2>No analysis data found.</h2>
                <button className="btn-primary mt-4" onClick={() => navigate('/skill-gap-analysis')}>Go Back</button>
            </div>
        );
    }

    // Filter out matched requirements to find the gaps
    const gaps = matchData.jobRequirements.filter(req => !req.isMatched);

    return (
        <div className="gap-results-page animate-fade-in">
            <div className="container">
                <header className="page-header">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={24} />
                    </button>
                    <div className="header-titles">
                        <span className="badge-new">Analysis Complete</span>
                        <h1>Personalized Learning Path</h1>
                        <p className="subtitle">Based on your gap analysis for <strong>{matchData.targetRole}</strong>, here are the areas you need to improve.</p>
                    </div>
                </header>

                {gaps.length === 0 ? (
                    <div className="success-state">
                        <div className="success-icon-wrapper">
                            <CheckCircle2 size={64} className="text-green-500" />
                        </div>
                        <h2>You're Ready!</h2>
                        <p>You meet all the requirements for this role. Consider applying for open positions.</p>
                        <button className="btn-primary mt-6" onClick={() => navigate('/jobs')}>
                            View Jobs <ArrowRight size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="gaps-container">
                        <div className="gaps-header">
                            <AlertCircle size={24} className="text-amber-500" />
                            <h3>Skills to Improve ({gaps.length})</h3>
                        </div>
                        
                        <div className="gaps-grid">
                            {gaps.map((gap, index) => (
                                <div key={index} style={{ padding: '20px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <BookOpen size={24} color="#3B82F6" />
                                        <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#1E293B', fontWeight: 'bold' }}>{gap?.name || 'Unknown Skill'}</h4>
                                    </div>
                                    <span style={{ display: 'inline-block', width: 'fit-content', padding: '4px 8px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '4px', fontSize: '0.875rem' }}>
                                        Required: {gap?.importance || 'High'} Priority
                                    </span>
                                    <p style={{ margin: 0, color: '#475569' }}>{gap?.message || 'You need to improve this skill.'}</p>
                                    <button 
                                        className="btn-primary" 
                                        style={{ marginTop: '10px', width: '100%' }}
                                        onClick={() => navigate('/learning-resources')}
                                    >
                                        Find Courses
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GapAnalysisResults;

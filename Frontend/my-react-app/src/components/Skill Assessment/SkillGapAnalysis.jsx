import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Briefcase, ChevronLeft, CheckCircle, XCircle, Loader2, Zap, Award } from 'lucide-react';
import './SkillGapAnalysis.css';

const SkillGapAnalysis = () => {
    const navigate = useNavigate();
    const [currentRole, setCurrentRole] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [availableJobs, setAvailableJobs] = useState([]);
    const [userSkills, setUserSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            const username = localStorage.getItem('username');
            
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch Profile for Current Career Path
                const profileResponse = await fetch('http://localhost:8081/api/student/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const profileData = await profileResponse.json();
                if (profileResponse.ok && profileData.success) {
                    setCurrentRole(profileData.data.selectedCareerPath || '');
                }

                // Fetch Quiz Categories for "Your Skills"
                if (username) {
                    const resultsResponse = await fetch(`http://localhost:8082/api/results/${username}`);
                    if (resultsResponse.ok) {
                        const resultsData = await resultsResponse.json();
                        // Extract unique categories
                        const uniqueCategories = [...new Set(resultsData.map(res => res.category))];
                        setUserSkills(uniqueCategories);
                    }
                }

                // Fetch Available Jobs for Dropdown
                const jobsResponse = await fetch('http://localhost:8085/api/jobs');
                if (jobsResponse.ok) {
                    const jobsData = await jobsResponse.json();
                    setAvailableJobs(jobsData);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleNext = (e) => {
        e.preventDefault();
        if (!currentRole || !targetRole) return;
        
        // Navigate directly to comparison page
        navigate('/skill-comparison', { 
            state: { 
                currentRole, 
                targetRole
            } 
        });
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

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <Loader2 className="animate-spin text-accent mb-4" size={40} />
                        <p className="text-muted">Loading your profile data...</p>
                    </div>
                ) : (
                    <>
                        <div className="analysis-form-card">
                            <form onSubmit={handleNext}>
                                <div className="form-group">
                                    <label htmlFor="currentRole">Current Career Path</label>
                                    <div className="input-wrapper">
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
                                        <select
                                            id="targetRole"
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                            required
                                            className="role-select"
                                        >
                                            <option value="">Select your dream job...</option>
                                            {availableJobs.map((job) => (
                                                <option key={job.id} value={job.title}>
                                                    {job.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary w-full"
                                    disabled={!currentRole || !targetRole}
                                >
                                    Next
                                    <ArrowRight size={20} />
                                </button>
                            </form>
                        </div>

                        <div className="your-skills-section animate-slide-up">
                            <div className="your-skills-card">
                                <div className="skill-icon-box">
                                    <Award size={24} />
                                </div>
                                <div className="skills-content">
                                    <h3>Your Skills</h3>
                                    {userSkills.length > 0 ? (
                                        <div className="skills-list-minimal">
                                            {userSkills.map((skill, index) => (
                                                <span key={index} className="skill-badge-premium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-skills-text">Complete quizzes to see your skills here.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SkillGapAnalysis;

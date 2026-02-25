import React from 'react';
import { Award, Clock, Users, MonitorPlay, Zap, Shield } from 'lucide-react';
import './Features.css';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="feature-card">
        <div className="feature-icon">
            <Icon size={32} />
        </div>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description">{description}</p>
    </div>
);

const Features = () => {
    const features = [
        {
            icon: MonitorPlay,
            title: "Skill Analysis",
            description: "Students can acuratly analyze their skills and get a clear idea of what they need to improve."
        },
        {
            icon: Award,
            title: "Certified Skills",
            description: "Earn recognized certificates upon completion to showcase your expertise."
        },
        {
            icon: Users,
            title: "Expert Mentors",
            description: "Get guidance and feedback from industry professionals with years of experience."
        },
        {
            icon: Clock,
            title: "Flexible Scheduling",
            description: "Fit learning into your busy life with bite-sized lessons and mobile access."
        },
        {
            icon: Zap,
            title: "Hands-on Projects",
            description: "Apply what you learn immediately with real-world projects and code labs."
        },
        {
            icon: Shield,
            title: "Counseling Support",
            description: "Receive profetional guidens from experts in the feild that you wanna go."
        }
    ];

    return (
        <section id="features" className="features-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Why Choose SkillBridge?</h2>
                    <p className="section-subtitle">We provide everything you need to master new skills and advance your career.</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;

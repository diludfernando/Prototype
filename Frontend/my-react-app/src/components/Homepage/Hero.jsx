import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-content">
                <div className="hero-text">

                    <h1 className="hero-title">
                        Master the Skills to <span className="text-highlight">Drive Your Career</span>
                    </h1>
                    <p className="hero-subtitle">
                        Join 50,000+ learners worldwide. Access top-rated courses in confident programming, design, and business strategy.
                    </p>
                    <div className="hero-actions">
                        <Link to="/learning-resources" className="btn btn-primary btn-lg">
                            Start Learning Free <ArrowRight size={20} />
                        </Link>

                    </div>


                </div>
                <div className="hero-visual">
                    <div className="abstract-shape shape-1"></div>
                    <div className="abstract-shape shape-2"></div>
                    <div className="hero-card">
                        <div className="card-header">
                            <div className="circle"></div>
                            <div className="lines">
                                <div className="line short"></div>
                                <div className="line long"></div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="stat-item">
                                <span className="stat-value">12k+</span>
                                <span className="stat-label">Students</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">4.9</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

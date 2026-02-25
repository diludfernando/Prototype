import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {




    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <a href="/" className="footer-logo">
                            Skill<span className="text-accent">Bridge</span>
                        </a>
                        <p className="footer-text">
                            Empowering learners worldwide to master new skills and achieve their career goals through world-class education.
                        </p>
                        <div className="social-links">
                            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-title">Platform</h4>
                        <ul className="footer-links">
                            <li><a href="#">Browse Courses</a></li>
                            <li><a href="#">Mentorship</a></li>
                            <li><a href="#">Pricing</a></li>
                            <li><a href="#">For Business</a></li>
                        </ul>
                    </div>




                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
                    <p className="made-with">
                        Made with <Heart size={16} fill="currentColor" className="text-accent" /> for learners everywhere.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

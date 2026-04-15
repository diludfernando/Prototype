import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './Footer.css';
const Footer = () => {
    const location = useLocation();

    const isdashboard = location.pathname.startsWith('/dashboard');
    const isadmin = location.pathname.startsWith('/admin');
    const iscounsellor = location.pathname.startsWith('/counselor') || location.pathname.startsWith('/counsellor');
    const isstudent = location.pathname.startsWith('/student');
    const isassessment = location.pathname.startsWith('/assessment');
    const isSkillComparisonPage = location.pathname.startsWith('/skill-comparison');
    const isITlearningResourcePage = location.pathname.startsWith('/learning-resources');
    const isUserServerPage = location.pathname.startsWith('/services');
    const isViewProfilePage = location.pathname.startsWith('/view-profile');
    const isEditProfilePage = location.pathname.startsWith('/edit-profile');
    const isCompleteProfilePage = location.pathname.startsWith('/complete-profile');
    const isCounselorCompleteProfilePage = location.pathname.startsWith('/counselor/complete-profile');
    const isCounselorDashboardPage = location.pathname.startsWith('/counselor/dashboard');
    const isCounselorEditProfilePage = location.pathname.startsWith('/counselor/edit-profile');
    const isCounselorProfilePage = location.pathname.startsWith('/counselor/profile');
    const isCounselorBookingPage = location.pathname.startsWith('/counselling');
    const isCounselorNewBookingPage = location.pathname.startsWith('/counselling/newbooking');
    const isCounselorPaymentPage = location.pathname.startsWith('/counselling/payment');
    const isCounselorSessionDetailsPage = location.pathname.startsWith('/counselling/session/:id');
    const isCounselorProgressDashboardPage = location.pathname.startsWith('/progress-dashboard');
    const isCounselorJobsPortalPage = location.pathname.startsWith('/jobs');
    const isCounselorJobApplyPage = location.pathname.startsWith('/jobs/apply/:id');
    const isCounselorMyApplicationsPage = location.pathname.startsWith('/applications');
    const isCounselorAddJobPage = location.pathname.startsWith('/admin/add-job');

    if(isdashboard || isadmin || iscounsellor || isstudent || isassessment || isSkillComparisonPage || isITlearningResourcePage 
        || isUserServerPage || isViewProfilePage || isEditProfilePage || isCompleteProfilePage || isCounselorCompleteProfilePage || isCounselorDashboardPage 
        || isCounselorEditProfilePage || isCounselorProfilePage || isCounselorBookingPage || isCounselorNewBookingPage || isCounselorPaymentPage 
        || isCounselorSessionDetailsPage || isCounselorProgressDashboardPage || isCounselorJobsPortalPage || isCounselorJobApplyPage || isCounselorMyApplicationsPage || isCounselorAddJobPage){
    return null;
}


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

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import './Navbar.css';

import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isAssessmentPage = location.pathname.startsWith('/assessment');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isCounsellingPage = location.pathname.startsWith('/counselling');
  const isLearningResourcesPage = location.pathname.startsWith('/learning-resources');
  const isCompleteProfilePage = location.pathname.startsWith('/complete-profile');
  const isViewProfilePage = location.pathname.startsWith('/view-profile');
  const isEditProfilePage = location.pathname.startsWith('/edit-profile');
  const isUserManagementPage = location.pathname.startsWith('/admin/users');
  const isCreateCounselorPage = location.pathname.startsWith('/admin/create-counselor');
  



  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isServicesPage = location.pathname === '/services';

  if (isLoginPage || isRegisterPage || isAdminPage || isAssessmentPage || isServicesPage || isCounsellingPage || isCompleteProfilePage || isViewProfilePage || isEditProfilePage || isUserManagementPage || isCreateCounselorPage || isLearningResourcesPage) {
    return null;
  }
  // Navbar is visible on all pages except login and register
  return (
    <nav className={`navbar ${isScrolled || isAssessmentPage ? 'scrolled' : ''}`}>
      <div className="container navbar-content">
        <Link to="/" className="logo">
          Skill<span className="text-accent">Bridge</span>
        </Link>

        {/* Desktop Menu */}
        <div className="desktop-menu">
          <Link to="/" className="nav-link">Home</Link>

          <a href="#features" className="nav-link">Features</a>
          <Link to="/learning-resources" className="nav-link">Courses</Link>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#about" className="nav-link">About</a>
        </div>

        <div className="desktop-actions">
          <a href="/login" className="nav-link">Log in</a>
          {!isAssessmentPage && (
            <button className="btn btn-primary">
              <Link to="/register">Get Started</Link> <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <Link to="/learning-resources" onClick={() => setMobileMenuOpen(false)}>Courses</Link>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="/login" onClick={() => setMobileMenuOpen(false)}>Log in</a>
            {!isAssessmentPage && (
              <button className="btn btn-primary w-full">Get Started</button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

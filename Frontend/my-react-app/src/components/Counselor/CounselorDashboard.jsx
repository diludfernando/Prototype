import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Clock,
  LogOut,
  Search,
  Bell
} from 'lucide-react';
import './CounselorDashboard.css';

const CounselorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resources'); // Defaulting to resources as per image

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="counselor-dashboard">
      {/* Sidebar */}
      <aside className="c-sidebar">
        <div className="c-sidebar-brand">
          <div className="c-brand-logo">SB</div>
          <span className="c-brand-name">Skill Bridge</span>
        </div>

        <nav className="c-sidebar-nav">
          <button
            className={`c-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
         
        </nav>

        <div className="c-sidebar-footer">
          <button className="c-logout-button" onClick={handleLogout}>
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="c-main-content">
        {/* Top Header */}
        <header className="c-top-header">
          <div className="c-search-bar">
            <Search size={18} className="c-text-muted" />
            <input type="text" placeholder="Search analytics..." />
          </div>
          <div className="c-header-actions">
            <button className="c-icon-button">
              <Bell size={20} />
            </button>
            <div className="c-user-profile">
               <div className="c-avatar">AU</div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="c-content-body">
          {activeTab === 'resources' ? (
             <div className="c-placeholder-view">
               <h2>Resources view coming soon</h2>
             </div>
          ) : (
            <div className="c-placeholder-view">
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view coming soon</h2>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CounselorDashboard;

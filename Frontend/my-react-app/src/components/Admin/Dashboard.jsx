import React from 'react';
import {
  Users,
  BookOpen,
  Settings,
  Clock,
  LogOut,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuestionManagement from './QuestionManagement';

import ResourceManagement from './ResourceManagement';
import UserManagement from './UserManagement';
import JobManagement from './JobManagement';
import PurchaseVerification from './PurchaseVerification';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('users');

  const handleLogout = () => {
    // Perform any logout cleanup here if needed
    navigate('/');
  };
  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">SB</div>
          <span className="brand-name">Skill Bridge</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} /> <span>Users</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            <BookOpen size={20} /> <span>Questions</span>
          </button>


          <button
            className={`nav-item ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <BookOpen size={20} /> <span>Resources</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'jobManagement' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobManagement')}
          >
            <Briefcase size={20} /> <span>Job Management</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Dashboard Body */}
        <div className="content-inner text-fade-in">
          {activeTab === 'questions' && <QuestionManagement />}


          {activeTab === 'resources' && <ResourceManagement />}

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'jobManagement' && <JobManagement />}

          {activeTab === 'settings' && (
            <div className="placeholder-section">
              <h2>Settings</h2>
              <p className="text-muted">This module is under development.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
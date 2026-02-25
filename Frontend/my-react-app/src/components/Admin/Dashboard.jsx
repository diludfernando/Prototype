import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  Bell,
  Search,
  TrendingUp,
  Clock,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuestionManagement from './QuestionManagement';
import CounsellingManagement from './CounsellingManagement';
import ResourceManagement from './ResourceManagement';
import UserManagement from './UserManagement';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('dashboard');

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
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
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
            className={`nav-item ${activeTab === 'counselling' ? 'active' : ''}`}
            onClick={() => setActiveTab('counselling')}
          >
            <Clock size={20} /> <span>Counselling</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <BookOpen size={20} /> <span>Resources</span>
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
        {/* Top Header */}
        <header className="main-header">
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input type="text" placeholder="Search analytics..." />
          </div>
          <div className="header-actions">
            <button className="icon-button">
              <Bell size={20} />
              <span className="notification-badge"></span>
            </button>
            <div className="user-profile">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=0EA5E9&color=fff" alt="Profile" />
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="content-inner text-fade-in">
          {activeTab === 'dashboard' && (
            <>
              <div className="welcome-section">
                <h1>Welcome back, Admin</h1>
                <p>Here’s what’s happening with your platform today.</p>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Total Learners</span>
                    <Users className="text-accent" size={20} />
                  </div>
                  <div className="stat-value">24,512</div>
                  <div className="stat-footer positive">+12% from last month</div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Active Courses</span>
                    <BookOpen className="text-accent" size={20} />
                  </div>
                  <div className="stat-value">482</div>
                  <div className="stat-footer">8 new this week</div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Revenue</span>
                    <TrendingUp className="text-accent" size={20} />
                  </div>
                  <div className="stat-value">$12,450</div>
                  <div className="stat-footer positive">+5.4%</div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="data-section">
                <div className="section-header">
                  <h2>Recent Enrollments</h2>
                  <button className="btn-outline">View All</button>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Learner</th>
                        <th>Course</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Alex Johnson</td>
                        <td>Advanced React Patterns</td>
                        <td>Oct 24, 2023</td>
                        <td><span className="badge">Active</span></td>
                      </tr>
                      <tr>
                        <td>Sarah Williams</td>
                        <td>UI/UX Fundamentals</td>
                        <td>Oct 23, 2023</td>
                        <td><span className="badge">Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'questions' && <QuestionManagement />}

          {activeTab === 'counselling' && <CounsellingManagement />}

          {activeTab === 'resources' && <ResourceManagement />}

          {activeTab === 'users' && <UserManagement />}

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
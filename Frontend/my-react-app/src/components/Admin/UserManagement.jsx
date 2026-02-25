import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserRound, 
  TrendingUp, 
  Filter, 
  Search, 
  Eye, 
  UserPlus, 
  Trash2, 
  UserPlus2,
  Mail,
  User
} from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Total Users', value: '2', detail: '2 active', icon: Users, type: 'total' },
    { label: 'Students', value: '1', detail: '50% of users', icon: GraduationCap, type: 'students' },
    { label: 'Counselors', value: '0', detail: '0% of users', icon: UserRound, type: 'counselors' },
    { label: 'Active Rate', value: '100%', detail: '2 of 2 users', icon: TrendingUp, type: 'rate' },
  ];

  const users = [
    { id: '#1', email: 'admin@skillbridge.lk', role: 'ADMIN', status: 'Active', created: 'Feb 25, 2026' },
    { id: '#2', email: 'dilud@gmail.com', role: 'STUDENT', status: 'Active', created: 'Feb 25, 2026' },
  ];

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>User Management</h1>
        <p>View, manage, and monitor all system users</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon-wrapper ${stat.type}`}>
              <stat.icon size={20} />
            </div>
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-detail">{stat.detail}</span>
          </div>
        ))}
      </div>

      <div className="user-management-content">
        <div className="table-card">
          <div className="card-header">
            <div className="card-title-group">
              <Users className="card-icon" size={24} />
              <h2>User Management</h2>
            </div>
            <div className="card-actions">
              <p className="card-subtitle">View and manage all system users</p>
            </div>
          </div>

          <div className="filters-section">
            <div className="filter-group">
              <span className="filter-label"><Filter size={14} style={{marginRight: '8px'}} /> Filter by Role:</span>
              <div className="filter-buttons">
                {['ALL', 'ADMIN', 'STUDENT', 'COUNSELOR'].map((role) => (
                  <button 
                    key={role} 
                    className={`filter-btn ${filter === role ? 'active' : ''}`}
                    onClick={() => setFilter(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search by email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td className="user-id">{user.id}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="status-badge">
                        <span className="status-dot active"></span>
                        {user.status}
                      </div>
                    </td>
                    <td>{user.created}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" title="View Details"><Eye size={16} /></button>
                        <button className="action-btn edit" title="Edit Role"><UserPlus size={16} /></button>
                        {user.role !== 'ADMIN' && (
                          <button className="action-btn delete" title="Delete User"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-card">
          <div className="card-header" style={{padding: '0 0 1.5rem 0', borderBottom: 'none'}}>
            <div className="card-title-group">
              <UserPlus2 className="card-icon" size={24} />
              <h2>Create Counselor</h2>
            </div>
          </div>
          <p className="card-subtitle" style={{marginBottom: '1.5rem'}}>Add a new counselor to the system</p>
          
          <form className="create-counselor-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{position: 'relative'}}>
                <input type="email" placeholder="counselor@example.com" />
              </div>
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input type="password" placeholder="Min. 6 characters" />
            </div>
            
            <button type="submit" className="submit-btn">
              <UserPlus size={18} />
              Create Counselor
            </button>
          </form>

          <div className="form-note">
            The counselor will receive these credentials and should change their password on first login.
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

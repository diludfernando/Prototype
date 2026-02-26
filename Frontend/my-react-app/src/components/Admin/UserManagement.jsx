import React, { useState, useEffect } from 'react';
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
  User as UserIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MoreVertical
} from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Create counselor form state
  const [counselorForm, setCounselorForm] = useState({
    email: '',
    fullName: '',
    tempPassword: ''
  });
  const [creatingCounselor, setCreatingCounselor] = useState(false);

  // Edit user state
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    role: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch users. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? data.data : u));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleCreateCounselor = async (e) => {
    e.preventDefault();
    setCreatingCounselor(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8081/api/admin/counselors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(counselorForm)
      });
      const data = await response.json();
      if (data.success) {
        setUsers([...users, data.data]);
        setCounselorForm({ email: '', fullName: '', tempPassword: '' });
        alert('Counselor created successfully');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to create counselor');
    } finally {
      setCreatingCounselor(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => u.id === editingUser.id ? data.data : u));
        setEditingUser(null);
        alert('User updated successfully');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const startEditing = (user) => {
    setEditingUser(user);
    setEditFormData({
      email: user.email,
      role: user.role
    });
  };

  const filteredUsers = users.filter((u) => {
    const matchesFilter = filter === 'ALL' || u.role === filter;
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const studentCount = users.filter(u => u.role === 'STUDENT').length;
  const counselorCount = users.filter(u => u.role === 'COUNSELOR').length;
  const activeCount = users.filter(u => u.enabled).length;

  const stats = [
    { label: 'Total Users', value: users.length.toString(), detail: `${activeCount} active`, icon: Users, type: 'total' },
    { label: 'Students', value: studentCount.toString(), detail: `${Math.round((studentCount / users.length || 0) * 100)}% of users`, icon: GraduationCap, type: 'students' },
    { label: 'Counselors', value: counselorCount.toString(), detail: `${Math.round((counselorCount / users.length || 0) * 100)}% of users`, icon: UserRound, type: 'counselors' },
    { label: 'Active Rate', value: `${Math.round((activeCount / users.length || 0) * 100)}%`, detail: `${activeCount} of ${users.length} users`, icon: TrendingUp, type: 'rate' },
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={48} />
        <p>Loading user management data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <XCircle size={48} color="red" />
        <p>{error}</p>
        <button onClick={fetchUsers} className="btn-outline">Retry</button>
      </div>
    );
  }

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
              <span className="filter-label"><Filter size={14} style={{ marginRight: '8px' }} /> Filter by Role:</span>
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="user-id">#{user.id}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className="status-badge">
                          <span className={`status-dot ${user.enabled ? 'active' : 'inactive'}`}></span>
                          {user.enabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn edit"
                            title="Edit User"
                            onClick={() => startEditing(user)}
                          >
                            <UserPlus size={16} />
                          </button>
                          <button
                            className={`action-btn ${user.enabled ? 'inactive' : 'active'}`}
                            title={user.enabled ? "Disable User" : "Enable User"}
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={user.role === 'ADMIN'}
                          >
                            {user.enabled ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                          </button>
                          {user.role !== 'ADMIN' && (
                            <button
                              className="action-btn delete"
                              title="Delete User"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-card">
          <div className="card-header" style={{ padding: '0 0 1.5rem 0', borderBottom: 'none' }}>
            <div className="card-title-group">
              <UserPlus2 className="card-icon" size={24} />
              <h2>Create Counselor</h2>
            </div>
          </div>
          <p className="card-subtitle" style={{ marginBottom: '1.5rem' }}>Add a new counselor to the system</p>

          <form className="create-counselor-form" onSubmit={handleCreateCounselor}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="counselor@example.com"
                required
                value={counselorForm.email}
                onChange={(e) => setCounselorForm({ ...counselorForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                required
                value={counselorForm.fullName}
                onChange={(e) => setCounselorForm({ ...counselorForm, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                required
                value={counselorForm.tempPassword}
                onChange={(e) => setCounselorForm({ ...counselorForm, tempPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={creatingCounselor}>
              {creatingCounselor ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
              {creatingCounselor ? 'Creating...' : 'Create Counselor'}
            </button>
          </form>

          <div className="form-note">
            The counselor will receive these credentials and should change their password on first login.
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit User Credentials</h3>
              <button onClick={() => setEditingUser(null)} className="close-btn"><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  required
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="COUNSELOR">COUNSELOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

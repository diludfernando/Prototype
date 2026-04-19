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
  const [showCreateCounselorModal, setShowCreateCounselorModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [viewingUserDetails, setViewingUserDetails] = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState(null);

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

  const handleDeleteUser = async (userId, isEnabled) => {
    if (isEnabled) {
      alert('Only disabled users can be deleted');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this disabled user?')) return;
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
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleCreateCounselor = async (e) => {
    e.preventDefault();

    if (/\d/.test(counselorForm.fullName)) {
      alert('Full name cannot contain numbers');
      return;
    }

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
        setShowCreateCounselorModal(false);
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
      const normalizedNewPassword = editFormData.newPassword?.trim() || null;
      const normalizedConfirmPassword = editFormData.confirmPassword?.trim() || null;

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editFormData.fullName,
          email: editFormData.email,
          phoneNumber: editFormData.phoneNumber,
          newPassword: normalizedNewPassword,
          confirmPassword: normalizedConfirmPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        setUsers(users.map((u) => u.id === editingUser.id ? data.data : u));
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
    const details = user.details || {};
    setEditFormData({
      fullName: details.fullName || '',
      email: user.email,
      phoneNumber: details.phoneNumber || details.phone || '',
      role: user.role,
      newPassword: '',
      confirmPassword: ''
    });
  };

  const toReadableLabel = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) => char.toUpperCase())
        .trim();
  };

  const handleViewUserDetails = async (userId) => {
    setDetailsLoadingId(userId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setViewingUserDetails(data.data);
      } else {
        alert(data.message || 'Failed to load user details');
      }
    } catch (err) {
      alert('Failed to load user details');
    } finally {
      setDetailsLoadingId(null);
    }
  };

  const handleEditFromDetails = () => {
    if (!viewingUserDetails) return;
    setViewingUserDetails(null);
    startEditing(viewingUserDetails);
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
                <button
                    type="button"
                    className="create-counselor-btn"
                    onClick={() => setShowCreateCounselorModal(true)}
                >
                  <UserPlus2 size={16} />
                  <span>Create Counselor</span>
                </button>
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
                            <div className={`status-badge ${user.enabled ? 'active' : 'inactive'}`}>
                              <span className={`status-dot ${user.enabled ? 'active' : 'inactive'}`}></span>
                              {user.enabled ? 'Enabled' : 'Disabled'}
                            </div>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                  className="action-btn view"
                                  title="View Details"
                                  onClick={() => handleViewUserDetails(user.id)}
                                  disabled={detailsLoadingId === user.id}
                              >
                                {detailsLoadingId === user.id ? <Loader2 className="animate-spin" size={16} /> : <Eye size={16} />}
                              </button>
                              <button
                                  className={`action-btn ${user.enabled ? 'inactive' : 'active'}`}
                                  title={user.enabled ? "Disable User" : "Enable User"}
                                  onClick={() => handleToggleStatus(user.id)}
                                  disabled={user.role === 'ADMIN'}
                              >
                                {user.enabled ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                              </button>
                              {user.role !== 'ADMIN' && !user.enabled && (
                                  <button
                                      className="action-btn delete"
                                      title="Delete Disabled User"
                                      onClick={() => handleDeleteUser(user.id, user.enabled)}
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
        </div>

        {showCreateCounselorModal && (
            <div className="modal-overlay">
              <div className="modal-card">
                <div className="modal-header">
                  <h3>Create Counselor</h3>
                  <button onClick={() => setShowCreateCounselorModal(false)} className="close-btn"><XCircle size={20} /></button>
                </div>

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
                        pattern="^(?!.*\d).+$"
                        title="Full name cannot contain numbers"
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

                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowCreateCounselorModal(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary" disabled={creatingCounselor}>
                      {creatingCounselor ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                      {creatingCounselor ? 'Creating...' : 'Create Counselor'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {editingUser && (
            <div className="modal-overlay">
              <div className="modal-card">
                <div className="modal-header">
                  <h3>Edit User Credentials</h3>
                  <button onClick={() => setEditingUser(null)} className="close-btn"><XCircle size={20} /></button>
                </div>
                <form onSubmit={handleUpdateUser}>
                  {editFormData.role !== 'ADMIN' && (
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={editFormData.fullName}
                            onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                        />
                      </div>
                  )}
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        required
                    />
                  </div>
                  {editFormData.role !== 'ADMIN' && (
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            value={editFormData.phoneNumber}
                            onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                        />
                      </div>
                  )}

                  {editFormData.role === 'ADMIN' && (
                      <>
                        <div className="form-group">
                          <label>New Password</label>
                          <input
                              type="password"
                              value={editFormData.newPassword}
                              onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                              placeholder="Enter new password"
                          />
                        </div>
                        <div className="form-group">
                          <label>Confirm Password</label>
                          <input
                              type="password"
                              value={editFormData.confirmPassword}
                              onChange={(e) => setEditFormData({ ...editFormData, confirmPassword: e.target.value })}
                              placeholder="Confirm new password"
                          />
                        </div>
                      </>
                  )}

                  <div className="form-group">
                    <label>Role</label>
                    <input
                        type="text"
                        value={editFormData.role}
                        disabled
                        readOnly
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {viewingUserDetails && (
            <div className="modal-overlay">
              <div className="modal-card details-modal-card">
                <div className="modal-header">
                  <h3>User Details</h3>
                  <button onClick={() => setViewingUserDetails(null)} className="close-btn"><XCircle size={20} /></button>
                </div>

                <div className="details-modal-body">
                  <div className="detail-row">
                    <span className="detail-label">User ID</span>
                    <span className="detail-value">#{viewingUserDetails.id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{viewingUserDetails.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">{viewingUserDetails.role}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">{viewingUserDetails.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Created</span>
                    <span className="detail-value">{new Date(viewingUserDetails.createdAt).toLocaleString()}</span>
                  </div>

                  {viewingUserDetails.details && Object.keys(viewingUserDetails.details).length > 0 ? (
                      <>
                        <div className="details-section-title">Profile Details</div>
                        {Object.entries(viewingUserDetails.details).map(([key, value]) => (
                            <div className="detail-row" key={key}>
                              <span className="detail-label">{toReadableLabel(key)}</span>
                              <span className="detail-value">{value !== null && value !== '' ? String(value) : 'N/A'}</span>
                            </div>
                        ))}
                      </>
                  ) : (
                      <div className="no-details-note">No profile details available for this user.</div>
                  )}

                  <div className="modal-actions details-actions">
                    <button type="button" onClick={() => setViewingUserDetails(null)} className="btn-secondary">Close</button>
                    <button type="button" onClick={handleEditFromDetails} className="btn-primary">Edit User</button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default UserManagement;

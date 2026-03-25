import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ExternalLink, Loader2, ShieldCheck } from 'lucide-react';
import './PurchaseVerification.css';

const PurchaseVerification = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const [error, setError] = useState(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8084/api/enrollments/all');
      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      setEnrollments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, []);

  const handleVerify = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:8084/api/enrollments/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setEnrollments(prev =>
          prev.map(e => e.enrollmentId === id ? { ...e, verificationStatus: status } : e)
        );
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const filtered = enrollments.filter(e =>
    e.enrollmentType === 'Purchased Externally' &&
    (filter === 'ALL' || (e.verificationStatus ?? 'PENDING') === filter)
  );

  const counts = {
    PENDING: enrollments.filter(e => e.enrollmentType === 'Purchased Externally' && (e.verificationStatus ?? 'PENDING') === 'PENDING').length,
    APPROVED: enrollments.filter(e => e.enrollmentType === 'Purchased Externally' && e.verificationStatus === 'APPROVED').length,
    REJECTED: enrollments.filter(e => e.enrollmentType === 'Purchased Externally' && e.verificationStatus === 'REJECTED').length,
  };

  return (
    <div className="pv-container">
      <div className="pv-header">
        <ShieldCheck size={24} />
        <div>
          <h1>Purchase Verification</h1>
          <p>Review and approve student course purchase submissions</p>
        </div>
      </div>

      <div className="pv-stats">
        {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <div key={s} className={`pv-stat ${s.toLowerCase()}`}>
            <span className="pv-stat-count">{counts[s]}</span>
            <span className="pv-stat-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="pv-filters">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
          <button
            key={f}
            className={`pv-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="pv-loading"><Loader2 className="spin" size={32} /><p>Loading...</p></div>
      ) : error ? (
        <div className="pv-empty" style={{ color: '#ef4444' }}>
          Error: {error}
          <br /><br />
          <button className="pv-filter-btn" onClick={fetchEnrollments}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="pv-empty">No {filter.toLowerCase()} submissions found.</div>
      ) : (
        <div className="pv-table-wrapper">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Enrollment ID</th>
                <th>User ID</th>
                <th>Course ID</th>
                <th>Certificate URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.enrollmentId}>
                  <td>#{e.enrollmentId}</td>
                  <td>{e.userId}</td>
                  <td>{e.courseId}</td>
                  <td>
                    {e.purchaseProofUrl ? (
                      <a href={e.purchaseProofUrl} target="_blank" rel="noreferrer" className="pv-link">
                        View Certificate <ExternalLink size={12} />
                      </a>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`pv-badge ${(e.verificationStatus ?? 'PENDING').toLowerCase()}`}>
                      {e.verificationStatus ?? 'PENDING'}
                    </span>
                  </td>
                  <td>
                    {(e.verificationStatus === 'PENDING' || e.verificationStatus == null) && (
                      <div className="pv-actions">
                        <button className="pv-approve" onClick={() => handleVerify(e.enrollmentId, 'APPROVED')}>
                          <CheckCircle2 size={16} /> Approve
                        </button>
                        <button className="pv-reject" onClick={() => handleVerify(e.enrollmentId, 'REJECTED')}>
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
                    {e.verificationStatus !== 'PENDING' && e.verificationStatus != null && <span className="pv-done">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseVerification;

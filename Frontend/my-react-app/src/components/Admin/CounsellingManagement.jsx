import React, { useState, useEffect } from 'react';
import { RefreshCcw, Plus, CheckCircle, XCircle, Clock, StickyNote } from 'lucide-react';
import './CounsellingManagement.css';

const CounsellingManagement = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState({}); // Local state for new notes by session ID

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8083/api/counselling/all');
            const data = await response.json();
            setSessions(data);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const updateStatus = async (sessionId, status) => {
        try {
            const response = await fetch(`http://localhost:8083/api/counselling/update-status/${sessionId}?status=${status}`, {
                method: 'PUT'
            });
            if (response.ok) {
                fetchSessions(); // Refresh list
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const addNote = async (sessionId) => {
        const noteText = notes[sessionId];
        if (!noteText) return;

        try {
            const response = await fetch(`http://localhost:8083/api/counselling/note/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: noteText })
            });
            if (response.ok) {
                setNotes(prev => ({ ...prev, [sessionId]: '' }));
                alert("Note added successfully!");
            }
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const handleNoteChange = (sessionId, value) => {
        setNotes(prev => ({ ...prev, [sessionId]: value }));
    };

    const getCounsellorName = (id) => {
        const names = {
            1: 'Dr. Alan Turing',
            2: 'Ada Lovelace',
            3: 'Grace Hopper'
        };
        return names[id] || `Counsellor #${id}`;
    };

    return (
        <div className="counselling-mgmt text-fade-in">
            <header>
                <h2>Counselling Session Management</h2>
                <button className="refresh-btn" onClick={fetchSessions} disabled={loading}>
                    <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </header>

            {loading ? (
                <div className="loading-sessions">Loading all sessions...</div>
            ) : sessions.length === 0 ? (
                <div className="empty-sessions">No sessions found in the system.</div>
            ) : (
                <div className="sessions-table-container">
                    <table className="sessions-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Student</th>
                                <th>Counsellor</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map(session => (
                                <tr key={session.id}>
                                    <td>#{session.id}</td>
                                    <td>Student ID: {session.studentId}</td>
                                    <td>{getCounsellorName(session.counsellorId)}</td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} className="text-muted" /> {session.sessionDate}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted">
                                            <Clock size={12} /> {session.timeSlot}
                                        </div>
                                    </td>
                                    <td>
                                        <select
                                            className="status-select"
                                            value={session.status}
                                            onChange={(e) => updateStatus(session.id, e.target.value)}
                                        >
                                            <option value="BOOKED">BOOKED</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`badge-payment ${(session.paymentStatus || (session.isFree ? 'FREE' : 'PENDING')).toLowerCase()}`}>
                                            {session.paymentStatus || (session.isFree ? 'FREE' : 'PENDING')}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="note-input-group">
                                            <input
                                                type="text"
                                                placeholder="Add internal note..."
                                                value={notes[session.id] || ''}
                                                onChange={(e) => handleNoteChange(session.id, e.target.value)}
                                            />
                                            <button className="add-note-btn" onClick={() => addNote(session.id)}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
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

const Calendar = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

export default CounsellingManagement;

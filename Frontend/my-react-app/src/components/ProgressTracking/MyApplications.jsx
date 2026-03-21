import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    Briefcase,
    Building2,
    MapPin,
    CalendarDays,
    ArrowLeft,
    BadgeCheck,
    Clock3,
} from "lucide-react";
import "./MyApplications.css";

export default function MyApplications() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId") || 1;
    const fullName = localStorage.getItem("fullName") || "Student User";

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
        // eslint-disable-next-line
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `http://localhost:8085/api/job-applications/user/${userId}`
            );
            const data = await response.json();
            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch applications", err);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        const value = (status || "").toUpperCase();
        if (value === "SUBMITTED") return "submitted";
        if (value === "REVIEWING") return "reviewing";
        if (value === "ACCEPTED") return "accepted";
        if (value === "REJECTED") return "rejected";
        return "submitted";
    };

    return (
        <div className="apps-page">
            <div className="apps-shell">
                <section className="apps-topbar">
                    <div>
                        <p className="apps-eyebrow">MY APPLICATIONS</p>
                        <h1>Track your submitted applications</h1>
                        <p>
                            View all jobs you have applied for, including category, status,
                            and submission date.
                        </p>

                        <div className="apps-user-badge">
                            <FileText size={16} />
                            {fullName}
                        </div>
                    </div>

                    <button
                        className="apps-back-btn"
                        onClick={() => navigate("/progress-dashboard")}
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </section>

                {loading ? (
                    <div className="apps-empty-card">Loading applications...</div>
                ) : applications.length === 0 ? (
                    <div className="apps-empty-card">
                        <h3>No applications yet</h3>
                        <p>You have not submitted any job applications yet.</p>
                        <button
                            className="apps-browse-btn"
                            onClick={() => navigate("/jobs")}
                        >
                            Browse Jobs
                        </button>
                    </div>
                ) : (
                    <section className="apps-grid">
                        {applications.map((app) => (
                            <div className="app-card" key={app.id}>
                                <div className="app-card-top">
                                    <div>
                                        <h3>{app.jobTitle || "Job Application"}</h3>
                                        <p className="app-company">
                                            <Building2 size={15} />
                                            {app.company || "Company"}
                                        </p>
                                    </div>

                                    <span className={`app-status ${getStatusClass(app.status)}`}>
                    {app.status || "SUBMITTED"}
                  </span>
                                </div>

                                <div className="app-meta">
                  <span>
                    <MapPin size={15} />
                      {app.currentLocation || app.location || "Location not provided"}
                  </span>

                                    <span>
                    <Briefcase size={15} />
                                        {app.jobCategory || "General"}
                  </span>

                                    <span>
                    <BadgeCheck size={15} />
                                        {app.applicationCategory || "FRESHER"}
                  </span>

                                    <span>
                    <CalendarDays size={15} />
                                        {app.appliedAt
                                            ? new Date(app.appliedAt).toLocaleString()
                                            : "Recently submitted"}
                  </span>
                                </div>

                                <div className="app-bottom">
                                    <div className="app-pill-row">
                    <span className="app-pill light">
                      <Clock3 size={14} />
                        {app.status || "SUBMITTED"}
                    </span>

                                        <span className="app-pill dark">
                      {app.email || "No email"}
                    </span>
                                    </div>

                                    <p className="app-note">
                                        Cover letter and portfolio were submitted with this application.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
}
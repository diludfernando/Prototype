import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase,
    MapPin,
    Building2,
    Search,
    Filter,
    ArrowLeft,
    Sparkles,
} from "lucide-react";
import "./JobsPortal.css";

export default function JobsPortal() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [jobType, setJobType] = useState("All");
    const [level, setLevel] = useState("All");

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        let data = [...jobs];

        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(
                (job) =>
                    (job.title || "").toLowerCase().includes(q) ||
                    (job.company || "").toLowerCase().includes(q) ||
                    (job.location || "").toLowerCase().includes(q) ||
                    (job.category || "").toLowerCase().includes(q)
            );
        }

        if (category !== "All") {
            data = data.filter((job) => (job.category || "") === category);
        }

        if (jobType !== "All") {
            data = data.filter((job) => (job.jobType || "") === jobType);
        }

        if (level !== "All") {
            data = data.filter((job) => (job.level || "") === level);
        }

        setFilteredJobs(data);
    }, [jobs, search, category, jobType, level]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8085/api/jobs");
            const data = await response.json();
            const arr = Array.isArray(data) ? data : [];
            setJobs(arr);
            setFilteredJobs(arr);
        } catch (err) {
            console.error("Failed to load jobs", err);
            setJobs([]);
            setFilteredJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const categories = useMemo(() => {
        const values = [...new Set(jobs.map((j) => j.category).filter(Boolean))];
        return ["All", ...values];
    }, [jobs]);

    const jobTypes = useMemo(() => {
        const values = [...new Set(jobs.map((j) => j.jobType).filter(Boolean))];
        return ["All", ...values];
    }, [jobs]);

    const levels = useMemo(() => {
        const values = [...new Set(jobs.map((j) => j.level).filter(Boolean))];
        return ["All", ...values];
    }, [jobs]);

    return (
        <div className="jobs-page">
            <div className="jobs-shell">
                <section className="jobs-topbar">
                    <div className="jobs-brand-block">
                        <p className="jobs-eyebrow">JOBS & APPLICATIONS</p>
                        <h1>Find the right opportunity</h1>
                        <p>
                            Browse available jobs, filter by category, and apply directly from the platform.
                        </p>
                    </div>

                    <div className="jobs-top-actions">
                        <button className="jobs-back-btn" onClick={() => navigate("/progress-dashboard")}>
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>

                        <div className="jobs-live-badge">
                            <Sparkles size={15} />
                            Live Openings
                        </div>
                    </div>
                </section>

                <section className="jobs-filters">
                    <div className="jobs-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by title, company, category, location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="jobs-selects">
                        <div className="jobs-select">
                            <Filter size={16} />
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                {categories.map((item) => (
                                    <option key={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div className="jobs-select">
                            <Filter size={16} />
                            <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                                {jobTypes.map((item) => (
                                    <option key={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div className="jobs-select">
                            <Filter size={16} />
                            <select value={level} onChange={(e) => setLevel(e.target.value)}>
                                {levels.map((item) => (
                                    <option key={item}>{item}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {loading ? (
                    <div className="jobs-loading">Loading jobs...</div>
                ) : filteredJobs.length === 0 ? (
                    <div className="jobs-empty">No jobs found.</div>
                ) : (
                    <section className="jobs-grid">
                        {filteredJobs.map((job) => (
                            <div className="job-card-premium" key={job.id}>
                                <div className="job-card-top">
                                    <div>
                                        <h3>{job.title}</h3>
                                        <p className="job-company">
                                            <Building2 size={15} />
                                            {job.company || "Company"}
                                        </p>
                                    </div>
                                    <span className="job-match-tag">{job.level || "Open"}</span>
                                </div>

                                <div className="job-meta-list">
                  <span>
                    <MapPin size={15} />
                      {job.location || "Location not specified"}
                  </span>
                                    <span>
                    <Briefcase size={15} />
                                        {job.jobType || "Full Time"}
                  </span>
                                </div>

                                <p className="job-description">
                                    {job.description || "No description available."}
                                </p>

                                <div className="job-bottom-row">
                                    <div className="job-badges">
                                        <span>{job.category || "General"}</span>
                                        <span>
                      {job.salaryMin && job.salaryMax
                          ? `LKR ${job.salaryMin} - ${job.salaryMax}`
                          : "Salary Negotiable"}
                    </span>
                                    </div>

                                    <button
                                        className="apply-now-btn"
                                        onClick={() => navigate(`/jobs/apply/${job.id}`)}
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
}
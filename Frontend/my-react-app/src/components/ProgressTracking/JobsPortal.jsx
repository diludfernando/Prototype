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
    Globe,
    BadgeDollarSign,
    Layers3,
    CheckCircle2,
} from "lucide-react";
import cloudCover from "../../assets/progress/cloud-cover.svg";
import securityCover from "../../assets/progress/security-cover.svg";
import programmingCover from "../../assets/progress/programming-cover.svg";
import "./JobsPortal.css";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const levelRankFromProgress = (highestLevelPassed) => {
    const value = normalizeText(highestLevelPassed);
    if (value === "advanced") return 3;
    if (value === "intermediate") return 2;
    if (value === "beginner") return 1;
    return 0;
};

const levelRankFromJob = (jobLevel) => {
    const value = normalizeText(jobLevel);
    if (!value) return 0;
    if (value.includes("lead") || value.includes("senior") || value.includes("advanced")) return 3;
    if (value.includes("mid") || value.includes("associate") || value.includes("intermediate")) return 2;
    if (value.includes("entry") || value.includes("junior") || value.includes("intern") || value.includes("graduate")) return 1;
    return 1;
};

const unlockLabelForRank = (rank) => {
    if (rank >= 3) return "Advanced";
    if (rank >= 2) return "Intermediate";
    if (rank >= 1) return "Beginner";
    return "Beginner";
};

const getJobTheme = (job) => {
    const category = normalizeText(job?.category);
    const title = normalizeText(job?.title);

    if (category.includes("cloud") || title.includes("cloud") || title.includes("devops")) {
        return {
            image: cloudCover,
            accent: "sky",
            tags: ["Cloud", "Automation", "Scale"],
        };
    }

    if (category.includes("security") || title.includes("security") || title.includes("cyber")) {
        return {
            image: securityCover,
            accent: "emerald",
            tags: ["Security", "Monitoring", "Defense"],
        };
    }

    return {
        image: programmingCover,
        accent: "amber",
        tags: ["Engineering", "Delivery", "Product"],
    };
};

const formatSalary = (job) => {
    if (job.salaryMin && job.salaryMax) {
        return `LKR ${job.salaryMin} - ${job.salaryMax}`;
    }
    if (job.salaryMin) {
        return `From LKR ${job.salaryMin}`;
    }
    if (job.salaryMax) {
        return `Up to LKR ${job.salaryMax}`;
    }
    return "Salary Negotiable";
};

const getRequirementPreview = (job) => {
    if (!Array.isArray(job?.requirements) || job.requirements.length === 0) {
        return [];
    }
    return job.requirements.slice(0, 3);
};

export default function JobsPortal() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDescriptionId, setOpenDescriptionId] = useState(null);
    const [highestLevelPassed, setHighestLevelPassed] = useState("None");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [jobType, setJobType] = useState("All");
    const [level, setLevel] = useState("All");

    useEffect(() => {
        fetchJobs();
        fetchUserProgress();
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

        const currentUserRank = levelRankFromProgress(highestLevelPassed);
        data.sort((a, b) => {
            const aRank = levelRankFromJob(a.level);
            const bRank = levelRankFromJob(b.level);
            const aUnlocked = aRank <= currentUserRank || aRank === 0;
            const bUnlocked = bRank <= currentUserRank || bRank === 0;

            if (aUnlocked !== bUnlocked) {
                return aUnlocked ? -1 : 1;
            }

            if (aUnlocked && bUnlocked && aRank !== bRank) {
                return bRank - aRank;
            }

            return 0;
        });

        setFilteredJobs(data);
    }, [jobs, search, category, jobType, level, highestLevelPassed]);

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

    const fetchUserProgress = async () => {
        const username = localStorage.getItem("username");
        if (!username) return;

        try {
            const response = await fetch(`http://localhost:8082/api/progress?${new URLSearchParams({ username })}`);
            if (!response.ok) return;
            const data = await response.json();
            setHighestLevelPassed(data?.highestLevelPassed || "None");
        } catch (err) {
            console.error("Failed to load user progress", err);
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

    const getBriefDescription = (job) => {
        const summary = job.description?.trim() || "No description available for this role yet.";
        if (summary.length <= 180) return summary;
        return `${summary.slice(0, 177).trim()}...`;
    };

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
                    <div className="jobs-level-banner">
                        <span className="jobs-level-chip">Current skill level: {highestLevelPassed || "None"}</span>
                        <p>Jobs unlocked for your current level are shown first. Higher-level roles appear automatically as your assessment level improves.</p>
                    </div>

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
                        {filteredJobs.map((job) => {
                            const theme = getJobTheme(job);
                            const requirements = getRequirementPreview(job);
                            const userRank = levelRankFromProgress(highestLevelPassed);
                            const jobRank = levelRankFromJob(job.level);
                            const isUnlocked = jobRank <= userRank || jobRank === 0;

                            return (
                                <div className={`job-card-premium accent-${theme.accent}`} key={job.id}>
                                    <div className="job-card-hero">
                                        <img src={theme.image} alt={job.category || "Job category"} className="job-card-hero-image" />
                                        <div className="job-card-hero-overlay" />
                                        <div className="job-card-hero-top">
                                            <span className="job-hero-pill">{job.category || "General"}</span>
                                            <span className={`job-match-tag ${isUnlocked ? "unlocked" : "locked"}`}>
                                                {isUnlocked ? (job.level || "Open") : `Unlock at ${unlockLabelForRank(jobRank)}`}
                                            </span>
                                        </div>
                                        <div className="job-card-hero-copy">
                                            <p>{job.company || "Company"}</p>
                                            <h3>{job.title}</h3>
                                        </div>
                                    </div>

                                    <div className="job-card-body">
                                        <div className="job-meta-list">
                                            <span>
                                                <MapPin size={15} />
                                                {job.location || "Location not specified"}
                                            </span>
                                            <span>
                                                <Briefcase size={15} />
                                                {job.jobType || "Full Time"}
                                            </span>
                                            <span>
                                                <BadgeDollarSign size={15} />
                                                {formatSalary(job)}
                                            </span>
                                        </div>

                                        <p className="job-description">
                                            {getBriefDescription(job)}
                                        </p>

                                        <div className="job-theme-tags">
                                            <span className={isUnlocked ? "job-unlock-pill" : "job-lock-pill"}>
                                                {isUnlocked ? "Unlocked for you" : "Level up to unlock"}
                                            </span>
                                            {theme.tags.map((tag) => (
                                                <span key={`${job.id}-${tag}`}>{tag}</span>
                                            ))}
                                        </div>

                                        {requirements.length > 0 && (
                                            <div className="job-skill-preview">
                                                <div className="job-section-head">
                                                    <Layers3 size={15} />
                                                    <span>Key requirements</span>
                                                </div>
                                                <div className="job-requirement-list">
                                                    {requirements.map((req, index) => (
                                                        <span key={`${job.id}-req-${index}`}>
                                                            <CheckCircle2 size={14} />
                                                            {req.language} {req.percentage ? `${req.percentage}%` : ""}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="job-quick-actions">
                                            <button
                                                className="job-desc-btn"
                                                onClick={() => setOpenDescriptionId((current) => current === job.id ? null : job.id)}
                                            >
                                                {openDescriptionId === job.id ? "Hide Details" : "View Details"}
                                            </button>
                                        </div>

                                        {openDescriptionId === job.id && (
                                            <div className="job-details-panel">
                                                <div className="job-details-grid">
                                                    <div>
                                                        <span className="job-details-label">Company</span>
                                                        <strong>{job.company || "Not specified"}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="job-details-label">Location</span>
                                                        <strong>{job.location || "Not specified"}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="job-details-label">Working Model</span>
                                                        <strong>{job.jobType || "Standard hours"}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="job-details-label">Level</span>
                                                        <strong>{job.level || "Open"}</strong>
                                                    </div>
                                                </div>
                                                <div className="job-details-summary">
                                                    <span className="job-details-label">Role Overview</span>
                                                    <p>{job.description || "No job description available."}</p>
                                                </div>
                                                {job.sourceUrl && (
                                                    <a className="job-source-link" href={job.sourceUrl} target="_blank" rel="noreferrer">
                                                        <Globe size={14} />
                                                        View original source
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        <div className="job-bottom-row">
                                            <div className="job-badges">
                                                <span>{job.category || "General"}</span>
                                                <span>{job.level || "Open level"}</span>
                                            </div>

                                            <button
                                                className="apply-now-btn"
                                                onClick={() => navigate(`/jobs/apply/${job.id}`)}
                                            >
                                                {isUnlocked ? "Apply Job" : "View Goal"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}
            </div>
        </div>
    );
}

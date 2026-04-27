import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Briefcase, Building2, MapPin, Send, BadgeDollarSign, Globe, Layers3 } from "lucide-react";
import cloudCover from "../../assets/progress/cloud-cover.svg";
import securityCover from "../../assets/progress/security-cover.svg";
import programmingCover from "../../assets/progress/programming-cover.svg";
import "./JobApply.css";

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const getJobTheme = (job) => {
    const category = normalizeText(job?.category);
    const title = normalizeText(job?.title);

    if (category.includes("cloud") || title.includes("cloud") || title.includes("devops")) {
        return cloudCover;
    }
    if (category.includes("security") || title.includes("security") || title.includes("cyber")) {
        return securityCover;
    }
    return programmingCover;
};

const formatSalary = (job) => {
    if (job?.salaryMin && job?.salaryMax) return `LKR ${job.salaryMin} - ${job.salaryMax}`;
    if (job?.salaryMin) return `From LKR ${job.salaryMin}`;
    if (job?.salaryMax) return `Up to LKR ${job.salaryMax}`;
    return "Salary Negotiable";
};

export default function JobApply() {
    const { id } = useParams();
    const navigate = useNavigate();

    const userId = localStorage.getItem("userId") || 1;
    const fullName = localStorage.getItem("fullName") || "Student User";
    const email = localStorage.getItem("username") || "student@skillbridge.lk";

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [form, setForm] = useState({
        applicantName: fullName,
        email: email,
        phone: "",
        currentLocation: "",
        yearsOfExperience: 0,
        cvUrl: "",
        portfolioUrl: "",
        coverLetter: "",
    });

    useEffect(() => {
        fetchJob();
    }, []);

    const fetchJob = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8085/api/jobs/${id}`);
            const data = await response.json();
            setJob(data);
        } catch (err) {
            console.error("Failed to load job", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            userId: Number(userId),
            jobId: Number(id),
            applicantName: form.applicantName,
            email: form.email,
            phone: form.phone,
            currentLocation: form.currentLocation,
            yearsOfExperience: Number(form.yearsOfExperience),
            cvUrl: form.cvUrl,
            portfolioUrl: form.portfolioUrl,
            coverLetter: form.coverLetter,
        };

        try {
            const response = await fetch("http://localhost:8085/api/job-applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Submission failed");
            }

            setSuccess("Application submitted successfully!");
            setTimeout(() => {
                navigate("/jobs");
            }, 1600);
        } catch (err) {
            alert("Failed to submit application");
        }
    };

    if (loading) {
        return <div className="apply-loading">Loading application page...</div>;
    }

    if (!job) {
        return <div className="apply-loading">Job not found.</div>;
    }

    return (
        <div className="apply-page">
            <div className="apply-shell">
                <section className="apply-job-summary">
                    <div className="apply-job-hero">
                        <img src={getJobTheme(job)} alt={job.category || "Job category"} className="apply-job-hero-image" />
                    </div>
                    <p className="apply-eyebrow">JOB APPLICATION</p>
                    <h1>Apply for {job.title}</h1>

                    <div className="apply-job-meta">
            <span>
              <Building2 size={15} />
                {job.company || "Company"}
            </span>
                        <span>
              <MapPin size={15} />
                            {job.location || "Location"}
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

                    <p className="apply-description">
                        {job.description || "No job description available."}
                    </p>

                    {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                        <div className="apply-job-requirements">
                            <p><Layers3 size={15} /> Key requirements</p>
                            <div className="apply-job-requirement-list">
                                {job.requirements.slice(0, 4).map((req, index) => (
                                    <span key={`req-${index}`}>{req.language} {req.percentage ? `${req.percentage}%` : ""}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {job.sourceUrl && (
                        <a className="apply-job-source" href={job.sourceUrl} target="_blank" rel="noreferrer">
                            <Globe size={15} />
                            View original posting
                        </a>
                    )}
                </section>

                <section className="apply-form-card">
                    <h2>Application Form</h2>

                    {success && <div className="apply-success">{success}</div>}

                    <form className="apply-form" onSubmit={handleSubmit}>
                        <div className="apply-grid">
                            <div className="apply-field">
                                <label>Full Name</label>
                                <input
                                    name="applicantName"
                                    value={form.applicantName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="apply-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="apply-field">
                                <label>Phone</label>
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="apply-field">
                                <label>Current Location</label>
                                <input
                                    name="currentLocation"
                                    value={form.currentLocation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="apply-field">
                                <label>Years of Experience</label>
                                <input
                                    type="number"
                                    min="0"
                                    name="yearsOfExperience"
                                    value={form.yearsOfExperience}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="apply-field">
                                <label>CV Link</label>
                                <input
                                    name="cvUrl"
                                    value={form.cvUrl}
                                    onChange={handleChange}
                                    placeholder="Google Drive / OneDrive / Dropbox link"
                                    required
                                />
                            </div>

                            <div className="apply-field apply-full">
                                <label>Portfolio Link</label>
                                <input
                                    name="portfolioUrl"
                                    value={form.portfolioUrl}
                                    onChange={handleChange}
                                    placeholder="GitHub / LinkedIn / Portfolio site"
                                />
                            </div>

                            <div className="apply-field apply-full">
                                <label>Cover Letter</label>
                                <textarea
                                    rows="6"
                                    name="coverLetter"
                                    value={form.coverLetter}
                                    onChange={handleChange}
                                    placeholder="Write a short message about why you are suitable for this job"
                                    required
                                />
                            </div>
                        </div>

                        <button className="submit-application-btn" type="submit">
                            <Send size={16} />
                            Submit Application
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

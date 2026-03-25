import React, { useEffect, useState } from "react";
import {
    Briefcase,
    Building2,
    MapPin,
    Pencil,
    Trash2,
    PlusCircle,
    Save,
    XCircle,
    Plus,
    Minus,
} from "lucide-react";
import "./JobManagement.css";

const IT_LANGUAGES = [
    "Java", "Python", "JavaScript", "React", "Node.js", "C#", "C++", "PHP", 
    "Ruby", "Swift", "Go", "Kotlin", "TypeScript", "SQL", "AWS", "Azure", 
    "Docker", "Kubernetes", "HTML/CSS", "Flutter", "React Native", "Angular", "Vue.js"
];

const JOB_LEVELS = ["1", "2", "3", "4", "5"];

export default function JobManagement() {
    const role = localStorage.getItem("role");

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        title: "",
        description: "",
        company: "",
        location: "",
        category: "",
        jobType: "",
        level: "",
        salaryMin: "",
        salaryMax: "",
        sourceUrl: "",
        requirements: [{ language: "", level: "" }],
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8085/api/jobs");
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setJobs([]);
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

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setSuccess("");
        setError("");
    };

    const handleRequirementChange = (index, field, value) => {
        const newReqs = [...form.requirements];
        newReqs[index][field] = value;
        setForm((prev) => ({ ...prev, requirements: newReqs }));
    };

    const addRequirement = () => {
        setForm((prev) => ({
            ...prev,
            requirements: [...prev.requirements, { language: "", level: "" }],
        }));
    };

    const removeRequirement = (index) => {
        if (form.requirements.length <= 1) return;
        const newReqs = form.requirements.filter((_, i) => i !== index);
        setForm((prev) => ({ ...prev, requirements: newReqs }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        try {
            const payload = {
                ...form,
                salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
                salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
                requirements: form.requirements
            };

            const url = editingId
                ? `http://localhost:8085/api/jobs/${editingId}`
                : "http://localhost:8085/api/jobs";

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    role: role || "",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || "Operation failed");
            }

            setSuccess(editingId ? "Job updated successfully!" : "Job added successfully!");
            resetForm();
            fetchJobs();
        } catch (err) {
            console.error(err);
            setError(err.message || "Operation failed");
        }
    };

    const handleEdit = (job) => {
        setEditingId(job.id);
        setForm({
            title: job.title || "",
            description: job.description || "",
            company: job.company || "",
            location: job.location || "",
            category: job.category || "",
            jobType: job.jobType || "",
            level: job.level || "",
            salaryMin: job.salaryMin || "",
            salaryMax: job.salaryMax || "",
            sourceUrl: job.sourceUrl || "",
            requirements: job.requirements && job.requirements.length > 0
                ? job.requirements
                : [{ language: "", level: "" }],
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this job?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:8085/api/jobs/${id}`, {
                method: "DELETE",
                headers: {
                    role: role || "",
                },
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || "Failed to delete job");
            }

            setSuccess("Job deleted successfully!");
            fetchJobs();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to delete job");
        }
    };

    return (
        <div className="jobman-page">
            <div className="jobman-header">
                <div>
                    <p className="jobman-eyebrow">ADMIN JOB MANAGEMENT</p>
                    <h2>{editingId ? "Edit Job" : "Add New Job"}</h2>
                    <p>Manage all platform jobs in one place.</p>
                </div>
            </div>

            <div className="jobman-form-card">
                {success && <div className="jobman-success">{success}</div>}
                {error && <div className="jobman-error">{error}</div>}

                <form className="jobman-form" onSubmit={handleSubmit}>
                    <div className="jobman-grid">
                        <div className="jobman-field">
                            <label>Job Title</label>
                            <input name="title" value={form.title} onChange={handleChange} required />
                        </div>

                        <div className="jobman-field">
                            <label>Company</label>
                            <input name="company" value={form.company} onChange={handleChange} required />
                        </div>

                        <div className="jobman-field">
                            <label>Location</label>
                            <input name="location" value={form.location} onChange={handleChange} required />
                        </div>

                        <div className="jobman-field jobman-full">
                            <div className="jobman-req-header">
                                <label>Language Requirements</label>
                                <button type="button" onClick={addRequirement} className="jobman-add-req">
                                    <Plus size={16} /> Add Language
                                </button>
                            </div>
                            <div className="jobman-req-list">
                                {form.requirements.map((req, index) => (
                                    <div key={index} className="jobman-req-row">
                                        <div className="jobman-field">
                                            <select
                                                value={req.language}
                                                onChange={(e) => handleRequirementChange(index, "language", e.target.value)}
                                                required
                                            >
                                                <option value="">Select Language</option>
                                                {IT_LANGUAGES.map((lang) => (
                                                    <option key={lang} value={lang}>{lang}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="jobman-field">
                                            <select
                                                value={req.level}
                                                onChange={(e) => handleRequirementChange(index, "level", e.target.value)}
                                                required
                                            >
                                                <option value="">Select Level</option>
                                                {JOB_LEVELS.map((lvl) => (
                                                    <option key={lvl} value={lvl}>{lvl}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            className="jobman-remove-req"
                                            onClick={() => removeRequirement(index)}
                                            disabled={form.requirements.length <= 1}
                                        >
                                            <Minus size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="jobman-field">
                            <label>Job Type</label>
                            <input name="jobType" value={form.jobType} onChange={handleChange} required />
                        </div>

                        <div className="jobman-field">
                            <label>Salary Min</label>
                            <input type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange} />
                        </div>

                        <div className="jobman-field">
                            <label>Salary Max</label>
                            <input type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange} />
                        </div>

                        <div className="jobman-field jobman-full">
                            <label>Source URL</label>
                            <input name="sourceUrl" value={form.sourceUrl} onChange={handleChange} />
                        </div>

                        <div className="jobman-field jobman-full">
                            <label>Description</label>
                            <textarea
                                rows="5"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="jobman-actions">
                        <button className="jobman-btn primary" type="submit">
                            {editingId ? <Save size={16} /> : <PlusCircle size={16} />}
                            {editingId ? "Update Job" : "Add Job"}
                        </button>

                        {editingId && (
                            <button
                                className="jobman-btn secondary"
                                type="button"
                                onClick={resetForm}
                            >
                                <XCircle size={16} />
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="jobman-list-card">
                <div className="jobman-list-header">
                    <h3>All Jobs</h3>
                </div>

                {loading ? (
                    <p className="jobman-empty">Loading jobs...</p>
                ) : jobs.length === 0 ? (
                    <p className="jobman-empty">No jobs available.</p>
                ) : (
                    <div className="jobman-grid-list">
                        {jobs.map((job) => (
                            <div key={job.id} className="jobman-job-card">
                                <div className="jobman-job-top">
                                    <div>
                                        <h4>{job.title}</h4>
                                        <p>
                                            <Building2 size={14} /> {job.company || "Company"}
                                        </p>
                                        <p>
                                            <MapPin size={14} /> {job.location || "Location"}
                                        </p>
                                    </div>

                                    <div className="jobman-badges">
                                        {job.requirements && job.requirements.length > 0 ? (
                                            job.requirements.map((req, idx) => (
                                                <span key={idx}>
                                                    {req.language}: {req.level}
                                                </span>
                                            ))
                                        ) : (
                                            <>
                                                <span>{job.category || "General"}</span>
                                                <span>{job.level || "Open"}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <p className="jobman-desc">
                                    {job.description || "No description available."}
                                </p>

                                <div className="jobman-bottom">
                  <span className="jobman-type">
                    <Briefcase size={14} /> {job.jobType || "Full Time"}
                  </span>

                                    <div className="jobman-card-actions">
                                        <button onClick={() => handleEdit(job)} className="edit-btn">
                                            <Pencil size={15} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(job.id)} className="delete-btn">
                                            <Trash2 size={15} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
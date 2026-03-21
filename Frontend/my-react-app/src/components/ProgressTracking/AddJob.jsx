import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Building2, MapPin, Save } from "lucide-react";
import "./AddJob.css";

export default function AddJob() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const [form, setForm] = useState({
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
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    if (role !== "ADMIN" && role !== "ROLE_ADMIN") {
        return (
            <div className="addjob-page">
                <div className="addjob-shell">
                    <div className="addjob-card">
                        <h2>Access Denied</h2>
                        <p>Only admins can add jobs.</p>
                        <button className="addjob-btn" onClick={() => navigate("/")}>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess("");
        setError("");

        try {
            const currentRole = localStorage.getItem("role");

            const payload = {
                ...form,
                salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
                salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
            };

            const response = await fetch("http://localhost:8085/api/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    role: currentRole || "",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || "Failed to add job");
            }

            const data = await response.json();
            console.log("Job saved:", data);

            setSuccess("Job added successfully!");
            setForm({
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
            });
        } catch (err) {
            console.error("Add job error:", err);
            setError(err.message || "Failed to add job");
        }
    };

    return (
        <div className="addjob-page">
            <div className="addjob-shell">
                <section className="addjob-topbar">
                    <div>
                        <p className="addjob-eyebrow">ADMIN JOB MANAGEMENT</p>
                        <h1>Add New Job</h1>
                        <p>Create job opportunities that students can browse and apply for.</p>
                    </div>

                    <button className="addjob-back-btn" onClick={() => navigate("/admin")}>
                        <ArrowLeft size={16} />
                        Back to Admin Home
                    </button>
                </section>

                <section className="addjob-card">
                    <h2>Job Details</h2>

                    {success && <div className="addjob-success">{success}</div>}
                    {error && <div className="addjob-error">{error}</div>}

                    <form className="addjob-form" onSubmit={handleSubmit}>
                        <div className="addjob-grid">
                            <div className="addjob-field">
                                <label>Job Title</label>
                                <div className="addjob-input-wrap">
                                    <Briefcase size={16} />
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="addjob-field">
                                <label>Company</label>
                                <div className="addjob-input-wrap">
                                    <Building2 size={16} />
                                    <input
                                        name="company"
                                        value={form.company}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="addjob-field">
                                <label>Location</label>
                                <div className="addjob-input-wrap">
                                    <MapPin size={16} />
                                    <input
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="addjob-field">
                                <label>Category</label>
                                <input
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    placeholder="Software Engineering"
                                    required
                                />
                            </div>

                            <div className="addjob-field">
                                <label>Job Type</label>
                                <input
                                    name="jobType"
                                    value={form.jobType}
                                    onChange={handleChange}
                                    placeholder="Full Time / Internship"
                                    required
                                />
                            </div>

                            <div className="addjob-field">
                                <label>Level</label>
                                <input
                                    name="level"
                                    value={form.level}
                                    onChange={handleChange}
                                    placeholder="Beginner / Intermediate"
                                    required
                                />
                            </div>

                            <div className="addjob-field">
                                <label>Salary Min</label>
                                <input
                                    type="number"
                                    name="salaryMin"
                                    value={form.salaryMin}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="addjob-field">
                                <label>Salary Max</label>
                                <input
                                    type="number"
                                    name="salaryMax"
                                    value={form.salaryMax}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="addjob-field addjob-full">
                                <label>Source URL</label>
                                <input
                                    name="sourceUrl"
                                    value={form.sourceUrl}
                                    onChange={handleChange}
                                    placeholder="Optional job link"
                                />
                            </div>

                            <div className="addjob-field addjob-full">
                                <label>Description</label>
                                <textarea
                                    rows="6"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button className="addjob-btn" type="submit">
                            <Save size={16} />
                            Save Job
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
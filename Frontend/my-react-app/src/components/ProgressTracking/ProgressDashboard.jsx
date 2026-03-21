import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Briefcase,
  Target,
  BarChart3,
  User,
  GraduationCap,
  MapPin,
  Building2,
  Sparkles,
  TrendingUp,
  BookOpen,
  Award,
  RefreshCw,
  FileText,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import "./ProgressDashboard.css";

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Tooltip,
    Legend
);

export default function ProgressDashboard() {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId") || 1;
  const careerId = localStorage.getItem("careerId") || 1;
  const token = localStorage.getItem("token");
  const fullName =
      localStorage.getItem("fullName") ||
      localStorage.getItem("username") ||
      "Student User";
  const careerPath =
      localStorage.getItem("careerPath") || "Software Engineering";
  const email =
      localStorage.getItem("username") || "student@skillbridge.lk";

  const [profile, setProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      if (!token) return;

      const response = await fetch("http://localhost:8081/api/student/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.data);

        if (data.data?.fullName) {
          localStorage.setItem("fullName", data.data.fullName);
        }

        if (data.data?.selectedCareerPath) {
          localStorage.setItem("careerPath", data.data.selectedCareerPath);
        }
      }
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [r1, r2, r3] = await Promise.all([
        fetch(`http://localhost:8085/api/readiness/${userId}/${careerId}`),
        fetch(`http://localhost:8085/api/leaderboard/career/${careerId}?top=5`),
        fetch(`http://localhost:8085/api/recommendations/jobs/${userId}?top=5`),
      ]);

      if (!r1.ok || !r2.ok || !r3.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const readinessData = await r1.json();
      const leaderboardData = await r2.json();
      const jobsData = await r3.json();

      setReadiness(readinessData);
      setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const score = useMemo(() => {
    if (!readiness) return 0;

    const raw =
        readiness.readinessScore ??
        readiness.score ??
        readiness.matchPercentage ??
        0;

    return Math.max(0, Math.min(100, Math.round(raw)));
  }, [readiness]);

  const levelLabel = useMemo(() => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Moderate";
    return "Needs Improvement";
  }, [score]);

  const firstName = useMemo(() => {
    const name = profile?.fullName || fullName;
    return name?.split(" ")[0] || "Student";
  }, [profile, fullName]);

  const skillBars = useMemo(() => {
    return [
      { name: "Assessment Progress", value: Math.min(100, score + 8) },
      { name: "Skill Matching", value: Math.max(20, score - 5) },
      {
        name: "Leaderboard Strength",
        value: leaderboard.length
            ? Math.max(25, 85 - leaderboard.length * 8)
            : 35,
      },
      {
        name: "Job Readiness",
        value: jobs.length
            ? Math.min(100, score + 5)
            : Math.max(20, score - 10),
      },
    ];
  }, [score, leaderboard, jobs]);

  const doughnutData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: ["#0ea5e9", "#e8edf5"],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: skillBars.map((item) => item.name),
    datasets: [
      {
        label: "Progress %",
        data: skillBars.map((item) => item.value),
        backgroundColor: ["#0ea5e9", "#0284c7", "#4cc9f0", "#22c55e"],
        borderRadius: 12,
      },
    ],
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Current"],
    datasets: [
      {
        label: "Career Growth",
        data: [
          Math.max(10, score - 35),
          Math.max(20, score - 25),
          Math.max(30, score - 15),
          Math.max(40, score - 8),
          score,
        ],
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
    },
  };

  return (
      <div className="ptd-page">
        <div className="ptd-shell">
          <div className="ptd-back-nav">
            <button className="ptd-back-btn" onClick={() => navigate("/services")}>
              <ArrowLeft size={18} />
              <span>Back to Services</span>
            </button>
          </div>
          <section className="ptd-profile-hero">
            <div className="ptd-profile-card">
              <div className="ptd-profile-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="ptd-profile-info">
                <p className="ptd-eyebrow">PROGRESS TRACKING & DASHBOARD</p>
                <h1>Welcome back, {firstName}</h1>

                <p className="ptd-subtext">
                  Your career growth, skill progress, leaderboard performance,
                  and recommended jobs are shown here in one place.
                </p>

                <div className="ptd-profile-tags">
                <span>
                  <User size={15} />
                  {profile?.fullName || fullName}
                </span>

                  <span>
                  <GraduationCap size={15} />
                    {profile?.selectedCareerPath || careerPath}
                </span>

                  <span>
                  <BookOpen size={15} />
                    {email}
                </span>
                </div>

                <div className="ptd-top-actions">
                  <button
                      type="button"
                      className="ptd-action-btn ptd-action-btn-primary"
                      onClick={() => navigate("/jobs")}
                  >
                    <Briefcase size={18} />
                    <span>Browse & Apply Jobs</span>
                  </button>

                  <button
                      type="button"
                      className="ptd-action-btn ptd-action-btn-light"
                      onClick={fetchDashboardData}
                      disabled={loading}
                  >
                    <RefreshCw size={18} />
                    <span>{loading ? "Refreshing..." : "Refresh Dashboard"}</span>
                  </button>

                  <button
                      type="button"
                      className="ptd-action-btn ptd-action-btn-light"
                      onClick={() => navigate("/applications")}
                  >
                    <FileText size={18} />
                    <span>My Applications</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="ptd-score-card">
              <div className="ptd-score-top">
                <div>
                  <p className="ptd-mini-label">Career Readiness</p>
                  <h3>{levelLabel}</h3>
                </div>

                <div className="ptd-mini-badge">
                  <Sparkles size={16} />
                  Live
                </div>
              </div>

              <div className="ptd-chart-doughnut">
                <Doughnut
                    data={doughnutData}
                    options={{
                      cutout: "72%",
                      plugins: { legend: { display: false } },
                    }}
                />
                <div className="ptd-doughnut-center">
                  <span>{score}%</span>
                  <small>Score</small>
                </div>
              </div>

              <p className="ptd-score-message">
                {readiness?.message ||
                    "Your dashboard summarizes your readiness and skill progress."}
              </p>

              <div className="ptd-score-footer">
                <div className="ptd-score-mini">
                  <span>Career ID</span>
                  <strong>{careerId}</strong>
                </div>
                <div className="ptd-score-mini">
                  <span>User ID</span>
                  <strong>{userId}</strong>
                </div>
              </div>
            </div>
          </section>

          {error && <div className="ptd-error">{error}</div>}

          {loading && (
              <div className="ptd-loading-card">
                <div className="ptd-loader"></div>
                <p>Loading your dashboard data...</p>
              </div>
          )}

          {!loading && (
              <>
                <section className="ptd-stats-grid">
                  <div className="ptd-stat-card">
                    <div className="ptd-stat-icon blue">
                      <Target size={20} />
                    </div>
                    <div>
                      <p>Readiness Score</p>
                      <h3>{score}%</h3>
                    </div>
                  </div>

                  <div className="ptd-stat-card">
                    <div className="ptd-stat-icon gold">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p>Leaderboard Entries</p>
                      <h3>{leaderboard.length}</h3>
                    </div>
                  </div>

                  <div className="ptd-stat-card">
                    <div className="ptd-stat-icon green">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p>Job Matches</p>
                      <h3>{jobs.length}</h3>
                    </div>
                  </div>

                  <div className="ptd-stat-card">
                    <div className="ptd-stat-icon purple">
                      <Award size={20} />
                    </div>
                    <div>
                      <p>Performance Level</p>
                      <h3>{levelLabel}</h3>
                    </div>
                  </div>
                </section>

                <section className="ptd-chart-grid">
                  <div className="ptd-card">
                    <div className="ptd-card-header">
                      <div>
                        <p className="ptd-card-kicker">Visual Analytics</p>
                        <h2>Skill Progress Chart</h2>
                      </div>
                      <BarChart3 size={20} />
                    </div>
                    <Bar data={barData} options={chartOptions} />
                  </div>

                  <div className="ptd-card">
                    <div className="ptd-card-header">
                      <div>
                        <p className="ptd-card-kicker">Growth Trend</p>
                        <h2>Career Progress Over Time</h2>
                      </div>
                      <TrendingUp size={20} />
                    </div>
                    <Line data={lineData} options={chartOptions} />
                  </div>
                </section>

                <section className="ptd-main-grid">
                  <div className="ptd-card">
                    <div className="ptd-card-header">
                      <div>
                        <p className="ptd-card-kicker">Analytics</p>
                        <h2>Skill Progress Bars</h2>
                      </div>
                      <BarChart3 size={20} />
                    </div>

                    <div className="ptd-skill-list">
                      {skillBars.map((item, index) => (
                          <div key={index} className="ptd-skill-item">
                            <div className="ptd-skill-head">
                              <span>{item.name}</span>
                              <span>{item.value}%</span>
                            </div>
                            <div className="ptd-bar">
                              <div
                                  className="ptd-bar-fill"
                                  style={{ width: `${item.value}%` }}
                              ></div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>

                  <div className="ptd-card">
                    <div className="ptd-card-header">
                      <div>
                        <p className="ptd-card-kicker">Ranking</p>
                        <h2>Leaderboard</h2>
                      </div>
                      <Trophy size={20} />
                    </div>

                    {leaderboard.length === 0 ? (
                        <p className="ptd-empty">No leaderboard data available.</p>
                    ) : (
                        <div className="ptd-leaderboard-list">
                          {leaderboard.map((u, i) => (
                              <div
                                  key={i}
                                  className={`ptd-leader-row ${
                                      Number(u.userId) === Number(userId) ? "active" : ""
                                  }`}
                              >
                                <div className="ptd-rank-badge">#{i + 1}</div>

                                <div className="ptd-rank-user">
                                  <strong>
                                    {Number(u.userId) === Number(userId)
                                        ? profile?.fullName || fullName
                                        : `User ${u.userId}`}
                                  </strong>
                                  <small>Career participant</small>
                                </div>

                                <div className="ptd-rank-score">
                                  {u.score ?? u.readinessScore ?? 0}%
                                </div>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
                </section>

                <section className="ptd-card">
                  <div className="ptd-card-header">
                    <div>
                      <p className="ptd-card-kicker">Opportunities</p>
                      <h2>Recommended Jobs</h2>
                    </div>
                    <Briefcase size={20} />
                  </div>

                  {jobs.length === 0 ? (
                      <p className="ptd-empty">No recommended jobs found.</p>
                  ) : (
                      <div className="ptd-job-grid">
                        {jobs.map((job, i) => (
                            <div className="ptd-job-card" key={i}>
                              <div className="ptd-job-top">
                                <h3>{job.title || "Job Title"}</h3>
                                <span className="ptd-job-tag">Match</span>
                              </div>

                              <div className="ptd-job-meta">
                        <span>
                          <Building2 size={15} />
                          {job.company || "Company"}
                        </span>
                                <span>
                          <MapPin size={15} />
                                  {job.location || "Location"}
                        </span>
                              </div>

                              <p className="ptd-job-desc">
                                {job.description ||
                                    "This job matches the current skill profile and career path."}
                              </p>

                              <div className="ptd-job-bottom">
                        <span className="ptd-job-type">
                          {job.jobType || "Full Time"}
                        </span>
                                <span className="ptd-job-level">
                          {job.level || "Beginner"}
                        </span>
                              </div>

                              <button
                                  className="ptd-apply-btn"
                                  onClick={() => navigate(`/jobs/apply/${job.id}`)}
                              >
                                Apply Now
                                <ArrowRight size={16} />
                              </button>
                            </div>
                        ))}
                      </div>
                  )}
                </section>
              </>
          )}
        </div>
      </div>
  );
}
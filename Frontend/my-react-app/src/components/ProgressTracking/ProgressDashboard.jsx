import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import cloudCover from "../../assets/progress/cloud-cover.svg";
import securityCover from "../../assets/progress/security-cover.svg";
import programmingCover from "../../assets/progress/programming-cover.svg";
import "./ProgressDashboard.css";

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const SNAPSHOT_KEY = "progressDashboardSnapshot";

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const toPositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const toTitle = (value) => {
  if (!value) return "Skill";
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Normalize numeric score values coming from various services.
// Supports 0-1 floats (e.g. 0.75) and 0-100 integers.
const normalizeScore = (value) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  if (n > 0 && n <= 1) return Math.round(n * 100);
  return Math.round(n);
};

const normalizeWeightedAssessmentMark = (value, max) => {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return clamp(Math.round(n), 0, max);
};

const resolveAssessmentBreakdown = (progressPayload) => ({
  easy: normalizeWeightedAssessmentMark(progressPayload?.easy, 20),
  medium: normalizeWeightedAssessmentMark(progressPayload?.medium, 40),
  hard: normalizeWeightedAssessmentMark(progressPayload?.hard, 40),
});

const progressLevelRank = (highestLevelPassed) => {
  const value = normalizeText(highestLevelPassed);
  if (value === "advanced") return 3;
  if (value === "intermediate") return 2;
  if (value === "beginner") return 1;
  return 0;
};

const jobLevelRank = (jobLevel) => {
  const value = normalizeText(jobLevel);
  if (!value) return 0;
  if (value.includes("lead") || value.includes("senior") || value.includes("advanced")) return 3;
  if (value.includes("mid") || value.includes("associate") || value.includes("intermediate")) return 2;
  if (value.includes("entry") || value.includes("junior") || value.includes("intern") || value.includes("graduate")) return 1;
  return 1;
};

// Resolve a numeric score for a leaderboard entry from multiple possible fields and formats.
// Returns a 0-100 integer.
const resolveEntryScore = (entry) => {
  if (!entry || typeof entry !== "object") return 0;
  const candidates = [
    entry.careerReadinessScore,
    entry.career_readiness_score,
    entry.readinessScore,
    entry.readiness_score,
    entry.score,
    entry.matchPercent,
    entry.match_percent,
    entry.matchScore,
    entry.match_score,
    entry.percentage,
    entry.percent,
  ];

  // Also check nested 'metrics' or similar objects.
  if (entry.metrics && typeof entry.metrics === "object") {
    candidates.push(entry.metrics.careerReadinessScore, entry.metrics.score, entry.metrics.matchPercent);
  }

  // Try numeric values first (prefer non-zero and larger values)
  let best = null;
  for (const c of candidates) {
    const n = Number(c ?? 0);
    if (!Number.isFinite(n)) continue;
    const normalized = normalizeScore(n);
    if (best === null || normalized > best) best = normalized;
  }
  if (best !== null) return best;

  // As a fallback, parse strings that may contain a number (e.g., "67%" or "0.67").
  for (const c of candidates) {
    if (typeof c === "string") {
      const m = c.match(/([0-9]+(?:\.[0-9]+)?)/);
      if (m) return normalizeScore(Number(m[1]));
    }
  }

  // Deep scan object for any numeric-looking values (handles unexpected shapes)
  const seen = new Set();
  const walk = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    if (seen.has(obj)) return null;
    seen.add(obj);
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "number") {
        if (Number.isFinite(val)) return normalizeScore(val);
      }
      if (typeof val === "string") {
        const m = val.match(/([0-9]+(?:\.[0-9]+)?)/);
        if (m) return normalizeScore(Number(m[1]));
      }
      if (typeof val === "object") {
        const found = walk(val);
        if (found !== null) return found;
      }
    }
    return null;
  };

  const deepFound = walk(entry);
  return Number.isFinite(deepFound) ? deepFound : 0;
};

// Detect administrative/system accounts and exclude them from leaderboards.
const isAdminEntry = (entry) => {
  if (!entry) return false;
  const email = String(entry.email || entry.username || entry.userName || "").toLowerCase();
  const name = String(entry.fullName || entry.name || "").toLowerCase();
  if (email.includes("admin") || name.includes("admin")) return true;
  if (entry.role && String(entry.role).toLowerCase().includes("admin")) return true;
  if (Array.isArray(entry.roles) && entry.roles.some((r) => String(r).toLowerCase().includes("admin"))) return true;
  if (entry.isAdmin || entry.is_admin) return true;
  return false;
};

const formatUpdatedTime = (isoString) => {
  if (!isoString) return "Not updated yet";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Not updated yet";
  return date.toLocaleString();
};

const getTrend = (current, previous) => {
  if (typeof previous !== "number") {
    return { delta: 0, label: "New", tone: "neutral" };
  }
  const delta = Math.round((current - previous) * 10) / 10;
  if (delta > 0) return { delta, label: `+${delta}%`, tone: "up" };
  if (delta < 0) return { delta, label: `${delta}%`, tone: "down" };
  return { delta, label: "No change", tone: "neutral" };
};

const getReadinessLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Moderate";
  return "Needs Improvement";
};

const getRangeLabel = (score) => {
  if (score >= 80) return "80-100 Excellent";
  if (score >= 60) return "60-79 Good";
  if (score >= 40) return "40-59 Moderate";
  return "0-39 Needs Improvement";
};

const getProgressStageIndex = (highestLevelPassed) => {
  const value = normalizeText(highestLevelPassed);
  if (value === "advanced") return 3;
  if (value === "intermediate") return 2;
  if (value === "beginner") return 1;
  return 0;
};

const getProfileCompletion = (profile, fullName, email) => {
  const fields = [
    profile?.fullName || fullName,
    profile?.email || email,
    profile?.phone || profile?.contactNumber,
    profile?.address || profile?.location,
    profile?.bio || profile?.summary || profile?.description,
    profile?.university || profile?.education,
    profile?.skills,
  ];
  const completed = fields.filter((field) => {
    if (Array.isArray(field)) return field.length > 0;
    return Boolean(String(field || "").trim());
  }).length;
  return Math.round((completed / fields.length) * 100);
};

const getMetricDescription = (name) => {
  switch (name) {
    case "Skill Assessment":
      return "Built from your easy, medium, and hard assessment marks.";
    case "Courses Completed":
      return "Based on how many enrolled courses you have fully completed on the learning platform.";
    case "Leaderboard Strength":
      return "Reflects your rank compared with other learners in the same career path.";
    default:
      return "";
  }
};

const getJobTheme = (job) => {
  const category = String(job?.category || "").toLowerCase();
  const title = String(job?.title || "").toLowerCase();

  if (category.includes("cloud") || title.includes("cloud")) {
    return {
      image: "https://images.unsplash.com/photo-1695668548342-c0c1ad479aee?auto=format&fit=crop&w=1200&q=80",
      fallbackImage: cloudCover,
      tags: ["AWS", "Cloud Solutions", "Serverless"],
    };
  }
  if (category.includes("security") || title.includes("security") || title.includes("cyber")) {
    return {
      image: "https://images.unsplash.com/photo-1642783327549-db8f4487dd68?auto=format&fit=crop&w=1200&q=80",
      fallbackImage: securityCover,
      tags: ["Network Security", "Ethical Hacking", "Cryptography"],
    };
  }
  return {
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    fallbackImage: programmingCover,
    tags: ["Java", "Spring Boot", "Microservices"],
  };
};



const dedupeBy = (items, keyFn) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const proficiencyToScore = (value) => {
  switch (normalizeText(value)) {
    case "advanced":
      return 100;
    case "intermediate":
      return 75;
    case "beginner":
      return 50;
    default:
      return 0;
  }
};

const findSkillScore = (skillMap, rawName) => {
  const key = normalizeText(rawName);
  if (!key) return 0;
  if (skillMap[key] != null) return skillMap[key];

  for (const [name, score] of Object.entries(skillMap)) {
    if (name.includes(key) || key.includes(name)) {
      return score;
    }
  }
  return 0;
};

export default function ProgressDashboard() {
  const navigate = useNavigate();

  const storedUserId = Number(localStorage.getItem("userId") || 1);
  const storedCareerId = localStorage.getItem("careerId");
  const fullName = (localStorage.getItem("fullName") || localStorage.getItem("username") || "Student User").trim();
  const getStoredUsername = () => {
    const stored = localStorage.getItem("username");
    if (!stored || stored === "null" || stored === "undefined") return "Anonymous";
    return stored.trim().toLowerCase();
  };
  const email = getStoredUsername();

  const [profile, setProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [skillRatings, setSkillRatings] = useState([]);
  const [learningSkills, setLearningSkills] = useState([]);
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [learningResourceCompleted, setLearningResourceCompleted] = useState([]);
  const [fetchDiag, setFetchDiag] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardScoresMap, setLeaderboardScoresMap] = useState({});
  // Keep the dashboard aligned with the learning-resources service, which also uses localStorage.userId.
  const [currentUserId, setCurrentUserId] = useState(storedUserId);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isScoreCelebrating, setIsScoreCelebrating] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [snapshot, setSnapshot] = useState(() => {
    try {
      const raw = localStorage.getItem(SNAPSHOT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8081/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
          setProfile(data.data);
          setCurrentUserId(storedUserId || data.data?.id || 1);
        }
    } catch (err) {
      console.error("Profile fetch failed", err);
    }
  }, [storedUserId]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // The 8085 sync endpoint orchestrates fetching from 8082 and 8084.
      // We will call it after determining the user ID and career ID.

      // Do not fetch legacy enrollments for other users to avoid merging unrelated records.
const legacyUserId = null;

      const [careerRes, profileRes] = await Promise.all([
        fetch("http://localhost:8085/api/careers").catch(() => ({ ok: false })),
        fetch("http://localhost:8081/api/student/profile", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).catch(() => ({ ok: false })),
      ]);

      const careersData = careerRes && careerRes.ok ? await careerRes.json() : [];
      const profilePayload = profileRes && profileRes.ok ? await profileRes.json() : null;
      const profileData = profilePayload?.success ? profilePayload.data : null;
      const preferredCareerPath =
        profileData?.selectedCareerPath ||
        localStorage.getItem("selectedCareerPath") ||
        localStorage.getItem("careerPath") ||
        localStorage.getItem("careerTitle");

      const validStoredCareerId = toPositiveNumber(storedCareerId);
      const matchedCareer = Array.isArray(careersData)
        ? careersData.find((career) => normalizeText(career.title) === normalizeText(preferredCareerPath))
        : null;
      const resolvedCareerId = matchedCareer?.id ?? validStoredCareerId ?? 1;

      if (matchedCareer?.id && String(matchedCareer.id) !== String(storedCareerId || "")) {
        localStorage.setItem("careerId", String(matchedCareer.id));
      }

      const effectiveUserId = storedUserId || profileData?.id || currentUserId || 1;
      // Persist the same id used by the learning-resources pages so course completion counts stay consistent.
      setCurrentUserId(effectiveUserId);
      const usernameForProgress = profileData?.email || email;

      try {
        await fetch(`http://localhost:8085/api/progress/sync?username=${encodeURIComponent(usernameForProgress)}`, { method: "POST" });
      } catch (syncErr) {
        console.warn("User-skill sync failed; continuing with existing readiness data.", syncErr);
      }

      const [r1, r2, r3, r4, r5, r6, r7, _r8, r9, legacySkillsRes, legacyEnrollmentsRes] = await Promise.all([
        fetch(`http://localhost:8085/api/readiness/${effectiveUserId}/${resolvedCareerId}`).catch(() => ({ ok: false, status: null })),
        fetch(`http://localhost:8085/api/leaderboard/career/${resolvedCareerId}?top=1000`).catch(() => ({ ok: false, status: null })),
        fetch(`http://localhost:8085/api/recommendations/jobs/${effectiveUserId}?top=5`).catch(() => ({ ok: false, status: null })),
        fetch(`http://localhost:8082/api/progress?${new URLSearchParams({ username: usernameForProgress })}`).catch(() => ({ ok: false, status: null })),
        fetch(`http://localhost:8082/api/skill-ratings?${new URLSearchParams({ username: usernameForProgress })}`).catch(() => ({ ok: false, status: null })),
        fetch(`http://localhost:8084/api/skills/user/${effectiveUserId}`).catch(() => ({ ok: false, status: null })),
        fetch(`http://localhost:8084/api/enrollments/user/${effectiveUserId}`).catch(() => ({ ok: false, status: null })),
        fetch("http://localhost:8084/api/courses").catch(() => ({ ok: false, status: null })),
        fetch("http://localhost:8085/api/jobs").catch(() => ({ ok: false, status: null })),
        legacyUserId ? fetch(`http://localhost:8084/api/skills/user/${legacyUserId}`).catch(() => ({ ok: false, status: null })) : Promise.resolve({ ok: false }),
        legacyUserId ? fetch(`http://localhost:8084/api/enrollments/user/${legacyUserId}`).catch(() => ({ ok: false, status: null })) : Promise.resolve({ ok: false }),
      ]);

      const readinessData = r1.ok ? await r1.json() : null;
      const leaderboardData = r2.ok ? await r2.json() : [];
      const jobsData = r3.ok ? await r3.json() : [];
      const progressData = r4 && r4.ok ? await r4.json() : null;
      const skillRatingsData = r5 && r5.ok ? await r5.json() : [];
      const primaryLearningSkills = r6 && r6.ok ? await r6.json() : [];
      const primaryEnrollments = r7 && r7.ok ? await r7.json() : [];
      const allJobsData = r9 && r9.ok ? await r9.json() : [];
      const legacyLearningSkills = legacySkillsRes && legacySkillsRes.ok ? await legacySkillsRes.json() : [];
      const legacyEnrollments = legacyEnrollmentsRes && legacyEnrollmentsRes.ok ? await legacyEnrollmentsRes.json() : [];

      // Quick diagnostics summary for upstream fetches to help debug failed dashboard loads
      try {
        setFetchDiag([
          { key: 'readiness', ok: Boolean(r1 && r1.ok), status: r1?.status ?? null },
          { key: 'leaderboard', ok: Boolean(r2 && r2.ok), status: r2?.status ?? null },
          { key: 'jobs', ok: Boolean(r3 && r3.ok), status: r3?.status ?? null },
          { key: 'progress', ok: Boolean(r4 && r4.ok), status: r4?.status ?? null },
          { key: 'skillRatings', ok: Boolean(r5 && r5.ok), status: r5?.status ?? null },
          { key: 'skills', ok: Boolean(r6 && r6.ok), status: r6?.status ?? null },
          { key: 'enrollments', ok: Boolean(r7 && r7.ok), status: r7?.status ?? null },
          { key: 'courses', ok: Boolean(_r8 && _r8.ok), status: _r8?.status ?? null },
          { key: 'jobsCatalog', ok: Boolean(r9 && r9.ok), status: r9?.status ?? null },
        ]);
      } catch (e) {
        console.debug('setFetchDiag failed', e);
      }

      const mergedLearningSkills = dedupeBy(
        [...(Array.isArray(primaryLearningSkills) ? primaryLearningSkills : []), ...(Array.isArray(legacyLearningSkills) ? legacyLearningSkills : [])],
        (skill) => `${String(skill.userId ?? "")}:${String(skill.skillName ?? "").toLowerCase()}`,
      );

      const mergedEnrollments = dedupeBy(
        [...(Array.isArray(primaryEnrollments) ? primaryEnrollments : []), ...(Array.isArray(legacyEnrollments) ? legacyEnrollments : [])],
        // Dedupe by courseId only so repeated enrollments for the same course aren't double-counted.
        (enrollment) => `${enrollment.courseId}`,
      );

      const completedEnrollmentCourseIds = mergedEnrollments
        .filter((enrollment) => Number(enrollment.completed ?? 0) === 1 || Number(enrollment.progress ?? 0) >= 100)
        .map((enrollment) => enrollment.courseId)
        .filter(Boolean);

      setReadiness(readinessData);
      setSkillRatings(Array.isArray(skillRatingsData) ? skillRatingsData : []);
      setLearningSkills(mergedLearningSkills);
      setCourseEnrollments(mergedEnrollments);
      setLearningResourceCompleted(completedEnrollmentCourseIds);
      setAllJobs(Array.isArray(allJobsData) ? allJobsData : []);
      // Filter out administrative/system accounts from leaderboard data, if present.
const cleanedLeaderboard = Array.isArray(leaderboardData) ? leaderboardData.filter((e) => !isAdminEntry(e)) : [];
setLeaderboard(cleanedLeaderboard);
      setJobs(Array.isArray(jobsData) ? jobsData : []);

      // Enhance top leaderboard preview entries by computing per-user weighted readiness when the source score is missing.
      (async () => {
        try {
          const top = cleanedLeaderboard.slice(0, 5);
          if (!top.length) return;

          const enhanced = await Promise.all(top.map(async (entry) => {
            const uid = entry.userId;
            let resolved = resolveEntryScore(entry);

            // Try readiness endpoint for this career (simplified checks)
            try {
              const rr = await fetch(`http://localhost:8085/api/readiness/${uid}/${resolvedCareerId}`);
              if (rr?.ok) {
                const rd = await rr.json();
                const crs = Number(rd?.careerReadinessScore ?? 0);
                if (crs > 0) resolved = normalizeScore(crs);
              }
            } catch (e) {
              console.debug('Readiness fetch failed', e);
            }

            // Fetch progress for assessment breakdown
            let progressPayload = null;
            try {
              const p = await fetch(`http://localhost:8082/api/progress?${new URLSearchParams({ username: entry.email || entry.name || entry.username })}`);
              progressPayload = p?.ok ? await p.json() : null;
            } catch (e) { console.debug('Progress fetch failed for leaderboard entry', entry?.userId || entry?.email, e); }
            const { easy, medium, hard } = resolveAssessmentBreakdown(progressPayload);
            const assessmentProgressVal = easy + medium + hard;

            // Fetch enrollments to compute completed courses count
            let enrollPayload = null;
            try {
              const er = await fetch(`http://localhost:8084/api/enrollments/user/${uid}`);
              enrollPayload = er?.ok ? await er.json() : null;
            } catch (e) { console.debug('Enrollments fetch failed for leaderboard entry', uid, e); }
            const enrollArray = Array.isArray(enrollPayload) ? enrollPayload : [];
            const completedCoursesCountLocal = enrollArray.filter((en) => Number(en.completed ?? 0) === 1 || Number(en.progress ?? 0) >= 100).length;
            const coursesCompletedValLocal = clamp(completedCoursesCountLocal * 25);

            // provisional score uses default leaderboardVal placeholder (25) — will be adjusted later
            const provisional = Math.round(assessmentProgressVal * 0.45 + coursesCompletedValLocal * 0.35 + 25 * 0.2);
            const computed = resolved > 0 ? resolved : provisional;
            return {
              userId: uid,
              entry,
              assessmentProgressVal,
              completedCoursesCountLocal,
              coursesCompletedValLocal,
              computedScore: computed,
            };
          }));

          // Build score map starting from resolved scores for all entries, override top ones with computed if present.
          const baseScores = cleanedLeaderboard.map((e) => ({ userId: e.userId, score: resolveEntryScore(e) }));
          const baseMap = Object.fromEntries(baseScores.map((s) => [s.userId, s.score]));
          enhanced.forEach((en) => { baseMap[en.userId] = en.computedScore; });

          // Create ranking across full leaderboard using these scores.
          const sortedUsers = [...cleanedLeaderboard].sort((a, b) => (baseMap[b.userId] ?? 0) - (baseMap[a.userId] ?? 0));
          const total = sortedUsers.length;
          const rankMap = Object.fromEntries(sortedUsers.map((u, idx) => [u.userId, idx + 1]));

          // Compute final overallScore per top user using exact formula and derived leaderboardVal based on rank.
          const finalMap = {};
          enhanced.forEach((en) => {
            const rank = rankMap[en.userId] ?? null;
            const leaderboardValLocal = rank ? clamp(Math.round(((total - rank + 1) / total) * 100)) : 25;
            finalMap[en.userId] = Math.round(en.assessmentProgressVal * 0.45 + en.coursesCompletedValLocal * 0.35 + leaderboardValLocal * 0.2);
          });

          setLeaderboardScoresMap((m) => ({ ...m, ...finalMap }));
        } catch (err) {
          console.warn("Failed to enhance leaderboard preview", err);
        }
      })();
      setUserProgress(progressData);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard. Make sure all backend services are running.");
    } finally {
      setLoading(false);
    }
  }, [email, storedUserId, storedCareerId, currentUserId]);

  useEffect(() => {
    fetchProfile();
    fetchDashboardData();
  }, [fetchProfile, fetchDashboardData]);

  const firstName = useMemo(() => {
    const name = profile?.fullName || fullName;
    return name ? name.split(" ")[0] : "Student";
  }, [profile, fullName]);

  const assessmentBreakdown = useMemo(() => {
    return resolveAssessmentBreakdown(userProgress);
  }, [userProgress]);

  const assessmentProgress = useMemo(
    () => assessmentBreakdown.easy + assessmentBreakdown.medium + assessmentBreakdown.hard,
    [assessmentBreakdown],
  );

  const rankedLeaderboard = useMemo(
    () =>
      [...leaderboard].sort(
        (a, b) => resolveEntryScore(b) - resolveEntryScore(a),
      ),
    [leaderboard],
  );

  const leaderboardIndex = useMemo(
    () =>
      rankedLeaderboard.findIndex(
        (entry) =>
          String(entry.userId) === String(currentUserId) ||
          entry.username === email ||
          entry.fullName === fullName ||
          entry.name === fullName ||
          entry.email === email,
      ),
    [rankedLeaderboard, currentUserId, email, fullName],
  );

  const leaderboardRank = leaderboardIndex >= 0 ? leaderboardIndex + 1 : null;
  const leaderboardTotal = rankedLeaderboard.length;

  const leaderboardVal = useMemo(() => {
    if (!leaderboardTotal) return 0;
    if (!leaderboardRank) return 25;
    return clamp(Math.round(((leaderboardTotal - leaderboardRank + 1) / leaderboardTotal) * 100));
  }, [leaderboardRank, leaderboardTotal]);

  const userSkillScoreMap = useMemo(() => {
    const map = {};

    for (const rating of skillRatings) {
      const key = normalizeText(rating?.category);
      if (!key) continue;
      map[key] = Math.max(map[key] ?? 0, clamp(Number(rating?.average ?? 0)));
    }

    for (const skill of learningSkills) {
      const key = normalizeText(skill?.skillName);
      if (!key) continue;
      map[key] = Math.max(map[key] ?? 0, proficiencyToScore(skill?.proficiencyLevel));
    }

    return map;
  }, [skillRatings, learningSkills]);

  const recommendedJobs = useMemo(() => {
    if (!jobs.length) return [];
    const userRank = progressLevelRank(userProgress?.highestLevelPassed);

    const completedCountRaw = new Set([
      ...courseEnrollments
        .filter((enrollment) => enrollment.verificationStatus !== "REJECTED")
        .filter((enrollment) => Number(enrollment.completed ?? 0) === 1 || Number(enrollment.progress ?? 0) >= 100)
        .map((enrollment) => enrollment.courseId || enrollment.course_id || enrollment.id)
        .filter(Boolean),
      ...(learningResourceCompleted || []),
    ]).size;

    const explicitSkillScores = Object.values(userSkillScoreMap).filter((value) => Number.isFinite(value) && value > 0);
    const skillSignal = explicitSkillScores.length
      ? explicitSkillScores.reduce((sum, value) => sum + value, 0) / explicitSkillScores.length
      : 0;

    const assessmentSignal = skillRatings.length
      ? skillRatings.reduce((sum, rating) => sum + clamp(Number(rating?.average ?? 0)), 0) / skillRatings.length
      : 0;

    const genericFallbackScore = clamp(
      Math.round(Math.max(skillSignal, assessmentSignal, completedCountRaw * 20)),
    );

    return jobs.map((job) => {
      const backendScore = normalizeScore(job?.matchScore ?? 0);
      const levelRank = jobLevelRank(job?.level);
      const isUnlocked = levelRank <= userRank || levelRank === 0;
      if (backendScore > 0) {
        return { ...job, resolvedMatchScore: backendScore, isUnlocked, jobLevelRank: levelRank };
      }

      const fullJob = allJobs.find((item) => String(item?.id) === String(job?.jobId ?? job?.id));
      const requirements = Array.isArray(fullJob?.requirements) ? fullJob.requirements : [];

      if (!requirements.length) {
        return { ...job, resolvedMatchScore: genericFallbackScore || backendScore, isUnlocked, jobLevelRank: levelRank };
      }

      let sum = 0;
      let count = 0;

      for (const requirement of requirements) {
        const requiredPct = clamp(Number(requirement?.percentage ?? 0));
        const userPct = findSkillScore(userSkillScoreMap, requirement?.language);

        if (requiredPct <= 0) continue;

        const ratio = clamp(Math.round((userPct / requiredPct) * 100));
        sum += ratio;
        count += 1;
      }

      const requirementBasedScore = count > 0 ? Math.round(sum / count) : 0;
      const fallbackScore = requirementBasedScore > 0 ? requirementBasedScore : genericFallbackScore || backendScore;
      return { ...job, resolvedMatchScore: fallbackScore, isUnlocked, jobLevelRank: levelRank };
    }).sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      if (a.isUnlocked && b.isUnlocked && a.jobLevelRank !== b.jobLevelRank) {
        return b.jobLevelRank - a.jobLevelRank;
      }
      return normalizeScore(b.resolvedMatchScore) - normalizeScore(a.resolvedMatchScore);
    });
  }, [jobs, allJobs, userSkillScoreMap, courseEnrollments, learningResourceCompleted, skillRatings, userProgress]);

  const averageJobMatch = useMemo(() => {
    if (!recommendedJobs.length) return 0;
    const total = recommendedJobs.reduce((sum, job) => {
      return sum + normalizeScore(job?.resolvedMatchScore ?? job?.matchScore ?? 0);
    }, 0);
    return Math.round((total / recommendedJobs.length) * 10) / 10;
  }, [recommendedJobs]);

  const activeEnrollments = useMemo(
    () => courseEnrollments.filter((enrollment) => enrollment.verificationStatus !== "REJECTED"),
    [courseEnrollments],
  );


  const completedCoursesCount = useMemo(() => {
    const enrollCompletedIds = activeEnrollments
      .filter((enrollment) => Number(enrollment.completed ?? 0) === 1 || Number(enrollment.progress ?? 0) === 100)
      .map((en) => en.courseId || en.course_id || en.id)
      .filter(Boolean);
    const union = new Set([...(enrollCompletedIds || []), ...(learningResourceCompleted || [])]);
    return union.size;
  }, [activeEnrollments, learningResourceCompleted]);

  const coursesCompletedVal = useMemo(() => clamp(completedCoursesCount * 25), [completedCoursesCount]);

  const profileCompletion = useMemo(() => getProfileCompletion(profile, fullName, email), [profile, fullName, email]);
  const currentStageIndex = useMemo(() => getProgressStageIndex(userProgress?.highestLevelPassed), [userProgress]);

  const overallScore = useMemo(() => {
    if (readiness?.careerReadinessScore != null && readiness.careerReadinessScore > 0) {
      return normalizeScore(readiness.careerReadinessScore);
    }
    return Math.round(
        assessmentProgress * 0.45 +
          coursesCompletedVal * 0.35 +
          leaderboardVal * 0.2
      );
  }, [readiness, assessmentProgress, coursesCompletedVal, leaderboardVal]);

  const levelLabel = useMemo(() => getReadinessLabel(overallScore), [overallScore]);
  const scoreRange = useMemo(() => getRangeLabel(overallScore), [overallScore]);

  const readinessBreakdown = useMemo(
    () => [
      { name: "Skill Assessment", value: assessmentProgress, color: "#0ea5e9", weight: "45%" },
      { name: "Courses Completed", value: coursesCompletedVal, color: "#16a34a", weight: "35%" },
      { name: "Leaderboard Strength", value: leaderboardVal, color: "#4cc9f0", weight: "20%" },
    ],
    [assessmentProgress, coursesCompletedVal, leaderboardVal],
  );

  const skillAnalysis = useMemo(() => {
    const breakdown = Array.isArray(readiness?.breakdown) ? readiness.breakdown : [];
    let normalized = breakdown.map((item, index) => {
      const score = Number(item.matchPercent ?? item.matchPercentage ?? item.score ?? 0);
      const userLevel = Number(item.userLevel ?? 0);
      const requiredLevel = Number(item.requiredLevel ?? 0);
      const rawName = item.skillName ?? item.name;
      return {
        id: item.skillId ?? `skill-${index}`,
        name: toTitle(rawName),
        score,
        userLevel,
        requiredLevel,
        gap: Math.max(requiredLevel - userLevel, 0),
      };
    }).filter((item) => item.name && item.name !== "Skill");

    if (!normalized.length && skillRatings.length) {
      normalized = skillRatings.map((rating, index) => ({
        id: rating.id ?? `rating-${index}`,
        name: toTitle(rating.category ?? `Skill ${index + 1}`),
        score: Number(rating.average ?? 0),
        userLevel: Math.round(Number(rating.average ?? 0) / 20),
        requiredLevel: 5,
        gap: Math.max(5 - Math.round(Number(rating.average ?? 0) / 20), 0),
      })).filter((item) => item.name && item.name !== "Skill" && item.score > 0);
    }

    const strengths = [...normalized].sort((a, b) => b.score - a.score).slice(0, 3);
    const gaps = [...normalized]
      .sort((a, b) => {
        if (b.gap !== a.gap) return b.gap - a.gap;
        return a.score - b.score;
      })
      .slice(0, 3);

    return { all: normalized, strengths, gaps };
  }, [readiness, skillRatings]);

  const recommendedActions = useMemo(() => {
    const actions = [];

    if (assessmentProgress < 70) {
      actions.push({
        title: "Retake the next assessment level",
        detail: "Increase your marks in intermediate and advanced assessments to lift your readiness score.",
      });
    }

    if (skillAnalysis.gaps[0]) {
      actions.push({
        title: `Close the gap in ${skillAnalysis.gaps[0].name}`,
        detail: `Your current level is ${skillAnalysis.gaps[0].userLevel} and the target is ${skillAnalysis.gaps[0].requiredLevel}.`,
      });
    }

    if (profileCompletion < 85) {
      actions.push({
        title: "Complete your profile",
        detail: "Add missing profile details to make recommendations more useful and credible.",
      });
    }

    if (completedCoursesCount < 2) {
      actions.push({
        title: "Complete more approved learning paths",
        detail: "Course completions now directly affect your progress level on this dashboard.",
      });
    }

    if (jobs.length < 3) {
      actions.push({
        title: "Improve job discovery coverage",
        detail: "Add skills and finish assessments to unlock more strong job recommendations.",
      });
    } else {
      actions.push({
        title: "Apply to a matched role",
        detail: `You already have ${jobs.length} recommendations with an average match of ${averageJobMatch}%.`,
      });
    }

    return actions.slice(0, 4);
  }, [assessmentProgress, skillAnalysis, profileCompletion, jobs.length, averageJobMatch, completedCoursesCount]);

  const achievements = useMemo(() => {
    const badges = [];
    if (assessmentBreakdown.easy >= 16) badges.push("Strong foundation");
    if (assessmentBreakdown.medium >= 28) badges.push("Intermediate ready");
    if (assessmentBreakdown.hard >= 28) badges.push("Advanced performer");
    if (coursesCompletedVal >= 75) badges.push("Learning momentum");
    if (leaderboardRank && leaderboardRank <= 10) badges.push("Top 10 leaderboard");
    if (jobs.length >= 3) badges.push("High opportunity pipeline");
    if (completedCoursesCount >= 2) badges.push("Active learner");
    return badges.slice(0, 5);
  }, [assessmentBreakdown, coursesCompletedVal, leaderboardRank, jobs.length, completedCoursesCount]);

  const trends = useMemo(
    () => ({
      overall: getTrend(overallScore, snapshot?.overallScore),
      assessment: getTrend(assessmentProgress, snapshot?.assessmentProgress),
      courses: getTrend(coursesCompletedVal, snapshot?.coursesCompletedVal),
      leaderboard: getTrend(leaderboardVal, snapshot?.leaderboardVal),
      profile: getTrend(profileCompletion, snapshot?.profileCompletion),
    }),
    [overallScore, snapshot, assessmentProgress, coursesCompletedVal, leaderboardVal, profileCompletion],
  );

  useEffect(() => {
    if (loading || !lastUpdated) return;
    const previousOverall = Number(snapshot?.overallScore);
    const shouldCelebrate = Number.isFinite(previousOverall) && overallScore > previousOverall;

    if (shouldCelebrate) {
      setCelebrationKey((current) => current + 1);
      setIsScoreCelebrating(true);
      const nextSnapshot = {
        overallScore,
        assessmentProgress,
        coursesCompletedVal,
        leaderboardVal,
        profileCompletion,
        capturedAt: lastUpdated,
      };
      localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(nextSnapshot));
      setSnapshot(nextSnapshot);
      return;
    }

    const nextSnapshot = {
      overallScore,
      assessmentProgress,
      coursesCompletedVal,
      leaderboardVal,
      profileCompletion,
      capturedAt: lastUpdated,
    };
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(nextSnapshot));
    setSnapshot(nextSnapshot);
  }, [loading, lastUpdated, overallScore, assessmentProgress, coursesCompletedVal, leaderboardVal, profileCompletion]);

  useEffect(() => {
    if (!isScoreCelebrating) return;
    const timer = window.setTimeout(() => {
      setIsScoreCelebrating(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [isScoreCelebrating]);

  const topLeaderboardPreview = useMemo(() => rankedLeaderboard.slice(0, 5), [rankedLeaderboard]);

  const headline = useMemo(() => {
    if (overallScore >= 80) {
      return "You are in a strong position for your current career target. Focus on converting matches into applications.";
    }
    if (overallScore >= 60) {
      return "You are progressing well. Closing the main skill gaps should noticeably improve job matching.";
    }
    if (overallScore >= 40) {
      return "Your foundation is visible, but the dashboard shows a few gaps that are limiting readiness and ranking.";
    }
    return "Your dashboard needs more completed assessments and stronger skill coverage before recommendations become competitive.";
  }, [overallScore]);

  const progressStages = useMemo(
    () => [
      {
        name: "Beginner",
        state: currentStageIndex >= 1 ? "done" : "current",
        hint: "Build your base with the first level of assessments.",
      },
      {
        name: "Intermediate",
        state: currentStageIndex >= 2 ? "done" : currentStageIndex === 1 ? "current" : "locked",
        hint: "Unlock stronger jobs by clearing medium-level assessments.",
      },
      {
        name: "Advanced",
        state: currentStageIndex >= 3 ? "done" : currentStageIndex >= 2 ? "current" : "locked",
        hint: "Reach senior-ready opportunities with advanced performance.",
      },
    ],
    [currentStageIndex],
  );

  const unlockedRecommendedJobs = useMemo(
    () => recommendedJobs.filter((job) => job.isUnlocked).slice(0, 3),
    [recommendedJobs],
  );

  const nextUnlockJobs = useMemo(
    () => recommendedJobs.filter((job) => !job.isUnlocked).slice(0, 3),
    [recommendedJobs],
  );

  const scoreSummaryCards = useMemo(
    () => [
      { label: "Assessment", value: `${assessmentProgress}%`, tone: "blue" },
      { label: "Courses", value: String(completedCoursesCount), tone: "green" },
      { label: "Rank", value: leaderboardRank ? `#${leaderboardRank}` : "Unranked", tone: "gold" },
    ],
    [assessmentProgress, completedCoursesCount, leaderboardRank],
  );

  const jobRecommendationMessage = useMemo(() => {
    if (jobs.length > 0) return null;
    if (!allJobs.length) {
      return "No jobs have been added to the jobs service yet.";
    }
    if (!learningSkills.length && !skillRatings.length) {
      return "No user skills are available yet for job matching. Complete courses or assessments first.";
    }
    return "Jobs exist, but no matching recommendations are available for your current skill data yet.";
  }, [jobs.length, allJobs.length, learningSkills.length, skillRatings.length]);

  const doughnutData = {
    labels: ["Readiness", "Remaining"],
    datasets: [
      {
        data: [overallScore, 100 - overallScore],
        backgroundColor: ["#0ea5e9", "#e8edf5"],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: readinessBreakdown.map((item) => item.name),
    datasets: [
      {
        label: "Score",
        data: readinessBreakdown.map((item) => item.value),
        backgroundColor: readinessBreakdown.map((item) => item.color),
        borderRadius: 12,
      },
    ],
  };

  const lineData = {
    labels: ["Assessment", "Matching", "Leaderboard", "Jobs", "Profile", "Current"],
    datasets: [
      {
        label: "Readiness Factors",
        data: [assessmentProgress, coursesCompletedVal, leaderboardVal, profileCompletion, averageJobMatch, overallScore],
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.16)",
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } },
  };

  return (
    <div className="ptd-page">
      <div className="ptd-shell">
        <div className="ptd-back-nav">
          <button className="ptd-back-btn" onClick={() => navigate("/services")}>
            <ArrowLeft size={18} /> Back to Services
          </button>
        </div>

        <section className="ptd-hero">
          <div className="ptd-hero-main">
            <div className="ptd-profile-avatar">{firstName.charAt(0).toUpperCase()}</div>
            <div className="ptd-hero-copy">
              <p className="ptd-eyebrow">PROGRESS TRACKING DASHBOARD</p>
              <h1>{firstName}, your readiness snapshot is {levelLabel.toLowerCase()}.</h1>
              <p className="ptd-subtext">{headline}</p>

              <div className="ptd-meta-row">
                <span><User size={15} /> Profile completion {profileCompletion}%</span>
                <span><Trophy size={15} /> {leaderboardRank ? `Rank #${leaderboardRank} of ${leaderboardTotal}` : `Outside top ${Math.max(leaderboardTotal, 5)}`}</span>
                <span><Briefcase size={15} /> {jobs.length} matched jobs</span>
                <span><RefreshCw size={15} /> Updated {formatUpdatedTime(lastUpdated)}</span>
              </div>

              <div className="ptd-top-actions">
                <button className="ptd-action-btn ptd-action-btn-primary" onClick={() => navigate("/assessment")}>
                  <GraduationCap size={18} /> Continue Assessment
                </button>
                <button className="ptd-action-btn ptd-action-btn-light" onClick={fetchDashboardData} disabled={loading}>
                  <RefreshCw size={18} /> Refresh Dashboard
                </button>
              </div>
            </div>
          </div>

          <div className={`ptd-score-card${isScoreCelebrating ? " celebrating" : ""}`}>
            {isScoreCelebrating && (
              <div key={celebrationKey} className="ptd-score-celebration" aria-hidden="true">
                <span className="ptd-firework ptd-firework-left" />
                <span className="ptd-firework ptd-firework-right" />
                <span className="ptd-firework ptd-firework-top" />
                <span className="ptd-firework ptd-firework-bottom" />
                <span className="ptd-score-glow" />
              </div>
            )}
            <div className="ptd-score-top">
              <div>
                <p className="ptd-mini-label">Weighted Career Readiness</p>
                <h3>{levelLabel}</h3>
              </div>
              <div className="ptd-mini-badge"><Sparkles size={16} /> {scoreRange}</div>
            </div>

            <div className="ptd-chart-doughnut-wrapper">
              <Doughnut data={doughnutData} options={{ cutout: "76%", plugins: { legend: { display: false } } }} />
              <div className="ptd-doughnut-center">
                <span>{overallScore}%</span>
                <small>Overall</small>
              </div>
            </div>

            <p className="ptd-score-message">
              Weighted from assessment marks, completed courses, and leaderboard strength.
            </p>

            {isScoreCelebrating && (
              <div className="ptd-score-rise-badge">
                <Sparkles size={15} /> Overall score increased
              </div>
            )}

            <div className="ptd-score-footer">
              <div className="ptd-score-mini">
                <span>Trend</span>
                <strong>{trends.overall.label}</strong>
              </div>
              <div className="ptd-score-mini">
                <span>Courses Completed</span>
                <strong>{completedCoursesCount}</strong>
              </div>
              <div className="ptd-score-mini">
                <span>Profile</span>
                <strong>{profileCompletion}%</strong>
              </div>
            </div>
          </div>
        </section>

        {error && <div className="ptd-error">{error}</div>}
        {error && fetchDiag && (
          <div className="ptd-debug" style={{ margin: '12px 0', padding: 12, background: '#fff6f6', border: '1px solid #ffd6d6' }}>
            <h4 style={{ margin: '0 0 8px' }}>Debug info (visible while dashboard error exists)</h4>
            <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 240, overflow: 'auto', margin: 0 }}>
              {JSON.stringify({ currentUserId, email, fetchDiag, lastUpdated, courseEnrollmentsCount: courseEnrollments.length, learningResourceCompleted }, null, 2)}
            </pre>
          </div>
        )}
        {loading && (
          <div className="ptd-loading-stack">
            <div className="ptd-loading-card ptd-loading-hero">
              <div className="ptd-skeleton ptd-skeleton-pill" />
              <div className="ptd-skeleton ptd-skeleton-title" />
              <div className="ptd-skeleton ptd-skeleton-line" />
              <div className="ptd-skeleton ptd-skeleton-line short" />
            </div>
            <div className="ptd-loading-grid">
              <div className="ptd-loading-card ptd-loading-stat"><div className="ptd-skeleton ptd-skeleton-card" /></div>
              <div className="ptd-loading-card ptd-loading-stat"><div className="ptd-skeleton ptd-skeleton-card" /></div>
              <div className="ptd-loading-card ptd-loading-stat"><div className="ptd-skeleton ptd-skeleton-card" /></div>
              <div className="ptd-loading-card ptd-loading-stat"><div className="ptd-skeleton ptd-skeleton-card" /></div>
            </div>
          </div>
        )}

        {!loading && (
          <>
            <section className="ptd-executive-strip">
              <div className="ptd-executive-summary">
                <div className="ptd-executive-copy">
                  <p className="ptd-panel-title">Executive Summary</p>
                  <h2>{overallScore}% overall readiness</h2>
                  <p>{headline}</p>
                </div>
                <div className="ptd-executive-metrics">
                  {scoreSummaryCards.map((item) => (
                    <div key={item.label} className={`ptd-summary-chip ${item.tone}`}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ptd-level-journey">
                <div className="ptd-card-header">
                  <h2>Level Progression</h2>
                  <Sparkles size={20} />
                </div>
                <div className="ptd-stage-row">
                  {progressStages.map((stage, index) => (
                    <div key={stage.name} className={`ptd-stage-card ${stage.state}`}>
                      <div className="ptd-stage-badge">{index + 1}</div>
                      <strong>{stage.name}</strong>
                      <p>{stage.hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="ptd-stats-grid">
              <div className="ptd-stat-card">
                <div className="ptd-stat-icon blue"><Target size={20} /></div>
                <div>
                  <p>Overall Readiness</p>
                  <h3>{overallScore}%</h3>
                  <small className={`ptd-trend ${trends.overall.tone}`}>{trends.overall.label}</small>
                </div>
              </div>
              <div className="ptd-stat-card">
                <div className="ptd-stat-icon purple"><Award size={20} /></div>
                <div>
                  <p>Assessment Score</p>
                  <h3>{assessmentProgress}%</h3>
                  <small className={`ptd-trend ${trends.assessment.tone}`}>{trends.assessment.label}</small>
                </div>
              </div>
              <div className="ptd-stat-card">
                <div className="ptd-stat-icon green"><Briefcase size={20} /></div>
                <div>
                  <p>Courses Completed</p>
                  <h3>{completedCoursesCount}</h3>
                  <small className={`ptd-trend ${trends.courses.tone}`}>{trends.courses.label}</small>
                </div>
              </div>
              <div className="ptd-stat-card">
                <div className="ptd-stat-icon gold"><Trophy size={20} /></div>
                <div>
                  <p>Leaderboard Rank</p>
                  <h3>{leaderboardRank ? `#${leaderboardRank}` : "Unranked"}</h3>
                  <small className={`ptd-trend ${trends.leaderboard.tone}`}>
                    {leaderboardTotal ? `of ${leaderboardTotal} users` : "No ranking data"}
                  </small>
                </div>
              </div>
            </section>

            <section className="ptd-insight-grid">
              <div className="ptd-card">
                <div className="ptd-card-header">
                  <h2>Career Readiness Breakdown</h2>
                  <BarChart3 size={20} />
                </div>
                <div className="ptd-skill-list">
                  {readinessBreakdown.map((item) => (
                    <div key={item.name} className="ptd-skill-item">
                      <div className="ptd-skill-head">
                        <span>{item.name}</span>
                        <span>{item.value}%</span>
                      </div>
                      <p className="ptd-skill-desc">{getMetricDescription(item.name)}</p>
                    <div className="ptd-weight-row">
                      <span>Weight in overall score</span>
                      <strong>{item.weight}</strong>
                    </div>
                    {item.name === "Courses Completed" && (
                      <div className="ptd-weight-row">
                        <span>Completed courses</span>
                        <strong>{completedCoursesCount}</strong>
                      </div>
                    )}
                    <div className="ptd-bar">
                      <div className="ptd-bar-fill" style={{ width: `${item.value}%`, background: item.color }} />
                    </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ptd-card">
                <div className="ptd-card-header">
                  <h2>Next Best Actions</h2>
                  <TrendingUp size={20} />
                </div>
                <div className="ptd-actions-list">
                  {recommendedActions.map((action) => (
                    <div key={action.title} className="ptd-action-item">
                      <strong>{action.title}</strong>
                      <p>{action.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="ptd-chart-grid">
              <div className="ptd-card">
                <div className="ptd-card-header">
                  <h2>Metric Comparison</h2>
                  <BarChart3 size={20} />
                </div>
                <div className="ptd-chart-container">
                  <Bar data={barData} options={chartOptions} />
                </div>
              </div>

              <div className="ptd-card">
                <div className="ptd-card-header">
                  <h2>Capability Shape</h2>
                  <TrendingUp size={20} />
                </div>
                <div className="ptd-chart-container">
                  <Line data={lineData} options={chartOptions} />
                </div>
              </div>
            </section>

            <section className="ptd-main-grid">
              <div className="ptd-card">
                <div className="ptd-card-header">
                  <h2>Strengths and Skill Gaps</h2>
                  <BookOpen size={20} />
                </div>
                <div className="ptd-two-column">
                  <div className="ptd-panel">
                    <p className="ptd-panel-title">Top strengths</p>
                    {skillAnalysis.strengths.length > 0 ? skillAnalysis.strengths.map((skill) => (
                      <div key={`strength-${skill.id}`} className="ptd-skill-row">
                        <div>
                          <strong>{skill.name}</strong>
                          <p>Current level {skill.userLevel} of required {skill.requiredLevel}</p>
                        </div>
                        <span>{Math.round(skill.score)}%</span>
                      </div>
                    )) : <p className="ptd-empty">Skill-level breakdown is not available yet.</p>}
                  </div>

                  <div className="ptd-panel">
                    <p className="ptd-panel-title">Priority gaps</p>
                    {skillAnalysis.gaps.length > 0 ? skillAnalysis.gaps.map((skill) => (
                      <div key={`gap-${skill.id}`} className="ptd-skill-row">
                        <div>
                          <strong>{skill.name}</strong>
                          <p>Gap of {skill.gap} level(s) to reach target</p>
                        </div>
                        <span>{Math.round(skill.score)}%</span>
                      </div>
                    )) : <p className="ptd-empty">No major skill gaps detected.</p>}
                  </div>
                </div>
              </div>

              <div className="ptd-card">
                <div className="ptd-card-header">
                  <h2>Leaderboard Snapshot</h2>
                  <Trophy size={20} />
                </div>
                <div className="ptd-leaderboard-list">
                  {topLeaderboardPreview.length > 0 ? topLeaderboardPreview.map((entry, index) => {
                    const active =
                      String(entry.userId) === String(currentUserId) ||
                      entry.email === email ||
                      entry.fullName === fullName ||
                      entry.name === fullName;

                    return (
                      <div key={`${entry.userId}-${index}`} className={`ptd-leader-row${active ? " active" : ""}`}>
                        <div className="ptd-rank-badge">#{index + 1}</div>
                        <div className="ptd-rank-user">
                          <strong>{entry.fullName || entry.name || "Learner"}</strong>
                          <small>{entry.email || "Career readiness ranking"}</small>
                        </div>
                        {(() => {
                          const mapped = leaderboardScoresMap?.[entry.userId];
                          const raw = resolveEntryScore(entry);
                          const inferred = leaderboardTotal ? clamp(Math.round(((leaderboardTotal - index) / leaderboardTotal) * 100)) : 0;
                          const display = typeof mapped === 'number' ? mapped : (raw > 0 ? raw : inferred);
                          return <div className="ptd-rank-score">{display}%{typeof mapped !== 'number' && raw === 0 ? <small style={{marginLeft:6, opacity:0.7}}>(inferred)</small> : null}</div>;
                        })()}
                      </div>
                    );
                  }) : <p className="ptd-empty">Leaderboard data is not available yet.</p>}
                </div>
              </div>
            </section>

            <section className="ptd-main-grid">
              <div className="ptd-card">
                <div className="ptd-card-header">
                  <h2>Career Opportunities</h2>
                  <Briefcase size={20} />
                </div>
                <div className="ptd-opportunity-summary">
                  <div className="ptd-opportunity-pill">
                    <span>Completed courses</span>
                    <strong>{completedCoursesCount}</strong>
                  </div>
                  <div className="ptd-opportunity-pill">
                    <span>Completion level</span>
                    <strong>{coursesCompletedVal}%</strong>
                  </div>
                  <div className="ptd-opportunity-pill">
                    <span>Matched jobs</span>
                    <strong>{jobs.length}</strong>
                  </div>
                </div>

                <div className="ptd-job-actions">
                  <button className="ptd-job-btn primary" onClick={() => navigate("/jobs")}>
                    <Building2 size={18} />
                    Browse Jobs Portal
                  </button>
                  <button className="ptd-job-btn secondary" onClick={() => navigate("/applications")}>
                    <FileText size={18} />
                    View My Applications
                  </button>
                </div>

                <div className="ptd-job-split">
                  <div className="ptd-job-column">
                    <div className="ptd-job-column-head">
                      <h3>Unlocked Now</h3>
                      <span>{unlockedRecommendedJobs.length}</span>
                    </div>
                    <div className="ptd-job-grid">
                  {unlockedRecommendedJobs.length > 0 ? unlockedRecommendedJobs.map((job, index) => (
                    <div key={`${job.jobId ?? job.id ?? index}`} className="ptd-job-card">
                      {(() => {
                        const theme = getJobTheme(job);
                        const matchScore = normalizeScore(job.resolvedMatchScore ?? job.matchScore ?? 0);
                        const jobIdentifier = job.jobId ?? job.id;
                        const moreCount = Math.max(0, [job.category, job.jobType, job.level].filter(Boolean).length - 3);

                        return (
                          <>
                            <div className="ptd-job-hero">
                              <img
                                className="ptd-job-hero-image"
                                src={theme.image}
                                alt={`${job.category || "Programming"} cover`}
                                onError={(event) => {
                                  if (event.currentTarget.src !== theme.fallbackImage) {
                                    event.currentTarget.src = theme.fallbackImage;
                                  }
                                }}
                              />
                              <div className="ptd-job-hero-top">
                                <span className="ptd-job-hero-label">{job.category || "Programming"}</span>
                                <span className={`ptd-job-hero-badge ${matchScore >= 75 ? "strong" : "warm"}`}>
                                  {matchScore >= 75 ? "STRONG" : "OPEN"}
                                </span>
                              </div>
                            </div>

                            <div className="ptd-job-body">
                              <div className="ptd-job-top">
                                <div>
                                  <p className="ptd-job-company" title={job.company || "Company"}>{job.company || "Company"}</p>
                                  <h3 title={job.title || "Opportunity"}>{job.title || "Opportunity"}</h3>
                                </div>
                                <span className="ptd-job-match-pill">{matchScore}%</span>
                              </div>

                              <div className="ptd-job-chip-row">
                                {theme.tags.map((tag) => (
                                  <span key={`${jobIdentifier ?? index}-${tag}`} className="ptd-job-chip">{tag}</span>
                                ))}
                                {moreCount > 0 && <span className="ptd-job-chip ptd-job-chip-more">+{moreCount}</span>}
                              </div>

                              <div className="ptd-job-meta">
                                <span><MapPin size={15} /> {job.location || "Location not specified"}</span>
                                <span><Briefcase size={15} /> {job.jobType || "Role type not specified"}</span>
                              </div>

                              <div className="ptd-job-bottom">
                                <span className="ptd-job-type">{job.category || "General"}</span>
                                <span className="ptd-job-level">{job.level || "Open"}</span>
                              </div>
                            </div>

                            <div className="ptd-job-footer">
                              <div className="ptd-job-footer-copy">
                                <span>Match Score</span>
                                <strong>{matchScore}%</strong>
                              </div>
                              <button className="ptd-apply-btn" onClick={() => navigate(`/jobs/apply/${jobIdentifier}`)}>
                                Apply Job
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )) : <p className="ptd-empty">{jobRecommendationMessage}</p>}
                    </div>
                  </div>

                  <div className="ptd-job-column locked">
                    <div className="ptd-job-column-head">
                      <h3>Next To Unlock</h3>
                      <span>{nextUnlockJobs.length}</span>
                    </div>
                    <div className="ptd-job-grid single">
                      {nextUnlockJobs.length > 0 ? nextUnlockJobs.map((job, index) => (
                        <div key={`locked-${job.jobId ?? job.id ?? index}`} className="ptd-next-job-card">
                          <div className="ptd-next-job-top">
                            <div>
                              <p title={job.company || "Company"}>{job.company || "Company"}</p>
                              <h4 title={job.title || "Opportunity"}>{job.title || "Opportunity"}</h4>
                            </div>
                            <span>{job.level || "Next Level"}</span>
                          </div>
                          <div className="ptd-next-job-meta">
                            <span><MapPin size={14} /> {job.location || "Location not specified"}</span>
                            <span><Briefcase size={14} /> {job.jobType || "Role type not specified"}</span>
                          </div>
                          <p className="ptd-next-job-note">
                            Keep improving your assessment tier to surface this role in your unlocked jobs list.
                          </p>
                        </div>
                      )) : <p className="ptd-empty">No higher-tier jobs are waiting right now.</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="ptd-card">
                <div className="ptd-card-header">
                  <h2>Milestones</h2>
                  <Award size={20} />
                </div>
                <div className="ptd-achievement-list">
                  {achievements.length > 0 ? achievements.map((badge) => (
                    <div key={badge} className="ptd-achievement-item">
                      <Award size={16} />
                      <span>{badge}</span>
                    </div>
                  )) : <p className="ptd-empty">Complete more assessments and improve matches to unlock milestones.</p>}
                </div>

                <div className="ptd-profile-summary">
                  <p className="ptd-panel-title">Assessment marks</p>
                  <div className="ptd-mark-row"><span>Easy</span><strong>{assessmentBreakdown.easy}/20</strong></div>
                  <div className="ptd-mark-row"><span>Medium</span><strong>{assessmentBreakdown.medium}/40</strong></div>
                  <div className="ptd-mark-row"><span>Hard</span><strong>{assessmentBreakdown.hard}/40</strong></div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

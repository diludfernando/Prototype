import React, { useState, useCallback } from 'react';
import { Upload, FileText, Sparkles, RotateCcw, Brain, TrendingUp, CheckCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import ResourceCard from './ResourceCard';
import './Recommended.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

// ── Skill keyword dictionary ──────────────────────────────────────────────────
const SKILL_KEYWORDS = [
    'python','java','javascript','typescript','react','node','express','django',
    'spring','spring boot','hibernate','sql','mysql','postgresql','mongodb',
    'html','css','sass','flexbox','grid','rest','api','graphql','docker',
    'kubernetes','aws','azure','gcp','terraform','jenkins','git','github',
    'linux','bash','c','c++','php','ruby','machine learning','deep learning',
    'tensorflow','keras','pytorch','scikit','pandas','numpy','matplotlib',
    'seaborn','tableau','power bi','r','data analysis','data science','nlp',
    'neural network','cybersecurity','network security','ethical hacking',
    'penetration testing','kali linux','metasploit','burp suite','owasp',
    'cryptography','siem','splunk','incident response','threat hunting',
    'figma','ui','ux','wireframe','prototype','photoshop','illustrator',
    'devops','ci/cd','agile','scrum','microservices','cloud','serverless',
    'redis','kafka','oauth','jwt','authentication','computer vision',
];

// Skills that suggest "next step" learning (gap skills per category)
const NEXT_SKILLS = {
    Programming:      ['typescript','docker','kubernetes','graphql','microservices','testing','ci/cd'],
    'Data Science':   ['deep learning','nlp','computer vision','tensorflow','pytorch','tableau'],
    Cybersecurity:    ['penetration testing','metasploit','burp suite','siem','splunk','threat hunting'],
    'Cloud Computing':['kubernetes','terraform','serverless','devops','ci/cd','azure','gcp'],
    Design:           ['figma','prototype','ux','user research','design system','accessibility'],
};

const CATEGORIES = ['Programming','Data Science','Cybersecurity','Cloud Computing','Design'];

function extractSkills(text) {
    const lower = text.toLowerCase();
    return [...new Set(SKILL_KEYWORDS.filter(skill => {
        // Use word boundary regex so "java" doesn't match inside "javascript"
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
        return regex.test(lower);
    }))];
}

function skillMatch(text, skill) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i').test(text);
}

function getMatchedSkills(course, skills) {
    const covered = (course.skillsCovered || '').toLowerCase();
    return skills.filter(s => skillMatch(covered, s));
}

function getNextSkillMatches(course, userSkills, interests) {
    const covered = (course.skillsCovered || '').toLowerCase();
    const gaps = [];
    const cats = interests.length > 0 ? interests : CATEGORIES;
    cats.forEach(cat => {
        (NEXT_SKILLS[cat] || []).forEach(s => {
            if (skillMatch(covered, s) && !userSkills.includes(s)) gaps.push(s);
        });
    });
    return [...new Set(gaps)];
}

function scoreCourse(course, skills, interests, mode) {
    const covered = (course.skillsCovered || '').toLowerCase();
    let score = 0;
    if (mode === 'skills') {
        skills.forEach(s => { if (skillMatch(covered, s)) score += 2; });
        if (interests.includes(course.category)) score += 3;
    } else {
        const nextMatches = getNextSkillMatches(course, skills, interests);
        score = nextMatches.length * 3;
        if (interests.includes(course.category)) score += 2;
    }
    return score;
}

// ─────────────────────────────────────────────────────────────────────────────
const Recommended = ({ allCourses }) => {
    const [dragOver, setDragOver]           = useState(false);
    const [fileName, setFileName]           = useState('');
    const [rawText, setRawText]             = useState('');
    const [extractedSkills, setExtractedSkills] = useState([]);
    const [interests, setInterests]         = useState([]);
    const [recommended, setRecommended]     = useState([]);
    const [mode, setMode]                   = useState('skills'); // 'skills' | 'next'
    const [parsing, setParsing]             = useState(false);
    const [parseError, setParseError]       = useState('');
    const [analysed, setAnalysed]           = useState(false);

    const parsePDF = async (file) => {
        setParsing(true); setParseError('');
        try {
            const buf = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + '\n';
            }
            applyText(text, file.name);
        } catch {
            setParseError('Could not read PDF. Try pasting your skills below.');
        } finally { setParsing(false); }
    };

    const applyText = (text, name = '') => {
<<<<<<< HEAD
        const trimmed = text.trim();
        if (name && trimmed.length < 20) {
            setParseError('Could not extract enough text from this file. Try pasting your skills below.');
            setParsing(false);
            return;
        }
        const skills = extractSkills(trimmed);
        if (name) setFileName(name);
=======
        const skills = extractSkills(text);
        if (name) setFileName(name); // only set filename for actual file uploads
>>>>>>> 7c6a26328449520cc6c2dec12723b27a760eebec
        setExtractedSkills(skills);
        setRawText(text);
    };

    const handleFile = (file) => {
        if (!file) return;
<<<<<<< HEAD

        // Validate MIME type
        const allowed = ['application/pdf', 'text/plain'];
        if (!allowed.includes(file.type)) {
            setParseError('Only PDF or TXT files are supported.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setParseError('File is too large. Maximum size is 5MB.');
            return;
        }

        setParseError('');
=======
>>>>>>> 7c6a26328449520cc6c2dec12723b27a760eebec
        if (file.type === 'application/pdf') { parsePDF(file); return; }
        const reader = new FileReader();
        reader.onload = e => applyText(e.target.result, file.name);
        reader.readAsText(file);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault(); setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    }, []);

    const analyse = (currentMode = mode) => {
        const scored = allCourses
            .map(c => ({ ...c, _score: scoreCourse(c, extractedSkills, interests, currentMode) }))
            .filter(c => c._score > 0)
            .sort((a, b) => b._score - a._score);
        setRecommended(scored);
        setAnalysed(true);
    };

    const switchMode = (m) => {
        setMode(m);
        if (analysed) analyse(m);
    };

    const reset = () => {
        setFileName(''); setRawText(''); setExtractedSkills([]);
        setInterests([]); setRecommended([]); setAnalysed(false);
        setParseError(''); setMode('skills');
    };

    const toggleInterest = (cat) =>
        setInterests(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

<<<<<<< HEAD
    const canAnalyse = extractedSkills.length > 0 || interests.length > 0 || rawText.trim().length >= 3;
=======
    const canAnalyse = extractedSkills.length > 0 || interests.length > 0 || rawText.trim().length > 0;
>>>>>>> 7c6a26328449520cc6c2dec12723b27a760eebec

    return (
        <div className="rec-page">
            {/* ── Header ── */}
            <header className="resources-header">
                <h1 className="resources-title">
                    Course <span className="resources-title-accent">Recommendations</span>
                </h1>
                <p className="resources-subtitle">
                    Upload your CV or skill report — we'll match courses to your profile and highlight what to learn next.
                </p>
            </header>

            {/* ── Main card ── */}
            <div className="rec-main-card">

                {/* Left: upload panel */}
                <div className="rec-left">
                    {/* Drop zone */}
                    <div
                        className={`rec-dropzone ${dragOver ? 'drag-over' : ''} ${fileName ? 'has-file' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => !fileName && document.getElementById('rec-file-input').click()}
                    >
                        {parsing ? (
                            <div className="rec-parsing">
                                <div className="rec-spinner" />
                                <p>Reading your document...</p>
                            </div>
                        ) : fileName ? (
                            <div className="rec-file-success">
                                <CheckCircle size={22} color="#10B981" />
                                <div>
                                    <p className="rec-file-name">{fileName}</p>
                                    <p className="rec-file-sub">{extractedSkills.length} skills detected</p>
                                </div>
                                <button className="rec-remove-file" onClick={e => { e.stopPropagation(); reset(); }}>✕</button>
                            </div>
                        ) : (
                            <>
                                <div className="rec-drop-icon"><Upload size={24} /></div>
                                <p className="rec-drop-title">Drop your CV / skill report</p>
<<<<<<< HEAD
                                <p className="rec-drop-sub">PDF or TXT · max 5MB · click to browse</p>
=======
                                <p className="rec-drop-sub">PDF or TXT · click to browse</p>
>>>>>>> 7c6a26328449520cc6c2dec12723b27a760eebec
                            </>
                        )}
                        <input id="rec-file-input" type="file" accept=".pdf,.txt"
                            style={{ display: 'none' }}
                            onChange={e => handleFile(e.target.files[0])} />
                    </div>

                    {parseError && <p className="rec-error">{parseError}</p>}

                    <div className="rec-divider"><span>or paste skills / CV text</span></div>

                    <div className="rec-textarea-wrap">
                        <FileText size={15} className="rec-textarea-icon" />
                        <textarea
                            className="rec-textarea"
                            placeholder="e.g. Java, React, Machine Learning, SQL, Docker..."
                            value={rawText}
                            onChange={e => { setRawText(e.target.value); applyText(e.target.value); }}
                            rows={4}
                        />
                    </div>

                    {/* Interest categories */}
                    <div className="rec-section-label" style={{ marginTop: 4 }}>
                        <Sparkles size={13} /> Areas you want to grow in
                    </div>
                    <div className="rec-category-grid">
                        {CATEGORIES.map(cat => (
                            <button key={cat}
                                className={`rec-cat-btn ${interests.includes(cat) ? 'selected' : ''}`}
                                onClick={() => toggleInterest(cat)}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    <button className="rec-btn-primary" disabled={!canAnalyse} onClick={() => analyse()}>
                        <Sparkles size={15} /> Analyse &amp; Recommend
                    </button>
                </div>

                {/* Right: helper / results */}
                <div className="rec-right">
                    {!analysed ? (
                        <div className="rec-hint-panel">
                            <div className="rec-hint-icon"><Brain size={28} /></div>
                            <h3>How it works</h3>
                            <ol className="rec-hint-steps">
                                <li><span>1</span> Upload your CV or paste your skills</li>
                                <li><span>2</span> Pick areas you want to grow in</li>
                                <li><span>3</span> Get matched courses with reasons</li>
                            </ol>
                            <div className="rec-hint-example">
                                <p className="rec-hint-example-label">Example skills detected:</p>
                                <div className="rec-skill-pills">
                                    {['Java','Spring Boot','SQL','REST APIs','Git'].map(s => (
                                        <span key={s} className="rec-skill-pill">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rec-detected-panel">
                            <div className="rec-detected-header">
                                <div className="rec-section-label"><CheckCircle size={13} color="#10B981" /> Detected skills</div>
                                <button className="rec-btn-ghost" onClick={reset}><RotateCcw size={12} /> Reset</button>
                            </div>
                            {extractedSkills.length > 0 ? (
                                <div className="rec-skill-pills">
                                    {extractedSkills.map(s => (
                                        <span key={s} className="rec-skill-pill">{s}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="rec-no-skills">No specific skills detected — using your interest areas.</p>
                            )}
                            <div className="rec-mode-toggle">
                                <button className={`rec-mode-btn ${mode === 'skills' ? 'active' : ''}`} onClick={() => switchMode('skills')}>
                                    <CheckCircle size={13} /> Based on my skills
                                </button>
                                <button className={`rec-mode-btn ${mode === 'next' ? 'active' : ''}`} onClick={() => switchMode('next')}>
                                    <TrendingUp size={13} /> Suggested next skills
                                </button>
                            </div>
                            <p className="rec-mode-desc">
                                {mode === 'skills'
                                    ? 'Showing courses that match skills you already have.'
                                    : 'Showing courses that teach skills you should learn next.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Results ── */}
            {analysed && (
                <div className="rec-results">
                    <div className="rec-results-header">
                        <h2 className="rec-results-title">
                            {recommended.length > 0
                                ? <>{recommended.length} courses matched your profile</>
                                : 'No matches found'}
                        </h2>
                        <p className="rec-results-sub">
                            {mode === 'skills'
                                ? 'Based on your uploaded skill report'
                                : 'Skills you should learn next based on your profile'}
                        </p>
                    </div>

                    {recommended.length > 0 ? (
                        <div className="rec-courses-list">
                            {recommended.map(course => {
                                const matched = mode === 'skills'
                                    ? getMatchedSkills(course, extractedSkills)
                                    : getNextSkillMatches(course, extractedSkills, interests);
                                return (
                                    <div key={course.id} className="rec-course-row">
                                        <ResourceCard resource={course} />
                                        {matched.length > 0 && (
                                            <div className="rec-why">
                                                <span className="rec-why-label">
                                                    {mode === 'skills' ? '✓ Matches your skills:' : '→ You\'ll learn:'}
                                                </span>
                                                <div className="rec-skill-pills">
                                                    {matched.slice(0, 5).map(s => (
                                                        <span key={s} className={`rec-skill-pill ${mode === 'next' ? 'rec-pill-next' : ''}`}>{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon-wrapper"><Sparkles size={40} strokeWidth={1} /></div>
                            <h2 className="empty-title">No matches found</h2>
                            <p className="empty-description">Try selecting more interest areas or paste a more detailed skill list</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Recommended;

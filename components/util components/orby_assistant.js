import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Ash — Ashin Shanly's Interactive Voice Assistant
 * Inspired by valentinhervouet.com:
 * - Interactive 60fps Canvas Orb with cursor-tracking blinking eyes, voice-reactive liquid caustics, and poke physics
 * - Left & Right flanking frosted choice pills with "✓" heard tracking
 * - Live synchronized typewriter subtitle (click or Space to skip)
 * - Web Speech API voice synthesis + Web Speech Recognition ("Ask with your voice")
 * - Timed Story Cards triggered by [[card:...]] cues in the dialogue script
 */

const ORBY_DIALOGUE_GRAPH = {
    greet: {
        id: 'greet',
        text: "Hey there, and welcome to Ashin's portfolio! I'm Ash, his personal AI voice guide. Want the quick 30-second intro, or the full story?",
        choices: [
            { id: 'quick', label: 'Quick · 30s', to: 'intro_quick' },
            { id: 'full', label: 'Full story · 2 min', to: 'intro_full' },
            { id: 'projects', label: 'Projects & Apps', to: 'projects_ask' },
            { id: 'experience', label: 'Experience', to: 'roles_ask' },
        ],
    },
    intro_quick: {
        id: 'intro_quick',
        text: "Here's Ashin in thirty seconds. [[card:google]]He's a Software Engineer III at Google, building planetary-scale data and fleet intelligence systems. He holds a Master's in Computer Science from [[card:iitgn]]IIT Gandhinagar, where he won the Director's Silver Medal with a 9.0 CGPA. Before Google, he engineered petabyte-scale PySpark pipelines and enterprise GenAI RAG systems at [[card:oracle]]Oracle, and researched 3D LiDAR computer vision at TCS Research. What would you like to explore next?",
        choices: 'menu',
        tracksHeard: true,
    },
    intro_full: {
        id: 'intro_full',
        text: "Let's take it from the start! Ashin graduated on the Dean's List from GEC Thrissur with a 9.11 CGPA, then earned his Master's in Computer Science at [[card:iitgn]]IIT Gandhinagar, graduating with the prestigious Director's Silver Medal for Academic Excellence. Along the way, he published peer-reviewed deep learning research at ACM CODS-COMAD on Siamese Graph Convolutional Networks and Neural Reverse Dictionaries. He began his industry career at [[card:tcs]]TCS Research working on airborne LiDAR tree segmentation, then joined [[card:oracle]]Oracle as a Member of Technical Staff, where he architected petabyte-scale PySpark & Delta Lake pipelines and built an enterprise GenAI RAG assistant that automated 60% of support queries. Today, he's a [[card:google]]Software Engineer III at Google, helping Alphabet run the most efficient and elastic compute fleet in the industry. What part of his journey should we dive into?",
        choices: 'menu',
        tracksHeard: true,
    },
    menu_return: {
        id: 'menu_return',
        text: 'What else would you like to know about Ashin?',
        choices: 'menu',
    },
    roles_ask: {
        id: 'roles_ask',
        text: 'Where should we start — his current work at Google, his cloud & AI systems at Oracle, his research at TCS, or his degree at IIT Gandhinagar?',
        choices: 'roles',
    },
    roles_again: {
        id: 'roles_again',
        text: 'Which chapter of his career or education would you like to hear next?',
        choices: 'roles',
    },
    role_google: {
        id: 'role_google',
        text: "[[card:google]]Ashin joined Google in August 2025 as a Software Engineer III. He works on high-scale distributed data platforms that enable Alphabet to run the most efficient and elastic compute fleet in the industry, turning massive telemetry streams into trusted, actionable engineering insights. Want to hear about another role?",
        choices: 'after_role',
        tracksHeard: true,
    },
    role_oracle: {
        id: 'role_oracle',
        text: "[[card:oracle]]From 2022 to 2025 at Oracle, Ashin architected petabyte-scale PySpark ETL pipelines on Oracle Cloud Infrastructure and led a 5-engineer migration to Delta Lake that boosted query speeds by 40%. He also built an enterprise Generative AI RAG chatbot with vector search that automated 60% of manual queries and improved resolution accuracy by 30%. Want to hear about another role?",
        choices: 'after_role',
        tracksHeard: true,
    },
    role_tcs: {
        id: 'role_tcs',
        text: "[[card:tcs]]At TCS Research and Innovation Labs, Ashin was a Machine Vision Research Scientist Intern. He combined airborne LiDAR 3D point clouds with hyperspectral imagery using a hybrid machine learning and signal processing framework, boosting forestry tree-segmentation accuracy by 18%. Want to hear about another role?",
        choices: 'after_role',
        tracksHeard: true,
    },
    role_iitgn: {
        id: 'role_iitgn',
        text: "[[card:iitgn]]Ashin completed his M.Tech in Computer Science at IIT Gandhinagar from 2020 to 2022, graduating with a 9.00 CGPA and receiving the Director's Silver Medal for Academic Excellence. His thesis accelerated Implicit Neural Representations by over 21% using split encoders and multiscale partitioning. Want to hear about another role?",
        choices: 'after_role',
        tracksHeard: true,
    },
    projects_ask: {
        id: 'projects_ask',
        text: 'Ashin builds everything from published deep learning models to interactive web apps and games. Which project catches your eye?',
        choices: 'projects',
    },
    projects_again: {
        id: 'projects_again',
        text: 'Sure thing! Which project or research paper should we check out next?',
        choices: 'projects',
    },
    project_inr: {
        id: 'project_inr',
        text: "[[card:inr]]In his research on Accelerated Implicit Neural Representations, Ashin designed an input-split neural architecture with multiscale spatial partitioning. Tested on complex Stanford 3D scenes and ultra-high-resolution images, it sped up neural scene training by 21.23% without losing reconstruction quality. Want to explore another project?",
        choices: 'after_project',
        projectUrl: 'https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en',
        tracksHeard: true,
    },
    project_sgcn: {
        id: 'project_sgcn',
        text: "[[card:sgcn]]Published at ACM CODS-COMAD, Ashin's Image Caption Generator pairs Siamese Graph Convolutional Networks with a non-parametric Kernel Activation Function and an attention LSTM. It captures deep spatial-semantic relationships across objects and stays robust even under heavy class imbalance. Want to explore another project?",
        choices: 'after_project',
        projectUrl: 'https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en',
        tracksHeard: true,
    },
    project_lumina: {
        id: 'project_lumina',
        text: "[[card:lumina]]Lumina is an interactive cosmic sequence-memory game right here in this portfolio! It features a 60fps parallax starfield, spatial Web Audio harmonic chimes, progressive glassmorphic node grids, and a live global Firebase leaderboard. You can launch it right now or check out another project!",
        choices: 'after_project',
        projectUrl: 'https://ashinshanly.github.io/lumina/',
        tracksHeard: true,
    },
    project_musicsync: {
        id: 'project_musicsync',
        text: "[[card:musicsync]]MusicSync lets multiple devices play audio in millisecond-accurate harmony over the web, turning phones and laptops into a synchronized spatial soundstage. You can open it directly or explore another project!",
        choices: 'after_project',
        projectUrl: 'https://ashinshanly.github.io/musicsync/',
        tracksHeard: true,
    },
    project_guestbook: {
        id: 'project_guestbook',
        text: "[[card:guestbook]]The Collaborative Neon GuestBook is a real-time 64 by 64 cyber-matrix canvas powered by Firebase and a pentatonic Web Audio synthesizer. Every pixel you paint plays a spatial musical note and syncs live to every visitor on the site!",
        choices: 'after_project',
        appId: 'pixel-hud',
        tracksHeard: true,
    },
    hobbies: {
        id: 'hobbies',
        text: "[[card:hobbies]]When Ashin isn't architecting distributed systems or training neural networks, you'll find him smashing shuttlecocks on the badminton court, watching anime like Demon Slayer, or analyzing market charts for swing trades. What else would you like to explore?",
        choices: 'menu',
        tracksHeard: true,
    },
    resume: {
        id: 'resume',
        text: "Here's Ashin's resume summary! You can download the full PDF directly, or open his full interactive profile window.",
        choices: [
            { id: 'download_pdf', label: 'Download Resume PDF ↗', link: './files/AshinShanly_RESUME.pdf' },
            { id: 'open_about', label: 'Open About Ashin App', appId: 'about-ashin' },
            { id: 'something_else', label: '↩ Something else', to: 'menu_return' },
        ],
        tracksHeard: true,
    },
    contact: {
        id: 'contact',
        text: "Want to get in touch with Ashin? You can open his Contact Me app right here, connect on LinkedIn, or email him directly at ashinkoottala@gmail.com.",
        choices: [
            { id: 'open_gedit', label: 'Open Contact Me App', appId: 'gedit' },
            { id: 'linkedin', label: 'LinkedIn ↗', link: 'https://www.linkedin.com/in/ashinshanly/' },
            { id: 'email', label: 'Email Ashin ↗', link: 'mailto:ashinkoottala@gmail.com' },
            { id: 'something_else', label: '↩ Something else', to: 'menu_return' },
        ],
        tracksHeard: true,
    },
};

const CHOICE_SETS = {
    menu: [
        { id: 'projects', label: 'Projects & Research', to: 'projects_ask' },
        { id: 'experience', label: 'Work & Education', to: 'roles_ask' },
        { id: 'hobbies', label: 'Hobbies & Interests', to: 'hobbies' },
        { id: 'resume', label: 'Resume / CV', to: 'resume' },
        { id: 'contact', label: 'Contact Ashin', to: 'contact' },
    ],
    roles: [
        { id: 'google', label: 'Google · SWE III', to: 'role_google' },
        { id: 'oracle', label: 'Oracle · MTS', to: 'role_oracle' },
        { id: 'tcs', label: 'TCS Research · CV', to: 'role_tcs' },
        { id: 'iitgn', label: 'IIT Gandhinagar · M.Tech', to: 'role_iitgn' },
        { id: 'back_roles', label: '↩ Back', to: 'menu_return' },
    ],
    after_role: [
        { id: 'another_role', label: '↩ Another role', to: 'roles_again' },
        { id: 'projects', label: 'Explore Projects', to: 'projects_ask' },
        { id: 'something_else', label: '↩ Main topics', to: 'menu_return' },
    ],
    projects: [
        { id: 'inr', label: 'Implicit Neural Rep (3D)', to: 'project_inr' },
        { id: 'sgcn', label: 'Siamese-GCN Captions', to: 'project_sgcn' },
        { id: 'lumina', label: 'Lumina Cosmic Game', to: 'project_lumina' },
        { id: 'musicsync', label: 'MusicSync Audio', to: 'project_musicsync' },
        { id: 'guestbook', label: '64×64 Neon GuestBook', to: 'project_guestbook' },
        { id: 'back_projects', label: '↩ Back', to: 'menu_return' },
    ],
    after_project: [
        { id: 'another_project', label: '↩ Another project', to: 'projects_again' },
        { id: 'visit_project', label: 'Open / Launch ↗', action: 'visit' },
        { id: 'something_else', label: '↩ Main topics', to: 'menu_return' },
    ],
};

const STORY_CARDS = {
    google: {
        badge: 'Current Role • Aug 2025 – Present',
        title: 'Software Engineer III @ Google',
        subtitle: 'Elastic Fleet & Planetary-Scale Data Intelligence',
        metric: 'Alphabet Compute Fleet',
        accent: 'from-blue-500/30 via-cyan-500/20 to-emerald-500/20',
        border: 'border-cyan-400/40',
        icon: '🔵',
    },
    oracle: {
        badge: 'Aug 2022 – Aug 2025 • 3 Years',
        title: 'Member of Technical Staff @ Oracle',
        subtitle: 'Petabyte PySpark ETL, Delta Lake & Enterprise GenAI RAG',
        metric: '60% Query Automation • +40% Perf',
        accent: 'from-red-500/30 via-orange-500/20 to-amber-500/20',
        border: 'border-orange-400/40',
        icon: '🔴',
    },
    tcs: {
        badge: 'Research Internship • 2021',
        title: 'Machine Vision Scientist @ TCS Research',
        subtitle: 'Airborne LiDAR Point Clouds & Hyperspectral Fusion',
        metric: '+18% Segmentation Accuracy',
        accent: 'from-sky-500/30 via-blue-500/20 to-indigo-500/20',
        border: 'border-sky-400/40',
        icon: '🔷',
    },
    iitgn: {
        badge: 'M.Tech CSE • 2020 – 2022',
        title: 'IIT Gandhinagar',
        subtitle: "Director's Silver Medal for Academic Excellence",
        metric: 'CGPA 9.00 / 10.0',
        accent: 'from-amber-500/30 via-yellow-500/20 to-orange-500/20',
        border: 'border-amber-400/40',
        icon: '🏆',
    },
    inr: {
        badge: 'Deep Learning & 3D Vision Research',
        title: 'Accelerated Implicit Neural Representation',
        subtitle: 'Split Encoder & Multiscale Spatial Partitioning on 3D Scenes',
        metric: '+21.23% Faster Training',
        accent: 'from-purple-500/30 via-fuchsia-500/20 to-cyan-500/20',
        border: 'border-purple-400/40',
        icon: '🧠',
    },
    sgcn: {
        badge: 'Published @ ACM CODS-COMAD',
        title: 'Siamese-GCN Image Caption Generator',
        subtitle: 'Graph Convolutional Networks + Kernel Activation & Attention LSTM',
        metric: 'ACM Peer-Reviewed Publication',
        accent: 'from-emerald-500/30 via-teal-500/20 to-cyan-500/20',
        border: 'border-emerald-400/40',
        icon: '📄',
    },
    lumina: {
        badge: 'Interactive Web Game • Live',
        title: 'Lumina: Cosmic Sequence Memory',
        subtitle: '60fps Starfield, Web Audio Harmonics & Global Leaderboard',
        metric: 'Play Live @ /lumina',
        accent: 'from-cyan-500/30 via-blue-500/20 to-indigo-500/20',
        border: 'border-cyan-400/40',
        icon: '✨',
    },
    musicsync: {
        badge: 'Real-Time Web Audio • Live',
        title: 'MusicSync Multi-Device Audio',
        subtitle: 'Millisecond-Accurate Distributed Audio Playback',
        metric: 'Play Live @ /musicsync',
        accent: 'from-pink-500/30 via-rose-500/20 to-purple-500/20',
        border: 'border-pink-400/40',
        icon: '🎵',
    },
    guestbook: {
        badge: 'Collaborative 64×64 Matrix • Firebase RTDB',
        title: 'PixelHUD Neon GuestBook',
        subtitle: 'Real-Time Multi-User Canvas + Pentatonic C-Minor Synth',
        metric: '4,096 Live Interactive Cells',
        accent: 'from-cyan-500/30 via-fuchsia-500/20 to-emerald-500/20',
        border: 'border-cyan-400/40',
        icon: '🎨',
    },
    hobbies: {
        badge: 'Beyond Engineering',
        title: 'Badminton, Anime & Swing Trading',
        subtitle: 'High-tempo court rallies, Demon Slayer & market technicals',
        metric: 'Always Exploring',
        accent: 'from-violet-500/30 via-indigo-500/20 to-cyan-500/20',
        border: 'border-violet-400/40',
        icon: '🏸',
    },
};

function parseDialogueText(raw) {
    const cues = [];
    let clean = '';
    const regex = /\[\[card:([a-z0-9_]+)\]\]/gi;
    let lastIdx = 0;
    let match;
    while ((match = regex.exec(raw)) !== null) {
        clean += raw.slice(lastIdx, match.index);
        cues.push({ cardId: match[1], charIndex: clean.length });
        lastIdx = regex.lastIndex;
    }
    clean += raw.slice(lastIdx);
    return { text: clean, cues };
}

export default function OrbyAssistant({ isOpen, onClose, onOpenApp }) {
    const [nodeId, setNodeId] = useState('greet');
    const [phase, setPhase] = useState('speaking'); // 'speaking' | 'choosing'
    const [typedCount, setTypedCount] = useState(0);
    const [soundOn, setSoundOn] = useState(true);
    const [heardNodes, setHeardNodes] = useState([]);
    const [activeCard, setActiveCard] = useState(null);
    const [isListeningMic, setIsListeningMic] = useState(false);
    const [micTranscript, setMicTranscript] = useState('');
    const [textPrompt, setTextPrompt] = useState('');

    const canvasRef = useRef(null);
    const pointerRef = useRef({ x: 0, y: 0, active: false });
    const lookTargetRef = useRef(null);
    const voiceLevelRef = useRef(0);
    const pokeRef = useRef({ t: 100, x: 0, y: 0 });
    const blinkRef = useRef({ nextBlink: 2.5, blinkEnd: 0 });
    const animFrameRef = useRef(null);
    const typeTimerRef = useRef(null);
    const recognitionRef = useRef(null);

    const currentNode = ORBY_DIALOGUE_GRAPH[nodeId] || ORBY_DIALOGUE_GRAPH.greet;
    const parsed = parseDialogueText(currentNode.text);

    const resolveChoices = useCallback((node) => {
        if (!node) return [];
        const rawChoices = Array.isArray(node.choices)
            ? node.choices
            : CHOICE_SETS[node.choices] || CHOICE_SETS.menu;
        return rawChoices.filter((c) => {
            if (c.action === 'visit' && !node.projectUrl && !node.appId) return false;
            return true;
        });
    }, []);

    const speakText = useCallback(
        (cleanText) => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            try {
                window.speechSynthesis.cancel();
                if (!soundOn) return;
                const utterance = new SpeechSynthesisUtterance(cleanText);
                utterance.rate = 1.04;
                utterance.pitch = 1.05;
                const voices = window.speechSynthesis.getVoices();
                const preferred =
                    voices.find(
                        (v) =>
                            /en/i.test(v.lang) &&
                            /(Samantha|Google US English|Natural|Daniel|Karen|Moira|Alex)/i.test(v.name)
                    ) || voices.find((v) => /en/i.test(v.lang));
                if (preferred) utterance.voice = preferred;
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                // Ignore speech synthesis errors on restricted browsers
            }
        },
        [soundOn]
    );

    // Start typing + speaking whenever nodeId changes while open
    useEffect(() => {
        if (!isOpen) {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            return;
        }

        const { text, cues } = parseDialogueText(currentNode.text);
        setPhase('speaking');
        setTypedCount(0);

        if (cues.length > 0 && cues[0].charIndex === 0) {
            setActiveCard(STORY_CARDS[cues[0].cardId] || null);
        } else if (cues.length === 0) {
            setActiveCard(null);
        }

        if (currentNode.tracksHeard) {
            setHeardNodes((prev) => (prev.includes(nodeId) ? prev : [...prev, nodeId]));
        }

        speakText(text);

        let idx = 0;
        if (typeTimerRef.current) clearInterval(typeTimerRef.current);

        typeTimerRef.current = setInterval(() => {
            idx += 1;
            setTypedCount(idx);

            for (const cue of cues) {
                if (idx >= cue.charIndex && STORY_CARDS[cue.cardId]) {
                    setActiveCard(STORY_CARDS[cue.cardId]);
                }
            }

            // Simulate natural syllable envelope for the 3D/Canvas Orb
            const ch = text[idx - 1] || ' ';
            if (/[aeiouyAEIOUY]/.test(ch)) {
                voiceLevelRef.current = 0.85;
            } else if (/[a-zA-Z0-9]/.test(ch)) {
                voiceLevelRef.current = 0.45;
            } else {
                voiceLevelRef.current = 0.1;
            }

            if (idx >= text.length) {
                clearInterval(typeTimerRef.current);
                typeTimerRef.current = null;
                voiceLevelRef.current = 0;
                setPhase('choosing');
            }
        }, 32);

        return () => {
            if (typeTimerRef.current) {
                clearInterval(typeTimerRef.current);
                typeTimerRef.current = null;
            }
        };
    }, [nodeId, isOpen, currentNode.text, currentNode.tracksHeard, speakText]);

    const skipTyping = () => {
        if (phase !== 'speaking') return;
        if (typeTimerRef.current) {
            clearInterval(typeTimerRef.current);
            typeTimerRef.current = null;
        }
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        const { text, cues } = parseDialogueText(currentNode.text);
        if (cues.length > 0) {
            const lastCue = cues[cues.length - 1];
            if (STORY_CARDS[lastCue.cardId]) setActiveCard(STORY_CARDS[lastCue.cardId]);
        }
        voiceLevelRef.current = 0;
        setTypedCount(text.length);
        setPhase('choosing');
    };

    const triggerPoke = (clientX, clientY) => {
        pokeRef.current = { t: 0, x: clientX || 0, y: clientY || 0 };
    };

    const handleChoice = (choice, e) => {
        if (e) {
            triggerPoke(e.clientX, e.clientY);
        }
        if (choice.link) {
            window.open(choice.link, '_blank', 'noopener,noreferrer');
            return;
        }
        if (choice.appId && onOpenApp) {
            onOpenApp(choice.appId);
            onClose();
            return;
        }
        if (choice.action === 'visit') {
            if (currentNode.appId && onOpenApp) {
                onOpenApp(currentNode.appId);
                onClose();
            } else if (currentNode.projectUrl) {
                window.open(currentNode.projectUrl, '_blank', 'noopener,noreferrer');
            }
            return;
        }
        if (choice.to && ORBY_DIALOGUE_GRAPH[choice.to]) {
            setNodeId(choice.to);
        }
    };

    const routeNaturalLanguageQuery = useCallback(
        (rawQuery) => {
            const q = (rawQuery || '').toLowerCase().trim();
            if (!q) return;
            if (q.includes('google') || q.includes('current') || q.includes('alphabet')) {
                setNodeId('role_google');
            } else if (q.includes('oracle') || q.includes('spark') || q.includes('rag') || q.includes('delta')) {
                setNodeId('role_oracle');
            } else if (q.includes('tcs') || q.includes('lidar') || q.includes('intern')) {
                setNodeId('role_tcs');
            } else if (q.includes('iit') || q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('study') || q.includes('medal')) {
                setNodeId('role_iitgn');
            } else if (q.includes('lumina') || q.includes('game')) {
                setNodeId('project_lumina');
            } else if (q.includes('music') || q.includes('sync')) {
                setNodeId('project_musicsync');
            } else if (q.includes('guestbook') || q.includes('pixel') || q.includes('matrix')) {
                setNodeId('project_guestbook');
            } else if (q.includes('caption') || q.includes('siamese') || q.includes('gcn') || q.includes('paper') || q.includes('publication')) {
                setNodeId('project_sgcn');
            } else if (q.includes('neural') || q.includes('inr') || q.includes('3d') || q.includes('thesis')) {
                setNodeId('project_inr');
            } else if (q.includes('project') || q.includes('built') || q.includes('build')) {
                setNodeId('projects_ask');
            } else if (q.includes('work') || q.includes('experience') || q.includes('job') || q.includes('career')) {
                setNodeId('roles_ask');
            } else if (q.includes('hobby') || q.includes('hobbies') || q.includes('badminton') || q.includes('anime') || q.includes('free time')) {
                setNodeId('hobbies');
            } else if (q.includes('resume') || q.includes('cv')) {
                setNodeId('resume');
            } else if (q.includes('contact') || q.includes('email') || q.includes('hire') || q.includes('reach')) {
                setNodeId('contact');
            } else if (q.includes('terminal') && onOpenApp) {
                onOpenApp('terminal');
                onClose();
            } else if (q.includes('full') || q.includes('story') || q.includes('who is')) {
                setNodeId('intro_full');
            } else {
                setNodeId('intro_quick');
            }
        },
        [onOpenApp, onClose]
    );

    const toggleMic = () => {
        if (typeof window === 'undefined') return;
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            setMicTranscript('Voice recognition is not supported in this browser — type a question below!');
            return;
        }
        if (isListeningMic && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListeningMic(false);
            return;
        }
        try {
            const rec = new SpeechRec();
            rec.lang = 'en-US';
            rec.interimResults = false;
            rec.maxAlternatives = 1;
            recognitionRef.current = rec;
            setIsListeningMic(true);
            setMicTranscript('Listening… ask anything about Ashin!');

            rec.onresult = (event) => {
                const spoken = event.results?.[0]?.[0]?.transcript || '';
                setMicTranscript(`"${spoken}"`);
                setIsListeningMic(false);
                routeNaturalLanguageQuery(spoken);
            };
            rec.onerror = () => {
                setIsListeningMic(false);
                setMicTranscript('Could not hear clearly — try again or click a topic pill!');
            };
            rec.onend = () => {
                setIsListeningMic(false);
            };
            rec.start();
        } catch (err) {
            setIsListeningMic(false);
        }
    };

    // Keyboard shortcuts (1-6 for choices, Space to skip, Esc to close)
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
            if (e.key === 'Escape') {
                onClose();
            } else if (e.code === 'Space' && phase === 'speaking') {
                e.preventDefault();
                skipTyping();
            } else if (phase === 'choosing' && /^[1-6]$/.test(e.key)) {
                const idx = parseInt(e.key, 10) - 1;
                const choices = resolveChoices(currentNode);
                if (choices[idx]) {
                    handleChoice(choices[idx]);
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, phase, currentNode, resolveChoices]);

    // 60fps Interactive Liquid-Glass Orb & Blinking Eyes Renderer
    useEffect(() => {
        if (!isOpen || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const startTime = performance.now();
        let smoothedVoice = 0;
        let lookX = 0;
        let lookY = 0;

        const renderFrame = (now) => {
            const t = (now - startTime) / 1000;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
                canvas.width = Math.max(1, Math.floor(rect.width * dpr));
                canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            }

            ctx.save();
            ctx.scale(dpr, dpr);
            const W = rect.width;
            const H = rect.height;
            ctx.clearRect(0, 0, W, H);

            // Smooth voice level
            const targetVoice = phase === 'speaking' ? voiceLevelRef.current : 0;
            smoothedVoice += (targetVoice - smoothedVoice) * 0.18;
            if (phase === 'speaking' && voiceLevelRef.current > 0.1) {
                voiceLevelRef.current *= 0.92;
            }

            // Poke spring decay
            pokeRef.current.t += 0.016;
            const pokeEnvelope =
                pokeRef.current.t < 0.65
                    ? Math.sin(pokeRef.current.t * 22) * Math.exp(-pokeRef.current.t * 6) * 8
                    : 0;

            const cx = W / 2;
            const floatY = Math.sin(t * 1.6) * 6;
            const cy = H / 2 + floatY;
            const baseR = Math.min(W, H) * 0.34;
            const R = baseR * (1 + smoothedVoice * 0.09) + pokeEnvelope;

            // Outer ambient voice aura
            const auraGrad = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.45);
            auraGrad.addColorStop(0, `rgba(34, 211, 238, ${0.28 + smoothedVoice * 0.35})`);
            auraGrad.addColorStop(0.55, `rgba(168, 85, 247, ${0.14 + smoothedVoice * 0.2})`);
            auraGrad.addColorStop(1, 'rgba(8, 12, 24, 0)');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, R * 1.45, 0, Math.PI * 2);
            ctx.fill();

            // Floor contact shadow below the orb
            ctx.save();
            ctx.translate(cx, H * 0.88);
            ctx.scale(1 - floatY * 0.015, 0.22);
            const shadowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, baseR * 0.9);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
            shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, baseR * 0.9, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Morphing organic liquid sphere path
            ctx.save();
            ctx.beginPath();
            const steps = 72;
            for (let i = 0; i <= steps; i++) {
                const angle = (i / steps) * Math.PI * 2;
                const wave1 = Math.sin(angle * 3 + t * 2.4) * (1.5 + smoothedVoice * 5.5);
                const wave2 = Math.cos(angle * 5 - t * 3.1) * (0.8 + smoothedVoice * 3.2);
                const r = R + wave1 + wave2;
                const px = cx + Math.cos(angle) * r;
                const py = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Iridescent pearl/cyan/violet sphere fill (inspired by Valentin's Orby shader)
            const sphereGrad = ctx.createRadialGradient(
                cx - R * 0.32,
                cy - R * 0.35,
                R * 0.08,
                cx + R * 0.1,
                cy + R * 0.15,
                R * 1.08
            );
            sphereGrad.addColorStop(0, '#ffffff');
            sphereGrad.addColorStop(0.28, '#e0f7fe');
            sphereGrad.addColorStop(0.62, smoothedVoice > 0.15 ? '#38bdf8' : '#7dd3fc');
            sphereGrad.addColorStop(0.88, '#6366f1');
            sphereGrad.addColorStop(1, '#1e1b4b');
            ctx.fillStyle = sphereGrad;
            ctx.fill();

            // Caustic rim glow
            ctx.lineWidth = 2;
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 + smoothedVoice * 0.35})`;
            ctx.stroke();

            // Top-left specular glass highlight
            ctx.save();
            ctx.translate(cx - R * 0.32, cy - R * 0.34);
            ctx.rotate(-Math.PI / 5);
            ctx.scale(1, 0.55);
            const specGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, R * 0.32);
            specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = specGrad;
            ctx.beginPath();
            ctx.arc(0, 0, R * 0.32, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.restore();

            // Compute eye gaze target (tracks hovered pill or cursor, otherwise gentle idle drift)
            let targetX = Math.sin(t * 0.55) * (R * 0.08);
            let targetY = Math.cos(t * 0.4) * (R * 0.05);
            if (lookTargetRef.current) {
                const dx = lookTargetRef.current.x - (rect.left + cx);
                const dy = lookTargetRef.current.y - (rect.top + cy);
                const dist = Math.hypot(dx, dy) || 1;
                const maxOffset = R * 0.24;
                const factor = Math.min(maxOffset, dist * 0.09);
                targetX = (dx / dist) * factor;
                targetY = (dy / dist) * factor;
            } else if (pointerRef.current.active) {
                const dx = pointerRef.current.x - (rect.left + cx);
                const dy = pointerRef.current.y - (rect.top + cy);
                const dist = Math.hypot(dx, dy) || 1;
                const maxOffset = R * 0.22;
                const factor = Math.min(maxOffset, dist * 0.07);
                targetX = (dx / dist) * factor;
                targetY = (dy / dist) * factor;
            }
            lookX += (targetX - lookX) * 0.12;
            lookY += (targetY - lookY) * 0.12;

            // Natural blink cycle
            if (t > blinkRef.current.nextBlink) {
                blinkRef.current.blinkEnd = t + 0.14;
                blinkRef.current.nextBlink = t + 2.6 + Math.random() * 3.6;
            }
            const isBlinking = t < blinkRef.current.blinkEnd;
            const eyeScaleY = (isBlinking ? 0.12 : 1) * (1 - smoothedVoice * 0.18);

            // Draw Orby's two expressive pill-shaped eyes
            const eyeSpacing = R * 0.34;
            const eyeW = Math.max(7, R * 0.14);
            const eyeH = Math.max(12, R * 0.24) * eyeScaleY;
            const eyeY = cy - R * 0.04 + lookY;

            [-1, 1].forEach((dir) => {
                const ex = cx + dir * eyeSpacing + lookX;
                ctx.save();
                ctx.fillStyle = '#0f172a';
                ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                const rx = eyeW / 2;
                const ry = Math.max(2, eyeH / 2);
                ctx.roundRect(ex - rx, eyeY - ry, eyeW, Math.max(4, eyeH), rx);
                ctx.fill();

                // Tiny eye catchlight when open
                if (!isBlinking && eyeH > 6) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                    ctx.beginPath();
                    ctx.arc(ex - rx * 0.25, eyeY - ry * 0.35, Math.max(1.5, rx * 0.28), 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            });

            ctx.restore();
            animFrameRef.current = requestAnimationFrame(renderFrame);
        };

        animFrameRef.current = requestAnimationFrame(renderFrame);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isOpen, phase]);

    if (!isOpen) return null;

    const choices = resolveChoices(currentNode);
    const leftChoices = choices.filter((_, i) => i % 2 === 0);
    const rightChoices = choices.filter((_, i) => i % 2 === 1);

    const renderChoicePill = (choice, idx) => {
        const isHeard = choice.to && heardNodes.includes(choice.to);
        return (
            <button
                key={choice.id}
                type="button"
                data-choice={choice.id}
                onClick={(e) => handleChoice(choice, e)}
                onMouseEnter={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    lookTargetRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
                }}
                onMouseLeave={() => {
                    lookTargetRef.current = null;
                }}
                className="group relative pointer-events-auto px-5 py-3 rounded-full bg-white/[0.1] hover:bg-white/[0.2] active:scale-95 border border-white/25 hover:border-cyan-300/60 backdrop-blur-2xl text-white text-xs md:text-sm font-medium shadow-[0_12px_28px_-10px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.35)] transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
                <span className="text-[10px] font-mono text-cyan-300/80 hidden md:inline">{idx + 1}</span>
                <span>{choice.label}</span>
                {isHeard && (
                    <span className="text-emerald-300 text-xs font-bold ml-0.5" title="Already heard">
                        ✓
                    </span>
                )}
            </button>
        );
    };

    return (
        <div
            id="orby-voice-assistant-stage"
            onMouseMove={(e) => {
                pointerRef.current = { x: e.clientX, y: e.clientY, active: true };
            }}
            onMouseLeave={() => {
                pointerRef.current.active = false;
            }}
            className="fixed inset-0 z-[300] bg-[#070B14]/90 backdrop-blur-3xl text-white flex flex-col justify-between p-4 md:p-8 select-none overflow-y-auto animate-fade-in"
        >
            {/* Ambient background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-[110px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/15 blur-[110px]" />
            </div>

            {/* Top Identity & Quick-Jump Bar (Valentin Hervouet Header Style) */}
            <header className="relative z-10 flex items-center justify-between gap-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse flex-shrink-0" />
                    <div className="truncate flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[11px] font-bold text-cyan-300 tracking-wide">
                            Ash · Voice AI
                        </span>
                        <span className="font-bold text-sm md:text-base tracking-tight text-white">Ashin Shanly</span>
                        <span className="hidden sm:inline text-xs text-white/60">
                            • SWE III @ Google • M.Tech IIT Gandhinagar
                        </span>
                    </div>
                </div>

                <nav className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setNodeId('intro_full')}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    >
                        Bio
                    </button>
                    <button
                        type="button"
                        onClick={() => setNodeId('roles_ask')}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    >
                        Experience
                    </button>
                    <button
                        type="button"
                        onClick={() => setNodeId('projects_ask')}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    >
                        Projects
                    </button>
                    <button
                        type="button"
                        onClick={() => setNodeId('resume')}
                        className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/15 transition cursor-pointer"
                    >
                        Resume
                    </button>
                    <button
                        type="button"
                        onClick={() => setNodeId('contact')}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                    >
                        Contact
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close voice assistant"
                        className="ml-1 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
                    >
                        ✕
                    </button>
                </nav>
            </header>

            {/* Center Stage: Left Choices + Interactive Orb + Right Choices + Story Card */}
            <div className="relative z-10 my-auto py-4 flex flex-col items-center justify-center">
                {/* Active Story Card (pops up when [[card:...]] cue triggers) */}
                {activeCard && (
                    <div
                        className={`mb-4 max-w-md w-full rounded-2xl p-3.5 bg-gradient-to-br ${activeCard.accent} border ${activeCard.border} backdrop-blur-2xl shadow-2xl flex items-center gap-3.5 transition-all duration-300`}
                    >
                        <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center text-2xl flex-shrink-0">
                            {activeCard.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">
                                {activeCard.badge}
                            </div>
                            <div className="text-sm font-bold text-white truncate">{activeCard.title}</div>
                            <div className="text-xs text-white/75 truncate">{activeCard.subtitle}</div>
                        </div>
                        <div className="hidden sm:block px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-semibold text-cyan-300 whitespace-nowrap">
                            {activeCard.metric}
                        </div>
                    </div>
                )}

                {/* 3-Column Stage on Desktop, Stacked on Mobile */}
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                    {/* Left Choice Pills (Desktop) */}
                    <div className="hidden md:flex md:col-span-4 flex-col items-end justify-center gap-3 pr-2">
                        {leftChoices.map((c, idx) => renderChoicePill(c, idx * 2))}
                    </div>

                    {/* Center Animated Orb */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center">
                        <div
                            onClick={(e) => {
                                triggerPoke(e.clientX, e.clientY);
                                if (phase === 'speaking') skipTyping();
                                else speakText(parsed.text);
                            }}
                            title="Click Ash to poke or replay voice"
                            className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 cursor-pointer flex items-center justify-center"
                        >
                            <canvas
                                ref={canvasRef}
                                data-testid="orb-canvas"
                                className="w-full h-full block"
                            />
                            {phase === 'speaking' && (
                                <span className="absolute bottom-2 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] text-cyan-300 font-mono tracking-wider uppercase">
                                    Speaking • Tap to skip
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right Choice Pills (Desktop) */}
                    <div className="hidden md:flex md:col-span-4 flex-col items-start justify-center gap-3 pl-2">
                        {rightChoices.map((c, idx) => renderChoicePill(c, idx * 2 + 1))}
                    </div>
                </div>

                {/* Synchronized Typewriter Subtitle (data-testid="orby-line") */}
                <p
                    data-testid="orby-line"
                    onClick={skipTyping}
                    className="mt-3 max-w-2xl text-center text-sm sm:text-base md:text-lg font-medium leading-relaxed px-4 cursor-pointer select-none"
                >
                    <span className="text-white">{parsed.text.slice(0, typedCount)}</span>
                    <span className="text-white/25">{parsed.text.slice(typedCount)}</span>
                </p>

                {/* Mobile Choice Pills Grid */}
                <div
                    data-testid="orby-choices-mobile"
                    className="mt-4 grid grid-cols-2 gap-2.5 w-full max-w-md md:hidden px-2"
                >
                    {choices.map((c, idx) => renderChoicePill(c, idx))}
                </div>
            </div>

            {/* Bottom Controls: Sound Toggle + Live Voice Mic + Natural Language Input */}
            <footer className="relative z-10 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        data-testid="sound-toggle"
                        onClick={() => {
                            const next = !soundOn;
                            setSoundOn(next);
                            if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                                window.speechSynthesis.cancel();
                            }
                        }}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold border backdrop-blur-xl flex items-center gap-2 transition cursor-pointer ${
                            soundOn
                                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                                : 'bg-white/10 border-white/15 text-white/60'
                        }`}
                    >
                        <span>{soundOn ? '🔊 Sound on' : '🔇 Sound off'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const { text } = parseDialogueText(currentNode.text);
                            setTypedCount(0);
                            setPhase('speaking');
                            speakText(text);
                        }}
                        className="px-3.5 py-2 rounded-full text-xs font-medium bg-white/10 hover:bg-white/15 border border-white/15 text-white/85 transition cursor-pointer"
                    >
                        ↻ Replay
                    </button>

                    <button
                        type="button"
                        onClick={toggleMic}
                        className={`px-3.5 py-2 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
                            isListeningMic
                                ? 'bg-rose-500/30 border-rose-400 text-rose-200 animate-pulse'
                                : 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/40 text-purple-200'
                        }`}
                    >
                        <span>🎙️ {isListeningMic ? 'Listening…' : 'Ask by Voice'}</span>
                    </button>
                </div>

                {/* Natural Language Question Input */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!textPrompt.trim()) return;
                        routeNaturalLanguageQuery(textPrompt);
                        setMicTranscript(`Asked: "${textPrompt.trim()}"`);
                        setTextPrompt('');
                    }}
                    className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[290px]"
                >
                    <input
                        type="text"
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        placeholder={micTranscript || 'Ask Ash anything (e.g. "Google", "Lumina", "IIT")...'}
                        className="flex-1 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white placeholder-white/45 outline-none focus:border-cyan-400"
                    />
                    <button
                        type="submit"
                        className="px-3.5 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition cursor-pointer"
                    >
                        Ask
                    </button>
                </form>
            </footer>
        </div>
    );
}

/**
 * Floating Mini-Orb Trigger Button for Ubuntu Desktop & Android Home Screen
 */
export function OrbyFloatingLauncher({ onClick, label = 'Ask Ash AI' }) {
    return (
        <button
            type="button"
            id="orby-floating-launcher"
            onClick={onClick}
            title="Talk to Ash — Ashin's Interactive Voice Assistant"
            className="group flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#0F172A]/85 hover:bg-[#1E293B]/95 border border-cyan-400/40 hover:border-cyan-300 shadow-[0_8px_30px_rgba(6,182,212,0.3)] backdrop-blur-2xl text-white transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
            <span className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 via-cyan-400 to-white flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.8)]">
                {/* Mini Ash Eyes */}
                <span className="flex items-center gap-1">
                    <span className="w-1 h-2 rounded-full bg-slate-950" />
                    <span className="w-1 h-2 rounded-full bg-slate-950" />
                </span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-cyan-100 group-hover:text-white">
                {label}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-[9px] font-mono text-cyan-300 uppercase">
                Voice
            </span>
        </button>
    );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Talk to Ash — Ashin Shanly's Interactive Voice AI App
 * Compatible with both Ubuntu 24.04 Windowed UI (any window size) and Android 14 Mobile UI (all screen sizes).
 * Inspired by valentinhervouet.com:
 * - Interactive 60fps Canvas Orb with cursor-tracking blinking pill-shaped eyes, voice-reactive liquid caustics, and poke physics
 * - Container-aware responsive layout (3-column flanking choice pills on wide containers, stacked grid on compact/mobile containers)
 * - Synchronized typewriter subtitles (click or Space to skip) + timed [[card:...]] Story Cards
 * - Web Speech API voice synthesis + Web Speech Recognition ("Ask by Voice") + natural language prompt input
 */

const ASH_DIALOGUE_GRAPH = {
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
        text: "Here's Ashin's resume summary! You can download the full PDF directly, or open his full interactive About Ashin profile.",
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

export function TalkToAsh({ openApp }) {
    const [nodeId, setNodeId] = useState('greet');
    const [phase, setPhase] = useState('speaking'); // 'speaking' | 'choosing'
    const [typedCount, setTypedCount] = useState(0);
    const [soundOn, setSoundOn] = useState(true);
    const [heardNodes, setHeardNodes] = useState([]);
    const [activeCard, setActiveCard] = useState(null);
    const [isListeningMic, setIsListeningMic] = useState(false);
    const [micTranscript, setMicTranscript] = useState('');
    const [textPrompt, setTextPrompt] = useState('');
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const pointerRef = useRef({ x: 0, y: 0, active: false });
    const lookTargetRef = useRef(null);
    const pokeRef = useRef({ x: 0, y: 0, t: 999 });
    const voiceLevelRef = useRef(0);
    const typeTimerRef = useRef(null);
    const animFrameRef = useRef(null);
    const blinkRef = useRef({ nextBlink: 2.2, blinkEnd: 0 });
    const recognitionRef = useRef(null);

    const currentNode = ASH_DIALOGUE_GRAPH[nodeId] || ASH_DIALOGUE_GRAPH.greet;
    const parsed = parseDialogueText(currentNode.text);

    // Measure actual app container size so layout adapts cleanly in both resized Ubuntu windows & Android screens
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const updateDims = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };
        updateDims();
        let ro = null;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(updateDims);
            ro.observe(el);
        }
        window.addEventListener('resize', updateDims);
        return () => {
            if (ro) ro.disconnect();
            window.removeEventListener('resize', updateDims);
        };
    }, []);

    // Resolve choices for current node
    const resolveChoices = useCallback((node) => {
        if (!node) return [];
        const raw = typeof node.choices === 'string' ? CHOICE_SETS[node.choices] || [] : node.choices || [];
        return raw.filter((c) => {
            if (c.action === 'visit' && !node.projectUrl && !node.appId) return false;
            return true;
        });
    }, []);

    // Speak text via Web Speech API
    const speakText = useCallback(
        (cleanText) => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            try {
                window.speechSynthesis.cancel();
                if (!soundOn) return;

                const utter = new SpeechSynthesisUtterance(cleanText);
                utter.rate = 1.04;
                utter.pitch = 1.05;
                utter.volume = 0.95;

                const voices = window.speechSynthesis.getVoices();
                const preferred = voices.find(
                    (v) =>
                        /en[-_]/i.test(v.lang) &&
                        /(Samantha|Google US English|Alex|Daniel|Karen|Natural|Neural)/i.test(v.name)
                );
                if (preferred) utter.voice = preferred;

                utter.onboundary = () => {
                    voiceLevelRef.current = 0.65 + Math.random() * 0.35;
                };
                utter.onend = () => {
                    voiceLevelRef.current = 0;
                };
                utter.onerror = () => {
                    voiceLevelRef.current = 0;
                };

                window.speechSynthesis.speak(utter);
            } catch {
                // Ignore browser autoplay restrictions
            }
        },
        [soundOn]
    );

    // Cleanup all timers & speech on unmount (when Ubuntu window or Android app closes)
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (typeTimerRef.current) clearInterval(typeTimerRef.current);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch {}
            }
        };
    }, []);

    // Start typing + speech whenever nodeId changes
    useEffect(() => {
        const node = ASH_DIALOGUE_GRAPH[nodeId] || ASH_DIALOGUE_GRAPH.greet;
        const { text, cues } = parseDialogueText(node.text);

        setPhase('speaking');
        setTypedCount(0);

        if (cues.length > 0 && cues[0].charIndex <= 4 && STORY_CARDS[cues[0].cardId]) {
            setActiveCard(STORY_CARDS[cues[0].cardId]);
        } else if (cues.length === 0) {
            setActiveCard(null);
        }

        if (node.tracksHeard) {
            setHeardNodes((prev) => (prev.includes(node.id) ? prev : [...prev, node.id]));
        }

        speakText(text);

        if (typeTimerRef.current) clearInterval(typeTimerRef.current);
        let idx = 0;
        typeTimerRef.current = setInterval(() => {
            idx += 1;
            setTypedCount(idx);
            voiceLevelRef.current = Math.max(
                voiceLevelRef.current * 0.85,
                0.35 + Math.sin(idx * 0.6) * 0.25 + Math.random() * 0.2
            );

            for (const cue of cues) {
                if (idx >= cue.charIndex && STORY_CARDS[cue.cardId]) {
                    setActiveCard(STORY_CARDS[cue.cardId]);
                }
            }

            if (idx >= text.length) {
                clearInterval(typeTimerRef.current);
                typeTimerRef.current = null;
                voiceLevelRef.current = 0;
                setPhase('choosing');
            }
        }, 24);

        return () => {
            if (typeTimerRef.current) {
                clearInterval(typeTimerRef.current);
                typeTimerRef.current = null;
            }
        };
    }, [nodeId, speakText]);

    // Skip typewriter animation on click or Spacebar
    const skipTyping = useCallback(() => {
        if (phase !== 'speaking') return;
        const { text, cues } = parseDialogueText(currentNode.text);
        if (typeTimerRef.current) {
            clearInterval(typeTimerRef.current);
            typeTimerRef.current = null;
        }
        if (cues.length > 0) {
            const lastCue = cues[cues.length - 1];
            if (STORY_CARDS[lastCue.cardId]) setActiveCard(STORY_CARDS[lastCue.cardId]);
        }
        setTypedCount(text.length);
        voiceLevelRef.current = 0;
        setPhase('choosing');
    }, [phase, currentNode]);

    // Keyboard shortcuts (Space to skip, 1-6 to pick choices)
    useEffect(() => {
        const handleKey = (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
            if (e.code === 'Space' && phase === 'speaking') {
                e.preventDefault();
                skipTyping();
            } else if (/^[1-6]$/.test(e.key)) {
                const idx = parseInt(e.key, 10) - 1;
                const choices = resolveChoices(currentNode);
                if (choices[idx]) {
                    handleChoice(choices[idx]);
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    });

    const triggerPoke = (clientX, clientY) => {
        pokeRef.current = { x: clientX || 0, y: clientY || 0, t: 0 };
        voiceLevelRef.current = 0.75;
    };

    const handleChoice = (choice, e) => {
        if (e) triggerPoke(e.clientX, e.clientY);

        if (choice.link) {
            window.open(choice.link, '_blank', 'noopener,noreferrer');
            return;
        }
        if (choice.appId && typeof openApp === 'function') {
            openApp(choice.appId);
            return;
        }
        if (choice.action === 'visit') {
            if (currentNode.projectUrl) {
                window.open(currentNode.projectUrl, '_blank', 'noopener,noreferrer');
            } else if (currentNode.appId && typeof openApp === 'function') {
                openApp(currentNode.appId);
            }
            return;
        }
        if (choice.to && ASH_DIALOGUE_GRAPH[choice.to]) {
            setNodeId(choice.to);
        }
    };

    // Route natural language voice/text queries to the best Ash dialogue node
    const routeNaturalLanguageQuery = (rawQuery) => {
        const q = (rawQuery || '').toLowerCase().trim();
        if (!q) return;
        if (q.includes('google') || q.includes('current') || q.includes('swe')) {
            setNodeId('role_google');
        } else if (q.includes('oracle') || q.includes('spark') || q.includes('rag') || q.includes('delta')) {
            setNodeId('role_oracle');
        } else if (q.includes('tcs') || q.includes('lidar') || q.includes('intern')) {
            setNodeId('role_tcs');
        } else if (q.includes('iit') || q.includes('education') || q.includes('college') || q.includes('medal') || q.includes('degree')) {
            setNodeId('role_iitgn');
        } else if (q.includes('lumina') || q.includes('game')) {
            setNodeId('project_lumina');
        } else if (q.includes('music') || q.includes('sync')) {
            setNodeId('project_musicsync');
        } else if (q.includes('guest') || q.includes('pixel') || q.includes('matrix')) {
            setNodeId('project_guestbook');
        } else if (q.includes('caption') || q.includes('gcn') || q.includes('acm')) {
            setNodeId('project_sgcn');
        } else if (q.includes('implicit') || q.includes('neural') || q.includes('3d') || q.includes('thesis')) {
            setNodeId('project_inr');
        } else if (q.includes('project') || q.includes('build') || q.includes('paper')) {
            setNodeId('projects_ask');
        } else if (q.includes('experience') || q.includes('work') || q.includes('career') || q.includes('job')) {
            setNodeId('roles_ask');
        } else if (q.includes('hobby') || q.includes('hobbies') || q.includes('badminton') || q.includes('anime') || q.includes('fun')) {
            setNodeId('hobbies');
        } else if (q.includes('resume') || q.includes('cv')) {
            setNodeId('resume');
        } else if (q.includes('contact') || q.includes('email') || q.includes('hire') || q.includes('reach')) {
            setNodeId('contact');
        } else if (q.includes('full') || q.includes('story')) {
            setNodeId('intro_full');
        } else {
            setNodeId('intro_quick');
        }
    };

    // Live Microphone SpeechRecognition ("Ask by Voice")
    const toggleMic = () => {
        if (typeof window === 'undefined') return;
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            setMicTranscript('Voice input not supported in this browser — type a question below!');
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
            setMicTranscript('Listening… Ask about Google, Oracle, IIT, Projects, Hobbies, or Contact!');

            rec.onresult = (event) => {
                const spoken = event.results?.[0]?.[0]?.transcript || '';
                setMicTranscript(`Heard: "${spoken}"`);
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
        } catch {
            setIsListeningMic(false);
        }
    };

    // 60fps Canvas Interactive Orb Renderer (Liquid Iridescent Sphere + Eye Tracking + Blinking + Voice Waves)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let startTime = performance.now();
        let lookX = 0;
        let lookY = 0;
        let smoothedVoice = 0;

        const renderFrame = (now) => {
            const t = (now - startTime) / 1000;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            const W = rect.width || 200;
            const H = rect.height || 200;

            if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
                canvas.width = Math.round(W * dpr);
                canvas.height = Math.round(H * dpr);
            }

            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, W, H);

            // Smooth voice level
            smoothedVoice += (voiceLevelRef.current - smoothedVoice) * 0.18;
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
            const floatY = Math.sin(t * 1.6) * 5;
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
                const wave1 = Math.sin(angle * 3 + t * 2.4) * (1.4 + smoothedVoice * 5.0);
                const wave2 = Math.cos(angle * 5 - t * 3.1) * (0.7 + smoothedVoice * 3.0);
                const r = R + wave1 + wave2;
                const px = cx + Math.cos(angle) * r;
                const py = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Iridescent pearl/cyan/violet sphere fill
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

            // Draw Ash's two expressive pill-shaped eyes
            const eyeSpacing = R * 0.34;
            const eyeW = Math.max(6, R * 0.14);
            const eyeH = Math.max(11, R * 0.24) * eyeScaleY;
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
    }, [phase]);

    const choices = resolveChoices(currentNode);
    const leftChoices = choices.filter((_, i) => i % 2 === 0);
    const rightChoices = choices.filter((_, i) => i % 2 === 1);

    // Container-aware breakpoint: use 3-column flanking layout when container is wide enough (>= 720px) and tall enough (>= 460px)
    const isWideStage = containerSize.width >= 720 && containerSize.height >= 460;
    const isCompactHeight = containerSize.height < 540;

    const renderChoicePill = (choice, idx, compact = false) => {
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
                className={`group relative pointer-events-auto rounded-full bg-white/[0.09] hover:bg-white/[0.18] active:scale-95 border border-white/20 hover:border-cyan-300/60 backdrop-blur-2xl text-white font-medium shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    compact ? 'px-3 py-2 text-xs w-full' : 'px-4 py-2.5 text-xs lg:text-sm'
                }`}
            >
                {!compact && (
                    <span className="text-[10px] font-mono text-cyan-300/80 flex-shrink-0">{idx + 1}</span>
                )}
                <span className="truncate">{choice.label}</span>
                {isHeard && (
                    <span className="text-emerald-300 text-xs font-bold flex-shrink-0" title="Already heard">
                        ✓
                    </span>
                )}
            </button>
        );
    };

    const orbSizeClass = isWideStage
        ? isCompactHeight
            ? 'w-40 h-40'
            : 'w-52 h-52 lg:w-60 lg:h-60'
        : isCompactHeight
        ? 'w-32 h-32'
        : 'w-40 h-40 sm:w-44 sm:h-44';

    return (
        <div
            ref={containerRef}
            id="talk-to-ash-app"
            onMouseMove={(e) => {
                pointerRef.current = { x: e.clientX, y: e.clientY, active: true };
            }}
            onMouseLeave={() => {
                pointerRef.current.active = false;
            }}
            className="relative w-full h-full min-h-full bg-[#070B14] text-white flex flex-col justify-between p-3 sm:p-5 md:p-6 select-none overflow-y-auto overflow-x-hidden"
        >
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-cyan-500/15 blur-[95px]" />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-indigo-500/15 blur-[95px]" />
            </div>

            {/* Top Identity & Quick-Jump Bar */}
            <header className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse flex-shrink-0" />
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[11px] font-bold text-cyan-300 tracking-wide flex-shrink-0">
                        Ash · Voice AI
                    </span>
                    <span className="text-xs text-white/75 font-medium truncate hidden sm:inline">
                        Ashin Shanly&apos;s Interactive Guide
                    </span>
                </div>

                <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-full">
                    {[
                        { label: 'Intro', to: 'greet' },
                        { label: 'Bio', to: 'intro_full' },
                        { label: 'Experience', to: 'roles_ask' },
                        { label: 'Projects', to: 'projects_ask' },
                        { label: 'Hobbies', to: 'hobbies' },
                        { label: 'Resume', to: 'resume' },
                        { label: 'Contact', to: 'contact', highlight: true },
                    ].map((item) => (
                        <button
                            key={item.to}
                            type="button"
                            onClick={() => setNodeId(item.to)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                                item.highlight
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-sm'
                                    : nodeId === item.to
                                    ? 'bg-white/15 text-cyan-300 border border-cyan-400/30'
                                    : 'text-white/75 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </header>

            {/* Center Stage: Story Card + Orb + Flanking/Stacked Choices + Subtitle */}
            <div className="relative z-10 my-auto py-2 sm:py-3 flex flex-col items-center justify-center w-full">
                {/* Active Story Card (pops up when [[card:...]] cue triggers) */}
                {activeCard && (
                    <div
                        className={`mb-2.5 max-w-md w-full rounded-2xl p-2.5 sm:p-3 bg-gradient-to-br ${activeCard.accent} border ${activeCard.border} backdrop-blur-2xl shadow-xl flex items-center gap-3 transition-all duration-300`}
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                            {activeCard.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-cyan-300 truncate">
                                {activeCard.badge}
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-white truncate">{activeCard.title}</div>
                            <div className="text-[11px] text-white/75 truncate">{activeCard.subtitle}</div>
                        </div>
                        <div className="hidden sm:block px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-[10px] font-semibold text-cyan-300 whitespace-nowrap">
                            {activeCard.metric}
                        </div>
                    </div>
                )}

                {isWideStage ? (
                    /* Wide Container Stage: Left Choice Pills + Center Orb + Right Choice Pills */
                    <div className="w-full max-w-4xl grid grid-cols-12 items-center gap-3">
                        <div className="col-span-4 flex flex-col items-end justify-center gap-2.5 pr-1">
                            {leftChoices.map((c, idx) => renderChoicePill(c, idx * 2, false))}
                        </div>

                        <div className="col-span-4 flex flex-col items-center justify-center">
                            <div
                                onClick={(e) => {
                                    triggerPoke(e.clientX, e.clientY);
                                    if (phase === 'speaking') skipTyping();
                                    else speakText(parsed.text);
                                }}
                                title="Click Ash to poke or replay voice"
                                className={`relative ${orbSizeClass} cursor-pointer flex items-center justify-center`}
                            >
                                <canvas
                                    ref={canvasRef}
                                    data-testid="orb-canvas"
                                    className="w-full h-full block"
                                />
                                {phase === 'speaking' && (
                                    <span className="absolute bottom-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[9px] text-cyan-300 font-mono tracking-wider uppercase">
                                        Speaking • Tap to skip
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="col-span-4 flex flex-col items-start justify-center gap-2.5 pl-1">
                            {rightChoices.map((c, idx) => renderChoicePill(c, idx * 2 + 1, false))}
                        </div>
                    </div>
                ) : (
                    /* Compact / Mobile Container Stage: Centered Orb */
                    <div className="flex flex-col items-center justify-center">
                        <div
                            onClick={(e) => {
                                triggerPoke(e.clientX, e.clientY);
                                if (phase === 'speaking') skipTyping();
                                else speakText(parsed.text);
                            }}
                            title="Tap Ash to poke or replay voice"
                            className={`relative ${orbSizeClass} cursor-pointer flex items-center justify-center`}
                        >
                            <canvas
                                ref={canvasRef}
                                data-testid="orb-canvas"
                                className="w-full h-full block"
                            />
                            {phase === 'speaking' && (
                                <span className="absolute bottom-0.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[9px] text-cyan-300 font-mono tracking-wider uppercase">
                                    Speaking • Tap to skip
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Synchronized Typewriter Subtitle */}
                <p
                    data-testid="orby-line"
                    onClick={skipTyping}
                    className="mt-2 max-w-2xl text-center text-xs sm:text-sm md:text-base font-medium leading-relaxed px-2 sm:px-4 cursor-pointer select-none"
                >
                    <span className="text-white">{parsed.text.slice(0, typedCount)}</span>
                    <span className="text-white/25">{parsed.text.slice(typedCount)}</span>
                </p>

                {/* Choice Pills Grid for Compact Ubuntu Windows & Android Screens */}
                {!isWideStage && (
                    <div
                        data-testid="orby-choices-compact"
                        className="mt-3 grid grid-cols-2 gap-2 w-full max-w-md px-1"
                    >
                        {choices.map((c, idx) => renderChoicePill(c, idx, true))}
                    </div>
                )}
            </div>

            {/* Bottom Controls: Sound Toggle + Replay + Live Voice Mic + Natural Language Input */}
            <footer className="relative z-10 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 flex-shrink-0">
                <div className="flex items-center justify-center gap-1.5 flex-wrap w-full sm:w-auto">
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
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border backdrop-blur-xl flex items-center gap-1.5 transition cursor-pointer ${
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
                        className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/15 border border-white/15 text-white/85 transition cursor-pointer"
                    >
                        ↻ Replay
                    </button>

                    <button
                        type="button"
                        onClick={toggleMic}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 transition cursor-pointer ${
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
                    className="flex items-center gap-1.5 w-full sm:w-auto sm:flex-1 sm:max-w-xs"
                >
                    <input
                        type="text"
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        placeholder={micTranscript || 'Ask Ash anything (e.g. "Google", "Lumina")...'}
                        className="flex-1 min-w-0 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-white placeholder-white/45 outline-none focus:border-cyan-400"
                    />
                    <button
                        type="submit"
                        className="px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer flex-shrink-0"
                    >
                        Ask
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default TalkToAsh;

export const displayTalkToAsh = (propsOrAddFolder, openAppProp) => {
    if (propsOrAddFolder && typeof propsOrAddFolder === 'object' && typeof propsOrAddFolder !== 'function') {
        return <TalkToAsh {...propsOrAddFolder} />;
    }
    return <TalkToAsh openApp={openAppProp} />;
};

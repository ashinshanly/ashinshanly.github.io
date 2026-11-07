import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Talk to Ash — Ashin Shanly's Minimal Interactive Voice AI App
 * Compatible with both Ubuntu 24.04 Windowed UI (any window size) and Android 14 Mobile UI (all screen sizes).
 */

const ASH_DIALOGUE_GRAPH = {
    greet: {
        id: 'greet',
        text: "Hi, I'm Ash — Ashin's AI guide. Where should we start?",
        choices: [
            { id: 'quick', label: 'Quick intro', to: 'intro_quick' },
            { id: 'full', label: 'Full story', to: 'intro_full' },
            { id: 'projects', label: 'Projects', to: 'projects_ask' },
            { id: 'experience', label: 'Experience', to: 'roles_ask' },
        ],
    },
    intro_quick: {
        id: 'intro_quick',
        text: "[[card:google]]Ashin is a Software Engineer at Google and an [[card:iitgn]]IIT Gandhinagar medalist, previously building cloud AI at [[card:oracle]]Oracle.",
        choices: 'menu',
        tracksHeard: true,
    },
    intro_full: {
        id: 'intro_full',
        text: "[[card:iitgn]]Ashin won the Director's Silver Medal at IIT Gandhinagar, researched 3D vision at [[card:tcs]]TCS, scaled GenAI at [[card:oracle]]Oracle, and now engineers fleet intelligence at [[card:google]]Google.",
        choices: 'menu',
        tracksHeard: true,
    },
    menu_return: {
        id: 'menu_return',
        text: 'What should we explore next?',
        choices: 'menu',
    },
    roles_ask: {
        id: 'roles_ask',
        text: "Pick a chapter of Ashin's journey.",
        choices: 'roles',
    },
    roles_again: {
        id: 'roles_again',
        text: 'Which role should we check out next?',
        choices: 'roles',
    },
    role_google: {
        id: 'role_google',
        text: "[[card:google]]At Google, Ashin builds distributed data platforms powering Alphabet's elastic compute fleet.",
        choices: 'after_role',
        tracksHeard: true,
    },
    role_oracle: {
        id: 'role_oracle',
        text: '[[card:oracle]]At Oracle, he led petabyte-scale Delta Lake pipelines and built a GenAI RAG assistant automating 60% of support queries.',
        choices: 'after_role',
        tracksHeard: true,
    },
    role_tcs: {
        id: 'role_tcs',
        text: '[[card:tcs]]At TCS Research, he fused 3D LiDAR point clouds with hyperspectral imagery, boosting tree segmentation by 18%.',
        choices: 'after_role',
        tracksHeard: true,
    },
    role_iitgn: {
        id: 'role_iitgn',
        text: "[[card:iitgn]]At IIT Gandhinagar, he graduated with a 9.0 CGPA and the Director's Silver Medal, accelerating 3D neural training by 21%.",
        choices: 'after_role',
        tracksHeard: true,
    },
    projects_ask: {
        id: 'projects_ask',
        text: 'From deep learning papers to interactive web apps — pick one to explore.',
        choices: 'projects',
    },
    projects_again: {
        id: 'projects_again',
        text: 'Which project should we look at next?',
        choices: 'projects',
    },
    project_inr: {
        id: 'project_inr',
        text: '[[card:inr]]His split-encoder 3D neural architecture speeds up scene training by 21% without losing visual fidelity.',
        choices: 'after_project',
        projectUrl: 'https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en',
        tracksHeard: true,
    },
    project_sgcn: {
        id: 'project_sgcn',
        text: '[[card:sgcn]]Published at ACM CODS-COMAD, his Siamese Graph Network generates rich semantic image captions.',
        choices: 'after_project',
        projectUrl: 'https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en',
        tracksHeard: true,
    },
    project_lumina: {
        id: 'project_lumina',
        text: '[[card:lumina]]Lumina is a minimal cosmic rhythm-memory game with pulsar constellations and ambient synthesis.',
        choices: 'after_project',
        projectUrl: 'https://ashinshanly.github.io/lumina/',
        tracksHeard: true,
    },
    project_musicsync: {
        id: 'project_musicsync',
        text: '[[card:musicsync]]MusicSync synchronizes audio playback across multiple phones and laptops in real time.',
        choices: 'after_project',
        projectUrl: 'https://ashinshanly.github.io/musicsync/',
        tracksHeard: true,
    },
    project_guestbook: {
        id: 'project_guestbook',
        text: '[[card:guestbook]]GuestBook is a live 64 by 64 neon pixel matrix where every cell plays a musical note.',
        choices: 'after_project',
        appId: 'pixel-hud',
        tracksHeard: true,
    },
    hobbies: {
        id: 'hobbies',
        text: '[[card:hobbies]]Off the clock, Ashin plays competitive badminton, watches anime, and swing-trades the markets.',
        choices: 'menu',
        tracksHeard: true,
    },
    resume: {
        id: 'resume',
        text: "Grab Ashin's resume PDF or open his full profile.",
        choices: [
            { id: 'download_pdf', label: 'Resume PDF ↗', link: './files/AshinShanly_RESUME.pdf' },
            { id: 'open_about', label: 'About Ashin', appId: 'about-ashin' },
            { id: 'something_else', label: '↩ Back', to: 'menu_return' },
        ],
        tracksHeard: true,
    },
    contact: {
        id: 'contact',
        text: 'Reach out via the Contact app, LinkedIn, or email.',
        choices: [
            { id: 'open_gedit', label: 'Contact App', appId: 'gedit' },
            { id: 'linkedin', label: 'LinkedIn ↗', link: 'https://www.linkedin.com/in/ashinshanly/' },
            { id: 'email', label: 'Email ↗', link: 'mailto:ashinkoottala@gmail.com' },
            { id: 'something_else', label: '↩ Back', to: 'menu_return' },
        ],
        tracksHeard: true,
    },
};

const CHOICE_SETS = {
    menu: [
        { id: 'projects', label: 'Projects', to: 'projects_ask' },
        { id: 'experience', label: 'Experience', to: 'roles_ask' },
        { id: 'hobbies', label: 'Hobbies', to: 'hobbies' },
        { id: 'resume', label: 'Resume', to: 'resume' },
        { id: 'contact', label: 'Contact', to: 'contact' },
    ],
    roles: [
        { id: 'google', label: 'Google', to: 'role_google' },
        { id: 'oracle', label: 'Oracle', to: 'role_oracle' },
        { id: 'tcs', label: 'TCS Research', to: 'role_tcs' },
        { id: 'iitgn', label: 'IIT Gandhinagar', to: 'role_iitgn' },
        { id: 'back_roles', label: '↩ Back', to: 'menu_return' },
    ],
    after_role: [
        { id: 'another_role', label: 'More roles', to: 'roles_again' },
        { id: 'projects', label: 'Projects', to: 'projects_ask' },
        { id: 'something_else', label: '↩ Menu', to: 'menu_return' },
    ],
    projects: [
        { id: 'lumina', label: 'Lumina', to: 'project_lumina' },
        { id: 'musicsync', label: 'MusicSync', to: 'project_musicsync' },
        { id: 'guestbook', label: 'GuestBook', to: 'project_guestbook' },
        { id: 'inr', label: '3D Neural Nets', to: 'project_inr' },
        { id: 'sgcn', label: 'S-GCN Paper', to: 'project_sgcn' },
        { id: 'back_projects', label: '↩ Back', to: 'menu_return' },
    ],
    after_project: [
        { id: 'visit_project', label: 'Launch ↗', action: 'visit' },
        { id: 'another_project', label: 'More projects', to: 'projects_again' },
        { id: 'something_else', label: '↩ Menu', to: 'menu_return' },
    ],
};

const STORY_CARDS = {
    google: {
        title: 'Google',
        tag: 'SWE III',
        accent: 'from-blue-500/25 via-cyan-500/15 to-emerald-500/15',
        border: 'border-cyan-400/35',
        icon: '🔵',
    },
    oracle: {
        title: 'Oracle',
        tag: 'GenAI & Data',
        accent: 'from-red-500/25 via-orange-500/15 to-amber-500/15',
        border: 'border-orange-400/35',
        icon: '🔴',
    },
    tcs: {
        title: 'TCS Research',
        tag: '3D Vision',
        accent: 'from-sky-500/25 via-blue-500/15 to-indigo-500/15',
        border: 'border-sky-400/35',
        icon: '🔷',
    },
    iitgn: {
        title: 'IIT Gandhinagar',
        tag: 'Silver Medalist',
        accent: 'from-amber-500/25 via-yellow-500/15 to-orange-500/15',
        border: 'border-amber-400/35',
        icon: '🏆',
    },
    inr: {
        title: '3D Neural Rep',
        tag: '+21% Faster',
        accent: 'from-purple-500/25 via-fuchsia-500/15 to-cyan-500/15',
        border: 'border-purple-400/35',
        icon: '🧠',
    },
    sgcn: {
        title: 'Siamese-GCN',
        tag: 'ACM Paper',
        accent: 'from-emerald-500/25 via-teal-500/15 to-cyan-500/15',
        border: 'border-emerald-400/35',
        icon: '📄',
    },
    lumina: {
        title: 'Lumina',
        tag: 'Cosmic Memory',
        accent: 'from-cyan-500/25 via-blue-500/15 to-indigo-500/15',
        border: 'border-cyan-400/35',
        icon: '✨',
    },
    musicsync: {
        title: 'MusicSync',
        tag: 'Live Audio',
        accent: 'from-pink-500/25 via-rose-500/15 to-purple-500/15',
        border: 'border-pink-400/35',
        icon: '🎵',
    },
    guestbook: {
        title: 'GuestBook',
        tag: '64×64 Matrix',
        accent: 'from-cyan-500/25 via-fuchsia-500/15 to-emerald-500/15',
        border: 'border-cyan-400/35',
        icon: '🎨',
    },
    hobbies: {
        title: 'Beyond Code',
        tag: 'Badminton · Anime',
        accent: 'from-violet-500/25 via-indigo-500/15 to-cyan-500/15',
        border: 'border-violet-400/35',
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

/**
 * Selects the smoothest, most natural modern female English voice available across
 * Chrome, Safari/macOS, Edge, and Android.
 */
function selectModernFemaleVoice(voices) {
    if (!voices || !voices.length) return null;
    const enVoices = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
    const pool = enVoices.length ? enVoices : voices;

    const scoreVoice = (v) => {
        const name = v.name || '';
        // Exclude known male voices
        if (/(Alex|Daniel|Fred|Aaron|Arthur|Oliver|Rishi|Tom|David|Mark|Guy|Christopher|Eric|Steffan|Roger|Brian|George|\bMale\b)/i.test(name)) {
            return -100;
        }
        let s = 0;
        // Tier 1: Ultra-smooth Neural / Natural / Cloud female voices
        if (/(Ava|Aria|Jenny|Sonia|Emma|Michelle|Libby).*(Natural|Online|Neural)/i.test(name)) s += 130;
        if (/Google UK English Female/i.test(name)) s += 125;
        if (/Google US English/i.test(name)) s += 118;
        if (/(Ava|Zoe|Allison|Serena|Samantha|Karen|Moira).*(Premium|Enhanced)/i.test(name)) s += 115;
        if (/(Natural|Neural|Premium|Enhanced)/i.test(name)) s += 45;

        // Tier 2: Warm, modern female voice names
        if (/\b(Ava|Zoe|Allison|Serena)\b/i.test(name)) s += 75;
        if (/\b(Samantha|Moira|Karen|Tessa|Victoria|Martha|Nicky|Aria|Jenny|Sonia)\b/i.test(name)) s += 65;
        if (/Female/i.test(name)) s += 40;

        // Prefer US / UK / AU / IE natural accents
        if (/en[-_](US|GB|AU|IE)/i.test(v.lang)) s += 15;
        return s;
    };

    let best = null;
    let bestScore = -999;
    for (const v of pool) {
        const sc = scoreVoice(v);
        if (sc > bestScore) {
            bestScore = sc;
            best = v;
        }
    }
    return best;
}

export function TalkToAsh({ openApp }) {
    const [nodeId, setNodeId] = useState('greet');
    const [phase, setPhase] = useState('speaking'); // 'speaking' | 'choosing'
    const [typedCount, setTypedCount] = useState(0);
    const [soundOn, setSoundOn] = useState(true);
    const [heardNodes, setHeardNodes] = useState([]);
    const [activeCard, setActiveCard] = useState(null);
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
    const preferredVoiceRef = useRef(null);

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

    // Preload and lock onto the smoothest modern female voice
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const updateVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            const chosen = selectModernFemaleVoice(voices);
            if (chosen) {
                preferredVoiceRef.current = chosen;
            }
        };
        updateVoice();
        window.speechSynthesis.addEventListener?.('voiceschanged', updateVoice);
        return () => {
            window.speechSynthesis.removeEventListener?.('voiceschanged', updateVoice);
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

    // Speak text with smooth, modern female voice prosody
    const speakText = useCallback(
        (cleanText) => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
            try {
                window.speechSynthesis.cancel();
                if (!soundOn) return;

                const utter = new SpeechSynthesisUtterance(cleanText);
                const voices = window.speechSynthesis.getVoices();
                const voice = preferredVoiceRef.current || selectModernFemaleVoice(voices);
                if (voice) {
                    preferredVoiceRef.current = voice;
                    utter.voice = voice;
                    utter.lang = voice.lang || 'en-US';
                } else {
                    utter.lang = 'en-US';
                }

                // Smooth, warm, unrushed female cadence
                const isGoogleVoice = voice && /Google/i.test(voice.name);
                utter.rate = isGoogleVoice ? 0.98 : 0.95;
                utter.pitch = 1.03;
                utter.volume = 0.95;

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

    // Cleanup all timers & speech on unmount
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (typeTimerRef.current) clearInterval(typeTimerRef.current);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
        }, 26);

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

    const renderChoicePill = (choice, compact = false) => {
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
                className={`group relative pointer-events-auto rounded-full bg-white/[0.08] hover:bg-white/[0.16] active:scale-95 border border-white/15 hover:border-cyan-300/60 backdrop-blur-2xl text-white font-medium shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    compact ? 'px-3.5 py-2 text-xs w-full' : 'px-4 py-2 text-xs lg:text-sm'
                }`}
            >
                <span className="truncate">{choice.label}</span>
                {isHeard && (
                    <span className="text-emerald-300 text-[11px] font-bold flex-shrink-0" title="Heard">
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

            {/* Minimal Top Header */}
            <header className="relative z-10 flex items-center justify-between gap-2 pb-2 flex-shrink-0">
                <button
                    type="button"
                    onClick={() => setNodeId('greet')}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 hover:border-cyan-400/40 transition cursor-pointer"
                >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                    <span className="text-xs font-bold text-cyan-300 tracking-wide">Ash</span>
                </button>

                <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-full">
                    {[
                        { label: 'Intro', to: 'greet' },
                        { label: 'Work', to: 'roles_ask' },
                        { label: 'Projects', to: 'projects_ask' },
                        { label: 'Resume', to: 'resume' },
                        { label: 'Contact', to: 'contact', highlight: true },
                    ].map((item) => (
                        <button
                            key={item.to}
                            type="button"
                            onClick={() => setNodeId(item.to)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                                item.highlight
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold'
                                    : nodeId === item.to
                                    ? 'bg-white/15 text-cyan-300 border border-cyan-400/30'
                                    : 'text-white/65 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </header>

            {/* Center Stage: Minimal Story Pill + Orb + Choices + Concise Subtitle */}
            <div className="relative z-10 my-auto py-2 flex flex-col items-center justify-center w-full">
                {/* Minimal Floating Story Badge */}
                {activeCard && (
                    <div
                        className={`mb-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r ${activeCard.accent} border ${activeCard.border} backdrop-blur-xl shadow-lg inline-flex items-center gap-2 transition-all duration-300`}
                    >
                        <span className="text-sm">{activeCard.icon}</span>
                        <span className="text-xs font-bold text-white">{activeCard.title}</span>
                        <span className="text-[10px] font-semibold text-cyan-300 px-2 py-0.5 rounded-full bg-black/35 border border-white/10">
                            {activeCard.tag}
                        </span>
                    </div>
                )}

                {isWideStage ? (
                    /* Wide Container Stage: Left Choice Pills + Center Orb + Right Choice Pills */
                    <div className="w-full max-w-3xl grid grid-cols-12 items-center gap-3">
                        <div className="col-span-4 flex flex-col items-end justify-center gap-2 pr-1">
                            {leftChoices.map((c) => renderChoicePill(c, false))}
                        </div>

                        <div className="col-span-4 flex flex-col items-center justify-center">
                            <div
                                onClick={(e) => {
                                    triggerPoke(e.clientX, e.clientY);
                                    if (phase === 'speaking') skipTyping();
                                    else speakText(parsed.text);
                                }}
                                title="Tap Ash"
                                className={`relative ${orbSizeClass} cursor-pointer flex items-center justify-center`}
                            >
                                <canvas
                                    ref={canvasRef}
                                    data-testid="orb-canvas"
                                    className="w-full h-full block"
                                />
                            </div>
                        </div>

                        <div className="col-span-4 flex flex-col items-start justify-center gap-2 pl-1">
                            {rightChoices.map((c) => renderChoicePill(c, false))}
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
                            title="Tap Ash"
                            className={`relative ${orbSizeClass} cursor-pointer flex items-center justify-center`}
                        >
                            <canvas
                                ref={canvasRef}
                                data-testid="orb-canvas"
                                className="w-full h-full block"
                            />
                        </div>
                    </div>
                )}

                {/* Concise Synchronized Typewriter Subtitle */}
                <p
                    data-testid="orby-line"
                    onClick={skipTyping}
                    className="mt-2 max-w-lg text-center text-xs sm:text-sm font-medium leading-relaxed px-3 cursor-pointer select-none"
                >
                    <span className="text-white">{parsed.text.slice(0, typedCount)}</span>
                    <span className="text-white/25">{parsed.text.slice(typedCount)}</span>
                </p>

                {/* Choice Pills Grid for Compact Ubuntu Windows & Android Screens */}
                {!isWideStage && (
                    <div
                        data-testid="orby-choices-compact"
                        className="mt-3 grid grid-cols-2 gap-2 w-full max-w-sm px-1"
                    >
                        {choices.map((c) => renderChoicePill(c, true))}
                    </div>
                )}
            </div>

            {/* Minimal Bottom Controls */}
            <footer className="relative z-10 pt-2 flex items-center justify-center gap-2 flex-shrink-0">
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
                    <span>{soundOn ? '🔊 Sound' : '🔇 Muted'}</span>
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

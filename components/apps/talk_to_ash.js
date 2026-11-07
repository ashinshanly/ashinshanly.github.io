import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Talk to Ash — Ashin Shanly's Interactive Voice AI Companion
 * - Studio-grade neural female voice (en-US-AvaMultilingualNeural MP3s in /audio/ash/*.mp3)
 * - Real-time Web Audio API FFT spectrum analyzer + 360° radial voice frequency halo
 * - Interactive 60fps liquid orb with elastic drag-and-slingshot physics, particle bursts,
 *   expressive eye moods (attentive, happy ^ ^, starry ✦ ✦, wink, and dizzy @ @ easter egg),
 *   and 4 switchable iridescent aura themes.
 */

const AURA_THEMES = [
    {
        id: 'cyan',
        label: 'Cyan Pearl',
        dot: '#38bdf8',
        coreMid: '#e0f7fe',
        coreActive: '#38bdf8',
        coreIdle: '#7dd3fc',
        coreOuter: '#6366f1',
        coreDeep: '#1e1b4b',
        aura1: '34, 211, 238',
        aura2: '168, 85, 247',
        glowClass1: 'bg-cyan-500/15',
        glowClass2: 'bg-indigo-500/15',
    },
    {
        id: 'mint',
        label: 'Aurora Mint',
        dot: '#34d399',
        coreMid: '#d1fae5',
        coreActive: '#34d399',
        coreIdle: '#6ee7b7',
        coreOuter: '#0d9488',
        coreDeep: '#064e3b',
        aura1: '52, 211, 153',
        aura2: '20, 184, 166',
        glowClass1: 'bg-emerald-500/15',
        glowClass2: 'bg-teal-500/15',
    },
    {
        id: 'rose',
        label: 'Sakura Rose',
        dot: '#f472b6',
        coreMid: '#fce7f3',
        coreActive: '#f472b6',
        coreIdle: '#f9a8d4',
        coreOuter: '#9333ea',
        coreDeep: '#3b0764',
        aura1: '244, 114, 182',
        aura2: '168, 85, 247',
        glowClass1: 'bg-pink-500/15',
        glowClass2: 'bg-purple-500/15',
    },
    {
        id: 'gold',
        label: 'Solar Gold',
        dot: '#fbbf24',
        coreMid: '#fef3c7',
        coreActive: '#fbbf24',
        coreIdle: '#fcd34d',
        coreOuter: '#ea580c',
        coreDeep: '#451a03',
        aura1: '251, 191, 36',
        aura2: '249, 115, 22',
        glowClass1: 'bg-amber-500/15',
        glowClass2: 'bg-orange-500/15',
    },
];

const DISCOVERY_CHAPTERS = [
    { id: 'role_google', title: 'Google' },
    { id: 'role_oracle', title: 'Oracle' },
    { id: 'role_tcs', title: 'TCS Research' },
    { id: 'role_iitgn', title: 'IIT Gandhinagar' },
    { id: 'project_lumina', title: 'Lumina' },
    { id: 'project_musicsync', title: 'MusicSync' },
    { id: 'project_guestbook', title: 'GuestBook' },
    { id: 'hobbies', title: 'Hobbies' },
];

const ASH_DIALOGUE_GRAPH = {
    greet: {
        id: 'greet',
        mood: 'happy',
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
        mood: 'starry',
        text: "[[card:google]]Ashin is a Software Engineer at Google and an [[card:iitgn]]IIT Gandhinagar medalist, previously building cloud AI at [[card:oracle]]Oracle.",
        choices: 'menu',
        tracksHeard: true,
    },
    intro_full: {
        id: 'intro_full',
        mood: 'happy',
        text: "[[card:iitgn]]Ashin won the Director's Silver Medal at IIT Gandhinagar, researched 3D vision at [[card:tcs]]TCS, scaled GenAI at [[card:oracle]]Oracle, and now engineers fleet intelligence at [[card:google]]Google.",
        choices: 'menu',
        tracksHeard: true,
    },
    menu_return: {
        id: 'menu_return',
        mood: 'attentive',
        text: 'What should we explore next?',
        choices: 'menu',
    },
    roles_ask: {
        id: 'roles_ask',
        mood: 'attentive',
        text: "Pick a chapter of Ashin's journey.",
        choices: 'roles',
    },
    roles_again: {
        id: 'roles_again',
        mood: 'attentive',
        text: 'Which role should we check out next?',
        choices: 'roles',
    },
    role_google: {
        id: 'role_google',
        mood: 'starry',
        text: "[[card:google]]At Google, Ashin builds distributed data platforms powering Alphabet's elastic compute fleet.",
        choices: 'after_role',
        tracksHeard: true,
    },
    role_oracle: {
        id: 'role_oracle',
        mood: 'attentive',
        text: '[[card:oracle]]At Oracle, he led petabyte-scale Delta Lake pipelines and built a GenAI RAG assistant automating 60% of support queries.',
        choices: 'after_role',
        tracksHeard: true,
    },
    role_tcs: {
        id: 'role_tcs',
        mood: 'attentive',
        text: '[[card:tcs]]At TCS Research, he fused 3D LiDAR point clouds with hyperspectral imagery, boosting tree segmentation by 18%.',
        choices: 'after_role',
        tracksHeard: true,
    },
    role_iitgn: {
        id: 'role_iitgn',
        mood: 'happy',
        text: "[[card:iitgn]]At IIT Gandhinagar, he graduated with a 9.0 CGPA and the Director's Silver Medal, accelerating 3D neural training by 21%.",
        choices: 'after_role',
        tracksHeard: true,
    },
    projects_ask: {
        id: 'projects_ask',
        mood: 'starry',
        text: 'From deep learning papers to interactive web apps — pick one to explore.',
        choices: 'projects',
    },
    projects_again: {
        id: 'projects_again',
        mood: 'attentive',
        text: 'Which project should we look at next?',
        choices: 'projects',
    },
    project_inr: {
        id: 'project_inr',
        mood: 'starry',
        text: '[[card:inr]]His split-encoder 3D neural architecture speeds up scene training by 21% without losing visual fidelity.',
        choices: 'after_project',
        projectUrl: 'https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en',
        tracksHeard: true,
    },
    project_sgcn: {
        id: 'project_sgcn',
        mood: 'attentive',
        text: '[[card:sgcn]]Published at ACM CODS-COMAD, his Siamese Graph Network generates rich semantic image captions.',
        choices: 'after_project',
        projectUrl: 'https://scholar.google.com/citations?user=Grl9bo0AAAAJ&hl=en',
        tracksHeard: true,
    },
    project_lumina: {
        id: 'project_lumina',
        mood: 'starry',
        text: '[[card:lumina]]Lumina is a minimal cosmic rhythm-memory game with pulsar constellations and ambient synthesis.',
        choices: 'after_project',
        projectUrl: 'https://ashinshanly.github.io/lumina/',
        tracksHeard: true,
    },
    project_musicsync: {
        id: 'project_musicsync',
        mood: 'happy',
        text: '[[card:musicsync]]MusicSync synchronizes audio playback across multiple phones and laptops in real time.',
        choices: 'after_project',
        projectUrl: 'https://ashinshanly.github.io/musicsync/',
        tracksHeard: true,
    },
    project_guestbook: {
        id: 'project_guestbook',
        mood: 'starry',
        text: '[[card:guestbook]]GuestBook is a live 64 by 64 neon pixel matrix where every cell plays a musical note.',
        choices: 'after_project',
        appId: 'pixel-hud',
        tracksHeard: true,
    },
    hobbies: {
        id: 'hobbies',
        mood: 'wink',
        text: '[[card:hobbies]]Off the clock, Ashin plays competitive badminton, watches anime, and swing-trades the markets.',
        choices: 'menu',
        tracksHeard: true,
    },
    resume: {
        id: 'resume',
        mood: 'happy',
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
        mood: 'happy',
        text: 'Reach out via the Contact app, LinkedIn, or email.',
        choices: [
            { id: 'open_gedit', label: 'Contact App', appId: 'gedit' },
            { id: 'linkedin', label: 'LinkedIn ↗', link: 'https://www.linkedin.com/in/ashinshanly/' },
            { id: 'email', label: 'Email ↗', link: 'mailto:ashinkoottala@gmail.com' },
            { id: 'something_else', label: '↩ Back', to: 'menu_return' },
        ],
        tracksHeard: true,
    },
    dizzy: {
        id: 'dizzy',
        mood: 'dizzy',
        text: "Whoa, easy there! You're making my circuits spin!",
        choices: 'menu',
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

function selectModernFemaleVoice(voices) {
    if (!voices || !voices.length) return null;
    const enVoices = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
    const pool = enVoices.length ? enVoices : voices;

    const scoreVoice = (v) => {
        const name = v.name || '';
        if (/(Alex|Daniel|Fred|Aaron|Arthur|Oliver|Rishi|Tom|David|Mark|Guy|Christopher|Eric|Steffan|Roger|Brian|George|\bMale\b)/i.test(name)) {
            return -100;
        }
        let s = 0;
        if (/(Ava|Aria|Jenny|Sonia|Emma|Michelle|Libby).*(Natural|Online|Neural)/i.test(name)) s += 130;
        if (/Google UK English Female/i.test(name)) s += 125;
        if (/Google US English/i.test(name)) s += 118;
        if (/(Ava|Zoe|Allison|Serena|Samantha|Karen|Moira).*(Premium|Enhanced)/i.test(name)) s += 115;
        if (/(Natural|Neural|Premium|Enhanced)/i.test(name)) s += 45;
        if (/\b(Ava|Zoe|Allison|Serena)\b/i.test(name)) s += 75;
        if (/\b(Samantha|Moira|Karen|Tessa|Victoria|Martha|Nicky|Aria|Jenny|Sonia)\b/i.test(name)) s += 65;
        if (/Female/i.test(name)) s += 40;
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
    const [voiceRate, setVoiceRate] = useState(1.0); // 1.0 or 1.15
    const [themeIdx, setThemeIdx] = useState(0);
    const [heardNodes, setHeardNodes] = useState([]);
    const [activeCard, setActiveCard] = useState(null);
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const pointerRef = useRef({ x: 0, y: 0, active: false });
    const lookTargetRef = useRef(null);
    const pokeRef = useRef({ x: 0, y: 0, t: 999 });
    const pokeTimesRef = useRef([]);
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0, vx: 0, vy: 0 });
    const particlesRef = useRef([]);
    const voiceLevelRef = useRef(0);
    const freqBinsRef = useRef(new Uint8Array(32));
    const typeTimerRef = useRef(null);
    const animFrameRef = useRef(null);
    const blinkRef = useRef({ nextBlink: 2.2, blinkEnd: 0 });
    const preferredVoiceRef = useRef(null);

    // Neural HTMLAudioElement + Web Audio API AnalyserNode refs
    const audioElRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const mediaSourceConnectedRef = useRef(false);

    const activeTheme = AURA_THEMES[themeIdx] || AURA_THEMES[0];
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

    // Preload fallback SpeechSynthesis female voice
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const updateVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            const chosen = selectModernFemaleVoice(voices);
            if (chosen) preferredVoiceRef.current = chosen;
        };
        updateVoice();
        window.speechSynthesis.addEventListener?.('voiceschanged', updateVoice);
        return () => {
            window.speechSynthesis.removeEventListener?.('voiceschanged', updateVoice);
        };
    }, []);

    // Subtle Web Audio harmonic crystal chime for tactile interactions
    const playCrystalChime = useCallback(
        (freq = 587.33, dur = 0.14) => {
            if (!soundOn || typeof window === 'undefined') return;
            try {
                const AudioCtor = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtor) return;
                if (!audioCtxRef.current) {
                    audioCtxRef.current = new AudioCtor();
                }
                const actx = audioCtxRef.current;
                if (actx.state === 'suspended') actx.resume();

                const now = actx.currentTime;
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + dur);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.035, now + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(now);
                osc.stop(now + dur + 0.02);
            } catch {
                // Ignore audio context restrictions
            }
        },
        [soundOn]
    );

    // Spawn luminous interactive particles around the orb
    const spawnOrbParticles = useCallback(
        (count = 14) => {
            const color = activeTheme.dot;
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
                const speed = 1.6 + Math.random() * 2.8;
                particlesRef.current.push({
                    x: 0,
                    y: 0,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    r: 2 + Math.random() * 2.5,
                    life: 1,
                    color: i % 2 === 0 ? color : '#ffffff',
                });
            }
        },
        [activeTheme.dot]
    );

    // Resolve choices for current node
    const resolveChoices = useCallback((node) => {
        if (!node) return [];
        const raw = typeof node.choices === 'string' ? CHOICE_SETS[node.choices] || [] : node.choices || [];
        return raw.filter((c) => {
            if (c.action === 'visit' && !node.projectUrl && !node.appId) return false;
            return true;
        });
    }, []);

    // Fallback Web Speech API synthesizer (used only if MP3 playback fails)
    const speakFallbackWebSpeech = useCallback(
        (cleanText) => {
            if (typeof window === 'undefined' || !('speechSynthesis' in window) || !soundOn) return;
            try {
                window.speechSynthesis.cancel();
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
                utter.rate = 0.96 * voiceRate;
                utter.pitch = 1.03;
                utter.volume = 0.95;
                utter.onboundary = () => {
                    voiceLevelRef.current = 0.65 + Math.random() * 0.35;
                };
                utter.onend = () => {
                    voiceLevelRef.current = 0;
                };
                window.speechSynthesis.speak(utter);
            } catch {
                // Ignore
            }
        },
        [soundOn, voiceRate]
    );

    // Primary Studio Neural Voice Player (/audio/ash/<nodeId>.mp3 + Web Audio FFT Analyser)
    const speakText = useCallback(
        (cleanText, targetNodeId = nodeId) => {
            if (typeof window === 'undefined') return;
            try {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
                if (audioElRef.current) {
                    audioElRef.current.pause();
                }
                if (!soundOn) {
                    voiceLevelRef.current = 0;
                    return;
                }

                if (!audioElRef.current) {
                    const audio = new Audio();
                    audio.preload = 'auto';
                    audioElRef.current = audio;
                }

                const audio = audioElRef.current;
                audio.src = `./audio/ash/${targetNodeId}.mp3`;
                audio.playbackRate = voiceRate;
                audio.currentTime = 0;

                // Connect Web Audio API AnalyserNode once for real-time FFT voice reactivity
                if (!mediaSourceConnectedRef.current) {
                    const AudioCtor = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtor) {
                        if (!audioCtxRef.current) {
                            audioCtxRef.current = new AudioCtor();
                        }
                        const actx = audioCtxRef.current;
                        const analyser = actx.createAnalyser();
                        analyser.fftSize = 64;
                        analyser.smoothingTimeConstant = 0.78;
                        const source = actx.createMediaElementSource(audio);
                        source.connect(analyser);
                        analyser.connect(actx.destination);
                        analyserRef.current = analyser;
                        mediaSourceConnectedRef.current = true;
                    }
                }

                if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                    audioCtxRef.current.resume().catch(() => {});
                }

                audio.onended = () => {
                    voiceLevelRef.current = 0;
                };

                const playPromise = audio.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {
                        speakFallbackWebSpeech(cleanText);
                    });
                }
            } catch {
                speakFallbackWebSpeech(cleanText);
            }
        },
        [nodeId, soundOn, voiceRate, speakFallbackWebSpeech]
    );

    // Cleanup all timers & audio on unmount
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (audioElRef.current) {
                audioElRef.current.pause();
                audioElRef.current.src = '';
            }
            if (typeTimerRef.current) clearInterval(typeTimerRef.current);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // Start typing + neural speech whenever nodeId changes
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

        speakText(text, node.id);

        if (typeTimerRef.current) clearInterval(typeTimerRef.current);
        let idx = 0;
        typeTimerRef.current = setInterval(() => {
            idx += 1;
            setTypedCount(idx);
            voiceLevelRef.current = Math.max(
                voiceLevelRef.current * 0.85,
                0.32 + Math.sin(idx * 0.55) * 0.22 + Math.random() * 0.18
            );

            for (const cue of cues) {
                if (idx >= cue.charIndex && STORY_CARDS[cue.cardId]) {
                    setActiveCard(STORY_CARDS[cue.cardId]);
                }
            }

            if (idx >= text.length) {
                clearInterval(typeTimerRef.current);
                typeTimerRef.current = null;
                setPhase('choosing');
            }
        }, Math.round(26 / voiceRate));

        return () => {
            if (typeTimerRef.current) {
                clearInterval(typeTimerRef.current);
                typeTimerRef.current = null;
            }
        };
    }, [nodeId, speakText, voiceRate]);

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
        voiceLevelRef.current = 0.8;
        spawnOrbParticles(12);

        // Track rapid pokes for the Dizzy Easter Egg (4 pokes within 2.2s)
        const now = performance.now();
        pokeTimesRef.current = [...pokeTimesRef.current.filter((t) => now - t < 2200), now];
        if (pokeTimesRef.current.length >= 4 && nodeId !== 'dizzy') {
            pokeTimesRef.current = [];
            playCrystalChime(783.99, 0.22);
            setNodeId('dizzy');
        } else {
            playCrystalChime(523.25, 0.12);
        }
    };

    const handleChoice = (choice, e) => {
        if (e) {
            pokeRef.current = { x: e.clientX || 0, y: e.clientY || 0, t: 0 };
            spawnOrbParticles(10);
            playCrystalChime(659.25, 0.12);
        }

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

    // 60fps Canvas Interactive Orb Renderer (Real-Time FFT Halo + Elastic Slingshot + Mood Eyes + Particles)
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

            // Sample real-time Web Audio API FFT spectrum if neural audio is playing
            let fftEnergy = 0;
            if (analyserRef.current && audioElRef.current && !audioElRef.current.paused) {
                analyserRef.current.getByteFrequencyData(freqBinsRef.current);
                let sum = 0;
                const bins = freqBinsRef.current;
                for (let i = 1; i < 18; i++) sum += bins[i];
                fftEnergy = Math.min(1, sum / (17 * 175));
                voiceLevelRef.current = Math.max(voiceLevelRef.current * 0.7, fftEnergy);
            } else if (phase === 'speaking' && voiceLevelRef.current > 0.1) {
                voiceLevelRef.current *= 0.92;
            } else {
                voiceLevelRef.current *= 0.85;
            }

            smoothedVoice += (voiceLevelRef.current - smoothedVoice) * 0.22;

            // Elastic drag & spring-back physics
            const drag = dragRef.current;
            if (!drag.isDragging) {
                const springX = -drag.offsetX * 0.18;
                const springY = -drag.offsetY * 0.18;
                drag.vx = (drag.vx + springX) * 0.82;
                drag.vy = (drag.vy + springY) * 0.82;
                drag.offsetX += drag.vx;
                drag.offsetY += drag.vy;
            }

            // Poke spring decay
            pokeRef.current.t += 0.016;
            const pokeEnvelope =
                pokeRef.current.t < 0.65
                    ? Math.sin(pokeRef.current.t * 22) * Math.exp(-pokeRef.current.t * 6) * 8
                    : 0;

            const floatY = Math.sin(t * 1.7) * 4.5;
            const cx = W / 2 + drag.offsetX;
            const cy = H / 2 + floatY + drag.offsetY;
            const baseR = Math.min(W, H) * 0.33;
            const R = baseR * (1 + smoothedVoice * 0.11) + pokeEnvelope;

            // Elastic tether line when dragging Ash away from center
            if (Math.hypot(drag.offsetX, drag.offsetY) > 4) {
                ctx.save();
                ctx.strokeStyle = `rgba(${activeTheme.aura1}, 0.35)`;
                ctx.lineWidth = 2;
                ctx.setLineDash([3, 5]);
                ctx.beginPath();
                ctx.moveTo(W / 2, H / 2);
                ctx.lineTo(cx, cy);
                ctx.stroke();
                ctx.restore();
            }

            // Outer ambient voice aura
            const auraGrad = ctx.createRadialGradient(cx, cy, R * 0.28, cx, cy, R * 1.48);
            auraGrad.addColorStop(0, `rgba(${activeTheme.aura1}, ${0.3 + smoothedVoice * 0.38})`);
            auraGrad.addColorStop(0.55, `rgba(${activeTheme.aura2}, ${0.15 + smoothedVoice * 0.22})`);
            auraGrad.addColorStop(1, 'rgba(8, 12, 24, 0)');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, R * 1.48, 0, Math.PI * 2);
            ctx.fill();

            // 360° Radial Audio Frequency Halo (bars dance when Ash speaks)
            if (smoothedVoice > 0.03) {
                ctx.save();
                const barCount = 28;
                const bins = freqBinsRef.current;
                ctx.strokeStyle = activeTheme.dot;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                for (let i = 0; i < barCount; i++) {
                    const angle = (i / barCount) * Math.PI * 2 + t * 0.35;
                    const binVal = bins[i % 16] / 255;
                    const wave =
                        binVal > 0.02
                            ? binVal
                            : smoothedVoice * (0.45 + 0.55 * Math.abs(Math.sin(angle * 3 + t * 6)));
                    const innerR = R * 1.08;
                    const outerR = innerR + wave * (R * 0.28);
                    ctx.globalAlpha = 0.2 + wave * 0.55;
                    ctx.beginPath();
                    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
                    ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
                    ctx.stroke();
                }
                ctx.restore();
            }

            // Floor contact shadow below the orb
            ctx.save();
            ctx.translate(W / 2 + drag.offsetX * 0.4, H * 0.89);
            ctx.scale(1 - floatY * 0.015, 0.22);
            const shadowGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, baseR * 0.88);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
            shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.arc(0, 0, baseR * 0.88, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Morphing organic liquid sphere path
            ctx.save();
            ctx.beginPath();
            const steps = 68;
            for (let i = 0; i <= steps; i++) {
                const angle = (i / steps) * Math.PI * 2;
                const wave1 = Math.sin(angle * 3 + t * 2.5) * (1.4 + smoothedVoice * 5.2);
                const wave2 = Math.cos(angle * 5 - t * 3.2) * (0.7 + smoothedVoice * 3.2);
                const r = R + wave1 + wave2;
                const px = cx + Math.cos(angle) * r;
                const py = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Theme-reactive iridescent sphere fill
            const sphereGrad = ctx.createRadialGradient(
                cx - R * 0.32,
                cy - R * 0.35,
                R * 0.08,
                cx + R * 0.1,
                cy + R * 0.15,
                R * 1.08
            );
            sphereGrad.addColorStop(0, '#ffffff');
            sphereGrad.addColorStop(0.28, activeTheme.coreMid);
            sphereGrad.addColorStop(0.62, smoothedVoice > 0.14 ? activeTheme.coreActive : activeTheme.coreIdle);
            sphereGrad.addColorStop(0.88, activeTheme.coreOuter);
            sphereGrad.addColorStop(1, activeTheme.coreDeep);
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

            // Compute eye gaze target (tracks hovered pill or cursor)
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
            lookX += (targetX - lookX) * 0.14;
            lookY += (targetY - lookY) * 0.14;

            // Natural blink cycle
            if (t > blinkRef.current.nextBlink) {
                blinkRef.current.blinkEnd = t + 0.14;
                blinkRef.current.nextBlink = t + 2.6 + Math.random() * 3.4;
            }
            const isBlinking = t < blinkRef.current.blinkEnd;
            const eyeScaleY = (isBlinking ? 0.12 : 1) * (1 - smoothedVoice * 0.15);

            // Draw Ash's expressive eyes based on current mood
            const mood = currentNode.mood || 'attentive';
            const eyeSpacing = R * 0.34;
            const eyeW = Math.max(6, R * 0.14);
            const eyeH = Math.max(11, R * 0.24) * eyeScaleY;
            const eyeY = cy - R * 0.04 + lookY;

            [-1, 1].forEach((dir, idx) => {
                const ex = cx + dir * eyeSpacing + lookX;
                ctx.save();
                ctx.fillStyle = '#0f172a';
                ctx.strokeStyle = '#0f172a';

                if (mood === 'dizzy') {
                    // Spinning dizzy spiral/cross eyes
                    ctx.translate(ex, eyeY);
                    ctx.rotate(t * 6 * dir);
                    ctx.lineWidth = 2.6;
                    ctx.beginPath();
                    ctx.arc(0, 0, eyeW * 0.72, 0, Math.PI * 1.55);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.arc(0, 0, eyeW * 0.28, 0, Math.PI * 2);
                    ctx.fill();
                } else if (mood === 'happy' && !isBlinking && phase === 'choosing') {
                    // Happy curved arc eyes (^ ^)
                    ctx.lineWidth = Math.max(2.6, eyeW * 0.34);
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.arc(ex, eyeY + eyeW * 0.25, eyeW * 0.65, Math.PI * 1.12, Math.PI * 1.88);
                    ctx.stroke();
                } else if (mood === 'wink' && idx === 1 && !isBlinking) {
                    // Playful right-eye wink (^ •)
                    ctx.lineWidth = Math.max(2.6, eyeW * 0.34);
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    ctx.arc(ex, eyeY + eyeW * 0.2, eyeW * 0.62, Math.PI * 1.12, Math.PI * 1.88);
                    ctx.stroke();
                } else {
                    // Pill-shaped eye
                    const rx = eyeW / 2;
                    const ry = Math.max(2, eyeH / 2);
                    ctx.beginPath();
                    ctx.roundRect(ex - rx, eyeY - ry, eyeW, Math.max(4, eyeH), rx);
                    ctx.fill();

                    if (!isBlinking && eyeH > 6) {
                        if (mood === 'starry') {
                            // 4-point sparkle highlight inside starry eyes
                            ctx.fillStyle = '#ffffff';
                            const sx = ex - rx * 0.15;
                            const sy = eyeY - ry * 0.3;
                            const sr = Math.max(2.5, rx * 0.48);
                            ctx.beginPath();
                            ctx.moveTo(sx, sy - sr);
                            ctx.quadraticCurveTo(sx, sy, sx + sr, sy);
                            ctx.quadraticCurveTo(sx, sy, sx, sy + sr);
                            ctx.quadraticCurveTo(sx, sy, sx - sr, sy);
                            ctx.quadraticCurveTo(sx, sy, sx, sy - sr);
                            ctx.fill();
                        } else {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
                            ctx.beginPath();
                            ctx.arc(ex - rx * 0.25, eyeY - ry * 0.35, Math.max(1.5, rx * 0.28), 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
                ctx.restore();
            });

            // Rosy/cyan cheek blush when happy or wink
            if (mood === 'happy' || mood === 'wink') {
                [-1, 1].forEach((dir) => {
                    ctx.save();
                    ctx.fillStyle = 'rgba(244, 114, 182, 0.28)';
                    ctx.beginPath();
                    ctx.ellipse(
                        cx + dir * (eyeSpacing * 1.35) + lookX * 0.7,
                        eyeY + R * 0.16,
                        R * 0.09,
                        R * 0.045,
                        0,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                    ctx.restore();
                });
            }

            // Interactive burst particles
            const parts = particlesRef.current;
            for (let i = parts.length - 1; i >= 0; i--) {
                const p = parts[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96;
                p.vy *= 0.96;
                p.life -= 0.028;
                if (p.life <= 0) {
                    parts.splice(i, 1);
                    continue;
                }
                ctx.save();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(cx + p.x, cy + p.y, p.r * p.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            ctx.restore();
            animFrameRef.current = requestAnimationFrame(renderFrame);
        };

        animFrameRef.current = requestAnimationFrame(renderFrame);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [phase, activeTheme, currentNode.mood]);

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
                    playCrystalChime(880, 0.06);
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
                    <span className="text-emerald-300 text-[11px] font-bold flex-shrink-0" title="Visited">
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

    const handleOrbPointerDown = (e) => {
        const drag = dragRef.current;
        drag.isDragging = true;
        drag.startX = e.clientX - drag.offsetX;
        drag.startY = e.clientY - drag.offsetY;
    };

    const handleGlobalPointerMove = (e) => {
        pointerRef.current = { x: e.clientX, y: e.clientY, active: true };
        const drag = dragRef.current;
        if (drag.isDragging) {
            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;
            const dist = Math.hypot(dx, dy);
            const maxPull = 56;
            const scale = dist > maxPull ? maxPull / dist : 1;
            drag.offsetX = dx * scale;
            drag.offsetY = dy * scale;
        }
    };

    const handleGlobalPointerUp = (e) => {
        const drag = dragRef.current;
        if (!drag.isDragging) return;
        const pulledDist = Math.hypot(drag.offsetX, drag.offsetY);
        drag.isDragging = false;
        if (pulledDist > 12) {
            spawnOrbParticles(16);
            playCrystalChime(698.46, 0.16);
        } else {
            triggerPoke(e.clientX, e.clientY);
            if (phase === 'speaking') skipTyping();
            else speakText(parsed.text, currentNode.id);
        }
    };

    return (
        <div
            ref={containerRef}
            id="talk-to-ash-app"
            onPointerMove={handleGlobalPointerMove}
            onPointerUp={handleGlobalPointerUp}
            onPointerLeave={() => {
                pointerRef.current.active = false;
                dragRef.current.isDragging = false;
            }}
            className="relative w-full h-full min-h-full bg-[#070B14] text-white flex flex-col justify-between p-3 sm:p-5 md:p-6 select-none overflow-y-auto overflow-x-hidden"
        >
            {/* Ambient background glow matching active aura theme */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div
                    className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full ${activeTheme.glowClass1} blur-[95px] transition-colors duration-700`}
                />
                <div
                    className={`absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full ${activeTheme.glowClass2} blur-[95px] transition-colors duration-700`}
                />
            </div>

            {/* Minimal Top Header + Constellation Discovery Dots */}
            <header className="relative z-10 flex items-center justify-between gap-2 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setNodeId('greet')}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 hover:border-cyan-400/40 transition cursor-pointer"
                    >
                        <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: activeTheme.dot, boxShadow: `0 0 8px ${activeTheme.dot}` }}
                        />
                        <span className="text-xs font-bold text-white tracking-wide">Ash</span>
                    </button>

                    {/* 8-Dot Constellation Discovery Tracker */}
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10">
                        {DISCOVERY_CHAPTERS.map((ch) => {
                            const unlocked = heardNodes.includes(ch.id);
                            const active = nodeId === ch.id;
                            return (
                                <button
                                    key={ch.id}
                                    type="button"
                                    title={ch.title}
                                    onClick={() => setNodeId(ch.id)}
                                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                        active
                                            ? 'scale-125 bg-cyan-300 shadow-[0_0_8px_#67e8f9]'
                                            : unlocked
                                            ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                                            : 'bg-white/20 hover:bg-white/45'
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>

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

            {/* Center Stage: Minimal Story Pill + Interactive Liquid Orb + Choices + Concise Subtitle */}
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
                                onPointerDown={handleOrbPointerDown}
                                title="Drag, pet, or tap Ash"
                                className={`relative ${orbSizeClass} cursor-grab active:cursor-grabbing flex items-center justify-center touch-none`}
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
                            onPointerDown={handleOrbPointerDown}
                            title="Drag, pet, or tap Ash"
                            className={`relative ${orbSizeClass} cursor-grab active:cursor-grabbing flex items-center justify-center touch-none`}
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

            {/* Minimal Bottom Controls: Sound + Replay + Speed + 4 Aura Theme Dots */}
            <footer className="relative z-10 pt-2 flex items-center justify-between gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        data-testid="sound-toggle"
                        onClick={() => {
                            const next = !soundOn;
                            setSoundOn(next);
                            if (!next) {
                                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                                    window.speechSynthesis.cancel();
                                }
                                if (audioElRef.current) {
                                    audioElRef.current.pause();
                                }
                                voiceLevelRef.current = 0;
                            } else {
                                speakText(parsed.text, currentNode.id);
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
                            speakText(text, currentNode.id);
                        }}
                        className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/15 border border-white/15 text-white/85 transition cursor-pointer"
                    >
                        ↻ Replay
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const nextRate = voiceRate === 1.0 ? 1.15 : 1.0;
                            setVoiceRate(nextRate);
                            if (audioElRef.current) {
                                audioElRef.current.playbackRate = nextRate;
                            }
                        }}
                        title="Voice speed"
                        className="px-2.5 py-1.5 rounded-full text-[11px] font-mono bg-white/[0.06] hover:bg-white/15 border border-white/10 text-white/75 transition cursor-pointer"
                    >
                        {voiceRate === 1.0 ? '1×' : '1.15×'}
                    </button>
                </div>

                {/* Zero-Text Aura Shader Switcher Dots */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10">
                    {AURA_THEMES.map((theme, idx) => (
                        <button
                            key={theme.id}
                            type="button"
                            title={theme.label}
                            onClick={() => {
                                setThemeIdx(idx);
                                spawnOrbParticles(14);
                                playCrystalChime(523.25 + idx * 90, 0.14);
                            }}
                            className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                                themeIdx === idx ? 'scale-125 ring-2 ring-white/80' : 'opacity-65 hover:opacity-100 hover:scale-110'
                            }`}
                            style={{ backgroundColor: theme.dot }}
                        />
                    ))}
                </div>
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

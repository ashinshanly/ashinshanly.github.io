import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { db } from '../../config/firebase';
import { ref, onValue, set } from 'firebase/database';

const STORAGE_KEY = 'cosmic_guestbook_stars_v3';
const AUTHOR_KEY = 'cosmic_guestbook_author_v2';

const VIBE_ROLES = [
    {
        id: 'dev',
        label: 'Developer',
        color: '#38bdf8',
        glow: '56, 189, 248',
        badgeBg: 'bg-sky-500/15 border-sky-400/35 text-sky-300',
        activePill: 'bg-sky-500 text-slate-950 border-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.45)]',
        chord: [523.25, 659.25, 783.99, 1046.5], // C5 Maj7
    },
    {
        id: 'recruiter',
        label: 'Recruiter',
        color: '#34d399',
        glow: '52, 211, 153',
        badgeBg: 'bg-emerald-500/15 border-emerald-400/35 text-emerald-300',
        activePill: 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.45)]',
        chord: [587.33, 739.99, 880.0, 1174.66], // D5 Maj
    },
    {
        id: 'friend',
        label: 'Friend',
        color: '#f472b6',
        glow: '244, 114, 182',
        badgeBg: 'bg-pink-500/15 border-pink-400/35 text-pink-300',
        activePill: 'bg-pink-500 text-slate-950 border-pink-400 shadow-[0_0_14px_rgba(244,114,182,0.45)]',
        chord: [659.25, 830.61, 987.77, 1318.51], // E5 Maj
    },
    {
        id: 'explorer',
        label: 'Explorer',
        color: '#fbbf24',
        glow: '251, 191, 36',
        badgeBg: 'bg-amber-500/15 border-amber-400/35 text-amber-300',
        activePill: 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.45)]',
        chord: [440.0, 554.37, 659.25, 880.0], // A4 Maj
    },
];

const FALLBACK_STAR = [
    {
        id: 'tx_1787422039621_qbryo',
        name: 'Ashin',
        role: 'dev',
        message: 'Hey, thanks for visiting :)',
        x: 0.5,
        y: 0.45,
        timestamp: 1787422039621,
    },
];

function getRoleMeta(roleId) {
    return VIBE_ROLES.find((r) => r.id === roleId) || VIBE_ROLES[0];
}

function formatTimeAgo(ts) {
    if (!ts) return 'Just now';
    const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
}

// Deterministic pseudo-random position in [0.16..0.84, 0.18..0.72] from string ID
function hashCoords(idStr) {
    let h1 = 2166136261;
    let h2 = 16777619;
    const str = String(idStr || 'star');
    for (let i = 0; i < str.length; i++) {
        h1 ^= str.charCodeAt(i);
        h1 = Math.imul(h1, 16777619);
        h2 ^= str.charCodeAt(i) * (i + 1);
        h2 = Math.imul(h2, 2166136261);
    }
    const nx = 0.15 + (Math.abs(h1) % 700) / 1000;
    const ny = 0.18 + (Math.abs(h2) % 540) / 1000;
    return { x: nx, y: ny };
}

function normalizeStarItem(raw, fallbackKey) {
    if (!raw || typeof raw !== 'object') return null;
    const rawMsg = String(raw.text || raw.message || raw.m || '').trim();
    if (!rawMsg || /^broadcast transmission$/i.test(rawMsg) || /placed \d+-pixel/i.test(rawMsg)) {
        return null;
    }

    const rawHandle = String(raw.handle || raw.name || raw.author || raw.a || 'Explorer')
        .replace(/^@/, '')
        .trim();
    const id = String(raw.id || fallbackKey || `star_${raw.timestamp || Date.now()}`);

    // Extract role from raw.role or prefix tag if encoded as "[Role] message"
    let role = raw.role || 'explorer';
    let cleanMessage = rawMsg;
    const roleMatch = rawMsg.match(/^\[(dev|recruiter|friend|explorer)\]\s*(.+)$/i);
    if (roleMatch) {
        role = roleMatch[1].toLowerCase();
        cleanMessage = roleMatch[2];
    } else if (!VIBE_ROLES.some((r) => r.id === role)) {
        if (raw.color === '#38bdf8' || raw.color === '#00f0ff') role = 'dev';
        else if (raw.color === '#34d399' || raw.color === '#00ff66') role = 'recruiter';
        else if (raw.color === '#f472b6' || raw.color === '#ff007f') role = 'friend';
        else role = 'explorer';
    }

    const fallbackPos = hashCoords(id);
    const nx =
        typeof raw.nx === 'number' && raw.nx >= 0.1 && raw.nx <= 0.9
            ? raw.nx
            : typeof raw.x === 'number' && raw.x > 0 && raw.x < 1
            ? raw.x
            : typeof raw.x === 'number' && raw.x >= 1 && raw.x <= 63
            ? Number((0.16 + (raw.x / 63) * 0.68).toFixed(3))
            : fallbackPos.x;
    const ny =
        typeof raw.ny === 'number' && raw.ny >= 0.1 && raw.ny <= 0.85
            ? raw.ny
            : typeof raw.y === 'number' && raw.y > 0 && raw.y < 1
            ? raw.y
            : typeof raw.y === 'number' && raw.y >= 1 && raw.y <= 63
            ? Number((0.18 + (raw.y / 63) * 0.52).toFixed(3))
            : fallbackPos.y;

    return {
        id,
        name: (rawHandle || 'Explorer').slice(0, 24),
        role,
        message: cleanMessage.slice(0, 140),
        x: nx,
        y: ny,
        timestamp: typeof raw.timestamp === 'number' ? raw.timestamp : Date.now(),
    };
}

export function PixelHud() {
    const [stars, setStars] = useState(FALLBACK_STAR);
    const [selectedStarId, setSelectedStarId] = useState(FALLBACK_STAR[0].id);
    const [hoveredStarId, setHoveredStarId] = useState(null);
    const [filterRole, setFilterRole] = useState('all');
    const [viewMode, setViewMode] = useState('sky'); // 'sky' | 'wall'
    const [soundOn, setSoundOn] = useState(true);

    // Simple 1-bar composer state
    const [authorName, setAuthorName] = useState('');
    const [selectedRole, setSelectedRole] = useState('dev');
    const [noteText, setNoteText] = useState('');
    const [launchBanner, setLaunchBanner] = useState(null);

    const canvasRef = useRef(null);
    const stageRef = useRef(null);
    const audioCtxRef = useRef(null);
    const screenPositionsRef = useRef([]);
    const ripplesRef = useRef([]);
    const shootingStarsRef = useRef([]);
    const bgStarsRef = useRef([]);

    // Initialize ambient background dust stars once
    useEffect(() => {
        const dust = [];
        for (let i = 0; i < 65; i++) {
            dust.push({
                x: Math.random(),
                y: Math.random(),
                r: 0.6 + Math.random() * 1.3,
                alpha: 0.15 + Math.random() * 0.45,
                phase: Math.random() * Math.PI * 2,
                speed: 0.6 + Math.random() * 1.4,
            });
        }
        bgStarsRef.current = dust;

        try {
            const savedAuthor = localStorage.getItem(AUTHOR_KEY);
            if (savedAuthor) setAuthorName(savedAuthor);

            const cachedRaw = localStorage.getItem(STORAGE_KEY);
            if (cachedRaw) {
                const parsed = JSON.parse(cachedRaw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setStars(parsed);
                    setSelectedStarId(parsed[0].id);
                }
            }
        } catch {
            // Ignore storage errors
        }
    }, []);

    // Subscribe to live Firebase guestbook entries
    useEffect(() => {
        if (!db) return;
        let unsub = null;
        try {
            const txRef = ref(db, 'pixel_hud/transmissions');
            unsub = onValue(
                txRef,
                (snapshot) => {
                    const val = snapshot.val();
                    const remoteList = [];
                    if (val && typeof val === 'object') {
                        Object.entries(val).forEach(([key, item]) => {
                            const norm = normalizeStarItem(item, key);
                            if (norm) remoteList.push(norm);
                        });
                    }
                    remoteList.sort((a, b) => b.timestamp - a.timestamp);
                    const finalStars = remoteList.length > 0 ? remoteList.slice(0, 50) : FALLBACK_STAR;

                    setStars(finalStars);
                    setSelectedStarId((prevId) =>
                        finalStars.some((s) => s.id === prevId) ? prevId : finalStars[0].id
                    );
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalStars));
                    } catch {
                        // Ignore
                    }
                },
                () => {
                    // Keep seed + local stars if offline
                }
            );
        } catch {
            // Ignore
        }
        return () => {
            if (typeof unsub === 'function') unsub();
        };
    }, []);

    // Subtle Web Audio harmonic chime synthesizer
    const playHarmonicChime = useCallback(
        (frequencies = [523.25, 659.25, 783.99], isArpeggio = false) => {
            if (!soundOn || typeof window === 'undefined') return;
            try {
                const AudioCtor = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtor) return;
                if (!audioCtxRef.current) {
                    audioCtxRef.current = new AudioCtor();
                }
                const ctx = audioCtxRef.current;
                if (ctx.state === 'suspended') ctx.resume();

                const notes = isArpeggio ? frequencies : [frequencies[0], frequencies[2] || frequencies[0] * 1.25];
                notes.forEach((freq, idx) => {
                    const start = ctx.currentTime + (isArpeggio ? idx * 0.065 : idx * 0.03);
                    const dur = isArpeggio ? 0.42 : 0.22;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, start);

                    gain.gain.setValueAtTime(0.0001, start);
                    gain.gain.exponentialRampToValueAtTime(isArpeggio ? 0.045 : 0.03, start + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(start);
                    osc.stop(start + dur + 0.02);
                });
            } catch {
                // Ignore audio context restrictions
            }
        },
        [soundOn]
    );

    const visibleStars = useMemo(() => {
        if (filterRole === 'all') return stars;
        return stars.filter((s) => s.role === filterRole);
    }, [stars, filterRole]);

    const activeStar = useMemo(() => {
        return (
            visibleStars.find((s) => s.id === selectedStarId) ||
            visibleStars[0] ||
            stars[0] ||
            FALLBACK_STAR[0]
        );
    }, [visibleStars, stars, selectedStarId]);

    // 60fps Canvas Constellation Renderer (Zero shadowBlur/filter for butter-smooth performance)
    useEffect(() => {
        if (viewMode !== 'sky') return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let rafId = null;
        const t0 = performance.now();

        const render = (now) => {
            const t = (now - t0) / 1000;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            const w = rect.width || 800;
            const h = rect.height || 500;

            if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
                canvas.width = Math.round(w * dpr);
                canvas.height = Math.round(h * dpr);
            }

            ctx.save();
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, w, h);

            // 1. Ambient background stars
            const bgStars = bgStarsRef.current;
            for (let i = 0; i < bgStars.length; i++) {
                const b = bgStars[i];
                const twinkle = b.alpha * (0.65 + 0.35 * Math.sin(t * b.speed + b.phase));
                ctx.fillStyle = `rgba(226, 232, 240, ${twinkle.toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(b.x * w, b.y * h, b.r, 0, Math.PI * 2);
                ctx.fill();
            }

            // 2. Compute current screen coordinates for visitor stars (with gentle orbital float)
            const pts = visibleStars.map((star, idx) => {
                const driftX = Math.sin(t * 0.7 + idx * 1.7) * 5;
                const driftY = Math.cos(t * 0.6 + idx * 2.1) * 5;
                const sx = star.x * w + driftX;
                const sy = star.y * h + driftY;
                const roleMeta = getRoleMeta(star.role);
                return {
                    ...star,
                    sx,
                    sy,
                    roleMeta,
                };
            });
            screenPositionsRef.current = pts;

            // 3. Draw delicate constellation lines between nearby stars
            ctx.lineWidth = 1;
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].sx - pts[j].sx;
                    const dy = pts[i].sy - pts[j].sy;
                    const dist = Math.hypot(dx, dy);
                    const maxDist = Math.min(w, h) * 0.36;
                    if (dist < maxDist) {
                        const isHighlighted =
                            pts[i].id === activeStar?.id ||
                            pts[j].id === activeStar?.id ||
                            pts[i].id === hoveredStarId ||
                            pts[j].id === hoveredStarId;
                        const alpha = (1 - dist / maxDist) * (isHighlighted ? 0.38 : 0.14);
                        ctx.strokeStyle = isHighlighted
                            ? `rgba(${pts[i].roleMeta.glow}, ${alpha.toFixed(3)})`
                            : `rgba(148, 163, 184, ${alpha.toFixed(3)})`;
                        ctx.beginPath();
                        ctx.moveTo(pts[i].sx, pts[i].sy);
                        ctx.lineTo(pts[j].sx, pts[j].sy);
                        ctx.stroke();
                    }
                }
            }

            // 4. Draw expanding click/launch ripples
            for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
                const rp = ripplesRef.current[i];
                rp.r += 1.8;
                rp.alpha *= 0.94;
                if (rp.alpha < 0.02) {
                    ripplesRef.current.splice(i, 1);
                    continue;
                }
                ctx.strokeStyle = `rgba(${rp.glow}, ${rp.alpha.toFixed(3)})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
                ctx.stroke();
            }

            // 5. Draw shooting star launch trail if active
            for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
                const ss = shootingStarsRef.current[i];
                ss.progress = Math.min(1, ss.progress + 0.045);
                const ease = 1 - Math.pow(1 - ss.progress, 3);
                const cx = ss.startX + (ss.targetX - ss.startX) * ease;
                const cy = ss.startY + (ss.targetY - ss.startY) * ease;

                ctx.strokeStyle = `rgba(${ss.glow}, ${(1 - ss.progress * 0.5).toFixed(2)})`;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(
                    cx - (ss.targetX - ss.startX) * 0.12,
                    cy - (ss.targetY - ss.startY) * 0.12
                );
                ctx.stroke();

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                ctx.fill();

                if (ss.progress >= 1) {
                    ripplesRef.current.push({
                        x: ss.targetX,
                        y: ss.targetY,
                        r: 6,
                        alpha: 0.85,
                        glow: ss.glow,
                    });
                    shootingStarsRef.current.splice(i, 1);
                }
            }

            // 6. Draw each visitor star orb + clean floating name label
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i];
                const isSelected = p.id === activeStar?.id;
                const isHovered = p.id === hoveredStarId;
                const pulse = 1 + 0.15 * Math.sin(t * 2.6 + i);
                const baseR = isSelected ? 7.5 : isHovered ? 6.5 : 5;
                const haloR = baseR * (isSelected ? 3.4 : 2.5) * pulse;

                // Soft radial halo (no shadowBlur!)
                const grad = ctx.createRadialGradient(p.sx, p.sy, 1, p.sx, p.sy, haloR);
                grad.addColorStop(0, `rgba(${p.roleMeta.glow}, ${isSelected ? 0.55 : 0.32})`);
                grad.addColorStop(1, `rgba(${p.roleMeta.glow}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.sx, p.sy, haloR, 0, Math.PI * 2);
                ctx.fill();

                // Orbit ring on selected star
                if (isSelected) {
                    ctx.strokeStyle = `rgba(${p.roleMeta.glow}, 0.75)`;
                    ctx.lineWidth = 1.25;
                    ctx.beginPath();
                    ctx.arc(p.sx, p.sy, baseR + 6 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Bright star core
                ctx.fillStyle = isSelected || isHovered ? '#ffffff' : p.roleMeta.color;
                ctx.beginPath();
                ctx.arc(p.sx, p.sy, baseR, 0, Math.PI * 2);
                ctx.fill();

                // Crisp name label next to star
                ctx.font = `${isSelected ? '700' : '500'} 11px "Space Grotesk", sans-serif`;
                ctx.fillStyle = isSelected
                    ? '#ffffff'
                    : isHovered
                    ? '#e2e8f0'
                    : 'rgba(203, 213, 225, 0.78)';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(p.name, p.sx + baseR + 7, p.sy);
            }

            ctx.restore();
            rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [viewMode, visibleStars, activeStar, hoveredStarId]);

    // Hit-test star on canvas pointer move / click
    const findNearestStar = useCallback((clientX, clientY) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        let closest = null;
        let minDist = 34; // Generous 34px touch/click radius
        for (const pt of screenPositionsRef.current) {
            const d = Math.hypot(pt.sx - x, pt.sy - y);
            if (d < minDist) {
                minDist = d;
                closest = pt;
            }
        }
        return closest;
    }, []);

    const handleCanvasPointerMove = (e) => {
        const hit = findNearestStar(e.clientX, e.clientY);
        setHoveredStarId(hit ? hit.id : null);
    };

    const handleCanvasClick = (e) => {
        const hit = findNearestStar(e.clientX, e.clientY);
        if (hit) {
            setSelectedStarId(hit.id);
            ripplesRef.current.push({
                x: hit.sx,
                y: hit.sy,
                r: 6,
                alpha: 0.85,
                glow: hit.roleMeta.glow,
            });
            playHarmonicChime(hit.roleMeta.chord, false);
        }
    };

    const handleStepStar = (dir) => {
        if (!visibleStars.length) return;
        const idx = visibleStars.findIndex((s) => s.id === activeStar?.id);
        const nextIdx = (idx + dir + visibleStars.length) % visibleStars.length;
        const nextStar = visibleStars[nextIdx];
        setSelectedStarId(nextStar.id);
        const roleMeta = getRoleMeta(nextStar.role);
        playHarmonicChime(roleMeta.chord, false);
    };

    // Launch a new star into the constellation
    const handleLaunchStar = async (e) => {
        if (e) e.preventDefault();
        const trimmedMsg = noteText.trim();
        if (!trimmedMsg) return;

        const cleanName = (authorName.trim() || 'Explorer').slice(0, 24);
        const cleanMsg = trimmedMsg.slice(0, 140);
        const roleMeta = getRoleMeta(selectedRole);
        const now = Date.now();
        const starId = `star_${now}_${Math.random().toString(36).slice(2, 7)}`;

        // Pick a balanced sky coordinate with slight random spread
        const nx = Number((0.18 + Math.random() * 0.64).toFixed(3));
        const ny = Number((0.2 + Math.random() * 0.48).toFixed(3));

        const newStar = {
            id: starId,
            name: cleanName,
            role: selectedRole,
            message: cleanMsg,
            x: nx,
            y: ny,
            timestamp: now,
        };

        try {
            if (authorName.trim()) {
                localStorage.setItem(AUTHOR_KEY, cleanName);
            }
        } catch {
            // Ignore
        }

        // Animate shooting star from bottom composer to (nx, ny)
        const canvas = canvasRef.current;
        if (canvas && viewMode === 'sky') {
            const rect = canvas.getBoundingClientRect();
            shootingStarsRef.current.push({
                startX: rect.width * 0.5,
                startY: rect.height - 10,
                targetX: nx * rect.width,
                targetY: ny * rect.height,
                progress: 0,
                glow: roleMeta.glow,
            });
        }

        playHarmonicChime(roleMeta.chord, true);
        setFilterRole('all');
        setStars((prev) => {
            const updated = [newStar, ...prev.filter((s) => s.id !== starId)].slice(0, 36);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {
                // Ignore
            }
            return updated;
        });
        setSelectedStarId(starId);
        setNoteText('');
        setLaunchBanner(`Launched ${cleanName}'s star into the constellation!`);
        setTimeout(() => setLaunchBanner(null), 3200);

        // Persist to Firebase RTDB (compatible with database.rules.json and legacy listeners)
        if (db) {
            try {
                const payload = {
                    id: starId,
                    handle: cleanName,
                    text: `[${selectedRole}] ${cleanMsg}`,
                    author: `@${cleanName.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 16) || 'guest'}`,
                    message: `[${selectedRole}] ${cleanMsg}`,
                    role: selectedRole,
                    color: roleMeta.color,
                    nx,
                    ny,
                    x: Math.round(nx * 63),
                    y: Math.round(ny * 63),
                    timestamp: now,
                };
                await set(ref(db, `pixel_hud/transmissions/${starId}`), payload);
            } catch {
                // Keep local star even if Firebase write is restricted
            }
        }
    };

    const activeRoleMeta = getRoleMeta(activeStar?.role);

    return (
        <div
            ref={stageRef}
            className="w-full h-full flex flex-col bg-[#070B14] text-white select-none overflow-hidden font-sans relative"
        >
            {/* Subtle Cosmic Nebula Gradients */}
            <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-24 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />

            {/* Top Header Bar */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-3.5 md:px-5 py-2.5 border-b border-white/10 bg-[#0B1120]/85 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xs md:text-sm font-bold tracking-wide text-white">
                                Starlight GuestBook
                            </h1>
                            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-slate-300">
                                {stars.length} stars
                            </span>
                        </div>
                    </div>
                </div>

                {/* Role Constellation Filter + View Mode & Sound Controls */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10 mr-1">
                        <button
                            type="button"
                            onClick={() => setFilterRole('all')}
                            className={`px-2 py-1 rounded-md text-[11px] font-medium transition ${
                                filterRole === 'all'
                                    ? 'bg-white/15 text-white font-semibold'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            All
                        </button>
                        {VIBE_ROLES.map((role) => (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => setFilterRole(role.id)}
                                className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition ${
                                    filterRole === role.id
                                        ? 'bg-white/15 text-white font-semibold'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: role.color }}
                                />
                                {role.label}
                            </button>
                        ))}
                    </div>

                    {/* Sky vs Wall Toggle */}
                    <div className="inline-flex p-0.5 rounded-lg bg-white/[0.05] border border-white/10">
                        <button
                            type="button"
                            onClick={() => setViewMode('sky')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                                viewMode === 'sky'
                                    ? 'bg-sky-500 text-slate-950'
                                    : 'text-slate-300 hover:text-white'
                            }`}
                        >
                            Sky
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('wall')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                                viewMode === 'wall'
                                    ? 'bg-sky-500 text-slate-950'
                                    : 'text-slate-300 hover:text-white'
                            }`}
                        >
                            Cards
                        </button>
                    </div>

                    {/* Sound Toggle */}
                    <button
                        type="button"
                        onClick={() => setSoundOn((v) => !v)}
                        title={soundOn ? 'Mute harmonic chimes' : 'Enable harmonic chimes'}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
                            soundOn
                                ? 'bg-white/[0.06] border-white/15 text-sky-300 hover:bg-white/10'
                                : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {soundOn ? 'Chimes On' : 'Muted'}
                    </button>
                </div>
            </div>

            {/* Main Interactive Stage */}
            <div className="relative flex-1 min-h-0 w-full overflow-hidden">
                {viewMode === 'sky' ? (
                    <>
                        {/* Interactive Constellation Canvas */}
                        <canvas
                            ref={canvasRef}
                            onPointerMove={handleCanvasPointerMove}
                            onClick={handleCanvasClick}
                            className={`w-full h-full block ${
                                hoveredStarId ? 'cursor-pointer' : 'cursor-crosshair'
                            }`}
                        />

                        {/* Top-left subtle hint */}
                        <div className="pointer-events-none absolute top-3 left-3.5 text-[11px] text-slate-400/90 bg-[#0B1120]/70 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                            Tap any glowing star to read its note
                        </div>

                        {/* Launch confirmation toast */}
                        {launchBanner && (
                            <div className="  absolute top-3 right-3.5 z-20 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold backdrop-blur-md shadow-lg">
                                {launchBanner}
                            </div>
                        )}

                        {/* Selected Star Message Card Overlay */}
                        {activeStar && (
                            <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 p-3.5 rounded-2xl bg-[#0D1527]/90 border border-white/15 backdrop-blur-md shadow-2xl">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: activeRoleMeta.color,
                                                boxShadow: `0 0 8px ${activeRoleMeta.color}`,
                                            }}
                                        />
                                        <span className="text-sm font-bold text-white truncate">
                                            {activeStar.name}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${activeRoleMeta.badgeBg}`}
                                        >
                                            {activeRoleMeta.label}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                                        {formatTimeAgo(activeStar.timestamp)}
                                    </span>
                                </div>

                                <p className="text-xs md:text-[13px] text-slate-200 leading-relaxed mb-2.5 select-text">
                                    &ldquo;{activeStar.message}&rdquo;
                                </p>

                                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => handleStepStar(-1)}
                                        className="text-slate-400 hover:text-white font-medium transition"
                                    >
                                        ← Prev Star
                                    </button>
                                    <span className="text-[10px] font-mono text-slate-500">
                                        {visibleStars.findIndex((s) => s.id === activeStar.id) + 1} /{' '}
                                        {visibleStars.length}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleStepStar(1)}
                                        className="text-sky-400 hover:text-sky-300 font-semibold transition"
                                    >
                                        Next Star →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Clean Card Wall View */
                    <div className="w-full h-full overflow-y-auto p-4 md:p-6">
                        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {visibleStars.map((star) => {
                                const roleMeta = getRoleMeta(star.role);
                                const isSelected = star.id === activeStar?.id;
                                return (
                                    <div
                                        key={star.id}
                                        onClick={() => {
                                            setSelectedStarId(star.id);
                                            playHarmonicChime(roleMeta.chord, false);
                                        }}
                                        className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                                            isSelected
                                                ? 'bg-[#131F38] border-sky-400/50 shadow-lg'
                                                : 'bg-[#0D1527]/80 border-white/10 hover:border-white/25'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: roleMeta.color }}
                                                    />
                                                    <span className="text-xs font-bold text-white truncate">
                                                        {star.name}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${roleMeta.badgeBg}`}
                                                >
                                                    {roleMeta.label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-200 leading-relaxed mb-3 select-text">
                                                &ldquo;{star.message}&rdquo;
                                            </p>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-2 border-t border-white/5">
                                            <span>{formatTimeAgo(star.timestamp)}</span>
                                            <span className="text-sky-400">Play Chime</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Effortless 1-Bar "Launch a Star" Composer */}
            <form
                onSubmit={handleLaunchStar}
                className="relative z-10 px-3.5 md:px-5 py-3 bg-[#0B1120]/95 border-t border-white/10 backdrop-blur-md flex-shrink-0"
            >
                <div className="max-w-5xl mx-auto flex flex-col gap-2">
                    {/* Row 1: 1-Click Role/Vibe Pills */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-semibold text-slate-400 mr-1">
                                Your Vibe:
                            </span>
                            {VIBE_ROLES.map((role) => {
                                const active = selectedRole === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedRole(role.id);
                                            playHarmonicChime(role.chord, false);
                                        }}
                                        className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold transition cursor-pointer ${
                                            active
                                                ? role.activePill
                                                : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10'
                                        }`}
                                    >
                                        {role.label}
                                    </button>
                                );
                            })}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                            {noteText.length}/140
                        </span>
                    </div>

                    {/* Row 2: Name + Note Input + Launch Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            maxLength={24}
                            placeholder="Your name"
                            aria-label="Your name"
                            className="sm:w-36 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/15 focus:border-sky-400 focus:outline-none text-xs text-white placeholder-slate-400"
                        />
                        <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            maxLength={140}
                            placeholder="Write a short note to launch into the sky..."
                            aria-label="Guestbook message"
                            className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/15 focus:border-sky-400 focus:outline-none text-xs text-white placeholder-slate-400"
                        />
                        <button
                            type="submit"
                            disabled={!noteText.trim()}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                                noteText.trim()
                                    ? 'bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-950 hover:from-sky-300 hover:to-indigo-400 shadow-[0_0_16px_rgba(56,189,248,0.4)] cursor-pointer'
                                    : 'bg-white/[0.06] text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            Launch Star
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export const displayPixelHud = () => <PixelHud />;
export default PixelHud;

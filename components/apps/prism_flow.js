import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constants ──────────────────────────────────────────────
const GRID_SIZE = 40;
const SNAP_SIZE = GRID_SIZE / 2; // Half-grid snap for finer placement
const BEAM_MAX_DEPTH = 20;
const BEAM_WIDTH = 2.5;
const ROTATION_STEP = Math.PI / 12; // 15 degrees

// ─── Colors ─────────────────────────────────────────────────
const COLORS = {
    bg: '#0a0e1a',
    grid: 'rgba(100, 140, 255, 0.06)',
    gridAccent: 'rgba(100, 140, 255, 0.12)',
    white: '#ffffff',
    beam: '#ffffff',
    beamRed: '#ff4060',
    beamGreen: '#40ff80',
    beamBlue: '#4080ff',
    mirror: '#c0d8ff',
    prism: 'rgba(200, 220, 255, 0.25)',
    splitter: 'rgba(160, 200, 255, 0.3)',
    blocker: '#1a1a2e',
    blockerEdge: '#ff4060',
    targetRing: '#ffcc40',
    targetLit: '#40ff80',
    toolbox: 'rgba(15, 20, 40, 0.85)',
    buttonBg: 'rgba(60, 100, 255, 0.15)',
    buttonHover: 'rgba(60, 100, 255, 0.35)',
    textPrimary: '#e0e8ff',
    textSecondary: '#8090b0',
};

// ─── Utility Functions ──────────────────────────────────────
function vec2(x, y) { return { x, y }; }
function vecAdd(a, b) { return vec2(a.x + b.x, a.y + b.y); }
function vecSub(a, b) { return vec2(a.x - b.x, a.y - b.y); }
function vecScale(v, s) { return vec2(v.x * s, v.y * s); }
function vecLen(v) { return Math.sqrt(v.x * v.x + v.y * v.y); }
function vecNorm(v) { const l = vecLen(v); return l > 0 ? vec2(v.x / l, v.y / l) : vec2(0, 0); }
function vecDot(a, b) { return a.x * b.x + a.y * b.y; }
function vecReflect(d, n) {
    const dot2 = 2 * vecDot(d, n);
    return vec2(d.x - dot2 * n.x, d.y - dot2 * n.y);
}
function vecRotate(v, angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}
function snapToGrid(val) { return Math.round(val / SNAP_SIZE) * SNAP_SIZE; }
function lerp(a, b, t) { return a + (b - a) * t; }
function colorWithAlpha(color, alpha) {
    if (color.startsWith('rgba')) {
        return color.replace(/,[^,)]+\)$/, `, ${alpha})`);
    }
    if (color.startsWith('rgb(')) {
        return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
    }
    // Hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─── Ray-Segment Intersection ───────────────────────────────
function raySegmentIntersect(rayOrigin, rayDir, p1, p2) {
    const d = vecSub(p2, p1);
    const det = rayDir.x * d.y - rayDir.y * d.x;
    if (Math.abs(det) < 1e-8) return null;
    const dx = p1.x - rayOrigin.x;
    const dy = p1.y - rayOrigin.y;
    const t = (dx * d.y - dy * d.x) / det;
    const u = (dx * rayDir.y - dy * rayDir.x) / det;
    if (t > 0.5 && u >= 0 && u <= 1) {
        return { t, point: vecAdd(rayOrigin, vecScale(rayDir, t)), u };
    }
    return null;
}

// ─── Get Object Segments ────────────────────────────────────
function getObjectSegments(obj) {
    const { x, y, type, angle } = obj;
    const cx = x, cy = y;

    if (type === 'mirror') {
        const halfLen = GRID_SIZE * 0.45;
        const dir = vecRotate(vec2(0, 1), angle);
        const p1 = vec2(cx + dir.x * halfLen, cy + dir.y * halfLen);
        const p2 = vec2(cx - dir.x * halfLen, cy - dir.y * halfLen);
        const normal = vecRotate(vec2(1, 0), angle);
        return [{ p1, p2, normal, type: 'mirror' }];
    }

    if (type === 'prism') {
        const size = GRID_SIZE * 0.45;
        // Equilateral triangle vertices
        const verts = [
            vecRotate(vec2(0, -size), angle),
            vecRotate(vec2(size * 0.866, size * 0.5), angle),
            vecRotate(vec2(-size * 0.866, size * 0.5), angle),
        ].map(v => vec2(cx + v.x, cy + v.y));
        return [
            { p1: verts[0], p2: verts[1], normal: vecNorm(vecRotate(vec2(0.866, -0.5), angle)), type: 'prism' },
            { p1: verts[1], p2: verts[2], normal: vecNorm(vecRotate(vec2(0, 1), angle)), type: 'prism' },
            { p1: verts[2], p2: verts[0], normal: vecNorm(vecRotate(vec2(-0.866, -0.5), angle)), type: 'prism' },
        ];
    }

    if (type === 'splitter') {
        const halfLen = GRID_SIZE * 0.45;
        const dir = vecRotate(vec2(0, 1), angle);
        const p1 = vec2(cx + dir.x * halfLen, cy + dir.y * halfLen);
        const p2 = vec2(cx - dir.x * halfLen, cy - dir.y * halfLen);
        const normal = vecRotate(vec2(1, 0), angle);
        return [{ p1, p2, normal, type: 'splitter' }];
    }

    if (type === 'blocker') {
        const hw = GRID_SIZE * 0.4, hh = GRID_SIZE * 0.4;
        const corners = [
            vecRotate(vec2(-hw, -hh), angle),
            vecRotate(vec2(hw, -hh), angle),
            vecRotate(vec2(hw, hh), angle),
            vecRotate(vec2(-hw, hh), angle),
        ].map(v => vec2(cx + v.x, cy + v.y));
        return corners.map((c, i) => ({
            p1: c, p2: corners[(i + 1) % 4],
            normal: vecNorm(vecRotate([vec2(0, -1), vec2(1, 0), vec2(0, 1), vec2(-1, 0)][i], angle)),
            type: 'blocker'
        }));
    }

    if (type === 'target') {
        // Target is a circle — approximate with 8 segments
        const r = GRID_SIZE * 0.3;
        const segs = [];
        for (let i = 0; i < 8; i++) {
            const a1 = (i / 8) * Math.PI * 2;
            const a2 = ((i + 1) / 8) * Math.PI * 2;
            const p1 = vec2(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r);
            const p2 = vec2(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
            const mid = (a1 + a2) / 2;
            segs.push({ p1, p2, normal: vec2(Math.cos(mid), Math.sin(mid)), type: 'target', targetColor: obj.targetColor || 'white' });
        }
        return segs;
    }

    return [];
}

// ─── Level Definitions ──────────────────────────────────────
const LEVELS = [
    {
        name: "Split Decision",
        description: "Use a splitter to hit both targets",
        source: { x: 2, y: 5, angle: 0 },
        targets: [{ x: 10, y: 5, color: 'white' }, { x: 10, y: 2, color: 'white' }],
        fixed: [],
        available: { mirror: 3, splitter: 1 },
        blockers: [],
    },
    {
        name: "Rainbow",
        description: "Use a prism to split the light",
        source: { x: 1, y: 5, angle: 0 },
        targets: [{ x: 11, y: 4, color: 'red' }, { x: 11, y: 5, color: 'green' }, { x: 11, y: 6, color: 'blue' }],
        fixed: [],
        available: { prism: 1, mirror: 3 },
        blockers: [],
    },
    {
        name: "Maze of Light",
        description: "Navigate the beam through the blockers",
        source: { x: 1, y: 5, angle: 0 },
        targets: [{ x: 11, y: 5, color: 'white' }],
        fixed: [],
        available: { mirror: 5 },
        blockers: [
            { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 4, y: 7 },
            { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 6 }, { x: 8, y: 7 },
        ],
        blockerGaps: [{ x: 4, y: 3 }, { x: 8, y: 7 }],
    },
    {
        name: "Prism Chain",
        description: "Chain prisms to route colored beams",
        source: { x: 1, y: 5, angle: 0 },
        targets: [{ x: 11, y: 4, color: 'red' }, { x: 11, y: 6, color: 'blue' }],
        fixed: [],
        available: { prism: 2, mirror: 4 },
        blockers: [],
    },
    {
        name: "Tight Squeeze",
        description: "Thread the beam through narrow gaps",
        source: { x: 1, y: 5, angle: 0 },
        targets: [{ x: 11, y: 2, color: 'white' }],
        fixed: [],
        available: { mirror: 4 },
        blockers: [
            { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 4, y: 7 }, { x: 4, y: 8 },
            { x: 8, y: 1 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 }, { x: 8, y: 6 }, { x: 8, y: 7 }, { x: 8, y: 8 },
        ],
    },
    {
        name: "Color Mixer",
        description: "Route specific colors to their targets",
        source: { x: 1, y: 5, angle: 0 },
        targets: [{ x: 11, y: 3, color: 'red' }, { x: 11, y: 7, color: 'blue' }],
        fixed: [],
        available: { prism: 1, mirror: 5, splitter: 1 },
        blockers: [{ x: 6, y: 5 }],
    },
    {
        name: "Hall of Mirrors",
        description: "Bounce the beam through a mirror maze",
        source: { x: 1, y: 1, angle: 0 },
        targets: [{ x: 11, y: 8, color: 'white' }],
        fixed: [
            { type: 'mirror', x: 6, y: 1, angle: Math.PI / 4 },
        ],
        available: { mirror: 4 },
        blockers: [{ x: 3, y: 4 }, { x: 3, y: 5 }, { x: 9, y: 3 }, { x: 9, y: 4 }],
    },
    {
        name: "Grand Finale",
        description: "Use everything you've learned",
        source: { x: 1, y: 5, angle: 0 },
        targets: [
            { x: 11, y: 2, color: 'red' },
            { x: 11, y: 5, color: 'green' },
            { x: 11, y: 8, color: 'blue' },
        ],
        fixed: [{ type: 'blocker', x: 5, y: 5 }],
        available: { prism: 2, mirror: 5, splitter: 2 },
        blockers: [{ x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 6 }, { x: 8, y: 7 }],
    },
];

// ─── Particle System ────────────────────────────────────────
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.dust = [];
        this.initDust();
    }

    initDust() {
        for (let i = 0; i < 60; i++) {
            this.dust.push({
                x: Math.random() * 2000,
                y: Math.random() * 2000,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.15 + 0.05,
                glow: 0,
            });
        }
    }

    emit(x, y, color, count = 25) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 3 + 1,
                color,
            });
        }
    }

    update(beamSegments) {
        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= p.decay;
            return p.life > 0;
        });

        // Update dust — glow near beams
        this.dust.forEach(d => {
            d.x += d.vx;
            d.y += d.vy;
            d.glow *= 0.92;

            // Check proximity to beam segments
            if (beamSegments) {
                for (const seg of beamSegments) {
                    const dx = d.x - seg.x;
                    const dy = d.y - seg.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 60) {
                        d.glow = Math.max(d.glow, (1 - dist / 60) * 0.8);
                    }
                }
            }

            // Wrap around
            if (d.x < 0) d.x += 2000;
            if (d.x > 2000) d.x -= 2000;
            if (d.y < 0) d.y += 2000;
            if (d.y > 2000) d.y -= 2000;
        });
    }

    draw(ctx) {
        // Draw dust
        this.dust.forEach(d => {
            const alpha = d.alpha + d.glow * 0.6;
            const size = d.size + d.glow * 3;
            ctx.beginPath();
            ctx.arc(d.x, d.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(180, 200, 255, ${alpha})`;
            ctx.fill();
            if (d.glow > 0.1) {
                ctx.beginPath();
                ctx.arc(d.x, d.y, size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 200, 255, ${d.glow * 0.15})`;
                ctx.fill();
            }
        });

        // Draw particles
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = colorWithAlpha(p.color, p.life * 0.8);
            ctx.fill();
        });
    }
}

// ─── Main Component ─────────────────────────────────────────
export function PrismFlow() {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const particlesRef = useRef(new ParticleSystem());
    const beamPointsRef = useRef([]);
    const timeRef = useRef(0);

    const [gameMode, setGameMode] = useState('home'); // home, howToPlay, puzzle, zen, levelSelect
    const [currentLevel, setCurrentLevel] = useState(0);
    const [completedLevels, setCompletedLevels] = useState(new Set());
    const [placedObjects, setPlacedObjects] = useState([]);
    const [selectedTool, setSelectedTool] = useState(null);
    const [dragging, setDragging] = useState(null);
    const [litTargets, setLitTargets] = useState(new Set());
    const [showWin, setShowWin] = useState(false);
    const [toolInventory, setToolInventory] = useState({});
    const [levelTargets, setLevelTargets] = useState([]);
    const [levelSource, setLevelSource] = useState(null);
    const [selectedObjIndex, setSelectedObjIndex] = useState(-1);
    const lastTouchRef = useRef(null);
    const [fixedObjects, setFixedObjects] = useState([]);

    // ─── Load Level ─────────────────────────────────────────
    const loadLevel = useCallback((levelIndex) => {
        const level = LEVELS[levelIndex];
        if (!level) return;

        const gs = GRID_SIZE;
        const source = {
            type: 'source',
            x: level.source.x * gs + gs / 2,
            y: level.source.y * gs + gs / 2,
            angle: level.source.angle,
        };

        const targets = level.targets.map(t => ({
            type: 'target',
            x: t.x * gs + gs / 2,
            y: t.y * gs + gs / 2,
            targetColor: t.color,
            angle: 0,
        }));

        const blockers = (level.blockers || [])
            .filter(b => !(level.blockerGaps || []).some(g => g.x === b.x && g.y === b.y))
            .map(b => ({
                type: 'blocker',
                x: b.x * gs + gs / 2,
                y: b.y * gs + gs / 2,
                angle: 0,
                fixed: true,
            }));

        const fixed = (level.fixed || []).map(f => ({
            ...f,
            x: f.x * gs + gs / 2,
            y: f.y * gs + gs / 2,
            angle: f.angle || 0,
            fixed: true,
        }));

        setLevelSource(source);
        setLevelTargets(targets);
        setFixedObjects([...blockers, ...fixed]);
        setPlacedObjects([]);
        setToolInventory({ ...level.available });
        setLitTargets(new Set());
        setShowWin(false);
        setSelectedTool(null);
        setSelectedObjIndex(-1);
        setCurrentLevel(levelIndex);
        setGameMode('puzzle');
    }, []);

    // ─── Load Zen Mode ──────────────────────────────────────
    const loadZenMode = useCallback(() => {
        const gs = GRID_SIZE;
        setLevelSource({
            type: 'source',
            x: 2 * gs + gs / 2,
            y: 5 * gs + gs / 2,
            angle: 0,
        });
        setLevelTargets([]);
        setFixedObjects([]);
        setPlacedObjects([]);
        setToolInventory({ mirror: 99, prism: 99, splitter: 99, blocker: 99 });
        setLitTargets(new Set());
        setShowWin(false);
        setSelectedTool(null);
        setSelectedObjIndex(-1);
        setGameMode('zen');
    }, []);

    // ─── Ray Tracing ────────────────────────────────────────
    const traceAllRays = useCallback((ctx, time) => {
        if (!levelSource) return;

        const allObjects = [...fixedObjects, ...placedObjects, ...levelTargets];
        const allSegments = [];
        allObjects.forEach(obj => {
            if (!obj) return;
            const segs = getObjectSegments(obj);
            segs.forEach(s => allSegments.push(s));
        });

        // Add wall segments
        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        allSegments.push(
            { p1: vec2(0, 0), p2: vec2(w, 0), normal: vec2(0, 1), type: 'wall' },
            { p1: vec2(w, 0), p2: vec2(w, h), normal: vec2(-1, 0), type: 'wall' },
            { p1: vec2(0, h), p2: vec2(w, h), normal: vec2(0, -1), type: 'wall' },
            { p1: vec2(0, 0), p2: vec2(0, h), normal: vec2(1, 0), type: 'wall' },
        );

        const beamPoints = [];
        const newLitTargets = new Set();

        function traceRay(origin, direction, color, depth, intensity) {
            if (depth > BEAM_MAX_DEPTH || intensity < 0.05) return;

            let closest = null;
            let closestT = Infinity;

            for (const seg of allSegments) {
                const hit = raySegmentIntersect(origin, direction, seg.p1, seg.p2);
                if (hit && hit.t < closestT) {
                    closestT = hit.t;
                    closest = { ...hit, seg };
                }
            }

            const endPoint = closest
                ? closest.point
                : vecAdd(origin, vecScale(direction, 2000));

            // Draw beam with glow
            drawBeam(ctx, origin, endPoint, color, intensity, time);
            beamPoints.push({ x: (origin.x + endPoint.x) / 2, y: (origin.y + endPoint.y) / 2 });

            if (!closest) return;

            const seg = closest.seg;
            const hitPoint = closest.point;

            if (seg.type === 'mirror') {
                const reflected = vecReflect(direction, seg.normal);
                if (Math.random() < 0.15) particlesRef.current.emit(hitPoint.x, hitPoint.y, color === COLORS.beam ? 'rgb(200, 220, 255)' : color, 2);
                traceRay(hitPoint, vecNorm(reflected), color, depth + 1, intensity * 0.95);
            } else if (seg.type === 'prism') {
                if (color === COLORS.beam || color === '#ffffff') {
                    // Chromatic dispersion
                    const baseRefract = vecReflect(direction, vecScale(seg.normal, -1));
                    const angles = [-0.15, 0, 0.15];
                    const colors = [COLORS.beamRed, COLORS.beamGreen, COLORS.beamBlue];
                    for (let i = 0; i < 3; i++) {
                        const refracted = vecRotate(baseRefract, angles[i]);
                        traceRay(hitPoint, vecNorm(refracted), colors[i], depth + 1, intensity * 0.7);
                    }
                    if (Math.random() < 0.1) particlesRef.current.emit(hitPoint.x, hitPoint.y, 'rgb(220, 240, 255)', 3);
                } else {
                    // Already colored — just refract without splitting
                    const refracted = vecReflect(direction, vecScale(seg.normal, -1));
                    traceRay(hitPoint, vecNorm(refracted), color, depth + 1, intensity * 0.85);
                }
            } else if (seg.type === 'splitter') {
                // Reflect half
                const reflected = vecReflect(direction, seg.normal);
                traceRay(hitPoint, vecNorm(reflected), color, depth + 1, intensity * 0.5);
                // Transmit half
                traceRay(hitPoint, direction, color, depth + 1, intensity * 0.5);
            } else if (seg.type === 'target') {
                // Check color match
                const tc = seg.targetColor;
                const colorMatch = tc === 'white' ||
                    (tc === 'red' && color === COLORS.beamRed) ||
                    (tc === 'green' && color === COLORS.beamGreen) ||
                    (tc === 'blue' && color === COLORS.beamBlue) ||
                    (tc === 'white' && color === COLORS.beam);

                if (colorMatch) {
                    // Find target index
                    const ti = levelTargets.findIndex(t =>
                        Math.abs(t.x - (seg.p1.x + seg.p2.x) / 2) < GRID_SIZE &&
                        Math.abs(t.y - (seg.p1.y + seg.p2.y) / 2) < GRID_SIZE
                    );
                    if (ti >= 0) newLitTargets.add(ti);
                }
            }
            // blocker and wall: beam terminates (no recursion)
        }

        const dir = vecRotate(vec2(1, 0), levelSource.angle);
        traceRay(
            vec2(levelSource.x, levelSource.y),
            dir,
            COLORS.beam,
            0,
            1.0
        );

        beamPointsRef.current = beamPoints;

        // Check win
        if (gameMode === 'puzzle' && levelTargets.length > 0) {
            setLitTargets(newLitTargets);
            if (newLitTargets.size === levelTargets.length && !showWin) {
                setShowWin(true);
                setCompletedLevels(prev => new Set([...prev, currentLevel]));
                // Big celebration burst
                const celebColors = ['rgb(255, 200, 60)', 'rgb(100, 255, 150)', 'rgb(100, 180, 255)', 'rgb(255, 100, 120)'];
                levelTargets.forEach(t => {
                    celebColors.forEach(c => {
                        particlesRef.current.emit(t.x, t.y, c, 25);
                    });
                });
                // Center burst
                const cx = ctx.canvas.width / 2, cy = ctx.canvas.height / 2;
                celebColors.forEach(c => particlesRef.current.emit(cx, cy, c, 15));
            }
        }
    }, [levelSource, fixedObjects, placedObjects, levelTargets, gameMode, showWin, currentLevel]);

    // ─── Draw Beam with Glow ────────────────────────────────
    function drawBeam(ctx, from, to, color, intensity, time) {
        const pulse = 0.85 + 0.15 * Math.sin(time * 3);
        const alpha = intensity * pulse;

        // Outer glow
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 3; i >= 0; i--) {
            const w = BEAM_WIDTH + i * 4;
            const a = alpha * (0.06 - i * 0.012);
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = color === COLORS.beam
                ? `rgba(200, 220, 255, ${a})`
                : colorWithAlpha(color, a);
            ctx.lineWidth = w;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // Core beam
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = color === COLORS.beam ? `rgba(240, 248, 255, ${alpha})` : color;
        ctx.lineWidth = BEAM_WIDTH;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
    }

    // ─── Draw Game Objects ──────────────────────────────────
    function drawObjects(ctx, time) {
        const allObjs = [...fixedObjects, ...placedObjects];
        const selIdx = selectedObjIndex;

        allObjs.forEach((obj, drawIdx) => {
            if (!obj) return;
            const placedIdx = drawIdx - fixedObjects.length;
            const isSelected = placedIdx >= 0 && placedIdx === selIdx;

            ctx.save();
            ctx.translate(obj.x, obj.y);
            ctx.rotate(obj.angle || 0);

            if (obj.type === 'mirror') {
                const halfLen = GRID_SIZE * 0.45;
                const shimmer = 0.7 + 0.3 * Math.sin(time * 2 + obj.x);
                const grad = ctx.createLinearGradient(-2, -halfLen, 2, halfLen);
                grad.addColorStop(0, `rgba(180, 210, 255, ${0.3 * shimmer})`);
                grad.addColorStop(0.5, `rgba(220, 240, 255, ${0.9 * shimmer})`);
                grad.addColorStop(1, `rgba(180, 210, 255, ${0.3 * shimmer})`);
                ctx.beginPath();
                ctx.moveTo(0, -halfLen);
                ctx.lineTo(0, halfLen);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.shadowColor = 'rgba(150, 200, 255, 0.5)';
                ctx.shadowBlur = 8;
                ctx.stroke();
            } else if (obj.type === 'prism') {
                const size = GRID_SIZE * 0.45;
                ctx.beginPath();
                ctx.moveTo(0, -size);
                ctx.lineTo(size * 0.866, size * 0.5);
                ctx.lineTo(-size * 0.866, size * 0.5);
                ctx.closePath();
                const grad = ctx.createLinearGradient(-size, -size, size, size);
                grad.addColorStop(0, 'rgba(255, 80, 100, 0.15)');
                grad.addColorStop(0.5, 'rgba(100, 255, 150, 0.15)');
                grad.addColorStop(1, 'rgba(80, 130, 255, 0.15)');
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';
                ctx.lineWidth = 2;
                ctx.shadowColor = 'rgba(200, 220, 255, 0.3)';
                ctx.shadowBlur = 12;
                ctx.stroke();
            } else if (obj.type === 'splitter') {
                const halfLen = GRID_SIZE * 0.45;
                ctx.beginPath();
                ctx.moveTo(0, -halfLen);
                ctx.lineTo(0, halfLen);
                ctx.strokeStyle = 'rgba(160, 200, 255, 0.5)';
                ctx.lineWidth = 3;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.shadowColor = 'rgba(160, 200, 255, 0.3)';
                ctx.shadowBlur = 6;
                ctx.stroke();
            } else if (obj.type === 'blocker') {
                const hw = GRID_SIZE * 0.4;
                ctx.beginPath();
                ctx.rect(-hw, -hw, hw * 2, hw * 2);
                ctx.fillStyle = COLORS.blocker;
                ctx.fill();
                ctx.strokeStyle = COLORS.blockerEdge;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.restore();

            // Selection ring for tapped object
            if (isSelected && !obj.fixed) {
                ctx.save();
                ctx.translate(obj.x, obj.y);
                const selPulse = 0.4 + 0.3 * Math.sin(time * 4);
                const selRadius = GRID_SIZE * 0.6 + Math.sin(time * 3) * 2;

                // Outer glow ring
                ctx.beginPath();
                ctx.arc(0, 0, selRadius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(100, 180, 255, ${selPulse * 0.2})`;
                ctx.lineWidth = 6;
                ctx.stroke();

                // Animated rotating dash ring
                ctx.beginPath();
                ctx.arc(0, 0, selRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(100, 180, 255, ${selPulse + 0.3})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.lineDashOffset = -time * 30;
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();
            }
        });

        // Draw light source
        if (levelSource) {
            const pulse = 0.7 + 0.3 * Math.sin(time * 4);
            ctx.save();
            ctx.translate(levelSource.x, levelSource.y);

            // Pulsing concentric rings
            for (let ring = 0; ring < 3; ring++) {
                const ringPhase = (time * 2 + ring * 0.8) % 3;
                const ringR = 8 + ringPhase * GRID_SIZE * 0.3;
                const ringAlpha = Math.max(0, 0.3 - ringPhase * 0.1) * pulse;
                ctx.beginPath();
                ctx.arc(0, 0, ringR, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Outer glow
            const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, GRID_SIZE * 0.7);
            grd.addColorStop(0, `rgba(255, 255, 255, ${0.5 * pulse})`);
            grd.addColorStop(0.5, `rgba(200, 220, 255, ${0.15 * pulse})`);
            grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grd;
            ctx.fillRect(-GRID_SIZE * 0.7, -GRID_SIZE * 0.7, GRID_SIZE * 1.4, GRID_SIZE * 1.4);

            // Core
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Direction indicator
            const dir = vecRotate(vec2(1, 0), levelSource.angle);
            ctx.beginPath();
            ctx.moveTo(10 * dir.x, 10 * dir.y);
            ctx.lineTo(22 * dir.x, 22 * dir.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * pulse})`;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();
        }

        // Draw targets
        levelTargets.forEach((t, i) => {
            const isLit = litTargets.has(i);
            const pulse = isLit ? 0.8 + 0.2 * Math.sin(time * 6) : 0.3 + 0.15 * Math.sin(time * 2);
            const r = GRID_SIZE * 0.3;
            const color = t.targetColor === 'white' ? COLORS.targetRing :
                t.targetColor === 'red' ? COLORS.beamRed :
                    t.targetColor === 'green' ? COLORS.beamGreen :
                        t.targetColor === 'blue' ? COLORS.beamBlue : COLORS.targetRing;

            ctx.save();
            ctx.translate(t.x, t.y);

            // Rotating outer indicator ring (always visible)
            ctx.save();
            ctx.rotate(time * (isLit ? 2 : 0.5));
            ctx.beginPath();
            ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
            ctx.strokeStyle = isLit ? colorWithAlpha(color, 0.4) : 'rgba(150, 150, 180, 0.15)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            if (isLit) {
                // Lit glow — radial gradient
                const grd = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 3);
                grd.addColorStop(0, colorWithAlpha(color, 0.35 * pulse));
                grd.addColorStop(0.5, colorWithAlpha(color, 0.1));
                grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fillRect(-r * 3, -r * 3, r * 6, r * 6);

                // Emit sparkle on lit targets
                if (Math.random() < 0.08) {
                    particlesRef.current.emit(t.x, t.y, color, 2);
                }
            }

            // Main ring
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.strokeStyle = isLit ? color : `rgba(180, 180, 180, ${pulse})`;
            ctx.lineWidth = isLit ? 3 : 2;
            ctx.shadowColor = isLit ? color : 'transparent';
            ctx.shadowBlur = isLit ? 20 : 0;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Inner color dot
            if (t.targetColor !== 'white') {
                ctx.beginPath();
                ctx.arc(0, 0, 4, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.globalAlpha = pulse;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Checkmark when lit
            if (isLit) {
                ctx.fillStyle = color;
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.globalAlpha = pulse;
                ctx.fillText('✓', 0, 0);
                ctx.globalAlpha = 1;
            }

            ctx.restore();
        });
    }

    // ─── Draw Background ────────────────────────────────────
    // Cached star field (generated once)
    const starsRef = useRef(null);
    function getStars(w, h) {
        if (starsRef.current && starsRef.current.w === w && starsRef.current.h === h) return starsRef.current.stars;
        const stars = [];
        const count = Math.floor((w * h) / 3000);
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 1.2 + 0.3,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 3 + 1,
                twinkleOffset: Math.random() * Math.PI * 2,
            });
        }
        starsRef.current = { w, h, stars };
        return stars;
    }

    function drawBackground(ctx, w, h, time) {
        // Deep space gradient
        const grad = ctx.createLinearGradient(0, 0, w * 0.3, h);
        grad.addColorStop(0, '#050810');
        grad.addColorStop(0.35, '#080c1a');
        grad.addColorStop(0.65, '#0a0e1c');
        grad.addColorStop(1, '#060a14');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Soft nebula clouds
        const nebulae = [
            { x: w * 0.2, y: h * 0.3, r: w * 0.35, color: [40, 60, 140] },
            { x: w * 0.75, y: h * 0.7, r: w * 0.3, color: [80, 40, 120] },
            { x: w * 0.5, y: h * 0.5, r: w * 0.4, color: [30, 70, 100] },
        ];
        nebulae.forEach(n => {
            const drift = Math.sin(time * 0.15 + n.x) * 8;
            const grd = ctx.createRadialGradient(
                n.x + drift, n.y, n.r * 0.1,
                n.x + drift, n.y, n.r
            );
            grd.addColorStop(0, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0.06)`);
            grd.addColorStop(0.5, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0.025)`);
            grd.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, w, h);
        });

        // Twinkling star field
        const stars = getStars(w, h);
        stars.forEach(s => {
            const twinkle = 0.3 + 0.7 * ((Math.sin(time * s.twinkleSpeed + s.twinkleOffset) + 1) / 2);
            const alpha = s.brightness * twinkle * 0.7;
            const size = s.r * (0.8 + twinkle * 0.4);
            ctx.beginPath();
            ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
            ctx.fill();
            // Bright stars get a soft glow
            if (s.brightness > 0.7) {
                ctx.beginPath();
                ctx.arc(s.x, s.y, size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 210, 255, ${alpha * 0.08})`;
                ctx.fill();
            }
        });

        // Subtle hexagonal nodes (constellation-like)
        const hexSpacing = GRID_SIZE * 3;
        ctx.lineWidth = 0.3;
        for (let gx = hexSpacing; gx < w; gx += hexSpacing) {
            for (let gy = hexSpacing; gy < h; gy += hexSpacing) {
                const offset = (Math.floor(gy / hexSpacing) % 2) * hexSpacing * 0.5;
                const nx = gx + offset;
                if (nx > w) continue;
                const nodeAlpha = 0.04 + 0.02 * Math.sin(time * 0.5 + nx * 0.01 + gy * 0.01);
                // Small dot at node
                ctx.beginPath();
                ctx.arc(nx, gy, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(100, 140, 255, ${nodeAlpha * 3})`;
                ctx.fill();
                // Very subtle connecting lines to nearby nodes
                ctx.strokeStyle = `rgba(80, 120, 220, ${nodeAlpha})`;
                if (nx + hexSpacing < w) {
                    ctx.beginPath();
                    ctx.moveTo(nx, gy);
                    ctx.lineTo(nx + hexSpacing, gy);
                    ctx.stroke();
                }
            }
        }

        // Vignette
        const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.75);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
    }

    // ─── Animation Loop ─────────────────────────────────────
    useEffect(() => {
        if (gameMode !== 'puzzle' && gameMode !== 'zen') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const animate = () => {
            timeRef.current += 0.016;
            const time = timeRef.current;
            const w = canvas.width;
            const h = canvas.height;

            // Clear
            ctx.clearRect(0, 0, w, h);

            // Background
            drawBackground(ctx, w, h, time);

            // Particles (behind objects)
            particlesRef.current.update(beamPointsRef.current);
            particlesRef.current.draw(ctx);

            // Objects
            drawObjects(ctx, time);

            // Trace rays (draws beams)
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            traceAllRays(ctx, time);
            ctx.restore();

            animRef.current = requestAnimationFrame(animate);
        };

        // Set canvas size
        const resizeCanvas = () => {
            // Use canvas's own CSS-rendered size (flex: 1 gives it the right height)
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        animRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [gameMode, traceAllRays]);

    // ─── Canvas Coordinate Helper ────────────────────────────
    function getCanvasCoords(e) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    }

    function findObjectAt(mx, my) {
        return placedObjects.findIndex(obj => {
            const dx = obj.x - mx;
            const dy = obj.y - my;
            return Math.sqrt(dx * dx + dy * dy) < GRID_SIZE * 0.7;
        });
    }

    // ─── Unified Pointer Logic ───────────────────────────────
    function handlePointerDown(mx, my, isRightClick = false) {
        if (showWin) return;

        if (isRightClick) {
            const idx = findObjectAt(mx, my);
            if (idx >= 0) {
                setPlacedObjects(prev => {
                    const copy = [...prev];
                    copy[idx] = { ...copy[idx], angle: (copy[idx].angle || 0) + ROTATION_STEP };
                    return copy;
                });
            }
            return;
        }

        // Tap on an existing placed object → select it + start drag
        const idx = findObjectAt(mx, my);
        if (idx >= 0) {
            setSelectedObjIndex(idx);
            setDragging({ index: idx, offsetX: mx - placedObjects[idx].x, offsetY: my - placedObjects[idx].y });
            return;
        }

        // Tapped empty grid → deselect any selected object
        setSelectedObjIndex(-1);

        // If a tool is selected, place it
        if (selectedTool && toolInventory[selectedTool] > 0) {
            const sx = snapToGrid(mx);
            const sy = snapToGrid(my);
            const newObj = {
                type: selectedTool,
                x: sx + GRID_SIZE / 2,
                y: sy + GRID_SIZE / 2,
                angle: selectedTool === 'mirror' ? Math.PI / 4 : 0,
            };
            setPlacedObjects(prev => {
                const next = [...prev, newObj];
                // Auto-select the newly placed object
                setSelectedObjIndex(next.length - 1);
                return next;
            });
            setToolInventory(prev => ({ ...prev, [selectedTool]: prev[selectedTool] - 1 }));
            if (toolInventory[selectedTool] <= 1) setSelectedTool(null);
            return;
        }
    }

    function handlePointerMove(mx, my) {
        if (!dragging) return;
        setPlacedObjects(prev => {
            const copy = [...prev];
            const sx = snapToGrid(mx - dragging.offsetX) + GRID_SIZE / 2;
            const sy = snapToGrid(my - dragging.offsetY) + GRID_SIZE / 2;
            copy[dragging.index] = { ...copy[dragging.index], x: sx, y: sy };
            return copy;
        });
    }

    function handlePointerUp() {
        setDragging(null);
    }

    // ─── Mouse Events ───────────────────────────────────────
    const handleCanvasMouseDown = (e) => {
        const { x, y } = getCanvasCoords(e);
        handlePointerDown(x, y, e.button === 2);
    };
    const handleCanvasMouseMove = (e) => {
        const { x, y } = getCanvasCoords(e);
        handlePointerMove(x, y);
    };
    const handleCanvasMouseUp = () => handlePointerUp();

    const handleCanvasWheel = (e) => {
        if (showWin) return;
        const { x: mx, y: my } = getCanvasCoords(e);
        const idx = findObjectAt(mx, my);
        if (idx >= 0) {
            e.preventDefault();
            e.stopPropagation();
            const direction = e.deltaY > 0 ? 1 : -1;
            setPlacedObjects(prev => {
                const copy = [...prev];
                copy[idx] = { ...copy[idx], angle: (copy[idx].angle || 0) + ROTATION_STEP * direction };
                return copy;
            });
        }
    };

    // ─── Touch Events ───────────────────────────────────────
    const handleTouchStart = (e) => {
        if (!canvasRef.current) return;
        e.preventDefault();
        const { x, y } = getCanvasCoords(e);
        lastTouchRef.current = { x, y };
        handlePointerDown(x, y);
    };
    const handleTouchMove = (e) => {
        if (!canvasRef.current) return;
        e.preventDefault();
        const { x, y } = getCanvasCoords(e);
        handlePointerMove(x, y);
    };
    const handleTouchEnd = (e) => {
        e.preventDefault();
        handlePointerUp();
    };

    // ─── Object Actions ─────────────────────────────────────
    const rotateSelected = () => {
        if (selectedObjIndex < 0) return;
        setPlacedObjects(prev => {
            const copy = [...prev];
            copy[selectedObjIndex] = { ...copy[selectedObjIndex], angle: (copy[selectedObjIndex].angle || 0) + ROTATION_STEP };
            return copy;
        });
    };

    const removeSelected = () => {
        if (selectedObjIndex < 0) return;
        const obj = placedObjects[selectedObjIndex];
        setToolInventory(prev => ({ ...prev, [obj.type]: (prev[obj.type] || 0) + 1 }));
        setPlacedObjects(prev => prev.filter((_, i) => i !== selectedObjIndex));
        setSelectedObjIndex(-1);
    };

    const TOOL_ICONS = { mirror: '╲', prism: '△', splitter: '┆', blocker: '■' };

    // ─── Render: Home Screen ────────────────────────────────
    if (gameMode === 'home') {
        return (
            <div className="pf-home">
                <div className="pf-home-bg">
                    <div className="pf-prism-hero">
                        <div className="pf-prism-shape" />
                        <div className="pf-beam-in" />
                        <div className="pf-beam-out pf-beam-red" />
                        <div className="pf-beam-out pf-beam-green" />
                        <div className="pf-beam-out pf-beam-blue" />
                    </div>
                </div>
                <div className="pf-home-content">
                    <h1 className="pf-title">Prism Flow</h1>
                    <p className="pf-subtitle">A Light Physics Odyssey</p>
                    <div className="pf-menu-buttons">
                        <button
                            className="pf-btn pf-btn-primary"
                            onClick={() => setGameMode('levelSelect')}
                        >
                            <span className="pf-btn-icon">◈</span>
                            Puzzle Mode
                        </button>
                        <button
                            className="pf-btn pf-btn-secondary"
                            onClick={loadZenMode}
                        >
                            <span className="pf-btn-icon">∞</span>
                            Zen Mode
                        </button>
                        <button
                            className="pf-btn pf-btn-secondary"
                            onClick={() => setGameMode('howToPlay')}
                        >
                            <span className="pf-btn-icon">?</span>
                            How to Play
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Render: How to Play ────────────────────────────────
    if (gameMode === 'howToPlay') {
        return (
            <div className="pf-level-select">
                <div className="pf-ls-header">
                    <button className="pf-back-btn" onClick={() => setGameMode('home')}>← Back</button>
                    <h2 className="pf-ls-title">How to Play</h2>
                </div>
                <div className="pf-htp-content">
                    <div className="pf-htp-section">
                        <h3 className="pf-htp-heading">🎯 Goal</h3>
                        <p className="pf-htp-text">Direct light beams to hit all colored targets by placing and rotating optical tools.</p>
                    </div>
                    <div className="pf-htp-section">
                        <h3 className="pf-htp-heading">🔧 Tools</h3>
                        <div className="pf-htp-item"><span className="pf-htp-icon">⟋</span><div><strong>Mirror</strong> — Reflects light at an angle</div></div>
                        <div className="pf-htp-item"><span className="pf-htp-icon">△</span><div><strong>Prism</strong> — Splits white light into RGB colors</div></div>
                        <div className="pf-htp-item"><span className="pf-htp-icon">◇</span><div><strong>Splitter</strong> — Creates two beams from one</div></div>
                        <div className="pf-htp-item"><span className="pf-htp-icon">■</span><div><strong>Blocker</strong> — Stops light completely</div></div>
                    </div>
                    <div className="pf-htp-section">
                        <h3 className="pf-htp-heading">📱 Controls</h3>
                        <div className="pf-htp-item"><span className="pf-htp-icon">👆</span><div>Select a tool, then tap the grid to place it</div></div>
                        <div className="pf-htp-item"><span className="pf-htp-icon">✋</span><div>Tap a placed object to select it, then drag to move</div></div>
                        <div className="pf-htp-item"><span className="pf-htp-icon">↻</span><div>Use the Rotate button to turn objects 45°</div></div>
                        <div className="pf-htp-item"><span className="pf-htp-icon">🖱</span><div>Desktop: Scroll wheel over an object to rotate</div></div>
                    </div>
                    <button
                        className="pf-btn pf-btn-primary"
                        style={{ marginTop: '16px', width: '100%' }}
                        onClick={() => setGameMode('levelSelect')}
                    >
                        Start Playing
                    </button>
                </div>
            </div>
        );
    }

    // ─── Render: Level Select ───────────────────────────────
    if (gameMode === 'levelSelect') {
        return (
            <div className="pf-level-select">
                <div className="pf-ls-header">
                    <button className="pf-back-btn" onClick={() => setGameMode('home')}>← Back</button>
                    <h2 className="pf-ls-title">Select Level</h2>
                </div>
                <div className="pf-ls-grid">
                    {LEVELS.map((level, i) => (
                        <button
                            key={i}
                            className={`pf-ls-card ${completedLevels.has(i) ? 'pf-ls-completed' : ''}`}
                            onClick={() => loadLevel(i)}
                        >
                            <div className="pf-ls-number">{i + 1}</div>
                            <div className="pf-ls-name">{level.name}</div>
                            <div className="pf-ls-desc">{level.description}</div>
                            {completedLevels.has(i) && <div className="pf-ls-check">✓</div>}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // ─── Render: Game Screen (Puzzle / Zen) ──────────────────
    return (
        <div className="pf-game" onContextMenu={e => e.preventDefault()}>
            {/* Canvas — fills everything above the bottom bar */}
            <canvas
                ref={canvasRef}
                className="pf-canvas"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onWheel={handleCanvasWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onContextMenu={e => e.preventDefault()}
            />

            {/* Top Bar — level name + actions */}
            <div className="pf-topbar">
                <span className="pf-topbar-title">
                    {gameMode === 'zen' ? 'Sandbox' : LEVELS[currentLevel]?.name}
                </span>
                <div className="pf-topbar-actions">
                    <button className="pf-topbar-btn" onClick={() => {
                        if (gameMode === 'puzzle') loadLevel(currentLevel);
                        else loadZenMode();
                    }}>↻</button>
                    <button className="pf-topbar-btn" onClick={() => setGameMode(gameMode === 'puzzle' ? 'levelSelect' : 'home')}>✕</button>
                </div>
            </div>

            {/* Bottom Toolbar — tools + selected object actions */}
            <div className="pf-bottom-bar">
                {/* Tool buttons */}
                <div className="pf-bb-tools">
                    {Object.entries(toolInventory).map(([type, count]) => (
                        count > 0 && (
                            <button
                                key={type}
                                className={`pf-bb-tool ${selectedTool === type ? 'pf-bb-tool-active' : ''}`}
                                onClick={() => {
                                    setSelectedTool(selectedTool === type ? null : type);
                                    setSelectedObjIndex(-1);
                                }}
                            >
                                <span className="pf-bb-tool-icon">{TOOL_ICONS[type]}</span>
                                <span className="pf-bb-tool-count">{count === 99 ? '∞' : count}</span>
                            </button>
                        )
                    ))}
                </div>

                {/* Divider */}
                {selectedObjIndex >= 0 && <div className="pf-bb-divider" />}

                {/* Selected object actions */}
                {selectedObjIndex >= 0 && (
                    <div className="pf-bb-obj-actions">
                        <button className="pf-bb-action" onClick={rotateSelected}>
                            ↻ Rotate
                        </button>
                        <button className="pf-bb-action pf-bb-action-danger" onClick={removeSelected}>
                            ✕ Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Win Overlay */}
            {showWin && (
                <div className="pf-win-overlay">
                    <div className="pf-win-card">
                        <div className="pf-win-icon">✦</div>
                        <h2 className="pf-win-title">Level Complete!</h2>
                        <p className="pf-win-subtitle">{LEVELS[currentLevel]?.name}</p>
                        <div className="pf-win-actions">
                            {currentLevel < LEVELS.length - 1 && (
                                <button className="pf-btn pf-btn-primary" onClick={() => loadLevel(currentLevel + 1)}>
                                    Next Level →
                                </button>
                            )}
                            <button className="pf-btn pf-btn-secondary" onClick={() => setGameMode('levelSelect')}>
                                Level Select
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export const displayPrismFlow = () => {
    return <PrismFlow />;
};

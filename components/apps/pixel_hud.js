import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Radio,
  RotateCcw,
  Trash2,
  HelpCircle,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  Lock,
  X,
  Crosshair,
  CheckCircle2,
  Zap,
  Music
} from 'lucide-react';
import { PixelEngine, GRID_WIDTH, GRID_HEIGHT, TOTAL_CELLS } from '../pixel_hud/PixelEngine.js';
import { WebAudioSynth } from '../pixel_hud/WebAudioSynth.js';
import FloatingDock from '../pixel_hud/FloatingDock.js';
import GuestbookDrawer from '../pixel_hud/GuestbookDrawer.js';
import SignNoteModal from '../pixel_hud/SignNoteModal.js';
import {
  pixelHudService,
  sanitizeAuthor,
  sanitizeMessage,
  CLIENT_SESSION_ID,
  CANVAS_LIST,
  getLocalGridCache
} from '../pixel_hud/services/firebaseService.js';
import { PALETTE, getColorByHex } from '../pixel_hud/palette.js';
import { STAMPS, getStampById, getStampPixels } from '../pixel_hud/stamps.js';
import { formatRelativeTime, getSectorName, getHarmonicNoteForY } from '../pixel_hud/telemetry.js';

export function PixelHud() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const synthRef = useRef(null);

  // App State
  const [activeCanvasId, setActiveCanvasId] = useState('canvas_1');
  const [activeTool, setActiveTool] = useState('paint'); // 'paint' | 'eraser' | 'stamp' | 'pan'
  const [activeColor, setActiveColor] = useState('#00f0ff');
  const [activeStampId, setActiveStampId] = useState('space_invader');
  const [authorCallsign, setAuthorCallsign] = useState('@guest');
  const [transmissionMessage, setTransmissionMessage] = useState('');

  // Audio & Shader Settings
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [gridLinesEnabled, setGridLinesEnabled] = useState(true);

  // Telemetry & Metrics
  const [hoveredCoord, setHoveredCoord] = useState(null);
  const [hoveredCellData, setHoveredCellData] = useState(null);
  const [totalMarks, setTotalMarks] = useState(0);
  const [density, setDensity] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [transmissions, setTransmissions] = useState([]);
  const [transmissionsError, setTransmissionsError] = useState('');
  const [isolatedAuthor, setIsolatedAuthor] = useState(null);
  const [protectedToast, setProtectedToast] = useState(null);
  const [publishSuccessToast, setPublishSuccessToast] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // UI Panels & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showLandingModal, setShowLandingModal] = useState(false);
  const [dontShowIntroAgain, setDontShowIntroAgain] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  const handleSelectTool = (tool) => {
    setActiveTool(tool);
    if (tool === 'paint' || tool === 'eraser' || tool === 'stamp') {
      setHoveredCoord(null);
      setHoveredCellData(null);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. LOCAL STORAGE & INITIALIZATION
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const seenIntro = localStorage.getItem('pixel_hud_seen_intro');
      if (!seenIntro) {
        setShowLandingModal(true);
      }
      const savedCanvas = localStorage.getItem('pixel_hud_active_canvas');
      if (savedCanvas && CANVAS_LIST.some(c => c.id === savedCanvas)) {
        setActiveCanvasId(savedCanvas);
      }
      const savedAuthor = localStorage.getItem('pixel_hud_author');
      if (savedAuthor && /^@[a-zA-Z0-9_]{1,20}$/.test(savedAuthor)) {
        setAuthorCallsign(savedAuthor);
      } else {
        const uniqueGuest = '@guest_' + Math.floor(100 + Math.random() * 900);
        setAuthorCallsign(uniqueGuest);
        try {
          localStorage.setItem('pixel_hud_author', uniqueGuest);
        } catch (e) { }
      }
    } catch (e) { }
  }, []);

  const handleAuthorChange = (newAuthor) => {
    setAuthorCallsign(newAuthor);
    try {
      localStorage.setItem('pixel_hud_author', newAuthor);
    } catch (e) { }
  };

  const handleCloseLandingModal = () => {
    setShowLandingModal(false);
    if (dontShowIntroAgain) {
      try {
        localStorage.setItem('pixel_hud_seen_intro', 'true');
      } catch (e) { }
    }
  };

  // Auto-dismiss toasts
  useEffect(() => {
    if (!publishSuccessToast) return;
    const timer = setTimeout(() => setPublishSuccessToast(null), 3500);
    return () => clearTimeout(timer);
  }, [publishSuccessToast]);

  useEffect(() => {
    if (!protectedToast) return;
    const timer = setTimeout(() => setProtectedToast(null), 2500);
    return () => clearTimeout(timer);
  }, [protectedToast]);

  // Global Keyboard Shortcuts (Undo: Ctrl+Z / Cmd+Z, Redo: Ctrl+Shift+Z / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (e.metaKey || e.ctrlKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  // ─────────────────────────────────────────────────────────────
  // 2. AUDIO SYNTH INITIALIZATION
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const synth = new WebAudioSynth({
      muted: isMuted,
      volume: volume
    });
    synthRef.current = synth;

    return () => {
      if (synthRef.current) {
        synthRef.current.destroy();
        synthRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setMuted(isMuted);
      synthRef.current.setVolume(volume);
    }
  }, [isMuted, volume]);

  // ─────────────────────────────────────────────────────────────
  // 3. ENGINE METRICS & CANVAS EVENTS
  // ─────────────────────────────────────────────────────────────
  const updateMetrics = useCallback(() => {
    if (!engineRef.current) return;
    let count = 0;
    const grid = engineRef.current.grid;
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (grid[i] !== null && grid[i].color) {
        count++;
      }
    }
    setTotalMarks(count);
    setDensity(Number(((count / TOTAL_CELLS) * 100).toFixed(1)));
  }, []);

  const handleSelectCanvas = useCallback((newCanvasId) => {
    if (newCanvasId === activeCanvasId) return;
    setActiveCanvasId(newCanvasId);
    try {
      localStorage.setItem('pixel_hud_active_canvas', newCanvasId);
    } catch (e) { }

    if (engineRef.current) {
      engineRef.current.clearGrid();
      const getCache = (pixelHudService && typeof pixelHudService.getLocalGridCache === 'function')
        ? pixelHudService.getLocalGridCache.bind(pixelHudService)
        : getLocalGridCache;
      const cached = getCache ? getCache(newCanvasId) : {};
      if (cached && typeof cached === 'object') {
        Object.entries(cached).forEach(([key, cell]) => {
          const [xStr, yStr] = key.split('_');
          const x = parseInt(xStr, 10);
          const y = parseInt(yStr, 10);
          if (!isNaN(x) && !isNaN(y) && cell && cell.color) {
            engineRef.current.setPixel(x, y, cell.color, cell, false);
          }
        });
      }
      setCanUndo(false);
      setCanRedo(false);
      updateMetrics();
    }

    if (synthRef.current?.playLaserRise) {
      synthRef.current.playLaserRise(32, 32);
    }
  }, [activeCanvasId, updateMetrics]);

  // Handle single pixel paint / erase
  const handleEnginePixelPaint = useCallback((gx, gy, color) => {
    if (gx < 0 || gx >= GRID_WIDTH || gy < 0 || gy >= GRID_HEIGHT) return;
    const synth = synthRef.current;
    const engine = engineRef.current;

    if (color) {
      const colorDef = getColorByHex(color);
      const metadata = {
        author: sanitizeAuthor(authorCallsign),
        message: sanitizeMessage(transmissionMessage),
        timestamp: Date.now(),
        freq: colorDef.freqLabel
      };

      if (engine) {
        engine.addShockwave(gx, gy, color);
      }

      if (synth) {
        synth.playPixelNote(gx, gy, colorDef.index);
      }

      pixelHudService.paintPixel({
        canvasId: activeCanvasId,
        x: gx,
        y: gy,
        color: color,
        author: metadata.author,
        message: metadata.message,
        freq: metadata.freq
      });
    } else {
      pixelHudService.erasePixel({ canvasId: activeCanvasId, x: gx, y: gy });
    }

    updateMetrics();
  }, [activeCanvasId, authorCallsign, transmissionMessage, updateMetrics]);

  // Handle stamp drop
  const handleEngineStampDrop = useCallback((placement) => {
    const { gx, gy, stampId, pixels = [] } = placement || {};
    const color = pixels[0]?.color || activeColor;
    if (gx < 0 || gx >= GRID_WIDTH || gy < 0 || gy >= GRID_HEIGHT) return;
    const stamp = getStampById(stampId);
    if (!stamp) return;

    if (engineRef.current) {
      engineRef.current.addShockwave(gx, gy, color);
    }

    if (synthRef.current) {
      synthRef.current.playStampChime(gx, gy, stamp.id);
    }

    const metadata = {
      author: sanitizeAuthor(authorCallsign),
      message: sanitizeMessage(transmissionMessage),
      timestamp: Date.now()
    };

    const stampPixels = pixels.length
      ? pixels
      : getStampPixels(stamp, gx, gy, color, metadata.author, metadata.message);

    pixelHudService.dropStamp({
      canvasId: activeCanvasId,
      stampPixels,
      author: metadata.author,
      message: metadata.message,
      centerCoord: { x: gx, y: gy }
    }).catch((err) => {
      console.warn('PixelHUD: stamp was not synced:', err);
    });

    updateMetrics();
  }, [activeCanvasId, activeColor, authorCallsign, transmissionMessage, updateMetrics]);

  // Protected Tile Hit Feedback
  const handleProtectedHit = useCallback((gx, gy, targetData) => {
    const author = targetData?.author || 'another visitor';
    if (synthRef.current) {
      synthRef.current.playProtectedAlert(gx, gy);
    }
    setProtectedToast({
      author,
      gx,
      gy,
      id: Date.now()
    });
  }, []);

  // Hover & Click callbacks
  const handleEnginePixelHover = useCallback((gx, gy, cellData) => {
    if (gx >= 0 && gx < GRID_WIDTH && gy >= 0 && gy < GRID_HEIGHT) {
      setHoveredCoord({ x: gx, y: gy });
      setHoveredCellData(cellData);
    } else {
      setHoveredCoord(null);
      setHoveredCellData(null);
    }
  }, []);

  const handleEnginePixelClick = useCallback((gx, gy, cellData) => {
    setHoveredCoord({ x: gx, y: gy });
    setHoveredCellData(cellData);
    if (cellData && synthRef.current) {
      const cDef = getColorByHex(cellData.color);
      synthRef.current.playPixelNote(gx, gy, cDef.index);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 4. INITIALIZE CANVAS ENGINE
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const engine = new PixelEngine(canvas, null, {
      tool: activeTool,
      activeColor: activeColor,
      activeStampId: activeStampId,
      crtEnabled: crtEnabled,
      bloomEnabled: true,
      gridLinesEnabled: gridLinesEnabled,
      authorCallsign: sanitizeAuthor(authorCallsign),
      transmissionMessage: sanitizeMessage(transmissionMessage),
      sessionId: CLIENT_SESSION_ID,
      onPixelPaint: handleEnginePixelPaint,
      onStampDrop: handleEngineStampDrop,
      onProtectedHit: handleProtectedHit,
      onHistoryChange: ({ canUndo, canRedo }) => {
        setCanUndo(canUndo);
        setCanRedo(canRedo);
      },
      onPixelHover: handleEnginePixelHover,
      onPixelClick: handleEnginePixelClick
    });

    engineRef.current = engine;
    engine.init();

    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
      }
    };

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial cached render
    const getCache = (pixelHudService && typeof pixelHudService.getLocalGridCache === 'function')
      ? pixelHudService.getLocalGridCache.bind(pixelHudService)
      : getLocalGridCache;
    const cached = getCache ? getCache(activeCanvasId) : {};
    if (cached && typeof cached === 'object') {
      Object.entries(cached).forEach(([key, cell]) => {
        const [xStr, yStr] = key.split('_');
        const x = parseInt(xStr, 10);
        const y = parseInt(yStr, 10);
        if (!isNaN(x) && !isNaN(y) && cell && cell.color) {
          engine.setPixel(x, y, cell.color, cell, false);
        }
      });
      updateMetrics();
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Synchronize engine state changes
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (typeof engine.setTool === 'function') engine.setTool(activeTool);
    if (typeof engine.setColor === 'function') {
      engine.setColor(activeColor);
    } else if (typeof engine.setActiveColor === 'function') {
      engine.setActiveColor(activeColor);
    }
    if (typeof engine.setStamp === 'function') {
      engine.setStamp(activeStampId);
    } else if (typeof engine.setActiveStamp === 'function') {
      engine.setActiveStamp(activeStampId);
    }
    if (typeof engine.setAuthor === 'function') engine.setAuthor(sanitizeAuthor(authorCallsign));
    if (typeof engine.setMessage === 'function') engine.setMessage(sanitizeMessage(transmissionMessage));
    if (typeof engine.toggleCrt === 'function') engine.toggleCrt(crtEnabled);
    if (typeof engine.toggleGridLines === 'function') {
      engine.toggleGridLines(gridLinesEnabled);
    }
    if (typeof engine.setIsolatedAuthor === 'function') {
      engine.setIsolatedAuthor(isolatedAuthor);
    }

    engine.onPixelPaint = handleEnginePixelPaint;
    engine.onStampDrop = handleEngineStampDrop;
    engine.onProtectedHit = handleProtectedHit;
    engine.onHistoryChange = ({ canUndo, canRedo }) => {
      setCanUndo(canUndo);
      setCanRedo(canRedo);
    };
    engine.onPixelHover = handleEnginePixelHover;
    engine.onPixelClick = handleEnginePixelClick;
  }, [
    activeTool,
    activeColor,
    activeStampId,
    authorCallsign,
    transmissionMessage,
    crtEnabled,
    gridLinesEnabled,
    isolatedAuthor,
    handleEnginePixelPaint,
    handleEngineStampDrop,
    handleProtectedHit,
    handleEnginePixelHover,
    handleEnginePixelClick
  ]);

  // ─────────────────────────────────────────────────────────────
  // 5. FIREBASE REALTIME SUBSCRIPTIONS
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubGrid = pixelHudService.subscribeToGrid(
      activeCanvasId,
      (initialGrid) => {
        if (engineRef.current && initialGrid) {
          engineRef.current.clearGrid();
          Object.entries(initialGrid).forEach(([key, cell]) => {
            const [xStr, yStr] = key.split('_');
            const x = parseInt(xStr, 10);
            const y = parseInt(yStr, 10);
            if (!isNaN(x) && !isNaN(y) && cell && cell.color) {
              engineRef.current.setPixel(x, y, cell.color, { ...cell, recordHistory: false });
            }
          });
          updateMetrics();
        }
      },
      (key, cell, isRemote, deltaAge) => {
        if (engineRef.current && key && cell) {
          const [xStr, yStr] = key.split('_');
          const x = parseInt(xStr, 10);
          const y = parseInt(yStr, 10);
          if (!isNaN(x) && !isNaN(y)) {
            engineRef.current.setPixel(x, y, cell.color, { ...cell, recordHistory: false });

            if (isRemote && deltaAge < 3500) {
              engineRef.current.addShockwave(x, y, cell.color);
              if (synthRef.current) {
                const cDef = getColorByHex(cell.color);
                synthRef.current.playPixelNote(x, y, cDef.index);
              }
            }
            updateMetrics();
          }
        }
      },
      (key) => {
        if (engineRef.current && key) {
          const [xStr, yStr] = key.split('_');
          const x = parseInt(xStr, 10);
          const y = parseInt(yStr, 10);
          if (!isNaN(x) && !isNaN(y)) {
            engineRef.current.setPixel(x, y, null, { recordHistory: false });
            updateMetrics();
          }
        }
      }
    );

    const unsubTx = pixelHudService.subscribeToTransmissions((txList) => {
      setTransmissions(txList || []);
      setTransmissionsError('');
    }, () => {
      setTransmissionsError('Shared visitor notes are in local mode on this device.');
    });

    const unsubConn = pixelHudService.subscribeToConnectionStatus((online) => {
      setIsOnline(online);
    });

    return () => {
      unsubGrid();
      unsubTx();
      unsubConn();
    };
  }, [activeCanvasId, updateMetrics]);

  // Undo & Redo Handlers
  const handleUndo = useCallback(() => {
    if (!engineRef.current) return;
    const action = engineRef.current.undo();
    if (action && synthRef.current?.playLaserDrop) {
      synthRef.current.playLaserDrop();
    }
    if (engineRef.current) {
      setTotalMarks(engineRef.current.getActiveCellCount());
      setDensity(engineRef.current.getGridDensity());
      setCanUndo(engineRef.current.canUndo());
      setCanRedo(engineRef.current.canRedo());
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (!engineRef.current) return;
    const action = engineRef.current.redo();
    if (action && synthRef.current?.playLaserRise) {
      synthRef.current.playLaserRise();
    }
    if (engineRef.current) {
      setTotalMarks(engineRef.current.getActiveCellCount());
      setDensity(engineRef.current.getGridDensity());
      setCanUndo(engineRef.current.canUndo());
      setCanRedo(engineRef.current.canRedo());
    }
  }, []);

  // Locate and illuminate coordinate
  const handleLocate = (x, y) => {
    if (!engineRef.current || x === undefined || y === undefined) return;
    const nx = Number(x);
    const ny = Number(y);
    if (isNaN(nx) || isNaN(ny)) return;
    engineRef.current.panToCoordinate(nx, ny, 12.0);
    const cell = engineRef.current.getPixel(nx, ny);
    const color = cell?.color || activeColor;
    engineRef.current.addShockwave(nx, ny, color);
    setHoveredCoord({ x: nx, y: ny });
    setHoveredCellData(cell);

    if (synthRef.current?.playShockwaveTone) {
      synthRef.current.playShockwaveTone(nx, ny);
    }
  };

  // Broadcast & drop visitor note
  const handleSaveNote = async ({ author, message }) => {
    handleAuthorChange(author);
    setTransmissionMessage(message);

    const coord = hoveredCoord || { x: 32, y: 32 };
    const colorDef = getColorByHex(activeColor);

    // 1. Paint visible mark on canvas
    if (engineRef.current) {
      engineRef.current.setPixel(coord.x, coord.y, activeColor, {
        author,
        message,
        timestamp: Date.now(),
        freq: colorDef.freqLabel
      });
      engineRef.current.addShockwave(coord.x, coord.y, activeColor);
      setHoveredCoord({ x: coord.x, y: coord.y });
      setHoveredCellData(engineRef.current.getPixel(coord.x, coord.y));
    }

    // 2. Persist to Firebase
    try {
      await pixelHudService.paintPixel({
        canvasId: activeCanvasId,
        x: coord.x,
        y: coord.y,
        color: activeColor,
        author: author,
        message: message,
        freq: colorDef.freqLabel
      });
    } catch (e) { }

    const transmissionResult = await pixelHudService.sendTransmission({
      x: coord.x,
      y: coord.y,
      color: activeColor,
      author: author,
      message: message,
      freq: colorDef.freqLabel
    });

    if (transmissionResult?.transmission) {
      setTransmissions(current => [
        transmissionResult.transmission,
        ...current.filter(item => item.id !== transmissionResult.transmission.id)
      ].slice(0, 50));
    }

    if (synthRef.current) {
      synthRef.current.playShockwaveTone(coord.x, coord.y);
    }

    setPublishSuccessToast(`Note posted as ${author}`);
    updateMetrics();
  };

  // Clear Canvas (local view)
  const handleClearCanvas = () => {
    if (engineRef.current) {
      engineRef.current.clearGrid();
      pixelHudService.clearLocalGridCache(activeCanvasId);
      updateMetrics();
      setCanUndo(false);
      setCanRedo(false);
    }
    setShowClearConfirmModal(false);
  };

  // Inspect metadata for hovered tile
  const matchingTx = (hoveredCoord && Array.isArray(transmissions))
    ? transmissions.find(t => t && t.x === hoveredCoord.x && t.y === hoveredCoord.y)
    : null;
  const inspectedColor = hoveredCellData?.color || hoveredCellData?.c || matchingTx?.color || null;
  const inspectedAuthor = hoveredCellData?.author || hoveredCellData?.a || matchingTx?.author || null;
  const inspectedMessage = (hoveredCellData?.message || hoveredCellData?.m || matchingTx?.message || '').trim();
  const inspectedTimestamp = hoveredCellData?.timestamp || hoveredCellData?.t || matchingTx?.timestamp;
  const hasInspectedData = Boolean(inspectedColor || inspectedAuthor || inspectedMessage);

  return (
    <div className="flex flex-col w-full h-full bg-[#060a14] text-slate-100 font-sans overflow-hidden select-none relative">
      
      {/* ── MINIMAL TOP BAR ── */}
      <header className="h-12 bg-[#0c1424]/90 backdrop-blur-2xl border-b border-cyan-500/20 px-2 sm:px-4 flex items-center justify-between z-30 shrink-0 shadow-sm gap-1 sm:gap-2">
        
        {/* Left: Brand + Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.8)] animate-pulse" />
            <h1 className="text-xs sm:text-sm md:text-base font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-200 to-indigo-300">
              GuestBook
            </h1>
          </div>

          {/* Live Sync Pill */}
          <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] text-slate-300 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="hidden xs:inline">{isOnline ? 'Live' : 'Local'}</span>
          </div>

          {/* Marks Stats (desktop) */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span>{totalMarks} marks</span>
            <span className="text-slate-600">·</span>
            <span>{density}% filled</span>
          </div>
        </div>

        {/* Center: Canvas Room Switcher */}
        <div className="flex items-center bg-[#060a14] border border-white/10 rounded-xl p-0.5 sm:p-1 gap-0.5 sm:gap-1">
          {CANVAS_LIST.map((c) => {
            const isActive = activeCanvasId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCanvas(c.id)}
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="hidden sm:inline">Canvas </span>
                <span>{c.name.split(' ')[1] || c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
          
          {/* Messages Drawer Button */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isDrawerOpen
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
            title="Recent Guestbook Notes"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Notes</span>
            {transmissions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[9px] font-black">
                {transmissions.length}
              </span>
            )}
          </button>

          {/* Leave Note CTA */}
          <button
            onClick={() => setShowSignModal(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-[0_0_15px_rgba(0,240,255,0.35)] active:scale-95 transition-all"
            title="Leave your callsign and note"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Note</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-300 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-400" />}
          </button>

          {/* Recenter Canvas */}
          <button
            onClick={() => engineRef.current?.centerGrid()}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-300 transition-colors hidden md:flex"
            title="Recenter Canvas View"
          >
            <RotateCcw className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* Clear View */}
          <button
            onClick={() => setShowClearConfirmModal(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-rose-950/40 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors hidden md:flex"
            title="Clear Local View"
          >
            <Trash2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* About / Help */}
          <button
            onClick={() => setShowLandingModal(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-cyan-300 transition-colors"
            title="About GuestBook"
          >
            <HelpCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>
        </div>

      </header>

      {/* ── FULL-BLEED CANVAS WORKSPACE ── */}
      <main
        ref={containerRef}
        className="flex-1 w-full h-full bg-[#060a14] relative overflow-hidden flex items-center justify-center cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full touch-none"
          style={{ touchAction: 'none' }}
        />

        {/* ── CONTEXTUAL HOVER INSPECTOR CARD ── */}
        {hoveredCoord && (
          <div className="absolute top-3 left-3 pointer-events-auto z-20 flex flex-col gap-1.5 animate-fade-in max-w-xs">
            {hasInspectedData ? (
              <div className="bg-[#0c1424]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-3 shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-cyan-100 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs shrink-0"
                      style={{
                        backgroundColor: inspectedColor || '#00f0ff',
                        boxShadow: inspectedColor ? `0 0 8px ${inspectedColor}` : 'none'
                      }}
                    />
                    <span className="font-mono font-bold text-xs text-white">
                      [{String(hoveredCoord.x).padStart(2, '0')}, {String(hoveredCoord.y).padStart(2, '0')}]
                    </span>
                    <span className="text-[10px] text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded-md border border-cyan-500/20">
                      {getSectorName(hoveredCoord.x, hoveredCoord.y)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-pink-300 bg-pink-950/60 border border-pink-500/30 px-1.5 py-0.5 rounded-md font-mono">
                      🎵 {getHarmonicNoteForY(hoveredCoord.y).note}
                    </span>
                    <button
                      onClick={() => {
                        setHoveredCoord(null);
                        setHoveredCellData(null);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Dismiss inspector"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1">
                    {inspectedAuthor || '@guest'}
                  </span>
                  {inspectedTimestamp && (
                    <span className="text-[10px] text-slate-400">
                      {formatRelativeTime(inspectedTimestamp)}
                    </span>
                  )}
                </div>

                {inspectedMessage && (
                  <p className="text-xs text-slate-200 bg-black/40 p-2 rounded-xl border border-white/5 leading-relaxed font-sans">
                    "{inspectedMessage}"
                  </p>
                )}

                {inspectedAuthor && (
                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => setIsolatedAuthor(isolatedAuthor === inspectedAuthor ? null : inspectedAuthor)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                        isolatedAuthor === inspectedAuthor
                          ? 'bg-cyan-400 text-black font-bold shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 text-cyan-300'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isolatedAuthor === inspectedAuthor ? 'Spotlight Active' : 'Spotlight Artist'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Minimal hairline coordinate badge for empty cell */
              <div className="bg-[#0c1424]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs text-slate-300 font-mono flex items-center gap-1.5 shadow-sm">
                <Crosshair className="w-3 h-3 text-cyan-400" />
                <span>[{String(hoveredCoord.x).padStart(2, '0')}, {String(hoveredCoord.y).padStart(2, '0')}]</span>
              </div>
            )}
          </div>
        )}


        {/* Author Spotlight Active Banner */}
        {isolatedAuthor && (
          <div className="absolute top-3 right-3 bg-cyan-950/90 backdrop-blur-md border border-cyan-400 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] z-20 animate-fade-in text-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span className="text-cyan-100">Spotlight: <b>{isolatedAuthor}</b></span>
            <button
              onClick={() => setIsolatedAuthor(null)}
              className="p-0.5 text-cyan-400 hover:text-white rounded-full transition-colors"
              title="Clear Spotlight"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Protected Tile Toast */}
        {protectedToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#0c1424]/95 backdrop-blur-md border border-amber-500/50 px-4 py-2 rounded-full shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center gap-2 text-xs text-amber-200 pointer-events-none animate-fade-in">
            <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Protected mark by <b>{protectedToast.author}</b></span>
          </div>
        )}

        {/* Publish / Sign Success Toast */}
        {publishSuccessToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#061522]/98 backdrop-blur-md border border-cyan-400 px-4 py-2 rounded-full shadow-[0_0_25px_rgba(0,240,255,0.5)] flex items-center gap-2 text-xs text-cyan-100 pointer-events-none animate-fade-in font-semibold">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{publishSuccessToast}</span>
          </div>
        )}

        {/* ── FLOATING BOTTOM TOOLBAR DOCK ── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[95vw]">
          <FloatingDock
            activeTool={activeTool}
            onSelectTool={handleSelectTool}
            activeColor={activeColor}
            onSelectColor={setActiveColor}
            activeStampId={activeStampId}
            onSelectStamp={setActiveStampId}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onOpenDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
            transmissionsCount={transmissions.length}
          />
        </div>

      </main>

      {/* ── COLLAPSIBLE BOTTOM DRAWER (MESSAGES) ── */}
      <GuestbookDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transmissions={transmissions}
        transmissionsError={transmissionsError}
        onLocate={handleLocate}
        isolatedAuthor={isolatedAuthor}
        onToggleIsolate={(author) => setIsolatedAuthor(isolatedAuthor === author ? null : author)}
        onOpenSignModal={() => setShowSignModal(true)}
      />

      {/* ── SIGN GUESTBOOK MODAL ── */}
      <SignNoteModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        currentAuthor={authorCallsign}
        currentMessage={transmissionMessage}
        currentColor={activeColor}
        onSave={handleSaveNote}
      />

      {/* ── ABOUT / WELCOME MODAL ── */}
      {showLandingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in font-sans">
          <div className="max-w-md w-full bg-gradient-to-b from-[#0e1628] via-[#090f1e] to-[#060a14] border border-cyan-400/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,240,255,0.25)] text-cyan-100 relative">
            
            <button
              onClick={handleCloseLandingModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black font-bold" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  Welcome to GuestBook
                </h2>
                <p className="text-xs text-cyan-400/80">
                  Shared collaborative pixel canvas
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              Draw, stamp, or sign a note. Every mark syncs live across visitors and plays a unique musical chime.
            </p>

            <div className="grid grid-cols-3 gap-2.5 mb-6">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center text-center">
                <Zap className="w-5 h-5 text-cyan-400 mb-1" />
                <span className="text-[11px] font-bold text-white">Draw & Stamp</span>
                <span className="text-[9px] text-slate-400">Pencil, stamps & pan</span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center text-center">
                <Music className="w-5 h-5 text-pink-400 mb-1" />
                <span className="text-[11px] font-bold text-white">Harmonic Sound</span>
                <span className="text-[9px] text-slate-400">Web audio synthesizer</span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center text-center">
                <Radio className="w-5 h-5 text-emerald-400 mb-1" />
                <span className="text-[11px] font-bold text-white">Leave a Note</span>
                <span className="text-[9px] text-slate-400">Sign with callsign</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowIntroAgain}
                  onChange={(e) => setDontShowIntroAgain(e.target.checked)}
                  className="rounded bg-black/40 border-cyan-500/40 text-cyan-400 cursor-pointer"
                />
                <span>Don't show again</span>
              </label>

              <button
                onClick={handleCloseLandingModal}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all active:scale-95"
              >
                Get Started →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── CLEAR CANVAS CONFIRM MODAL ── */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="max-w-sm w-full bg-[#0c1424] border border-rose-500/40 rounded-3xl p-5 shadow-[0_0_35px_rgba(244,63,94,0.3)] text-cyan-100 relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-200">Clear Canvas?</h3>
                <p className="text-xs text-rose-400/80">Clear local canvas view</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              This clears the local board view on this device without deleting shared visitor marks on the live server.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCanvas}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-colors"
              >
                Clear view
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export const displayPixelHud = () => <PixelHud />;
export default PixelHud;

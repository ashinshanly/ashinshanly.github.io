/**
 * PixelHUD 64x64 Canvas 2D Engine
 * 
 * High-performance HTML5 2D canvas matrix renderer featuring:
 * - 64x64 matrix grid state with offscreen buffer
 * - Retina / High-DPI backing store scaling
 * - 2D transformation matrix: Smooth Pan & Focal-Point Zoom
 * - Multi-pass Neon Bloom glow compositor
 * - Shockwave particle pool with expanding ripple rings
 * - Sci-Fi coordinate reticle crosshair & target lock
 * - Author isolation spotlight filter
 * - CRT scanline & vignette shader toggle
 * - Mouse & Touch gestures (Bresenham drag-paint, pinch-to-zoom, pan)
 */

import { PALETTE, getColorByHex, isEraser, getRgbaString } from './palette.js';
import { getStampById, getStampPixels } from './stamps.js';

export const GRID_WIDTH = 64;
export const GRID_HEIGHT = 64;
export const TOTAL_CELLS = GRID_WIDTH * GRID_HEIGHT;

export class PixelEngine {
  /**
   * @param {HTMLCanvasElement} canvas 
   * @param {HTMLCanvasElement|null} [offscreenBuffer=null]
   * @param {object} [options={}]
   */
  constructor(canvas, offscreenBuffer = null, options = {}) {
    if (!canvas) {
      throw new Error('PixelEngine: Target canvas element is required.');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.options = options;

    // Offscreen 64x64 buffer for ultra-fast compositing
    this.offscreenCanvas = offscreenBuffer || (typeof document !== 'undefined' ? document.createElement('canvas') : null);
    if (this.offscreenCanvas) {
      this.offscreenCanvas.width = GRID_WIDTH;
      this.offscreenCanvas.height = GRID_HEIGHT;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    } else {
      this.offscreenCtx = null;
    }

    // Grid data store: Array of 4096 cells
    // Cell format: { color: string, author: string, message: string, timestamp: number, freq: string } | null
    this.grid = new Array(TOTAL_CELLS).fill(null);

    // Transformation Matrix State
    this.scale = 10;          // Pixel size in screen pixels
    this.minScale = 2.0;      // Zoom out limit
    this.maxScale = 40.0;     // Zoom in limit
    this.panX = 0;            // Screen pixel offset X
    this.panY = 0;            // Screen pixel offset Y
    this.dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    // View & Shader Settings
    this.crtEnabled = options.crtEnabled ?? false;
    this.bloomEnabled = options.bloomEnabled ?? true;
    this.gridLinesEnabled = options.gridLinesEnabled ?? true;
    this.isolatedAuthor = null;
    this.hoveredCell = null; // { gx, gy, inBounds }

    // Interaction State
    this.activeTool = options.tool || 'paint'; // 'paint', 'stamp', 'eraser', 'pan', 'inspect'
    this.activeColor = options.activeColor || '#00f0ff';
    this.activeStampId = options.activeStampId || 'space_invader';
    this.authorCallsign = options.authorCallsign || '@guest';
    this.transmissionMessage = options.transmissionMessage || '';
    this.sessionId = options.sessionId || null;

    this.isMouseDown = false;
    this.isPanning = false;
    this.dragStart = { x: 0, y: 0 };
    this.panStart = { x: 0, y: 0 };
    this.lastPaintedCell = null; // { gx, gy } for Bresenham interpolation

    // Touch gesture state
    this.touchStartDist = 0;
    this.touchStartScale = 10;
    this.touchStartMidpoint = { x: 0, y: 0 };
    this.touchPanStart = { x: 0, y: 0 };
    this.isPinching = false;

    // Shockwave Particle FX Pool
    this.shockwaves = [];
    this.maxShockwaves = 32;

    // History (Undo / Redo) State
    this.undoStack = [];
    this.redoStack = [];
    this.currentStrokeChanges = [];
    this.isRecordingHistory = false;

    // Callbacks
    this.onPixelClick = options.onPixelClick || null;
    this.onPixelHover = options.onPixelHover || null;
    this.onPixelPaint = options.onPixelPaint || null;
    this.onStampDrop = options.onStampDrop || null;
    this.onProtectedHit = options.onProtectedHit || null;
    this.onHistoryChange = options.onHistoryChange || null;
    this.onTransformChange = options.onTransformChange || null;
    this.onGridChange = options.onGridChange || null;

    // Animation Loop
    this.rafId = null;
    this.isRunning = false;
    this.lastFrameTime = performance.now();

    // Bind Event Listeners
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this._handleWheel = this._handleWheel.bind(this);
    this._handleContextMenu = this._handleContextMenu.bind(this);
    this._handleTouchStart = this._handleTouchStart.bind(this);
    this._handleTouchMove = this._handleTouchMove.bind(this);
    this._handleTouchEnd = this._handleTouchEnd.bind(this);
    this._animate = this._animate.bind(this);
  }

  /**
   * Initialize engine, resize canvas, center grid, attach listeners, and start render loop
   */
  init() {
    this.resize();
    this.centerGrid();
    this._attachEventListeners();
    this.isRunning = true;
    if (typeof requestAnimationFrame !== 'undefined') {
      this.rafId = requestAnimationFrame(this._animate);
    }
  }

  /**
   * Resize canvas backing store to match parent container and Retina DPI
   */
  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement 
      ? this.canvas.parentElement.getBoundingClientRect()
      : this.canvas.getBoundingClientRect();

    const width = Math.max(100, Math.floor(rect.width || 600));
    const height = Math.max(100, Math.floor(rect.height || 600));

    this.dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    this.canvas.width = Math.floor(width * this.dpr);
    this.canvas.height = Math.floor(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.render();
  }

  /**
   * Fit canvas to parent container (alias to resize)
   * @param {number} [width]
   * @param {number} [height]
   */
  fitToContainer(width, height) {
    this.resize();
  }

  /**
   * Center the 64x64 matrix inside current canvas viewport with proportional margin
   */
  centerGrid() {
    if (!this.canvas) return;
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    const margin = 32;

    const availableW = Math.max(50, w - margin * 2);
    const availableH = Math.max(50, h - margin * 2);
    const bestScale = Math.min(availableW / GRID_WIDTH, availableH / GRID_HEIGHT);

    this.scale = Math.max(this.minScale, Math.min(this.maxScale, bestScale));
    this.panX = Math.round((w - (GRID_WIDTH * this.scale)) / 2);
    this.panY = Math.round((h - (GRID_HEIGHT * this.scale)) / 2);

    if (this.onTransformChange) {
      this.onTransformChange({ scale: this.scale, panX: this.panX, panY: this.panY });
    }
  }

  /**
   * Focus a grid coordinate in the viewport. Used by the visitor activity
   * feed and inspector so a selected message has an obvious visual result.
   */
  panToCoordinate(gx, gy, targetScale = 14) {
    if (!this.canvas) return false;
    const x = Math.max(0, Math.min(GRID_WIDTH - 1, Math.floor(Number(gx))));
    const y = Math.max(0, Math.min(GRID_HEIGHT - 1, Math.floor(Number(gy))));
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;

    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, Number(targetScale) || this.scale));
    this.panX = Math.round(width / 2 - (x + 0.5) * this.scale);
    this.panY = Math.round(height / 2 - (y + 0.5) * this.scale);
    this.setHoveredCell(x, y);

    if (this.onTransformChange) {
      this.onTransformChange({ scale: this.scale, panX: this.panX, panY: this.panY });
    }
    return true;
  }

  /**
   * Convert Screen / Client coordinates to Grid coordinates
   * @param {number} clientX 
   * @param {number} clientY 
   * @returns {{ gx: number, gy: number, inBounds: boolean, worldX: number, worldY: number }}
   */
  screenToWorld(clientX, clientY) {
    if (!this.canvas) return { gx: -1, gy: -1, inBounds: false, worldX: -1, worldY: -1 };
    const rect = this.canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const worldX = (screenX - this.panX) / this.scale;
    const worldY = (screenY - this.panY) / this.scale;

    const gx = Math.floor(worldX);
    const gy = Math.floor(worldY);
    const inBounds = gx >= 0 && gx < GRID_WIDTH && gy >= 0 && gy < GRID_HEIGHT;

    return { gx, gy, inBounds, worldX, worldY };
  }

  /**
   * Convert Grid coordinates to Screen coordinates
   * @param {number} gx 
   * @param {number} gy 
   * @returns {{ x: number, y: number, size: number }}
   */
  worldToScreen(gx, gy) {
    return {
      x: gx * this.scale + this.panX,
      y: gy * this.scale + this.panY,
      size: this.scale
    };
  }

  /**
   * Zoom towards/from a focal point on screen while keeping world point fixed
   * @param {number} focalX - Screen X
   * @param {number} focalY - Screen Y
   * @param {number} zoomDelta - Multiplier (e.g. 1.1 or 0.9)
   */
  zoomAtPoint(focalX, focalY, zoomDelta) {
    const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale * zoomDelta));
    if (Math.abs(newScale - this.scale) < 0.001) return;

    // World point under focal point
    const worldX = (focalX - this.panX) / this.scale;
    const worldY = (focalY - this.panY) / this.scale;

    this.panX = focalX - worldX * newScale;
    this.panY = focalY - worldY * newScale;
    this.scale = newScale;

    if (this.onTransformChange) {
      this.onTransformChange({ scale: this.scale, panX: this.panX, panY: this.panY });
    }
  }

  /**
   * Pan canvas by delta pixels
   * @param {number} deltaX 
   * @param {number} deltaY 
   */
  pan(deltaX, deltaY) {
    this.panX += deltaX;
    this.panY += deltaY;

    if (this.onTransformChange) {
      this.onTransformChange({ scale: this.scale, panX: this.panX, panY: this.panY });
    }
  }

  /**
   * Set single cell data in matrix and update offscreen buffer
   * @param {number} gx 
   * @param {number} gy 
   * @param {string|null} color - Hex color or null to erase
   * @param {object} [metadata={}]
   */
  setPixel(gx, gy, color, rawMetadata = {}) {
    const metadata = rawMetadata || {};
    if (gx < 0 || gx >= GRID_WIDTH || gy < 0 || gy >= GRID_HEIGHT) return;

    const index = gy * GRID_WIDTH + gx;
    const prevCell = this.grid[index] ? { ...this.grid[index] } : null;
    const erasing = !color || isEraser(color);

    if (erasing) {
      this.grid[index] = null;
      if (this.offscreenCtx) {
        this.offscreenCtx.clearRect(gx, gy, 1, 1);
      }
    } else {
      const cellData = {
        color,
        author: metadata.author || this.authorCallsign || '@guest',
        message: metadata.message || '',
        timestamp: metadata.timestamp || Date.now(),
        freq: metadata.freq || getColorByHex(color)?.freqLabel || '2.40 kHz'
      };
      this.grid[index] = cellData;

      if (this.offscreenCtx) {
        this.offscreenCtx.fillStyle = color;
        this.offscreenCtx.fillRect(gx, gy, 1, 1);
      }
    }

    // Track stroke mutations if currently recording user interactions
    if (metadata.recordHistory !== false && this.isRecordingHistory) {
      const alreadyTracked = this.currentStrokeChanges.some(c => c.gx === gx && c.gy === gy);
      if (!alreadyTracked) {
        this.currentStrokeChanges.push({
          gx,
          gy,
          prevCell: prevCell,
          newCell: this.grid[index] ? { ...this.grid[index] } : null
        });
      }
    }

    if (this.onGridChange) {
      this.onGridChange({
        activeCount: this.getActiveCellCount(),
        density: this.getGridDensity()
      });
    }
  }

  /**
   * Get cell data at grid coordinate
   * @param {number} gx 
   * @param {number} gy 
   * @returns {object|null}
   */
  getPixel(gx, gy) {
    if (gx < 0 || gx >= GRID_WIDTH || gy < 0 || gy >= GRID_HEIGHT) return null;
    return this.grid[gy * GRID_WIDTH + gx];
  }

  /**
   * Check if a coordinate is protected by another visitor
   * @param {number} gx
   * @param {number} gy
   * @param {string} [currentAuthor]
   * @returns {boolean}
   */
  isPixelProtected(gx, gy, currentAuthor = this.authorCallsign) {
    if (gx < 0 || gx >= GRID_WIDTH || gy < 0 || gy >= GRID_HEIGHT) return false;
    const existing = this.grid[gy * GRID_WIDTH + gx];
    if (!existing || !existing.color || isEraser(existing.color)) return false;

    const existingAuthor = (existing.author || existing.a || '').trim().toLowerCase();
    const current = (currentAuthor || this.authorCallsign || '').trim().toLowerCase();

    // If existing cell has an author:
    if (existingAuthor) {
      if (!current) return true;
      if (existingAuthor !== current) return true;

      // If both say generic '@guest', protect against different sessions
      if (existingAuthor === '@guest' && (existing.session || existing.s) && this.sessionId) {
        const cellSession = existing.session || existing.s;
        if (cellSession !== this.sessionId) {
          return true;
        }
      }
      return false;
    }

    // If existing cell has no author string at all, protect if it belongs to another session
    if ((existing.session || existing.s) && this.sessionId) {
      return (existing.session || existing.s) !== this.sessionId;
    }

    return false;
  }

  /**
   * Check if there are actions to undo
   * @returns {boolean}
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if there are actions to redo
   * @returns {boolean}
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Undo last paint, erase, or stamp action
   * @returns {Array<object>|null}
   */
  undo() {
    if (this.undoStack.length === 0) return null;
    const action = this.undoStack.pop();

    for (let i = action.length - 1; i >= 0; i--) {
      const change = action[i];
      const prevColor = change.prevCell?.color || null;
      this.setPixel(change.gx, change.gy, prevColor, {
        ...(change.prevCell || {}),
        recordHistory: false
      });
      if (this.onPixelPaint) {
        this.onPixelPaint(change.gx, change.gy, prevColor);
      }
    }

    this.redoStack.push(action);
    if (this.onHistoryChange) {
      this.onHistoryChange({ canUndo: this.canUndo(), canRedo: this.canRedo() });
    }
    return action;
  }

  /**
   * Redo previously undone action
   * @returns {Array<object>|null}
   */
  redo() {
    if (this.redoStack.length === 0) return null;
    const action = this.redoStack.pop();

    for (let i = 0; i < action.length; i++) {
      const change = action[i];
      const newColor = change.newCell?.color || null;
      this.setPixel(change.gx, change.gy, newColor, {
        ...(change.newCell || {}),
        recordHistory: false
      });
      if (this.onPixelPaint) {
        this.onPixelPaint(change.gx, change.gy, newColor);
      }
    }

    this.undoStack.push(action);
    if (this.onHistoryChange) {
      this.onHistoryChange({ canUndo: this.canUndo(), canRedo: this.canRedo() });
    }
    return action;
  }

  /**
   * Apply an 8x8 stamp at target grid center, preserving other visitors' protected pixels
   * @param {number} gx 
   * @param {number} gy 
   * @param {string|object} stampOrId 
   * @param {string} color 
   * @param {object} [metadata={}]
   * @returns {Array<object>} array of placed pixels
   */
  applyStamp(gx, gy, stampOrId, color = this.activeColor, rawMetadata = {}) {
    const metadata = rawMetadata || {};
    const currentAuthor = metadata.author || this.authorCallsign || '@guest';
    const stampPixels = getStampPixels(
      stampOrId,
      gx,
      gy,
      color,
      currentAuthor,
      metadata.message || this.transmissionMessage
    );

    const validPixels = [];
    const stampChanges = [];
    let protectedCount = 0;

    stampPixels.forEach(p => {
      if (this.isPixelProtected(p.x, p.y, currentAuthor)) {
        protectedCount++;
      } else {
        const prevCell = this.getPixel(p.x, p.y) ? { ...this.getPixel(p.x, p.y) } : null;
        this.setPixel(p.x, p.y, p.color, { ...p, recordHistory: false });
        validPixels.push(p);
        stampChanges.push({
          gx: p.x,
          gy: p.y,
          prevCell: prevCell,
          newCell: this.getPixel(p.x, p.y) ? { ...this.getPixel(p.x, p.y) } : null
        });
      }
    });

    if (protectedCount > 0 && this.onProtectedHit) {
      this.onProtectedHit(gx, gy, { protectedCount });
    }

    if (validPixels.length > 0) {
      if (metadata.recordHistory !== false) {
        this.undoStack.push(stampChanges);
        if (this.undoStack.length > 50) this.undoStack.shift();
        this.redoStack = [];
        if (this.onHistoryChange) {
          this.onHistoryChange({ canUndo: this.canUndo(), canRedo: this.canRedo() });
        }
      }

      this.addShockwave(gx, gy, color);
      if (this.onStampDrop) {
        this.onStampDrop({
          gx,
          gy,
          stampId: typeof stampOrId === 'string' ? stampOrId : stampOrId.id,
          pixels: validPixels
        });
      }
    }

    return validPixels;
  }

  /**
   * Spawn a live expanding shockwave ripple particle
   * @param {number} gx 
   * @param {number} gy 
   * @param {string} [color='#00f0ff']
   */
  addShockwave(gx, gy, color = '#00f0ff') {
    if (this.shockwaves.length >= this.maxShockwaves) {
      this.shockwaves.shift(); // Remove oldest
    }

    this.shockwaves.push({
      gx,
      gy,
      color,
      radius: 0.5,
      maxRadius: 14.0, // Grid cell radii
      speed: 16.0,     // Cells per second
      alpha: 1.0,
      birthTime: performance.now()
    });
  }

  /**
   * Update hovered cell for reticle target lock and inspector
   * @param {number} gx 
   * @param {number} gy 
   */
  setHoveredCell(gx, gy) {
    const inBounds = gx >= 0 && gx < GRID_WIDTH && gy >= 0 && gy < GRID_HEIGHT;
    this.hoveredCell = inBounds ? { gx, gy, inBounds: true } : null;

    if (this.onPixelHover) {
      const cellData = inBounds ? this.getPixel(gx, gy) : null;
      this.onPixelHover(gx, gy, cellData);
    }
  }

  /**
   * Highlight only pixels by a specific author, dimming all other pixels
   * @param {string|null} authorOrNull 
   */
  setIsolatedAuthor(authorOrNull) {
    this.isolatedAuthor = authorOrNull || null;
  }

  /**
   * Toggle CRT scanline & vignette shader overlay
   * @param {boolean} enabled 
   */
  toggleCrt(enabled) {
    this.crtEnabled = !!enabled;
  }

  /**
   * Set active tool mode
   * @param {'paint'|'stamp'|'eraser'|'pan'|'inspect'} tool 
   */
  setTool(tool) {
    this.activeTool = tool;
  }

  setActiveTool(tool) {
    this.setTool(tool);
  }

  /**
   * Set active drawing color
   * @param {string} hexColor 
   */
  setSelectedColor(hexColor) {
    this.activeColor = hexColor;
  }

  setActiveColor(hexColor) {
    this.setSelectedColor(hexColor);
  }

  setColor(hexColor) {
    this.setSelectedColor(hexColor);
  }

  /**
   * Set active stamp ID
   * @param {string} stampId 
   */
  setSelectedStamp(stampId) {
    this.activeStampId = stampId;
  }

  setActiveStamp(stampId) {
    this.setSelectedStamp(stampId);
  }

  setStamp(stampId) {
    this.setSelectedStamp(stampId);
  }

  /**
   * Toggle grid lines visibility
   * @param {boolean} enabled
   */
  toggleGrid(enabled) {
    this.gridLinesEnabled = !!enabled;
  }

  toggleGridLines(enabled) {
    this.toggleGrid(enabled);
  }

  /**
   * Set author callsign for painted pixels
   * @param {string} author
   */
  setAuthor(author) {
    this.authorCallsign = author || '@guest';
  }

  /**
   * Set transmission message for painted pixels
   * @param {string} message
   */
  setMessage(message) {
    this.transmissionMessage = message || '';
  }

  /**
   * Count how many non-empty pixels are currently placed
   * @returns {number}
   */
  getActiveCellCount() {
    let count = 0;
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (this.grid[i] !== null) count++;
    }
    return count;
  }

  /**
   * Get grid density percentage (0.00% to 100.00%)
   * @returns {number}
   */
  getGridDensity() {
    const count = this.getActiveCellCount();
    return Number(((count / TOTAL_CELLS) * 100).toFixed(2));
  }

  /**
   * Clear all pixels in grid
   */
  clearGrid() {
    this.grid.fill(null);
    if (this.offscreenCtx) {
      this.offscreenCtx.clearRect(0, 0, GRID_WIDTH, GRID_HEIGHT);
    }
    if (this.onGridChange) {
      this.onGridChange({ activeCount: 0, density: 0 });
    }
  }

  /**
   * Load bulk grid state (e.g. from Firebase delta sync or snapshot)
   * @param {object|Array} gridData 
   */
  loadGrid(gridData) {
    if (!gridData) return;
    this.clearGrid();

    if (Array.isArray(gridData)) {
      gridData.forEach((cell, index) => {
        if (cell && index < TOTAL_CELLS) {
          const gx = index % GRID_WIDTH;
          const gy = Math.floor(index / GRID_WIDTH);
          this.setPixel(gx, gy, cell.color, cell);
        }
      });
    } else if (typeof gridData === 'object') {
      Object.keys(gridData).forEach(key => {
        const cell = gridData[key];
        if (cell) {
          const parts = key.split('_');
          if (parts.length === 2) {
            const gx = parseInt(parts[0], 10);
            const gy = parseInt(parts[1], 10);
            if (!isNaN(gx) && !isNaN(gy)) {
              this.setPixel(gx, gy, cell.color, cell);
            }
          }
        }
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER PIPELINE
     ───────────────────────────────────────────────────────────── */

  /**
   * Main animation frame loop
   */
  _animate(time) {
    if (!this.isRunning) return;

    const dt = Math.min(0.1, (time - this.lastFrameTime) / 1000);
    this.lastFrameTime = time;

    // Update shockwave particles
    this._updateShockwaves(dt);

    // Render frame
    this.render();

    if (typeof requestAnimationFrame !== 'undefined') {
      this.rafId = requestAnimationFrame(this._animate);
    }
  }

  /**
   * Update shockwave physics and decay
   */
  _updateShockwaves(dt) {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * dt;
      sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));

      if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  /**
   * Render complete multi-pass canvas frame
   */
  render() {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // ── PASS 1: Base Background & Matrix Frame ──
    const cssW = w / this.dpr;
    const cssH = h / this.dpr;

    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, cssW, cssH);

    // Draw Grid Bounding Box Area
    const gridScreenX = this.panX;
    const gridScreenY = this.panY;
    const gridScreenW = GRID_WIDTH * this.scale;
    const gridScreenH = GRID_HEIGHT * this.scale;

    // Background tile inside grid bounds
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(gridScreenX, gridScreenY, gridScreenW, gridScreenH);

    // ── PASS 2: Pixel Matrix Rendering ──
    this._renderPixels(ctx);

    // ── PASS 3: Grid Lines (Visible when zoomed in) ──
    if (this.gridLinesEnabled && this.scale >= 5.0) {
      this._renderGridLines(ctx, gridScreenX, gridScreenY, gridScreenW, gridScreenH);
    }

    // Grid outer neon border
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gridScreenX - 0.5, gridScreenY - 0.5, gridScreenW + 1, gridScreenH + 1);

    // ── PASS 4: Shockwave Expanding Ripple Rings ──
    this._renderShockwaves(ctx);

    // ── PASS 5: Hovered Cell Reticle & HUD Bracket ──
    if (this.hoveredCell && this.hoveredCell.inBounds) {
      this._renderReticle(ctx, this.hoveredCell.gx, this.hoveredCell.gy);
    }

    // ── PASS 6: CRT Scanlines (if enabled) ──
    if (this.crtEnabled) {
      this._renderCrtScanlines(ctx, cssW, cssH);
    }

    ctx.restore();
  }

  /**
   * Render all grid pixels with neon bloom and author isolation
   */
  _renderPixels(ctx) {
    const isIso = !!this.isolatedAuthor;

    for (let gy = 0; gy < GRID_HEIGHT; gy++) {
      for (let gx = 0; gx < GRID_WIDTH; gx++) {
        const cell = this.grid[gy * GRID_WIDTH + gx];
        if (!cell) continue;

        const screenX = gx * this.scale + this.panX;
        const screenY = gy * this.scale + this.panY;
        const size = this.scale;

        // Viewport culling
        const canvasW = this.canvas.width / this.dpr;
        const canvasH = this.canvas.height / this.dpr;
        if (screenX + size < 0 || screenX > canvasW || screenY + size < 0 || screenY > canvasH) {
          continue;
        }

        const isAuthorMatch = !isIso || (cell.author && cell.author.toLowerCase() === this.isolatedAuthor.toLowerCase());

        if (isAuthorMatch) {
          // Full neon glow
          ctx.fillStyle = cell.color;
          ctx.fillRect(screenX, screenY, size, size);

          // Subtle internal core highlight
          if (size >= 8) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fillRect(screenX + 1, screenY + 1, size - 2, size - 2);
          }
        } else {
          // Dimmed author isolation mode
          ctx.fillStyle = getRgbaString(cell.color, 0.12);
          ctx.fillRect(screenX, screenY, size, size);
        }
      }
    }
  }

  /**
   * Render subtle cyber grid lines
   */
  _renderGridLines(ctx, startX, startY, totalW, totalH) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Vertical lines
    for (let x = 0; x <= GRID_WIDTH; x++) {
      const px = Math.round(startX + x * this.scale) + 0.5;
      ctx.moveTo(px, startY);
      ctx.lineTo(px, startY + totalH);
    }

    // Horizontal lines
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      const py = Math.round(startY + y * this.scale) + 0.5;
      ctx.moveTo(startX, py);
      ctx.lineTo(startX + totalW, py);
    }

    ctx.stroke();
    ctx.restore();
  }

  /**
   * Render shockwave ripple rings
   */
  _renderShockwaves(ctx) {
    if (this.shockwaves.length === 0) return;

    ctx.save();
    this.shockwaves.forEach(sw => {
      const centerScreenX = (sw.gx + 0.5) * this.scale + this.panX;
      const centerScreenY = (sw.gy + 0.5) * this.scale + this.panY;
      const pixelRadius = sw.radius * this.scale;

      // Outer ring
      ctx.strokeStyle = getRgbaString(sw.color, sw.alpha * 0.85);
      ctx.lineWidth = Math.max(1.5, this.scale * 0.15);
      ctx.beginPath();
      ctx.arc(centerScreenX, centerScreenY, pixelRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner soft ring
      if (pixelRadius > 4) {
        ctx.strokeStyle = getRgbaString('#ffffff', sw.alpha * 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerScreenX, centerScreenY, Math.max(1, pixelRadius - 3), 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  /**
   * Render Sci-Fi HUD reticle on hovered grid cell or stamp bounds
   */
  _renderReticle(ctx, gx, gy) {
    if (gx < 0 || gx >= GRID_WIDTH || gy < 0 || gy >= GRID_HEIGHT) return;

    if (this.activeTool === 'stamp') {
      const stamp = getStampById(this.activeStampId);
      const stampW = stamp?.width || 5;
      const stampH = stamp?.height || 5;
      const halfW = Math.floor(stampW / 2);
      const halfH = Math.floor(stampH / 2);
      const startGx = gx - halfW;
      const startGy = gy - halfH;

      const screenBoxX = startGx * this.scale + this.panX;
      const screenBoxY = startGy * this.scale + this.panY;
      const totalW = stampW * this.scale;
      const totalH = stampH * this.scale;
      const cornerLen = Math.max(4, Math.min(12, this.scale * 0.6));

      ctx.save();

      // Render 5x5 stamp pixels ghost
      const stampPixels = getStampPixels(this.activeStampId, gx, gy, this.activeColor);
      ctx.fillStyle = getRgbaString(this.activeColor, 0.55);
      for (let i = 0; i < stampPixels.length; i++) {
        const p = stampPixels[i];
        const px = p.x * this.scale + this.panX;
        const py = p.y * this.scale + this.panY;
        ctx.fillRect(px, py, this.scale, this.scale);
      }

      // Stamp Bounding Box Reticle
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = Math.max(1.5, this.scale * 0.08);

      // Top-Left Corner
      ctx.beginPath();
      ctx.moveTo(screenBoxX - 2, screenBoxY + cornerLen);
      ctx.lineTo(screenBoxX - 2, screenBoxY - 2);
      ctx.lineTo(screenBoxX + cornerLen, screenBoxY - 2);
      ctx.stroke();

      // Top-Right Corner
      ctx.beginPath();
      ctx.moveTo(screenBoxX + totalW + 2 - cornerLen, screenBoxY - 2);
      ctx.lineTo(screenBoxX + totalW + 2, screenBoxY - 2);
      ctx.lineTo(screenBoxX + totalW + 2, screenBoxY + cornerLen);
      ctx.stroke();

      // Bottom-Left Corner
      ctx.beginPath();
      ctx.moveTo(screenBoxX - 2, screenBoxY + totalH + 2 - cornerLen);
      ctx.lineTo(screenBoxX - 2, screenBoxY + totalH + 2);
      ctx.lineTo(screenBoxX + cornerLen, screenBoxY + totalH + 2);
      ctx.stroke();

      // Bottom-Right Corner
      ctx.beginPath();
      ctx.moveTo(screenBoxX + totalW + 2 - cornerLen, screenBoxY + totalH + 2);
      ctx.lineTo(screenBoxX + totalW + 2, screenBoxY + totalH + 2);
      ctx.lineTo(screenBoxX + totalW + 2, screenBoxY + totalH + 2 - cornerLen);
      ctx.stroke();

      ctx.restore();
      return;
    }

    const x = gx * this.scale + this.panX;
    const y = gy * this.scale + this.panY;
    const size = this.scale;
    const cornerLen = Math.max(3, Math.min(8, size * 0.35));

    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = Math.max(1.5, size * 0.08);

    // Top-Left Corner
    ctx.beginPath();
    ctx.moveTo(x - 2, y + cornerLen);
    ctx.lineTo(x - 2, y - 2);
    ctx.lineTo(x + cornerLen, y - 2);
    ctx.stroke();

    // Top-Right Corner
    ctx.beginPath();
    ctx.moveTo(x + size + 2 - cornerLen, y - 2);
    ctx.lineTo(x + size + 2, y - 2);
    ctx.lineTo(x + size + 2, y + cornerLen);
    ctx.stroke();

    // Bottom-Left Corner
    ctx.beginPath();
    ctx.moveTo(x - 2, y + size + 2 - cornerLen);
    ctx.lineTo(x - 2, y + size + 2);
    ctx.lineTo(x + cornerLen, y + size + 2);
    ctx.stroke();

    // Bottom-Right Corner
    ctx.beginPath();
    ctx.moveTo(x + size + 2 - cornerLen, y + size + 2);
    ctx.lineTo(x + size + 2, y + size + 2);
    ctx.lineTo(x + size + 2, y + size + 2 - cornerLen);
    ctx.stroke();

    // Crosshair Laser Center Dots
    if (this.activeTool === 'paint' || this.activeTool === 'eraser') {
      ctx.fillStyle = this.activeTool === 'eraser' ? 'rgba(255, 0, 127, 0.4)' : getRgbaString(this.activeColor, 0.4);
      ctx.fillRect(x, y, size, size);
    }

    ctx.restore();
  }

  /**
   * Render CRT Scanline shader overlay directly onto canvas
   */
  _renderCrtScanlines(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();
  }

  /* ─────────────────────────────────────────────────────────────
     EVENT HANDLING (MOUSE, TOUCH, WHEEL)
     ───────────────────────────────────────────────────────────── */

  _attachEventListeners() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', this._handleMouseDown);
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this._handleMouseMove);
      window.addEventListener('mouseup', this._handleMouseUp);
    }
    this.canvas.addEventListener('wheel', this._handleWheel, { passive: false });
    this.canvas.addEventListener('contextmenu', this._handleContextMenu);

    // Touch events
    this.canvas.addEventListener('touchstart', this._handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this._handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this._handleTouchEnd, { passive: false });
  }

  _detachEventListeners() {
    if (!this.canvas) return;

    this.canvas.removeEventListener('mousedown', this._handleMouseDown);
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this._handleMouseMove);
      window.removeEventListener('mouseup', this._handleMouseUp);
    }
    this.canvas.removeEventListener('wheel', this._handleWheel);
    this.canvas.removeEventListener('contextmenu', this._handleContextMenu);

    this.canvas.removeEventListener('touchstart', this._handleTouchStart);
    this.canvas.removeEventListener('touchmove', this._handleTouchMove);
    this.canvas.removeEventListener('touchend', this._handleTouchEnd);
  }

  _handleContextMenu(e) {
    e.preventDefault(); // Prevent browser context menu on right click
  }

  _handleMouseDown(e) {
    const isRightClick = e.button === 2;
    const isMiddleClick = e.button === 1;
    const isSpacePan = e.button === 0 && (e.spaceKey || this.activeTool === 'pan');

    const coords = this.screenToWorld(e.clientX, e.clientY);

    if (isRightClick || isMiddleClick || isSpacePan) {
      this.isPanning = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.panStart = { x: this.panX, y: this.panY };
      return;
    }

    if (e.button === 0) {
      this.isMouseDown = true;
      this.lastPaintedCell = null;

      if (coords.inBounds) {
        if (this.activeTool === 'paint' || this.activeTool === 'eraser') {
          this.isRecordingHistory = true;
          this.currentStrokeChanges = [];
        }
        this._executeToolAction(coords.gx, coords.gy);
        this.lastPaintedCell = { gx: coords.gx, gy: coords.gy };
      }
    }
  }

  _handleMouseMove(e) {
    const coords = this.screenToWorld(e.clientX, e.clientY);
    this.setHoveredCell(coords.gx, coords.gy);

    if (this.isPanning) {
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      this.panX = this.panStart.x + dx;
      this.panY = this.panStart.y + dy;

      if (this.onTransformChange) {
        this.onTransformChange({ scale: this.scale, panX: this.panX, panY: this.panY });
      }
      return;
    }

    if (this.isMouseDown && (this.activeTool === 'paint' || this.activeTool === 'eraser')) {
      if (coords.inBounds) {
        if (!this.lastPaintedCell || (this.lastPaintedCell.gx !== coords.gx || this.lastPaintedCell.gy !== coords.gy)) {
          // Bresenham interpolation to avoid missing pixels on fast drag
          if (this.lastPaintedCell) {
            this._drawBresenhamLine(this.lastPaintedCell.gx, this.lastPaintedCell.gy, coords.gx, coords.gy);
          } else {
            this._executeToolAction(coords.gx, coords.gy);
          }
          this.lastPaintedCell = { gx: coords.gx, gy: coords.gy };
        }
      }
    }
  }

  _handleMouseUp(e) {
    this.isMouseDown = false;
    this.isPanning = false;
    this.lastPaintedCell = null;

    if (this.isRecordingHistory) {
      this.isRecordingHistory = false;
      if (this.currentStrokeChanges.length > 0) {
        this.undoStack.push(this.currentStrokeChanges);
        if (this.undoStack.length > 50) this.undoStack.shift();
        this.redoStack = [];
        this.currentStrokeChanges = [];
        if (this.onHistoryChange) {
          this.onHistoryChange({ canUndo: this.canUndo(), canRedo: this.canRedo() });
        }
      }
    }
  }

  _handleWheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const focalX = e.clientX - rect.left;
    const focalY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    this.zoomAtPoint(focalX, focalY, zoomFactor);
  }

  /* ── Touch Handling ── */

  _handleTouchStart(e) {
    e.preventDefault();

    if (e.touches.length === 1) {
      this.isPinching = false;
      const touch = e.touches[0];
      const coords = this.screenToWorld(touch.clientX, touch.clientY);

      if (this.activeTool === 'pan') {
        this.isPanning = true;
        this.dragStart = { x: touch.clientX, y: touch.clientY };
        this.panStart = { x: this.panX, y: this.panY };
      } else {
        this.isMouseDown = true;
        this.lastPaintedCell = null;
        if (coords.inBounds) {
          if (this.activeTool === 'paint' || this.activeTool === 'eraser') {
            this.isRecordingHistory = true;
            this.currentStrokeChanges = [];
          }
          this._executeToolAction(coords.gx, coords.gy);
          this.lastPaintedCell = { gx: coords.gx, gy: coords.gy };
        }
      }
    } else if (e.touches.length === 2) {
      // Pinch to zoom initiation
      this.isPinching = true;
      this.isMouseDown = false;
      this.isPanning = false;

      const t1 = e.touches[0];
      const t2 = e.touches[1];
      this.touchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      this.touchStartScale = this.scale;

      const rect = this.canvas.getBoundingClientRect();
      this.touchStartMidpoint = {
        x: (t1.clientX + t2.clientX) / 2 - rect.left,
        y: (t1.clientY + t2.clientY) / 2 - rect.top
      };
      this.touchPanStart = { x: this.panX, y: this.panY };
    }
  }

  _handleTouchMove(e) {
    e.preventDefault();

    if (e.touches.length === 1 && !this.isPinching) {
      const touch = e.touches[0];
      const coords = this.screenToWorld(touch.clientX, touch.clientY);
      this.setHoveredCell(coords.gx, coords.gy);

      if (this.isPanning) {
        const dx = touch.clientX - this.dragStart.x;
        const dy = touch.clientY - this.dragStart.y;
        this.panX = this.panStart.x + dx;
        this.panY = this.panStart.y + dy;
        if (this.onTransformChange) {
          this.onTransformChange({ scale: this.scale, panX: this.panX, panY: this.panY });
        }
      } else if (this.isMouseDown && (this.activeTool === 'paint' || this.activeTool === 'eraser')) {
        if (coords.inBounds) {
          if (!this.lastPaintedCell || (this.lastPaintedCell.gx !== coords.gx || this.lastPaintedCell.gy !== coords.gy)) {
            if (this.lastPaintedCell) {
              this._drawBresenhamLine(this.lastPaintedCell.gx, this.lastPaintedCell.gy, coords.gx, coords.gy);
            } else {
              this._executeToolAction(coords.gx, coords.gy);
            }
            this.lastPaintedCell = { gx: coords.gx, gy: coords.gy };
          }
        }
      }
    } else if (e.touches.length === 2) {
      // 2-finger pinch and pan
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

      if (this.touchStartDist > 0) {
        const factor = currentDist / this.touchStartDist;
        this.zoomAtPoint(this.touchStartMidpoint.x, this.touchStartMidpoint.y, factor * (this.touchStartScale / this.scale));
      }
    }
  }

  _handleTouchEnd(e) {
    if (e.touches.length === 0) {
      this.isMouseDown = false;
      this.isPanning = false;
      this.isPinching = false;
      this.lastPaintedCell = null;

      if (this.isRecordingHistory) {
        this.isRecordingHistory = false;
        if (this.currentStrokeChanges.length > 0) {
          this.undoStack.push(this.currentStrokeChanges);
          if (this.undoStack.length > 50) this.undoStack.shift();
          this.redoStack = [];
          this.currentStrokeChanges = [];
          if (this.onHistoryChange) {
            this.onHistoryChange({ canUndo: this.canUndo(), canRedo: this.canRedo() });
          }
        }
      }
    }
  }

  /**
   * Execute current active tool action on grid coordinate
   */
  _executeToolAction(gx, gy) {
    const currentAuthor = this.authorCallsign || '@guest';

    if (this.activeTool === 'paint') {
      if (this.isPixelProtected(gx, gy, currentAuthor)) {
        const existingCell = this.getPixel(gx, gy);
        if (this.onProtectedHit) {
          this.onProtectedHit(gx, gy, existingCell);
        }
        return false;
      }
      this.setPixel(gx, gy, this.activeColor, {
        author: currentAuthor,
        message: this.transmissionMessage
      });
      if (this.onPixelPaint) {
        this.onPixelPaint(gx, gy, this.activeColor);
      }
      return true;
    } else if (this.activeTool === 'eraser') {
      if (this.isPixelProtected(gx, gy, currentAuthor)) {
        const existingCell = this.getPixel(gx, gy);
        if (this.onProtectedHit) {
          this.onProtectedHit(gx, gy, existingCell);
        }
        return false;
      }
      this.setPixel(gx, gy, null);
      if (this.onPixelPaint) {
        this.onPixelPaint(gx, gy, null);
      }
      return true;
    } else if (this.activeTool === 'stamp') {
      this.applyStamp(gx, gy, this.activeStampId, this.activeColor, {
        author: currentAuthor,
        message: this.transmissionMessage
      });
      return true;
    } else if (this.activeTool === 'inspect') {
      if (this.onPixelClick) {
        this.onPixelClick(gx, gy, this.getPixel(gx, gy));
      }
      return true;
    }
  }

  /**
   * Bresenham line algorithm for continuous stroke painting
   */
  _drawBresenhamLine(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let cx = x0;
    let cy = y0;

    while (true) {
      this._executeToolAction(cx, cy);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  }

  /**
   * Clean up engine resources, event listeners, and animation loop
   */
  destroy() {
    this.isRunning = false;
    if (this.rafId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this._detachEventListeners();
    this.shockwaves = [];
    this.grid.fill(null);
  }
}

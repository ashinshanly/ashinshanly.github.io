/**
 * PixelHUD Real-Time Firebase RTDB Service
 * 
 * Features:
 * - Real-time delta synchronization on `/pixel_hud/grid`
 * - Live incoming transmissions feed on `/pixel_hud/transmissions`
 * - Atomic multi-path updates for retro stamps
 * - Live shockwave detection for remote events (<3500ms)
 * - Robust rate limiting: drag throttle (80ms), stamp cooldown (1.5s), transmission cooldown (3.0s)
 * - Strict client-side data sanitization (author regex, escaped HTML, coordinate clamping 0..63)
 * - Offline resilience & localStorage caching (`pixel_hud_grid_cache_v1`)
 * - Connection status listener (`.info/connected`) with standalone simulated mode
 */

import {
  ref,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  set,
  update,
  push,
  get,
  off
} from 'firebase/database';
import { db } from '../../../config/firebase.js';
import { PALETTE, getColorByHex, isEraser } from '../palette.js';

// Storage & Sync Keys
export const LOCAL_GRID_CACHE_KEY = 'pixel_hud_grid_cache_v1';
export const LOCAL_TRANSMISSIONS_CACHE_KEY = 'pixel_hud_transmissions_cache_v1';
export const GRID_PATH = 'pixel_hud/grid';
export const TRANSMISSIONS_PATH = 'pixel_hud/transmissions';
export const INFO_CONNECTED_PATH = '.info/connected';

// Multi-Canvas Room Configuration (Canvas 1, Canvas 2, Canvas 3)
export const CANVAS_LIST = [
  { id: 'canvas_1', name: 'Canvas 1', num: 1 },
  { id: 'canvas_2', name: 'Canvas 2', num: 2 },
  { id: 'canvas_3', name: 'Canvas 3', num: 3 }
];

export function getGridPath(canvasId = 'canvas_1') {
  if (!canvasId || canvasId === 'canvas_1') {
    return 'pixel_hud/grid'; // Backward compatibility with established marks
  }
  return `pixel_hud/grid/${canvasId}`;
}

export function getGridCacheKey(canvasId = 'canvas_1') {
  if (!canvasId || canvasId === 'canvas_1') {
    return LOCAL_GRID_CACHE_KEY;
  }
  return `pixel_hud_grid_cache_v1_${canvasId}`;
}

// Rate Limiting Constants
export const DRAG_THROTTLE_MS = 80;        // Min interval between brush stroke network writes
export const STAMP_COOLDOWN_MS = 1500;      // 1.5s cooldown between stamp placements
export const TRANSMISSION_COOLDOWN_MS = 3000; // 3.0s cooldown between broadcasts
export const LIVE_SHOCKWAVE_WINDOW_MS = 3500; // Delta window for live remote shockwaves

// State tracking for rate limits and local session
let lastPaintTime = 0;
let lastStampTime = 0;
let lastTransmissionTime = 0;
let localPaintQueue = [];
let paintFlushTimeout = null;
let isInitialGridLoadComplete = false;

// Client session marker to distinguish local paints from remote paints
export const CLIENT_SESSION_ID = 'cli_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

/* ─────────────────────────────────────────────────────────────
   SANITIZATION & DEFENSIVE VALIDATION HELPERS
   ───────────────────────────────────────────────────────────── */

/**
 * Clamp coordinate integer to valid grid boundary [0..63]
 * @param {number|string} val 
 * @returns {number} integer in [0..63]
 */
export function clampCoord(val) {
  const num = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(63, Math.floor(num)));
}

/**
 * Strict Author Alias Sanitization
 * Enforces `^@[a-zA-Z0-9_]{1,16}$`
 * @param {string} rawAuthor 
 * @returns {string} sanitized author alias e.g. '@cybernaut'
 */
export function sanitizeAuthor(rawAuthor) {
  if (!rawAuthor || typeof rawAuthor !== 'string') {
    return '@guest';
  }
  let str = rawAuthor.trim();
  if (!str.startsWith('@')) {
    str = '@' + str;
  }
  // Extract body after '@' and strip non-alphanumeric/underscore chars
  const body = str.slice(1).replace(/[^a-zA-Z0-9_]/g, '');
  if (!body) {
    return '@guest';
  }
  const truncated = body.slice(0, 16);
  return '@' + truncated;
}

/**
 * Strict Message Sanitization & HTML Escaping
 * Max 64 chars, stripped HTML tags and escaped entities
 * @param {string} rawMessage 
 * @returns {string} sanitized message string
 */
export function sanitizeMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return '';
  }
  // Trim and limit length
  let str = rawMessage.trim().slice(0, 64);
  // Escape HTML entities to prevent XSS injection
  str = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return str;
}

/**
 * Validate and sanitize color string
 * @param {string} rawColor 
 * @returns {string} hex color
 */
export function sanitizeColor(rawColor) {
  if (!rawColor || isEraser(rawColor)) {
    return null;
  }
  if (typeof rawColor === 'string') {
    const trimmed = rawColor.trim();
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
      return trimmed.toLowerCase();
    }
  }
  return '#00f0ff';
}

/**
 * Check if a message is an authentic visitor note (not an automated system log)
 */
export function isMeaningfulVisitorMessage(msg) {
  if (!msg || typeof msg !== 'string') return false;
  const trimmed = msg.trim();
  if (!trimmed) return false;
  if (/placed \d+-pixel/i.test(trimmed)) return false;
  if (/dropped \d+-pixel/i.test(trimmed)) return false;
  if (/^broadcast transmission$/i.test(trimmed)) return false;
  return true;
}

/**
 * Normalize raw RTDB cell data structure to unified format
 * Supports both short keys ({ c, a, m, t, f }) and long keys ({ color, author, ... })
 * @param {object} raw 
 * @param {string} [key] 
 * @returns {object|null}
 */
export function normalizeCell(raw, key = '') {
  if (!raw) return null;

  let x = raw.x;
  let y = raw.y;
  if ((x === undefined || y === undefined) && key) {
    const parts = key.split('_');
    if (parts.length === 2) {
      x = parseInt(parts[0], 10);
      y = parseInt(parts[1], 10);
    }
  }

  x = clampCoord(x);
  y = clampCoord(y);

  const color = raw.color || raw.c || null;
  if (!color || isEraser(color)) {
    return null;
  }

  const author = sanitizeAuthor(raw.author || raw.a);
  const message = sanitizeMessage(raw.message || raw.m);
  const timestamp = typeof raw.timestamp === 'number' ? raw.timestamp : (typeof raw.t === 'number' ? raw.t : Date.now());
  const freq = raw.freq || raw.f || getColorByHex(color)?.freqLabel || '2.40 kHz';
  const session = raw.session || raw.s || '';

  return {
    x,
    y,
    color,
    c: color,
    author,
    a: author,
    message,
    m: message,
    timestamp,
    t: timestamp,
    freq,
    f: freq,
    session,
    s: session
  };
}

/* ─────────────────────────────────────────────────────────────
   LOCAL STORAGE CACHE MANAGEMENT
   ───────────────────────────────────────────────────────────── */

/**
 * Read cached grid matrix from localStorage (0ms instant render)
 * @param {string} [canvasId='canvas_1']
 * @returns {object} map of "x_y" -> normalized cell object
 */
export function getLocalGridCache(canvasId = 'canvas_1') {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const key = getGridCacheKey(canvasId);
    let raw = window.localStorage.getItem(key);
    // Fallback to legacy default key if canvas_1 cache is not found
    if (!raw && (!canvasId || canvasId === 'canvas_1')) {
      raw = window.localStorage.getItem(LOCAL_GRID_CACHE_KEY);
    }
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      const sanitized = {};
      Object.keys(parsed).forEach(k => {
        const norm = normalizeCell(parsed[k], k);
        if (norm) sanitized[k] = norm;
      });
      return sanitized;
    }
  } catch (err) {
    console.warn('PixelHUD: Failed to load local grid cache:', err);
  }
  return {};
}

/**
 * Debounced write of in-memory grid to localStorage
 * @param {object} gridMap
 * @param {string} [canvasId='canvas_1']
 */
let saveCacheTimeout = null;
let pendingCacheMap = null;
let pendingCacheCanvasId = 'canvas_1';

export function saveLocalGridCache(gridMap, canvasId = 'canvas_1') {
  if (typeof window === 'undefined' || !window.localStorage) return;
  pendingCacheMap = gridMap;
  pendingCacheCanvasId = canvasId || 'canvas_1';

  if (saveCacheTimeout) return;
  saveCacheTimeout = setTimeout(() => {
    try {
      if (pendingCacheMap) {
        const key = getGridCacheKey(pendingCacheCanvasId);
        window.localStorage.setItem(key, JSON.stringify(pendingCacheMap));
        // Mirror to legacy key if on canvas_1
        if (pendingCacheCanvasId === 'canvas_1') {
          window.localStorage.setItem(LOCAL_GRID_CACHE_KEY, JSON.stringify(pendingCacheMap));
        }
      }
    } catch (err) {
      console.warn('PixelHUD: Failed to save local grid cache:', err);
    } finally {
      saveCacheTimeout = null;
    }
  }, 400);
}

/**
 * Clear the local grid cache from localStorage
 * @param {string} [canvasId]
 */
export function clearLocalGridCache(canvasId) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (canvasId) {
        window.localStorage.removeItem(getGridCacheKey(canvasId));
        if (canvasId === 'canvas_1') {
          window.localStorage.removeItem(LOCAL_GRID_CACHE_KEY);
        }
      } else {
        CANVAS_LIST.forEach(c => {
          window.localStorage.removeItem(getGridCacheKey(c.id));
        });
        window.localStorage.removeItem(LOCAL_GRID_CACHE_KEY);
      }
    } catch (_) {}
  }
}

export function getLocalTransmissionCache() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_TRANSMISSIONS_CACHE_KEY);
    if (!raw) return [];
    const cached = JSON.parse(raw);
    if (Array.isArray(cached)) {
      // Exclude legacy mock seeds
      return cached
        .filter(item => item && !String(item.id).startsWith('seed_') && isMeaningfulVisitorMessage(item.message || item.m))
        .slice(0, 50);
    }
  } catch (_) {}
  return [];
}

export function saveLocalTransmissionCache(items) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(LOCAL_TRANSMISSIONS_CACHE_KEY, JSON.stringify((items || []).slice(0, 50)));
  } catch (_) {}
}

/* ─────────────────────────────────────────────────────────────
   RATE LIMITING & COOLDOWN GETTERS
   ───────────────────────────────────────────────────────────── */

export function getStampCooldownRemaining() {
  const elapsed = Date.now() - lastStampTime;
  return Math.max(0, STAMP_COOLDOWN_MS - elapsed);
}

export function canPlaceStamp() {
  return getStampCooldownRemaining() === 0;
}

export function getTransmissionCooldownRemaining() {
  const elapsed = Date.now() - lastTransmissionTime;
  return Math.max(0, TRANSMISSION_COOLDOWN_MS - elapsed);
}

export function canSendTransmission() {
  return getTransmissionCooldownRemaining() === 0;
}

/* ─────────────────────────────────────────────────────────────
   FIREBASE REALTIME DATABASE CORE SERVICE
   ───────────────────────────────────────────────────────────── */

export const pixelHudService = {
  /**
   * Subscribe to real-time grid changes with instant cache load and fine-grained delta listeners.
   * 
   * @param {string|function} canvasIdOrCb - Canvas identifier ('canvas_1', 'canvas_2', 'canvas_3') or onInitialData callback
   * @param {function(object): void} [onInitialData] - Called with initial full grid snapshot { "x_y": cell }
   * @param {function(string, object, boolean, number): void} [onCellUpdate] - Called with (cellKey, cell, isLiveShockwave, ageMs)
   * @param {function(string): void} [onCellRemove] - Called with the erased cell key (for example "12_8")
   * @param {function(Error): void} [onError] - Error callback
   * @returns {function(): void} Unsubscribe function
   */
  subscribeToGrid(canvasIdOrCb, onInitialData, onCellUpdate, onCellRemove, onError) {
    let active = true;
    let canvasId = 'canvas_1';
    let cbInitial = onInitialData;
    let cbUpdate = onCellUpdate;
    let cbRemove = onCellRemove;
    let cbError = onError;

    if (typeof canvasIdOrCb === 'string') {
      canvasId = canvasIdOrCb;
    } else if (typeof canvasIdOrCb === 'function') {
      cbError = onCellRemove;
      cbRemove = onCellUpdate;
      cbUpdate = onInitialData;
      cbInitial = canvasIdOrCb;
    }

    const gridPath = getGridPath(canvasId);
    const localGridStore = { ...getLocalGridCache(canvasId) };

    // Phase 1: Deliver instant local cache immediately for 0ms visual rendering
    if (Object.keys(localGridStore).length > 0 && cbInitial) {
      try {
        cbInitial(localGridStore);
      } catch (err) {
        if (cbError) cbError(err);
      }
    }

    // Check if Firebase Database is available
    if (!db) {
      console.warn(`PixelHUD: Firebase RTDB not configured. Running in Standalone Simulated Mode for ${canvasId}.`);
      if (cbInitial && Object.keys(localGridStore).length === 0) {
        cbInitial({});
      }
      return () => { active = false; };
    }

    try {
      const gridDbRef = ref(db, gridPath);
      let initialSnapshotReceived = false;

      // Phase 2: Initial snapshot load via onValue (runs once initially or on reconnect)
      const unsubValue = onValue(gridDbRef, (snapshot) => {
        if (!active) return;
        const val = snapshot.val();
        const remoteGrid = {};

        if (val && typeof val === 'object') {
          Object.keys(val).forEach(key => {
            const norm = normalizeCell(val[key], key);
            if (norm) {
              remoteGrid[key] = norm;
              localGridStore[key] = norm;
            }
          });
        }

        saveLocalGridCache(localGridStore, canvasId);

        if (!initialSnapshotReceived) {
          initialSnapshotReceived = true;
          isInitialGridLoadComplete = true;
          if (cbInitial) {
            cbInitial(remoteGrid);
          }
        }
      }, (err) => {
        console.warn(`PixelHUD: RTDB onValue listener error for ${canvasId}:`, err);
        if (cbError) cbError(err);
      });

      // Phase 3: Fine-grained delta listeners for sub-frame latency
      const unsubChildAdded = onChildAdded(gridDbRef, (snapshot) => {
        if (!active || !initialSnapshotReceived) return;
        const key = snapshot.key;
        const norm = normalizeCell(snapshot.val(), key);
        if (!norm) return;

        localGridStore[key] = norm;
        saveLocalGridCache(localGridStore, canvasId);

        const ageMs = Date.now() - norm.timestamp;
        const isLive = ageMs >= 0 && ageMs < LIVE_SHOCKWAVE_WINDOW_MS && norm.session !== CLIENT_SESSION_ID;

        if (cbUpdate) {
          cbUpdate(key, norm, isLive, ageMs);
        }
      }, (err) => {
        if (cbError) cbError(err);
      });

      const unsubChildChanged = onChildChanged(gridDbRef, (snapshot) => {
        if (!active || !initialSnapshotReceived) return;
        const key = snapshot.key;
        const norm = normalizeCell(snapshot.val(), key);
        if (!norm) {
          // Changed to null/empty -> treat as removal
          const parts = key.split('_');
          if (parts.length === 2) {
            delete localGridStore[key];
            saveLocalGridCache(localGridStore, canvasId);
            if (cbRemove) cbRemove(key);
          }
          return;
        }

        localGridStore[key] = norm;
        saveLocalGridCache(localGridStore, canvasId);

        const ageMs = Date.now() - norm.timestamp;
        const isLive = ageMs >= 0 && ageMs < LIVE_SHOCKWAVE_WINDOW_MS && norm.session !== CLIENT_SESSION_ID;

        if (cbUpdate) {
          cbUpdate(key, norm, isLive, ageMs);
        }
      }, (err) => {
        if (cbError) cbError(err);
      });

      const unsubChildRemoved = onChildRemoved(gridDbRef, (snapshot) => {
        if (!active || !initialSnapshotReceived) return;
        const key = snapshot.key;
        delete localGridStore[key];
        saveLocalGridCache(localGridStore, canvasId);

        const parts = key.split('_');
        if (parts.length === 2) {
          const gx = parseInt(parts[0], 10);
          const gy = parseInt(parts[1], 10);
          if (!isNaN(gx) && !isNaN(gy) && cbRemove) {
            cbRemove(key);
          }
        }
      }, (err) => {
        if (cbError) cbError(err);
      });

      // Combined Unsubscribe Handler
      return () => {
        active = false;
        try {
          if (typeof unsubValue === 'function') unsubValue();
          if (typeof unsubChildAdded === 'function') unsubChildAdded();
          if (typeof unsubChildChanged === 'function') unsubChildChanged();
          if (typeof unsubChildRemoved === 'function') unsubChildRemoved();
        } catch (_) {}
      };
    } catch (err) {
      console.warn(`PixelHUD: Failed to initialize RTDB grid subscription for ${canvasId}:`, err);
      if (cbError) cbError(err);
      return () => { active = false; };
    }
  },

  /**
   * Subscribe to live incoming visitor transmissions
   * 
   * @param {function(Array<object>): void} onTransmissionsUpdate - Array of transmission items (sorted newest first)
   * @param {function(Error): void} [onError] 
   * @returns {function(): void} Unsubscribe function
   */
  subscribeToTransmissions(onTransmissionsUpdate, onError) {
    let active = true;
    const cached = getLocalTransmissionCache();

    // The activity drawer should remain useful if a visitor is offline or the
    // portfolio is deployed without RTDB credentials.
    if (onTransmissionsUpdate) onTransmissionsUpdate(cached);

    if (!db) {
      return () => { active = false; };
    }

    try {
      const txRef = ref(db, TRANSMISSIONS_PATH);
      const unsub = onValue(txRef, (snapshot) => {
        const val = snapshot.val();
        const list = [];
        if (val && typeof val === 'object') {
          Object.keys(val).forEach(key => {
            const item = val[key];
            if (item) {
              const msg = sanitizeMessage(item.message || item.m);
              if (isMeaningfulVisitorMessage(msg)) {
                list.push({
                  id: item.id || key,
                  x: clampCoord(item.x),
                  y: clampCoord(item.y),
                  color: item.color || item.c || '#00f0ff',
                  author: sanitizeAuthor(item.author || item.a),
                  message: msg,
                  timestamp: typeof item.timestamp === 'number' ? item.timestamp : (item.t || Date.now()),
                  freq: item.freq || item.f || '2.40 kHz'
                });
              }
            }
          });
        }

        // Sort descending by timestamp (newest first) and cap at 50 entries
        list.sort((a, b) => b.timestamp - a.timestamp);
        const capped = list.slice(0, 50);

        saveLocalTransmissionCache(capped);

        if (onTransmissionsUpdate) {
          onTransmissionsUpdate(capped);
        }
      }, (err) => {
        console.warn('PixelHUD: Transmissions listener error:', err);
        if (onError) onError(err);
      });

      return () => {
        active = false;
        if (typeof unsub === 'function') unsub();
      };
    } catch (err) {
      if (onError) onError(err);
      return () => { active = false; };
    }
  },

  /**
   * Subscribe to Firebase RTDB online connection status
   * 
   * @param {function(boolean): void} onStatusChange 
   * @returns {function(): void} Unsubscribe function
   */
  subscribeToConnectionStatus(onStatusChange) {
    let active = true;

    if (!db) {
      if (onStatusChange) onStatusChange(false);
      return () => { active = false; };
    }

    try {
      const connRef = ref(db, INFO_CONNECTED_PATH);
      const unsub = onValue(connRef, (snapshot) => {
        if (!active) return;
        const isConnected = Boolean(snapshot.val());
        if (onStatusChange) {
          onStatusChange(isConnected);
        }
      }, (err) => {
        console.warn('PixelHUD: Connection status listener error:', err);
        if (onStatusChange) onStatusChange(false);
      });

      return () => {
        active = false;
        if (typeof unsub === 'function') unsub();
      };
    } catch (err) {
      if (onStatusChange) onStatusChange(false);
      return () => { active = false; };
    }
  },

  /**
   * Paint a single pixel on the matrix with rate limiting and local cache update.
   * 
   * @param {object} params
   * @param {string} [params.canvasId='canvas_1']
   * @param {number} params.x - Grid X (0-63)
   * @param {number} params.y - Grid Y (0-63)
   * @param {string} params.color - Hex color
   * @param {string} [params.author] - Author alias
   * @param {string} [params.message] - Optional note
   * @param {string} [params.freq] - Harmonic frequency
   * @returns {Promise<void>}
   */
  async paintPixel({ canvasId = 'canvas_1', x, y, color, author, message, freq }) {
    const activeCanvas = canvasId || 'canvas_1';
    const gx = clampCoord(x);
    const gy = clampCoord(y);
    const sanitizedColor = sanitizeColor(color);

    if (!sanitizedColor) {
      return this.erasePixel({ canvasId: activeCanvas, x: gx, y: gy });
    }

    const sanitizedAuthor = sanitizeAuthor(author);
    const sanitizedMsg = sanitizeMessage(message);
    const now = Date.now();
    const frequency = freq || getColorByHex(sanitizedColor)?.freqLabel || '2.40 kHz';
    const gridPath = getGridPath(activeCanvas);

    const cellPayload = {
      x: gx,
      y: gy,
      c: sanitizedColor,
      a: sanitizedAuthor,
      m: sanitizedMsg,
      t: now,
      f: frequency,
      s: CLIENT_SESSION_ID
    };

    // Update in-memory cache immediately
    const key = `${gx}_${gy}`;
    const cache = getLocalGridCache(activeCanvas);
    cache[key] = normalizeCell(cellPayload, key);
    saveLocalGridCache(cache, activeCanvas);

    // Queue for throttled network write
    localPaintQueue.push({ path: `${gridPath}/${key}`, data: cellPayload });

    const timeSinceLastPaint = now - lastPaintTime;
    if (timeSinceLastPaint >= DRAG_THROTTLE_MS) {
      await this._flushPaintQueue();
    } else {
      if (!paintFlushTimeout) {
        paintFlushTimeout = setTimeout(() => {
          this._flushPaintQueue();
        }, DRAG_THROTTLE_MS - timeSinceLastPaint);
      }
    }
  },

  /**
   * Internal helper: Flush batched drag paints to Firebase
   */
  async _flushPaintQueue() {
    if (paintFlushTimeout) {
      clearTimeout(paintFlushTimeout);
      paintFlushTimeout = null;
    }

    if (localPaintQueue.length === 0) return;

    const queueToFlush = [...localPaintQueue];
    localPaintQueue = [];
    lastPaintTime = Date.now();

    if (!db) return; // Offline / standalone mode

    try {
      if (queueToFlush.length === 1) {
        const item = queueToFlush[0];
        await set(ref(db, item.path), item.data);
      } else {
        const updates = {};
        queueToFlush.forEach(item => {
          updates[item.path] = item.data;
        });
        await update(ref(db), updates);
      }
    } catch (err) {
      console.warn('PixelHUD: Failed to flush paint to Firebase:', err);
    }
  },

  /**
   * Erase a pixel at coordinate (x, y)
   * 
   * @param {object} params
   * @param {string} [params.canvasId='canvas_1']
   * @param {number} params.x
   * @param {number} params.y
   * @returns {Promise<void>}
   */
  async erasePixel({ canvasId = 'canvas_1', x, y }) {
    const activeCanvas = canvasId || 'canvas_1';
    const gx = clampCoord(x);
    const gy = clampCoord(y);
    const key = `${gx}_${gy}`;
    const gridPath = getGridPath(activeCanvas);

    // Update local cache
    const cache = getLocalGridCache(activeCanvas);
    delete cache[key];
    saveLocalGridCache(cache, activeCanvas);

    if (!db) return;

    try {
      await set(ref(db, `${gridPath}/${key}`), null);
    } catch (err) {
      console.warn('PixelHUD: Failed to erase pixel in Firebase:', err);
    }
  },

  /**
   * Drop a retro cyber stamp using atomic multi-path update with cooldown enforcement
   * 
   * @param {object} params
   * @param {string} [params.canvasId='canvas_1']
   * @param {Array<object>} params.stampPixels - Array of { x, y, color, freq }
   * @param {string} [params.author]
   * @param {string} [params.message]
   * @param {object} params.centerCoord - { x, y }
   * @returns {Promise<{ success: boolean, count: number }>}
   */
  async dropStamp({ canvasId = 'canvas_1', stampPixels, author, message, centerCoord }) {
    if (!Array.isArray(stampPixels) || stampPixels.length === 0) {
      return { success: false, count: 0 };
    }

    const activeCanvas = canvasId || 'canvas_1';
    const remainingCooldown = getStampCooldownRemaining();
    if (remainingCooldown > 0) {
      const err = new Error(`Stamp placement cooldown active. Wait ${Math.ceil(remainingCooldown / 1000)}s.`);
      err.cooldown = true;
      err.remainingMs = remainingCooldown;
      throw err;
    }

    const sanitizedAuthor = sanitizeAuthor(author);
    const sanitizedMsg = sanitizeMessage(message);
    const now = Date.now();
    lastStampTime = now;
    const gridPath = getGridPath(activeCanvas);

    const cache = getLocalGridCache(activeCanvas);
    const updates = {};

    stampPixels.forEach(p => {
      const cx = clampCoord(p.x);
      const cy = clampCoord(p.y);
      const cellColor = sanitizeColor(p.color) || '#00f0ff';
      const cellFreq = p.freq || getColorByHex(cellColor)?.freqLabel || '2.40 kHz';
      const key = `${cx}_${cy}`;

      const cellData = {
        x: cx,
        y: cy,
        c: cellColor,
        a: sanitizedAuthor,
        m: sanitizedMsg,
        t: now,
        f: cellFreq,
        s: CLIENT_SESSION_ID
      };

      cache[key] = normalizeCell(cellData, key);
      updates[`${gridPath}/${key}`] = cellData;
    });

    saveLocalGridCache(cache, activeCanvas);

    // Only broadcast a guest message if the visitor actually wrote a note
    if (sanitizedMsg && isMeaningfulVisitorMessage(sanitizedMsg)) {
      const center = centerCoord || { x: stampPixels[0].x, y: stampPixels[0].y };
      const txKey = `stamp_${now}_${Math.random().toString(36).substring(2, 7)}`;
      updates[`${TRANSMISSIONS_PATH}/${txKey}`] = {
        id: txKey,
        x: clampCoord(center.x),
        y: clampCoord(center.y),
        color: sanitizeColor(stampPixels[0]?.color) || '#00f0ff',
        author: sanitizedAuthor,
        message: sanitizedMsg,
        timestamp: now,
        freq: stampPixels[0]?.freq || '2.40 kHz'
      };
    }

    if (db) {
      try {
        await update(ref(db), updates);
      } catch (err) {
        console.warn('PixelHUD: Failed atomic stamp update:', err);
      }
    }

    return { success: true, count: stampPixels.length };
  },

  /**
   * Broadcast a visitor transmission to the telemetry feed
   * 
   * @param {object} params
   * @param {number} params.x
   * @param {number} params.y
   * @param {string} [params.color]
   * @param {string} params.author
   * @param {string} params.message
   * @param {string} [params.freq]
   * @returns {Promise<{ success: boolean, id: string }>}
   */
  async sendTransmission({ x, y, color, author, message, freq }) {
    const remainingCooldown = getTransmissionCooldownRemaining();
    if (remainingCooldown > 0) {
      const err = new Error(`Transmission broadcast cooldown active. Wait ${Math.ceil(remainingCooldown / 1000)}s.`);
      err.cooldown = true;
      err.remainingMs = remainingCooldown;
      throw err;
    }

    const gx = clampCoord(x);
    const gy = clampCoord(y);
    const sanitizedColor = sanitizeColor(color) || '#00f0ff';
    const sanitizedAuthor = sanitizeAuthor(author);
    const sanitizedMsg = sanitizeMessage(message) || 'Broadcast transmission';
    const now = Date.now();
    const frequency = freq || getColorByHex(sanitizedColor)?.freqLabel || '2.40 kHz';

    lastTransmissionTime = now;

    const txKey = `tx_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const txPayload = {
      id: txKey,
      x: gx,
      y: gy,
      color: sanitizedColor,
      author: sanitizedAuthor,
      message: sanitizedMsg,
      timestamp: now,
      freq: frequency
    };

    const localItems = [txPayload, ...getLocalTransmissionCache().filter(item => item.id !== txKey)].slice(0, 50);
    saveLocalTransmissionCache(localItems);

    if (db) {
      try {
        const txRef = ref(db, `${TRANSMISSIONS_PATH}/${txKey}`);
        await set(txRef, txPayload);
      } catch (err) {
        console.warn('PixelHUD: Failed to send transmission:', err);
      }
    }

    return { success: true, id: txKey, transmission: txPayload };
  },

  /**
   * Read cached grid matrix from localStorage
   * @param {string} [canvasId='canvas_1']
   * @returns {object}
   */
  getLocalGridCache(canvasId = 'canvas_1') {
    return getLocalGridCache(canvasId);
  },

  /**
   * Save in-memory grid to localStorage
   * @param {object} gridMap
   * @param {string} [canvasId='canvas_1']
   */
  saveLocalGridCache(gridMap, canvasId = 'canvas_1') {
    saveLocalGridCache(gridMap, canvasId);
  },

  /**
   * Clear local grid cache from storage
   * @param {string} [canvasId]
   */
  clearLocalGridCache(canvasId) {
    clearLocalGridCache(canvasId);
  }
};


export default pixelHudService;

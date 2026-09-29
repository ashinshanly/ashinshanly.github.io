// tests/pixel_hud/helpers/reference_models.mjs
// Reference models, algorithms, and constants strictly derived from specifications

export const GRID_SIZE = 64;
export const TOTAL_PIXELS = 4096; // 64 x 64
export const DEFAULT_CELL_SIZE = 10; // 10px per cell at 1.0 scale

export const PALETTE = [
  { id: "cyan", name: "Cyber Cyan", hex: "#00f0ff", glow: "rgba(0, 240, 255, 0.8)", freq: 261.63, note: "C4", filter: 2400, wave: "triangle" },
  { id: "magenta", name: "Neon Magenta", hex: "#ff007f", glow: "rgba(255, 0, 127, 0.8)", freq: 311.13, note: "Eb4", filter: 1800, wave: "sawtooth" },
  { id: "lime", name: "Acid Lime", hex: "#39ff14", glow: "rgba(57, 255, 20, 0.8)", freq: 349.23, note: "F4", filter: 3200, wave: "sine" },
  { id: "amber", name: "Electric Amber", hex: "#ffb703", glow: "rgba(255, 183, 3, 0.8)", freq: 392.00, note: "G4", filter: 1200, wave: "square" },
  { id: "blue", name: "Hyper Blue", hex: "#3a86ff", glow: "rgba(58, 134, 255, 0.8)", freq: 466.16, note: "Bb4", filter: 2800, wave: "triangle" },
  { id: "purple", name: "Plasma Purple", hex: "#8338ec", glow: "rgba(131, 56, 236, 0.8)", freq: 523.25, note: "C5", filter: 2000, wave: "sawtooth" },
  { id: "orange", name: "Solar Flare", hex: "#ff5400", glow: "rgba(255, 84, 0, 0.8)", freq: 622.25, note: "Eb5", filter: 1500, wave: "square" },
  { id: "white", name: "Ghost White", hex: "#e0fbfc", glow: "rgba(224, 251, 252, 0.8)", freq: 783.99, note: "G5", filter: 4000, wave: "sine" }
];

export const C_MINOR_PENTATONIC_SCALE = [
  { note: "C3", freq: 130.81 },
  { note: "Eb3", freq: 155.56 },
  { note: "F3", freq: 174.61 },
  { note: "G3", freq: 196.00 },
  { note: "Bb3", freq: 233.08 },
  { note: "C4", freq: 261.63 },
  { note: "Eb4", freq: 311.13 },
  { note: "F4", freq: 349.23 },
  { note: "G4", freq: 392.00 },
  { note: "Bb4", freq: 466.16 },
  { note: "C5", freq: 523.25 },
  { note: "Eb5", freq: 622.25 },
  { note: "F5", freq: 698.46 },
  { note: "G5", freq: 783.99 },
  { note: "Bb5", freq: 932.33 },
  { note: "C6", freq: 1046.50 }
];

export const STAMPS = {
  space_invader: {
    id: "space_invader",
    name: "Space Invader",
    width: 5,
    height: 5,
    matrix: [
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0]
    ]
  },
  heart_8bit: {
    id: "heart_8bit",
    name: "8-Bit Heart",
    width: 5,
    height: 5,
    matrix: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  cyber_skull: {
    id: "cyber_skull",
    name: "Cyber Skull",
    width: 5,
    height: 5,
    matrix: [
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0]
    ]
  },
  tux_penguin: {
    id: "tux_penguin",
    name: "Tux Penguin",
    width: 5,
    height: 5,
    matrix: [
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0]
    ]
  },
  matrix_glyph: {
    id: "matrix_glyph",
    name: "Lightning Bolt",
    width: 5,
    height: 5,
    matrix: [
      [0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0]
    ]
  }
};

// Coordinate & Matrix Transformation Helpers
export function screenToWorld(clientX, clientY, panX, panY, scale, cellSize = DEFAULT_CELL_SIZE) {
  const effectiveSize = cellSize * scale;
  const gx = Math.floor((clientX - panX) / effectiveSize);
  const gy = Math.floor((clientY - panY) / effectiveSize);
  const inBounds = gx >= 0 && gx < GRID_SIZE && gy >= 0 && gy < GRID_SIZE;
  return { gx, gy, inBounds };
}

export function worldToScreen(gx, gy, panX, panY, scale, cellSize = DEFAULT_CELL_SIZE) {
  const effectiveSize = cellSize * scale;
  const x = panX + gx * effectiveSize;
  const y = panY + gy * effectiveSize;
  return { x, y, size: effectiveSize };
}

export function zoomAtPoint(focalX, focalY, zoomFactorDelta, scale, panX, panY, minScale = 0.5, maxScale = 16.0) {
  const targetScale = Math.max(minScale, Math.min(maxScale, scale * (1 + zoomFactorDelta)));
  const ratio = targetScale / scale;
  const targetPanX = focalX - (focalX - panX) * ratio;
  const targetPanY = focalY - (focalY - panY) * ratio;
  return { scale: targetScale, panX: targetPanX, panY: targetPanY };
}

// Web Audio Pentatonic Synthesizer Mathematical Mapping
export function mapYCoordToFrequency(gy) {
  const clampedY = Math.max(0, Math.min(GRID_SIZE - 1, gy));
  // Y=63 (bottom) -> lowest note C3 (index 0); Y=0 (top) -> highest note C6 (index 15)
  const invertedY = (GRID_SIZE - 1) - clampedY;
  const scaleIndex = Math.floor((invertedY / (GRID_SIZE - 1)) * (C_MINOR_PENTATONIC_SCALE.length - 1));
  return C_MINOR_PENTATONIC_SCALE[scaleIndex];
}

export function mapXCoordToPan(gx) {
  const clampedX = Math.max(0, Math.min(GRID_SIZE - 1, gx));
  // Left 0 -> -0.9, Right 63 -> +0.9
  return Number((((clampedX / (GRID_SIZE - 1)) * 1.8) - 0.9).toFixed(3));
}

// Sanitization Functions
export function sanitizeAuthor(inputAuthor) {
  if (typeof inputAuthor !== "string") return "@anonymous";
  let cleaned = inputAuthor.trim().replace(/<[^>]*>/g, "").replace(/[^a-zA-Z0-9_@]/g, "");
  if (!cleaned.startsWith("@")) cleaned = "@" + cleaned;
  if (cleaned.length <= 1) return "@visitor";
  return cleaned.slice(0, 20);
}

export function sanitizeMessage(inputMessage) {
  if (typeof inputMessage !== "string") return "";
  let cleaned = inputMessage.trim().replace(/<[^>]*>/g, "").replace(/[\r\n\t]/g, " ");
  return cleaned.slice(0, 64);
}

// Telemetry & Metrics Calculation
export function calculateMatrixMetrics(gridMap) {
  let activeCells = 0;
  let alphaCount = 0; // x < 32, y < 32
  let betaCount = 0;  // x >= 32, y < 32
  let gammaCount = 0; // x < 32, y >= 32
  let deltaCount = 0; // x >= 32, y >= 32
  const colorDistribution = {};

  const iterateEntry = (x, y, cell) => {
    if (cell && (cell.color || typeof cell === "string")) {
      activeCells++;
      const c = typeof cell === "string" ? cell : cell.color;
      colorDistribution[c] = (colorDistribution[c] || 0) + 1;
      if (x < 32 && y < 32) alphaCount++;
      else if (x >= 32 && y < 32) betaCount++;
      else if (x < 32 && y >= 32) gammaCount++;
      else deltaCount++;
    }
  };

  if (gridMap instanceof Map) {
    for (const [key, cell] of gridMap.entries()) {
      const [xStr, yStr] = key.split("_");
      iterateEntry(parseInt(xStr, 10), parseInt(yStr, 10), cell);
    }
  } else if (gridMap && typeof gridMap === "object") {
    for (const [key, cell] of Object.entries(gridMap)) {
      const [xStr, yStr] = key.split("_");
      iterateEntry(parseInt(xStr, 10), parseInt(yStr, 10), cell);
    }
  }

  const densityPercent = Number(((activeCells / TOTAL_PIXELS) * 100).toFixed(2));

  return {
    totalCells: TOTAL_PIXELS,
    activeCells,
    densityPercent,
    sectors: {
      alpha: { name: "Sector Alpha", coords: "0..31, 0..31", count: alphaCount },
      beta: { name: "Sector Beta", coords: "32..63, 0..31", count: betaCount },
      gamma: { name: "Sector Gamma", coords: "0..31, 32..63", count: gammaCount },
      delta: { name: "Sector Delta", coords: "32..63, 32..63", count: deltaCount }
    },
    colorDistribution
  };
}

// Token Bucket Rate Limiter
export class TokenBucketLimiter {
  constructor(maxTokens = 10, refillRatePerSec = 5) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRatePerSec = refillRatePerSec;
    this.lastRefill = Date.now();
  }

  tryConsume(tokens = 1, now = Date.now()) {
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsedSeconds * this.refillRatePerSec);
    this.lastRefill = now;

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}

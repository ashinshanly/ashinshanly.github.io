/**
 * PixelHUD Cyber Telemetry Utilities
 * 
 * Helper functions for calculating sector locations, relative telemetry timestamps,
 * harmonic frequencies, and coordinate metrics.
 */

import { C_MINOR_PENTATONIC_SCALE } from './WebAudioSynth.js';

/**
 * Format timestamp into human-readable relative cyber telemetry time
 * @param {number} timestamp 
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp || typeof timestamp !== 'number') return 'STANDBY';
  const elapsedSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSec < 5) return 'JUST NOW';
  if (elapsedSec < 60) return `${elapsedSec}s AGO`;
  const elapsedMin = Math.floor(elapsedSec / 60);
  if (elapsedMin < 60) return `${elapsedMin}m AGO`;
  const elapsedHours = Math.floor(elapsedMin / 60);
  if (elapsedHours < 24) return `${elapsedHours}h AGO`;
  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays}d AGO`;
}

/**
 * Calculate cyber sector name from grid coordinates (0-63)
 * @param {number} gx 
 * @param {number} gy 
 * @returns {string} e.g. "SEC: B-3"
 */
export function getSectorName(gx, gy) {
  if (gx < 0 || gx >= 64 || gy < 0 || gy >= 64) return 'SEC: --';
  const rowChar = String.fromCharCode(65 + Math.floor(gy / 16)); // A, B, C, D
  const colNum = Math.floor(gx / 16) + 1;                        // 1, 2, 3, 4
  return `SEC: ${rowChar}-${colNum}`;
}

/**
 * Get harmonic note info for a grid Y coordinate
 * @param {number} gy 
 * @returns {{ note: string, freq: number, midi: number }}
 */
export function getHarmonicNoteForY(gy) {
  const safeY = Math.max(0, Math.min(63, Math.floor(Number(gy) || 0)));
  const noteIndex = Math.min(15, Math.max(0, Math.floor(((63 - safeY) / 64) * 16)));
  return C_MINOR_PENTATONIC_SCALE[noteIndex] || { note: 'C4', freq: 261.63, midi: 60 };
}

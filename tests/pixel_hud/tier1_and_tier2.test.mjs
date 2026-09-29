/**
 * Comprehensive Unit Test Suite for PixelHUD Milestones M1 & M2
 * 
 * Covering:
 * - Feature verification (Tier 1)
 * - Boundary Value Analysis & Edge Cases (Tier 2)
 */

import { PALETTE, VOID_ERASER, COLOR_MAP, getColorById, getColorByIndex, getColorByHex, isEraser, hexToRgb, rgbToHex, getRgbaString, getGlowStyle } from '../../components/pixel_hud/palette.js';
import { STAMPS, STAMP_MAP, getStampById, getStampPixels, renderStampPreviewToCanvas } from '../../components/pixel_hud/stamps.js';
import { C_MINOR_PENTATONIC_SCALE, WebAudioSynth } from '../../components/pixel_hud/WebAudioSynth.js';
import { PixelEngine, GRID_WIDTH, GRID_HEIGHT, TOTAL_CELLS } from '../../components/pixel_hud/PixelEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('====================================================');
console.log('TIER 1: FEATURE ISOLATION TESTS (M1 & M2)');
console.log('====================================================');

// ── 1. Palette & Color Features ──
console.log('\n--- 1. Palette & Color System ---');
assert(PALETTE.length === 8, '8 primary cyberpunk neon colors defined');
PALETTE.forEach((col, idx) => {
  assert(typeof col.id === 'string' && col.id.length > 0, `Color [${idx}] has valid id: ${col.id}`);
  assert(col.hex.startsWith('#') && col.hex.length === 7, `Color [${idx}] has valid hex: ${col.hex}`);
  assert(col.rgb && typeof col.rgb.r === 'number' && typeof col.rgb.g === 'number' && typeof col.rgb.b === 'number', `Color [${idx}] has rgb`);
  assert(typeof col.filterCutoff === 'number' && col.filterCutoff > 0, `Color [${idx}] has filterCutoff: ${col.filterCutoff}Hz`);
  assert(typeof col.harmonicResonance === 'number', `Color [${idx}] has harmonicResonance`);
  assert(['sine', 'triangle', 'sawtooth', 'square'].includes(col.waveType), `Color [${idx}] has valid waveType: ${col.waveType}`);
  assert(col.isEraser === false, `Color [${idx}] is not eraser`);
});

assert(VOID_ERASER.id === 'void-eraser', 'VOID_ERASER id is void-eraser');
assert(VOID_ERASER.isEraser === true, 'VOID_ERASER isEraser is true');
assert(VOID_ERASER.index === -1, 'VOID_ERASER index is -1');

assert(getColorById('electric-cyan').name === 'Electric Cyan', 'getColorById matches Electric Cyan');
assert(getColorById('unknown-color').id === 'cyber-green', 'getColorById falls back to Cyber Green');
assert(getColorByIndex(1).name === 'Electric Cyan', 'getColorByIndex(1) is Electric Cyan');
assert(getColorByIndex(-1).isEraser === true, 'getColorByIndex(-1) returns VOID_ERASER');
assert(getColorByIndex(99).id === PALETTE[99 % 8].id, 'getColorByIndex wraps around modulo');
assert(getColorByHex('#00f0ff').id === 'electric-cyan', 'getColorByHex matches #00f0ff');
assert(getColorByHex('#0A0E17').isEraser === true, 'getColorByHex matches dark eraser hex');
assert(getColorByHex('transparent').isEraser === true, 'getColorByHex matches transparent');

assert(isEraser('void-eraser') === true, 'isEraser("void-eraser") is true');
assert(isEraser('eraser') === true, 'isEraser("eraser") is true');
assert(isEraser(VOID_ERASER) === true, 'isEraser(VOID_ERASER) is true');
assert(isEraser('#00f0ff') === false, 'isEraser("#00f0ff") is false');
assert(isEraser(null) === false, 'isEraser(null) is false');

assert(hexToRgb('#ff007f').r === 255 && hexToRgb('#ff007f').g === 0 && hexToRgb('#ff007f').b === 127, 'hexToRgb full hex converts accurately');
assert(hexToRgb('#f0f').r === 255 && hexToRgb('#f0f').g === 0 && hexToRgb('#f0f').b === 255, 'hexToRgb 3-char shorthand converts accurately');
assert(rgbToHex(255, 0, 127) === '#ff007f', 'rgbToHex converts to #ff007f');
assert(getRgbaString('#ff007f', 0.8) === 'rgba(255, 0, 127, 0.8)', 'getRgbaString generates correct string');
assert(getGlowStyle('#00f0ff').includes('rgba'), 'getGlowStyle returns glow shadow style');

// ── 2. Retro Stamps Features ──
console.log('\n--- 2. Retro Stamps Library ---');
assert(STAMPS.length === 5, '5 retro cyber stamps defined');
const expectedStamps = ['space_invader', 'heart', 'cyber_skull', 'tux_penguin', 'matrix_glyph'];
expectedStamps.forEach(stampId => {
  const s = getStampById(stampId);
  assert(s !== null && s.id === stampId, `Stamp ${stampId} exists`);
  assert(s.width === 8 && s.height === 8, `Stamp ${stampId} is exactly 8x8`);
  assert(s.matrix.length === 8 && s.matrix.every(row => row.length === 8), `Stamp ${stampId} has 8x8 matrix`);
  assert(Array.isArray(s.audioChime) && s.audioChime.length > 0, `Stamp ${stampId} has audio chime sequence`);
});

const placedInvader = getStampPixels('space_invader', 30, 30, '#00ff66', '@alice', 'Retro mark');
assert(placedInvader.length === 32, `Space Invader has 32 active pixels (got ${placedInvader.length})`);
assert(placedInvader.every(p => p.author === '@alice' && p.message === 'Retro mark'), 'Placed pixels preserve author and message');

// ── 3. Web Audio Synthesizer Features ──
console.log('\n--- 3. Web Audio Synthesizer ---');
assert(C_MINOR_PENTATONIC_SCALE.length === 16, 'C-minor pentatonic scale has exactly 16 notes');
assert(C_MINOR_PENTATONIC_SCALE[0].note === 'C3', 'Note 0 is C3');
assert(C_MINOR_PENTATONIC_SCALE[5].note === 'C4', 'Note 5 is C4');
assert(C_MINOR_PENTATONIC_SCALE[10].note === 'C5', 'Note 10 is C5');
assert(C_MINOR_PENTATONIC_SCALE[15].note === 'C6', 'Note 15 is C6');

const synth = new WebAudioSynth({ volume: 0.4, muted: false });
assert(synth.getVolume() === 0.4, 'Synth initialized with volume 0.4');
synth.setVolume(0.75);
assert(synth.getVolume() === 0.75, 'Synth setVolume updates volume');
synth.setMuted(true);
assert(synth.isMuted() === true, 'Synth setMuted(true) mutes audio');
synth.setMuted(false);
assert(synth.isMuted() === false, 'Synth setMuted(false) unmutes audio');

// Spatial pitch mapping tests
const yTop = synth.mapYToFrequency(0);
const yBottom = synth.mapYToFrequency(63);
const yMid = synth.mapYToFrequency(32);
assert(yTop.note === 'C6' && yTop.freq === 1046.50, 'Y=0 maps to top pitch C6 (1046.50 Hz)');
assert(yBottom.note === 'C3' && yBottom.freq === 130.81, 'Y=63 maps to bottom pitch C3 (130.81 Hz)');
assert(yMid.freq > yBottom.freq && yMid.freq < yTop.freq, 'Y=32 maps to middle harmonic register');

// Stereo pan mapping tests
const xLeft = synth.mapXToPan(0);
const xRight = synth.mapXToPan(63);
const xCenter = synth.mapXToPan(31.5);
assert(xLeft === -0.9, `X=0 maps to hard left pan (-0.9)`);
assert(xRight === 0.9, `X=63 maps to hard right pan (+0.9)`);
assert(Math.abs(xCenter) < 0.001, `X=31.5 maps to center pan (0.0)`);

// ── 4. Canvas 2D Engine Features ──
console.log('\n--- 4. Canvas 2D Engine ---');
const canvasMock = {
  width: 800,
  height: 600,
  style: {},
  getContext: () => ({
    save: () => {},
    restore: () => {},
    scale: () => {},
    fillRect: () => {},
    clearRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    stroke: () => {},
    fill: () => {}
  }),
  getBoundingClientRect: () => ({ left: 100, top: 50, width: 800, height: 600 }),
  addEventListener: () => {},
  removeEventListener: () => {}
};

const engine = new PixelEngine(canvasMock, null, { crtEnabled: true, tool: 'paint' });
assert(GRID_WIDTH === 64 && GRID_HEIGHT === 64, 'Matrix dimensions 64x64');
assert(TOTAL_CELLS === 4096, 'Total matrix cells 4096');
assert(engine.getActiveCellCount() === 0, 'Initially empty grid');

// Paint pixel
engine.setPixel(5, 10, '#00f0ff', { author: '@neo', message: 'Follow the white rabbit' });
assert(engine.getActiveCellCount() === 1, '1 active pixel after paint');
const cell = engine.getPixel(5, 10);
assert(cell.color === '#00f0ff' && cell.author === '@neo' && cell.message === 'Follow the white rabbit', 'Cell metadata preserved');

// Density
assert(engine.getGridDensity() === Number(((1 / 4096) * 100).toFixed(2)), 'Grid density computed correctly');

// Pan and Zoom
engine.scale = 10;
engine.panX = 100;
engine.panY = 50;

const screenPt = engine.worldToScreen(5, 10);
assert(screenPt.x === 150 && screenPt.y === 150 && screenPt.size === 10, 'worldToScreen transforms world coord to screen coord');

const clientX = 100 + 155; // rect.left(100) + panX(100) + 5*10 + 5
const clientY = 50 + 155;  // rect.top(50) + panY(50) + 10*10 + 5
const worldPt = engine.screenToWorld(clientX, clientY);
assert(worldPt.gx === 5 && worldPt.gy === 10 && worldPt.inBounds === true, 'screenToWorld inverts screen coord back to (5, 10)');

// Shockwaves
engine.addShockwave(20, 20, '#ff007f');
assert(engine.shockwaves.length === 1, 'Shockwave added to pool');
assert(engine.shockwaves[0].gx === 20 && engine.shockwaves[0].gy === 20 && engine.shockwaves[0].color === '#ff007f', 'Shockwave properties match');

// Hover & Reticle
engine.setHoveredCell(12, 18);
assert(engine.hoveredCell !== null && engine.hoveredCell.gx === 12 && engine.hoveredCell.gy === 18, 'Hovered cell updated to (12, 18)');

// CRT toggle
engine.toggleCrt(false);
assert(engine.crtEnabled === false, 'CRT disabled');
engine.toggleCrt(true);
assert(engine.crtEnabled === true, 'CRT enabled');

// Tool switching
engine.setTool('stamp');
assert(engine.activeTool === 'stamp', 'Tool switched to stamp');
engine.setSelectedStamp('cyber_skull');
assert(engine.activeStampId === 'cyber_skull', 'Selected stamp switched to cyber_skull');

console.log('\n====================================================');
console.log('TIER 2: BOUNDARY VALUE ANALYSIS & EDGE CASES');
console.log('====================================================');

// ── BVA: Coordinate boundaries ──
console.log('\n--- BVA 1: Grid Coordinates Boundaries ---');
// Corners (0,0), (63,0), (0,63), (63,63)
engine.setPixel(0, 0, '#00ff66');
assert(engine.getPixel(0, 0) !== null, 'Corner (0,0) valid');
engine.setPixel(63, 0, '#00ff66');
assert(engine.getPixel(63, 0) !== null, 'Corner (63,0) valid');
engine.setPixel(0, 63, '#00ff66');
assert(engine.getPixel(0, 63) !== null, 'Corner (0,63) valid');
engine.setPixel(63, 63, '#00ff66');
assert(engine.getPixel(63, 63) !== null, 'Corner (63,63) valid');

// Out of bounds: (-1, 0), (64, 0), (0, -1), (0, 64), (100, 100)
engine.setPixel(-1, 0, '#00ff66');
assert(engine.getPixel(-1, 0) === null, 'Out-of-bounds (-1, 0) ignored');
engine.setPixel(64, 0, '#00ff66');
assert(engine.getPixel(64, 0) === null, 'Out-of-bounds (64, 0) ignored');
engine.setPixel(0, -1, '#00ff66');
assert(engine.getPixel(0, -1) === null, 'Out-of-bounds (0, -1) ignored');
engine.setPixel(0, 64, '#00ff66');
assert(engine.getPixel(0, 64) === null, 'Out-of-bounds (0, 64) ignored');

// Screen to world out of bounds
const outWorld = engine.screenToWorld(-1000, -1000);
assert(outWorld.inBounds === false, 'Negative screen coords produce inBounds=false');
const farWorld = engine.screenToWorld(99999, 99999);
assert(farWorld.inBounds === false, 'Large screen coords produce inBounds=false');

// ── BVA: Stamp Clipping at Boundaries ──
console.log('\n--- BVA 2: Stamp Clipping at Grid Borders ---');
// Drop stamp at corner (0,0) -> clipped to only valid in-bound pixels
const cornerPixels = getStampPixels('space_invader', 0, 0, '#00f0ff');
assert(cornerPixels.length > 0, `Stamp at corner (0,0) returns clipped subset (${cornerPixels.length} pixels)`);
assert(cornerPixels.every(p => p.x >= 0 && p.x < 64 && p.y >= 0 && p.y < 64), 'All corner stamp pixels strictly within 0..63 bounds');

const maxCornerPixels = getStampPixels('space_invader', 63, 63, '#00f0ff');
assert(maxCornerPixels.length > 0, `Stamp at corner (63,63) returns clipped subset (${maxCornerPixels.length} pixels)`);
assert(maxCornerPixels.every(p => p.x >= 0 && p.x < 64 && p.y >= 0 && p.y < 64), 'All max corner stamp pixels strictly within 0..63 bounds');

// ── BVA: Audio Synth Boundaries ──
console.log('\n--- BVA 3: WebAudioSynth Boundary Clamping ---');
// Volume clamping
synth.setVolume(-1.5);
assert(synth.getVolume() === 0, 'Negative volume clamped to 0.0');
synth.setVolume(2.5);
assert(synth.getVolume() === 1.0, 'Excessive volume clamped to 1.0');
synth.setVolume('invalid');
assert(synth.getVolume() === 0, 'Invalid volume defaults safely to 0');

// Pitch mapping boundaries
const yNeg = synth.mapYToFrequency(-10);
assert(yNeg.note === 'C6', 'Negative Y clamps to top pitch C6');
const yOver = synth.mapYToFrequency(200);
assert(yOver.note === 'C3', 'Y > 63 clamps to bottom pitch C3');

// Pan mapping boundaries
const xNeg = synth.mapXToPan(-100);
assert(xNeg === -0.9, 'Negative X clamped to -0.9');
const xOver = synth.mapXToPan(500);
assert(xOver === 0.9, 'X > 63 clamped to +0.9');

// ── BVA: Scale & Zoom Limits ──
console.log('\n--- BVA 4: Zoom & Scale Limits ---');
engine.scale = 10;
// Zoom in excessively
for (let i = 0; i < 20; i++) {
  engine.zoomAtPoint(400, 300, 2.0);
}
assert(engine.scale <= engine.maxScale, `Scale clamped at maxScale (${engine.scale} <= ${engine.maxScale})`);

// Zoom out excessively
for (let i = 0; i < 20; i++) {
  engine.zoomAtPoint(400, 300, 0.5);
}
assert(engine.scale >= engine.minScale, `Scale clamped at minScale (${engine.scale} >= ${engine.minScale})`);

// ── BVA: Bulk Grid Load & Delta Sync ──
console.log('\n--- BVA 5: Bulk Load & Grid Reset ---');
engine.clearGrid();
assert(engine.getActiveCellCount() === 0, 'Clear grid resets count to 0');

const bulkData = {
  '10_10': { color: '#00ff66', author: '@guest1' },
  '20_20': { color: '#00f0ff', author: '@guest2' },
  '30_30': { color: '#ff007f', author: '@guest3' }
};
engine.loadGrid(bulkData);
assert(engine.getActiveCellCount() === 3, 'loadGrid accurately loaded 3 cells from dictionary');
assert(engine.getPixel(10, 10).author === '@guest1', 'Cell 10,10 author is @guest1');
assert(engine.getPixel(20, 20).author === '@guest2', 'Cell 20,20 author is @guest2');

// Cleanup
engine.destroy();
synth.destroy();

console.log('\n====================================================');
console.log(`TOTAL TESTS PASSED: ${passed}`);
console.log(`TOTAL TESTS FAILED: ${failed}`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}

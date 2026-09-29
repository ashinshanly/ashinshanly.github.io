/**
 * Verification test for PixelHUD M1 & M2 (Canvas Engine & Web Audio Synth)
 */

import { PALETTE, VOID_ERASER, getColorById, getColorByIndex, getColorByHex, isEraser, hexToRgb, rgbToHex, getRgbaString } from '../../components/pixel_hud/palette.js';
import { STAMPS, getStampById, getStampPixels } from '../../components/pixel_hud/stamps.js';
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

console.log('=== Verifying Milestone M1: Palette & Stamps ===');

// 1. Palette verification
assert(PALETTE.length === 8, `Palette has 8 neon colors (got ${PALETTE.length})`);
assert(VOID_ERASER.isEraser === true, 'VOID_ERASER has isEraser=true');
assert(getColorById('electric-cyan').hex === '#00f0ff', 'getColorById resolves Electric Cyan');
assert(getColorByIndex(0).id === 'cyber-green', 'getColorByIndex(0) is Cyber Green');
assert(getColorByHex('#00ff66').name === 'Cyber Green', 'getColorByHex returns correct name');
assert(isEraser('void-eraser') === true, 'isEraser("void-eraser") is true');
assert(isEraser(VOID_ERASER) === true, 'isEraser(VOID_ERASER) is true');
assert(isEraser('#00f0ff') === false, 'isEraser("#00f0ff") is false');

const rgb = hexToRgb('#00f0ff');
assert(rgb.r === 0 && rgb.g === 240 && rgb.b === 255, `hexToRgb('#00f0ff') -> ${JSON.stringify(rgb)}`);
assert(rgbToHex(0, 240, 255) === '#00f0ff', `rgbToHex(0, 240, 255) -> ${rgbToHex(0, 240, 255)}`);
assert(getRgbaString('#00f0ff', 0.5) === 'rgba(0, 240, 255, 0.5)', `getRgbaString output: ${getRgbaString('#00f0ff', 0.5)}`);

// 2. Stamps verification
assert(STAMPS.length === 5, `STAMPS has 5 retro stamps (got ${STAMPS.length})`);
const invader = getStampById('space_invader');
assert(invader !== null && invader.width === 8 && invader.height === 8, 'Space Invader is 8x8');
const skull = getStampById('cyber_skull');
assert(skull !== null && skull.audioChime.length > 0, 'Cyber Skull has audio chime intervals');

const stampPixels = getStampPixels('space_invader', 32, 32, '#00ff66', '@alice', 'Hello Matrix');
assert(stampPixels.length > 0, `Space invader produced ${stampPixels.length} active pixels`);
assert(stampPixels.every(p => p.x >= 0 && p.x < 64 && p.y >= 0 && p.y < 64), 'All stamp pixels within 64x64 bounds');
assert(stampPixels[0].author === '@alice', 'Stamp pixel retains author metadata');

// 3. Web Audio Synth verification
console.log('\n=== Verifying Milestone M2: Web Audio Synthesizer ===');
assert(C_MINOR_PENTATONIC_SCALE.length === 16, `C-minor pentatonic scale has 16 notes (got ${C_MINOR_PENTATONIC_SCALE.length})`);
assert(C_MINOR_PENTATONIC_SCALE[0].note === 'C3' && C_MINOR_PENTATONIC_SCALE[0].freq === 130.81, 'Scale starts at C3 (130.81 Hz)');
assert(C_MINOR_PENTATONIC_SCALE[15].note === 'C6' && C_MINOR_PENTATONIC_SCALE[15].freq === 1046.50, 'Scale ends at C6 (1046.50 Hz)');

const synth = new WebAudioSynth({ volume: 0.5, muted: false });
assert(synth.getVolume() === 0.5, `Synth initial volume is 0.5 (got ${synth.getVolume()})`);
synth.setVolume(0.8);
assert(synth.getVolume() === 0.8, 'Synth volume updated to 0.8');
synth.setMuted(true);
assert(synth.isMuted() === true, 'Synth muted state is true');
synth.setMuted(false);
assert(synth.isMuted() === false, 'Synth unmuted');

const topPitch = synth.mapYToFrequency(0);
const bottomPitch = synth.mapYToFrequency(63);
assert(topPitch.freq > bottomPitch.freq, `Top pitch (${topPitch.note} ${topPitch.freq}Hz) > Bottom pitch (${bottomPitch.note} ${bottomPitch.freq}Hz)`);
assert(topPitch.note === 'C6', `Top grid cell (Y=0) maps to C6 (got ${topPitch.note})`);
assert(bottomPitch.note === 'C3', `Bottom grid cell (Y=63) maps to C3 (got ${bottomPitch.note})`);

const leftPan = synth.mapXToPan(0);
const rightPan = synth.mapXToPan(63);
const centerPan = synth.mapXToPan(31.5);
assert(leftPan < -0.8, `Left pan is negative (${leftPan.toFixed(2)})`);
assert(rightPan > 0.8, `Right pan is positive (${rightPan.toFixed(2)})`);
assert(Math.abs(centerPan) < 0.05, `Center pan is approximately 0 (${centerPan.toFixed(2)})`);

// 4. PixelEngine verification with mock canvas
console.log('\n=== Verifying Milestone M1: PixelEngine & Math ===');
const mockCanvas = {
  width: 640,
  height: 640,
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
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 640 }),
  addEventListener: () => {},
  removeEventListener: () => {}
};

const engine = new PixelEngine(mockCanvas, null, { crtEnabled: true });
assert(GRID_WIDTH === 64 && GRID_HEIGHT === 64, 'Grid dimensions are 64x64');
assert(TOTAL_CELLS === 4096, 'Total cells count is 4096');
assert(engine.getActiveCellCount() === 0, 'Initial active cell count is 0');

// Pixel manipulation
engine.setPixel(10, 20, '#00f0ff', { author: '@cyberpunk', message: 'Wake up' });
assert(engine.getActiveCellCount() === 1, 'Active cell count is 1 after setPixel');
const pixel = engine.getPixel(10, 20);
assert(pixel !== null && pixel.color === '#00f0ff' && pixel.author === '@cyberpunk', 'getPixel retrieves stored cell');

// Erasing
engine.setPixel(10, 20, null);
assert(engine.getActiveCellCount() === 0, 'Pixel erased with null color');

// Applying stamp
const applied = engine.applyStamp(32, 32, 'space_invader', '#ff007f', { author: '@bob' });
assert(applied.length > 0, `Stamp applied with ${applied.length} pixels`);
assert(engine.getActiveCellCount() === applied.length, `Active cell count matches stamp pixels (${engine.getActiveCellCount()})`);
assert(engine.shockwaves.length === 1, 'Shockwave added on stamp drop');

// Coordinate transforms
engine.scale = 10;
engine.panX = 0;
engine.panY = 0;
const screenCoord = engine.worldToScreen(5, 5);
assert(screenCoord.x === 50 && screenCoord.y === 50 && screenCoord.size === 10, `worldToScreen(5,5) -> (${screenCoord.x}, ${screenCoord.y})`);

const worldCoord = engine.screenToWorld(55, 55);
assert(worldCoord.gx === 5 && worldCoord.gy === 5 && worldCoord.inBounds === true, `screenToWorld(55, 55) -> (${worldCoord.gx}, ${worldCoord.gy})`);

// Zoom at point
engine.zoomAtPoint(320, 320, 2.0);
assert(engine.scale === 20, `Zoom scaled by 2x to ${engine.scale}`);

// Author isolation
engine.setIsolatedAuthor('@bob');
assert(engine.isolatedAuthor === '@bob', 'Author isolation set to @bob');
engine.setIsolatedAuthor(null);
assert(engine.isolatedAuthor === null, 'Author isolation cleared');

// Cleanup
engine.destroy();
synth.destroy();

console.log(`\n========================================`);
console.log(`Tests Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) {
  process.exit(1);
}

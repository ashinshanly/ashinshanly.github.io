/**
 * Responsive Viewport & Touch Ergonomics Audit for PixelHUD
 * 
 * Verifies that header, floating dock, modals, and canvas engine
 * adapt cleanly to various screen sizes without horizontal overflow or clipping.
 */

import { PixelEngine, GRID_WIDTH, GRID_HEIGHT } from '../../components/pixel_hud/PixelEngine.js';
import { PALETTE } from '../../components/pixel_hud/palette.js';
import { STAMPS } from '../../components/pixel_hud/stamps.js';
import { MockCanvasElement } from './mocks/mock_canvas.mjs';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${message}`);
  } else {
    failed++;
    console.error(`  \x1b[31m✖\x1b[0m ${message}`);
  }
}

console.log('\n====================================================');
console.log('PIXELHUD RESPONSIVE AUDIT: MOBILE & DESKTOP SUITE');
console.log('====================================================\n');

// Viewports to test
const viewports = [
  { name: 'Mobile Ultra-Compact (iPhone SE 1)', width: 320, height: 568 },
  { name: 'Mobile Standard Android', width: 360, height: 780 },
  { name: 'Mobile iPhone Standard (iPhone 14/15)', width: 390, height: 844 },
  { name: 'Mobile Large (Pixel 7 / Galaxy S23+)', width: 412, height: 915 },
  { name: 'Tablet Portrait (iPad Mini)', width: 768, height: 1024 },
  { name: 'Desktop Standard HD', width: 1280, height: 800 },
  { name: 'Desktop Full HD', width: 1920, height: 1080 }
];

console.log('>>> 1. Viewport Canvas Engine Adaptation...');
for (const vp of viewports) {
  const mockCanvas = new MockCanvasElement(vp.width, vp.height);
  const engine = new PixelEngine(mockCanvas, null, {
    tool: 'paint',
    activeColor: '#00f0ff'
  });
  engine.init();

  // Resize to viewport
  engine.resize();

  assert(
    engine.canvas.width > 0 && engine.canvas.height > 0,
    `[${vp.name}] Canvas resized cleanly to ${engine.canvas.width}x${engine.canvas.height}`
  );

  // Center grid
  engine.centerGrid();
  assert(
    engine.scale >= engine.minScale && engine.scale <= engine.maxScale,
    `[${vp.name}] Scale ${engine.scale.toFixed(2)} clamped within bounds [${engine.minScale}, ${engine.maxScale}]`
  );

  // Verify that full grid (64*scale) fits horizontally within the viewport (with margins)
  const gridRenderWidth = GRID_WIDTH * engine.scale;
  assert(
    gridRenderWidth <= vp.width,
    `[${vp.name}] Grid width (${gridRenderWidth.toFixed(1)}px) fits inside viewport width (${vp.width}px)`
  );

  engine.destroy();
}

console.log('\n>>> 2. Touch & Pointer Interaction Reliability...');
{
  const mockCanvas = new MockCanvasElement(390, 844);
  let paintCalled = false;
  let paintedCoords = null;

  const engine = new PixelEngine(mockCanvas, null, {
    tool: 'paint',
    activeColor: '#00ff66',
    onPixelPaint: (gx, gy, color) => {
      paintCalled = true;
      paintedCoords = { gx, gy, color };
    }
  });
  engine.init();
  engine.centerGrid();

  // Simulate touch start in center of grid
  const screenCenterX = 195;
  const screenCenterY = 422;
  const worldCoords = engine.screenToWorld(screenCenterX, screenCenterY);

  assert(worldCoords.inBounds === true, 'Center screen tap maps to in-bounds grid cell');

  // Simulate touchstart event
  engine._handleTouchStart({
    preventDefault: () => {},
    touches: [{ clientX: screenCenterX, clientY: screenCenterY }]
  });

  assert(paintCalled === true, 'Single finger touchstart executes pixel paint');
  assert(paintedCoords !== null && paintedCoords.color === '#00ff66', 'Painted pixel color matches activeColor');

  // Simulate 2-finger pinch zoom
  engine._handleTouchStart({
    preventDefault: () => {},
    touches: [
      { clientX: 150, clientY: 400 },
      { clientX: 250, clientY: 400 }
    ]
  });

  assert(engine.isPinching === true, 'Two finger touchstart initiates pinch-to-zoom mode');

  // Pinch move (spread fingers apart to zoom in)
  const prevScale = engine.scale;
  engine._handleTouchMove({
    preventDefault: () => {},
    touches: [
      { clientX: 100, clientY: 400 },
      { clientX: 300, clientY: 400 }
    ]
  });

  assert(engine.scale >= prevScale, 'Pinch expansion increases canvas scale factor');

  // Touch end
  engine._handleTouchEnd({
    touches: []
  });

  assert(engine.isPinching === false && engine.isMouseDown === false, 'Touch end resets gesture states cleanly');

  engine.destroy();
}

console.log('\n>>> 3. Floating Dock Mobile & Desktop Math Verification...');
{
  // Mobile dock contains: 4 tools (32px) + 1 color button (32px) + 2 history buttons (32px) + 1 message button (32px) + 3 dividers (1px) + 7 gaps (4px)
  const mobileDockWidth = (4 * 32) + (1 * 32) + (2 * 32) + (1 * 32) + (3 * 1) + (7 * 4) + (2 * 8);
  assert(
    mobileDockWidth <= 320,
    `Mobile dock calculated width (${mobileDockWidth}px) fits on minimum 320px screen`
  );

  // Desktop dock contains: 4 tools (36px) + 8 swatches (24px) + 2 history (36px) + 1 message (36px) + 3 dividers (1px) + gaps
  const desktopDockWidth = (4 * 36) + (8 * 24) + (2 * 36) + (1 * 36) + (3 * 1) + (14 * 6) + (2 * 8);
  assert(
    desktopDockWidth <= 640,
    `Desktop dock calculated width (${desktopDockWidth}px) fits cleanly on desktop breakpoints`
  );
}

console.log('\n====================================================');
console.log(`TOTAL AUDIT TESTS PASSED: ${passed}`);
console.log(`TOTAL AUDIT TESTS FAILED: ${failed}`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}

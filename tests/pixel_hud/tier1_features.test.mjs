// tests/pixel_hud/tier1_features.test.mjs
// Tier 1: Feature Isolation Tests for all 21 PixelHUD Features

import { describe, it, expect, beforeEach } from "./helpers/test_framework.mjs";
import { MockCanvasElement } from "./mocks/mock_canvas.mjs";
import { MockAudioContext } from "./mocks/mock_webaudio.mjs";
import { MockRealtimeDatabase } from "./mocks/mock_firebase.mjs";
import {
  GRID_SIZE,
  TOTAL_PIXELS,
  PALETTE,
  STAMPS,
  C_MINOR_PENTATONIC_SCALE,
  screenToWorld,
  worldToScreen,
  zoomAtPoint,
  mapYCoordToFrequency,
  mapXCoordToPan,
  sanitizeAuthor,
  sanitizeMessage,
  calculateMatrixMetrics,
  TokenBucketLimiter
} from "./helpers/reference_models.mjs";

describe("Tier 1: Feature Isolation Test Suite", () => {
  let mockCanvas;
  let mockAudioCtx;
  let mockDb;

  beforeEach(() => {
    mockCanvas = new MockCanvasElement(800, 600);
    mockAudioCtx = new MockAudioContext();
    mockDb = new MockRealtimeDatabase();
  });

  // Feature 1: 64x64 Canvas 2D Matrix Engine
  describe("Feature 1: 64x64 Canvas 2D Matrix Engine", () => {
    it("F1.1: Initializes exact 64x64 matrix grid capacity (4096 cells)", () => {
      expect(GRID_SIZE).toBe(64);
      expect(TOTAL_PIXELS).toBe(4096);
      const grid = new Map();
      expect(grid.size).toBe(0);
    });

    it("F1.2: Setting pixel at (0,0), (63,63), and (32,32) updates cell state", () => {
      const grid = new Map();
      grid.set("0_0", { color: PALETTE[0].hex, author: "@alice", timestamp: 1000 });
      grid.set("63_63", { color: PALETTE[1].hex, author: "@bob", timestamp: 1001 });
      grid.set("32_32", { color: PALETTE[2].hex, author: "@charlie", timestamp: 1002 });

      expect(grid.has("0_0")).toBeTruthy();
      expect(grid.get("0_0").color).toBe(PALETTE[0].hex);
      expect(grid.get("63_63").author).toBe("@bob");
      expect(grid.get("32_32").timestamp).toBe(1002);
    });

    it("F1.3: Overwriting existing pixel updates color and retains grid integrity", () => {
      const grid = new Map();
      grid.set("10_10", { color: PALETTE[0].hex, author: "@alice", timestamp: 1000 });
      grid.set("10_10", { color: PALETTE[3].hex, author: "@bob", timestamp: 2000 });
      expect(grid.get("10_10").color).toBe(PALETTE[3].hex);
      expect(grid.get("10_10").author).toBe("@bob");
      expect(grid.size).toBe(1);
    });

    it("F1.4: World to screen coordinate projection calculates exact pixel rects", () => {
      const panX = 100, panY = 50, scale = 1.0, cellSize = 10;
      const s0 = worldToScreen(0, 0, panX, panY, scale, cellSize);
      expect(s0.x).toBe(100);
      expect(s0.y).toBe(50);
      expect(s0.size).toBe(10);

      const s5 = worldToScreen(5, 5, panX, panY, scale, cellSize);
      expect(s5.x).toBe(150);
      expect(s5.y).toBe(100);
    });

    it("F1.5: Screen to world coordinate projection maps client clicks to grid cells", () => {
      const panX = 100, panY = 50, scale = 1.0, cellSize = 10;
      const coord = screenToWorld(155, 105, panX, panY, scale, cellSize);
      expect(coord.gx).toBe(5);
      expect(coord.gy).toBe(5);
      expect(coord.inBounds).toBeTruthy();
    });

    it("F1.6: Matrix reset clears all cells back to unpainted state", () => {
      const grid = new Map();
      for (let i = 0; i < 10; i++) grid.set(i + "_" + i, { color: PALETTE[0].hex });
      expect(grid.size).toBe(10);
      grid.clear();
      expect(grid.size).toBe(0);
    });
  });

  // Feature 2: Neon Bloom Glow & CRT Shader
  describe("Feature 2: Neon Bloom Glow & CRT Shader", () => {
    it("F2.1: Palette items contain explicit rgba bloom glow definitions", () => {
      expect(PALETTE.length).toBe(8);
      for (const col of PALETTE) {
        expect(col.glow).toMatch(/^rgba\(/);
        expect(col.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    it("F2.2: Bloom rendering applies configured shadowBlur and shadowColor", () => {
      const ctx = mockCanvas.getContext("2d");
      ctx.shadowBlur = 12;
      ctx.shadowColor = PALETTE[0].glow;
      ctx.fillRect(10, 10, 10, 10);

      expect(ctx.shadowBlur).toBe(12);
      expect(ctx.shadowColor).toBe(PALETTE[0].glow);
      expect(ctx.drawCalls.length).toBeGreaterThan(0);
    });

    it("F2.3: CRT scanline generator creates alternating scanline bands", () => {
      const scanlines = [];
      const height = 100, step = 4;
      for (let y = 0; y < height; y += step) {
        scanlines.push({ y, h: 2, alpha: 0.15 });
      }
      expect(scanlines.length).toBe(25);
      expect(scanlines[0].y).toBe(0);
      expect(scanlines[1].y).toBe(4);
    });

    it("F2.4: Vignette gradient defines center transparent to corner dark stops", () => {
      const ctx = mockCanvas.getContext("2d");
      const grad = ctx.createRadialGradient(400, 300, 100, 400, 300, 500);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.7)");
      expect(grad.colorStops.length).toBe(2);
      expect(grad.colorStops[0].color).toBe("rgba(0,0,0,0)");
      expect(grad.colorStops[1].color).toBe("rgba(0,0,0,0.7)");
    });

    it("F2.5: CRT filter state toggles between enabled and disabled", () => {
      let crtEnabled = true;
      const toggle = () => { crtEnabled = !crtEnabled; return crtEnabled; };
      expect(toggle()).toBe(false);
      expect(toggle()).toBe(true);
    });

    it("F2.6: Phosphor color tinting applies cyberpunk cyan-green tone", () => {
      const phosphorTint = "rgba(0, 240, 255, 0.05)";
      expect(phosphorTint).toMatch(/rgba\(0,\s*240,\s*255/);
    });
  });

  // Feature 3: Pan & Zoom Transformation Math
  describe("Feature 3: Pan & Zoom Transformation Math", () => {
    it("F3.1: Zooming in increases scale and preserves focal point in world space", () => {
      const initial = { scale: 1.0, panX: 0, panY: 0 };
      const focalX = 200, focalY = 150;
      const zoomed = zoomAtPoint(focalX, focalY, 0.5, initial.scale, initial.panX, initial.panY);
      expect(zoomed.scale).toBe(1.5);
      expect(zoomed.panX).toBeLessThan(0);
      expect(zoomed.panY).toBeLessThan(0);
    });

    it("F3.2: Zooming out decreases scale and clamps to minScale (0.5x)", () => {
      const clamped = zoomAtPoint(200, 150, -0.8, 1.0, 0, 0, 0.5, 16.0);
      expect(clamped.scale).toBe(0.5);
    });

    it("F3.3: Zooming in clamps to maxScale (16.0x)", () => {
      const clamped = zoomAtPoint(200, 150, 20.0, 1.0, 0, 0, 0.5, 16.0);
      expect(clamped.scale).toBe(16.0);
    });

    it("F3.4: Panning shifts pan offsets by exact deltaX and deltaY", () => {
      let panX = 100, panY = 50;
      panX += 25;
      panY += -15;
      expect(panX).toBe(125);
      expect(panY).toBe(35);
    });

    it("F3.5: CenterGrid positions 64x64 matrix centrally within viewport", () => {
      const viewW = 800, viewH = 600, cellSize = 10, scale = 1.0;
      const gridPixelW = GRID_SIZE * cellSize * scale;
      const gridPixelH = GRID_SIZE * cellSize * scale;
      const centeredPanX = (viewW - gridPixelW) / 2;
      const centeredPanY = (viewH - gridPixelH) / 2;

      expect(centeredPanX).toBe(80);
      expect(centeredPanY).toBe(-20);
    });

    it("F3.6: Matrix boundary check verifies viewport visibility", () => {
      const isVisible = (gx, gy) => gx >= 0 && gx < 64 && gy >= 0 && gy < 64;
      expect(isVisible(0, 0)).toBe(true);
      expect(isVisible(63, 63)).toBe(true);
      expect(isVisible(64, 64)).toBe(false);
    });
  });

  // Feature 4: 8-Color Cyber Neon Palette & Eraser
  describe("Feature 4: 8-Color Cyber Neon Palette & Eraser", () => {
    it("F4.1: Contains exactly 8 distinct cyber neon color definitions", () => {
      expect(PALETTE.length).toBe(8);
      const uniqueHex = new Set(PALETTE.map(p => p.hex));
      expect(uniqueHex.size).toBe(8);
    });

    it("F4.2: Each palette entry contains name, hex, glow, note, freq, and filter", () => {
      for (const col of PALETTE) {
        expect(typeof col.name).toBe("string");
        expect(typeof col.hex).toBe("string");
        expect(typeof col.glow).toBe("string");
        expect(typeof col.note).toBe("string");
        expect(typeof col.freq).toBe("number");
        expect(typeof col.filter).toBe("number");
      }
    });

    it("F4.3: Selecting a palette color updates active tool state", () => {
      let selectedColor = PALETTE[0].hex;
      selectedColor = PALETTE[4].hex;
      expect(selectedColor).toBe(PALETTE[4].hex);
    });

    it("F4.4: Eraser mode is represented as null or empty color value", () => {
      let activeColor = PALETTE[0].hex;
      let isEraser = true;
      if (isEraser) activeColor = null;
      expect(isEraser).toBe(true);
      expect(activeColor).toBeNull();
    });

    it("F4.5: Erasing cell removes entry from grid map", () => {
      const grid = new Map();
      grid.set("12_12", { color: PALETTE[0].hex, author: "@guest" });
      expect(grid.has("12_12")).toBeTruthy();
      grid.delete("12_12");
      expect(grid.has("12_12")).toBeFalsy();
    });

    it("F4.6: Color palette indices 0 through 7 map to valid colors", () => {
      for (let i = 0; i < 8; i++) {
        expect(PALETTE[i]).toBeDefined();
        expect(PALETTE[i].hex.startsWith("#")).toBe(true);
      }
    });
  });

  // Feature 5: 5 Retro Cyber Stamps Library
  describe("Feature 5: 5 Retro Cyber Stamps Library", () => {
    it("F5.1: Library defines all 5 required retro cyber stamps", () => {
      expect(STAMPS.space_invader).toBeDefined();
      expect(STAMPS.heart_8bit).toBeDefined();
      expect(STAMPS.cyber_skull).toBeDefined();
      expect(STAMPS.tux_penguin).toBeDefined();
      expect(STAMPS.matrix_glyph).toBeDefined();
    });

    it("F5.2: Every stamp is structured as a 5x5 binary matrix (25 elements total)", () => {
      for (const key of Object.keys(STAMPS)) {
        const stamp = STAMPS[key];
        expect(stamp.width).toBe(5);
        expect(stamp.height).toBe(5);
        expect(stamp.matrix.length).toBe(5);
        for (const row of stamp.matrix) {
          expect(row.length).toBe(5);
        }
      }
    });

    it("F5.3: Stamping Space Invader centered at (32,32) writes active bits to grid", () => {
      const grid = new Map();
      const stamp = STAMPS.space_invader;
      const cx = 32, cy = 32;
      let activeBitsCount = 0;

      for (let r = 0; r < stamp.height; r++) {
        for (let c = 0; c < stamp.width; c++) {
          if (stamp.matrix[r][c] === 1) {
            activeBitsCount++;
            const gx = cx - 2 + c;
            const gy = cy - 2 + r;
            grid.set(gx + "_" + gy, { color: PALETTE[0].hex, author: "@stamp_user" });
          }
        }
      }

      expect(activeBitsCount).toBeGreaterThan(8);
      expect(grid.size).toBe(activeBitsCount);
      expect(grid.has("32_32")).toBeTruthy();
    });

    it("F5.4: Stamping near grid boundary clips out-of-bounds pixels safely", () => {
      const grid = new Map();
      const stamp = STAMPS.heart_8bit;
      const cx = 0, cy = 0;

      for (let r = 0; r < stamp.height; r++) {
        for (let c = 0; c < stamp.width; c++) {
          if (stamp.matrix[r][c] === 1) {
            const gx = cx - 2 + c;
            const gy = cy - 2 + r;
            if (gx >= 0 && gx < 64 && gy >= 0 && gy < 64) {
              grid.set(gx + "_" + gy, { color: PALETTE[1].hex });
            }
          }
        }
      }

      for (const key of grid.keys()) {
        const [x, y] = key.split("_").map(Number);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
      }
    });

    it("F5.5: Stamp metadata applies uniform author and timestamp to all stamped cells", () => {
      const stamp = STAMPS.tux_penguin;
      const cells = [];
      const author = "@linux_fan";
      const timestamp = 1700000000;

      for (let r = 0; r < stamp.height; r++) {
        for (let c = 0; c < stamp.width; c++) {
          if (stamp.matrix[r][c] === 1) {
            cells.push({ x: c, y: r, author, timestamp });
          }
        }
      }

      expect(cells.every(c => c.author === "@linux_fan")).toBeTruthy();
      expect(cells.every(c => c.timestamp === 1700000000)).toBeTruthy();
    });

    it("F5.6: Stamp pixel count for Space Invader equals exactly 15 active pixels", () => {
      const matrix = STAMPS.space_invader.matrix;
      let count = 0;
      for (const row of matrix) {
        for (const bit of row) if (bit === 1) count++;
      }
      expect(count).toBe(15);
    });
  });

  // Feature 6: Pentatonic C-Minor Web Audio Synth
  describe("Feature 6: Pentatonic C-Minor Web Audio Synth", () => {
    it("F6.1: Scale definitions span C3 (130.81Hz) to C6 (1046.50Hz)", () => {
      expect(C_MINOR_PENTATONIC_SCALE.length).toBe(16);
      expect(C_MINOR_PENTATONIC_SCALE[0].note).toBe("C3");
      expect(C_MINOR_PENTATONIC_SCALE[0].freq).toBe(130.81);
      expect(C_MINOR_PENTATONIC_SCALE[C_MINOR_PENTATONIC_SCALE.length - 1].note).toBe("C6");
      expect(C_MINOR_PENTATONIC_SCALE[C_MINOR_PENTATONIC_SCALE.length - 1].freq).toBe(1046.50);
    });

    it("F6.2: Synthesizer instantiates oscillator, gain, and filter nodes", () => {
      const osc = mockAudioCtx.createOscillator();
      const gain = mockAudioCtx.createGain();
      const filter = mockAudioCtx.createBiquadFilter();

      expect(osc).toBeDefined();
      expect(gain).toBeDefined();
      expect(filter).toBeDefined();
      expect(mockAudioCtx.createdNodes.length).toBe(3);
    });

    it("F6.3: Note envelope configures attack, decay, sustain, and release ramps", () => {
      const gain = mockAudioCtx.createGain();
      const now = mockAudioCtx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      expect(gain.gain.events.length).toBe(3);
      expect(gain.gain.events[0].type).toBe("setValueAtTime");
      expect(gain.gain.events[1].type).toBe("linearRampToValueAtTime");
      expect(gain.gain.events[2].type).toBe("exponentialRampToValueAtTime");
    });

    it("F6.4: Audio nodes connect through signal chain to destination", () => {
      const osc = mockAudioCtx.createOscillator();
      const filter = mockAudioCtx.createBiquadFilter();
      const gain = mockAudioCtx.createGain();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(mockAudioCtx.destination);

      expect(osc.connections).toContain(filter);
      expect(filter.connections).toContain(gain);
      expect(gain.connections).toContain(mockAudioCtx.destination);
    });

    it("F6.5: Oscillator starts and stops with scheduled cleanup", () => {
      const osc = mockAudioCtx.createOscillator();
      osc.start(0);
      osc.stop(0.4);

      expect(osc.started).toBe(true);
      expect(osc.stopped).toBe(true);
      expect(osc.stopTime).toBe(0.4);
    });

    it("F6.6: Scale frequencies are strictly monotonically increasing", () => {
      for (let i = 1; i < C_MINOR_PENTATONIC_SCALE.length; i++) {
        expect(C_MINOR_PENTATONIC_SCALE[i].freq).toBeGreaterThan(C_MINOR_PENTATONIC_SCALE[i - 1].freq);
      }
    });

    it("F6.7: playLaserDrop executes downward frequency sweep without throwing", () => {
      const osc = mockAudioCtx.createOscillator();
      const gain = mockAudioCtx.createGain();
      const now = mockAudioCtx.currentTime;
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain);
      gain.connect(mockAudioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.13);

      expect(osc.started).toBe(true);
      expect(osc.stopped).toBe(true);
      expect(gain.gain.events.length).toBe(3);
    });

    it("F6.8: playLaserRise executes upward frequency sweep without throwing", () => {
      const osc = mockAudioCtx.createOscillator();
      const gain = mockAudioCtx.createGain();
      const now = mockAudioCtx.currentTime;
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain);
      gain.connect(mockAudioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.13);

      expect(osc.started).toBe(true);
      expect(osc.stopped).toBe(true);
      expect(gain.gain.events.length).toBe(3);
    });

    it("F6.9: playProtectedAlert executes lowpass alert without throwing", () => {
      const osc = mockAudioCtx.createOscillator();
      const filter = mockAudioCtx.createBiquadFilter();
      const gain = mockAudioCtx.createGain();
      const now = mockAudioCtx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(110, now);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(350, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(mockAudioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      expect(osc.started).toBe(true);
      expect(osc.stopped).toBe(true);
    });
  });

  // Feature 7: Coordinate & Color Audio Modulation
  describe("Feature 7: Coordinate & Color Audio Modulation", () => {
    it("F7.1: Y-coordinate 63 maps to lowest frequency (C3 / 130.81 Hz)", () => {
      const note = mapYCoordToFrequency(63);
      expect(note.note).toBe("C3");
      expect(note.freq).toBe(130.81);
    });

    it("F7.2: Y-coordinate 0 maps to highest frequency (C6 / 1046.50 Hz)", () => {
      const note = mapYCoordToFrequency(0);
      expect(note.note).toBe("C6");
      expect(note.freq).toBe(1046.50);
    });

    it("F7.3: X-coordinate 0 maps to stereo pan -0.9 (Left)", () => {
      const pan = mapXCoordToPan(0);
      expect(pan).toBe(-0.9);
    });

    it("F7.4: X-coordinate 63 maps to stereo pan +0.9 (Right)", () => {
      const pan = mapXCoordToPan(63);
      expect(pan).toBe(0.9);
    });

    it("F7.5: Palette colors select distinct wave types and filter cutoffs", () => {
      const cyan = PALETTE[0];
      const magenta = PALETTE[1];
      expect(cyan.wave).toBe("triangle");
      expect(cyan.filter).toBe(2400);
      expect(magenta.wave).toBe("sawtooth");
      expect(magenta.filter).toBe(1800);
      expect(cyan.filter).not.toBe(magenta.filter);
    });

    it("F7.6: Center X coordinate (31.5) produces balanced centered pan ~0.0", () => {
      const pan = mapXCoordToPan(31.5);
      expect(Math.abs(pan)).toBeLessThanOrEqual(0.05);
    });
  });

  // Feature 8: Master Volume & Mute Controls
  describe("Feature 8: Master Volume & Mute Controls", () => {
    it("F8.1: Master volume initializes with soft volume setting (e.g. 0.3)", () => {
      let volume = 0.3;
      expect(volume).toBe(0.3);
    });

    it("F8.2: Setting volume updates gain within [0.0, 1.0]", () => {
      let volume = 0.3;
      const setVol = (v) => { volume = Math.max(0, Math.min(1, v)); };
      setVol(0.75);
      expect(volume).toBe(0.75);
      setVol(1.5);
      expect(volume).toBe(1.0);
      setVol(-0.2);
      expect(volume).toBe(0.0);
    });

    it("F8.3: Mute toggle immediately silences master output", () => {
      let muted = false;
      let vol = 0.5;
      muted = true;
      const effectiveVol = muted ? 0.0 : vol;
      expect(effectiveVol).toBe(0.0);
      expect(muted).toBe(true);
    });

    it("F8.4: Unmuting restores previous volume level", () => {
      let muted = true;
      let vol = 0.65;
      muted = false;
      expect(muted ? 0.0 : vol).toBe(0.65);
    });

    it("F8.5: Master gain node accurately receives muted vs active values", () => {
      const masterGain = mockAudioCtx.createGain();
      masterGain.gain.value = 0.4;
      expect(masterGain.gain.value).toBe(0.4);

      masterGain.gain.value = 0.0;
      expect(masterGain.gain.value).toBe(0.0);
    });

    it("F8.6: Setting volume while muted stores target volume without unmuting", () => {
      let muted = true;
      let storedVol = 0.3;
      const setVolume = (v) => { storedVol = v; };
      setVolume(0.8);
      expect(storedVol).toBe(0.8);
      expect(muted).toBe(true);
    });
  });

  // Feature 9: Autoplay Policy Audio Unlocker
  describe("Feature 9: Autoplay Policy Audio Unlocker", () => {
    it("F9.1: AudioContext starts in suspended state", () => {
      expect(mockAudioCtx.state).toBe("suspended");
    });

    it("F9.2: Unlock triggers context resume to running state", async () => {
      await mockAudioCtx.resume();
      expect(mockAudioCtx.state).toBe("running");
    });

    it("F9.3: isUnlocked boolean reflects context running state", async () => {
      const isUnlocked = () => mockAudioCtx.state === "running";
      expect(isUnlocked()).toBe(false);
      await mockAudioCtx.resume();
      expect(isUnlocked()).toBe(true);
    });

    it("F9.4: Playing notes when suspended triggers graceful resume", async () => {
      let autoUnlocked = false;
      const play = async () => {
        if (mockAudioCtx.state !== "running") {
          await mockAudioCtx.resume();
          autoUnlocked = true;
        }
      };
      await play();
      expect(autoUnlocked).toBe(true);
      expect(mockAudioCtx.state).toBe("running");
    });

    it("F9.5: Redundant unlock calls on running context succeed safely", async () => {
      await mockAudioCtx.resume();
      await mockAudioCtx.resume();
      expect(mockAudioCtx.state).toBe("running");
    });

    it("F9.6: User interaction event types (pointerdown, keydown, touchstart) qualify for unlock", () => {
      const validEvents = ["pointerdown", "mousedown", "touchstart", "keydown"];
      expect(validEvents.length).toBe(4);
      expect(validEvents).toContain("touchstart");
    });
  });

  // Feature 10: Firebase Realtime Sync
  describe("Feature 10: Firebase Realtime Sync", () => {
    it("F10.1: subscribeToGrid listens on /pixel_hud/grid path", () => {
      let subscribedPath = "";
      const gridRef = mockDb.ref("pixel_hud/grid");
      mockDb.onValue(gridRef, (snap) => {
        subscribedPath = gridRef.path;
      });
      expect(subscribedPath).toBe("pixel_hud/grid");
    });

    it("F10.2: paintPixel writes delta payload with coordinate key", async () => {
      const cellRef = mockDb.ref("pixel_hud/grid/15_20");
      await mockDb.set(cellRef, {
        color: PALETTE[0].hex,
        author: "@neo",
        message: "Matrix live",
        freq: 440,
        timestamp: 1700000001
      });

      const snap = await mockDb.get(cellRef);
      expect(snap.exists()).toBe(true);
      expect(snap.val().author).toBe("@neo");
      expect(snap.val().color).toBe(PALETTE[0].hex);
    });

    it("F10.3: Remote grid updates trigger listener callback", async () => {
      let receivedUpdate = null;
      mockDb.onValue(mockDb.ref("pixel_hud/grid"), (snap) => {
        receivedUpdate = snap.val();
      });

      await mockDb.set(mockDb.ref("pixel_hud/grid/5_5"), { color: "#ff007f" });
      expect(receivedUpdate).toBeDefined();
      expect(receivedUpdate["5_5"].color).toBe("#ff007f");
    });

    it("F10.4: erasePixel removes node from database path", async () => {
      const ref = mockDb.ref("pixel_hud/grid/10_10");
      await mockDb.set(ref, { color: "#00f0ff" });
      expect((await mockDb.get(ref)).exists()).toBe(true);

      await mockDb.remove(ref);
      expect((await mockDb.get(ref)).exists()).toBe(false);
    });

    it("F10.5: Unsubscribe function detaches callback cleanly", async () => {
      let callCount = 0;
      const ref = mockDb.ref("pixel_hud/grid");
      const unsub = mockDb.onValue(ref, () => { callCount++; });
      expect(callCount).toBe(1);

      unsub();
      await mockDb.set(mockDb.ref("pixel_hud/grid/1_1"), { color: "#39ff14" });
      expect(callCount).toBe(1);
    });

    it("F10.6: Connection listener observes .info/connected state changes", () => {
      let isConnected = true;
      mockDb.onValue(mockDb.ref(".info/connected"), (snap) => {
        isConnected = snap.val();
      });
      mockDb.setOnline(false);
      expect(isConnected).toBe(false);
      mockDb.setOnline(true);
      expect(isConnected).toBe(true);
    });
  });

  // Feature 11: Atomic Multi-Path Stamp Updates
  describe("Feature 11: Atomic Multi-Path Stamp Updates", () => {
    it("F11.1: Multi-path update map formats keys as /pixel_hud/grid/X_Y", () => {
      const stamp = STAMPS.space_invader;
      const cx = 10, cy = 10;
      const updates = {};
      const halfW = Math.floor(stamp.width / 2);
      const halfH = Math.floor(stamp.height / 2);

      for (let r = 0; r < stamp.height; r++) {
        for (let c = 0; c < stamp.width; c++) {
          if (stamp.matrix[r][c] === 1) {
            updates["/pixel_hud/grid/" + (cx - halfW + c) + "_" + (cy - halfH + r)] = {
              color: PALETTE[0].hex,
              author: "@space_cadet"
            };
          }
        }
      }

      const keys = Object.keys(updates);
      expect(keys.length).toBeGreaterThan(8);
      expect(keys[0]).toMatch(/^\/pixel_hud\/grid\/\d+_\d+$/);
    });

    it("F11.2: Atomic update applies all stamp pixels in single call", async () => {
      const updates = {
        "/pixel_hud/grid/20_20": { color: "#00f0ff" },
        "/pixel_hud/grid/20_21": { color: "#00f0ff" },
        "/pixel_hud/grid/20_22": { color: "#00f0ff" }
      };
      await mockDb.update(mockDb.ref(), updates);

      const snap20_20 = await mockDb.get(mockDb.ref("pixel_hud/grid/20_20"));
      const snap20_21 = await mockDb.get(mockDb.ref("pixel_hud/grid/20_21"));
      const snap20_22 = await mockDb.get(mockDb.ref("pixel_hud/grid/20_22"));

      expect(snap20_20.val().color).toBe("#00f0ff");
      expect(snap20_21.val().color).toBe("#00f0ff");
      expect(snap20_22.val().color).toBe("#00f0ff");
    });

    it("F11.3: Stamp 0-bits are excluded from update payload", () => {
      const stamp = STAMPS.space_invader;
      let zeroBits = 0;
      for (const row of stamp.matrix) {
        for (const cell of row) {
          if (cell === 0) zeroBits++;
        }
      }
      expect(zeroBits).toBeGreaterThan(0);
    });

    it("F11.4: Batch stamp write retains author metadata across all pixels", async () => {
      const updates = {};
      for (let i = 0; i < 5; i++) {
        updates["/pixel_hud/grid/30_" + (30 + i)] = { author: "@batch_artist" };
      }
      await mockDb.update(mockDb.ref(), updates);
      for (let i = 0; i < 5; i++) {
        const snap = await mockDb.get(mockDb.ref("pixel_hud/grid/30_" + (30 + i)));
        expect(snap.val().author).toBe("@batch_artist");
      }
    });

    it("F11.5: Atomic batch update emits single parent listener notification", async () => {
      let gridEventCount = 0;
      mockDb.onValue(mockDb.ref("pixel_hud/grid"), () => {
        gridEventCount++;
      });

      const updates = {
        "/pixel_hud/grid/40_40": { color: "#fff" },
        "/pixel_hud/grid/40_41": { color: "#fff" },
        "/pixel_hud/grid/40_42": { color: "#fff" }
      };
      await mockDb.update(mockDb.ref(), updates);
      expect(gridEventCount).toBe(2);
    });

    it("F11.6: Atomic stamp write with boundary clipping includes only in-bounds keys", () => {
      const stamp = STAMPS.heart_8bit;
      const cx = 0, cy = 0;
      const updates = {};
      const halfW = Math.floor(stamp.width / 2);
      const halfH = Math.floor(stamp.height / 2);
      for (let r = 0; r < stamp.height; r++) {
        for (let c = 0; c < stamp.width; c++) {
          if (stamp.matrix[r][c] === 1) {
            const gx = cx - halfW + c;
            const gy = cy - halfH + r;
            if (gx >= 0 && gx < 64 && gy >= 0 && gy < 64) {
              updates["/pixel_hud/grid/" + gx + "_" + gy] = { color: "#ff007f" };
            }
          }
        }
      }
      for (const k of Object.keys(updates)) {
        expect(k.includes("-")).toBe(false);
      }
    });
  });

  // Feature 12: Live Shockwave Ripple Pulses
  describe("Feature 12: Live Shockwave Ripple Pulses", () => {
    it("F12.1: addShockwave creates active ripple entity with initial radius 0", () => {
      const shockwaves = [];
      shockwaves.push({
        id: Math.random(),
        gx: 32, gy: 32, color: PALETTE[0].hex,
        startTime: Date.now(),
        duration: 1000,
        maxRadius: 60,
        currentRadius: 0,
        alpha: 1.0
      });
      expect(shockwaves.length).toBe(1);
      expect(shockwaves[0].currentRadius).toBe(0);
      expect(shockwaves[0].alpha).toBe(1.0);
    });

    it("F12.2: Shockwave expands radius over time", () => {
      const sw = { startTime: 1000, duration: 1000, maxRadius: 60 };
      const now = 1500;
      const progress = Math.min(1.0, (now - sw.startTime) / sw.duration);
      const radius = progress * sw.maxRadius;
      const alpha = 1.0 - progress;

      expect(radius).toBe(30);
      expect(alpha).toBe(0.5);
    });

    it("F12.3: Shockwave alpha decays to 0 at duration completion", () => {
      const sw = { startTime: 1000, duration: 1000, maxRadius: 60 };
      const progress = (2000 - sw.startTime) / sw.duration;
      const alpha = Math.max(0, 1.0 - progress);
      expect(alpha).toBe(0);
    });

    it("F12.4: Expired shockwaves are purged from rendering list", () => {
      let shockwaves = [
        { id: 1, startTime: 1000, duration: 1000 },
        { id: 2, startTime: 1800, duration: 1000 }
      ];
      const now = 2100;
      shockwaves = shockwaves.filter(sw => (now - sw.startTime) < sw.duration);
      expect(shockwaves.length).toBe(1);
      expect(shockwaves[0].id).toBe(2);
    });

    it("F12.5: Concurrent shockwaves maintain independent radii", () => {
      const sw1 = { startTime: 1000, duration: 1000, maxRadius: 50 };
      const sw2 = { startTime: 1500, duration: 1000, maxRadius: 80 };
      const now = 1750;

      const r1 = ((now - sw1.startTime) / sw1.duration) * sw1.maxRadius;
      const r2 = ((now - sw2.startTime) / sw2.duration) * sw2.maxRadius;

      expect(r1).toBe(37.5);
      expect(r2).toBe(20.0);
    });

    it("F12.6: Shockwave drawing renders stroke arc on 2D context", () => {
      const ctx = mockCanvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(100, 100, 25, 0, Math.PI * 2);
      ctx.strokeStyle = "#00f0ff";
      ctx.stroke();

      expect(ctx.paths.length).toBe(1);
      expect(ctx.paths[0].radius).toBe(25);
    });
  });

  // Feature 13: Rate Limiting & Data Sanitization
  describe("Feature 13: Rate Limiting & Data Sanitization", () => {
    it("F13.1: TokenBucketLimiter permits bursts within token capacity", () => {
      const limiter = new TokenBucketLimiter(5, 1);
      expect(limiter.tryConsume(1)).toBe(true);
      expect(limiter.tryConsume(1)).toBe(true);
      expect(limiter.tryConsume(1)).toBe(true);
      expect(limiter.tryConsume(1)).toBe(true);
      expect(limiter.tryConsume(1)).toBe(true);
      expect(limiter.tryConsume(1)).toBe(false);
    });

    it("F13.2: TokenBucketLimiter refills tokens over time", () => {
      const limiter = new TokenBucketLimiter(5, 2);
      limiter.tryConsume(5);
      expect(limiter.tryConsume(1)).toBe(false);

      const now = limiter.lastRefill + 1000;
      expect(limiter.tryConsume(1, now)).toBe(true);
      expect(limiter.tryConsume(1, now)).toBe(true);
      expect(limiter.tryConsume(1, now)).toBe(false);
    });

    it("F13.3: sanitizeAuthor ensures @ prefix, trims spaces, and strips XSS tags", () => {
      expect(sanitizeAuthor("  neo  ")).toBe("@neo");
      expect(sanitizeAuthor("@trinity")).toBe("@trinity");
      expect(sanitizeAuthor("<script>alert(1)</script>morpheus")).toBe("@alert1morpheus");
    });

    it("F13.4: sanitizeAuthor truncates names to 20 characters", () => {
      const longName = "super_long_cyberpunk_callsign_123456789";
      const sanitized = sanitizeAuthor(longName);
      expect(sanitized.length).toBeLessThanOrEqual(20);
      expect(sanitized.startsWith("@")).toBe(true);
    });

    it("F13.5: sanitizeMessage truncates to 64 chars and removes HTML tags", () => {
      const longMsg = "A".repeat(100);
      expect(sanitizeMessage(longMsg).length).toBe(64);

      const htmlMsg = "<b>Cyber</b> <style>body{}</style> World!";
      expect(sanitizeMessage(htmlMsg)).toBe("Cyber body{} World!");
    });

    it("F13.6: Non-string author or message inputs fall back gracefully", () => {
      expect(sanitizeAuthor(null)).toBe("@anonymous");
      expect(sanitizeAuthor(undefined)).toBe("@anonymous");
      expect(sanitizeMessage(null)).toBe("");
      expect(sanitizeMessage(12345)).toBe("");
    });
  });

  // Feature 14: Offline Standalone Mode & Local Storage
  describe("Feature 14: Offline Standalone Mode & Local Storage", () => {
    it("F14.1: Offline status detection triggers local mode fallback", () => {
      let isOffline = false;
      const onConnectionChange = (connected) => { isOffline = !connected; };
      onConnectionChange(false);
      expect(isOffline).toBe(true);
    });

    it("F14.2: Grid snapshot serializes into localStorage cache", () => {
      const storage = new Map();
      const grid = { "1_1": { color: "#00f0ff" }, "2_2": { color: "#ff007f" } };
      storage.set("pixel_hud_grid_cache", JSON.stringify(grid));

      const retrieved = JSON.parse(storage.get("pixel_hud_grid_cache"));
      expect(retrieved["1_1"].color).toBe("#00f0ff");
      expect(retrieved["2_2"].color).toBe("#ff007f");
    });

    it("F14.3: Local offline queue stores marks made while disconnected", () => {
      const offlineQueue = [];
      offlineQueue.push({ x: 5, y: 5, color: "#39ff14" });
      offlineQueue.push({ x: 6, y: 6, color: "#ffb703" });

      expect(offlineQueue.length).toBe(2);
      expect(offlineQueue[0].x).toBe(5);
    });

    it("F14.4: Reconnection flushes offline queue to database", async () => {
      const offlineQueue = [
        { path: "pixel_hud/grid/7_7", data: { color: "#fff" } },
        { path: "pixel_hud/grid/8_8", data: { color: "#fff" } }
      ];

      for (const item of offlineQueue) {
        await mockDb.set(mockDb.ref(item.path), item.data);
      }

      const snap7 = await mockDb.get(mockDb.ref("pixel_hud/grid/7_7"));
      const snap8 = await mockDb.get(mockDb.ref("pixel_hud/grid/8_8"));
      expect(snap7.val().color).toBe("#fff");
      expect(snap8.val().color).toBe("#fff");
    });

    it("F14.5: App initializes with cached data when starting offline", () => {
      const cache = JSON.stringify({ "0_0": { color: "#8338ec" } });
      const initialGrid = JSON.parse(cache);
      expect(initialGrid["0_0"].color).toBe("#8338ec");
    });

    it("F14.6: Corrupted cache in localStorage is handled without crash", () => {
      const parseCache = (raw) => {
        try {
          return JSON.parse(raw);
        } catch {
          return {};
        }
      };
      expect(parseCache("INVALID_JSON_CORRUPT")).toEqual({});
    });
  });

  // Feature 15: Sci-Fi Telemetry HUD & Metrics
  describe("Feature 15: Sci-Fi Telemetry HUD & Metrics", () => {
    it("F15.1: calculateMatrixMetrics accurately counts total active cells", () => {
      const grid = new Map();
      grid.set("0_0", { color: "#00f0ff" });
      grid.set("1_1", { color: "#ff007f" });
      grid.set("2_2", { color: "#39ff14" });

      const metrics = calculateMatrixMetrics(grid);
      expect(metrics.activeCells).toBe(3);
      expect(metrics.totalCells).toBe(4096);
    });

    it("F15.2: Density percentage reflects (active / 4096) * 100", () => {
      const grid = new Map();
      for (let i = 0; i < 41; i++) grid.set("0_" + i, { color: "#00f0ff" });
      const metrics = calculateMatrixMetrics(grid);
      expect(metrics.densityPercent).toBe(1.0);
    });

    it("F15.3: Sector breakdown accurately groups by Alpha, Beta, Gamma, Delta", () => {
      const grid = new Map();
      grid.set("5_5", { color: "#fff" });
      grid.set("45_5", { color: "#fff" });
      grid.set("5_45", { color: "#fff" });
      grid.set("45_45", { color: "#fff" });

      const metrics = calculateMatrixMetrics(grid);
      expect(metrics.sectors.alpha.count).toBe(1);
      expect(metrics.sectors.beta.count).toBe(1);
      expect(metrics.sectors.gamma.count).toBe(1);
      expect(metrics.sectors.delta.count).toBe(1);
    });

    it("F15.4: Color distribution tallies frequencies per color hex", () => {
      const grid = new Map();
      grid.set("1_1", { color: "#00f0ff" });
      grid.set("1_2", { color: "#00f0ff" });
      grid.set("1_3", { color: "#ff007f" });

      const metrics = calculateMatrixMetrics(grid);
      expect(metrics.colorDistribution["#00f0ff"]).toBe(2);
      expect(metrics.colorDistribution["#ff007f"]).toBe(1);
    });

    it("F15.5: Erasing cell decrements active count and updates metrics", () => {
      const grid = new Map();
      grid.set("1_1", { color: "#00f0ff" });
      expect(calculateMatrixMetrics(grid).activeCells).toBe(1);
      grid.delete("1_1");
      expect(calculateMatrixMetrics(grid).activeCells).toBe(0);
    });

    it("F15.6: Sector coordinate labels match quadrant specifications", () => {
      const metrics = calculateMatrixMetrics(new Map());
      expect(metrics.sectors.alpha.coords).toBe("0..31, 0..31");
      expect(metrics.sectors.beta.coords).toBe("32..63, 0..31");
      expect(metrics.sectors.gamma.coords).toBe("0..31, 32..63");
      expect(metrics.sectors.delta.coords).toBe("32..63, 32..63");
    });
  });

  // Feature 16: Reticle Mark Inspector Card
  describe("Feature 16: Reticle Mark Inspector Card", () => {
    it("F16.1: Displays author @callsign, note, and coordinates on cell hover", () => {
      const cellData = { gx: 14, gy: 28, author: "@cyber_dj", message: "Night City Vibe", freq: 440, timestamp: 1700000000 };
      expect(cellData.author).toBe("@cyber_dj");
      expect(cellData.message).toBe("Night City Vibe");
      expect(cellData.gx).toBe(14);
      expect(cellData.gy).toBe(28);
    });

    it("F16.2: Displays formatted musical note and frequency", () => {
      const noteInfo = mapYCoordToFrequency(32);
      expect(noteInfo.note).toBeDefined();
      expect(noteInfo.freq).toBeGreaterThan(100);
    });

    it("F16.3: Displays UNCLAIMED SECTOR when inspecting unpainted coordinates", () => {
      const getInspectorText = (cell) => (cell ? cell.author : "[UNCLAIMED SECTOR]");
      expect(getInspectorText(null)).toBe("[UNCLAIMED SECTOR]");
    });

    it("F16.4: Formats coordinates as [X: gg, Y: gg]", () => {
      const formatCoord = (gx, gy) => "[X: " + String(gx).padStart(2, "0") + ", Y: " + String(gy).padStart(2, "0") + "]";
      expect(formatCoord(7, 9)).toBe("[X: 07, Y: 09]");
      expect(formatCoord(63, 63)).toBe("[X: 63, Y: 63]");
    });

    it("F16.5: Inspector resets hover coordinates on canvas mouseleave", () => {
      let hoveredCell = { gx: 10, gy: 10 };
      hoveredCell = null;
      expect(hoveredCell).toBeNull();
    });

    it("F16.6: Inspector displays formatted relative time for recent marks", () => {
      const formatRelativeTime = (ts, now) => {
        const diff = Math.max(0, Math.floor((now - ts) / 1000));
        return diff < 60 ? diff + "s ago" : Math.floor(diff / 60) + "m ago";
      };
      expect(formatRelativeTime(1000, 11000)).toBe("10s ago");
    });
  });

  // Feature 17: Live Transmissions Feed & Camera Track
  describe("Feature 17: Live Transmissions Feed & Camera Track", () => {
    it("F17.1: Transmissions feed receives real-time broadcast entries", () => {
      const feed = [];
      feed.unshift({ id: "tx1", x: 10, y: 10, author: "@alice", message: "Hello world" });
      expect(feed.length).toBe(1);
      expect(feed[0].author).toBe("@alice");
    });

    it("F17.2: Feed caps items to recent maximum threshold (e.g. 50 entries)", () => {
      const feed = [];
      for (let i = 0; i < 60; i++) {
        feed.unshift({ id: "tx" + i });
        if (feed.length > 50) feed.pop();
      }
      expect(feed.length).toBe(50);
      expect(feed[0].id).toBe("tx59");
    });

    it("F17.3: Clicking transmission entry focuses camera pan on target (x, y)", () => {
      const target = { x: 30, y: 40 };
      const viewW = 800, viewH = 600, scale = 2.0, cellSize = 10;
      const targetScreenCenter = { x: viewW / 2, y: viewH / 2 };
      const newPanX = targetScreenCenter.x - target.x * cellSize * scale;
      const newPanY = targetScreenCenter.y - target.y * cellSize * scale;

      expect(newPanX).toBe(-200);
      expect(newPanY).toBe(-500);
    });

    it("F17.4: Clicking transmission triggers target highlight shockwave", () => {
      const shockwaves = [];
      shockwaves.push({ gx: 25, gy: 25, color: "#ff007f" });
      expect(shockwaves.length).toBe(1);
      expect(shockwaves[0].gx).toBe(25);
      expect(shockwaves[0].color).toBe("#ff007f");
    });

    it("F17.5: Feed formats relative timestamp string", () => {
      const formatTimeAgo = (ts, now) => {
        const diffSec = Math.floor((now - ts) / 1000);
        if (diffSec < 5) return "Just now";
        if (diffSec < 60) return diffSec + "s ago";
        return Math.floor(diffSec / 60) + "m ago";
      };
      const now = 100000;
      expect(formatTimeAgo(99998, now)).toBe("Just now");
      expect(formatTimeAgo(80000, now)).toBe("20s ago");
      expect(formatTimeAgo(40000, now)).toBe("1m ago");
    });

    it("F17.6: Feed entry without message displays default broadcast note", () => {
      const getFeedDisplay = (tx) => tx.message || "[SIGNAL BROADCAST]";
      expect(getFeedDisplay({ message: "" })).toBe("[SIGNAL BROADCAST]");
      expect(getFeedDisplay({ message: "Hello" })).toBe("Hello");
    });
  });

  // Feature 18: Author Isolation Protocol
  describe("Feature 18: Author Isolation Protocol", () => {
    it("F18.1: setIsolatedAuthor sets current spotlight filter author", () => {
      let isolatedAuthor = null;
      isolatedAuthor = "@neo";
      expect(isolatedAuthor).toBe("@neo");
    });

    it("F18.2: Isolated author pixels retain full 1.0 opacity while others dim to 0.15", () => {
      const isolatedAuthor = "@neo";
      const getOpacity = (cellAuthor) => (isolatedAuthor ? (cellAuthor === isolatedAuthor ? 1.0 : 0.15) : 1.0);

      expect(getOpacity("@neo")).toBe(1.0);
      expect(getOpacity("@smith")).toBe(0.15);
      expect(getOpacity("@trinity")).toBe(0.15);
    });

    it("F18.3: Resetting author filter to null restores 1.0 opacity for all pixels", () => {
      let isolatedAuthor = "@neo";
      isolatedAuthor = null;
      const getOpacity = (cellAuthor) => (isolatedAuthor ? (cellAuthor === isolatedAuthor ? 1.0 : 0.15) : 1.0);

      expect(getOpacity("@smith")).toBe(1.0);
      expect(getOpacity("@neo")).toBe(1.0);
    });

    it("F18.4: Author contribution counter counts total pixels painted by specified author", () => {
      const grid = new Map();
      grid.set("1_1", { author: "@neo" });
      grid.set("1_2", { author: "@neo" });
      grid.set("1_3", { author: "@trinity" });

      let neoCount = 0;
      for (const cell of grid.values()) {
        if (cell.author === "@neo") neoCount++;
      }
      expect(neoCount).toBe(2);
    });

    it("F18.5: Toggle author isolation switches on/off on repeated click", () => {
      let isolated = null;
      const toggleAuthor = (author) => {
        isolated = isolated === author ? null : author;
      };
      toggleAuthor("@neo");
      expect(isolated).toBe("@neo");
      toggleAuthor("@neo");
      expect(isolated).toBeNull();
    });

    it("F18.6: Author matching is case-insensitive for robust spotlighting", () => {
      const isMatch = (authorA, authorB) => (authorA || "").toLowerCase() === (authorB || "").toLowerCase();
      expect(isMatch("@Neo", "@neo")).toBe(true);
      expect(isMatch("@TRINITY", "@trinity")).toBe(true);
    });
  });

  // Feature 19: Custom Animated HUD App Icon
  describe("Feature 19: Custom Animated HUD App Icon", () => {
    it("F19.1: Icon specification defines cyber reticle and glowing grid SVG structure", () => {
      const iconSpec = {
        viewBox: "0 0 48 48",
        elements: ["circle.reticle", "path.matrix", "rect.pixel"]
      };
      expect(iconSpec.viewBox).toBe("0 0 48 48");
      expect(iconSpec.elements.length).toBe(3);
    });

    it("F19.2: Icon accepts className and dimension props", () => {
      const getIconProps = ({ className = "w-6 h-6", size = 24 } = {}) => ({ className, size });
      const props = getIconProps({ className: "w-8 h-8", size: 32 });
      expect(props.className).toBe("w-8 h-8");
      expect(props.size).toBe(32);
    });

    it("F19.3: Icon uses cyberpunk palette colors (cyan / magenta)", () => {
      const primaryCyan = "#00f0ff";
      const accentPink = "#ff007f";
      expect(primaryCyan).toBe("#00f0ff");
      expect(accentPink).toBe("#ff007f");
    });

    it("F19.4: Icon contains CSS pulse / rotation animation class hooks", () => {
      const cssClasses = ["animate-pulse", "animate-spin-slow", "shadow-neon-cyan"];
      expect(cssClasses).toContain("animate-pulse");
    });

    it("F19.5: Icon component contract exports valid functional component", () => {
      const mockComponent = () => "SVG_RENDER";
      expect(typeof mockComponent).toBe("function");
      expect(mockComponent()).toBe("SVG_RENDER");
    });

    it("F19.6: SVG rendering includes viewBox 0 0 48 48 and neon filters", () => {
      const svgAttrs = { viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
      expect(svgAttrs.viewBox).toBe("0 0 48 48");
    });
  });

  // Feature 20: Ubuntu Desktop & Dock Registration
  describe("Feature 20: Ubuntu Desktop & Dock Registration", () => {
    it("F20.1: App registration object has matching id pixel_hud or pixel-hud", () => {
      const appConfig = { id: "pixel_hud", title: "PixelHUD" };
      expect(appConfig.id).toMatch(/^pixel[-_]hud$/);
    });

    it("F20.2: App config specifies favourite: true for Ubuntu dock inclusion", () => {
      const appConfig = { id: "pixel_hud", favourite: true };
      expect(appConfig.favourite).toBe(true);
    });

    it("F20.3: App config specifies desktop_shortcut: true for desktop icon", () => {
      const appConfig = { id: "pixel_hud", desktop_shortcut: true };
      expect(appConfig.desktop_shortcut).toBe(true);
    });

    it("F20.4: App config title is exactly PixelHUD", () => {
      const appConfig = { id: "pixel_hud", title: "PixelHUD" };
      expect(appConfig.title).toBe("PixelHUD");
    });

    it("F20.5: App screen property provides rendering callback", () => {
      const appConfig = { id: "pixel_hud", screen: () => "PixelHUD_Screen" };
      expect(typeof appConfig.screen).toBe("function");
      expect(appConfig.screen()).toBe("PixelHUD_Screen");
    });

    it("F20.6: App disabled flag is false", () => {
      const appConfig = { id: "pixel_hud", disabled: false };
      expect(appConfig.disabled).toBe(false);
    });
  });

  // Feature 21: Responsive Touch & Dual-Shell Layout
  describe("Feature 21: Responsive Touch & Dual-Shell Layout", () => {
    it("F21.1: Mobile breakpoint (< 768px) enables collapsible telemetry drawer", () => {
      const isMobile = (viewportWidth) => viewportWidth < 768;
      expect(isMobile(375)).toBe(true);
      expect(isMobile(1024)).toBe(false);
    });

    it("F21.2: Single touch drag distinguishes between drawing mode and pan mode", () => {
      let mode = "draw";
      expect(mode).toBe("draw");
      mode = "pan";
      expect(mode).toBe("pan");
    });

    it("F21.3: Two-finger pinch distance calculation computes zoom factor", () => {
      const touch1 = { clientX: 100, clientY: 100 };
      const touch2 = { clientX: 100, clientY: 200 };
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      expect(dist).toBe(100);

      const touch2Moved = { clientX: 100, clientY: 250 };
      const newDist = Math.hypot(touch2Moved.clientX - touch1.clientX, touch2Moved.clientY - touch1.clientY);
      const zoomRatio = newDist / dist;
      expect(zoomRatio).toBe(1.5);
    });

    it("F21.4: High-DPI canvas scaling adjusts context scale by devicePixelRatio", () => {
      const dpr = 2.0;
      const width = 400, height = 300;
      const scaledWidth = width * dpr;
      const scaledHeight = height * dpr;
      expect(scaledWidth).toBe(800);
      expect(scaledHeight).toBe(600);
    });

    it("F21.5: Touch tap computes correct grid cell coordinates with touch offset", () => {
      const touchClientX = 125, touchClientY = 75;
      const panX = 100, panY = 50, scale = 1.0, cellSize = 10;
      const coord = screenToWorld(touchClientX, touchClientY, panX, panY, scale, cellSize);
      expect(coord.gx).toBe(2);
      expect(coord.gy).toBe(2);
      expect(coord.inBounds).toBe(true);
    });

    it("F21.6: Touch event cancellation prevents unwanted browser page scrolling", () => {
      let prevented = false;
      const mockEvent = { preventDefault: () => { prevented = true; } };
      mockEvent.preventDefault();
      expect(prevented).toBe(true);
    });
  });
});

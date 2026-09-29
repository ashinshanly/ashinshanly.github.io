// tests/pixel_hud/tier3_pairwise.test.mjs
// Tier 3: Pairwise Combinatorial Integration Tests for PixelHUD (20 suites)

import { describe, it, expect, beforeEach } from "./helpers/test_framework.mjs";
import { loadAppsConfig } from "../android/helpers/app_loader.mjs";
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

describe("Tier 3: Pairwise Combinatorial Integration Test Suite", () => {
  let mockCanvas;
  let mockAudioCtx;
  let mockDb;

  beforeEach(() => {
    mockCanvas = new MockCanvasElement(800, 600);
    mockAudioCtx = new MockAudioContext();
    mockDb = new MockRealtimeDatabase();
  });

  // Suite 1: Stamp Drop + Pentatonic Tone Synthesis + Firebase Atomic Batch Write
  describe("Suite 1: Stamp Drop + Pentatonic Synthesis + Firebase Atomic Update", () => {
    it("PW1.1: Dropping Space Invader plays harmonic chord and updates Firebase in atomic batch", async () => {
      const stamp = STAMPS.space_invader;
      const cx = 32, cy = 32;
      const author = "@retro_hacker";
      const color = PALETTE[0].hex;

      // 1. Synthesize chord for stamp
      const osc1 = mockAudioCtx.createOscillator();
      const osc2 = mockAudioCtx.createOscillator();
      const note1 = mapYCoordToFrequency(cy);
      const note2 = mapYCoordToFrequency(cy - 4);
      osc1.frequency.setValueAtTime(note1.freq, 0);
      osc2.frequency.setValueAtTime(note2.freq, 0);
      osc1.start(0);
      osc2.start(0);

      // 2. Prepare atomic batch update
      const updates = {};
      const halfW = Math.floor(stamp.width / 2);
      const halfH = Math.floor(stamp.height / 2);
      for (let r = 0; r < stamp.height; r++) {
        for (let c = 0; c < stamp.width; c++) {
          if (stamp.matrix[r][c] === 1) {
            updates["/pixel_hud/grid/" + (cx - halfW + c) + "_" + (cy - halfH + r)] = {
              color,
              author,
              timestamp: 1700000000
            };
          }
        }
      }

      await mockDb.update(mockDb.ref(), updates);

      // 3. Verify audio notes & database payload
      expect(osc1.started).toBe(true);
      expect(osc2.started).toBe(true);
      expect(Object.keys(updates).length).toBe(15);

      const snapCenter = await mockDb.get(mockDb.ref("pixel_hud/grid/32_32"));
      expect(snapCenter.val().author).toBe("@retro_hacker");
      expect(snapCenter.val().color).toBe(PALETTE[0].hex);
    });
  });

  // Suite 2: Canvas Pan + Zoom + Reticle Coordinate Hit-Testing
  describe("Suite 2: Canvas Pan/Zoom + Reticle Coordinate Hit-Testing", () => {
    it("PW2.1: Transforming viewport scales coordinates and correctly hit-tests reticle card", () => {
      // 1. Setup pan and zoom
      let scale = 2.0;
      let panX = 150;
      let panY = -80;
      const cellSize = 10;

      // Target world coordinate (20, 15)
      const screenTarget = worldToScreen(20, 15, panX, panY, scale, cellSize);
      expect(screenTarget.x).toBe(150 + 20 * 20); // 550
      expect(screenTarget.y).toBe(-80 + 15 * 20); // 220

      // Pointer click at (555, 225) (inside the cell)
      const hit = screenToWorld(555, 225, panX, panY, scale, cellSize);
      expect(hit.gx).toBe(20);
      expect(hit.gy).toBe(15);
      expect(hit.inBounds).toBe(true);
    });
  });

  // Suite 3: Continuous Drag + Token Bucket Limiter + Stereo Pan Audio Modulation
  describe("Suite 3: Continuous Drag + Rate Limiting + Stereo Pan Modulation", () => {
    it("PW3.1: Dragging across row modulates stereo pan and throttles network sync", async () => {
      const limiter = new TokenBucketLimiter(5, 5); // 5 burst tokens
      const row = 10;
      const playedPans = [];
      const syncedPixels = [];

      for (let col = 0; col < 64; col++) {
        // Audio modulation for every drag point
        const pan = mapXCoordToPan(col);
        playedPans.push(pan);

        // Network sync throttled by token bucket
        if (limiter.tryConsume(1)) {
          syncedPixels.push({ x: col, y: row });
          await mockDb.set(mockDb.ref("pixel_hud/grid/" + col + "_" + row), { color: "#00f0ff" });
        }
      }

      expect(playedPans.length).toBe(64);
      expect(playedPans[0]).toBe(-0.9);
      expect(playedPans[63]).toBe(0.9);
      expect(syncedPixels.length).toBe(5); // throttled to burst limit
    });
  });

  // Suite 4: Author Isolation Filter + Live Transmissions Feed Click + Camera Auto-Focus
  describe("Suite 4: Author Isolation + Live Feed Click + Camera Navigation", () => {
    it("PW4.1: Clicking transmission focuses camera on mark, emits shockwave, and filters author", () => {
      const transmission = {
        id: "tx_99",
        x: 42,
        y: 18,
        author: "@trinity",
        message: "Follow the white rabbit",
        color: "#39ff14"
      };

      // 1. Author isolation filter
      let isolatedAuthor = transmission.author;
      expect(isolatedAuthor).toBe("@trinity");

      // 2. Camera navigation to (42, 18)
      const viewW = 800, viewH = 600, scale = 2.5, cellSize = 10;
      const targetPanX = viewW / 2 - transmission.x * cellSize * scale;
      const targetPanY = viewH / 2 - transmission.y * cellSize * scale;

      // 3. Shockwave trigger
      const shockwave = {
        gx: transmission.x,
        gy: transmission.y,
        color: transmission.color,
        startTime: 1000
      };

      expect(targetPanX).toBe(400 - 1050); // -650
      expect(targetPanY).toBe(300 - 450);  // -150
      expect(shockwave.gx).toBe(42);
      expect(shockwave.gy).toBe(18);
    });
  });

  // Suite 5: Palette Color Selection + Wave Timbre Modulation + Reticle Frequency Display
  describe("Suite 5: Palette Color + Timbre Modulation + Reticle Frequency Display", () => {
    it("PW5.1: Selecting Neon Magenta configures sawtooth timbre and displays Eb4 frequency", () => {
      const selectedColor = PALETTE[1]; // Neon Magenta
      expect(selectedColor.name).toBe("Neon Magenta");
      expect(selectedColor.wave).toBe("sawtooth");
      expect(selectedColor.filter).toBe(1800);

      const filter = mockAudioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = selectedColor.filter;

      const osc = mockAudioCtx.createOscillator();
      osc.type = selectedColor.wave;

      expect(filter.frequency.value).toBe(1800);
      expect(osc.type).toBe("sawtooth");
    });
  });

  // Suite 6: Offline Mode Paint + LocalStorage Caching + Network Reconnection Delta Merge
  describe("Suite 6: Offline Drawing + Storage Cache + Reconnect Delta Sync", () => {
    it("PW6.1: Buffers offline marks in localStorage and flushes to Firebase upon reconnect", async () => {
      const localStore = new Map();
      const offlineQueue = [];

      // 1. Offline disconnect
      mockDb.setOnline(false);

      // 2. Paint offline marks
      for (let i = 0; i < 3; i++) {
        const mark = { x: 5 + i, y: 5, color: "#ff007f", author: "@offline_user", timestamp: 1000 + i };
        offlineQueue.push(mark);
      }
      localStore.set("pixel_hud_offline_queue", JSON.stringify(offlineQueue));

      // 3. Reconnect network
      mockDb.setOnline(true);
      const queuedMarks = JSON.parse(localStore.get("pixel_hud_offline_queue"));

      const updates = {};
      for (const m of queuedMarks) {
        updates["/pixel_hud/grid/" + m.x + "_" + m.y] = m;
      }
      await mockDb.update(mockDb.ref(), updates);
      localStore.delete("pixel_hud_offline_queue");

      // 4. Verify merged state in Firebase
      expect(localStore.has("pixel_hud_offline_queue")).toBe(false);
      const snap = await mockDb.get(mockDb.ref("pixel_hud/grid/6_5"));
      expect(snap.val().author).toBe("@offline_user");
    });
  });

  // Suite 7: CRT Shader Toggle + Multi-Pass Bloom + Matrix Density Telemetry
  describe("Suite 7: CRT Shader + Multi-Pass Bloom + Density Telemetry", () => {
    it("PW7.1: Painting cells updates density telemetry while rendering glow and scanlines", () => {
      const grid = new Map();
      const ctx = mockCanvas.getContext("2d");

      // 1. Paint 82 cells (~2.00% density)
      for (let i = 0; i < 82; i++) {
        grid.set("0_" + i, { color: PALETTE[0].hex });
      }
      const metrics = calculateMatrixMetrics(grid);
      expect(metrics.densityPercent).toBe(2.0);

      // 2. Render multi-pass bloom & scanlines
      ctx.shadowBlur = 16;
      ctx.shadowColor = PALETTE[0].glow;
      ctx.fillRect(0, 0, 10, 10);

      expect(ctx.shadowBlur).toBe(16);
      expect(ctx.drawCalls.length).toBeGreaterThan(0);
    });
  });

  // Suite 8: Master Mute Toggle + Rapid Stamp Placement + Autoplay Unlock
  describe("Suite 8: Master Mute + Rapid Stamp Drops + Autoplay Unlock", () => {
    it("PW8.1: Muting suppresses tone output during stamp bursts and unmutes cleanly", async () => {
      await mockAudioCtx.resume();
      let isMuted = true;
      let playedNotesCount = 0;

      const triggerNote = (y) => {
        if (!isMuted) {
          playedNotesCount++;
          const osc = mockAudioCtx.createOscillator();
          osc.start(0);
          osc.stop(0.1);
        }
      };

      // Burst of stamps while muted
      for (let i = 0; i < 10; i++) triggerNote(32);
      expect(playedNotesCount).toBe(0);

      // Unmute and drop stamp
      isMuted = false;
      triggerNote(32);
      expect(playedNotesCount).toBe(1);
    });
  });

  // Suite 9: Mobile Touch Pinch Zoom + Pan Drag + High-DPI Tap Reticle Card
  describe("Suite 9: Mobile Pinch Zoom + Pan Drag + High-DPI Tap Inspector", () => {
    it("PW9.1: Pinch zoom and tap on 2x DPR mobile calculates correct grid target", () => {
      const dpr = 2.0;
      let scale = 1.5;
      let panX = 50 * dpr;
      let panY = 25 * dpr;
      const cellSize = 10 * dpr;

      // Tap event on mobile screen
      const tapX = 150 * dpr;
      const tapY = 125 * dpr;

      const coord = screenToWorld(tapX, tapY, panX, panY, scale, cellSize);
      expect(coord.gx).toBe(6);
      expect(coord.gy).toBe(6);
      expect(coord.inBounds).toBe(true);
    });
  });

  // Suite 10: Live Transmissions Feed Overflow + FIFO Buffer + Shockwave Cascade
  describe("Suite 10: Live Transmissions Overflow + Shockwave Cascade", () => {
    it("PW10.1: Broadcasting 60 transmissions cascades shockwaves and caps feed to 50 items", () => {
      const feed = [];
      const shockwaves = [];

      for (let i = 0; i < 60; i++) {
        const tx = { id: "tx_" + i, x: i % 64, y: Math.floor(i / 64), color: PALETTE[i % 8].hex };
        feed.unshift(tx);
        if (feed.length > 50) feed.pop();

        shockwaves.push({ gx: tx.x, gy: tx.y, color: tx.color, startTime: Date.now() });
      }

      expect(feed.length).toBe(50);
      expect(feed[0].id).toBe("tx_59");
      expect(shockwaves.length).toBe(60);
    });
  });

  // Suite 11: 4-Sector Stamping + Alpha/Beta/Gamma/Delta Quadrant Metrics Telemetry
  describe("Suite 11: 4-Sector Stamping + Telemetry Metrics Tracking", () => {
    it("PW11.1: Stamping in all 4 quadrants updates respective sector telemetry counters", () => {
      const grid = new Map();
      const stamp = STAMPS.heart_8bit;
      const halfW = Math.floor(stamp.width / 2);
      const halfH = Math.floor(stamp.height / 2);

      const stampQuadrant = (cx, cy) => {
        for (let r = 0; r < stamp.height; r++) {
          for (let c = 0; c < stamp.width; c++) {
            if (stamp.matrix[r][c] === 1) {
              grid.set((cx - halfW + c) + "_" + (cy - halfH + r), { color: "#ff007f" });
            }
          }
        }
      };

      stampQuadrant(16, 16); // Alpha
      stampQuadrant(48, 16); // Beta
      stampQuadrant(16, 48); // Gamma
      stampQuadrant(48, 48); // Delta

      const metrics = calculateMatrixMetrics(grid);
      expect(metrics.sectors.alpha.count).toBeGreaterThan(8);
      expect(metrics.sectors.beta.count).toBeGreaterThan(8);
      expect(metrics.sectors.gamma.count).toBeGreaterThan(8);
      expect(metrics.sectors.delta.count).toBeGreaterThan(8);
    });
  });

  // Suite 12: Data Sanitization on Live Broadcast Transmissions
  describe("Suite 12: Data Sanitization on Live Broadcast Transmissions", () => {
    it("PW12.1: Sanitizes malicious broadcast payloads before broadcasting to feed", async () => {
      const dirtyPayload = {
        author: "<script>eval(evil)</script>CybeR_PUNK   ",
        message: "<h1>Big Title</h1>" + "Secure transmission payload string ".repeat(5),
        x: 10,
        y: 10,
        color: "#00f0ff"
      };

      const sanitized = {
        author: sanitizeAuthor(dirtyPayload.author),
        message: sanitizeMessage(dirtyPayload.message),
        x: dirtyPayload.x,
        y: dirtyPayload.y,
        color: dirtyPayload.color
      };

      expect(sanitized.author.includes("<script>")).toBe(false);
      expect(sanitized.author.startsWith("@")).toBe(true);
      expect(sanitized.message.length).toBeLessThanOrEqual(64);
      expect(sanitized.message.includes("<h1>")).toBe(false);
    });
  });

  // Suite 13: Author Isolation Filter + Eraser Mode on Filtered Cells
  describe("Suite 13: Author Isolation Filter + Eraser Interaction", () => {
    it("PW13.1: Erasing cells while isolating author updates active counts cleanly", () => {
      const grid = new Map();
      grid.set("10_10", { author: "@neo", color: "#00f0ff" });
      grid.set("20_20", { author: "@smith", color: "#ff007f" });

      let isolated = "@neo";
      // Erase smiths cell
      grid.delete("20_20");

      const metrics = calculateMatrixMetrics(grid);
      expect(metrics.activeCells).toBe(1);
      expect(grid.has("10_10")).toBe(true);
    });
  });

  // Suite 14: Palette Cycling During Active Painting + Histogram Telemetry Tracking
  describe("Suite 14: Palette Cycling + Color Histogram Telemetry", () => {
    it("PW14.1: Cycling through all 8 palette colors creates balanced color histogram", () => {
      const grid = new Map();
      for (let i = 0; i < 80; i++) {
        const color = PALETTE[i % 8].hex;
        grid.set("0_" + i, { color });
      }

      const metrics = calculateMatrixMetrics(grid);
      for (let i = 0; i < 8; i++) {
        expect(metrics.colorDistribution[PALETTE[i].hex]).toBe(10);
      }
    });
  });

  // Suite 15: Dynamic Window Resizing + Viewport Centering + Coordinate Precision
  describe("Suite 15: Window Resizing + Viewport Centering + Hit-Testing", () => {
    it("PW15.1: Resizing viewport from 800x600 to 1920x1080 centers grid correctly", () => {
      const cellSize = 10, scale = 1.0;
      const gridSpan = 64 * cellSize * scale; // 640

      const center800x600 = { x: (800 - gridSpan) / 2, y: (600 - gridSpan) / 2 };
      const center1920x1080 = { x: (1920 - gridSpan) / 2, y: (1080 - gridSpan) / 2 };

      expect(center800x600.x).toBe(80);
      expect(center1920x1080.x).toBe(640);
      expect(center1920x1080.y).toBe(220);

      // Hit-test center cell (32, 32)
      const screenPt = worldToScreen(32, 32, center1920x1080.x, center1920x1080.y, scale, cellSize);
      const worldPt = screenToWorld(screenPt.x + 5, screenPt.y + 5, center1920x1080.x, center1920x1080.y, scale, cellSize);

      expect(worldPt.gx).toBe(32);
      expect(worldPt.gy).toBe(32);
    });
  });

  // Suite 16: Simultaneous Pixel Overwrite + Pitch Retrigger + Delta Sync
  describe("Suite 16: Pixel Overwrite + Pitch Retrigger + Delta Payload", () => {
    it("PW16.1: Overwriting existing pixel triggers new audio note and updates Firebase", async () => {
      const cellRef = mockDb.ref("pixel_hud/grid/15_15");
      await mockDb.set(cellRef, { color: PALETTE[0].hex, author: "@v1", timestamp: 1000 });

      // Overwrite with new color
      const newColor = PALETTE[3].hex;
      const newAuthor = "@v2";
      const osc = mockAudioCtx.createOscillator();
      const note = mapYCoordToFrequency(15);
      osc.frequency.setValueAtTime(note.freq, 0);
      osc.start(0);

      await mockDb.set(cellRef, { color: newColor, author: newAuthor, timestamp: 2000 });

      const snap = await mockDb.get(cellRef);
      expect(snap.val().author).toBe("@v2");
      expect(snap.val().color).toBe(newColor);
      expect(osc.started).toBe(true);
    });
  });

  // Suite 17: Matrix Clear + WebAudio Node Cleanup + Firebase Batch Reset
  describe("Suite 17: Matrix Reset + Audio Node Cleanup + Database Clear", () => {
    it("PW17.1: Matrix clear empties local state, cleans up oscillators, and resets Firebase", async () => {
      const grid = new Map([["1_1", { color: "#fff" }], ["2_2", { color: "#fff" }]]);
      const osc = mockAudioCtx.createOscillator();
      osc.start(0);

      // Perform full reset
      grid.clear();
      osc.stop(0);
      osc.disconnect();
      await mockDb.remove(mockDb.ref("pixel_hud/grid"));

      expect(grid.size).toBe(0);
      expect(osc.stopped).toBe(true);
      expect(osc.connections.length).toBe(0);
      const snap = await mockDb.get(mockDb.ref("pixel_hud/grid"));
      expect(snap.exists()).toBe(false);
    });
  });

  // Suite 18: Shockwave Lifetime Decay during Active Canvas Pan & Zoom
  describe("Suite 18: Shockwave Animation during Active Pan/Zoom", () => {
    it("PW18.1: Shockwave screen position dynamically recalculates with canvas pan/zoom", () => {
      const sw = { gx: 10, gy: 10, currentRadius: 30 };
      const panX = 100, panY = 50, scale = 2.0, cellSize = 10;

      const screenCenter = worldToScreen(sw.gx, sw.gy, panX, panY, scale, cellSize);
      const scaledRadius = sw.currentRadius * scale;

      expect(screenCenter.x).toBe(100 + 10 * 20); // 300
      expect(screenCenter.y).toBe(50 + 10 * 20);  // 250
      expect(scaledRadius).toBe(60);
    });
  });

  // Suite 19: Dual-Client Offline Conflict Resolution (Last-Write-Wins)
  describe("Suite 19: Dual-Client Conflict Resolution (Last-Write-Wins)", () => {
    it("PW19.1: Deterministically resolves conflicting offline writes via timestamp", () => {
      const writeA = { color: "#00f0ff", author: "@alice", timestamp: 1700000010 };
      const writeB = { color: "#ff007f", author: "@bob", timestamp: 1700000020 };

      const resolveWinner = (w1, w2) => (w1.timestamp > w2.timestamp ? w1 : w2);
      const winner = resolveWinner(writeA, writeB);

      expect(winner.author).toBe("@bob");
      expect(winner.color).toBe("#ff007f");
    });
  });

  // Suite 20: Telemetry Sector Density Thresholds during Mural Creation
  describe("Suite 20: Sector Density Threshold Monitoring", () => {
    it("PW20.1: Accurately identifies when quadrant exceeds high density threshold (> 50%)", () => {
      const grid = new Map();
      // Paint 600 pixels in Sector Alpha (max 1024) -> 58.59%
      for (let y = 0; y < 25; y++) {
        for (let x = 0; x < 24; x++) {
          grid.set(x + "_" + y, { color: "#39ff14" });
        }
      }

      const metrics = calculateMatrixMetrics(grid);
      const alphaDensity = (metrics.sectors.alpha.count / 1024) * 100;
      expect(alphaDensity).toBeGreaterThan(50);
      expect(metrics.sectors.beta.count).toBe(0);
    });
  });

  // Suite 21: Mark Protection & Claiming
  describe("Suite 21: Mark Protection and Claiming Verification", () => {
    it("PW21.1: Blocks painting or erasing over another visitor's claimed mark while allowing owner edits", () => {
      const grid = new Map();
      grid.set("10_10", { color: "#00f0ff", author: "@alice", timestamp: Date.now() });

      const isProtected = (gx, gy, currentAuthor) => {
        const cell = grid.get(`${gx}_${gy}`);
        if (!cell || !cell.color || !cell.author) return false;
        return cell.author.toLowerCase() !== currentAuthor.toLowerCase();
      };

      // Bob tries to paint or erase Alice's tile -> Protected!
      expect(isProtected(10, 10, "@bob")).toBe(true);

      // Alice edits her own tile -> Allowed!
      expect(isProtected(10, 10, "@alice")).toBe(false);

      // Anyone paints empty tile -> Allowed!
      expect(isProtected(11, 11, "@bob")).toBe(false);
    });

    it("PW21.2: Stamp drop preserves overlapping tiles owned by other visitors and applies only to valid cells", () => {
      const grid = new Map();
      grid.set("32_32", { color: "#ff007f", author: "@alice", timestamp: Date.now() });

      const stamp = STAMPS.space_invader;
      const currentAuthor = "@bob";
      const startX = 32 - Math.floor(stamp.width / 2);
      const startY = 32 - Math.floor(stamp.height / 2);

      let placed = 0;
      let protectedHits = 0;

      stamp.matrix.forEach((row, dy) => {
        row.forEach((val, dx) => {
          if (val) {
            const x = startX + dx;
            const y = startY + dy;
            const existing = grid.get(`${x}_${y}`);
            if (existing && existing.author && existing.author !== currentAuthor) {
              protectedHits++;
            } else {
              grid.set(`${x}_${y}`, { color: "#00f0ff", author: currentAuthor });
              placed++;
            }
          }
        });
      });

      expect(protectedHits).toBeGreaterThanOrEqual(1);
      const totalActive = stamp.matrix.reduce((acc, row) => acc + row.filter(Boolean).length, 0);
      expect(placed).toBe(totalActive - protectedHits);
      // Alice's mark remains untouched!
      expect(grid.get("32_32").author).toBe("@alice");
      expect(grid.get("32_32").color).toBe("#ff007f");
    });
  });

  // Suite 22: Undo & Redo Action History Verification
  describe("Suite 22: Undo and Redo Action History Verification", () => {
    it("PW22.1: Reverts and restores multi-pixel stroke changes sequentially", () => {
      const grid = new Map();
      const undoStack = [];
      const redoStack = [];

      // 1. Paint a 3-pixel stroke
      const stroke = [
        { gx: 5, gy: 5, prevCell: null, newCell: { color: "#00f0ff", author: "@alice" } },
        { gx: 6, gy: 5, prevCell: null, newCell: { color: "#00f0ff", author: "@alice" } },
        { gx: 7, gy: 5, prevCell: null, newCell: { color: "#00f0ff", author: "@alice" } }
      ];
      stroke.forEach(c => grid.set(`${c.gx}_${c.gy}`, c.newCell));
      undoStack.push(stroke);

      expect(grid.get("5_5")?.color).toBe("#00f0ff");
      expect(grid.get("6_5")?.color).toBe("#00f0ff");
      expect(grid.get("7_5")?.color).toBe("#00f0ff");

      // 2. Perform Undo
      const action = undoStack.pop();
      action.forEach(c => {
        if (c.prevCell) grid.set(`${c.gx}_${c.gy}`, c.prevCell);
        else grid.delete(`${c.gx}_${c.gy}`);
      });
      redoStack.push(action);

      expect(grid.has("5_5")).toBe(false);
      expect(grid.has("6_5")).toBe(false);
      expect(grid.has("7_5")).toBe(false);

      // 3. Perform Redo
      const redoAction = redoStack.pop();
      redoAction.forEach(c => {
        if (c.newCell) grid.set(`${c.gx}_${c.gy}`, c.newCell);
        else grid.delete(`${c.gx}_${c.gy}`);
      });
      undoStack.push(redoAction);

      expect(grid.get("5_5")?.color).toBe("#00f0ff");
      expect(grid.get("6_5")?.color).toBe("#00f0ff");
      expect(grid.get("7_5")?.color).toBe("#00f0ff");
    });
  });

  // Suite 23: Application Catalog & Configuration Schema Integrity
  describe("Suite 23: Application Catalog & Configuration Schema Integrity", () => {
    it("P23.1: All applications have valid IDs, Titles, and Icons", () => {
      const apps = loadAppsConfig();
      expect(Array.isArray(apps)).toBe(true);
      expect(apps.length).toBeGreaterThanOrEqual(17);

      apps.forEach(app => {
        expect(typeof app.id).toBe("string");
        expect(app.id.length).toBeGreaterThan(0);
        expect(typeof app.title).toBe("string");
        expect(app.title.length).toBeGreaterThan(0);
        expect(typeof app.icon).toBe("string");
        expect(typeof app.disabled).toBe("boolean");
        expect(typeof app.favourite).toBe("boolean");
        expect(typeof app.desktop_shortcut).toBe("boolean");
      });
    });

    it("P23.2: GuestBook app is correctly configured as favourite and desktop shortcut", () => {
      const apps = loadAppsConfig();
      const pixelHudApp = apps.find(a => a.id === "pixel-hud");
      expect(pixelHudApp).toBeDefined();
      expect(pixelHudApp.title).toBe("GuestBook");
      expect(pixelHudApp.favourite).toBe(true);
      expect(pixelHudApp.desktop_shortcut).toBe(true);
      expect(pixelHudApp.disabled).toBe(false);
    });

    it("P23.3: Custom icons in apps config are properly identified", () => {
      const apps = loadAppsConfig();
      const customIconApps = apps.filter(a => a.custom_icon);
      expect(customIconApps.length).toBeGreaterThan(0);
      customIconApps.forEach(app => {
        expect(typeof app.custom_icon).toBe("string");
        expect(app.isCustomIcon).toBe(true);
      });
    });
  });

  // Suite 24: WebAudioSynth High-Volume Stress & Pitch Inversion
  describe("Suite 24: WebAudioSynth High-Volume Stress & Pitch Inversion", () => {
    it("P24.1: Calls all synth methods across 64x64 grid coordinates without error", () => {
      const testCoords = [
        { x: 0, y: 0 },
        { x: 63, y: 63 },
        { x: 0, y: 63 },
        { x: 63, y: 0 },
        { x: 32, y: 32 }
      ];

      testCoords.forEach(({ x, y }) => {
        const safeY = Math.max(0, Math.min(63, y));
        const freq = mapYCoordToFrequency(safeY);
        const pan = mapXCoordToPan(Math.max(0, Math.min(63, x)));

        expect(freq).toBeDefined();
        expect(typeof freq.freq).toBe("number");
        expect(pan).toBeGreaterThanOrEqual(-0.9);
        expect(pan).toBeLessThanOrEqual(0.9);
      });
    });

    it("P24.2: Rapid audio playback (100 sequential notes) does not corrupt AudioContext", () => {
      for (let i = 0; i < 100; i++) {
        const osc = mockAudioCtx.createOscillator();
        const gain = mockAudioCtx.createGain();
        osc.connect(gain);
        gain.connect(mockAudioCtx.destination);
        osc.start(i * 0.01);
        osc.stop(i * 0.01 + 0.05);
      }

      expect(mockAudioCtx.createdNodes.length).toBe(200);
      expect(mockAudioCtx.destination).toBeDefined();
    });
  });

  // Suite 25: 50 Sequential Undo / Redo Determinism
  describe("Suite 25: 50 Sequential Undo / Redo Determinism", () => {
    it("P25.1: 50 Sequential Undo / Redo operations maintain deterministic grid state", () => {
      const grid = new Map();
      const undoStack = [];
      const redoStack = [];

      // Perform 50 sequential paint actions
      for (let i = 0; i < 50; i++) {
        const key = `${i}_${i}`;
        const previousCell = grid.get(key) || null;
        const newCell = { color: PALETTE[i % PALETTE.length].hex, author: "@tester", timestamp: Date.now() };
        
        grid.set(key, newCell);
        undoStack.push({ key, previousCell, newCell });
        redoStack.length = 0; // Clear redo on new action
      }

      expect(grid.size).toBe(50);
      expect(undoStack.length).toBe(50);

      // Undo all 50
      while (undoStack.length > 0) {
        const action = undoStack.pop();
        if (action.previousCell) {
          grid.set(action.key, action.previousCell);
        } else {
          grid.delete(action.key);
        }
        redoStack.push(action);
      }

      expect(grid.size).toBe(0);
      expect(redoStack.length).toBe(50);

      // Redo all 50
      while (redoStack.length > 0) {
        const action = redoStack.pop();
        grid.set(action.key, action.newCell);
        undoStack.push(action);
      }

      expect(grid.size).toBe(50);
      expect(undoStack.length).toBe(50);
    });
  });

  // Suite 26: Coordinate Boundary & Locate Defense
  describe("Suite 26: Coordinate Boundary & Locate Defense", () => {
    it("P26.1: Validates that out-of-bound and NaN coordinates are safely rejected", () => {
      const isValidCoord = (x, y) => {
        if (x === undefined || y === undefined || x === null || y === null) return false;
        const nx = Number(x);
        const ny = Number(y);
        if (isNaN(nx) || isNaN(ny)) return false;
        return nx >= 0 && nx < 64 && ny >= 0 && ny < 64;
      };

      expect(isValidCoord(0, 0)).toBe(true);
      expect(isValidCoord(63, 63)).toBe(true);
      expect(isValidCoord(32, 32)).toBe(true);
      expect(isValidCoord(-1, 0)).toBe(false);
      expect(isValidCoord(0, 64)).toBe(false);
      expect(isValidCoord(NaN, 10)).toBe(false);
      expect(isValidCoord("abc", 10)).toBe(false);
      expect(isValidCoord(null, null)).toBe(false);
      expect(isValidCoord(undefined, 10)).toBe(false);
    });
  });

  // Suite 27: Multi-Canvas Scoping & Isolation
  describe("Suite 27: Multi-Canvas Scoping & Isolation", () => {
    const CANVAS_LIST = [
      { id: 'canvas_1', name: 'Canvas 1', num: 1 },
      { id: 'canvas_2', name: 'Canvas 2', num: 2 },
      { id: 'canvas_3', name: 'Canvas 3', num: 3 }
    ];

    function getGridPath(canvasId = 'canvas_1') {
      if (!canvasId || canvasId === 'canvas_1') {
        return 'pixel_hud/grid';
      }
      return `pixel_hud/grids/${canvasId}`;
    }

    function getGridCacheKey(canvasId = 'canvas_1') {
      if (!canvasId || canvasId === 'canvas_1') {
        return 'pixel_hud_grid_cache_v1';
      }
      return `pixel_hud_grid_cache_v1_${canvasId}`;
    }

    it("P27.1: Validates exactly 3 canvas definitions with sequential numbers", () => {
      expect(CANVAS_LIST.length).toBe(3);
      expect(CANVAS_LIST[0].id).toBe('canvas_1');
      expect(CANVAS_LIST[1].id).toBe('canvas_2');
      expect(CANVAS_LIST[2].id).toBe('canvas_3');
      expect(CANVAS_LIST[0].name).toBe('Canvas 1');
      expect(CANVAS_LIST[1].name).toBe('Canvas 2');
      expect(CANVAS_LIST[2].name).toBe('Canvas 3');
    });

    it("P27.2: getGridPath resolves legacy path for Canvas 1 and scoped paths for Canvas 2 and 3", () => {
      expect(getGridPath('canvas_1')).toBe('pixel_hud/grid');
      expect(getGridPath(undefined)).toBe('pixel_hud/grid');
      expect(getGridPath(null)).toBe('pixel_hud/grid');
      expect(getGridPath('canvas_2')).toBe('pixel_hud/grids/canvas_2');
      expect(getGridPath('canvas_3')).toBe('pixel_hud/grids/canvas_3');
    });

    it("P27.3: getGridCacheKey generates distinct localStorage partition keys", () => {
      const key1 = getGridCacheKey('canvas_1');
      const key2 = getGridCacheKey('canvas_2');
      const key3 = getGridCacheKey('canvas_3');

      expect(key1).toBe('pixel_hud_grid_cache_v1');
      expect(key2).toBe('pixel_hud_grid_cache_v1_canvas_2');
      expect(key3).toBe('pixel_hud_grid_cache_v1_canvas_3');
      expect(key1 !== key2).toBe(true);
      expect(key2 !== key3).toBe(true);
      expect(key1 !== key3).toBe(true);
    });

    it("P27.4: Multi-canvas state isolation preserves independent grid matrices", () => {
      const canvasStore = {
        canvas_1: new Map(),
        canvas_2: new Map(),
        canvas_3: new Map()
      };

      // Paint on Canvas 1
      canvasStore.canvas_1.set('10_10', { color: '#00f0ff', author: '@user1' });
      // Paint on Canvas 2
      canvasStore.canvas_2.set('20_20', { color: '#ff0055', author: '@user2' });
      // Paint on Canvas 3
      canvasStore.canvas_3.set('30_30', { color: '#00ff66', author: '@user3' });

      expect(canvasStore.canvas_1.has('10_10')).toBe(true);
      expect(canvasStore.canvas_1.has('20_20')).toBe(false);
      expect(canvasStore.canvas_1.has('30_30')).toBe(false);

      expect(canvasStore.canvas_2.has('20_20')).toBe(true);
      expect(canvasStore.canvas_2.has('10_10')).toBe(false);
      expect(canvasStore.canvas_2.has('30_30')).toBe(false);

      expect(canvasStore.canvas_3.has('30_30')).toBe(true);
      expect(canvasStore.canvas_3.has('10_10')).toBe(false);
      expect(canvasStore.canvas_3.has('20_20')).toBe(false);
    });

    it("P27.5: Canvas cycling wraps around seamlessly (1 -> 2 -> 3 -> 1)", () => {
      let active = 'canvas_1';
      const getNext = (curr) => {
        const idx = CANVAS_LIST.findIndex(c => c.id === curr);
        return CANVAS_LIST[(idx + 1) % CANVAS_LIST.length].id;
      };
      const getPrev = (curr) => {
        const idx = CANVAS_LIST.findIndex(c => c.id === curr);
        return CANVAS_LIST[(idx - 1 + CANVAS_LIST.length) % CANVAS_LIST.length].id;
      };

      active = getNext(active);
      expect(active).toBe('canvas_2');
      active = getNext(active);
      expect(active).toBe('canvas_3');
      active = getNext(active);
      expect(active).toBe('canvas_1');

      active = getPrev(active);
      expect(active).toBe('canvas_3');
      active = getPrev(active);
      expect(active).toBe('canvas_2');
      active = getPrev(active);
      expect(active).toBe('canvas_1');
    });
  });
});


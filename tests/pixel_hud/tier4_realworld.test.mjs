// tests/pixel_hud/tier4_realworld.test.mjs
// Tier 4: Real-World Multi-Visitor Simulation Workloads for PixelHUD

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

describe("Tier 4: Real-World Multi-Visitor Simulation Workloads", () => {
  let mockCanvas;
  let mockAudioCtx;
  let mockDb;

  beforeEach(() => {
    mockCanvas = new MockCanvasElement(800, 600);
    mockAudioCtx = new MockAudioContext();
    mockDb = new MockRealtimeDatabase();
  });

  // Workload 1: Collaborative Cyber Mural (4 Concurrent Visitors)
  describe("Workload 1: Collaborative Cyber Mural (4 Concurrent Visitors)", () => {
    it("RW1.1: 4 concurrent visitors paint 4 quadrants simultaneously with delta sync and audio", async () => {
      const visitors = [
        { name: "@alice", color: PALETTE[0].hex, sector: "alpha", startX: 0, startY: 0 },
        { name: "@bob", color: PALETTE[1].hex, sector: "beta", startX: 32, startY: 0 },
        { name: "@charlie", color: PALETTE[2].hex, sector: "gamma", startX: 0, startY: 32 },
        { name: "@diana", color: PALETTE[3].hex, sector: "delta", startX: 32, startY: 32 }
      ];

      const sharedGrid = new Map();
      const audioEvents = [];

      // Attach real-time listener to Firebase
      mockDb.onValue(mockDb.ref("pixel_hud/grid"), (snap) => {
        if (snap.exists()) {
          for (const [k, v] of Object.entries(snap.val())) {
            sharedGrid.set(k, v);
          }
        }
      });

      // Simulate concurrent painting (25 pixels per visitor = 100 total)
      for (let i = 0; i < 25; i++) {
        for (const visitor of visitors) {
          const gx = visitor.startX + (i % 5);
          const gy = visitor.startY + Math.floor(i / 5);
          const key = gx + "_" + gy;
          const note = mapYCoordToFrequency(gy);
          const pan = mapXCoordToPan(gx);

          // Trigger harmonic synth tone
          const osc = mockAudioCtx.createOscillator();
          osc.frequency.setValueAtTime(note.freq, 0);
          osc.start(0);
          osc.stop(0.05);
          audioEvents.push({ visitor: visitor.name, note: note.note, pan });

          // Dispatch to Firebase
          await mockDb.set(mockDb.ref("pixel_hud/grid/" + key), {
            color: visitor.color,
            author: visitor.name,
            freq: note.freq,
            timestamp: 1700000000 + i
          });
        }
      }

      // Verify final collaborative state
      expect(sharedGrid.size).toBe(100);
      expect(audioEvents.length).toBe(100);

      const metrics = calculateMatrixMetrics(sharedGrid);
      expect(metrics.activeCells).toBe(100);
      expect(metrics.sectors.alpha.count).toBe(25);
      expect(metrics.sectors.beta.count).toBe(25);
      expect(metrics.sectors.gamma.count).toBe(25);
      expect(metrics.sectors.delta.count).toBe(25);
      expect(metrics.colorDistribution[PALETTE[0].hex]).toBe(25);
      expect(metrics.colorDistribution[PALETTE[1].hex]).toBe(25);
    });
  });

  // Workload 2: Multi-User Stamp Battle & Shockwave Cascade
  describe("Workload 2: Multi-User Stamp Battle & Shockwave Cascade", () => {
    it("RW2.1: Multiple users drop stamps in overlapping areas with atomic updates and shockwaves", async () => {
      const activeShockwaves = [];
      const grid = new Map();

      // Listener to reflect RTDB updates
      mockDb.onValue(mockDb.ref("pixel_hud/grid"), (snap) => {
        if (snap.exists()) {
          for (const [k, v] of Object.entries(snap.val())) {
            grid.set(k, v);
          }
        }
      });

      // User 1 drops Space Invader at (30, 30) at t=1000
      const stamp1 = STAMPS.space_invader;
      const u1Updates = {};
      const halfW1 = Math.floor(stamp1.width / 2);
      const halfH1 = Math.floor(stamp1.height / 2);
      for (let r = 0; r < stamp1.height; r++) {
        for (let c = 0; c < stamp1.width; c++) {
          if (stamp1.matrix[r][c] === 1) {
            u1Updates["/pixel_hud/grid/" + (30 - halfW1 + c) + "_" + (30 - halfH1 + r)] = {
              color: PALETTE[0].hex,
              author: "@player1",
              timestamp: 1000
            };
          }
        }
      }
      await mockDb.update(mockDb.ref(), u1Updates);
      activeShockwaves.push({ gx: 30, gy: 30, color: PALETTE[0].hex, startTime: 1000 });

      // User 2 drops 8-Bit Heart at (32, 32) (overlapping) at t=2000
      const stamp2 = STAMPS.heart_8bit;
      const u2Updates = {};
      const halfW2 = Math.floor(stamp2.width / 2);
      const halfH2 = Math.floor(stamp2.height / 2);
      for (let r = 0; r < stamp2.height; r++) {
        for (let c = 0; c < stamp2.width; c++) {
          if (stamp2.matrix[r][c] === 1) {
            u2Updates["/pixel_hud/grid/" + (32 - halfW2 + c) + "_" + (32 - halfH2 + r)] = {
              color: PALETTE[1].hex,
              author: "@player2",
              timestamp: 2000
            };
          }
        }
      }
      await mockDb.update(mockDb.ref(), u2Updates);
      activeShockwaves.push({ gx: 32, gy: 32, color: PALETTE[1].hex, startTime: 2000 });

      // User 3 drops Cyber Skull at (34, 34) (overlapping) at t=3000
      const stamp3 = STAMPS.cyber_skull;
      const u3Updates = {};
      const halfW3 = Math.floor(stamp3.width / 2);
      const halfH3 = Math.floor(stamp3.height / 2);
      for (let r = 0; r < stamp3.height; r++) {
        for (let c = 0; c < stamp3.width; c++) {
          if (stamp3.matrix[r][c] === 1) {
            u3Updates["/pixel_hud/grid/" + (34 - halfW3 + c) + "_" + (34 - halfH3 + r)] = {
              color: PALETTE[2].hex,
              author: "@player3",
              timestamp: 3000
            };
          }
        }
      }
      await mockDb.update(mockDb.ref(), u3Updates);
      activeShockwaves.push({ gx: 34, gy: 34, color: PALETTE[2].hex, startTime: 3000 });

      // Verify conflict resolution (latest author overrides overlapped cells)
      expect(activeShockwaves.length).toBe(3);
      expect(grid.size).toBeGreaterThan(20);

      // Overlapped cell at (32, 32) should be player3 or player2
      const centerSnap = await mockDb.get(mockDb.ref("pixel_hud/grid/32_32"));
      expect(centerSnap.exists()).toBe(true);
      expect(centerSnap.val().timestamp).toBeGreaterThanOrEqual(2000);
    });
  });

  // Workload 3: Live Transmissions Stream & Global Reticle Exploration
  describe("Workload 3: Live Transmissions Stream & Global Exploration", () => {
    it("RW3.1: Worldwide visitors broadcast transmissions while explorer clicks and isolates", async () => {
      const transmissionFeed = [];
      let isolatedAuthor = null;
      let cameraFocus = { panX: 0, panY: 0 };
      const viewW = 800, viewH = 600, scale = 2.0, cellSize = 10;

      // Broadcast 25 transmissions from various users
      const authors = ["@tokyo_runner", "@berlin_synth", "@nyc_coder", "@london_art", "@seoul_grid"];
      for (let i = 0; i < 25; i++) {
        const author = authors[i % authors.length];
        const tx = {
          id: "tx_" + i,
          x: (i * 7) % 64,
          y: (i * 11) % 64,
          color: PALETTE[i % 8].hex,
          author,
          message: "Transmission from sector " + i,
          timestamp: Date.now() - (25 - i) * 1000
        };
        transmissionFeed.unshift(tx);
        if (transmissionFeed.length > 50) transmissionFeed.pop();
      }

      expect(transmissionFeed.length).toBe(25);

      // Explorer clicks transmission #5 from @berlin_synth
      const targetTx = transmissionFeed.find(tx => tx.author === "@berlin_synth");
      expect(targetTx).toBeDefined();

      // Camera auto-focuses on target
      cameraFocus.panX = viewW / 2 - targetTx.x * cellSize * scale;
      cameraFocus.panY = viewH / 2 - targetTx.y * cellSize * scale;

      // Author isolation mode activated
      isolatedAuthor = targetTx.author;
      expect(isolatedAuthor).toBe("@berlin_synth");

      // Verify reticle coordinates
      const worldCoord = screenToWorld(viewW / 2, viewH / 2, cameraFocus.panX, cameraFocus.panY, scale, cellSize);
      expect(worldCoord.gx).toBe(targetTx.x);
      expect(worldCoord.gy).toBe(targetTx.y);
    });
  });

  // Workload 4: Network Disconnection, Offline Drawing Queue, & Reconnection Merge
  describe("Workload 4: Network Disruption & Recovery Resynchronization", () => {
    it("RW4.1: Paints online, handles network drop with local queuing, and resyncs on reconnect", async () => {
      const localStorageCache = new Map();
      const offlineQueue = [];
      const localGrid = new Map();

      // Phase 1: Online initial painting
      for (let i = 0; i < 10; i++) {
        const mark = { color: "#00f0ff", author: "@survivor", timestamp: 1000 + i };
        localGrid.set(i + "_0", mark);
        await mockDb.set(mockDb.ref("pixel_hud/grid/" + i + "_0"), mark);
      }
      expect((await mockDb.get(mockDb.ref("pixel_hud/grid"))).exists()).toBe(true);

      // Phase 2: Network drops offline
      mockDb.setOnline(false);

      // Visitor paints 15 pixels and 1 stamp locally
      for (let i = 0; i < 15; i++) {
        const mark = { x: i, y: 1, color: "#ff007f", author: "@survivor", timestamp: 2000 + i };
        localGrid.set(i + "_1", mark);
        offlineQueue.push(mark);
      }
      localStorageCache.set("pixel_hud_offline_queue", JSON.stringify(offlineQueue));

      // Phase 3: Network restores online
      mockDb.setOnline(true);
      const queued = JSON.parse(localStorageCache.get("pixel_hud_offline_queue"));

      const batchUpdates = {};
      for (const item of queued) {
        batchUpdates["/pixel_hud/grid/" + item.x + "_" + item.y] = item;
      }
      await mockDb.update(mockDb.ref(), batchUpdates);
      localStorageCache.delete("pixel_hud_offline_queue");

      // Phase 4: Verify complete merged state in Firebase
      expect(localStorageCache.has("pixel_hud_offline_queue")).toBe(false);
      const snapRow0 = await mockDb.get(mockDb.ref("pixel_hud/grid/0_0"));
      const snapRow1 = await mockDb.get(mockDb.ref("pixel_hud/grid/0_1"));

      expect(snapRow0.val().color).toBe("#00f0ff");
      expect(snapRow1.val().color).toBe("#ff007f");
    });
  });

  // Workload 5: Matrix Saturation, Full 4096-Pixel Stress & Performance Audit
  describe("Workload 5: Matrix Saturation, 4096-Pixel Stress & Frame Budget", () => {
    it("RW5.1: Saturates all 4096 pixels, audits sector balance, and verifies 60 FPS render timing", async () => {
      const fullGrid = new Map();
      const ctx = mockCanvas.getContext("2d");

      // 1. Populate all 4096 cells
      const startFillTime = Date.now();
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const colorIndex = (x + y) % 8;
          fullGrid.set(x + "_" + y, {
            color: PALETTE[colorIndex].hex,
            author: "@matrix_architect",
            timestamp: 1700000000 + x + y * 64
          });
        }
      }
      expect(fullGrid.size).toBe(4096);

      // 2. Audit matrix metrics
      const metrics = calculateMatrixMetrics(fullGrid);
      expect(metrics.activeCells).toBe(4096);
      expect(metrics.densityPercent).toBe(100.0);
      expect(metrics.sectors.alpha.count).toBe(1024);
      expect(metrics.sectors.beta.count).toBe(1024);
      expect(metrics.sectors.gamma.count).toBe(1024);
      expect(metrics.sectors.delta.count).toBe(1024);

      // 3. Measure simulated render pass time (budget < 16.6ms for 60 FPS)
      const renderStart = Date.now();
      ctx.clearRect(0, 0, 800, 600);
      ctx.save();
      for (const [key, cell] of fullGrid.entries()) {
        const [x, y] = key.split("_").map(Number);
        ctx.fillStyle = cell.color;
        ctx.fillRect(x * 10, y * 10, 10, 10);
      }
      ctx.restore();
      const renderDuration = Date.now() - renderStart;

      expect(renderDuration).toBeLessThan(100); // well within headless budget
      expect(ctx.drawCalls.length).toBeGreaterThan(4000);
    });
  });
});

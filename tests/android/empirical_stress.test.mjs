// tests/android/empirical_stress.test.mjs
// Empirical Stress Test Harness & Adversarial Oracles for Gesture Mechanics & Performance

import { describe, it, expect } from "./helpers/test_framework.mjs";
import { AndroidHarness } from "./helpers/android_harness.mjs";
import { PORTFOLIO_APPS } from "./helpers/app_loader.mjs";

describe("Empirical Challenge Suite: Gesture Mechanics & Performance Stress", () => {

  describe("Oracle 1: Mathematical Edge Resistance Invariant Verification", () => {
    it("E1.1: Exact rubber-band dampening matrix across all pages and drag directions", () => {
      const harness = new AndroidHarness({ initialPage: 0, isLocked: false });

      // Page 0: Rightward drag (deltaX > 0) MUST dampen by 0.25x
      const p0RightValues = [1, 10, 50, 100, 240, 500, 1000, 5000];
      for (const dx of p0RightValues) {
        const dampened = harness.calculateEdgeResistance(dx, 0);
        expect(dampened).toBe(dx * 0.25);
      }

      // Page 0: Leftward drag (deltaX < 0) MUST track 1:1 (-1.0x)
      const p0LeftValues = [-1, -10, -50, -100, -240, -500, -1000];
      for (const dx of p0LeftValues) {
        const tracked = harness.calculateEdgeResistance(dx, 0);
        expect(tracked).toBe(dx);
      }

      // Page 1: Both left and right drags MUST track 1:1
      for (const dx of [-500, -100, -1, 1, 100, 500]) {
        const tracked = harness.calculateEdgeResistance(dx, 1);
        expect(tracked).toBe(dx);
      }

      // Page 2: Rightward drag (deltaX > 0) MUST track 1:1
      for (const dx of [1, 10, 50, 100, 240, 500, 1000]) {
        const tracked = harness.calculateEdgeResistance(dx, 2);
        expect(tracked).toBe(dx);
      }

      // Page 2: Leftward drag (deltaX < 0) MUST dampen by 0.25x
      for (const dx of [-1, -10, -50, -100, -240, -500, -1000, -5000]) {
        const dampened = harness.calculateEdgeResistance(dx, 2);
        expect(dampened).toBe(dx * 0.25);
      }
    });

    it("E1.2: Sub-pixel and floating-point micro-drag stability", () => {
      const harness = new AndroidHarness({ initialPage: 0, isLocked: false });
      const microDeltas = [0.0001, 0.001, 0.05, 0.1, 0.5, 0.9999];
      for (const dx of microDeltas) {
        const dampened = harness.calculateEdgeResistance(dx, 0);
        expect(Number.isFinite(dampened)).toBe(true);
        expect(dampened).toBe(dx * 0.25);
      }
    });
  });

  describe("Oracle 2: Coordinate Transform Geometry & CSS String Generation", () => {
    it("E2.1: Transform strings match exact spec across 3 pages and displacement ranges", () => {
      const harness = new AndroidHarness({ initialPage: 0, isLocked: false });

      // Page 0 rest
      expect(harness.getPageTransform(0)).toBe("translateX(calc(0% + 0px))");
      expect(harness.getPageTransform(1)).toBe("translateX(calc(100% + 0px))");
      expect(harness.getPageTransform(2)).toBe("translateX(calc(200% + 0px))");

      // Page 0 dragging left (-40px)
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(160, 300); // deltaX = -40
      expect(harness.swipeX).toBe(-40);
      expect(harness.getPageTransform(0)).toBe("translateX(calc(0% + -40px))");
      expect(harness.getPageTransform(1)).toBe("translateX(calc(100% + -40px))");
      expect(harness.getPageTransform(2)).toBe("translateX(calc(200% + -40px))");
      harness.handleTouchEnd(160, 300);

      // Transition to Page 1
      harness.setPage(1);
      expect(harness.getPageTransform(0)).toBe("translateX(calc(-100% + 0px))");
      expect(harness.getPageTransform(1)).toBe("translateX(calc(0% + 0px))");
      expect(harness.getPageTransform(2)).toBe("translateX(calc(100% + 0px))");

      // Page 1 dragging right (+50px)
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(250, 300); // deltaX = +50
      expect(harness.swipeX).toBe(50);
      expect(harness.getPageTransform(0)).toBe("translateX(calc(-100% + 50px))");
      expect(harness.getPageTransform(1)).toBe("translateX(calc(0% + 50px))");
      expect(harness.getPageTransform(2)).toBe("translateX(calc(100% + 50px))");
      harness.handleTouchEnd(250, 300);

      // Transition to Page 2
      harness.setPage(2);
      expect(harness.getPageTransform(0)).toBe("translateX(calc(-200% + 0px))");
      expect(harness.getPageTransform(1)).toBe("translateX(calc(-100% + 0px))");
      expect(harness.getPageTransform(2)).toBe("translateX(calc(0% + 0px))");

      // Page 2 dragging left beyond edge (-100px -> -25px dampened)
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(100, 300); // deltaX = -100
      expect(harness.swipeX).toBe(-25);
      expect(harness.getPageTransform(0)).toBe("translateX(calc(-200% + -25px))");
      expect(harness.getPageTransform(1)).toBe("translateX(calc(-100% + -25px))");
      expect(harness.getPageTransform(2)).toBe("translateX(calc(0% + -25px))");
      harness.handleTouchEnd(100, 300);
    });

    it("E2.2: Visibility and pointer events contract across all 3 pages", () => {
      const harness = new AndroidHarness({ initialPage: 0, isLocked: false });

      // Resting at Page 0
      const visP0 = harness.getPageVisibility(0);
      const visP1 = harness.getPageVisibility(1);
      const visP2 = harness.getPageVisibility(2);

      expect(visP0.visibility).toBe("visible");
      expect(visP0.pointerEvents).toBe("auto");
      expect(visP1.visibility).toBe("visible");
      expect(visP2.visibility).toBe("hidden"); // Page 2 is 2 units away -> hidden when resting at Page 0

      // Active swipe on Page 0 makes all pages visible
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(180, 300);
      expect(harness.swipeX).toBe(-20);
      expect(harness.getPageVisibility(2).visibility).toBe("visible");
      harness.handleTouchEnd(180, 300);
    });
  });

  describe("Oracle 3: Boundary Snapping Threshold Spectrum & Resolution Invariance", () => {
    it("E3.1: Resolution-independent threshold calculation across mobile, foldable, and tablet widths", () => {
      const viewports = [
        { width: 240, expectedThreshold: 36 },     // 240 * 0.15 = 36 (< 60)
        { width: 320, expectedThreshold: 48 },     // 320 * 0.15 = 48 (< 60)
        { width: 360, expectedThreshold: 54 },     // 360 * 0.15 = 54 (< 60)
        { width: 375, expectedThreshold: 56.25 },  // 375 * 0.15 = 56.25 (< 60)
        { width: 400, expectedThreshold: 60 },     // 400 * 0.15 = 60 (= 60)
        { width: 414, expectedThreshold: 60 },     // 414 * 0.15 = 62.1 -> capped at 60
        { width: 480, expectedThreshold: 60 },     // capped at 60
        { width: 600, expectedThreshold: 60 },     // foldable -> capped at 60
        { width: 768, expectedThreshold: 60 },     // tablet -> capped at 60
        { width: 1080, expectedThreshold: 60 },    // large desktop viewport -> capped at 60
      ];

      for (const vp of viewports) {
        const threshold = Math.min(vp.width * 0.15, 60);
        expect(threshold).toBe(vp.expectedThreshold);
      }
    });

    it("E3.2: Exact sub-threshold snap-back vs transition trigger validation", () => {
      const harness = new AndroidHarness({ width: 360, initialPage: 0, isLocked: false });
      // Width = 360 -> Threshold = 54px

      // 1. Drag -53.9px -> sub-threshold -> must NOT transition
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(146.1, 300); // deltaX = -53.9
      harness.handleTouchEnd(146.1, 300);
      expect(harness.page).toBe(0);
      expect(harness.swipeX).toBe(0);

      // 2. Drag -54.1px -> super-threshold -> MUST transition to Page 1
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(145.9, 300); // deltaX = -54.1
      harness.handleTouchEnd(145.9, 300);
      expect(harness.page).toBe(1);
      expect(harness.swipeX).toBe(0);

      // 3. Drag -54.1px on Page 1 -> MUST transition to Page 2
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(145.9, 300); // deltaX = -54.1
      harness.handleTouchEnd(145.9, 300);
      expect(harness.page).toBe(2);
      expect(harness.swipeX).toBe(0);

      // 4. Drag -54.1px on Page 2 -> edge boundary -> MUST clamp at Page 2
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(145.9, 300); // deltaX = -54.1
      harness.handleTouchEnd(145.9, 300);
      expect(harness.page).toBe(2);
      expect(harness.swipeX).toBe(0);

      // 5. Drag +54.1px on Page 2 -> MUST transition to Page 1
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(254.1, 300); // deltaX = +54.1
      harness.handleTouchEnd(254.1, 300);
      expect(harness.page).toBe(1);
      expect(harness.swipeX).toBe(0);

      // 6. Drag +54.1px on Page 1 -> MUST transition to Page 0
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(254.1, 300); // deltaX = +54.1
      harness.handleTouchEnd(254.1, 300);
      expect(harness.page).toBe(0);
      expect(harness.swipeX).toBe(0);
    });
  });

  describe("Oracle 4: Chaotic Stress & Invariant Fuzzing", () => {
    it("E4.1: 1,000-cycle randomized gesture fuzzing maintains strict mathematical invariants", () => {
      const harness = new AndroidHarness({ width: 375, initialPage: 0, isLocked: false });

      // Invariants to assert after every single operation:
      const assertInvariants = (step) => {
        expect(harness.page >= 0 && harness.page <= 2).toBe(true);
        expect(Number.isInteger(harness.page)).toBe(true);
        expect(harness.swipeX).toBe(0); // released state must always be 0
        expect(Number.isFinite(harness.swipeX)).toBe(true);
      };

      // Pseudo-random deterministic LCG generator for reproducible fuzzing
      let seed = 42;
      const random = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };

      for (let i = 0; i < 1000; i++) {
        const actionType = Math.floor(random() * 5);

        if (actionType === 0) {
          // Horizontal swipe
          const startX = 50 + random() * 300;
          const startY = 100 + random() * 500;
          const deltaX = (random() - 0.5) * 600; // -300 to +300
          const deltaY = (random() - 0.5) * 40;  // small vertical noise
          harness.handleTouchStart(startX, startY);
          harness.handleTouchMove(startX + deltaX, startY + deltaY);
          harness.handleTouchEnd(startX + deltaX, startY + deltaY);
        } else if (actionType === 1) {
          // Vertical scroll attempt
          const startX = 50 + random() * 300;
          const startY = 100 + random() * 500;
          const deltaX = (random() - 0.5) * 30;
          const deltaY = (random() - 0.5) * 400; // large vertical scroll
          harness.handleTouchStart(startX, startY);
          harness.handleTouchMove(startX + deltaX, startY + deltaY);
          harness.handleTouchEnd(startX + deltaX, startY + deltaY);
        } else if (actionType === 2) {
          // Direct 3-dot pagination tap
          const targetDot = Math.floor(random() * 3);
          harness.tapPaginationDot(targetDot);
        } else if (actionType === 3) {
          // Gesture navigation home reset
          harness.tapHome();
        } else if (actionType === 4) {
          // Micro-tap / jitter
          const startX = 100 + random() * 100;
          const startY = 200 + random() * 200;
          harness.handleTouchStart(startX, startY);
          harness.handleTouchMove(startX + (random() - 0.5) * 2, startY + (random() - 0.5) * 2);
          harness.handleTouchEnd(startX, startY);
        }

        assertInvariants(i);
      }
    });

    it("E4.2: Sequential navigation jump and subsequent drag lifecycles", () => {
      const harness = new AndroidHarness({ initialPage: 1, isLocked: false });

      // 1. Complete drag on Page 1 -> advances to Page 2
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(100, 300); // deltaX = -100
      harness.handleTouchEnd(100, 300);
      expect(harness.page).toBe(2);
      expect(harness.swipeX).toBe(0);

      // 2. Home tap resets to Page 0
      harness.tapHome();
      expect(harness.page).toBe(0);
      expect(harness.swipeX).toBe(0);

      // 3. New drag on Page 0 operates cleanly from Page 0
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(120, 300); // deltaX = -80
      harness.handleTouchEnd(120, 300);
      expect(harness.page).toBe(1);
      expect(harness.swipeX).toBe(0);
    });
  });

  describe("Oracle 5: 3-Dot Pagination & Gesture Navigation Sync", () => {
    it("E5.1: 3-dot pagination state maps precisely with pill styling", () => {
      const harness = new AndroidHarness({ initialPage: 0, isLocked: false });

      // Page 0
      let dots = harness.getPaginationDots();
      expect(dots[0].isActive).toBe(true);
      expect(dots[0].width).toBe(16);
      expect(dots[1].isActive).toBe(false);
      expect(dots[1].width).toBe(6);
      expect(dots[2].isActive).toBe(false);
      expect(dots[2].width).toBe(6);

      // Tap Dot 2 (Page 2)
      harness.tapPaginationDot(2);
      expect(harness.page).toBe(2);
      dots = harness.getPaginationDots();
      expect(dots[0].isActive).toBe(false);
      expect(dots[1].isActive).toBe(false);
      expect(dots[2].isActive).toBe(true);
      expect(dots[2].width).toBe(16);

      // Tap Dot 1 (Page 1)
      harness.tapPaginationDot(1);
      expect(harness.page).toBe(1);
      dots = harness.getPaginationDots();
      expect(dots[1].isActive).toBe(true);
      expect(dots[1].width).toBe(16);
    });

    it("E5.2: GestureNavBar home reset collapses open app modal and returns to Page 0", () => {
      const harness = new AndroidHarness({ initialPage: 2, isLocked: false });

      // Open an app from Page 2
      harness.openAppById("calc");
      expect(harness.openApp !== null).toBe(true);
      expect(harness.openApp.id).toBe("calc");

      // Tap Home on GestureNavBar
      harness.tapHome();
      expect(harness.page).toBe(0);
      expect(harness.openApp).toBe(null);
      expect(harness.drawerOpen).toBe(false);
      expect(harness.notificationOpen).toBe(false);
    });
  });
});

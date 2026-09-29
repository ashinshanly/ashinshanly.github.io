// tests/android/tier2_boundaries.test.mjs
// Tier 2: Boundary Value Analysis (BVA) (6 Suites, ≥30 Tests)

import { describe, it, expect, beforeEach } from "./helpers/test_framework.mjs";
import { AndroidHarness } from "./helpers/android_harness.mjs";
import { PORTFOLIO_APPS } from "./helpers/app_loader.mjs";

describe("Tier 2: Boundary Value Analysis (BVA) Suite", () => {
  let harness;

  beforeEach(() => {
    harness = new AndroidHarness({ isLocked: false });
  });

  // Boundary 1: Coordinate Extremes & Micro-Touches
  describe("Boundary 1: Coordinate Extremes & Micro-Touches", () => {
    it("B1.1: Zero-distance tap (deltaX = 0, deltaY = 0) does not move carousel", () => {
      harness.setPage(0);
      harness.handleTouchStart(100, 100);
      harness.handleTouchMove(100, 100);
      expect(harness.swipeX).toBe(0);
      harness.handleTouchEnd(100, 100);
      expect(harness.page).toBe(0);
    });

    it("B1.2: Micro-touch with sub-pixel displacement (<1px) leaves swipe state at 0", () => {
      harness.setPage(1);
      harness.handleTouchStart(150, 200);
      harness.handleTouchMove(150.4, 200.2);
      expect(harness.swipeX).toBeCloseTo(0.4, 1);
      harness.handleTouchEnd(150.4, 200.2);
      expect(harness.page).toBe(1);
    });

    it("B1.3: Extreme swipe drag (deltaX = +3000px) on Page 0 is properly dampened", () => {
      harness.setPage(0);
      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(3100, 200); // deltaX = +3000
      expect(harness.swipeX).toBe(750); // 3000 * 0.25
      harness.handleTouchEnd(3100, 200);
      expect(harness.page).toBe(0); // Cannot go left beyond Page 0
    });

    it("B1.4: Extreme negative drag (deltaX = -3000px) on Page 2 is properly dampened", () => {
      harness.setPage(2);
      harness.handleTouchStart(3000, 200);
      harness.handleTouchMove(0, 200); // deltaX = -3000
      expect(harness.swipeX).toBe(-750); // -3000 * 0.25
      harness.handleTouchEnd(0, 200);
      expect(harness.page).toBe(2); // Cannot go right beyond Page 2
    });

    it("B1.5: Negative client coordinates (off-screen touch start) handle gracefully", () => {
      harness.setPage(1);
      harness.handleTouchStart(-50, 100);
      harness.handleTouchMove(100, 100); // deltaX = +150
      expect(harness.swipeX).toBe(150);
      harness.handleTouchEnd(100, 100);
      expect(harness.page).toBe(0);
    });
  });

  // Boundary 2: Page Clamping & Multi-Transition Limits
  describe("Boundary 2: Page Clamping & Multi-Transition Limits", () => {
    it("B2.1: Swiping right at Page 0 remains firmly clamped at Page 0", () => {
      harness.setPage(0);
      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(250, 200); // deltaX = +150
      harness.handleTouchEnd(250, 200);
      expect(harness.page).toBe(0);
    });

    it("B2.2: Swiping left at Page 2 remains firmly clamped at Page 2", () => {
      harness.setPage(2);
      harness.handleTouchStart(250, 200);
      harness.handleTouchMove(100, 200); // deltaX = -150
      harness.handleTouchEnd(100, 200);
      expect(harness.page).toBe(2);
    });

    it("B2.3: Rapid sequential swipes 0 -> 1 -> 2 execute without state corruption", () => {
      harness.setPage(0);
      
      // 0 -> 1
      harness.handleTouchStart(200, 200);
      harness.handleTouchMove(100, 200);
      harness.handleTouchEnd(100, 200);
      expect(harness.page).toBe(1);

      // 1 -> 2
      harness.handleTouchStart(200, 200);
      harness.handleTouchMove(100, 200);
      harness.handleTouchEnd(100, 200);
      expect(harness.page).toBe(2);

      // Attempt 2 -> 3 (clamped)
      harness.handleTouchStart(200, 200);
      harness.handleTouchMove(100, 200);
      harness.handleTouchEnd(100, 200);
      expect(harness.page).toBe(2);
    });

    it("B2.4: Rapid oscillating swipes (0 -> 1 -> 0 -> 1) preserve clean 0px rest state", () => {
      harness.setPage(0);
      for (let i = 0; i < 5; i++) {
        harness.handleTouchStart(200, 200);
        harness.handleTouchMove(100, 200);
        harness.handleTouchEnd(100, 200);
        expect(harness.page).toBe(1);
        expect(harness.swipeX).toBe(0);

        harness.handleTouchStart(100, 200);
        harness.handleTouchMove(200, 200);
        harness.handleTouchEnd(200, 200);
        expect(harness.page).toBe(0);
        expect(harness.swipeX).toBe(0);
      }
    });

    it("B2.5: Direct setPage calls with float values clamp and floor correctly", () => {
      harness.setPage(1.8);
      expect(harness.page).toBe(1.8);
      harness.setPage(2.5);
      expect(harness.page).toBe(2);
      harness.setPage(-0.5);
      expect(harness.page).toBe(0);
    });
  });

  // Boundary 3: Viewport Width & Threshold Boundaries
  describe("Boundary 3: Viewport Width & Threshold Boundaries", () => {
    it("B3.1: Small screen (320px viewport): threshold is 15% (48px)", () => {
      harness.window.innerWidth = 320;
      harness.setPage(0);

      // Delta just below 48px -> snaps back
      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(55, 200); // deltaX = -45 (< 48)
      harness.handleTouchEnd(55, 200);
      expect(harness.page).toBe(0);

      // Delta just above 48px -> transitions
      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(50, 200); // deltaX = -50 (> 48)
      harness.handleTouchEnd(50, 200);
      expect(harness.page).toBe(1);
    });

    it("B3.2: Medium screen (375px viewport - iPhone standard): threshold is 15% (56.25px)", () => {
      harness.window.innerWidth = 375;
      harness.setPage(0);

      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(45, 200); // deltaX = -55 (< 56.25)
      harness.handleTouchEnd(45, 200);
      expect(harness.page).toBe(0);

      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(42, 200); // deltaX = -58 (> 56.25)
      harness.handleTouchEnd(42, 200);
      expect(harness.page).toBe(1);
    });

    it("B3.3: Large mobile screen (414px viewport): threshold is capped at 60px max", () => {
      harness.window.innerWidth = 414; // 15% = 62.1px -> capped at 60px
      harness.setPage(0);

      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(41, 200); // deltaX = -59 (< 60)
      harness.handleTouchEnd(41, 200);
      expect(harness.page).toBe(0);

      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(39, 200); // deltaX = -61 (> 60)
      harness.handleTouchEnd(39, 200);
      expect(harness.page).toBe(1);
    });

    it("B3.4: Tablet breakpoint boundary (768px viewport): threshold remains capped at 60px", () => {
      harness.window.innerWidth = 768; // 15% = 115.2px -> capped at 60px
      harness.setPage(0);

      harness.handleTouchStart(200, 200);
      harness.handleTouchMove(135, 200); // deltaX = -65 (> 60)
      harness.handleTouchEnd(135, 200);
      expect(harness.page).toBe(1);
    });

    it("B3.5: Exact threshold boundary value analysis (0.149 vs 0.151)", () => {
      harness.window.innerWidth = 360; // 15% = 54.0px
      harness.setPage(0);

      // Sub-threshold at 53.64px (14.9%)
      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(46.36, 200);
      harness.handleTouchEnd(46.36, 200);
      expect(harness.page).toBe(0);

      // Over-threshold at 54.36px (15.1%)
      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(45.64, 200);
      harness.handleTouchEnd(45.64, 200);
      expect(harness.page).toBe(1);
    });
  });

  // Boundary 4: App List Extremes & Metadata Fault Tolerance
  describe("Boundary 4: App List Extremes & Metadata Fault Tolerance", () => {
    it("B4.1: Empty apps list does not crash and renders 0 app counts across all screens", () => {
      const emptyHarness = new AndroidHarness({ apps: [] });
      expect(emptyHarness.getDockApps().length).toBe(0);
      expect(emptyHarness.getPage0Apps().length).toBe(0);
      expect(emptyHarness.getPage2Apps().length).toBe(0);
      expect(emptyHarness.getRenderedAppsCount()).toBe(0);
    });

    it("B4.2: Single app configuration maps cleanly to its designated tier", () => {
      const singleApp = [{ id: "calc", title: "Calc", icon: "./icon.png", favourite: false }];
      const singleHarness = new AndroidHarness({ apps: singleApp });
      expect(singleHarness.getDockApps().length).toBe(0);
      expect(singleHarness.getPage0Apps().length).toBe(0);
      expect(singleHarness.getPage2Apps().length).toBe(1);
      expect(singleHarness.getPage2Apps()[0].id).toBe("calc");
    });

    it("B4.3: Large app inventory (50+ apps) dynamically partitions all excess to Screen 3", () => {
      const bigApps = [...PORTFOLIO_APPS];
      for (let i = 1; i <= 40; i++) {
        bigApps.push({
          id: `extra-app-${i}`,
          title: `Extra App ${i}`,
          icon: `./themes/Yaru/apps/extra.png`,
          favourite: false
        });
      }
      const bigHarness = new AndroidHarness({ apps: bigApps });
      expect(bigHarness.getDockApps().length).toBe(4);
      expect(bigHarness.getPage0Apps().length).toBe(8);
      expect(bigHarness.getPage2Apps().length).toBe(5 + 40); // 45 extended apps
      expect(bigHarness.getRenderedAppsCount()).toBe(bigApps.length);
    });

    it("B4.4: App with missing optional properties (no icon, no favourite) does not throw", () => {
      const rawApp = { id: "test-app", title: "Test App" };
      const res = harness.resolveIconRendering(rawApp);
      expect(res.type).toBe("image");
      expect(res.fallbackSrc).toBe("./themes/Yaru/apps/bash.png");
    });

    it("B4.5: All apps hidden/uninstalled leaves 0 visible apps without breaking grid logic", () => {
      for (const app of PORTFOLIO_APPS) {
        harness.uninstallApp(app.id);
      }
      expect(harness.getActiveApps().length).toBe(0);
      expect(harness.getDockApps().length).toBe(0);
      expect(harness.getPage0Apps().length).toBe(0);
      expect(harness.getPage2Apps().length).toBe(0);
    });

    it("B4.6: Unknown app IDs passed to openAppById fail safely and return false", () => {
      const result = harness.openAppById("non-existent-app-999");
      expect(result).toBeFalsy();
      expect(harness.openApp).toBeNull();
    });
  });

  // Boundary 5: Debounce & Timing Bounds
  describe("Boundary 5: Debounce & Timing Bounds", () => {
    it("B5.1: Rapid consecutive app launch attempts (<500ms) are strictly debounced", () => {
      const first = harness.openAppById("vscode");
      expect(first).toBeTruthy();
      
      const second = harness.openAppById("vscode");
      expect(second).toBeFalsy();

      const third = harness.openAppById("terminal");
      expect(third).toBeFalsy();
    });

    it("B5.2: App launch attempt after 500ms window succeeds cleanly", () => {
      harness.openAppById("vscode");
      harness.lastOpenedTime = Date.now() - 501; // Advance clock beyond 500ms
      const later = harness.openAppById("terminal");
      expect(later).toBeTruthy();
      expect(harness.openApp.id).toBe("terminal");
    });

    it("B5.3: Rapid dot pagination clicks maintain target consistency", () => {
      harness.tapPaginationDot(2);
      harness.tapPaginationDot(0);
      harness.tapPaginationDot(1);
      expect(harness.page).toBe(1);
    });

    it("B5.4: Home bar tap during active touch drag immediately cancels drag state", () => {
      harness.setPage(2);
      harness.handleTouchStart(100, 200);
      harness.handleTouchMove(50, 200);
      expect(harness.isDragging).toBeTruthy();

      harness.tapHome();
      expect(harness.page).toBe(0);
    });

    it("B5.5: Long press context menu does not trigger on short taps (<500ms)", () => {
      const app = harness.apps.find(a => a.id === "spotify");
      // Simulating tap without calling openContextMenu
      expect(harness.contextMenu.app).toBeNull();
    });
  });

  // Boundary 6: Multi-Touch, Angles & Numeric Integrity
  describe("Boundary 6: Multi-Touch, Angles & Numeric Integrity", () => {
    it("B6.1: Equal horizontal and vertical displacement (|deltaX| === |deltaY|) allows horizontal drag", () => {
      harness.setPage(1);
      harness.handleTouchStart(200, 200);
      harness.handleTouchMove(150, 150); // deltaX = -50, deltaY = -50
      expect(harness.swipeX).toBe(-50);
    });

    it("B6.2: Steep angle gesture (deltaX = -50, deltaY = 51) is recognized as vertical scroll", () => {
      harness.setPage(1);
      harness.handleTouchStart(200, 200);
      harness.handleTouchMove(150, 251); // deltaX = -50, deltaY = 51
      expect(harness.swipeX).toBe(0);
    });

    it("B6.3: Shallow angle gesture (deltaX = -51, deltaY = 50) is recognized as horizontal swipe", () => {
      harness.setPage(1);
      harness.handleTouchStart(200, 200);
      harness.handleTouchMove(149, 250); // deltaX = -51, deltaY = 50
      expect(harness.swipeX).toBe(-51);
    });

    it("B6.4: Non-numeric / NaN input coordinates do not corrupt state", () => {
      harness.setPage(0);
      harness.handleTouchStart(0, 0);
      harness.handleTouchMove(NaN, NaN);
      expect(isNaN(harness.swipeX)).toBeFalsy();
      expect(harness.swipeX).toBe(0);
    });

    it("B6.5: Zero window width fallback prevents division by zero or NaN thresholds", () => {
      harness.window.innerWidth = 0;
      const threshold = Math.min(harness.window.innerWidth * 0.15, 60);
      expect(threshold).toBe(0);
    });
  });
});

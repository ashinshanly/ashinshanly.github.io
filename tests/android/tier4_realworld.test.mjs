// tests/android/tier4_realworld.test.mjs
// Tier 4: Real-World Multi-Screen User Workloads (≥4 Workloads)

import { describe, it, expect, beforeEach } from "./helpers/test_framework.mjs";
import { AndroidHarness } from "./helpers/android_harness.mjs";
import { PORTFOLIO_APPS } from "./helpers/app_loader.mjs";

describe("Tier 4: Real-World Multi-Screen User Workloads", () => {
  let harness;

  beforeEach(() => {
    harness = new AndroidHarness({ isLocked: true });
  });

  // Workload 1: Full 3-Screen Interactive Tour
  it("W1: Full 3-Screen Interactive Tour Workflow", () => {
    // 1. Device is locked initially
    expect(harness.isLocked).toBeTruthy();

    // 2. User swipes up to unlock
    const unlocked = harness.unlock(-200);
    expect(unlocked).toBeTruthy();
    expect(harness.isLocked).toBeFalsy();
    expect(harness.page).toBe(0);

    // 3. User verifies Screen 1 primary apps & GuestBook
    const p0Apps = harness.getPage0Apps();
    expect(p0Apps[0].id).toBe("pixel-hud");
    expect(p0Apps.length).toBe(8);

    // 4. User swipes left to Screen 2 (Widgets)
    harness.handleTouchStart(200, 300);
    harness.handleTouchMove(120, 300); // deltaX = -80
    harness.handleTouchEnd(120, 300);
    expect(harness.page).toBe(1);
    expect(harness.getPageTransform(1)).toBe("translateX(calc(0% + 0px))");

    // 5. User swipes left to Screen 3 (Extended Apps)
    harness.handleTouchStart(200, 300);
    harness.handleTouchMove(120, 300);
    harness.handleTouchEnd(120, 300);
    expect(harness.page).toBe(2);
    expect(harness.getPageTransform(2)).toBe("translateX(calc(0% + 0px))");

    // 6. User launches Calc from Screen 3
    const calcApp = harness.getPage2Apps().find(a => a.id === "calc");
    expect(calcApp).toBeDefined();
    harness.openAppById("calc");
    expect(harness.openApp.id).toBe("calc");

    // 7. User taps Home navigation bar to return to Page 0
    harness.tapHome();
    expect(harness.openApp).toBeNull();
    expect(harness.page).toBe(0);
  });

  // Workload 2: GuestBook Mobile Creation Session
  it("W2: GuestBook Mobile Creation Session Workflow", () => {
    // 1. Unlock device
    harness.unlock(-180);
    expect(harness.page).toBe(0);

    // 2. Verify GuestBook custom icon configuration
    const guestBook = harness.getPage0Apps().find(a => a.id === "pixel-hud");
    expect(guestBook.custom_icon).toBe("PixelHudIcon");
    const iconRes = harness.resolveIconRendering(guestBook);
    expect(iconRes.type).toBe("custom_component");
    expect(iconRes.componentName).toBe("PixelHudIcon");

    // 3. Launch GuestBook
    const launched = harness.openAppById("pixel-hud");
    expect(launched).toBeTruthy();
    expect(harness.openApp.id).toBe("pixel-hud");

    // 4. Close app via back gesture / close
    harness.closeApp();
    expect(harness.openApp).toBeNull();
    expect(harness.page).toBe(0);
  });

  // Workload 3: High-Frequency Page Navigation Stress Test
  it("W3: High-Frequency Page Navigation Stress Test (50 Sequential Gestures)", () => {
    harness.unlock(-200);

    // Execute 50 rapid sequential gestures and dot taps across pages 0, 1, 2
    for (let i = 0; i < 50; i++) {
      const target = i % 3;
      if (i % 2 === 0) {
        // Dot tap navigation
        harness.tapPaginationDot(target);
      } else {
        // Gesture swipe navigation
        const current = harness.page;
        if (target > current) {
          // Swipe left to advance
          harness.handleTouchStart(200, 300);
          harness.handleTouchMove(100, 300);
          harness.handleTouchEnd(100, 300);
        } else if (target < current) {
          // Swipe right to return
          harness.handleTouchStart(100, 300);
          harness.handleTouchMove(200, 300);
          harness.handleTouchEnd(200, 300);
        }
      }
      expect(harness.swipeX).toBe(0);
      expect(harness.page).toBeGreaterThanOrEqual(0);
      expect(harness.page).toBeLessThanOrEqual(2);
    }

    // Final reset to home
    harness.tapHome();
    expect(harness.page).toBe(0);
    expect(harness.swipeX).toBe(0);
  });

  // Workload 4: Complete App Management Lifecycle
  it("W4: Complete App Management Lifecycle Workflow", () => {
    harness.unlock(-200);

    // 1. Open App Drawer and search
    harness.openAppDrawer();
    expect(harness.drawerOpen).toBeTruthy();
    const searchResults = harness.searchAppDrawer("Chess");
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].id).toBe("chess");

    // 2. Launch Chess from Drawer
    harness.openAppById("chess");
    expect(harness.openApp.id).toBe("chess");
    expect(harness.drawerOpen).toBeFalsy();

    // 3. Close Chess
    harness.closeApp();
    expect(harness.openApp).toBeNull();

    // 4. Uninstall a secondary app from Screen 3
    const p2CountBefore = harness.getPage2Apps().length;
    harness.uninstallApp("secretmaze");
    expect(harness.getPage2Apps().length).toBe(p2CountBefore - 1);
    expect(harness.getAllVisibleAppIds()).not.toContain("secretmaze");

    // 5. Verify App Drawer also reflects uninstalled state
    const drawerAfter = harness.searchAppDrawer("Secret Maze");
    expect(drawerAfter.length).toBe(0);
  });
});

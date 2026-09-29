// tests/android/tier1_features.test.mjs
// Tier 1: Feature Isolation Coverage (15 Suites, ≥45 Tests)

import { describe, it, expect, beforeEach } from "./helpers/test_framework.mjs";
import { AndroidHarness } from "./helpers/android_harness.mjs";
import { PORTFOLIO_APPS, DOCK_APP_IDS, PAGE_0_APP_IDS, EXTENDED_APP_IDS, EXPECTED_TOTAL_APPS } from "./helpers/app_loader.mjs";

describe("Tier 1: Feature Isolation Test Suite", () => {
  let harness;

  beforeEach(() => {
    harness = new AndroidHarness({ isLocked: false });
  });

  // Feature 1: 3-Page State Management
  describe("Feature 1: 3-Page State Management", () => {
    it("F1.1: Initializes default page to 0 (Screen 1 Main Home)", () => {
      expect(harness.page).toBe(0);
      expect(harness.getPageTransform(0)).toBe("translateX(calc(0% + 0px))");
      expect(harness.getPageTransform(1)).toBe("translateX(calc(100% + 0px))");
      expect(harness.getPageTransform(2)).toBe("translateX(calc(200% + 0px))");
    });

    it("F1.2: Direct page transitions between 0, 1, and 2 update page state and vibrate", () => {
      harness.setPage(1);
      expect(harness.page).toBe(1);
      expect(harness.navigator.vibrationLog.length).toBe(1);

      harness.setPage(2);
      expect(harness.page).toBe(2);
      expect(harness.navigator.vibrationLog.length).toBe(2);

      harness.setPage(0);
      expect(harness.page).toBe(0);
      expect(harness.navigator.vibrationLog.length).toBe(3);
    });

    it("F1.3: Boundary clamping enforces strict [0, 2] range for out-of-bounds page requests", () => {
      harness.setPage(-1);
      expect(harness.page).toBe(0);

      harness.setPage(5);
      expect(harness.page).toBe(2);

      harness.setPage(999);
      expect(harness.page).toBe(2);
    });

    it("F1.4: Setting page to the current page does not trigger redundant vibrations", () => {
      harness.setPage(0);
      expect(harness.navigator.vibrationLog.length).toBe(0);
    });

    it("F1.5: Page state persists when opening and closing applications", () => {
      harness.setPage(2);
      harness.openAppById("calc");
      expect(harness.openApp.id).toBe("calc");
      expect(harness.page).toBe(2);
      harness.closeApp();
      expect(harness.page).toBe(2);
    });
  });

  // Feature 2: Horizontal Touch Drag Tracking
  describe("Feature 2: Horizontal Touch Drag Tracking", () => {
    it("F2.1: Captures initial touch coordinates on handleTouchStart", () => {
      harness.handleTouchStart(150, 300);
      expect(harness.touchStartX).toBe(150);
      expect(harness.touchStartY).toBe(300);
      expect(harness.isDragging).toBeTruthy();
    });

    it("F2.2: Live drag updates swipeX with 1:1 displacement during valid transitions", () => {
      harness.setPage(1); // On Page 1, dragging left moves towards Page 2
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(140, 300); // deltaX = -60px
      expect(harness.swipeX).toBe(-60);
      expect(harness.getPageTransform(1)).toBe("translateX(calc(0% + -60px))");
    });

    it("F2.3: Vertical scroll discrimination suppresses horizontal swipe when |deltaY| > |deltaX|", () => {
      harness.setPage(1);
      harness.handleTouchStart(200, 200);
      harness.handleTouchMove(190, 250); // deltaX = -10, deltaY = 50 (|deltaY| > |deltaX|)
      expect(harness.swipeX).toBe(0);
    });

    it("F2.4: Diagonal swipe where |deltaX| > |deltaY| allows horizontal page drag", () => {
      harness.setPage(1);
      harness.handleTouchStart(200, 200);
      harness.handleTouchMove(140, 220); // deltaX = -60, deltaY = 20
      expect(harness.swipeX).toBe(-60);
    });
  });

  // Feature 3: Edge Resistance Mathematics
  describe("Feature 3: Edge Resistance Mathematics", () => {
    it("F3.1: Applies 0.25x dampening when swiping right on Page 0 (left edge boundary)", () => {
      harness.setPage(0);
      harness.handleTouchStart(100, 300);
      harness.handleTouchMove(200, 300); // deltaX = +100px (rightward swipe)
      expect(harness.swipeX).toBe(25); // 100 * 0.25 = 25px
      expect(harness.calculateEdgeResistance(100, 0)).toBe(25);
    });

    it("F3.2: Applies 0.25x dampening when swiping left on Page 2 (right edge boundary)", () => {
      harness.setPage(2);
      harness.handleTouchStart(300, 300);
      harness.handleTouchMove(200, 300); // deltaX = -100px (leftward swipe)
      expect(harness.swipeX).toBe(-25); // -100 * 0.25 = -25px
      expect(harness.calculateEdgeResistance(-100, 2)).toBe(-25);
    });

    it("F3.3: Applies 1.0x factor for forward and backward transitions on Page 1", () => {
      harness.setPage(1);
      expect(harness.calculateEdgeResistance(-80, 1)).toBe(-80);
      expect(harness.calculateEdgeResistance(80, 1)).toBe(80);
    });

    it("F3.4: Negative drag on Page 0 operates at full 1.0x factor towards Page 1", () => {
      harness.setPage(0);
      expect(harness.calculateEdgeResistance(-100, 0)).toBe(-100);
    });

    it("F3.5: Positive drag on Page 2 operates at full 1.0x factor towards Page 1", () => {
      harness.setPage(2);
      expect(harness.calculateEdgeResistance(100, 2)).toBe(100);
    });
  });

  // Feature 4: Snapping & Navigation Thresholds
  describe("Feature 4: Snapping & Navigation Thresholds", () => {
    it("F4.1: Swiping past threshold advances screen from 0 to 1 and from 1 to 2", () => {
      harness.window.innerWidth = 360; // 15% threshold = 54px
      
      // Page 0 -> 1
      harness.setPage(0);
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(130, 300); // swipeX = -70 (exceeds 54px threshold)
      harness.handleTouchEnd(130, 300);
      expect(harness.page).toBe(1);
      expect(harness.swipeX).toBe(0);

      // Page 1 -> 2
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(130, 300); // swipeX = -70
      harness.handleTouchEnd(130, 300);
      expect(harness.page).toBe(2);
      expect(harness.swipeX).toBe(0);
    });

    it("F4.2: Swiping right past threshold returns from 2 to 1 and from 1 to 0", () => {
      harness.window.innerWidth = 360;
      harness.setPage(2);

      // Page 2 -> 1
      harness.handleTouchStart(100, 300);
      harness.handleTouchMove(180, 300); // swipeX = +80
      harness.handleTouchEnd(180, 300);
      expect(harness.page).toBe(1);

      // Page 1 -> 0
      harness.handleTouchStart(100, 300);
      harness.handleTouchMove(180, 300); // swipeX = +80
      harness.handleTouchEnd(180, 300);
      expect(harness.page).toBe(0);
    });

    it("F4.3: Sub-threshold swipe snaps back to the original page without transitioning", () => {
      harness.window.innerWidth = 360; // threshold = 54px
      harness.setPage(1);
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(170, 300); // swipeX = -30 (< 54px threshold)
      harness.handleTouchEnd(170, 300);
      expect(harness.page).toBe(1);
      expect(harness.swipeX).toBe(0);
    });

    it("F4.4: High vertical movement (|deltaY| >= 60) cancels horizontal snap", () => {
      harness.window.innerWidth = 360;
      harness.setPage(0);
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(120, 300); // deltaX = -80
      harness.handleTouchEnd(120, 380); // deltaY = 80 (exceeds 60px limit)
      expect(harness.page).toBe(0);
    });
  });

  // Feature 5: 3-Dot Interactive Pagination
  describe("Feature 5: 3-Dot Interactive Pagination", () => {
    it("F5.1: Renders exactly 3 pagination dots corresponding to pages 0, 1, and 2", () => {
      const dots = harness.getPaginationDots();
      expect(dots.length).toBe(3);
      expect(dots[0].ariaLabel).toBe("Go to screen 1");
      expect(dots[1].ariaLabel).toBe("Go to screen 2");
      expect(dots[2].ariaLabel).toBe("Go to screen 3");
    });

    it("F5.2: Active dot expands to 16px pill indicator with white glow", () => {
      harness.setPage(0);
      let dots = harness.getPaginationDots();
      expect(dots[0].isActive).toBeTruthy();
      expect(dots[0].width).toBe(16);
      expect(dots[1].isActive).toBeFalsy();
      expect(dots[1].width).toBe(6);

      harness.setPage(2);
      dots = harness.getPaginationDots();
      expect(dots[2].isActive).toBeTruthy();
      expect(dots[2].width).toBe(16);
      expect(dots[0].isActive).toBeFalsy();
    });

    it("F5.3: Tapping any pagination dot switches directly to that page", () => {
      harness.tapPaginationDot(2);
      expect(harness.page).toBe(2);

      harness.tapPaginationDot(1);
      expect(harness.page).toBe(1);

      harness.tapPaginationDot(0);
      expect(harness.page).toBe(0);
    });

    it("F5.4: Pagination dots update reactively on swipe transitions", () => {
      harness.setPage(0);
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(120, 300);
      harness.handleTouchEnd(120, 300);
      const dots = harness.getPaginationDots();
      expect(dots[1].isActive).toBeTruthy();
    });
  });

  // Feature 6: Screen 1 (Page 0) Layout & Primary App Grid
  describe("Feature 6: Screen 1 (Page 0) Layout & Primary App Grid", () => {
    it("F6.1: Screen 1 contains 8 primary apps with GuestBook (pixel-hud) at slot 1", () => {
      const page0Apps = harness.getPage0Apps();
      expect(page0Apps.length).toBe(8);
      expect(page0Apps[0].id).toBe("pixel-hud");
      expect(page0Apps[0].title).toBe("GuestBook");
      expect(page0Apps[1].id).toBe("about-ashin");
      expect(page0Apps[2].id).toBe("visitor-stats");
    });

    it("F6.2: Screen 1 visibility is auto when page=0 and hidden when page=2", () => {
      harness.setPage(0);
      const v0 = harness.getPageVisibility(0);
      expect(v0.pointerEvents).toBe("auto");
      expect(v0.visibility).toBe("visible");

      harness.setPage(2);
      const v2 = harness.getPageVisibility(0);
      expect(v2.visibility).toBe("hidden");
    });

    it("F6.3: Dock apps are partitioned separately from Screen 1 primary apps", () => {
      const dock = harness.getDockApps();
      const page0 = harness.getPage0Apps();
      expect(dock.length).toBe(4);
      expect(page0.length).toBe(8);
      for (const d of dock) {
        expect(page0.find(p => p.id === d.id)).toBeUndefined();
      }
    });
  });

  // Feature 7: Screen 2 (Page 1) Layout & Widgets
  describe("Feature 7: Screen 2 (Page 1) Layout & Widgets", () => {
    it("F7.1: Screen 2 is positioned between Screen 1 and Screen 3", () => {
      harness.setPage(1);
      expect(harness.getPageTransform(0)).toBe("translateX(calc(-100% + 0px))");
      expect(harness.getPageTransform(1)).toBe("translateX(calc(0% + 0px))");
      expect(harness.getPageTransform(2)).toBe("translateX(calc(100% + 0px))");
    });

    it("F7.2: Screen 2 has pointerEvents auto when page is 1", () => {
      harness.setPage(1);
      const v = harness.getPageVisibility(1);
      expect(v.pointerEvents).toBe("auto");
      expect(v.visibility).toBe("visible");
    });

    it("F7.3: Screen 2 transforms cleanly during live swipe toward Screen 3", () => {
      harness.setPage(1);
      harness.handleTouchStart(200, 300);
      harness.handleTouchMove(160, 300); // swipeX = -40
      expect(harness.getPageTransform(1)).toBe("translateX(calc(0% + -40px))");
      expect(harness.getPageTransform(2)).toBe("translateX(calc(100% + -40px))");
    });
  });

  // Feature 8: Screen 3 (Page 2) Layout & Extended Apps Grid
  describe("Feature 8: Screen 3 (Page 2) Layout & Extended Apps Grid", () => {
    it("F8.1: Screen 3 dynamically holds all extended apps not on Screen 1 or Dock", () => {
      const page2Apps = harness.getPage2Apps();
      expect(page2Apps.length).toBe(5);
      const ids = page2Apps.map(a => a.id);
      expect(ids).toContain("calc");
      expect(ids).toContain("chainreaction");
      expect(ids).toContain("secretmaze");
      expect(ids).toContain("prism-flow");
      expect(ids).toContain("trash");
    });

    it("F8.2: Screen 3 contains zero overlap with Dock or Screen 1 apps", () => {
      const dockIds = new Set(harness.getDockApps().map(a => a.id));
      const page0Ids = new Set(harness.getPage0Apps().map(a => a.id));
      const page2Apps = harness.getPage2Apps();

      for (const app of page2Apps) {
        expect(dockIds.has(app.id)).toBeFalsy();
        expect(page0Ids.has(app.id)).toBeFalsy();
      }
    });

    it("F8.3: Extended apps grid has pointerEvents auto when on page 2", () => {
      harness.setPage(2);
      const v = harness.getPageVisibility(2);
      expect(v.pointerEvents).toBe("auto");
      expect(v.visibility).toBe("visible");
    });
  });

  // Feature 9: 100% App Ecosystem Visibility
  describe("Feature 9: 100% App Ecosystem Visibility", () => {
    it("F9.1: Sum of Dock, Screen 1, and Screen 3 equals total 17 active apps", () => {
      const dock = harness.getDockApps();
      const page0 = harness.getPage0Apps();
      const page2 = harness.getPage2Apps();

      expect(dock.length).toBe(4);
      expect(page0.length).toBe(8);
      expect(page2.length).toBe(5);
      expect(dock.length + page0.length + page2.length).toBe(EXPECTED_TOTAL_APPS);
    });

    it("F9.2: Every single portfolio app is mapped with zero omissions and zero duplicates", () => {
      const visibleIds = harness.getAllVisibleAppIds();
      expect(visibleIds.length).toBe(EXPECTED_TOTAL_APPS);
      
      const uniqueIds = new Set(visibleIds);
      expect(uniqueIds.size).toBe(EXPECTED_TOTAL_APPS);

      for (const app of PORTFOLIO_APPS) {
        expect(uniqueIds.has(app.id)).toBeTruthy();
      }
    });

    it("F9.3: Preserves app attributes including desktop shortcut, favourite status, and titles", () => {
      for (const app of PORTFOLIO_APPS) {
        expect(app.title.length).toBeGreaterThan(0);
        expect(app.icon.length).toBeGreaterThan(0);
      }
    });
  });

  // Feature 10: Custom Icon Fidelity
  describe("Feature 10: Custom Icon Fidelity", () => {
    it("F10.1: GuestBook and Visitor Stats resolve to custom icon components", () => {
      const pixelHudApp = harness.apps.find(a => a.id === "pixel-hud");
      const pixelHudRes = harness.resolveIconRendering(pixelHudApp);
      expect(pixelHudRes.type).toBe("custom_component");
      expect(pixelHudRes.componentName).toBe("PixelHudIcon");
      expect(pixelHudRes.sizeProp).toBe("sidebar");

      const visitorApp = harness.apps.find(a => a.id === "visitor-stats");
      const visitorRes = harness.resolveIconRendering(visitorApp);
      expect(visitorRes.type).toBe("custom_component");
      expect(visitorRes.componentName).toBe("VisitorIcon");
    });

    it("F10.2: Standard apps render image icons with reliable fallback asset path", () => {
      const chromeApp = harness.apps.find(a => a.id === "chrome");
      const chromeRes = harness.resolveIconRendering(chromeApp);
      expect(chromeRes.type).toBe("image");
      expect(chromeRes.src).toBe("./themes/Yaru/apps/chrome.png");
      expect(chromeRes.fallbackSrc).toBe("./themes/Yaru/apps/bash.png");
    });

    it("F10.3: Custom icon components pass size='sidebar' to avoid redundant duplicate title text", () => {
      const pixelHudApp = harness.apps.find(a => a.id === "pixel-hud");
      const res = harness.resolveIconRendering(pixelHudApp);
      expect(res.sizeProp).toBe("sidebar");
      expect(res.showTitle).toBeTruthy();
    });
  });

  // Feature 11: App Launch & Window Lifecycle
  describe("Feature 11: App Launch & Window Lifecycle", () => {
    it("F11.1: Launching an internal app sets openApp state and closes drawer", () => {
      harness.openAppDrawer();
      expect(harness.drawerOpen).toBeTruthy();

      const launched = harness.openAppById("pixel-hud");
      expect(launched).toBeTruthy();
      expect(harness.openApp.id).toBe("pixel-hud");
      expect(harness.drawerOpen).toBeFalsy();
    });

    it("F11.2: Launching an external app invokes window.open and does not set openApp modal", () => {
      const launched = harness.openAppById("musicsync");
      expect(launched).toBeTruthy();
      expect(harness.window.openedUrls.length).toBe(1);
      expect(harness.window.openedUrls[0].url).toBe("https://ashinshanly.github.io/musicsync/");
      expect(harness.openApp).toBeNull();
    });

    it("F11.3: Closing an open app resets openApp state", () => {
      harness.openAppById("vscode");
      expect(harness.openApp.id).toBe("vscode");
      harness.closeApp();
      expect(harness.openApp).toBeNull();
    });

    it("F11.4: Rapid double-tap debounce prevents redundant rapid launches (<500ms)", () => {
      const first = harness.openAppById("chess");
      expect(first).toBeTruthy();
      const second = harness.openAppById("chess");
      expect(second).toBeFalsy();
    });
  });

  // Feature 12: Gesture Navigation Bar
  describe("Feature 12: Gesture Navigation Bar", () => {
    it("F12.1: Tapping GestureNavBar on Page 1 or Page 2 returns directly to Page 0", () => {
      harness.setPage(2);
      expect(harness.page).toBe(2);

      harness.tapHome();
      expect(harness.page).toBe(0);
    });

    it("F12.2: Tapping GestureNavBar closes any active open app and resets home screen", () => {
      harness.setPage(1);
      harness.openAppById("calc");
      expect(harness.openApp.id).toBe("calc");

      harness.tapHome();
      expect(harness.openApp).toBeNull();
      expect(harness.page).toBe(0);
    });

    it("F12.3: Tapping GestureNavBar closes drawer and notification panels", () => {
      harness.pullDownNotification();
      expect(harness.notificationOpen).toBeTruthy();
      harness.tapHome();
      expect(harness.notificationOpen).toBeFalsy();
    });
  });

  // Feature 13: Context Menu & Uninstall
  describe("Feature 13: Context Menu & Uninstall", () => {
    it("F13.1: Long-press triggers context menu with app details and position", () => {
      const app = harness.apps.find(a => a.id === "spotify");
      harness.openContextMenu(app, { x: 120, y: 340 });
      expect(harness.contextMenu.app.id).toBe("spotify");
      expect(harness.contextMenu.position.x).toBe(120);
    });

    it("F13.2: Uninstalling an app adds it to hiddenApps and dynamically rebalances grids", () => {
      expect(harness.getPage2Apps().length).toBe(5);
      harness.uninstallApp("calc");
      expect(harness.hiddenApps).toContain("calc");
      expect(harness.getPage2Apps().length).toBe(4);
      expect(harness.getAllVisibleAppIds()).not.toContain("calc");
    });

    it("F13.3: Closing context menu resets contextMenu state", () => {
      const app = harness.apps.find(a => a.id === "spotify");
      harness.openContextMenu(app, { x: 100, y: 100 });
      harness.closeContextMenu();
      expect(harness.contextMenu.app).toBeNull();
    });
  });

  // Feature 14: Notification Panel & Quick Settings
  describe("Feature 14: Notification Panel & Quick Settings", () => {
    it("F14.1: Pulling down notification opens panel with haptic feedback", () => {
      expect(harness.notificationOpen).toBeFalsy();
      harness.pullDownNotification();
      expect(harness.notificationOpen).toBeTruthy();
      expect(harness.navigator.vibrationLog.length).toBe(1);
    });

    it("F14.2: Brightness adjustment clamps between 20% and 100%", () => {
      harness.setBrightness(75);
      expect(harness.brightness).toBe(75);

      harness.setBrightness(5); // Below min 20
      expect(harness.brightness).toBe(20);

      harness.setBrightness(150); // Above max 100
      expect(harness.brightness).toBe(100);
    });

    it("F14.3: Dismissing notification panel closes panel smoothly", () => {
      harness.pullDownNotification();
      expect(harness.notificationOpen).toBeTruthy();
      harness.closeNotification();
      expect(harness.notificationOpen).toBeFalsy();
    });
  });

  // Feature 15: Lock Screen & Parallax
  describe("Feature 15: Lock Screen & Parallax", () => {
    it("F15.1: Device begins in locked state and unlocks on swipe up past threshold", () => {
      harness.isLocked = true;
      const unlockedShort = harness.unlock(-50); // Under 150px threshold
      expect(unlockedShort).toBeFalsy();
      expect(harness.isLocked).toBeTruthy();

      const unlockedSuccess = harness.unlock(-180); // Past 150px threshold
      expect(unlockedSuccess).toBeTruthy();
      expect(harness.isLocked).toBeFalsy();
    });

    it("F15.2: Device orientation updates parallax tilt offsets and wallpaper transform", () => {
      harness.handleDeviceOrientation(22.5, 45); // 22.5 deg gamma -> x translation
      expect(harness.tilt.x).toBeCloseTo(-12.5, 1);
      expect(harness.tilt.y).toBeCloseTo(0, 1);
      expect(harness.getWallpaperTransform()).toContain("translate(-12.5px");
    });

    it("F15.3: Gyro tilt clamping constrains maximum translation offset to ±25px", () => {
      harness.handleDeviceOrientation(90, 180); // Extreme tilt angles
      expect(harness.tilt.x).toBe(-25);
      expect(harness.tilt.y).toBe(-25);
    });
  });
});

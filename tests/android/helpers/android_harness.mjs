// tests/android/helpers/android_harness.mjs
// Authoritative Android Environment & Gesture Navigation Test Harness

import { PORTFOLIO_APPS, DOCK_APP_IDS, PAGE_0_APP_IDS, EXTENDED_APP_IDS } from "./app_loader.mjs";
import { MockWindow, MockNavigator } from "./mock_dom.mjs";

export class AndroidHarness {
  constructor(options = {}) {
    this.window = new MockWindow(options.width || 360, options.height || 740);
    this.navigator = new MockNavigator();
    this.apps = options.apps ? [...options.apps] : JSON.parse(JSON.stringify(PORTFOLIO_APPS));
    
    // Core State
    this.page = options.initialPage !== undefined ? options.initialPage : 0;
    this.swipeX = 0;
    this.isLocked = options.isLocked !== undefined ? options.isLocked : true;
    this.openApp = null;
    this.closingApp = false;
    this.drawerOpen = false;
    this.notificationOpen = false;
    this.contextMenu = { app: null, position: null };
    this.hiddenApps = [];
    this.brightness = 100;
    this.tilt = { x: 0, y: 0 };
    this.bgImage = "wall-2";
    
    // Touch gesture tracking state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.isDragging = false;
    this.lockDragY = 0;

    // Timing tracking
    this.lastOpenedTime = 0;
    this.longPressTimer = null;
  }

  // App Filtering & Distribution (100% Visibility Model)
  getActiveApps() {
    return this.apps.filter(app => !this.hiddenApps.includes(app.id) && !app.disabled);
  }

  getDockApps() {
    const active = this.getActiveApps();
    return DOCK_APP_IDS
      .map(id => active.find(a => a.id === id))
      .filter(Boolean);
  }

  getPage0Apps() {
    const active = this.getActiveApps();
    return PAGE_0_APP_IDS
      .map(id => active.find(a => a.id === id))
      .filter(Boolean);
  }

  getPage2Apps() {
    const active = this.getActiveApps();
    const dockIds = new Set(this.getDockApps().map(a => a.id));
    const page0Ids = new Set(this.getPage0Apps().map(a => a.id));
    return active.filter(app => !dockIds.has(app.id) && !page0Ids.has(app.id));
  }

  getRenderedAppsCount() {
    const dock = this.getDockApps();
    const page0 = this.getPage0Apps();
    const page2 = this.getPage2Apps();
    return dock.length + page0.length + page2.length;
  }

  getAllVisibleAppIds() {
    const dock = this.getDockApps().map(a => a.id);
    const page0 = this.getPage0Apps().map(a => a.id);
    const page2 = this.getPage2Apps().map(a => a.id);
    return [...dock, ...page0, ...page2];
  }

  // Edge Resistance Mathematics
  calculateEdgeResistance(deltaX, currentPage = this.page) {
    if (currentPage === 0 && deltaX > 0) {
      // Swiping right on Page 0 (left edge boundary)
      return deltaX * 0.25;
    }
    if (currentPage === 2 && deltaX < 0) {
      // Swiping left on Page 2 (right edge boundary)
      return deltaX * 0.25;
    }
    // Standard active drag between pages
    return deltaX * 1.0;
  }

  // Touch Gesture Simulation
  handleTouchStart(clientX, clientY, timestamp = Date.now()) {
    this.touchStartX = typeof clientX === 'number' && !isNaN(clientX) ? clientX : 0;
    this.touchStartY = typeof clientY === 'number' && !isNaN(clientY) ? clientY : 0;
    this.touchStartTime = timestamp;
    this.isDragging = true;
  }

  handleTouchMove(clientX, clientY) {
    if (!this.isDragging) return;
    if (this.drawerOpen || this.notificationOpen || this.isLocked || this.contextMenu.app) return;
    if (typeof clientX !== 'number' || isNaN(clientX) || typeof clientY !== 'number' || isNaN(clientY)) return;

    const deltaX = clientX - this.touchStartX;
    const deltaY = clientY - this.touchStartY;

    // Vertical scroll discrimination: ignore horizontal swipe if vertical motion dominates
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    this.swipeX = this.calculateEdgeResistance(deltaX, this.page);
  }

  handleTouchEnd(clientX, clientY) {
    if (!this.isDragging) return;
    this.isDragging = false;

    const validClientY = typeof clientY === 'number' && !isNaN(clientY) ? clientY : this.touchStartY;
    const deltaY = this.touchStartY - validClientY;
    const screenWidth = this.window.innerWidth || 360;
    
    // Status bar pull-down notification trigger
    if (deltaY < -80 && this.touchStartY < 100 && !this.drawerOpen) {
      this.notificationOpen = true;
      this.navigator.vibrate(10);
    }

    // Snapping threshold calculation (15% screen width or max 60px)
    const swipeThreshold = Math.min(screenWidth * 0.15, 60);

    if (Math.abs(this.swipeX) > swipeThreshold && Math.abs(deltaY) < 60) {
      if (this.swipeX < 0 && this.page < 2) {
        // Dragged left -> switch to next screen
        this.page = Math.min(2, this.page + 1);
        this.navigator.vibrate(10);
      } else if (this.swipeX > 0 && this.page > 0) {
        // Dragged right -> switch to previous screen
        this.page = Math.max(0, this.page - 1);
        this.navigator.vibrate(10);
      }
    }

    // Reset swipeX on gesture release
    this.swipeX = 0;
  }

  // Direct Page Navigation (3-Dot Pagination)
  setPage(targetPage) {
    const clamped = Math.max(0, Math.min(2, targetPage));
    if (this.page !== clamped) {
      this.page = clamped;
      this.navigator.vibrate(10);
    }
  }

  tapPaginationDot(dotIndex) {
    this.setPage(dotIndex);
  }

  getPaginationDots() {
    return [0, 1, 2].map(i => ({
      index: i,
      isActive: this.page === i,
      width: this.page === i ? 16 : 6, // 16px active pill vs 6px dot
      ariaLabel: `Go to screen ${i + 1}`,
      className: this.page === i ? 'w-4 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-1.5 bg-white/30'
    }));
  }

  // Multi-Page Transform Calculation
  getPageTransform(pageIndex) {
    const offsetPercent = (pageIndex - this.page) * 100;
    return `translateX(calc(${offsetPercent}% + ${this.swipeX}px))`;
  }

  getPageVisibility(pageIndex) {
    const dist = Math.abs(this.page - pageIndex);
    return {
      pointerEvents: this.page === pageIndex && this.swipeX === 0 ? 'auto' : (dist <= 1 ? 'auto' : 'none'),
      visibility: dist > 1 && this.swipeX === 0 ? 'hidden' : 'visible'
    };
  }

  // App Lifecycle & Launch
  openAppById(appId) {
    const now = Date.now();
    if (now - this.lastOpenedTime < 500) return false; // 500ms debounce
    this.lastOpenedTime = now;

    if (this.contextMenu.app) return false;

    const app = this.apps.find(a => a.id === appId);
    if (!app || this.hiddenApps.includes(appId)) return false;

    this.navigator.vibrate(10);

    if (app.type === "external" && app.url) {
      this.window.open(app.url, "_blank");
      this.drawerOpen = false;
      return true;
    }

    this.openApp = app;
    this.drawerOpen = false;
    return true;
  }

  closeApp() {
    this.closingApp = true;
    this.navigator.vibrate(10);
    this.openApp = null;
    this.closingApp = false;
  }

  // Gesture Navigation Bar
  tapHome() {
    this.closeApp();
    this.setPage(0);
    this.drawerOpen = false;
    this.notificationOpen = false;
    this.contextMenu = { app: null, position: null };
    this.navigator.vibrate(10);
  }

  // Context Menu & App Uninstall
  openContextMenu(app, position) {
    this.contextMenu = { app, position };
    this.navigator.vibrate(10);
  }

  closeContextMenu() {
    this.contextMenu = { app: null, position: null };
  }

  uninstallApp(appId) {
    if (!this.hiddenApps.includes(appId)) {
      this.hiddenApps.push(appId);
    }
    this.closeContextMenu();
  }

  // App Drawer
  openAppDrawer() {
    this.drawerOpen = true;
    this.navigator.vibrate(10);
  }

  closeAppDrawer() {
    this.drawerOpen = false;
  }

  searchAppDrawer(query) {
    const active = this.getActiveApps();
    if (!query) return active;
    return active.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
  }

  // Notifications & Quick Settings
  pullDownNotification() {
    this.notificationOpen = true;
    this.navigator.vibrate(10);
  }

  closeNotification() {
    this.notificationOpen = false;
  }

  setBrightness(val) {
    this.brightness = Math.max(20, Math.min(100, val));
  }

  // Lock Screen Simulation
  handleLockDrag(deltaY) {
    if (!this.isLocked) return;
    this.lockDragY = Math.min(0, deltaY);
  }

  unlock(swipeDeltaY = -200) {
    const unlockThreshold = -150;
    if (swipeDeltaY < unlockThreshold) {
      this.isLocked = false;
      this.lockDragY = 0;
      this.navigator.vibrate(10);
      return true;
    }
    this.lockDragY = 0;
    return false;
  }

  // Custom Icon Rendering Resolver
  resolveIconRendering(app) {
    if (app.custom_icon) {
      return {
        type: "custom_component",
        componentName: typeof app.custom_icon === 'string' ? app.custom_icon : app.custom_icon.name,
        sizeProp: "sidebar",
        showTitle: true
      };
    }
    return {
      type: "image",
      src: app.icon || "./themes/Yaru/apps/bash.png",
      fallbackSrc: "./themes/Yaru/apps/bash.png",
      showTitle: true
    };
  }

  // Device Orientation / Parallax
  handleDeviceOrientation(gamma, beta) {
    if (gamma !== null && beta !== null) {
      const x = Math.max(-25, Math.min(25, (gamma / 45) * 25));
      const normalizedBeta = beta - 45;
      const y = Math.max(-25, Math.min(25, (normalizedBeta / 45) * 25));
      this.tilt = { x: -x, y: -y };
    }
  }

  getWallpaperTransform() {
    return `scale(1.1) translate(${this.tilt.x}px, ${this.tilt.y}px)`;
  }
}

// tests/android/helpers/mock_dom.mjs
// Lightweight simulated DOM, Window, and Device Environment for Node.js test execution

export class MockWindow {
  constructor(width = 360, height = 740) {
    this.innerWidth = width;
    this.innerHeight = height;
    this.openedUrls = [];
    this.listeners = new Map();
  }

  open(url, target = "_blank") {
    this.openedUrls.push({ url, target, timestamp: Date.now() });
    return { closed: false };
  }

  addEventListener(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    if (this.listeners.has(event)) {
      const list = this.listeners.get(event).filter(h => h !== handler);
      this.listeners.set(event, list);
    }
  }

  dispatchEvent(event, data) {
    if (this.listeners.has(event)) {
      for (const handler of this.listeners.get(event)) {
        handler(data);
      }
    }
  }
}

export class MockNavigator {
  constructor() {
    this.vibrationLog = [];
  }

  vibrate(pattern) {
    this.vibrationLog.push({ pattern, timestamp: Date.now() });
    return true;
  }

  clear() {
    this.vibrationLog = [];
  }
}

export class MockElement {
  constructor(tagName = "div", id = "") {
    this.tagName = tagName;
    this.id = id;
    this.className = "";
    this.style = {};
    this.children = [];
    this.attributes = new Map();
    this.listeners = new Map();
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  getAttribute(name) {
    return this.attributes.get(name);
  }

  addEventListener(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  dispatchEvent(event, data) {
    if (this.listeners.has(event)) {
      for (const handler of this.listeners.get(event)) {
        handler(data);
      }
    }
  }
}

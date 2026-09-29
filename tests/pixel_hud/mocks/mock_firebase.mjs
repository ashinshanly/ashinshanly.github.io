// tests/pixel_hud/mocks/mock_firebase.mjs
// In-memory Firebase Realtime Database mock for PixelHUD real-time sync testing

export class MockDataSnapshot {
  constructor(key, value) {
    this._key = key;
    this._value = value !== undefined ? JSON.parse(JSON.stringify(value)) : null;
  }

  get key() {
    return this._key;
  }

  val() {
    return this._value !== null ? JSON.parse(JSON.stringify(this._value)) : null;
  }

  exists() {
    return this._value !== null && this._value !== undefined;
  }

  forEach(callback) {
    if (this._value && typeof this._value === "object" && !Array.isArray(this._value)) {
      for (const [k, v] of Object.entries(this._value)) {
        const childSnap = new MockDataSnapshot(k, v);
        const stop = callback(childSnap);
        if (stop === true) break;
      }
    }
  }
}

export class MockDatabaseReference {
  constructor(db, pathStr) {
    this.db = db;
    this.path = pathStr.replace(/^\/+/, "").replace(/\/+$/, "");
    const parts = this.path ? this.path.split("/") : [];
    this.key = parts.length > 0 ? parts[parts.length - 1] : null;
  }

  child(subPath) {
    const cleanSub = subPath.replace(/^\/+/, "").replace(/\/+$/, "");
    const newPath = this.path ? this.path + "/" + cleanSub : cleanSub;
    return new MockDatabaseReference(this.db, newPath);
  }
}

export class MockRealtimeDatabase {
  constructor() {
    this.store = {};
    this.listeners = new Map();
    this.online = true;
    this.latencyMs = 0;
  }

  setOnline(status) {
    this.online = status;
    this._triggerListeners(".info/connected", status);
  }

  ref(path = "") {
    return new MockDatabaseReference(this, path);
  }

  _getNestedValue(path) {
    if (!path) return this.store;
    const parts = path.split("/");
    let curr = this.store;
    for (const p of parts) {
      if (curr === null || typeof curr !== "object" || !(p in curr)) {
        return null;
      }
      curr = curr[p];
    }
    return curr !== undefined ? curr : null;
  }

  _setNestedValue(path, value) {
    if (!path) {
      this.store = value !== null ? JSON.parse(JSON.stringify(value)) : {};
      return;
    }
    const parts = path.split("/");
    let curr = this.store;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (!(p in curr) || typeof curr[p] !== "object" || curr[p] === null) {
        curr[p] = {};
      }
      curr = curr[p];
    }
    const last = parts[parts.length - 1];
    if (value === null) {
      delete curr[last];
    } else {
      curr[last] = JSON.parse(JSON.stringify(value));
    }
  }

  async get(ref) {
    if (!this.online) throw new Error("Firebase RTDB: Client is offline");
    const val = this._getNestedValue(ref.path);
    return new MockDataSnapshot(ref.key, val);
  }

  async set(ref, value) {
    if (!this.online) throw new Error("Firebase RTDB: Client is offline");
    this._setNestedValue(ref.path, value);
    this._notifyBatch([ref.path]);
  }

  async update(ref, values) {
    if (!this.online) throw new Error("Firebase RTDB: Client is offline");
    const basePath = ref.path ? ref.path.replace(/\/+$/, "") : "";
    const affectedPaths = [];

    for (const [key, val] of Object.entries(values)) {
      let fullPath = key;
      if (key.startsWith("/")) {
        fullPath = key.replace(/^\/+/, "");
      } else if (basePath) {
        fullPath = basePath + "/" + key;
      }
      this._setNestedValue(fullPath, val);
      affectedPaths.push(fullPath);
    }

    if (basePath) affectedPaths.push(basePath);
    this._notifyBatch(affectedPaths);
  }

  async remove(ref) {
    return this.set(ref, null);
  }

  async push(ref, value) {
    const pushKey = "-M" + Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    const childRef = ref.child(pushKey);
    if (value !== undefined) {
      await this.set(childRef, value);
    }
    return childRef;
  }

  onValue(ref, callback, errorCallback) {
    const p = ref.path;
    if (!this.listeners.has(p)) {
      this.listeners.set(p, []);
    }
    const entry = { callback, errorCallback };
    this.listeners.get(p).push(entry);

    const currentVal = this._getNestedValue(p);
    try {
      callback(new MockDataSnapshot(ref.key, currentVal));
    } catch (err) {
      if (errorCallback) errorCallback(err);
    }

    return () => this.off(ref, callback);
  }

  off(ref, callback) {
    const p = ref.path;
    if (this.listeners.has(p)) {
      if (callback) {
        const remaining = this.listeners.get(p).filter(e => e.callback !== callback);
        this.listeners.set(p, remaining);
      } else {
        this.listeners.delete(p);
      }
    }
  }

  _notifyBatch(paths) {
    const allPathsToNotify = new Set();
    for (const p of paths) {
      allPathsToNotify.add(p);
      const parts = p ? p.split("/") : [];
      let sub = "";
      for (let i = 0; i < parts.length - 1; i++) {
        sub = sub ? sub + "/" + parts[i] : parts[i];
        allPathsToNotify.add(sub);
      }
      allPathsToNotify.add("");
      for (const listenerPath of this.listeners.keys()) {
        if (listenerPath.startsWith(p + "/")) {
          allPathsToNotify.add(listenerPath);
        }
      }
    }

    for (const path of allPathsToNotify) {
      this._triggerListeners(path);
    }
  }

  _triggerListeners(path, explicitValue = undefined) {
    const list = this.listeners.get(path);
    if (list && list.length > 0) {
      const parts = path ? path.split("/") : [];
      const key = parts.length > 0 ? parts[parts.length - 1] : null;
      const val = explicitValue !== undefined ? explicitValue : this._getNestedValue(path);
      const snap = new MockDataSnapshot(key, val);
      for (const entry of list) {
        try {
          entry.callback(snap);
        } catch (err) {
          if (entry.errorCallback) entry.errorCallback(err);
        }
      }
    }
  }

  serverTimestamp() {
    return Date.now();
  }

  clear() {
    this.store = {};
    this.listeners.clear();
  }
}

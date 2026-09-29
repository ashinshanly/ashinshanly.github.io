// tests/pixel_hud/mocks/mock_canvas.mjs
// Headless Mock HTML5 Canvas 2D and DOM context for PixelHUD testing

export class MockCanvasRenderingContext2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.fillStyle = "#000000";
    this.strokeStyle = "#000000";
    this.lineWidth = 1;
    this.globalAlpha = 1.0;
    this.globalCompositeOperation = "source-over";
    this.shadowBlur = 0;
    this.shadowColor = "transparent";
    this.imageSmoothingEnabled = false;
    this.transformMatrix = [1, 0, 0, 1, 0, 0];
    this.stateStack = [];
    this.drawCalls = [];
    this.paths = [];
  }

  save() {
    this.stateStack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      globalAlpha: this.globalAlpha,
      globalCompositeOperation: this.globalCompositeOperation,
      shadowBlur: this.shadowBlur,
      shadowColor: this.shadowColor,
      imageSmoothingEnabled: this.imageSmoothingEnabled,
      transformMatrix: [...this.transformMatrix]
    });
  }

  restore() {
    if (this.stateStack.length > 0) {
      const state = this.stateStack.pop();
      Object.assign(this, state);
    }
  }

  translate(x, y) {
    this.transformMatrix[4] += x;
    this.transformMatrix[5] += y;
    this.drawCalls.push({ type: "translate", x, y });
  }

  scale(sx, sy) {
    this.transformMatrix[0] *= sx;
    this.transformMatrix[3] *= sy;
    this.drawCalls.push({ type: "scale", sx, sy });
  }

  clearRect(x, y, w, h) {
    this.drawCalls.push({ type: "clearRect", x, y, w, h });
  }

  fillRect(x, y, w, h) {
    this.drawCalls.push({
      type: "fillRect",
      x, y, w, h,
      fillStyle: this.fillStyle,
      globalAlpha: this.globalAlpha,
      shadowBlur: this.shadowBlur,
      shadowColor: this.shadowColor
    });
  }

  strokeRect(x, y, w, h) {
    this.drawCalls.push({
      type: "strokeRect",
      x, y, w, h,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth
    });
  }

  beginPath() {
    this.paths = [];
    this.drawCalls.push({ type: "beginPath" });
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
    this.paths.push({ type: "arc", x, y, radius, startAngle, endAngle });
    this.drawCalls.push({ type: "arc", x, y, radius, startAngle, endAngle });
  }

  moveTo(x, y) {
    this.paths.push({ type: "moveTo", x, y });
    this.drawCalls.push({ type: "moveTo", x, y });
  }

  lineTo(x, y) {
    this.paths.push({ type: "lineTo", x, y });
    this.drawCalls.push({ type: "lineTo", x, y });
  }

  stroke() {
    this.drawCalls.push({
      type: "stroke",
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      globalAlpha: this.globalAlpha
    });
  }

  fill() {
    this.drawCalls.push({
      type: "fill",
      fillStyle: this.fillStyle,
      globalAlpha: this.globalAlpha
    });
  }

  drawImage(image, ...args) {
    this.drawCalls.push({
      type: "drawImage",
      image,
      args
    });
  }

  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return {
      type: "radialGradient",
      x0, y0, r0, x1, y1, r1,
      colorStops: [],
      addColorStop(offset, color) {
        this.colorStops.push({ offset, color });
      }
    };
  }

  getImageData(x, y, w, h) {
    return {
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h
    };
  }

  putImageData(imageData, dx, dy) {
    this.drawCalls.push({ type: "putImageData", imageData, dx, dy });
  }

  resetCalls() {
    this.drawCalls = [];
    this.paths = [];
  }
}

export class MockCanvasElement {
  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.style = {};
    this.listeners = new Map();
    this.context = new MockCanvasRenderingContext2D(this);
    this.rect = { left: 0, top: 0, width, height, right: width, bottom: height };
  }

  getContext(type) {
    if (type === "2d") return this.context;
    return null;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  setBoundingClientRect(rect) {
    this.rect = { ...this.rect, ...rect };
    this.width = this.rect.width;
    this.height = this.rect.height;
  }

  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const list = this.listeners.get(event).filter(fn => fn !== callback);
      this.listeners.set(event, list);
    }
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    for (const fn of list) {
      fn(event);
    }
  }
}

export function createMockDOM() {
  const globalObj = typeof globalThis !== "undefined" ? globalThis : global;
  const localStorageStore = new Map();

  const mockLocalStorage = {
    getItem(key) {
      return localStorageStore.has(key) ? localStorageStore.get(key) : null;
    },
    setItem(key, value) {
      localStorageStore.set(key, String(value));
    },
    removeItem(key) {
      localStorageStore.delete(key);
    },
    clear() {
      localStorageStore.clear();
    }
  };

  const mockWindow = {
    innerWidth: 1024,
    innerHeight: 768,
    localStorage: mockLocalStorage,
    navigator: { onLine: true, userAgent: "PixelHUD-TestRunner/1.0" },
    requestAnimationFrame(cb) {
      return setTimeout(() => cb(Date.now()), 16);
    },
    cancelAnimationFrame(id) {
      clearTimeout(id);
    }
  };

  return {
    window: mockWindow,
    localStorage: mockLocalStorage,
    createCanvas: (w, h) => new MockCanvasElement(w, h)
  };
}

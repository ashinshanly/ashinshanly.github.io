// tests/pixel_hud/mocks/mock_webaudio.mjs
// Headless Web Audio API mock for harmonic synthesizer testing

export class MockAudioParam {
  constructor(defaultValue = 0) {
    this.value = defaultValue;
    this.defaultValue = defaultValue;
    this.events = [];
  }

  setValueAtTime(value, startTime) {
    this.value = value;
    this.events.push({ type: "setValueAtTime", value, startTime });
    return this;
  }

  linearRampToValueAtTime(value, endTime) {
    this.value = value;
    this.events.push({ type: "linearRampToValueAtTime", value, endTime });
    return this;
  }

  exponentialRampToValueAtTime(value, endTime) {
    this.value = value;
    this.events.push({ type: "exponentialRampToValueAtTime", value, endTime });
    return this;
  }

  setTargetAtTime(target, startTime, timeConstant) {
    this.value = target;
    this.events.push({ type: "setTargetAtTime", target, startTime, timeConstant });
    return this;
  }

  cancelScheduledValues(startTime) {
    this.events = this.events.filter(e => (e.startTime || e.endTime) < startTime);
    return this;
  }
}

export class MockAudioNode {
  constructor(context) {
    this.context = context;
    this.connections = [];
    this.numberOfInputs = 1;
    this.numberOfOutputs = 1;
  }

  connect(destination) {
    this.connections.push(destination);
    return destination;
  }

  disconnect(destination) {
    if (destination) {
      this.connections = this.connections.filter(c => c !== destination);
    } else {
      this.connections = [];
    }
  }
}

export class MockGainNode extends MockAudioNode {
  constructor(context, defaultGain = 1.0) {
    super(context);
    this.gain = new MockAudioParam(defaultGain);
  }
}

export class MockOscillatorNode extends MockAudioNode {
  constructor(context) {
    super(context);
    this.type = "sine";
    this.frequency = new MockAudioParam(440);
    this.detune = new MockAudioParam(0);
    this.started = false;
    this.stopped = false;
    this.startTime = null;
    this.stopTime = null;
    this.onended = null;
  }

  start(time = 0) {
    this.started = true;
    this.startTime = time;
  }

  stop(time = 0) {
    this.stopped = true;
    this.stopTime = time;
    if (typeof this.onended === "function") {
      setTimeout(() => this.onended({ target: this }), 0);
    }
  }
}

export class MockBiquadFilterNode extends MockAudioNode {
  constructor(context) {
    super(context);
    this.type = "lowpass";
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1);
    this.gain = new MockAudioParam(0);
  }
}

export class MockStereoPannerNode extends MockAudioNode {
  constructor(context) {
    super(context);
    this.pan = new MockAudioParam(0.0);
  }
}

export class MockAudioContext {
  constructor(options = {}) {
    this.state = options.initialState || "suspended";
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.destination = new MockAudioNode(this);
    this.createdNodes = [];
  }

  async resume() {
    this.state = "running";
    return Promise.resolve();
  }

  async suspend() {
    this.state = "suspended";
    return Promise.resolve();
  }

  async close() {
    this.state = "closed";
    return Promise.resolve();
  }

  advanceTime(seconds) {
    this.currentTime += seconds;
  }

  createGain() {
    const node = new MockGainNode(this);
    this.createdNodes.push(node);
    return node;
  }

  createOscillator() {
    const node = new MockOscillatorNode(this);
    this.createdNodes.push(node);
    return node;
  }

  createBiquadFilter() {
    const node = new MockBiquadFilterNode(this);
    this.createdNodes.push(node);
    return node;
  }

  createStereoPanner() {
    const node = new MockStereoPannerNode(this);
    this.createdNodes.push(node);
    return node;
  }
}

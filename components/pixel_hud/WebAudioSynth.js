/**
 * PixelHUD Zero-Dependency Web Audio API Harmonic Synthesizer
 * 
 * Features:
 * - 16-note C-minor pentatonic scale spanning C3 (130.81Hz) to C6 (1046.50Hz)
 * - Coordinate Y-to-pitch & X-to-stereo-pan spatial acoustic engine
 * - Color-to-timbre wave & BiquadFilter frequency modulation
 * - Click-free ADSR exponential gain envelopes
 * - Master volume & mute controls with smooth transitions
 * - Browser Autoplay Policy unlocker
 */

import { PALETTE, getColorByIndex, getColorByHex, isEraser } from './palette.js';
import { getStampById } from './stamps.js';

// 16-note C-minor pentatonic frequencies (C3 to C6)
export const C_MINOR_PENTATONIC_SCALE = [
  // Octave 3 (C3, Eb3, F3, G3, Bb3)
  { note: 'C3',  freq: 130.81, midi: 48 },
  { note: 'Eb3', freq: 155.56, midi: 51 },
  { note: 'F3',  freq: 174.61, midi: 53 },
  { note: 'G3',  freq: 196.00, midi: 55 },
  { note: 'Bb3', freq: 233.08, midi: 58 },

  // Octave 4 (C4, Eb4, F4, G4, Bb4)
  { note: 'C4',  freq: 261.63, midi: 60 },
  { note: 'Eb4', freq: 311.13, midi: 63 },
  { note: 'F4',  freq: 349.23, midi: 65 },
  { note: 'G4',  freq: 392.00, midi: 67 },
  { note: 'Bb4', freq: 466.16, midi: 70 },

  // Octave 5 (C5, Eb5, F5, G5, Bb5)
  { note: 'C5',  freq: 523.25, midi: 72 },
  { note: 'Eb5', freq: 622.25, midi: 75 },
  { note: 'F5',  freq: 698.46, midi: 77 },
  { note: 'G5',  freq: 783.99, midi: 79 },
  { note: 'Bb5', freq: 932.33, midi: 82 },

  // Octave 6 (C6)
  { note: 'C6',  freq: 1046.50, midi: 84 }
];

export class WebAudioSynth {
  constructor(options = {}) {
    this.audioCtx = null;
    this.masterGain = null;
    this.limiter = null;
    this.unlocked = false;
    this.muted = options.muted ?? false;
    this.volume = typeof options.volume === 'number' ? Math.max(0, Math.min(1, options.volume)) : 0.35;
    this.maxPolyphony = options.maxPolyphony || 16;
    this.activeVoices = 0;

    // Polyphony limiter tracking
    this.lastPlayTime = 0;
    this.minNoteInterval = 0.015; // 15ms throttle to prevent audio buffer congestion

    // Bind event handlers for browser unlock
    this._handleFirstGesture = this._handleFirstGesture.bind(this);
    if (typeof window !== 'undefined') {
      window.addEventListener('pointerdown', this._handleFirstGesture, { once: true, passive: true });
      window.addEventListener('keydown', this._handleFirstGesture, { once: true, passive: true });
    }
  }

  /**
   * Initialize AudioContext and Master Audio Bus
   */
  _ensureContext() {
    if (typeof window === 'undefined') return false;

    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) return false;

      this.audioCtx = new AudioCtxClass();

      // Master gain node
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.muted ? 0 : this.volume,
        this.audioCtx.currentTime
      );

      // Dynamics compressor / limiter to prevent clipping
      this.limiter = this.audioCtx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-3, this.audioCtx.currentTime);
      this.limiter.knee.setValueAtTime(6, this.audioCtx.currentTime);
      this.limiter.ratio.setValueAtTime(8, this.audioCtx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
      this.limiter.release.setValueAtTime(0.1, this.audioCtx.currentTime);

      this.masterGain.connect(this.limiter);
      this.limiter.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return true;
  }

  _handleFirstGesture() {
    this.unlock();
  }

  /**
   * Unlock Web Audio API context from user gesture
   */
  unlock() {
    if (!this._ensureContext()) return false;
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().then(() => {
        this.unlocked = true;
      }).catch(() => {});
    } else {
      this.unlocked = true;
    }
    return this.unlocked;
  }

  /**
   * Toggle or set mute state
   * @param {boolean} isMuted 
   */
  setMuted(isMuted) {
    this.muted = !!isMuted;
    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        now,
        0.02
      );
    }
  }

  isMuted() {
    return this.muted;
  }

  /**
   * Set master volume (0.0 to 1.0)
   * @param {number} vol 
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, Number(vol) || 0));
    if (this.masterGain && this.audioCtx && !this.muted) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.volume, now, 0.02);
    }
  }

  getVolume() {
    return this.volume;
  }

  /**
   * Map Y-coordinate (0-63) to C-minor pentatonic note frequency
   * Y=0 (top) is highest pitch, Y=63 (bottom) is lowest pitch.
   * @param {number} gy - Grid Y coordinate (0-63)
   * @returns {{note: string, freq: number, midi: number}}
   */
  mapYToFrequency(gy) {
    const safeY = Math.max(0, Math.min(63, Math.floor(Number(gy) || 0)));
    // Invert Y so top (0) = index 15 (high), bottom (63) = index 0 (low)
    const scaleIndex = Math.max(0, Math.min(15, Math.floor(((63 - safeY) / 64) * 16)));
    return C_MINOR_PENTATONIC_SCALE[scaleIndex];
  }

  /**
   * Map X-coordinate (0-63) to Stereo Pan value (-0.9 to +0.9)
   * @param {number} gx - Grid X coordinate (0-63)
   * @returns {number} pan (-0.9 to 0.9)
   */
  mapXToPan(gx) {
    const safeX = Math.max(0, Math.min(63, Number(gx) || 0));
    return (safeX / 63) * 1.8 - 0.9;
  }

  /**
   * Play a single harmonic pixel tone with spatial pan and color timbre
   * @param {number} gx - Grid X (0-63)
   * @param {number} gy - Grid Y (0-63)
   * @param {string|number|object} [colorDef] - Color index, hex, or color object
   */
  playPixelNote(gx, gy, colorDef) {
    if (this.muted || !this._ensureContext()) return;

    // Check eraser mode
    if (isEraser(colorDef)) {
      this.playEraserSound(gx, gy);
      return;
    }

    const now = this.audioCtx.currentTime;
    if (now - this.lastPlayTime < this.minNoteInterval) return;
    this.lastPlayTime = now;

    const noteInfo = this.mapYToFrequency(gy);
    const panValue = this.mapXToPan(gx);

    // Resolve color timbre parameters
    let colorObj = PALETTE[0];
    if (typeof colorDef === 'number') {
      colorObj = getColorByIndex(colorDef);
    } else if (typeof colorDef === 'string') {
      colorObj = getColorByHex(colorDef);
    } else if (colorDef && typeof colorDef === 'object') {
      colorObj = colorDef;
    }

    const waveType = colorObj.waveType || 'triangle';
    const filterCutoff = colorObj.filterCutoff || 2400;
    const resonance = colorObj.harmonicResonance || 3.0;

    this._synthesizeTone({
      freq: noteInfo.freq,
      pan: panValue,
      waveType,
      filterCutoff,
      resonance,
      attack: 0.01,
      decay: 0.06,
      sustain: 0.25,
      release: 0.22,
      gainLevel: 0.45
    });
  }

  /**
   * Play a rapid, pleasant multi-note cyber arpeggio for stamp drop
   * @param {number} gx - Center grid X
   * @param {number} gy - Center grid Y
   * @param {string} stampId - Stamp ID
   */
  playStampChime(gx, gy, stampId) {
    if (this.muted || !this._ensureContext()) return;

    const stamp = getStampById(stampId);
    const intervals = stamp?.audioChime || [0, 4, 7, 11];
    const baseNote = this.mapYToFrequency(gy);
    const basePan = this.mapXToPan(gx);

    intervals.forEach((interval, i) => {
      const noteOffset = (baseNote.midi - 48 + interval) % 16;
      const targetNote = C_MINOR_PENTATONIC_SCALE[noteOffset] || baseNote;
      const delay = i * 0.045; // 45ms arpeggio stagger

      setTimeout(() => {
        if (!this.audioCtx || this.muted) return;
        this._synthesizeTone({
          freq: targetNote.freq,
          pan: Math.max(-0.9, Math.min(0.9, basePan + (i - 1.5) * 0.15)),
          waveType: 'sine',
          filterCutoff: 3800,
          resonance: 4.0,
          attack: 0.008,
          decay: 0.05,
          sustain: 0.2,
          release: 0.28,
          gainLevel: 0.35
        });
      }, delay * 1000);
    });
  }

  /**
   * Play a deep resonant sub-bass pulse sweep for live shockwave broadcast
   * @param {number} gx 
   * @param {number} gy 
   */
  playShockwaveTone(gx, gy) {
    if (this.muted || !this._ensureContext()) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();

    const pan = this.mapXToPan(gx);
    const panner = this._createPannerNode(pan);

    // Deep sub-bass pitch glide
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.55);

    // Resonant lowpass sweep
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);
    filter.Q.setValueAtTime(4, now);

    // Click-free exponential envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      gain.connect(this.masterGain);
    }

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Play soft micro-chirp when cursor hovers over painted mark
   * @param {number} gx 
   * @param {number} gy 
   */
  playHoverChirp(gx, gy) {
    if (this.muted || !this._ensureContext()) return;

    const now = this.audioCtx.currentTime;
    if (now - this.lastPlayTime < 0.04) return;
    this.lastPlayTime = now;

    const noteInfo = this.mapYToFrequency(gy);
    const pan = this.mapXToPan(gx);

    this._synthesizeTone({
      freq: noteInfo.freq * 1.5,
      pan,
      waveType: 'sine',
      filterCutoff: 4000,
      resonance: 1,
      attack: 0.005,
      decay: 0.02,
      sustain: 0.05,
      release: 0.04,
      gainLevel: 0.12
    });
  }

  /**
   * Play soft white-noise/filtered swoosh for eraser mark
   * @param {number} gx 
   * @param {number} gy 
   */
  playEraserSound(gx, gy) {
    if (this.muted || !this._ensureContext()) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const filter = this.audioCtx.createBiquadFilter();
    const gain = this.audioCtx.createGain();
    const pan = this.mapXToPan(gx);
    const panner = this._createPannerNode(pan);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(1.5, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    if (panner) {
      gain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      gain.connect(this.masterGain);
    }

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Play soft acoustic lock/rejection cue when interacting with protected tile
   * @param {number} gx 
   * @param {number} gy 
   */
  playProtectedAlert(gx = 32, gy = 32) {
    if (this.muted || !this._ensureContext()) return;
    this._synthesizeTone({
      freq: 110,
      pan: this.mapXToPan(gx),
      waveType: 'sine',
      filterType: 'lowpass',
      filterFreq: 350,
      attack: 0.005,
      decay: 0.08,
      sustain: 0.0,
      release: 0.06,
      gainLevel: 0.2
    });
  }

  /**
   * Play laser drop / rewind acoustic cue for undo
   */
  playLaserDrop(gx = 32, gy = 32) {
    if (this.muted || !this._ensureContext()) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (_) {}
      };
    } catch (_) {}
  }

  /**
   * Play laser rise / advance acoustic cue for redo
   */
  playLaserRise(gx = 32, gy = 32) {
    if (this.muted || !this._ensureContext()) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (_) {}
      };
    } catch (_) {}
  }

  /**
   * Internal tone synthesis helper with ADSR envelope & filter modulation
   */
  _synthesizeTone({
    freq,
    pan = 0,
    waveType = 'sine',
    filterCutoff = 2500,
    resonance = 3.0,
    attack = 0.01,
    decay = 0.06,
    sustain = 0.25,
    release = 0.2,
    gainLevel = 0.4
  }) {
    if (!this.audioCtx || !this.masterGain) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const filter = this.audioCtx.createBiquadFilter();
      const envGain = this.audioCtx.createGain();
      const panner = this._createPannerNode(pan);

      // Oscillator config
      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, now);

      // Filter modulation config
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterCutoff, now);
      filter.Q.setValueAtTime(resonance, now);

      // Click-free exponential ADSR envelope
      const attackEnd = now + attack;
      const decayEnd = attackEnd + decay;
      const noteEnd = decayEnd + release;

      envGain.gain.setValueAtTime(0.0001, now);
      envGain.gain.exponentialRampToValueAtTime(gainLevel, attackEnd);
      envGain.gain.exponentialRampToValueAtTime(gainLevel * sustain, decayEnd);
      envGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

      // Connect pipeline: Osc -> Filter -> Envelope -> Panner -> Master
      osc.connect(filter);
      filter.connect(envGain);

      if (panner) {
        envGain.connect(panner);
        panner.connect(this.masterGain);
      } else {
        envGain.connect(this.masterGain);
      }

      osc.start(now);
      osc.stop(noteEnd + 0.05);

      // Clean up nodes after playback
      osc.onended = () => {
        try {
          osc.disconnect();
          filter.disconnect();
          envGain.disconnect();
          if (panner) panner.disconnect();
        } catch (_) {}
      };
    } catch (e) {
      // Graceful error handling for audio edge cases
    }
  }

  /**
   * Create stereo panner node with cross-browser compatibility
   */
  _createPannerNode(panValue) {
    if (!this.audioCtx) return null;
    const clampedPan = Math.max(-1, Math.min(1, panValue));

    if (this.audioCtx.createStereoPanner) {
      const panner = this.audioCtx.createStereoPanner();
      panner.pan.setValueAtTime(clampedPan, this.audioCtx.currentTime);
      return panner;
    }
    return null;
  }

  /**
   * Safely destroy audio context and remove window listeners
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerdown', this._handleFirstGesture);
      window.removeEventListener('keydown', this._handleFirstGesture);
    }

    if (this.audioCtx) {
      try {
        if (this.masterGain) this.masterGain.disconnect();
        if (this.limiter) this.limiter.disconnect();
        this.audioCtx.close().catch(() => {});
      } catch (_) {}
      this.audioCtx = null;
    }
  }
}

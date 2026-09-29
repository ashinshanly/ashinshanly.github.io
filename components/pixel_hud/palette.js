/**
 * PixelHUD Cyber Neon Palette & Audio-Visual Color System
 * 
 * Defines the 8-color cyberpunk neon palette, Void Eraser, RGB definitions,
 * bloom glow styles, frequency/timbre mappings, and color conversion utilities.
 */

export const PALETTE = [
  {
    id: 'cyber-green',
    name: 'Cyber Green',
    hex: '#00ff66',
    rgb: { r: 0, g: 255, b: 102 },
    glow: 'rgba(0, 255, 102, 0.7)',
    glowSpread: '0 0 10px rgba(0, 255, 102, 0.7), 0 0 20px rgba(0, 255, 102, 0.4)',
    filterCutoff: 2400,
    harmonicResonance: 3.5,
    waveType: 'sine',
    freqLabel: '2.40 kHz',
    isEraser: false,
    index: 0
  },
  {
    id: 'electric-cyan',
    name: 'Electric Cyan',
    hex: '#00f0ff',
    rgb: { r: 0, g: 240, b: 255 },
    glow: 'rgba(0, 240, 255, 0.75)',
    glowSpread: '0 0 10px rgba(0, 240, 255, 0.75), 0 0 20px rgba(0, 240, 255, 0.45)',
    filterCutoff: 3200,
    harmonicResonance: 4.2,
    waveType: 'triangle',
    freqLabel: '3.20 kHz',
    isEraser: false,
    index: 1
  },
  {
    id: 'neon-pink',
    name: 'Neon Pink',
    hex: '#ff007f',
    rgb: { r: 255, g: 0, b: 127 },
    glow: 'rgba(255, 0, 127, 0.75)',
    glowSpread: '0 0 10px rgba(255, 0, 127, 0.75), 0 0 20px rgba(255, 0, 127, 0.45)',
    filterCutoff: 1800,
    harmonicResonance: 5.0,
    waveType: 'sawtooth',
    freqLabel: '1.80 kHz',
    isEraser: false,
    index: 2
  },
  {
    id: 'laser-yellow',
    name: 'Laser Yellow',
    hex: '#ffe600',
    rgb: { r: 255, g: 230, b: 0 },
    glow: 'rgba(255, 230, 0, 0.75)',
    glowSpread: '0 0 10px rgba(255, 230, 0, 0.75), 0 0 20px rgba(255, 230, 0, 0.45)',
    filterCutoff: 4000,
    harmonicResonance: 2.8,
    waveType: 'triangle',
    freqLabel: '4.00 kHz',
    isEraser: false,
    index: 3
  },
  {
    id: 'plasma-purple',
    name: 'Plasma Purple',
    hex: '#bf00ff',
    rgb: { r: 191, g: 0, b: 255 },
    glow: 'rgba(191, 0, 255, 0.75)',
    glowSpread: '0 0 10px rgba(191, 0, 255, 0.75), 0 0 20px rgba(191, 0, 255, 0.45)',
    filterCutoff: 1400,
    harmonicResonance: 6.0,
    waveType: 'square',
    freqLabel: '1.40 kHz',
    isEraser: false,
    index: 4
  },
  {
    id: 'solar-orange',
    name: 'Solar Orange',
    hex: '#ff6600',
    rgb: { r: 255, g: 102, b: 0 },
    glow: 'rgba(255, 102, 0, 0.75)',
    glowSpread: '0 0 10px rgba(255, 102, 0, 0.75), 0 0 20px rgba(255, 102, 0, 0.45)',
    filterCutoff: 2100,
    harmonicResonance: 4.0,
    waveType: 'sawtooth',
    freqLabel: '2.10 kHz',
    isEraser: false,
    index: 5
  },
  {
    id: 'glitch-white',
    name: 'Glitch White',
    hex: '#e0ffff',
    rgb: { r: 224, g: 255, b: 255 },
    glow: 'rgba(224, 255, 255, 0.85)',
    glowSpread: '0 0 12px rgba(224, 255, 255, 0.85), 0 0 24px rgba(224, 255, 255, 0.5)',
    filterCutoff: 4800,
    harmonicResonance: 1.5,
    waveType: 'sine',
    freqLabel: '4.80 kHz',
    isEraser: false,
    index: 6
  },
  {
    id: 'cyber-red',
    name: 'Cyber Crimson',
    hex: '#ff1744',
    rgb: { r: 255, g: 23, b: 68 },
    glow: 'rgba(255, 23, 68, 0.75)',
    glowSpread: '0 0 10px rgba(255, 23, 68, 0.75), 0 0 20px rgba(255, 23, 68, 0.45)',
    filterCutoff: 1200,
    harmonicResonance: 5.5,
    waveType: 'sawtooth',
    freqLabel: '1.20 kHz',
    isEraser: false,
    index: 7
  }
];

export const VOID_ERASER = {
  id: 'void-eraser',
  name: 'Void Eraser',
  hex: '#0a0e17',
  rgb: { r: 10, g: 14, b: 23 },
  glow: 'rgba(255, 255, 255, 0.2)',
  glowSpread: '0 0 6px rgba(255, 255, 255, 0.2)',
  filterCutoff: 600,
  harmonicResonance: 1.0,
  waveType: 'sine',
  freqLabel: '0.60 kHz',
  isEraser: true,
  index: -1
};

export const COLOR_MAP = PALETTE.reduce((acc, color) => {
  acc[color.id] = color;
  acc[color.hex.toLowerCase()] = color;
  return acc;
}, {
  'void-eraser': VOID_ERASER,
  '#0a0e17': VOID_ERASER,
  'eraser': VOID_ERASER
});

/**
 * Get color definition by id
 * @param {string} id
 * @returns {object}
 */
export function getColorById(id) {
  if (!id) return PALETTE[0];
  if (id === 'void-eraser' || id === 'eraser') return VOID_ERASER;
  return COLOR_MAP[id] || PALETTE[0];
}

/**
 * Get color definition by numeric index (0 to 7)
 * @param {number} index
 * @returns {object}
 */
export function getColorByIndex(index) {
  if (index === -1 || index === VOID_ERASER.index) return VOID_ERASER;
  const safeIndex = Math.abs(Number(index) || 0) % PALETTE.length;
  return PALETTE[safeIndex] || PALETTE[0];
}

/**
 * Get color definition by hex code
 * @param {string} hex
 * @returns {object}
 */
export function getColorByHex(hex) {
  if (!hex) return PALETTE[0];
  const normalized = hex.toLowerCase().trim();
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];
  if (normalized === '#000000' || normalized === '#0a0e17' || normalized === 'transparent') {
    return VOID_ERASER;
  }
  return PALETTE.find(c => c.hex.toLowerCase() === normalized) || PALETTE[0];
}

/**
 * Check if a color object or color id is the eraser
 * @param {object|string} colorOrId
 * @returns {boolean}
 */
export function isEraser(colorOrId) {
  if (!colorOrId) return false;
  if (typeof colorOrId === 'string') {
    return colorOrId === 'void-eraser' || colorOrId === 'eraser' || colorOrId.toLowerCase() === VOID_ERASER.hex;
  }
  return colorOrId.isEraser === true || colorOrId.id === 'void-eraser';
}

/**
 * Convert Hex color string to RGB object
 * @param {string} hex
 * @returns {{r: number, g: number, b: number}}
 */
export function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Convert RGB values to Hex string
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = v => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Format RGBA color string with alpha channel
 * @param {string|object} color
 * @param {number} alpha (0 to 1)
 * @returns {string}
 */
export function getRgbaString(color, alpha = 1) {
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  if (typeof color === 'object' && color.rgb) {
    return `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${safeAlpha})`;
  }
  const rgb = typeof color === 'string' ? hexToRgb(color) : { r: 0, g: 0, b: 0 };
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${safeAlpha})`;
}

/**
 * Get CSS box shadow string for a color
 * @param {object|string} color
 * @returns {string}
 */
export function getGlowStyle(color) {
  const c = typeof color === 'string' ? getColorByHex(color) : color;
  return c?.glowSpread || '0 0 10px rgba(0, 240, 255, 0.6)';
}

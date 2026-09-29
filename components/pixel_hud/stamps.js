/**
 * PixelHUD Retro Cyber Stamps Library
 * 
 * 5 iconic 8x8 retro cyberpunk stamps with binary bitmaps,
 * metadata, audio chime profiles, and stamp placement utilities.
 */

export const STAMPS = [
  {
    id: 'space_invader',
    name: 'Space Invader',
    category: 'Retro Arcade',
    icon: '👾',
    description: 'Mini arcade invader sprite',
    width: 5,
    height: 5,
    audioChime: [0, 4, 7, 11],
    matrix: [
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0]
    ]
  },
  {
    id: 'heart',
    name: '8-Bit Heart',
    category: 'Cyber Love',
    icon: '💖',
    description: 'Compact pixel heart symbol',
    width: 5,
    height: 5,
    audioChime: [2, 5, 9, 12],
    matrix: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0]
    ]
  },
  {
    id: 'cyber_skull',
    name: 'Cyber Skull',
    category: 'Cyberpunk',
    icon: '💀',
    description: 'Mini cyber skull mark',
    width: 5,
    height: 5,
    audioChime: [0, 3, 6, 9],
    matrix: [
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0]
    ]
  },
  {
    id: 'tux_penguin',
    name: 'Tux Penguin',
    category: 'Open Source',
    icon: '🐧',
    description: 'Mini Linux penguin',
    width: 5,
    height: 5,
    audioChime: [0, 5, 7, 12],
    matrix: [
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [0, 1, 0, 1, 0]
    ]
  },
  {
    id: 'matrix_glyph',
    name: 'Lightning Bolt',
    category: 'Cyber Energy',
    icon: '⚡',
    description: 'Mini electric lightning rune',
    width: 5,
    height: 5,
    audioChime: [4, 7, 11, 14],
    matrix: [
      [0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0]
    ]
  }
];

export const STAMP_MAP = STAMPS.reduce((acc, stamp) => {
  acc[stamp.id] = stamp;
  return acc;
}, {});

/**
 * Get stamp by ID
 * @param {string} id
 * @returns {object|null}
 */
export function getStampById(id) {
  if (!id) return STAMPS[0];
  return STAMP_MAP[id] || STAMPS[0];
}

/**
 * Calculate list of target grid pixels for a stamp placement,
 * centering around (centerX, centerY) and clipping to 64x64 bounds.
 * 
 * @param {string|object} stampOrId 
 * @param {number} centerX - Center grid X (0-63)
 * @param {number} centerY - Center grid Y (0-63)
 * @param {string} color - Hex color
 * @param {string} [author='@guest']
 * @param {string} [message='']
 * @returns {Array<{x: number, y: number, color: string, author: string, message: string, timestamp: number}>}
 */
export function getStampPixels(stampOrId, centerX, centerY, color = '#00f0ff', author = '@guest', message = '') {
  const stamp = typeof stampOrId === 'string' ? getStampById(stampOrId) : stampOrId;
  if (!stamp || !stamp.matrix) return [];

  const halfW = Math.floor(stamp.width / 2);
  const halfH = Math.floor(stamp.height / 2);
  const startX = centerX - halfW;
  const startY = centerY - halfH;
  const pixels = [];
  const now = Date.now();

  for (let r = 0; r < stamp.height; r++) {
    for (let c = 0; c < stamp.width; c++) {
      if (stamp.matrix[r][c] === 1) {
        const gx = startX + c;
        const gy = startY + r;
        if (gx >= 0 && gx < 64 && gy >= 0 && gy < 64) {
          pixels.push({
            x: gx,
            y: gy,
            color,
            author: author || '@guest',
            message: message || '',
            timestamp: now
          });
        }
      }
    }
  }

  return pixels;
}

/**
 * Render an 8x8 stamp preview into a 2D canvas context
 * @param {object|string} stampOrId 
 * @param {HTMLCanvasElement} canvas 
 * @param {string} color 
 * @param {number} [padding=2]
 */
export function renderStampPreviewToCanvas(stampOrId, canvas, color = '#00f0ff', padding = 2) {
  if (!canvas) return;
  const stamp = typeof stampOrId === 'string' ? getStampById(stampOrId) : stampOrId;
  if (!stamp || !stamp.matrix) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const availableW = w - (padding * 2);
  const availableH = h - (padding * 2);
  const cellSize = Math.floor(Math.min(availableW / stamp.width, availableH / stamp.height));
  const offsetX = Math.floor((w - (cellSize * stamp.width)) / 2);
  const offsetY = Math.floor((h - (cellSize * stamp.height)) / 2);

  ctx.fillStyle = color;
  for (let r = 0; r < stamp.height; r++) {
    for (let c = 0; c < stamp.width; c++) {
      if (stamp.matrix[r][c] === 1) {
        ctx.fillRect(
          offsetX + c * cellSize,
          offsetY + r * cellSize,
          cellSize - 1,
          cellSize - 1
        );
      }
    }
  }
}

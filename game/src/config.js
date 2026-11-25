// Satu Api, 12 Pesanan — tuning, recipes, palette, layout.
// The player is the fire: three burners, three pans, one 180-second shift.

export const VIEW = { w: 1280, h: 800 };

export const SHIFT_SECONDS = 180;
export const WIN_SERVE_TARGET = 12;
export const MAX_WALKOUTS = 3;
export const MAX_ORDERS = 3;
export const PASS_SLOTS = 3;

export const PALETTE = {
  wallTop: '#16323a',
  wallBottom: '#0d1d22',
  floor: '#1a2c2e',
  counter: '#a8542f',
  counterDark: '#7c3a20',
  counterLight: '#d97a45',
  steel: '#3d4a4d',
  steelLight: '#6b7d80',
  cream: '#f7ead0',
  creamDim: '#d9c9a8',
  ink: '#241a12',
  amber: '#ffb347',
  flame: '#ff7b2f',
  flameCore: '#ffe9a8',
  ready: '#7fd08a',
  danger: '#ff5a4e',
  gold: '#f2c14e',
  ticket: '#f5ead2',
  ticketEdge: '#c9b285',
};

export const INGREDIENTS = [
  { id: 'telur', name: 'TELUR', color: '#f6d47c', dark: '#c9a24a' },
  { id: 'ayam', name: 'AYAM', color: '#e08a5a', dark: '#a85a34' },
  { id: 'sayur', name: 'SAYUR', color: '#7fc76a', dark: '#4d8a3e' },
  { id: 'nasi', name: 'NASI', color: '#f2ead8', dark: '#cbbd97' },
  { id: 'bumbu', name: 'BUMBU', color: '#c65b4e', dark: '#8a352c' },
];

// heat: the ideal flame level (0-3). cook: seconds at ideal heat.
export const RECIPES = [
  {
    id: 'dadar', name: 'Telur Dadar', needs: ['telur', 'bumbu'],
    heat: 1, cook: 8, coins: 20, color: '#f2c14e', dark: '#b98a2e',
    blurb: 'Api kecil, cepat matang',
  },
  {
    id: 'nasgor', name: 'Nasi Goreng', needs: ['nasi', 'telur', 'sayur'],
    heat: 2, cook: 12, coins: 30, color: '#e8a34c', dark: '#a86a28',
    blurb: 'Api sedang, aduk terus',
  },
  {
    id: 'ayamgor', name: 'Ayam Goreng', needs: ['ayam', 'bumbu'],
    heat: 3, cook: 16, coins: 40, color: '#c96f3a', dark: '#8a4522',
    blurb: 'Api besar, sabar menunggu',
  },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

export function ingredientById(id) {
  return INGREDIENTS.find((g) => g.id === id) || null;
}

// Find the recipe whose ingredient set exactly matches the pan, or null.
export function recipeForIngredients(ids) {
  const have = [...ids].sort().join(',');
  return RECIPES.find((r) => [...r.needs].sort().join(',') === have) || null;
}

// Could these ingredients still become a recipe (no wrong ingredient yet)?
export function canStillMatch(ids) {
  if (ids.length === 0) return true;
  return RECIPES.some((r) => ids.every((i) => r.needs.includes(i)));
}

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 64 },
  tickets: [
    { x: 24, y: 72, w: 300, h: 124 },
    { x: 352, y: 72, w: 300, h: 124 },
    { x: 680, y: 72, w: 300, h: 124 },
  ],
  nextBox: { x: 1008, y: 72, w: 248, h: 124 },
  burners: [
    { cx: 220, panY: 340, panR: 92 },
    { cx: 640, panY: 340, panR: 92 },
    { cx: 1060, panY: 340, panR: 92 },
  ],
  flameBtn: { w: 46, h: 34, dy: 158 },
  pass: { x: 400, y: 556, w: 480, h: 58, slotW: 150, gap: 15 },
  bins: { y: 632, h: 136, w: 190, gap: 18, x0: 129 },
  playBtn: { x: 490, y: 588, w: 300, h: 64 },
  restartBtn: { x: 490, y: 596, w: 300, h: 60 },
};

export function binRect(i) {
  const b = LAYOUT.bins;
  return { x: b.x0 + i * (b.w + b.gap), y: b.y, w: b.w, h: b.h };
}

export function passSlotRect(i) {
  const p = LAYOUT.pass;
  return { x: p.x + i * (p.slotW + p.gap), y: p.y, w: p.slotW, h: p.h };
}

export function flameBtnRect(burnerIndex, dir) {
  const b = LAYOUT.burners[burnerIndex];
  const f = LAYOUT.flameBtn;
  const cx = b.cx + (dir < 0 ? -72 : 72) - f.w / 2;
  return { x: cx, y: b.panY + f.dy, w: f.w, h: f.h };
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function pointInCircle(px, py, cx, cy, rad) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= rad * rad;
}

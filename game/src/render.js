// Satu Api, 12 Pesanan — every pixel the judge sees.
// Warm night-warung palette, 2.5D depth: soft pan shadows, lit counter
// edges, flame glow, drifting steam. Nothing here loads a file.

import {
  VIEW, PALETTE, INGREDIENTS, RECIPES, LAYOUT,
  recipeById, ingredientById, binRect, passSlotRect, flameBtnRect,
} from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = weight + ' ' + size + 'px Verdana, sans-serif';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function ingredientIcon(ctx, id, cx, cy, r) {
  const g = ingredientById(id);
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'telur') {
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.8, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g.dark;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.15, r * 0.4, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.ellipse(-r * 0.15, -r * 0.1, r * 0.85, r * 0.7, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath();
    ctx.ellipse(r * 0.55, r * 0.5, r * 0.28, r * 0.5, 0.7, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.55, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = g.dark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, r * 0.35);
    ctx.quadraticCurveTo(0, -r * 0.4, r * 0.7, -r * 0.35);
    ctx.stroke();
  } else if (id === 'nasi') {
    ctx.fillStyle = '#e8e0cc';
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.1, r * 0.8, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g.dark;
    ctx.fillRect(-r * 0.5, -r * 0.35, r * 0.2, r * 0.12);
    ctx.fillRect(r * 0.1, -r * 0.5, r * 0.2, r * 0.12);
  } else {
    ctx.fillStyle = g.color;
    rr(ctx, -r * 0.55, -r * 0.7, r * 1.1, r * 1.4, r * 0.25);
    ctx.fill();
    ctx.fillStyle = '#f2ead8';
    rr(ctx, -r * 0.55, -r * 0.7, r * 1.1, r * 0.35, r * 0.2);
    ctx.fill();
    ctx.fillStyle = g.dark;
    ctx.font = 'bold ' + Math.round(r * 0.7) + 'px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('~', 0, r * 0.25);
  }
  ctx.restore();
}

function dishDrawing(ctx, recipeId, cx, cy, r, burnt) {
  const recipe = recipeById(recipeId);
  ctx.save();
  ctx.translate(cx, cy);
  if (burnt) {
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.85, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, -r * 0.1, r * 0.4, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  if (recipeId === 'dadar') {
    ctx.fillStyle = recipe.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = recipe.dark;
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.1, r * 0.12, 0, Math.PI * 2);
    ctx.arc(r * 0.25, r * 0.12, r * 0.1, 0, Math.PI * 2);
    ctx.arc(r * 0.05, -r * 0.28, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (recipeId === 'nasgor') {
    ctx.fillStyle = recipe.color;
    ctx.beginPath();
    ctx.ellipse(0, r * 0.1, r * 0.85, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7fc76a';
    ctx.fillRect(-r * 0.5, -r * 0.25, r * 0.22, r * 0.14);
    ctx.fillRect(r * 0.15, -r * 0.35, r * 0.22, r * 0.14);
    ctx.fillStyle = '#f6d47c';
    ctx.fillRect(-r * 0.1, -r * 0.05, r * 0.24, r * 0.14);
    ctx.fillStyle = '#c65b4e';
    ctx.fillRect(r * 0.4, r * 0.05, r * 0.2, r * 0.12);
  } else {
    ctx.fillStyle = recipe.color;
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.05, r * 0.55, r * 0.42, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(r * 0.3, r * 0.15, r * 0.5, r * 0.38, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = recipe.dark;
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.2, r * 0.1, 0, Math.PI * 2);
    ctx.arc(r * 0.35, 0, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBackground(ctx, world, t) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW.h);
  g.addColorStop(0, PALETTE.wallTop);
  g.addColorStop(0.55, PALETTE.wallBottom);
  g.addColorStop(0.551, PALETTE.floor);
  g.addColorStop(1, '#0a1518');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  // Hanging lamps: warm pools of light over the burners.
  for (let i = 0; i < 3; i++) {
    const cx = 220 + i * 420;
    const glow = ctx.createRadialGradient(cx, 120, 10, cx, 120, 190);
    glow.addColorStop(0, 'rgba(255, 190, 90, 0.20)');
    glow.addColorStop(1, 'rgba(255, 190, 90, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - 190, 0, 380, 320);
    ctx.strokeStyle = '#2c3a3c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, 84);
    ctx.stroke();
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.arc(cx, 96, 12 + Math.sin(t * 2 + i) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Back counter shelf, a thin ledge under the order board — only while
  // playing, so it never cuts across the title or end-screen lettering.
  if (world.screen === 'playing') {
    ctx.fillStyle = PALETTE.counterDark;
    rr(ctx, 24, 204, 1232, 14, 6);
    ctx.fill();
  }
}

function drawTopBar(ctx, world) {
  ctx.fillStyle = 'rgba(8, 18, 20, 0.85)';
  ctx.fillRect(0, 0, VIEW.w, 64);
  ctx.fillStyle = PALETTE.amber;
  ctx.fillRect(0, 64, VIEW.w, 3);
  text(ctx, 'SATU API', 24, 24, 26, PALETTE.cream, 'left');
  text(ctx, '12 PESANAN', 24, 50, 13, PALETTE.amber, 'left');
  const urgent = world.timeLeft <= 30 && world.screen === 'playing';
  text(ctx, fmtTime(world.timeLeft), 640, 32, 40, urgent ? PALETTE.danger : PALETTE.cream);
  text(ctx, 'SHIFT', 640, 56, 11, PALETTE.creamDim);
  text(ctx, 'KOIN ' + world.coins, 1060, 22, 22, PALETTE.gold, 'right');
  text(ctx, 'TERSAJI ' + world.served + '/' + 12, 1060, 48, 16, PALETTE.creamDim, 'right');
  if (world.rush) {
    ctx.fillStyle = PALETTE.danger;
    rr(ctx, 1120, 14, 136, 36, 8);
    ctx.fill();
    text(ctx, 'RUSH!', 1188, 33, 18, '#ffffff');
  }
}

function drawTicket(ctx, order, rect) {
  const recipe = recipeById(order.recipeId);
  const frac = Math.max(0, order.patience / order.patienceMax);
  ctx.save();
  ctx.fillStyle = PALETTE.ticket;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.ticketEdge;
  ctx.fillRect(rect.x, rect.y + rect.h - 8, rect.w, 8);
  ctx.fillStyle = recipe.color;
  rr(ctx, rect.x + 12, rect.y + 12, 52, 52, 8);
  ctx.fill();
  dishDrawing(ctx, recipe.id, rect.x + 38, rect.y + 38, 22, false);
  text(ctx, recipe.name.toUpperCase(), rect.x + 76, rect.y + 26, 17, PALETTE.ink, 'left');
  text(ctx, recipe.blurb, rect.x + 76, rect.y + 50, 12, '#6b5a3e', 'left');
  // Patience bar.
  ctx.fillStyle = '#d8c9a4';
  rr(ctx, rect.x + 12, rect.y + 78, rect.w - 24, 14, 7);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#5da85e' : frac > 0.25 ? '#e8a34c' : '#d94f3d';
  if (frac > 0) {
    rr(ctx, rect.x + 12, rect.y + 78, (rect.w - 24) * frac, 14, 7);
    ctx.fill();
  }
  text(ctx, recipe.coins + ' KOIN', rect.x + rect.w - 14, rect.y + 26, 17, '#8a6a2a', 'right');
  text(ctx, recipe.needs.map((n) => ingredientById(n).name).join(' + '), rect.x + 76, rect.y + 106, 12, '#6b5a3e', 'left');
  ctx.restore();
}

function drawOrderBoard(ctx, world) {
  LAYOUT.tickets.forEach((rect, i) => {
    const order = world.orders[i];
    if (!order) {
      ctx.fillStyle = 'rgba(245, 234, 210, 0.12)';
      rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(245, 234, 210, 0.35)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'MENUNGGU PESANAN...', rect.x + rect.w / 2, rect.y + rect.h / 2, 15, PALETTE.creamDim);
      return;
    }
    drawTicket(ctx, order, rect);
  });
  const box = LAYOUT.nextBox;
  ctx.fillStyle = 'rgba(8, 18, 20, 0.6)';
  rr(ctx, box.x, box.y, box.w, box.h, 10);
  ctx.fill();
  text(ctx, 'PESANAN BERIKUTNYA', box.x + box.w / 2, box.y + 24, 13, PALETTE.creamDim);
  const wait = Math.max(0, Math.ceil(world.nextOrderIn));
  text(ctx, wait + ' dtk', box.x + box.w / 2, box.y + 58, 26, PALETTE.cream);
  text(ctx, world.rush ? 'RUSH: pelanggan makin tidak sabar' : 'Sabar pelanggan: 50 dtk', box.x + box.w / 2, box.y + 96, 12, world.rush ? PALETTE.danger : PALETTE.creamDim);
}

function drawFlame(ctx, cx, baseY, level, t, seed) {
  if (level <= 0) {
    ctx.fillStyle = '#2c3a3c';
    ctx.beginPath();
    ctx.ellipse(cx, baseY, 52, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const h = 34 + level * 22;
  const wob = Math.sin(t * 7 + seed) * 4;
  const glow = ctx.createRadialGradient(cx, baseY - h * 0.4, 4, cx, baseY - h * 0.4, 90);
  glow.addColorStop(0, 'rgba(255, 150, 60, 0.55)');
  glow.addColorStop(1, 'rgba(255, 150, 60, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 90, baseY - h - 60, 180, h + 120);
  for (let f = 0; f < 3; f++) {
    const fh = h * (1 - f * 0.22);
    const fw = (20 + level * 7) * (1 - f * 0.2);
    ctx.fillStyle = f === 0 ? 'rgba(255, 123, 47, 0.9)' : f === 1 ? 'rgba(255, 179, 71, 0.9)' : 'rgba(255, 233, 168, 0.95)';
    ctx.beginPath();
    ctx.moveTo(cx - fw, baseY);
    ctx.quadraticCurveTo(cx - fw * 0.7, baseY - fh * 0.6, cx + wob, baseY - fh);
    ctx.quadraticCurveTo(cx + fw * 0.7, baseY - fh * 0.6, cx + fw, baseY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBurner(ctx, world, i, t) {
  const b = LAYOUT.burners[i];
  const pan = world.pans[i];
  const flame = world.burners[i].flame;
  const selected = world.selectedBurner === i && world.screen === 'playing';
  const wob = pan.wobble > 0 ? Math.sin(t * 40) * pan.wobble * 4 : 0;

  // Soft shadow under the station.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(b.cx, b.panY + 108, 130, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stove body: lit top edge, dark base — the 2.5D read.
  const body = ctx.createLinearGradient(b.cx - 150, 0, b.cx + 150, 0);
  body.addColorStop(0, PALETTE.counterDark);
  body.addColorStop(0.5, PALETTE.counterLight);
  body.addColorStop(1, PALETTE.counterDark);
  ctx.fillStyle = body;
  rr(ctx, b.cx - 150, b.panY + 96, 300, 64, 12);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
  ctx.fillRect(b.cx - 150, b.panY + 96, 300, 5);

  // Pan: steel ring, dark inside, food, progress + burn rings.
  // The flame is drawn after the pan so its tongues lick the pan's rim.
  ctx.save();
  ctx.translate(wob, 0);
  ctx.fillStyle = PALETTE.steelLight;
  ctx.beginPath();
  ctx.arc(b.cx, b.panY, b.panR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#20262a';
  ctx.beginPath();
  ctx.arc(b.cx, b.panY, b.panR - 10, 0, Math.PI * 2);
  ctx.fill();
  if (pan.state === 'empty') {
    text(ctx, 'PANCI KOSONG', b.cx, b.panY - 6, 14, '#7d8a8c');
    text(ctx, 'klik bahan, lalu klik panci', b.cx, b.panY + 16, 11, '#5d6a6c');
  } else if (pan.state === 'partial') {
    pan.ingredients.forEach((ing, k) => {
      ingredientIcon(ctx, ing, b.cx - 34 + k * 34, b.panY, 20);
    });
    text(ctx, 'butuh ' + (recipeForPartial(pan) || '...'), b.cx, b.panY + 52, 12, PALETTE.creamDim);
  } else if (pan.state === 'cooking' || pan.state === 'done') {
    dishDrawing(ctx, pan.recipeId, b.cx, b.panY, 58, false);
    if (pan.rested && pan.state === 'cooking') {
      ctx.fillStyle = PALETTE.ready;
      rr(ctx, b.cx - 52, b.panY - 78, 104, 22, 11);
      ctx.fill();
      text(ctx, 'ISTIRAHAT +50%', b.cx, b.panY - 67, 11, '#0d2a12');
    }
  } else if (pan.state === 'burnt') {
    dishDrawing(ctx, pan.recipeId, b.cx, b.panY, 58, true);
    text(ctx, 'GOSONG — klik untuk bersihkan', b.cx, b.panY + 58, 12, PALETTE.danger);
  }
  // Progress ring (amber) and burn ring (red) around the pan.
  if (pan.state === 'cooking') {
    ctx.strokeStyle = PALETTE.amber;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(b.cx, b.panY, b.panR + 6, -Math.PI / 2, -Math.PI / 2 + pan.progress * Math.PI * 2);
    ctx.stroke();
    if (pan.burn > 0.05) {
      ctx.strokeStyle = PALETTE.danger;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(b.cx, b.panY, b.panR + 16, -Math.PI / 2, -Math.PI / 2 + pan.burn * Math.PI * 2);
      ctx.stroke();
    }
    const recipe = recipeById(pan.recipeId);
    if (flame > recipe.heat) text(ctx, 'TERLALU PANAS!', b.cx, b.panY - 114, 13, PALETTE.danger);
    else if (flame === 0) text(ctx, 'ISTIRAHAT...', b.cx, b.panY - 114, 13, PALETTE.ready);
    else if (flame < recipe.heat) text(ctx, 'KURANG PANAS', b.cx, b.panY - 114, 13, PALETTE.amber);
  }
  if (pan.state === 'done') {
    ctx.fillStyle = PALETTE.ready;
    rr(ctx, b.cx - 44, b.panY - 84, 88, 26, 13);
    ctx.fill();
    text(ctx, 'SIAP! KLIK', b.cx, b.panY - 71, 13, '#0d2a12');
  }
  ctx.restore();

  // Flame tongues in front of the pan's rim, then the progress readout
  // on a dark pill so it stays readable over the fire.
  drawFlame(ctx, b.cx, b.panY + 118, flame, t, i * 2.1);
  if (pan.state === 'cooking') {
    ctx.fillStyle = 'rgba(8, 18, 20, 0.8)';
    rr(ctx, b.cx - 30, b.panY + 62, 60, 24, 12);
    ctx.fill();
    text(ctx, Math.round(pan.progress * 100) + '%', b.cx, b.panY + 75, 13, PALETTE.cream);
  }

  // Heat pips on the stove body + flame buttons under the stove.
  const by = b.panY + LAYOUT.flameBtn.dy;
  for (let p = 0; p < 3; p++) {
    ctx.fillStyle = p < flame ? PALETTE.flame : '#2c3a3c';
    ctx.beginPath();
    ctx.arc(b.cx - 24 + p * 24, b.panY + 122, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, flame === 0 ? 'API MATI — istirahat' : 'API ' + flame, b.cx, b.panY + 148, 12, PALETTE.creamDim);
  for (const dir of [-1, 1]) {
    const r = flameBtnRect(i, dir);
    ctx.fillStyle = selected ? '#31494d' : '#24373a';
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    ctx.strokeStyle = '#54696c';
    ctx.lineWidth = 2;
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.stroke();
    text(ctx, dir < 0 ? '−' : '+', r.x + r.w / 2, r.y + r.h / 2 + 1, 22, PALETTE.cream);
  }
  if (selected) {
    ctx.strokeStyle = PALETTE.amber;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    rr(ctx, b.cx - 158, b.panY - 118, 316, 300, 16);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function recipeForPartial(pan) {
  const missing = [];
  for (const r of RECIPES) {
    if (pan.ingredients.every((ing) => r.needs.includes(ing)) && r.needs.length >= pan.ingredients.length) {
      r.needs.forEach((n) => { if (!pan.ingredients.includes(n)) missing.push(ingredientById(n).name); });
      return missing.join(' + ');
    }
  }
  return '';
}

function drawPass(ctx, world) {
  const p = LAYOUT.pass;
  text(ctx, 'PASS — PIRING SIAP SAJI (klik untuk sajikan)', 640, p.y - 14, 13, PALETTE.creamDim);
  ctx.fillStyle = '#2a1c12';
  rr(ctx, p.x - 16, p.y - 8, p.w + 32, p.h + 16, 10);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const r = passSlotRect(i);
    const plate = world.pass[i];
    ctx.fillStyle = plate ? PALETTE.ticket : 'rgba(245, 234, 210, 0.10)';
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    if (plate) {
      const recipe = recipeById(plate.recipeId);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(r.x + 34, r.y + r.h / 2, 26, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      dishDrawing(ctx, plate.recipeId, r.x + 32, r.y + r.h / 2, 15, false);
      text(ctx, recipe.name, r.x + 64, r.y + 18, 13, PALETTE.ink, 'left');
      text(ctx, plate.rested ? 'BONUS +50%' : recipe.coins + ' KOIN', r.x + 64, r.y + 40, 12, plate.rested ? '#2f7a37' : '#8a6a2a', 'left');
    } else {
      text(ctx, '— kosong —', r.x + r.w / 2, r.y + r.h / 2, 13, PALETTE.creamDim);
    }
  }
}

function drawBins(ctx, world) {
  text(ctx, 'MEJA BAHAN — klik bahan, lalu klik panci', 640, LAYOUT.bins.y - 12, 13, PALETTE.creamDim);
  const ids = ['telur', 'ayam', 'sayur', 'nasi', 'bumbu'];
  ids.forEach((id, i) => {
    const r = binRect(i);
    const g = ingredientById(id);
    const selected = world.selectedIngredient === id;
    const grad = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
    grad.addColorStop(0, PALETTE.counterLight);
    grad.addColorStop(1, PALETTE.counterDark);
    ctx.fillStyle = grad;
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    if (selected) {
      ctx.strokeStyle = PALETTE.amber;
      ctx.lineWidth = 4;
      rr(ctx, r.x, r.y, r.w, r.h, 12);
      ctx.stroke();
    }
    ingredientIcon(ctx, id, r.x + r.w / 2, r.y + 52, 30);
    text(ctx, g.name, r.x + r.w / 2, r.y + 102, 17, PALETTE.cream);
    text(ctx, 'bahan ' + (i + 1), r.x + r.w / 2, r.y + 122, 11, PALETTE.creamDim);
  });
}

function drawParticles(ctx, world) {
  for (const p of world.particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = p.kind === 'smoke' ? a * 0.35 : a;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloaters(ctx, world) {
  for (const f of world.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    text(ctx, f.text, f.x, f.y, 20, f.color);
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, world, t) {
  ctx.fillStyle = 'rgba(6, 14, 16, 0.55)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  // A hero pan with flames behind the title.
  drawFlame(ctx, 640, 470, 3, t, 0);
  drawFlame(ctx, 420, 470, 2, t, 1.3);
  drawFlame(ctx, 860, 470, 2, t, 2.6);
  text(ctx, 'SATU API', 640, 150, 84, PALETTE.cream);
  text(ctx, '12 PESANAN', 640, 232, 84, PALETTE.amber);
  text(ctx, 'Kamu bukan kokinya. Kamu apinya.', 640, 300, 22, PALETTE.creamDim);
  text(ctx, 'Atur api di 3 tungku, masak 12 pesanan sebelum shift 3 menit berakhir.', 640, 336, 17, PALETTE.cream);
  text(ctx, 'Api besar = cepat tapi gosong. Api mati = istirahat, bonus +50% koin.', 640, 364, 17, PALETTE.cream);
  const btn = LAYOUT.playBtn;
  const pulse = 1 + Math.sin(t * 4) * 0.03;
  ctx.save();
  ctx.translate(640, btn.y + btn.h / 2);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = PALETTE.amber;
  rr(ctx, -btn.w / 2, -btn.h / 2, btn.w, btn.h, 14);
  ctx.fill();
  text(ctx, '▶  MULAI SHIFT', 0, 2, 26, PALETTE.ink);
  ctx.restore();
  text(ctx, 'Klik bahan di bawah, lalu klik panci • 1/2/3 pilih tungku, W/S atur api • R ulangi', 640, 700, 14, PALETTE.creamDim);
  text(ctx, 'Telur Dadar: api 1 • Nasi Goreng: api 2 • Ayam Goreng: api 3', 640, 730, 14, PALETTE.creamDim);
}

function drawEnd(ctx, world) {
  const won = world.screen === 'won';
  ctx.fillStyle = won ? 'rgba(10, 30, 14, 0.72)' : 'rgba(30, 10, 10, 0.72)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  text(ctx, won ? 'SHIFT SELESAI!' : 'SHIFT BERAKHIR', 640, 210, 64, won ? PALETTE.ready : PALETTE.danger);
  text(ctx, won ? '12 pesanan tersaji. Warung malam ini milikmu.' : 'Pesanan tidak selesai tepat waktu.', 640, 290, 20, PALETTE.cream);
  text(ctx, 'TERSAJI  ' + world.served + ' / 12', 640, 380, 30, PALETTE.cream);
  text(ctx, 'KOIN  ' + world.coins + '      MASAKAN  ' + world.stats.cooked + '      GOSONG  ' + world.stats.burnt, 640, 430, 20, PALETTE.gold);
  const btn = LAYOUT.restartBtn;
  ctx.fillStyle = PALETTE.amber;
  rr(ctx, btn.x, btn.y, btn.w, btn.h, 14);
  ctx.fill();
  text(ctx, '↻  MAIN LAGI  (R)', btn.x + btn.w / 2, btn.y + btn.h / 2 + 1, 24, PALETTE.ink);
  text(ctx, won ? 'Api yang tepat, di waktu yang tepat.' : 'Coba lagi — jaga apinya, jangan sampai gosong.', 640, 700, 16, PALETTE.creamDim);
}

export function draw(ctx, world, t) {
  ctx.save();
  if (world.shake > 0) {
    ctx.translate((Math.random() - 0.5) * world.shake * 10, (Math.random() - 0.5) * world.shake * 10);
  }
  drawBackground(ctx, world, t);
  if (world.screen === 'title') {
    drawTopBar(ctx, world);
    drawTitle(ctx, world, t);
    ctx.restore();
    return;
  }
  drawTopBar(ctx, world);
  drawOrderBoard(ctx, world);
  for (let i = 0; i < 3; i++) drawBurner(ctx, world, i, t);
  drawPass(ctx, world);
  drawBins(ctx, world);
  drawParticles(ctx, world);
  drawFloaters(ctx, world);
  if (world.screen === 'won' || world.screen === 'lost') drawEnd(ctx, world);
  ctx.restore();
}

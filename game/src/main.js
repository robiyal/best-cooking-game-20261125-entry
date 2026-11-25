// Satu Api, 12 Pesanan — bootstrap and game loop.
// The loop ticks the world, drains its sound events, and draws. The canvas
// is fixed at 1280x800; CSS scales it to the window.

import { VIEW } from './config.js';
import { createWorld, updateWorld } from './world.js';
import { createAudio, playEvents } from './audio.js';
import { attachInput } from './input.js';
import { draw } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const world = createWorld();
const audio = createAudio();

let note = '';
let noteLife = 0;

function showNote(text) {
  note = text;
  noteLife = 2.2;
}

attachInput(canvas, world, audio, showNote);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) applyShot(world, shot);

let last = performance.now();
let fps = 60;

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (dt > 0) fps = fps * 0.95 + (1 / dt) * 0.05;
  const t = now / 1000;
  updateWorld(world, dt);
  // Sizzle follows the total flame plus one cooking pan.
  if (audio.ctx) {
    let level = 0;
    for (const b of world.burners) level += b.flame;
    const cooking = world.pans.some((p) => p.state === 'cooking') ? 1 : 0;
    audio.setSizzle(world.screen === 'playing' ? level * 0.02 + cooking * 0.03 : 0);
  }
  playEvents(audio, world);
  draw(ctx, world, t);
  if (noteLife > 0) {
    noteLife -= dt;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, noteLife));
    ctx.fillStyle = '#f7ead0';
    ctx.font = 'bold 18px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(note, VIEW.w / 2, 786);
    ctx.restore();
  }
  window.__game = { world, fps: Math.round(fps), shot: shot || null, ready: true };
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

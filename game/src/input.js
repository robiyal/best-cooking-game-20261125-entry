// Satu Api, 12 Pesanan — mouse and keyboard input.
// Every clickable thing is hit-tested here; the world only receives
// named actions (select ingredient, set flame, click pan, serve plate).

import {
  LAYOUT, binRect, passSlotRect, flameBtnRect,
  pointInRect, pointInCircle,
} from './config.js';
import {
  selectIngredient, setFlame, clickPan, clickPlate, startShift,
} from './world.js';

function canvasPoint(canvas, event) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - r.left) / r.width) * canvas.width,
    y: ((event.clientY - r.top) / r.height) * canvas.height,
  };
}

export function attachInput(canvas, world, audio, onNote) {
  const say = (text) => { if (text && onNote) onNote(text); };

  function handleClick(px, py) {
    audio.ensure();
    if (world.screen === 'title') {
      if (pointInRect(px, py, LAYOUT.playBtn)) startShift(world);
      return;
    }
    if (world.screen === 'won' || world.screen === 'lost') {
      if (pointInRect(px, py, LAYOUT.restartBtn)) startShift(world);
      return;
    }
    // Ingredient bins along the bottom counter.
    for (let i = 0; i < 5; i++) {
      if (pointInRect(px, py, binRect(i))) {
        const ids = ['telur', 'ayam', 'sayur', 'nasi', 'bumbu'];
        selectIngredient(world, ids[i]);
        return;
      }
    }
    // Flame buttons and pans, one station at a time.
    for (let i = 0; i < 3; i++) {
      if (pointInRect(px, py, flameBtnRect(i, -1))) {
        setFlame(world, i, world.burners[i].flame - 1);
        return;
      }
      if (pointInRect(px, py, flameBtnRect(i, 1))) {
        setFlame(world, i, world.burners[i].flame + 1);
        return;
      }
      const b = LAYOUT.burners[i];
      if (pointInCircle(px, py, b.cx, b.panY, b.panR + 12)) {
        world.selectedBurner = i;
        say(clickPan(world, i));
        return;
      }
    }
    // Plates waiting on the pass.
    for (let i = 0; i < 3; i++) {
      if (pointInRect(px, py, passSlotRect(i))) {
        say(clickPlate(world, i));
        return;
      }
    }
  }

  canvas.addEventListener('click', (event) => {
    const p = canvasPoint(canvas, event);
    handleClick(p.x, p.y);
  });

  canvas.addEventListener('mousemove', (event) => {
    const p = canvasPoint(canvas, event);
    let hover = false;
    if (world.screen === 'playing') {
      for (let i = 0; i < 3; i++) {
        const b = LAYOUT.burners[i];
        if (pointInCircle(p.x, p.y, b.cx, b.panY, b.panR + 12)) hover = true;
      }
      for (let i = 0; i < 5; i++) if (pointInRect(p.x, p.y, binRect(i))) hover = true;
      for (let i = 0; i < 3; i++) if (pointInRect(p.x, p.y, passSlotRect(i))) hover = true;
    }
    canvas.style.cursor = hover ? 'pointer' : 'default';
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const k = event.key.toLowerCase();
    if (world.screen === 'title' && (k === 'enter' || k === ' ')) {
      audio.ensure();
      startShift(world);
      return;
    }
    if ((world.screen === 'won' || world.screen === 'lost') && (k === 'r' || k === 'enter')) {
      audio.ensure();
      startShift(world);
      return;
    }
    if (world.screen !== 'playing') return;
    if (k === '1' || k === '2' || k === '3') {
      world.selectedBurner = Number(k) - 1;
      audio.click();
      return;
    }
    if (k === 'w' || k === 'arrowup') {
      setFlame(world, world.selectedBurner, world.burners[world.selectedBurner].flame + 1);
      return;
    }
    if (k === 's' || k === 'arrowdown') {
      setFlame(world, world.selectedBurner, world.burners[world.selectedBurner].flame - 1);
      return;
    }
    if (k === ' ') {
      event.preventDefault();
      for (let i = 0; i < 3; i++) {
        if (world.pans[i].state === 'done') { say(clickPan(world, i)); return; }
      }
      return;
    }
    if (k === 'm') {
      audio.setMuted(!audio.muted);
      say(audio.muted ? 'Suara mati' : 'Suara hidup');
    }
  });
}

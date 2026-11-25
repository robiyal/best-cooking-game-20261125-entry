// Satu Api, 12 Pesanan — game state and rules.
// Burners hold flames, pans hold dishes, tickets hold customers.
// The world only mutates here; rendering lives in render.js.

import {
  SHIFT_SECONDS, WIN_SERVE_TARGET, MAX_WALKOUTS, MAX_ORDERS, PASS_SLOTS,
  RECIPES, recipeById, recipeForIngredients, canStillMatch,
} from './config.js';

let orderSeq = 0;

export function createWorld() {
  return {
    screen: 'title', // title | playing | won | lost
    timeLeft: SHIFT_SECONDS,
    served: 0,
    coins: 0,
    walkouts: 0,
    rush: false,
    rushAnnounced: false,
    orders: [],
    pans: [
      { ingredients: [], state: 'empty', recipeId: null, progress: 0, burn: 0, restTime: 0, rested: false, wobble: 0 },
      { ingredients: [], state: 'empty', recipeId: null, progress: 0, burn: 0, restTime: 0, rested: false, wobble: 0 },
      { ingredients: [], state: 'empty', recipeId: null, progress: 0, burn: 0, restTime: 0, rested: false, wobble: 0 },
    ],
    burners: [{ flame: 0 }, { flame: 0 }, { flame: 0 }],
    selectedIngredient: null,
    selectedBurner: 0,
    pass: [null, null, null],
    nextOrderIn: 14,
    elapsed: 0,
    particles: [],
    floaters: [],
    shake: 0,
    frozen: false,
    events: [],
    stats: { cooked: 0, burnt: 0, served: 0 },
  };
}

function pickRecipe() {
  const roll = Math.random();
  if (roll < 0.34) return RECIPES[0];
  if (roll < 0.68) return RECIPES[1];
  return RECIPES[2];
}

function spawnOrder(world) {
  const recipe = pickRecipe();
  const patienceMax = world.rush ? 36 : 50;
  world.orders.push({
    id: ++orderSeq,
    recipeId: recipe.id,
    patience: patienceMax,
    patienceMax,
  });
}

export function startShift(world) {
  const fresh = createWorld();
  Object.assign(world, fresh);
  world.screen = 'playing';
  for (let i = 0; i < 3; i++) spawnOrder(world);
  world.nextOrderIn = 16;
  world.events.push({ type: 'start' });
}

export function setFlame(world, burnerIndex, level) {
  const clamped = Math.max(0, Math.min(3, level));
  world.burners[burnerIndex].flame = clamped;
  world.selectedBurner = burnerIndex;
  world.events.push({ type: 'click' });
}

export function selectIngredient(world, ingredientId) {
  world.selectedIngredient = world.selectedIngredient === ingredientId ? null : ingredientId;
  world.events.push({ type: 'click' });
}

// Clicking a pan: add the selected ingredient, plate a finished dish,
// or scrape a burnt one clean. Returns a short note for floating text.
export function clickPan(world, panIndex) {
  const pan = world.pans[panIndex];
  if (pan.state === 'burnt') {
    pan.ingredients = [];
    pan.state = 'empty';
    pan.recipeId = null;
    pan.progress = 0;
    pan.burn = 0;
    pan.rested = false;
    world.events.push({ type: 'scrape' });
    return 'Panci dibersihkan';
  }
  if (pan.state === 'done') {
    return platePan(world, panIndex);
  }
  if (pan.state === 'cooking') {
    pan.wobble = 1;
    return 'Masih dimasak...';
  }
  const ing = world.selectedIngredient;
  if (!ing) {
    pan.wobble = 1;
    return 'Pilih bahan dulu';
  }
  if (pan.ingredients.includes(ing)) {
    pan.wobble = 1;
    return 'Sudah ada di panci';
  }
  const trial = [...pan.ingredients, ing];
  if (!canStillMatch(trial)) {
    pan.wobble = 1;
    world.events.push({ type: 'bad' });
    return 'Bahan tidak cocok';
  }
  pan.ingredients = trial;
  pan.state = 'partial';
  world.events.push({ type: 'add' });
  const recipe = recipeForIngredients(trial);
  if (recipe) {
    pan.state = 'cooking';
    pan.recipeId = recipe.id;
    pan.progress = 0;
    pan.burn = 0;
    pan.restTime = 0;
    pan.rested = false;
    world.events.push({ type: 'sizzle' });
    return recipe.name + ' mulai dimasak';
  }
  return 'Ditambahkan';
}

function platePan(world, panIndex) {
  const pan = world.pans[panIndex];
  const slot = world.pass.findIndex((p) => p === null);
  if (slot === -1) {
    pan.wobble = 1;
    return 'Pass penuh — sajikan dulu';
  }
  world.pass[slot] = { recipeId: pan.recipeId, rested: pan.rested };
  pan.ingredients = [];
  pan.state = 'empty';
  pan.recipeId = null;
  pan.progress = 0;
  pan.burn = 0;
  pan.rested = false;
  world.stats.cooked += 1;
  world.events.push({ type: 'plate' });
  return 'Dipiring!';
}

// Clicking a plate on the pass: serve it to the oldest matching ticket,
// or toss it away when nobody ordered it.
export function clickPlate(world, slotIndex) {
  const plate = world.pass[slotIndex];
  if (!plate) return '';
  const recipe = recipeById(plate.recipeId);
  const orderIndex = world.orders.findIndex((o) => o.recipeId === plate.recipeId);
  world.pass[slotIndex] = null;
  if (orderIndex === -1) {
    world.events.push({ type: 'toss' });
    burst(world, 475 + slotIndex * 165, 585, '#8a8a8a', 10);
    return 'Tidak ada pesanan — dibuang';
  }
  const order = world.orders[orderIndex];
  world.orders.splice(orderIndex, 1);
  const bonus = plate.rested ? 1.5 : 1;
  const earned = Math.round(recipe.coins * bonus);
  world.coins += earned;
  world.served += 1;
  world.stats.served += 1;
  world.events.push({ type: 'serve' });
  burst(world, 475 + slotIndex * 165, 585, '#ffe9a8', 16);
  addFloater(world, 640, 300, '+' + earned + ' KOIN', '#f2c14e');
  if (plate.rested) addFloater(world, 640, 340, 'ISTIRAHAT SEMPURNA +50%', '#7fd08a');
  if (world.served >= WIN_SERVE_TARGET) {
    world.screen = 'won';
    world.events.push({ type: 'win' });
  }
  return earned + ' koin — ' + recipe.name + ' tersaji';
}

export function burst(world, x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 120;
    world.particles.push({
      kind: 'spark', x, y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
      life: 0.5 + Math.random() * 0.4, maxLife: 0.9,
      size: 2 + Math.random() * 3, color,
    });
  }
}

export function addFloater(world, x, y, text, color) {
  world.floaters.push({ x, y, text, color, life: 1.4 });
}

function smokePuff(world, x, y, n) {
  for (let i = 0; i < n; i++) {
    world.particles.push({
      kind: 'smoke', x: x + (Math.random() - 0.5) * 60, y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 20, vy: -30 - Math.random() * 30,
      life: 1 + Math.random() * 0.8, maxLife: 1.8,
      size: 10 + Math.random() * 14, color: '#5a5a5a',
    });
  }
}

export function updateWorld(world, dt) {
  if (world.frozen) return;
  // Particles and floaters always animate, even on title/end screens.
  updateParticles(world, dt);
  if (world.screen !== 'playing') return;

  world.elapsed += dt;
  world.timeLeft -= dt;
  if (world.timeLeft <= 0) {
    world.timeLeft = 0;
    world.screen = 'lost';
    world.events.push({ type: 'lose' });
    return;
  }

  if (!world.rush && world.served >= 6) {
    world.rush = true;
    world.events.push({ type: 'rush' });
    addFloater(world, 640, 240, 'RUSH HOUR! Pesanan makin cepat', '#ff5a4e');
  }

  // Customers lose patience; a walkout costs the shift.
  const drain = world.rush ? 1.5 : 1;
  for (let i = world.orders.length - 1; i >= 0; i--) {
    const order = world.orders[i];
    order.patience -= dt * drain;
    if (order.patience <= 0) {
      world.orders.splice(i, 1);
      world.walkouts += 1;
      world.events.push({ type: 'walkout' });
      addFloater(world, 640, 280, 'Pelanggan pergi! (' + world.walkouts + '/3)', '#ff5a4e');
      if (world.walkouts >= MAX_WALKOUTS) {
        world.screen = 'lost';
        world.events.push({ type: 'lose' });
        return;
      }
    }
  }

  // New tickets arrive on a timer, faster during the rush.
  world.nextOrderIn -= dt;
  if (world.nextOrderIn <= 0 && world.orders.length < MAX_ORDERS) {
    spawnOrder(world);
    world.nextOrderIn = world.rush ? 12 : 18;
  }

  // Cooking, burning, resting — one pan at a time.
  for (let i = 0; i < world.pans.length; i++) {
    const pan = world.pans[i];
    if (pan.wobble > 0) pan.wobble = Math.max(0, pan.wobble - dt * 3);
    if (pan.state !== 'cooking') continue;
    const recipe = recipeById(pan.recipeId);
    const heat = world.burners[i].flame;
    if (heat === 0) {
      pan.restTime += dt;
      if (pan.restTime >= 2 && pan.progress > 0.2) pan.rested = true;
      continue;
    }
    pan.restTime = 0;
    const gap = Math.abs(heat - recipe.heat);
    const factor = gap === 0 ? 1 : gap === 1 ? 0.45 : 0.18;
    pan.progress += (dt / recipe.cook) * factor;
    if (heat > recipe.heat) {
      pan.burn += dt * 0.22 * (heat - recipe.heat);
      if (Math.random() < dt * 6) {
        world.particles.push({
          kind: 'smoke', x: 220 + i * 420 + (Math.random() - 0.5) * 50, y: 300,
          vx: (Math.random() - 0.5) * 15, vy: -25 - Math.random() * 20,
          life: 0.8, maxLife: 1.4, size: 8 + Math.random() * 8, color: '#4a4a4a',
        });
      }
    } else {
      pan.burn = Math.max(0, pan.burn - dt * 0.2);
    }
    if (pan.burn >= 1) {
      pan.state = 'burnt';
      pan.progress = 0;
      world.stats.burnt += 1;
      world.shake = 1;
      world.events.push({ type: 'burn' });
      smokePuff(world, 220 + i * 420, 320, 14);
      addFloater(world, 220 + i * 420, 260, 'GOSONG! Klik panci untuk membersihkan', '#ff5a4e');
      continue;
    }
    if (pan.progress >= 1) {
      pan.progress = 1;
      pan.state = 'done';
      world.events.push({ type: 'done' });
      burst(world, 220 + i * 420, 320, '#7fd08a', 10);
    }
  }

  if (world.shake > 0) world.shake = Math.max(0, world.shake - dt * 2.5);
}

function updateParticles(world, dt) {
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const p = world.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      world.particles.splice(i, 1);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.kind === 'smoke') {
      p.vy -= 12 * dt;
      p.size += 6 * dt;
    }
    if (p.kind === 'spark') p.vy += 160 * dt;
    if (p.kind === 'flame') p.vy -= 60 * dt;
  }
  for (let i = world.floaters.length - 1; i >= 0; i--) {
    const f = world.floaters[i];
    f.life -= dt;
    f.y -= 28 * dt;
    if (f.life <= 0) world.floaters.splice(i, 1);
  }
  // Flame embers rise from every lit burner while playing.
  if (world.screen === 'playing' && !world.frozen) {
    for (let i = 0; i < world.burners.length; i++) {
      const flame = world.burners[i].flame;
      if (flame > 0 && world.particles.length < 320 && Math.random() < dt * 22 * flame) {
        world.particles.push({
          kind: 'flame', x: 220 + i * 420 + (Math.random() - 0.5) * 46, y: 452,
          vx: (Math.random() - 0.5) * 12, vy: -55 - Math.random() * 45,
          life: 0.4 + Math.random() * 0.35, maxLife: 0.75,
          size: 3 + Math.random() * 4, color: Math.random() < 0.5 ? '#ff7b2f' : '#ffb347',
        });
      }
    }
  }
}

export { PASS_SLOTS };

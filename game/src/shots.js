// Satu Api, 12 Pesanan — staged screenshot states.
// ?shot=start | play | serve | end puts the game into one deterministic,
// frozen scene so a screenshot always shows the same moment. The live
// game never reads this file's states unless the query is present.

import { startShift } from './world.js';

export function applyShot(world, mode) {
  if (!mode) return false;
  if (mode === 'start') {
    world.screen = 'title';
    world.frozen = true;
    return true;
  }
  startShift(world);
  world.frozen = true;
  if (mode === 'play') {
    // Mid-action: two pans cooking, one pan half-filled, three tickets.
    world.timeLeft = 132;
    world.coins = 45;
    world.served = 4;
    world.orders = [
      { id: 101, recipeId: 'nasgor', patience: 34, patienceMax: 50 },
      { id: 102, recipeId: 'ayamgor', patience: 24, patienceMax: 50 },
      { id: 103, recipeId: 'dadar', patience: 42, patienceMax: 50 },
    ];
    world.pans[0] = {
      ingredients: ['nasi', 'telur', 'sayur'], state: 'cooking', recipeId: 'nasgor',
      progress: 0.62, burn: 0, restTime: 0, rested: false, wobble: 0,
    };
    world.pans[1] = {
      ingredients: ['telur', 'bumbu'], state: 'cooking', recipeId: 'dadar',
      progress: 0.35, burn: 0.12, restTime: 0, rested: false, wobble: 0,
    };
    world.pans[2] = {
      ingredients: ['nasi', 'telur'], state: 'partial', recipeId: null,
      progress: 0, burn: 0, restTime: 0, rested: false, wobble: 0,
    };
    world.burners = [{ flame: 2 }, { flame: 1 }, { flame: 0 }];
    world.selectedBurner = 0;
    world.selectedIngredient = 'sayur';
    world.nextOrderIn = 9;
    return true;
  }
  if (mode === 'serve') {
    // A plated dish waits on the pass, its ticket still open.
    world.timeLeft = 96;
    world.coins = 120;
    world.served = 9;
    world.orders = [
      { id: 201, recipeId: 'nasgor', patience: 28, patienceMax: 50 },
      { id: 202, recipeId: 'dadar', patience: 40, patienceMax: 50 },
      { id: 203, recipeId: 'ayamgor', patience: 18, patienceMax: 50 },
    ];
    world.pans[0] = {
      ingredients: ['telur', 'bumbu'], state: 'done', recipeId: 'dadar',
      progress: 1, burn: 0, restTime: 0, rested: true, wobble: 0,
    };
    world.pans[1] = {
      ingredients: ['ayam', 'bumbu'], state: 'cooking', recipeId: 'ayamgor',
      progress: 0.5, burn: 0, restTime: 0, rested: false, wobble: 0,
    };
    world.pans[2] = {
      ingredients: [], state: 'empty', recipeId: null,
      progress: 0, burn: 0, restTime: 0, rested: false, wobble: 0,
    };
    world.burners = [{ flame: 0 }, { flame: 3 }, { flame: 0 }];
    world.pass = [{ recipeId: 'nasgor', rested: true }, null, null];
    world.selectedBurner = 1;
    world.nextOrderIn = 6;
    return true;
  }
  if (mode === 'end') {
    world.screen = 'won';
    world.timeLeft = 24;
    world.coins = 340;
    world.served = 12;
    world.stats = { cooked: 14, burnt: 1, served: 12 };
    world.orders = [];
    return true;
  }
  return false;
}

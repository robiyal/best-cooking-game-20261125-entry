// Satu Api, 12 Pesanan — hand-in program (make.fun best-cooking-game-20261125-0137).
// Copies game/ and screenshots/ beside this file into the output directory
// and writes dossier.json there with buildDossier from vendor/makefun-game.ts.
// Standard library only; runs twice and writes the same bytes both times.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

if (!existsSync(join(root, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing next to main.ts');
}
if (!existsSync(join(root, 'screenshots'))) {
  throw new Error('screenshots/ is missing next to main.ts');
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(join(root, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(root, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, caps);
writeFileSync(join(outDir, 'dossier.json'), dossier);

// Verify the hand-in before reporting success: the dossier must parse,
// the screenshots must number 3 or 4, and every screenshot must fit its cap.
const parsed = JSON.parse(new TextDecoder('utf-8').decode(readFileSync(join(outDir, 'dossier.json'))));
if (parsed.schema !== 'makefun/dossier/v1') {
  throw new Error('dossier.json has an unexpected schema: ' + String(parsed.schema));
}
const shots = readdirSync(join(outDir, 'screenshots')).filter((n) => !n.startsWith('.'));
if (shots.length < 3 || shots.length > 4) {
  throw new Error('screenshots/ must hold 3 or 4 images, found ' + shots.length);
}
for (const name of shots) {
  const size = statSync(join(outDir, 'screenshots', name)).size;
  if (size > caps.screenshots.max_bytes) {
    throw new Error('screenshot ' + name + ' is ' + size + ' bytes, over the 256 KiB cap');
  }
}

console.log('wrote ' + outDir + ' (dossier.json ' + dossier.length + ' bytes, ' + shots.length + ' screenshots)');

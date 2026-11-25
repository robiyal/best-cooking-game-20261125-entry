// Satu Api, 12 Pesanan — dev server only (not part of the hand-in game).
// Serves game/ on http://localhost:8080 so the game can be play-tested
// and screenshotted in a desktop browser. Standard library only.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'game');

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const server = createServer(async (req, res) => {
  const path = normalize(join(root, decodeURIComponent(req.url?.split('?')[0] ?? '/') || '/'));
  if (!path.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  const file = path.endsWith('/') ? join(path, 'index.html') : path;
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(8080, '127.0.0.1', () => {
  console.log('serving game/ at http://127.0.0.1:8080/');
});

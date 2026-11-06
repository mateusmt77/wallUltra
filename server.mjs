import http from 'node:http';
import { createMembership } from './membership.mjs';
const membership = createMembership();
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const files = new Set(['index.html', 'styles.css', 'app.js', 'wallpaper.js', 'project.js', 'drawing.js', 'navigation.js', 'shape-edit.js', 'branding.css', 'plans.js', 'plans.css', 'assets/favicon.svg', 'assets/fonts/space-grotesk-latin.woff2', 'assets/fonts/manrope-latin.woff2']);
http.createServer(async (req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (await membership(req, res, '/' + name)) return;
  if (!files.has(name)) { res.writeHead(404); res.end('Não encontrado'); return; }
  try { const data = await readFile(path.join(root, name)); res.writeHead(200, { 'Content-Type': types[path.extname(name)] }); res.end(data); }
  catch { res.writeHead(500); res.end('Não foi possível carregar o arquivo.'); }
}).listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('WallUltra disponível na porta ' + (process.env.PORT || 3000)));

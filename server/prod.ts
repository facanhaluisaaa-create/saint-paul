// Servidor de produção: serve o build (dist/) e a API de correção.
// Uso: npm run build && npm start   (porta: PORT, padrão 4173)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiMiddleware } from './http';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.env.PORT) || 4173;
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('dist/ não encontrado. Rode "npm run build" antes de "npm start".');
  process.exit(1);
}

http
  .createServer(async (req, res) => {
    if (await apiMiddleware(req, res, false)) return;
    const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let file = path.normalize(path.join(root, urlPath));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
    res.setHeader('Content-Type', TYPES[path.extname(file)] ?? 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`P1 Contabilidade — http://localhost:${port}`));

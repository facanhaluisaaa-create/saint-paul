import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApi } from './api';

const MAX_BODY = 1_000_000;

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('corpo muito grande'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve(undefined);
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

/** Middleware compatível com Connect (Vite) e com node:http puro. Retorna true se tratou a rota. */
export async function apiMiddleware(req: IncomingMessage, res: ServerResponse, dev: boolean): Promise<boolean> {
  if (!req.url?.startsWith('/api/')) return false;
  try {
    const body = req.method === 'POST' ? await readBody(req) : undefined;
    const r = await handleApi(req.method ?? 'GET', req.url, body, { dev });
    res.statusCode = r.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(r.json));
  } catch (e) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: (e as Error).message }));
  }
  return true;
}

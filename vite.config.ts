import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// STANDALONE=1 gera uma página autônoma (correção dentro do navegador, sem API) para publicação.
const standalone = process.env.STANDALONE === '1';

// Monta a API de correção dentro do servidor de desenvolvimento do Vite,
// para que `npm run dev` suba frontend + backend num único processo.
function apiPlugin(): Plugin {
  return {
    name: 'p1-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        // Carregado via SSR do Vite: edições no banco de questões recarregam sem reiniciar.
        const { apiMiddleware } = (await server.ssrLoadModule('/server/http.ts')) as typeof import('./server/http');
        await apiMiddleware(req, res, true);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ...(standalone ? [] : [apiPlugin()])],
  base: standalone ? './' : '/',
  define: { __STANDALONE__: JSON.stringify(standalone) },
  resolve: standalone ? { alias: { './llm': path.resolve(process.cwd(), 'server/llm.stub.ts') } } : undefined,
  build: standalone ? { outDir: 'dist-standalone' } : undefined,
  server: { port: 5173, host: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
} as any);

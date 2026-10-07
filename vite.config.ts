import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

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
  plugins: [react(), apiPlugin()],
  server: { port: 5173, host: true },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
} as any);

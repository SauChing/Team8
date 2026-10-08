import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { placesRouter } from './server/routes/places';
import { oneMapRouter } from './server/routes/onemap';
import { sessionsRouter } from './server/routes/sessions';
import healthHandler from './api/health.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // API endpoints
  app.use('/api/places', placesRouter);
  app.use('/api/onemap', oneMapRouter);
  app.use('/api/sessions', sessionsRouter);

  // Health check endpoints
  app.get('/api/health', healthHandler);
  app.get('/api/health.js', healthHandler);

  // Development: Mount Vite middlewares for seamless HMR & SPA serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Go Where Makan? server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

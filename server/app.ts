import express from 'express';
import { placesRouter } from './routes/places';
import { oneMapRouter } from './routes/onemap';
import { sessionsRouter } from './routes/sessions';
import {
  isVercel,
  vercelEnv,
  vercelUrl,
  vercelProductionUrl,
  appUrl,
  googleMapsApiKey,
  geminiApiKey,
  oneMapApiKey,
} from './config/env';

export const app = express();

app.use(express.json());

// API endpoints
app.use('/api/places', placesRouter);
app.use('/api/onemap', oneMapRouter);
app.use('/api/sessions', sessionsRouter);

// Health check endpoint (includes Vercel environment diagnosis)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Jiak Simi API',
    environment: vercelEnv,
    isVercel,
    deployment: {
      vercelUrl,
      vercelProductionUrl,
      canonicalUrl: appUrl,
    },
    integrations: {
      hasGoogleMapsKey: Boolean(
        googleMapsApiKey && !googleMapsApiKey.includes('YOUR_')
      ),
      hasGeminiKey: Boolean(geminiApiKey && !geminiApiKey.includes('MY_')),
      hasOneMapKey: Boolean(oneMapApiKey && !oneMapApiKey.includes('YOUR_')),
    },
    timestamp: new Date().toISOString(),
  });
});

// Environment & Configuration status endpoint (non-sensitive)
app.get('/api/config', (req, res) => {
  res.json({
    appUrl,
    isVercel,
    vercelEnv,
    hasGoogleMapsKey: Boolean(
      googleMapsApiKey && !googleMapsApiKey.includes('YOUR_')
    ),
    hasGeminiKey: Boolean(geminiApiKey && !geminiApiKey.includes('MY_')),
  });
});

export default app;

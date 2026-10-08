import dotenv from 'dotenv';

dotenv.config();

/**
 * Check if the current execution is running inside Vercel
 */
export const isVercel = Boolean(
  process.env.VERCEL === '1' ||
  process.env.VERCEL ||
  process.env.VERCEL_ENV
);

/**
 * Vercel environment: 'production' | 'preview' | 'development'
 */
export const vercelEnv =
  process.env.VERCEL_ENV ||
  (process.env.NODE_ENV === 'production' ? 'production' : 'development');

/**
 * Vercel automatic deployment URL (e.g. "team8-sauching.vercel.app")
 */
export const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : null;

/**
 * Vercel production custom domain URL (if configured in Vercel project settings)
 */
export const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : null;

/**
 * Canonical Application URL, prioritizing user-defined APP_URL / VITE_APP_URL,
 * followed by Vercel production domain, Vercel preview domain, and local port.
 */
export const appUrl = (() => {
  if (process.env.APP_URL && process.env.APP_URL.trim() !== '') {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  if (process.env.VITE_APP_URL && process.env.VITE_APP_URL.trim() !== '') {
    return process.env.VITE_APP_URL.replace(/\/+$/, '');
  }
  if (vercelProductionUrl) {
    return vercelProductionUrl.replace(/\/+$/, '');
  }
  if (vercelUrl) {
    return vercelUrl.replace(/\/+$/, '');
  }
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
})();

/**
 * Google Maps / Places API Key.
 * Checks standard backend env vars as well as Vercel / Vite prefixed variations.
 */
export const googleMapsApiKey = (() => {
  const candidate =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_PLACES_API_KEY ||
    '';
  return candidate.trim();
})();

/**
 * Google Gemini API Key.
 * Injected automatically by AI Studio or set in Vercel Environment Variables.
 */
export const geminiApiKey = (() => {
  const candidate =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    '';
  return candidate.trim();
})();

/**
 * Singapore OneMap API Key / Token for Geocode search.
 * Passed via Authorization header to https://www.onemap.gov.sg/api/common/elastic/search
 */
export const oneMapApiKey = (() => {
  const candidate =
    process.env.ONEMAP_API_KEY ||
    process.env.ONEMAP_TOKEN ||
    process.env.VITE_ONEMAP_API_KEY ||
    process.env.VITE_ONEMAP_TOKEN ||
    '';
  return candidate.trim();
})();


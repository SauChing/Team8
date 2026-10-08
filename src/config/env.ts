/**
 * Client-side environment configuration helper
 * Safely resolves URLs and environment flags across Vercel deployments,
 * AI Studio runtime, and local development.
 */

export const isVercel = Boolean(
  import.meta.env.VERCEL_URL ||
  (typeof process !== 'undefined' && process.env?.VERCEL_URL)
);

export const vercelEnv =
  import.meta.env.VERCEL_ENV ||
  (typeof process !== 'undefined' && process.env?.VERCEL_ENV) ||
  (import.meta.env.MODE === 'production' ? 'production' : 'development');

/**
 * Returns the canonical base URL for the active deployment,
 * falling back gracefully in client or SSR contexts.
 */
export const getAppBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${import.meta.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/+$/, '');
  }
  if (import.meta.env.VERCEL_URL) {
    return `https://${import.meta.env.VERCEL_URL}`.replace(/\/+$/, '');
  }
  if (typeof process !== 'undefined' && process.env?.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
};

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_URL?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_ONEMAP_API_KEY?: string;
  readonly VERCEL_URL?: string;
  readonly VERCEL_ENV?: string;
  readonly VERCEL_PROJECT_PRODUCTION_URL?: string;
  readonly VITE_IS_VERCEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import { Router, Request, Response } from 'express';
import { oneMapApiKey, oneMapEmail, oneMapPassword } from '../config/env';

export const oneMapRouter = Router();

// In-memory token store with auto-refresh cache
interface TokenCache {
  token: string | null;
  expiryUnixMs: number;
}

const tokenCache: TokenCache = {
  token: null,
  expiryUnixMs: 0,
};

/**
 * Helper to obtain a valid OneMap Bearer / Auth Token.
 * Order of priority:
 * 1. Request Authorization header
 * 2. Active cached token (if still valid)
 * 3. Static token from environment (ONEMAP_TOKEN or ONEMAP_API_KEY)
 * 4. Auto-mint via ONEMAP_EMAIL & ONEMAP_PASSWORD if configured
 */
async function getEffectiveToken(req?: Request): Promise<string | null> {
  const reqHeader = req?.headers['authorization'];
  if (reqHeader && reqHeader.trim()) {
    return reqHeader.replace(/^Bearer\s+/i, '').trim();
  }

  const now = Date.now();
  if (tokenCache.token && tokenCache.expiryUnixMs > now + 60 * 1000) {
    return tokenCache.token;
  }

  if (oneMapApiKey && !oneMapApiKey.includes('YOUR_')) {
    return oneMapApiKey;
  }

  if (oneMapEmail && oneMapPassword) {
    try {
      const minted = await mintOneMapToken(oneMapEmail, oneMapPassword);
      if (minted.access_token) {
        tokenCache.token = minted.access_token;
        // Default OneMap token validity is 3 days (259,200 seconds)
        const ttlMs = (minted.expiry_timestamp ? parseInt(minted.expiry_timestamp, 10) * 1000 : 3 * 24 * 60 * 60 * 1000) - now;
        tokenCache.expiryUnixMs = now + (ttlMs > 0 ? ttlMs : 3 * 24 * 60 * 60 * 1000);
        return tokenCache.token;
      }
    } catch (err: any) {
      console.warn('Auto-minting OneMap token failed:', err.message);
    }
  }

  return null;
}

/**
 * Mint a token directly from OneMap API
 * Endpoint: POST https://www.onemap.gov.sg/api/auth/post/getToken
 */
async function mintOneMapToken(email: string, pass: string): Promise<any> {
  const res = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ email, password: pass }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`);
  }
  return data;
}

/**
 * 1. MINT A TOKEN (POST /api/onemap/token or /api/onemap/getToken)
 * JSON Body: { email: string, password: string }
 * Lasts 3 days (72 hours). Caches token on server.
 */
oneMapRouter.post(['/token', '/getToken'], async (req: Request, res: Response) => {
  const email = (req.body?.email || oneMapEmail || '').trim();
  const password = (req.body?.password || oneMapPassword || '').trim();

  if (!email || !password) {
    return res.status(400).json({
      error: 'Email and password are required to mint a OneMap token.',
      hint: 'Provide {"email":"...","password":"..."} or set ONEMAP_EMAIL and ONEMAP_PASSWORD.',
    });
  }

  try {
    const data = await mintOneMapToken(email, password);
    const token = data.access_token;
    if (token) {
      tokenCache.token = token;
      tokenCache.expiryUnixMs = Date.now() + 3 * 24 * 60 * 60 * 1000;
    }
    return res.json({
      success: true,
      access_token: token,
      expiry_timestamp: data.expiry_timestamp,
      message: 'OneMap token minted successfully. Token cached for 3 days.',
    });
  } catch (err: any) {
    return res.status(400).json({
      error: err.message || 'Failed to mint OneMap token',
    });
  }
});

/**
 * 2. GEOCODE / SEARCH
 * Endpoint: GET /api/onemap/search?searchVal=...&returnGeom=Y&getAddrDetails=Y&pageNum=1
 * Authorization header required by OneMap v2.
 */
oneMapRouter.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.searchVal || req.query.q) as string;
  if (!query || !query.trim()) {
    return res.json({ results: [], totalNumPages: 0 });
  }

  const returnGeom = (req.query.returnGeom as string) || 'Y';
  const getAddrDetails = (req.query.getAddrDetails as string) || 'Y';
  const pageNum = (req.query.pageNum as string) || '1';

  try {
    const token = await getEffectiveToken(req);
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      query.trim()
    )}&returnGeom=${returnGeom}&getAddrDetails=${getAddrDetails}&pageNum=${pageNum}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    if (response.ok) {
      return res.json(data);
    }

    return res.status(response.status).json(data);
  } catch (err: any) {
    console.warn('OneMap search error:', err.message);
    res.status(500).json({ error: err.message, results: [] });
  }
});

/**
 * 3. REVERSE GEOCODE
 * Endpoint: GET /api/onemap/revgeocode?location=1.3,103.8&buffer=40&addressType=All
 * (Also supports ?lat=1.3&lng=103.8)
 */
oneMapRouter.get(['/revgeocode', '/revgeo'], async (req: Request, res: Response) => {
  let location = req.query.location as string;
  if (!location && req.query.lat && req.query.lng) {
    location = `${req.query.lat},${req.query.lng}`;
  }

  if (!location) {
    return res.status(400).json({ error: 'Missing location parameter (format: lat,lng)' });
  }

  const buffer = (req.query.buffer as string) || '40';
  const addressType = (req.query.addressType as string) || 'All';

  try {
    const token = await getEffectiveToken(req);
    const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${encodeURIComponent(
      location
    )}&buffer=${buffer}&addressType=${encodeURIComponent(addressType)}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    if (response.ok) {
      return res.json(data);
    }

    return res.status(response.status).json(data);
  } catch (err: any) {
    console.warn('OneMap reverse geocode error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. ROUTING: walk | drive | cycle | pt
 * Endpoint: GET /api/onemap/route?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk
 */
oneMapRouter.get('/route', async (req: Request, res: Response) => {
  const start = req.query.start as string;
  const end = req.query.end as string;
  const routeType = (req.query.routeType as string) || 'walk';

  if (!start || !end) {
    return res.status(400).json({
      error: 'Missing start or end coordinates (format: lat,lng)',
    });
  }

  try {
    const token = await getEffectiveToken(req);
    const url = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${encodeURIComponent(
      start
    )}&end=${encodeURIComponent(end)}&routeType=${encodeURIComponent(routeType)}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    if (response.ok) {
      return res.json(data);
    }

    return res.status(response.status).json(data);
  } catch (err: any) {
    console.warn('OneMap route calculation error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

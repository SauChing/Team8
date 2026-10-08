import { Router, Request, Response } from 'express';
import { oneMapApiKey } from '../config/env';

export const oneMapRouter = Router();

/**
 * OneMap Geocode / Search
 * Official Endpoint: https://www.onemap.gov.sg/api/common/elastic/search?searchVal=...&returnGeom=Y&getAddrDetails=Y&pageNum=1
 * Authorization header is passed to authenticate with OneMap.
 */
oneMapRouter.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.searchVal || req.query.q) as string;
  if (!query || !query.trim()) {
    return res.json({ results: [], totalNumPages: 0 });
  }

  const returnGeom = (req.query.returnGeom as string) || 'Y';
  const getAddrDetails = (req.query.getAddrDetails as string) || 'Y';
  const pageNum = (req.query.pageNum as string) || '1';

  // Authorization token from env or incoming request
  const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '').trim() || oneMapApiKey;

  try {
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      query.trim()
    )}&returnGeom=${returnGeom}&getAddrDetails=${getAddrDetails}&pageNum=${pageNum}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token && !token.includes('YOUR_')) {
      headers['Authorization'] = token;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    if (response.ok) {
      return res.json(data);
    }

    return res.status(response.status).json(data);
  } catch (err: any) {
    console.warn('OneMap search proxy error:', err.message);
    res.status(500).json({ error: err.message, results: [] });
  }
});

/**
 * OneMap Reverse Geocode (Helper for user GPS resolution)
 */
oneMapRouter.get(['/revgeocode', '/revgeo'], async (req: Request, res: Response) => {
  let location = req.query.location as string;
  if (!location && req.query.lat && req.query.lng) {
    location = `${req.query.lat},${req.query.lng}`;
  }

  if (!location) {
    return res.status(400).json({ error: 'Missing coordinates (lat,lng)' });
  }

  const buffer = (req.query.buffer as string) || '40';
  const addressType = (req.query.addressType as string) || 'All';
  const token = req.headers['authorization']?.replace(/^Bearer\s+/i, '').trim() || oneMapApiKey;

  try {
    const url = `https://www.onemap.gov.sg/api/public/revgeocode?location=${encodeURIComponent(
      location
    )}&buffer=${buffer}&addressType=${encodeURIComponent(addressType)}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token && !token.includes('YOUR_')) {
      headers['Authorization'] = token;
    }

    const response = await fetch(url, { headers });
    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
    res.json({ address: null });
  } catch {
    res.json({ address: null });
  }
});

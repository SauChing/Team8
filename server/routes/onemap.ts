import { Router, Request, Response } from 'express';
import { oneMapApiKey } from '../config/env';

export const oneMapRouter = Router();

oneMapRouter.get('/search', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query || !query.trim()) {
    return res.json({ results: [] });
  }

  try {
    const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
      query.trim()
    )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (oneMapApiKey && !oneMapApiKey.includes('YOUR_')) {
      headers['Authorization'] = oneMapApiKey;
    }

    const response = await fetch(url, { headers });

    if (response.ok) {
      const data = await response.json();
      return res.json({
        results: data.results || [],
        totalNumPages: data.totalNumPages || 0,
      });
    }
    
    res.json({ results: [] });
  } catch (err: any) {
    console.warn('OneMap search proxy error:', err.message);
    res.json({ results: [] });
  }
});

oneMapRouter.get('/revgeo', async (req: Request, res: Response) => {
  const lat = req.query.lat as string;
  const lng = req.query.lng as string;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  try {
    const url = `https://www.onemap.gov.sg/api/public/revgeocodexy?location=${lat},${lng}&buffer=100`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.GeocodeInfo?.[0]?.BUILDINGNAME) {
        return res.json({ address: data.GeocodeInfo[0].BUILDINGNAME });
      }
    }
  } catch {
    // fallback
  }

  res.json({ address: null });
});

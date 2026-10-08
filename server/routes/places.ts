import { Router, Request, Response } from 'express';
import { SINGAPORE_RESTAURANTS, calculateDistanceMeters } from '../../src/data/singaporePlaces';
import { MakanFilterParams, Restaurant } from '../../src/types/restaurant';
import { fetchGooglePlaces } from '../providers/googlePlacesProvider';
import { googleMapsApiKey, isVercel } from '../config/env';

export const placesRouter = Router();

placesRouter.get('/status', (req: Request, res: Response) => {
  const apiKey = googleMapsApiKey;
  const hasKey = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('YOUR_'));
  res.json({
    hasGoogleMapsKey: hasKey,
    activeProvider: hasKey ? 'Google Places API (Live)' : 'Curated Singapore Makan Dataset (Fast & Offline-Ready)',
    oneMapConfigured: true,
    isVercel,
    message: hasKey
      ? 'Google Places API is active with secure server-side proxy.'
      : 'Using the rich Singapore food dataset covering iconic hawkers, kopitiams, and cafes. Add GOOGLE_MAPS_API_KEY to switch anytime.',
  });
});

placesRouter.get('/search', async (req: Request, res: Response) => {
  const apiKey = googleMapsApiKey;
  const hasKey = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('YOUR_'));

  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
  const radius = req.query.maxDistance ? parseInt(req.query.maxDistance as string, 10) : undefined;
  const query = req.query.query as string | undefined;
  const cuisine = req.query.cuisine as string | undefined;
  const price = req.query.price ? parseInt(req.query.price as string, 10) : undefined;
  const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
  const halalOnly = req.query.halalOnly === 'true';
  const vegetarianOnly = req.query.vegetarianOnly === 'true';
  const openNow = req.query.openNow === 'true';

  // If Google Places API key is configured, attempt search through Google Places
  if (hasKey && apiKey) {
    try {
      const places = await fetchGooglePlaces(apiKey, {
        lat,
        lng,
        radius,
        query,
        cuisine,
        openNow,
        minRating,
        price,
      });

      if (places.length > 0) {
        // Calculate distance if lat/lng available
        const withDistance = places.map((p) => {
          if (lat !== undefined && lng !== undefined) {
            return {
              ...p,
              distanceMeters: calculateDistanceMeters(lat, lng, p.latitude, p.longitude),
            };
          }
          return p;
        });

        return res.json({
          restaurants: withDistance,
          total: withDistance.length,
          source: 'google_places',
        });
      }
    } catch (err: any) {
      console.warn('Google Places API call encountered error, falling back to curated dataset:', err.message);
    }
  }

  // Curated Singapore dataset fallback / default engine
  let filtered: Restaurant[] = SINGAPORE_RESTAURANTS.map((place) => {
    let distanceMeters: number | undefined = undefined;
    if (lat !== undefined && lng !== undefined) {
      distanceMeters = calculateDistanceMeters(lat, lng, place.latitude, place.longitude);
    }
    return {
      ...place,
      distanceMeters,
    };
  });

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.cuisine.toLowerCase().includes(q) ||
        (p.subCuisine && p.subCuisine.toLowerCase().includes(q)) ||
        p.highlightDish.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (cuisine && cuisine !== 'All') {
    const c = cuisine.toLowerCase();
    filtered = filtered.filter((p) => {
      if (c === 'halal') return p.isHalal;
      if (c === 'vegetarian') return p.isVegetarianFriendly;
      return p.cuisine.toLowerCase() === c || (p.subCuisine && p.subCuisine.toLowerCase().includes(c));
    });
  }

  if (halalOnly) {
    filtered = filtered.filter((p) => p.isHalal);
  }

  if (vegetarianOnly) {
    filtered = filtered.filter((p) => p.isVegetarianFriendly);
  }

  if (openNow) {
    filtered = filtered.filter((p) => p.isOpenNow);
  }

  if (price) {
    filtered = filtered.filter((p) => p.priceLevel <= price);
  }

  if (minRating && minRating > 0) {
    filtered = filtered.filter((p) => p.rating >= minRating);
  }

  if (radius && lat !== undefined && lng !== undefined) {
    filtered = filtered.filter((p) => p.distanceMeters !== undefined && p.distanceMeters <= radius);
  }

  // Sort by distance if location provided, else rating
  if (lat !== undefined && lng !== undefined) {
    filtered.sort((a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999));
  } else {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    restaurants: filtered,
    total: filtered.length,
    source: 'singapore_curated',
  });
});

// Photo proxy to protect Google API Key from being exposed to frontend
placesRouter.get('/photo', async (req: Request, res: Response) => {
  const photoRef = req.query.ref as string;
  const apiKey = googleMapsApiKey;

  if (!photoRef || !apiKey) {
    return res.status(400).send('Missing photo reference or API key');
  }

  try {
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(
      photoRef
    )}&key=${apiKey}`;
    const photoRes = await fetch(photoUrl);
    if (!photoRes.ok) {
      return res.status(photoRes.status).send('Failed to fetch photo from Google');
    }
    const contentType = photoRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const buffer = await photoRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.status(500).send('Error proxying photo');
  }
});

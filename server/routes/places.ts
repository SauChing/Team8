import { Router, Request, Response } from 'express';
import { SINGAPORE_RESTAURANTS, calculateDistanceMeters } from '../../src/data/singaporePlaces';
import { MakanFilterParams, Restaurant } from '../../src/types/restaurant';
import { fetchGooglePlaces } from '../providers/googlePlacesProvider';

export const placesRouter = Router();

placesRouter.get('/status', (req: Request, res: Response) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  const hasKey = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('YOUR_'));
  res.json({
    hasGoogleMapsKey: hasKey,
    activeProvider: hasKey ? 'Google Places API (Live)' : 'Curated Singapore Makan Dataset (Fast & Offline-Ready)',
    oneMapConfigured: true,
    message: hasKey
      ? 'Google Places API is active with secure server-side proxy.'
      : 'Using the rich Singapore food dataset covering iconic hawkers, kopitiams, and cafes. Add GOOGLE_MAPS_API_KEY to switch anytime.',
  });
});

placesRouter.get('/search', async (req: Request, res: Response) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
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

// In-memory session key cache if user enters their key in the UI inspector
let sessionPlacesApiKey: string = '';

// Photo proxy to protect Google API Key from being exposed to frontend
placesRouter.get('/photo', async (req: Request, res: Response) => {
  const photoRef = req.query.ref as string;
  const apiKey = sessionPlacesApiKey || process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

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

/**
 * Places API (New) v1 Place Details Endpoint:
 * Matches: https://places.googleapis.com/v1/places/{placeId}?fields=id,displayName,photos
 */
placesRouter.get('/v1/details', async (req: Request, res: Response) => {
  const placeId = (req.query.placeId as string) || 'ChIJj61dQgK6j4AR4GeTYWZsKWw';
  const providedKey = (req.query.key as string) || (req.headers['x-places-api-key'] as string) || sessionPlacesApiKey;
  const effectiveKey = providedKey || process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  const fields = (req.query.fields as string) || 'id,displayName,photos,formattedAddress,rating,userRatingCount,priceLevel,types,googleMapsUri';

  if (!effectiveKey || effectiveKey.includes('YOUR_')) {
    // Provide a rich diagnostic response with mock place details and food images
    // so the UI works seamlessly even before the user pastes their API key
    const fallbackPlaces: Record<string, any> = {
      'ChIJj61dQgK6j4AR4GeTYWZsKWw': {
        id: 'ChIJj61dQgK6j4AR4GeTYWZsKWw',
        displayName: { text: 'Google Charleston Park Cafe & Kitchen', languageCode: 'en' },
        formattedAddress: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
        rating: 4.6,
        userRatingCount: 320,
        priceLevel: 'PRICE_LEVEL_MODERATE',
        types: ['cafe', 'restaurant', 'food', 'point_of_interest'],
        googleMapsUri: 'https://maps.google.com/?cid=12404021798363842340',
        photos: [
          {
            name: 'places/ChIJj61dQgK6j4AR4GeTYWZsKWw/photos/sample_grain_bowl',
            proxiedPhotoUrl: '/src/assets/images/sg_grain_bowl_1791424515411.jpg',
            authorAttributions: [{ displayName: 'Google Food Team' }],
          },
          {
            name: 'places/ChIJj61dQgK6j4AR4GeTYWZsKWw/photos/sample_japanese',
            proxiedPhotoUrl: '/src/assets/images/sg_japanese_dining_1791424498484.jpg',
            authorAttributions: [{ displayName: 'Culinary Team' }],
          },
        ],
      },
    };

    const simulated = fallbackPlaces[placeId] || {
      id: placeId,
      displayName: { text: 'Singapore Makan Spot', languageCode: 'en' },
      formattedAddress: 'Singapore Central Business District',
      rating: 4.5,
      userRatingCount: 180,
      photos: [
        {
          name: `places/${placeId}/photos/sample_chicken_rice`,
          proxiedPhotoUrl: '/src/assets/images/sg_chicken_rice_1791423539489.jpg',
          authorAttributions: [{ displayName: 'Foodie Guide' }],
        },
      ],
    };

    return res.json({
      success: true,
      isSimulated: true,
      place: simulated,
      targetUrl: `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&key=YOUR_API_KEY`,
      notice: 'To connect directly to live Google servers, enter your Google Places API Key in the inspector.',
    });
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=${encodeURIComponent(
      fields
    )}&key=${encodeURIComponent(effectiveKey)}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Goog-Api-Key': effectiveKey,
        'X-Goog-FieldMask': fields,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error?.message || `Google Places v1 API returned status ${response.status}`,
        raw: data,
        targetUrl: `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}&key=***`,
      });
    }

    // Attach proxied photo URLs
    if (data.photos && Array.isArray(data.photos)) {
      data.photos = data.photos.map((p: any) => ({
        ...p,
        proxiedPhotoUrl: `/api/places/v1/photo?name=${encodeURIComponent(p.name)}`,
      }));
    }

    res.json({
      success: true,
      isSimulated: false,
      place: data,
      targetUrl: `https://places.googleapis.com/v1/places/${placeId}?fields=${fields}`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Error executing Places API (New) v1 request',
    });
  }
});

/**
 * Places API (New) v1 Photo Media Proxy:
 * Matches: https://places.googleapis.com/v1/{photoName}/media?maxHeightPx=800&maxWidthPx=800&key={apiKey}
 */
placesRouter.get('/v1/photo', async (req: Request, res: Response) => {
  const photoName = req.query.name as string;
  const providedKey = (req.query.key as string) || sessionPlacesApiKey;
  const apiKey = providedKey || process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

  if (!photoName) {
    return res.status(400).send('Missing photo name parameter');
  }

  // If photo is one of our local mock references, stream local image
  if (photoName.includes('sample_grain_bowl')) {
    return res.redirect('/src/assets/images/sg_grain_bowl_1791424515411.jpg');
  }
  if (photoName.includes('sample_japanese')) {
    return res.redirect('/src/assets/images/sg_japanese_dining_1791424498484.jpg');
  }
  if (photoName.includes('sample_chicken_rice')) {
    return res.redirect('/src/assets/images/sg_chicken_rice_1791423539489.jpg');
  }

  if (!apiKey || apiKey.includes('YOUR_')) {
    // Return sample food image fallback
    return res.redirect('/src/assets/images/sg_laksa_bowl_1791423551806.jpg');
  }

  try {
    const cleanName = photoName.replace(/^\/+/, '');
    const maxHeight = req.query.maxHeightPx ? parseInt(req.query.maxHeightPx as string, 10) : 800;
    const maxWidth = req.query.maxWidthPx ? parseInt(req.query.maxWidthPx as string, 10) : 800;

    const googlePhotoUrl = `https://places.googleapis.com/v1/${cleanName}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${encodeURIComponent(
      apiKey
    )}`;

    const response = await fetch(googlePhotoUrl, {
      headers: {
        'X-Goog-Api-Key': apiKey,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.redirect('/src/assets/images/sg_nasi_lemak_1791423573262.jpg');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) {
    res.redirect('/src/assets/images/sg_roti_prata_1791423563304.jpg');
  }
});

/**
 * Configure / test an API key for the current session
 */
placesRouter.post('/v1/session-key', (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (typeof apiKey === 'string') {
    sessionPlacesApiKey = apiKey.trim();
  }
  res.json({
    success: true,
    hasSessionKey: Boolean(sessionPlacesApiKey),
    sessionKeyPreview: sessionPlacesApiKey
      ? `${sessionPlacesApiKey.substring(0, 6)}...${sessionPlacesApiKey.substring(sessionPlacesApiKey.length - 4)}`
      : null,
  });
});

/**
 * Curated Singapore Makan presets with Place IDs for quick testing
 */
placesRouter.get('/v1/presets', (req: Request, res: Response) => {
  res.json({
    presets: [
      {
        placeId: 'ChIJj61dQgK6j4AR4GeTYWZsKWw',
        title: 'User Requested API Place (Googleplex Dining / Cafe)',
        description: 'Exact place ID from user prompt: https://places.googleapis.com/v1/places/ChIJj61dQgK6j4AR4GeTYWZsKWw',
        cuisine: 'Cafe & Dining',
      },
      {
        placeId: 'ChIJy30wLmwZ2jERr63rO6qC04M',
        title: 'Tian Tian Hainanese Chicken Rice',
        description: 'Maxwell Food Centre, Singapore — World-famous Michelin Bib Gourmand',
        cuisine: 'Singapore Chicken Rice',
      },
      {
        placeId: 'ChIJk_J921oZ2jERQp3M4R8s4mY',
        title: 'Springleaf Prata Place',
        description: 'Icon Village / Tanjong Pagar — Iconic crispy roti prata & curries',
        cuisine: 'Indian Muslim / Prata',
      },
      {
        placeId: 'ChIJ_2UfM2kZ2jER_mX8fX6jDfs',
        title: 'Maxwell Food Centre',
        description: '1 Kadayanallur St, Chinatown / Tanjong Pagar — 100+ iconic hawker stalls',
        cuisine: 'Hawker Centre',
      },
      {
        placeId: 'ChIJ-57l3gMZ2jER9p0Rvdg9-vA',
        title: 'Nusantara Singapore (Cecil St)',
        description: '135 Cecil St — Halal modern Nasi Padang & Ayam Bakar',
        cuisine: 'Malay / Indonesian',
      },
      {
        placeId: 'ChIJwffp620Z2jER1W7oT58_q2w',
        title: 'Harvest & Grain (Telok Ayer)',
        description: 'CBD health bowls, roasted salmon & warm quinoa',
        cuisine: 'Healthy / Grain Bowls',
      },
    ],
  });
});


import { Restaurant } from '../../src/types/restaurant';

export interface PlacePhotoV1 {
  name: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: {
    displayName: string;
    uri?: string;
    photoUri?: string;
  }[];
  proxiedPhotoUrl?: string;
}

export interface PlaceDetailsV1 {
  id: string;
  displayName?: {
    text: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string | number;
  photos?: PlacePhotoV1[];
  types?: string[];
  googleMapsUri?: string;
  primaryType?: string;
}

/**
 * Fetch Place Details from Google Places API (New) v1 endpoint:
 * https://places.googleapis.com/v1/places/{placeId}
 */
export async function fetchPlaceDetailsV1(
  placeId: string,
  apiKey?: string,
  fields: string = 'id,displayName,photos,formattedAddress,rating,userRatingCount,priceLevel,types,googleMapsUri'
): Promise<{ success: boolean; place?: PlaceDetailsV1; error?: string; raw?: any }> {
  const effectiveKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

  if (!effectiveKey || effectiveKey.includes('YOUR_')) {
    return {
      success: false,
      error: 'No Google Places API key provided. Supply a key via the API inspector or set GOOGLE_MAPS_API_KEY.',
    };
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=${encodeURIComponent(
    fields
  )}&key=${encodeURIComponent(effectiveKey)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-Goog-Api-Key': effectiveKey,
        'X-Goog-FieldMask': fields,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || `Google Places v1 API returned status ${response.status}`,
        raw: data,
      };
    }

    // Attach proxied photo URLs so clients can render without exposing API key
    if (data.photos && Array.isArray(data.photos)) {
      data.photos = data.photos.map((p: any) => ({
        ...p,
        proxiedPhotoUrl: `/api/places/v1/photo?name=${encodeURIComponent(p.name)}`,
      }));
    }

    return {
      success: true,
      place: data,
      raw: data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error fetching Place Details (New)',
    };
  }
}

/**
 * Fetch Place Photo media from Google Places API (New) v1:
 * https://places.googleapis.com/v1/{photoName}/media?maxHeightPx=800&maxWidthPx=800&key={apiKey}
 */
export async function fetchPlacePhotoMediaV1(
  photoName: string,
  apiKey?: string,
  maxHeight: number = 800,
  maxWidth: number = 800
): Promise<Response> {
  const effectiveKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

  if (!effectiveKey || effectiveKey.includes('YOUR_')) {
    throw new Error('API key required for Google Places v1 photo media');
  }

  // photoName can be "places/{placeId}/photos/{photoId}" or encoded
  const cleanName = photoName.replace(/^\/+/, '');
  const url = `https://places.googleapis.com/v1/${cleanName}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${encodeURIComponent(
    effectiveKey
  )}`;

  return await fetch(url, {
    headers: {
      'X-Goog-Api-Key': effectiveKey,
    },
    redirect: 'follow',
  });
}

export async function fetchGooglePlaces(
  apiKey: string,
  params: {
    lat?: number;
    lng?: number;
    radius?: number;
    query?: string;
    cuisine?: string;
    openNow?: boolean;
    minRating?: number;
    price?: number;
  }
): Promise<Restaurant[]> {
  const { lat, lng, radius = 3000, query, cuisine, openNow } = params;

  // Build search term tailored for Singapore
  let searchTerm = 'food restaurant hawker makan';
  if (query) {
    searchTerm = `${query} Singapore`;
  } else if (cuisine && cuisine !== 'All') {
    searchTerm = `${cuisine} food Singapore`;
  }

  let apiUrl = '';
  if (lat !== undefined && lng !== undefined) {
    // Nearby search with location bias
    apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(
      searchTerm
    )}&type=restaurant|meal_takeaway|cafe&key=${apiKey}`;
    if (openNow) {
      apiUrl += '&opennow=true';
    }
  } else {
    // Text search
    apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      `${searchTerm} in Singapore`
    )}&type=restaurant&key=${apiKey}`;
  }

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Google Places API responded with status ${response.status}`);
  }

  const data = await response.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places error: ${data.status} - ${data.error_message || ''}`);
  }

  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  // Transform Google Places payload to Restaurant model
  return data.results.map((place: any, index: number): Restaurant => {
    const pLat = place.geometry?.location?.lat || 1.3521;
    const pLng = place.geometry?.location?.lng || 103.8198;
    const photoRef = place.photos?.[0]?.photo_reference;

    // Secure proxy photo URL so API key is never exposed on client
    const photoUrl = photoRef
      ? `/api/places/photo?ref=${encodeURIComponent(photoRef)}`
      : 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';

    const priceLevelMap: Record<number, 1 | 2 | 3> = {
      0: 1,
      1: 1,
      2: 2,
      3: 3,
      4: 3,
    };

    const priceLevel = priceLevelMap[place.price_level] || 1;
    const nameLower = (place.name || '').toLowerCase();
    const isHalal = nameLower.includes('halal') || nameLower.includes('muslim') || nameLower.includes('zam zam');
    const isVegetarianFriendly = nameLower.includes('veg') || nameLower.includes('vegetarian');

    let inferredCuisine = cuisine && cuisine !== 'All' ? cuisine : 'Hawker';
    if (nameLower.includes('cafe') || nameLower.includes('coffee')) inferredCuisine = 'Cafe';
    else if (nameLower.includes('prata') || nameLower.includes('curry') || nameLower.includes('briyani')) inferredCuisine = 'Indian';
    else if (nameLower.includes('sushi') || nameLower.includes('ramen') || nameLower.includes('japanese')) inferredCuisine = 'Japanese';
    else if (nameLower.includes('korean') || nameLower.includes('bbq')) inferredCuisine = 'Korean';
    else if (nameLower.includes('thai')) inferredCuisine = 'Thai';
    else if (nameLower.includes('burger') || nameLower.includes('pizza') || nameLower.includes('pasta')) inferredCuisine = 'Western';

    return {
      id: place.place_id || `gplace-${index}`,
      name: place.name || 'Singapore Eatery',
      cuisine: inferredCuisine,
      subCuisine: place.types?.[0]?.replace(/_/g, ' ') || 'Singapore Dining',
      address: place.vicinity || place.formatted_address || 'Singapore',
      nearestMrt: 'Nearest Singapore MRT nearby',
      latitude: pLat,
      longitude: pLng,
      rating: place.rating || 4.2,
      reviewCount: place.user_ratings_total || 120,
      priceLevel,
      isHalal,
      isVegetarianFriendly,
      isOpenNow: place.opening_hours?.open_now ?? true,
      openingHoursText: place.opening_hours?.open_now ? 'Open now' : 'Check place hours',
      photoUrl,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || 'Singapore')}&query_place_id=${place.place_id || ''}`,
      highlightDish: 'Chef Recommended Specialty',
      vibe: place.types?.includes('meal_takeaway') ? 'Casual Makan Spot' : 'Dine-In Restaurant',
      description: `Popular spot in Singapore rated ${place.rating || 4.2}★ by ${place.user_ratings_total || 100}+ food lovers.`,
    };
  });
}

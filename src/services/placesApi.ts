import { Restaurant, MakanFilterParams } from '../types/restaurant';
import { SINGAPORE_RESTAURANTS, calculateDistanceMeters } from '../data/singaporePlaces';

export interface PlacesSearchResult {
  restaurants: Restaurant[];
  total: number;
  source: 'google_places' | 'singapore_curated';
  userCoords?: { latitude: number; longitude: number };
}

export interface ProviderStatus {
  hasGoogleMapsKey: boolean;
  activeProvider: string;
  oneMapConfigured: boolean;
  message: string;
}

/**
 * Service to search makan spots in Singapore.
 * Communicates with the backend proxy /api/places/search to protect API keys.
 * If backend is unreachable or returns a fallback response, it gracefully
 * processes the curated Singapore makan dataset with accurate distance calculations.
 */
export async function searchRestaurants(params: MakanFilterParams): Promise<PlacesSearchResult> {
  const queryParams = new URLSearchParams();

  if (params.query) queryParams.set('query', params.query);
  if (params.cuisine && params.cuisine !== 'All') queryParams.set('cuisine', params.cuisine);
  if (params.maxDistanceMeters) queryParams.set('maxDistance', params.maxDistanceMeters.toString());
  if (params.priceLevel) queryParams.set('price', params.priceLevel.toString());
  if (params.minRating && params.minRating > 0) queryParams.set('minRating', params.minRating.toString());
  if (params.halalOnly) queryParams.set('halalOnly', 'true');
  if (params.vegetarianOnly) queryParams.set('vegetarianOnly', 'true');
  if (params.openNow) queryParams.set('openNow', 'true');
  if (params.latitude !== undefined) queryParams.set('lat', params.latitude.toString());
  if (params.longitude !== undefined) queryParams.set('lng', params.longitude.toString());

  try {
    const response = await fetch(`/api/places/search?${queryParams.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.restaurants)) {
        return {
          restaurants: data.restaurants,
          total: data.total || data.restaurants.length,
          source: data.source || 'google_places',
          userCoords: params.latitude && params.longitude ? { latitude: params.latitude, longitude: params.longitude } : undefined,
        };
      }
    }
  } catch {
    // Backend API fetch failed or network offline, fallback to robust client-side engine
    console.info('Using local Singapore curated restaurant engine (seamless fallback)');
  }

  // Client-side execution engine using curated Singapore dataset
  return filterCuratedRestaurants(params);
}

/**
 * Robust filtering engine for the curated Singapore makan dataset
 */
export function filterCuratedRestaurants(params: MakanFilterParams): PlacesSearchResult {
  const userLat = params.latitude;
  const userLng = params.longitude;

  let results = SINGAPORE_RESTAURANTS.map((place) => {
    let distanceMeters: number | undefined = undefined;
    if (userLat !== undefined && userLng !== undefined) {
      distanceMeters = calculateDistanceMeters(userLat, userLng, place.latitude, place.longitude);
    }
    return {
      ...place,
      distanceMeters,
    };
  });

  // Filter: Search Query (text search in name, subCuisine, highlightDish, description, address, vibe)
  if (params.query && params.query.trim()) {
    const q = params.query.trim().toLowerCase();
    results = results.filter((place) => {
      return (
        place.name.toLowerCase().includes(q) ||
        place.cuisine.toLowerCase().includes(q) ||
        (place.subCuisine && place.subCuisine.toLowerCase().includes(q)) ||
        place.highlightDish.toLowerCase().includes(q) ||
        place.description.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        place.vibe.toLowerCase().includes(q)
      );
    });
  }

  // Filter: Cuisine
  if (params.cuisine && params.cuisine !== 'All') {
    const c = params.cuisine.toLowerCase();
    results = results.filter((place) => {
      if (c === 'halal') return place.isHalal;
      if (c === 'vegetarian') return place.isVegetarianFriendly;
      return (
        place.cuisine.toLowerCase() === c ||
        (place.subCuisine && place.subCuisine.toLowerCase().includes(c))
      );
    });
  }

  // Filter: Halal Only
  if (params.halalOnly) {
    results = results.filter((place) => place.isHalal);
  }

  // Filter: Vegetarian Only
  if (params.vegetarianOnly) {
    results = results.filter((place) => place.isVegetarianFriendly);
  }

  // Filter: Open Now
  if (params.openNow) {
    results = results.filter((place) => place.isOpenNow);
  }

  // Filter: Price Level
  if (params.priceLevel) {
    results = results.filter((place) => place.priceLevel <= (params.priceLevel || 3));
  }

  // Filter: Min Rating
  if (params.minRating && params.minRating > 0) {
    results = results.filter((place) => place.rating >= (params.minRating || 0));
  }

  // Filter: Max Distance
  if (params.maxDistanceMeters && userLat !== undefined && userLng !== undefined) {
    results = results.filter(
      (place) => place.distanceMeters !== undefined && place.distanceMeters <= (params.maxDistanceMeters || 5000)
    );
  }

  // Sort by distance if user location is available, otherwise by rating
  if (userLat !== undefined && userLng !== undefined) {
    results.sort((a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999));
  } else {
    results.sort((a, b) => b.rating - a.rating);
  }

  return {
    restaurants: results,
    total: results.length,
    source: 'singapore_curated',
    userCoords: userLat && userLng ? { latitude: userLat, longitude: userLng } : undefined,
  };
}

/**
 * Checks provider status and active configuration
 */
export async function getProviderStatus(): Promise<ProviderStatus> {
  try {
    const res = await fetch('/api/places/status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }

  return {
    hasGoogleMapsKey: false,
    activeProvider: 'Curated Singapore Makan Dataset (Offline Ready)',
    oneMapConfigured: true,
    message: 'Running in built-in Singapore food database mode. No API keys required for full functionality.',
  };
}

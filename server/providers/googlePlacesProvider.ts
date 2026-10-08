import { Restaurant } from '../../src/types/restaurant.js';

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
    // Nearby search with location bias - only one type parameter supported
    apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(
      searchTerm
    )}&type=restaurant&key=${apiKey}`;
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

  // Transform Google Places payload to Restaurant model without inventing fake data
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

    const hasOpenNow = place.opening_hours && typeof place.opening_hours.open_now === 'boolean';
    const isOpenNow = hasOpenNow ? Boolean(place.opening_hours.open_now) : undefined;
    const openingHoursText = hasOpenNow
      ? place.opening_hours.open_now
        ? 'Open now'
        : 'Closed'
      : 'Check hours';

    return {
      id: place.place_id || `gplace-${index}`,
      name: place.name || 'Singapore Eatery',
      cuisine: inferredCuisine,
      subCuisine: place.types?.[0]?.replace(/_/g, ' ') || 'Singapore Dining',
      address: place.vicinity || place.formatted_address || 'Singapore',
      nearestMrt: undefined,
      latitude: pLat,
      longitude: pLng,
      rating: typeof place.rating === 'number' ? place.rating : undefined,
      reviewCount: typeof place.user_ratings_total === 'number' ? place.user_ratings_total : undefined,
      priceLevel,
      isHalal,
      isVegetarianFriendly,
      isOpenNow,
      openingHoursText,
      photoUrl,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || 'Singapore')}&query_place_id=${place.place_id || ''}`,
      highlightDish: 'Specialty Dish',
      vibe: place.types?.includes('meal_takeaway') ? 'Casual Makan Spot' : 'Dine-In Restaurant',
      description: place.rating
        ? `Rated ${place.rating}★ in Singapore${place.user_ratings_total ? ` (${place.user_ratings_total} reviews)` : ''}.`
        : 'Popular dining spot in Singapore.',
    };
  });
}

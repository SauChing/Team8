export interface Restaurant {
  id: string;
  name: string;
  cuisine: string; // e.g. "Hawker", "Chinese", "Malay", "Indian", "Japanese", "Korean", "Thai", "Western", "Cafe", "Fast Food", "Vegetarian", "Halal"
  subCuisine?: string; // e.g. "Chicken Rice", "Laksa", "Roti Prata", "Nasi Lemak", "Bak Chor Mee", "Dim Sum", "Mala Hotpot"
  address: string;
  nearestMrt?: string; // e.g. "Maxwell MRT (TE18) - 2 min walk"
  postalCode?: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number; // Calculated dynamically from user coordinates
  rating: number; // e.g. 4.6
  reviewCount: number; // e.g. 1820
  priceLevel: 1 | 2 | 3; // 1 = $ (Under $10, hawker/kopitiam), 2 = $$ ($10-$30, casual/cafe), 3 = $$$ ($30+, restaurant)
  isHalal: boolean;
  isVegetarianFriendly: boolean;
  isOpenNow: boolean;
  isOpenAllNight?: boolean;
  openingHoursText: string;
  photoUrl: string;
  mapsUrl: string;
  highlightDish: string;
  vibe: string; // "Hawker Centre", "Kopitiam", "Aircon Cafe", "Supper Spot", "Heritage Bistro"
  description: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  label?: string;
  address?: string;
}

export interface MakanFilterParams {
  query?: string;
  cuisine?: string;
  maxDistanceMeters?: number; // 500, 1000, 3000, 5000, or undefined for any
  priceLevel?: number; // 1, 2, 3, or undefined
  minRating?: number; // 0, 4.0, 4.5
  halalOnly?: boolean;
  vegetarianOnly?: boolean;
  openNow?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface OneMapSearchResult {
  SEARCHVAL: string;
  BLK_NO?: string;
  ROAD_NAME?: string;
  BUILDING?: string;
  ADDRESS?: string;
  POSTAL?: string;
  X?: string;
  Y?: string;
  LATITUDE: string;
  LONGITUDE: string;
}

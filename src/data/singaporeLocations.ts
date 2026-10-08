import { LocationCoordinates } from '../types/restaurant';

export interface FoodieHub {
  name: string;
  badge: string;
  coords: LocationCoordinates;
  description: string;
}

export const POPULAR_FOODIE_HUBS: FoodieHub[] = [
  {
    name: 'Maxwell & Chinatown',
    badge: 'Hawker Royalty',
    coords: { latitude: 1.2805, longitude: 103.8446, label: 'Maxwell Food Centre, Chinatown' },
    description: 'Iconic chicken rice, oyster cake, and heritage street eats'
  },
  {
    name: 'Bugis & Kampong Gelam',
    badge: 'Halal & Cafes',
    coords: { latitude: 1.3005, longitude: 103.8591, label: 'Bugis & Haji Lane' },
    description: 'Zam Zam murtabak, specialty coffee roasters, and dessert alleys'
  },
  {
    name: 'Telok Ayer & Amoy',
    badge: 'CBD Lunch & Drinks',
    coords: { latitude: 1.2798, longitude: 103.8475, label: 'Amoy Street & Telok Ayer' },
    description: 'Award-winning hawker stalls, ramen bars, and chic bistro lunch spots'
  },
  {
    name: 'Tiong Bahru',
    badge: 'Art Deco & Kopitiam',
    coords: { latitude: 1.2862, longitude: 103.8322, label: 'Tiong Bahru Market' },
    description: 'Famous chwee kueh, roast meats, and artisanal croissants'
  },
  {
    name: 'Katong & Joo Chiat',
    badge: 'Peranakan & Laksa',
    coords: { latitude: 1.3054, longitude: 103.9038, label: 'East Coast Rd, Katong' },
    description: 'Spicy Katong laksa, traditional kueh, and vibrant shophouse cafes'
  },
  {
    name: 'Old Airport Road',
    badge: 'Hawker Mecca',
    coords: { latitude: 1.3082, longitude: 103.8858, label: 'Old Airport Road Food Centre' },
    description: 'Roan minced meat noodles, lor mee, rojak, and soya beancurd'
  },
  {
    name: 'Little India',
    badge: 'Spices & Prata',
    coords: { latitude: 1.3068, longitude: 103.8522, label: 'Little India (Tekka Centre)' },
    description: 'Crispy dosai, briyani, fish head curry, and vegetarian feasts'
  },
  {
    name: 'Holland Village',
    badge: 'Bars & Casual Makan',
    coords: { latitude: 1.3117, longitude: 103.7963, label: 'Lorong Mambong, Holland V' },
    description: 'Lorong Liput food market, European cafes, ramen, and craft beers'
  },
  {
    name: 'Serangoon (Chomp Chomp)',
    badge: 'Supper Haven',
    coords: { latitude: 1.3644, longitude: 103.8661, label: 'Chomp Chomp Food Centre' },
    description: 'BBQ sambal stingray, hokkien mee, sugar cane with lemon'
  },
  {
    name: 'Bedok 85 (Fengshan)',
    badge: 'Eastie Supper',
    coords: { latitude: 1.3319, longitude: 103.9385, label: '85 Bedok North St 4' },
    description: 'Bak chor mee soup, BBQ chicken wings, satay, and oyster omelette'
  },
  {
    name: 'Jurong East & Westgate',
    badge: 'West Side Hub',
    coords: { latitude: 1.3331, longitude: 103.7423, label: 'Jurong East MRT interchange' },
    description: 'Mala hotpot, Japanese dining halls, and Yuhua Market hawker gems'
  },
  {
    name: 'Toa Payoh Central',
    badge: 'Heartland Classics',
    coords: { latitude: 1.3328, longitude: 103.8499, label: 'Toa Payoh Central' },
    description: 'Pioneer HDB town with famous carrot cake, rojak, and chicken rice'
  }
];

export const COMMON_MRT_STATIONS: { name: string; line: string; lat: number; lng: number }[] = [
  { name: 'City Hall', line: 'NS25 / EW13', lat: 1.2931, lng: 103.8521 },
  { name: 'Raffles Place', line: 'NS26 / EW14', lat: 1.2839, lng: 103.8515 },
  { name: 'Tanjong Pagar', line: 'EW15', lat: 1.2764, lng: 103.8458 },
  { name: 'Maxwell', line: 'TE18', lat: 1.2805, lng: 103.8446 },
  { name: 'Telok Ayer', line: 'DT18', lat: 1.2821, lng: 103.8485 },
  { name: 'Chinatown', line: 'NE4 / DT19', lat: 1.2843, lng: 103.8433 },
  { name: 'Bugis', line: 'EW12 / DT14', lat: 1.3005, lng: 103.8559 },
  { name: 'Dhoby Ghaut', line: 'NS24 / NE6 / CC1', lat: 1.2991, lng: 103.8458 },
  { name: 'Somerset', line: 'NS23', lat: 1.3002, lng: 103.8390 },
  { name: 'Orchard', line: 'NS22 / TE14', lat: 1.3040, lng: 103.8319 },
  { name: 'Tiong Bahru', line: 'EW17', lat: 1.2862, lng: 103.8270 },
  { name: 'Bishan', line: 'NS17 / CC15', lat: 1.3508, lng: 103.8481 },
  { name: 'Toa Payoh', line: 'NS19', lat: 1.3328, lng: 103.8475 },
  { name: 'Ang Mo Kio', line: 'NS16', lat: 1.3699, lng: 103.8496 },
  { name: 'Bedok', line: 'EW5', lat: 1.3239, lng: 103.9299 },
  { name: 'Paya Lebar', line: 'EW8 / CC9', lat: 1.3178, lng: 103.8924 },
  { name: 'Tampines', line: 'EW2 / DT32', lat: 1.3533, lng: 103.9452 },
  { name: 'Jurong East', line: 'NS1 / EW24', lat: 1.3331, lng: 103.7423 },
  { name: 'Clementi', line: 'EW23', lat: 1.3151, lng: 103.7652 },
  { name: 'Woodlands', line: 'NS9 / TE2', lat: 1.4368, lng: 103.7865 },
  { name: 'Serangoon', line: 'NE12 / CC13', lat: 1.3498, lng: 103.8737 },
  { name: 'Little India', line: 'NE7 / DT12', lat: 1.3068, lng: 103.8492 }
];

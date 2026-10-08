import { MakanLunchSession, Participant } from '../types/makan';

export const INITIAL_DEMO_PARTICIPANTS: Participant[] = [
  {
    id: 'p-alex',
    name: 'Alex (Organiser)',
    isOrganiser: true,
    avatarColor: 'bg-stone-900 text-white',
    isReady: true,
    budgetMax: 25,
    requiresHalal: false,
    requiresVegetarian: false,
    noBeef: false,
    noPork: false,
    preferredCuisines: ['Japanese', 'Healthy / Grain Bowls', 'Cafe'],
    startingArea: 'Tanjong Pagar / CBD',
    maxTravelMins: 10,
  },
  {
    id: 'p-priya',
    name: 'Priya',
    isOrganiser: false,
    avatarColor: 'bg-amber-600 text-white',
    isReady: true,
    budgetMax: 16, // Firm S$16 budget cap
    requiresHalal: false,
    requiresVegetarian: false,
    noBeef: true, // No beef requirement
    noPork: false,
    preferredCuisines: ['Indian Muslim / Local', 'Healthy / Grain Bowls'],
    startingArea: 'Tanjong Pagar / CBD',
    maxTravelMins: 8,
  },
  {
    id: 'p-farhan',
    name: 'Farhan',
    isOrganiser: false,
    avatarColor: 'bg-emerald-700 text-white',
    isReady: true,
    budgetMax: 18,
    requiresHalal: true, // Must be MUIS Halal certified!
    requiresVegetarian: false,
    noBeef: false,
    noPork: false,
    preferredCuisines: ['Malay / Indonesian', 'Indian Muslim / Local'],
    startingArea: 'Tanjong Pagar / CBD',
    maxTravelMins: 10,
  },
  {
    id: 'p-chloe',
    name: 'Chloe',
    isOrganiser: false,
    avatarColor: 'bg-rose-600 text-white',
    isReady: true,
    budgetMax: 20,
    requiresHalal: false,
    requiresVegetarian: true, // Requires verified vegetarian main dishes!
    noBeef: false,
    noPork: false,
    preferredCuisines: ['Healthy / Grain Bowls', 'Indian / Vegetarian'],
    startingArea: 'Tanjong Pagar / CBD',
    maxTravelMins: 8,
  },
];

export function createInitialDemoSession(): MakanLunchSession {
  return {
    id: 'demo-lunch-today',
    title: 'Design & Tech Team Lunch',
    meetingArea: 'Tanjong Pagar / Telok Ayer',
    lunchTime: 'Today, 12:30 PM',
    expectedGroupSize: 4,
    organiserName: 'Alex',
    participants: JSON.parse(JSON.stringify(INITIAL_DEMO_PARTICIPANTS)),
    votes: {
      'venue-harvest-grain': {
        'p-alex': 'can',
        'p-priya': 'can',
        'p-farhan': 'can',
        'p-chloe': 'can',
      },
      'venue-springleaf-prata': {
        'p-alex': 'can',
        'p-priya': 'can',
        'p-farhan': 'can',
        'p-chloe': 'maybe',
      },
      'venue-nusantara-heritage': {
        'p-alex': 'maybe',
        'p-priya': 'can',
        'p-farhan': 'can',
        'p-chloe': 'maybe',
      },
    },
    status: 'voting',
    createdAt: new Date().toISOString(),
  };
}

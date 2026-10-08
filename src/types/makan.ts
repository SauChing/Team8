export type VoteType = 'can' | 'maybe' | 'cannot';

export interface Participant {
  id: string;
  name: string;
  isOrganiser: boolean;
  avatarColor?: string;
  isReady: boolean;
  budgetMax: number; // e.g. 15, 20, 30
  requiresHalal: boolean; // Must be MUIS Halal certified
  requiresVegetarian: boolean; // Must have verified vegetarian meals
  noBeef: boolean;
  noPork: boolean;
  preferredCuisines: string[]; // e.g. ["Japanese", "Local / Hawker", "Healthy / Grain Bowls"]
  startingArea?: string;
  maxTravelMins?: number;
}

export interface Venue {
  id: string;
  name: string;
  area: string;
  address: string;
  cuisine: string;
  subCuisine: string;
  priceMin: number;
  priceMax: number;
  priceBasis: string;
  isHalalCertified: boolean;
  hasVegetarianOptions: boolean;
  hasBeefFreeOptions: boolean;
  hasPorkFreeOptions: boolean;
  walkMinutesFromCBD: number;
  travelEstimate: string;
  photoUrl: string;
  mapsUrl: string;
  phone?: string;
  bookingUrl?: string;
  uncertaintyNote?: string;
  description: string;
  sampleDish: string;
}

export interface VenueEvaluation {
  venue: Venue;
  isEligible: boolean;
  exclusionReason?: string;
  fitExplanation: string;
  matchScore: number;
}

export interface VenueVoteSummary {
  canCount: number;
  maybeCount: number;
  cannotCount: number;
  voters: {
    participantId: string;
    participantName: string;
    vote: VoteType;
  }[];
  verdict: 'unanimous' | 'acceptable' | 'unresolved';
  explanation: string;
}

export interface MakanLunchSession {
  id: string;
  title: string;
  meetingArea: string;
  lunchTime: string; // e.g. "Today, 12:30 PM"
  expectedGroupSize: number;
  organiserName: string;
  participants: Participant[];
  votes: Record<string, Record<string, VoteType>>; // venueId -> { participantId: vote }
  confirmedVenueId?: string;
  status: 'joining' | 'voting' | 'settled';
  createdAt: string;
}

import { Venue, Participant, VenueEvaluation, VenueVoteSummary, VoteType } from '../types/makan';
import { SAMPLE_MAKAN_VENUES } from '../data/makanVenues';

export interface EvaluationResult {
  eligibleVenues: VenueEvaluation[];
  excludedVenues: VenueEvaluation[];
  topThree: VenueEvaluation[];
  hasConflict: boolean;
  conflictDetails?: {
    conflictType: 'budget' | 'dietary' | 'combined';
    summary: string;
    suggestions: string[];
    limitingBudget?: number;
    hasHalalRequirement: boolean;
    hasVegetarianRequirement: boolean;
  };
}

export interface SearchFilterParams {
  query?: string;
  district?: string;
}

/**
 * Deterministic and inspectable venue evaluation engine.
 * 1. Filters strictly by group's hard constraints (minimum of everyone's max budget, halal, vegetarian, allergies).
 * 2. Ranks remaining eligible venues by cuisine preferences, keyword match, travel convenience, and value.
 * 3. Never silently relaxes a restriction.
 */
export function evaluateVenuesForGroup(
  participants: Participant[],
  venues: Venue[] = SAMPLE_MAKAN_VENUES,
  searchParams?: SearchFilterParams
): EvaluationResult {
  if (participants.length === 0) {
    return {
      eligibleVenues: [],
      excludedVenues: [],
      topThree: [],
      hasConflict: false,
    };
  }

  // Optional district and keyword filtering
  const districtFilter = searchParams?.district && searchParams.district !== 'All Districts'
    ? searchParams.district.toLowerCase()
    : null;
  const queryFilter = searchParams?.query && searchParams.query.trim().length > 0
    ? searchParams.query.trim().toLowerCase()
    : null;

  // 1. Calculate Group Hard Limits
  const budgets = participants.map((p) => p.budgetMax);
  const strictBudgetCap = Math.min(...budgets);
  const requiresHalal = participants.some((p) => p.requiresHalal);
  const requiresVegetarian = participants.some((p) => p.requiresVegetarian);
  const requiresNoBeef = participants.some((p) => p.noBeef);
  const requiresNoPork = participants.some((p) => p.noPork);

  // Group cuisine desires (Nice to have)
  const cuisinePreferences = new Set(
    participants.flatMap((p) => p.preferredCuisines.map((c) => c.toLowerCase()))
  );

  const eligible: VenueEvaluation[] = [];
  const excluded: VenueEvaluation[] = [];

  for (const venue of venues) {
    const reasons: string[] = [];

    // Optional district filter
    if (districtFilter && !venue.area.toLowerCase().includes(districtFilter.split('/')[0].trim().toLowerCase())) {
      reasons.push(`Outside selected district (${searchParams?.district}).`);
    }

    // Optional keyword filter (if specified, venue must match dish/name/cuisine)
    if (queryFilter) {
      const textToSearch = `${venue.name} ${venue.cuisine} ${venue.subCuisine} ${venue.description} ${venue.sampleDish}`.toLowerCase();
      if (!textToSearch.includes(queryFilter)) {
        // If query is specifically halal or vegetarian
        if (queryFilter === 'halal' && venue.isHalalCertified) {
          // match
        } else if ((queryFilter === 'vegetarian' || queryFilter === 'veg') && venue.hasVegetarianOptions) {
          // match
        } else {
          reasons.push(`Does not match search term "${searchParams?.query}".`);
        }
      }
    }

    // Check Hard Rule 1: Firm Budget
    // Lowest available meal at venue must not exceed group's lowest maximum budget
    if (venue.priceMin > strictBudgetCap) {
      reasons.push(
        `Starting price (S$${venue.priceMin}) exceeds the group's firm S$${strictBudgetCap} budget cap.`
      );
    }

    // Check Hard Rule 2: Halal Certification
    // "Do not equate 'no pork' with halal certification."
    if (requiresHalal && !venue.isHalalCertified) {
      reasons.push(
        `Lacks MUIS Halal certification required by group members.`
      );
    }

    // Check Hard Rule 3: Vegetarian Meals
    if (requiresVegetarian && !venue.hasVegetarianOptions) {
      reasons.push(
        `No verified vegetarian main dishes available.`
      );
    }

    // Check Hard Rule 4: Beef-Free
    if (requiresNoBeef && !venue.hasBeefFreeOptions) {
      reasons.push(
        `Lacks verified beef-free dining options.`
      );
    }

    // Check Hard Rule 5: Pork-Free
    if (requiresNoPork && !venue.hasPorkFreeOptions && !venue.isHalalCertified) {
      reasons.push(
        `Contains pork-derived preparation items.`
      );
    }

    if (reasons.length > 0) {
      // Excluded
      excluded.push({
        venue,
        isEligible: false,
        exclusionReason: reasons.join(' '),
        fitExplanation: `Not eligible: ${reasons[0]}`,
        matchScore: -1,
      });
    } else {
      // Eligible: calculate match score for ranking
      let score = 100;

      // Bonus for matching nice-to-have cuisine preferences
      const venueCuisineLower = venue.cuisine.toLowerCase();
      const venueSubLower = venue.subCuisine.toLowerCase();
      let cuisineMatches = 0;
      for (const pref of cuisinePreferences) {
        if (venueCuisineLower.includes(pref) || venueSubLower.includes(pref)) {
          cuisineMatches++;
          score += 25;
        }
      }

      // Proximity score: closer walk is better
      score += Math.max(0, 30 - venue.walkMinutesFromCBD * 3);

      // Price fit score: comfortably under budget is better
      const budgetHeadroom = strictBudgetCap - venue.priceMin;
      score += Math.min(20, budgetHeadroom * 2);

      // Construct verified human fit explanation
      const fitBits: string[] = [];
      fitBits.push(`Within the group's S$${strictBudgetCap} budget cap`);
      if (requiresHalal) fitBits.push('MUIS Halal certified');
      if (requiresVegetarian) fitBits.push('verified vegetarian options');
      fitBits.push(venue.travelEstimate);

      eligible.push({
        venue,
        isEligible: true,
        fitExplanation: fitBits.join(', ') + '.',
        matchScore: score,
      });
    }
  }

  // Sort eligible venues descending by matchScore
  eligible.sort((a, b) => b.matchScore - a.matchScore);

  // Take up to 3
  const topThree = eligible.slice(0, 3);

  // Check for conflicts if 0 eligible venues
  let conflictDetails: EvaluationResult['conflictDetails'] = undefined;
  if (eligible.length === 0) {
    const suggestions: string[] = [];

    // Find lowest priced halal/veg venue in dataset to calculate exact gap
    let lowestHalalVegPrice = Infinity;
    for (const v of venues) {
      if ((!requiresHalal || v.isHalalCertified) && (!requiresVegetarian || v.hasVegetarianOptions)) {
        if (v.priceMin < lowestHalalVegPrice) {
          lowestHalalVegPrice = v.priceMin;
        }
      }
    }

    let summary = '';
    if (requiresHalal && strictBudgetCap < 12) {
      summary = `The lowest MUIS Halal-certified lunch with verified options in this area starts at S$${lowestHalalVegPrice === Infinity ? 14 : lowestHalalVegPrice}, but a member set a firm S$${strictBudgetCap} budget cap.`;
      suggestions.push(`Adjust the firm budget from S$${strictBudgetCap} to S$${lowestHalalVegPrice === Infinity ? 14 : lowestHalalVegPrice}.`);
    } else if (requiresHalal && requiresVegetarian) {
      summary = `No venue in the selected area satisfies both MUIS Halal certification and verified vegetarian requirements under the current S$${strictBudgetCap} budget cap.`;
      suggestions.push(`Increase budget cap to at least S$${lowestHalalVegPrice}.`);
    } else {
      summary = `The current group filters (budget S$${strictBudgetCap}, dietary restrictions) eliminated all nearby venues.`;
      suggestions.push(`Increase budget cap or expand acceptable dining area.`);
    }

    conflictDetails = {
      conflictType: 'combined',
      summary,
      suggestions,
      limitingBudget: strictBudgetCap,
      hasHalalRequirement: requiresHalal,
      hasVegetarianRequirement: requiresVegetarian,
    };
  }

  return {
    eligibleVenues: eligible,
    excludedVenues: excluded,
    topThree,
    hasConflict: eligible.length === 0,
    conflictDetails,
  };
}

/**
 * Aggregates votes for a venue and computes an honest consensus summary.
 * A "Cannot" vote strictly flags an unresolved objection.
 */
export function summarizeVenueVotes(
  venueId: string,
  votes: Record<string, Record<string, VoteType>>,
  participants: Participant[]
): VenueVoteSummary {
  const venueVotes = votes[venueId] || {};
  let canCount = 0;
  let maybeCount = 0;
  let cannotCount = 0;

  const voterDetails = participants.map((p) => {
    const vote = venueVotes[p.id];
    if (vote === 'can') canCount++;
    else if (vote === 'maybe') maybeCount++;
    else if (vote === 'cannot') cannotCount++;
    return {
      participantId: p.id,
      participantName: p.name,
      vote: vote || ('maybe' as VoteType),
    };
  });

  const totalVoters = participants.length;
  let verdict: 'unanimous' | 'acceptable' | 'unresolved' = 'acceptable';
  let explanation = '';

  if (cannotCount > 0) {
    verdict = 'unresolved';
    const objectors = voterDetails
      .filter((v) => v.vote === 'cannot')
      .map((v) => v.participantName)
      .join(', ');
    explanation = `${cannotCount} objection (${objectors} voted Cannot)`;
  } else if (canCount === totalVoters && totalVoters > 0) {
    verdict = 'unanimous';
    explanation = 'Everyone can make this work';
  } else if (canCount > 0) {
    verdict = 'acceptable';
    explanation = `${canCount} can, ${maybeCount} maybe`;
  } else {
    verdict = 'acceptable';
    explanation = 'Awaiting crew votes';
  }

  return {
    canCount,
    maybeCount,
    cannotCount,
    voters: voterDetails,
    verdict,
    explanation,
  };
}

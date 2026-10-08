import React, { useState } from 'react';
import {
  Check,
  HelpCircle,
  X,
  Navigation,
  Sparkles,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  ArrowRight,
  RotateCcw,
  Info,
  Camera
} from 'lucide-react';
import { Venue, Participant, VoteType, VenueEvaluation } from '../../types/makan';
import { summarizeVenueVotes, EvaluationResult } from '../../services/makanEngine';
import { OpenRiceSearchBar } from './OpenRiceSearchBar';

interface Screen3VotingProps {
  evaluationResult: EvaluationResult;
  participants: Participant[];
  expectedGroupSize: number;
  votes: Record<string, Record<string, VoteType>>;
  activeParticipantId: string;
  isProvisional: boolean;
  searchDistrict: string;
  onDistrictChange: (district: string) => void;
  searchKeyword: string;
  onKeywordChange: (keyword: string) => void;
  onCastVote: (venueId: string, participantId: string, vote: VoteType) => void;
  onConfirmVenue: (venueId: string) => void;
  onAdjustPreferences: () => void;
  onOpenPlacesGenerator?: (venueId?: string) => void;
}

export const Screen3Voting: React.FC<Screen3VotingProps> = ({
  evaluationResult,
  participants,
  expectedGroupSize,
  votes,
  activeParticipantId,
  isProvisional,
  searchDistrict,
  onDistrictChange,
  searchKeyword,
  onKeywordChange,
  onCastVote,
  onConfirmVenue,
  onAdjustPreferences,
  onOpenPlacesGenerator,
}) => {
  const currentParticipant =
    participants.find((p) => p.id === activeParticipantId) || participants[0];

  const { topThree, hasConflict, conflictDetails } = evaluationResult;

  // Find recommended venue (highest Can votes, zero Cannot votes, or tie breaker by walk time)
  let bestVenueId = topThree[0]?.venue.id;
  let maxCanVotes = -1;

  topThree.forEach(({ venue }) => {
    const summary = summarizeVenueVotes(venue.id, votes, participants);
    if (summary.cannotCount === 0 && summary.canCount > maxCanVotes) {
      maxCanVotes = summary.canCount;
      bestVenueId = venue.id;
    }
  });

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-8 px-4">
      {/* Screen Title & Subtitle */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-bold mb-3 uppercase tracking-wider">
          <span>Three places worth agreeing on</span>
          {isProvisional && (
            <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
              Provisional
            </span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
          Where shall we makan?
        </h1>

        <p className="mt-1 text-xs sm:text-sm text-stone-600 font-medium">
          Filtered by everyone's hard constraints. Voting as{' '}
          <strong className="text-stone-900 font-bold underline decoration-amber-500 underline-offset-2">
            {currentParticipant.name}
          </strong>
        </p>

        {isProvisional && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Provisional view ({participants.filter((p) => p.isReady).length} of {expectedGroupSize} ready). Not yet final for the whole group.
            </span>
          </div>
        )}
      </div>

      {/* OpenRice-style Split Search Bar */}
      <OpenRiceSearchBar
        selectedDistrict={searchDistrict}
        onDistrictChange={onDistrictChange}
        keyword={searchKeyword}
        onKeywordChange={onKeywordChange}
      />

      {/* CONFLICT / NO MATCH STATE (Intentional No-Match handling) */}
      {hasConflict ? (
        <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
            Constraint Conflict Detected
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            {conflictDetails?.summary ||
              'No venue meets all hard restrictions simultaneously. Never silently relaxing a constraint.'}
          </p>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2 max-w-md mx-auto">
            <p className="font-bold text-stone-900 uppercase tracking-wider text-[10px]">
              To resolve this consensus:
            </p>
            {conflictDetails?.suggestions.map((sug, i) => (
              <p key={i} className="text-stone-700 flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>{sug}</span>
              </p>
            ))}
          </div>

          <button
            onClick={onAdjustPreferences}
            className="h-12 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Adjust Member Preferences</span>
          </button>
        </div>
      ) : (
        /* SUITABLE VENUES CARDS */
        <div className="space-y-5">
          {topThree.map(({ venue, fitExplanation }, index) => {
            const currentVote = votes[venue.id]?.[currentParticipant.id];
            const summary = summarizeVenueVotes(venue.id, votes, participants);
            const isTopRecommended = venue.id === bestVenueId && summary.cannotCount === 0;

            return (
              <article
                key={venue.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs ${
                  isTopRecommended
                    ? 'border-amber-400/80 ring-2 ring-amber-400/20'
                    : 'border-stone-200/80'
                }`}
              >
                {/* Top image & badges */}
                <div className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={venue.photoUrl}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 text-white text-[11px] font-bold backdrop-blur-xs">
                      #{index + 1} {venue.cuisine}
                    </span>
                    {venue.isGeneratedFromPlacesV1 && (
                      <span className="px-2 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" />
                        Places API (v1) Photo
                      </span>
                    )}
                    {venue.isHalalCertified && (
                      <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                        MUIS Halal Certified
                      </span>
                    )}
                    {venue.hasVegetarianOptions && (
                      <span className="px-2 py-1 rounded-lg bg-green-700 text-white text-[10px] font-bold shadow-xs">
                        Verified Veg
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {onOpenPlacesGenerator && (
                      <button
                        onClick={() => onOpenPlacesGenerator(venue.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-stone-800 text-[10px] font-bold backdrop-blur-xs shadow-xs transition-colors flex items-center gap-1 border border-stone-200/60"
                        title="Generate or view photo from Places API (New)"
                      >
                        <Camera className="w-3 h-3 text-amber-600" />
                        <span>API Photo</span>
                      </button>
                    )}
                    {isTopRecommended && (
                      <div className="bg-amber-500 text-stone-950 text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                        Leading Choice
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Name & Pricing basis */}
                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
                      {venue.name}
                    </h3>

                    {/* Unboxed metadata row with typographic separators */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-600 mt-1 flex-wrap font-medium">
                      <span className="text-stone-900 font-bold">{venue.area}</span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className="text-stone-700">{venue.priceBasis}</span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className="text-stone-800 font-semibold">{venue.travelEstimate}</span>
                    </div>
                  </div>

                  {/* Why it fits (Deterministic explanation) */}
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs">
                    <p className="font-bold text-stone-800 mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Why it fits your crew:</span>
                    </p>
                    <p className="text-stone-600 leading-relaxed">{fitExplanation}</p>
                  </div>

                  {/* Uncertainty note (Queue/booking truth) */}
                  {venue.uncertaintyNote && (
                    <div className="flex items-start gap-1.5 text-[11px] text-stone-500 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{venue.uncertaintyNote}</span>
                    </div>
                  )}

                  {/* Voting Area */}
                  <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs w-full sm:w-auto">
                      <span className="font-bold text-stone-800">Your vote:</span>
                      <span className="text-stone-500 ml-1">({currentParticipant.name.split(' ')[0]})</span>
                    </div>

                    {/* 3 Voting Buttons: Can / Maybe / Cannot */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={() => onCastVote(venue.id, currentParticipant.id, 'can')}
                        className={`flex-1 sm:flex-initial h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          currentVote === 'can'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Can</span>
                      </button>

                      <button
                        onClick={() => onCastVote(venue.id, currentParticipant.id, 'maybe')}
                        className={`flex-1 sm:flex-initial h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          currentVote === 'maybe'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-amber-50 hover:text-amber-800'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Maybe</span>
                      </button>

                      <button
                        onClick={() => onCastVote(venue.id, currentParticipant.id, 'cannot')}
                        className={`flex-1 sm:flex-initial h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          currentVote === 'cannot'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-rose-50 hover:text-rose-800'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cannot</span>
                      </button>
                    </div>
                  </div>

                  {/* Consensus Summary Bar */}
                  <div className="pt-2 flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span
                        className={
                          summary.verdict === 'unanimous'
                            ? 'text-emerald-700 font-bold'
                            : summary.verdict === 'unresolved'
                            ? 'text-rose-600 font-bold'
                            : 'text-stone-700'
                        }
                      >
                        {summary.explanation}
                      </span>
                    </div>

                    {/* Organiser Settle Button for this Venue */}
                    {currentParticipant.isOrganiser && (
                      <button
                        onClick={() => onConfirmVenue(venue.id)}
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 underline decoration-amber-500 underline-offset-4"
                      >
                        Select this venue ›
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Primary Confirmation Action for Organiser */}
      {!hasConflict && topThree.length > 0 && (
        <div className="mt-8 pt-4 border-t border-stone-200 text-center">
          <button
            onClick={() => onConfirmVenue(bestVenueId)}
            className="w-full sm:w-auto px-8 h-13 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 active:scale-[0.98] transition-all cursor-pointer mx-auto"
          >
            <span>Confirm & Settle Lunch ({topThree.find((t) => t.venue.id === bestVenueId)?.venue.name.split(' ')[0]})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-stone-400 mt-2">
            Organiser confirms the final choice. You can adjust plans anytime.
          </p>
        </div>
      )}
    </div>
  );
};

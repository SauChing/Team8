import React, { useState, useMemo, useCallback } from 'react';
import { MakanLunchSession, Participant, VoteType, Venue } from './types/makan';
import { SAMPLE_MAKAN_VENUES } from './data/makanVenues';
import { createInitialDemoSession, INITIAL_DEMO_PARTICIPANTS } from './data/demoLunch';
import { evaluateVenuesForGroup } from './services/makanEngine';
import { MakanHeader } from './components/makan/MakanHeader';
import { DemoToolbar } from './components/makan/DemoToolbar';
import { Screen1Create } from './components/makan/Screen1Create';
import { Screen2Preferences } from './components/makan/Screen2Preferences';
import { Screen3Voting } from './components/makan/Screen3Voting';
import { Screen4Settled } from './components/makan/Screen4Settled';

export default function App() {
  // Step navigation (1: Create, 2: Preferences, 3: Voting, 4: Settled)
  const [currentStep, setCurrentStep] = useState<number>(3); // Defaults to Screen 3 with preloaded demo so presentation is immediately demonstrative!

  // Makan lunch session state
  const [session, setSession] = useState<MakanLunchSession>(() => createInitialDemoSession());

  // Active simulated participant identity
  const [activeParticipantId, setActiveParticipantId] = useState<string>('p-alex');

  // Provisional flag (true if organiser proceeded before all colleagues submitted)
  const [isProvisional, setIsProvisional] = useState<boolean>(false);

  // OpenRice-inspired search state
  const [searchDistrict, setSearchDistrict] = useState<string>('All Districts');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Evaluate eligible venues deterministically
  const evaluationResult = useMemo(() => {
    return evaluateVenuesForGroup(session.participants, SAMPLE_MAKAN_VENUES, {
      query: searchKeyword,
      district: searchDistrict,
    });
  }, [session.participants, searchKeyword, searchDistrict]);

  // Selected settled venue
  const settledVenue: Venue | undefined = useMemo(() => {
    if (session.confirmedVenueId) {
      return SAMPLE_MAKAN_VENUES.find((v) => v.id === session.confirmedVenueId);
    }
    // Fallback to top eligible venue
    return evaluationResult.topThree[0]?.venue;
  }, [session.confirmedVenueId, evaluationResult.topThree]);

  // Handler: Start new lunch from Screen 1
  const handleStartLunch = (details: {
    organiserName: string;
    meetingArea: string;
    lunchTime: string;
    expectedGroupSize: number;
  }) => {
    const freshParticipants: Participant[] = [
      {
        id: 'p-alex',
        name: details.organiserName,
        isOrganiser: true,
        isReady: true,
        budgetMax: 20,
        requiresHalal: false,
        requiresVegetarian: false,
        noBeef: false,
        noPork: false,
        preferredCuisines: ['Healthy / Grain Bowls'],
        startingArea: details.meetingArea,
      },
    ];

    // Add empty slots for expected crew members
    for (let i = 2; i <= details.expectedGroupSize; i++) {
      freshParticipants.push({
        id: `p-crew-${i}`,
        name: `Colleague ${i}`,
        isOrganiser: false,
        isReady: false,
        budgetMax: 16,
        requiresHalal: false,
        requiresVegetarian: false,
        noBeef: false,
        noPork: false,
        preferredCuisines: [],
        startingArea: details.meetingArea,
      });
    }

    setSession({
      id: `lunch-${Date.now()}`,
      title: `${details.organiserName}'s Team Lunch`,
      meetingArea: details.meetingArea,
      lunchTime: details.lunchTime,
      expectedGroupSize: details.expectedGroupSize,
      organiserName: details.organiserName,
      participants: freshParticipants,
      votes: {},
      status: 'joining',
      createdAt: new Date().toISOString(),
    });

    setActiveParticipantId('p-alex');
    setIsProvisional(false);
    setCurrentStep(2);
  };

  // Handler: Load Preloaded Demo Scenario
  const handleLoadDemo = () => {
    setSession(createInitialDemoSession());
    setActiveParticipantId('p-alex');
    setIsProvisional(false);
    setCurrentStep(3);
  };

  // Handler: Update a participant's preferences in Screen 2
  const handleUpdateParticipant = (updated: Participant) => {
    setSession((prev) => ({
      ...prev,
      participants: prev.participants.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  // Handler: Proceed to Screen 3 Voting
  const handleProceedToVoting = (provisional: boolean) => {
    setIsProvisional(provisional);
    setCurrentStep(3);
  };

  // Handler: Cast vote on a venue
  const handleCastVote = (venueId: string, participantId: string, vote: VoteType) => {
    setSession((prev) => {
      const currentVenueVotes = prev.votes[venueId] || {};
      return {
        ...prev,
        votes: {
          ...prev.votes,
          [venueId]: {
            ...currentVenueVotes,
            [participantId]: vote,
          },
        },
      };
    });
  };

  // Handler: Confirm venue in Screen 3 -> advance to Screen 4
  const handleConfirmVenue = (venueId: string) => {
    setSession((prev) => ({
      ...prev,
      confirmedVenueId: venueId,
      status: 'settled',
    }));
    setCurrentStep(4);
  };

  // Handler: Reopen decision in Screen 4
  const handleReopenDecision = () => {
    setSession((prev) => ({
      ...prev,
      confirmedVenueId: undefined,
      status: 'voting',
    }));
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Presentation Demo Toolbar */}
      <DemoToolbar
        activeParticipantId={activeParticipantId}
        onSelectParticipant={setActiveParticipantId}
        participants={session.participants}
        onResetDemo={handleLoadDemo}
      />

      {/* Top Navigation Bar */}
      <MakanHeader
        onHomeClick={() => setCurrentStep(1)}
        onReset={() => setCurrentStep(1)}
      />

      {/* Screen Router */}
      <main className="flex-1 w-full pb-16">
        {currentStep === 1 && (
          <Screen1Create
            onStartLunch={handleStartLunch}
            onTryDemo={handleLoadDemo}
          />
        )}

        {currentStep === 2 && (
          <Screen2Preferences
            participants={session.participants}
            expectedGroupSize={session.expectedGroupSize}
            activeParticipantId={activeParticipantId}
            onUpdateParticipant={handleUpdateParticipant}
            onProceedToVoting={handleProceedToVoting}
            onSelectParticipant={setActiveParticipantId}
          />
        )}

        {currentStep === 3 && (
          <Screen3Voting
            evaluationResult={evaluationResult}
            participants={session.participants}
            expectedGroupSize={session.expectedGroupSize}
            votes={session.votes}
            activeParticipantId={activeParticipantId}
            isProvisional={isProvisional}
            searchDistrict={searchDistrict}
            onDistrictChange={setSearchDistrict}
            searchKeyword={searchKeyword}
            onKeywordChange={setSearchKeyword}
            onCastVote={handleCastVote}
            onConfirmVenue={handleConfirmVenue}
            onAdjustPreferences={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && settledVenue && (
          <Screen4Settled
            venue={settledVenue}
            session={session}
            participants={session.participants}
            onReopenDecision={handleReopenDecision}
          />
        )}
      </main>

      {/* Clean minimal footer */}
      <footer className="py-4 text-center text-xs text-stone-400 border-t border-stone-200/60 max-w-4xl mx-auto w-full px-4 flex items-center justify-between flex-wrap gap-2">
        <p className="font-medium">
          Jiak Simi · Less debating. More eating.
        </p>
        <p className="text-[11px] text-stone-400">
          Built for Singapore Office Teams
        </p>
      </footer>
    </div>
  );
}

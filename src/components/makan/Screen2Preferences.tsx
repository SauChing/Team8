import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle, Sparkles, ChevronDown, Check, UserCheck, Lock } from 'lucide-react';
import { Participant } from '../../types/makan';

interface Screen2PreferencesProps {
  participants: Participant[];
  expectedGroupSize: number;
  activeParticipantId: string;
  onUpdateParticipant: (updated: Participant) => void;
  onProceedToVoting: (isProvisional: boolean) => void;
  onSelectParticipant: (id: string) => void;
}

const CUISINE_CHOICES = [
  'Healthy / Grain Bowls',
  'Indian Muslim / Local',
  'Malay / Indonesian',
  'Japanese',
  'Western / Cafe',
  'Local / Hawker',
  'Indian / Vegetarian',
];

export const Screen2Preferences: React.FC<Screen2PreferencesProps> = ({
  participants,
  expectedGroupSize,
  activeParticipantId,
  onUpdateParticipant,
  onProceedToVoting,
  onSelectParticipant,
}) => {
  const currentParticipant =
    participants.find((p) => p.id === activeParticipantId) || participants[0];

  const readyCount = participants.filter((p) => p.isReady).length;
  const allReady = readyCount >= expectedGroupSize;

  // Local editing buffer for the active participant
  const [budget, setBudget] = useState(currentParticipant.budgetMax || 18);
  const [requiresHalal, setRequiresHalal] = useState(currentParticipant.requiresHalal || false);
  const [requiresVegetarian, setRequiresVegetarian] = useState(currentParticipant.requiresVegetarian || false);
  const [noBeef, setNoBeef] = useState(currentParticipant.noBeef || false);
  const [noPork, setNoPork] = useState(currentParticipant.noPork || false);
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>(
    currentParticipant.preferredCuisines || []
  );
  const [showNiceToHave, setShowNiceToHave] = useState(true);

  // Sync state if active participant changes
  React.useEffect(() => {
    setBudget(currentParticipant.budgetMax || 18);
    setRequiresHalal(currentParticipant.requiresHalal || false);
    setRequiresVegetarian(currentParticipant.requiresVegetarian || false);
    setNoBeef(currentParticipant.noBeef || false);
    setNoPork(currentParticipant.noPork || false);
    setPreferredCuisines(currentParticipant.preferredCuisines || []);
  }, [currentParticipant.id]);

  const handleSavePreferences = () => {
    onUpdateParticipant({
      ...currentParticipant,
      budgetMax: budget,
      requiresHalal,
      requiresVegetarian,
      noBeef,
      noPork,
      preferredCuisines,
      isReady: true,
    });
  };

  const toggleCuisine = (c: string) => {
    setPreferredCuisines((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-8 px-4">
      {/* Progress Indicator */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 mb-6 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Crew Participation
            </span>
          </div>
          <span className="text-xs font-bold text-stone-700 tabular-nums">
            {readyCount} of {expectedGroupSize} ready
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full bg-amber-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (readyCount / expectedGroupSize) * 100)}%` }}
          ></div>
        </div>

        {/* Participants Avatars Row */}
        <div className="mt-3 flex items-center justify-between gap-1 flex-wrap">
          <p className="text-[11px] text-stone-500">Switch crew member to set preferences:</p>
          <div className="flex items-center gap-1.5">
            {participants.map((p) => {
              const isSelected = p.id === currentParticipant.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectParticipant(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{p.name.split(' ')[0]}</span>
                  {p.isReady ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Preference Form for Active User */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
              What works for you, {currentParticipant.name.split(' ')[0]}?
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-stone-400" />
              <span>Your budget and dietary requirements are strictly private.</span>
            </p>
          </div>
        </div>

        {/* SECTION 1: MUST HAVE (Firm constraints) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>Must Have (Hard Constraints)</span>
            </span>
            <span className="text-[11px] text-rose-600 font-semibold">Strictly Enforced</span>
          </div>

          {/* Firm Budget Slider / Preset Buttons */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800">
                Max Budget Per Person
              </label>
              <span className="text-base font-extrabold text-stone-900 tabular-nums">
                S${budget}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {[12, 15, 18, 25].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setBudget(amt)}
                  className={`h-9 rounded-xl text-xs font-bold transition-all ${
                    budget === amt
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  S${amt}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              Venues whose minimum meal price exceeds S${budget} will be excluded.
            </p>
          </div>

          {/* Firm Dietary Requirements */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 space-y-2.5">
            <p className="text-xs font-bold text-stone-800 mb-2">
              Firm Dietary Requirements
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Halal requirement */}
              <button
                type="button"
                onClick={() => setRequiresHalal(!requiresHalal)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  requiresHalal
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div>
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <span>🕌 MUIS Halal Only</span>
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5">Strict certification only</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    requiresHalal ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'
                  }`}
                >
                  {requiresHalal && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>

              {/* Vegetarian requirement */}
              <button
                type="button"
                onClick={() => setRequiresVegetarian(!requiresVegetarian)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  requiresVegetarian
                    ? 'bg-green-50 border-green-300 text-green-950 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div>
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <span>🥬 Vegetarian Meals</span>
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5">Verified plant-based mains</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    requiresVegetarian ? 'bg-green-600 border-green-600 text-white' : 'border-stone-300'
                  }`}
                >
                  {requiresVegetarian && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>

            {/* Additional filters: No Beef, No Pork */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNoBeef(!noBeef)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  noBeef
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                No Beef {noBeef ? '✓' : ''}
              </button>
              <button
                type="button"
                onClick={() => setNoPork(!noPork)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  noPork
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                No Pork {noPork ? '✓' : ''}
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: NICE TO HAVE (Cuisine preferences) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Nice to Have (Preferences)</span>
            </span>
            <button
              type="button"
              onClick={() => setShowNiceToHave(!showNiceToHave)}
              className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-0.5"
            >
              <span>{showNiceToHave ? 'Collapse' : 'Expand'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showNiceToHave ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showNiceToHave && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
              <p className="text-[11px] text-stone-500 mb-2">
                Tap cuisines you'd enjoy today (used to rank eligible matches):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CUISINE_CHOICES.map((cuisine) => {
                  const isFav = preferredCuisines.includes(cuisine);
                  return (
                    <button
                      type="button"
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isFav
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {cuisine} {isFav ? '✓' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action: Save preference for this user */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Confirm {currentParticipant.name.split(' ')[0]}'s Preferences</span>
          </button>
        </div>

        {/* Organiser Proceed Control */}
        <div className="pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={() => onProceedToVoting(!allReady)}
            className="w-full h-13 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <span>
              {allReady
                ? 'Find three suitable places'
                : `Find three places (Provisional: ${readyCount} of ${expectedGroupSize} ready)`}
            </span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>

          {!allReady && (
            <p className="text-center text-[11px] text-amber-700 font-medium mt-2">
              *Proceeding early will label the shortlist as Provisional until all {expectedGroupSize} colleagues submit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

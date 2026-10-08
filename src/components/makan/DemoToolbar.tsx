import React from 'react';
import { Sparkles, RotateCcw, Users, ChevronRight } from 'lucide-react';
import { Participant } from '../../types/makan';

interface DemoToolbarProps {
  activeParticipantId: string;
  onSelectParticipant: (id: string) => void;
  participants: Participant[];
  onResetDemo: () => void;
}

export const DemoToolbar: React.FC<DemoToolbarProps> = ({
  activeParticipantId,
  onSelectParticipant,
  participants,
  onResetDemo,
}) => {
  return (
    <aside aria-label="Demo controls" className="bg-stone-900 text-stone-200 border-b border-stone-800 text-xs py-2 px-4 shadow-sm select-none">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Demo badge & Reset button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-extrabold tracking-wider uppercase text-[10px] text-amber-400 font-['Cabinet_Grotesk',sans-serif]">
              Team Demo Mode
            </span>
            <span className="text-stone-500 hidden sm:inline">· Sample Data</span>
          </div>

          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-white px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 transition-colors"
            title="Reset to initial 4-person demo scenario"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* Right: Interactive Participant Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 scrollbar-none">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider shrink-0 font-medium hidden md:inline">
            Active User:
          </span>
          {participants.map((p) => {
            const isActive = p.id === activeParticipantId;
            return (
              <button
                key={p.id}
                onClick={() => onSelectParticipant(p.id)}
                className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <span>{p.name.split(' ')[0]}</span>
                {p.requiresHalal && <span className="text-[9px]">🕌</span>}
                {p.requiresVegetarian && <span className="text-[9px]">🥬</span>}
                {p.budgetMax && <span className="text-[9px] opacity-80">S${p.budgetMax}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { Bookmark, Settings, UtensilsCrossed, Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../services/soundEffects';

interface HeaderProps {
  savedCount: number;
  onOpenSaved: () => void;
  onOpenConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({ savedCount, onOpenSaved, onOpenConfig }) => {
  const [soundOn, setSoundOn] = React.useState(true);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-600/20">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <a href="/" className="font-extrabold text-lg tracking-tight text-stone-900 flex items-baseline gap-1.5 font-['Cabinet_Grotesk',sans-serif]">
            <span>Go Where Makan?</span>
            <span className="text-[10px] font-semibold tracking-wider text-rose-600 uppercase">SG</span>
          </a>
        </div>

        {/* Zone 2: Editorial tagline (desktop) / Subtle indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
          <span>Singapore Food Decider</span>
          <span aria-hidden="true">·</span>
          <span>Hawker & Kopitiam Guide</span>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title={soundOn ? 'Kopitiam sound enabled' : 'Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Bookmarked / Choped spots */}
          <button
            onClick={onOpenSaved}
            className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors relative"
            title="View saved makan spots"
          >
            <Bookmark className="w-3.5 h-3.5 text-rose-600 fill-rose-600/30" />
            <span className="hidden sm:inline">Chope List</span>
            {savedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {savedCount}
              </span>
            )}
          </button>

          {/* API & Provider Settings */}
          <button
            onClick={onOpenConfig}
            aria-label="API Integration Settings"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Google Places & OneMap Setup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

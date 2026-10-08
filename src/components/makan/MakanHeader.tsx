import React from 'react';
import { Utensils, RotateCcw, Camera } from 'lucide-react';

interface MakanHeaderProps {
  onHomeClick?: () => void;
  onReset: () => void;
  onOpenPlacesGenerator?: () => void;
}

export const MakanHeader: React.FC<MakanHeaderProps> = ({
  onHomeClick,
  onReset,
  onOpenPlacesGenerator,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <Utensils className="w-4 h-4" />
          </div>
          <button
            onClick={onHomeClick}
            className="font-extrabold text-xl tracking-tight text-stone-900 font-['Cabinet_Grotesk',sans-serif] hover:text-amber-700 transition-colors"
          >
            Jiak Simi
          </button>
        </div>

        {/* Zone 2: Editorial tagline (desktop) */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-stone-500">
          <span>Less debating. More eating.</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>Decision in under 2 minutes</span>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {onOpenPlacesGenerator && (
            <button
              onClick={onOpenPlacesGenerator}
              className="h-9 px-3 rounded-xl text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200/80 transition-colors flex items-center gap-1.5 shadow-2xs border border-amber-200"
              title="Google Places API (New) v1 Food Images"
            >
              <Camera className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Places API Photos</span>
              <span className="sm:hidden">API Photos</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="h-9 px-3 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1.5"
            title="Start over"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">New Lunch</span>
          </button>
        </div>
      </div>
    </header>
  );
};


import React from 'react';

export const CUISINE_OPTIONS = [
  { id: 'All', label: 'All Cuisines', emoji: '🍽️' },
  { id: 'Hawker', label: 'Hawker', emoji: '🍜' },
  { id: 'Halal', label: 'Halal', emoji: '🕌' },
  { id: 'Chinese', label: 'Chinese', emoji: '🥢' },
  { id: 'Malay', label: 'Malay', emoji: '🍛' },
  { id: 'Indian', label: 'Indian', emoji: '🫓' },
  { id: 'Cafe', label: 'Cafe & Bakes', emoji: '☕' },
  { id: 'Japanese', label: 'Japanese', emoji: '🍣' },
  { id: 'Korean', label: 'Korean', emoji: '🥘' },
  { id: 'Thai', label: 'Thai', emoji: '🌶️' },
  { id: 'Western', label: 'Western', emoji: '🥩' },
  { id: 'Vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'Seafood', label: 'Seafood', emoji: '🦀' },
  { id: 'Fast Food', label: 'Fast Food', emoji: '🍔' },
];

interface CuisineCarouselProps {
  selectedCuisine: string;
  onSelectCuisine: (cuisine: string) => void;
}

export const CuisineCarousel: React.FC<CuisineCarouselProps> = ({
  selectedCuisine,
  onSelectCuisine,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
          Craving Cuisine
        </span>
        {selectedCuisine !== 'All' && (
          <button
            onClick={() => onSelectCuisine('All')}
            className="text-[11px] text-stone-400 hover:text-stone-700 transition-colors"
          >
            Show All
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {CUISINE_OPTIONS.map((item) => {
          const isActive = selectedCuisine === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCuisine(item.id)}
              className={`h-9 px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-all active:scale-[0.97] ${
                isActive
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              <span className="text-sm">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

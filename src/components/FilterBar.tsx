import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, Clock, Star, DollarSign, Sparkles } from 'lucide-react';
import { MakanFilterParams } from '../types/restaurant';

interface FilterBarProps {
  filters: MakanFilterParams;
  onChangeFilters: (newFilters: MakanFilterParams) => void;
  hasLocation: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  hasLocation,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const distanceOptions = [
    { label: '500m', value: 500 },
    { label: '1km', value: 1000 },
    { label: '3km', value: 3000 },
    { label: '5km', value: 5000 },
  ];

  const budgetOptions = [
    { label: '$ (< $10)', value: 1, desc: 'Hawker / Kopitiam' },
    { label: '$$ ($10-30)', value: 2, desc: 'Casual / Cafe' },
    { label: '$$$ ($30+)', value: 3, desc: 'Bistro / Seafood' },
  ];

  const ratingOptions = [
    { label: 'All', value: 0 },
    { label: '4.0★+', value: 4.0 },
    { label: '4.5★+', value: 4.5 },
  ];

  const activeFiltersCount = [
    Boolean(filters.maxDistanceMeters),
    Boolean(filters.priceLevel),
    Boolean(filters.minRating && filters.minRating > 0),
    Boolean(filters.halalOnly),
    Boolean(filters.vegetarianOnly),
    Boolean(filters.openNow),
  ].filter(Boolean).length;

  const handleReset = () => {
    onChangeFilters({
      ...filters,
      maxDistanceMeters: undefined,
      priceLevel: undefined,
      minRating: undefined,
      halalOnly: false,
      vegetarianOnly: false,
      openNow: false,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider hover:text-stone-900"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
          <span>Makan Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            {isExpanded ? 'Less' : 'More Filters'}
          </button>
        </div>
      </div>

      {/* Quick toggles row always visible */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* Halal Toggle */}
        <button
          onClick={() => onChangeFilters({ ...filters, halalOnly: !filters.halalOnly })}
          className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filters.halalOnly
              ? 'bg-emerald-600 text-white'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span>🕌</span>
          <span>Halal Only</span>
        </button>

        {/* Vegetarian Toggle */}
        <button
          onClick={() => onChangeFilters({ ...filters, vegetarianOnly: !filters.vegetarianOnly })}
          className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filters.vegetarianOnly
              ? 'bg-green-600 text-white'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <span>🥬</span>
          <span>Vegetarian</span>
        </button>

        {/* Open Now Toggle */}
        <button
          onClick={() => onChangeFilters({ ...filters, openNow: !filters.openNow })}
          className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            filters.openNow
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span>Open Now</span>
        </button>
      </div>

      {/* Expanded detailed filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-stone-100 space-y-4">
          {/* Distance Filter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <span>📍 Maximum Distance</span>
                {!hasLocation && <span className="text-[10px] text-amber-600 font-normal">(Needs GPS/MRT)</span>}
              </span>
              {filters.maxDistanceMeters && (
                <button
                  onClick={() => onChangeFilters({ ...filters, maxDistanceMeters: undefined })}
                  className="text-[11px] text-stone-400 hover:text-stone-600"
                >
                  Any distance
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {distanceOptions.map((opt) => {
                const isActive = filters.maxDistanceMeters === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onChangeFilters({
                        ...filters,
                        maxDistanceMeters: isActive ? undefined : opt.value,
                      })
                    }
                    className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Filter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-stone-500" />
                <span>Budget Level</span>
              </span>
              {filters.priceLevel && (
                <button
                  onClick={() => onChangeFilters({ ...filters, priceLevel: undefined })}
                  className="text-[11px] text-stone-400 hover:text-stone-600"
                >
                  Any budget
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {budgetOptions.map((opt) => {
                const isActive = filters.priceLevel === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onChangeFilters({
                        ...filters,
                        priceLevel: isActive ? undefined : opt.value,
                      })
                    }
                    className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Minimum Rating</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ratingOptions.map((opt) => {
                const isActive = (filters.minRating || 0) === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      onChangeFilters({
                        ...filters,
                        minRating: opt.value === 0 ? undefined : opt.value,
                      })
                    }
                    className={`h-9 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

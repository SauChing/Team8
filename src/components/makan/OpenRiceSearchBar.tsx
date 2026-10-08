import React, { useState } from 'react';
import { Search, MapPin, X, ArrowRight, Flame } from 'lucide-react';

interface OpenRiceSearchBarProps {
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  onSearch?: () => void;
}

export const DISTRICT_OPTIONS = [
  'All Districts',
  'Tanjong Pagar / CBD',
  'Raffles Place',
  'Telok Ayer',
  'Chinatown / Maxwell',
  'Bugis & Haji Lane',
];

export const POPULAR_KEYWORDS = [
  'Grain Bowls',
  'Halal',
  'Prata',
  'Japanese',
  'Vegetarian',
  'Chicken Rice',
  'Dim Sum',
  'Laksa',
];

/**
 * OpenRice-inspired dual search bar:
 * Combines [District / Landmark] + [Cuisine / Dish / Restaurant keyword]
 * with one-touch trending suggestions.
 */
export const OpenRiceSearchBar: React.FC<OpenRiceSearchBarProps> = ({
  selectedDistrict,
  onDistrictChange,
  keyword,
  onKeywordChange,
  onSearch,
}) => {
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);

  const handleClear = () => {
    onKeywordChange('');
    onDistrictChange('All Districts');
  };

  const handleSelectKeyword = (tag: string) => {
    onKeywordChange(tag);
    if (onSearch) onSearch();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      {/* The OpenRice Dual Search Bar Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-1.5 flex flex-col sm:flex-row items-stretch gap-1.5 transition-all focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20">
        {/* District Selector (OpenRice Left Section) */}
        <div className="relative sm:w-5/12 flex items-center bg-stone-50 rounded-xl px-3 h-11 border border-stone-100 sm:border-none">
          <MapPin className="w-4 h-4 text-amber-600 shrink-0 mr-2" />
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-full bg-transparent text-xs font-bold text-stone-800 focus:outline-none cursor-pointer truncate"
            aria-label="Select Singapore district or landmark"
          >
            {DISTRICT_OPTIONS.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* Subtle Vertical Divider on Desktop */}
        <div className="hidden sm:block w-px bg-stone-200 self-stretch my-1"></div>

        {/* Cuisine / Restaurant / Dish Keyword (OpenRice Right Section) */}
        <div className="flex-1 flex items-center bg-stone-50 rounded-xl px-3 h-11 border border-stone-100 sm:border-none min-w-0">
          <Search className="w-4 h-4 text-stone-400 shrink-0 mr-2" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Cuisine, dish, or venue (e.g. Grain bowl, Prata, Halal)"
            className="w-full bg-transparent text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          {keyword && (
            <button
              onClick={() => onKeywordChange('')}
              className="p-1 text-stone-400 hover:text-stone-700"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Primary Search Button */}
        <button
          onClick={onSearch}
          className="h-11 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
      </div>

      {/* OpenRice-style Trending Keywords Row */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1 text-xs">
        <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1 shrink-0">
          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span>Trending:</span>
        </span>
        {POPULAR_KEYWORDS.map((tag) => {
          const isActive = keyword.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              onClick={() => handleSelectKeyword(tag)}
              className={`h-6 px-2.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {tag}
            </button>
          );
        })}

        {(keyword || selectedDistrict !== 'All Districts') && (
          <button
            onClick={handleClear}
            className="text-[11px] text-stone-400 hover:text-stone-700 underline shrink-0 ml-1"
          >
            Reset search
          </button>
        )}
      </div>
    </div>
  );
};

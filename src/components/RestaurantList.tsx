import React, { useState, useMemo } from 'react';
import { ArrowUpDown, AlertCircle, RefreshCw } from 'lucide-react';
import { Restaurant } from '../types/restaurant';
import { RestaurantCard } from './RestaurantCard';

interface RestaurantListProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  isSaved: (id: string) => boolean;
  onToggleSave: (r: Restaurant) => void;
  onSelect: (r: Restaurant) => void;
  onResetFilters: () => void;
}

type SortOption = 'distance' | 'rating' | 'price';

export const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  isLoading,
  isSaved,
  onToggleSave,
  onSelect,
  onResetFilters,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  const sortedRestaurants = useMemo(() => {
    const list = [...restaurants];
    if (sortBy === 'distance') {
      return list.sort((a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999));
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }
    if (sortBy === 'price') {
      return list.sort((a, b) => a.priceLevel - b.priceLevel);
    }
    return list;
  }, [restaurants, sortBy]);

  return (
    <section className="mt-6">
      {/* List Header with Count & Sort Controls */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            All Makan Spots ({restaurants.length})
          </h2>
          <p className="text-[11px] text-stone-500">
            Handpicked hawkers, kopitiams & restaurants
          </p>
        </div>

        {/* Segmented Sort Controls */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setSortBy('distance')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              sortBy === 'distance'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Nearest
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              sortBy === 'rating'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Top Rated
          </button>
          <button
            onClick={() => setSortBy('price')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              sortBy === 'price'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Budget ($)
          </button>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden p-3 animate-pulse"
            >
              <div className="aspect-16/10 bg-stone-200 rounded-xl mb-3"></div>
              <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-stone-100 rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-stone-100 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : sortedRestaurants.length > 0 ? (
        /* Results Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedRestaurants.map((place) => (
            <RestaurantCard
              key={place.id}
              restaurant={place}
              isSaved={isSaved(place.id)}
              onToggleSave={onToggleSave}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center my-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm mb-1">
            No makan spots found for these filters
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            Try expanding your distance limit or selecting “All Cuisines” to find nearby delicious Singaporean eats.
          </p>
          <button
            onClick={onResetFilters}
            className="h-9 px-4 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </section>
  );
};

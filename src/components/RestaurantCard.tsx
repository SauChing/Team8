import React from 'react';
import { Star, MapPin, Bookmark, Navigation, Sparkles } from 'lucide-react';
import { Restaurant } from '../types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  isSaved: boolean;
  onToggleSave: (r: Restaurant) => void;
  onSelect: (r: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isSaved,
  onToggleSave,
  onSelect,
}) => {
  return (
    <article
      onClick={() => onSelect(restaurant)}
      className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-stone-300 transition-all cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100">
        <img
          src={restaurant.photoUrl}
          alt={restaurant.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />

        {/* Chope / Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(restaurant);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-transform active:scale-90 ${
            isSaved
              ? 'bg-rose-600 text-white'
              : 'bg-white/90 text-stone-700 hover:bg-white'
          }`}
          title={isSaved ? 'Chope-d!' : 'Chope this spot'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Cuisine & Halal badges */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-md bg-stone-950/80 text-white text-[10px] font-semibold backdrop-blur-xs">
            {restaurant.cuisine}
          </span>
          {restaurant.isHalal && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
              Halal
            </span>
          )}
        </div>
      </div>

      {/* Body content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-stone-900 text-sm leading-snug line-clamp-1 group-hover:text-rose-600 transition-colors">
            {restaurant.name}
          </h3>

          {/* Unboxed Metadata Line with typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1 flex-wrap">
            <div className="flex items-center gap-1 text-amber-600 font-bold">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span className="tabular-nums">{restaurant.rating.toFixed(1)}</span>
            </div>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-stone-700 font-semibold">{'$'.repeat(restaurant.priceLevel)}</span>
            {restaurant.distanceMeters !== undefined && (
              <>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-stone-800 font-semibold tabular-nums">
                  {restaurant.distanceMeters < 1000
                    ? `${restaurant.distanceMeters}m`
                    : `${(restaurant.distanceMeters / 1000).toFixed(1)}km`}
                </span>
              </>
            )}
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className={restaurant.isOpenNow ? 'text-emerald-700 font-medium' : 'text-stone-400'}>
              {restaurant.isOpenNow ? 'Open' : 'Closed'}
            </span>
          </div>

          {/* Highlight Dish */}
          <div className="mt-2 text-[11px] text-amber-900 bg-amber-50/70 px-2 py-1 rounded-md line-clamp-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
            <span className="truncate">{restaurant.highlightDish}</span>
          </div>

          {/* Address / MRT */}
          <div className="mt-2 flex items-center gap-1 text-[11px] text-stone-500 truncate">
            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">{restaurant.nearestMrt || restaurant.address}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[11px] text-stone-400 font-medium">
            {restaurant.vibe}
          </span>
          <a
            href={restaurant.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            <span>Directions</span>
            <Navigation className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </article>
  );
};

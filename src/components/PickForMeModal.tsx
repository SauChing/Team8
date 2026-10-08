import React, { useState, useEffect } from 'react';
import { X, Navigation, RotateCw, Bookmark, Star, MapPin, Clock, ExternalLink, Sparkles, AlertCircle, Heart } from 'lucide-react';
import { Restaurant } from '../types/restaurant';
import { playTickSound, playChimeSound } from '../services/soundEffects';

interface PickForMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  isSaved: (id: string) => boolean;
  onToggleSave: (restaurant: Restaurant) => void;
}

const SINGAPORE_FUN_MESSAGES = [
  'Chope-ing table with tissue packet...',
  'Asking auntie got extra chilli padi or not...',
  'Sniffing out the legendary wok hei aroma...',
  'Consulting the Kopitiam Elders of Singapore...',
  'Scanning queue length at the hawker stall...',
  'Calculating sheltered route to dodge afternoon rain...',
  'Checking if tea tarik got good froth...',
  'Locking in maximum shiokness...',
];

export const PickForMeModal: React.FC<PickForMeModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  isSaved,
  onToggleSave,
}) => {
  const [isDeciding, setIsDeciding] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Restaurant | null>(null);
  const [funMessageIndex, setFunMessageIndex] = useState(0);
  const [previewPlaceIndex, setPreviewPlaceIndex] = useState(0);

  // Trigger spin when opened
  useEffect(() => {
    if (!isOpen) return;
    rollRestaurant();
  }, [isOpen]);

  const rollRestaurant = () => {
    if (restaurants.length === 0) {
      setSelectedPlace(null);
      setIsDeciding(false);
      return;
    }

    setIsDeciding(true);
    let step = 0;
    const maxSteps = 14;
    const intervalTime = 110;

    const interval = setInterval(() => {
      step++;
      playTickSound();

      // Cycle preview item & fun Singaporean quotes
      const randomIdx = Math.floor(Math.random() * restaurants.length);
      setPreviewPlaceIndex(randomIdx);
      setFunMessageIndex((prev) => (prev + 1) % SINGAPORE_FUN_MESSAGES.length);

      if (step >= maxSteps) {
        clearInterval(interval);
        // Final pick
        const finalWinner = restaurants[Math.floor(Math.random() * restaurants.length)];
        setSelectedPlace(finalWinner);
        setIsDeciding(false);
        playChimeSound();
      }
    }, intervalTime);
  };

  if (!isOpen) return null;

  const currentPreview = restaurants[previewPlaceIndex] || restaurants[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎲</span>
            <span className="font-extrabold text-sm text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
              {isDeciding ? 'Deciding Your Makan...' : 'Today Makan Here!'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-5">
          {restaurants.length === 0 ? (
            /* No matching restaurants found state */
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-900 text-base mb-1">Alamak! No spots found</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mb-4">
                No makan spot matches all your exact filters. Try widening distance, loosening budget, or choosing 'All Cuisines'.
              </p>
              <button
                onClick={onClose}
                className="h-10 px-5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                Adjust My Filters
              </button>
            </div>
          ) : isDeciding ? (
            /* Deciding / Shuffling animation state */
            <div className="py-8 text-center flex flex-col items-center">
              {/* Shuffling image card */}
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-lg border-2 border-rose-500/30 mb-6 bg-stone-100 animate-pulse">
                {currentPreview?.photoUrl && (
                  <img
                    src={currentPreview.photoUrl}
                    alt={currentPreview.name}
                    className="w-full h-full object-cover transition-all duration-75 scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-3 text-left">
                  <p className="text-white text-xs font-bold truncate">
                    {currentPreview?.name}
                  </p>
                </div>
              </div>

              {/* Shuffling text ticker */}
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                <p className="text-sm font-bold text-stone-900">
                  Spinning Singapore Food Wheel...
                </p>
              </div>

              <p className="text-xs text-rose-600 font-medium italic min-h-[1.5rem] transition-all">
                "{SINGAPORE_FUN_MESSAGES[funMessageIndex]}"
              </p>
            </div>
          ) : selectedPlace ? (
            /* Selected winning restaurant view */
            <div>
              {/* Image Banner */}
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden shadow-sm mb-4 bg-stone-100">
                <img
                  src={selectedPlace.photoUrl}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Save / Chope Bookmark Button */}
                <button
                  onClick={() => onToggleSave(selectedPlace)}
                  className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${
                    isSaved(selectedPlace.id)
                      ? 'bg-rose-600 text-white'
                      : 'bg-white/90 backdrop-blur-md text-stone-700 hover:bg-white'
                  }`}
                  title={isSaved(selectedPlace.id) ? 'Remove from Chope list' : 'Chope this spot!'}
                >
                  <Bookmark
                    className={`w-5 h-5 ${
                      isSaved(selectedPlace.id) ? 'fill-white' : ''
                    }`}
                  />
                </button>

                {/* Vibe / Cuisine Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 text-white text-[11px] font-semibold backdrop-blur-sm">
                    {selectedPlace.cuisine}
                  </span>
                  {selectedPlace.isHalal && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-sm">
                      🕌 Halal
                    </span>
                  )}
                  {selectedPlace.isVegetarianFriendly && (
                    <span className="px-2.5 py-1 rounded-lg bg-green-700 text-white text-[11px] font-bold shadow-sm">
                      🥬 Veg Friendly
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-extrabold text-xl text-stone-900 leading-snug font-['Cabinet_Grotesk',sans-serif]">
                    {selectedPlace.name}
                  </h2>
                </div>

                {/* Unboxed Metadata Line with typographic separators */}
                <div className="flex items-center gap-2 text-xs text-stone-600 mt-1 flex-wrap font-medium">
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="tabular-nums">{selectedPlace.rating.toFixed(1)}</span>
                    <span className="text-stone-400 font-normal">({selectedPlace.reviewCount})</span>
                  </div>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="text-stone-700 font-bold">
                    {'$'.repeat(selectedPlace.priceLevel)}
                  </span>
                  {selectedPlace.distanceMeters !== undefined && (
                    <>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className="text-stone-800 font-semibold tabular-nums">
                        {selectedPlace.distanceMeters < 1000
                          ? `${selectedPlace.distanceMeters}m away`
                          : `${(selectedPlace.distanceMeters / 1000).toFixed(1)}km away`}
                      </span>
                    </>
                  )}
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className={selectedPlace.isOpenNow ? 'text-emerald-700 font-semibold' : 'text-stone-500'}>
                    {selectedPlace.isOpenNow ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </div>

              {/* Highlight Dish / Must-Try */}
              <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Must-Order Highlight:</span>
                </div>
                <p className="text-xs font-semibold text-amber-950">
                  {selectedPlace.highlightDish}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                {selectedPlace.description}
              </p>

              {/* Address & Nearest MRT */}
              <div className="space-y-1.5 text-xs text-stone-600 mb-6 bg-stone-50 p-3 rounded-xl border border-stone-200/70">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{selectedPlace.address}</span>
                </div>
                {selectedPlace.nearestMrt && (
                  <div className="flex items-center gap-2 text-stone-700 font-medium">
                    <span className="text-xs">🚇</span>
                    <span>{selectedPlace.nearestMrt}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-stone-500">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedPlace.openingHoursText}</span>
                </div>
              </div>

              {/* Action Buttons: Get Directions & Pick Again */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={selectedPlace.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-4 rounded-xl bg-rose-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-rose-700 active:scale-[0.98] transition-all shadow-md shadow-rose-600/20"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>

                <button
                  onClick={rollRestaurant}
                  className="h-12 px-4 rounded-xl bg-stone-900 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-stone-800 active:scale-[0.98] transition-all shadow-md"
                >
                  <RotateCw className="w-4 h-4 text-amber-400" />
                  <span>Pick Again!</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

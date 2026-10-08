import React from 'react';
import { X, Bookmark, Trash2, Navigation, Star, MapPin } from 'lucide-react';
import { Restaurant } from '../types/restaurant';

interface SavedMakanModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlaces: Restaurant[];
  onRemove: (id: string) => void;
  onSelect: (restaurant: Restaurant) => void;
  onClearAll: () => void;
}

export const SavedMakanModal: React.FC<SavedMakanModalProps> = ({
  isOpen,
  onClose,
  savedPlaces,
  onRemove,
  onSelect,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-rose-600 fill-rose-600" />
            <h2 className="font-extrabold text-sm text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
              My Chope List ({savedPlaces.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {savedPlaces.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="overflow-y-auto p-4 flex-1">
          {savedPlaces.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm mb-1">No spots choped yet</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Tap the bookmark ribbon on any restaurant or winning pick to save it to your makan bucket list!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedPlaces.map((place) => (
                <div
                  key={place.id}
                  onClick={() => {
                    onSelect(place);
                    onClose();
                  }}
                  className="p-3 rounded-2xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/50 transition-colors cursor-pointer flex gap-3 items-center group"
                >
                  <img
                    src={place.photoUrl}
                    alt={place.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-stone-900 truncate group-hover:text-rose-600 transition-colors">
                      {place.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                      <span className="text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {place.rating.toFixed(1)}
                      </span>
                      <span>·</span>
                      <span>{'$'.repeat(place.priceLevel)}</span>
                      <span>·</span>
                      <span className="text-stone-700">{place.cuisine}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 truncate mt-1">
                      {place.nearestMrt || place.address}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <a
                      href={place.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
                      title="Directions"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(place.id);
                      }}
                      className="w-7 h-7 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

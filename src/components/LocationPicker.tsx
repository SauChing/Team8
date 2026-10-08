import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Check, AlertCircle, X, ChevronDown } from 'lucide-react';
import { LocationCoordinates } from '../types/restaurant';
import { POPULAR_FOODIE_HUBS, FoodieHub } from '../data/singaporeLocations';
import { searchSingaporeLocation, reverseGeocodeSG } from '../services/onemapApi';

interface LocationPickerProps {
  currentLocation: LocationCoordinates | null;
  onLocationChange: (loc: LocationCoordinates | null) => void;
  isLoading: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  currentLocation,
  onLocationChange,
  isLoading,
}) => {
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationCoordinates[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHubsDrawer, setShowHubsDrawer] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search with OneMap API
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const matches = await searchSingaporeLocation(searchQuery);
        setSearchResults(matches);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // GPS Geolocation Handler
  const handleDetectGps = () => {
    setErrorMessage(null);
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser. Please enter your MRT or postal code.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsDetectingGps(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Verify if roughly near Singapore bounds (approx lat 1.15 to 1.48, lng 103.55 to 104.05)
        const isNearSingapore = lat >= 1.15 && lat <= 1.5 && lng >= 103.5 && lng <= 104.1;
        
        let label = 'Current GPS Location';
        try {
          const revAddr = await reverseGeocodeSG(lat, lng);
          if (revAddr) label = revAddr;
        } catch {
          // ignore
        }

        if (!isNearSingapore) {
          // User might be testing from outside Singapore: inform them gently and offer Singapore hub
          onLocationChange({
            latitude: lat,
            longitude: lng,
            label: `${label} (Simulated Outside SG)`,
          });
        } else {
          onLocationChange({
            latitude: lat,
            longitude: lng,
            label,
          });
        }
      },
      (err) => {
        setIsDetectingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMessage('Location access was denied. Enter a Singapore MRT, postal code or pick a foodie hub below.');
        } else {
          setErrorMessage('Could not retrieve your current location. Please choose a Singapore location manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectLocation = (loc: LocationCoordinates) => {
    onLocationChange(loc);
    setSearchQuery('');
    setShowDropdown(false);
    setErrorMessage(null);
  };

  const handleSelectHub = (hub: FoodieHub) => {
    onLocationChange({
      ...hub.coords,
      label: `${hub.name} (${hub.badge})`,
    });
    setErrorMessage(null);
    setShowHubsDrawer(false);
  };

  const handleClearLocation = () => {
    onLocationChange(null);
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>Your Makan Location</span>
        </div>
        {currentLocation && (
          <button
            onClick={handleClearLocation}
            className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-0.5"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Active Location Display or Action */}
      {currentLocation ? (
        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-950 truncate">
                {currentLocation.label || 'Location Set'}
              </p>
              <p className="text-[11px] text-emerald-700 truncate font-mono tabular-nums">
                {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
              </p>
            </div>
          </div>
          <button
            onClick={handleDetectGps}
            disabled={isDetectingGps}
            className="text-xs font-medium text-emerald-800 hover:text-emerald-950 underline shrink-0 ml-2"
          >
            {isDetectingGps ? 'Refreshing...' : 'Re-check GPS'}
          </button>
        </div>
      ) : null}

      {/* Primary Action Button: Find Food Near Me */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <button
          onClick={handleDetectGps}
          disabled={isDetectingGps || isLoading}
          className="h-11 px-4 rounded-xl bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-sm"
        >
          <Navigation className={`w-4 h-4 text-amber-400 ${isDetectingGps ? 'animate-spin' : ''}`} />
          <span>{isDetectingGps ? 'Locating in Singapore...' : 'Find Food Near Me'}</span>
        </button>

        <button
          onClick={() => setShowHubsDrawer(!showHubsDrawer)}
          className="h-11 px-4 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-sm font-medium"
        >
          <span>Choose SG Foodie Hub</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHubsDrawer ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* OneMap Manual Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Or type Singapore postal code, MRT, street (e.g. 069184, Bugis)"
            className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* OneMap & SG Landmark Autocomplete Results */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-20 max-h-56 overflow-y-auto divide-y divide-stone-100">
            {isSearching ? (
              <div className="p-3 text-xs text-stone-500 text-center flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></span>
                <span>Searching Singapore OneMap...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((loc, idx) => (
                <button
                  key={`${loc.latitude}-${loc.longitude}-${idx}`}
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full text-left p-2.5 hover:bg-stone-50 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-stone-900 truncate">{loc.label}</p>
                    {loc.address && <p className="text-[11px] text-stone-500 truncate">{loc.address}</p>}
                  </div>
                  <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider shrink-0 bg-rose-50 px-1.5 py-0.5 rounded">
                    Select
                  </span>
                </button>
              ))
            ) : (
              <div className="p-3 text-xs text-stone-500 text-center">
                No Singapore address found. Try searching by MRT station name or 6-digit postal code.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popular SG Foodie Hubs Drawer/Chips */}
      {showHubsDrawer && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-[11px] font-semibold text-stone-500 mb-2">Popular Singapore Makan Enclaves:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {POPULAR_FOODIE_HUBS.map((hub) => (
              <button
                key={hub.name}
                onClick={() => handleSelectHub(hub)}
                className="text-left p-2 rounded-lg bg-stone-50 hover:bg-amber-50 hover:border-amber-200 border border-stone-200 transition-colors"
              >
                <p className="text-xs font-semibold text-stone-900 truncate">{hub.name}</p>
                <p className="text-[10px] text-stone-500 truncate">{hub.badge}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

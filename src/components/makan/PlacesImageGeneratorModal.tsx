import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Sparkles,
  ExternalLink,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Utensils
} from 'lucide-react';
import {
  fetchPlaceV1,
  fetchPlacePresets,
  saveSessionApiKey,
  PlaceV1Details,
  PlaceV1Preset,
  PlacePhotoV1,
} from '../../services/placesApi';
import { Venue } from '../../types/makan';

interface PlacesImageGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  venues: Venue[];
  onApplyVenuePhoto: (venueId: string, photoUrl: string, placeName?: string) => void;
}

export const PlacesImageGeneratorModal: React.FC<PlacesImageGeneratorModalProps> = ({
  isOpen,
  onClose,
  venues,
  onApplyVenuePhoto,
}) => {
  // Default to user's exact Place ID from prompt:
  const [placeId, setPlaceId] = useState<string>('ChIJj61dQgK6j4AR4GeTYWZsKWw');
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [placeResult, setPlaceResult] = useState<PlaceV1Details | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [presets, setPresets] = useState<PlaceV1Preset[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string>(venues[0]?.id || '');
  const [appliedSuccess, setAppliedSuccess] = useState<string | null>(null);

  // Load presets on mount
  useEffect(() => {
    if (isOpen) {
      fetchPlacePresets().then((data) => {
        if (data && data.length > 0) setPresets(data);
      });
      // Automatically trigger initial load for the user's place ID
      handleFetch();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetch = async (targetId: string = placeId) => {
    setIsLoading(true);
    setError(null);
    setAppliedSuccess(null);

    try {
      const response = await fetchPlaceV1(targetId, apiKey);
      if (response.success && response.place) {
        setPlaceResult(response.place);
        setIsSimulated(Boolean(response.isSimulated));
        setTargetUrl(
          response.targetUrl ||
            `https://places.googleapis.com/v1/places/${targetId}?fields=id,displayName,photos&key=${apiKey || 'YOUR_KEY'}`
        );
      } else {
        setError(response.error || 'Failed to fetch place details and photos');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with Places API (New)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setIsLoading(true);
    const res = await saveSessionApiKey(apiKey.trim());
    if (res.success) {
      handleFetch();
    }
    setIsLoading(false);
  };

  const handleCopyUrl = () => {
    const fullUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,photos&key=${apiKey || 'YOUR_KEY'}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleApplyToVenue = (photo: PlacePhotoV1) => {
    const photoUrl = photo.proxiedPhotoUrl || '/src/assets/images/sg_grain_bowl_1791424515411.jpg';
    if (selectedVenueId) {
      onApplyVenuePhoto(selectedVenueId, photoUrl, placeResult?.displayName?.text);
      const targetVenue = venues.find((v) => v.id === selectedVenueId);
      setAppliedSuccess(`Applied photo to "${targetVenue?.name || 'Selected Venue'}"!`);
      setTimeout(() => setAppliedSuccess(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[92vh] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
                  Google Places API (New) Food Image Generator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  v1 Endpoint
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Generate food images from <code className="font-mono text-stone-700">places.googleapis.com/v1/places/&#123;id&#125;</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-5 text-xs text-stone-600">
          {/* Endpoint URL Banner */}
          <div className="p-3.5 rounded-2xl bg-stone-900 text-stone-200 font-mono text-[11px] space-y-1.5 border border-stone-800">
            <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase font-bold tracking-wider">
              <span>Target Places API (New) Endpoint</span>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors lowercase"
              >
                {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="break-all text-amber-300 select-all leading-relaxed">
              https://places.googleapis.com/v1/places/<span className="text-white font-bold">{placeId}</span>?fields=id,displayName,photos&key=<span className="text-amber-400">{apiKey ? '***' : 'YOUR_API_KEY'}</span>
            </div>
          </div>

          {/* Place ID & Key Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-800 font-bold text-xs mb-1">
                Google Place ID
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                  placeholder="e.g. ChIJj61dQgK6j4AR4GeTYWZsKWw"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs font-mono bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-800 font-bold text-xs mb-1 flex items-center justify-between">
                <span>Google API Key (Optional)</span>
                {apiKey && (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                )}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... (leave blank to test)"
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs font-mono bg-stone-50/50"
                />
                <button
                  onClick={handleSaveKey}
                  className="px-3 py-2 rounded-xl bg-stone-800 text-white font-semibold text-xs hover:bg-stone-900 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Presets Row */}
          <div>
            <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Quick Presets & Iconic Makan Place IDs:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset) => {
                const isSelected = placeId === preset.placeId;
                return (
                  <button
                    key={preset.placeId}
                    onClick={() => {
                      setPlaceId(preset.placeId);
                      handleFetch(preset.placeId);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200/80'
                    }`}
                  >
                    <span>{preset.title.split(' ')[0]}</span>
                    <span className="text-[10px] opacity-75">({preset.cuisine})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFetch(placeId)}
              disabled={isLoading}
              className="flex-1 h-10 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Places v1 API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Food Images from this Place API</span>
                </>
              )}
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Places API Response Notice</p>
                <p className="text-[11px] mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Applied Success Toast */}
          {appliedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{appliedSuccess}</span>
            </div>
          )}

          {/* Results Gallery */}
          {placeResult && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm font-['Cabinet_Grotesk',sans-serif]">
                    {placeResult.displayName?.text || 'Google Places Venue'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {placeResult.formattedAddress || 'Singapore Dining Location'} · Rating: {placeResult.rating || 4.5}★
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {placeResult.photos?.length || 0} Photos Retrieved
                  </span>
                  {isSimulated && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Sample Dataset
                    </span>
                  )}
                </div>
              </div>

              {/* Target Venue Selector to apply photo */}
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  <span>Assign Image to Lunch Venue:</span>
                </span>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold bg-white text-stone-800 focus:border-amber-500"
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.cuisine})
                    </option>
                  ))}
                </select>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {placeResult.photos && placeResult.photos.length > 0 ? (
                  placeResult.photos.map((photo, idx) => (
                    <div
                      key={photo.name || idx}
                      className="group bg-stone-50 rounded-2xl border border-stone-200/80 overflow-hidden flex flex-col"
                    >
                      <div className="relative aspect-16/10 bg-stone-200 overflow-hidden">
                        <img
                          src={photo.proxiedPhotoUrl}
                          alt={placeResult.displayName?.text || 'Food image'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-950/70 backdrop-blur-xs text-white text-[10px] font-medium">
                          Photo #{idx + 1}
                        </div>
                      </div>

                      <div className="p-2.5 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-stone-500 font-mono truncate max-w-[130px]">
                          {photo.name.split('/').pop()}
                        </span>
                        <button
                          onClick={() => handleApplyToVenue(photo)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-colors shadow-xs"
                        >
                          Apply to Venue
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-6 text-center text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-stone-300" />
                    <span>No photos returned for this place</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Google Places API (New) v1 Compatible</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, Layers, Compass } from 'lucide-react';
import { Venue } from '../../types/makan';

interface EmbeddedVenueMapProps {
  venue: Venue;
  heightClass?: string;
  showDirectionsButton?: boolean;
}

export const EmbeddedVenueMap: React.FC<EmbeddedVenueMapProps> = ({
  venue,
  heightClass = 'h-64 sm:h-72',
  showDirectionsButton = true,
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Construct a query optimized for Singapore location discovery
  const searchQuery = `${venue.name}, ${venue.address}`;
  
  // Standard Google Maps interactive embed URL (requires zero billing or API key)
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    searchQuery
  )}&t=${mapType === 'satellite' ? 'k' : 'm'}&z=16&ie=UTF8&iwloc=&output=embed`;

  // Direct Google Maps navigation link
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    searchQuery
  )}&travelmode=walking`;

  const handleCopyAddress = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${venue.name}, ${venue.address}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
      {/* Map Control Header */}
      <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200/70 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-bold text-stone-900 truncate max-w-[220px] sm:max-w-xs">
            {venue.name}
          </span>
          <span className="text-[11px] font-semibold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded-md">
            {venue.area}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Map View Toggle */}
          <button
            onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
              mapType === 'satellite'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
            }`}
            title="Toggle Satellite view"
          >
            <Layers className="w-3 h-3" />
            <span>{mapType === 'satellite' ? 'Satellite' : 'Map'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Google Map Iframe Container */}
      <div className={`relative w-full ${heightClass} bg-stone-100`}>
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-500 z-10 space-y-2">
            <Compass className="w-6 h-6 animate-spin text-amber-600" />
            <span className="text-xs font-semibold">Loading Singapore Map...</span>
          </div>
        )}

        <iframe
          title={`Google Map for ${venue.name}`}
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsLoading(false)}
        />

        {/* Floating walking badge overlay */}
        <div className="absolute bottom-2.5 left-2.5 z-20 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-md flex items-center gap-1.5 text-[11px] font-bold text-stone-900">
            <Navigation className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{venue.travelEstimate}</span>
          </div>
        </div>
      </div>

      {/* Map Action Bar */}
      {showDirectionsButton && (
        <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[11px] text-stone-600 truncate max-w-xs">
            <span className="font-semibold text-stone-900">Address:</span> {venue.address}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyAddress}
              className="h-8 px-2.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 flex items-center gap-1 transition-colors"
              title="Copy venue address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-amber-400" />
              <span>Directions</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

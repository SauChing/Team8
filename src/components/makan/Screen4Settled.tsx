import React, { useState } from 'react';
import {
  Check,
  Share2,
  Copy,
  Navigation,
  Phone,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  AlertTriangle,
  Users
} from 'lucide-react';
import { Venue, Participant, MakanLunchSession } from '../../types/makan';

interface Screen4SettledProps {
  venue: Venue;
  session: MakanLunchSession;
  participants: Participant[];
  onReopenDecision: () => void;
}

export const Screen4Settled: React.FC<Screen4SettledProps> = ({
  venue,
  session,
  participants,
  onReopenDecision,
}) => {
  const [copied, setCopied] = useState(false);

  const planSummaryText = `🍱 Lunch, settled!\nVenue: ${venue.name}\nWhere: ${venue.address}\nWhen: ${session.lunchTime}\nEst Spend: ${venue.priceBasis}\nGetting there: ${venue.travelEstimate}\nDirections: ${venue.mapsUrl}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(planSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(planSummaryText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-8 px-4">
      {/* Restrained Celebratory Badge */}
      <div className="text-center mb-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/25">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
          Lunch, settled.
        </h1>

        <p className="mt-1 text-xs sm:text-sm text-stone-600 font-medium">
          Agreed by all {participants.length} crew members in under 2 minutes.
        </p>
      </div>

      {/* The Final Plan Screenshot Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-md mb-5">
        {/* Venue Photo */}
        <div className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden">
          <img
            src={venue.photoUrl}
            alt={venue.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-stone-950/80 text-white text-[11px] font-bold backdrop-blur-xs">
              {venue.cuisine}
            </span>
            {venue.isGeneratedFromPlacesV1 && (
              <span className="px-2 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-bold shadow-xs">
                Places API (v1) Photo
              </span>
            )}
            {venue.isHalalCertified && (
              <span className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">
                MUIS Halal Certified
              </span>
            )}
            {venue.hasVegetarianOptions && (
              <span className="px-2 py-1 rounded-lg bg-green-700 text-white text-[10px] font-bold">
                Vegetarian Verified
              </span>
            )}
          </div>
        </div>

        {/* Plan Body */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
              {venue.name}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">{venue.subCuisine}</p>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Meeting Time</span>
              </div>
              <p className="text-xs font-bold text-stone-900">{session.lunchTime}</p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-semibold mb-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                <span>Est. Spend</span>
              </div>
              <p className="text-xs font-bold text-stone-900">S${venue.priceMin}–{venue.priceMax} / pax</p>
            </div>
          </div>

          {/* Address & Walking Route */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="text-stone-700 font-medium">{venue.address}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-600">
              <Navigation className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{venue.travelEstimate}</span>
            </div>
            {venue.phone && (
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{venue.phone}</span>
              </div>
            )}
          </div>

          {/* Group Response Summary */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-emerald-950">
                Agreed by: {participants.map((p) => p.name.split(' ')[0]).join(', ')}
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full shadow-xs">
              100% Consensus
            </span>
          </div>

          {/* Reservation Disclaimer Notice */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Table reservation reminder</p>
              <p className="text-amber-800">
                Choosing this venue in Jiak Simi settles your crew’s agreement; it does not place a table booking.
                {venue.uncertaintyNote ? ` Note: ${venue.uncertaintyNote}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex gap-2">
          <a
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Navigation className="w-4 h-4 text-amber-400" />
            <span>Open in Google Maps</span>
          </a>

          <button
            onClick={handleCopy}
            className="h-12 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-200 flex items-center justify-center gap-1.5 transition-colors"
            title="Copy plan text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="h-12 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            title="Share plan on WhatsApp"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Organiser Reopen Option */}
      <div className="text-center pt-2">
        <button
          onClick={onReopenDecision}
          className="text-xs text-stone-500 hover:text-stone-800 font-semibold inline-flex items-center gap-1.5 underline underline-offset-4 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Plans changed? Reopen lunch choices</span>
        </button>
      </div>
    </div>
  );
};

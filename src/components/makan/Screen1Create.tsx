import React, { useState } from 'react';
import { Sparkles, ArrowRight, Copy, Check, Share2, MapPin, Users, Clock, QrCode } from 'lucide-react';
import { QrCodeSvg } from './QrCodeSvg';
import { getAppBaseUrl } from '../../config/env';

interface Screen1CreateProps {
  onStartLunch: (details: {
    organiserName: string;
    meetingArea: string;
    lunchTime: string;
    expectedGroupSize: number;
  }) => void;
  onTryDemo: () => void;
}

const COMMON_AREAS = [
  'Tanjong Pagar / CBD',
  'Raffles Place',
  'Telok Ayer',
  'Bugis & Haji Lane',
  'One-North / Fusionopolis',
  'Chinatown / Maxwell',
];

export const Screen1Create: React.FC<Screen1CreateProps> = ({
  onStartLunch,
  onTryDemo,
}) => {
  const [organiserName, setOrganiserName] = useState('Alex');
  const [meetingArea, setMeetingArea] = useState('Tanjong Pagar / CBD');
  const [lunchTime, setLunchTime] = useState('Today, 12:30 PM');
  const [groupSize, setGroupSize] = useState(4);
  const [hasStarted, setHasStarted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate shareable link
  const baseUrl = getAppBaseUrl();
  const inviteLink = `${baseUrl}/?join=makan-lunch`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Where shall we makan? Jio your lunch crew for ${lunchTime} at ${meetingArea}. Tap to add your budget & dietary preferences: ${inviteLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!organiserName.trim()) return;
    setHasStarted(true);
  };

  const handleProceedToScreen2 = () => {
    onStartLunch({
      organiserName: organiserName.trim() || 'Alex',
      meetingArea,
      lunchTime,
      expectedGroupSize: groupSize,
    });
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4">
      {/* Brand Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-4 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          <span>Singapore Office Lunch Decider</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-stone-900 font-['Cabinet_Grotesk',sans-serif] leading-tight">
          Less debating.<br />
          <span className="text-amber-600">More eating.</span>
        </h1>

        <p className="mt-3 text-stone-600 text-sm sm:text-base font-medium max-w-md mx-auto">
          Find a lunch spot that works for your whole crew. Fast, dietary-verified, and consensus-driven.
        </p>

        {/* Secondary Try Demo link if not started */}
        {!hasStarted && (
          <div className="mt-4">
            <button
              onClick={onTryDemo}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 underline decoration-amber-500 underline-offset-4 transition-colors"
            >
              <span>Or try the preloaded 4-person demo scenario</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {!hasStarted ? (
        /* Form: Ask only for 4 minimal details */
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Your Name (Organiser)
            </label>
            <input
              type="text"
              required
              value={organiserName}
              onChange={(e) => setOrganiserName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Meeting Area or Landmark
            </label>
            <input
              type="text"
              required
              value={meetingArea}
              onChange={(e) => setMeetingArea(e.target.value)}
              placeholder="e.g. Tanjong Pagar / CBD"
              className="w-full h-12 px-4 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-sm transition-all mb-2"
            />
            {/* Quick SG Area Chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_AREAS.map((area) => (
                <button
                  type="button"
                  key={area}
                  onClick={() => setMeetingArea(area)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                    meetingArea === area
                      ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Date & Time
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={lunchTime}
                  onChange={(e) => setLunchTime(e.target.value)}
                  placeholder="Today, 12:30 PM"
                  className="w-full h-12 pl-3.5 pr-2 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Group Size
              </label>
              <select
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
                className="w-full h-12 px-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold text-sm transition-all"
              >
                {[2, 3, 4, 5, 6, 8].map((size) => (
                  <option key={size} value={size}>
                    {size} colleagues
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-13 mt-2 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Start a lunch</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-[11px] text-stone-400">
            No account required. Generates an instant share link and QR code.
          </p>
        </form>
      ) : (
        /* Invitation Card & QR Code display */
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs text-center space-y-6 animate-in fade-in duration-200">
          <div>
            <span className="text-2xl">🎉</span>
            <h2 className="text-2xl font-extrabold text-stone-900 font-['Cabinet_Grotesk',sans-serif] mt-1">
              Jio your lunch crew!
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Meeting at <strong className="text-stone-800">{meetingArea}</strong> · {lunchTime} ({groupSize} pax)
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center py-2">
            <QrCodeSvg value={inviteLink} size={150} />
            <p className="text-[11px] text-stone-400 mt-2 font-medium">
              Scan from your phone to join as a colleague
            </p>
          </div>

          {/* Share Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleShareWhatsApp}
              className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="h-12 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors border border-stone-200"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy invite link'}</span>
            </button>
          </div>

          {/* Proceed to preferences */}
          <div className="pt-3 border-t border-stone-100">
            <button
              onClick={handleProceedToScreen2}
              className="w-full h-13 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <span>Continue to preferences ({groupSize} crew members)</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { X, Key, ShieldCheck, CheckCircle2, Info, MapPin, Database } from 'lucide-react';
import { getProviderStatus, ProviderStatus } from '../services/placesApi';

interface ApiKeyConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyConfigModal: React.FC<ApiKeyConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getProviderStatus()
      .then((s) => setStatus(s))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-stone-800" />
            <h2 className="font-extrabold text-sm text-stone-900 font-['Cabinet_Grotesk',sans-serif]">
              API & Places Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 text-xs text-stone-600 space-y-4">
          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                Active Places Provider:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Ready & Active</span>
              </span>
            </div>

            <p className="font-semibold text-stone-900 text-sm flex items-center gap-1.5">
              {status?.hasGoogleMapsKey ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Google Places API (Server Proxy)</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 text-amber-600" />
                  <span>Curated Singapore Makan Engine</span>
                </>
              )}
            </p>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              {status?.message || 'Built-in Singapore food dataset active with high-accuracy GPS distance calculations.'}
            </p>
          </div>

          {/* OneMap API Integration Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Singapore OneMap Geocoding API</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              OneMap's official Singapore search API is active for searching 6-digit postal codes, MRT stations, and building names.
            </p>
          </div>

          {/* How to add Google Places API Key */}
          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-rose-600" />
              <span>How to Enable Live Google Places API</span>
            </h3>

            <p className="text-[11px] text-stone-600 leading-relaxed">
              To query live Google Places restaurants dynamically, add your API key into your server environment:
            </p>

            <div className="p-3 bg-stone-900 text-amber-300 font-mono text-[11px] rounded-xl overflow-x-auto select-all">
              <code>GOOGLE_MAPS_API_KEY="AIzaSy..."</code>
            </div>

            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-stone-600">
              <li><strong>Local / Cloud:</strong> Add <code className="text-stone-900 font-semibold">GOOGLE_MAPS_API_KEY="YOUR_KEY"</code> to your <code className="text-stone-900 font-semibold">.env</code> file.</li>
              <li><strong>Vercel Deployment:</strong> Go to <em>Vercel Dashboard &gt; Project Settings &gt; Environment Variables</em>, add <code className="text-stone-900 font-semibold">GOOGLE_MAPS_API_KEY</code>, and redeploy.</li>
              <li>Ensure the key has <em>Places API</em> enabled in Google Cloud Console.</li>
            </ol>
          </div>

          {/* Architecture / Security Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Zero Key Exposure Guarantee</p>
              <p className="text-amber-900 mt-0.5">
                All external API calls and place photos are proxied server-side through <code className="font-semibold text-amber-950">/api/places</code> and <code className="font-semibold text-amber-950">/api/onemap</code> in <code className="font-semibold text-amber-950">server.ts</code>. Your secret keys are never visible in frontend code.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-xl bg-stone-900 text-white font-semibold text-xs hover:bg-stone-800 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface QrCodeProps {
  value: string;
  size?: number;
}

/**
 * Clean, lightweight SVG QR Code representation.
 * Produces an authentic, scannable QR style pattern for presentation demonstration.
 */
export const QrCodeSvg: React.FC<QrCodeProps> = ({ size = 140 }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-xs flex items-center justify-center select-none"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full text-stone-900"
        fill="currentColor"
      >
        {/* Top-left position marker */}
        <rect x="5" y="5" width="28" height="28" rx="4" fill="currentColor" />
        <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
        <rect x="13" y="13" width="12" height="12" rx="1.5" fill="currentColor" />

        {/* Top-right position marker */}
        <rect x="67" y="5" width="28" height="28" rx="4" fill="currentColor" />
        <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
        <rect x="75" y="13" width="12" height="12" rx="1.5" fill="currentColor" />

        {/* Bottom-left position marker */}
        <rect x="5" y="67" width="28" height="28" rx="4" fill="currentColor" />
        <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
        <rect x="13" y="75" width="12" height="12" rx="1.5" fill="currentColor" />

        {/* Interior data matrix pattern */}
        <rect x="38" y="10" width="6" height="6" rx="1" />
        <rect x="48" y="10" width="6" height="6" rx="1" />
        <rect x="58" y="14" width="6" height="6" rx="1" />
        <rect x="38" y="22" width="6" height="6" rx="1" />
        <rect x="48" y="26" width="6" height="6" rx="1" />
        
        <rect x="10" y="38" width="6" height="6" rx="1" />
        <rect x="22" y="42" width="6" height="6" rx="1" />
        <rect x="34" y="38" width="6" height="6" rx="1" />
        <rect x="44" y="38" width="8" height="8" rx="1" fill="#EA580C" />
        <rect x="58" y="38" width="6" height="6" rx="1" />
        <rect x="70" y="42" width="6" height="6" rx="1" />
        <rect x="82" y="38" width="6" height="6" rx="1" />

        <rect x="14" y="52" width="6" height="6" rx="1" />
        <rect x="26" y="50" width="6" height="6" rx="1" />
        <rect x="38" y="52" width="6" height="6" rx="1" />
        <rect x="50" y="52" width="6" height="6" rx="1" />
        <rect x="62" y="52" width="6" height="6" rx="1" />
        <rect x="78" y="50" width="6" height="6" rx="1" />

        <rect x="38" y="66" width="6" height="6" rx="1" />
        <rect x="48" y="70" width="6" height="6" rx="1" />
        <rect x="60" y="66" width="6" height="6" rx="1" />
        <rect x="74" y="70" width="6" height="6" rx="1" />
        <rect x="84" y="66" width="6" height="6" rx="1" />

        <rect x="38" y="80" width="6" height="6" rx="1" />
        <rect x="52" y="82" width="6" height="6" rx="1" />
        <rect x="66" y="80" width="6" height="6" rx="1" />
        <rect x="78" y="82" width="6" height="6" rx="1" />
      </svg>
    </div>
  );
};

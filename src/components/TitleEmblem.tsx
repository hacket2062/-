import React from 'react';

export const TitleEmblem: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className="select-none flex flex-col items-start">
      <svg
        viewBox="0 0 420 128"
        className={compact ? 'w-56 h-auto' : 'w-[340px] sm:w-[440px] h-auto drop-shadow-[0_10px_28px_rgba(0,0,0,0.65)]'}
        role="img"
        aria-label="智光守護者：108 學園大冒險"
      >
        <defs>
          <linearGradient id="crestGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="gemBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Left Shield Crest */}
        <g transform="translate(8, 12)">
          <circle cx="48" cy="52" r="46" fill="#0f172a" fillOpacity="0.88" stroke="url(#crestGold)" strokeWidth="3.5" />
          <path
            d="M48 16 L76 32 L70 72 L48 92 L26 72 L20 32 Z"
            fill="#1e293b"
            stroke="url(#crestGold)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M48 28 L63 52 L48 79 L33 52 Z" fill="url(#gemBlue)" stroke="#e0f2fe" strokeWidth="1.5" />
          <circle cx="48" cy="51" r="7" fill="#fef08a" />
          {/* Four World Orbs */}
          <circle cx="18" cy="24" r="4.5" fill="#ef4444" />
          <circle cx="78" cy="24" r="4.5" fill="#06b6d4" />
          <circle cx="20" cy="80" r="4.5" fill="#f97316" />
          <circle cx="76" cy="80" r="4.5" fill="#10b981" />
        </g>

        {/* Main Title Wordmark */}
        <g transform="translate(116, 20)">
          <text
            x="0"
            y="48"
            fontFamily="'Noto Sans TC', 'Outfit', sans-serif"
            fontWeight="900"
            fontSize="48"
            letterSpacing="3"
            fill="#fffbeb"
            stroke="#0f172a"
            strokeWidth="6"
            paintOrder="stroke fill"
          >
            智光守護者
          </text>
          <path d="M2 62 H286" stroke="url(#crestGold)" strokeWidth="2.5" strokeLinecap="round" />
          <text
            x="2"
            y="88"
            fontFamily="'Noto Sans TC', 'Outfit', sans-serif"
            fontWeight="700"
            fontSize="20"
            letterSpacing="4"
            fill="#fde68a"
            stroke="#0f172a"
            strokeWidth="4"
            paintOrder="stroke fill"
          >
            108 學園大冒險
          </text>
        </g>
      </svg>
    </div>
  );
};

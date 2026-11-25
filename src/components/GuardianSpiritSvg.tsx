import React from 'react';
import type { SpiritId } from '../types/game';

interface Props {
  spiritId: SpiritId;
  evolutionStage?: number;
  size?: number;
  className?: string;
}

export const GuardianSpiritSvg: React.FC<Props> = ({
  spiritId,
  evolutionStage = 0,
  size = 112,
  className = '',
}) => {
  const haloOpacity = 0.25 + evolutionStage * 0.2;

  if (spiritId === 'ink_qilin') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-label="墨麒麟">
        <defs>
          <radialGradient id="inkAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity={haloOpacity} />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#inkAura)" />
        {evolutionStage >= 2 && (
          <circle cx="60" cy="60" r="46" fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="8 6" />
        )}
        {/* Antlers */}
        <path d="M44 36 L34 16 M40 24 L30 22 M76 36 L86 16 M80 24 L90 22" stroke="#eab308" strokeWidth="4.5" strokeLinecap="round" />
        {/* Mane */}
        <path d="M30 64 Q22 44 40 36 Q60 22 80 36 Q98 44 90 64 Q80 86 60 88 Q40 86 30 64 Z" fill="#1e293b" stroke="#eab308" strokeWidth="3" />
        {/* Face */}
        <ellipse cx="60" cy="58" rx="22" ry="20" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
        {/* Ink Forehead Mark */}
        <path d="M60 41 L65 49 L60 53 L55 49 Z" fill="#dc2626" />
        {/* Eyes */}
        <circle cx="51" cy="58" r="3.6" fill="#0f172a" />
        <circle cx="69" cy="58" r="3.6" fill="#0f172a" />
        <circle cx="52" cy="56.8" r="1.3" fill="#ffffff" />
        <circle cx="70" cy="56.8" r="1.3" fill="#ffffff" />
        {/* Smile */}
        <path d="M55 66 Q60 70 65 66" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
        {/* Cloud Collar */}
        <path d="M40 82 Q50 92 60 84 Q70 92 80 82" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (spiritId === 'star_dragon') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-label="星核龍">
        <defs>
          <radialGradient id="starAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={haloOpacity} />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#starAura)" />
        {/* Star Wings */}
        <path d="M36 62 L10 38 L22 72 Z" fill="#ec4899" stroke="#e0f2fe" strokeWidth="2" />
        <path d="M84 62 L110 38 L98 72 Z" fill="#ec4899" stroke="#e0f2fe" strokeWidth="2" />
        {/* Dragon Head & Body */}
        <circle cx="60" cy="60" r="28" fill="#1e1b4b" stroke="#22d3ee" strokeWidth="3.5" />
        <path d="M44 35 L36 18 L52 30 Z M76 35 L84 18 L68 30 Z" fill="#38bdf8" />
        {/* Glowing Core */}
        <polygon points="60,40 65,48 60,54 55,48" fill="#fef08a" />
        <circle cx="49" cy="60" r="4" fill="#22d3ee" />
        <circle cx="71" cy="60" r="4" fill="#22d3ee" />
        <circle cx="50" cy="59" r="1.5" fill="#ffffff" />
        <circle cx="72" cy="59" r="1.5" fill="#ffffff" />
        <path d="M54 70 Q60 75 66 70" fill="none" stroke="#f8fafc" strokeWidth="2.4" strokeLinecap="round" />
        {evolutionStage >= 1 && (
          <ellipse cx="60" cy="60" rx="46" ry="14" fill="none" stroke="#38bdf8" strokeWidth="2" transform="rotate(-18 60 60)" />
        )}
      </svg>
    );
  }

  if (spiritId === 'math_griffin') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-label="數律獅鷲">
        <defs>
          <radialGradient id="gearAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity={haloOpacity} />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#gearAura)" />
        {/* Gear Halo */}
        <circle cx="60" cy="60" r="42" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 7" />
        {/* Mechanical Wings */}
        <path d="M32 62 L8 46 L18 76 L34 74 Z" fill="#0ea5e9" stroke="#f8fafc" strokeWidth="2" />
        <path d="M88 62 L112 46 L102 76 L86 74 Z" fill="#0ea5e9" stroke="#f8fafc" strokeWidth="2" />
        {/* Griffin Face */}
        <circle cx="60" cy="58" r="25" fill="#fff7ed" stroke="#f97316" strokeWidth="3.5" />
        {/* Crest Feathers */}
        <path d="M44 35 L40 20 L54 32 M76 35 L80 20 L66 32" fill="#f97316" />
        <circle cx="50" cy="56" r="3.8" fill="#0f172a" />
        <circle cx="70" cy="56" r="3.8" fill="#0f172a" />
        <circle cx="51" cy="54.8" r="1.4" fill="#38bdf8" />
        <circle cx="71" cy="54.8" r="1.4" fill="#38bdf8" />
        {/* Golden Beak */}
        <polygon points="60,59 67,67 60,72 53,67" fill="#f59e0b" stroke="#92400e" strokeWidth="1.5" />
      </svg>
    );
  }

  // forest_deer
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} aria-label="森羅鹿靈">
      <defs>
        <radialGradient id="leafAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity={haloOpacity} />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="url(#leafAura)" />
      {/* Antlers with leaves */}
      <path d="M46 38 L34 16 M39 26 L28 24 M74 38 L86 16 M81 26 L92 24" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="32" cy="18" rx="7" ry="4" fill="#10b981" transform="rotate(-30 32 18)" />
      <ellipse cx="88" cy="18" rx="7" ry="4" fill="#10b981" transform="rotate(30 88 18)" />
      <circle cx="60" cy="30" r="5" fill="#fb7185" />
      {/* Ears */}
      <ellipse cx="32" cy="50" rx="10" ry="5" fill="#fde68a" stroke="#b45309" strokeWidth="2" transform="rotate(-20 32 50)" />
      <ellipse cx="88" cy="50" rx="10" ry="5" fill="#fde68a" stroke="#b45309" strokeWidth="2" transform="rotate(20 88 50)" />
      {/* Face */}
      <ellipse cx="60" cy="62" rx="24" ry="23" fill="#fef3c7" stroke="#059669" strokeWidth="3" />
      <circle cx="50" cy="60" r="3.8" fill="#064e3b" />
      <circle cx="70" cy="60" r="3.8" fill="#064e3b" />
      <circle cx="51" cy="58.8" r="1.3" fill="#ffffff" />
      <circle cx="71" cy="58.8" r="1.3" fill="#ffffff" />
      <ellipse cx="60" cy="68" rx="4" ry="2.6" fill="#92400e" />
      <path d="M55 74 Q60 78 65 74" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

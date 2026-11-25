import React from 'react';
import type { AchievementDef, MedalTier } from '../types/game';

const TIER_PALETTE: Record<
  MedalTier,
  { outer: string; inner: string; stroke: string; ribbon: string; glow: string }
> = {
  bronze: {
    outer: '#b45309',
    inner: '#f59e0b',
    stroke: '#fde68a',
    ribbon: '#9a3412',
    glow: 'rgba(245, 158, 11, 0.25)',
  },
  silver: {
    outer: '#64748b',
    inner: '#cbd5e1',
    stroke: '#f8fafc',
    ribbon: '#1d4ed8',
    glow: 'rgba(148, 163, 184, 0.3)',
  },
  gold: {
    outer: '#d97706',
    inner: '#fde047',
    stroke: '#fef9c3',
    ribbon: '#b91c1c',
    glow: 'rgba(250, 204, 21, 0.35)',
  },
  prism: {
    outer: '#7c3aed',
    inner: '#22d3ee',
    stroke: '#f0abfc',
    ribbon: '#be185d',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
};

export const AchievementMedalSvg: React.FC<{
  tier: MedalTier;
  motif: AchievementDef['medalMotif'];
  unlocked: boolean;
  size?: number;
}> = ({ tier, motif, unlocked, size = 56 }) => {
  const pal = unlocked
    ? TIER_PALETTE[tier]
    : {
        outer: '#1e293b',
        inner: '#334155',
        stroke: '#475569',
        ribbon: '#1e293b',
        glow: 'transparent',
      };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Ribbon tails */}
      <polygon points="20,42 15,61 25,55 30,61 30,44" fill={pal.ribbon} />
      <polygon points="44,42 49,61 39,55 34,61 34,44" fill={pal.ribbon} />

      {/* Outer glow */}
      {unlocked && <circle cx="32" cy="27" r="24" fill={pal.glow} />}

      {/* Medal body (octagonal crest) */}
      <polygon
        points="32,5 47,11 53,27 47,42 32,48 17,42 11,27 17,11"
        fill={pal.outer}
        stroke={pal.stroke}
        strokeWidth="2.2"
      />
      <circle cx="32" cy="27" r="15.5" fill={pal.inner} fillOpacity={unlocked ? 0.92 : 0.45} />

      {/* Center Motif */}
      {motif === 'crown' && (
        <path
          d="M22 33 L24 21 L29 26 L32 19 L35 26 L40 21 L42 33 Z"
          fill={unlocked ? '#0f172a' : '#64748b'}
        />
      )}
      {motif === 'star' && (
        <polygon
          points="32,16 35.4,23.2 43.2,24.2 37.5,29.6 39,37.4 32,33.6 25,37.4 26.5,29.6 20.8,24.2 28.6,23.2"
          fill={unlocked ? '#0f172a' : '#64748b'}
        />
      )}
      {motif === 'flame' && (
        <path
          d="M32 16 C37 22 40 26 39 32 C38 36 35 38 32 38 C29 38 25 35 25 30 C25 25 29 21 32 16 Z"
          fill={unlocked ? '#0f172a' : '#64748b'}
        />
      )}
      {motif === 'quill' && (
        <path
          d="M40 18 C32 19 25 25 23 36 L27 36 C29 31 34 27 40 24 Z"
          fill={unlocked ? '#0f172a' : '#64748b'}
        />
      )}
      {motif === 'compass' && (
        <>
          <circle cx="32" cy="27" r="9" fill="none" stroke={unlocked ? '#0f172a' : '#64748b'} strokeWidth="2" />
          <polygon points="32,19 35,27 32,35 29,27" fill={unlocked ? '#0f172a' : '#64748b'} />
        </>
      )}
      {motif === 'shield' && (
        <path
          d="M24 20 L32 17 L40 20 L39 29 C38 34 35 37 32 39 C29 37 26 34 25 29 Z"
          fill={unlocked ? '#0f172a' : '#64748b'}
        />
      )}
    </svg>
  );
};

import React from 'react';
import type { CharacterTemplate } from '../types/game';

export const PLAYER_AVATARS = [
  { id: 'avatar_star', label: '星光少年', bg: '#1d4ed8', accent: '#facc15', hat: '#38bdf8' },
  { id: 'avatar_ink', label: '墨韻少女', bg: '#991b1b', accent: '#fde047', hat: '#1e293b' },
  { id: 'avatar_gear', label: '齒輪工匠', bg: '#c2410c', accent: '#38bdf8', hat: '#f59e0b' },
  { id: 'avatar_chef', label: '元素小廚', bg: '#047857', accent: '#fb923c', hat: '#f8fafc' },
  { id: 'avatar_owl', label: '智光貓頭鷹', bg: '#4338ca', accent: '#22d3ee', hat: '#a855f7' },
  { id: 'avatar_fox', label: '靈狐學徒', bg: '#b45309', accent: '#fef08a', hat: '#dc2626' },
] as const;

export const PlayerAvatarSvg: React.FC<{ avatarId: string; size?: number }> = ({
  avatarId,
  size = 56,
}) => {
  const av = PLAYER_AVATARS.find((a) => a.id === avatarId) ?? PLAYER_AVATARS[0];
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-label={av.label} className="rounded-2xl shrink-0">
      <rect width="80" height="80" rx="20" fill={av.bg} />
      <circle cx="40" cy="40" r="32" fill="rgba(255,255,255,0.08)" />
      {/* Shoulders */}
      <path d="M16 74 Q40 56 64 74 Z" fill={av.hat} />
      {/* Head */}
      <circle cx="40" cy="41" r="19" fill="#fde6c8" stroke="#0f172a" strokeWidth="2.5" />
      {/* Hair / Cap */}
      <path d="M21 37 Q40 14 59 37 Z" fill={av.hat} stroke="#0f172a" strokeWidth="2" />
      <circle cx="40" cy="24" r="4" fill={av.accent} />
      {/* Eyes */}
      <circle cx="33" cy="43" r="3" fill="#0f172a" />
      <circle cx="47" cy="43" r="3" fill="#0f172a" />
      <circle cx="34" cy="42" r="1.1" fill="#ffffff" />
      <circle cx="48" cy="42" r="1.1" fill="#ffffff" />
      <path d="M36 51 Q40 54 44 51" fill="none" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export const CharacterPortraitSvg: React.FC<{
  character: CharacterTemplate;
  size?: number;
  silhouette?: boolean;
}> = ({ character, size = 76, silhouette = false }) => {
  const p = silhouette ? '#1e293b' : character.primaryColor;
  const s = silhouette ? '#334155' : character.secondaryColor;
  const a = silhouette ? '#475569' : character.accentColor;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className="rounded-xl shrink-0"
      aria-label={silhouette ? '未發現角色剪影' : character.name}
    >
      <rect width="96" height="96" rx="18" fill={silhouette ? '#0f172a' : p} fillOpacity={silhouette ? 0.95 : 0.25} />
      <rect x="2" y="2" width="92" height="92" rx="16" fill="none" stroke={s} strokeWidth="2.5" strokeOpacity="0.7" />
      {/* Torso */}
      <path d="M22 90 Q48 64 74 90 Z" fill={p} stroke="#0f172a" strokeWidth="2" />
      <circle cx="48" cy="76" r="5" fill={a} />
      {/* Ears / Horns */}
      {(character.earsOrAppendage === 'cat' || character.earsOrAppendage === 'fox') && (
        <>
          <polygon points="27,36 22,14 40,28" fill={p} stroke={s} strokeWidth="2" />
          <polygon points="69,36 74,14 56,28" fill={p} stroke={s} strokeWidth="2" />
        </>
      )}
      {character.earsOrAppendage === 'horns' && (
        <>
          <polygon points="28,36 18,14 38,28" fill={s} />
          <polygon points="68,36 78,14 58,28" fill={s} />
        </>
      )}
      {character.earsOrAppendage === 'bunny' && (
        <>
          <rect x="31" y="8" width="10" height="26" rx="5" fill={s} />
          <rect x="55" y="8" width="10" height="26" rx="5" fill={s} />
        </>
      )}
      {/* Head */}
      <circle
        cx="48"
        cy="45"
        r="21"
        fill={silhouette ? '#1e293b' : character.earsOrAppendage === 'mech' ? p : '#fde6c8'}
        stroke="#0f172a"
        strokeWidth="2.5"
      />
      {/* Crown / Visor */}
      <path d="M27 40 Q48 16 69 40 Z" fill={p} />
      <rect x="32" y="34" width="32" height="5" rx="2.5" fill={s} />
      {!silhouette && (
        <>
          {character.earsOrAppendage === 'mech' ? (
            <rect x="34" y="43" width="28" height="8" rx="3" fill="#22d3ee" />
          ) : (
            <>
              <circle cx="40" cy="48" r="3.4" fill="#0f172a" />
              <circle cx="56" cy="48" r="3.4" fill="#0f172a" />
              <circle cx="41" cy="46.8" r="1.2" fill="#fff" />
              <circle cx="57" cy="46.8" r="1.2" fill="#fff" />
            </>
          )}
        </>
      )}
      {silhouette && (
        <text x="48" y="54" textAnchor="middle" fill="#94a3b8" fontSize="24" fontWeight="900">
          ?
        </text>
      )}
    </svg>
  );
};

import React, { useEffect } from 'react';
import { Play, ShieldCheck, Sparkles } from 'lucide-react';
import { GAME_ART } from '../assets/worldAssets';
import { TitleEmblem } from '../components/TitleEmblem';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

export const TitleScreen: React.FC = () => {
  const { onboarded, profile, setScreen, settings } = useGameStore();

  const handleStart = () => {
    playSfx('perfect', settings.soundEnabled);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (onboarded && profile) {
      setScreen('lobby');
    } else {
      setScreen('onboarding');
    }
  };

  // Title-to-Start Handshake: Enter or Space launches game
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarded, profile]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex flex-col justify-between">
      {/* Full-bleed Illustrated Key Art Backdrop */}
      <img
        src={GAME_ART.titleBg}
        alt="智光守護者天空學園與四大知識世界"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Measured Scrim protecting upper-left negative space for high contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/45 to-slate-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/35" />

      {/* Top right minimal utility */}
      <div className="relative z-10 flex items-center justify-end p-5 sm:p-8">
        <PWAInstallButton variant="compact" />
      </div>

      {/* Left-third negative-space anchor: Title Emblem + Single Primary CTA */}
      <section className="relative z-10 px-6 sm:px-14 max-w-2xl my-auto py-8">
        <TitleEmblem />

        <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-lg font-medium drop-shadow">
          對應台灣 108 課綱三至六年級國語、英語、數學、自然四大主題世界。用答題速度與正確率釋放知識力量，淨化混沌迷霧！
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            data-start="true"
            onClick={handleStart}
            className="min-h-[58px] inline-flex items-center gap-3 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-black text-lg px-9 py-4 shadow-[0_12px_36px_rgba(251,191,36,0.4)] transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            {onboarded && profile ? `繼續冒險（${profile.nickname}）` : '開始冒險'}
          </button>

          {onboarded && profile && (
            <button
              type="button"
              onClick={() => setScreen('parent_zone')}
              className="min-h-[58px] inline-flex items-center gap-2 rounded-2xl border border-slate-500/70 bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-bold text-base px-6 py-4 transition cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-sky-300" />
              家長專區
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" />
            零課金・不收真名・離線可玩
          </span>
          <span aria-hidden="true">·</span>
          <span>國語 RPG ／ 英語射擊 ／ 數學塔防 ／ 自然料理</span>
        </div>
      </section>

      {/* Flat borderless control hint in bottom safe margin */}
      <footer className="relative z-10 px-6 sm:px-14 pb-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300/90">
        <span>按 Enter 或 Space 開始 · 戰鬥支援鍵盤 1–4 快速作答 · Esc 暫停</span>
        <span>康軒 ／ 南一 ／ 翰林 108 課綱版本皆可切換</span>
      </footer>
    </main>
  );
};

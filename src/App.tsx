import React, { useEffect } from 'react';
import { Eye, MoonStar } from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { TitleScreen } from './screens/TitleScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { AdventureSelectScreen } from './screens/AdventureSelectScreen';
import { WorldMapScreen } from './screens/WorldMapScreen';
import { BattleScreen } from './screens/BattleScreen';
import { CharactersScreen } from './screens/CharactersScreen';
import { SpiritScreen } from './screens/SpiritScreen';
import { ForgeScreen } from './screens/ForgeScreen';
import { SummonScreen } from './screens/SummonScreen';
import { QuestsAndTitlesScreen } from './screens/QuestsAndTitlesScreen';
import { WrongBookScreen } from './screens/WrongBookScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ParentZoneScreen } from './screens/ParentZoneScreen';
import { OfflineIndicator } from './components/PWAInstallButton';

export default function App() {
  const {
    hydrated,
    screen,
    onboarded,
    settings,
    restBannerOpen,
    lastToast,
    hydrate,
    quickDemoStart,
    tickPlaySecond,
    dismissRestBanner,
    setScreen,
  } = useGameStore();

  // Hydrate persisted IndexedDB/localStorage snapshot on boot + handle ?autostart=1
  useEffect(() => {
    void hydrate().then(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        quickDemoStart();
      }
    });
  }, [hydrate, quickDemoStart]);

  // Sync accessibility attributes to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fontScale = settings.fontScale;
    root.dataset.colorblind = settings.colorblindMode ? 'true' : 'false';
    root.dataset.reducedFlash = settings.reducedFlash ? 'true' : 'false';
  }, [settings.fontScale, settings.colorblindMode, settings.reducedFlash]);

  // Sync body[data-state] for clean lifecycle signaling (BattleScreen handles its own playing/paused/gameover)
  useEffect(() => {
    if (screen === 'title') {
      document.body.dataset.state = 'title';
    } else if (screen !== 'battle') {
      document.body.dataset.state = 'playing';
    }
  }, [screen]);

  // Play timer & 20-min eye-rest reminder
  useEffect(() => {
    if (!onboarded || screen === 'title') return;
    const timer = window.setInterval(() => {
      tickPlaySecond();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [onboarded, screen, tickPlaySecond]);

  // Check optional 22:00 - 07:00 bedtime lock
  const hour = new Date().getHours();
  const isBedtimeLocked =
    settings.bedtimeLockEnabled &&
    onboarded &&
    screen !== 'parent_zone' &&
    screen !== 'title' &&
    (hour >= 22 || hour < 7);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-amber-300 font-bold">
        正在喚醒智光世界...
      </div>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'title':
        return <TitleScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'lobby':
        return <LobbyScreen />;
      case 'adventure_select':
        return <AdventureSelectScreen />;
      case 'world_map':
        return <WorldMapScreen />;
      case 'battle':
        return <BattleScreen />;
      case 'characters':
        return <CharactersScreen />;
      case 'spirit':
        return <SpiritScreen />;
      case 'forge':
        return <ForgeScreen />;
      case 'summon':
        return <SummonScreen />;
      case 'achievements':
      case 'quests':
      case 'titles':
      case 'compendium':
        return <QuestsAndTitlesScreen />;
      case 'wrong_book':
        return <WrongBookScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'parent_zone':
        return <ParentZoneScreen />;
      default:
        return <TitleScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      {renderScreen()}

      {/* 20-Minute Friendly Eye Rest Reminder */}
      {restBannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-3xl border border-emerald-400/50 bg-slate-900 p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
              <Eye className="w-7 h-7 text-emerald-300" />
            </div>
            <h2 className="text-xl font-black text-emerald-300">守護精靈提醒：眼睛休息一下！</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              你已經專注學習 {settings.restReminderMinutes} 分鐘囉！起來喝口水、看看遠方綠色植物 20 秒，回來答題更厲害！
            </p>
            <button
              type="button"
              onClick={dismissRestBanner}
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 min-h-[52px] cursor-pointer"
            >
              我休息好了，繼續冒險
            </button>
          </div>
        </div>
      )}

      {/* Optional Bedtime Lock Overlay (22:00 - 07:00) */}
      {isBedtimeLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4">
          <div className="w-full max-w-md rounded-3xl border border-indigo-400/40 bg-slate-900 p-7 text-center space-y-4 shadow-2xl">
            <MoonStar className="w-12 h-12 text-amber-300 mx-auto" />
            <h2 className="text-2xl font-black text-white">智光世界晚安休息中</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              現在是夜間睡眠時段（22:00 – 07:00），守護精靈也去睡覺充電囉！明天精神飽滿再來挑戰吧！
            </p>
            <button
              type="button"
              onClick={() => setScreen('parent_zone')}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-3 min-h-[48px] text-sm cursor-pointer"
            >
              家長解鎖設定
            </button>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {lastToast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-amber-400/60 bg-slate-900/95 px-5 py-3.5 text-sm font-bold text-amber-200 shadow-2xl"
        >
          {lastToast}
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import {
  Award,
  BookMarked,
  BookOpen,
  Compass,
  Flame,
  Hammer,
  Heart,
  Play,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { WORLD_THEMES, GAME_ART } from '../assets/worldAssets';
import { getSpiritTemplate } from '../data/spirits';
import { TITLE_DEFS } from '../data/titlesAndQuests';
import { GuardianSpiritSvg } from '../components/GuardianSpiritSvg';
import { PlayerAvatarSvg } from '../components/CharacterAvatarSvg';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

export const LobbyScreen: React.FC = () => {
  const {
    profile,
    accountLevel,
    currencies,
    focusValue,
    spirit,
    selectedGrade,
    selectedSemester,
    selectedSubject,
    wrongBook,
    quests,
    equippedTitleId,
    knowledgeMastery,
    settings,
    setScreen,
    petSpirit,
    showToast,
  } = useGameStore();

  const spiritTpl = getSpiritTemplate(spirit.activeId);
  const worldTheme = WORLD_THEMES[selectedSubject];
  const equippedTitle = TITLE_DEFS.find((t) => t.id === equippedTitleId) ?? TITLE_DEFS[0];

  const ungraduatedWrongs = useMemo(
    () => Object.values(wrongBook).filter((r) => !r.graduated),
    [wrongBook]
  );
  const claimableQuests = useMemo(
    () => quests.filter((q) => !q.claimed && q.current >= q.target).length,
    [quests]
  );

  const [spiritSpeech, setSpiritSpeech] = useState<string>(() =>
    ungraduatedWrongs.length > 0
      ? `嗨 ${profile?.nickname ?? '小守護者'}！錯題本裡有 ${ungraduatedWrongs.length} 題等著我們複習變強喔！`
      : `早安 ${profile?.nickname ?? '小守護者'}！今天要去「${worldTheme.worldName}」淨化迷霧嗎？`
  );
  const [aiBusy, setAiBusy] = useState(false);

  const handlePetSpirit = () => {
    playSfx('heal', settings.soundEnabled);
    petSpirit();
    const lines = [
      `嘻嘻！摸摸讓我充滿能量！繼續答題我們就能一起進化到「${spiritTpl.evolutionNames[Math.min(3, spirit.evolutionStage + 1)]}」！`,
      `答題時穩穩看題目，就算慢一點也不會被懲罰喔！`,
      `${profile?.nickname ?? '小守護者'} 最棒了！記得每 20 分鐘要讓眼睛看遠方休息一下！`,
    ];
    setSpiritSpeech(lines[Math.floor(Math.random() * lines.length)]);
    showToast(`${spiritTpl.name} 開心地蹭了蹭你！（羈絆值提升）`);
  };

  const handleAskAiSpirit = async () => {
    if (aiBusy) return;
    setAiBusy(true);
    try {
      const sortedWeak = Object.entries(knowledgeMastery).sort((a, b) => a[1] - b[1]);
      const weakTopic = sortedWeak[0]?.[0];
      const res = await fetch('/api/ai/spirit-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: profile?.nickname ?? '小守護者',
          grade: selectedGrade,
          spiritName: spiritTpl.name,
          spiritStage: spiritTpl.evolutionNames[spirit.evolutionStage],
          wrongCount: ungraduatedWrongs.length,
          weakTopic,
          userTopic: '給我一個今天的學習鼓勵與冒險小建議！',
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setSpiritSpeech(data.reply);
      } else {
        setSpiritSpeech(data.error || '精靈暫時無法連線，不過你現在就可以直接挑戰關卡喔！');
      }
    } catch {
      setSpiritSpeech('目前離線中，但所有關卡與錯題本都能離線暢玩喔！');
    } finally {
      setAiBusy(false);
    }
  };

  const modules = [
    { id: 'characters' as const, label: '角色隊伍', sub: '升級・進化・融合', icon: Users, color: 'text-amber-300' },
    { id: 'spirit' as const, label: '守護精靈', sub: `Lv.${spirit.level}・天賦樹`, icon: Heart, color: 'text-rose-300' },
    { id: 'forge' as const, label: '鍛造屋', sub: '+15不爆裝・知識武器', icon: Hammer, color: 'text-orange-300' },
    { id: 'summon' as const, label: '召喚神殿', sub: '30抽保底・零課金', icon: Sparkles, color: 'text-cyan-300' },
    {
      id: 'quests' as const,
      label: '任務板',
      sub: claimableQuests > 0 ? `${claimableQuests} 項獎勵可領取` : '每日／每週挑戰',
      icon: ScrollText,
      color: 'text-emerald-300',
    },
    {
      id: 'wrong_book' as const,
      label: '錯題本',
      sub: ungraduatedWrongs.length > 0 ? `${ungraduatedWrongs.length} 題待複習` : '1/3/7天間隔複習',
      icon: BookMarked,
      color: 'text-sky-300',
    },
    { id: 'compendium' as const, label: '圖鑑與知識卡', sub: 'Boss知識卡收藏', icon: BookOpen, color: 'text-violet-300' },
    {
      id: 'achievements' as const,
      label: '成就勳章與稱號',
      sub: `學習統計・${equippedTitle.name}`,
      icon: Award,
      color: 'text-yellow-300',
    },
    { id: 'settings' as const, label: '設定與無障礙', sub: '注音・朗讀・練習模式', icon: Settings, color: 'text-slate-300' },
    { id: 'parent_zone' as const, label: '家長／老師專區', sub: '學習報告・家長鎖', icon: ShieldCheck, color: 'text-emerald-400' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Game Shell Resource Strip */}
      <header className="border-b border-slate-800/90 bg-slate-900/90 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PlayerAvatarSvg avatarId={profile?.avatarId ?? 'avatar_star'} size={48} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white">
                {profile?.nickname ?? '小光守護者'}
              </span>
              <span className="text-xs font-bold text-amber-300">
                〔{equippedTitle.name}〕
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 font-mono-num">
              <span>Lv.{accountLevel}</span>
              <span aria-hidden="true">·</span>
              <span>國小 {profile?.grade ?? selectedGrade} 年級</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-300">專注值 {focusValue}/100</span>
            </div>
          </div>
        </div>

        {/* Currencies */}
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold font-mono-num">
          <div className="flex items-center gap-1.5 text-amber-300">
            <span>金幣</span>
            <span className="text-white">{currencies.coins}</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">/</span>
          <div className="flex items-center gap-1.5 text-sky-300">
            <span>智光晶石</span>
            <span className="text-white">{currencies.crystals}</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">/</span>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <span>知識果實</span>
            <span className="text-white">{currencies.fruits}</span>
          </div>
          <span aria-hidden="true" className="text-slate-600">/</span>
          <div className="flex items-center gap-1.5 text-fuchsia-300">
            <span>召喚券</span>
            <span className="text-white">{currencies.tickets}</span>
          </div>
          <div className="hidden xl:block ml-2">
            <PWAInstallButton variant="compact" />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Hero Split: Adventure Launch Banner + Interactive Floating Guardian Spirit */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Primary Adventure Card (8 cols) */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-slate-700/80 min-h-[270px] flex flex-col justify-between p-6 sm:p-8 shadow-xl">
            <img
              src={GAME_ART.worlds[selectedSubject]}
              alt={worldTheme.worldName}
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-slate-950/70 to-slate-950/30" />

            <div className="relative z-10 max-w-xl">
              <p className="text-xs font-bold text-amber-300 tracking-wide">
                上次冒險進度 · 國小 {selectedGrade} 年級 {selectedSemester === 1 ? '上學期' : '下學期'} · {worldTheme.subjectName}
              </p>
              <h1 className="mt-1.5 text-3xl sm:text-4xl font-black text-white">
                {worldTheme.worldName}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed">
                {worldTheme.storyIntro}
              </p>
            </div>

            <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  playSfx('perfect', settings.soundEnabled);
                  setScreen('world_map');
                }}
                className="min-h-[54px] inline-flex items-center gap-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base px-7 py-3.5 shadow-lg transition cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                繼續冒險（進入世界地圖）
              </button>
              <button
                type="button"
                onClick={() => {
                  playSfx('click', settings.soundEnabled);
                  setScreen('adventure_select');
                }}
                className="min-h-[54px] inline-flex items-center gap-2 rounded-2xl border border-slate-400/50 bg-slate-900/85 hover:bg-slate-800 text-white font-bold text-base px-6 py-3.5 transition cursor-pointer"
              >
                <Compass className="w-5 h-5 text-sky-300" />
                切換年級・學期・科目
              </button>
            </div>
          </div>

          {/* Guardian Spirit Interactive Companion Panel (4 cols) */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-800 bg-slate-900/95 p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-emerald-300">跨科守護精靈</p>
                <h2 className="text-xl font-black text-white mt-0.5">
                  {spiritTpl.evolutionNames[spirit.evolutionStage]}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Lv.{spirit.level} · {spiritTpl.passiveDesc}</p>
              </div>
              <button
                type="button"
                onClick={() => setScreen('spirit')}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                前往培養
              </button>
            </div>

            <div className="my-3 flex flex-col items-center">
              <button
                type="button"
                onClick={handlePetSpirit}
                aria-label={`摸摸守護精靈 ${spiritTpl.name}`}
                className="animate-spirit-float cursor-pointer focus:outline-none hover:scale-105 transition"
              >
                <GuardianSpiritSvg spiritId={spirit.activeId} evolutionStage={spirit.evolutionStage} size={108} />
              </button>
              <p className="mt-2 rounded-xl bg-slate-950/80 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 leading-relaxed text-center w-full">
                「{spiritSpeech}」
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePetSpirit}
                className="flex-1 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold px-3 py-2 cursor-pointer"
              >
                摸摸互動
              </button>
              <button
                type="button"
                disabled={aiBusy}
                onClick={() => void handleAskAiSpirit()}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold px-3 py-2 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                {aiBusy ? '思考中…' : 'AI 精靈鼓勵'}
              </button>
            </div>
          </div>
        </section>

        {/* Academy Modules Grid (2 rows × 5 columns on desktop) */}
        <section aria-label="學園功能選單">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-300">智光學園設施</h2>
            <span className="text-xs text-slate-400">
              {settings.practiceMode ? '目前為練習模式（不計時）' : '標準計時冒險模式'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    playSfx('click', settings.soundEnabled);
                    setScreen(mod.id);
                  }}
                  className="min-h-[86px] rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-amber-400/60 hover:bg-slate-800/90 p-4 text-left transition flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${mod.color}`} />
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-black text-white">{mod.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">{mod.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

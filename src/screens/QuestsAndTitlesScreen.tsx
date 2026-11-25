import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Check,
  Gift,
  Lock,
  Medal,
  PieChart as PieChartIcon,
  ScrollText,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AchievementCategory } from '../types/game';
import { CHARACTER_TEMPLATES } from '../data/characters';
import { getAllCurriculumUnits } from '../data/curriculum';
import { TITLE_DEFS } from '../data/titlesAndQuests';
import { WORLD_THEMES } from '../assets/worldAssets';
import {
  computeSubjectAnalytics,
  evaluateAchievements,
} from '../game/core/achievements';
import { AchievementMedalSvg } from '../components/AchievementMedalSvg';
import { CharacterPortraitSvg } from '../components/CharacterAvatarSvg';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

const TITLE_FRAME_STYLE: Record<string, string> = {
  gold: 'border-amber-400/70 bg-amber-950/30 text-amber-200',
  ink: 'border-slate-500/80 bg-slate-900 text-slate-100',
  neon: 'border-cyan-400/70 bg-cyan-950/30 text-cyan-200',
  rainbow:
    'border-fuchsia-400/80 bg-gradient-to-r from-amber-900/40 via-fuchsia-900/40 to-cyan-900/40 text-amber-100',
  emerald: 'border-emerald-400/70 bg-emerald-950/30 text-emerald-200',
};

const CATEGORY_LABELS: Record<'all' | AchievementCategory, string> = {
  all: '全部勳章',
  answer_count: '答題數量',
  streak_accuracy: '連續正確率',
  subject_exploration: '科目探索進度',
};

const TIER_LABELS = {
  bronze: { label: '銅質勳章', cls: 'text-amber-400' },
  silver: { label: '銀質勳章', cls: 'text-slate-300' },
  gold: { label: '金質勳章', cls: 'text-yellow-300' },
  prism: { label: '幻彩勳章', cls: 'text-fuchsia-300' },
} as const;

export const QuestsAndTitlesScreen: React.FC = () => {
  const {
    screen,
    quests,
    unlockedTitles,
    equippedTitleId,
    characters,
    collectedCards,
    telemetry,
    stageStars,
    bestCorrectStreak,
    claimedAchievements,
    selectedGrade,
    selectedSemester,
    settings,
    setScreen,
    claimQuest,
    claimAchievement,
    equipTitle,
    showToast,
  } = useGameStore();

  const [achCategory, setAchCategory] = useState<'all' | AchievementCategory>('all');

  const activeTab: 'achievements' | 'quests' | 'titles' | 'compendium' =
    screen === 'achievements'
      ? 'achievements'
      : screen === 'titles'
        ? 'titles'
        : screen === 'compendium'
          ? 'compendium'
          : 'quests';

  const ownedIdSet = useMemo(() => new Set(characters.map((c) => c.templateId)), [characters]);
  const allUnits = useMemo(() => getAllCurriculumUnits(settings.edition), [settings.edition]);
  const collectedCardUnits = useMemo(
    () => allUnits.filter((u) => collectedCards.includes(u.id)),
    [allUnits, collectedCards]
  );

  // Evaluate achievements from real gameplay state
  const achievementReport = useMemo(
    () =>
      evaluateAchievements({
        telemetry,
        stageStars,
        bestCorrectStreak,
      }),
    [telemetry, stageStars, bestCorrectStreak]
  );

  const unlockedAchievementCount = useMemo(
    () => achievementReport.list.filter((a) => a.unlocked).length,
    [achievementReport]
  );
  const claimableAchievementCount = useMemo(
    () =>
      achievementReport.list.filter(
        (a) => a.unlocked && !claimedAchievements.includes(a.def.id)
      ).length,
    [achievementReport, claimedAchievements]
  );

  const filteredAchievements = useMemo(() => {
    if (achCategory === 'all') return achievementReport.list;
    return achievementReport.list.filter((a) => a.def.category === achCategory);
  }, [achievementReport, achCategory]);

  // Compute Recharts PieChart + BarChart datasets for the 4 subjects
  const subjectAnalytics = useMemo(
    () =>
      computeSubjectAnalytics({
        telemetry,
        stageStars,
        selectedGrade,
        selectedSemester,
        stagesPerSubject: 30,
      }),
    [telemetry, stageStars, selectedGrade, selectedSemester]
  );

  const dailyQuests = quests.filter((q) => q.type === 'daily');
  const weeklyQuests = quests.filter((q) => q.type === 'weekly');

  const handleClaimQuest = (questId: string, rewardText: string) => {
    if (claimQuest(questId)) {
      playSfx('victory', settings.soundEnabled);
      showToast(`已領取任務獎勵：${rewardText}`);
    }
  };

  const handleClaimAchievement = (id: string, name: string, coins: number, crystals: number) => {
    if (claimAchievement(id)) {
      playSfx('victory', settings.soundEnabled);
      showToast(`已領取「${name}」勳章獎勵：金幣 +${coins}、智光晶石 +${crystals}！`);
    }
  };

  const handleEquipTitle = (titleId: string, name: string) => {
    equipTitle(titleId);
    playSfx('click', settings.soundEnabled);
    showToast(`已配戴稱號「${name}」`);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScreen('lobby')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-sm font-bold min-h-[48px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回主城
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-amber-300">
                學園成就・學習圖表・任務圖鑑
              </h1>
              <p className="text-xs text-slate-400">
                追蹤四大科目探索完成度與答題準確率，收集專屬勳章與榮譽稱號
              </p>
            </div>
          </div>

          {/* 4-Tab Switcher */}
          <div className="inline-flex flex-wrap rounded-xl bg-slate-900 border border-slate-800 p-1 gap-1">
            {[
              {
                id: 'achievements' as const,
                label:
                  claimableAchievementCount > 0
                    ? `成就勳章 (${claimableAchievementCount})`
                    : '成就勳章',
                icon: Medal,
              },
              { id: 'quests' as const, label: '任務板', icon: ScrollText },
              { id: 'titles' as const, label: '稱號殿堂', icon: Award },
              { id: 'compendium' as const, label: '英雄與知識圖鑑', icon: BookOpen },
            ].map((t) => {
              const Icon = t.icon;
              const isAct = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setScreen(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold min-h-[44px] transition cursor-pointer ${
                    isAct ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Recharts 4-Subject Learning Overview (Always visible at top of QuestsAndTitlesScreen) */}
        <section
          aria-label="四大科目學習統計圖表"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          {/* PieChart: 4-Subject Exploration Completion */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-amber-300" />
                <div>
                  <h2 className="text-base font-black text-white">
                    四大科目探索完成度（圓餅圖）
                  </h2>
                  <p className="text-xs text-slate-400">
                    {subjectAnalytics.hasAnyExploration
                      ? `全科累計探索進度 ${subjectAnalytics.overallExplorationPct}%（已通關 ${achievementReport.totalClearedStages} 關）`
                      : '尚未通關任何關卡，目前顯示四大世界探索起點分佈'}
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm font-black text-amber-300">
                {achievementReport.exploredSubjectsCount}/4 科
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
              <div className="sm:col-span-7 h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subjectAnalytics.subjects}
                      dataKey="pieValue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={78}
                      paddingAngle={3}
                      stroke="#0f172a"
                      strokeWidth={2}
                    >
                      {subjectAnalytics.subjects.map((entry) => (
                        <Cell key={entry.subject} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      formatter={(_val: unknown, _name: unknown, item: { payload?: { name: string; exploredStages: number; totalStages: number; explorationPct: number } }) => {
                        const p = item?.payload;
                        if (!p) return ['', ''];
                        return [
                          `已探索 ${p.exploredStages} / ${p.totalStages} 關 (${p.explorationPct}%)`,
                          p.name,
                        ];
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={28}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Crisp per-subject completion readout */}
              <div className="sm:col-span-5 space-y-2.5">
                {subjectAnalytics.subjects.map((s) => (
                  <div key={s.subject} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.name}
                      </span>
                      <span className="font-mono text-slate-300">
                        {s.exploredStages}/{s.totalStages} 關 ({s.explorationPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(s.explorationPct, s.exploredStages > 0 ? 6 : 0)}%`,
                          backgroundColor: s.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BarChart: 4-Subject Answer Accuracy */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-300" />
                <div>
                  <h2 className="text-base font-black text-white">
                    四大科目答題準確率統計（長條圖）
                  </h2>
                  <p className="text-xs text-slate-400">
                    累計作答 {achievementReport.totalAnswered} 題・整體準確率{' '}
                    {subjectAnalytics.overallAccuracyPct}%・最高連對 {achievementReport.bestStreak} 題
                  </p>
                </div>
              </div>
              <span className="font-mono text-sm font-black text-cyan-300">
                {subjectAnalytics.overallAccuracyPct}%
              </span>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectAnalytics.subjects}
                  margin={{ top: 22, right: 16, left: -12, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 700 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(_val: unknown, _name: unknown, item: { payload?: { totalAnswered: number; correctAnswered: number; accuracyPct: number } }) => {
                      const p = item?.payload;
                      if (!p) return ['', '準確率'];
                      if (p.totalAnswered === 0) return ['尚無作答紀錄', '答題準確率'];
                      return [
                        `${p.accuracyPct}%（答對 ${p.correctAnswered} / ${p.totalAnswered} 題）`,
                        '答題準確率',
                      ];
                    }}
                  />
                  <Bar
                    dataKey="accuracyPct"
                    name="答題準確率 (%)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                    background={{ fill: 'rgba(30, 41, 59, 0.7)', radius: 8 }}
                  >
                    {subjectAnalytics.subjects.map((entry) => (
                      <Cell key={entry.subject} fill={entry.color} />
                    ))}
                    <LabelList
                      dataKey="accuracyPct"
                      position="top"
                      formatter={(val: unknown) => `${Number(val ?? 0)}%`}
                      fill="#e2e8f0"
                      fontSize={12}
                      fontWeight={700}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* TAB 1: ACHIEVEMENTS & MEDALS */}
        {activeTab === 'achievements' && (
          <section className="space-y-5">
            {/* Summary & Category Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                <span className="inline-flex items-center gap-1.5 font-black text-amber-300">
                  <Trophy className="w-4 h-4" />
                  已解鎖勳章 {unlockedAchievementCount} / {achievementReport.list.length}
                </span>
                <span className="text-slate-400 font-mono">
                  累計答題 {achievementReport.totalAnswered} 題
                </span>
                <span className="text-slate-400 font-mono">
                  最高連對 {achievementReport.bestStreak} 題
                </span>
                <span className="text-slate-400 font-mono">
                  已探索 {achievementReport.totalClearedStages} 關
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['all', 'answer_count', 'streak_accuracy', 'subject_exploration'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAchCategory(cat)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-bold min-h-[40px] transition cursor-pointer ${
                        achCategory === cat
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((item) => {
                const { def, current, target, progressPct, unlocked, accuracyMet } = item;
                const claimed = claimedAchievements.includes(def.id);
                const linkedTitle = def.unlockTitleId
                  ? TITLE_DEFS.find((t) => t.id === def.unlockTitleId)
                  : null;
                const titleEquipped = linkedTitle && equippedTitleId === linkedTitle.id;
                const tierMeta = TIER_LABELS[def.tier];

                return (
                  <div
                    key={def.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between gap-3.5 transition ${
                      unlocked
                        ? 'border-amber-400/55 bg-slate-900/95'
                        : 'border-slate-800 bg-slate-950/75 opacity-90'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <AchievementMedalSvg
                        tier={def.tier}
                        motif={def.medalMotif}
                        unlocked={unlocked}
                        size={58}
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className={`font-black ${unlocked ? tierMeta.cls : 'text-slate-500'}`}>
                            {tierMeta.label} · {CATEGORY_LABELS[def.category]}
                          </span>
                          {unlocked ? (
                            <span className="text-emerald-300 font-bold">已達成</span>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                          )}
                        </div>
                        <h3 className="text-base font-black text-white">{def.name}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{def.description}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">
                          進度：{current} / {target} {def.unitLabel}
                        </span>
                        <span className={unlocked ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
                          {progressPct}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            unlocked
                              ? 'bg-gradient-to-r from-emerald-400 to-amber-300'
                              : 'bg-amber-500/80'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      {def.minAccuracyPct !== undefined && !accuracyMet && (
                        <div className="text-[11px] text-rose-300">
                          需同時滿足總正確率 ≥ {def.minAccuracyPct}%（目前{' '}
                          {achievementReport.overallAccuracyPct}%）
                        </div>
                      )}
                    </div>

                    {/* Special Title Unlock & Claim Button */}
                    <div className="pt-1 border-t border-slate-800/80 flex flex-col gap-2">
                      {linkedTitle && (
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-amber-200 font-bold truncate">
                            特殊稱號：【{linkedTitle.name}】
                          </span>
                          {unlocked && (
                            <button
                              type="button"
                              disabled={Boolean(titleEquipped)}
                              onClick={() => handleEquipTitle(linkedTitle.id, linkedTitle.name)}
                              className="shrink-0 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-2.5 py-1 text-[11px] font-bold text-amber-300 cursor-pointer"
                            >
                              {titleEquipped ? '配戴中' : '立即配戴'}
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5 text-amber-300" />
                          金幣 {def.rewardCoins}・晶石 {def.rewardCrystals}
                        </span>
                        <button
                          type="button"
                          disabled={!unlocked || claimed}
                          onClick={() =>
                            handleClaimAchievement(
                              def.id,
                              def.name,
                              def.rewardCoins,
                              def.rewardCrystals
                            )
                          }
                          className={`rounded-xl px-4 py-2 text-xs font-black min-h-[42px] cursor-pointer ${
                            claimed
                              ? 'bg-slate-800 text-slate-500'
                              : unlocked
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-900 border border-slate-800 text-slate-500'
                          }`}
                        >
                          {claimed ? '已領獎' : unlocked ? '領取勳章獎勵' : '未解鎖'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: DAILY & WEEKLY QUESTS */}
        {activeTab === 'quests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { heading: '每日學習任務', list: dailyQuests, accent: 'text-emerald-300' },
              { heading: '每週突破挑戰', list: weeklyQuests, accent: 'text-amber-300' },
            ].map((group) => (
              <section
                key={group.heading}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3"
              >
                <h2 className={`text-base font-black ${group.accent}`}>{group.heading}</h2>
                <div className="space-y-3">
                  {group.list.map((q) => {
                    const pct = Math.min(100, Math.round((q.current / q.target) * 100));
                    const canClaim = !q.claimed && q.current >= q.target;
                    return (
                      <div
                        key={q.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/75 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white text-sm">{q.title}</span>
                            <span className="font-mono text-xs text-slate-300">
                              {q.current} / {q.target}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-xs text-amber-300 flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5" /> {q.rewardText}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleClaimQuest(q.id, q.rewardText)}
                          disabled={!canClaim}
                          className={`rounded-xl px-4 py-2.5 text-xs font-black min-h-[46px] min-w-[96px] cursor-pointer ${
                            q.claimed
                              ? 'bg-slate-800 text-slate-500'
                              : canClaim
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-900 border border-slate-700 text-slate-500'
                          }`}
                        >
                          {q.claimed ? '已領取' : canClaim ? '領取獎勵' : '進行中'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* TAB 3: TITLES HALL */}
        {activeTab === 'titles' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-amber-300">
                榮譽與成就特殊稱號（已解鎖 {unlockedTitles.length} / {TITLE_DEFS.length}）
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TITLE_DEFS.map((t) => {
                const unlocked = unlockedTitles.includes(t.id);
                const equipped = equippedTitleId === t.id;
                return (
                  <div
                    key={t.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 ${
                      unlocked
                        ? TITLE_FRAME_STYLE[t.frameStyle]
                        : 'border-slate-800 bg-slate-900/50 opacity-75'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold opacity-80">【{t.category}】</span>
                        {!unlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                      <h3 className="text-lg font-black">{t.name}</h3>
                      <p className="text-xs opacity-85">解鎖條件：{t.conditionDesc}</p>
                      <p className="text-xs font-bold text-emerald-300">加成效果：{t.bonusDesc}</p>
                    </div>
                    <button
                      type="button"
                      disabled={!unlocked || equipped}
                      onClick={() => handleEquipTitle(t.id, t.name)}
                      className={`w-full rounded-xl py-2.5 text-xs font-black min-h-[44px] cursor-pointer ${
                        equipped
                          ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-200'
                          : unlocked
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {equipped ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="w-4 h-4" /> 配戴中
                        </span>
                      ) : unlocked ? (
                        '配戴此稱號'
                      ) : (
                        '尚未解鎖'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 4: COMPENDIUM */}
        {activeTab === 'compendium' && (
          <div className="space-y-8">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-amber-300">
                  四界英雄全圖鑑（已收集 {characters.length} / {CHARACTER_TEMPLATES.length}，含隱藏融合角色）
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {CHARACTER_TEMPLATES.map((tpl) => {
                  const owned = ownedIdSet.has(tpl.id);
                  return (
                    <div
                      key={tpl.id}
                      className={`rounded-2xl border p-3 flex flex-col items-center text-center gap-2 ${
                        owned
                          ? 'border-slate-700 bg-slate-900/90'
                          : 'border-slate-800/80 bg-slate-950/60 opacity-75'
                      }`}
                    >
                      <CharacterPortraitSvg character={tpl} size={68} silhouette={!owned} />
                      <div className="text-xs font-bold text-amber-300">
                        {tpl.isHiddenFusion ? '隱藏融合 · ' : ''}
                        {tpl.rarity} · {WORLD_THEMES[tpl.subject].subjectName}
                      </div>
                      <div className="text-sm font-black text-white">
                        {owned ? tpl.name : tpl.isHiddenFusion ? '？？？' : tpl.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {owned
                          ? `${tpl.race} · ${tpl.role}`
                          : tpl.isHiddenFusion
                            ? '於融合研究所探索'
                            : '可於召喚神殿獲得'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-sky-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  單元 Boss 知識圖鑑卡（已收集 {collectedCardUnits.length} / {allUnits.length}）
                </h2>
              </div>
              {collectedCardUnits.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
                  擊敗任一單元的第 10 關「單元 Boss」即可收集該單元的重點知識卡與專屬知識武器！
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collectedCardUnits.map((u) => (
                    <div
                      key={u.id}
                      className="rounded-2xl border border-sky-500/40 bg-slate-900/90 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-sky-300 font-bold">
                        <span>
                          {u.grade}年級{u.semester === 1 ? '上' : '下'} ·{' '}
                          {WORLD_THEMES[u.subject].subjectName}
                        </span>
                        <span>Boss：{u.bossName}</span>
                      </div>
                      <h3 className="text-base font-black text-white">{u.knowledgeCardTitle}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {u.knowledgeCardSummary}
                      </p>
                      <div className="text-[11px] text-amber-300 pt-1">
                        掉落知識武器：{u.knowledgeWeaponName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

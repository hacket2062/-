import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Compass,
  Crown,
  Flame,
  Layers,
  Shuffle,
  Skull,
  Sparkles,
  Star,
  Swords,
} from 'lucide-react';
import type { DifficultyMode } from '../types/game';
import { GAME_ART, WORLD_THEMES } from '../assets/worldAssets';
import { EDITION_LABELS, STAGE_STRUCTURE, getCurriculumUnits } from '../data/curriculum';
import { DAILY_DUNGEON_SCHEDULE, RANDOM_MAP_EVENTS, type RandomMapEventDef } from '../data/titlesAndQuests';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

export const WorldMapScreen: React.FC = () => {
  const {
    selectedGrade,
    selectedSemester,
    selectedSubject,
    selectedDifficulty,
    stageStars,
    towerFloors,
    wrongBook,
    dailyEventsUsed,
    settings,
    setAdventureSelection,
    startBattle,
    consumeDailyEvent,
    setScreen,
    showToast,
  } = useGameStore();

  const theme = WORLD_THEMES[selectedSubject];
  const units = useMemo(
    () => getCurriculumUnits(selectedGrade, selectedSemester, selectedSubject, settings.edition),
    [selectedGrade, selectedSemester, selectedSubject, settings.edition]
  );

  const [activeUnitIdx, setActiveUnitIdx] = useState(0);
  const currentUnit = units[activeUnitIdx] ?? units[0];
  const [comicStageToStart, setComicStageToStart] = useState<number | null>(null);
  const [activeEvent, setActiveEvent] = useState<RandomMapEventDef | null>(null);

  const wrongCount = useMemo(
    () => Object.values(wrongBook).filter((r) => !r.graduated).length,
    [wrongBook]
  );

  const todayDungeon = DAILY_DUNGEON_SCHEDULE[new Date().getDay()];

  const launchStoryStage = (stageNum: number, skipComic = false) => {
    if (!currentUnit) return;
    // Show 2-4 panel comic intro for Stage 1 or Boss Stage 10!
    if (!skipComic && (stageNum === 1 || stageNum === 10)) {
      setComicStageToStart(stageNum);
      return;
    }

    // Spec §9: Map travel has 8-12% random event chance (daily cap 5); we also offer a visible patrol trigger button
    const stageMeta = STAGE_STRUCTURE[stageNum - 1];
    playSfx('perfect', settings.soundEnabled);
    startBattle({
      mode: 'story',
      subject: selectedSubject,
      grade: selectedGrade,
      semester: selectedSemester,
      unitId: currentUnit.id,
      stageNumber: stageNum,
      difficulty: selectedDifficulty,
      title: `${currentUnit.title} · ${stageMeta.label} (${stageMeta.tag})`,
      enemyName: stageMeta.isBoss ? currentUnit.bossName : `${currentUnit.subtitle}・迷霧守衛 ${stageNum}`,
      isBoss: stageMeta.isBoss,
    });
  };

  const handleExploreRandomEvent = () => {
    if (!consumeDailyEvent()) {
      showToast('今日地圖隨機事件探索已達上限（5 / 5 次），明天再來尋寶吧！');
      return;
    }
    playSfx('perfect', settings.soundEnabled);
    const picked = RANDOM_MAP_EVENTS[Math.floor(Math.random() * RANDOM_MAP_EVENTS.length)];
    setActiveEvent(picked);
  };

  const handleStartRandomEventBattle = (ev: RandomMapEventDef) => {
    if (!currentUnit) return;
    setActiveEvent(null);
    startBattle({
      mode: 'random_event',
      subject: selectedSubject,
      grade: ev.id === 'rift' ? (Math.max(3, selectedGrade - 1) as 3 | 4 | 5 | 6) : selectedGrade,
      semester: selectedSemester,
      unitId: currentUnit.id,
      stageNumber: 3,
      difficulty: selectedDifficulty,
      title: `隨機事件：${ev.title}`,
      enemyName: ev.title,
      isBoss: ev.id === 'rogue',
      eventKind: ev.id,
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* World Banner Header */}
      <div className="relative border-b border-slate-800 overflow-hidden">
        <img
          src={GAME_ART.worlds[selectedSubject]}
          alt={theme.worldName}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 to-slate-950" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScreen('lobby')}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 px-3.5 py-2 text-sm font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                大廳
              </button>
              <button
                type="button"
                onClick={() => setScreen('adventure_select')}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 hover:bg-slate-800 px-3.5 py-2 text-sm font-bold cursor-pointer"
              >
                <Compass className="w-4 h-4 text-sky-300" />
                切換世界
              </button>
            </div>

            {/* Difficulty selector (普通 -> 困難 -> 傳說) */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-900/90 border border-slate-700 p-1">
              {(
                [
                  { id: 'normal', label: '普通' },
                  { id: 'hard', label: '困難' },
                  { id: 'legend', label: '傳說' },
                ] as Array<{ id: DifficultyMode; label: string }>
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setAdventureSelection({ difficulty: d.id })}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                    selectedDifficulty === d.id
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={`text-xs font-bold ${theme.badgeText}`}>
                國小 {selectedGrade} 年級{selectedSemester === 1 ? '上' : '下'}學期 · {theme.subjectName} · {EDITION_LABELS[settings.edition]}順序
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {theme.worldName} — {theme.worldSubtitle}
              </h1>
            </div>

            <button
              type="button"
              onClick={handleExploreRandomEvent}
              className="min-h-[46px] inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 font-bold text-xs sm:text-sm px-4 py-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              地圖巡邏隨機事件（今日 {dailyEventsUsed}/5）
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-8">
        {/* Chapter (= 108 Curriculum Unit) Tabs */}
        <section>
          <div className="flex flex-wrap gap-3">
            {units.map((unit, idx) => {
              const unitStars = Array.from({ length: 10 }, (_, s) => stageStars[`${unit.id}_s${s + 1}`] ?? 0).reduce(
                (a, b) => a + b,
                0
              );
              const isFocus = settings.focusUnitId === unit.id;
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setActiveUnitIdx(idx)}
                  className={`min-h-[56px] rounded-2xl border px-5 py-3 text-left transition cursor-pointer ${
                    idx === activeUnitIdx
                      ? 'border-amber-400 bg-amber-500/15 text-white'
                      : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
                    <span>第 {idx + 1} 章</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">★ {unitStars}/30</span>
                    {isFocus && <span className="text-emerald-300">・家長指定本週重點</span>}
                  </div>
                  <div className="text-sm sm:text-base font-black mt-0.5">{unit.title}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Chapter 10-Stage Map Grid */}
        {currentUnit && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">
                  {currentUnit.title} — {currentUnit.subtitle}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  知識點：{currentUnit.knowledgePoints.join('、')} · 通關第 10 關解鎖知識武器「{currentUnit.knowledgeWeaponName}」
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComicStageToStart(1)}
                className="text-xs font-bold text-sky-300 hover:text-sky-200 underline cursor-pointer"
              >
                重看章節漫畫開場
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {STAGE_STRUCTURE.map((st) => {
                const stars = stageStars[`${currentUnit.id}_s${st.num}`] ?? 0;
                return (
                  <button
                    key={st.num}
                    type="button"
                    onClick={() => launchStoryStage(st.num)}
                    className={`min-h-[118px] rounded-2xl border p-4 text-left flex flex-col justify-between transition hover:scale-[1.02] cursor-pointer ${
                      st.isBoss
                        ? 'border-rose-500/70 bg-gradient-to-br from-rose-950/60 to-slate-900 hover:border-rose-400'
                        : st.isElite
                        ? 'border-amber-500/60 bg-gradient-to-br from-amber-950/45 to-slate-900 hover:border-amber-400'
                        : 'border-slate-700/80 bg-slate-950/75 hover:border-sky-400/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-mono-num text-slate-300">
                        {st.label}
                      </span>
                      {st.isBoss ? (
                        <Crown className="w-4 h-4 text-rose-400" />
                      ) : st.isElite ? (
                        <Swords className="w-4 h-4 text-amber-300" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-sky-400" />
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-black text-white">
                        {st.isBoss ? currentUnit.bossName : st.tag}
                      </div>
                      <div className="mt-1.5 flex items-center gap-0.5">
                        {[1, 2, 3].map((n) => (
                          <Star
                            key={n}
                            className={`w-4 h-4 ${
                              stars >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Special Stages Dock (Spec §9: 7 special modes) */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-slate-200">特殊試煉關卡</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* 1. Wrong Revenge */}
            <button
              type="button"
              onClick={() => {
                if (wrongCount === 0) {
                  showToast('目前錯題本是空的！先挑戰主線關卡，答錯的題目會自動收錄喔。');
                  return;
                }
                startBattle({
                  mode: 'wrong_revenge',
                  subject: selectedSubject,
                  grade: selectedGrade,
                  semester: selectedSemester,
                  unitId: currentUnit?.id ?? 'wrong',
                  stageNumber: 1,
                  difficulty: 'normal',
                  title: '錯題復仇關（雙倍經驗・答對2次畢業）',
                  enemyName: '錯題幻影魔',
                  isBoss: false,
                });
              }}
              className="rounded-2xl border border-rose-500/40 bg-slate-900/90 hover:border-rose-400 p-4 text-left cursor-pointer transition"
            >
              <Flame className="w-5 h-5 text-rose-400" />
              <div className="mt-2 font-black text-white text-sm">錯題復仇關</div>
              <div className="text-xs text-slate-400 mt-0.5">
                待復仇 {wrongCount} 題 · 雙倍經驗
              </div>
            </button>

            {/* 2. Endless Tower */}
            <button
              type="button"
              onClick={() =>
                startBattle({
                  mode: 'endless_tower',
                  subject: selectedSubject,
                  grade: selectedGrade,
                  semester: selectedSemester,
                  unitId: currentUnit?.id ?? 'tower',
                  stageNumber: towerFloors[selectedSubject] ?? 1,
                  difficulty: selectedDifficulty,
                  title: `無盡試煉塔 第 ${towerFloors[selectedSubject] ?? 1} 層`,
                  enemyName: `試煉守塔靈 Lv.${towerFloors[selectedSubject] ?? 1}`,
                  isBoss: (towerFloors[selectedSubject] ?? 1) % 5 === 0,
                })
              }
              className="rounded-2xl border border-sky-500/40 bg-slate-900/90 hover:border-sky-400 p-4 text-left cursor-pointer transition"
            >
              <Layers className="w-5 h-5 text-sky-400" />
              <div className="mt-2 font-black text-white text-sm">無盡試煉塔</div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono-num">
                目前第 {towerFloors[selectedSubject] ?? 1} 層・每10層寶箱
              </div>
            </button>

            {/* 3. Daily Rotating Dungeon */}
            <button
              type="button"
              onClick={() =>
                startBattle({
                  mode: 'daily_dungeon',
                  subject: selectedSubject,
                  grade: selectedGrade,
                  semester: selectedSemester,
                  unitId: currentUnit?.id ?? 'daily',
                  stageNumber: 1,
                  difficulty: 'normal',
                  title: `每日祕境：${todayDungeon.name}`,
                  enemyName: `${todayDungeon.dayName}守寶衛士`,
                  isBoss: false,
                })
              }
              className="rounded-2xl border border-amber-500/40 bg-slate-900/90 hover:border-amber-400 p-4 text-left cursor-pointer transition"
            >
              <Calendar className="w-5 h-5 text-amber-400" />
              <div className="mt-2 font-black text-white text-sm">每日祕境（{todayDungeon.dayName}）</div>
              <div className="text-xs text-slate-400 mt-0.5">{todayDungeon.rewardLabel}</div>
            </button>

            {/* 4. Cross-Subject Co-op Dungeon */}
            <button
              type="button"
              onClick={() =>
                startBattle({
                  mode: 'cross_subject',
                  subject: selectedSubject,
                  grade: selectedGrade,
                  semester: selectedSemester,
                  unitId: currentUnit?.id ?? 'cross',
                  stageNumber: 1,
                  difficulty: 'hard',
                  title: '跨科聯合副本（國英數自混合題）',
                  enemyName: '四界混沌聚合體',
                  isBoss: true,
                })
              }
              className="rounded-2xl border border-fuchsia-500/40 bg-slate-900/90 hover:border-fuchsia-400 p-4 text-left cursor-pointer transition"
            >
              <Sparkles className="w-5 h-5 text-fuchsia-400" />
              <div className="mt-2 font-black text-white text-sm">跨科聯合副本</div>
              <div className="text-xs text-slate-400 mt-0.5">混合出題・掉落融合核心</div>
            </button>

            {/* 5. Semester Final Boss */}
            <button
              type="button"
              onClick={() =>
                startBattle({
                  mode: 'semester_boss',
                  subject: selectedSubject,
                  grade: selectedGrade,
                  semester: selectedSemester,
                  unitId: currentUnit?.id ?? 'boss',
                  stageNumber: 10,
                  difficulty: 'legend',
                  title: `期末大魔王・${selectedGrade}${selectedSemester === 1 ? '上' : '下'}綜合決戰`,
                  enemyName: '混沌魔王・迷霧分身',
                  isBoss: true,
                })
              }
              className="rounded-2xl border border-orange-500/50 bg-slate-900/90 hover:border-orange-400 p-4 text-left cursor-pointer transition"
            >
              <Skull className="w-5 h-5 text-orange-400" />
              <div className="mt-2 font-black text-white text-sm">期末大魔王</div>
              <div className="text-xs text-slate-400 mt-0.5">整學期綜合複習・傳說獎勵</div>
            </button>
          </div>
        </section>
      </div>

      {/* 2-4 Panel Story Comic Intro Modal (Spec §9) */}
      {comicStageToStart !== null && currentUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-amber-400/50 bg-slate-900 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-amber-300">
                章節劇情漫畫 · {currentUnit.title}
              </h3>
              <span className="text-xs text-slate-400">第 {comicStageToStart} 關前導</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentUnit.comicPanels.map((panel, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-700 bg-slate-950/90 p-4 flex flex-col justify-between min-h-[128px]"
                >
                  <div className="text-xs font-black text-sky-300">
                    {i + 1}. {panel.speaker}
                  </div>
                  <p className="text-sm text-slate-100 mt-2 leading-relaxed">「{panel.line}」</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setComicStageToStart(null)}
                className="min-h-[46px] rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-sm font-bold text-slate-200 cursor-pointer"
              >
                返回地圖
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = comicStageToStart;
                  setComicStageToStart(null);
                  launchStoryStage(s, true);
                }}
                className="min-h-[46px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-2 text-sm cursor-pointer"
              >
                出發迎戰！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Random Map Event Modal */}
      {activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-3xl border border-amber-400 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <p className="text-xs font-bold text-amber-300">地圖隨機奇遇！</p>
            <h3 className="text-2xl font-black text-white">{activeEvent.title}</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{activeEvent.description}</p>
            <p className="text-xs font-bold text-emerald-300">{activeEvent.rewardHint}</p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="flex-1 min-h-[48px] rounded-xl border border-slate-700 bg-slate-800 text-sm font-bold text-slate-200 cursor-pointer"
              >
                先略過
              </button>
              <button
                type="button"
                onClick={() => handleStartRandomEventBattle(activeEvent)}
                className="flex-1 min-h-[48px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm cursor-pointer"
              >
                接受挑戰！
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

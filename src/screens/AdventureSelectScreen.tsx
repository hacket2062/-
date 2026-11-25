import React, { useState } from 'react';
import { ArrowLeft, DoorOpen, Lock, Star } from 'lucide-react';
import type { Grade, Semester, SubjectId } from '../types/game';
import { GAME_ART, WORLD_THEMES } from '../assets/worldAssets';
import { getCurriculumUnits } from '../data/curriculum';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

const GRADE_CARDS: Array<{ grade: Grade; title: string; subtitle: string; gradient: string; accent: string }> = [
  {
    grade: 3,
    title: '三年級',
    subtitle: '啟程學徒・預設注音輔助',
    gradient: 'from-emerald-600/35 to-teal-900/70',
    accent: 'border-emerald-400/50',
  },
  {
    grade: 4,
    title: '四年級',
    subtitle: '進階探索・四則與多音字',
    gradient: 'from-sky-600/35 to-blue-900/70',
    accent: 'border-sky-400/50',
  },
  {
    grade: 5,
    title: '五年級',
    subtitle: '智光主力・因數酸鹼與進行式',
    gradient: 'from-amber-600/35 to-orange-900/70',
    accent: 'border-amber-400/50',
  },
  {
    grade: 6,
    title: '六年級',
    subtitle: '畢業試煉・速率文言與電磁',
    gradient: 'from-fuchsia-600/35 to-purple-900/70',
    accent: 'border-fuchsia-400/50',
  },
];

export const AdventureSelectScreen: React.FC = () => {
  const {
    profile,
    selectedGrade,
    selectedSemester,
    stageStars,
    settings,
    setAdventureSelection,
    setScreen,
    showToast,
  } = useGameStore();

  const [step, setStep] = useState<'grade' | 'semester' | 'subject'>('grade');
  const [grade, setGrade] = useState<Grade>(selectedGrade);
  const [semester, setSemester] = useState<Semester>(selectedSemester);
  const [openingDoor, setOpeningDoor] = useState<Semester | null>(null);

  const playerGrade = profile?.grade ?? 5;

  const handlePickGrade = (g: Grade) => {
    if (g > playerGrade && !settings.allowHigherGrades) {
      showToast('往上跨年級挑戰需由家長在家長專區開啟權限喔！');
      return;
    }
    playSfx('click', settings.soundEnabled);
    setGrade(g);
    setAdventureSelection({ grade: g });
    setStep('semester');
  };

  const handleOpenSemesterDoor = (sem: Semester) => {
    playSfx('correct', settings.soundEnabled);
    setOpeningDoor(sem);
    setSemester(sem);
    setAdventureSelection({ semester: sem });
    setTimeout(() => {
      setOpeningDoor(null);
      setStep('subject');
    }, 360);
  };

  const handlePickSubject = (subject: SubjectId) => {
    playSfx('perfect', settings.soundEnabled);
    setAdventureSelection({ grade, semester, subject });
    setScreen('world_map');
  };

  const getSubjectStarProgress = (subject: SubjectId) => {
    const units = getCurriculumUnits(grade, semester, subject, settings.edition);
    const totalPossible = units.length * 30;
    let earned = 0;
    for (const u of units) {
      for (let i = 1; i <= 10; i++) {
        earned += stageStars[`${u.id}_s${i}`] ?? 0;
      }
    }
    return { earned, totalPossible };
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 flex flex-col">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Top Back Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              if (step === 'subject') setStep('semester');
              else if (step === 'semester') setStep('grade');
              else setScreen('lobby');
            }}
            className="min-h-[48px] inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'grade' ? '返回大廳' : '上一步'}
          </button>

          {/* Clean breadcrumb tabs */}
          <div className="flex items-center gap-2 text-sm font-bold">
            <button
              type="button"
              onClick={() => setStep('grade')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                step === 'grade' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. 選年級（{grade}年級）
            </button>
            <span className="text-slate-600">/</span>
            <button
              type="button"
              onClick={() => setStep('semester')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                step === 'semester' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. 選學期（{semester === 1 ? '上' : '下'}學期）
            </button>
            <span className="text-slate-600">/</span>
            <button
              type="button"
              onClick={() => setStep('subject')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                step === 'subject' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. 選科目星球
            </button>
          </div>
        </div>

        {/* Step 1: 4 Big Colored Grade Cards */}
        {step === 'grade' && (
          <section className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">選擇冒險年級</h1>
              <p className="text-sm text-slate-400 mt-1">
                往下複習隨時免費暢玩；目前你的檔案為國小 {playerGrade} 年級。
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {GRADE_CARDS.map((card) => {
                const locked = card.grade > playerGrade && !settings.allowHigherGrades;
                return (
                  <button
                    key={card.grade}
                    type="button"
                    onClick={() => handlePickGrade(card.grade)}
                    className={`min-h-[210px] rounded-3xl border ${card.accent} bg-gradient-to-br ${card.gradient} p-6 text-left flex flex-col justify-between transition hover:scale-[1.02] cursor-pointer ${
                      locked ? 'opacity-65' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-4xl font-black font-mono-num text-white">{card.grade}</span>
                      {locked ? (
                        <Lock className="w-5 h-5 text-slate-300" />
                      ) : card.grade < playerGrade ? (
                        <span className="text-xs font-bold text-emerald-200">隨時複習</span>
                      ) : card.grade === playerGrade ? (
                        <span className="text-xs font-bold text-amber-200">目前年級</span>
                      ) : (
                        <span className="text-xs font-bold text-sky-200">進階挑戰</span>
                      )}
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">{card.title}</div>
                      <div className="text-xs text-slate-200/90 mt-1">{card.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 2: Two Animated Semester Doors */}
        {step === 'semester' && (
          <section className="space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                推開國小 {grade} 年級的學期之門
              </h1>
              <p className="text-sm text-slate-400 mt-1">點擊門扉展開該學期的四大知識星球</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-4">
              {([1, 2] as Semester[]).map((sem) => {
                const isOpening = openingDoor === sem;
                return (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => handleOpenSemesterDoor(sem)}
                    className={`group relative min-h-[260px] rounded-3xl border-2 p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer ${
                      sem === 1
                        ? 'border-amber-400/60 bg-gradient-to-b from-amber-950/60 to-slate-900 hover:border-amber-300'
                        : 'border-sky-400/60 bg-gradient-to-b from-sky-950/60 to-slate-900 hover:border-sky-300'
                    } ${isOpening ? 'scale-105 opacity-70' : ''}`}
                  >
                    <div
                      className={`w-24 h-32 rounded-t-full border-4 flex items-center justify-center transition-transform duration-300 ${
                        sem === 1 ? 'border-amber-400 bg-amber-500/15' : 'border-sky-400 bg-sky-500/15'
                      } ${isOpening ? 'scale-x-50' : 'group-hover:scale-105'}`}
                    >
                      <DoorOpen className={`w-12 h-12 ${sem === 1 ? 'text-amber-300' : 'text-sky-300'}`} />
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">
                        {grade} 年級{sem === 1 ? '上學期' : '下學期'}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        {sem === 1 ? '秋季開學單元・四科完整收錄' : '春季進階單元・四科完整收錄'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 3: 4 Subject Planets with World Thumbnails & Star Progress */}
        {step === 'subject' && (
          <section className="space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                選擇主題星球（國小 {grade} 年級{semester === 1 ? '上' : '下'}學期）
              </h1>
              <p className="text-sm text-slate-400 mt-1">四個科目對應四種完全不同的遊戲玩法</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(['chinese', 'english', 'math', 'science'] as SubjectId[]).map((sub) => {
                const theme = WORLD_THEMES[sub];
                const prog = getSubjectStarProgress(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handlePickSubject(sub)}
                    className={`group relative min-h-[210px] rounded-3xl overflow-hidden border ${theme.borderClass} text-left flex flex-col justify-between p-6 transition hover:scale-[1.01] cursor-pointer shadow-xl`}
                  >
                    <img
                      src={GAME_ART.worlds[sub]}
                      alt={theme.worldName}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-slate-950/25" />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`text-sm font-black ${theme.badgeText}`}>
                        {theme.subjectName} · {theme.paceLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-black font-mono-num text-amber-300">
                        <Star className="w-4 h-4 fill-amber-300" />
                        {prog.earned} / {prog.totalPossible}
                      </span>
                    </div>

                    <div className="relative z-10 mt-10">
                      <h2 className="text-2xl font-black text-white">{theme.worldName}</h2>
                      <p className="text-sm text-slate-200 mt-1">
                        {theme.worldSubtitle} — {theme.genreLabel}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

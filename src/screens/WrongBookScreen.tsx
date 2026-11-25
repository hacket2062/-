import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookMarked,
  CheckCircle2,
  Clock,
  Flame,
  Swords,
} from 'lucide-react';
import { WORLD_THEMES } from '../assets/worldAssets';
import { useGameStore } from '../store/useGameStore';

export const WrongBookScreen: React.FC = () => {
  const {
    wrongBook,
    selectedGrade,
    selectedSemester,
    selectedSubject,
    selectedDifficulty,
    setScreen,
    startBattle,
    showToast,
  } = useGameStore();

  const [filterMode, setFilterMode] = useState<'active' | 'graduated'>('active');

  const records = useMemo(() => Object.values(wrongBook), [wrongBook]);
  const activeRecords = useMemo(() => records.filter((r) => !r.graduated), [records]);
  const graduatedRecords = useMemo(() => records.filter((r) => r.graduated), [records]);

  const displayed = filterMode === 'active' ? activeRecords : graduatedRecords;

  const groupedByKp = useMemo(() => {
    const map: Record<string, typeof displayed> = {};
    for (const rec of displayed) {
      const kp = rec.question.knowledgePoint || '綜合概念';
      if (!map[kp]) map[kp] = [];
      map[kp].push(rec);
    }
    return Object.entries(map);
  }, [displayed]);

  const handleStartRevenge = () => {
    if (activeRecords.length === 0) {
      showToast('太棒了！目前沒有尚未畢業的錯題！');
      return;
    }
    const first = activeRecords[0].question;
    startBattle({
      mode: 'wrong_revenge',
      subject: first.subject ?? selectedSubject,
      grade: first.grade ?? selectedGrade,
      semester: first.semester ?? selectedSemester,
      unitId: first.unitId,
      stageNumber: 1,
      difficulty: selectedDifficulty,
      title: '錯題復仇戰（獎勵 2 倍）',
      enemyName: '迷霧錯題幻影',
      isBoss: false,
    });
  };

  const intervalLabel = (stage: 0 | 1 | 2) => {
    if (stage === 0) return '第 1 天間隔複習';
    if (stage === 1) return '第 3 天間隔複習';
    return '第 7 天鞏固複習';
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
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
              <h1 className="text-lg sm:text-xl font-black text-amber-300">智光錯題本（1・3・7 天間隔複習）</h1>
              <p className="text-xs text-slate-400">連續複習答對 2 次即可光榮畢業，錯題復仇戰獎勵 2 倍！</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartRevenge}
            disabled={activeRecords.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black px-5 py-3 min-h-[50px] text-sm cursor-pointer"
          >
            <Swords className="w-4 h-4" />
            開始錯題復仇戰（{activeRecords.length} 題）
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            type="button"
            onClick={() => setFilterMode('active')}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold min-h-[44px] cursor-pointer ${
              filterMode === 'active' ? 'bg-amber-500 text-slate-950' : 'text-slate-300'
            }`}
          >
            <Flame className="w-4 h-4" />
            待複習錯題（{activeRecords.length}）
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('graduated')}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold min-h-[44px] cursor-pointer ${
              filterMode === 'graduated' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            已畢業錯題（{graduatedRecords.length}）
          </button>
        </div>

        {groupedByKp.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10 text-center space-y-3">
            <BookMarked className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">
              {filterMode === 'active' ? '目前沒有待複習的錯題！' : '尚未有畢業的錯題紀錄'}
            </h2>
            <p className="text-sm text-slate-400">
              {filterMode === 'active'
                ? '你在闖關中答錯的題目都會自動收錄於此，幫助你對症下藥變成學霸！'
                : '透過「錯題復仇戰」連續答對同一題 2 次，就能讓錯題光榮畢業喔！'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByKp.map(([kp, list]) => (
              <section key={kp} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black text-amber-300">知識點：{kp}</h2>
                  <span className="text-xs text-slate-400">{list.length} 題</span>
                </div>
                <div className="space-y-3">
                  {list.map((rec) => {
                    const dueNow = Date.now() >= rec.nextReviewAt;
                    return (
                      <div
                        key={rec.questionId}
                        className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-sky-300">
                            {rec.question.grade}年級 · {WORLD_THEMES[rec.question.subject].subjectName}
                          </span>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-slate-400">答錯 {rec.wrongCount} 次</span>
                            <span className="text-emerald-300">畢業進度 {rec.correctStreak}/2</span>
                            {!rec.graduated && (
                              <span className={`inline-flex items-center gap-1 ${dueNow ? 'text-rose-300 font-bold' : 'text-slate-400'}`}>
                                <Clock className="w-3.5 h-3.5" />
                                {dueNow ? '現在可複習' : intervalLabel(rec.intervalStage)}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                          {rec.question.prompt}
                        </p>
                        <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 text-xs space-y-1">
                          <div className="text-emerald-300 font-bold">正確答案：{rec.question.answer}</div>
                          <div className="text-slate-300 leading-relaxed">詳解：{rec.question.explanation}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

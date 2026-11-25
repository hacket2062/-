import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Download,
  Lock,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import type { SubjectId, TextbookEdition } from '../types/game';
import { WORLD_THEMES } from '../assets/worldAssets';
import { EDITION_LABELS, getAllCurriculumUnits } from '../data/curriculum';
import { useGameStore } from '../store/useGameStore';

const SUBJECTS: SubjectId[] = ['chinese', 'english', 'math', 'science'];

export const ParentZoneScreen: React.FC = () => {
  const {
    profile,
    selectedGrade,
    telemetry,
    knowledgeMastery,
    wrongBook,
    playSecondsToday,
    settings,
    updateSettings,
    resetAllData,
    setScreen,
    showToast,
  } = useGameStore();

  // Parent Gate: random arithmetic + 4-digit PIN
  const [challenge] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 7 + Math.floor(Math.random() * 3);
    const c = 3 + Math.floor(Math.random() * 7);
    return { text: `${a} × ${b} + ${c} = ?`, expected: a * b + c };
  });
  const [mathInput, setMathInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [gateError, setGateError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const [newPin, setNewPin] = useState(settings.parentPin);
  const [confirmReset, setConfirmReset] = useState(false);

  const allUnits = useMemo(
    () => getAllCurriculumUnits(settings.edition).filter((u) => u.grade === selectedGrade),
    [settings.edition, selectedGrade]
  );

  // Analytics derived from telemetry + knowledgeMastery
  const subjectStats = useMemo(() => {
    return SUBJECTS.map((subj) => {
      const items = telemetry.filter((t) => t.subject === subj);
      const total = items.length;
      const correct = items.filter((t) => t.correct).length;
      const acc = total > 0 ? Math.round((correct / total) * 100) : null;
      const avgTime =
        total > 0 ? Number((items.reduce((s, t) => s + t.elapsedSec, 0) / total).toFixed(1)) : 0;

      // Fallback radar value from mastery map if telemetry is empty
      const fallbackMap: Record<SubjectId, number> = {
        chinese: Math.round(((knowledgeMastery['成語典故'] ?? 60) + (knowledgeMastery['設問與映襯'] ?? 52)) / 2),
        english: Math.round(((knowledgeMastery['時間與月份'] ?? 58) + (knowledgeMastery['現在進行式'] ?? 52)) / 2),
        math: Math.round(((knowledgeMastery['因數與倍數'] ?? 58) + (knowledgeMastery['擴分約分通分'] ?? 48)) / 2),
        science: Math.round(((knowledgeMastery['水溶液酸鹼'] ?? 64) + (knowledgeMastery['植物繁殖'] ?? 54)) / 2),
      };
      const score = acc !== null ? acc : fallbackMap[subj];
      return {
        subject: subj,
        label: WORLD_THEMES[subj].subjectName,
        total,
        correct,
        accuracy: score,
        avgTime,
      };
    });
  }, [telemetry, knowledgeMastery]);

  const fastGuessRate = useMemo(() => {
    if (telemetry.length === 0) return 0;
    const guesses = telemetry.filter((t) => t.wasFastGuess).length;
    return Math.round((guesses / telemetry.length) * 100);
  }, [telemetry]);

  const weakKnowledgePoints = useMemo(() => {
    return Object.entries(knowledgeMastery)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 6);
  }, [knowledgeMastery]);

  const ungraduatedWrongs = useMemo(
    () => Object.values(wrongBook).filter((w) => !w.graduated).length,
    [wrongBook]
  );

  // Build 4-axis SVG radar polygon
  const radarPoints = useMemo(() => {
    const cx = 170;
    const cy = 126;
    const maxR = 76;
    const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]; // top, right, bottom, left
    return subjectStats
      .map((st, idx) => {
        const r = (Math.max(12, Math.min(100, st.accuracy)) / 100) * maxR;
        const x = cx + Math.cos(angles[idx]) * r;
        const y = cy + Math.sin(angles[idx]) * r;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [subjectStats]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(mathInput.trim()) !== challenge.expected) {
      setGateError('算術驗證答案不正確，請再算一次。');
      return;
    }
    if (pinInput.trim() !== settings.parentPin) {
      setGateError('4 位數家長 PIN 碼不正確（預設為 1234）。');
      return;
    }
    setGateError('');
    setUnlocked(true);
  };

  const handleExportCsv = () => {
    const header = '時間,科目,知識點,是否正確,作答秒數,建議秒數,速度評價,是否疑似猜題\n';
    const rows =
      telemetry.length > 0
        ? telemetry
            .map((t) =>
              [
                new Date(t.timestamp).toLocaleString('zh-TW'),
                WORLD_THEMES[t.subject].subjectName,
                t.knowledgePoint,
                t.correct ? '正確' : '錯誤',
                t.elapsedSec.toFixed(1),
                t.suggestedSec.toFixed(1),
                t.speedGrade,
                t.wasFastGuess ? '是' : '否',
              ].join(',')
            )
            .join('\n')
        : weakKnowledgePoints
            .map(([kp, score]) => `${new Date().toLocaleDateString('zh-TW')},綜合,${kp},熟練度 ${score}%,0,0,N/A,否`)
            .join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `智光守護者_學習報表_${profile?.nickname ?? '學生'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已匯出 CSV 學習報表！');
  };

  const handleSavePin = () => {
    if (!/^\d{4}$/.test(newPin)) {
      showToast('PIN 碼需為 4 位數字');
      return;
    }
    updateSettings({ parentPin: newPin });
    showToast('已更新家長 PIN 碼');
  };

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await resetAllData();
    showToast('已清除本機所有存檔資料');
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
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
              <h1 className="text-lg sm:text-xl font-black text-amber-300">家長與教師監護儀表板</h1>
              <p className="text-xs text-slate-400">資料預設僅存於本機・無廣告・無個資蒐集</p>
            </div>
          </div>

          {unlocked && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 text-xs min-h-[48px] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              匯出 CSV 成績報表
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {!unlocked ? (
          <section className="max-w-md mx-auto mt-6 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center">
                <Lock className="w-7 h-7 text-amber-300" />
              </div>
              <h2 className="text-xl font-black text-white">家長安全鎖驗證</h2>
              <p className="text-xs text-slate-400">
                請完成算術題並輸入 4 位數家長 PIN 碼以進入學習報表與時間控管（預設 PIN：1234）
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-300 block">
                  算術驗證：{challenge.text}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={mathInput}
                  onChange={(e) => setMathInput(e.target.value)}
                  placeholder="輸入計算結果"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-base text-white min-h-[48px]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  4 位數家長 PIN 碼（預設 1234）
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-base tracking-widest text-white min-h-[48px]"
                  required
                />
              </div>

              {gateError && <p className="text-xs text-rose-400 font-bold">{gateError}</p>}

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 min-h-[52px] cursor-pointer"
              >
                解鎖家長專區
              </button>
            </form>
          </section>
        ) : (
          <div className="space-y-6">
            {/* Summary Metrics */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="text-xs text-slate-400">今日累積學習時間</div>
                <div className="text-2xl font-black font-mono text-amber-300 mt-1">
                  {Math.floor(playSecondsToday / 60)} 分 {playSecondsToday % 60} 秒
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">每日上限：{settings.dailyLimitMinutes} 分鐘</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="text-xs text-slate-400">累計作答題數</div>
                <div className="text-2xl font-black font-mono text-white mt-1">{telemetry.length} 題</div>
                <div className="text-[11px] text-slate-500 mt-0.5">未畢業錯題：{ungraduatedWrongs} 題</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="text-xs text-slate-400">疑似盲猜比例（&lt;1.5秒答錯）</div>
                <div className={`text-2xl font-black font-mono mt-1 ${fastGuessRate > 25 ? 'text-rose-400' : 'text-emerald-300'}`}>
                  {fastGuessRate}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {fastGuessRate > 25 ? '建議開啟無計時練習模式' : '思考節奏良好'}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="text-xs text-slate-400">學生暱稱與年級</div>
                <div className="text-xl font-black text-sky-300 mt-1">
                  {profile?.nickname ?? '小守護者'}・{selectedGrade} 年級
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">課本版本：{EDITION_LABELS[settings.edition]}</div>
              </div>
            </section>

            {/* Radar Chart + Subject Breakdown + Weaknesses */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* SVG Knowledge Mastery Radar Chart */}
              <section className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col items-center">
                <h2 className="text-base font-black text-white self-start mb-2">四科知識熟練度雷達圖</h2>
                <svg viewBox="0 0 340 255" className="w-full max-w-[340px] h-auto" aria-label="四科知識熟練度雷達圖">
                  {/* Concentric Diamonds */}
                  {[0.25, 0.5, 0.75, 1].map((scale) => {
                    const r = 76 * scale;
                    return (
                      <polygon
                        key={scale}
                        points={`170,${126 - r} ${170 + r},126 170,${126 + r} ${170 - r},126`}
                        fill="none"
                        stroke="#334155"
                        strokeWidth="1"
                      />
                    );
                  })}
                  {/* Axes */}
                  <line x1="170" y1="50" x2="170" y2="202" stroke="#475569" strokeWidth="1" />
                  <line x1="94" y1="126" x2="246" y2="126" stroke="#475569" strokeWidth="1" />
                  {/* Data Polygon */}
                  <polygon
                    points={radarPoints}
                    fill="rgba(245, 158, 11, 0.28)"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                  />
                  {/* Labels (generous horizontal margin inside 340px width) */}
                  <text x="170" y="34" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">
                    國語文 {subjectStats[0].accuracy}%
                  </text>
                  <text x="256" y="130" textAnchor="start" fill="#38bdf8" fontSize="13" fontWeight="700">
                    英語 {subjectStats[1].accuracy}%
                  </text>
                  <text x="170" y="226" textAnchor="middle" fill="#fb923c" fontSize="13" fontWeight="700">
                    數學 {subjectStats[2].accuracy}%
                  </text>
                  <text x="84" y="130" textAnchor="end" fill="#34d399" fontSize="13" fontWeight="700">
                    自然 {subjectStats[3].accuracy}%
                  </text>
                </svg>
                <div className="w-full grid grid-cols-2 gap-2 mt-2 text-xs">
                  {subjectStats.map((st) => (
                    <div
                      key={st.subject}
                      className="rounded-lg bg-slate-950/75 border border-slate-800 px-3 py-2 flex items-center justify-between"
                    >
                      <span className="text-slate-300 font-bold">{st.label}</span>
                      <span className="font-mono text-amber-300">
                        {st.total > 0 ? `${st.avgTime}s/題` : '尚無作答'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Weakness List & Subject Table */}
              <section className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <h2 className="text-base font-black text-white">待加強知識點清單（自動排序）</h2>
                <div className="space-y-2.5">
                  {weakKnowledgePoints.map(([kp, score]) => (
                    <div key={kp} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-200">{kp}</span>
                        <span className={`font-mono font-bold ${score < 55 ? 'text-rose-300' : 'text-amber-300'}`}>
                          熟練度 {score}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${score < 55 ? 'bg-rose-500' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(100, score)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Time Health & Curriculum Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <h2 className="text-base font-black text-sky-300 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> 時間與視力健康管理
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">每日遊戲時間上限（分鐘）</span>
                    <input
                      type="number"
                      min={15}
                      max={180}
                      step={5}
                      value={settings.dailyLimitMinutes}
                      onChange={(e) => updateSettings({ dailyLimitMinutes: Math.max(15, Number(e.target.value) || 45) })}
                      className="w-24 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-right font-mono text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">護眼望遠休息提醒間隔（分鐘）</span>
                    <input
                      type="number"
                      min={10}
                      max={60}
                      step={5}
                      value={settings.restReminderMinutes}
                      onChange={(e) => updateSettings({ restReminderMinutes: Math.max(10, Number(e.target.value) || 20) })}
                      className="w-24 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-right font-mono text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-slate-200 font-bold">夜間睡眠鎖定（22:00 – 07:00）</div>
                      <div className="text-xs text-slate-500">夜間時段顯示守護精靈晚安畫面</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSettings({ bedtimeLockEnabled: !settings.bedtimeLockEnabled })}
                      className={`rounded-xl px-4 py-2 text-xs font-black min-h-[44px] cursor-pointer ${
                        settings.bedtimeLockEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {settings.bedtimeLockEnabled ? '已開啟' : '已關閉'}
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <h2 className="text-base font-black text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> 學習進度與安全設定
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-300">教科書版本</span>
                    <select
                      value={settings.edition}
                      onChange={(e) => updateSettings({ edition: e.target.value as TextbookEdition })}
                      className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white min-h-[44px]"
                    >
                      <option value="kanghsuan">康軒版</option>
                      <option value="nanyi">南一版</option>
                      <option value="hanlin">翰林版</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-300">本週重點複習單元</span>
                    <select
                      value={settings.focusUnitId ?? ''}
                      onChange={(e) => updateSettings({ focusUnitId: e.target.value || null })}
                      className="max-w-[220px] rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white min-h-[44px]"
                    >
                      <option value="">不指定（自由探索）</option>
                      {allUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          [{WORLD_THEMES[u.subject].subjectName}] {u.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">允許跨年級向上預習</span>
                    <button
                      type="button"
                      onClick={() => updateSettings({ allowHigherGrades: !settings.allowHigherGrades })}
                      className={`rounded-xl px-4 py-2 text-xs font-black min-h-[44px] cursor-pointer ${
                        settings.allowHigherGrades ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {settings.allowHigherGrades ? '允許' : '僅限當前與複習'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <span className="text-slate-300">變更 4 位數 PIN 碼</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="w-20 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-center font-mono text-white"
                      />
                      <button
                        type="button"
                        onClick={handleSavePin}
                        className="rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 text-xs cursor-pointer"
                      >
                        儲存
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Danger Zone: Reset Local Data */}
            <section className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-rose-300">清除本機學習進度</h3>
                  <p className="text-xs text-slate-400">
                    刪除 IndexedDB 與本機存檔並重新開始新手引導（無法復原）。
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleReset()}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 text-xs min-h-[46px] cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {confirmReset ? '再次點擊確認清除全部資料' : '重設本機資料'}
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

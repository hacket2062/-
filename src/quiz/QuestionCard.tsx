import React, { useEffect, useMemo, useState } from 'react';
import { HelpCircle, Sparkles, Volume2 } from 'lucide-react';
import type { Question, SpeedGrade } from '../types/game';
import { annotateZhuyin, speakText } from './speech';

interface Props {
  question: Question;
  elapsedSec: number;
  suggestedSec: number;
  practiceMode: boolean;
  timeFrozen: boolean;
  zhuyinEnabled: boolean;
  autoReadAloud: boolean;
  forceShowHint: boolean;
  spiritName: string;
  feedback: null | {
    correct: boolean;
    partial?: boolean;
    studentAnswer: string;
    speedGrade: SpeedGrade;
    damage: number;
    explanation: string;
    explanationSteps?: string[];
  };
  onSubmitAnswer: (answer: string, accuracyCoef: 0 | 0.5 | 1.0) => void;
  onNextAfterFeedback: () => void;
}

const RenderZhuyinText: React.FC<{ text: string; enabled: boolean }> = ({ text, enabled }) => {
  if (!enabled) return <>{text}</>;
  const chars = annotateZhuyin(text);
  return (
    <>
      {chars.map((item, idx) =>
        item.zhuyin ? (
          <ruby key={idx}>
            {item.char}
            <rt>{item.zhuyin}</rt>
          </ruby>
        ) : (
          <React.Fragment key={idx}>{item.char}</React.Fragment>
        )
      )}
    </>
  );
};

export const QuestionCard: React.FC<Props> = ({
  question,
  elapsedSec,
  suggestedSec,
  practiceMode,
  timeFrozen,
  zhuyinEnabled,
  autoReadAloud,
  forceShowHint,
  spiritName,
  feedback,
  onSubmitAnswer,
  onNextAfterFeedback,
}) => {
  const [showHint, setShowHint] = useState(forceShowHint);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [numberLineVal, setNumberLineVal] = useState<number>(
    question.numberLine ? Math.round(((question.numberLine.min + question.numberLine.max) / 2) * 100) / 100 : 0
  );
  const [aiExplain, setAiExplain] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setShowHint(forceShowHint);
    setSelectedParts([]);
    setAiExplain(null);
    setAiError(null);
    if (question.numberLine) {
      setNumberLineVal(question.numberLine.min);
    }
    if (autoReadAloud || question.type === 'listening') {
      speakText(question.speechText || question.prompt, question.speechLang ?? 'zh-TW');
    }
  }, [question, forceShowHint, autoReadAloud]);

  // Keyboard shortcuts 1-4 for single_choice / true_false / listening, Enter to continue after feedback
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (feedback) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNextAfterFeedback();
        }
        return;
      }
      if (
        (question.type === 'single_choice' || question.type === 'true_false' || question.type === 'listening') &&
        question.options
      ) {
        const idx = Number(e.key) - 1;
        if (idx >= 0 && idx < question.options.length) {
          e.preventDefault();
          const chosen = question.options[idx];
          onSubmitAnswer(chosen, chosen === question.answer ? 1.0 : 0);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [feedback, question, onSubmitAnswer, onNextAfterFeedback]);

  const timeLimit = suggestedSec * 1.8;
  const remainingPct = practiceMode || timeFrozen ? 100 : Math.max(0, 100 - (elapsedSec / timeLimit) * 100);
  const speedPreview = useMemo(() => {
    if (timeFrozen) return '時之翼・PERFECT 鎖定';
    if (practiceMode) return '練習模式・不限時';
    const ratio = elapsedSec / Math.max(1, suggestedSec);
    if (ratio <= 0.3) return 'PERFECT 區間 (×1.5)';
    if (ratio <= 0.6) return 'GREAT 區間 (×1.25)';
    if (ratio <= 1.0) return 'GOOD 區間 (×1.0)';
    return 'SLOW 區間 (×0.8 不懲罰)';
  }, [elapsedSec, suggestedSec, practiceMode, timeFrozen]);

  const handleTogglePart = (part: string) => {
    if (feedback) return;
    if (question.type === 'radical_combine') {
      const next = selectedParts.includes(part)
        ? selectedParts.filter((p) => p !== part)
        : [...selectedParts, part].slice(0, 2);
      setSelectedParts(next);
      return;
    }
    // spelling or ordering: allow clicking each item
    setSelectedParts((prev) => [...prev, part]);
  };

  const handleSubmitInteractive = () => {
    if (feedback) return;
    if (question.type === 'radical_combine') {
      const expected = question.answer.split('+').sort().join('+');
      const actual = [...selectedParts].sort().join('+');
      onSubmitAnswer(selectedParts.join('＋'), actual === expected ? 1.0 : 0);
    } else if (question.type === 'spelling') {
      const joined = selectedParts.join('');
      const target = question.answer.toUpperCase();
      if (joined.toUpperCase() === target) {
        onSubmitAnswer(joined, 1.0);
      } else {
        let matchCount = 0;
        for (let i = 0; i < Math.min(joined.length, target.length); i++) {
          if (joined[i].toUpperCase() === target[i]) matchCount++;
        }
        onSubmitAnswer(joined || '(未拼字)', matchCount >= target.length / 2 ? 0.5 : 0);
      }
    } else if (question.type === 'ordering') {
      const expectedArr = question.answer.split(',');
      let matchCount = 0;
      expectedArr.forEach((item, i) => {
        if (selectedParts[i] === item) matchCount++;
      });
      const coef: 0 | 0.5 | 1.0 =
        matchCount === expectedArr.length ? 1.0 : matchCount >= expectedArr.length / 2 ? 0.5 : 0;
      onSubmitAnswer(selectedParts.join(' → ') || '(未排序)', coef);
    } else if (question.type === 'number_line' && question.numberLine) {
      const diff = Math.abs(numberLineVal - question.numberLine.target);
      const ok = diff <= question.numberLine.tolerance;
      onSubmitAnswer(String(numberLineVal), ok ? 1.0 : 0);
    }
  };

  const requestAiExplanation = async () => {
    if (!feedback || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: question.grade,
          subject: question.subject,
          question: question.prompt,
          correctAnswer: question.answer,
          studentAnswer: feedback.studentAnswer,
          baseExplanation: question.explanation,
          spiritName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || '暫時無法取得 AI 精靈講解。');
      } else {
        setAiExplain(data.explanation);
      }
    } catch {
      setAiError('目前處於離線或網路異常狀態，請參考上方審核解析。');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 p-4 sm:p-5 shadow-xl">
      {/* Top Timer & Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-300">{question.knowledgePoint}</span>
          <span aria-hidden="true">·</span>
          <span>難度 {'★'.repeat(question.difficulty)}</span>
          <span aria-hidden="true">·</span>
          <span className="text-sky-300 font-medium">{speedPreview}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => speakText(question.speechText || question.prompt, question.speechLang ?? 'zh-TW')}
            aria-label="朗讀題目"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 text-xs font-bold text-slate-100 cursor-pointer min-h-[36px]"
          >
            <Volume2 className="w-4 h-4 text-sky-300" />
            朗讀
          </button>
          {!feedback && (
            <button
              type="button"
              onClick={() => setShowHint((h) => !h)}
              aria-label="顯示提示"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 text-xs font-bold text-amber-200 cursor-pointer min-h-[36px]"
            >
              <HelpCircle className="w-4 h-4" />
              提示
            </button>
          )}
        </div>
      </div>

      {/* Smooth Time Progress Bar */}
      <div className="mt-2.5 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-[width] duration-150 ${
            timeFrozen
              ? 'bg-sky-400'
              : remainingPct > 65
              ? 'bg-amber-400'
              : remainingPct > 35
              ? 'bg-sky-400'
              : 'bg-orange-500'
          }`}
          style={{ width: `${remainingPct}%` }}
        />
      </div>

      {/* Question Prompt */}
      <div className="mt-4 text-lg sm:text-xl font-bold text-white leading-relaxed">
        <RenderZhuyinText text={question.prompt} enabled={zhuyinEnabled && question.subject !== 'english'} />
      </div>

      {showHint && !feedback && (
        <div className="mt-3 rounded-xl border border-amber-400/40 bg-amber-950/35 px-4 py-2.5 text-sm text-amber-200">
          <strong className="font-bold">小提示：</strong>
          {question.hint}
        </div>
      )}

      {/* Interactive Answer Area */}
      {!feedback ? (
        <div className="mt-4">
          {/* Single choice / True-False / Listening */}
          {(question.type === 'single_choice' ||
            question.type === 'true_false' ||
            question.type === 'listening') &&
            question.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((opt, idx) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onSubmitAnswer(opt, opt === question.answer ? 1.0 : 0)}
                    className="min-h-[54px] rounded-xl border border-slate-600/80 bg-slate-800/90 hover:border-amber-400 hover:bg-slate-700/90 px-4 py-3 text-left text-base font-bold text-slate-100 transition flex items-center gap-3 cursor-pointer"
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-amber-300 font-mono-num text-sm">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">
                      <RenderZhuyinText text={opt} enabled={zhuyinEnabled && question.subject !== 'english'} />
                    </span>
                  </button>
                ))}
              </div>
            )}

          {/* Radical Combine / Spelling / Ordering */}
          {(question.type === 'radical_combine' ||
            question.type === 'spelling' ||
            question.type === 'ordering') &&
            question.parts && (
              <div className="space-y-3">
                <div className="min-h-[52px] rounded-xl border border-dashed border-amber-400/50 bg-slate-950/70 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedParts.length === 0 ? (
                      <span className="text-sm text-slate-400">
                        {question.type === 'radical_combine'
                          ? '請依序點選 2 個部件組合正確國字'
                          : question.type === 'spelling'
                          ? '請依序點選字母拼出正確單字'
                          : '請依順序點選下方項目完成排列'}
                      </span>
                    ) : (
                      selectedParts.map((p, idx) => (
                        <span
                          key={`${p}-${idx}`}
                          className="rounded-lg bg-amber-500 text-slate-950 font-black px-3 py-1 text-base"
                        >
                          {p}
                        </span>
                      ))
                    )}
                  </div>
                  {selectedParts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedParts([])}
                      className="text-xs text-slate-300 hover:text-white underline cursor-pointer shrink-0"
                    >
                      清空重選
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {question.parts.map((part, idx) => (
                    <button
                      key={`${part}-${idx}`}
                      type="button"
                      onClick={() => handleTogglePart(part)}
                      className="min-w-[56px] min-h-[48px] rounded-xl border border-slate-600 bg-slate-800 hover:border-amber-400 hover:bg-slate-700 px-4 py-2 text-lg font-black text-white transition cursor-pointer"
                    >
                      {part}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={selectedParts.length === 0}
                  onClick={handleSubmitInteractive}
                  className="w-full sm:w-auto min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black px-6 py-3 text-base cursor-pointer"
                >
                  確認送出並發動攻擊
                </button>
              </div>
            )}

          {/* Number Line Cannon */}
          {question.type === 'number_line' && question.numberLine && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-950/75 border border-sky-500/40 p-4">
                <div className="flex items-center justify-between text-xs text-sky-300 font-mono-num mb-2">
                  <span>{question.numberLine.min}</span>
                  <span className="text-base font-black text-amber-300">
                    目前砲台鎖定：{numberLineVal} {question.numberLine.unitLabel ?? ''}
                  </span>
                  <span>{question.numberLine.max}</span>
                </div>
                <input
                  type="range"
                  aria-label="數線定位滑桿"
                  min={question.numberLine.min}
                  max={question.numberLine.max}
                  step={question.numberLine.step}
                  value={numberLineVal}
                  onChange={(e) => setNumberLineVal(Number(e.target.value))}
                  className="w-full h-3 accent-amber-400 cursor-pointer"
                />
                <div className="mt-2 flex justify-between text-[11px] text-slate-400 font-mono-num">
                  {Array.from({ length: 5 }, (_, i) => {
                    const nl = question.numberLine!;
                    const val = Math.round((nl.min + ((nl.max - nl.min) * i) / 4) * 100) / 100;
                    return <span key={i}>{val}</span>;
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmitInteractive}
                className="min-h-[48px] rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black px-6 py-3 text-base cursor-pointer"
              >
                鎖定數線位置・發射砲台！
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Immediate Learning Feedback & Explanation Panel (Spec §1: Always show explanation on wrong!) */
        <div
          className={`mt-4 rounded-xl border p-4 space-y-3 ${
            feedback.correct
              ? 'border-emerald-400/50 bg-emerald-950/35'
              : feedback.partial
              ? 'border-amber-400/50 bg-amber-950/35'
              : 'border-rose-400/60 bg-rose-950/35'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-base font-black">
              {feedback.correct ? (
                <span className="text-emerald-300">
                  ✓ 答對了！[{feedback.speedGrade}] 造成 {feedback.damage} 點傷害
                </span>
              ) : feedback.partial ? (
                <span className="text-amber-300">
                  ◐ 部分正確（×0.5 傷害 {feedback.damage}），再看一次完整答案！
                </span>
              ) : (
                <span className="text-rose-300">
                  ✕ 答錯了（已自動收錄進錯題本）· 正確答案：{question.answer}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-100 leading-relaxed">{feedback.explanation}</p>

          {feedback.explanationSteps && feedback.explanationSteps.length > 0 && (
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-200 bg-slate-950/50 rounded-lg p-3">
              {feedback.explanationSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          )}

          {aiExplain && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-950/35 p-3 text-sm text-amber-100 leading-relaxed">
              <strong className="text-amber-300">{spiritName} 的個人化講解：</strong>
              {aiExplain}
            </div>
          )}
          {aiError && <p className="text-xs text-amber-300">{aiError}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {!feedback.correct && (
              <button
                type="button"
                onClick={() => void requestAiExplanation()}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/60 bg-slate-800 hover:bg-slate-700 text-amber-200 font-bold px-4 py-2.5 text-sm cursor-pointer min-h-[48px]"
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? '精靈思考中…' : `請 ${spiritName} 換個方式講解`}
              </button>
            )}
            <button
              type="button"
              onClick={onNextAfterFeedback}
              className="ml-auto min-h-[48px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 text-sm cursor-pointer"
            >
              下一題 (Enter)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

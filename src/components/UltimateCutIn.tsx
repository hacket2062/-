import React, { useEffect, useState } from 'react';
import type { CharacterTemplate, Question } from '../types/game';
import { CharacterPortraitSvg } from './CharacterAvatarSvg';
import { getUltimateChallengeMultiplier } from '../game/core/combat';
import { playSfx } from '../game/fx/battleFx';

interface Props {
  hero: CharacterTemplate;
  comboSkillLabel?: string;
  questions: Question[];
  skipAnim: boolean;
  soundEnabled: boolean;
  onComplete: (result: { correctCount: number; multiplier: number; isPerfectUltimate: boolean }) => void;
}

/**
 * Spec §8:
 * 1) 必殺挑戰：3 題快問快答（每題 5 秒），答對 0/1/2/3 對應 ×1.0 / ×1.5 / ×2.0 / ×3.0
 * 2) 必殺技演出：畫面變暗 → 角色立繪斜向切入＋招式名大字 → 恢復（可略過）
 */
export const UltimateCutIn: React.FC<Props> = ({
  hero,
  comboSkillLabel,
  questions,
  skipAnim,
  soundEnabled,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'challenge' | 'cutin'>('challenge');
  const [qIdx, setQIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5.0);

  const currentQ = questions[qIdx % Math.max(1, questions.length)];

  useEffect(() => {
    if (phase !== 'challenge') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          // timeout this rapid question -> advance
          handlePick('__TIMEOUT__');
          return 5.0;
        }
        return Math.max(0, Math.round((prev - 0.1) * 10) / 10);
      });
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, qIdx, correctCount]);

  const finishChallenge = (finalCorrect: number) => {
    const res = getUltimateChallengeMultiplier(finalCorrect);
    playSfx('ultimate', soundEnabled);
    if (skipAnim) {
      onComplete({ correctCount: finalCorrect, ...res });
    } else {
      setPhase('cutin');
      setTimeout(() => {
        onComplete({ correctCount: finalCorrect, ...res });
      }, 2200);
    }
  };

  const handlePick = (opt: string) => {
    const isRight = currentQ && opt === currentQ.answer;
    const nextCorrect = correctCount + (isRight ? 1 : 0);
    playSfx(isRight ? 'perfect' : 'wrong', soundEnabled);

    if (qIdx >= 2) {
      setCorrectCount(nextCorrect);
      finishChallenge(nextCorrect);
    } else {
      setCorrectCount(nextCorrect);
      setQIdx((i) => i + 1);
      setTimeLeft(5.0);
    }
  };

  if (phase === 'cutin') {
    const res = getUltimateChallengeMultiplier(correctCount);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92 overflow-hidden">
        <div className="animate-cutin w-full max-w-4xl border-y-4 border-amber-400 bg-gradient-to-r from-slate-950 via-amber-950/90 to-slate-950 py-10 px-8 flex items-center justify-between gap-8 shadow-[0_0_80px_rgba(245,158,11,0.5)]">
          <div className="flex items-center gap-6">
            <CharacterPortraitSvg character={hero} size={136} />
            <div>
              <p className="text-sm font-bold text-amber-300 tracking-widest">
                {res.isPerfectUltimate ? '完美必殺・PERFECT ULTIMATE ×3.0' : `必殺倍率 ×${res.multiplier.toFixed(1)}`}
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-wider">
                {comboSkillLabel || hero.ultimateSkill}
              </h2>
              <p className="text-amber-100/90 mt-2 text-base">{hero.ultimateDesc}</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-5xl font-black font-mono-num text-amber-300">×{res.multiplier.toFixed(1)}</div>
            <div className="text-xs text-slate-300 mt-1">必殺挑戰 {correctCount}/3 正確</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/88 p-4">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-amber-400 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-amber-300">必殺挑戰・快問快答（第 {qIdx + 1} / 3 題）</p>
            <h3 className="text-xl font-black text-white mt-0.5">
              {hero.name}：{comboSkillLabel || hero.ultimateSkill}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black font-mono-num text-amber-300">{timeLeft.toFixed(1)}s</div>
            <div className="text-xs text-slate-400">目前答對 {correctCount} 題</div>
          </div>
        </div>

        {/* 5s Bar */}
        <div className="mt-3 h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-amber-400 transition-[width] duration-100"
            style={{ width: `${(timeLeft / 5) * 100}%` }}
          />
        </div>

        {currentQ && (
          <div className="mt-5">
            <p className="text-lg font-bold text-slate-100 leading-relaxed">{currentQ.prompt}</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(currentQ.options ?? ['正確 ○', '錯誤 ✕']).map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handlePick(opt)}
                  className="min-h-[54px] rounded-xl border border-slate-700 bg-slate-800 hover:border-amber-400 hover:bg-slate-700 px-4 py-3 text-left text-base font-bold text-white transition cursor-pointer"
                >
                  <span className="inline-block w-6 text-amber-300 font-mono-num">{idx + 1}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

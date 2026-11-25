import type { Grade, QuestionType, SpeedGrade } from '../../types/game';

export const GRADE_READING_SECONDS_PER_CHAR: Record<Grade, number> = {
  3: 0.5,
  4: 0.4,
  5: 0.35,
  6: 0.3,
};

export const QUESTION_TYPE_BASE_SECONDS: Record<QuestionType, number> = {
  single_choice: 5,
  true_false: 4,
  radical_combine: 7,
  spelling: 9,
  listening: 7,
  number_line: 8,
  ordering: 9,
};

/**
 * Spec §4: 建議作答時間 T
 * T = 題型基礎秒數 + 題目字數 × 年級閱讀係數 + 選項字數 × 0.3
 * 開啟注音或朗讀時 × 1.3；若守護精靈有「作答時間 +15%」天賦或稱號放寬，乘上額外倍率。
 */
export function calculateSuggestedTime(params: {
  questionType: QuestionType;
  promptLength: number;
  optionsTotalLength: number;
  grade: Grade;
  zhuyinOrAudioEnabled: boolean;
  spiritTimeBonusPct?: number;
  titleSpeedRelaxPct?: number;
}): number {
  const base = QUESTION_TYPE_BASE_SECONDS[params.questionType] ?? 6;
  const gradeRate = GRADE_READING_SECONDS_PER_CHAR[params.grade] ?? 0.35;
  let t = base + params.promptLength * gradeRate + params.optionsTotalLength * 0.3;
  if (params.zhuyinOrAudioEnabled) {
    t *= 1.3;
  }
  const extraBonus =
    1 + (params.spiritTimeBonusPct ?? 0) / 100 + (params.titleSpeedRelaxPct ?? 0) / 100;
  t *= extraBonus;
  return Math.max(6, Math.round(t * 10) / 10);
}

/**
 * Spec §4: 速度係數（T = 該題建議作答時間）
 * PERFECT: <= 30% T -> 1.5 (+15 energy)
 * GREAT: <= 60% T -> 1.25
 * GOOD: <= 100% T -> 1.0
 * SLOW: > T within time limit (1.8x T) or Practice Mode -> 0.8 (no penalty)
 * TIMEOUT: > limit (unless Practice Mode) -> 0
 */
export function evaluateSpeedGrade(params: {
  elapsedSec: number;
  suggestedSec: number;
  practiceMode?: boolean;
  timeFrozen?: boolean;
  panicked?: boolean;
}): { grade: SpeedGrade; coef: number; bonusUltEnergy: number } {
  if (params.timeFrozen) {
    return { grade: 'PERFECT', coef: params.panicked ? 1.0 : 1.5, bonusUltEnergy: 15 };
  }
  const limitSec = params.suggestedSec * 1.8;
  if (!params.practiceMode && params.elapsedSec > limitSec) {
    return { grade: 'TIMEOUT', coef: 0, bonusUltEnergy: 0 };
  }
  const ratio = params.elapsedSec / Math.max(1, params.suggestedSec);
  let grade: SpeedGrade;
  let coef: number;
  let bonusUltEnergy = 0;

  if (ratio <= 0.3) {
    grade = 'PERFECT';
    coef = 1.5;
    bonusUltEnergy = 15;
  } else if (ratio <= 0.6) {
    grade = 'GREAT';
    coef = 1.25;
  } else if (ratio <= 1.0) {
    grade = 'GOOD';
    coef = 1.0;
  } else {
    grade = 'SLOW';
    coef = 0.8;
  }

  // Spec §4 防亂猜: 角色「慌張」時下一題速度加成取消（上限為 1.0）
  if (params.panicked && coef > 1.0) {
    coef = 1.0;
    bonusUltEnergy = 0;
  }

  return { grade, coef, bonusUltEnergy };
}

/**
 * Spec §4: 連擊係數 = min(2.0, 1 + 0.1 * combo)
 * 10 連擊觸發「智光爆發」5 秒
 */
export function calculateComboMultiplier(combo: number): {
  coef: number;
  triggersBurst: boolean;
} {
  const safeCombo = Math.max(0, Math.floor(combo));
  const coef = Math.min(2.0, Math.round((1 + 0.1 * safeCombo) * 100) / 100);
  return {
    coef,
    triggersBurst: safeCombo > 0 && safeCombo % 10 === 0,
  };
}

export interface DamageInput {
  atk: number;
  skillMultiplier: number;
  accuracyCoef: 0 | 0.5 | 1.0;
  speedCoef: number;
  comboCoef: number;
  elementMultiplier: number;
  isCrit: boolean;
  enemyDef: number;
  luminaBurstActive?: boolean;
}

/**
 * Spec §4 傷害公式:
 * 最終傷害 = max(1, 攻擊力 × 技能倍率 × 正確係數 × 速度係數 × 連擊係數 × 屬性克制 × 暴擊 - 0.5 × 敵方防禦)
 * 若正確係數為 0，則不攻擊（傷害為 0）。
 */
export function calculateFinalDamage(input: DamageInput): number {
  if (input.accuracyCoef === 0 || input.speedCoef === 0) {
    return 0;
  }
  const critMult = input.isCrit ? 1.5 : 1.0;
  const burstMult = input.luminaBurstActive ? 1.25 : 1.0;
  const raw =
    input.atk *
      input.skillMultiplier *
      input.accuracyCoef *
      input.speedCoef *
      input.comboCoef *
      input.elementMultiplier *
      critMult *
      burstMult -
    0.5 * input.enemyDef;
  return Math.max(1, Math.round(raw));
}

/**
 * Spec §8 必殺挑戰倍率: 3 題快問快答，答對 0/1/2/3 -> x1.0 / x1.5 / x2.0 / x3.0
 */
export function getUltimateChallengeMultiplier(correctCount: number): {
  multiplier: number;
  isPerfectUltimate: boolean;
} {
  const clamped = Math.max(0, Math.min(3, Math.floor(correctCount)));
  const map = [1.0, 1.5, 2.0, 3.0];
  return {
    multiplier: map[clamped],
    isPerfectUltimate: clamped === 3,
  };
}

/**
 * Spec §4 防亂猜: 1 秒內連續答錯 2 次 -> 進入「慌張」
 */
export function evaluateAntiGuessing(params: {
  isCorrect: boolean;
  elapsedSec: number;
  recentFastWrongs: number;
}): {
  newFastWrongs: number;
  triggeredPanic: boolean;
  wasFastGuess: boolean;
} {
  const wasFastGuess = !params.isCorrect && params.elapsedSec <= 1.0;
  if (params.isCorrect) {
    return { newFastWrongs: 0, triggeredPanic: false, wasFastGuess: false };
  }
  if (wasFastGuess) {
    const nextCount = params.recentFastWrongs + 1;
    return {
      newFastWrongs: nextCount,
      triggeredPanic: nextCount >= 2,
      wasFastGuess: true,
    };
  }
  return { newFastWrongs: 0, triggeredPanic: false, wasFastGuess: false };
}

/**
 * Spec §9 三星評價:
 * ★ 通關
 * ★★ 正確率 >= 80%
 * ★★★ 正確率 >= 90% 且 PERFECT/GREAT >= 50%
 */
export function calculateStageStars(params: {
  cleared: boolean;
  totalQuestions: number;
  correctCount: number;
  perfectOrGreatCount: number;
}): 0 | 1 | 2 | 3 {
  if (!params.cleared) return 0;
  const total = Math.max(1, params.totalQuestions);
  const accuracy = params.correctCount / total;
  const fastRatio = params.perfectOrGreatCount / total;
  if (accuracy >= 0.9 && fastRatio >= 0.5) return 3;
  if (accuracy >= 0.8) return 2;
  return 1;
}

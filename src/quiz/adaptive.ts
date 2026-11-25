import type { Question, WrongQuestionRecord } from '../types/game';

const DAY_MS = 24 * 60 * 60 * 1000;
export const SPACED_INTERVAL_DAYS = [1, 3, 7] as const;

/**
 * Spec §4 適性難度: 每個知識點熟練度 0~100
 */
export function updateKnowledgeMastery(
  current: number,
  isCorrect: boolean,
  isFast: boolean
): number {
  const delta = isCorrect ? (isFast ? 12 : 8) : -10;
  return Math.max(0, Math.min(100, Math.round(current + delta)));
}

/** Map mastery 0..100 -> target difficulty 1..5 */
export function masteryToDifficulty(mastery: number): 1 | 2 | 3 | 4 | 5 {
  if (mastery < 20) return 1;
  if (mastery < 40) return 2;
  if (mastery < 65) return 3;
  if (mastery < 85) return 4;
  return 5;
}

/**
 * Spec §4 適性出題:
 * - 連錯 3 題自動出簡單題並顯示提示
 * - 否則 70% 同程度、20% 稍簡單、10% 稍難
 */
export function pickAdaptiveQuestion(params: {
  pool: Question[];
  askedIds: Set<string>;
  masteryMap: Record<string, number>;
  consecutiveWrongs: number;
  rng?: () => number;
}): { question: Question; autoShowHint: boolean } {
  const rng = params.rng ?? Math.random;
  const fresh = params.pool.filter((q) => !params.askedIds.has(q.id));
  const candidates = fresh.length > 0 ? fresh : params.pool;

  if (candidates.length === 0) {
    throw new Error('Question pool is empty');
  }

  // 3 consecutive wrong -> force easiest available + show hint
  if (params.consecutiveWrongs >= 3) {
    const sortedEasy = [...candidates].sort((a, b) => a.difficulty - b.difficulty);
    return { question: sortedEasy[0], autoShowHint: true };
  }

  // Compute average mastery across candidate knowledge points
  const avgMastery =
    candidates.reduce((sum, q) => sum + (params.masteryMap[q.knowledgePoint] ?? 45), 0) /
    candidates.length;
  const baseDiff = masteryToDifficulty(avgMastery);

  const roll = rng();
  let desiredDiff = baseDiff;
  if (roll >= 0.9) {
    desiredDiff = Math.min(5, baseDiff + 1) as 1 | 2 | 3 | 4 | 5;
  } else if (roll >= 0.7) {
    desiredDiff = Math.max(1, baseDiff - 1) as 1 | 2 | 3 | 4 | 5;
  }

  const exactMatches = candidates.filter((q) => q.difficulty === desiredDiff);
  if (exactMatches.length > 0) {
    const idx = Math.floor(rng() * exactMatches.length);
    return { question: exactMatches[idx], autoShowHint: false };
  }

  // Nearest difficulty fallback
  const sortedNearest = [...candidates].sort(
    (a, b) => Math.abs(a.difficulty - desiredDiff) - Math.abs(b.difficulty - desiredDiff)
  );
  return { question: sortedNearest[0], autoShowHint: false };
}

/**
 * Spec §12 錯題本: 自動收錄、依知識點分類、間隔 1 / 3 / 7 天複習；答對 2 次即畢業
 */
export function recordWrongAnswer(
  existing: WrongQuestionRecord | undefined,
  question: Question,
  nowMs: number
): WrongQuestionRecord {
  return {
    questionId: question.id,
    question,
    wrongCount: (existing?.wrongCount ?? 0) + 1,
    correctStreak: 0,
    graduated: false,
    lastWrongAt: nowMs,
    intervalStage: 0,
    nextReviewAt: nowMs + SPACED_INTERVAL_DAYS[0] * DAY_MS,
  };
}

export function recordWrongBookReviewCorrect(
  record: WrongQuestionRecord,
  nowMs: number
): WrongQuestionRecord {
  const nextStreak = record.correctStreak + 1;
  const graduated = nextStreak >= 2;
  const nextStage = Math.min(2, record.intervalStage + 1) as 0 | 1 | 2;
  return {
    ...record,
    correctStreak: nextStreak,
    graduated,
    intervalStage: nextStage,
    nextReviewAt: nowMs + SPACED_INTERVAL_DAYS[nextStage] * DAY_MS,
  };
}

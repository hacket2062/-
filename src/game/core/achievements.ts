import type {
  AchievementDef,
  AchievementEvaluation,
  AnswerTelemetry,
  Grade,
  Semester,
  SubjectChartDatum,
  SubjectId,
} from '../../types/game';

export const SUBJECT_ORDER: SubjectId[] = ['chinese', 'english', 'math', 'science'];

export const SUBJECT_CHART_META: Record<
  SubjectId,
  { name: string; shortName: string; color: string }
> = {
  chinese: { name: '國語文', shortName: '國語', color: '#f59e0b' },
  english: { name: '英語文', shortName: '英語', color: '#06b6d4' },
  math: { name: '數學', shortName: '數學', color: '#a855f7' },
  science: { name: '自然科學', shortName: '自然', color: '#10b981' },
};

/**
 * Achievement definitions spanning:
 * 1. Answer Count (答題數量)
 * 2. Consecutive Streak & Accuracy (連續正確率)
 * 3. Subject Exploration Progress (科目探索進度)
 */
export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // === 答題數量 ===
  {
    id: 'ach_ans_5',
    name: '初試啼聲',
    description: '累計作答 5 題 108 課綱學習題目',
    category: 'answer_count',
    tier: 'bronze',
    target: 5,
    unitLabel: '題',
    unlockTitleId: 'title_rising_scholar',
    rewardCoins: 150,
    rewardCrystals: 30,
    medalMotif: 'quill',
  },
  {
    id: 'ach_ans_30',
    name: '勤學不倦',
    description: '累計作答 30 題，養成每日思考的好習慣',
    category: 'answer_count',
    tier: 'silver',
    target: 30,
    unitLabel: '題',
    unlockTitleId: 'title_diligent_scribe',
    rewardCoins: 350,
    rewardCrystals: 60,
    medalMotif: 'quill',
  },
  {
    id: 'ach_ans_100',
    name: '百題智者',
    description: '累計作答達 100 題，成為學園博學先鋒',
    category: 'answer_count',
    tier: 'gold',
    target: 100,
    unitLabel: '題',
    unlockTitleId: 'title_hundred_sage',
    rewardCoins: 800,
    rewardCrystals: 150,
    medalMotif: 'crown',
  },

  // === 連續正確率 ===
  {
    id: 'ach_streak_5',
    name: '五連精準',
    description: '達成連續答對 5 題（且總正確率 ≥ 60%）',
    category: 'streak_accuracy',
    tier: 'bronze',
    target: 5,
    unitLabel: '連對',
    minAccuracyPct: 60,
    rewardCoins: 200,
    rewardCrystals: 40,
    medalMotif: 'flame',
  },
  {
    id: 'ach_streak_10',
    name: '十全十美',
    description: '達成連續答對 10 題且總正確率達 80% 以上',
    category: 'streak_accuracy',
    tier: 'silver',
    target: 10,
    unitLabel: '連對',
    minAccuracyPct: 80,
    unlockTitleId: 'title_streak_archer',
    rewardCoins: 500,
    rewardCrystals: 90,
    medalMotif: 'star',
  },
  {
    id: 'ach_streak_20',
    name: '學園神算',
    description: '達成連續答對 20 題且總正確率達 85% 以上',
    category: 'streak_accuracy',
    tier: 'prism',
    target: 20,
    unitLabel: '連對',
    minAccuracyPct: 85,
    unlockTitleId: 'title_streak_grandmaster',
    rewardCoins: 1000,
    rewardCrystals: 200,
    medalMotif: 'crown',
  },

  // === 科目探索進度 ===
  {
    id: 'ach_exp_chinese',
    name: '墨靈行者勳章',
    description: '在國語文「墨靈幻境」探索並通關 3 個關卡',
    category: 'subject_exploration',
    tier: 'bronze',
    target: 3,
    unitLabel: '關',
    subjectScope: 'chinese',
    rewardCoins: 220,
    rewardCrystals: 45,
    medalMotif: 'compass',
  },
  {
    id: 'ach_exp_english',
    name: '星艦領航勳章',
    description: '在英語文「星際機甲戰線」探索並通關 3 個關卡',
    category: 'subject_exploration',
    tier: 'bronze',
    target: 3,
    unitLabel: '關',
    subjectScope: 'english',
    rewardCoins: 220,
    rewardCrystals: 45,
    medalMotif: 'compass',
  },
  {
    id: 'ach_exp_math',
    name: '數境建築勳章',
    description: '在數學「數境建築王國」探索並通關 3 個關卡',
    category: 'subject_exploration',
    tier: 'bronze',
    target: 3,
    unitLabel: '關',
    subjectScope: 'math',
    rewardCoins: 220,
    rewardCrystals: 45,
    medalMotif: 'shield',
  },
  {
    id: 'ach_exp_science',
    name: '元素主廚勳章',
    description: '在自然科學「元素料理大亂鬥」探索並通關 3 個關卡',
    category: 'subject_exploration',
    tier: 'bronze',
    target: 3,
    unitLabel: '關',
    subjectScope: 'science',
    rewardCoins: 220,
    rewardCrystals: 45,
    medalMotif: 'shield',
  },
  {
    id: 'ach_exp_four_worlds',
    name: '四界探險家',
    description: '國、英、數、自四大科目皆至少探索 1 關（共 4 科）',
    category: 'subject_exploration',
    tier: 'gold',
    target: 4,
    unitLabel: '科',
    subjectScope: 'all_four',
    rewardCoins: 600,
    rewardCrystals: 120,
    medalMotif: 'star',
  },
  {
    id: 'ach_exp_12_stages',
    name: '全科通曉徽章',
    description: '四大主題世界累計通關達 12 個關卡',
    category: 'subject_exploration',
    tier: 'prism',
    target: 12,
    unitLabel: '關',
    unlockTitleId: 'title_world_explorer',
    rewardCoins: 900,
    rewardCrystals: 180,
    medalMotif: 'crown',
  },
];

export interface AchievementEvalInput {
  telemetry: AnswerTelemetry[];
  stageStars: Record<string, number>;
  bestCorrectStreak: number;
}

/** Extract subject prefix from stageStars keys formatted like `math_g5s1_u1_s1` */
export function getSubjectFromStageKey(stageKey: string): SubjectId | null {
  const prefix = stageKey.split('_')[0];
  if (prefix === 'chinese' || prefix === 'english' || prefix === 'math' || prefix === 'science') {
    return prefix;
  }
  return null;
}

/** Compute longest consecutive correct streak from telemetry as a lower bound */
export function computeMaxStreakFromTelemetry(telemetry: AnswerTelemetry[]): number {
  let best = 0;
  let cur = 0;
  for (const item of telemetry) {
    if (item.correct) {
      cur += 1;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
}

/** Pure evaluator for all achievements based on player telemetry, streak, and explored stages */
export function evaluateAchievements(input: AchievementEvalInput): {
  list: AchievementEvaluation[];
  totalAnswered: number;
  overallAccuracyPct: number;
  bestStreak: number;
  totalClearedStages: number;
  exploredSubjectsCount: number;
} {
  const totalAnswered = input.telemetry.length;
  const totalCorrect = input.telemetry.filter((t) => t.correct).length;
  const overallAccuracyPct =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const bestStreak = Math.max(
    input.bestCorrectStreak,
    computeMaxStreakFromTelemetry(input.telemetry)
  );

  const clearedBySubject: Record<SubjectId, number> = {
    chinese: 0,
    english: 0,
    math: 0,
    science: 0,
  };

  for (const [key, stars] of Object.entries(input.stageStars)) {
    if (stars <= 0) continue;
    const subj = getSubjectFromStageKey(key);
    if (subj) clearedBySubject[subj] += 1;
  }

  const totalClearedStages =
    clearedBySubject.chinese +
    clearedBySubject.english +
    clearedBySubject.math +
    clearedBySubject.science;

  const exploredSubjectsCount = SUBJECT_ORDER.filter((s) => clearedBySubject[s] > 0).length;

  const list: AchievementEvaluation[] = ACHIEVEMENT_DEFS.map((def) => {
    let current = 0;
    let accuracyMet = true;

    if (def.category === 'answer_count') {
      current = totalAnswered;
    } else if (def.category === 'streak_accuracy') {
      current = bestStreak;
      if (def.minAccuracyPct !== undefined) {
        accuracyMet = totalAnswered > 0 && overallAccuracyPct >= def.minAccuracyPct;
      }
    } else if (def.category === 'subject_exploration') {
      if (def.subjectScope === 'all_four') {
        current = exploredSubjectsCount;
      } else if (def.subjectScope) {
        current = clearedBySubject[def.subjectScope];
      } else {
        current = totalClearedStages;
      }
    }

    const progressPct = Math.min(100, Math.round((current / def.target) * 100));
    const unlocked = current >= def.target && accuracyMet;

    return {
      def,
      current: Math.min(current, def.target),
      target: def.target,
      progressPct,
      unlocked,
      accuracyMet,
    };
  });

  return {
    list,
    totalAnswered,
    overallAccuracyPct,
    bestStreak,
    totalClearedStages,
    exploredSubjectsCount,
  };
}

/** Return title IDs unlocked by achievements that are not yet in `existingTitles` */
export function getNewlyUnlockedAchievementTitles(
  input: AchievementEvalInput,
  existingTitles: string[]
): string[] {
  const existing = new Set(existingTitles);
  const { list } = evaluateAchievements(input);
  const unlockedIds: string[] = [];
  for (const item of list) {
    if (item.unlocked && item.def.unlockTitleId && !existing.has(item.def.unlockTitleId)) {
      unlockedIds.push(item.def.unlockTitleId);
      existing.add(item.def.unlockTitleId);
    }
  }
  return unlockedIds;
}

/**
 * Pure analytics builder for Recharts PieChart (exploration completion) & BarChart (answer accuracy)
 * across the 4 subjects (國語文, 英語文, 數學, 自然科學).
 */
export function computeSubjectAnalytics(params: {
  telemetry: AnswerTelemetry[];
  stageStars: Record<string, number>;
  selectedGrade: Grade;
  selectedSemester: Semester;
  /** Number of units per subject in the selected semester (default 3 units × 10 stages = 30) */
  stagesPerSubject?: number;
}): {
  subjects: SubjectChartDatum[];
  hasAnyExploration: boolean;
  overallExplorationPct: number;
  overallAccuracyPct: number;
} {
  const stagesPerSubject = params.stagesPerSubject ?? 30;
  const gradeSemToken = `_g${params.selectedGrade}s${params.selectedSemester}_`;

  const rawClearedAll: Record<SubjectId, number> = {
    chinese: 0,
    english: 0,
    math: 0,
    science: 0,
  };
  const rawClearedCurrentTerm: Record<SubjectId, number> = {
    chinese: 0,
    english: 0,
    math: 0,
    science: 0,
  };

  for (const [key, stars] of Object.entries(params.stageStars)) {
    if (stars <= 0) continue;
    const subj = getSubjectFromStageKey(key);
    if (!subj) continue;
    rawClearedAll[subj] += 1;
    if (key.includes(gradeSemToken)) {
      rawClearedCurrentTerm[subj] += 1;
    }
  }

  const totalClearedAll = SUBJECT_ORDER.reduce((sum, s) => sum + rawClearedAll[s], 0);
  const hasAnyExploration = totalClearedAll > 0;

  const subjects: SubjectChartDatum[] = SUBJECT_ORDER.map((subject) => {
    const meta = SUBJECT_CHART_META[subject];
    // Use all cleared stages across terms if player explored outside current term, capped to totalStages
    const exploredStages = Math.max(rawClearedCurrentTerm[subject], rawClearedAll[subject]);
    const explorationPct = Math.min(100, Math.round((exploredStages / stagesPerSubject) * 100));

    const subjTelemetry = params.telemetry.filter((t) => t.subject === subject);
    const totalAnswered = subjTelemetry.length;
    const correctAnswered = subjTelemetry.filter((t) => t.correct).length;
    const accuracyPct =
      totalAnswered > 0 ? Math.round((correctAnswered / totalAnswered) * 100) : 0;

    return {
      subject,
      name: meta.name,
      shortName: meta.shortName,
      color: meta.color,
      exploredStages,
      totalStages: stagesPerSubject,
      explorationPct,
      pieValue: hasAnyExploration ? exploredStages : 1,
      totalAnswered,
      correctAnswered,
      accuracyPct,
      hasAnswers: totalAnswered > 0,
    };
  });

  const overallExplorationPct = Math.min(
    100,
    Math.round(
      (subjects.reduce((sum, s) => sum + s.exploredStages, 0) / (stagesPerSubject * 4)) * 100
    )
  );
  const totalAnsAll = params.telemetry.length;
  const totalCorrectAll = params.telemetry.filter((t) => t.correct).length;
  const overallAccuracyPct =
    totalAnsAll > 0 ? Math.round((totalCorrectAll / totalAnsAll) * 100) : 0;

  return {
    subjects,
    hasAnyExploration,
    overallExplorationPct,
    overallAccuracyPct,
  };
}

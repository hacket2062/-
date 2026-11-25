import test from 'node:test';
import assert from 'node:assert/strict';
import type { AnswerTelemetry } from '../../types/game';
import {
  computeSubjectAnalytics,
  evaluateAchievements,
  getNewlyUnlockedAchievementTitles,
} from './achievements';

function makeTelemetry(subject: AnswerTelemetry['subject'], correct: boolean, idx: number): AnswerTelemetry {
  return {
    timestamp: 1_700_000_000_000 + idx * 5000,
    subject,
    knowledgePoint: '測試知識點',
    correct,
    elapsedSec: 4.5,
    suggestedSec: 12,
    speedGrade: correct ? 'PERFECT' : 'SLOW',
    wasFastGuess: false,
  };
}

test('answer count achievements unlock at 5 and 30 answers and unlock matching titles', () => {
  const telemetry = Array.from({ length: 5 }, (_, i) => makeTelemetry('math', true, i));
  const evalRes = evaluateAchievements({
    telemetry,
    stageStars: {},
    bestCorrectStreak: 5,
  });

  const ans5 = evalRes.list.find((a) => a.def.id === 'ach_ans_5');
  const ans30 = evalRes.list.find((a) => a.def.id === 'ach_ans_30');
  assert.equal(ans5?.unlocked, true);
  assert.equal(ans30?.unlocked, false);

  const newTitles = getNewlyUnlockedAchievementTitles(
    { telemetry, stageStars: {}, bestCorrectStreak: 5 },
    ['title_novice_guardian']
  );
  assert.ok(newTitles.includes('title_rising_scholar'));
});

test('streak accuracy achievements enforce both streak count and minimum accuracy threshold', () => {
  // 10 consecutive right followed by 5 wrong -> 10/15 = 67% (< 80% required for ach_streak_10)
  const lowAccTelemetry: AnswerTelemetry[] = [
    ...Array.from({ length: 10 }, (_, i) => makeTelemetry('chinese', true, i)),
    ...Array.from({ length: 5 }, (_, i) => makeTelemetry('chinese', false, 10 + i)),
  ];
  const lowAccEval = evaluateAchievements({
    telemetry: lowAccTelemetry,
    stageStars: {},
    bestCorrectStreak: 10,
  });
  const s10Low = lowAccEval.list.find((a) => a.def.id === 'ach_streak_10');
  assert.equal(s10Low?.unlocked, false);
  assert.equal(s10Low?.accuracyMet, false);

  // 10 right + 2 wrong -> 10/12 = 83% (>= 80% required)
  const highAccTelemetry: AnswerTelemetry[] = [
    ...Array.from({ length: 10 }, (_, i) => makeTelemetry('chinese', true, i)),
    ...Array.from({ length: 2 }, (_, i) => makeTelemetry('chinese', false, 10 + i)),
  ];
  const highAccEval = evaluateAchievements({
    telemetry: highAccTelemetry,
    stageStars: {},
    bestCorrectStreak: 10,
  });
  const s10High = highAccEval.list.find((a) => a.def.id === 'ach_streak_10');
  assert.equal(s10High?.unlocked, true);
  assert.equal(s10High?.accuracyMet, true);
});

test('subject exploration achievements and Recharts analytics compute per-subject completion and accuracy', () => {
  const stageStars: Record<string, number> = {
    chinese_g5s1_u1_s1: 3,
    chinese_g5s1_u1_s2: 2,
    chinese_g5s1_u1_s3: 3,
    english_g5s1_u1_s1: 3,
    math_g5s1_u1_s1: 3,
    science_g5s1_u1_s1: 2,
  };
  const telemetry: AnswerTelemetry[] = [
    makeTelemetry('chinese', true, 1),
    makeTelemetry('chinese', true, 2),
    makeTelemetry('english', true, 3),
    makeTelemetry('english', false, 4),
    makeTelemetry('math', true, 5),
    makeTelemetry('math', true, 6),
    makeTelemetry('math', true, 7),
    makeTelemetry('science', false, 8),
  ];

  const evalRes = evaluateAchievements({ telemetry, stageStars, bestCorrectStreak: 3 });
  assert.equal(evalRes.list.find((a) => a.def.id === 'ach_exp_chinese')?.unlocked, true);
  assert.equal(evalRes.list.find((a) => a.def.id === 'ach_exp_four_worlds')?.unlocked, true);
  assert.equal(evalRes.list.find((a) => a.def.id === 'ach_exp_12_stages')?.unlocked, false);

  const analytics = computeSubjectAnalytics({
    telemetry,
    stageStars,
    selectedGrade: 5,
    selectedSemester: 1,
    stagesPerSubject: 30,
  });

  assert.equal(analytics.hasAnyExploration, true);
  const chinese = analytics.subjects.find((s) => s.subject === 'chinese')!;
  const english = analytics.subjects.find((s) => s.subject === 'english')!;
  const math = analytics.subjects.find((s) => s.subject === 'math')!;
  const science = analytics.subjects.find((s) => s.subject === 'science')!;

  assert.equal(chinese.exploredStages, 3);
  assert.equal(chinese.explorationPct, 10);
  assert.equal(chinese.accuracyPct, 100);
  assert.equal(english.accuracyPct, 50);
  assert.equal(math.accuracyPct, 100);
  assert.equal(science.accuracyPct, 0);
});

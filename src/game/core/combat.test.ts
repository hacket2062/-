import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateComboMultiplier,
  calculateFinalDamage,
  calculateStageStars,
  calculateSuggestedTime,
  evaluateAntiGuessing,
  evaluateSpeedGrade,
  getUltimateChallengeMultiplier,
} from './combat';

test('suggested time scales with grade reading factor and Zhuyin/TTS 1.3x', () => {
  const g3 = calculateSuggestedTime({
    questionType: 'single_choice',
    promptLength: 20,
    optionsTotalLength: 10,
    grade: 3,
    zhuyinOrAudioEnabled: false,
  });
  const g6 = calculateSuggestedTime({
    questionType: 'single_choice',
    promptLength: 20,
    optionsTotalLength: 10,
    grade: 6,
    zhuyinOrAudioEnabled: false,
  });
  assert.equal(g3, 18);
  assert.equal(g6, 14);

  const g3Zhuyin = calculateSuggestedTime({
    questionType: 'single_choice',
    promptLength: 20,
    optionsTotalLength: 10,
    grade: 3,
    zhuyinOrAudioEnabled: true,
  });
  assert.equal(g3Zhuyin, 23.4);
});

test('speed grading follows PERFECT/GREAT/GOOD/SLOW/TIMEOUT and Practice Mode never times out', () => {
  assert.equal(evaluateSpeedGrade({ elapsedSec: 2.5, suggestedSec: 10 }).grade, 'PERFECT');
  assert.equal(evaluateSpeedGrade({ elapsedSec: 2.5, suggestedSec: 10 }).coef, 1.5);
  assert.equal(evaluateSpeedGrade({ elapsedSec: 5.5, suggestedSec: 10 }).grade, 'GREAT');
  assert.equal(evaluateSpeedGrade({ elapsedSec: 9.0, suggestedSec: 10 }).grade, 'GOOD');
  assert.equal(evaluateSpeedGrade({ elapsedSec: 13.0, suggestedSec: 10 }).grade, 'SLOW');
  assert.equal(evaluateSpeedGrade({ elapsedSec: 25.0, suggestedSec: 10 }).grade, 'TIMEOUT');
  assert.equal(
    evaluateSpeedGrade({ elapsedSec: 99, suggestedSec: 10, practiceMode: true }).grade,
    'SLOW'
  );
  const panicked = evaluateSpeedGrade({ elapsedSec: 2.0, suggestedSec: 10, panicked: true });
  assert.equal(panicked.coef, 1.0);
  assert.equal(panicked.bonusUltEnergy, 0);
});

test('damage formula matches spec §4 exact equation and minimum 1 damage', () => {
  const dmg = calculateFinalDamage({
    atk: 100,
    skillMultiplier: 1.5,
    accuracyCoef: 1.0,
    speedCoef: 1.5,
    comboCoef: 1.2,
    elementMultiplier: 1.0,
    isCrit: false,
    enemyDef: 40,
  });
  assert.equal(dmg, 250);

  const zeroDmg = calculateFinalDamage({
    atk: 100,
    skillMultiplier: 1.5,
    accuracyCoef: 0,
    speedCoef: 1.5,
    comboCoef: 1.0,
    elementMultiplier: 1.0,
    isCrit: false,
    enemyDef: 10,
  });
  assert.equal(zeroDmg, 0);

  const minDmg = calculateFinalDamage({
    atk: 10,
    skillMultiplier: 1.0,
    accuracyCoef: 0.5,
    speedCoef: 0.8,
    comboCoef: 1.0,
    elementMultiplier: 1.0,
    isCrit: false,
    enemyDef: 500,
  });
  assert.equal(minDmg, 1);
});

test('combo multiplier caps at 2.0 and triggers Lumina Burst at 10 combo', () => {
  assert.deepEqual(calculateComboMultiplier(5), { coef: 1.5, triggersBurst: false });
  assert.deepEqual(calculateComboMultiplier(10), { coef: 2.0, triggersBurst: true });
  assert.deepEqual(calculateComboMultiplier(15), { coef: 2.0, triggersBurst: false });
});

test('anti-guessing triggers panic after 2 fast wrongs within 1 second', () => {
  const first = evaluateAntiGuessing({ isCorrect: false, elapsedSec: 0.6, recentFastWrongs: 0 });
  assert.equal(first.triggeredPanic, false);
  assert.equal(first.newFastWrongs, 1);

  const second = evaluateAntiGuessing({
    isCorrect: false,
    elapsedSec: 0.8,
    recentFastWrongs: first.newFastWrongs,
  });
  assert.equal(second.triggeredPanic, true);
  assert.equal(second.newFastWrongs, 2);
});

test('ultimate challenge multiplier and stage star ratings match spec', () => {
  assert.deepEqual(getUltimateChallengeMultiplier(3), { multiplier: 3.0, isPerfectUltimate: true });
  assert.deepEqual(getUltimateChallengeMultiplier(1), { multiplier: 1.5, isPerfectUltimate: false });

  assert.equal(
    calculateStageStars({ cleared: true, totalQuestions: 10, correctCount: 9, perfectOrGreatCount: 5 }),
    3
  );
  assert.equal(
    calculateStageStars({ cleared: true, totalQuestions: 10, correctCount: 8, perfectOrGreatCount: 2 }),
    2
  );
  assert.equal(
    calculateStageStars({ cleared: true, totalQuestions: 10, correctCount: 6, perfectOrGreatCount: 1 }),
    1
  );
});

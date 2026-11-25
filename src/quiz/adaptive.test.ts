import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pickAdaptiveQuestion,
  recordWrongAnswer,
  recordWrongBookReviewCorrect,
  updateKnowledgeMastery,
} from './adaptive';
import type { Question } from '../types/game';

const makeQ = (id: string, difficulty: 1 | 2 | 3 | 4 | 5): Question => ({
  id,
  grade: 5,
  semester: 1,
  subject: 'math',
  unitId: 'm5_1_u1',
  knowledgePoint: '因數與倍數',
  type: 'single_choice',
  difficulty,
  prompt: `題目 ${id}`,
  options: ['A', 'B', 'C', 'D'],
  answer: 'A',
  explanation: '解析',
  hint: '提示',
});

test('knowledge mastery clamps within 0..100', () => {
  assert.equal(updateKnowledgeMastery(95, true, true), 100);
  assert.equal(updateKnowledgeMastery(5, false, false), 0);
});

test('adaptive selection serves easiest question with autoShowHint after 3 consecutive wrongs', () => {
  const pool = [makeQ('q1', 4), makeQ('q2', 1), makeQ('q3', 3)];
  const pick = pickAdaptiveQuestion({
    pool,
    askedIds: new Set(),
    masteryMap: { 因數與倍數: 80 },
    consecutiveWrongs: 3,
  });
  assert.equal(pick.question.id, 'q2');
  assert.equal(pick.autoShowHint, true);
});

test('wrong-answer notebook follows 1/3/7 day schedule and graduates after 2 correct answers', () => {
  const q = makeQ('q1', 2);
  const t0 = 1_700_000_000_000;
  const rec0 = recordWrongAnswer(undefined, q, t0);
  assert.equal(rec0.wrongCount, 1);
  assert.equal(rec0.graduated, false);
  assert.equal(rec0.intervalStage, 0);

  const rec1 = recordWrongBookReviewCorrect(rec0, t0 + 1000);
  assert.equal(rec1.correctStreak, 1);
  assert.equal(rec1.graduated, false);
  assert.equal(rec1.intervalStage, 1);

  const rec2 = recordWrongBookReviewCorrect(rec1, t0 + 2000);
  assert.equal(rec2.correctStreak, 2);
  assert.equal(rec2.graduated, true);
  assert.equal(rec2.intervalStage, 2);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getEnhanceCost,
  getMaxLevelForStars,
  resolveCharacterFusion,
  rollSummonRarity,
  SUMMON_PITY_LIMIT,
} from './progression';
import type { FusionRecipe, OwnedCharacter } from '../../types/game';

test('star level caps match spec 1★=20 .. 6★=80', () => {
  assert.equal(getMaxLevelForStars(1), 20);
  assert.equal(getMaxLevelForStars(6), 80);
});

test('character fusion supports both secret recipe and same-class rarity upgrade', () => {
  const recipes: FusionRecipe[] = [
    {
      id: 'rec_ink_blade',
      materialA: 'ink_swordsman',
      materialB: 'ink_assassin',
      resultId: 'ink_hidden_dual',
      coreCost: 2,
      clue: '劍與筆合一',
    },
  ];
  const a: OwnedCharacter = {
    templateId: 'ink_swordsman',
    level: 14,
    exp: 0,
    stars: 2,
    evolutionStage: 0,
    shards: 0,
    rarity: 'R',
    equippedIds: {},
  };
  const b: OwnedCharacter = {
    templateId: 'ink_assassin',
    level: 18,
    exp: 0,
    stars: 2,
    evolutionStage: 0,
    shards: 0,
    rarity: 'SR',
    equippedIds: {},
  };

  const res = resolveCharacterFusion(a, b, recipes);
  assert.equal(res.valid, true);
  assert.equal(res.kind, 'recipe');
  assert.equal(res.resultTemplateId, 'ink_hidden_dual');
  assert.equal(res.resultLevel, 18);

  const sameRes = resolveCharacterFusion(a, { ...a, level: 10 }, recipes);
  assert.equal(sameRes.valid, true);
  assert.equal(sameRes.kind, 'same_class');
  assert.equal(sameRes.resultRarity, 'SR');
  assert.equal(sameRes.resultLevel, 14);
});

test('equipment enhancement +0 -> +15 never breaks and glows at +10', () => {
  const step9 = getEnhanceCost(9);
  assert.equal(step9.canEnhance, true);
  assert.equal(step9.glowsAfter, true);

  const maxStep = getEnhanceCost(15);
  assert.equal(maxStep.canEnhance, false);
});

test('summon shrine guarantees SSR on 30th pull pity', () => {
  const pityRoll = rollSummonRarity(SUMMON_PITY_LIMIT - 1, () => 0.99);
  assert.equal(pityRoll.rarity, 'SSR');
  assert.equal(pityRoll.triggeredPity, true);
  assert.equal(pityRoll.nextPityCounter, 0);

  const normalRoll = rollSummonRarity(5, () => 0.5);
  assert.equal(normalRoll.rarity, 'R');
  assert.equal(normalRoll.nextPityCounter, 6);
});

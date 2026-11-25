import type {
  CharacterTemplate,
  EquipQuality,
  EquipmentItem,
  FusionRecipe,
  OwnedCharacter,
  Rarity,
} from '../../types/game';

export const RARITY_ORDER: Rarity[] = ['N', 'R', 'SR', 'SSR', 'UR'];
export const QUALITY_ORDER: EquipQuality[] = ['common', 'fine', 'rare', 'epic', 'legendary'];

export const RARITY_STAT_MULT: Record<Rarity, number> = {
  N: 1.0,
  R: 1.15,
  SR: 1.32,
  SSR: 1.55,
  UR: 1.85,
};

export const QUALITY_STAT_MULT: Record<EquipQuality, number> = {
  common: 1.0,
  fine: 1.25,
  rare: 1.55,
  epic: 1.95,
  legendary: 2.5,
};

/** Spec §5: 等級上限依星級 1★=20 ... 6★=80 */
export function getMaxLevelForStars(stars: number): number {
  const clamped = Math.max(1, Math.min(6, Math.floor(stars)));
  const table = [20, 30, 40, 55, 68, 80];
  return table[clamped - 1];
}

export function getExpForNextLevel(level: number): number {
  return Math.round(45 + level * 18 + level * level * 1.4);
}

/** Calculate character final stats combining level, stars, evolution, rarity, equipment, and set bonuses */
export function computeCharacterStats(
  template: CharacterTemplate,
  owned: OwnedCharacter,
  equippedItems: EquipmentItem[],
  titleBonusPct = 0
): { atk: number; hp: number; def: number; power: number } {
  const rarityMult = RARITY_STAT_MULT[owned.rarity] ?? 1.0;
  const starMult = 1 + (owned.stars - 1) * 0.14;
  const evoMult = 1 + owned.evolutionStage * 0.2;
  const lvlScale = 1 + (owned.level - 1) * 0.06;
  const totalMult = rarityMult * starMult * evoMult * lvlScale * (1 + titleBonusPct / 100);

  let equipAtk = 0;
  let equipHp = 0;
  let equipDef = 0;
  const setCounts: Record<string, number> = {};

  for (const item of equippedItems) {
    const enhScale = 1 + item.enhanceLevel * 0.08;
    const qScale = QUALITY_STAT_MULT[item.quality] ?? 1.0;
    equipAtk += Math.round(item.atkBonus * enhScale * qScale);
    equipHp += Math.round(item.hpBonus * enhScale * qScale);
    equipDef += Math.round(item.defBonus * enhScale * qScale);
    if (item.setId) {
      setCounts[item.setId] = (setCounts[item.setId] ?? 0) + 1;
    }
  }

  // 2-piece set bonus: +8% ATK/HP; 4-piece set bonus: +18% ATK/HP
  let setMult = 1.0;
  for (const count of Object.values(setCounts)) {
    if (count >= 4) setMult += 0.18;
    else if (count >= 2) setMult += 0.08;
  }

  const atk = Math.round((template.baseAtk * totalMult + equipAtk) * setMult);
  const hp = Math.round((template.baseHp * totalMult + equipHp) * setMult);
  const def = Math.round((template.baseDef * totalMult + equipDef) * setMult);
  const power = Math.round(atk * 2.2 + hp * 0.4 + def * 1.8);
  return { atk, hp, def, power };
}

/** Spec §5: 角色融合 — 同職業升品 or 配方融合隱藏角 */
export function resolveCharacterFusion(
  charA: OwnedCharacter,
  charB: OwnedCharacter,
  recipes: FusionRecipe[]
): {
  valid: boolean;
  kind: 'recipe' | 'same_class' | 'invalid';
  resultTemplateId?: string;
  resultRarity?: Rarity;
  resultLevel?: number;
  coreCost: number;
  reason?: string;
} {
  // Check recipe match (unordered)
  const matched = recipes.find(
    (r) =>
      (r.materialA === charA.templateId && r.materialB === charB.templateId) ||
      (r.materialA === charB.templateId && r.materialB === charA.templateId)
  );
  if (matched) {
    return {
      valid: true,
      kind: 'recipe',
      resultTemplateId: matched.resultId,
      resultRarity: matched.isCrossWorld ? 'UR' : 'SSR',
      resultLevel: Math.max(charA.level, charB.level),
      coreCost: matched.coreCost,
    };
  }

  // Same class rarity promotion (N -> R -> SR -> SSR)
  if (charA.templateId === charB.templateId) {
    const idx = RARITY_ORDER.indexOf(charA.rarity);
    if (idx < 0 || idx >= RARITY_ORDER.length - 1) {
      return { valid: false, kind: 'invalid', coreCost: 0, reason: '已達最高品質 UR' };
    }
    return {
      valid: true,
      kind: 'same_class',
      resultTemplateId: charA.templateId,
      resultRarity: RARITY_ORDER[idx + 1],
      resultLevel: Math.max(charA.level, charB.level),
      coreCost: 1,
    };
  }

  return {
    valid: false,
    kind: 'invalid',
    coreCost: 0,
    reason: '這兩位角色沒有對應的融合配方，請選擇同職業角色或隱藏配方組合。',
  };
}

/** Spec §7: 裝備強化 +0 -> +15，永不失敗爆裝 */
export function getEnhanceCost(currentLevel: number): {
  canEnhance: boolean;
  coins: number;
  stones: number;
  glowsAfter: boolean;
} {
  if (currentLevel >= 15) {
    return { canEnhance: false, coins: 0, stones: 0, glowsAfter: true };
  }
  const next = currentLevel + 1;
  return {
    canEnhance: true,
    coins: 60 + next * 45,
    stones: 1 + Math.floor(next / 3),
    glowsAfter: next >= 10,
  };
}

/** Spec §7: 裝備升階 普通 -> 精良 -> 稀有 -> 史詩 -> 傳說（保留強化等級） */
export function getNextEquipQuality(q: EquipQuality): EquipQuality | null {
  const idx = QUALITY_ORDER.indexOf(q);
  if (idx < 0 || idx >= QUALITY_ORDER.length - 1) return null;
  return QUALITY_ORDER[idx + 1];
}

/**
 * Spec §11: 兒童友善召喚機率與 30 抽保底 SSR
 * 公開機率: SSR 6%, SR 24%, R 45%, N 25%; 第 30 抽必出 SSR!
 */
export const SUMMON_RATES = {
  SSR: 0.06,
  SR: 0.24,
  R: 0.45,
  N: 0.25,
} as const;

export const SUMMON_PITY_LIMIT = 30;
export const DAILY_SUMMON_CAP = 15;

export function rollSummonRarity(pityCounter: number, rng: () => number = Math.random): {
  rarity: Rarity;
  nextPityCounter: number;
  triggeredPity: boolean;
} {
  const nextPullNum = pityCounter + 1;
  if (nextPullNum >= SUMMON_PITY_LIMIT) {
    return { rarity: 'SSR', nextPityCounter: 0, triggeredPity: true };
  }
  const r = rng();
  if (r < SUMMON_RATES.SSR) {
    return { rarity: 'SSR', nextPityCounter: 0, triggeredPity: false };
  }
  if (r < SUMMON_RATES.SSR + SUMMON_RATES.SR) {
    return { rarity: 'SR', nextPityCounter: nextPullNum, triggeredPity: false };
  }
  if (r < SUMMON_RATES.SSR + SUMMON_RATES.SR + SUMMON_RATES.R) {
    return { rarity: 'R', nextPityCounter: nextPullNum, triggeredPity: false };
  }
  return { rarity: 'N', nextPityCounter: nextPullNum, triggeredPity: false };
}

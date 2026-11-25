import type { EquipQuality, EquipSlot, EquipmentItem, SubjectId } from '../types/game';

export const EQUIP_SLOT_LABELS: Record<EquipSlot, string> = {
  weapon: '武器',
  head: '頭部',
  body: '身體（護甲）',
  hands: '手部',
  feet: '腳部',
  accessory: '飾品',
};

export const EQUIP_QUALITY_LABELS: Record<EquipQuality, { label: string; colorClass: string; borderClass: string }> = {
  common: { label: '普通', colorClass: 'text-slate-200', borderClass: 'border-slate-500/50' },
  fine: { label: '精良', colorClass: 'text-emerald-300', borderClass: 'border-emerald-400/60' },
  rare: { label: '稀有', colorClass: 'text-sky-300', borderClass: 'border-sky-400/60' },
  epic: { label: '史詩', colorClass: 'text-fuchsia-300', borderClass: 'border-fuchsia-400/60' },
  legendary: { label: '傳說', colorClass: 'text-amber-300', borderClass: 'border-amber-400/70' },
};

export const SET_BONUS_DESCRIPTIONS: Record<string, { name: string; twoPc: string; fourPc: string }> = {
  academy_ink: {
    name: '書院套裝',
    twoPc: '2 件：攻防 +8%',
    fourPc: '4 件：成語與國語題傷害 +20%',
  },
  galaxy_pulse: {
    name: '星艦套裝',
    twoPc: '2 件：攻防 +8%',
    fourPc: '4 件：英語單字與聽力題傷害 +20%',
  },
  kingdom_blueprint: {
    name: '藍圖套裝',
    twoPc: '2 件：攻防 +8%',
    fourPc: '4 件：數學計算與幾何題傷害 +20%',
  },
  cuisine_gourmet: {
    name: '星廚套裝',
    twoPc: '2 件：攻防 +8%',
    fourPc: '4 件：自然科學料理題傷害 +20%',
  },
};

export function createStarterEquipment(): EquipmentItem[] {
  return [
    {
      uid: 'eq_ink_w1',
      templateId: 'tpl_ink_brushsword',
      name: '青雲毛筆劍',
      subject: 'chinese',
      slot: 'weapon',
      quality: 'fine',
      enhanceLevel: 2,
      atkBonus: 18,
      hpBonus: 15,
      defBonus: 4,
      setId: 'academy_ink',
    },
    {
      uid: 'eq_ink_h1',
      templateId: 'tpl_ink_cap',
      name: '書院儒冠',
      subject: 'chinese',
      slot: 'head',
      quality: 'common',
      enhanceLevel: 0,
      atkBonus: 4,
      hpBonus: 32,
      defBonus: 8,
      setId: 'academy_ink',
    },
    {
      uid: 'eq_gal_w1',
      templateId: 'tpl_gal_cannon',
      name: '脈衝星光砲',
      subject: 'english',
      slot: 'weapon',
      quality: 'fine',
      enhanceLevel: 2,
      atkBonus: 19,
      hpBonus: 12,
      defBonus: 4,
      setId: 'galaxy_pulse',
    },
    {
      uid: 'eq_math_w1',
      templateId: 'tpl_math_hammer',
      name: '黃金工程鎚',
      subject: 'math',
      slot: 'weapon',
      quality: 'fine',
      enhanceLevel: 3,
      atkBonus: 20,
      hpBonus: 20,
      defBonus: 6,
      setId: 'kingdom_blueprint',
      knowledgeUnitBonus: { unitName: '因數與倍數', bonusPct: 15 },
    },
    {
      uid: 'eq_math_b1',
      templateId: 'tpl_math_armor',
      name: '藍圖防護衣',
      subject: 'math',
      slot: 'body',
      quality: 'common',
      enhanceLevel: 1,
      atkBonus: 3,
      hpBonus: 45,
      defBonus: 12,
      setId: 'kingdom_blueprint',
    },
    {
      uid: 'eq_sci_w1',
      templateId: 'tpl_sci_knife',
      name: '烈焰主廚刀',
      subject: 'science',
      slot: 'weapon',
      quality: 'fine',
      enhanceLevel: 2,
      atkBonus: 19,
      hpBonus: 18,
      defBonus: 4,
      setId: 'cuisine_gourmet',
    },
  ];
}

export function createKnowledgeWeapon(params: {
  subject: SubjectId;
  weaponName: string;
  unitName: string;
}): EquipmentItem {
  const setMap: Record<SubjectId, string> = {
    chinese: 'academy_ink',
    english: 'galaxy_pulse',
    math: 'kingdom_blueprint',
    science: 'cuisine_gourmet',
  };
  return {
    uid: `kw_${params.subject}_${Date.now()}_${Math.floor(Math.random() * 999)}`,
    templateId: `tpl_kw_${params.weaponName}`,
    name: params.weaponName,
    subject: params.subject,
    slot: 'weapon',
    quality: 'rare',
    enhanceLevel: 0,
    atkBonus: 26,
    hpBonus: 28,
    defBonus: 8,
    setId: setMap[params.subject],
    knowledgeUnitBonus: {
      unitName: params.unitName,
      bonusPct: 15,
    },
  };
}

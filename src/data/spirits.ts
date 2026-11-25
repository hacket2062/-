import type { GuardianSpiritTemplate, SpiritId } from '../types/game';

/** Spec §6: 4 Guardian Spirits shared across all four worlds */
export const GUARDIAN_SPIRITS: GuardianSpiritTemplate[] = [
  {
    id: 'ink_qilin',
    name: '墨麒麟',
    appearance: '水墨紋路麒麟',
    passiveDesc: '答錯時傷害 -20%',
    skillName: '墨甲',
    skillDesc: '抵擋一次答錯懲罰（不扣血、不斷連擊）',
    evolutionNames: ['墨麒麟・幼體', '墨麒麟・少年體', '墨麒麟・成體', '墨麒麟・神獸體'],
    primaryColor: '#eab308',
    accentColor: '#dc2626',
    pairedHeroId: 'ink_swordsman',
    comboSkillName: '墨麟破天斬',
  },
  {
    id: 'star_dragon',
    name: '星核龍',
    appearance: '宇宙星雲小龍',
    passiveDesc: '必殺能量獲得 +10%',
    skillName: '星爆',
    skillDesc: '必殺能量瞬間充滿 100%',
    evolutionNames: ['星核龍・幼體', '星核龍・少年體', '星核龍・成體', '星核龍・神獸體'],
    primaryColor: '#06b6d4',
    accentColor: '#ec4899',
    pairedHeroId: 'gal_blaster',
    comboSkillName: '星核超新星砲',
  },
  {
    id: 'math_griffin',
    name: '數律獅鷲',
    appearance: '齒輪羽翼獅鷲',
    passiveDesc: '建議作答時間 +15%',
    skillName: '時之翼',
    skillDesc: '本題時間暫停並必定獲得 PERFECT 速度評價',
    evolutionNames: ['數律獅鷲・幼體', '數律獅鷲・少年體', '數律獅鷲・成體', '數律獅鷲・神獸體'],
    primaryColor: '#f97316',
    accentColor: '#38bdf8',
    pairedHeroId: 'math_architect',
    comboSkillName: '時空黃金幾何陣',
  },
  {
    id: 'forest_deer',
    name: '森羅鹿靈',
    appearance: '花草鹿角靈鹿',
    passiveDesc: '每答對 3 題自動回復全隊 12% 體力',
    skillName: '萬物生',
    skillDesc: '全隊立即回復 50% 體力',
    evolutionNames: ['森羅鹿靈・幼體', '森羅鹿靈・少年體', '森羅鹿靈・成體', '森羅鹿靈・神獸體'],
    primaryColor: '#10b981',
    accentColor: '#fb923c',
    pairedHeroId: 'sci_flamechef',
    comboSkillName: '森羅元素滿漢席',
  },
];

export function getSpiritTemplate(id: SpiritId): GuardianSpiritTemplate {
  return GUARDIAN_SPIRITS.find((s) => s.id === id) ?? GUARDIAN_SPIRITS[0];
}

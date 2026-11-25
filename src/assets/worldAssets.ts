import type { SubjectId } from '../types/game';

export const GAME_ART = {
  titleBg: '/src/assets/images/title_bg_1795623280492.jpg',
  worlds: {
    chinese: '/src/assets/images/world_ink_1795623282502.jpg',
    english: '/src/assets/images/world_galaxy_1795623282044.jpg',
    math: '/src/assets/images/world_build_1795623284239.jpg',
    science: '/src/assets/images/world_cuisine_1795623285773.jpg',
  } satisfies Record<SubjectId, string>,
} as const;

export const WORLD_THEMES: Record<
  SubjectId,
  {
    id: SubjectId;
    subjectName: string;
    worldName: string;
    worldSubtitle: string;
    genreLabel: string;
    paceLabel: string;
    primaryHex: string;
    accentHex: string;
    secondaryHex: string;
    surfaceBg: string;
    borderClass: string;
    buttonBg: string;
    badgeText: string;
    materialName: string;
    storyIntro: string;
  }
> = {
  chinese: {
    id: 'chinese',
    subjectName: '國語文',
    worldName: '墨靈幻境',
    worldSubtitle: '水墨奇幻冒險 RPG',
    genreLabel: '3 人小隊行動條戰鬥',
    paceLabel: '中速・策略',
    primaryHex: '#eab308',
    accentHex: '#dc2626',
    secondaryHex: '#1e293b',
    surfaceBg: 'from-stone-950 via-zinc-900 to-amber-950/60',
    borderClass: 'border-amber-500/40',
    buttonBg: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
    badgeText: 'text-amber-300',
    materialName: '靈墨玉片',
    storyIntro: '古書世界被「亂碼魔」撕碎，文字四散化作錯字妖與病句怪。率領墨靈小隊重組文字與修辭之力吧！',
  },
  english: {
    id: 'english',
    subjectName: '英語文',
    worldName: '星際機甲戰線',
    worldSubtitle: 'Word Galaxy 飛行射擊',
    genreLabel: '橫向捲軸聽讀射擊',
    paceLabel: '快速・反應',
    primaryHex: '#06b6d4',
    accentHex: '#ec4899',
    secondaryHex: '#4c1d95',
    surfaceBg: 'from-slate-950 via-indigo-950 to-fuchsia-950/50',
    borderClass: 'border-cyan-400/40',
    buttonBg: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
    badgeText: 'text-cyan-300',
    materialName: '星核電路板',
    storyIntro: '「靜默病毒」讓銀河系的語言系統全面當機！駕駛智光機甲鎖定正確單字與語音訊號，擊破病毒艦隊！',
  },
  math: {
    id: 'math',
    subjectName: '數學',
    worldName: '數境建築王國',
    worldSubtitle: '城市建造＋夜間塔防',
    genreLabel: '日建夜守・數線砲台',
    paceLabel: '規劃・經營',
    primaryHex: '#f97316',
    accentHex: '#0ea5e9',
    secondaryHex: '#0f172a',
    surfaceBg: 'from-slate-950 via-sky-950 to-orange-950/50',
    borderClass: 'border-orange-400/40',
    buttonBg: 'bg-orange-500 hover:bg-orange-400 text-slate-950',
    badgeText: 'text-orange-300',
    materialName: '藍圖齒輪',
    storyIntro: '「零之軍團」企圖讓王國所有數字歸零！白天用算術建造農田與高塔，夜晚答題超頻砲台守衛城門！',
  },
  science: {
    id: 'science',
    subjectName: '自然科學',
    worldName: '元素料理大亂鬥',
    worldSubtitle: '科學料理對決＋節奏動作',
    genreLabel: '元素烹調・節奏翻炒',
    paceLabel: '節奏・組合',
    primaryHex: '#fb923c',
    accentHex: '#10b981',
    secondaryHex: '#431407',
    surfaceBg: 'from-stone-950 via-orange-950/70 to-emerald-950/60',
    borderClass: 'border-emerald-400/40',
    buttonBg: 'bg-emerald-400 hover:bg-emerald-300 text-stone-950',
    badgeText: 'text-emerald-300',
    materialName: '元素香料晶',
    storyIntro: '「黑暗饕餮」吞食了自然界的元素平衡！化身為元素主廚，運用科學原理烹調料理擊退饕餮！',
  },
};

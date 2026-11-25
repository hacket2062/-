export type Grade = 3 | 4 | 5 | 6;
export type Semester = 1 | 2;
export type SubjectId = 'chinese' | 'english' | 'math' | 'science';
export type TextbookEdition = 'kanghsuan' | 'nanyi' | 'hanlin';
export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR';
export type EquipQuality = 'common' | 'fine' | 'rare' | 'epic' | 'legendary';
export type EquipSlot = 'weapon' | 'head' | 'body' | 'hands' | 'feet' | 'accessory';
export type DifficultyMode = 'normal' | 'hard' | 'legend';
export type SpeedGrade = 'PERFECT' | 'GREAT' | 'GOOD' | 'SLOW' | 'TIMEOUT';
export type SpiritId = 'ink_qilin' | 'star_dragon' | 'math_griffin' | 'forest_deer';

export type QuestionType =
  | 'single_choice'
  | 'true_false'
  | 'radical_combine'
  | 'spelling'
  | 'listening'
  | 'number_line'
  | 'ordering';

export type ScreenId =
  | 'title'
  | 'onboarding'
  | 'lobby'
  | 'adventure_select'
  | 'world_map'
  | 'battle'
  | 'characters'
  | 'spirit'
  | 'forge'
  | 'summon'
  | 'achievements'
  | 'quests'
  | 'wrong_book'
  | 'compendium'
  | 'titles'
  | 'settings'
  | 'parent_zone';

export type AchievementCategory = 'answer_count' | 'streak_accuracy' | 'subject_exploration';
export type MedalTier = 'bronze' | 'silver' | 'gold' | 'prism';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: MedalTier;
  target: number;
  unitLabel: string;
  /** Optional minimum overall accuracy percentage required (0..100) */
  minAccuracyPct?: number;
  /** Optional subject scope for subject_exploration achievements */
  subjectScope?: SubjectId | 'all_four';
  /** Special title unlocked when this achievement is earned */
  unlockTitleId?: string;
  rewardCoins: number;
  rewardCrystals: number;
  medalMotif: 'quill' | 'flame' | 'crown' | 'compass' | 'star' | 'shield';
}

export interface AchievementEvaluation {
  def: AchievementDef;
  current: number;
  target: number;
  progressPct: number;
  unlocked: boolean;
  accuracyMet: boolean;
}

export interface SubjectChartDatum {
  subject: SubjectId;
  name: string;
  shortName: string;
  color: string;
  exploredStages: number;
  totalStages: number;
  explorationPct: number;
  /** Non-zero slice weight for clean PieChart rendering when all 0 */
  pieValue: number;
  totalAnswered: number;
  correctAnswered: number;
  accuracyPct: number;
  hasAnswers: boolean;
}

export interface Question {
  id: string;
  grade: Grade;
  semester: Semester;
  subject: SubjectId;
  unitId: string;
  knowledgePoint: string;
  type: QuestionType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  zhuyinPrompt?: string;
  speechText?: string;
  speechLang?: 'zh-TW' | 'en-US';
  options?: string[];
  answer: string;
  /** For ordering or radical_combine */
  parts?: string[];
  /** For number_line */
  numberLine?: {
    min: number;
    max: number;
    step: number;
    target: number;
    tolerance: number;
    unitLabel?: string;
  };
  /** Rhetoric/Element tag for elemental advantage */
  elementTag?: 'fire' | 'wind' | 'thunder' | 'water' | 'neutral';
  explanation: string;
  explanationSteps?: string[];
  hint: string;
}

export interface CharacterTemplate {
  id: string;
  name: string;
  subject: SubjectId;
  race: string;
  role: string;
  rarity: Rarity;
  baseAtk: number;
  baseHp: number;
  baseDef: number;
  signatureSkill: string;
  ultimateSkill: string;
  ultimateDesc: string;
  evolutionTitles: [string, string, string, string];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  weaponKind: 'sword' | 'brush' | 'bow' | 'shield' | 'blaster' | 'sniper' | 'drone' | 'hammer' | 'wand' | 'wok' | 'knife' | 'staff';
  earsOrAppendage?: 'none' | 'fox' | 'cat' | 'wings' | 'horns' | 'panda' | 'bunny' | 'mech' | 'beaver' | 'owl' | 'penguin';
  isHiddenFusion?: boolean;
  crossWorldSubject?: SubjectId;
}

export interface OwnedCharacter {
  templateId: string;
  level: number;
  exp: number;
  stars: number; // 1..6
  evolutionStage: 0 | 1 | 2 | 3; // 4 stages
  shards: number;
  rarity: Rarity;
  equippedIds: Partial<Record<EquipSlot, string>>;
}

export interface FusionRecipe {
  id: string;
  materialA: string;
  materialB: string;
  resultId: string;
  coreCost: number;
  isCrossWorld?: boolean;
  clue: string;
}

export interface GuardianSpiritTemplate {
  id: SpiritId;
  name: string;
  appearance: string;
  passiveDesc: string;
  skillName: string;
  skillDesc: string;
  evolutionNames: [string, string, string, string];
  primaryColor: string;
  accentColor: string;
  pairedHeroId: string;
  comboSkillName: string;
}

export interface GuardianSpiritState {
  activeId: SpiritId;
  unlockedIds: SpiritId[];
  level: number;
  bondExp: number;
  evolutionStage: 0 | 1 | 2 | 3;
  talentPoints: {
    attack: number;
    defense: number;
    learning: number;
  };
  pettedToday: boolean;
  lastFedDate: string;
}

export interface EquipmentItem {
  uid: string;
  templateId: string;
  name: string;
  subject: SubjectId;
  slot: EquipSlot;
  quality: EquipQuality;
  enhanceLevel: number; // 0..15, never breaks
  atkBonus: number;
  hpBonus: number;
  defBonus: number;
  setId?: string;
  knowledgeUnitBonus?: {
    unitName: string;
    bonusPct: number;
  };
}

export interface TitleDef {
  id: string;
  name: string;
  category: '學習' | '速度' | '正確' | '毅力' | '收集' | '世界' | '特殊' | '限定';
  conditionDesc: string;
  bonusDesc: string;
  frameStyle: 'gold' | 'ink' | 'neon' | 'rainbow' | 'emerald';
  bonusType: 'atk_pct' | 'speed_relax' | 'ult_gain' | 'crit_pct' | 'wrong_dmg_red' | 'all_pct';
  bonusValue: number;
}

export interface CurriculumUnit {
  id: string;
  grade: Grade;
  semester: Semester;
  subject: SubjectId;
  title: string;
  subtitle: string;
  knowledgePoints: string[];
  bossName: string;
  bossTitle: string;
  knowledgeCardTitle: string;
  knowledgeCardSummary: string;
  knowledgeWeaponName: string;
  comicPanels: Array<{ speaker: string; line: string }>;
  editionOrder: Record<TextbookEdition, number>;
}

export interface WrongQuestionRecord {
  questionId: string;
  question: Question;
  wrongCount: number;
  correctStreak: number; // 2 consecutive correct -> graduate
  graduated: boolean;
  lastWrongAt: number;
  nextReviewAt: number; // 1 / 3 / 7 day spaced repetition
  intervalStage: 0 | 1 | 2;
}

export interface QuestProgress {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  target: number;
  current: number;
  claimed: boolean;
  rewardText: string;
  rewardCoins?: number;
  rewardCrystals?: number;
  rewardFruits?: number;
  rewardTickets?: number;
}

export interface BattleConfig {
  mode: 'story' | 'wrong_revenge' | 'endless_tower' | 'daily_dungeon' | 'semester_boss' | 'cross_subject' | 'random_event';
  subject: SubjectId;
  grade: Grade;
  semester: Semester;
  unitId: string;
  stageNumber: number; // 1..10 for story, floor for tower
  difficulty: DifficultyMode;
  title: string;
  enemyName: string;
  isBoss: boolean;
  eventKind?: string;
}

export interface PlayerSettings {
  edition: TextbookEdition;
  practiceMode: boolean;
  zhuyinEnabled: boolean;
  autoReadAloud: boolean;
  fontScale: 'sm' | 'md' | 'lg';
  colorblindMode: boolean;
  reducedFlash: boolean;
  skipUltimateAnim: boolean;
  soundEnabled: boolean;
  allowHigherGrades: boolean;
  dailyLimitMinutes: number;
  restReminderMinutes: number;
  bedtimeLockEnabled: boolean;
  focusUnitId: string | null;
  parentPin: string;
}

export interface AnswerTelemetry {
  timestamp: number;
  subject: SubjectId;
  knowledgePoint: string;
  correct: boolean;
  elapsedSec: number;
  suggestedSec: number;
  speedGrade: SpeedGrade;
  wasFastGuess: boolean;
}

export interface PlayerProfile {
  nickname: string;
  grade: Grade;
  avatarId: string;
  createdAt: number;
}

export interface Currencies {
  coins: number;
  crystals: number;
  fruits: number;
  tickets: number;
  enhanceStones: number;
  ascendStones: number;
  evoCrystals: number;
  fusionCores: number;
  worldMaterials: Record<SubjectId, number>;
}

import { create } from 'zustand';
import type {
  AnswerTelemetry,
  BattleConfig,
  Currencies,
  DifficultyMode,
  EquipSlot,
  EquipmentItem,
  Grade,
  GuardianSpiritState,
  OwnedCharacter,
  PlayerProfile,
  PlayerSettings,
  QuestProgress,
  Question,
  Rarity,
  ScreenId,
  Semester,
  SpiritId,
  SubjectId,
  WrongQuestionRecord,
} from '../types/game';
import { CHARACTER_TEMPLATES, FUSION_RECIPES, getCharacterTemplate } from '../data/characters';
import { createKnowledgeWeapon, createStarterEquipment } from '../data/equipment';
import { createInitialQuests } from '../data/titlesAndQuests';
import {
  DAILY_SUMMON_CAP,
  getEnhanceCost,
  getExpForNextLevel,
  getMaxLevelForStars,
  getNextEquipQuality,
  resolveCharacterFusion,
  rollSummonRarity,
} from '../game/core/progression';
import {
  recordWrongAnswer,
  recordWrongBookReviewCorrect,
  updateKnowledgeMastery,
} from '../quiz/adaptive';
import {
  ACHIEVEMENT_DEFS,
  evaluateAchievements,
  getNewlyUnlockedAchievementTitles,
} from '../game/core/achievements';
import { clearGameSnapshot, loadGameSnapshot, saveGameSnapshot } from './db';

const todayStr = () => new Date().toISOString().slice(0, 10);

function createStarterCharacters(): OwnedCharacter[] {
  const starters: Array<{ id: string; rarity: Rarity; weaponUid?: string; extraUid?: string }> = [
    { id: 'ink_swordsman', rarity: 'R', weaponUid: 'eq_ink_w1', extraUid: 'eq_ink_h1' },
    { id: 'ink_poet', rarity: 'SR' },
    { id: 'ink_archer', rarity: 'SR' },
    { id: 'ink_assassin', rarity: 'SR' },
    { id: 'gal_blaster', rarity: 'R', weaponUid: 'eq_gal_w1' },
    { id: 'gal_sniper', rarity: 'SR' },
    { id: 'gal_titan', rarity: 'SR' },
    { id: 'math_architect', rarity: 'R', weaponUid: 'eq_math_w1', extraUid: 'eq_math_b1' },
    { id: 'math_turret', rarity: 'SR' },
    { id: 'math_geomancer', rarity: 'SSR' },
    { id: 'sci_flamechef', rarity: 'R', weaponUid: 'eq_sci_w1' },
    { id: 'sci_frostchef', rarity: 'SR' },
    { id: 'sci_healer', rarity: 'N' },
  ];

  return starters.map((s) => {
    const equippedIds: Partial<Record<EquipSlot, string>> = {};
    if (s.weaponUid) equippedIds.weapon = s.weaponUid;
    if (s.extraUid) {
      equippedIds[s.id === 'ink_swordsman' ? 'head' : 'body'] = s.extraUid;
    }
    return {
      templateId: s.id,
      level: 5,
      exp: 0,
      stars: s.rarity === 'SSR' ? 3 : 2,
      evolutionStage: 0,
      shards: 12,
      rarity: s.rarity,
      equippedIds,
    };
  });
}

const DEFAULT_SETTINGS: PlayerSettings = {
  edition: 'kanghsuan',
  practiceMode: false,
  zhuyinEnabled: false,
  autoReadAloud: false,
  fontScale: 'md',
  colorblindMode: false,
  reducedFlash: false,
  skipUltimateAnim: false,
  soundEnabled: true,
  allowHigherGrades: true,
  dailyLimitMinutes: 45,
  restReminderMinutes: 20,
  bedtimeLockEnabled: false,
  focusUnitId: null,
  parentPin: '1234',
};

const DEFAULT_CURRENCIES: Currencies = {
  coins: 1200,
  crystals: 360,
  fruits: 8,
  tickets: 5,
  enhanceStones: 14,
  ascendStones: 6,
  evoCrystals: 4,
  fusionCores: 4,
  worldMaterials: {
    chinese: 6,
    english: 6,
    math: 8,
    science: 6,
  },
};

export interface PersistedSlice {
  profile: PlayerProfile | null;
  onboarded: boolean;
  accountLevel: number;
  accountExp: number;
  selectedGrade: Grade;
  selectedSemester: Semester;
  selectedSubject: SubjectId;
  selectedDifficulty: DifficultyMode;
  currencies: Currencies;
  focusValue: number; // 0..100 (Spec §11: replaces stamina)
  characters: OwnedCharacter[];
  parties: Record<SubjectId, string[]>;
  equipment: EquipmentItem[];
  spirit: GuardianSpiritState;
  stageStars: Record<string, number>; // key: `${unitId}_s${num}` -> 1..3
  towerFloors: Record<SubjectId, number>;
  collectedCards: string[];
  unlockedTitles: string[];
  equippedTitleId: string;
  wrongBook: Record<string, WrongQuestionRecord>;
  knowledgeMastery: Record<string, number>;
  telemetry: AnswerTelemetry[];
  currentCorrectStreak: number;
  bestCorrectStreak: number;
  claimedAchievements: string[];
  quests: QuestProgress[];
  summonPity: number;
  dailySummonsUsed: number;
  dailySummonDate: string;
  dailyEventsUsed: number;
  dailyEventDate: string;
  playSecondsToday: number;
  playDate: string;
  settings: PlayerSettings;
}

export interface GameStore extends PersistedSlice {
  hydrated: boolean;
  screen: ScreenId;
  activeBattle: BattleConfig | null;
  restBannerOpen: boolean;
  lastToast: string | null;

  hydrate: () => Promise<void>;
  setScreen: (screen: ScreenId) => void;
  showToast: (msg: string) => void;
  dismissRestBanner: () => void;
  tickPlaySecond: () => void;

  completeOnboarding: (profile: PlayerProfile, chosenSpirit: SpiritId) => void;
  quickDemoStart: () => void;
  setAdventureSelection: (patch: Partial<{ grade: Grade; semester: Semester; subject: SubjectId; difficulty: DifficultyMode }>) => void;
  startBattle: (config: BattleConfig) => void;
  exitBattle: (returnTo?: ScreenId) => void;

  recordAnswerResult: (params: {
    question: Question;
    correct: boolean;
    elapsedSec: number;
    suggestedSec: number;
    speedGrade: AnswerTelemetry['speedGrade'];
    wasFastGuess: boolean;
    isWrongReview?: boolean;
  }) => void;

  completeBattleRewards: (params: {
    config: BattleConfig;
    cleared: boolean;
    stars: 0 | 1 | 2 | 3;
    correctCount: number;
    totalQuestions: number;
    perfectCount: number;
    unitKnowledgeCard?: { id: string; weaponName: string; unitTitle: string };
  }) => { coins: number; crystals: number; fruits: number; exp: number; droppedWeapon?: EquipmentItem };

  // Character progression
  levelUpCharacter: (templateId: string) => boolean;
  starUpCharacter: (templateId: string) => boolean;
  evolveCharacter: (templateId: string) => boolean;
  fuseCharacters: (idA: string, idB: string) => { ok: boolean; message: string; resultId?: string };
  setPartyMember: (subject: SubjectId, slotIndex: number, templateId: string) => void;

  // Equipment
  equipItemToCharacter: (templateId: string, itemUid: string) => void;
  enhanceEquipment: (itemUid: string) => boolean;
  ascendEquipment: (itemUid: string) => boolean;
  fuseEquipment: (uidA: string, uidB: string) => { ok: boolean; message: string };
  decomposeEquipment: (itemUid: string) => boolean;

  // Spirit
  feedSpirit: () => boolean;
  petSpirit: () => boolean;
  evolveSpirit: () => boolean;
  upgradeSpiritTalent: (branch: 'attack' | 'defense' | 'learning') => boolean;
  switchSpirit: (id: SpiritId) => boolean;
  unlockSpirit: (id: SpiritId) => boolean;

  // Summon
  performSummon: (count: 1 | 5) => {
    ok: boolean;
    message?: string;
    results: Array<{ templateId: string; rarity: Rarity; isNew: boolean; triggeredPity: boolean }>;
  };
  exchangeShardsForCharacter: (templateId: string) => boolean;

  // Quests & Titles & Achievements & Events
  claimQuest: (questId: string) => boolean;
  claimAchievement: (achievementId: string) => boolean;
  equipTitle: (titleId: string) => void;
  consumeDailyEvent: () => boolean;

  // Settings & Parent
  updateSettings: (patch: Partial<PlayerSettings>) => void;
  resetAllData: () => Promise<void>;
}

const initialPersisted = (): PersistedSlice => ({
  profile: null,
  onboarded: false,
  accountLevel: 1,
  accountExp: 0,
  selectedGrade: 5,
  selectedSemester: 1,
  selectedSubject: 'math',
  selectedDifficulty: 'normal',
  currencies: { ...DEFAULT_CURRENCIES, worldMaterials: { ...DEFAULT_CURRENCIES.worldMaterials } },
  focusValue: 100,
  characters: createStarterCharacters(),
  parties: {
    chinese: ['ink_swordsman', 'ink_poet', 'ink_archer'],
    english: ['gal_blaster', 'gal_sniper', 'gal_titan'],
    math: ['math_architect', 'math_turret', 'math_geomancer'],
    science: ['sci_flamechef', 'sci_frostchef', 'sci_healer'],
  },
  equipment: createStarterEquipment(),
  spirit: {
    activeId: 'math_griffin',
    unlockedIds: ['math_griffin'],
    level: 5,
    bondExp: 30,
    evolutionStage: 0,
    talentPoints: { attack: 0, defense: 0, learning: 1 },
    pettedToday: false,
    lastFedDate: '',
  },
  stageStars: {},
  towerFloors: { chinese: 1, english: 1, math: 1, science: 1 },
  collectedCards: [],
  unlockedTitles: ['title_novice_guardian'],
  equippedTitleId: 'title_novice_guardian',
  wrongBook: {},
  knowledgeMastery: {
    因數與倍數: 58,
    擴分約分通分: 46,
    成語典故: 64,
    設問與映襯: 50,
    時間與月份: 60,
    現在進行式: 52,
    水溶液酸鹼: 66,
    植物繁殖: 54,
  },
  telemetry: [],
  currentCorrectStreak: 0,
  bestCorrectStreak: 0,
  claimedAchievements: [],
  quests: createInitialQuests(),
  summonPity: 0,
  dailySummonsUsed: 0,
  dailySummonDate: todayStr(),
  dailyEventsUsed: 0,
  dailyEventDate: todayStr(),
  playSecondsToday: 0,
  playDate: todayStr(),
  settings: { ...DEFAULT_SETTINGS },
});

function extractPersisted(state: GameStore): PersistedSlice {
  return {
    profile: state.profile,
    onboarded: state.onboarded,
    accountLevel: state.accountLevel,
    accountExp: state.accountExp,
    selectedGrade: state.selectedGrade,
    selectedSemester: state.selectedSemester,
    selectedSubject: state.selectedSubject,
    selectedDifficulty: state.selectedDifficulty,
    currencies: state.currencies,
    focusValue: state.focusValue,
    characters: state.characters,
    parties: state.parties,
    equipment: state.equipment,
    spirit: state.spirit,
    stageStars: state.stageStars,
    towerFloors: state.towerFloors,
    collectedCards: state.collectedCards,
    unlockedTitles: state.unlockedTitles,
    equippedTitleId: state.equippedTitleId,
    wrongBook: state.wrongBook,
    knowledgeMastery: state.knowledgeMastery,
    telemetry: state.telemetry.slice(-300),
    currentCorrectStreak: state.currentCorrectStreak,
    bestCorrectStreak: state.bestCorrectStreak,
    claimedAchievements: state.claimedAchievements,
    quests: state.quests,
    summonPity: state.summonPity,
    dailySummonsUsed: state.dailySummonsUsed,
    dailySummonDate: state.dailySummonDate,
    dailyEventsUsed: state.dailyEventsUsed,
    dailyEventDate: state.dailyEventDate,
    playSecondsToday: state.playSecondsToday,
    playDate: state.playDate,
    settings: state.settings,
  };
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(get: () => GameStore) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveGameSnapshot(extractPersisted(get()));
  }, 250);
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialPersisted(),
  hydrated: false,
  screen: 'title',
  activeBattle: null,
  restBannerOpen: false,
  lastToast: null,

  hydrate: async () => {
    const saved = await loadGameSnapshot<Partial<PersistedSlice>>();
    const today = todayStr();
    if (saved && saved.profile) {
      const sameDay = saved.playDate === today;
      set((s) => ({
        ...s,
        ...saved,
        settings: { ...DEFAULT_SETTINGS, ...(saved.settings ?? {}) },
        currencies: {
          ...DEFAULT_CURRENCIES,
          ...(saved.currencies ?? {}),
          worldMaterials: {
            ...DEFAULT_CURRENCIES.worldMaterials,
            ...(saved.currencies?.worldMaterials ?? {}),
          },
        },
        playSecondsToday: sameDay ? (saved.playSecondsToday ?? 0) : 0,
        playDate: today,
        dailySummonsUsed: saved.dailySummonDate === today ? (saved.dailySummonsUsed ?? 0) : 0,
        dailySummonDate: today,
        dailyEventsUsed: saved.dailyEventDate === today ? (saved.dailyEventsUsed ?? 0) : 0,
        dailyEventDate: today,
        currentCorrectStreak: saved.currentCorrectStreak ?? 0,
        bestCorrectStreak: saved.bestCorrectStreak ?? 0,
        claimedAchievements: saved.claimedAchievements ?? [],
        hydrated: true,
      }));
    } else {
      set({ hydrated: true });
    }
  },

  setScreen: (screen) => set({ screen }),

  showToast: (msg) => {
    set({ lastToast: msg });
    setTimeout(() => {
      if (get().lastToast === msg) set({ lastToast: null });
    }, 3200);
  },

  dismissRestBanner: () => set({ restBannerOpen: false }),

  tickPlaySecond: () => {
    const s = get();
    if (!s.onboarded) return;
    const nextSec = s.playSecondsToday + 1;
    const restSec = Math.max(5, s.settings.restReminderMinutes) * 60;
    const triggerRest = nextSec > 0 && nextSec % restSec === 0;
    set({
      playSecondsToday: nextSec,
      restBannerOpen: triggerRest ? true : s.restBannerOpen,
    });
    if (nextSec % 30 === 0) {
      scheduleSave(get);
    }
  },

  completeOnboarding: (profile, chosenSpirit) => {
    set((s) => ({
      profile,
      onboarded: true,
      selectedGrade: profile.grade,
      spirit: {
        ...s.spirit,
        activeId: chosenSpirit,
        unlockedIds: [chosenSpirit],
      },
      settings: {
        ...s.settings,
        // Spec §12: Grade 3 defaults Zhuyin ON
        zhuyinEnabled: profile.grade === 3 ? true : s.settings.zhuyinEnabled,
      },
      screen: 'lobby',
    }));
    scheduleSave(get);
  },

  quickDemoStart: () => {
    const s = get();
    if (!s.onboarded || !s.profile) {
      set({
        profile: {
          nickname: '小光守護者',
          grade: 5,
          avatarId: 'avatar_star',
          createdAt: Date.now(),
        },
        onboarded: true,
        selectedGrade: 5,
        selectedSemester: 1,
        selectedSubject: 'math',
        screen: 'lobby',
      });
      scheduleSave(get);
    } else {
      set({ screen: 'lobby' });
    }
  },

  setAdventureSelection: (patch) => {
    set((s) => ({
      selectedGrade: patch.grade ?? s.selectedGrade,
      selectedSemester: patch.semester ?? s.selectedSemester,
      selectedSubject: patch.subject ?? s.selectedSubject,
      selectedDifficulty: patch.difficulty ?? s.selectedDifficulty,
    }));
    scheduleSave(get);
  },

  startBattle: (config) => {
    set({
      activeBattle: config,
      screen: 'battle',
      selectedGrade: config.grade,
      selectedSemester: config.semester,
      selectedSubject: config.subject,
    });
  },

  exitBattle: (returnTo = 'world_map') => {
    set({ activeBattle: null, screen: returnTo });
  },

  recordAnswerResult: ({
    question,
    correct,
    elapsedSec,
    suggestedSec,
    speedGrade,
    wasFastGuess,
    isWrongReview,
  }) => {
    const now = Date.now();
    set((s) => {
      const prevMastery = s.knowledgeMastery[question.knowledgePoint] ?? 45;
      const nextMastery = updateKnowledgeMastery(
        prevMastery,
        correct,
        speedGrade === 'PERFECT' || speedGrade === 'GREAT'
      );

      const nextWrongBook = { ...s.wrongBook };
      if (!correct) {
        nextWrongBook[question.id] = recordWrongAnswer(nextWrongBook[question.id], question, now);
      } else if (isWrongReview && nextWrongBook[question.id]) {
        nextWrongBook[question.id] = recordWrongBookReviewCorrect(nextWrongBook[question.id], now);
      }

      const nextQuests = s.quests.map((q) => {
        if (q.id === 'd_correct' && correct) {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        if (q.id === 'd_wrong' && isWrongReview && correct) {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        if (q.id === 'w_perfect' && correct && speedGrade === 'PERFECT') {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        return q;
      });

      const nextTelemetry: AnswerTelemetry[] = [
        ...s.telemetry.slice(-299),
        {
          timestamp: now,
          subject: question.subject,
          knowledgePoint: question.knowledgePoint,
          correct,
          elapsedSec,
          suggestedSec,
          speedGrade,
          wasFastGuess,
        },
      ];

      const nextCurrentStreak = correct ? s.currentCorrectStreak + 1 : 0;
      const nextBestStreak = Math.max(s.bestCorrectStreak, nextCurrentStreak);

      // Check title unlocks (legacy + achievement system)
      const titles = new Set(s.unlockedTitles);
      const chineseCorrect = nextTelemetry.filter((t) => t.subject === 'chinese' && t.correct).length;
      if (chineseCorrect >= 15) titles.add('title_idiom_master');
      const mathPerfect = nextTelemetry.filter(
        (t) => t.subject === 'math' && t.correct && t.speedGrade === 'PERFECT'
      ).length;
      if (mathPerfect >= 10) titles.add('title_mult_king');

      const newlyUnlockedAchTitles = getNewlyUnlockedAchievementTitles(
        {
          telemetry: nextTelemetry,
          stageStars: s.stageStars,
          bestCorrectStreak: nextBestStreak,
        },
        Array.from(titles)
      );
      for (const tid of newlyUnlockedAchTitles) {
        titles.add(tid);
      }

      return {
        knowledgeMastery: { ...s.knowledgeMastery, [question.knowledgePoint]: nextMastery },
        wrongBook: nextWrongBook,
        telemetry: nextTelemetry,
        currentCorrectStreak: nextCurrentStreak,
        bestCorrectStreak: nextBestStreak,
        quests: nextQuests,
        unlockedTitles: Array.from(titles),
      };
    });
    scheduleSave(get);
  },

  completeBattleRewards: ({ config, cleared, stars, correctCount, totalQuestions, perfectCount, unitKnowledgeCard }) => {
    const s = get();
    const focusRatio = s.focusValue > 0 ? 1.0 : 0.45; // Spec §11: Focus value diminishes rewards gracefully after daily allowance
    const diffMult = config.difficulty === 'legend' ? 1.5 : config.difficulty === 'hard' ? 1.25 : 1.0;
    const modeMult = config.mode === 'wrong_revenge' ? 2.0 : config.mode === 'daily_dungeon' ? 1.6 : 1.0;

    const coins = cleared
      ? Math.round((90 + correctCount * 18 + stars * 35) * diffMult * modeMult * focusRatio)
      : Math.round(25 + correctCount * 8);
    const crystals = cleared ? Math.round((stars === 3 ? 45 : 15) * focusRatio) : 0;
    const fruits = cleared ? Math.max(1, Math.round((1 + Math.floor(correctCount / 3)) * focusRatio)) : 1;
    const exp = cleared ? Math.round((50 + correctCount * 12) * modeMult * focusRatio) : 15;

    let droppedWeapon: EquipmentItem | undefined;
    const shouldDropKnowledgeWeapon =
      cleared && config.isBoss && unitKnowledgeCard && !s.collectedCards.includes(unitKnowledgeCard.id);
    if (shouldDropKnowledgeWeapon && unitKnowledgeCard) {
      droppedWeapon = createKnowledgeWeapon({
        subject: config.subject,
        weaponName: unitKnowledgeCard.weaponName,
        unitName: unitKnowledgeCard.unitTitle,
      });
    }

    set((state) => {
      const stageKey = `${config.unitId}_s${config.stageNumber}`;
      const prevStars = state.stageStars[stageKey] ?? 0;
      const nextStageStars =
        cleared && config.mode === 'story'
          ? { ...state.stageStars, [stageKey]: Math.max(prevStars, stars) }
          : state.stageStars;

      const nextTower = { ...state.towerFloors };
      if (cleared && config.mode === 'endless_tower') {
        nextTower[config.subject] = Math.max(nextTower[config.subject], config.stageNumber + 1);
      }

      const nextCards =
        cleared && config.isBoss && unitKnowledgeCard && !state.collectedCards.includes(unitKnowledgeCard.id)
          ? [...state.collectedCards, unitKnowledgeCard.id]
          : state.collectedCards;

      // Grant EXP to active party characters
      const activePartyIds = new Set(state.parties[config.subject] ?? []);
      const nextChars = state.characters.map((ch) => {
        if (!activePartyIds.has(ch.templateId)) return ch;
        const maxLvl = getMaxLevelForStars(ch.stars);
        let lvl = ch.level;
        let curExp = ch.exp + exp;
        while (lvl < maxLvl && curExp >= getExpForNextLevel(lvl)) {
          curExp -= getExpForNextLevel(lvl);
          lvl += 1;
        }
        return { ...ch, level: lvl, exp: curExp };
      });

      // Account level
      let accLvl = state.accountLevel;
      let accExp = state.accountExp + exp;
      while (accExp >= 120 + accLvl * 45) {
        accExp -= 120 + accLvl * 45;
        accLvl += 1;
      }

      // Quests update
      const nextQuests = state.quests.map((q) => {
        if (q.id === 'd_stages' && cleared) return { ...q, current: Math.min(q.target, q.current + 1) };
        if (q.id === 'w_chapter' && cleared && config.isBoss) return { ...q, current: Math.min(q.target, q.current + 1) };
        if (q.id === 'w_tower' && cleared && config.mode === 'endless_tower') {
          return { ...q, current: Math.min(q.target, q.current + 1) };
        }
        return q;
      });

      // Titles check
      const titles = new Set(state.unlockedTitles);
      if (cleared && stars === 3 && correctCount === totalQuestions) titles.add('title_zero_error');
      if (perfectCount >= 5) titles.add('title_flash_answer');
      if (cleared && config.mode === 'wrong_revenge') titles.add('title_unyielding');
      if (cleared && config.isBoss && config.subject === 'chinese') titles.add('title_ink_guardian');
      const clearedSubjects = new Set(
        Object.keys(nextStageStars).map((k) => k.split('_')[0])
      );
      if (clearedSubjects.size >= 4) titles.add('title_four_worlds');

      const achExplorationTitles = getNewlyUnlockedAchievementTitles(
        {
          telemetry: state.telemetry,
          stageStars: nextStageStars,
          bestCorrectStreak: state.bestCorrectStreak,
        },
        Array.from(titles)
      );
      for (const tid of achExplorationTitles) {
        titles.add(tid);
      }

      const nextWorldMats = { ...state.currencies.worldMaterials };
      if (cleared) {
        nextWorldMats[config.subject] = (nextWorldMats[config.subject] ?? 0) + (config.isBoss ? 3 : 1);
      }

      return {
        accountLevel: accLvl,
        accountExp: accExp,
        focusValue: Math.max(0, state.focusValue - (cleared ? 8 : 3)),
        stageStars: nextStageStars,
        towerFloors: nextTower,
        collectedCards: nextCards,
        characters: nextChars,
        equipment: droppedWeapon ? [droppedWeapon, ...state.equipment] : state.equipment,
        quests: nextQuests,
        unlockedTitles: Array.from(titles),
        currencies: {
          ...state.currencies,
          coins: state.currencies.coins + coins,
          crystals: state.currencies.crystals + crystals,
          fruits: state.currencies.fruits + fruits,
          enhanceStones: state.currencies.enhanceStones + (cleared ? 1 : 0),
          evoCrystals: state.currencies.evoCrystals + (cleared && config.isBoss ? 1 : 0),
          fusionCores: state.currencies.fusionCores + (cleared && config.mode === 'cross_subject' ? 1 : 0),
          worldMaterials: nextWorldMats,
        },
      };
    });

    scheduleSave(get);
    return { coins, crystals, fruits, exp, droppedWeapon };
  },

  levelUpCharacter: (templateId) => {
    const s = get();
    const ch = s.characters.find((c) => c.templateId === templateId);
    if (!ch) return false;
    const maxLvl = getMaxLevelForStars(ch.stars);
    if (ch.level >= maxLvl) return false;
    const cost = 40 + ch.level * 15;
    if (s.currencies.coins < cost) return false;

    set((state) => ({
      currencies: { ...state.currencies, coins: state.currencies.coins - cost },
      characters: state.characters.map((c) =>
        c.templateId === templateId ? { ...c, level: c.level + 1, exp: 0 } : c
      ),
    }));
    scheduleSave(get);
    return true;
  },

  starUpCharacter: (templateId) => {
    const s = get();
    const ch = s.characters.find((c) => c.templateId === templateId);
    if (!ch || ch.stars >= 6) return false;
    const shardCost = ch.stars * 5;
    const stoneCost = 1;
    const coinCost = ch.stars * 120;
    if (ch.shards < shardCost || s.currencies.ascendStones < stoneCost || s.currencies.coins < coinCost) {
      return false;
    }
    set((state) => ({
      currencies: {
        ...state.currencies,
        coins: state.currencies.coins - coinCost,
        ascendStones: state.currencies.ascendStones - stoneCost,
      },
      characters: state.characters.map((c) =>
        c.templateId === templateId
          ? { ...c, stars: c.stars + 1, shards: c.shards - shardCost }
          : c
      ),
    }));
    scheduleSave(get);
    return true;
  },

  evolveCharacter: (templateId) => {
    const s = get();
    const ch = s.characters.find((c) => c.templateId === templateId);
    if (!ch || ch.evolutionStage >= 3) return false;
    const tpl = getCharacterTemplate(templateId);
    const matCost = 2 + ch.evolutionStage * 2;
    const crystalCost = 1 + ch.evolutionStage;
    if (
      s.currencies.evoCrystals < crystalCost ||
      (s.currencies.worldMaterials[tpl.subject] ?? 0) < matCost
    ) {
      return false;
    }
    set((state) => ({
      currencies: {
        ...state.currencies,
        evoCrystals: state.currencies.evoCrystals - crystalCost,
        worldMaterials: {
          ...state.currencies.worldMaterials,
          [tpl.subject]: state.currencies.worldMaterials[tpl.subject] - matCost,
        },
      },
      characters: state.characters.map((c) =>
        c.templateId === templateId
          ? { ...c, evolutionStage: (c.evolutionStage + 1) as 0 | 1 | 2 | 3 }
          : c
      ),
    }));
    scheduleSave(get);
    return true;
  },

  fuseCharacters: (idA, idB) => {
    const s = get();
    const chA = s.characters.find((c) => c.templateId === idA);
    const chB = s.characters.find((c) => c.templateId === idB);
    if (!chA || !chB) return { ok: false, message: '找不到選擇的角色' };
    const result = resolveCharacterFusion(chA, chB, FUSION_RECIPES);
    if (!result.valid || !result.resultTemplateId || !result.resultRarity) {
      return { ok: false, message: result.reason ?? '無法融合' };
    }
    if (s.currencies.fusionCores < result.coreCost) {
      return { ok: false, message: `需要融合核心 ×${result.coreCost}` };
    }

    const resId = result.resultTemplateId;
    const resRarity = result.resultRarity;
    const resLevel = result.resultLevel ?? Math.max(chA.level, chB.level);

    set((state) => {
      const existing = state.characters.find((c) => c.templateId === resId);
      let nextChars: OwnedCharacter[];
      if (result.kind === 'same_class') {
        nextChars = state.characters.map((c) =>
          c.templateId === resId ? { ...c, rarity: resRarity, level: resLevel } : c
        );
      } else if (existing) {
        nextChars = state.characters.map((c) =>
          c.templateId === resId ? { ...c, shards: c.shards + 15, level: Math.max(c.level, resLevel) } : c
        );
      } else {
        // Spec §5: Equipment on fused materials returns safely to bag (cleared from fused slots if consumed, here we keep base heroes unlocked & add the hidden fusion hero for kid-friendly zero-loss experience!)
        nextChars = [
          ...state.characters,
          {
            templateId: resId,
            level: resLevel,
            exp: 0,
            stars: 3,
            evolutionStage: 1,
            shards: 0,
            rarity: resRarity,
            equippedIds: {},
          },
        ];
      }

      const titles = new Set(state.unlockedTitles);
      if (nextChars.length >= 10) titles.add('title_collector');

      return {
        currencies: {
          ...state.currencies,
          fusionCores: state.currencies.fusionCores - result.coreCost,
        },
        characters: nextChars,
        unlockedTitles: Array.from(titles),
      };
    });

    scheduleSave(get);
    const tpl = getCharacterTemplate(resId);
    return { ok: true, message: `融合成功！獲得「${tpl.name}」(${resRarity})`, resultId: resId };
  },

  setPartyMember: (subject, slotIndex, templateId) => {
    set((state) => {
      const current = [...(state.parties[subject] ?? [])];
      const existingIdx = current.indexOf(templateId);
      if (existingIdx !== -1 && existingIdx !== slotIndex) {
        // swap
        current[existingIdx] = current[slotIndex];
      }
      current[slotIndex] = templateId;
      return {
        parties: { ...state.parties, [subject]: current.filter(Boolean).slice(0, 3) },
      };
    });
    scheduleSave(get);
  },

  equipItemToCharacter: (templateId, itemUid) => {
    const s = get();
    const item = s.equipment.find((e) => e.uid === itemUid);
    if (!item) return;
    set((state) => ({
      characters: state.characters.map((c) => {
        // Unequip from any other hero if currently worn
        const cleaned = { ...c.equippedIds };
        for (const [slot, uid] of Object.entries(cleaned)) {
          if (uid === itemUid) {
            delete cleaned[slot as EquipSlot];
          }
        }
        if (c.templateId === templateId) {
          cleaned[item.slot] = itemUid;
        }
        return { ...c, equippedIds: cleaned };
      }),
    }));
    scheduleSave(get);
  },

  enhanceEquipment: (itemUid) => {
    const s = get();
    const item = s.equipment.find((e) => e.uid === itemUid);
    if (!item) return false;
    const cost = getEnhanceCost(item.enhanceLevel);
    if (!cost.canEnhance) return false;
    if (s.currencies.coins < cost.coins || s.currencies.enhanceStones < cost.stones) return false;

    set((state) => ({
      currencies: {
        ...state.currencies,
        coins: state.currencies.coins - cost.coins,
        enhanceStones: state.currencies.enhanceStones - cost.stones,
      },
      equipment: state.equipment.map((e) =>
        e.uid === itemUid ? { ...e, enhanceLevel: e.enhanceLevel + 1 } : e
      ),
    }));
    scheduleSave(get);
    return true;
  },

  ascendEquipment: (itemUid) => {
    const s = get();
    const item = s.equipment.find((e) => e.uid === itemUid);
    if (!item) return false;
    const nextQ = getNextEquipQuality(item.quality);
    if (!nextQ) return false;
    if (s.currencies.coins < 220 || s.currencies.ascendStones < 2) return false;

    set((state) => ({
      currencies: {
        ...state.currencies,
        coins: state.currencies.coins - 220,
        ascendStones: state.currencies.ascendStones - 2,
      },
      equipment: state.equipment.map((e) =>
        e.uid === itemUid ? { ...e, quality: nextQ } : e
      ),
    }));
    scheduleSave(get);
    return true;
  },

  fuseEquipment: (uidA, uidB) => {
    const s = get();
    if (uidA === uidB) return { ok: false, message: '請選擇兩件不同裝備' };
    const a = s.equipment.find((e) => e.uid === uidA);
    const b = s.equipment.find((e) => e.uid === uidB);
    if (!a || !b) return { ok: false, message: '裝備不存在' };
    if (a.slot !== b.slot || a.quality !== b.quality) {
      return { ok: false, message: '需選擇相同部位與相同品質的兩件裝備' };
    }
    const nextQ = getNextEquipQuality(a.quality);
    if (!nextQ) return { ok: false, message: '已達最高品質傳說' };

    const merged: EquipmentItem = {
      ...a,
      quality: nextQ,
      enhanceLevel: Math.max(a.enhanceLevel, b.enhanceLevel),
      atkBonus: Math.max(a.atkBonus, b.atkBonus) + 4,
      hpBonus: Math.max(a.hpBonus, b.hpBonus) + 8,
    };

    set((state) => ({
      equipment: state.equipment
        .filter((e) => e.uid !== uidB)
        .map((e) => (e.uid === uidA ? merged : e)),
      characters: state.characters.map((c) => {
        const cleaned = { ...c.equippedIds };
        for (const [slot, uid] of Object.entries(cleaned)) {
          if (uid === uidB) delete cleaned[slot as EquipSlot];
        }
        return { ...c, equippedIds: cleaned };
      }),
    }));
    scheduleSave(get);
    return { ok: true, message: `融合成功！${merged.name} 升品並保留最高強化等級 +${merged.enhanceLevel}` };
  },

  decomposeEquipment: (itemUid) => {
    const s = get();
    const item = s.equipment.find((e) => e.uid === itemUid);
    if (!item) return false;
    set((state) => ({
      equipment: state.equipment.filter((e) => e.uid !== itemUid),
      characters: state.characters.map((c) => {
        const cleaned = { ...c.equippedIds };
        for (const [slot, uid] of Object.entries(cleaned)) {
          if (uid === itemUid) delete cleaned[slot as EquipSlot];
        }
        return { ...c, equippedIds: cleaned };
      }),
      currencies: {
        ...state.currencies,
        coins: state.currencies.coins + 80 + item.enhanceLevel * 20,
        enhanceStones: state.currencies.enhanceStones + 2,
      },
    }));
    scheduleSave(get);
    return true;
  },

  feedSpirit: () => {
    const s = get();
    if (s.currencies.fruits < 1) return false;
    set((state) => {
      let nextLevel = state.spirit.level;
      let nextBond = state.spirit.bondExp + 35;
      while (nextBond >= 100) {
        nextBond -= 100;
        nextLevel += 1;
      }
      const nextQuests = state.quests.map((q) =>
        q.id === 'd_feed' ? { ...q, current: Math.min(q.target, q.current + 1) } : q
      );
      return {
        currencies: { ...state.currencies, fruits: state.currencies.fruits - 1 },
        spirit: {
          ...state.spirit,
          level: nextLevel,
          bondExp: nextBond,
          lastFedDate: todayStr(),
        },
        quests: nextQuests,
      };
    });
    scheduleSave(get);
    return true;
  },

  petSpirit: () => {
    set((state) => {
      const bonus = state.spirit.pettedToday ? 5 : 20;
      let nextLevel = state.spirit.level;
      let nextBond = state.spirit.bondExp + bonus;
      while (nextBond >= 100) {
        nextBond -= 100;
        nextLevel += 1;
      }
      return {
        spirit: {
          ...state.spirit,
          level: nextLevel,
          bondExp: nextBond,
          pettedToday: true,
        },
      };
    });
    scheduleSave(get);
    return true;
  },

  evolveSpirit: () => {
    const s = get();
    if (s.spirit.evolutionStage >= 3) return false;
    const reqLevel = (s.spirit.evolutionStage + 1) * 5;
    if (s.spirit.level < reqLevel || s.currencies.evoCrystals < 1) return false;
    set((state) => ({
      currencies: { ...state.currencies, evoCrystals: state.currencies.evoCrystals - 1 },
      spirit: {
        ...state.spirit,
        evolutionStage: (state.spirit.evolutionStage + 1) as 0 | 1 | 2 | 3,
      },
    }));
    scheduleSave(get);
    return true;
  },

  upgradeSpiritTalent: (branch) => {
    const s = get();
    const totalAvailable = Math.floor(s.spirit.level / 5);
    const spent =
      s.spirit.talentPoints.attack +
      s.spirit.talentPoints.defense +
      s.spirit.talentPoints.learning;
    if (spent >= totalAvailable) return false;
    set((state) => ({
      spirit: {
        ...state.spirit,
        talentPoints: {
          ...state.spirit.talentPoints,
          [branch]: state.spirit.talentPoints[branch] + 1,
        },
      },
    }));
    scheduleSave(get);
    return true;
  },

  switchSpirit: (id) => {
    const s = get();
    if (!s.spirit.unlockedIds.includes(id)) return false;
    set((state) => ({ spirit: { ...state.spirit, activeId: id } }));
    scheduleSave(get);
    return true;
  },

  unlockSpirit: (id) => {
    const s = get();
    if (s.spirit.unlockedIds.includes(id)) return true;
    if (s.currencies.crystals < 150) return false;
    set((state) => ({
      currencies: { ...state.currencies, crystals: state.currencies.crystals - 150 },
      spirit: {
        ...state.spirit,
        activeId: id,
        unlockedIds: [...state.spirit.unlockedIds, id],
      },
    }));
    scheduleSave(get);
    return true;
  },

  performSummon: (count) => {
    const s = get();
    const today = todayStr();
    const usedToday = s.dailySummonDate === today ? s.dailySummonsUsed : 0;
    if (usedToday + count > DAILY_SUMMON_CAP) {
      return {
        ok: false,
        message: `今日召喚已達兒童保護上限（${DAILY_SUMMON_CAP} 次），明天再來吧！`,
        results: [],
      };
    }

    // Use tickets first, then crystals (60 crystals per pull)
    const ticketsToUse = Math.min(s.currencies.tickets, count);
    const remainingPulls = count - ticketsToUse;
    const crystalCost = remainingPulls * 60;
    if (s.currencies.crystals < crystalCost) {
      return { ok: false, message: '召喚券或智光晶石不足！透過答題與每日任務即可免費取得。', results: [] };
    }

    const pool = CHARACTER_TEMPLATES.filter((c) => !c.isHiddenFusion);
    let pity = s.summonPity;
    const results: Array<{ templateId: string; rarity: Rarity; isNew: boolean; triggeredPity: boolean }> = [];
    const nextChars = [...s.characters];

    for (let i = 0; i < count; i++) {
      const roll = rollSummonRarity(pity);
      pity = roll.nextPityCounter;
      const byRarity = pool.filter((c) => c.rarity === roll.rarity);
      const chosenPool = byRarity.length > 0 ? byRarity : pool;
      const picked = chosenPool[Math.floor(Math.random() * chosenPool.length)];
      const existingIdx = nextChars.findIndex((c) => c.templateId === picked.id);

      if (existingIdx >= 0) {
        nextChars[existingIdx] = {
          ...nextChars[existingIdx],
          shards: nextChars[existingIdx].shards + (roll.rarity === 'SSR' ? 15 : 8),
        };
        results.push({ templateId: picked.id, rarity: roll.rarity, isNew: false, triggeredPity: roll.triggeredPity });
      } else {
        nextChars.push({
          templateId: picked.id,
          level: 1,
          exp: 0,
          stars: roll.rarity === 'SSR' ? 3 : roll.rarity === 'SR' ? 2 : 1,
          evolutionStage: 0,
          shards: 5,
          rarity: roll.rarity,
          equippedIds: {},
        });
        results.push({ templateId: picked.id, rarity: roll.rarity, isNew: true, triggeredPity: roll.triggeredPity });
      }
    }

    set((state) => {
      const titles = new Set(state.unlockedTitles);
      if (nextChars.length >= 10) titles.add('title_collector');
      return {
        currencies: {
          ...state.currencies,
          tickets: state.currencies.tickets - ticketsToUse,
          crystals: state.currencies.crystals - crystalCost,
        },
        characters: nextChars,
        summonPity: pity,
        dailySummonsUsed: usedToday + count,
        dailySummonDate: today,
        unlockedTitles: Array.from(titles),
      };
    });
    scheduleSave(get);
    return { ok: true, results };
  },

  exchangeShardsForCharacter: (templateId) => {
    const s = get();
    if (s.characters.some((c) => c.templateId === templateId)) return false;
    if (s.currencies.crystals < 180) return false;
    const tpl = getCharacterTemplate(templateId);
    set((state) => ({
      currencies: { ...state.currencies, crystals: state.currencies.crystals - 180 },
      characters: [
        ...state.characters,
        {
          templateId,
          level: 1,
          exp: 0,
          stars: 2,
          evolutionStage: 0,
          shards: 0,
          rarity: tpl.rarity,
          equippedIds: {},
        },
      ],
    }));
    scheduleSave(get);
    return true;
  },

  claimQuest: (questId) => {
    const s = get();
    const q = s.quests.find((item) => item.id === questId);
    if (!q || q.claimed || q.current < q.target) return false;
    set((state) => ({
      quests: state.quests.map((item) => (item.id === questId ? { ...item, claimed: true } : item)),
      currencies: {
        ...state.currencies,
        coins: state.currencies.coins + (q.rewardCoins ?? 0),
        crystals: state.currencies.crystals + (q.rewardCrystals ?? 0),
        fruits: state.currencies.fruits + (q.rewardFruits ?? 0),
        tickets: state.currencies.tickets + (q.rewardTickets ?? 0),
      },
    }));
    scheduleSave(get);
    return true;
  },

  claimAchievement: (achievementId) => {
    const s = get();
    if (s.claimedAchievements.includes(achievementId)) return false;
    const def = ACHIEVEMENT_DEFS.find((a) => a.id === achievementId);
    if (!def) return false;
    const evalRes = evaluateAchievements({
      telemetry: s.telemetry,
      stageStars: s.stageStars,
      bestCorrectStreak: s.bestCorrectStreak,
    });
    const matched = evalRes.list.find((item) => item.def.id === achievementId);
    if (!matched || !matched.unlocked) return false;

    set((state) => {
      const titles = new Set(state.unlockedTitles);
      if (def.unlockTitleId) titles.add(def.unlockTitleId);
      return {
        claimedAchievements: [...state.claimedAchievements, achievementId],
        unlockedTitles: Array.from(titles),
        currencies: {
          ...state.currencies,
          coins: state.currencies.coins + def.rewardCoins,
          crystals: state.currencies.crystals + def.rewardCrystals,
        },
      };
    });
    scheduleSave(get);
    return true;
  },

  equipTitle: (titleId) => {
    const s = get();
    if (!s.unlockedTitles.includes(titleId)) return;
    set({ equippedTitleId: titleId });
    scheduleSave(get);
  },

  consumeDailyEvent: () => {
    const s = get();
    const today = todayStr();
    const used = s.dailyEventDate === today ? s.dailyEventsUsed : 0;
    if (used >= 5) return false;
    set({ dailyEventsUsed: used + 1, dailyEventDate: today });
    scheduleSave(get);
    return true;
  },

  updateSettings: (patch) => {
    set((state) => ({
      settings: { ...state.settings, ...patch },
    }));
    scheduleSave(get);
  },

  resetAllData: async () => {
    await clearGameSnapshot();
    set({
      ...initialPersisted(),
      hydrated: true,
      screen: 'title',
      activeBattle: null,
    });
  },
}));

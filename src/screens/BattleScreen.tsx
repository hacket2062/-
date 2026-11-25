import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Flame,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import type { Question, SpeedGrade } from '../types/game';
import { getCharacterTemplate } from '../data/characters';
import { getCurriculumUnits } from '../data/curriculum';
import { getSpiritTemplate } from '../data/spirits';
import { TITLE_DEFS } from '../data/titlesAndQuests';
import {
  getCrossSubjectQuestions,
  getQuestionsForUnit,
  getQuickChallengeQuestions,
} from '../data/questionBank';
import {
  calculateComboMultiplier,
  calculateFinalDamage,
  calculateStageStars,
  calculateSuggestedTime,
  evaluateAntiGuessing,
  evaluateSpeedGrade,
} from '../game/core/combat';
import { computeCharacterStats } from '../game/core/progression';
import { pickAdaptiveQuestion } from '../quiz/adaptive';
import { BattleCanvas, type BattleVisualEvent } from '../game/worlds/BattleCanvas';
import { QuestionCard } from '../quiz/QuestionCard';
import { UltimateCutIn } from '../components/UltimateCutIn';
import { playSfx } from '../game/fx/battleFx';
import { useGameStore } from '../store/useGameStore';

export const BattleScreen: React.FC = () => {
  const {
    activeBattle,
    characters,
    parties,
    equipment,
    spirit,
    wrongBook,
    knowledgeMastery,
    equippedTitleId,
    settings,
    updateSettings,
    recordAnswerResult,
    completeBattleRewards,
    exitBattle,
  } = useGameStore();

  // Guard if navigated without battle config
  const config = activeBattle ?? {
    mode: 'story' as const,
    subject: 'math' as const,
    grade: 5 as const,
    semester: 1 as const,
    unitId: 'math_g5_s1_u1',
    stageNumber: 1,
    difficulty: 'normal' as const,
    title: '因數與倍數・第 1 關',
    enemyName: '零之先鋒',
    isBoss: false,
  };

  const spiritTpl = getSpiritTemplate(spirit.activeId);
  const equippedTitle = TITLE_DEFS.find((t) => t.id === equippedTitleId);

  // Build active 3-hero party for this world
  const partyTemplates = useMemo(() => {
    const ids = parties[config.subject] ?? [];
    const list = ids.map((id) => getCharacterTemplate(id));
    if (list.length > 0) return list;
    return [getCharacterTemplate('math_architect')];
  }, [parties, config.subject]);

  const partyStats = useMemo(() => {
    const titlePct = equippedTitle?.bonusType === 'all_pct' ? equippedTitle.bonusValue : 0;
    return partyTemplates.map((tpl) => {
      const owned = characters.find((c) => c.templateId === tpl.id) ?? {
        templateId: tpl.id,
        level: 5,
        exp: 0,
        stars: 2,
        evolutionStage: 0 as const,
        shards: 0,
        rarity: tpl.rarity,
        equippedIds: {},
      };
      const eqs = Object.values(owned.equippedIds)
        .map((uid) => equipment.find((e) => e.uid === uid))
        .filter((x): x is NonNullable<typeof x> => Boolean(x));
      return computeCharacterStats(tpl, owned, eqs, titlePct);
    });
  }, [partyTemplates, characters, equipment, equippedTitle]);

  const totalPartyMaxHp = useMemo(
    () => Math.max(240, partyStats.reduce((sum, st) => sum + st.hp, 0)),
    [partyStats]
  );

  // Build Question Pool based on Battle Mode
  const questionPool = useMemo<Question[]>(() => {
    if (config.mode === 'wrong_revenge') {
      const wrongs = Object.values(wrongBook)
        .filter((r) => !r.graduated)
        .map((r) => r.question);
      if (wrongs.length > 0) return wrongs;
    }
    if (config.mode === 'cross_subject') {
      return getCrossSubjectQuestions(config.grade, config.semester);
    }
    return getQuestionsForUnit({
      grade: config.grade,
      semester: config.semester,
      subject: config.subject,
      unitId: config.unitId,
    });
  }, [config, wrongBook]);

  const targetEnemyMaxHp = useMemo(() => {
    const diffScale = config.difficulty === 'legend' ? 1.55 : config.difficulty === 'hard' ? 1.25 : 1.0;
    const bossScale = config.isBoss ? 1.6 : 1.0;
    const baseAtk = partyStats[0]?.atk ?? 60;
    // Balanced so ~5-6 normal answers or ~8 Boss answers defeat the foe cleanly
    return Math.round(baseAtk * (config.isBoss ? 7.2 : 4.4) * diffScale * bossScale);
  }, [config, partyStats]);

  const enemyDef = useMemo(
    () => Math.round((config.isBoss ? 22 : 12) + config.stageNumber * 1.8),
    [config]
  );

  // Core battle state
  const [heroHp, setHeroHp] = useState(totalPartyMaxHp);
  const [enemyHp, setEnemyHp] = useState(targetEnemyMaxHp);
  const [enemyShield, setEnemyShield] = useState(config.isBoss ? 1 : 0);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [ultEnergy, setUltEnergy] = useState(30);
  const [combo, setCombo] = useState(0);
  const [luminaBurstUntil, setLuminaBurstUntil] = useState(0);
  const [recentFastWrongs, setRecentFastWrongs] = useState(0);
  const [panicked, setPanicked] = useState(false);
  const [consecutiveWrongs, setConsecutiveWrongs] = useState(0);
  const [spiritSkillUsed, setSpiritSkillUsed] = useState(false);
  const [inkShieldReady, setInkShieldReady] = useState(false);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const [correctSinceHeal, setCorrectSinceHeal] = useState(0);

  // World-specific gameplay state
  const [mathPhase, setMathPhase] = useState<'day' | 'night'>(config.subject === 'math' ? 'day' : 'night');
  const [mathTowerLevel, setMathTowerLevel] = useState(1);
  const [cuisineHeat, setCuisineHeat] = useState(40);
  const [rhythmPos, setRhythmPos] = useState(0); // 0..100 oscillating bar for Elemental Cuisine
  const [rhythmBonusReady, setRhythmBonusReady] = useState(false);

  // Question lifecycle
  const askedIdsRef = useRef<Set<string>>(new Set());
  const [currentPick, setCurrentPick] = useState(() =>
    pickAdaptiveQuestion({
      pool: questionPool,
      askedIds: new Set(),
      masteryMap: knowledgeMastery,
      consecutiveWrongs: 0,
    })
  );
  const [elapsedSec, setElapsedSec] = useState(0);
  const [feedback, setFeedback] = useState<null | {
    correct: boolean;
    partial?: boolean;
    studentAnswer: string;
    speedGrade: SpeedGrade;
    damage: number;
    explanation: string;
    explanationSteps?: string[];
  }>(null);

  const [paused, setPaused] = useState(false);
  const [ultModalOpen, setUltModalOpen] = useState(false);
  const [visualEvent, setVisualEvent] = useState<BattleVisualEvent | null>(null);
  const seqRef = useRef(0);

  // End-of-battle stats snapshot
  const [stats, setStats] = useState({ total: 0, correct: 0, perfectOrGreat: 0, perfect: 0 });
  const [outcome, setOutcome] = useState<null | {
    cleared: boolean;
    stars: 0 | 1 | 2 | 3;
    rewards: { coins: number; crystals: number; fruits: number; exp: number; droppedWeaponName?: string };
  }>(null);

  const currentQuestion = currentPick.question;
  const activeHero = partyTemplates[activeHeroIdx] ?? partyTemplates[0];
  const activeStats = partyStats[activeHeroIdx] ?? partyStats[0];

  const suggestedSec = useMemo(() => {
    const optLen = (currentQuestion.options ?? currentQuestion.parts ?? []).join('').length;
    return calculateSuggestedTime({
      questionType: currentQuestion.type,
      promptLength: currentQuestion.prompt.length,
      optionsTotalLength: optLen,
      grade: config.grade,
      zhuyinOrAudioEnabled: settings.zhuyinEnabled || settings.autoReadAloud,
      spiritTimeBonusPct:
        (spirit.activeId === 'math_griffin' ? 15 : 0) + spirit.talentPoints.learning * 4,
      titleSpeedRelaxPct: equippedTitle?.bonusType === 'speed_relax' ? equippedTitle.bonusValue : 0,
    });
  }, [currentQuestion, config.grade, settings.zhuyinEnabled, settings.autoReadAloud, spirit, equippedTitle]);

  // Mirror game state to document.body.dataset.state
  useEffect(() => {
    if (outcome) document.body.dataset.state = 'gameover';
    else if (paused) document.body.dataset.state = 'paused';
    else document.body.dataset.state = 'playing';
  }, [paused, outcome]);

  // Pause via Escape or P
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (outcome || ultModalOpen) return;
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [outcome, ultModalOpen]);

  // Question timer + Cuisine rhythm cursor
  useEffect(() => {
    if (paused || feedback || outcome || ultModalOpen) return;
    const id = setInterval(() => {
      if (!timeFrozen) {
        setElapsedSec((prev) => Math.round((prev + 0.1) * 10) / 10);
      }
      if (config.subject === 'science') {
        setRhythmPos((prev) => (prev + 6) % 100);
      }
    }, 100);
    return () => clearInterval(id);
  }, [paused, feedback, outcome, ultModalOpen, timeFrozen, config.subject]);

  // Timeout check (never triggers in Practice Mode or Time Frozen)
  useEffect(() => {
    if (paused || feedback || outcome || ultModalOpen || settings.practiceMode || timeFrozen) return;
    if (elapsedSec > suggestedSec * 1.8) {
      handleAnswerSubmit('(超時未作答)', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSec, suggestedSec, settings.practiceMode, timeFrozen, paused, feedback, outcome, ultModalOpen]);

  const finishBattle = useCallback(
    (cleared: boolean, finalStats: { total: number; correct: number; perfectOrGreat: number; perfect: number }) => {
      const stars = calculateStageStars({
        cleared,
        totalQuestions: Math.max(1, finalStats.total),
        correctCount: finalStats.correct,
        perfectOrGreatCount: finalStats.perfectOrGreat,
      });

      const units = getCurriculumUnits(config.grade, config.semester, config.subject, settings.edition);
      const unitObj = units.find((u) => u.id === config.unitId);

      const rewards = completeBattleRewards({
        config,
        cleared,
        stars,
        correctCount: finalStats.correct,
        totalQuestions: Math.max(1, finalStats.total),
        perfectCount: finalStats.perfect,
        unitKnowledgeCard:
          config.isBoss && unitObj
            ? { id: unitObj.id, weaponName: unitObj.knowledgeWeaponName, unitTitle: unitObj.title }
            : undefined,
      });

      playSfx(cleared ? 'victory' : 'wrong', settings.soundEnabled);
      setOutcome({
        cleared,
        stars,
        rewards: {
          coins: rewards.coins,
          crystals: rewards.crystals,
          fruits: rewards.fruits,
          exp: rewards.exp,
          droppedWeaponName: rewards.droppedWeapon?.name,
        },
      });
    },
    [config, settings.edition, settings.soundEnabled, completeBattleRewards]
  );

  const loadNextQuestion = useCallback(
    (nextConsecutiveWrongs: number) => {
      askedIdsRef.current.add(currentQuestion.id);
      const next = pickAdaptiveQuestion({
        pool: questionPool,
        askedIds: askedIdsRef.current,
        masteryMap: knowledgeMastery,
        consecutiveWrongs: nextConsecutiveWrongs,
      });
      setCurrentPick(next);
      setElapsedSec(0);
      setTimeFrozen(false);
      setFeedback(null);
      setRhythmBonusReady(false);
      // In Chinese Ink RPG, cycle 3-hero ATB turn automatically
      if (config.subject === 'chinese' && partyTemplates.length > 1) {
        setActiveHeroIdx((i) => (i + 1) % partyTemplates.length);
      }
    },
    [currentQuestion.id, questionPool, knowledgeMastery, config.subject, partyTemplates.length]
  );

  const handleAnswerSubmit = useCallback(
    (studentAnswer: string, accuracyCoef: 0 | 0.5 | 1.0) => {
      if (feedback || outcome) return;

      const isCorrect = accuracyCoef === 1.0;
      const isPartial = accuracyCoef === 0.5;
      const speedRes = evaluateSpeedGrade({
        elapsedSec,
        suggestedSec,
        practiceMode: settings.practiceMode,
        timeFrozen,
        panicked,
      });
      const antiGuess = evaluateAntiGuessing({
        isCorrect: isCorrect || isPartial,
        elapsedSec,
        recentFastWrongs,
      });

      setRecentFastWrongs(antiGuess.newFastWrongs);
      setPanicked(antiGuess.triggeredPanic);

      // Telemetry & Wrong Book
      recordAnswerResult({
        question: currentQuestion,
        correct: isCorrect,
        elapsedSec,
        suggestedSec,
        speedGrade: isCorrect || isPartial ? speedRes.grade : elapsedSec > suggestedSec * 1.8 ? 'TIMEOUT' : speedRes.grade,
        wasFastGuess: antiGuess.wasFastGuess,
        isWrongReview: config.mode === 'wrong_revenge',
      });

      const nextStats = {
        total: stats.total + 1,
        correct: stats.correct + (isCorrect ? 1 : 0),
        perfectOrGreat:
          stats.perfectOrGreat +
          (isCorrect && (speedRes.grade === 'PERFECT' || speedRes.grade === 'GREAT') ? 1 : 0),
        perfect: stats.perfect + (isCorrect && speedRes.grade === 'PERFECT' ? 1 : 0),
      };
      setStats(nextStats);

      if (isCorrect || isPartial) {
        const nextCombo = isCorrect ? combo + 1 : combo;
        setCombo(nextCombo);
        setConsecutiveWrongs(0);
        const comboRes = calculateComboMultiplier(nextCombo);
        if (comboRes.triggersBurst) {
          setLuminaBurstUntil(Date.now() + 5000);
        }

        // World-specific mechanic bonuses
        let worldSkillMult = 1.0;
        if (config.subject === 'math') {
          if (mathPhase === 'day') {
            setMathTowerLevel((lv) => Math.min(4, lv + 1));
            setMathPhase('night');
            worldSkillMult = 1.15;
          } else {
            worldSkillMult = 1 + mathTowerLevel * 0.1;
          }
        } else if (config.subject === 'science') {
          const heatGain = rhythmBonusReady ? 30 : 15;
          const nextHeat = Math.min(100, cuisineHeat + heatGain);
          setCuisineHeat(nextHeat);
          worldSkillMult = rhythmBonusReady ? 1.3 : 1.05;
        }

        // Crit check
        const critChance = 0.14 + spirit.talentPoints.attack * 0.04 + (equippedTitle?.bonusType === 'crit_pct' ? 0.03 : 0);
        const isCrit = Math.random() < critChance;
        const elemMult = currentQuestion.elementTag && currentQuestion.elementTag !== 'neutral' ? 1.15 : 1.0;

        let dmg = calculateFinalDamage({
          atk: activeStats.atk + spirit.talentPoints.attack * 5,
          skillMultiplier: worldSkillMult,
          accuracyCoef,
          speedCoef: speedRes.coef,
          comboCoef: comboRes.coef,
          elementMultiplier: elemMult,
          isCrit,
          enemyDef,
          luminaBurstActive: Date.now() < luminaBurstUntil,
        });

        // Boss shield absorption/shatter
        if (enemyShield > 0 && isCorrect) {
          setEnemyShield((sh) => Math.max(0, sh - 1));
          dmg = Math.round(dmg * 0.85);
        }

        const nextEnemyHp = Math.max(0, enemyHp - dmg);
        setEnemyHp(nextEnemyHp);

        // Ultimate energy gain (Spec §4 & §6 Star Dragon +10%)
        const baseUltGain = (isCorrect ? 20 : 5) + speedRes.bonusUltEnergy;
        const spiritUltMult = spirit.activeId === 'star_dragon' ? 1.1 : 1.0;
        setUltEnergy((u) => Math.min(100, u + Math.round(baseUltGain * spiritUltMult)));

        // Forest Deer passive: heal every 3 correct answers
        if (isCorrect && spirit.activeId === 'forest_deer') {
          const nextCount = correctSinceHeal + 1;
          if (nextCount >= 3) {
            setCorrectSinceHeal(0);
            setHeroHp((hp) => Math.min(totalPartyMaxHp, hp + Math.round(totalPartyMaxHp * 0.12)));
          } else {
            setCorrectSinceHeal(nextCount);
          }
        }

        playSfx(speedRes.grade === 'PERFECT' ? 'perfect' : 'correct', settings.soundEnabled);
        seqRef.current += 1;
        setVisualEvent({
          seq: seqRef.current,
          kind: 'hero_attack',
          damageText: isCrit ? `暴擊 -${dmg}!` : `-${dmg}`,
          subText: speedRes.grade,
          heavy: isCrit || speedRes.grade === 'PERFECT',
          color: speedRes.grade === 'PERFECT' ? '#facc15' : isCrit ? '#f87171' : '#38bdf8',
        });

        setFeedback({
          correct: isCorrect,
          partial: isPartial,
          studentAnswer,
          speedGrade: speedRes.grade,
          damage: dmg,
          explanation: currentQuestion.explanation,
          explanationSteps: currentQuestion.explanationSteps,
        });

        if (nextEnemyHp <= 0) {
          setTimeout(() => finishBattle(true, nextStats), 650);
        }
      } else {
        // Wrong answer! Check Ink Qilin active shield first
        if (inkShieldReady) {
          setInkShieldReady(false);
          playSfx('heal', settings.soundEnabled);
          seqRef.current += 1;
          setVisualEvent({
            seq: seqRef.current,
            kind: 'shield_block',
            damageText: '墨甲格擋！',
            subText: '連擊保留',
          });
          setFeedback({
            correct: false,
            studentAnswer,
            speedGrade: speedRes.grade,
            damage: 0,
            explanation: currentQuestion.explanation,
            explanationSteps: currentQuestion.explanationSteps,
          });
          return;
        }

        setCombo(0);
        setConsecutiveWrongs((w) => w + 1);
        const baseCounter = Math.round(totalPartyMaxHp * (config.isBoss ? 0.18 : 0.14));
        const qilinRed = spirit.activeId === 'ink_qilin' ? 0.8 : 1.0;
        const talentRed = Math.max(0.65, 1 - spirit.talentPoints.defense * 0.05);
        const enemyDmg = Math.max(12, Math.round(baseCounter * qilinRed * talentRed));
        const nextHeroHp = Math.max(0, heroHp - enemyDmg);
        setHeroHp(nextHeroHp);

        playSfx('wrong', settings.soundEnabled);
        seqRef.current += 1;
        setVisualEvent({
          seq: seqRef.current,
          kind: 'enemy_attack',
          damageText: `-${enemyDmg}`,
          subText: config.subject === 'math' ? '砲塔過熱' : '敵方反擊',
        });

        setFeedback({
          correct: false,
          studentAnswer,
          speedGrade: speedRes.grade,
          damage: 0,
          explanation: currentQuestion.explanation,
          explanationSteps: currentQuestion.explanationSteps,
        });

        if (nextHeroHp <= 0) {
          setTimeout(() => finishBattle(false, nextStats), 650);
        }
      }
    },
    [
      feedback,
      outcome,
      elapsedSec,
      suggestedSec,
      settings.practiceMode,
      settings.soundEnabled,
      timeFrozen,
      panicked,
      recentFastWrongs,
      recordAnswerResult,
      currentQuestion,
      config,
      stats,
      combo,
      mathPhase,
      mathTowerLevel,
      rhythmBonusReady,
      cuisineHeat,
      spirit,
      equippedTitle,
      activeStats.atk,
      enemyDef,
      luminaBurstUntil,
      enemyShield,
      enemyHp,
      correctSinceHeal,
      totalPartyMaxHp,
      inkShieldReady,
      heroHp,
      finishBattle,
    ]
  );

  const handleActivateSpiritSkill = () => {
    if (spiritSkillUsed || outcome) return;
    setSpiritSkillUsed(true);
    playSfx('heal', settings.soundEnabled);
    seqRef.current += 1;

    if (spirit.activeId === 'ink_qilin') {
      setInkShieldReady(true);
      setVisualEvent({ seq: seqRef.current, kind: 'shield_block', damageText: '墨甲護體', subText: '抵擋下次答錯' });
    } else if (spirit.activeId === 'star_dragon') {
      setUltEnergy(100);
      setVisualEvent({ seq: seqRef.current, kind: 'heal', damageText: '星爆充能 100%', subText: '必殺就緒' });
    } else if (spirit.activeId === 'math_griffin') {
      setTimeFrozen(true);
      setVisualEvent({ seq: seqRef.current, kind: 'shield_block', damageText: '時之翼發動', subText: '本題時間暫停' });
    } else {
      const healAmt = Math.round(totalPartyMaxHp * 0.5);
      setHeroHp((hp) => Math.min(totalPartyMaxHp, hp + healAmt));
      setVisualEvent({ seq: seqRef.current, kind: 'heal', damageText: `+${healAmt} HP`, subText: '萬物生回復' });
    }
  };

  const handleUltimateFinish = (res: { correctCount: number; multiplier: number; isPerfectUltimate: boolean }) => {
    setUltModalOpen(false);
    setUltEnergy(0);
    const dmg = calculateFinalDamage({
      atk: activeStats.atk * 1.6,
      skillMultiplier: res.multiplier,
      accuracyCoef: 1.0,
      speedCoef: 1.3,
      comboCoef: Math.max(1.2, calculateComboMultiplier(combo).coef),
      elementMultiplier: 1.2,
      isCrit: res.isPerfectUltimate,
      enemyDef,
    });
    const nextEnemyHp = Math.max(0, enemyHp - dmg);
    setEnemyHp(nextEnemyHp);
    setEnemyShield(0);
    seqRef.current += 1;
    setVisualEvent({
      seq: seqRef.current,
      kind: 'hero_ultimate',
      damageText: `必殺 -${dmg}!`,
      subText: res.isPerfectUltimate ? 'PERFECT ULTIMATE' : `×${res.multiplier.toFixed(1)}`,
      heavy: true,
      color: '#facc15',
    });
    if (nextEnemyHp <= 0) {
      setTimeout(() => finishBattle(true, stats), 700);
    }
  };

  const handleCuisineRhythmTap = () => {
    const inGoldenZone = rhythmPos >= 36 && rhythmPos <= 64;
    if (inGoldenZone) {
      playSfx('perfect', settings.soundEnabled);
      setRhythmBonusReady(true);
      setCuisineHeat((h) => Math.min(100, h + 12));
    } else {
      playSfx('click', settings.soundEnabled);
    }
  };

  const isComboSpiritHero = activeHero.id === spiritTpl.pairedHeroId && spirit.level >= 5;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-5 flex flex-col">
      <div className="max-w-5xl w-full mx-auto space-y-3.5 flex-1 flex flex-col">
        {/* Compact World-Matched Battle HUD Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 px-4 py-2.5">
          <div className="min-w-0">
            <div className="text-xs font-bold text-amber-300 truncate">{config.title}</div>
            <div className="flex items-center gap-3 text-xs text-slate-300 font-mono-num mt-0.5">
              <span>我方 HP {heroHp}/{totalPartyMaxHp}</span>
              <span aria-hidden="true">·</span>
              <span className="text-rose-300">敵方 HP {enemyHp}/{targetEnemyMaxHp}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-300 font-black">連擊 {combo}</span>
            </div>
          </div>

          {/* Utility icon buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              tabIndex={-1}
              aria-label="切換音效"
              onClick={(e) => {
                e.currentTarget.blur();
                updateSettings({ soundEnabled: !settings.soundEnabled });
              }}
              className="h-10 w-10 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-sky-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="暫停戰鬥"
              onClick={(e) => {
                e.currentTarget.blur();
                setPaused(true);
              }}
              className="h-10 w-10 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
            >
              <Pause className="w-4 h-4 text-slate-200" />
            </button>
          </div>
        </div>

        {/* 60 FPS Multi-World Battle Stage Canvas */}
        <BattleCanvas
          subject={config.subject}
          party={partyTemplates}
          activePartyIndex={activeHeroIdx}
          enemyName={config.enemyName}
          enemyHpRatio={enemyHp / Math.max(1, targetEnemyMaxHp)}
          isBoss={config.isBoss}
          enemyShieldActive={enemyShield > 0}
          heroHpRatio={heroHp / Math.max(1, totalPartyMaxHp)}
          panicked={panicked}
          luminaBurst={Date.now() < luminaBurstUntil}
          mathPhase={mathPhase}
          mathTowerLevel={mathTowerLevel}
          cuisineHeat={cuisineHeat}
          galaxyTargets={config.subject === 'english' ? currentQuestion.options ?? [] : []}
          visualEvent={visualEvent}
          paused={paused || ultModalOpen}
          onGalaxyShootOption={(idx) => {
            if (!feedback && currentQuestion.options && currentQuestion.options[idx]) {
              const opt = currentQuestion.options[idx];
              handleAnswerSubmit(opt, opt === currentQuestion.answer ? 1.0 : 0);
            }
          }}
        />

        {/* World-Specific Interactive Action Bar + Guardian Spirit & Ultimate Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Left: World-specific bar (Hero switcher / Math Day-Night / Cuisine Rhythm) */}
          <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            {config.subject === 'chinese' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-300">墨靈小隊切換：</span>
                {partyTemplates.map((hero, idx) => (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => setActiveHeroIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      idx === activeHeroIdx
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {hero.name}
                  </button>
                ))}
              </div>
            )}

            {config.subject === 'math' && (
              <div className="flex items-center justify-between w-full gap-3 text-xs">
                <span className="font-bold text-orange-300">
                  {mathPhase === 'day'
                    ? '☀ 白天建造階段：答對即升級數境砲塔！'
                    : `🌙 夜晚塔防守城：砲塔 Lv.${mathTowerLevel}（答越快射速越快）`}
                </span>
                <button
                  type="button"
                  onClick={() => setMathPhase((p) => (p === 'day' ? 'night' : 'day'))}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 font-bold text-sky-300 cursor-pointer shrink-0"
                >
                  切換日／夜
                </button>
              </div>
            )}

            {config.subject === 'science' && (
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-emerald-300">
                      節奏料理段：{rhythmBonusReady ? '火力加乘就緒 (+30%)' : '在金色區間按下翻炒！'}
                    </span>
                  </div>
                  <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div className="absolute inset-y-0 left-[36%] right-[36%] bg-amber-400/45" />
                    <div
                      className="absolute top-0 bottom-0 w-2.5 rounded-full bg-white shadow"
                      style={{ left: `calc(${rhythmPos}% - 5px)` }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCuisineRhythmTap}
                  className="min-h-[40px] rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs px-4 py-2 cursor-pointer shrink-0"
                >
                  <Flame className="w-3.5 h-3.5 inline mr-1" />
                  節奏翻炒
                </button>
              </div>
            )}

            {config.subject === 'english' && (
              <div className="flex items-center justify-between w-full text-xs text-cyan-200 font-bold">
                <span>機甲操作：W / S 或 ↑ / ↓ 上下閃避・直接點擊飛彈目標或按 1-4 射擊！</span>
              </div>
            )}
          </div>

          {/* Right: Guardian Spirit Skill & 100% Ultimate Launch */}
          <div className="md:col-span-5 flex items-center gap-2.5">
            <button
              type="button"
              disabled={spiritSkillUsed || Boolean(outcome)}
              onClick={handleActivateSpiritSkill}
              className="flex-1 min-h-[48px] rounded-xl border border-emerald-400/50 bg-emerald-950/50 hover:bg-emerald-900/60 disabled:opacity-40 px-3 py-2 text-xs font-bold text-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {spiritSkillUsed ? '守護技已施放' : `${spiritTpl.skillName}（精靈技）`}
              </span>
            </button>

            <button
              type="button"
              disabled={ultEnergy < 100 || Boolean(outcome)}
              onClick={() => setUltModalOpen(true)}
              className={`flex-1 min-h-[48px] rounded-xl px-3 py-2 text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                ultEnergy >= 100
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.5)]'
                  : 'border border-slate-700 bg-slate-900 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span className="font-mono-num">
                {ultEnergy >= 100
                  ? isComboSpiritHero
                    ? `合體必殺！`
                    : `發動必殺技！`
                  : `必殺 ${ultEnergy}%`}
              </span>
            </button>
          </div>
        </div>

        {/* Interactive Question Card */}
        <QuestionCard
          question={currentQuestion}
          elapsedSec={elapsedSec}
          suggestedSec={suggestedSec}
          practiceMode={settings.practiceMode}
          timeFrozen={timeFrozen}
          zhuyinEnabled={settings.zhuyinEnabled}
          autoReadAloud={settings.autoReadAloud}
          forceShowHint={currentPick.autoShowHint}
          spiritName={spiritTpl.name}
          feedback={feedback}
          onSubmitAnswer={handleAnswerSubmit}
          onNextAfterFeedback={() => {
            if (enemyHp <= 0 || heroHp <= 0) return;
            loadNextQuestion(consecutiveWrongs);
          }}
        />
      </div>

      {/* Ultimate 3-Question Challenge + Cut-In */}
      {ultModalOpen && (
        <UltimateCutIn
          hero={activeHero}
          comboSkillLabel={isComboSpiritHero ? `${spiritTpl.comboSkillName}（合體技）` : undefined}
          questions={getQuickChallengeQuestions(config.subject, config.grade, config.semester)}
          skipAnim={settings.skipUltimateAnim}
          soundEnabled={settings.soundEnabled}
          onComplete={handleUltimateFinish}
        />
      )}

      {/* Pause Modal */}
      {paused && !outcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 space-y-4 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-white">戰鬥暫停</h2>
            <p className="text-sm text-slate-400">休息一下，準備好隨時繼續答題！</p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPaused(false)}
                className="w-full min-h-[48px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                繼續戰鬥
              </button>
              <button
                type="button"
                onClick={() => {
                  setHeroHp(totalPartyMaxHp);
                  setEnemyHp(targetEnemyMaxHp);
                  setCombo(0);
                  setStats({ total: 0, correct: 0, perfectOrGreat: 0, perfect: 0 });
                  setFeedback(null);
                  setElapsedSec(0);
                  setPaused(false);
                }}
                className="w-full min-h-[48px] rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                重新挑戰本關
              </button>
              <button
                type="button"
                onClick={() => exitBattle('world_map')}
                className="w-full min-h-[48px] rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-sm cursor-pointer"
              >
                返回世界地圖
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory / Defeat Modal */}
      {outcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4">
          <div className="w-full max-w-md rounded-3xl border-2 border-amber-400/70 bg-slate-900 p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <h2 className="text-3xl font-black text-white">
              {outcome.cleared ? '淨化成功・關卡勝利！' : '差一點點・再接再厲！'}
            </h2>

            {outcome.cleared && (
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={`w-10 h-10 ${
                      outcome.stars >= n ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3">
                <div className="text-xs text-slate-400">正確率</div>
                <div className="text-xl font-black font-mono-num text-emerald-300 mt-0.5">
                  {Math.round((stats.correct / Math.max(1, stats.total)) * 100)}%
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3">
                <div className="text-xs text-slate-400">極速評價</div>
                <div className="text-xl font-black font-mono-num text-amber-300 mt-0.5">
                  {stats.perfectOrGreat}/{stats.total}
                </div>
              </div>
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3">
                <div className="text-xs text-slate-400">獲得金幣</div>
                <div className="text-xl font-black font-mono-num text-sky-300 mt-0.5">
                  +{outcome.rewards.coins}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 text-xs text-slate-200 space-y-1">
              <div>
                獲得獎勵：經驗值 +{outcome.rewards.exp} · 智光晶石 +{outcome.rewards.crystals} · 知識果實 +{outcome.rewards.fruits}
              </div>
              {outcome.rewards.droppedWeaponName && (
                <div className="text-amber-300 font-black pt-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  單元 Boss 掉落專屬知識武器「{outcome.rewards.droppedWeaponName}」與知識卡！
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => exitBattle('world_map')}
                className="flex-1 min-h-[50px] rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
              >
                返回地圖
              </button>
              <button
                type="button"
                data-start="true"
                onClick={() => {
                  setOutcome(null);
                  setHeroHp(totalPartyMaxHp);
                  setEnemyHp(targetEnemyMaxHp);
                  setEnemyShield(config.isBoss ? 1 : 0);
                  setCombo(0);
                  setUltEnergy(30);
                  setSpiritSkillUsed(false);
                  setStats({ total: 0, correct: 0, perfectOrGreat: 0, perfect: 0 });
                  setFeedback(null);
                  setElapsedSec(0);
                }}
                className="flex-1 min-h-[50px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm cursor-pointer"
              >
                {outcome.cleared ? '再玩一次' : '重新挑戰'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpCircle,
  Check,
  Flame,
  Shield,
  Sparkles,
  Star,
  Swords,
  Users,
  Wand2,
} from 'lucide-react';
import type { SubjectId } from '../types/game';
import { WORLD_THEMES } from '../assets/worldAssets';
import { CHARACTER_TEMPLATES, FUSION_RECIPES, getCharacterTemplate } from '../data/characters';
import { computeCharacterStats, getMaxLevelForStars, resolveCharacterFusion } from '../game/core/progression';
import { CharacterPortraitSvg } from '../components/CharacterAvatarSvg';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

const SUBJECTS: SubjectId[] = ['chinese', 'english', 'math', 'science'];

const RARITY_STYLES: Record<string, string> = {
  N: 'text-slate-300 border-slate-600/70 bg-slate-800/80',
  R: 'text-sky-300 border-sky-500/60 bg-sky-950/60',
  SR: 'text-fuchsia-300 border-fuchsia-500/60 bg-fuchsia-950/60',
  SSR: 'text-amber-300 border-amber-400/70 bg-amber-950/60',
  UR: 'text-rose-200 border-rose-400/80 bg-gradient-to-r from-amber-500/30 to-rose-500/30',
};

export const CharactersScreen: React.FC = () => {
  const {
    characters,
    parties,
    equipment,
    currencies,
    selectedSubject,
    settings,
    setScreen,
    setPartyMember,
    levelUpCharacter,
    starUpCharacter,
    evolveCharacter,
    fuseCharacters,
    showToast,
  } = useGameStore();

  const [tab, setTab] = useState<'roster' | 'fusion'>('roster');
  const [filterSubject, setFilterSubject] = useState<SubjectId>(selectedSubject);
  const [selectedCharId, setSelectedCharId] = useState<string>(
    parties[selectedSubject]?.[0] ?? characters[0]?.templateId ?? 'ink_swordsman'
  );
  const [activeSlotToAssign, setActiveSlotToAssign] = useState<number | null>(null);

  // Fusion Lab state
  const [fuseA, setFuseA] = useState<string>(characters[0]?.templateId ?? '');
  const [fuseB, setFuseB] = useState<string>(characters[1]?.templateId ?? '');

  const ownedInSubject = useMemo(() => {
    return characters.filter((owned) => {
      const tpl = getCharacterTemplate(owned.templateId);
      return tpl.subject === filterSubject || tpl.crossWorldSubject === filterSubject;
    });
  }, [characters, filterSubject]);

  const currentOwned = useMemo(
    () => characters.find((c) => c.templateId === selectedCharId) ?? ownedInSubject[0] ?? characters[0],
    [characters, ownedInSubject, selectedCharId]
  );

  const currentTpl = currentOwned ? getCharacterTemplate(currentOwned.templateId) : CHARACTER_TEMPLATES[0];
  const currentEquipped = useMemo(() => {
    if (!currentOwned) return [];
    const ids = new Set(Object.values(currentOwned.equippedIds).filter(Boolean));
    return equipment.filter((e) => ids.has(e.uid));
  }, [currentOwned, equipment]);

  const currentStats = useMemo(
    () => (currentOwned ? computeCharacterStats(currentTpl, currentOwned, currentEquipped) : { atk: 0, hp: 0, def: 0, power: 0 }),
    [currentTpl, currentOwned, currentEquipped]
  );

  const currentParty = parties[filterSubject] ?? [];

  const fusionPreview = useMemo(() => {
    const a = characters.find((c) => c.templateId === fuseA);
    const b = characters.find((c) => c.templateId === fuseB);
    if (!a || !b) return null;
    return resolveCharacterFusion(a, b, FUSION_RECIPES);
  }, [characters, fuseA, fuseB]);

  const handleLevelUp = () => {
    if (!currentOwned) return;
    if (levelUpCharacter(currentOwned.templateId)) {
      playSfx('heal', settings.soundEnabled);
      showToast(`${currentTpl.name} 升至 Lv.${currentOwned.level + 1}！`);
    } else {
      showToast('金幣不足或已達當前星級上限（請先升星）');
    }
  };

  const handleStarUp = () => {
    if (!currentOwned) return;
    if (starUpCharacter(currentOwned.templateId)) {
      playSfx('ultimate', settings.soundEnabled);
      showToast(`${currentTpl.name} 升星成功！等級上限提高至 ${getMaxLevelForStars(currentOwned.stars + 1)}`);
    } else {
      showToast(`需要角色碎片 ×${currentOwned.stars * 5}、升階石 ×1、金幣 ×${currentOwned.stars * 120}`);
    }
  };

  const handleEvolve = () => {
    if (!currentOwned) return;
    if (evolveCharacter(currentOwned.templateId)) {
      playSfx('victory', settings.soundEnabled);
      const nextStageTitle = currentTpl.evolutionTitles[Math.min(3, currentOwned.evolutionStage + 1)];
      showToast(`${currentTpl.name} 進化為「${nextStageTitle}」形態！`);
    } else {
      const matCost = 2 + currentOwned.evolutionStage * 2;
      const crystalCost = 1 + currentOwned.evolutionStage;
      showToast(`需要進化結晶 ×${crystalCost} 與${WORLD_THEMES[currentTpl.subject].subjectName}世界材料 ×${matCost}`);
    }
  };

  const handleFuse = () => {
    const res = fuseCharacters(fuseA, fuseB);
    if (res.ok) {
      playSfx('victory', settings.soundEnabled);
      showToast(res.message);
      if (res.resultId) {
        setSelectedCharId(res.resultId);
      }
    } else {
      showToast(res.message);
    }
  };

  const maxLvl = currentOwned ? getMaxLevelForStars(currentOwned.stars) : 20;
  const lvlCost = currentOwned ? 40 + currentOwned.level * 15 : 0;
  const shardCost = currentOwned ? currentOwned.stars * 5 : 0;
  const evoCrystalCost = currentOwned ? 1 + currentOwned.evolutionStage : 1;
  const evoMatCost = currentOwned ? 2 + currentOwned.evolutionStage * 2 : 2;

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScreen('lobby')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-sm font-bold min-h-[48px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              返回主城
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-amber-300">角色隊伍與融合工坊</h1>
              <p className="text-xs text-slate-400">已收集 {characters.length} / {CHARACTER_TEMPLATES.length} 位英雄</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono">
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-amber-300">
              金幣 {currencies.coins}
            </span>
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-sky-300">
              進化結晶 {currencies.evoCrystals}
            </span>
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-fuchsia-300">
              融合核心 {currencies.fusionCores}
            </span>
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-emerald-300">
              升階石 {currencies.ascendStones}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              type="button"
              onClick={() => setTab('roster')}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold min-h-[48px] transition cursor-pointer ${
                tab === 'roster' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              隊伍編成與培育
            </button>
            <button
              type="button"
              onClick={() => setTab('fusion')}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold min-h-[48px] transition cursor-pointer ${
                tab === 'fusion' ? 'bg-fuchsia-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              角色融合研究所
            </button>
          </div>

          {tab === 'roster' && (
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((subj) => {
                const theme = WORLD_THEMES[subj];
                const active = filterSubject === subj;
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => {
                      setFilterSubject(subj);
                      setActiveSlotToAssign(null);
                      const firstInWorld = characters.find((c) => {
                        const t = getCharacterTemplate(c.templateId);
                        return t.subject === subj || t.crossWorldSubject === subj;
                      });
                      if (firstInWorld) setSelectedCharId(firstInWorld.templateId);
                    }}
                    className={`rounded-xl px-4 py-2.5 text-sm font-bold min-h-[48px] border transition cursor-pointer ${
                      active
                        ? 'bg-slate-800 border-amber-400 text-amber-300'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {theme.subjectName}・{theme.worldName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {tab === 'roster' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Party Slots + Character List */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Active 3-Hero Party Bar */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {WORLD_THEMES[filterSubject].worldName} 出戰三人小隊
                    </h2>
                    <p className="text-xs text-slate-400">
                      {activeSlotToAssign !== null
                        ? `請點選下方角色以替換第 ${activeSlotToAssign + 1} 號位`
                        : '點選隊伍欄位可切換該位置出戰角色'}
                    </p>
                  </div>
                  <span className="text-xs text-amber-300 font-mono">
                    材料庫存：{currencies.worldMaterials[filterSubject] ?? 0}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((slotIdx) => {
                    const memberId = currentParty[slotIdx];
                    const owned = characters.find((c) => c.templateId === memberId);
                    const tpl = owned ? getCharacterTemplate(owned.templateId) : null;
                    const selecting = activeSlotToAssign === slotIdx;
                    return (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={() => setActiveSlotToAssign(selecting ? null : slotIdx)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition cursor-pointer min-h-[116px] ${
                          selecting
                            ? 'border-amber-400 bg-amber-500/15'
                            : 'border-slate-700/80 bg-slate-950/70 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-[11px] font-bold text-slate-400">
                          {slotIdx === 0 ? '隊長位 (主攻)' : `支援位 ${slotIdx + 1}`}
                        </span>
                        {tpl && owned ? (
                          <>
                            <CharacterPortraitSvg character={tpl} size={52} />
                            <div className="text-center">
                              <div className="text-sm font-bold text-white truncate max-w-[110px]">{tpl.name}</div>
                              <div className="text-[11px] text-amber-300 font-mono">Lv.{owned.level} · {owned.stars}★</div>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-slate-500 my-auto">點擊指派</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Owned Heroes Grid */}
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <h2 className="text-sm font-bold text-slate-300 mb-3">
                  可於此世界出戰的英雄（{ownedInSubject.length} 位）
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ownedInSubject.map((owned) => {
                    const tpl = getCharacterTemplate(owned.templateId);
                    const inParty = currentParty.includes(owned.templateId);
                    const selected = currentOwned?.templateId === owned.templateId;
                    return (
                      <button
                        key={owned.templateId}
                        type="button"
                        onClick={() => {
                          if (activeSlotToAssign !== null) {
                            setPartyMember(filterSubject, activeSlotToAssign, owned.templateId);
                            playSfx('click', settings.soundEnabled);
                            showToast(`已指派「${tpl.name}」至第 ${activeSlotToAssign + 1} 號位`);
                            setActiveSlotToAssign(null);
                          }
                          setSelectedCharId(owned.templateId);
                        }}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition cursor-pointer min-h-[82px] ${
                          selected
                            ? 'border-amber-400 bg-slate-800/95'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                        }`}
                      >
                        <CharacterPortraitSvg character={tpl} size={52} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-bold text-white truncate">{tpl.name}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${RARITY_STYLES[owned.rarity]}`}>
                              {owned.rarity}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{tpl.role}</div>
                          <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                            <span className="text-amber-300">Lv.{owned.level}</span>
                            {inParty && (
                              <span className="inline-flex items-center gap-0.5 text-emerald-400 font-sans font-bold">
                                <Check className="w-3 h-3" /> 出戰中
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Column: Selected Hero Detail & Upgrades */}
            <div className="lg:col-span-5">
              {currentOwned && (
                <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col gap-5 sticky top-24">
                  <div className="flex items-start gap-4">
                    <CharacterPortraitSvg character={currentTpl} size={88} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black px-2 py-0.5 rounded border ${RARITY_STYLES[currentOwned.rarity]}`}>
                          {currentOwned.rarity}
                        </span>
                        <span className="text-xs text-amber-300 font-bold">
                          {currentTpl.evolutionTitles[currentOwned.evolutionStage]}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white mt-1">{currentTpl.name}</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {currentTpl.race} · {currentTpl.role}
                        {currentTpl.crossWorldSubject && ' · 雙世界通用'}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-4 h-4 ${
                              idx < currentOwned.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs font-mono text-slate-300">
                          Lv.{currentOwned.level} / {maxLvl}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-2 rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-center">
                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Swords className="w-3 h-3 text-rose-400" /> 攻擊
                      </div>
                      <div className="text-base font-black font-mono text-white mt-0.5">{currentStats.atk}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-emerald-400" /> 體力
                      </div>
                      <div className="text-base font-black font-mono text-white mt-0.5">{currentStats.hp}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3 text-sky-400" /> 防禦
                      </div>
                      <div className="text-base font-black font-mono text-white mt-0.5">{currentStats.def}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-amber-300">總戰力</div>
                      <div className="text-base font-black font-mono text-amber-300 mt-0.5">{currentStats.power}</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">招牌技能</span>
                      <span className="font-bold text-sky-300">{currentTpl.signatureSkill}</span>
                    </div>
                    <div className="border-t border-slate-800 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-xs">必殺技（100%能量觸發）</span>
                        <span className="font-bold text-amber-300">{currentTpl.ultimateSkill}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{currentTpl.ultimateDesc}</p>
                    </div>
                  </div>

                  {/* Evolution Track */}
                  <div className="space-y-1.5">
                    <div className="text-xs text-slate-400 font-bold">四階段外觀進化</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {currentTpl.evolutionTitles.map((title, idx) => {
                        const reached = idx <= currentOwned.evolutionStage;
                        return (
                          <div
                            key={title}
                            className={`rounded-lg py-1.5 text-center text-xs font-bold border ${
                              reached
                                ? 'bg-amber-500/20 border-amber-400/70 text-amber-200'
                                : 'bg-slate-950/60 border-slate-800 text-slate-500'
                            }`}
                          >
                            {title}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      type="button"
                      onClick={handleLevelUp}
                      disabled={currentOwned.level >= maxLvl}
                      className="flex items-center justify-between rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-4 py-3 min-h-[52px] transition cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ArrowUpCircle className="w-5 h-5" />
                        角色升級（Lv.{currentOwned.level} → {Math.min(maxLvl, currentOwned.level + 1)}）
                      </span>
                      <span className="text-xs font-mono">
                        {currentOwned.level >= maxLvl ? '需升星' : `${lvlCost} 金幣`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStarUp}
                      disabled={currentOwned.stars >= 6}
                      className="flex items-center justify-between rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-4 py-3 min-h-[52px] transition cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        升星突破（碎片 {currentOwned.shards}/{shardCost}）
                      </span>
                      <span className="text-xs font-mono">
                        {currentOwned.stars >= 6 ? '已滿星' : `升階石×1・${currentOwned.stars * 120}幣`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleEvolve}
                      disabled={currentOwned.evolutionStage >= 3}
                      className="flex items-center justify-between rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-4 py-3 min-h-[52px] transition cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        階段進化（{currentOwned.evolutionStage + 1}/4）
                      </span>
                      <span className="text-xs font-mono">
                        {currentOwned.evolutionStage >= 3
                          ? '已最終形態'
                          : `結晶×${evoCrystalCost}・材料×${evoMatCost}`}
                      </span>
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        ) : (
          /* Fusion Lab Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5">
              <div>
                <h2 className="text-lg font-black text-fuchsia-300">角色融合儀式台</h2>
                <p className="text-sm text-slate-400 mt-1">
                  選擇兩位英雄進行「隱藏配方融合」或選擇同一位英雄進階升品（兒童友善設計：原角色與裝備不會消失！）。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 space-y-2">
                  <label className="text-xs font-bold text-slate-400 block">材料角色 A</label>
                  <select
                    value={fuseA}
                    onChange={(e) => setFuseA(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm text-white min-h-[48px]"
                  >
                    {characters.map((c) => {
                      const t = getCharacterTemplate(c.templateId);
                      return (
                        <option key={c.templateId} value={c.templateId}>
                          [{c.rarity}] {t.name} (Lv.{c.level})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 space-y-2">
                  <label className="text-xs font-bold text-slate-400 block">材料角色 B</label>
                  <select
                    value={fuseB}
                    onChange={(e) => setFuseB(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-3 text-sm text-white min-h-[48px]"
                  >
                    {characters.map((c) => {
                      const t = getCharacterTemplate(c.templateId);
                      return (
                        <option key={c.templateId} value={c.templateId}>
                          [{c.rarity}] {t.name} (Lv.{c.level})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/20 p-4">
                {fusionPreview?.valid && fusionPreview.resultTemplateId ? (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CharacterPortraitSvg character={getCharacterTemplate(fusionPreview.resultTemplateId)} size={64} />
                      <div>
                        <div className="text-xs text-fuchsia-300 font-bold">
                          {fusionPreview.kind === 'recipe' ? '隱藏配方共振成功！' : '同職業品質突破！'}
                        </div>
                        <div className="text-lg font-black text-white">
                          {getCharacterTemplate(fusionPreview.resultTemplateId).name} ({fusionPreview.resultRarity})
                        </div>
                        <div className="text-xs text-slate-300">
                          消耗融合核心 ×{fusionPreview.coreCost}（目前擁有 {currencies.fusionCores}）
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleFuse}
                      className="rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black px-6 py-3 min-h-[52px] cursor-pointer"
                    >
                      立即融合
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300">
                    {fusionPreview?.reason ?? '請選擇兩位角色以預覽融合結果。'}
                  </p>
                )}
              </div>
            </section>

            {/* Secret Recipe Clues */}
            <section className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <h2 className="text-base font-black text-amber-300">隱藏融合配方線索</h2>
              <p className="text-xs text-slate-400">點選配方可快速帶入兩位對應英雄（需先擁有該角色）。</p>
              <div className="space-y-3">
                {FUSION_RECIPES.map((recipe) => {
                  const resTpl = getCharacterTemplate(recipe.resultId);
                  const hasA = characters.some((c) => c.templateId === recipe.materialA);
                  const hasB = characters.some((c) => c.templateId === recipe.materialB);
                  const unlocked = characters.some((c) => c.templateId === recipe.resultId);
                  return (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => {
                        if (hasA && hasB) {
                          setFuseA(recipe.materialA);
                          setFuseB(recipe.materialB);
                        } else {
                          showToast('尚未集齊配方所需角色，可至召喚神殿獲得！');
                        }
                      }}
                      className="w-full text-left rounded-xl border border-slate-700/80 bg-slate-950/70 hover:border-amber-400/60 p-3.5 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm">
                          {unlocked ? resTpl.name : '？？？隱藏英雄'}
                        </span>
                        <span className="text-xs font-mono text-fuchsia-300">核心 ×{recipe.coreCost}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{recipe.clue}</p>
                      <div className="text-[11px] mt-2 flex items-center gap-3 text-slate-400">
                        <span className={hasA ? 'text-emerald-400' : 'text-slate-500'}>
                          {hasA ? '✓' : '○'} {getCharacterTemplate(recipe.materialA).name}
                        </span>
                        <span>+</span>
                        <span className={hasB ? 'text-emerald-400' : 'text-slate-500'}>
                          {hasB ? '✓' : '○'} {getCharacterTemplate(recipe.materialB).name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

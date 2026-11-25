import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Check,
  Hammer,
  Layers,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { EquipSlot } from '../types/game';
import {
  EQUIP_QUALITY_LABELS,
  EQUIP_SLOT_LABELS,
  SET_BONUS_DESCRIPTIONS,
} from '../data/equipment';
import { getCharacterTemplate } from '../data/characters';
import { getEnhanceCost, getNextEquipQuality } from '../game/core/progression';
import { CharacterPortraitSvg } from '../components/CharacterAvatarSvg';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

const ALL_SLOTS: EquipSlot[] = ['weapon', 'head', 'body', 'hands', 'feet', 'accessory'];

export const ForgeScreen: React.FC = () => {
  const {
    characters,
    equipment,
    currencies,
    settings,
    setScreen,
    equipItemToCharacter,
    enhanceEquipment,
    ascendEquipment,
    fuseEquipment,
    decomposeEquipment,
    showToast,
  } = useGameStore();

  const [selectedHeroId, setSelectedHeroId] = useState<string>(characters[0]?.templateId ?? 'ink_swordsman');
  const [selectedItemUid, setSelectedItemUid] = useState<string>(equipment[0]?.uid ?? '');
  const [fusePartnerUid, setFusePartnerUid] = useState<string>('');
  const [confirmDecompose, setConfirmDecompose] = useState(false);

  const selectedHero = useMemo(
    () => characters.find((c) => c.templateId === selectedHeroId) ?? characters[0],
    [characters, selectedHeroId]
  );
  const selectedItem = useMemo(
    () => equipment.find((e) => e.uid === selectedItemUid) ?? equipment[0],
    [equipment, selectedItemUid]
  );

  const heroSetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!selectedHero) return counts;
    for (const uid of Object.values(selectedHero.equippedIds)) {
      const it = equipment.find((e) => e.uid === uid);
      if (it?.setId) counts[it.setId] = (counts[it.setId] ?? 0) + 1;
    }
    return counts;
  }, [selectedHero, equipment]);

  const fuseCandidates = useMemo(() => {
    if (!selectedItem) return [];
    return equipment.filter(
      (e) => e.uid !== selectedItem.uid && e.slot === selectedItem.slot && e.quality === selectedItem.quality
    );
  }, [equipment, selectedItem]);

  const enhanceInfo = selectedItem ? getEnhanceCost(selectedItem.enhanceLevel) : null;
  const nextQuality = selectedItem ? getNextEquipQuality(selectedItem.quality) : null;

  const ownerOfItem = (uid: string) => {
    const owner = characters.find((c) => Object.values(c.equippedIds).includes(uid));
    return owner ? getCharacterTemplate(owner.templateId).name : null;
  };

  const handleEnhance = () => {
    if (!selectedItem) return;
    if (enhanceEquipment(selectedItem.uid)) {
      playSfx('heal', settings.soundEnabled);
      const nextLv = selectedItem.enhanceLevel + 1;
      showToast(
        nextLv >= 10
          ? `強化成功！${selectedItem.name} +${nextLv} 散發金色光效！`
          : `強化成功！${selectedItem.name} +${nextLv}（100% 不爆裝）`
      );
    } else {
      showToast('金幣或強化石不足，或已達滿級 +15');
    }
  };

  const handleAscend = () => {
    if (!selectedItem || !nextQuality) return;
    if (ascendEquipment(selectedItem.uid)) {
      playSfx('victory', settings.soundEnabled);
      showToast(`升階成功！${selectedItem.name} 晉升為「${EQUIP_QUALITY_LABELS[nextQuality].label}」並保留 +${selectedItem.enhanceLevel}`);
    } else {
      showToast('需要 220 金幣與 2 顆升階石');
    }
  };

  const handleFuse = () => {
    if (!selectedItem || !fusePartnerUid) return;
    const res = fuseEquipment(selectedItem.uid, fusePartnerUid);
    if (res.ok) {
      playSfx('victory', settings.soundEnabled);
      setFusePartnerUid('');
    }
    showToast(res.message);
  };

  const handleDecompose = () => {
    if (!selectedItem) return;
    if (!confirmDecompose) {
      setConfirmDecompose(true);
      return;
    }
    const name = selectedItem.name;
    if (decomposeEquipment(selectedItem.uid)) {
      playSfx('click', settings.soundEnabled);
      showToast(`已分解「${name}」，回收金幣與強化石 ×2`);
      setConfirmDecompose(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
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
              <h1 className="text-lg sm:text-xl font-black text-orange-300">智光鍛造屋</h1>
              <p className="text-xs text-slate-400">強化 +0→+15 永不爆裝・+10 發光・單元知識武器</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono">
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-amber-300">
              金幣 {currencies.coins}
            </span>
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-orange-300">
              強化石 {currencies.enhanceStones}
            </span>
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-emerald-300">
              升階石 {currencies.ascendStones}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Hero 6-Slot Loadout */}
        <section className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-black text-white">角色六格裝備欄</h2>
            <select
              value={selectedHeroId}
              onChange={(e) => setSelectedHeroId(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white min-h-[44px]"
            >
              {characters.map((c) => (
                <option key={c.templateId} value={c.templateId}>
                  {getCharacterTemplate(c.templateId).name} (Lv.{c.level})
                </option>
              ))}
            </select>
          </div>

          {selectedHero && (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-slate-950/70 border border-slate-800 p-3">
                <CharacterPortraitSvg character={getCharacterTemplate(selectedHero.templateId)} size={56} />
                <div>
                  <div className="font-bold text-white">{getCharacterTemplate(selectedHero.templateId).name}</div>
                  <div className="text-xs text-slate-400">點選右側裝備即可為此角色穿戴</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {ALL_SLOTS.map((slot) => {
                  const uid = selectedHero.equippedIds[slot];
                  const item = equipment.find((e) => e.uid === uid);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => item && setSelectedItemUid(item.uid)}
                      className={`rounded-xl border p-3 text-left min-h-[76px] transition cursor-pointer ${
                        item
                          ? `${EQUIP_QUALITY_LABELS[item.quality].borderClass} bg-slate-950/80`
                          : 'border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      <div className="text-[11px] text-slate-400">{EQUIP_SLOT_LABELS[slot]}</div>
                      {item ? (
                        <>
                          <div className={`text-xs font-bold truncate mt-1 ${EQUIP_QUALITY_LABELS[item.quality].colorClass}`}>
                            {item.name}
                          </div>
                          <div className="text-[11px] font-mono text-amber-300 mt-0.5">
                            +{item.enhanceLevel} {item.enhanceLevel >= 10 ? '✦發光' : ''}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-600 mt-1">未裝備</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Set Bonuses */}
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 space-y-1.5">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> 套裝效果檢視
                </div>
                {Object.entries(heroSetCounts).length === 0 ? (
                  <p className="text-xs text-slate-500">穿戴 2 件或 4 件同系列裝備即可觸發套裝加成。</p>
                ) : (
                  Object.entries(heroSetCounts).map(([setId, count]) => {
                    const desc = SET_BONUS_DESCRIPTIONS[setId];
                    if (!desc) return null;
                    return (
                      <div key={setId} className="text-xs text-slate-300">
                        <span className="font-bold text-white">{desc.name}</span>（{count}/4）
                        <div className={count >= 2 ? 'text-emerald-300' : 'text-slate-500'}>{desc.twoPc}</div>
                        <div className={count >= 4 ? 'text-amber-300' : 'text-slate-500'}>{desc.fourPc}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>

        {/* Center: Equipment Bag */}
        <section className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">裝備背包（{equipment.length} 件）</h2>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {equipment.map((item) => {
              const qMeta = EQUIP_QUALITY_LABELS[item.quality];
              const selected = selectedItem?.uid === item.uid;
              const owner = ownerOfItem(item.uid);
              return (
                <button
                  key={item.uid}
                  type="button"
                  onClick={() => {
                    setSelectedItemUid(item.uid);
                    setFusePartnerUid('');
                    setConfirmDecompose(false);
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition cursor-pointer ${
                    selected
                      ? 'border-amber-400 bg-slate-800'
                      : `${qMeta.borderClass} bg-slate-950/70 hover:bg-slate-900`
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-bold text-sm ${qMeta.colorClass}`}>
                      {item.name}
                      {item.enhanceLevel > 0 && <span className="ml-1 font-mono text-amber-300">+{item.enhanceLevel}</span>}
                    </span>
                    <span className="text-[11px] text-slate-400">{EQUIP_SLOT_LABELS[item.slot]}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1.5 text-slate-400">
                    <span>
                      攻+{item.atkBonus} 體+{item.hpBonus} 防+{item.defBonus}
                    </span>
                    {owner && <span className="text-emerald-400 font-bold">{owner} 穿戴中</span>}
                  </div>
                  {item.knowledgeUnitBonus && (
                    <div className="text-[11px] text-amber-300 mt-1">
                      知識武器：「{item.knowledgeUnitBonus.unitName}」題型傷害 +{item.knowledgeUnitBonus.bonusPct}%
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: Selected Equipment Workbench */}
        <section className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col gap-4">
          {selectedItem ? (
            <>
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${EQUIP_QUALITY_LABELS[selectedItem.quality].colorClass}`}>
                    {EQUIP_QUALITY_LABELS[selectedItem.quality].label} · {EQUIP_SLOT_LABELS[selectedItem.slot]}
                  </span>
                  {selectedItem.enhanceLevel >= 10 && (
                    <span className="inline-flex items-center gap-1 text-xs font-black text-amber-300">
                      <Sparkles className="w-3.5 h-3.5" /> 覺醒光效
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  {selectedItem.name} <span className="font-mono text-amber-300">+{selectedItem.enhanceLevel}</span>
                </h2>
                {selectedItem.knowledgeUnitBonus && (
                  <p className="text-xs text-amber-200 mt-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40 p-2">
                    單元知識武器：答「{selectedItem.knowledgeUnitBonus.unitName}」相關題目傷害額外 +{selectedItem.knowledgeUnitBonus.bonusPct}%
                  </p>
                )}
              </div>

              {/* Equip Button */}
              {selectedHero && (
                <button
                  type="button"
                  onClick={() => {
                    equipItemToCharacter(selectedHero.templateId, selectedItem.uid);
                    playSfx('click', settings.soundEnabled);
                    showToast(`已為「${getCharacterTemplate(selectedHero.templateId).name}」裝備 ${selectedItem.name}`);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 min-h-[50px] cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  裝備給 {getCharacterTemplate(selectedHero.templateId).name}
                </button>
              )}

              {/* Enhance +0 -> +15 */}
              <button
                type="button"
                onClick={handleEnhance}
                disabled={!enhanceInfo?.canEnhance}
                className="flex items-center justify-between rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold px-4 py-3 min-h-[54px] cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <Hammer className="w-5 h-5" />
                  安全強化（100%不爆裝）
                </span>
                <span className="text-xs font-mono">
                  {enhanceInfo?.canEnhance ? `${enhanceInfo.coins}幣・石×${enhanceInfo.stones}` : '已滿級 +15'}
                </span>
              </button>

              {/* Ascend Quality */}
              <button
                type="button"
                onClick={handleAscend}
                disabled={!nextQuality}
                className="flex items-center justify-between rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-4 py-3 min-h-[54px] cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowUp className="w-5 h-5" />
                  裝備升階（保留 +{selectedItem.enhanceLevel}）
                </span>
                <span className="text-xs font-mono">
                  {nextQuality ? `220幣・升階石×2` : '最高傳說'}
                </span>
              </button>

              {/* Fuse 2 Same-Slot Same-Quality Items */}
              <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5 space-y-2.5">
                <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> 同部位同品質裝備融合升品
                </div>
                {fuseCandidates.length > 0 ? (
                  <>
                    <select
                      value={fusePartnerUid}
                      onChange={(e) => setFusePartnerUid(e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white min-h-[44px]"
                    >
                      <option value="">選擇另一件同部位同品質裝備</option>
                      {fuseCandidates.map((c) => (
                        <option key={c.uid} value={c.uid}>
                          {c.name} +{c.enhanceLevel}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleFuse}
                      disabled={!fusePartnerUid}
                      className="w-full rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold py-2.5 text-xs min-h-[44px] cursor-pointer"
                    >
                      執行融合（保留最高強化等級）
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">背包中目前無其他同部位且同品質的裝備可融合。</p>
                )}
              </div>

              {/* Decompose */}
              <button
                type="button"
                onClick={handleDecompose}
                className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold min-h-[46px] cursor-pointer ${
                  confirmDecompose
                    ? 'bg-rose-600 border-rose-400 text-white'
                    : 'bg-slate-950/60 border-slate-700 text-slate-400 hover:text-rose-300'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {confirmDecompose ? '再次點擊確認分解（回收金幣＋強化石×2）' : '分解裝備回收材料'}
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-400">背包中沒有裝備。</p>
          )}
        </section>
      </main>
    </div>
  );
};

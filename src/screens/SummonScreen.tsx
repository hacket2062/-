import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Ticket } from 'lucide-react';
import type { Rarity } from '../types/game';
import { CHARACTER_TEMPLATES, getCharacterTemplate } from '../data/characters';
import { WORLD_THEMES } from '../assets/worldAssets';
import { DAILY_SUMMON_CAP, SUMMON_PITY_LIMIT, SUMMON_RATES } from '../game/core/progression';
import { CharacterPortraitSvg } from '../components/CharacterAvatarSvg';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

export const SummonScreen: React.FC = () => {
  const {
    currencies,
    characters,
    summonPity,
    dailySummonsUsed,
    settings,
    setScreen,
    performSummon,
    exchangeShardsForCharacter,
    showToast,
  } = useGameStore();

  const [revealResults, setRevealResults] = useState<
    Array<{ templateId: string; rarity: Rarity; isNew: boolean; triggeredPity: boolean }> | null
  >(null);

  const ownedIds = useMemo(() => new Set(characters.map((c) => c.templateId)), [characters]);
  const exchangeableHeroes = useMemo(
    () => CHARACTER_TEMPLATES.filter((c) => !c.isHiddenFusion && !ownedIds.has(c.id)),
    [ownedIds]
  );

  const handleSummon = (count: 1 | 5) => {
    const res = performSummon(count);
    if (!res.ok) {
      showToast(res.message ?? '無法進行召喚');
      return;
    }
    const hasSSR = res.results.some((r) => r.rarity === 'SSR');
    playSfx(hasSSR ? 'victory' : 'ultimate', settings.soundEnabled);
    setRevealResults(res.results);
  };

  const handleExchange = (id: string) => {
    if (exchangeShardsForCharacter(id)) {
      playSfx('victory', settings.soundEnabled);
      showToast(`已透過智光晶石直接兌換「${getCharacterTemplate(id).name}」！`);
    } else {
      showToast('需要 180 智光晶石（可由答題與每日任務免費獲得）');
    }
  };

  const remainingDaily = Math.max(0, DAILY_SUMMON_CAP - dailySummonsUsed);
  const pullsToPity = Math.max(1, SUMMON_PITY_LIMIT - summonPity);

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
              <h1 className="text-lg sm:text-xl font-black text-cyan-300">智光召喚神殿</h1>
              <p className="text-xs text-slate-400">完全免費零課金・機率透明公開・30 抽必出 SSR 保底</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-cyan-300">
              <Ticket className="w-4 h-4" /> 召喚券 {currencies.tickets}
            </span>
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-amber-300">
              智光晶石 {currencies.crystals}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Hero Banner + Summon Controls */}
        <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              兒童友善保證：無儲值、無誘導付費，所有召喚券皆可透過答題取得
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              四界英雄齊聚・智光守護召喚
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              每次召喚優先消耗召喚券，不足時以 60 智光晶石替代。重複抽到的英雄會自動轉為專屬碎片供升星使用。
            </p>

            {/* Transparent Rates + Pity Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-950/75 border border-slate-800 p-3.5 text-xs space-y-1.5">
                <div className="font-bold text-slate-300">公開透明機率表</div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-amber-300">SSR {Math.round(SUMMON_RATES.SSR * 100)}%</span>
                  <span className="text-fuchsia-300">SR {Math.round(SUMMON_RATES.SR * 100)}%</span>
                  <span className="text-sky-300">R {Math.round(SUMMON_RATES.R * 100)}%</span>
                  <span className="text-slate-400">N {Math.round(SUMMON_RATES.N * 100)}%</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/75 border border-slate-800 p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">SSR 保底進度</span>
                  <span className="font-mono text-white">
                    {summonPity} / {SUMMON_PITY_LIMIT}（再 {pullsToPity} 抽必出）
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all"
                    style={{ width: `${Math.min(100, (summonPity / SUMMON_PITY_LIMIT) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 flex flex-col gap-3">
            <div className="text-center text-xs text-slate-300 font-mono">
              今日兒童保護剩餘次數：{remainingDaily} / {DAILY_SUMMON_CAP}
            </div>
            <button
              type="button"
              onClick={() => handleSummon(1)}
              disabled={remainingDaily < 1}
              className="flex items-center justify-between rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black px-5 py-4 min-h-[58px] transition cursor-pointer"
            >
              <span className="inline-flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5" /> 單次召喚
              </span>
              <span className="text-xs font-mono">1 券 或 60 晶石</span>
            </button>
            <button
              type="button"
              onClick={() => handleSummon(5)}
              disabled={remainingDaily < 5}
              className="flex items-center justify-between rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black px-5 py-4 min-h-[58px] transition cursor-pointer"
            >
              <span className="inline-flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5" /> 五連召喚
              </span>
              <span className="text-xs font-mono">5 券 或 300 晶石</span>
            </button>
          </div>
        </section>

        {/* Direct Crystal Exchange Shop (Zero-RNG Guarantee) */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-white">無運氣直購兌換所（180 智光晶石指定兌換）</h3>
              <p className="text-xs text-slate-400">不用靠運氣也能收集心儀的四界英雄！</p>
            </div>
            <span className="text-xs text-slate-400">尚可兌換 {exchangeableHeroes.length} 位角色</span>
          </div>

          {exchangeableHeroes.length === 0 ? (
            <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-5 text-center text-sm text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> 你已集齊所有常駐召喚池角色！前往「角色融合研究所」探索隱藏英雄吧！
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {exchangeableHeroes.map((hero) => (
                <div
                  key={hero.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <CharacterPortraitSvg character={hero} size={56} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-amber-300">
                        {hero.rarity} · {WORLD_THEMES[hero.subject].subjectName}
                      </div>
                      <div className="font-bold text-white truncate">{hero.name}</div>
                      <div className="text-xs text-slate-400">{hero.role}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExchange(hero.id)}
                    className="w-full rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-bold py-2.5 text-xs min-h-[44px] transition cursor-pointer"
                  >
                    180 晶石直接兌換
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Reveal Modal */}
      {revealResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-amber-400/50 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="text-center">
              <h3 className="text-2xl font-black text-amber-300">智光召喚結果！</h3>
              <p className="text-xs text-slate-400 mt-1">新英雄已加入隊伍，重複角色已自動轉化為升星碎片</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {revealResults.map((res, idx) => {
                const tpl = getCharacterTemplate(res.templateId);
                return (
                  <div
                    key={`${res.templateId}_${idx}`}
                    className={`w-32 rounded-2xl border p-3 flex flex-col items-center text-center gap-1.5 ${
                      res.rarity === 'SSR'
                        ? 'border-amber-400 bg-amber-500/15'
                        : res.rarity === 'SR'
                          ? 'border-fuchsia-400/70 bg-fuchsia-500/10'
                          : 'border-slate-700 bg-slate-950/70'
                    }`}
                  >
                    <CharacterPortraitSvg character={tpl} size={64} />
                    <div className="text-xs font-black text-amber-300">
                      {res.rarity} {res.triggeredPity ? '保底!' : ''}
                    </div>
                    <div className="text-sm font-bold text-white">{tpl.name}</div>
                    <div className="text-[11px] font-bold text-emerald-300">
                      {res.isNew ? 'NEW 新獲得' : `+${res.rarity === 'SSR' ? 15 : 8} 碎片`}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setRevealResults(null)}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 min-h-[52px] cursor-pointer"
            >
              收入隊伍
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

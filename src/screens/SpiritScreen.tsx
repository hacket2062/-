import React, { useState } from 'react';
import {
  Apple,
  ArrowLeft,
  BookOpen,
  Heart,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
  Swords,
} from 'lucide-react';
import type { SpiritId } from '../types/game';
import { GUARDIAN_SPIRITS, getSpiritTemplate } from '../data/spirits';
import { getCharacterTemplate } from '../data/characters';
import { GuardianSpiritSvg } from '../components/GuardianSpiritSvg';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

export const SpiritScreen: React.FC = () => {
  const {
    profile,
    selectedGrade,
    spirit,
    currencies,
    wrongBook,
    knowledgeMastery,
    settings,
    setScreen,
    feedSpirit,
    petSpirit,
    evolveSpirit,
    upgradeSpiritTalent,
    switchSpirit,
    unlockSpirit,
    showToast,
  } = useGameStore();

  const activeTpl = getSpiritTemplate(spirit.activeId);
  const pairedHero = getCharacterTemplate(activeTpl.pairedHeroId);

  const totalTalentEarned = Math.floor(spirit.level / 5);
  const spentTalents =
    spirit.talentPoints.attack + spirit.talentPoints.defense + spirit.talentPoints.learning;
  const unspentTalents = Math.max(0, totalTalentEarned - spentTalents);
  const reqEvoLevel = (spirit.evolutionStage + 1) * 5;

  const [chatInput, setChatInput] = useState('');
  const [chatReply, setChatReply] = useState(
    `嗨 ${profile?.nickname ?? '小守護者'}！我是「${activeTpl.evolutionNames[spirit.evolutionStage]}」，今天想聊聊哪一科的冒險呢？`
  );
  const [aiLoading, setAiLoading] = useState(false);

  const handleFeed = () => {
    if (feedSpirit()) {
      playSfx('heal', settings.soundEnabled);
      showToast(`餵食知識果實成功！${activeTpl.name} 羈絆值 +35`);
      setChatReply('好好吃的知識果實！我覺得智光能量變強了，快去闖關吧！');
    } else {
      showToast('知識果實不足！完成任何關卡或每日任務都可獲得。');
    }
  };

  const handlePet = () => {
    petSpirit();
    playSfx('click', settings.soundEnabled);
    showToast(`摸了摸 ${activeTpl.name}，牠開心地跳了起來！`);
    setChatReply('嘻嘻，謝謝你的鼓勵！記得答題前深呼吸，不要急著亂猜喔！');
  };

  const handleEvolve = () => {
    if (evolveSpirit()) {
      playSfx('victory', settings.soundEnabled);
      showToast(`恭喜！守護精靈進化為「${activeTpl.evolutionNames[Math.min(3, spirit.evolutionStage + 1)]}」！`);
    } else {
      showToast(`需要精靈達 Lv.${reqEvoLevel} 且持有進化結晶 ×1`);
    }
  };

  const handleTalent = (branch: 'attack' | 'defense' | 'learning') => {
    if (upgradeSpiritTalent(branch)) {
      playSfx('heal', settings.soundEnabled);
      showToast('天賦點分配成功！');
    } else {
      showToast('目前沒有剩餘天賦點（精靈每升 5 級獲得 1 點）');
    }
  };

  const handleSpiritSelect = (id: SpiritId) => {
    if (spirit.unlockedIds.includes(id)) {
      switchSpirit(id);
      playSfx('click', settings.soundEnabled);
      showToast(`已切換出戰精靈為「${getSpiritTemplate(id).name}」`);
    } else if (unlockSpirit(id)) {
      playSfx('victory', settings.soundEnabled);
      showToast(`成功孵化新守護精靈「${getSpiritTemplate(id).name}」！`);
    } else {
      showToast('需要 150 智光晶石才能孵化此守護精靈');
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || aiLoading) return;
    setAiLoading(true);
    setChatInput('');
    try {
      const wrongCount = Object.values(wrongBook).filter((w) => !w.graduated).length;
      const weakTopic = Object.entries(knowledgeMastery).sort((a, b) => a[1] - b[1])[0]?.[0];
      const res = await fetch('/api/ai/spirit-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: profile?.nickname ?? '小守護者',
          grade: selectedGrade,
          spiritName: activeTpl.name,
          spiritStage: activeTpl.evolutionNames[spirit.evolutionStage],
          wrongCount,
          weakTopic,
          userTopic: text,
        }),
      });
      const data = await res.json();
      setChatReply(data.reply ?? '我收到你的訊息囉！一起勇敢面對今天的學習挑戰吧！');
    } catch {
      setChatReply('目前處於離線模式，不過我隨時都在你身邊陪你答題！');
    } finally {
      setAiLoading(false);
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
              <h1 className="text-lg sm:text-xl font-black text-rose-300">守護精靈聖殿</h1>
              <p className="text-xs text-slate-400">跨四界同行夥伴・四階段進化・三系天賦樹</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono">
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-emerald-300">
              知識果實 {currencies.fruits}
            </span>
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-sky-300">
              進化結晶 {currencies.evoCrystals}
            </span>
            <span className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-amber-300">
              智光晶石 {currencies.crystals}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Spirit Showcase & Interaction */}
        <section className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col items-center text-center gap-4">
          <div className="w-full flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300">{activeTpl.evolutionNames[spirit.evolutionStage]}</span>
            <span className="font-mono text-slate-300">Lv.{spirit.level}</span>
          </div>

          <button
            type="button"
            onClick={handlePet}
            className="animate-spirit-float p-3 rounded-3xl bg-slate-950/60 border border-slate-800 hover:border-amber-400/60 transition cursor-pointer"
            title="點擊撫摸守護精靈"
          >
            <GuardianSpiritSvg spiritId={spirit.activeId} evolutionStage={spirit.evolutionStage} size={160} />
          </button>

          {/* Bond EXP bar */}
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>羈絆成長值</span>
              <span className="font-mono">{spirit.bondExp} / 100</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all"
                style={{ width: `${Math.min(100, spirit.bondExp)}%` }}
              />
            </div>
          </div>

          {/* Skills Summary */}
          <div className="w-full text-left rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-2 text-xs">
            <div>
              <span className="text-slate-400">常駐被動：</span>
              <span className="text-emerald-300 font-bold">{activeTpl.passiveDesc}</span>
            </div>
            <div>
              <span className="text-slate-400">主動技【{activeTpl.skillName}】：</span>
              <span className="text-sky-300 font-bold">{activeTpl.skillDesc}</span>
            </div>
            <div>
              <span className="text-slate-400">合體大招【{activeTpl.comboSkillName}】：</span>
              <span className="text-amber-300 font-bold">搭配「{pairedHero.name}」出戰啟動</span>
            </div>
          </div>

          {/* Interactive Actions */}
          <div className="w-full grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handlePet}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 py-3 min-h-[64px] text-xs font-bold text-rose-200 cursor-pointer"
            >
              <Heart className="w-5 h-5" />
              摸摸互動
            </button>
            <button
              type="button"
              onClick={handleFeed}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 py-3 min-h-[64px] text-xs font-bold text-emerald-200 cursor-pointer"
            >
              <Apple className="w-5 h-5" />
              餵食果實
            </button>
            <button
              type="button"
              onClick={handleEvolve}
              disabled={spirit.evolutionStage >= 3}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-40 border border-amber-400/50 py-3 min-h-[64px] text-xs font-bold text-amber-200 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              {spirit.evolutionStage >= 3 ? '神獸完成' : `進化(Lv.${reqEvoLevel})`}
            </button>
          </div>
        </section>

        {/* Right: Talent Tree + Spirit Switcher + AI Companion Chat */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Talent Tree */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-white">三分支天賦樹（每 5 級獲得 1 點）</h2>
                <p className="text-xs text-slate-400">可自由投資攻擊、防禦或學習輔助方向</p>
              </div>
              <span className="rounded-lg bg-amber-500/20 border border-amber-400/60 px-3 py-1.5 text-sm font-black text-amber-300 font-mono">
                可用天賦點：{unspentTalents}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  key: 'attack' as const,
                  label: '攻擊天賦',
                  desc: '每點提升全隊傷害 +5% 與暴擊',
                  icon: Swords,
                  color: 'text-rose-300 border-rose-500/40',
                },
                {
                  key: 'defense' as const,
                  label: '防禦天賦',
                  desc: '每點提升全隊體力 +8% 與減傷',
                  icon: Shield,
                  color: 'text-sky-300 border-sky-500/40',
                },
                {
                  key: 'learning' as const,
                  label: '學習天賦',
                  desc: '每點延長作答寬容度與經驗值 +8%',
                  icon: BookOpen,
                  color: 'text-emerald-300 border-emerald-500/40',
                },
              ].map((branch) => {
                const Icon = branch.icon;
                const val = spirit.talentPoints[branch.key];
                return (
                  <div
                    key={branch.key}
                    className={`rounded-xl border bg-slate-950/70 p-4 flex flex-col justify-between gap-3 ${branch.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 font-bold text-sm">
                          <Icon className="w-4 h-4" />
                          {branch.label}
                        </span>
                        <span className="font-mono text-base font-black">Lv.{val}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{branch.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTalent(branch.key)}
                      disabled={unspentTalents <= 0}
                      className="w-full rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 py-2.5 text-xs font-bold text-white min-h-[44px] cursor-pointer"
                    >
                      投入 1 點
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4 Spirits Roster */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <h2 className="text-base font-black text-white mb-3">四大守護精靈切換／孵化</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {GUARDIAN_SPIRITS.map((sp) => {
                const unlocked = spirit.unlockedIds.includes(sp.id);
                const isActive = spirit.activeId === sp.id;
                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => handleSpiritSelect(sp.id)}
                    className={`rounded-xl border p-3 flex flex-col items-center gap-2 transition cursor-pointer ${
                      isActive
                        ? 'border-amber-400 bg-amber-500/15'
                        : unlocked
                          ? 'border-slate-700 bg-slate-950/70 hover:border-slate-500'
                          : 'border-slate-800 bg-slate-950/40 opacity-80 hover:border-sky-400'
                    }`}
                  >
                    <GuardianSpiritSvg spiritId={sp.id} evolutionStage={unlocked ? spirit.evolutionStage : 0} size={64} />
                    <div className="text-sm font-bold text-white">{sp.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {isActive ? '出戰中' : unlocked ? '點擊切換' : '150 晶石孵化'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Spirit Encouragement Chat */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <MessageCircle className="w-4 h-4" />
              與 {activeTpl.name} 對話（學習打氣）
            </div>
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 text-sm text-slate-200 leading-relaxed min-h-[68px]">
              {aiLoading ? `${activeTpl.name} 正在揮動耳朵思考中...` : chatReply}
            </div>
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="問問精靈學習小技巧，或跟牠說今天的心情..."
                className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-500 min-h-[48px]"
              />
              <button
                type="submit"
                disabled={aiLoading || !chatInput.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold px-5 min-h-[48px] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                傳送
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

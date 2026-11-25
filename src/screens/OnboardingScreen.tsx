import React, { useState } from 'react';
import { ArrowRight, Check, Shield, Sparkles } from 'lucide-react';
import type { Grade, SpiritId } from '../types/game';
import { GUARDIAN_SPIRITS } from '../data/spirits';
import { GuardianSpiritSvg } from '../components/GuardianSpiritSvg';
import { PLAYER_AVATARS, PlayerAvatarSvg } from '../components/CharacterAvatarSvg';
import { useGameStore } from '../store/useGameStore';
import { playSfx } from '../game/fx/battleFx';

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding, settings } = useGameStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [nickname, setNickname] = useState('小光');
  const [grade, setGrade] = useState<Grade>(5);
  const [avatarId, setAvatarId] = useState<string>(PLAYER_AVATARS[0].id);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Interactive Egg Hatch
  const [eggCracks, setEggCracks] = useState(0);
  const [chosenSpirit, setChosenSpirit] = useState<SpiritId>('math_griffin');

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('請輸入一個冒險暱稱（不需填寫真實姓名）');
      return;
    }
    if (trimmed.length > 12) {
      setError('暱稱請保持在 12 個字以內');
      return;
    }
    setError(null);
    playSfx('correct', settings.soundEnabled);
    setStep(2);
  };

  const handleTapEgg = () => {
    playSfx(eggCracks >= 2 ? 'perfect' : 'click', settings.soundEnabled);
    setEggCracks((c) => Math.min(3, c + 1));
  };

  const handleFinish = () => {
    playSfx('victory', settings.soundEnabled);
    completeOnboarding(
      {
        nickname: nickname.trim() || '小光',
        grade,
        avatarId,
        createdAt: Date.now(),
      },
      chosenSpirit
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-10 shadow-2xl">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-6">
          <span>智光守護者入學報到</span>
          <span>步驟 {step} / 2 · {step === 1 ? '建立守護者檔案' : '孵化守護精靈蛋'}</span>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">歡迎來到智光學園！</h1>
              <p className="mt-2 text-sm text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                兒童隱私保護：我們只記錄暱稱、年級與頭像，絕不收集真實姓名、學校或位置，資料預設存在本機。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label htmlFor="player-nickname" className="block text-sm font-bold text-slate-200 mb-2">
                    冒險暱稱（不收真名）
                  </label>
                  <input
                    id="player-nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="例如：星光小狐、小智"
                    maxLength={12}
                    className="w-full min-h-[50px] rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base font-bold text-white focus:border-amber-400 focus:outline-none"
                  />
                  {error && <p className="mt-2 text-xs font-bold text-rose-400">{error}</p>}
                </div>

                <div>
                  <span className="block text-sm font-bold text-slate-200 mb-2">選擇目前年級（可隨時往下複習）</span>
                  <div className="grid grid-cols-2 gap-3">
                    {([3, 4, 5, 6] as Grade[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`min-h-[52px] rounded-xl border px-4 py-3 text-left font-bold transition cursor-pointer ${
                          grade === g
                            ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                            : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-base">國小 {g} 年級</div>
                        <div className="text-xs font-normal text-slate-400">
                          {g === 3 ? '預設開啟注音輔助' : `108 課綱 ${g} 年級進度`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <span className="block text-sm font-bold text-slate-200 mb-2">選擇專屬頭像</span>
                <div className="grid grid-cols-3 gap-3">
                  {PLAYER_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarId(av.id)}
                      className={`rounded-2xl border p-3 flex flex-col items-center gap-2 transition cursor-pointer ${
                        avatarId === av.id
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                      }`}
                    >
                      <PlayerAvatarSvg avatarId={av.id} size={58} />
                      <span className="text-xs font-bold text-slate-200">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="min-h-[52px] inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-8 py-3 text-base cursor-pointer"
              >
                下一步：孵化守護精靈蛋
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {eggCracks < 3 ? '輕點守護精靈蛋，喚醒你的知識夥伴！' : '精靈蛋孵化了！選擇你的第一位守護精靈'}
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                守護精靈四個世界共用，未來也能用免費智光晶石解鎖其他三隻精靈！
              </p>
            </div>

            {eggCracks < 3 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <button
                  type="button"
                  onClick={handleTapEgg}
                  aria-label="點擊孵化守護精靈蛋"
                  className="group relative flex flex-col items-center cursor-pointer focus:outline-none"
                >
                  <svg
                    width="180"
                    height="210"
                    viewBox="0 0 180 210"
                    className={`transition-transform duration-150 ${
                      eggCracks > 0 ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                  >
                    <defs>
                      <radialGradient id="eggGlow" cx="45%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#fef9c3" />
                        <stop offset="55%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                      </radialGradient>
                    </defs>
                    <ellipse cx="90" cy="192" rx="48" ry="11" fill="rgba(0,0,0,0.45)" />
                    <path
                      d="M90 18 C134 18 152 88 148 134 C144 174 120 188 90 188 C60 188 36 174 32 134 C28 88 46 18 90 18 Z"
                      fill="url(#eggGlow)"
                      stroke="#fffbeb"
                      strokeWidth="4"
                    />
                    <circle cx="72" cy="76" r="10" fill="#ffffff" fillOpacity="0.45" />
                    <circle cx="112" cy="122" r="14" fill="#38bdf8" fillOpacity="0.35" />
                    {eggCracks >= 1 && (
                      <path d="M84 56 L96 76 L80 94" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />
                    )}
                    {eggCracks >= 2 && (
                      <path d="M96 76 L116 96 L100 118 L118 134" stroke="#0f172a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                    )}
                  </svg>
                  <span className="mt-4 rounded-xl bg-amber-400 text-slate-950 font-black px-6 py-2.5 text-sm shadow-lg">
                    點我輕敲精靈蛋（{eggCracks} / 3）
                  </span>
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GUARDIAN_SPIRITS.map((sp) => {
                    const selected = chosenSpirit === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => setChosenSpirit(sp.id)}
                        className={`rounded-2xl border p-4 text-left flex items-center gap-4 transition cursor-pointer ${
                          selected
                            ? 'border-amber-400 bg-amber-500/15 shadow-lg'
                            : 'border-slate-700 bg-slate-950/70 hover:border-slate-500'
                        }`}
                      >
                        <GuardianSpiritSvg spiritId={sp.id} size={86} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-white">{sp.name}</span>
                            {selected && <Check className="w-4 h-4 text-amber-300" />}
                          </div>
                          <p className="text-xs text-slate-400">{sp.appearance}</p>
                          <p className="mt-1.5 text-xs text-emerald-300 font-bold">天賦：{sp.passiveDesc}</p>
                          <p className="mt-0.5 text-xs text-sky-300">守護技「{sp.skillName}」：{sp.skillDesc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="min-h-[54px] inline-flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-8 py-3 text-base cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5" />
                    與精靈締結契約・進入智光大廳！
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

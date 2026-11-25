import React from 'react';
import {
  ArrowLeft,
  BookOpen,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type { TextbookEdition } from '../types/game';
import { EDITION_LABELS } from '../data/curriculum';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useGameStore } from '../store/useGameStore';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, setScreen, showToast } = useGameStore();

  const toggle = (key: keyof typeof settings, label: string) => {
    const nextVal = !settings[key];
    updateSettings({ [key]: nextVal } as Partial<typeof settings>);
    showToast(`${label}已${nextVal ? '開啟' : '關閉'}`);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
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
              <h1 className="text-lg sm:text-xl font-black text-slate-100">學習輔助與無障礙設定</h1>
              <p className="text-xs text-slate-400">版本切換、無計時練習模式、注音、朗讀與護眼選項</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setScreen('parent_zone')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 text-xs font-bold text-amber-300 min-h-[48px] cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            家長／老師專區
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Textbook Edition */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
          <div className="flex items-center gap-2 text-base font-black text-amber-300">
            <BookOpen className="w-5 h-5" />
            108 課綱教科書版本（決定章節單元順序）
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['kanghsuan', 'nanyi', 'hanlin'] as TextbookEdition[]).map((ed) => {
              const active = settings.edition === ed;
              return (
                <button
                  key={ed}
                  type="button"
                  onClick={() => {
                    updateSettings({ edition: ed });
                    showToast(`已切換為「${EDITION_LABELS[ed]}」章節順序`);
                  }}
                  className={`rounded-xl border py-3.5 text-sm font-black min-h-[52px] transition cursor-pointer ${
                    active
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                      : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {EDITION_LABELS[ed]}
                </button>
              );
            })}
          </div>
        </section>

        {/* Learning Accessibility */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-base font-black text-emerald-300">
            <HeartHandshake className="w-5 h-5" />
            學習友善與包容輔助
          </div>

          <div className="space-y-3">
            {[
              {
                key: 'practiceMode' as const,
                title: '無計時練習模式',
                desc: '關閉速度壓力條與時間計分，讓孩子用自己的節奏安心思考每一題。',
              },
              {
                key: 'zhuyinEnabled' as const,
                title: '國字注音輔助（三年級預設開啟）',
                desc: '題目顯示注音標註，並自動將建議作答時間放寬至 1.3 倍。',
              },
              {
                key: 'autoReadAloud' as const,
                title: '題目自動語音朗讀 (TTS)',
                desc: '出題時自動朗讀國語（zh-TW）與英語（en-US），同時放寬建議作答時間 1.3 倍。',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 rounded-xl bg-slate-950/75 border border-slate-800 p-4"
              >
                <div>
                  <div className="font-bold text-white text-sm">{item.title}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(item.key, item.title)}
                  className={`rounded-xl px-5 py-2.5 text-xs font-black min-h-[46px] min-w-[84px] transition cursor-pointer ${
                    settings[item.key]
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {settings[item.key] ? '已開啟' : '已關閉'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Visual, Audio & Eye Protection */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center gap-2 text-base font-black text-sky-300">
            <Eye className="w-5 h-5" />
            視覺護眼與音效設定
          </div>

          {/* 3-level Font Size */}
          <div className="rounded-xl bg-slate-950/75 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-sm">字體大小（三段調整）</div>
              <p className="text-xs text-slate-400">適合平板與筆電閱讀的護眼字級</p>
            </div>
            <div className="inline-flex rounded-xl bg-slate-900 border border-slate-700 p-1">
              {[
                { id: 'sm' as const, label: '標準' },
                { id: 'md' as const, label: '大字（推薦）' },
                { id: 'lg' as const, label: '特大字' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updateSettings({ fontScale: opt.id })}
                  className={`rounded-lg px-4 py-2 text-xs font-bold min-h-[42px] cursor-pointer ${
                    settings.fontScale === opt.id ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'colorblindMode' as const, title: '色盲友善高對比模式', icon: Eye },
              { key: 'reducedFlash' as const, title: '降低閃光與震動（護眼）', icon: Sparkles },
              { key: 'skipUltimateAnim' as const, title: '略過必殺技動畫 Cut-in', icon: Sparkles },
              { key: 'soundEnabled' as const, title: '戰鬥與按鈕音效', icon: Volume2 },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => toggle(item.key, item.title)}
                className={`flex items-center justify-between rounded-xl border p-4 min-h-[58px] transition cursor-pointer ${
                  settings[item.key]
                    ? 'border-sky-400/70 bg-sky-950/30 text-white'
                    : 'border-slate-800 bg-slate-950/70 text-slate-400'
                }`}
              >
                <span className="text-sm font-bold">{item.title}</span>
                <span className="text-xs font-black">
                  {settings[item.key] ? '開' : '關'}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* PWA Offline Install */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-amber-300">離線應用程式安裝 (PWA)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              安裝到平板或電腦桌面，沒網路也能練習 108 課綱題庫並自動本機存檔。
            </p>
          </div>
          <PWAInstallButton variant="full" />
        </section>
      </main>
    </div>
  );
};

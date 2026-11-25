import React, { useState } from 'react';
import { Download, WifiOff } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'compact' | 'full' }> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return variant === 'full' ? (
      <span className="text-sm text-emerald-300 font-medium">已安裝為離線 App</span>
    ) : null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 text-sm transition cursor-pointer whitespace-nowrap min-h-[48px]"
      >
        <Download className="w-4 h-4" />
        安裝到桌面 (PWA)
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-600/80 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-medium px-4 py-2.5 text-sm transition cursor-pointer whitespace-nowrap min-h-[48px]"
      >
        <Download className="w-4 h-4 text-amber-300" />
        {isIOS ? '安裝到 iPad / iPhone' : '安裝離線桌面版'}
      </button>
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-300">安裝《智光守護者》至主畫面</h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              {isIOS
                ? '1. 點擊 Safari 工具列的「分享」按鈕。\n2. 向下滑動並選擇「加入主畫面」，即可全螢幕離線遊玩！'
                : '點擊瀏覽器網址列右側的「安裝應用程式」圖示，或從選單選擇「安裝智光守護者」，即可離線開啟與自動存檔。'}
            </p>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 text-sm cursor-pointer"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-lg">
      <WifiOff className="w-4 h-4" />
      離線模式運作中・進度將自動存於本機
    </div>
  );
};

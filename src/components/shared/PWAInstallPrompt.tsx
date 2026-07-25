import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { subscribePWAInstall, promptPWAInstall, isStandalone } from '../../services/pwaService';

export const PWAInstallPrompt: React.FC = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setCanInstall(false);
      return;
    }
    const unsubscribe = subscribePWAInstall((installable) => {
      setCanInstall(installable);
    });
    return unsubscribe;
  }, []);

  if (!canInstall || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-teal-900/90 via-slate-800 to-indigo-900/90 border-b border-teal-500/30 px-4 py-3 text-slate-100 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 flex-shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">Install App for Offline Safety</h4>
            <p className="text-xs text-slate-200">Add InteliSupport to your home screen for 1-tap crisis support offline.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={promptPWAInstall}
            className="min-h-[44px] px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Install PWA
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Dismiss Install Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

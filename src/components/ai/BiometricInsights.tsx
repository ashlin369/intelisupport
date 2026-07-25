import React from 'react';
import { Activity, Heart, Moon, ShieldCheck, TrendingUp } from 'lucide-react';

export const BiometricInsights: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl">Biometric HRV & Sleep Deficit Insights</h3>
            <p className="text-xs text-slate-400">Google Health Connect 7-day fatigue & stress correlation</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-full border border-emerald-800 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> Vitals Synced
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Heart Rate Variability</span>
          <p className="text-xl font-extrabold text-indigo-300 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> 64 ms (Optimal)
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Sleep Deficit</span>
          <p className="text-xl font-extrabold text-teal-300 flex items-center gap-2">
            <Moon className="w-5 h-5 text-teal-400" /> 7.2 hrs Sleep
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Recovery Readiness</span>
          <p className="text-xl font-extrabold text-emerald-400">88% Ready</p>
        </div>
      </div>
    </div>
  );
};

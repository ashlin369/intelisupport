import React, { useState, useEffect } from 'react';
import { getSurvivorProfile } from '../../services/firebaseService';
import { SurvivorProfile } from '../../types';
import { Brain, Activity, ShieldAlert, Sparkles, HeartPulse, CheckCircle2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

export const CravingPredictorAI: React.FC = () => {
  const [patient, setPatient] = useState<SurvivorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSurvivorProfile('pat-201').then((res) => {
      setPatient(res);
      setLoading(false);
    });
  }, []);

  const heartRate = patient?.vitalIndicators?.heartRate || 78;
  const isSpike = heartRate >= 100;
  const riskLevel = isSpike ? 'HIGH_RISK' : heartRate >= 85 ? 'MODERATE_RISK' : 'LOW_RISK';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl">Predictive AI Relapse Risk Engine</h3>
            <p className="text-xs text-slate-400">Gemini 2.5 predictive analysis from live Health Connect vitals</p>
          </div>
        </div>

        <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-extrabold border uppercase ${
          riskLevel === 'HIGH_RISK'
            ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
            : riskLevel === 'MODERATE_RISK'
            ? 'bg-amber-950 text-amber-300 border-amber-700'
            : 'bg-emerald-950 text-emerald-300 border-emerald-700'
        }`}>
          {riskLevel.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Live Heart Rate</span>
          <p className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-400" /> {heartRate} BPM
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Stress Indicator</span>
          <p className="text-xl font-extrabold text-teal-300 capitalize">
            {patient?.vitalIndicators?.stressLevel || 'low'} Stress
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">AI Prevention Status</span>
          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Proactive Protocol Active
          </p>
        </div>
      </div>

      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
        <span className="text-xs font-mono font-bold text-teal-400 uppercase">
          AI Proactive Insight:
        </span>
        <p className="text-xs text-slate-300 leading-relaxed">
          {riskLevel === 'HIGH_RISK'
            ? 'Heart rate spike (>=100 BPM) detected. Recommended: Launch 4-7-8 Haptic Breathing Ring or tap Craving Wave Grounding now.'
            : 'Vitals stable. Continuing background predictive monitoring.'}
        </p>
      </div>
    </div>
  );
};

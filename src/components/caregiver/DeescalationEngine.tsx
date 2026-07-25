import React, { useState } from 'react';
import { DeescalationScript, PatientCondition } from '../../types';
import { generateDeescalationScript } from '../../services/geminiService';
import { RecoveryScriptView } from '../survivor/RecoveryScriptView';
import { Sparkles, MessageSquare, ShieldAlert, HeartPulse, UserX } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

interface DeescalationEngineProps {
  preExistingConditions?: PatientCondition[];
}

export const DeescalationEngine: React.FC<DeescalationEngineProps> = ({
  preExistingConditions = ['asthma', 'opioid_use']
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<DeescalationScript | null>(null);

  const presets = [
    { title: 'Active Overdose Suspected', input: 'Unresponsive, blue lips, shallow breathing overdose signal' },
    { title: 'Agitated Conflict / Aggression', input: 'Person is highly agitated, yelling, pacing, and resisting help' },
    { title: 'Severe Paranoia / Fear', input: 'Person is experiencing intense paranoia, auditory distress, and panic' },
    { title: 'Caregiver Burnout / Panic', input: 'Caregiver experiencing overwhelming panic, helplessness, and stress' }
  ];

  const handleGenerate = async (inputStr: string) => {
    setLoading(true);
    triggerHaptic(50);

    try {
      const result = await generateDeescalationScript(inputStr, 'caregiver', preExistingConditions);
      setScript(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg text-slate-100">Real-Time De-escalation Script Engine</h3>
          <p className="text-xs text-slate-400">Gemini AI spoken read-aloud scripts for acute crisis de-escalation</p>
        </div>
      </div>

      {script ? (
        <RecoveryScriptView script={script} onReset={() => setScript(null)} />
      ) : loading ? (
        <div className="py-12 text-center text-indigo-300 font-bold space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm">Synthesizing trauma-informed de-escalation instructions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">
              1-Tap Common Crisis Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleGenerate(preset.input)}
                  className="min-h-[52px] p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-2xl text-left border border-slate-700/80 hover:border-indigo-400/60 transition-all flex items-center justify-between group"
                >
                  <span>{preset.title}</span>
                  <MessageSquare className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Or Describe Specific Behavior Under Stress:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Refusing to sit down, breathing fast, confusion..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => customPrompt.trim() && handleGenerate(customPrompt)}
                className="min-h-[44px] px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                Generate Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

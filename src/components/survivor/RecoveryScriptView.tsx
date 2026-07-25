import React, { useState } from 'react';
import { DeescalationScript } from '../../types';
import { Volume2, VolumeX, AlertTriangle, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { speakText, stopSpeech } from '../../services/ttsService';

interface RecoveryScriptViewProps {
  script: DeescalationScript;
  onReset: () => void;
}

export const RecoveryScriptView: React.FC<RecoveryScriptViewProps> = ({ script, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleSpeak = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(script.voiceScript, () => setIsPlaying(false));
    }
  };

  return (
    <div className={`bg-slate-900 border-2 rounded-3xl p-6 shadow-2xl space-y-6 ${
      script.isEmergencyOverride ? 'border-rose-500 bg-rose-950/20' : 'border-teal-500/60'
    }`}>
      {/* Script Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${
            script.isEmergencyOverride 
              ? 'bg-rose-950 text-rose-300 border-rose-700' 
              : 'bg-teal-950 text-teal-300 border-teal-800'
          }`}>
            {script.isEmergencyOverride ? 'CRITICAL EMERGENCY OVERRIDE' : 'Gemini AI Grounding Protocol'}
          </span>
          <h3 className="text-xl font-extrabold text-slate-100 mt-2">{script.title}</h3>
        </div>

        <button
          type="button"
          onClick={handleSpeak}
          className={`min-h-[48px] px-4 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
            isPlaying 
              ? 'bg-rose-950 text-rose-300 border-rose-700' 
              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold border-teal-400 shadow-md'
          }`}
        >
          {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isPlaying ? 'Stop Audio' : 'Read Aloud'}
        </button>
      </div>

      {/* Medical Caution Alert */}
      {script.medicalCautionNote && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-amber-200 text-xs font-medium">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-300 uppercase tracking-wider text-[10px]">Medical Caution Guardrail</span>
            {script.medicalCautionNote}
          </div>
        </div>
      )}

      {/* Actionable Steps */}
      <div className="space-y-3">
        {script.steps.map((step, idx) => (
          <div
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              activeStep === idx 
                ? 'bg-slate-800 border-teal-400 shadow-lg shadow-teal-950/40 text-slate-100' 
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
              activeStep === idx ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              {idx + 1}
            </div>
            <div className="flex-1 text-sm font-semibold leading-relaxed">
              {step}
            </div>
            {activeStep === idx && <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />}
          </div>
        ))}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={onReset}
          className="min-h-[44px] px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          Back to Actions
        </button>

        {activeStep < script.steps.length - 1 && (
          <button
            type="button"
            onClick={() => setActiveStep(prev => prev + 1)}
            className="min-h-[44px] px-4 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/60 font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            Next Step <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

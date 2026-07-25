import React, { useState, useEffect } from 'react';
import { Play, Square, Volume2, Heart, X } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';
import { speakText, stopSpeech } from '../../services/ttsService';

interface BreathingCircleProps {
  onClose?: () => void;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({ onClose }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [seconds, setSeconds] = useState(4);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    // Haptic pacing & TTS verbal cues
    if (phase === 'Inhale') {
      triggerHaptic([60, 40, 60]);
    } else if (phase === 'Hold') {
      triggerHaptic(30);
    } else if (phase === 'Exhale') {
      triggerHaptic([100, 80, 100]);
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phases
        if (phase === 'Inhale') {
          setPhase('Hold');
          return 4;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return 6;
        } else {
          setPhase('Inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase]);

  const toggleExercise = () => {
    if (isActive) {
      setIsActive(false);
      stopSpeech();
    } else {
      setIsActive(true);
      setPhase('Inhale');
      setSeconds(4);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center max-w-md mx-auto shadow-2xl relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl"
          aria-label="Close Breathing Exercise"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950 border border-teal-800/80 px-3 py-1 rounded-full">
          Sensory Haptic Breathing Ring
        </span>
        <h3 className="text-xl font-extrabold text-slate-100 mt-2">Paced Parasympathetic Grounding</h3>
        <p className="text-xs text-slate-400">Calms heart rate & dampens acute craving impulses</p>
      </div>

      {/* Visual Sensory Ring Container */}
      <div className="relative my-8 flex items-center justify-center h-64">
        <div 
          className={`absolute rounded-full transition-all duration-1000 ease-in-out border-4 ${
            phase === 'Inhale' 
              ? 'w-56 h-56 bg-teal-500/20 border-teal-400 shadow-2xl shadow-teal-500/50 scale-100' 
              : phase === 'Hold'
              ? 'w-56 h-56 bg-indigo-500/20 border-indigo-400 shadow-2xl shadow-indigo-500/50 scale-105 animate-pulse'
              : 'w-32 h-32 bg-emerald-500/20 border-emerald-400 shadow-xl shadow-emerald-500/40 scale-75'
          }`}
        ></div>

        <div className="z-10 flex flex-col items-center">
          <Heart className={`w-8 h-8 mb-1 ${phase === 'Inhale' ? 'text-teal-300' : phase === 'Hold' ? 'text-indigo-300' : 'text-emerald-300'}`} />
          <span className="text-2xl font-black tracking-wider uppercase text-slate-100">
            {phase}
          </span>
          <span className="text-4xl font-extrabold font-mono text-teal-400 mt-1">
            {seconds}s
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggleExercise}
          className={`min-h-[52px] px-6 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all ${
            isActive 
              ? 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700' 
              : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-900/50'
          }`}
        >
          {isActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {isActive ? 'Pause Grounding' : 'Start Grounding Ring'}
        </button>

        <button
          type="button"
          onClick={() => speakText(`Grounding active. ${phase} for ${seconds} seconds.`)}
          className="min-h-[52px] p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700"
          title="Voice Guidance"
        >
          <Volume2 className="w-5 h-5 text-teal-400" />
        </button>
      </div>
    </div>
  );
};

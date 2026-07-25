import React, { useState } from 'react';
import { Phone, Volume2, VolumeX, ShieldAlert, CheckCircle2, AlertOctagon } from 'lucide-react';
import { speakText, stopSpeech } from '../../services/ttsService';

export const NarcanGuide: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      step: 1,
      title: '1. Check For Unresponsiveness & Breathing',
      desc: 'Shout their name loudly. Rub your knuckles hard on the center of their chest (sternum rub). Look for blue lips, pinpoint pupils, or shallow gurgling breath.',
      narration: 'Step 1. Check unresponsiveness. Shout name. Perform hard sternum rub on chest. Look for blue lips or slow gurgling breathing.'
    },
    {
      step: 2,
      title: '2. Call 911 Immediately',
      desc: 'Put phone on speakerphone so your hands remain free. Tell the operator: "Someone is unresponsive and not breathing properly."',
      narration: 'Step 2. Call 9 1 1 immediately. Speakerphone on. Tell operator person is unresponsive.'
    },
    {
      step: 3,
      title: '3. Administer Naloxone (Narcan Nasal Spray)',
      desc: 'Peel back package foil. Hold plunger with thumb. Insert nozzle firmly into ONE nostril until fingers touch nose tip. Press plunger firmly until it clicks.',
      narration: 'Step 3. Administer Narcan. Insert nozzle into nostril. Press plunger firmly until it clicks.'
    },
    {
      step: 4,
      title: '4. Perform Rescue Breathing & Recovery Position',
      desc: 'Tilt head back, pinch nose, give 1 rescue breath every 5 seconds. If person wakes up or stays unresponsive, roll them onto their side (Recovery Position) to prevent choking.',
      narration: 'Step 4. Give rescue breathing. Turn person onto their side in recovery position.'
    }
  ];

  const toggleNarration = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const textToSpeak = steps[activeStep].narration;
      speakText(textToSpeak, () => setIsPlaying(false));
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-rose-600/80 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">
              Critical Emergency Protocol
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-100 mt-1">Step-by-Step Naloxone (Narcan) Guide</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleNarration}
            className={`min-h-[44px] px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border ${
              isPlaying 
                ? 'bg-rose-950 text-rose-300 border-rose-700' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {isPlaying ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            {isPlaying ? 'Stop Audio' : 'Narrate Step'}
          </button>

          <a
            href="tel:911"
            className="min-h-[44px] px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-950/80"
          >
            <Phone className="w-4 h-4 fill-current" /> Call 911 Now
          </a>
        </div>
      </div>

      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-4 gap-2">
        {steps.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActiveStep(idx);
              setIsPlaying(false);
              stopSpeech();
            }}
            className={`py-3 rounded-2xl font-extrabold text-xs text-center border transition-all ${
              activeStep === idx 
                ? 'bg-rose-600 text-white border-rose-400 shadow-md scale-[1.02]' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            Step {s.step}
          </button>
        ))}
      </div>

      {/* Active Step Visual Card */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center font-black text-rose-400 text-lg">
            {steps[activeStep].step}
          </div>
          <h4 className="text-lg font-extrabold text-slate-100">{steps[activeStep].title}</h4>
        </div>

        <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          {steps[activeStep].desc}
        </p>
      </div>
    </div>
  );
};

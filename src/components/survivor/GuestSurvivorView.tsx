import React, { useState } from 'react';
import { CravingTile } from './CravingTile';
import { BreathingCircle } from './BreathingCircle';
import { RecoveryScriptView } from './RecoveryScriptView';
import { AIVisionScanner } from '../ai/AIVisionScanner';
import { LiveFrontCameraChat } from '../ai/LiveFrontCameraChat';
import { CravingPredictorAI } from '../ai/CravingPredictorAI';
import { VoiceEmotionAnalyzer } from '../ai/VoiceEmotionAnalyzer';
import { BiometricInsights } from '../ai/BiometricInsights';
import { PeerSponsorMatcher } from '../shared/PeerSponsorMatcher';
import { DeescalationScript, PatientCondition } from '../../types';
import { generateDeescalationScript } from '../../services/geminiService';
import { broadcastEmergencySOS, updateSurvivorSafetyStatus } from '../../services/firebaseService';
import { Flame, Wind, ShieldAlert, AlertOctagon, Phone, Heart, Sparkles, Camera, Video, UserCheck, Brain } from 'lucide-react';
import { triggerHaptic, announceToScreenReader } from '../../utils/AccessibilityHelpers';

interface GuestSurvivorViewProps {
  patientId?: string;
  preExistingConditions?: PatientCondition[];
}

export const GuestSurvivorView: React.FC<GuestSurvivorViewProps> = ({
  patientId = 'pat-201',
  preExistingConditions = ['asthma', 'opioid_use']
}) => {
  const [activeScript, setActiveScript] = useState<DeescalationScript | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showVision, setShowVision] = useState(false);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  const handleCravingTileClick = async (tileId: string, tileTitle: string) => {
    triggerHaptic(40);
    setLoadingAi(true);
    try {
      await updateSurvivorSafetyStatus(patientId, 'ELEVATED_CRAVING', tileTitle);
      const script = await generateDeescalationScript(tileTitle, 'survivor', preExistingConditions);
      setActiveScript(script);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleTriggerSOS = async () => {
    triggerHaptic([200, 100, 200, 100, 200]);
    setSosActive(true);
    await broadcastEmergencySOS(patientId);
    announceToScreenReader('Emergency SOS alert broadcasted to all linked caregivers!', 'assertive');
  };

  return (
    <div className="space-y-6">
      {/* Survivor Workspace Hero Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 border border-teal-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-widest flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Individual Recovery Workspace • Self-Soothing Mode
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
              Zero-Typing Recovery & Panic De-escalation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              1-Tap self-soothing tiles, 4-7-8 sensory haptic breathing ring, and hands-free front camera AI voice coach.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Front Camera Hands-Free Self-Soothing AI Coach */}
            <button
              type="button"
              onClick={() => setShowLiveCamera(true)}
              className="min-h-[52px] px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-teal-950/50 transition-transform active:scale-95"
            >
              <Video className="w-4 h-4 fill-current" />
              <span>Front Camera AI Coach</span>
            </button>

            <button
              type="button"
              onClick={() => setShowVision(true)}
              className="min-h-[52px] px-4 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/80 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md"
            >
              <Camera className="w-4 h-4 text-teal-400" />
              <span>Photo Inspection</span>
            </button>

            <a
              href="tel:988"
              className="min-h-[52px] px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-2xl flex items-center gap-2 text-xs"
            >
              <Phone className="w-4 h-4 fill-current text-teal-400" />
              <span>Call / Text 988</span>
            </a>
          </div>
        </div>
      </div>

      {/* Emergency Broadcast Banner */}
      {sosActive && (
        <div className="bg-rose-950 border border-rose-600 rounded-2xl p-4 flex items-center justify-between text-rose-200 text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>EMERGENCY SOS BROADCAST ACTIVE: Alert sent to all linked caregivers & EMS dispatch.</span>
          </div>
          <button
            onClick={() => setSosActive(false)}
            className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-[10px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active AI Script View Overlay */}
      {activeScript ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveScript(null)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
          >
            ← Back to Survivor Grounding Tiles
          </button>
          <RecoveryScriptView script={activeScript} onReset={() => setActiveScript(null)} />
        </div>
      ) : showBreathing ? (
        <div className="space-y-4">
          <button
            onClick={() => setShowBreathing(false)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
          >
            ← Back to Survivor Grounding Tiles
          </button>
          <BreathingCircle />
        </div>
      ) : (
        /* Dedicated Survivor 1-Tap Action Tiles Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 px-1">
              Individual Crisis Tiles (Zero Typing Required)
            </h3>
            <button
              onClick={handleTriggerSOS}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow flex items-center gap-1 animate-pulse"
            >
              <AlertOctagon className="w-3.5 h-3.5" /> 1-Tap Caregiver SOS
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setShowBreathing(true)}
              className="min-h-[90px] p-5 rounded-2xl border-2 border-teal-500 bg-gradient-to-br from-teal-800 via-emerald-900 to-teal-950 text-white shadow-xl hover:border-teal-400 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <Wind className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg">4-7-8 Haptic Breathing Ring</h4>
                  <p className="text-xs text-teal-200">Tactile rhythm exercise for acute panic</p>
                </div>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-xl text-xs font-bold uppercase">1-Tap</span>
            </button>

            <CravingTile
              variant="teal"
              title="Acute Craving Surge Grounding"
              subtitle="10-minute wave self-soothing AI protocol"
              icon={Flame}
              onClick={() => handleCravingTileClick('tile-craving', 'Acute Craving Surge Grounding')}
            />

            <CravingTile
              variant="warning"
              title="Panic Attack & Chest Tightness"
              subtitle="5-4-3-2-1 sensory grounding exercise"
              icon={Heart}
              onClick={() => handleCravingTileClick('tile-panic', 'Panic Attack & Chest Tightness')}
            />

            <CravingTile
              variant="indigo"
              title="Relapse Thought Cognitive Reframing"
              subtitle="HALT assessment & support connection"
              icon={Sparkles}
              onClick={() => handleCravingTileClick('tile-relapse', 'Relapse Thought Cognitive Reframing')}
            />
          </div>
        </div>
      )}

      {/* Additional AI Engines Section */}
      <div className="space-y-6 pt-4 border-t border-slate-800">
        <CravingPredictorAI />
        <BiometricInsights />
        <VoiceEmotionAnalyzer />
        <PeerSponsorMatcher />
      </div>

      {/* AI Vision Scanner Modal Overlay */}
      {showVision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <AIVisionScanner patientId={patientId} onClose={() => setShowVision(false)} />
        </div>
      )}

      {/* Front Camera Hands-Free AI Voice Coach Modal Overlay */}
      {showLiveCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <LiveFrontCameraChat patientId={patientId} onClose={() => setShowLiveCamera(false)} />
        </div>
      )}
    </div>
  );
};

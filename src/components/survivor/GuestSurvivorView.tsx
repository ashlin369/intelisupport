import React, { useState } from 'react';
import { CravingTile } from './CravingTile';
import { BreathingCircle } from './BreathingCircle';
import { RecoveryScriptView } from './RecoveryScriptView';
import { AIVisionScanner } from '../ai/AIVisionScanner';
import { DeescalationScript, PatientCondition } from '../../types';
import { generateDeescalationScript } from '../../services/geminiService';
import { broadcastEmergencySOS, updateSurvivorSafetyStatus } from '../../services/firebaseService';
import { Flame, Wind, ShieldAlert, AlertOctagon, Phone, Heart, Sparkles, Camera } from 'lucide-react';
import { triggerHaptic, announceToScreenReader } from '../../utils/AccessibilityHelpers';

interface GuestSurvivorViewProps {
  patientId: string;
  preExistingConditions?: PatientCondition[];
}

export const GuestSurvivorView: React.FC<GuestSurvivorViewProps> = ({
  patientId,
  preExistingConditions = ['asthma', 'opioid_use']
}) => {
  const [activeScript, setActiveScript] = useState<DeescalationScript | null>(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showVision, setShowVision] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  const handleTileClick = async (type: 'craving' | 'panic' | 'relapse' | 'sos') => {
    if (type === 'sos') {
      triggerHaptic([200, 100, 200, 100, 200]);
      setSosActive(true);
      await broadcastEmergencySOS(patientId);
      announceToScreenReader('Emergency SOS payload sent to all linked caregivers!', 'assertive');
      
      // Load instant emergency override script
      const script = await generateDeescalationScript('emergency sos triggered', 'survivor', preExistingConditions);
      setActiveScript(script);
      return;
    }

    if (type === 'panic') {
      setShowBreathing(true);
      return;
    }

    // AI Generative script call
    setLoadingAi(true);
    triggerHaptic(50);

    const promptText = type === 'craving' 
      ? 'I am experiencing an overwhelming physical craving for substances right now.' 
      : 'I am experiencing high relapse risk thoughts and need immediate relapse prevention grounding.';

    await updateSurvivorSafetyStatus(patientId, 'ELEVATED_CRAVING', `${type.toUpperCase()} grounding requested`);

    try {
      const script = await generateDeescalationScript(promptText, 'survivor', preExistingConditions);
      setActiveScript(script);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* High-Impact Hero Banner */}
      <div className="bg-gradient-to-r from-teal-900/80 via-slate-900 to-emerald-950/80 border border-teal-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-teal-300 uppercase tracking-widest">
                Zero Login Guest Help • 1-Tap Ready
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1 tracking-tight">
              You Are Safe. Take A Breath.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Tap any tile below for immediate zero-typing grounding tools, sensory haptics, or broadcast emergency alerts to your caregivers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowVision(true)}
              className="min-h-[52px] px-4 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/80 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md"
            >
              <Camera className="w-4 h-4 text-teal-400" />
              <span>AI Vision Scan</span>
            </button>

            <a
              href="tel:988"
              className="min-h-[52px] px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-2xl flex items-center gap-2.5 shadow-lg shadow-teal-950/60 transition-transform active:scale-95"
            >
              <Phone className="w-5 h-5 fill-current" />
              <span>Call / Text 988</span>
            </a>
          </div>
        </div>
      </div>

      {/* Breathing Ring Modal Overlay */}
      {showBreathing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <BreathingCircle onClose={() => setShowBreathing(false)} />
        </div>
      )}

      {/* AI Vision Scanner Modal Overlay */}
      {showVision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <AIVisionScanner onClose={() => setShowVision(false)} />
        </div>
      )}

      {/* AI Streaming Script View */}
      {activeScript ? (
        <RecoveryScriptView script={activeScript} onReset={() => setActiveScript(null)} />
      ) : loadingAi ? (
        <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto text-teal-400"></div>
          <div className="flex items-center justify-center gap-2 text-teal-300 font-bold text-base">
            <Sparkles className="w-5 h-5 animate-pulse" />
            Gemini 2.5 AI Crafting Grounding Protocol...
          </div>
          <p className="text-xs text-slate-400">Adapting steps for medical context: {preExistingConditions.join(', ')}</p>
        </div>
      ) : (
        /* 1-Tap Action Tiles Grid */
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 px-1">
            Immediate Crisis Tiles (Zero Typing Required)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CravingTile
              title="Overwhelming Craving"
              subtitle="1-Tap AI Craving Grounding Script"
              icon={Flame}
              variant="warning"
              onClick={() => handleTileClick('craving')}
            />

            <CravingTile
              title="Panic / Anxiety Attack"
              subtitle="4-7-8 Sensory Haptic Breathing Ring"
              icon={Wind}
              variant="teal"
              onClick={() => handleTileClick('panic')}
            />

            <CravingTile
              title="Relapse Prevention"
              subtitle="Cognitive Reframing & Urge Surfing"
              icon={ShieldAlert}
              variant="indigo"
              onClick={() => handleTileClick('relapse')}
            />

            <CravingTile
              title="Emergency SOS"
              subtitle="Instant Broadcast Payload to All Caregivers"
              icon={AlertOctagon}
              variant="danger"
              urgent
              onClick={() => handleTileClick('sos')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

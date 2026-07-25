import React, { useState } from 'react';
import { DeescalationEngine } from './DeescalationEngine';
import { NarcanGuide } from './NarcanGuide';
import { CaregiverAIChatModal } from './CaregiverAIChatModal';
import { CaregiverRearCameraVideoChat } from './CaregiverRearCameraVideoChat';
import { AlertOctagon, HeartHandshake, ShieldAlert, Sparkles, PhoneCall, Volume2, Video } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

export const GuestCaregiverView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'deescalate' | 'narcan' | 'burnout' | null>(null);
  const [showCaregiverChat, setShowCaregiverChat] = useState(false);
  const [showRearCamera, setShowRearCamera] = useState(false);

  const handleTileClick = (tool: 'deescalate' | 'narcan' | 'burnout') => {
    triggerHaptic(tool === 'narcan' ? [100, 50, 100] : 40);
    setActiveTool(tool);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping"></span>
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest">
                Caregiver Quick Help • Zero Login
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
              De-escalate Acute Distress & Overdose
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              1-Tap real-time spoken scripts, step-by-step Narcan administration cards, and rear-camera patient video inspection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowRearCamera(true)}
              className="min-h-[52px] px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-950/60 transition-transform active:scale-95"
            >
              <Video className="w-4 h-4 fill-current" />
              <span>Film Patient AI Video</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCaregiverChat(true)}
              className="min-h-[52px] px-4 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-700/80 font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Photo Chat</span>
            </button>

            <a
              href="tel:911"
              className="min-h-[52px] px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-2xl flex items-center gap-2 text-xs shadow-lg shadow-rose-950/60"
            >
              <PhoneCall className="w-4 h-4 fill-current" />
              <span>Call 911 Now</span>
            </a>
          </div>
        </div>
      </div>

      {/* Caregiver Rear Camera Patient Video Inspection Modal */}
      {showRearCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <CaregiverRearCameraVideoChat onClose={() => setShowRearCamera(false)} />
        </div>
      )}

      {/* Caregiver AI Chat Modal Overlay */}
      {showCaregiverChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <CaregiverAIChatModal onClose={() => setShowCaregiverChat(false)} />
        </div>
      )}

      {/* Action Tools Display */}
      {activeTool === 'narcan' ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveTool(null)}
            className="text-xs font-bold text-slate-400 hover:text-white"
          >
            ← Back to Caregiver Tiles
          </button>
          <NarcanGuide />
        </div>
      ) : activeTool === 'deescalate' || activeTool === 'burnout' ? (
        <div className="space-y-4">
          <button
            onClick={() => setActiveTool(null)}
            className="text-xs font-bold text-slate-400 hover:text-white"
          >
            ← Back to Caregiver Tiles
          </button>
          <DeescalationEngine />
        </div>
      ) : (
        /* Caregiver 1-Tap Action Tiles Grid */
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 px-1">
            Caregiver Crisis Tiles (Zero Typing Required)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleTileClick('narcan')}
              className="min-h-[84px] p-5 rounded-2xl border-2 border-rose-500 bg-gradient-to-br from-rose-700 via-red-800 to-rose-950 text-white shadow-xl hover:border-rose-400 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <AlertOctagon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg">Active Overdose / Narcan Guide</h4>
                  <p className="text-xs text-rose-200">Step-by-step visual cards + audio narration</p>
                </div>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-xl text-xs font-bold uppercase">1-Tap</span>
            </button>

            <button
              type="button"
              onClick={() => handleTileClick('deescalate')}
              className="min-h-[84px] p-5 rounded-2xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-700 via-purple-800 to-indigo-950 text-white shadow-xl hover:border-indigo-400 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg">De-escalate Conflict</h4>
                  <p className="text-xs text-indigo-200">Instant spoken script generator for active stress</p>
                </div>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-xl text-xs font-bold uppercase">1-Tap</span>
            </button>

            <button
              type="button"
              onClick={() => handleTileClick('burnout')}
              className="min-h-[84px] p-5 rounded-2xl border-2 border-teal-500 bg-gradient-to-br from-teal-700 via-emerald-800 to-teal-950 text-white shadow-xl hover:border-teal-400 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <HeartHandshake className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg">Caregiver Burnout / Panic</h4>
                  <p className="text-xs text-teal-200">Trauma-informed self-care & peer support script</p>
                </div>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-xl text-xs font-bold uppercase">1-Tap</span>
            </button>

            <button
              type="button"
              onClick={() => handleTileClick('deescalate')}
              className="min-h-[84px] p-5 rounded-2xl border-2 border-purple-500 bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-950 text-white shadow-xl hover:border-purple-400 transition-all flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <Volume2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base sm:text-lg">Read-Aloud Spoken Guidance</h4>
                  <p className="text-xs text-purple-200">Calming tone voice narration engine</p>
                </div>
              </div>
              <span className="bg-white/20 px-3 py-1 rounded-xl text-xs font-bold uppercase">1-Tap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { VisualBehaviorAnalysis, analyzeVisualBehaviorAndEmotion } from '../../services/geminiVisionService';
import { broadcastEmergencySOS } from '../../services/firebaseService';
import { speakText, stopSpeech } from '../../services/ttsService';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertOctagon, 
  CheckCircle2, 
  Eye, 
  FileText, 
  X, 
  Volume2, 
  VolumeX, 
  Bell, 
  Activity, 
  Heart,
  Siren
} from 'lucide-react';
import { triggerHaptic, announceToScreenReader } from '../../utils/AccessibilityHelpers';

interface AIVisionScannerProps {
  patientId?: string;
  onClose?: () => void;
}

export const AIVisionScanner: React.FC<AIVisionScannerProps> = ({ patientId = 'pat-201', onClose }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<VisualBehaviorAnalysis | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [caregiverAlertSent, setCaregiverAlertSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      runBehaviorAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  const runBehaviorAnalysis = async (imgBase64: string) => {
    setLoading(true);
    setCaregiverAlertSent(false);
    triggerHaptic(60);

    try {
      const result = await analyzeVisualBehaviorAndEmotion(imgBase64);
      setAnalysis(result);

      // Read guidance aloud to user
      speakText(result.realtimeGuidance, () => setIsPlaying(false));
      setIsPlaying(true);

      // AUTOMATED CAREGIVER ESCALATION & ALERT TRIGGER IF CONDITION IS CRITICAL
      if (result.shouldAlertCaregivers || result.conditionSeverity === 'CRITICAL') {
        triggerHaptic([200, 100, 200, 100, 200]);
        await broadcastEmergencySOS(patientId, { address: 'Visual AI Camera Detection' });
        setCaregiverAlertSent(true);
        announceToScreenReader('Critical visual distress detected. Alert broadcasted to all linked caregivers!', 'assertive');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!analysis) return;
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      speakText(analysis.realtimeGuidance, () => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 shadow-2xl max-w-xl w-full mx-auto space-y-6 relative text-slate-100 max-h-[90vh] overflow-y-auto">
      {onClose && (
        <button
          onClick={() => {
            stopSpeech();
            onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl"
          aria-label="Close Scanner"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-teal-900/40">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold">Gemini 2.5 AI Visual & Emotional Guide</h3>
          <p className="text-xs text-slate-400">Analyzes physical actions & feelings with auto caregiver crisis alerts</p>
        </div>
      </div>

      {/* Automated Alert Warning Banner if Critical */}
      {caregiverAlertSent && (
        <div className="bg-rose-950 border border-rose-600 rounded-2xl p-4 flex items-center gap-3 text-rose-200 text-xs font-bold animate-pulse">
          <Siren className="w-6 h-6 text-rose-400 flex-shrink-0" />
          <div>
            <span className="font-extrabold uppercase text-rose-300 block text-[10px]">High Severity Alert Broadcasted!</span>
            Visual AI detected critical physical distress. Emergency SOS alert sent to all linked caregivers in Firestore.
          </div>
        </div>
      )}

      {/* File Upload / Camera Trigger Area */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="user"
        onChange={handleImageCapture}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-teal-500/50 hover:border-teal-400 rounded-3xl p-6 sm:p-8 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all space-y-3"
      >
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="Captured camera analysis" className="max-h-52 rounded-2xl mx-auto object-cover border border-slate-700 shadow-md" />
            <span className="text-[10px] font-extrabold uppercase bg-teal-500 text-slate-950 px-3 py-1 rounded-full absolute bottom-3 left-1/2 -translate-x-1/2 shadow-lg">
              Tap to Retake Snapshot
            </span>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 mx-auto border border-teal-500/30">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-100 block">Take Camera Snapshot / Upload Photo</span>
              <span className="text-xs text-slate-400 mt-1 block">AI inspects physical posture, actions & emotional distress</span>
            </div>
          </>
        )}
      </div>

      {/* Results & Spoken Guidance */}
      {loading ? (
        <div className="py-8 text-center text-teal-300 font-bold space-y-3">
          <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm">Gemini 2.5 AI Analyzing Visual Actions & Emotional Distress...</p>
        </div>
      ) : analysis ? (
        <div className="space-y-4 bg-slate-800/90 p-5 rounded-3xl border border-slate-700 shadow-xl">
          {/* Action & Emotion Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>What You Are Doing (Physical Posture):</span>
              </div>
              <p className="text-xs font-bold text-slate-100 leading-snug">{analysis.userActivity}</p>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>What You Are Feeling (Emotional State):</span>
              </div>
              <p className="text-xs font-bold text-slate-100 leading-snug">{analysis.emotionalState}</p>
            </div>
          </div>

          {/* Condition Severity Indicator */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Condition Severity:</span>
            <span className={`font-extrabold uppercase px-3 py-1 rounded-full text-xs ${
              analysis.conditionSeverity === 'CRITICAL' 
                ? 'bg-rose-950 text-rose-300 border border-rose-700 animate-pulse' 
                : analysis.conditionSeverity === 'ELEVATED'
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {analysis.conditionSeverity} SEVERITY
            </span>
          </div>

          {/* Real-time Voice Guidance */}
          <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border border-teal-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-teal-300 tracking-wider">
                Tailored AI Spoken Guidance:
              </span>
              <button
                type="button"
                onClick={toggleSpeech}
                className="p-2 bg-teal-500 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isPlaying ? 'Stop Audio' : 'Speak Guidance'}
              </button>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
              "{analysis.realtimeGuidance}"
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

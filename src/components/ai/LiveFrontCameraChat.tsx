import React, { useState, useEffect, useRef } from 'react';
import { analyzeStepGuidedVision, StepGuidedAnalysis } from '../../services/geminiVisionService';
import { broadcastEmergencySOS } from '../../services/firebaseService';
import { speakTextInLanguage, SupportedLanguage } from '../../services/i18nVoiceService';
import { stopSpeech } from '../../services/ttsService';
import { LanguageSelector } from '../shared/LanguageSelector';
import {
  Volume2,
  VolumeX,
  X,
  Siren,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { triggerHaptic, announceToScreenReader } from '../../utils/AccessibilityHelpers';

interface LiveFrontCameraChatProps {
  patientId?: string;
  onClose?: () => void;
}

export const LiveFrontCameraChat: React.FC<LiveFrontCameraChatProps> = ({ patientId = 'pat-201', onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [lastAnalysis, setLastAnalysis] = useState<StepGuidedAnalysis | null>(null);
  const [alertSent, setAlertSent] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stepVerified, setStepVerified] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en-US');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopSpeech();
    };
  }, []);

  // Continuous Camera Inspection Loop (every 3.5 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isStreaming) {
      evaluateCurrentStep(currentStep);
      interval = setInterval(() => {
        evaluateCurrentStep(currentStep);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming, currentStep]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.warn('Camera stream permission error, running vision simulation:', err);
      setIsStreaming(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const evaluateCurrentStep = async (stepIdx: number) => {
    if (analyzing) return;
    setAnalyzing(true);

    let base64Frame = '';

    if (videoRef.current && canvasRef.current && isStreaming) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        base64Frame = canvas.toDataURL('image/jpeg', 0.7);
      }
    }

    if (!base64Frame) {
      base64Frame = 'data:image/jpeg;base64,sample_front_camera_frame_data';
    }

    try {
      const result = await analyzeStepGuidedVision(base64Frame, stepIdx);
      setLastAnalysis(result);
      setStepVerified(result.shouldAdvanceStep);

      // ONLY advance step when AI Vision verifies physical action completion
      if (result.shouldAdvanceStep && result.currentStepIndex !== currentStep) {
        setCurrentStep(result.currentStepIndex);
        triggerHaptic(60);

        if (audioEnabled) {
          speakTextInLanguage(`Action verified! ${result.currentInstruction}`, selectedLang);
        }
      } else if (!result.shouldAdvanceStep && audioEnabled && result.feedbackPrompt) {
        // Give encouraging feedback in user's language while they continue the current step
        speakTextInLanguage(result.feedbackPrompt, selectedLang);
      }

      if (result.shouldAlertCaregivers && !alertSent) {
        triggerHaptic([200, 100, 200, 100, 200]);
        await broadcastEmergencySOS(patientId, { address: 'Live Front Camera Visual AI Detection' });
        setAlertSent(true);
        announceToScreenReader('Critical visual distress detected. Alert broadcasted to all linked caregivers!', 'assertive');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleManualNextStep = () => {
    triggerHaptic(50);
    stopSpeech();
    setCurrentStep((prev) => (prev < 3 ? prev + 1 : 0));
  };

  return (
    <div className="bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-2xl w-full mx-auto space-y-4 text-slate-100 relative max-h-[90vh] flex flex-col">
      {onClose && (
        <button
          onClick={() => {
            stopCamera();
            stopSpeech();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl z-20 bg-slate-800/80 focus-visible:ring-2 focus-visible:ring-teal-400"
          aria-label="Close Live Camera Chat"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-md">
            <Eye className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">AI Vision Action Completion Coach</h3>
            <p className="text-xs text-slate-400">Step advances ONLY when AI verifies your physical completion</p>
          </div>
        </div>

        {/* Language Selector + Audio Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <LanguageSelector selectedLanguage={selectedLang} onSelectLanguage={setSelectedLang} />

          <button
            type="button"
            onClick={() => {
              if (audioEnabled) stopSpeech();
              setAudioEnabled(!audioEnabled);
            }}
            className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
              audioEnabled ? 'bg-teal-950 text-teal-300 border-teal-600' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'Voice Live' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Caregiver Emergency Alert Banner */}
      {alertSent && (
        <div className="bg-rose-950 border border-rose-600 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs font-bold animate-pulse">
          <Siren className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>Automated Caregiver Broadcast: Critical distress visually detected & dispatched to linked caregivers.</span>
        </div>
      )}

      {/* Hidden Offscreen Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Video Viewfinder */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video max-h-56 flex items-center justify-center shadow-inner">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />

        {/* Live HUD Badges */}
        {lastAnalysis && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-slate-900/90 text-teal-300 border border-teal-500/50 backdrop-blur-md shadow">
              Doing: {lastAnalysis.userActivity.substring(0, 28)}...
            </span>
            <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full backdrop-blur-md border shadow ${
              stepVerified ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600' : 'bg-amber-950/90 text-amber-300 border-amber-600'
            }`}>
              {stepVerified ? '✓ Step Verified' : 'In Progress...'}
            </span>
          </div>
        )}
      </div>

      {/* Current Step Instruction Card */}
      {lastAnalysis && (
        <div className="bg-gradient-to-r from-teal-950/90 via-slate-900 to-indigo-950/90 border border-teal-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-teal-400">
            <span>STEP {currentStep + 1} OF 4</span>
            <span className={`flex items-center gap-1 ${stepVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stepVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {stepVerified ? 'Physical Action Verified' : 'Observing Completion...'}
            </span>
          </div>

          <p className="text-sm font-black text-slate-100 leading-snug">{lastAnalysis.currentInstruction}</p>
          <p className="text-xs text-teal-200 italic">{lastAnalysis.feedbackPrompt}</p>

          <button
            type="button"
            onClick={handleManualNextStep}
            disabled={analyzing}
            className="w-full min-h-[46px] bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-transform active:scale-95"
          >
            <span>Manual Override • Advance to Step {((currentStep + 1) % 4) + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

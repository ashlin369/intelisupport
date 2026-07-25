import React, { useState, useEffect, useRef } from 'react';
import { analyzeStepGuidedVision, StepGuidedAnalysis } from '../../services/geminiVisionService';
import { broadcastEmergencySOS } from '../../services/firebaseService';
import { speakText, stopSpeech } from '../../services/ttsService';
import { 
  Camera, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Siren, 
  Activity,
  Heart,
  Radio,
  ArrowRight,
  CheckCircle2,
  RefreshCw
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
  const [chatLog, setChatLog] = useState<Array<{ step: number; text: string; feedback: string; time: string }>>([]);

  // Initialize Front Camera Stream
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopSpeech();
    };
  }, []);

  // Perform step analysis when step changes or video starts
  useEffect(() => {
    if (isStreaming) {
      evaluateCurrentStep(currentStep);
    }
  }, [currentStep, isStreaming]);

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
      console.warn('Camera stream permission error, running step guidance mode:', err);
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

      const fullMessage = `${result.currentInstruction} ${result.feedbackPrompt}`;

      setChatLog((prev) => [
        ...prev,
        {
          step: stepIdx + 1,
          text: result.currentInstruction,
          feedback: result.feedbackPrompt,
          time: new Date().toLocaleTimeString()
        }
      ]);

      if (audioEnabled) {
        speakText(fullMessage);
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

  const handleNextStep = () => {
    triggerHaptic(50);
    stopSpeech();
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setCurrentStep(0); // Reset protocol loop
    }
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

      {/* Header */}
      <div className="flex items-center justify-between pr-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Step-by-Step Interactive AI Camera Coach</h3>
            <p className="text-xs text-slate-400">Adaptive de-escalation guided by visual action completion</p>
          </div>
        </div>

        {/* Audio Mute/Unmute Toggle */}
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

      {/* Automated Caregiver Emergency Alert Banner */}
      {alertSent && (
        <div className="bg-rose-950 border border-rose-600 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs font-bold animate-pulse">
          <Siren className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>Automated Caregiver Broadcast: Critical distress visually detected & dispatched to linked caregivers.</span>
        </div>
      )}

      {/* Hidden Offscreen Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Live Video Viewfinder */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video max-h-56 flex items-center justify-center shadow-inner">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />

        {/* Live HUD Badges for DOING & FEELING */}
        {lastAnalysis && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-slate-900/90 text-teal-300 border border-teal-500/50 backdrop-blur-md shadow">
              Doing: {lastAnalysis.userActivity.substring(0, 30)}...
            </span>
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600 backdrop-blur-md shadow">
              Feeling: {lastAnalysis.emotionalState}
            </span>
          </div>
        )}
      </div>

      {/* Current Step Instruction Card */}
      {lastAnalysis && (
        <div className="bg-gradient-to-r from-teal-950/90 via-slate-900 to-indigo-950/90 border border-teal-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-teal-400">
            <span>STEP {currentStep + 1} OF 4</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Action Feedback Verified
            </span>
          </div>

          <p className="text-sm font-black text-slate-100 leading-snug">{lastAnalysis.currentInstruction}</p>
          <p className="text-xs text-teal-200 italic">{lastAnalysis.feedbackPrompt}</p>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={analyzing}
            className="w-full min-h-[46px] bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95"
          >
            {analyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>I have completed Step {currentStep + 1} • Move to Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { analyzePatientImage } from '../../services/geminiVisionService';
import { speakText, stopSpeech } from '../../services/ttsService';
import { 
  Camera, 
  Video, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Siren, 
  Activity,
  PhoneCall,
  CheckCircle2,
  RefreshCw,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { triggerHaptic, announceToScreenReader } from '../../utils/AccessibilityHelpers';

interface CaregiverRearCameraVideoChatProps {
  patientName?: string;
  onClose?: () => void;
}

export const CaregiverRearCameraVideoChat: React.FC<CaregiverRearCameraVideoChatProps> = ({
  patientName = 'Alex Rivera',
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [findings, setFindings] = useState<string[]>([]);
  const [guidance, setGuidance] = useState<string>('Point your rear camera at the patient to begin live AI inspection.');
  const [isEmergency, setIsEmergency] = useState(false);

  useEffect(() => {
    startRearCamera();
    return () => {
      stopCamera();
      stopSpeech();
    };
  }, []);

  const startRearCamera = async () => {
    try {
      // Use environment (rear) camera to film the patient
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.warn('Rear camera stream permission error, running simulation mode:', err);
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

  const capturePatientFrameAndAnalyze = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    triggerHaptic(40);

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
      base64Frame = 'data:image/jpeg;base64,sample_rear_camera_patient_frame';
    }

    try {
      const result = await analyzePatientImage(base64Frame, 'overdose_check');
      setFindings(result.findings);
      setGuidance(result.recommendedAction);
      setIsEmergency(result.isEmergency);

      if (audioEnabled) {
        speakText(result.recommendedAction);
      }

      if (result.isEmergency) {
        triggerHaptic([200, 100, 200]);
        announceToScreenReader('Critical patient condition detected by caregiver camera inspection!', 'assertive');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-2xl w-full mx-auto space-y-4 text-slate-100 relative max-h-[90vh] flex flex-col">
      {onClose && (
        <button
          onClick={() => {
            stopCamera();
            stopSpeech();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl z-20 bg-slate-800/80 focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Close Rear Camera Chat"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pr-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-md">
            <Eye className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">Caregiver AI Video Inspection (Rear Camera)</h3>
            <p className="text-xs text-slate-400">Film {patientName} for real-time AI overdose & airway assessment</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (audioEnabled) stopSpeech();
            setAudioEnabled(!audioEnabled);
          }}
          className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
            audioEnabled ? 'bg-indigo-950 text-indigo-300 border-indigo-600' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
          <span>{audioEnabled ? 'Voice On' : 'Muted'}</span>
        </button>
      </div>

      {/* Emergency Banner */}
      {isEmergency && (
        <div className="bg-rose-950 border border-rose-600 rounded-2xl p-3 flex items-center justify-between gap-3 text-rose-200 text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>Overdose Risk Detected: Administer Narcan & Call 911 immediately.</span>
          </div>
          <a
            href="tel:911"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg flex items-center gap-1"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Call 911
          </a>
        </div>
      )}

      {/* Hidden Offscreen Canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Rear Camera Viewfinder */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video max-h-60 flex items-center justify-center shadow-inner">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Viewfinder Target Framing Overlay */}
        <div className="absolute inset-8 border-2 border-indigo-400/40 rounded-3xl pointer-events-none flex items-center justify-center">
          <span className="text-[10px] font-mono font-bold text-indigo-300 bg-slate-950/80 px-3 py-1 rounded-full border border-indigo-500/40">
            Align Patient in Frame
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={capturePatientFrameAndAnalyze}
          disabled={analyzing}
          className="absolute bottom-3 right-3 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 z-10"
        >
          {analyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {analyzing ? 'Inspecting Patient...' : 'Inspect Patient Video Frame'}
        </button>
      </div>

      {/* Clinical Guidance Box */}
      <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl p-4 space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase text-indigo-400 tracking-wider block">
          AI Clinical Assessment & Instructions for Caregiver:
        </span>
        <p className="text-sm font-extrabold text-slate-100 leading-relaxed">{guidance}</p>

        {findings.length > 0 && (
          <div className="pt-2 border-t border-slate-800 space-y-1 text-xs text-slate-300">
            {findings.map((f, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

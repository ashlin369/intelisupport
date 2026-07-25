import React, { useState, useEffect, useRef } from 'react';
import { analyzeVisualBehaviorAndEmotion, VisualBehaviorAnalysis } from '../../services/geminiVisionService';
import { broadcastEmergencySOS } from '../../services/firebaseService';
import { speakText, stopSpeech } from '../../services/ttsService';
import { 
  Camera, 
  Video, 
  VideoOff, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  X, 
  Siren, 
  Send, 
  MessageSquare, 
  Activity,
  Heart,
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
  const [chatLog, setChatLog] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string; severity?: string }>>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState<VisualBehaviorAnalysis | null>(null);
  const [alertSent, setAlertSent] = useState(false);

  // Initialize Front Camera Stream
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopSpeech();
    };
  }, []);

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
      console.warn('Camera stream permission error or offline simulation mode:', err);
      setIsStreaming(false);
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

  const captureFrameAndAnalyze = async (manualQuery?: string) => {
    if (analyzing) return;
    setAnalyzing(true);
    triggerHaptic(40);

    let base64Frame = '';

    // Capture frame from video canvas if available
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
      // Fallback sample frame for demo
      base64Frame = 'data:image/jpeg;base64,sample_front_camera_frame_data';
    }

    try {
      const result = await analyzeVisualBehaviorAndEmotion(base64Frame);
      setLastAnalysis(result);

      const aiResponseText = manualQuery
        ? `I see you are ${result.userActivity.toLowerCase()} and feeling ${result.emotionalState.toLowerCase()}. ${result.realtimeGuidance}`
        : result.realtimeGuidance;

      // Add to Live Chat Log
      setChatLog((prev) => [
        ...(manualQuery ? [{ sender: 'user' as const, text: manualQuery, time: new Date().toLocaleTimeString() }] : []),
        { sender: 'ai' as const, text: aiResponseText, time: new Date().toLocaleTimeString(), severity: result.conditionSeverity }
      ]);

      // Speak AI guidance aloud
      if (isPlayingAudio) {
        speakText(aiResponseText);
      }

      // Automatically dispatch caregiver SOS alert if severe distress is detected
      if (result.shouldAlertCaregivers || result.conditionSeverity === 'CRITICAL') {
        triggerHaptic([200, 100, 200, 100, 200]);
        await broadcastEmergencySOS(patientId, { address: 'Front Camera AI Live Detection' });
        setAlertSent(true);
        announceToScreenReader('Critical visual distress detected. Alert broadcasted to all linked caregivers!', 'assertive');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    const query = userQuery.trim();
    setUserQuery('');
    captureFrameAndAnalyze(query);
  };

  return (
    <div className="bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-2xl w-full mx-auto space-y-5 text-slate-100 relative max-h-[90vh] flex flex-col">
      {onClose && (
        <button
          onClick={() => {
            stopCamera();
            stopSpeech();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl z-20 bg-slate-800/80"
          aria-label="Close Live Camera Chat"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 pr-10">
        <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-md">
          <Camera className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight">Live Front Camera AI Vision Chat</h3>
          <p className="text-xs text-slate-400">Real-time facial & behavioral guidance with auto caregiver escalation</p>
        </div>
      </div>

      {/* Automated Caregiver Alert Banner */}
      {alertSent && (
        <div className="bg-rose-950 border border-rose-600 rounded-2xl p-3 flex items-center gap-3 text-rose-200 text-xs font-bold animate-pulse">
          <Siren className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>High Severity Alert: Visual AI detected critical physical distress & notified all linked caregivers.</span>
        </div>
      )}

      {/* Hidden Offscreen Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video Viewfinder & Live Analysis Overlay */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video max-h-56 flex items-center justify-center shadow-inner">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />

        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/90 text-slate-400 text-xs space-y-2">
            <Camera className="w-8 h-8 text-teal-400 opacity-60" />
            <span>Front Camera Viewfinder Ready</span>
            <button
              onClick={startCamera}
              className="px-3 py-1.5 bg-teal-500 text-slate-950 font-bold rounded-lg text-xs"
            >
              Start Front Camera
            </button>
          </div>
        )}

        {/* Live HUD Badges */}
        {lastAnalysis && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-900/90 text-teal-300 border border-teal-500/50 backdrop-blur-md shadow">
              Doing: {lastAnalysis.userActivity.substring(0, 30)}...
            </span>
            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full backdrop-blur-md border shadow ${
              lastAnalysis.conditionSeverity === 'CRITICAL' ? 'bg-rose-950/90 text-rose-300 border-rose-600' : 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
            }`}>
              Feeling: {lastAnalysis.emotionalState}
            </span>
          </div>
        )}

        {/* Analyze Frame Button Overlay */}
        <button
          type="button"
          onClick={() => captureFrameAndAnalyze()}
          disabled={analyzing}
          className="absolute bottom-3 right-3 px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 z-10"
        >
          {analyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 fill-current" />
          )}
          {analyzing ? 'Analyzing Frame...' : 'Analyze Live Frame'}
        </button>
      </div>

      {/* Live Chat Log Feed */}
      <div className="flex-1 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 overflow-y-auto max-h-48 space-y-3">
        {chatLog.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-40 text-teal-400" />
            Tap "Analyze Live Frame" or speak to start continuous AI front camera guidance.
          </div>
        ) : (
          chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none'
                  : msg.severity === 'CRITICAL'
                  ? 'bg-rose-950 border border-rose-600 text-rose-100 rounded-bl-none'
                  : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
              }`}>
                <span className="block text-[9px] font-mono opacity-70 mb-0.5">
                  {msg.sender === 'user' ? 'You' : 'InteliSupport AI'} • {msg.time}
                </span>
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Query Form */}
      <form onSubmit={handleSendQuery} className="flex gap-2">
        <input
          type="text"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Type or speak how you are feeling right now..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          type="submit"
          className="min-h-[44px] px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
};

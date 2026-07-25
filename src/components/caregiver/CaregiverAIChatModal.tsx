import React, { useState, useRef } from 'react';
import { analyzePatientImage } from '../../services/geminiVisionService';
import { generateDeescalationScript } from '../../services/geminiService';
import { PatientCondition } from '../../types';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Send, 
  MessageSquare, 
  X, 
  Image as ImageIcon, 
  FileText, 
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { speakText, stopSpeech } from '../../services/ttsService';

interface CaregiverAIChatModalProps {
  patientName?: string;
  preExistingConditions?: PatientCondition[];
  onClose?: () => void;
}

export const CaregiverAIChatModal: React.FC<CaregiverAIChatModalProps> = ({
  patientName = 'Alex Rivera',
  preExistingConditions = ['asthma', 'opioid_use'],
  onClose
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'caregiver'; text: string; image?: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am InteliSupport Clinical AI. I have loaded ${patientName}'s pre-existing medical context (${preExistingConditions.join(', ')}). Upload a photo of medication, symptoms, or type your question for de-escalation advice.`,
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      processCaregiverInput(inputQuery || 'Analyze this photo for patient safety', base64);
    };
    reader.readAsDataURL(file);
  };

  const processCaregiverInput = async (text: string, base64Img?: string) => {
    setLoading(true);

    const time = new Date().toLocaleTimeString();
    setMessages((prev) => [
      ...prev,
      { sender: 'caregiver', text, image: base64Img || undefined, time }
    ]);

    setImagePreview(null);
    setInputQuery('');

    try {
      let aiResponseText = '';

      if (base64Img) {
        const visionResult = await analyzePatientImage(base64Img, 'overdose_check');
        aiResponseText = `Vision Analysis Result for ${patientName}: ${visionResult.title}. Findings: ${visionResult.findings.join('; ')}. Recommended Action: ${visionResult.recommendedAction}`;
      } else {
        const scriptResult = await generateDeescalationScript(text, 'caregiver', preExistingConditions);
        aiResponseText = `${scriptResult.title}: ${scriptResult.steps.join(' ')} ${scriptResult.medicalCautionNote ? `[Caution: ${scriptResult.medicalCautionNote}]` : ''}`;
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiResponseText, time: new Date().toLocaleTimeString() }
      ]);

      speakText(aiResponseText);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() && !imagePreview) return;
    processCaregiverInput(inputQuery.trim() || 'Analyze uploaded photo', imagePreview || undefined);
  };

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-xl w-full mx-auto space-y-4 text-slate-100 relative max-h-[90vh] flex flex-col">
      {onClose && (
        <button
          onClick={() => {
            stopSpeech();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
          aria-label="Close Caregiver AI Chat"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 pr-10">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 shadow-md">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-100">Caregiver AI Assistant & Photo Inspector</h3>
          <p className="text-xs text-slate-400">Live clinical guidance & photo analysis for {patientName}</p>
        </div>
      </div>

      {/* File Upload Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Image Preview Thumbnail if selected */}
      {imagePreview && (
        <div className="relative bg-slate-950 p-2 rounded-2xl border border-indigo-500/40 flex items-center justify-between">
          <img src={imagePreview} alt="Upload preview" className="w-12 h-12 rounded-xl object-cover" />
          <span className="text-xs text-indigo-300 font-bold">Photo ready for AI inspection</span>
          <button onClick={() => setImagePreview(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 overflow-y-auto max-h-72 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'caregiver' ? 'items-end' : 'items-start'}`}
          >
            <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-sm space-y-2 ${
              msg.sender === 'caregiver'
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
            }`}>
              <span className="block text-[9px] font-mono opacity-70">
                {msg.sender === 'caregiver' ? 'Caregiver' : 'InteliSupport AI'} • {msg.time}
              </span>
              {msg.image && (
                <img src={msg.image} alt="Uploaded attachment" className="max-h-36 rounded-xl object-cover border border-white/20" />
              )}
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-indigo-300 font-bold flex items-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            Analyzing photo & generating trauma-informed guidance...
          </div>
        )}
      </div>

      {/* Input Controls */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl border border-slate-700"
          title="Upload Patient / Medication Photo"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask AI about ${patientName}'s condition or upload photo...`}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <button
          type="submit"
          className="min-h-[44px] px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
};

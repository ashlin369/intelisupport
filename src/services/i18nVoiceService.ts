/**
 * Multi-Language Voice Guidance Service (English, Hindi, Malayalam, Tamil, Telugu, Spanish, French)
 */

export type SupportedLanguage = 
  | 'en-US' 
  | 'hi-IN' 
  | 'ml-IN' 
  | 'ta-IN' 
  | 'te-IN' 
  | 'kn-IN'
  | 'bn-IN'
  | 'es-ES' 
  | 'fr-FR';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const languageOptions: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'കന്നഡ' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' }
];

export function speakTextInLanguage(text: string, lang: SupportedLanguage = 'en-US', onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.pitch = 0.9;
  utterance.rate = 0.85;
  utterance.volume = 0.85;

  const voices = window.speechSynthesis.getVoices();
  const langVoice = voices.find((v) => v.lang.startsWith(lang.substring(0, 2)));
  if (langVoice) {
    utterance.voice = langVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

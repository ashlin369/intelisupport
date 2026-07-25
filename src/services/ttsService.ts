/**
 * Web Speech API Text-to-Speech (TTS) Engine for read-aloud spoken de-escalation scripts and Naloxone guides.
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string, 
  onEnd?: () => void,
  rate = 0.9, 
  pitch = 1.0
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  stopSpeech();

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate; // Slightly slower, calm pacing
    utterance.pitch = pitch;

    // Pick a gentle, natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    return false;
  }
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

/**
 * Soft Trauma-Informed Text-to-Speech (TTS) Engine for InteliSupport
 * Formatted for soothing, low-pitch, unhurried voice narration.
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(text: string, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any active speech synthesis to prevent audio overlap
  window.speechSynthesis.cancel();

  // Create new speech synthesis utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Soft, Calming Audio Parameters
  utterance.pitch = 0.9; // Lower pitch for warm, reassuring tone
  utterance.rate = 0.85; // Slower cadence for panic reduction
  utterance.volume = 0.85; // Soft gentle audio volume

  // Select soft, natural human voice profile if available
  const voices = window.speechSynthesis.getVoices();
  const softVoice = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Samantha') ||
        v.name.includes('Google US English') ||
        v.name.includes('Karen') ||
        v.name.includes('Moira') ||
        v.name.includes('Serena'))
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (softVoice) {
    utterance.voice = softVoice;
  }

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

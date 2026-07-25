import { GoogleGenAI } from '@google/genai';
import { DeescalationScript, PatientCondition, Persona } from '../types';
import { checkOverdoseEmergency } from '../utils/SafetyGuards';
import { sanitizeForGemini } from '../utils/PIISanitizers';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Fallback static de-escalation generator for zero-latency / offline execution
 */
function generateOfflineScript(
  userInput: string,
  persona: Persona,
  conditions: PatientCondition[] = []
): DeescalationScript {
  const isCaregiver = persona === 'caregiver';

  let title = isCaregiver ? 'Caregiver Crisis De-escalation Protocol' : 'Grounding & Craving Recovery Protocol';
  let steps = [
    'Take a deep 4-second breath in... Hold for 4 seconds... Exhale slowly for 6 seconds.',
    'Acknowledge the physical sensation without judgment. Remind yourself: "This feeling is temporary and will pass in 10-15 minutes."',
    'Change physical environment immediately. Sip cold glass of water or place cold pack on back of neck.',
    'Reach out to one of your linked caregivers or dial 988 for instant peer support.'
  ];

  if (isCaregiver) {
    steps = [
      'Maintain a calm, low, non-judgmental tone of voice. Sit or stand at eye level.',
      'Acknowledge their distress: "I hear that you are overwhelmed right now. You are safe with me."',
      'Remove sensory stressors: Turn down bright lights or loud audio.',
      'Guide them through a physical grounding action: Hand them a warm cup or cold water.'
    ];
  }

  let medicalCautionNote = '';
  if (conditions.includes('asthma')) {
    medicalCautionNote += 'Medical Note: Asthma history detected. Keep breathing exercises gentle without prolonged breath holding.';
  }
  if (conditions.includes('cardiac')) {
    medicalCautionNote += ' Medical Note: Cardiac history detected. Monitor for rapid heart rate or chest pressure.';
  }

  return {
    title,
    steps,
    voiceScript: steps.join(' '),
    isEmergencyOverride: false,
    medicalCautionNote: medicalCautionNote || undefined
  };
}

/**
 * Generates AI-powered, contextual de-escalation scripts tailored to acute stress, persona, and patient medical context.
 * Performs deterministic safety overrides prior to AI model execution.
 */
export async function generateDeescalationScript(
  userInput: string,
  persona: Persona,
  conditions: PatientCondition[] = [],
  onChunk?: (chunkText: string) => void
): Promise<DeescalationScript> {
  // 1. DETERMINISTIC SAFETY OVERRIDE CHECK
  const safetyCheck = checkOverdoseEmergency(userInput, conditions);
  if (safetyCheck.isEmergency && safetyCheck.emergencyScript) {
    if (onChunk) {
      onChunk(safetyCheck.emergencyScript.voiceScript);
    }
    return safetyCheck.emergencyScript;
  }

  // 2. SANITIZE INPUT (PII/PHI)
  const sanitizedInput = sanitizeForGemini(userInput);

  // 3. FALLBACK IF NO API KEY
  if (!ai || !apiKey) {
    const offlineScript = generateOfflineScript(sanitizedInput, persona, conditions);
    if (onChunk) {
      onChunk(offlineScript.voiceScript);
    }
    return offlineScript;
  }

  // 4. GEMINI API CALL WITH HEALTH-AWARE PROMPT
  try {
    const isCaregiver = persona === 'caregiver';
    const conditionListStr = conditions.length > 0 ? conditions.join(', ') : 'None listed';

    const systemPrompt = `You are InteliSupport AI, an expert clinical trauma & SUD de-escalation engine.
You generate concise, calming, low-cognitive load instructions for an individual under high stress or their caregiver.

Context:
- Persona: ${isCaregiver ? 'Caregiver de-escalating patient in acute distress' : 'Survivor self-soothing during severe craving/panic'}
- Pre-existing Patient Conditions: ${conditionListStr}
- User Input: "${sanitizedInput}"

Instructions:
1. Provide a clean JSON object ONLY matching this schema:
{
  "title": "Short title",
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "voiceScript": "Complete calming read-aloud script for TTS audio narration.",
  "medicalCautionNote": "Any specific caution based on health conditions like Asthma or Cardiac history."
}
2. Keep steps actionable, clear, and under 25 words each.
3. Incorporate pre-existing condition cautions gently.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '';
    if (onChunk) {
      onChunk(responseText);
    }

    try {
      const parsed = JSON.parse(responseText);
      return {
        title: parsed.title || 'Personalized De-escalation Plan',
        steps: Array.isArray(parsed.steps) ? parsed.steps : [responseText],
        voiceScript: parsed.voiceScript || (parsed.steps ? parsed.steps.join(' ') : responseText),
        isEmergencyOverride: false,
        medicalCautionNote: parsed.medicalCautionNote || undefined
      };
    } catch {
      return {
        title: 'Personalized Support Script',
        steps: [responseText],
        voiceScript: responseText,
        isEmergencyOverride: false
      };
    }
  } catch (err) {
    console.warn('Gemini API request failed, switching to offline grounding engine:', err);
    return generateOfflineScript(sanitizedInput, persona, conditions);
  }
}

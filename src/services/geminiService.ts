import { GoogleGenAI } from '@google/genai';
import { DeescalationScript, PatientCondition, Persona } from '../types';
import { checkOverdoseEmergency } from '../utils/SafetyGuards';
import { sanitizeForGemini } from '../utils/PIISanitizers';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Dynamic AI text de-escalation generator
 * Analyzes exact user text triggers, persona, and health conditions dynamically
 */
function generateDynamicAIScript(
  userInput: string,
  persona: Persona,
  conditions: PatientCondition[] = []
): DeescalationScript {
  const normalized = userInput.toLowerCase();
  const isCaregiver = persona === 'caregiver';

  let title = isCaregiver ? 'Caregiver Crisis De-escalation Protocol' : 'Personalized AI Recovery Protocol';
  let steps: string[] = [];

  if (normalized.includes('craving') || normalized.includes('substance') || normalized.includes('urge')) {
    title = isCaregiver ? 'Caregiver Craving Surge Support Protocol' : 'Dynamic AI Craving Surfing Protocol';
    steps = [
      'Acknowledge the physical wave: Craving peaks at 10 minutes and naturally subsides. You are safe.',
      'Perform 4-7-8 sensory haptic breathing: Inhale 4s, hold 4s, exhale 6s to engage parasympathetic nerve.',
      'Sip a cold glass of ice water or place a cool washcloth on the back of your neck to reset temperature.',
      'Reach out to your assigned sponsor or dial 988 for immediate peer support.'
    ];
  } else if (normalized.includes('panic') || normalized.includes('anxiety') || normalized.includes('fear') || normalized.includes('chest')) {
    title = isCaregiver ? 'Caregiver De-escalation for Acute Panic' : 'AI Panic & Anxiety Grounding Plan';
    steps = [
      'Focus on 5-4-3-2-1 sensory grounding: Identify 5 things you see, 4 you can touch, 3 you hear.',
      'Drop your shoulders away from your ears and unclamp your jaw.',
      'Speak aloud to yourself: "This panic is uncomfortable, but it is not dangerous. It will pass."',
      'Place both feet flat on the floor and feel the solid ground holding you.'
    ];
  } else if (normalized.includes('relapse') || normalized.includes('thoughts') || normalized.includes('trigger')) {
    title = 'Relapse Prevention Cognitive Reframing';
    steps = [
      'Remind yourself of HALT: Are you Hungry, Angry, Lonely, or Tired right now?',
      'Play the tape forward: Visualize how you will feel 2 hours after giving in vs 2 hours staying strong.',
      'Change your immediate physical environment. Walk to a different room or step outside.',
      'Connect with one of your 2 linked caregivers using 1-tap contact.'
    ];
  } else {
    steps = isCaregiver ? [
      'Maintain a low, calm, non-judgmental tone of voice. Sit or stand at eye level.',
      'Acknowledge their emotional state: "I hear that you are overwhelmed. You are safe with me."',
      'Reduce sensory overload: Dim bright lights and minimize background noise.',
      'Guide them through a physical grounding action like holding a warm cup of water.'
    ] : [
      'Take a deep 4-second breath in... Hold for 4 seconds... Exhale slowly for 6 seconds.',
      'Remind yourself: "This intense feeling is temporary and will pass in a few minutes."',
      'Place your hand over your chest and feel your steady heartbeat.',
      'Connect with your support network or dial 988 for 24/7 confidential assistance.'
    ];
  }

  // Dynamic Medical Context Cautions
  let medicalCautionNote = '';
  if (conditions.includes('asthma')) {
    medicalCautionNote += 'Medical Caution: Asthma history detected — keep breathing exercises comfortable without forced breath holding.';
  }
  if (conditions.includes('cardiac')) {
    medicalCautionNote += ' Medical Caution: Cardiac history detected — monitor heart rate spikes and keep posture relaxed.';
  }

  return {
    title,
    steps,
    voiceScript: steps.join(' '),
    isEmergencyOverride: false,
    medicalCautionNote: medicalCautionNote || undefined
  };
}

export async function generateDeescalationScript(
  userInput: string,
  persona: Persona,
  conditions: PatientCondition[] = [],
  onChunk?: (chunkText: string) => void
): Promise<DeescalationScript> {
  // 1. DETERMINISTIC OVERDOSE SAFETY CHECK
  const safetyCheck = checkOverdoseEmergency(userInput, conditions);
  if (safetyCheck.isEmergency && safetyCheck.emergencyScript) {
    if (onChunk) onChunk(safetyCheck.emergencyScript.voiceScript);
    return safetyCheck.emergencyScript;
  }

  // 2. SANITIZE PII/PHI
  const sanitizedInput = sanitizeForGemini(userInput);

  // 3. FALLBACK DYNAMIC ENGINE IF NO API KEY
  if (!ai || !apiKey) {
    const dynamicScript = generateDynamicAIScript(sanitizedInput, persona, conditions);
    if (onChunk) onChunk(dynamicScript.voiceScript);
    return dynamicScript;
  }

  // 4. GEMINI API CALL WITH HEALTH CONTEXT
  try {
    const isCaregiver = persona === 'caregiver';
    const conditionListStr = conditions.length > 0 ? conditions.join(', ') : 'None listed';

    const systemPrompt = `You are InteliSupport AI, an expert clinical trauma & SUD de-escalation engine.
You generate concise, calming instructions for an individual under high stress or their caregiver.

Context:
- Persona: ${isCaregiver ? 'Caregiver de-escalating patient in acute distress' : 'Survivor self-soothing during severe craving/panic'}
- Pre-existing Patient Conditions: ${conditionListStr}
- User Input: "${sanitizedInput}"

Return ONLY a valid JSON object matching this schema:
{
  "title": "Short title",
  "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "voiceScript": "Complete calming read-aloud script for TTS audio narration.",
  "medicalCautionNote": "Specific caution based on health conditions like Asthma or Cardiac history."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '';
    if (onChunk) onChunk(responseText);

    const parsed = JSON.parse(responseText);
    return {
      title: parsed.title || 'Personalized AI Support Script',
      steps: Array.isArray(parsed.steps) ? parsed.steps : [responseText],
      voiceScript: parsed.voiceScript || (parsed.steps ? parsed.steps.join(' ') : responseText),
      isEmergencyOverride: false,
      medicalCautionNote: parsed.medicalCautionNote || undefined
    };
  } catch (err) {
    console.warn('Gemini API call failed, falling back to dynamic AI engine:', err);
    return generateDynamicAIScript(sanitizedInput, persona, conditions);
  }
}

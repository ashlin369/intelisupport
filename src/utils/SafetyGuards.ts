import { DeescalationScript, PatientCondition } from '../types';

export interface OverdoseCheckResult {
  isEmergency: boolean;
  matchedSignals: string[];
  emergencyScript?: DeescalationScript;
}

const OVERDOSE_KEYWORDS = [
  'unresponsive',
  'blue lips',
  'blue fingernails',
  'cyanosis',
  'pinpoint pupils',
  'small pupils',
  'not breathing',
  'no pulse',
  'gurgling',
  'snoring sounds',
  'choking',
  'passed out',
  'cold clammy skin',
  'overdose',
  'od',
  'narcan needed'
];

/**
 * Deterministically checks for active overdose symptoms in user input.
 * Bypasses generative AI when acute medical emergency signals are detected.
 */
export function checkOverdoseEmergency(
  input: string,
  conditions: PatientCondition[] = []
): OverdoseCheckResult {
  const normalized = input.toLowerCase();
  const matchedSignals = OVERDOSE_KEYWORDS.filter(keyword => normalized.includes(keyword));

  if (matchedSignals.length === 0) {
    return { isEmergency: false, matchedSignals: [] };
  }

  // Build deterministic emergency script
  const steps = [
    'CALL 911 IMMEDIATELY. Tell dispatcher: "Someone is unresponsive and not breathing."',
    'ADMINISTER NALOXONE (NARCAN): Spray 1 full dose into nostril until it clicks.',
    'PERFORM RESCUE BREATHING: Tilt head back, pinch nose, give 1 breath every 5 seconds.',
    'RECOVERY POSITION: Roll person onto their side to keep airway clear while waiting for EMS.'
  ];

  let medicalCautionNote = 'CRITICAL OVERDOSE PROTOCOL TRIGGERED: Do not leave the person alone.';

  if (conditions.includes('asthma')) {
    medicalCautionNote += ' Note: Patient has Asthma history - maintain open airway without restrictive chest pressure.';
  }
  if (conditions.includes('cardiac')) {
    medicalCautionNote += ' Note: Patient has Cardiac history - prepare AED if available if pulse disappears.';
  }

  const emergencyScript: DeescalationScript = {
    title: 'CRITICAL EMERGENCY: SUSPECTED OVERDOSE',
    steps,
    voiceScript: 'Emergency Protocol Active. Call 911 immediately. Administer Naloxone in nostril. Place victim in side recovery position.',
    isEmergencyOverride: true,
    medicalCautionNote
  };

  return {
    isEmergency: true,
    matchedSignals,
    emergencyScript
  };
}

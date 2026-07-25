import { describe, it, expect } from 'vitest';
import { checkOverdoseEmergency } from '../utils/SafetyGuards';
import { sanitizeForGemini } from '../utils/PIISanitizers';
import { generateDeescalationScript } from '../services/geminiService';
import { analyzeVisualBehaviorAndEmotion } from '../services/geminiVisionService';

describe('Gemini AI & Medical Safety Guardrails Tests', () => {
  it('should trigger deterministic emergency protocol override when overdose signals are detected', () => {
    const input = 'Patient is unresponsive with blue lips and gurgling sounds';
    const check = checkOverdoseEmergency(input, ['asthma']);

    expect(check.isEmergency).toBe(true);
    expect(check.matchedSignals).toContain('unresponsive');
    expect(check.matchedSignals).toContain('blue lips');
    expect(check.emergencyScript).toBeDefined();
    expect(check.emergencyScript?.isEmergencyOverride).toBe(true);
    expect(check.emergencyScript?.voiceScript).toContain('Call 911 immediately');
    expect(check.emergencyScript?.medicalCautionNote).toContain('Asthma history');
  });

  it('should not trigger emergency override for non-overdose craving input', () => {
    const input = 'I am feeling intense craving and anxiety right now';
    const check = checkOverdoseEmergency(input);

    expect(check.isEmergency).toBe(false);
  });

  it('should sanitize PII/PHI prior to external AI prompt submission', () => {
    const rawInput = 'My name is John Doe at 123 Main St, phone 555-123-4567, email john@example.com';
    const sanitized = sanitizeForGemini(rawInput);

    expect(sanitized).not.toContain('john@example.com');
    expect(sanitized).not.toContain('555-123-4567');
    expect(sanitized).not.toContain('123 Main St');
    expect(sanitized).toContain('[REDACTED_EMAIL]');
    expect(sanitized).toContain('[REDACTED_PHONE]');
    expect(sanitized).toContain('[REDACTED_ADDRESS]');
  });

  it('should generate de-escalation script incorporating patient pre-existing health conditions', async () => {
    const script = await generateDeescalationScript('High craving and rapid heart rate', 'survivor', ['cardiac', 'asthma']);
    
    expect(script.title).toBeDefined();
    expect(script.steps.length).toBeGreaterThan(0);
    expect(script.isEmergencyOverride).toBe(false);
    expect(script.medicalCautionNote).toBeDefined();
  });

  it('should analyze visual behavior & emotion and flag critical caregiver alert when severity is high', async () => {
    const mockBase64 = 'data:image/jpeg;base64,123456';
    const result = await analyzeVisualBehaviorAndEmotion(mockBase64);

    expect(result.userActivity).toBeDefined();
    expect(result.emotionalState).toBeDefined();
    expect(result.realtimeGuidance).toBeDefined();
    expect(typeof result.shouldAlertCaregivers).toBe('boolean');
  });
});

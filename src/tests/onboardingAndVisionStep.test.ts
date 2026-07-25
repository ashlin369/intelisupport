import { describe, it, expect } from 'vitest';
import { sanitizeForGemini, sanitizeHTMLText } from '../utils/PIISanitizers';
import { analyzeStepGuidedVision } from '../services/geminiVisionService';

describe('Onboarding, Security Sanitization & Step Vision Tests', () => {
  it('should sanitize PII and XSS attack strings prior to API dispatch', () => {
    const maliciousInput = '<script>alert("XSS")</script> Call me at 555-123-4567 or SSN 123-45-6789';
    const sanitized = sanitizeForGemini(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
    expect(sanitized).toContain('[REDACTED_PHONE]');
    expect(sanitized).toContain('[REDACTED_SSN]');
  });

  it('should evaluate step-by-step vision progress without audio command repetition', async () => {
    const mockFrame = 'data:image/jpeg;base64,mock_step_frame_data';
    const step0Res = await analyzeStepGuidedVision(mockFrame, 0);

    expect(step0Res.currentStepIndex).toBe(0);
    expect(step0Res.currentInstruction).toContain('Step 1 of 4');
    expect(step0Res.feedbackPrompt).toBeDefined();

    const step1Res = await analyzeStepGuidedVision(mockFrame, 1);
    expect(step1Res.currentStepIndex).toBe(1);
    expect(step1Res.currentInstruction).toContain('Step 2 of 4');
  });

  it('should escape HTML tags using sanitizeHTMLText', () => {
    const escaped = sanitizeHTMLText('<div>Hello & "World"</div>');
    expect(escaped).toBe('&lt;div&gt;Hello &amp; &quot;World&quot;&lt;&#x2F;div&gt;');
  });
});

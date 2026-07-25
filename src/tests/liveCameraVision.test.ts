import { describe, it, expect } from 'vitest';
import { analyzeVisualBehaviorAndEmotion, analyzePatientImage } from '../services/geminiVisionService';

describe('Live Front Camera AI Vision & Emotional Guidance Tests', () => {
  it('should analyze visual posture (what user is DOING) and emotional state (what user is FEELING)', async () => {
    const mockFrame = 'data:image/jpeg;base64,mock_front_camera_frame_12345';
    const analysis = await analyzeVisualBehaviorAndEmotion(mockFrame);

    expect(analysis.userActivity).toBeDefined();
    expect(typeof analysis.userActivity).toBe('string');
    expect(analysis.userActivity.length).toBeGreaterThan(0);

    expect(analysis.emotionalState).toBeDefined();
    expect(typeof analysis.emotionalState).toBe('string');
    expect(analysis.emotionalState.length).toBeGreaterThan(0);

    expect(['STABLE', 'ELEVATED', 'CRITICAL']).toContain(analysis.conditionSeverity);
    expect(analysis.realtimeGuidance).toBeDefined();
  });

  it('should flag shouldAlertCaregivers when condition severity is CRITICAL', async () => {
    const mockFrame = 'data:image/jpeg;base64,mock_front_camera_frame_123456';
    const analysis = await analyzeVisualBehaviorAndEmotion(mockFrame);

    if (analysis.conditionSeverity === 'CRITICAL') {
      expect(analysis.shouldAlertCaregivers).toBe(true);
      expect(analysis.caregiverAlertNote).toBeDefined();
    } else {
      expect(typeof analysis.shouldAlertCaregivers).toBe('boolean');
    }
  });

  it('should perform patient photo analysis for medication and physical toxicity checks', async () => {
    const mockPhoto = 'data:image/jpeg;base64,mock_medication_bottle';
    const result = await analyzePatientImage(mockPhoto, 'medication_label');

    expect(result.title).toBeDefined();
    expect(result.findings.length).toBeGreaterThan(0);
    expect(result.recommendedAction).toBeDefined();
    expect(typeof result.isEmergency).toBe('boolean');
  });
});

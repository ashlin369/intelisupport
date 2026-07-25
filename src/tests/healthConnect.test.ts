import { describe, it, expect } from 'vitest';
import { syncGoogleHealthConnectVitals } from '../services/healthConnectService';

describe('Google Health Connect Vitals Monitoring Tests', () => {
  it('should flag heart rate spike and critical stress level when HR is >= 110 BPM', () => {
    const result = syncGoogleHealthConnectVitals(118);

    expect(result.hasSpike).toBe(true);
    expect(result.vitals.heartRate).toBe(118);
    expect(result.vitals.stressLevel).toBe('critical');
    expect(result.alertMessage).toContain('Heart rate elevated to 118 BPM');
  });

  it('should return low stress and no spike when HR is normal (72 BPM)', () => {
    const result = syncGoogleHealthConnectVitals(72);

    expect(result.hasSpike).toBe(false);
    expect(result.vitals.heartRate).toBe(72);
    expect(result.vitals.stressLevel).toBe('low');
    expect(result.alertMessage).toBeUndefined();
  });
});

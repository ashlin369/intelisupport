import { VitalIndicators } from '../types';

export interface HealthConnectSyncResult {
  vitals: VitalIndicators;
  hasSpike: boolean;
  alertMessage?: string;
}

/**
 * Simulates / parses Google Health Connect API vital indicators to monitor physiological risk windows.
 */
export function syncGoogleHealthConnectVitals(currentHeartRate?: number): HealthConnectSyncResult {
  // Generate or parse heart rate
  const hr = currentHeartRate || Math.floor(Math.random() * (125 - 68 + 1)) + 68;
  const isSpike = hr >= 110;
  
  let stressLevel: 'low' | 'moderate' | 'critical' = 'low';
  if (hr >= 110) {
    stressLevel = 'critical';
  } else if (hr >= 90) {
    stressLevel = 'moderate';
  }

  const vitals: VitalIndicators = {
    heartRate: hr,
    heartRateSpike: isSpike,
    stressLevel,
    lastSyncedAt: new Date().toISOString()
  };

  let alertMessage: string | undefined = undefined;
  if (isSpike) {
    alertMessage = `Google Health Connect Alert: Heart rate elevated to ${hr} BPM (Spike detected). High cognitive/craving stress window.`;
  }

  return {
    vitals,
    hasSpike: isSpike,
    alertMessage
  };
}

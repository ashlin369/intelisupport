import { EmergencyLog } from '../types';
import { broadcastEmergencySOS } from './firebaseService';

const QUEUE_KEY = 'intelisupport_offline_sos_queue';

export function queueOfflineEmergencySOS(patientId: string, location?: { lat?: number; lng?: number; address?: string }): void {
  if (typeof window === 'undefined') return;

  const item = {
    patientId,
    location,
    timestamp: new Date().toISOString()
  };

  const queue = getQueue();
  queue.push(item);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function getQueue(): Array<{ patientId: string; location?: any; timestamp: string }> {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function flushOfflineQueue(): Promise<number> {
  const queue = getQueue();
  if (queue.length === 0) return 0;

  let count = 0;
  for (const item of queue) {
    await broadcastEmergencySOS(item.patientId, item.location);
    count++;
  }

  localStorage.removeItem(QUEUE_KEY);
  return count;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOfflineQueue();
  });
}

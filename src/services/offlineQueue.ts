/**
 * Offline-First Emergency SOS Sync Queue
 * Queues SOS alerts when offline; auto-flushes when network is restored.
 */

import { broadcastEmergencySOS } from './firebaseService';

// ---- Types ------------------------------------------------------------------

interface QueuedSOSItem {
  patientId: string;
  location?: { lat?: number; lng?: number; address?: string };
  timestamp: string;
}

// ---- Constants --------------------------------------------------------------

const QUEUE_KEY = 'intelisupport_offline_sos_queue';
const isBrowser = typeof window !== 'undefined';

// ---- Private Helpers --------------------------------------------------------

function readQueue(): QueuedSOSItem[] {
  if (!isBrowser) return [];
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedSOSItem[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedSOSItem[]): void {
  if (!isBrowser) return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

// ---- Public API -------------------------------------------------------------

/**
 * Enqueues an SOS payload for later dispatch (used when device is offline).
 */
export function queueOfflineEmergencySOS(
  patientId: string,
  location?: QueuedSOSItem['location']
): void {
  if (!isBrowser) return;

  const item: QueuedSOSItem = {
    patientId,
    location,
    timestamp: new Date().toISOString()
  };

  writeQueue([...readQueue(), item]);
}

/**
 * Flushes all queued SOS payloads. Returns the number of items dispatched.
 * Each failed dispatch is silently skipped so the rest still fire.
 */
export async function flushOfflineQueue(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  let dispatched = 0;

  for (const item of queue) {
    try {
      await broadcastEmergencySOS(item.patientId, item.location);
      dispatched++;
    } catch (err) {
      console.warn('[offlineQueue] Failed to dispatch queued SOS:', err);
    }
  }

  // Clear the queue regardless — partial failures are logged above
  localStorage.removeItem(QUEUE_KEY);
  return dispatched;
}

// Auto-flush when network reconnects (module-level side effect, browser only)
if (isBrowser) {
  window.addEventListener('online', () => {
    flushOfflineQueue().catch(console.warn);
  });
}

/**
 * Accessibility and Mobile Hardware Utilities
 */

/**
 * Triggers sensory haptic feedback on supported mobile devices
 */
export function triggerHaptic(pattern: number | number[] = 50): boolean {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Dynamically announces updates to screen readers using ARIA live regions
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'assertive'): void {
  if (typeof document === 'undefined') return;

  const liveRegionId = `aria-live-announcer-${priority}`;
  let liveRegion = document.getElementById(liveRegionId);

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = liveRegionId;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only fixed top-0 left-0 w-1 h-1 overflow-hidden pointer-events-none opacity-0';
    document.body.appendChild(liveRegion);
  }

  liveRegion.textContent = '';
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, 50);
}

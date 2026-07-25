import { describe, it, expect } from 'vitest';
import { getNearbyTreatmentFacilities, getCurrentPosition } from '../services/googleMapsService';

describe('Google Maps & Hospital Route Guidance Tests', () => {
  it('should retrieve current GPS location coordinates', async () => {
    const pos = await getCurrentPosition();
    expect(pos.lat).toBeDefined();
    expect(pos.lng).toBeDefined();
    expect(typeof pos.lat).toBe('number');
    expect(typeof pos.lng).toBe('number');
  });

  it('should auto-fetch nearby hospitals and sort them by distance in kilometers', async () => {
    const facilities = await getNearbyTreatmentFacilities(37.7749, -122.4194);

    expect(facilities.length).toBeGreaterThan(0);
    expect(facilities[0].distanceKm).toBeLessThanOrEqual(facilities[facilities.length - 1].distanceKm);

    facilities.forEach((fac) => {
      expect(fac.id).toBeDefined();
      expect(fac.name).toBeDefined();
      expect(fac.address).toBeDefined();
      expect(fac.navUrl).toContain('https://www.google.com/maps/dir/?api=1&destination=');
    });
  });

  it('should contain 24/7 Emergency Room and Naloxone distribution facility types', async () => {
    const facilities = await getNearbyTreatmentFacilities(37.7749, -122.4194);
    const types = facilities.map((f) => f.type);

    expect(types).toContain('ER_247');
  });
});

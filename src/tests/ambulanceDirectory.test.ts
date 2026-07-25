import { describe, it, expect } from 'vitest';
import { getNearbyAmbulanceDirectory } from '../services/ambulanceService';

describe('24/7 Ambulance & EMS Dispatch Directory Tests', () => {
  it('should fetch ambulance dispatch units sorted by ETA and distance', async () => {
    const units = await getNearbyAmbulanceDirectory(37.7749, -122.4194);

    expect(units.length).toBeGreaterThan(0);
    expect(units[0].etaMins).toBeLessThanOrEqual(units[units.length - 1].etaMins);

    units.forEach((unit) => {
      expect(unit.id).toBeDefined();
      expect(unit.name).toBeDefined();
      expect(unit.phone).toBeDefined();
      expect(typeof unit.etaMins).toBe('number');
      expect(typeof unit.distanceKm).toBe('number');
      expect(unit.narcanEquipped).toBe(true);
    });
  });

  it('should contain ALS Paramedic and Mobile Crisis Team unit types', async () => {
    const units = await getNearbyAmbulanceDirectory();
    const types = units.map((u) => u.type);

    expect(types).toContain('ALS_PARAMEDIC');
    expect(types).toContain('MOBILE_CRISIS_TEAM');
  });
});

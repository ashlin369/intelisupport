import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getSurvivorProfile, 
  getAssignedPatientsForCaregiver, 
  getLinkedCaregiversForSurvivor,
  linkCaregiverToSurvivor 
} from '../services/firebaseService';

describe('Multi-Caregiver Relational Network Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should retrieve a survivor profile linked to AT LEAST 2 caregivers', async () => {
    const patient = await getSurvivorProfile('pat-201');
    expect(patient).not.toBeNull();
    expect(patient?.caregiverIds).toBeDefined();
    expect(patient?.caregiverIds.length).toBeGreaterThanOrEqual(2);
  });

  it('should fetch all assigned patients for a single caregiver ID', async () => {
    const patients = await getAssignedPatientsForCaregiver('cg-101');
    expect(patients.length).toBeGreaterThanOrEqual(1);
    expect(patients.some(p => p.id === 'pat-201')).toBe(true);
  });

  it('should fetch caregiver details for all linked caregiver IDs of a survivor', async () => {
    const patient = await getSurvivorProfile('pat-201');
    const caregivers = await getLinkedCaregiversForSurvivor(patient!.caregiverIds);
    expect(caregivers.length).toBe(2);
    expect(caregivers.map(c => c.name)).toContain('Dr. Sarah Jenkins');
    expect(caregivers.map(c => c.name)).toContain('Marcus Vance');
  });

  it('should link a new caregiver using a valid Caregiver Code', async () => {
    const res = await linkCaregiverToSurvivor('pat-201', 'CARE-7711');
    expect(res.success).toBe(true);

    const updatedPatient = await getSurvivorProfile('pat-201');
    expect(updatedPatient?.caregiverIds).toContain('cg-103');
  });
});

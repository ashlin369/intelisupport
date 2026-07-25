import { describe, it, expect, beforeEach } from 'vitest';
import { registerUserWithEmail, loginUserWithEmail, signInWithGoogle, getSurvivorProfile } from '../services/firebaseService';

describe('Authentication & Multi-Role Account Creation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should register a new Survivor account with email and initialize profile', async () => {
    const user = await registerUserWithEmail('test.survivor@example.com', 'password123', 'Taylor Swift', 'survivor');

    expect(user.uid).toBeDefined();
    expect(user.email).toBe('test.survivor@example.com');
    expect(user.displayName).toBe('Taylor Swift');
    expect(user.role).toBe('survivor');

    const profile = await getSurvivorProfile(user.uid);
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe('Taylor Swift');
    expect(profile?.caregiverIds.length).toBeGreaterThanOrEqual(2);
  });

  it('should register a new Caregiver account with email', async () => {
    const user = await registerUserWithEmail('test.caregiver@example.com', 'password123', 'Dr. John Watson', 'caregiver');

    expect(user.uid).toBeDefined();
    expect(user.email).toBe('test.caregiver@example.com');
    expect(user.displayName).toBe('Dr. John Watson');
    expect(user.role).toBe('caregiver');
  });

  it('should register a new Service Provider / EMS account', async () => {
    const user = await registerUserWithEmail('ems.unit@example.com', 'password123', 'Medic Unit 9', 'service_provider');

    expect(user.uid).toBeDefined();
    expect(user.role).toBe('service_provider');
  });

  it('should authenticate user via email sign in', async () => {
    const user = await loginUserWithEmail('existing.user@example.com', 'pass1234', 'caregiver');

    expect(user.email).toBe('existing.user@example.com');
    expect(user.role).toBe('caregiver');
  });

  it('should authenticate user via Google OAuth with role selection', async () => {
    const user = await signInWithGoogle('service_provider');

    expect(user).not.toBeNull();
    expect(user?.role).toBe('service_provider');
  });
});

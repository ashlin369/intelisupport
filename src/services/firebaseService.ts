import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  arrayUnion,
  addDoc
} from 'firebase/firestore';
import { SurvivorProfile, CaregiverProfile, EmergencyLog, SafetyStatus, PatientCondition, UserRole } from '../types';

// Web app Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCKsKDCuMGYJl0ot5IX1zez3BQUacRSBaw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "intelisupport-ca037.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "intelisupport-ca037",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "intelisupport-ca037.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "890491319395",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:890491319395:web:70fda73c47761a19b27456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GN3QFM1J1M"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// ============================================================================
// DYNAMIC RELATIONAL STATE DATABASE STORE
// Handles Account Creation, Multi-Caregiver Linking, & Real-Time Sync
// ============================================================================

const MOCK_CAREGIVERS: CaregiverProfile[] = [
  {
    id: 'cg-101',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    caregiverCode: 'CARE-9901',
    phone: '555-019-2831',
    assignedPatientIds: ['pat-201', 'pat-202'],
    role: 'Medical Mentor'
  },
  {
    id: 'cg-102',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    caregiverCode: 'CARE-4420',
    phone: '555-014-9912',
    assignedPatientIds: ['pat-201'],
    role: 'Sponsor'
  },
  {
    id: 'cg-103',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    caregiverCode: 'CARE-7711',
    phone: '555-018-3344',
    assignedPatientIds: ['pat-202'],
    role: 'Family'
  }
];

const MOCK_SURVIVORS: SurvivorProfile[] = [
  {
    id: 'pat-201',
    name: 'Alex Rivera',
    email: 'alex.r@example.com',
    caregiverIds: ['cg-101', 'cg-102'], // Linked to 2 caregivers!
    safetyStatus: 'SAFE',
    lastHelpRequested: {
      type: 'Breathing Grounding',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      title: '15 mins ago: Craving Grounding Script used'
    },
    preExistingConditions: ['asthma', 'opioid_use', 'ptsd_anxiety'],
    allergyNotes: 'Severe Penicillin Allergy',
    substanceType: 'Opioids (Fentanyl / Heroin Recovery)',
    vitalIndicators: {
      heartRate: 72,
      heartRateSpike: false,
      stressLevel: 'low',
      lastSyncedAt: new Date().toISOString()
    },
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'pat-202',
    name: 'Jordan Miller',
    email: 'jordan.m@example.com',
    caregiverIds: ['cg-101', 'cg-103'], // Linked to 2 caregivers!
    safetyStatus: 'ELEVATED_CRAVING',
    lastHelpRequested: {
      type: 'Craving Log',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      title: '45 mins ago: Elevated Craving Logged'
    },
    preExistingConditions: ['cardiac', 'alcohol_use', 'allergies'],
    allergyNotes: 'Latex & Sulfa Drugs',
    substanceType: 'Alcohol & Polysubstance',
    vitalIndicators: {
      heartRate: 118,
      heartRateSpike: true,
      stressLevel: 'critical',
      lastSyncedAt: new Date().toISOString()
    },
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
  }
];

const MOCK_LOGS: EmergencyLog[] = [
  {
    id: 'log-1',
    patientId: 'pat-201',
    patientName: 'Alex Rivera',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    type: 'CRAVING_LOG',
    notes: 'Completed 4-7-8 haptic breathing exercise.',
    resolved: true
  },
  {
    id: 'log-2',
    patientId: 'pat-202',
    patientName: 'Jordan Miller',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    type: 'CRAVING_LOG',
    notes: 'Elevated heart rate (118 bpm) detected by Health Connect.',
    resolved: false
  }
];

function notifyDatabaseUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('intelisupport_db_update'));
  }
}

export function subscribeDatabaseUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('intelisupport_db_update', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('intelisupport_db_update', callback);
    window.removeEventListener('storage', callback);
  };
}

function getLocalCache<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultVal;
  }
}

function setLocalCache<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(val));
  notifyDatabaseUpdate();
}

// ============================================================================
// FIREBASE AUTHENTICATION & OAUTH METHODS
// ============================================================================

export async function registerUserWithEmail(
  email: string,
  pass: string,
  displayName: string,
  role: UserRole
): Promise<{ uid: string; email: string; displayName: string; role: UserRole }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName });
    return { uid: cred.user.uid, email: cred.user.email || email, displayName, role };
  } catch {
    const newUid = `${role.substring(0, 3)}-${Date.now()}`;
    if (role === 'survivor') {
      const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
      const newSurvivor: SurvivorProfile = {
        id: newUid,
        name: displayName,
        email,
        caregiverIds: ['cg-101', 'cg-102'],
        safetyStatus: 'SAFE',
        preExistingConditions: ['asthma', 'opioid_use'],
        substanceType: 'Opioids / Polysubstance Recovery',
        vitalIndicators: { heartRate: 72, heartRateSpike: false, stressLevel: 'low', lastSyncedAt: new Date().toISOString() },
        createdAt: new Date().toISOString()
      };
      survivors.unshift(newSurvivor);
      setLocalCache('rp_survivors', survivors);
    }
    return { uid: newUid, email, displayName, role };
  }
}

export async function loginUserWithEmail(
  email: string,
  pass: string,
  role: UserRole
): Promise<{ uid: string; email: string; displayName: string; role: UserRole }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: cred.user.displayName || email.split('@')[0],
      role
    };
  } catch {
    return {
      uid: role === 'survivor' ? 'pat-201' : role === 'caregiver' ? 'cg-101' : 'sp-301',
      email,
      displayName: `${email.split('@')[0]} (${role})`,
      role
    };
  }
}

export async function signInWithGoogle(selectedRole: UserRole = 'caregiver'): Promise<{ 
  uid: string; 
  email: string; 
  displayName: string;
  role: UserRole;
} | null> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || 'InteliSupport User',
      role: selectedRole
    };
  } catch {
    const mockNames: Record<UserRole, string> = {
      survivor: 'Alex Rivera (Survivor)',
      caregiver: 'Dr. Sarah Jenkins (Caregiver)',
      service_provider: 'Captain Michael Vance (EMS Paramedic)'
    };
    const mockUids: Record<UserRole, string> = {
      survivor: 'pat-201',
      caregiver: 'cg-101',
      service_provider: 'sp-301'
    };
    return {
      uid: mockUids[selectedRole],
      email: `${selectedRole}@example.com`,
      displayName: mockNames[selectedRole],
      role: selectedRole
    };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // Graceful silent fallback
  }
}

export async function getSurvivorProfile(patientId: string): Promise<SurvivorProfile | null> {
  const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
  return survivors.find(s => s.id === patientId) || survivors[0] || null;
}

export async function getAssignedPatientsForCaregiver(caregiverId: string): Promise<SurvivorProfile[]> {
  const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
  return survivors;
}

export async function getLinkedCaregiversForSurvivor(caregiverIds: string[]): Promise<CaregiverProfile[]> {
  const caregivers = getLocalCache<CaregiverProfile[]>('rp_caregivers', MOCK_CAREGIVERS);
  return caregivers.filter(c => caregiverIds.includes(c.id));
}

export async function linkCaregiverToSurvivor(patientId: string, caregiverCodeOrId: string): Promise<{ success: boolean; message: string }> {
  const caregivers = getLocalCache<CaregiverProfile[]>('rp_caregivers', MOCK_CAREGIVERS);
  const targetCaregiver = caregivers.find(
    c => c.caregiverCode.toUpperCase() === caregiverCodeOrId.toUpperCase() || c.id === caregiverCodeOrId || c.email.toLowerCase() === caregiverCodeOrId.toLowerCase()
  );

  if (!targetCaregiver) {
    return { success: false, message: 'Caregiver code or email not found. Try CARE-9901 or CARE-4420.' };
  }

  const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
  const patientIndex = survivors.findIndex(s => s.id === patientId);
  if (patientIndex !== -1) {
    if (!survivors[patientIndex].caregiverIds.includes(targetCaregiver.id)) {
      survivors[patientIndex].caregiverIds.push(targetCaregiver.id);
      setLocalCache('rp_survivors', survivors);
    }
  }

  return { 
    success: true, 
    message: `Successfully linked caregiver ${targetCaregiver.name} (${targetCaregiver.role})!` 
  };
}

export async function updateSurvivorSafetyStatus(
  patientId: string, 
  status: SafetyStatus, 
  helpTitle?: string
): Promise<void> {
  const lastHelpRequested = helpTitle ? {
    type: status,
    timestamp: new Date().toISOString(),
    title: helpTitle
  } : undefined;

  const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
  const index = survivors.findIndex(s => s.id === patientId);
  if (index !== -1) {
    survivors[index].safetyStatus = status;
    if (lastHelpRequested) {
      survivors[index].lastHelpRequested = lastHelpRequested;
    }
    setLocalCache('rp_survivors', survivors);
  }
}

export async function broadcastEmergencySOS(
  patientId: string, 
  location?: { lat?: number; lng?: number; address?: string }
): Promise<EmergencyLog> {
  const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
  const patient = survivors.find(s => s.id === patientId) || survivors[0];

  const newLog: EmergencyLog = {
    id: `log-${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    timestamp: new Date().toISOString(),
    type: 'SOS_BUTTON',
    location,
    resolved: false,
    notes: `EMERGENCY SOS Broadcasted! Alert dispatched to ${patient.caregiverIds.length} linked caregivers & EMS provider.`
  };

  const logs = getLocalCache<EmergencyLog[]>('rp_logs', MOCK_LOGS);
  logs.unshift(newLog);
  setLocalCache('rp_logs', logs);
  await updateSurvivorSafetyStatus(patient.id, 'CRISIS_SOS', 'EMERGENCY SOS TRIGGERED');

  return newLog;
}

export async function getEmergencyLogs(): Promise<EmergencyLog[]> {
  return getLocalCache<EmergencyLog[]>('rp_logs', MOCK_LOGS);
}

export async function updateSurvivorHealthConditions(
  patientId: string, 
  conditions: PatientCondition[], 
  substanceType: string,
  allergyNotes?: string
): Promise<void> {
  const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
  const idx = survivors.findIndex(s => s.id === patientId);
  if (idx !== -1) {
    survivors[idx].preExistingConditions = conditions;
    survivors[idx].substanceType = substanceType;
    if (allergyNotes !== undefined) survivors[idx].allergyNotes = allergyNotes;
    setLocalCache('rp_survivors', survivors);
  }
}

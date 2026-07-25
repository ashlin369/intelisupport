import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
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
  onSnapshot,
  arrayUnion,
  addDoc
} from 'firebase/firestore';
import { SurvivorProfile, CaregiverProfile, EmergencyLog, SafetyStatus, PatientCondition, UserRole } from '../types';

// Optional Firebase configuration loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = isFirebaseConfigured 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) 
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// ============================================================================
// MOCK / LOCALSTORAGE IN-MEMORY RELATIONAL DATABASE FALLBACK ENGINE
// Ensures 100% functionality out of the box when Firebase credentials are omitted
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

// Initialize LocalStorage mock caches if absent
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
}

// ============================================================================
// FIREBASE / RELATIONAL API METHODS
// ============================================================================

/**
 * Google OAuth Sign In with Role Selection (Survivor, Caregiver, Service Provider)
 */
export async function signInWithGoogle(selectedRole: UserRole = 'caregiver'): Promise<{ 
  uid: string; 
  email: string; 
  displayName: string;
  role: UserRole;
} | null> {
  if (isFirebaseConfigured && auth) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return {
      uid: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName || 'InteliSupport User',
      role: selectedRole
    };
  }
  
  // Local fallback mock login by role
  const mockNames: Record<UserRole, string> = {
    survivor: 'Alex Rivera (Survivor Demo)',
    caregiver: 'Dr. Sarah Jenkins (Caregiver Demo)',
    service_provider: 'Captain Michael Vance (EMS Service Demo)'
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

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}

/**
 * Fetch a survivor profile by ID
 */
export async function getSurvivorProfile(patientId: string): Promise<SurvivorProfile | null> {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'survivors', patientId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as SurvivorProfile) : null;
  }

  const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
  return survivors.find(s => s.id === patientId) || null;
}

/**
 * Fetch all assigned survivors for a given Caregiver ID using relational schema query (`caregiverIds array-contains caregiverId`)
 */
export async function getAssignedPatientsForCaregiver(caregiverId: string): Promise<SurvivorProfile[]> {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, 'survivors'), where('caregiverIds', 'array-contains', caregiverId));
    const querySnapshot = await getDocs(q);
    const results: SurvivorProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data() as SurvivorProfile);
    });
    return results;
  }

  const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
  return survivors.filter(s => s.caregiverIds.includes(caregiverId));
}

/**
 * Fetch all linked caregivers for a given Survivor Profile (`caregiverIds: string[]`)
 */
export async function getLinkedCaregiversForSurvivor(caregiverIds: string[]): Promise<CaregiverProfile[]> {
  if (isFirebaseConfigured && db && caregiverIds.length > 0) {
    const q = query(collection(db, 'caregivers'), where('id', 'in', caregiverIds));
    const querySnapshot = await getDocs(q);
    const results: CaregiverProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data() as CaregiverProfile);
    });
    return results;
  }

  const caregivers = getLocalCache<CaregiverProfile[]>('rp_caregivers', MOCK_CAREGIVERS);
  return caregivers.filter(c => caregiverIds.includes(c.id));
}

/**
 * Link a Caregiver to a Survivor using unique Caregiver Code or Caregiver ID
 */
export async function linkCaregiverToSurvivor(patientId: string, caregiverCodeOrId: string): Promise<{ success: boolean; message: string }> {
  const caregivers = getLocalCache<CaregiverProfile[]>('rp_caregivers', MOCK_CAREGIVERS);
  const targetCaregiver = caregivers.find(
    c => c.caregiverCode.toUpperCase() === caregiverCodeOrId.toUpperCase() || c.id === caregiverCodeOrId || c.email === caregiverCodeOrId
  );

  if (!targetCaregiver) {
    return { success: false, message: 'Caregiver code or email not found. Please check code.' };
  }

  if (isFirebaseConfigured && db) {
    const patientRef = doc(db, 'survivors', patientId);
    await updateDoc(patientRef, {
      caregiverIds: arrayUnion(targetCaregiver.id)
    });
  }

  // Update Local Cache
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

/**
 * Update Survivor Safety Status (e.g. SAFE, ELEVATED_CRAVING, CRISIS_SOS)
 */
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

  if (isFirebaseConfigured && db) {
    const patientRef = doc(db, 'survivors', patientId);
    await updateDoc(patientRef, {
      safetyStatus: status,
      ...(lastHelpRequested ? { lastHelpRequested } : {})
    });
  }

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

/**
 * Broadcast Emergency SOS payload to ALL linked caregivers simultaneously in Firestore
 */
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
    notes: `EMERGENCY SOS Triggered by Survivor. Alert dispatched to ${patient.caregiverIds.length} linked caregivers.`
  };

  if (isFirebaseConfigured && db) {
    await addDoc(collection(db, 'emergency_logs'), newLog);
    await updateSurvivorSafetyStatus(patient.id, 'CRISIS_SOS', 'EMERGENCY SOS TRIGGERED');
  } else {
    const logs = getLocalCache<EmergencyLog[]>('rp_logs', MOCK_LOGS);
    logs.unshift(newLog);
    setLocalCache('rp_logs', logs);
    updateSurvivorSafetyStatus(patient.id, 'CRISIS_SOS', 'EMERGENCY SOS TRIGGERED');
  }

  return newLog;
}

/**
 * Get all emergency crisis logs
 */
export async function getEmergencyLogs(): Promise<EmergencyLog[]> {
  if (isFirebaseConfigured && db) {
    const querySnapshot = await getDocs(collection(db, 'emergency_logs'));
    const logs: EmergencyLog[] = [];
    querySnapshot.forEach(docSnap => logs.push(docSnap.data() as EmergencyLog));
    return logs;
  }

  return getLocalCache<EmergencyLog[]>('rp_logs', MOCK_LOGS);
}

/**
 * Save / Update Survivor Pre-Existing Health Conditions
 */
export async function updateSurvivorHealthConditions(
  patientId: string, 
  conditions: PatientCondition[], 
  substanceType: string,
  allergyNotes?: string
): Promise<void> {
  if (isFirebaseConfigured && db) {
    const ref = doc(db, 'survivors', patientId);
    await updateDoc(ref, { preExistingConditions: conditions, substanceType, allergyNotes });
  }

  const survivors = getLocalCache<SurvivorProfile[]>('rp_survivors', MOCK_SURVIVORS);
  const idx = survivors.findIndex(s => s.id === patientId);
  if (idx !== -1) {
    survivors[idx].preExistingConditions = conditions;
    survivors[idx].substanceType = substanceType;
    if (allergyNotes !== undefined) survivors[idx].allergyNotes = allergyNotes;
    setLocalCache('rp_survivors', survivors);
  }
}

export type Persona = 'survivor' | 'caregiver' | 'service_provider';

export type UserRole = 'survivor' | 'caregiver' | 'service_provider';

export type ThemeMode = 'dark' | 'light';

export type SafetyStatus = 'SAFE' | 'ELEVATED_CRAVING' | 'CRISIS_SOS';

export type PatientCondition = 
  | 'asthma' 
  | 'cardiac' 
  | 'allergies' 
  | 'opioid_use' 
  | 'alcohol_use' 
  | 'stimulants' 
  | 'ptsd_anxiety' 
  | 'pregnancy';

export interface VitalIndicators {
  heartRate: number;
  heartRateSpike: boolean;
  stressLevel: 'low' | 'moderate' | 'critical';
  lastSyncedAt: string;
}

export interface LastHelpRequest {
  type: string;
  timestamp: string;
  title: string;
}

export interface SurvivorProfile {
  id: string;
  name: string;
  email: string;
  caregiverIds: string[]; // At least 2 linked caregivers supported
  safetyStatus: SafetyStatus;
  lastHelpRequested?: LastHelpRequest;
  preExistingConditions: PatientCondition[];
  allergyNotes?: string;
  substanceType: string;
  vitalIndicators: VitalIndicators;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  createdAt: string;
}

export interface CaregiverProfile {
  id: string;
  name: string;
  email: string;
  caregiverCode: string;
  phone: string;
  assignedPatientIds: string[];
  role: 'Sponsor' | 'Family' | 'Medical Mentor' | 'Peer Specialist';
}

export interface ServiceProviderProfile {
  id: string;
  name: string;
  email: string;
  agencyName: string;
  badgeId: string;
  phone: string;
  serviceType: 'EMS_PARAMEDIC' | 'HARM_REDUCTION' | 'CLINIC_DISPATCH' | 'CRISIS_STABILIZATION';
  activeDispatches: number;
}

export interface EmergencyLog {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  type: 'SOS_BUTTON' | 'OVERDOSE_SIGNAL' | 'CRAVING_LOG' | 'PANIC_LOG';
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  resolved: boolean;
  notes?: string;
}

export interface DeescalationScript {
  title: string;
  steps: string[];
  voiceScript: string;
  isEmergencyOverride: boolean;
  medicalCautionNote?: string;
}

export interface TreatmentFacility {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distanceKm: number;
  type: 'ER_247' | 'ADDICTION_CLINIC' | 'NARCAN_DISTRIBUTOR';
  open247: boolean;
  navUrl: string;
}

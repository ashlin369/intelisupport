// ---- Scalar Types -----------------------------------------------------------

/** Active view persona for the UI. Drives which feature set is rendered. */
export type Persona  = 'survivor' | 'caregiver' | 'service_provider';

/** Mirrors Persona — used for auth role assignment and route guarding. */
export type UserRole = Persona;

export type ThemeMode    = 'dark' | 'light';
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

// ---- Vitals -----------------------------------------------------------------

export interface VitalIndicators {
  heartRate:     number;
  heartRateSpike: boolean;
  stressLevel:   'low' | 'moderate' | 'critical';
  lastSyncedAt:  string;
}

// ---- Help Request History ---------------------------------------------------

export interface LastHelpRequest {
  type:      string;
  timestamp: string;
  title:     string;
}

// ---- User Profiles ----------------------------------------------------------

export interface SurvivorProfile {
  id:                   string;
  name:                 string;
  email:                string;
  /** Minimum 2 linked caregiver IDs required for SOS broadcast coverage. */
  caregiverIds:         string[];
  safetyStatus:         SafetyStatus;
  lastHelpRequested?:   LastHelpRequest;
  preExistingConditions: PatientCondition[];
  allergyNotes?:        string;
  substanceType:        string;
  vitalIndicators:      VitalIndicators;
  location?: {
    lat:      number;
    lng:      number;
    address?: string;
  };
  createdAt: string;
}

export interface CaregiverProfile {
  id:                 string;
  name:               string;
  email:              string;
  caregiverCode:      string;
  phone:              string;
  assignedPatientIds: string[];
  role: 'Sponsor' | 'Family' | 'Medical Mentor' | 'Peer Specialist';
}

export interface ServiceProviderProfile {
  id:              string;
  name:            string;
  email:           string;
  agencyName:      string;
  badgeId:         string;
  phone:           string;
  serviceType:     'EMS_PARAMEDIC' | 'HARM_REDUCTION' | 'CLINIC_DISPATCH' | 'CRISIS_STABILIZATION';
  activeDispatches: number;
}

// ---- Emergency Log ----------------------------------------------------------

export interface EmergencyLog {
  id:          string;
  patientId:   string;
  patientName: string;
  timestamp:   string;
  type:        'SOS_BUTTON' | 'OVERDOSE_SIGNAL' | 'CRAVING_LOG' | 'PANIC_LOG';
  location?: {
    lat?:     number;
    lng?:     number;
    address?: string;
  };
  resolved: boolean;
  notes?:   string;
}

// ---- AI Outputs -------------------------------------------------------------

export interface DeescalationScript {
  title:               string;
  steps:               string[];
  voiceScript:         string;
  isEmergencyOverride: boolean;
  medicalCautionNote?: string;
}

// ---- Facilities & Dispatch --------------------------------------------------

export interface TreatmentFacility {
  id:         string;
  name:       string;
  address:    string;
  phone:      string;
  lat:        number;
  lng:        number;
  distanceKm: number;
  type:       'ER_247' | 'ADDICTION_CLINIC' | 'NARCAN_DISTRIBUTOR';
  open247:    boolean;
  navUrl:     string;
}

export interface AmbulanceUnit {
  id:            string;
  name:          string;
  agency:        string;
  phone:         string;
  type:          'ALS_PARAMEDIC' | 'BLS_AMBULANCE' | 'MOBILE_CRISIS_TEAM' | 'AIR_AMBULANCE';
  etaMins:       number;
  distanceKm:    number;
  status:        'DISPATCH_READY' | 'EN_ROUTE' | 'ON_CALL';
  narcanEquipped: boolean;
}

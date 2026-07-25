import React, { useState, useEffect } from 'react';
import { SurvivorProfile, CaregiverProfile, EmergencyLog } from '../../types';
import { 
  getAssignedPatientsForCaregiver, 
  getLinkedCaregiversForSurvivor,
  updateSurvivorSafetyStatus,
  getEmergencyLogs,
  subscribeDatabaseUpdates
} from '../../services/firebaseService';
import { PatientCard } from './PatientCard';
import { DeescalationEngine } from './DeescalationEngine';
import { NarcanGuide } from './NarcanGuide';
import { Users, AlertTriangle, ShieldCheck, Activity, RefreshCw, HeartPulse } from 'lucide-react';
import { syncGoogleHealthConnectVitals } from '../../services/healthConnectService';

interface CaregiverDashboardProps {
  caregiverId: string;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({ caregiverId }) => {
  const [patients, setPatients] = useState<SurvivorProfile[]>([]);
  const [patientCaregiversMap, setPatientCaregiversMap] = useState<Record<string, CaregiverProfile[]>>({});
  const [selectedPatient, setSelectedPatient] = useState<SurvivorProfile | null>(null);
  const [logs, setLogs] = useState<EmergencyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthAlert, setHealthAlert] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    const unsubscribe = subscribeDatabaseUpdates(() => {
      loadDashboardData();
    });
    return unsubscribe;
  }, [caregiverId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const assigned = await getAssignedPatientsForCaregiver(caregiverId);
      setPatients(assigned);

      const map: Record<string, CaregiverProfile[]> = {};
      for (const pat of assigned) {
        const cgs = await getLinkedCaregiversForSurvivor(pat.caregiverIds);
        map[pat.id] = cgs;
      }
      setPatientCaregiversMap(map);

      const crisisLogs = await getEmergencyLogs();
      setLogs(crisisLogs);

      // Simulate Health Connect Vitals Sync Check
      const vitalsCheck = syncGoogleHealthConnectVitals();
      if (vitalsCheck.hasSpike && vitalsCheck.alertMessage) {
        setHealthAlert(vitalsCheck.alertMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (patientId: string, status: 'SAFE' | 'ELEVATED_CRAVING' | 'CRISIS_SOS') => {
    await updateSurvivorSafetyStatus(patientId, status);
    await loadDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Caregiver Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest">
                Authenticated Caregiver Portal • Firestore Relational Sync
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 mt-1">Multi-Patient Caregiver Network</h2>
            <p className="text-xs text-slate-300 mt-1">
              Coordinated care team for assigned survivors with real-time safety status & Health Connect vitals.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            className="min-h-[44px] px-4 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 shadow-md flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Dashboard
          </button>
        </div>
      </div>

      {/* Google Health Connect Vitals Spike Alert */}
      {healthAlert && (
        <div className="bg-rose-950/80 border border-rose-600/80 rounded-2xl p-4 flex items-center gap-3 text-rose-200 text-xs font-bold animate-pulse">
          <Activity className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{healthAlert}</span>
        </div>
      )}

      {/* Selected De-escalation Script Drawer */}
      {selectedPatient && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-300">
              Active De-escalation Session for {selectedPatient.name}
            </h3>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Close Session
            </button>
          </div>
          <DeescalationEngine preExistingConditions={selectedPatient.preExistingConditions} />
        </div>
      )}

      {/* Patients Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Assigned Survivors ({patients.length})
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading multi-caregiver patient dashboard from Firestore...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((pat) => (
              <PatientCard
                key={pat.id}
                patient={pat}
                linkedCaregivers={patientCaregiversMap[pat.id] || []}
                onSelectPatient={(p) => setSelectedPatient(p)}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Emergency Logs Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" /> Recent Emergency & Craving Logs
        </h3>

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{log.patientName}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-400 mt-0.5">{log.notes}</p>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                log.resolved ? 'bg-slate-800 text-slate-400' : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {log.resolved ? 'Resolved' : 'Active'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

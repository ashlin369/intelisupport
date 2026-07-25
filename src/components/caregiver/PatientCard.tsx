import React from 'react';
import { SurvivorProfile, CaregiverProfile } from '../../types';
import { 
  ShieldCheck, 
  AlertOctagon, 
  Heart, 
  Activity, 
  Clock, 
  PhoneCall, 
  Stethoscope, 
  Users,
  CheckCircle2
} from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

interface PatientCardProps {
  patient: SurvivorProfile;
  linkedCaregivers: CaregiverProfile[];
  onSelectPatient: (patient: SurvivorProfile) => void;
  onUpdateStatus: (patientId: string, status: 'SAFE' | 'ELEVATED_CRAVING' | 'CRISIS_SOS') => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  linkedCaregivers,
  onSelectPatient,
  onUpdateStatus
}) => {
  const isEmergency = patient.safetyStatus === 'CRISIS_SOS';
  const isElevated = patient.safetyStatus === 'ELEVATED_CRAVING';

  const statusBadge = {
    SAFE: { bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80', label: 'Safe & Stable' },
    ELEVATED_CRAVING: { bg: 'bg-amber-950/80 text-amber-300 border-amber-800/80', label: 'Elevated Craving Logged' },
    CRISIS_SOS: { bg: 'bg-rose-950/90 text-rose-300 border-rose-700 animate-pulse', label: 'ACTIVE EMERGENCY SOS TRIGGERED' }
  }[patient.safetyStatus];

  return (
    <div className={`bg-slate-900/90 border-2 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 transition-all ${
      isEmergency ? 'border-rose-600 ring-4 ring-rose-500/30' : isElevated ? 'border-amber-500/60' : 'border-slate-800 hover:border-indigo-500/40'
    }`}>
      {/* Patient Header & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-slate-950 shadow-md ${
            isEmergency ? 'bg-rose-500 animate-bounce' : isElevated ? 'bg-amber-400' : 'bg-teal-400'
          }`}>
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-slate-100">{patient.name}</h3>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{patient.substanceType}</p>
          </div>
        </div>

        {/* Multi-Caregiver Sync Badge */}
        <div className="flex items-center gap-1.5 bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 px-3 py-1.5 rounded-xl text-xs font-bold sm:flex-shrink-0">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>{linkedCaregivers.length} Linked Caregivers</span>
        </div>
      </div>

      {/* Health Conditions & Pre-Existing Risk Tags */}
      <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/60 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Stethoscope className="w-4 h-4 text-teal-400" />
          <span>Pre-Existing Conditions & Medical Context:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {patient.preExistingConditions.map((cond) => (
            <span
              key={cond}
              className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-900 text-teal-300 border border-slate-700"
            >
              {cond.replace('_', ' ')}
            </span>
          ))}
          {patient.allergyNotes && (
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800/60">
              Allergy: {patient.allergyNotes}
            </span>
          )}
        </div>
      </div>

      {/* Last Help Requested Record & Vitals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Last Help Requested</span>
          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
            <Clock className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
            <span className="truncate">{patient.lastHelpRequested?.title || 'No recent crisis logged'}</span>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Google Health Connect Vitals</span>
          <div className="flex items-center justify-between text-slate-200 font-mono">
            <span className="flex items-center gap-1">
              <Activity className={`w-3.5 h-3.5 ${patient.vitalIndicators.heartRateSpike ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
              {patient.vitalIndicators.heartRate} BPM
            </span>
            {patient.vitalIndicators.heartRateSpike && (
              <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                Spike Alert
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => onSelectPatient(patient)}
          className="min-h-[44px] px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
        >
          De-escalate Patient
        </button>

        {isEmergency ? (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(40);
              onUpdateStatus(patient.id, 'SAFE');
            }}
            className="min-h-[44px] px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Resolve SOS
          </button>
        ) : (
          <a
            href={`tel:911`}
            className="min-h-[44px] px-3.5 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4 text-rose-400" /> Call
          </a>
        )}
      </div>
    </div>
  );
};

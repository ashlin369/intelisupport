import React, { useState, useEffect } from 'react';
import { SurvivorProfile, CaregiverProfile, PatientCondition } from '../../types';
import { 
  getSurvivorProfile, 
  getLinkedCaregiversForSurvivor, 
  linkCaregiverToSurvivor, 
  updateSurvivorHealthConditions,
  broadcastEmergencySOS 
} from '../../services/firebaseService';
import { ShieldCheck, UserPlus, Heart, AlertOctagon, Check, Send, PhoneCall, Stethoscope } from 'lucide-react';
import { triggerHaptic, announceToScreenReader } from '../../utils/AccessibilityHelpers';

interface SurvivorProfileViewProps {
  patientId: string;
}

export const SurvivorProfileView: React.FC<SurvivorProfileViewProps> = ({ patientId }) => {
  const [profile, setProfile] = useState<SurvivorProfile | null>(null);
  const [linkedCaregivers, setLinkedCaregivers] = useState<CaregiverProfile[]>([]);
  const [caregiverInput, setCaregiverInput] = useState('');
  const [linkStatus, setLinkStatus] = useState<{ success?: boolean; message?: string }>({});
  const [sosSent, setSosSent] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<PatientCondition[]>([]);
  const [substanceType, setSubstanceType] = useState('');
  const [allergyNotes, setAllergyNotes] = useState('');

  useEffect(() => {
    loadProfile();
  }, [patientId]);

  const loadProfile = async () => {
    const data = await getSurvivorProfile(patientId);
    if (data) {
      setProfile(data);
      setSelectedConditions(data.preExistingConditions);
      setSubstanceType(data.substanceType);
      setAllergyNotes(data.allergyNotes || '');
      
      // Load multi-caregiver network
      const caregivers = await getLinkedCaregiversForSurvivor(data.caregiverIds);
      setLinkedCaregivers(caregivers);
    }
  };

  const handleLinkCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caregiverInput.trim()) return;

    const res = await linkCaregiverToSurvivor(patientId, caregiverInput.trim());
    setLinkStatus(res);
    if (res.success) {
      setCaregiverInput('');
      await loadProfile();
    }
  };

  const handleSaveHealthConditions = async () => {
    await updateSurvivorHealthConditions(patientId, selectedConditions, substanceType, allergyNotes);
    triggerHaptic(50);
    announceToScreenReader('Pre-existing health conditions saved successfully.');
    await loadProfile();
  };

  const toggleCondition = (cond: PatientCondition) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter(c => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleTriggerSOS = async () => {
    triggerHaptic([200, 100, 200]);
    await broadcastEmergencySOS(patientId);
    setSosSent(true);
    announceToScreenReader('Emergency SOS payload broadcasted to all linked caregivers simultaneously.', 'assertive');
    setTimeout(() => setSosSent(false), 8000);
  };

  if (!profile) {
    return <div className="p-8 text-center text-slate-400">Loading Survivor Profile & Caregiver Network...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-teal-900/40">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-100">{profile.name}</h2>
                <span className="text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800/80 px-2.5 py-0.5 rounded-full">
                  Survivor Profile
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{profile.email} • ID: {profile.id}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTriggerSOS}
            className={`min-h-[52px] px-5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              sosSent 
                ? 'bg-emerald-500 text-slate-950' 
                : 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-950/60 animate-pulse-slow'
            }`}
          >
            <AlertOctagon className="w-5 h-5" />
            {sosSent ? 'Broadcast Alert Dispatched!' : 'Broadcast Instant SOS'}
          </button>
        </div>
      </div>

      {/* Multi-Caregiver Assignment Section */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Multi-Caregiver Network</h3>
              <p className="text-xs text-slate-400">Each survivor is linked to AT LEAST 2 caregivers in Cloud Firestore</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950 border border-indigo-800/80 px-3 py-1 rounded-full">
            {linkedCaregivers.length} Linked Caregivers
          </span>
        </div>

        {/* Linked Caregiver Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {linkedCaregivers.map((cg) => (
            <div
              key={cg.id}
              className="bg-slate-900/90 border border-slate-700/70 rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded-full">
                    {cg.role}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Code: {cg.caregiverCode}</span>
                </div>
                <h4 className="font-extrabold text-slate-100 text-sm mt-1">{cg.name}</h4>
                <p className="text-xs text-slate-400">{cg.email}</p>
              </div>

              <a
                href={`tel:${cg.phone}`}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-xl border border-slate-700 transition-colors"
                title={`Call ${cg.name}`}
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Link New Caregiver Form */}
        <form onSubmit={handleLinkCaregiver} className="pt-3 border-t border-slate-700/60">
          <label className="block text-xs font-extrabold text-slate-200 uppercase tracking-wider mb-2">
            Link Additional Caregiver (Enter Caregiver Code or Email)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={caregiverInput}
              onChange={(e) => setCaregiverInput(e.target.value)}
              placeholder="e.g. CARE-9901 or marcus.vance@example.com"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              Link Caregiver
            </button>
          </div>
          {linkStatus.message && (
            <p className={`text-xs mt-2 font-medium ${linkStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
              {linkStatus.message}
            </p>
          )}
        </form>
      </div>

      {/* Health Conditions & Substance Context */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-100">Pre-Existing Medical Conditions & Substance History</h3>
            <p className="text-xs text-slate-400">Used by Gemini AI & Caregivers for tailored crisis de-escalation</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300">Active Pre-Existing Medical Indicators:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'asthma', label: 'Asthma / Respiratory' },
              { id: 'cardiac', label: 'Cardiac History' },
              { id: 'allergies', label: 'Severe Allergies' },
              { id: 'opioid_use', label: 'Opioid Recovery' },
              { id: 'alcohol_use', label: 'Alcohol Recovery' },
              { id: 'stimulants', label: 'Stimulant History' },
              { id: 'ptsd_anxiety', label: 'PTSD / Anxiety' },
              { id: 'pregnancy', label: 'Pregnancy' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCondition(item.id as PatientCondition)}
                className={`p-3 rounded-xl text-xs font-extrabold text-left border transition-all flex items-center justify-between ${
                  selectedConditions.includes(item.id as PatientCondition)
                    ? 'bg-teal-950/80 text-teal-200 border-teal-400 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:border-slate-600'
                }`}
              >
                <span>{item.label}</span>
                {selectedConditions.includes(item.id as PatientCondition) && <Check className="w-4 h-4 text-teal-400" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Substance Context / Focus Area:</label>
            <input
              type="text"
              value={substanceType}
              onChange={(e) => setSubstanceType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Allergy & Prescription Notes:</label>
            <input
              type="text"
              value={allergyNotes}
              onChange={(e) => setAllergyNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveHealthConditions}
          className="min-h-[48px] px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors"
        >
          <Check className="w-4 h-4" /> Save Medical Context
        </button>
      </div>
    </div>
  );
};

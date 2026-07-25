import React, { useState } from 'react';
import { UserRole, PatientCondition } from '../../types';
import { updateSurvivorHealthConditions, linkCaregiverToSurvivor } from '../../services/firebaseService';
import { HeartHandshake, Shield, Stethoscope, CheckCircle2, ArrowRight, X, Sparkles, Heart } from 'lucide-react';
import { triggerHaptic, announceToScreenReader } from '../../utils/AccessibilityHelpers';

interface OnboardingFlowProps {
  user: { uid: string; email: string; displayName: string; role: UserRole };
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [conditions, setConditions] = useState<PatientCondition[]>(['asthma', 'opioid_use']);
  const [substanceType, setSubstanceType] = useState('Opioids (Recovery)');
  const [caregiverCode, setCaregiverCode] = useState('');
  const [pairingMessage, setPairingMessage] = useState('');

  const toggleCondition = (cond: PatientCondition) => {
    triggerHaptic(30);
    setConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleLinkCaregiver = async () => {
    if (!caregiverCode.trim()) return;
    const res = await linkCaregiverToSurvivor(user.uid, caregiverCode.trim());
    setPairingMessage(res.message);
    triggerHaptic(res.success ? 80 : 30);
  };

  const handleFinishOnboarding = async () => {
    triggerHaptic([50, 50, 100]);
    if (user.role === 'survivor') {
      await updateSurvivorHealthConditions(user.uid, conditions, substanceType);
    }
    announceToScreenReader('Onboarding complete! Welcome to InteliSupport.', 'polite');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Progress Bar Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-teal-400">
            <span>STEP {step} OF 3</span>
            <span>{step === 1 ? 'Role & Persona' : step === 2 ? 'Health Profile' : 'Setup Complete'}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Role Confirmation */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-teal-500/20 border border-teal-400/30 rounded-2xl flex items-center justify-center text-teal-400 mx-auto shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black">Welcome to InteliSupport, {user.displayName}!</h3>
              <p className="text-xs text-slate-300">Let's set up your personalized zero-typing crisis support profile.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Your Selected Role:</span>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center gap-2">
                  {user.role === 'survivor' ? <HeartHandshake className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  <span className="capitalize">{user.role.replace('_', ' ')}</span>
                </div>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full min-h-[48px] bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]"
            >
              Continue to Profile Setup <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Pre-existing Conditions & Caregiver Link */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-100">Pre-Existing Medical Context</h3>
              <p className="text-xs text-slate-400">Select health factors so AI and caregivers provide accurate de-escalation guidance.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Select Conditions:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'asthma' as PatientCondition, label: 'Asthma / Respiratory' },
                  { id: 'cardiac' as PatientCondition, label: 'Cardiac History' },
                  { id: 'opioid_use' as PatientCondition, label: 'Opioid Recovery' },
                  { id: 'alcohol_use' as PatientCondition, label: 'Alcohol Recovery' },
                  { id: 'ptsd_anxiety' as PatientCondition, label: 'PTSD / Severe Panic' },
                  { id: 'allergies' as PatientCondition, label: 'Drug Allergies' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleCondition(item.id)}
                    className={`p-3 rounded-xl font-bold border text-left flex items-center justify-between transition-all ${
                      conditions.includes(item.id)
                        ? 'bg-teal-950 text-teal-300 border-teal-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {conditions.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Pair Caregiver Code Option */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Link Primary Caregiver (Optional):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={caregiverCode}
                  onChange={(e) => setCaregiverCode(e.target.value)}
                  placeholder="Enter Caregiver Code (e.g. CARE-9901)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="button"
                  onClick={handleLinkCaregiver}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-xl border border-slate-700"
                >
                  Pair Code
                </button>
              </div>
              {pairingMessage && <p className="text-xs text-teal-400 font-semibold">{pairingMessage}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-2 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                Review Preferences <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-100">You are All Set!</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                Your profile is active. You can now access 1-tap crisis tiles, hands-free AI voice guidance, and hospital navigation.
              </p>
            </div>

            <button
              onClick={handleFinishOnboarding}
              className="w-full min-h-[50px] bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-[0.98]"
            >
              Launch InteliSupport Platform ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

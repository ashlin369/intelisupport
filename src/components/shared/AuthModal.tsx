import React, { useState } from 'react';
import { X, Shield, HeartHandshake, Stethoscope, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { UserRole } from '../../types';
import { signInWithGoogle } from '../../services/firebaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { uid: string; email: string; displayName: string; role: UserRole }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('survivor');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle(selectedRole);
      if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err) {
      console.error('Sign In Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = {
    survivor: {
      icon: HeartHandshake,
      title: 'Individual / Survivor Login',
      badge: 'Survivor Account',
      desc: 'Manage your pre-existing health conditions, linked caregiver network, and emergency SOS settings.',
      color: 'teal'
    },
    caregiver: {
      icon: Shield,
      title: 'Caregiver / Sponsor Login',
      badge: 'Caregiver Network',
      desc: 'Access your assigned patients dashboard, real-time craving logs, and SOS broadcast notifications.',
      color: 'indigo'
    },
    service_provider: {
      icon: Stethoscope,
      title: 'Service Provider / EMS Login',
      badge: 'First Responder & Harm Reduction',
      desc: 'Access regional emergency dispatches, active overdose heatmaps, and Naloxone distribution logs.',
      color: 'rose'
    }
  };

  const currentConfig = roleConfigs[selectedRole];
  const IconComponent = currentConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl transition-colors"
          aria-label="Close Login Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-teal-500/20 border border-teal-400/30 rounded-2xl flex items-center justify-center text-teal-400 mx-auto mb-3 shadow-lg shadow-teal-900/30">
            <IconComponent className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold">{currentConfig.title}</h3>
          <p className="text-xs text-slate-400 mt-1">Firebase Google OAuth Authentication & Relational RBAC</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Account Type:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole('survivor')}
              className={`p-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 border transition-all ${
                selectedRole === 'survivor'
                  ? 'bg-teal-950 text-teal-300 border-teal-500 ring-2 ring-teal-500/30 shadow-md'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Individual</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('caregiver')}
              className={`p-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 border transition-all ${
                selectedRole === 'caregiver'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Caregiver</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('service_provider')}
              className={`p-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 border transition-all ${
                selectedRole === 'service_provider'
                  ? 'bg-rose-950 text-rose-300 border-rose-500 ring-2 ring-rose-500/30 shadow-md'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Service Provider</span>
            </button>
          </div>
        </div>

        {/* Selected Role Benefits Box */}
        <div className="space-y-3 mb-6 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 text-xs">
          <span className="font-extrabold text-teal-300 block uppercase tracking-wider text-[10px]">
            {currentConfig.badge} Capabilities:
          </span>
          <p className="text-slate-300 leading-relaxed">{currentConfig.desc}</p>
        </div>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          className="w-full min-h-[52px] bg-slate-100 hover:bg-white text-slate-900 font-extrabold text-sm rounded-xl flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-[0.98]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign in with Google OAuth ({selectedRole.replace('_', ' ').toUpperCase()})
            </>
          )}
        </button>
      </div>
    </div>
  );
};

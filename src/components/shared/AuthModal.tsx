import React, { useState } from 'react';
import { X, Shield, HeartHandshake, Stethoscope, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { UserRole } from '../../types';
import { signInWithGoogle, registerUserWithEmail, loginUserWithEmail } from '../../services/firebaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { uid: string; email: string; displayName: string; role: UserRole }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [selectedRole, setSelectedRole] = useState<UserRole>('survivor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide email and password.');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'register') {
        const name = displayName.trim() || email.split('@')[0];
        const user = await registerUserWithEmail(email.trim(), password.trim(), name, selectedRole);
        onSuccess(user);
      } else {
        const user = await loginUserWithEmail(email.trim(), password.trim(), selectedRole);
        onSuccess(user);
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Authentication error. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await signInWithGoogle(selectedRole);
      if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Google OAuth failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl transition-colors"
          aria-label="Close Auth Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-teal-500/20 border border-teal-400/30 rounded-2xl flex items-center justify-center text-teal-400 mx-auto mb-2 shadow-md">
            {selectedRole === 'survivor' ? <HeartHandshake className="w-6 h-6" /> : selectedRole === 'caregiver' ? <Shield className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-black">
            {authMode === 'register' ? 'Create Account' : 'Sign In'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">InteliSupport Firebase OAuth & Cloud Firestore Accounts</p>
        </div>

        {/* Register vs Login Mode Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'register' ? 'bg-teal-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create New Account
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'login' ? 'bg-teal-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Existing Sign In
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-2 mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Role:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole('survivor')}
              className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 border transition-all ${
                selectedRole === 'survivor'
                  ? 'bg-teal-950 text-teal-300 border-teal-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Individual</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('caregiver')}
              className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 border transition-all ${
                selectedRole === 'caregiver'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Caregiver</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('service_provider')}
              className={`p-2.5 rounded-xl font-bold text-xs flex flex-col items-center gap-1 border transition-all ${
                selectedRole === 'service_provider'
                  ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>EMS Service</span>
            </button>
          </div>
        </div>

        {/* Email/Password Auth Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3 mb-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivera or Dr. Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-semibold mt-1">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : authMode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" /> Create {selectedRole.replace('_', ' ')} Account
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In with Email
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-bold">Or OAuth</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full min-h-[48px] bg-slate-100 hover:bg-white text-slate-900 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google OAuth Sign In ({selectedRole.replace('_', ' ').toUpperCase()})
        </button>
      </div>
    </div>
  );
};

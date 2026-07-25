import React from 'react';
import { Activity, Shield, User, LogOut, Download, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import { Persona, ThemeMode, UserRole } from '../../types';

interface NavbarProps {
  currentPersona: Persona;
  theme: ThemeMode;
  onToggleTheme: () => void;
  user: { uid: string; email: string; displayName: string; role: UserRole } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isOnline: boolean;
  activeTab: 'home' | 'profile' | 'facilities';
  onTabChange: (tab: 'home' | 'profile' | 'facilities') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  theme,
  onToggleTheme,
  user,
  onOpenAuth,
  onLogout,
  isOnline,
  activeTab,
  onTabChange
}) => {
  const personaBadge = {
    survivor: { bg: 'bg-teal-950 text-teal-300 border-teal-800/80', label: 'Survivor Mode' },
    caregiver: { bg: 'bg-indigo-950 text-indigo-300 border-indigo-800/80', label: 'Caregiver Mode' },
    service_provider: { bg: 'bg-rose-950 text-rose-300 border-rose-800/80', label: 'Service EMS Mode' }
  }[currentPersona];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand & Persona Indicator */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('home')}>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
            currentPersona === 'survivor' 
              ? 'bg-gradient-to-br from-teal-400 to-emerald-600 text-slate-950 shadow-teal-900/40' 
              : currentPersona === 'caregiver'
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-900/40'
              : 'bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-rose-900/40'
          }`}>
            <Activity className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl text-slate-100 tracking-tight">InteliSupport</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${personaBadge.bg}`}>
                {personaBadge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Zero-Typing AI & Multi-Caregiver SUD Platform</p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="min-h-[44px] p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-300" />}
            <span className="hidden md:inline">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Online/Offline Network Badge */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' 
                : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Navigation Links */}
          <button
            type="button"
            onClick={() => onTabChange('home')}
            className={`min-h-[44px] px-3 rounded-xl font-bold text-xs transition-colors ${
              activeTab === 'home' ? 'bg-slate-800 text-teal-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crisis Home
          </button>

          <button
            type="button"
            onClick={() => onTabChange('facilities')}
            className={`min-h-[44px] px-3 rounded-xl font-bold text-xs transition-colors ${
              activeTab === 'facilities' ? 'bg-slate-800 text-teal-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Facilities
          </button>

          {/* AI Vision Scanner Button */}
          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className={`min-h-[44px] px-3 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-slate-800 text-teal-300 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile
          </button>

          {/* User Auth Control */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden lg:block">
                <span className="block text-xs font-bold text-slate-200">{user.displayName}</span>
                <span className="block text-[10px] text-slate-400 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="min-h-[44px] p-2.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-800/80 rounded-xl border border-slate-700 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="min-h-[44px] px-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

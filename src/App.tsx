import React, { useState, useEffect } from 'react';
import { Persona, ThemeMode, UserRole } from './types';
import { Navbar } from './components/shared/Navbar';
import { PersonaToggle } from './components/shared/PersonaToggle';
import { PWAInstallPrompt } from './components/shared/PWAInstallPrompt';
import { GoogleMapsLocator } from './components/shared/GoogleMapsLocator';
import { AuthModal } from './components/shared/AuthModal';
import { GuestSurvivorView } from './components/survivor/GuestSurvivorView';
import { SurvivorProfileView } from './components/survivor/SurvivorProfileView';
import { GuestCaregiverView } from './components/caregiver/GuestCaregiverView';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { ServiceProviderDashboard } from './components/service_provider/ServiceProviderDashboard';
import { AmbulanceDirectory } from './components/shared/AmbulanceDirectory';
import { OnboardingFlow } from './components/shared/OnboardingFlow';
import { LanguageSelector } from './components/shared/LanguageSelector';
import { logoutUser } from './services/firebaseService';
import { flushOfflineQueue } from './services/offlineQueue';
import { SupportedLanguage } from './services/i18nVoiceService';

export const App: React.FC = () => {
  const [persona, setPersona] = useState<Persona>('survivor');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'facilities' | 'ambulance'>('home');
  const [user, setUser] = useState<{ uid: string; email: string; displayName: string; role: UserRole } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en-US');

  const handleAuthSuccess = (u: { uid: string; email: string; displayName: string; role: UserRole }, isNewAccount: boolean = false) => {
    setUser(u);
    if (u.role === 'survivor') setPersona('survivor');
    else if (u.role === 'caregiver') setPersona('caregiver');
    else setPersona('service_provider');

    if (isNewAccount) {
      setShowOnboarding(true);
    }
  };

  // Network connection state listener, offline SOS queue flush & Theme Sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Flush any queued emergency SOS alerts when coming back online
      flushOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Flush queue on initial load if already online
    if (navigator.onLine) flushOfflineQueue();

    // Apply body class for theme
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'} flex flex-col font-sans transition-colors duration-300`}>
      {/* PWA Install Alert Banner */}
      <PWAInstallPrompt />

      {/* Main Navbar Header */}
      <Navbar
        currentPersona={persona}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isOnline={isOnline}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Primary Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Persistent Persona Switcher: [ Survivor ] | [ Caregiver ] | [ Service Provider ] */}
        {activeTab === 'home' && (
          <PersonaToggle
            currentPersona={persona}
            onPersonaChange={(p) => setPersona(p)}
          />
        )}

        {/* Tab Route 1: Crisis Home View */}
        {activeTab === 'home' && (
          persona === 'survivor' ? (
            <GuestSurvivorView patientId={user ? user.uid : 'pat-201'} />
          ) : persona === 'caregiver' ? (
            user && user.role === 'caregiver' ? (
              <CaregiverDashboard caregiverId={user.uid} />
            ) : (
              <GuestCaregiverView />
            )
          ) : (
            <ServiceProviderDashboard providerId={user ? user.uid : 'sp-301'} />
          )
        )}

        {/* Tab Route 2: Hospitals & Google Maps Grounding */}
        {activeTab === 'facilities' && (
          <GoogleMapsLocator />
        )}

        {/* Tab Route 3: 24/7 Ambulance & EMS Dispatch Directory */}
        {activeTab === 'ambulance' && (
          <AmbulanceDirectory />
        )}

        {/* Tab Route 3: Survivor Profile & Multi-Caregiver Linking */}
        {activeTab === 'profile' && (
          <SurvivorProfileView patientId={user ? user.uid : 'pat-201'} />
        )}
      </main>

      {/* Auth Login & Account Creation Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Guided User Onboarding Wizard Modal */}
      {showOnboarding && user && (
        <OnboardingFlow
          user={user}
          onComplete={() => setShowOnboarding(false)}
        />
      )}

      {/* App Footer */}
      <footer className={`border-t py-6 text-center text-xs ${theme === 'light' ? 'bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-950/80 border-slate-900 text-slate-400'}`}>
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold">InteliSupport PWA</span>
            <span>• Multi-Role (Individual, Caregiver & Service Provider) SUD Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector selectedLanguage={selectedLang} onSelectLanguage={setSelectedLang} />
            <p className="text-[11px]">Emergency Overdose Hotline: Call 911 | SAMHSA Helpline: 1-800-662-4357</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

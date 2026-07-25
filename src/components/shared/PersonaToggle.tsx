import React from 'react';
import { Persona } from '../../types';
import { HeartHandshake, ShieldAlert, Stethoscope } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

interface PersonaToggleProps {
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

export const PersonaToggle: React.FC<PersonaToggleProps> = ({ currentPersona, onPersonaChange }) => {
  const handleSelect = (persona: Persona) => {
    triggerHaptic(40);
    onPersonaChange(persona);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-lg backdrop-blur-md">
      <div className="grid grid-cols-3 gap-1.5" role="tablist" aria-label="Persona Selection">
        <button
          type="button"
          role="tab"
          aria-selected={currentPersona === 'survivor'}
          onClick={() => handleSelect('survivor')}
          className={`min-h-[52px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
            currentPersona === 'survivor'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/40 ring-1 ring-teal-300/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <HeartHandshake className="w-4 h-4 flex-shrink-0 text-teal-200" />
          <span className="truncate">Survivor</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={currentPersona === 'caregiver'}
          onClick={() => handleSelect('caregiver')}
          className={`min-h-[52px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            currentPersona === 'caregiver'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/40 ring-1 ring-indigo-300/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-indigo-200" />
          <span className="truncate">Caregiver</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={currentPersona === 'service_provider'}
          onClick={() => handleSelect('service_provider')}
          className={`min-h-[52px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400 ${
            currentPersona === 'service_provider'
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-900/40 ring-1 ring-rose-300/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Stethoscope className="w-4 h-4 flex-shrink-0 text-rose-200" />
          <span className="truncate">Service Provider</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { SupportedLanguage, languageOptions } from '../../services/i18nVoiceService';
import { Globe } from 'lucide-react';
import { triggerHaptic } from '../../utils/AccessibilityHelpers';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage
}) => {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-teal-400" />
      <select
        value={selectedLanguage}
        onChange={(e) => {
          triggerHaptic(30);
          onSelectLanguage(e.target.value as SupportedLanguage);
        }}
        className="bg-slate-800 text-slate-100 font-bold text-xs rounded-xl px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        {languageOptions.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.nativeName} ({opt.name})
          </option>
        ))}
      </select>
    </div>
  );
};

import React, { useState } from 'react';
import { Languages, Volume2, ChevronDown } from 'lucide-react';
import { useLanguageStore, SupportedLanguage } from '../../stores/useLanguageStore';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { VoiceLanguageModal } from './VoiceLanguageModal';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, availableLanguages, setLanguage } = useLanguageStore();
  const { elderlyMode } = useAccessibilityStore();
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const currentLangObj =
    availableLanguages.find((l) => l.code === currentLanguage) || availableLanguages[0];

  return (
    <>
      <div className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 p-1 pl-2.5 rounded-full border border-slate-300 transition-all shadow-xs">
        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-purple-700 transition-colors"
          title="Change Voice & Regional Languages"
        >
          <Languages className="w-3.5 h-3.5 text-purple-600" />
          <span>{currentLangObj.nativeLabel}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold hidden sm:inline">
            Voice
          </span>
        </button>

        {/* Quick Language Dropdown */}
        <select
          value={currentLanguage}
          onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
          aria-label="Select Interface Language"
          className={`bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer pr-1 border-l border-slate-300 pl-1 ${
            elderlyMode ? 'text-sm' : 'text-xs'
          }`}
        >
          {availableLanguages.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-white text-slate-900 font-medium">
              {lang.nativeLabel} ({lang.label})
            </option>
          ))}
        </select>

        {/* Voice customization trigger button */}
        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          className="p-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all"
          title="Customize Voice Cadence & Accents"
        >
          <Volume2 className="w-3 h-3" />
        </button>
      </div>

      <VoiceLanguageModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </>
  );
};

export default LanguageSelector;

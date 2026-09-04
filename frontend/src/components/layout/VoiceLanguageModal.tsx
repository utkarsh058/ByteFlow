import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Languages,
  X,
  Play,
  Check,
  Sparkles,
  Sliders,
  RotateCcw,
  Globe,
} from 'lucide-react';
import { useLanguageStore, SupportedLanguage } from '../../stores/useLanguageStore';
import {
  speakText,
  stopSpeech,
  getAvailableVoices,
  setPreferredVoice,
  getPreferredVoice,
  setPreferredRate,
  getPreferredRate,
  VoiceOption,
} from '../../utils/speech';

interface VoiceLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceLanguageModal: React.FC<VoiceLanguageModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, availableLanguages, setLanguage } = useLanguageStore();
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string | null>(getPreferredVoice());
  const [speechRate, setSpeechRateState] = useState<number>(getPreferredRate());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    const updateVoices = () => {
      const v = getAvailableVoices();
      setVoices(v);
    };

    updateVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const currentLangObj =
    availableLanguages.find((l) => l.code === currentLanguage) || availableLanguages[0];

  const handleLanguageChange = (langCode: SupportedLanguage) => {
    setLanguage(langCode);
    const targetLang = availableLanguages.find((l) => l.code === langCode);
    if (targetLang) {
      speakText(targetLang.sampleVoiceText, langCode);
    }
  };

  const handleVoiceChange = (uri: string) => {
    const val = uri === 'auto' ? null : uri;
    setSelectedVoiceURIState(val);
    setPreferredVoice(val);
  };

  const handleRateChange = (rate: number) => {
    setSpeechRateState(rate);
    setPreferredRate(rate);
  };

  const handleTestSpeech = () => {
    setIsSpeaking(true);
    speakText(currentLangObj.sampleVoiceText, currentLanguage);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Voice & Multilingual Language Settings
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Choose app display language and voice speech assistance (6 NER languages)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Language Selection (6 Languages) */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>1. Select Interface Language (6 Regional Languages)</span>
            <span className="text-purple-600 font-bold">Active: {currentLangObj.nativeLabel}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {availableLanguages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-purple-50 border-purple-600 shadow-md ring-2 ring-purple-400/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-slate-900">{lang.nativeLabel}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                  </div>
                  <p className="text-xs font-bold text-slate-600">{lang.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{lang.region}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Voice Selection (Speech Synthesis) */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-purple-600" />
            <span>2. Text-to-Speech (TTS) Voice Engine</span>
          </label>
          <select
            value={selectedVoiceURI || 'auto'}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm font-medium bg-slate-50"
          >
            <option value="auto">
              Auto Match Best Regional Voice ({currentLangObj.label})
            </option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Browser uses installed Indian English, Hindi, and regional speech synthesizers.
          </p>
        </div>

        {/* 3. Speech Rate Cadence (Calm Elderly Speed) */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Voice Cadence / Speed</span>
            </span>
            <span className="text-purple-700 font-bold">{Math.round(speechRate * 100)}% Speed</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRateChange(0.75)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                speechRate === 0.75
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Gentle (0.75×)
            </button>
            <button
              type="button"
              onClick={() => handleRateChange(0.85)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                speechRate === 0.85
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Calm Elderly (0.85×)
            </button>
            <button
              type="button"
              onClick={() => handleRateChange(1.0)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                speechRate === 1.0
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Standard (1.0×)
            </button>
          </div>
        </div>

        {/* Sample Voice Preview & Test Button */}
        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left w-full sm:w-auto">
            <p className="text-[11px] font-bold text-purple-700 uppercase">Voice Sample Prompt</p>
            <p className="text-xs font-semibold text-slate-800 italic mt-0.5">
              "{currentLangObj.sampleVoiceText}"
            </p>
          </div>
          <button
            type="button"
            onClick={handleTestSpeech}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isSpeaking ? 'Speaking...' : 'Test Voice Audio'}
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceLanguageModal;

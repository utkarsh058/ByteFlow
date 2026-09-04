import { create } from 'zustand';
import i18n from '../i18n/i18n';

export type SupportedLanguage = 'en' | 'hi' | 'as' | 'bn' | 'ne' | 'brx';

export interface LanguageInfo {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  region: string;
  sampleVoiceText: string;
}

interface LanguageState {
  currentLanguage: SupportedLanguage;
  availableLanguages: LanguageInfo[];
  setLanguage: (lang: SupportedLanguage) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLanguage: 'en',
  availableLanguages: [
    {
      code: 'en',
      label: 'English',
      nativeLabel: 'English',
      region: 'Universal / Pan-India',
      sampleVoiceText: 'Welcome to Smriti Setu, connecting memories and care.',
    },
    {
      code: 'hi',
      label: 'Hindi',
      nativeLabel: 'हिन्दी',
      region: 'National / NER Urban',
      sampleVoiceText: 'स्मृति सेतु में आपका स्वागत है, यादों और देखभाल को जोड़ते हुए।',
    },
    {
      code: 'as',
      label: 'Assamese',
      nativeLabel: 'অসমীয়া',
      region: 'Assam & Brahmaputra Valley',
      sampleVoiceText: 'স্মৃতি সেতু লৈ আপোনাক স্বাগতম, স্মৃতি আৰু সেৱাৰ এক সুন্দৰ মেলবন্ধন।',
    },
    {
      code: 'bn',
      label: 'Bengali',
      nativeLabel: 'বাংলা',
      region: 'Tripura, Barak Valley & Bengal',
      sampleVoiceText: 'স্মৃতি সেতুতে আপনাকে স্বাগতম, স্মৃতি এবং যত্নের মিলন।',
    },
    {
      code: 'ne',
      label: 'Nepali',
      nativeLabel: 'नेपाली',
      region: 'Sikkim, Assam & Darjeeling Hills',
      sampleVoiceText: 'स्मृति सेतुमा तपाईंलाई हार्दिक स्वागत छ, सम्झना र हेरचाहको सेतु।',
    },
    {
      code: 'brx',
      label: 'Bodo',
      nativeLabel: 'बड़ो',
      region: 'Bodoland Territorial Region, Assam',
      sampleVoiceText: 'स्मृति सेतुआव नोंथांखौ बरायबाय, गोसोखांथि आरो हेफाजाबनि गेजेर।',
    },
  ],
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ currentLanguage: lang });
  },
}));

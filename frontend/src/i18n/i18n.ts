import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './translations';
import { getLanguageByCode } from './languages';

const SAVED_LANG_KEY = 'smriti_setu_language';
const initialLang = localStorage.getItem(SAVED_LANG_KEY) || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: ['hi', 'en'],
    interpolation: {
      escapeValue: false, // React escapes values automatically
    },
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key) => {
      console.warn(`[MISSING TRANSLATION] ${lngs.join(',')}.${key}`);
    },
    react: {
      useSuspense: false,
    },
  });

// Apply document level direction and language attributes on language changes
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem(SAVED_LANG_KEY, lng);
  const langConfig = getLanguageByCode(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = langConfig.direction || 'ltr';
});

// Sync initial HTML attributes
const activeLangConfig = getLanguageByCode(initialLang);
document.documentElement.lang = initialLang;
document.documentElement.dir = activeLangConfig.direction || 'ltr';

export default i18n;

// Web Speech API Voice Assistance Service for SMRITI-SETU Elderly Care

export interface VoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  isDefault: boolean;
}

let preferredVoiceURI: string | null = localStorage.getItem('smriti_preferred_voice') || null;
let preferredRate: number = parseFloat(localStorage.getItem('smriti_speech_rate') || '0.85');

export const setPreferredVoice = (voiceURI: string | null) => {
  preferredVoiceURI = voiceURI;
  if (voiceURI) {
    localStorage.setItem('smriti_preferred_voice', voiceURI);
  } else {
    localStorage.removeItem('smriti_preferred_voice');
  }
};

export const getPreferredVoice = (): string | null => {
  return preferredVoiceURI;
};

export const setPreferredRate = (rate: number) => {
  preferredRate = rate;
  localStorage.setItem('smriti_speech_rate', String(rate));
};

export const getPreferredRate = (): number => {
  return preferredRate;
};

export const getAvailableVoices = (): VoiceOption[] => {
  if (!('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.map((v) => ({
    voiceURI: v.voiceURI,
    name: v.name,
    lang: v.lang,
    isDefault: v.default,
  }));
};

export const speakText = (text: string, lang: string = 'en', onEnd?: () => void, onError?: () => void) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser environment.');
    if (onError) onError();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean and prepare text for speech synthesis
  const cleanText = text.trim();
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Map language codes to BCP 47 tags for speech synthesis
  const langMap: Record<string, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    as: 'as-IN',
    bn: 'bn-IN',
    ne: 'ne-NP',
    brx: 'hi-IN',
    mr: 'mr-IN',
  };

  const targetLang = langMap[lang] || lang || 'en-IN';
  utterance.lang = targetLang;
  utterance.rate = preferredRate; // Slightly slower, calm cadence for elderly comprehension
  utterance.pitch = 1.0;

  if (onEnd) {
    utterance.onend = () => onEnd();
  }
  if (onError) {
    utterance.onerror = () => onError();
  }

  const selectVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      let matchedVoice: SpeechSynthesisVoice | undefined;

      // 1. If preferred voice URI is set by user, prioritize it
      if (preferredVoiceURI) {
        matchedVoice = voices.find((v) => v.voiceURI === preferredVoiceURI);
      }

      // 2. Direct exact or prefix match
      if (!matchedVoice) {
        const prefix = targetLang.split('-')[0].toLowerCase();
        matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix) || v.lang.toLowerCase() === targetLang.toLowerCase());
      }

      // 3. Special Fallbacks for Indian Regional Languages
      if (!matchedVoice) {
        if (lang === 'as' || targetLang === 'as-IN') {
          // Assamese falls back to Bengali (same script/phonetics) or Hindi voice
          matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith('bn'))
            || voices.find((v) => v.lang.toLowerCase().startsWith('hi'))
            || voices.find((v) => v.lang.toLowerCase().includes('india') || v.lang.toLowerCase().includes('in'));
          if (matchedVoice) {
            utterance.lang = matchedVoice.lang;
          }
        } else if (lang === 'hi' || targetLang === 'hi-IN') {
          // Hindi falls back to any Indic or Indian English voice that supports Devanagari
          matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi'))
            || voices.find((v) => v.lang.toLowerCase().startsWith('mr'))
            || voices.find((v) => v.lang.toLowerCase().startsWith('bn'))
            || voices.find((v) => v.lang.toLowerCase().includes('in'));
        }
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  };

  // Ensure voices are loaded (Chrome loads voices asynchronously)
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      selectVoiceAndSpeak();
    };
    // Fallback if event doesn't fire immediately
    setTimeout(selectVoiceAndSpeak, 100);
  } else {
    selectVoiceAndSpeak();
  }
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

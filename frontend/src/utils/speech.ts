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

export const speakText = (text: string, lang: string = 'en') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser environment.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

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

  const targetLang = langMap[lang] || 'en-IN';
  utterance.lang = targetLang;
  utterance.rate = preferredRate; // Slightly slower, calm cadence for elderly comprehension
  utterance.pitch = 1.0;

  // Find preferred voice if set or match matching language voice
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    let matchedVoice: SpeechSynthesisVoice | undefined;

    if (preferredVoiceURI) {
      matchedVoice = voices.find((v) => v.voiceURI === preferredVoiceURI);
    }

    if (!matchedVoice) {
      // Find voice matching the target language code prefix
      const prefix = targetLang.split('-')[0].toLowerCase();
      matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

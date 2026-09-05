// Extensible Language Configuration for SMRITI-SETU North-East India (NER) Platform

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  label: string; // Alias for name (backward compatibility)
  nativeLabel: string; // Alias for nativeName (backward compatibility)
  sampleVoiceText: string;
  state: string;
  region: string;
  direction: 'ltr' | 'rtl';
  fallbackCode: string;
}

export const NER_STATES = [
  'Common',
  'Assam',
  'Arunachal Pradesh',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura',
] as const;

export type NERStateName = typeof NER_STATES[number];

export const languages: LanguageConfig[] = [
  // COMMON FALLBACKS
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    label: 'English',
    nativeLabel: 'English',
    sampleVoiceText: 'Welcome to Smriti Setu, connecting memories and care across North-East India.',
    state: 'Common',
    region: 'All NER',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    sampleVoiceText: 'स्मृति सेतु में आपका स्वागत है, यादों और मानसिक देखभाल को जोड़ते हुए।',
    state: 'Common',
    region: 'All NER',
    direction: 'ltr',
    fallbackCode: 'en',
  },

  // ASSAM
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    label: 'Assamese',
    nativeLabel: 'অসমীয়া',
    sampleVoiceText: 'স্মৃতি সেতু লৈ আপোনাক স্বাগতম, স্মৃতি আৰু সেৱাৰ এক সুন্দৰ মেলবন্ধন।',
    state: 'Assam',
    region: 'Assam',
    direction: 'ltr',
    fallbackCode: 'hi',
  },
  {
    code: 'brx',
    name: 'Bodo',
    nativeName: 'बड़ो',
    label: 'Bodo',
    nativeLabel: 'बड़ो',
    sampleVoiceText: 'स्मृति सेतुआव नोंथांखौ बरायबाय, गोसोखांथि आरो हेफाजाबनि गेजेर।',
    state: 'Assam',
    region: 'Assam',
    direction: 'ltr',
    fallbackCode: 'as',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    label: 'Bengali',
    nativeLabel: 'বাংলা',
    sampleVoiceText: 'স্মৃতি সেতুতে আপনাকে স্বাগতম, স্মৃতি এবং যত্নের মিলন।',
    state: 'Assam',
    region: 'Assam & Tripura',
    direction: 'ltr',
    fallbackCode: 'hi',
  },

  // ARUNACHAL PRADESH
  {
    code: 'nyo',
    name: 'Nyishi',
    nativeName: 'Nyishi',
    label: 'Nyishi',
    nativeLabel: 'Nyishi',
    sampleVoiceText: 'Welcome to Smriti Setu in Nyishi language.',
    state: 'Arunachal Pradesh',
    region: 'Arunachal Pradesh',
    direction: 'ltr',
    fallbackCode: 'hi',
  },
  {
    code: 'adi',
    name: 'Adi',
    nativeName: 'Adi',
    label: 'Adi',
    nativeLabel: 'Adi',
    sampleVoiceText: 'Welcome to Smriti Setu in Adi language.',
    state: 'Arunachal Pradesh',
    region: 'Arunachal Pradesh',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'apt',
    name: 'Apatani',
    nativeName: 'Tanii (Apatani)',
    label: 'Apatani',
    nativeLabel: 'Tanii (Apatani)',
    sampleVoiceText: 'Welcome to Smriti Setu in Tanii Apatani.',
    state: 'Arunachal Pradesh',
    region: 'Arunachal Pradesh',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'alo',
    name: 'Galo',
    nativeName: 'Galo',
    label: 'Galo',
    nativeLabel: 'Galo',
    sampleVoiceText: 'Welcome to Smriti Setu in Galo language.',
    state: 'Arunachal Pradesh',
    region: 'Arunachal Pradesh',
    direction: 'ltr',
    fallbackCode: 'hi',
  },
  {
    code: 'mon',
    name: 'Monpa',
    nativeName: 'Monpa',
    label: 'Monpa',
    nativeLabel: 'Monpa',
    sampleVoiceText: 'Welcome to Smriti Setu in Monpa language.',
    state: 'Arunachal Pradesh',
    region: 'Arunachal Pradesh',
    direction: 'ltr',
    fallbackCode: 'hi',
  },

  // MANIPUR
  {
    code: 'mni',
    name: 'Meitei (Manipuri)',
    nativeName: 'মৈতৈলোন (Meiteilon)',
    label: 'Meitei (Manipuri)',
    nativeLabel: 'মৈতৈলোন (Meiteilon)',
    sampleVoiceText: 'স্মৃতি-সেতুদা অদোমবু তরাম্না ওকচরি।',
    state: 'Manipur',
    region: 'Manipur',
    direction: 'ltr',
    fallbackCode: 'hi',
  },

  // MEGHALAYA
  {
    code: 'kha',
    name: 'Khasi',
    nativeName: 'Ka Ktien Khasi',
    label: 'Khasi',
    nativeLabel: 'Ka Ktien Khasi',
    sampleVoiceText: 'Pdiang burom sha Smriti Setu ha ktien Khasi.',
    state: 'Meghalaya',
    region: 'Meghalaya',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'grt',
    name: 'Garo',
    nativeName: 'A·chik Kku',
    label: 'Garo',
    nativeLabel: 'A·chik Kku',
    sampleVoiceText: 'Rimchakboa Smriti Setu gita A·chik kkuo.',
    state: 'Meghalaya',
    region: 'Meghalaya',
    direction: 'ltr',
    fallbackCode: 'en',
  },

  // MIZORAM
  {
    code: 'lus',
    name: 'Mizo',
    nativeName: 'Mizo ṭawng',
    label: 'Mizo',
    nativeLabel: 'Mizo ṭawng',
    sampleVoiceText: 'Smriti Setu-ah chibai leh lo lawm a che u.',
    state: 'Mizoram',
    region: 'Mizoram',
    direction: 'ltr',
    fallbackCode: 'en',
  },

  // NAGALAND
  {
    code: 'nag',
    name: 'Nagamese',
    nativeName: 'Nagamese Creole',
    label: 'Nagamese',
    nativeLabel: 'Nagamese Creole',
    sampleVoiceText: 'Smriti Setu te swagatom koriya ase.',
    state: 'Nagaland',
    region: 'Nagaland',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'ao',
    name: 'Ao',
    nativeName: 'Ao Chungli',
    label: 'Ao',
    nativeLabel: 'Ao Chungli',
    sampleVoiceText: 'Welcome to Smriti Setu in Ao language.',
    state: 'Nagaland',
    region: 'Nagaland',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'njz',
    name: 'Angami',
    nativeName: 'Tenydie (Angami)',
    label: 'Angami',
    nativeLabel: 'Tenydie (Angami)',
    sampleVoiceText: 'Welcome to Smriti Setu in Tenydie Angami.',
    state: 'Nagaland',
    region: 'Nagaland',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'nsm',
    name: 'Sumi',
    nativeName: 'Sümi',
    label: 'Sumi',
    nativeLabel: 'Sümi',
    sampleVoiceText: 'Welcome to Smriti Setu in Sümi language.',
    state: 'Nagaland',
    region: 'Nagaland',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'njh',
    name: 'Lotha',
    nativeName: 'Lotha',
    label: 'Lotha',
    nativeLabel: 'Lotha',
    sampleVoiceText: 'Welcome to Smriti Setu in Lotha language.',
    state: 'Nagaland',
    region: 'Nagaland',
    direction: 'ltr',
    fallbackCode: 'en',
  },
  {
    code: 'nky',
    name: 'Konyak',
    nativeName: 'Konyak',
    label: 'Konyak',
    nativeLabel: 'Konyak',
    sampleVoiceText: 'Welcome to Smriti Setu in Konyak language.',
    state: 'Nagaland',
    region: 'Nagaland',
    direction: 'ltr',
    fallbackCode: 'en',
  },

  // SIKKIM
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    label: 'Nepali',
    nativeLabel: 'नेपाली',
    sampleVoiceText: 'स्मृति सेतुमा तपाईंलाई हार्दिक स्वागत छ, सम्झना र हेरचाहको सेतु।',
    state: 'Sikkim',
    region: 'Sikkim',
    direction: 'ltr',
    fallbackCode: 'hi',
  },
  {
    code: 'sip',
    name: 'Sikkimese (Bhutia)',
    nativeName: 'འབྲས་ལྗོངས་སྐད། (Denjongke)',
    label: 'Sikkimese (Bhutia)',
    nativeLabel: 'འབྲས་ལྗོངས་སྐད། (Denjongke)',
    sampleVoiceText: 'Welcome to Smriti Setu in Sikkimese Denjongke.',
    state: 'Sikkim',
    region: 'Sikkim',
    direction: 'ltr',
    fallbackCode: 'ne',
  },
  {
    code: 'lep',
    name: 'Lepcha',
    nativeName: 'ᰛᰩᰵᰛᰧᰵᰦ (Róngrīng)',
    label: 'Lepcha',
    nativeLabel: 'ᰛᰩᰵᰛᰧᰵᰦ (Róngrīng)',
    sampleVoiceText: 'Welcome to Smriti Setu in Lepcha Róngrīng.',
    state: 'Sikkim',
    region: 'Sikkim',
    direction: 'ltr',
    fallbackCode: 'ne',
  },

  // TRIPURA
  {
    code: 'trp',
    name: 'Kokborok',
    nativeName: 'Kokborok',
    label: 'Kokborok',
    nativeLabel: 'Kokborok',
    sampleVoiceText: 'Smriti Setu o nogo kahamiyok Kokborok bai.',
    state: 'Tripura',
    region: 'Tripura',
    direction: 'ltr',
    fallbackCode: 'bn',
  },
];

export const DEFAULT_LANGUAGE_CODE = 'en';

export const getLanguageByCode = (code: string): LanguageConfig => {
  return (
    languages.find((lang) => lang.code.toLowerCase() === code.toLowerCase()) ||
    languages[0]
  );
};

export const getLanguagesByState = (state: string): LanguageConfig[] => {
  if (state === 'All') return languages;
  return languages.filter((lang) => lang.state === state);
};

export const getFallbackChain = (code: string): string[] => {
  const lang = getLanguageByCode(code);
  const chain: string[] = [lang.code];
  if (lang.fallbackCode && !chain.includes(lang.fallbackCode)) {
    chain.push(lang.fallbackCode);
  }
  if (!chain.includes('hi')) chain.push('hi');
  if (!chain.includes('en')) chain.push('en');
  return chain;
};

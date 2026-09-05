import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Upload,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  PlusCircle,
  Users,
  Heart,
  Play,
  Square,
  Globe,
  Info,
  Check,
  X,
  Smile
} from 'lucide-react';
import { Button } from '../common/Button';
import { VoiceButton } from '../common/VoiceButton';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';
import { useLanguageStore, SupportedLanguage } from '../../stores/useLanguageStore';
import { speakText, stopSpeech } from '../../utils/speech';

interface PictureRecognitionProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

export type FamilyRelationKey =
  | 'daughter'
  | 'wife'
  | 'son'
  | 'granddaughter'
  | 'brother'
  | 'friend'
  | 'mother'
  | 'father'
  | 'sister'
  | 'grandson';

export interface FamilyFaceItem {
  id: string;
  name: string;
  relationKey: FamilyRelationKey;
  imageUrl: string;
  isCustom?: boolean;
  notes?: Record<SupportedLanguage, string>;
  hints?: Record<SupportedLanguage, string>;
}

// Multilingual text labels for relations across North & North-East Indian languages
export const RELATION_LABELS: Record<
  FamilyRelationKey,
  Record<SupportedLanguage, { label: string; fullTitle: string; voiceKeywords: string[] }>
> = {
  daughter: {
    en: { label: 'Daughter', fullTitle: 'Loving Daughter', voiceKeywords: ['daughter', 'ananya', 'elder daughter'] },
    hi: { label: 'बेटी (Daughter)', fullTitle: 'प्यारी बेटी', voiceKeywords: ['बेटी', 'अनन्या', 'लड़की', 'बिटिया', 'beti', 'daughter'] },
    as: { label: 'জীয়াৰী (Daughter)', fullTitle: 'মৰমৰ জীয়াৰী', voiceKeywords: ['জীয়াৰী', 'জী', 'অনন্যা', 'ছোৱালী', 'jiyari', 'daughter'] },
    bn: { label: 'মেয়ে (Daughter)', fullTitle: 'স্নেহের মেয়ে', voiceKeywords: ['মেয়ে', 'কন্যা', 'অনন্যা', 'meye', 'daughter'] },
    ne: { label: 'छोरी (Daughter)', fullTitle: 'प्यारी छोरी', voiceKeywords: ['छोरी', 'अनन्या', 'नानी', 'chhori', 'daughter'] },
    brx: { label: 'फिसाजो (Daughter)', fullTitle: 'मोजां मोननाय फिसाजो', voiceKeywords: ['फिसाजो', 'अनन्या', 'daughter'] },
  },
  wife: {
    en: { label: 'Wife', fullTitle: 'Beloved Wife', voiceKeywords: ['wife', 'mridula', 'spouse', 'partner'] },
    hi: { label: 'पत्नी / जीवनसंगिनी (Wife)', fullTitle: 'धर्मपत्नी', voiceKeywords: ['पत्नी', 'मृदुला', 'बीवी', 'जीवनसंगिनी', 'patni', 'wife'] },
    as: { label: 'পত্নী / গৃহিনী (Wife)', fullTitle: 'সহধৰ্মিনী', voiceKeywords: ['পত্নী', 'মৃদুলা', 'গৃহিনী', 'সহধৰ্মিনী', 'potni', 'wife'] },
    bn: { label: 'স্ত্রী / সহধর্মিণী (Wife)', fullTitle: 'সহধর্মিণী', voiceKeywords: ['স্ত্রী', 'মৃদুলা', 'বউ', 'সহধর্মিণী', 'stri', 'wife'] },
    ne: { label: 'श्रीमती (Wife)', fullTitle: 'जीवनसङ्गिनी', voiceKeywords: ['श्रीमती', 'मृदुला', 'बुढी', 'shrimati', 'wife'] },
    brx: { label: 'बिसि (Wife)', fullTitle: 'मोजां मोननाय बिसि', voiceKeywords: ['बिसि', 'मृदुला', 'wife'] },
  },
  son: {
    en: { label: 'Son', fullTitle: 'Devoted Son', voiceKeywords: ['son', 'vikram', 'boy'] },
    hi: { label: 'बेटा (Son)', fullTitle: 'प्यारा बेटा', voiceKeywords: ['बेटा', 'विक्रम', 'लड़का', 'पुत्र', 'beta', 'son'] },
    as: { label: 'পুত্ৰ / ল’ৰা (Son)', fullTitle: 'সুযোগ্য পুত্ৰ', voiceKeywords: ['পুত্ৰ', 'ল’ৰা', 'বিক্ৰম', 'putra', 'son'] },
    bn: { label: 'ছেলে / পুত্র (Son)', fullTitle: 'স্নেহের পুত্র', voiceKeywords: ['ছেলে', 'পুত্র', 'বিক্রম', 'chhele', 'son'] },
    ne: { label: 'छोरा (Son)', fullTitle: 'प्यारो छोरो', voiceKeywords: ['छोरा', 'छोरो', 'विक्रम', 'chhora', 'son'] },
    brx: { label: 'फिसाला (Son)', fullTitle: 'मोजां मोननाय फिसाला', voiceKeywords: ['फिसाला', 'विक्रम', 'son'] },
  },
  granddaughter: {
    en: { label: 'Granddaughter', fullTitle: 'Sweet Granddaughter', voiceKeywords: ['granddaughter', 'priyanshi', 'grand child'] },
    hi: { label: 'पोती / नातिन (Granddaughter)', fullTitle: 'दुलारी पोती', voiceKeywords: ['पोती', 'नातिन', 'प्रियांशी', 'गुड़िया', 'poti', 'granddaughter'] },
    as: { label: 'নাতিনী (Granddaughter)', fullTitle: 'মৰমৰ নাতিনী', voiceKeywords: ['নাতিনী', 'প্ৰিয়াংশী', 'natini', 'granddaughter'] },
    bn: { label: 'নাতনি (Granddaughter)', fullTitle: 'মিষ্টি নাতনি', voiceKeywords: ['নাতনি', 'প্রিয়াংশী', 'natni', 'granddaughter'] },
    ne: { label: 'नातिनी (Granddaughter)', fullTitle: 'प्यारी नातिनी', voiceKeywords: ['नातिनी', 'प्रियाङ्शी', 'natini', 'granddaughter'] },
    brx: { label: 'उन्दै फिसाजो (Granddaughter)', fullTitle: 'उन्दै फिसाजो', voiceKeywords: ['उन्दै फिसाजो', 'प्रियान्शी', 'granddaughter'] },
  },
  brother: {
    en: { label: 'Brother', fullTitle: 'Caring Brother', voiceKeywords: ['brother', 'devashish', 'sibling'] },
    hi: { label: 'भाई (Brother)', fullTitle: 'प्रिय भाई', voiceKeywords: ['भाई', 'भैया', 'देवाशीष', 'bhai', 'brother'] },
    as: { label: 'ভাই / ককাই (Brother)', fullTitle: 'মৰমৰ ভাইটি / ককাই', voiceKeywords: ['ভাই', 'ককাই', 'দেৱাশীষ', 'bhai', 'brother'] },
    bn: { label: 'ভাই (Brother)', fullTitle: 'প্রিয় ভাই', voiceKeywords: ['ভাই', 'দাদা', 'দেবাশীষ', 'bhai', 'brother'] },
    ne: { label: 'भाइ / दाजु (Brother)', fullTitle: 'प्यारो भाइ', voiceKeywords: ['भाइ', 'दाजु', 'देवाशीष', 'bhai', 'brother'] },
    brx: { label: 'बिदा / फंबाय (Brother)', fullTitle: 'बिदा / फंबाय', voiceKeywords: ['बिदा', 'फंबाय', 'देवाशीष', 'brother'] },
  },
  friend: {
    en: { label: 'Friend', fullTitle: 'Lifelong Friend', voiceKeywords: ['friend', 'suresh', 'colleague', 'companion'] },
    hi: { label: 'मित्र / दोस्त (Friend)', fullTitle: 'पक्का दोस्त', voiceKeywords: ['मित्र', 'दोस्त', 'सुरेश', 'सखा', 'dost', 'friend'] },
    as: { label: 'বন্ধু / সতীৰ্থ (Friend)', fullTitle: 'ঘনিষ্ঠ বন্ধু', voiceKeywords: ['বন্ধু', 'সুৰেশ', 'সতীৰ্থ', 'bondhu', 'friend'] },
    bn: { label: 'বন্ধু / সহপাঠী (Friend)', fullTitle: 'অন্তরঙ্গ বন্ধু', voiceKeywords: ['বন্ধু', 'সুরেশ', 'সহপাঠী', 'bondhu', 'friend'] },
    ne: { label: 'साथी / मित्र (Friend)', fullTitle: 'घनिष्ठ साथी', voiceKeywords: ['साथी', 'मित्र', 'सुरेश', 'sathi', 'friend'] },
    brx: { label: 'लोगो (Friend)', fullTitle: 'गाहाइ लोगो', voiceKeywords: ['लोगो', 'सुरेश', 'friend'] },
  },
  mother: {
    en: { label: 'Mother', fullTitle: 'Beloved Mother', voiceKeywords: ['mother', 'mom', 'maa', 'pratima'] },
    hi: { label: 'माँ (Mother)', fullTitle: 'पूज्य माता जी', voiceKeywords: ['माँ', 'माता', 'मम्मी', 'प्रतिमा', 'maa', 'mother'] },
    as: { label: 'মা / আই (Mother)', fullTitle: 'মৰমৰ মা', voiceKeywords: ['মা', 'আই', 'প্রতিমা', 'maa', 'mother'] },
    bn: { label: 'মা (Mother)', fullTitle: 'স্নেহময়ী মা', voiceKeywords: ['মা', 'মাতা', 'প্রতিমা', 'maa', 'mother'] },
    ne: { label: 'आमा (Mother)', fullTitle: 'पूजनीय आमा', voiceKeywords: ['आमा', 'माता', 'प्रतिमा', 'aama', 'mother'] },
    brx: { label: 'आइ (Mother)', fullTitle: 'अनजालु आइ', voiceKeywords: ['आइ', 'मा', 'mother'] },
  },
  father: {
    en: { label: 'Father', fullTitle: 'Respected Father', voiceKeywords: ['father', 'dad', 'baba', 'pitaji'] },
    hi: { label: 'पिताजी (Father)', fullTitle: 'आदरणीय पिताजी', voiceKeywords: ['पिता', 'पिताजी', 'बाबूजी', 'पापा', 'pitaji', 'father'] },
    as: { label: 'দেউতা / পিতা (Father)', fullTitle: 'শ্ৰদ্ধেয় দেউতা', voiceKeywords: ['দেউতা', 'পিতা', 'deuta', 'father'] },
    bn: { label: 'বাবা / পিতা (Father)', fullTitle: 'শ্রদ্ধেয় বাবা', voiceKeywords: ['বাবা', 'পিতা', 'baba', 'father'] },
    ne: { label: 'बुबा / पिता (Father)', fullTitle: 'आदरणीय बुबा', voiceKeywords: ['बुबा', 'पिताजी', 'बाबा', 'buba', 'father'] },
    brx: { label: 'आफा (Father)', fullTitle: 'मानगोनां आफा', voiceKeywords: ['आफा', 'पिताजी', 'father'] },
  },
  sister: {
    en: { label: 'Sister', fullTitle: 'Loving Sister', voiceKeywords: ['sister', 'didi', 'behan'] },
    hi: { label: 'बहन (Sister)', fullTitle: 'प्यारी बहन', voiceKeywords: ['बहन', 'दीदी', 'behan', 'sister'] },
    as: { label: 'ভনী / বাইদেউ (Sister)', fullTitle: 'মৰমৰ ভনী / বাইদেউ', voiceKeywords: ['ভনী', 'বাইদেউ', 'bhoni', 'sister'] },
    bn: { label: 'বোন / দিদি (Sister)', fullTitle: 'স্নেহের বোন', voiceKeywords: ['বোন', 'দিদি', 'bon', 'sister'] },
    ne: { label: 'बहिनी / दिदी (Sister)', fullTitle: 'प्यारी बहिनी', voiceKeywords: ['बहिनी', 'दिदी', 'bahini', 'sister'] },
    brx: { label: 'बिब\' / बिनानाव (Sister)', fullTitle: 'बिब\' / बिनानाव', voiceKeywords: ['बिब', 'बिनानाव', 'sister'] },
  },
  grandson: {
    en: { label: 'Grandson', fullTitle: 'Energetic Grandson', voiceKeywords: ['grandson', 'pota', 'nati'] },
    hi: { label: 'पोता / नाती (Grandson)', fullTitle: 'प्यारा पोता', voiceKeywords: ['पोता', 'नाती', 'pota', 'grandson'] },
    as: { label: 'নাতি (Grandson)', fullTitle: 'মৰমৰ নাতি', voiceKeywords: ['নাতি', 'nati', 'grandson'] },
    bn: { label: 'নাতি (Grandson)', fullTitle: 'স্নেহের নাতি', voiceKeywords: ['নাতি', 'nati', 'grandson'] },
    ne: { label: 'नाति (Grandson)', fullTitle: 'प्यारो नाति', voiceKeywords: ['नाति', 'nati', 'grandson'] },
    brx: { label: 'उन्दै फिसाला (Grandson)', fullTitle: 'उन्दै फिसाला', voiceKeywords: ['उन्दै फिसाला', 'grandson'] },
  },
};

const DEFAULT_FAMILY_MEMBERS: FamilyFaceItem[] = [
  {
    id: 'fam-1',
    name: 'Ananya Borthakur',
    relationKey: 'daughter',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Ananya is your eldest daughter who is a doctor in Guwahati and brings you fresh sweets on Sundays.',
      hi: 'अनन्या आपकी बड़ी बेटी हैं जो गुवाहाटी में डॉक्टर हैं और हर रविवार आपके लिए ताज़ा संदेश व मिठाइयाँ लाती हैं।',
      as: 'অনন্যা আপোনাৰ জ্যেষ্ঠা জীয়াৰী, যি গুৱাহাটীত চিকিৎসক আৰু প্ৰতি দেওবাৰে আপোনাক দেখা কৰিবলৈ আহে।',
      bn: 'অনন্যা আপনার বড় মেয়ে, যিনি গুয়াহাটিতে ডাক্তার এবং প্রতি রবিবার আপনার পছন্দের মিষ্টি নিয়ে আসেন।',
      ne: 'अनन्या तपाईंको जेठी छोरी हुन् जो गुवाहाटीमा डाक्टर छिन् र हरेक आइतबार तपाईंलाई भेट्न आउँछिन्।',
      brx: 'अनन्या नोंथांनि देरसिन फिसाजो जाय गुवाहाटीयाव डाक्टर आरो नोंथांखौ नायनो फैयो।',
    },
    hints: {
      en: 'She is your daughter who loves preparing your ginger morning tea.',
      hi: 'यह आपकी बेटी हैं जो आपके लिए रोज़ सुबह अदरक की चाय बनाती हैं।',
      as: 'এওঁ আপোনাৰ জীয়াৰী, যিয়ে পুৱা আপোনাৰ বাবে আদা চাহ বনায়।',
      bn: 'ইনি আপনার মেয়ে, যিনি রোজ সকালে আপনার জন্য আদা চা বানান।',
      ne: 'उहाँ तपाईंको छोरी हुन् जसले बिहान अदुवाको चिया बनाइदिन्छिन्।',
      brx: 'बियो नोंथांनि फिसाजो जाय नोंथांनि थाखाय साहा बानायो।',
    },
  },
  {
    id: 'fam-2',
    name: 'Priyanshi',
    relationKey: 'granddaughter',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Priyanshi is your playful granddaughter who loves listening to your folk tales and drawing flowers.',
      hi: 'प्रियांशी आपकी नटखट पोती हैं जिन्हें आपकी सुनाई राजा-रानी और ब्रह्मपुत्र की लोककथाएं सुनना बहुत पसंद है।',
      as: 'প্ৰিয়াংশী আপোনাৰ মৰমৰ নাতিনী, যিয়ে আপোনাৰ মুখত সাধুকথা শুনি আৰু ফুলৰ ছবি আঁকি ভাল পায়।',
      bn: 'প্রিয়াংশী আপনার চঞ্চল নাতনি, যিনি আপনার কাছে রূপকথার গল্প শুনতে এবং ছবি আঁকতে ভালোবাসেন।',
      ne: 'प्रियाङ्शी तपाईंको प्यारी नातिनी हुन् जसलाई तपाईंको लोककथाहरू सुन्न र चित्र कोर्न मन पर्छ।',
      brx: 'प्रियान्शी नोंथांनि उन्दै फिसाजो जाय नोंथांनिफ्राय बाथ्रा खोनासंनो जोबोर मोजां मोनो।',
    },
    hints: {
      en: 'She is your youngest granddaughter who always sits on your lap.',
      hi: 'यह आपकी सबसे छोटी पोती हैं जो हमेशा आपकी गोद में आकर बैठती हैं।',
      as: 'এওঁ আপোনাৰ সৰু নাতিনী, যিয়ে সদায় আপোনাৰ কোলাত বহে।',
      bn: 'ইনি আপনার ছোট নাতনি, যিনি সবসময় আপনার কোলে এসে বসেন।',
      ne: 'उहाँ तपाईंको कान्छी नातिनी हुन् जो सधैं तपाईंको काखमा बस्छिन्।',
      brx: 'बियो नोंथांनि उन्दै फिसाजो जाय नोंथांनि खफायआव थायो।',
    },
  },
  {
    id: 'fam-3',
    name: 'Mridula Borthakur',
    relationKey: 'wife',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Mridula is your beloved wife and lifelong partner with whom you share 46 years of warm memories.',
      hi: 'मृदुला आपकी धर्मपत्नी हैं जिनके साथ आपने जीवन के 46 सुखद व यादगार वर्ष बिताए हैं।',
      as: 'মৃদুলা আপোনাৰ মৰমৰ সহধৰ্মিনী, যাৰ লগত আপুনি জীৱনৰ ৪৬টা সোণালী বছৰ অতিবাহিত কৰিছে।',
      bn: 'মৃদুলা আপনার সহধর্মিণী, যাঁর সাথে আপনি জীবনের ৪৬টি অমূল্য বছর একসাথে কাটিয়েছেন।',
      ne: 'मृदुला तपाईंको जीवनसङ्गिनी हुन् जससँग तपाईंले जीवनका ४६ स्वर्णिम वर्षहरू बिताउनुभएको छ।',
      brx: 'मृदुला नोंथांनि बिसि जायजों नोंथाङा जिउनि ४६ बोसोर ज\'यै थाबाय।',
    },
    hints: {
      en: 'She is your wife who wears the beautiful red-bordered traditional Muga silk saree.',
      hi: 'यह आपकी धर्मपत्नी हैं जो पारम्परिक लाल किनार वाली मूंगा सिल्क साड़ी पहनती हैं।',
      as: 'এওঁ আপোনাৰ পত্নী, যিয়ে শুৱনি ৰঙা পাৰিৰ মুগাৰ কাপোৰ পৰিধান কৰে।',
      bn: 'ইনি আপনার স্ত্রী, যিনি ঐতিহ্যবাহী লাল পাড়ের সিল্ক শাড়ি ভালোবাসেন।',
      ne: 'उहाँ तपाईंको श्रीमती हुनुहुन्छ जसले सधैं परम्परागत साडी लगाउनुहुन्छ।',
      brx: 'बियो नोंथांनि बिसि जाय गासै समावबो नोंथांखौ हेफाजाब होयो।',
    },
  },
  {
    id: 'fam-4',
    name: 'Vikram Borthakur',
    relationKey: 'son',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Vikram is your devoted son who takes you for calm evening walks in Dighalipukhuri park.',
      hi: 'विक्रम आपका बेटा है जो शाम को आपको दीघलीपुखुरी पार्क में सुकूनभरी सैर कराने ले जाता है।',
      as: 'বিক্ৰম আপোনাৰ সুযোগ্য পুত্ৰ, যিয়ে সন্ধিয়া আপোনাক দীঘলীপুখুৰীৰ পাৰত ফুৰাবলৈ লৈ যায়।',
      bn: 'বিক্রম আপনার ছেলে, যিনি বিকেলে আপনাকে শান্ত পার্কে হাঁটতে নিয়ে যান।',
      ne: 'विक्रम तपाईंको छोरो हो जसले साँझमा तपाईंलाई पार्कमा घुमाउन लैजान्छ।',
      brx: 'बिक्रम नोंथांनि फिसाला जाय बेलासियाव नोंथांखौ बेरायनायाव लाङो।',
    },
    hints: {
      en: 'He is your son who loves fixing items around the house with you.',
      hi: 'यह आपका बेटा है जो घर के काम और बागवानी में आपका हाथ बंटाता है।',
      as: 'এওঁ আপোনাৰ পুত্ৰ, যিয়ে ঘৰৰ বাৰীৰ কামত আপোনাক সহায় কৰে।',
      bn: 'ইনি আপনার ছেলে, যিনি বাগান ও বাড়ির কাজে সাহায্য করেন।',
      ne: 'उहाँ तपाईंको छोरो हुन् जसले घरको काममा सघाउँछन्।',
      brx: 'बियो नोंथांनि फिसाला जाय न\'नि खामानियाव हेफाजाब होयो।',
    },
  },
  {
    id: 'fam-5',
    name: 'Suresh Barua',
    relationKey: 'friend',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    notes: {
      en: 'Suresh is your closest college friend from Cotton College with whom you enjoy hot ginger tea.',
      hi: 'सुरेश कॉटन कॉलेज के दिनों से आपके सबसे पक्के दोस्त हैं जिनके साथ आप चाय की चुस्कियां लेते हैं।',
      as: 'সুৰেশ কটন কলেজৰ দিনৰ পৰাই আপোনাৰ অতি অন্তৰংগ বন্ধু, যাৰ লগত আপুনি চাহ খাবলৈ ভাল পায়।',
      bn: 'সুরেশ আপনার কলেজ জীবনের প্রিয় বন্ধু, যাঁর সাথে আড্ডা দিতে আপনি আজও ভালোবাসেন।',
      ne: 'सुरेश कलेजका दिनदेखिकै तपाईंको घनिष्ठ साथी हुन् जससँग तपाईं चिया पिउनुहुन्छ।',
      brx: 'सुरेश कलेज समावनिफ्रायनो नोंथांनि गाहाइ लोगो जायजों नोंथाङा साहा लोंङो।',
    },
    hints: {
      en: 'He is your longtime friend from college days.',
      hi: 'यह आपके कॉलेज के पुराने व सबसे गहरे मित्र हैं।',
      as: 'এওঁ আপোনাৰ কলেজৰ দিনৰ পুৰণি বন্ধু।',
      bn: 'ইনি আপনার কলেজ জীবনের পুরানো বন্ধু।',
      ne: 'उहाँ तपाईंको कलेजको पुरानो साथी हुनुहुन्छ।',
      brx: 'बियो नोंथांनि कलेज समनि पुरानि लोगो।',
    },
  },
];

const UI_TEXT = {
  questionTitle: {
    en: 'What is your relationship with the person shown in this picture?',
    hi: 'इस तस्वीर में दिख रहे व्यक्ति के साथ आपका क्या संबंध है?',
    as: 'এই ছবিখনত থকা ব্যক্তিজনৰ লগত আপোনাৰ কি সম্পৰ্ক?',
    bn: 'এই ছবিতে থাকা ব্যক্তির সাথে আপনার সম্পর্ক কী?',
    ne: 'यस तस्बिरमा देखिएका व्यक्तिसँग तपाईंको के सम्बन्ध छ?',
    brx: 'बे सावगाराव नुजाथिनाय सुबुंनिजों नोंथांनि मा सोमोन्दो दं?',
  },
  subtitle: {
    en: 'Look closely at the photo and click the correct relation button or record your voice answer below:',
    hi: 'तस्वीर को ध्यान से देखें और नीचे सही रिश्ते पर क्लिक करें या अपना उत्तर बोलकर बताएं:',
    as: 'ছবিখন মনোযোগেৰে চাওক আৰু তলত থকা সঠিক সম্বন্ধত ক্লিক কৰক বা মুখেৰে কওক:',
    bn: 'ছবিটি মনোযোগ দিয়ে দেখুন এবং নিচে সঠিক সম্পর্কে ক্লিক করুন অথবা মুখে বলুন:',
    ne: 'तस्बिरलाई ध्यान दिएर हेर्नुहोस् र तलको सही सम्बन्धमा क्लिक गर्नुहोस् वा बोल्नुहोस्:',
    brx: 'सावगारखौ मोजाङै नाय आरो गाहायाव थार सोमोन्दोखौ थु एबा बुंनानै खिन्था:',
  },
  listenQuestion: {
    en: 'Listen to Question',
    hi: 'प्रश्न सुनें (Audio)',
    as: 'প্ৰশ্নটো শুনক (Audio)',
    bn: 'প্রশ্ন শুনুন (Audio)',
    ne: 'प्रश्न सुन्नुहोस् (Audio)',
    brx: 'सोंनायखौ खोनासन्दों (Audio)',
  },
  recordAnswer: {
    en: 'Record Voice Answer',
    hi: 'बोलकर उत्तर दें (Voice Record)',
    as: 'মুখেৰে কওক (Voice Record)',
    bn: 'মুখে বলুন (Voice Record)',
    ne: 'बोलेर जवाफ दिनुहोस् (Voice Record)',
    brx: 'बुंनानै फिन्नाय हो (Voice Record)',
  },
  recordingActive: {
    en: 'Listening to your voice... Speak now',
    hi: 'सुन रहे हैं... कृपया बोलिए...',
    as: 'শুনি আছোঁ... অনুগ্ৰহ কৰি কওক...',
    bn: 'শুনছি... দয়া করে বলুন...',
    ne: 'सुन्दै छौं... कृपया बोल्नुहोस्...',
    brx: 'खोनासंन्दों... अननानै बुं...',
  },
  voiceRecognized: {
    en: 'Voice Recognized:',
    hi: 'पहचाना गया:',
    as: 'চিনাক্ত কৰা হ’ল:',
    bn: 'শনাক্ত হয়েছে:',
    ne: 'पहिचान भयो:',
    brx: 'सिनजाबाय:',
  },
  voiceSuccess: {
    en: 'Wonderful! You accurately recognized your family member!',
    hi: 'शाबाश! आपने अपने परिवार के सदस्य को बिल्कुल सही पहचाना!',
    as: 'অতিকৈ সুন্দৰ! আপুনি আপোনাৰ পৰিয়ালৰ সদস্যক সঠিকভাৱে চিনাক্ত কৰিলে!',
    bn: 'অসাধারণ! আপনি আপনার পরিবারের সদস্যকে সঠিকভাবে চিনতে পেরেছেন!',
    ne: 'धेरै राम्रो! तपाईंले आफ्नो परिवारको सदस्यलाई सही पहिचान गर्नुभयो!',
    brx: 'जोबोर मोजां! नोंथाङा नखरनि सुबुंखौ थारै सिनबाय!',
  },
  incorrectTryAgain: {
    en: 'Take a gentle look again. Here is a friendly clue!',
    hi: 'कोई बात नहीं, तस्वीर को फिर से देखें। यह रहा एक छोटा सा संकेत:',
    as: 'চিন্তা নকৰিব, ছবিখন আকৌ এবাৰ চাওক। এইয়া এটি সৰু ইংগিত:',
    bn: 'কোনো ব্যাপার নয়, ছবিটি আবার দেখুন। এখানে একটি সংকেত রয়েছে:',
    ne: 'चिन्ता नगर्नुहोस्, तस्बिर फेरि हेर्नुहोस्। यो सानो सङ्केत हेर्नुहोस्:',
    brx: 'साननो नाङा, सावगारखौ आरोबाव नाय। बेयो मोनसे सोमोन्दो सिन:',
  },
  uploadTab: {
    en: 'Upload Family Photo',
    hi: 'पारिवारिक फोटो अपलोड करें',
    as: 'পৰিয়ালৰ ফটো আপলোড কৰক',
    bn: 'পারিবারিক ছবি আপলোড করুন',
    ne: 'पारिवारिक तस्बिर अपलोड गर्नुहोस्',
    brx: 'नखरनि सावगार आपलोड खालाम',
  },
  practiceTab: {
    en: 'Recognize Family Members',
    hi: 'पारिवारिक चेहरे पहचानें',
    as: 'পৰিয়ালৰ সদস্য চিনাক্তকৰণ',
    bn: 'পারিবারিক মুখমণ্ডল শনাক্তকরণ',
    ne: 'पारिवारिक सदस्य पहिचान',
    brx: 'नखरनि सुबुं सिननाय',
  },
  uploadPrompt: {
    en: 'Add a new family photo to practice recognizing your loved ones:',
    hi: 'अपनों को पहचानने के अभ्यास के लिए नई पारिवारिक तस्वीर जोड़ें:',
    as: 'আপোনাৰ আপোনজনক চিনাক্ত কৰাৰ বাবে নতুন পারিবারিক ছবি যোগ কৰক:',
    bn: 'প্রিয়জনদের শনাক্ত করার অনুশীলনের জন্য নতুন পারিবারিক ছবি যোগ করুন:',
    ne: 'आफ्ना प्रियजनहरूलाई पहिचान गर्ने अभ्यासका लागि नयाँ तस्बिर थप्नुहोस्:',
    brx: 'नोंथांनि मोजां मोननाय सुबुंफोरखौ सिननो थाखाय गोदान सावगार सोफा:',
  },
  namePlaceholder: {
    en: 'Person Full Name (e.g. Ananya, Vikram)',
    hi: 'व्यक्ति का नाम (उदा. अनन्या, विक्रम)',
    as: 'ব্যক্তিৰ নাম (যেনে: অনন্যা, বিক্ৰম)',
    bn: 'ব্যক্তির নাম (যেমন: অনন্যা, বিক্রম)',
    ne: 'व्यक्तिको नाम (जस्तै: अनन्या, विक्रम)',
    brx: 'सुबुंनि मुं (जेरै: अनन्या, बिक्रम)',
  },
  saveAndPractice: {
    en: 'Save & Practice This Photo',
    hi: 'सुरक्षित करें और अभ्यास करें',
    as: 'সংৰক্ষণ কৰক আৰু অনুশীলন কৰক',
    bn: 'সংরক্ষণ করুন এবং অনুশীলন করুন',
    ne: 'सुरक्षित गर्नुहोस् र अभ्यास गर्नुहोस्',
    brx: 'दोनथुम आरो सोलों',
  },
  congratsTitle: {
    en: 'Recognition Session Completed!',
    hi: 'पहचान सत्र सफलतापूर्वक पूरा हुआ!',
    as: 'চিনাক্তকৰণ পৰ্ব সফলতাৰে সম্পূৰ্ণ হ’ল!',
    bn: 'শনাক্তকরণ পর্ব সফলভাবে সম্পন্ন হলো!',
    ne: 'पहिचान सत्र सफलतापूर्वक सम्पन्न भयो!',
    brx: 'सिननाय हाबाया जाफुंबाय!',
  },
};

export const PictureRecognition: React.FC<PictureRecognitionProps> = ({ onComplete, onBack }) => {
  const { elderlyMode } = useAccessibilityStore();
  const { currentLanguage, setLanguage, availableLanguages } = useLanguageStore();

  // Active language for question & audio
  const [activeLang, setActiveLang] = useState<SupportedLanguage>(currentLanguage || 'hi');

  // Sync store language if changes
  useEffect(() => {
    if (currentLanguage) {
      setActiveLang(currentLanguage);
    }
  }, [currentLanguage]);

  // Load family cards from localStorage or defaults
  const [familyFaces, setFamilyFaces] = useState<FamilyFaceItem[]>(() => {
    try {
      const saved = localStorage.getItem('smriti_family_faces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse local family faces', e);
    }
    return DEFAULT_FAMILY_MEMBERS;
  });

  const [activeTab, setActiveTab] = useState<'practice' | 'upload'>('practice');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedRelation, setSelectedRelation] = useState<FamilyRelationKey | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [hintVisible, setHintVisible] = useState(false);

  // Audio & Voice Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [voiceFeedbackMsg, setVoiceFeedbackMsg] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Upload Form States
  const [uploadName, setUploadName] = useState('');
  const [uploadRelation, setUploadRelation] = useState<FamilyRelationKey>('daughter');
  const [uploadNote, setUploadNote] = useState('');
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPerson = familyFaces[currentIdx] || familyFaces[0];

  // Speak question automatically when card changes if elderly mode is enabled
  useEffect(() => {
    setSpeechTranscript('');
    setVoiceFeedbackMsg('');
    setRecordedAudioUrl(null);
    setSelectedRelation(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setHintVisible(false);
  }, [currentIdx, familyFaces]);

  // Handle Question TTS Audio
  const handleSpeakQuestion = () => {
    const questionText = UI_TEXT.questionTitle[activeLang];
    speakText(questionText, activeLang);
  };

  // Helper to generate relation buttons choices (including correct one and plausible alternatives)
  const candidateOptions: FamilyRelationKey[] = React.useMemo(() => {
    const allRelations: FamilyRelationKey[] = [
      'daughter',
      'wife',
      'son',
      'granddaughter',
      'brother',
      'friend',
      'mother',
      'father',
      'sister',
      'grandson',
    ];
    const correct = currentPerson.relationKey;
    const others = allRelations.filter((r) => r !== correct);
    // Shuffle and pick 3 others
    const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [correct, ...shuffled].sort(() => 0.5 - Math.random());
    return combined;
  }, [currentPerson]);

  // Handle User clicking relation button
  const handleSelectRelation = (relKey: FamilyRelationKey) => {
    if (isAnswered) return;

    const correct = relKey === currentPerson.relationKey;
    setSelectedRelation(relKey);
    setIsAnswered(true);
    setIsCorrect(correct);
    setAttemptsCount((prev) => prev + 1);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      const personTitle = RELATION_LABELS[relKey][activeLang].fullTitle;
      const successVoice = `${UI_TEXT.voiceSuccess[activeLang]} ${currentPerson.name} - ${personTitle}.`;
      speakText(successVoice, activeLang);
    } else {
      setHintVisible(true);
      const gentleVoice = UI_TEXT.incorrectTryAgain[activeLang];
      speakText(gentleVoice, activeLang);
    }
  };

  // Go to next family face
  const handleNextPerson = () => {
    if (currentIdx + 1 < familyFaces.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const elapsed = Date.now() - startTime;
      const finalCorrect = isCorrect ? correctCount : correctCount;
      const accuracy = Math.round((finalCorrect / familyFaces.length) * 100);
      setIsFinished(true);
      onComplete(accuracy, attemptsCount + 1, elapsed);
    }
  };

  // Start Voice Answer Recording & Speech Recognition
  const startVoiceRecording = async () => {
    try {
      setVoiceFeedbackMsg('');
      setSpeechTranscript('');
      setIsRecording(true);

      // 1. Start browser speech recognition if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = false;
        recognition.interimResults = true;

        // Regional BCP 47 language mapping for speech-to-text
        const sttLangMap: Record<SupportedLanguage, string> = {
          hi: 'hi-IN',
          as: 'as-IN',
          bn: 'bn-IN',
          ne: 'ne-NP',
          brx: 'hi-IN',
          en: 'en-IN',
        };

        recognition.lang = sttLangMap[activeLang] || 'hi-IN';

        recognition.onresult = (event: any) => {
          let transcriptText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcriptText += event.results[i][0].transcript;
          }
          setSpeechTranscript(transcriptText);

          // Check if transcript matches current relation keywords
          checkVoiceMatch(transcriptText);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      }

      // 2. Start audio recording via MediaRecorder for playback
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(audioUrl);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.error('Microphone access failed:', err);
      setIsRecording(false);
      setVoiceFeedbackMsg('Microphone access is not available. Please allow mic permission or use relation buttons.');
    }
  };

  // Stop Voice Recording
  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Check voice transcript for matching family relation or person name
  const checkVoiceMatch = (spokenText: string) => {
    const textLower = spokenText.toLowerCase().trim();
    if (!textLower) return;

    const correctRel = currentPerson.relationKey;
    const relData = RELATION_LABELS[correctRel][activeLang];
    const keywords = relData.voiceKeywords || [];

    // Check if spoken text contains relation keywords or person name
    const matchesRelation = keywords.some((kw) => textLower.includes(kw.toLowerCase()));
    const matchesName = textLower.includes(currentPerson.name.toLowerCase().split(' ')[0]);

    if (matchesRelation || matchesName) {
      setVoiceFeedbackMsg(`✨ Matched: "${spokenText}" (${relData.label})`);
      handleSelectRelation(correctRel);
      stopVoiceRecording();
    }
  };

  // Playback recorded audio
  const handlePlayRecordedAudio = () => {
    if (!recordedAudioUrl) return;
    const audio = new Audio(recordedAudioUrl);
    setIsAudioPlaying(true);
    audio.play();
    audio.onended = () => setIsAudioPlaying(false);
    audio.onerror = () => setIsAudioPlaying(false);
  };

  // Handle Photo File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save new custom family face
  const handleSaveUploadedPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) {
      setUploadError('Please enter the name of the family member.');
      return;
    }
    if (!uploadPreviewUrl) {
      setUploadError('Please choose or upload a photo.');
      return;
    }

    const newFace: FamilyFaceItem = {
      id: `custom-fam-${Date.now()}`,
      name: uploadName.trim(),
      relationKey: uploadRelation,
      imageUrl: uploadPreviewUrl,
      isCustom: true,
      notes: {
        en: uploadNote.trim() || `${uploadName} is your beloved ${RELATION_LABELS[uploadRelation].en.label}.`,
        hi: uploadNote.trim() || `${uploadName} आपकी प्रिय ${RELATION_LABELS[uploadRelation].hi.label} हैं।`,
        as: uploadNote.trim() || `${uploadName} আপোনাৰ মৰমৰ ${RELATION_LABELS[uploadRelation].as.label}।`,
        bn: uploadNote.trim() || `${uploadName} আপনার ভালোবাসার ${RELATION_LABELS[uploadRelation].bn.label}।`,
        ne: uploadNote.trim() || `${uploadName} तपाईंको प्रिय ${RELATION_LABELS[uploadRelation].ne.label} हुनुहुन्छ।`,
        brx: uploadNote.trim() || `${uploadName} नोंथांनि ${RELATION_LABELS[uploadRelation].brx.label}।`,
      },
      hints: {
        en: `This is your ${RELATION_LABELS[uploadRelation].en.label} ${uploadName}.`,
        hi: `यह आपकी ${RELATION_LABELS[uploadRelation].hi.label} ${uploadName} हैं।`,
        as: `এওঁ আপোনাৰ ${RELATION_LABELS[uploadRelation].as.label} ${uploadName}।`,
        bn: `ইনি আপনার ${RELATION_LABELS[uploadRelation].bn.label} ${uploadName}।`,
        ne: `उहाँ तपाईंको ${RELATION_LABELS[uploadRelation].ne.label} ${uploadName} हुनुहुन्छ।`,
        brx: `बियो नोंथांनि ${RELATION_LABELS[uploadRelation].brx.label} ${uploadName}।`,
      },
    };

    const updatedFaces = [newFace, ...familyFaces];
    setFamilyFaces(updatedFaces);
    try {
      localStorage.setItem('smriti_family_faces', JSON.stringify(updatedFaces));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }

    // Reset upload form
    setUploadName('');
    setUploadNote('');
    setUploadPreviewUrl(null);
    setUploadError('');
    setActiveTab('practice');
    setCurrentIdx(0);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-forest-800 hover:text-forest-900 hover:underline cursor-pointer bg-forest-50/60 px-3.5 py-1.5 rounded-full border border-forest-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Activities
        </button>

        {/* Regional Language Switcher */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-ivory-300 shadow-xs">
          <Globe className="w-4 h-4 text-forest-700 shrink-0" />
          <span className="text-xs font-bold text-charcoal-700 hidden sm:inline">Language:</span>
          <select
            value={activeLang}
            onChange={(e) => {
              const lang = e.target.value as SupportedLanguage;
              setActiveLang(lang);
              setLanguage(lang);
            }}
            className="text-xs font-bold text-forest-900 bg-transparent border-none outline-none cursor-pointer pr-1"
          >
            {availableLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel} ({l.label})
              </option>
            ))}
          </select>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="inline-flex p-1 bg-ivory-100 rounded-2xl border border-ivory-300 shadow-inner">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'practice'
                ? 'bg-forest-800 text-white shadow-soft'
                : 'text-charcoal-700 hover:text-forest-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> {UI_TEXT.practiceTab[activeLang]}
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-forest-800 text-white shadow-soft'
                : 'text-charcoal-700 hover:text-forest-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> {UI_TEXT.uploadTab[activeLang]}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PRACTICE & FAMILY FACE RECOGNITION SECTION                         */}
      {/* ========================================================================= */}
      {activeTab === 'practice' && !isFinished && (
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between text-xs font-bold text-charcoal-600 bg-ivory-50 px-4 py-2 rounded-2xl border border-ivory-200">
            <span className="flex items-center gap-1.5 text-forest-800 font-extrabold uppercase tracking-wider">
              <Heart className="w-4 h-4 text-terracotta-500 fill-terracotta-500" />
              Family Member {currentIdx + 1} of {familyFaces.length}
            </span>
            <span className="text-charcoal-500">
              Accuracy: {correctCount} / {familyFaces.length}
            </span>
          </div>

          {/* Main Visual Photo Display Card */}
          <div className="bg-white rounded-3xl p-4 md:p-6 border-2 border-ivory-200 shadow-soft space-y-6">
            <div className="relative max-w-md mx-auto rounded-3xl overflow-hidden shadow-photo border-4 border-white bg-ivory-100 group">
              <img
                src={currentPerson.imageUrl}
                alt="Family Member"
                className="w-full h-64 sm:h-80 md:h-96 object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              {currentPerson.isCustom && (
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  Custom Upload
                </div>
              )}
            </div>

            {/* Multilingual Question Prompt & Audio Playback Button */}
            <div className="space-y-3 text-center max-w-2xl mx-auto">
              <h3
                className={`font-serif font-extrabold text-charcoal-900 leading-tight ${
                  elderlyMode ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                }`}
              >
                {UI_TEXT.questionTitle[activeLang]}
              </h3>

              <p className="text-sm font-medium text-charcoal-600">
                {UI_TEXT.subtitle[activeLang]}
              </p>

              {/* TTS Listen Button */}
              <div className="flex justify-center items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSpeakQuestion}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest-50 text-forest-900 border border-forest-300 hover:bg-forest-100 font-bold text-sm shadow-xs transition-all cursor-pointer focus:ring-4 focus:ring-forest-200"
                >
                  <Volume2 className="w-4 h-4 text-forest-700" />
                  {UI_TEXT.listenQuestion[activeLang]}
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* USER AUDIO RECORDING SECTION (Record Voice Answer)                       */}
            {/* ========================================================================= */}
            <div className="bg-ivory-50/80 border border-ivory-300 rounded-2xl p-4 md:p-5 max-w-2xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-forest-600'}`} />
                  <span className="text-sm font-bold text-charcoal-800">
                    {isRecording ? UI_TEXT.recordingActive[activeLang] : UI_TEXT.recordAnswer[activeLang]}
                  </span>
                </div>

                {/* Mic Record Toggle Button */}
                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      disabled={isAnswered && isCorrect}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta-600 text-white font-bold text-sm shadow-soft hover:bg-terracotta-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{UI_TEXT.recordAnswer[activeLang]}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white font-bold text-sm shadow-soft hover:bg-red-700 animate-pulse transition-all cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop Recording</span>
                    </button>
                  )}

                  {/* Playback Button for Recorded Audio */}
                  {recordedAudioUrl && (
                    <button
                      type="button"
                      onClick={handlePlayRecordedAudio}
                      disabled={isAudioPlaying}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-forest-900 border border-forest-300 font-bold text-xs shadow-xs hover:bg-forest-50 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-forest-800" />
                      <span>Play My Voice</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Live Speech Recognition Feedback */}
              {speechTranscript && (
                <div className="bg-white p-3 rounded-xl border border-ivory-300 text-xs font-medium text-charcoal-800 flex items-center gap-2">
                  <span className="font-bold text-forest-800">{UI_TEXT.voiceRecognized[activeLang]}</span>
                  <span className="italic text-charcoal-900">"{speechTranscript}"</span>
                </div>
              )}

              {voiceFeedbackMsg && (
                <div className="text-xs font-bold text-forest-800 bg-forest-50 p-2.5 rounded-xl border border-forest-200">
                  {voiceFeedbackMsg}
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* CLICKABLE RELATION BUTTONS GRID                                          */}
            {/* ========================================================================= */}
            <div className="space-y-3 max-w-2xl mx-auto pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal-500 text-center">
                Choose Relationship:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {candidateOptions.map((relKey) => {
                  const relOption = RELATION_LABELS[relKey][activeLang];
                  const isSelected = selectedRelation === relKey;
                  const isCorrectChoice = relKey === currentPerson.relationKey;

                  let btnStyle =
                    'bg-white border-2 border-ivory-300 text-charcoal-900 hover:border-forest-600 hover:bg-forest-50/40 shadow-soft';

                  if (isAnswered) {
                    if (isCorrectChoice) {
                      btnStyle = 'bg-forest-800 border-forest-900 text-white font-bold shadow-photo ring-4 ring-forest-300';
                    } else if (isSelected) {
                      btnStyle = 'bg-terracotta-600 border-terracotta-700 text-white font-bold';
                    } else {
                      btnStyle = 'bg-ivory-100 border-ivory-200 text-charcoal-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={relKey}
                      type="button"
                      onClick={() => handleSelectRelation(relKey)}
                      disabled={isAnswered && isCorrect}
                      className={`w-full p-4 rounded-2xl text-center font-serif font-bold transition-all duration-200 select-none cursor-pointer flex items-center justify-between px-5 ${btnStyle} ${
                        elderlyMode ? 'py-5 text-xl' : 'text-base'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Heart
                          className={`w-4 h-4 ${
                            isAnswered && isCorrectChoice ? 'fill-white text-white' : 'text-terracotta-500'
                          }`}
                        />
                        {relOption.label}
                      </span>

                      {isAnswered && isCorrectChoice && <Check className="w-5 h-5 text-white stroke-[3]" />}
                      {isAnswered && isSelected && !isCorrectChoice && <X className="w-5 h-5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* SUCCESS / FEEDBACK CARD & NEXT BUTTON                                     */}
            {/* ========================================================================= */}
            {isAnswered && (
              <div
                className={`p-5 rounded-2xl max-w-2xl mx-auto space-y-3 transition-all animate-fadeIn ${
                  isCorrect
                    ? 'bg-forest-50 border-2 border-forest-400 text-forest-950'
                    : 'bg-amber-50 border-2 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-forest-700 shrink-0" />
                  ) : (
                    <Info className="w-6 h-6 text-amber-700 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-serif font-bold text-base md:text-lg">
                      {isCorrect
                        ? `${currentPerson.name} — ${RELATION_LABELS[currentPerson.relationKey][activeLang].fullTitle}`
                        : UI_TEXT.incorrectTryAgain[activeLang]}
                    </h4>
                    <p className="text-xs md:text-sm font-medium mt-1">
                      {isCorrect
                        ? currentPerson.notes?.[activeLang] || currentPerson.notes?.en
                        : currentPerson.hints?.[activeLang] || currentPerson.hints?.en}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextPerson}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-forest-800 text-white font-bold text-sm shadow-soft hover:bg-forest-900 transition-all cursor-pointer"
                  >
                    <span>
                      {currentIdx + 1 < familyFaces.length ? 'Next Family Member →' : 'View Results & Complete'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UPLOAD CUSTOM FAMILY PHOTO                                         */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-ivory-200 shadow-soft max-w-2xl mx-auto space-y-6">
          <div className="border-b border-ivory-200 pb-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-forest-800 inline-flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" /> Personal Family Memory Setup
            </span>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mt-1">
              {UI_TEXT.uploadTab[activeLang]}
            </h3>
            <p className="text-sm font-medium text-charcoal-600 mt-1">
              {UI_TEXT.uploadPrompt[activeLang]}
            </p>
          </div>

          <form onSubmit={handleSaveUploadedPhoto} className="space-y-5">
            {/* Image Preview & Upload Input */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2">
                Select Photo from Device
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-forest-300 rounded-3xl p-6 text-center hover:bg-forest-50/40 transition-colors cursor-pointer bg-ivory-50/60"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadPreviewUrl ? (
                  <div className="space-y-3">
                    <img
                      src={uploadPreviewUrl}
                      alt="Uploaded preview"
                      className="w-48 h-48 object-cover rounded-2xl mx-auto shadow-photo border-2 border-white"
                    />
                    <p className="text-xs font-bold text-forest-800 underline">
                      Click to change photo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Upload className="w-10 h-10 text-forest-700 mx-auto" />
                    <p className="font-serif font-bold text-charcoal-900 text-base">
                      Click or Tap to Upload Family Photo
                    </p>
                    <p className="text-xs text-charcoal-500">Supports JPG, PNG, WebP images</p>
                  </div>
                )}
              </div>
            </div>

            {/* Person Name Input */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Family Member Name
              </label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder={UI_TEXT.namePlaceholder[activeLang]}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 bg-ivory-50/50 font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
              />
            </div>

            {/* Relationship Dropdown Selection */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Relationship with Patient
              </label>
              <select
                value={uploadRelation}
                onChange={(e) => setUploadRelation(e.target.value as FamilyRelationKey)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 bg-ivory-50/50 font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm cursor-pointer"
              >
                {(Object.keys(RELATION_LABELS) as FamilyRelationKey[]).map((relKey) => (
                  <option key={relKey} value={relKey}>
                    {RELATION_LABELS[relKey][activeLang].label} ({RELATION_LABELS[relKey].en.label})
                  </option>
                ))}
              </select>
            </div>

            {/* Memory / Story Note */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Comfort Memory Clue (Optional)
              </label>
              <textarea
                value={uploadNote}
                onChange={(e) => setUploadNote(e.target.value)}
                placeholder="e.g. Loves taking walks with you in the garden, calls every morning."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 bg-ivory-50/50 font-medium text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 text-sm"
              />
            </div>

            {uploadError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                {uploadError}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" variant="primary" size="lg">
                {UI_TEXT.saveAndPractice[activeLang]}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FINAL COMPLETION SUMMARY CARD                                             */}
      {/* ========================================================================= */}
      {isFinished && (
        <div className="bg-ivory-100 border-2 border-forest-600 text-center space-y-6 p-8 md:p-12 rounded-4xl shadow-photo max-w-2xl mx-auto animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-forest-100 border-2 border-forest-400 flex items-center justify-center mx-auto text-forest-800">
            <Smile className="w-12 h-12 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-charcoal-900">
              {UI_TEXT.congratsTitle[activeLang]}
            </h3>
            <p className="text-charcoal-700 font-medium text-lg">
              You recognized <span className="font-bold text-forest-800">{correctCount}</span> out of{' '}
              <span className="font-bold text-forest-800">{familyFaces.length}</span> family member faces accurately!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setCurrentIdx(0);
                setCorrectCount(0);
                setAttemptsCount(0);
                setIsFinished(false);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Practice Again
            </Button>

            <Button variant="primary" size="lg" onClick={onBack}>
              Return to Schedule
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

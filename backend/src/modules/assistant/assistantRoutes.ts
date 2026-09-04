/**
 * backend/src/modules/assistant/assistantRoutes.ts
 * ----------------------------------------------------
 * Native Language Conversational AI Assistant & Direct Action Engine
 * Supports Voice & Text interaction in Hindi, English, Assamese, Bengali, Nepali.
 */

import { Router, Request, Response } from 'express';

const router = Router();

interface ActionPayload {
  type: 'OPEN_ACTIVITY' | 'OPEN_TAB' | 'TOGGLE_ELDERLY' | 'CHANGE_LANGUAGE' | 'OPEN_PORTAL' | 'NONE';
  payload?: string;
}

interface ChatResponse {
  reply: string;
  spokenText: string;
  detectedLanguage: string;
  action: ActionPayload;
  quickSuggestions: string[];
}

function normalize(text: string): string {
  return (text || '').toLowerCase().trim();
}

function detectIntentAndRespond(input: string, userLang: string = 'hi'): ChatResponse {
  const norm = normalize(input);
  const lang = userLang || 'hi';

  // 1. Check for Language Switching Command
  if (
    norm.includes('hindi') ||
    norm.includes('हिंदी') ||
    norm.includes('हिन्दी')
  ) {
    return {
      reply: 'नमस्ते! मैंने आपकी भाषा हिंदी (Hindi) में सेट कर दी है। आप मुझसे गेम खेलने, यादें देखने या दवाई के बारे में कुछ भी पूछ सकते हैं!',
      spokenText: 'नमस्ते! मैंने आपकी भाषा हिंदी में सेट कर दी है।',
      detectedLanguage: 'hi',
      action: { type: 'CHANGE_LANGUAGE', payload: 'hi' },
      quickSuggestions: ['खेल शुरू करो 🎮', 'दवाई रिमाइंडर ⏰', 'स्मृति उद्यान 🌸', 'मदद चाहिए 💡'],
    };
  }

  if (
    norm.includes('assamese') ||
    norm.includes('অসমীয়া') ||
    norm.includes('অসমীয়াত')
  ) {
    return {
      reply: 'নমস্কাৰ! মই ভাষা অসমীয়ালৈ সলনি কৰিছোঁ। আপুনি খেল আৰম্ভ কৰিব পাৰে বা দৈনন্দিন সোঁৱৰণি চাব পাৰে।',
      spokenText: 'নমস্কাৰ! মই ভাষা অসমীয়ালৈ সলনি কৰিছোঁ।',
      detectedLanguage: 'as',
      action: { type: 'CHANGE_LANGUAGE', payload: 'as' },
      quickSuggestions: ['খেল আৰম্ভ কৰক 🎮', 'দৰবৰ সোঁৱৰণি ⏰', 'স্মৃতি উদ্যান 🌸', 'সহায় 💡'],
    };
  }

  if (
    norm.includes('bengali') ||
    norm.includes('বাংলা') ||
    norm.includes('বাংলায়')
  ) {
    return {
      reply: 'নমস্কার! আমি ভাষা বাংলায় পরিবর্তন করেছি। আপনি খেলা শুরু করতে পারেন অথবা পারিবারিক স্মৃতি দেখতে পারেন।',
      spokenText: 'নমস্কার! আমি ভাষা বাংলায় পরিবর্তন করেছি।',
      detectedLanguage: 'bn',
      action: { type: 'CHANGE_LANGUAGE', payload: 'bn' },
      quickSuggestions: ['খেলা শুরু করো 🎮', 'ওষুধের রিমাইন্ডার ⏰', 'স্মৃতি বাগান 🌸', 'সাহায্য 💡'],
    };
  }

  if (
    norm.includes('english') ||
    norm.includes('talk in english') ||
    norm.includes('switch to english')
  ) {
    return {
      reply: 'Hello! I have set the language to English. You can ask me to start games, view memories, or check reminders anytime!',
      spokenText: 'Hello! Language switched to English.',
      detectedLanguage: 'en',
      action: { type: 'CHANGE_LANGUAGE', payload: 'en' },
      quickSuggestions: ['Open Game 🎮', 'Daily Reminders ⏰', 'Memory Garden 🌸', 'Help 💡'],
    };
  }

  // 2. Direct Access: Open Games / Activities
  const isGameIntent =
    norm.includes('game') ||
    norm.includes('play') ||
    norm.includes('open game') ||
    norm.includes('start game') ||
    norm.includes('खेल') ||
    norm.includes('गेम') ||
    norm.includes('खेले') ||
    norm.includes('खेलेंगे') ||
    norm.includes('খেল') ||
    norm.includes('খেলা') ||
    norm.includes('match') ||
    norm.includes('puzzle') ||
    norm.includes('पहेली');

  if (isGameIntent) {
    let activity: string = 'memory_match';
    if (norm.includes('picture') || norm.includes('तस्वीर') || norm.includes('ছবি') || norm.includes('photo')) {
      activity = 'picture_recognition';
    } else if (norm.includes('puzzle') || norm.includes('पहेली')) {
      activity = 'photo_puzzle';
    } else if (norm.includes('sound') || norm.includes('आवाज') || norm.includes('শব্দ') || norm.includes('ध्वनि')) {
      activity = 'familiar_sound';
    } else if (norm.includes('routine') || norm.includes('दिनचर्या') || norm.includes('রুটিন')) {
      activity = 'routine_recall';
    } else if (norm.includes('sequence') || norm.includes('क्रम')) {
      activity = 'sequence_recall';
    }

    if (lang === 'hi' || norm.includes('खेल') || norm.includes('गेम')) {
      return {
        reply: `ज़रूर! मैं आपके लिए मानसिक गतिविधि गेम (${activity === 'memory_match' ? 'स्मृति मिलान' : activity}) खोल रही हूँ। चलिए आनंद लेते हैं! 🎮`,
        spokenText: 'ज़रूर! मैं आपके लिए खेल शुरू कर रही हूँ। चलिए खेलते हैं!',
        detectedLanguage: 'hi',
        action: { type: 'OPEN_ACTIVITY', payload: activity },
        quickSuggestions: ['खेल फिर से शुरू करें', 'दवाई का समय', 'यादें देखें', 'मदद'],
      };
    } else if (lang === 'as' || norm.includes('খেল')) {
      return {
        reply: 'নিশ্চয়! মই আপোনাৰ বাবে মানসিক কাৰ্যসূচী খেল খুলি আছোঁ। 🎮',
        spokenText: 'নিশ্চয়! মই আপোনাৰ বাবে খেল খুলি আছোঁ।',
        detectedLanguage: 'as',
        action: { type: 'OPEN_ACTIVITY', payload: activity },
        quickSuggestions: ['খেল আৰম্ভ কৰক', 'সোঁৱৰণি', 'স্মৃতি উদ্যান'],
      };
    } else if (lang === 'bn' || norm.includes('খেলা')) {
      return {
        reply: 'অবশ্যই! আমি আপনার জন্য মেমোরি গেমটি খুলে দিচ্ছি। চলুন খেলি! 🎮',
        spokenText: 'অবশ্যই! আমি আপনার জন্য খেলাটি শুরু করছি।',
        detectedLanguage: 'bn',
        action: { type: 'OPEN_ACTIVITY', payload: activity },
        quickSuggestions: ['খেলা শুরু করো', 'রিমাইন্ডার', 'স্মৃতি বাগান'],
      };
    } else {
      return {
        reply: `Opening the ${activity.replace('_', ' ')} cognitive game for you right now! Have fun! 🎮`,
        spokenText: `Opening the game for you right now. Let's play!`,
        detectedLanguage: 'en',
        action: { type: 'OPEN_ACTIVITY', payload: activity },
        quickSuggestions: ['Play Memory Match', 'Daily Reminders', 'Memory Garden', 'Help'],
      };
    }
  }

  // 3. Direct Access: Reminders & Medicine
  const isReminderIntent =
    norm.includes('reminder') ||
    norm.includes('medicine') ||
    norm.includes('दवाई') ||
    norm.includes('दवा') ||
    norm.includes('गोली') ||
    norm.includes('पानी') ||
    norm.includes('रिमाइंडर') ||
    norm.includes('সোঁৱৰণি') ||
    norm.includes('দৰব') ||
    norm.includes('ওষুধ') ||
    norm.includes('রিমাইন্ডার');

  if (isReminderIntent) {
    if (lang === 'hi' || norm.includes('दवा') || norm.includes('रिमाइंडर')) {
      return {
        reply: 'यहाँ आपके आज के दैनिक स्मरण और दवाइयों की सूची है। समय पर दवा लेना न भूलें! ⏰',
        spokenText: 'यहाँ आपके आज के दैनिक स्मरण और दवाइयाँ हैं।',
        detectedLanguage: 'hi',
        action: { type: 'OPEN_TAB', payload: 'reminders' },
        quickSuggestions: ['खेल खोलो 🎮', 'स्मृति उद्यान 🌸', 'शांति से सांस लें 🌿'],
      };
    } else if (lang === 'as') {
      return {
        reply: 'আপোনাৰ আজিৰ দৰব আৰু দৈনন্দিন সোঁৱৰণিৰ পৃষ্ঠা খোলা হৈছে। ⏰',
        spokenText: 'আপোনাৰ আজিৰ সোঁৱৰণি খোলা হৈছে।',
        detectedLanguage: 'as',
        action: { type: 'OPEN_TAB', payload: 'reminders' },
        quickSuggestions: ['খেল আৰম্ভ কৰক 🎮', 'স্মৃতি উদ্যান 🌸'],
      };
    } else if (lang === 'bn') {
      return {
        reply: 'আপনার আজকের ওষুধ এবং দৈনিক রিমাইন্ডারের তালিকা খোলা হলো। ⏰',
        spokenText: 'আপনার আজকের রিমাইন্ডার খোলা হয়েছে।',
        detectedLanguage: 'bn',
        action: { type: 'OPEN_TAB', payload: 'reminders' },
        quickSuggestions: ['খেলা শুরু করো 🎮', 'স্মৃতি বাগান 🌸'],
      };
    } else {
      return {
        reply: 'Here are your scheduled daily reminders and medications! ⏰',
        spokenText: 'Opening your daily reminders and medication schedule.',
        detectedLanguage: 'en',
        action: { type: 'OPEN_TAB', payload: 'reminders' },
        quickSuggestions: ['Open Game 🎮', 'Memory Garden 🌸', 'Help 💡'],
      };
    }
  }

  // 4. Direct Access: Memories & Family Photos
  const isMemoryIntent =
    norm.includes('memory') ||
    norm.includes('memories') ||
    norm.includes('garden') ||
    norm.includes('photo') ||
    norm.includes('family') ||
    norm.includes('याद') ||
    norm.includes('यादें') ||
    norm.includes('स्मृति') ||
    norm.includes('तस्वीर') ||
    norm.includes('परिवार') ||
    norm.includes('স্মৃতি উদ্যান') ||
    norm.includes('স্মৃতি বাগান');

  if (isMemoryIntent) {
    if (lang === 'hi' || norm.includes('याद')) {
      return {
        reply: 'स्मृति उद्यान खोला गया है! यहाँ आपकी खूबसूरत पारिवारिक यादें और तस्वीरें हैं। 🌸',
        spokenText: 'स्मृति उद्यान खोला गया है। यहाँ आपकी पारिवारिक यादें हैं।',
        detectedLanguage: 'hi',
        action: { type: 'OPEN_TAB', payload: 'memories' },
        quickSuggestions: ['खेल खेलें 🎮', 'दवाई रिमाइंडर ⏰', 'नई याद जोड़ें ✍️'],
      };
    } else if (lang === 'as') {
      return {
        reply: 'স্মৃতি উদ্যান খোলা হৈছে। ইয়াত আপোনাৰ পাৰিবাৰিক স্মৃতি আৰু ফটোসমূহ আছে। 🌸',
        spokenText: 'স্মৃতি উদ্যান খোলা হৈছে।',
        detectedLanguage: 'as',
        action: { type: 'OPEN_TAB', payload: 'memories' },
        quickSuggestions: ['খেল আৰম্ভ কৰক 🎮', 'সোঁৱৰণি ⏰'],
      };
    } else if (lang === 'bn') {
      return {
        reply: 'স্মৃতি উদ্যান খোলা হয়েছে। এখানে আপনার সুন্দর পারিবারিক স্মৃতিগুলো দেখতে পাবেন। 🌸',
        spokenText: 'স্মৃতি উদ্যান খোলা হয়েছে।',
        detectedLanguage: 'bn',
        action: { type: 'OPEN_TAB', payload: 'memories' },
        quickSuggestions: ['খেলা শুরু করো 🎮', 'রিমাইন্ডার ⏰'],
      };
    } else {
      return {
        reply: 'Opening your Memory Garden! Here are your cherished family stories and photographs. 🌸',
        spokenText: 'Opening your Memory Garden and family stories.',
        detectedLanguage: 'en',
        action: { type: 'OPEN_TAB', payload: 'memories' },
        quickSuggestions: ['Open Game 🎮', 'Daily Reminders ⏰', 'Add Memory ✍️'],
      };
    }
  }

  // 5. Direct Access: Elderly Mode
  const isElderlyIntent =
    norm.includes('elderly') ||
    norm.includes('senior') ||
    norm.includes('बुजुर्ग') ||
    norm.includes('बड़ा फॉन्ट') ||
    norm.includes('बड़ा टेक्स्ट') ||
    norm.includes('आसान मोड');

  if (isElderlyIntent) {
    return {
      reply: 'बुजुर्ग मोड (Elderly Mode) को टॉगल किया गया है। बड़े टेक्स्ट और स्पष्ट बटन सक्रिय हैं। 👓',
      spokenText: 'बुजुर्ग मोड टॉगल किया गया है।',
      detectedLanguage: lang,
      action: { type: 'TOGGLE_ELDERLY' },
      quickSuggestions: ['गेम खोलो 🎮', 'यादें दिखाओ 🌸', 'दवाई बताओ ⏰'],
    };
  }

  // 6. Direct Access: Government Healthcare Portal
  const isPortalIntent =
    norm.includes('portal') ||
    norm.includes('government') ||
    norm.includes('portal खोलो') ||
    norm.includes('सरकारी') ||
    norm.includes('হাসপাতাল') ||
    norm.includes('अस्पताल');

  if (isPortalIntent) {
    return {
      reply: 'नॉर्थ ईस्टर्न रीजन (NER) आधिकारिक सरकारी स्वास्थ्य पोर्टल पर ले जाया जा रहा है। 🏛️',
      spokenText: 'सरकारी स्वास्थ्य पोर्टल खोला जा रहा है।',
      detectedLanguage: lang,
      action: { type: 'OPEN_PORTAL' },
      quickSuggestions: ['वापस ऐप पर आएं 🔙', 'गेम खेलें 🎮'],
    };
  }

  // 7. General Conversational Dementia-Friendly Support
  if (
    norm.includes('hello') ||
    norm.includes('hi') ||
    norm.includes('namaste') ||
    norm.includes('नमस्ते') ||
    norm.includes('নমস্কাৰ') ||
    norm.includes('নমস্কার') ||
    norm.includes('प्रणाम')
  ) {
    if (lang === 'hi') {
      return {
        reply: 'नमस्ते! 🙏 मैं आपकी स्मृति-सेतु सहायक हूँ। आप मुझसे सीधे कह सकते हैं: "गेम खोलो", "दवाई बताओ" या "यादें दिखाओ"!',
        spokenText: 'नमस्ते! मैं आपकी स्मृति-सेतु सहायक हूँ। आप मुझसे खेल खेलने या दवाई देखने के लिए कह सकते हैं।',
        detectedLanguage: 'hi',
        action: { type: 'NONE' },
        quickSuggestions: ['गेम खोलो 🎮', 'दवाई का समय ⏰', 'यादें दिखाओ 🌸', 'हिंदी में बात करो 🗣️'],
      };
    } else if (lang === 'as') {
      return {
        reply: 'নমস্কাৰ! 🙏 মই আপোনাৰ স্মৃতি-সেতু সহায়ক। আপুনি "খেল আৰম্ভ কৰক", "দৰবৰ সোঁৱৰণি" বা "স্মৃতি উদ্যান" ক’ব পাৰে!',
        spokenText: 'নমস্কাৰ! মই আপোনাৰ স্মৃতি-সেতু সহায়ক।',
        detectedLanguage: 'as',
        action: { type: 'NONE' },
        quickSuggestions: ['খেল আৰম্ভ কৰক 🎮', 'দৰবৰ সোঁৱৰণি ⏰', 'স্মৃতি উদ্যান 🌸'],
      };
    } else if (lang === 'bn') {
      return {
        reply: 'নমস্কার! 🙏 আমি আপনার স্মৃতি-সেতু সহকারী। আপনি "খেলা শুরু করো", "ওষুধের তালিকা" ইত্যাদি বলতে পারেন!',
        spokenText: 'নমস্কার! আমি আপনার স্মৃতি-সেতু সহকারী।',
        detectedLanguage: 'bn',
        action: { type: 'NONE' },
        quickSuggestions: ['খেলা শুরু করো 🎮', 'ওষুধের রিমাইন্ডার ⏰', 'স্মৃতি বাগান 🌸'],
      };
    } else {
      return {
        reply: 'Hello! 🙏 I am your Smriti-Setu AI Companion. You can type or speak: "Open game", "Show reminders", or "Open memories" anytime!',
        spokenText: 'Hello! I am your companion. Try saying open game or show reminders!',
        detectedLanguage: 'en',
        action: { type: 'NONE' },
        quickSuggestions: ['Open Game 🎮', 'Daily Reminders ⏰', 'Memory Garden 🌸', 'Help 💡'],
      };
    }
  }

  // Feeling / Loneliness / Dementia calming response
  if (
    norm.includes('feeling') ||
    norm.includes('sad') ||
    norm.includes('lonely') ||
    norm.includes('उदास') ||
    norm.includes('अकेला') ||
    norm.includes('डर') ||
    norm.includes('घबराहट') ||
    norm.includes('অনুভৱ') ||
    norm.includes('কষ্ট')
  ) {
    if (lang === 'hi') {
      return {
        reply: 'आप बिल्कुल सुरक्षित और अपनों के साथ हैं। 💖 चलिए एक गहरी और शांत सांस लेते हैं, या फिर एक सुखद याद और सरल खेल खेलते हैं?',
        spokenText: 'आप बिल्कुल सुरक्षित हैं। चलिए एक गहरी सांस लेते हैं और एक प्यारा सा खेल खेलते हैं।',
        detectedLanguage: 'hi',
        action: { type: 'NONE' },
        quickSuggestions: ['गेम खेलें 🎮', 'परिवार की यादें 🌸', 'शांत संगीत सुनें 🎵'],
      };
    } else {
      return {
        reply: 'You are completely safe, valued, and cared for. 💖 Would you like to take a calm breath together or play a relaxing memory game?',
        spokenText: 'You are safe and cared for. Would you like to play a relaxing memory game?',
        detectedLanguage: 'en',
        action: { type: 'NONE' },
        quickSuggestions: ['Play Memory Game 🎮', 'View Family Memories 🌸'],
      };
    }
  }

  // Default fallback response in current language
  if (lang === 'hi') {
    return {
      reply: `मैंने आपकी बात समझ ली: "${input}". आप सीधे "गेम खोलो", "दवाई दिखाओ", या "यादें दिखाओ" बोल या लिख सकते हैं! 🌟`,
      spokenText: 'मैंने आपकी बात समझ ली। आप गेम खेलने या दवाई देखने के लिए कह सकते हैं।',
      detectedLanguage: 'hi',
      action: { type: 'NONE' },
      quickSuggestions: ['गेम खोलो 🎮', 'दवाई रिमाइंडर ⏰', 'स्मृति उद्यान 🌸', 'मदद 💡'],
    };
  } else if (lang === 'as') {
    return {
      reply: `মই আপোনাৰ অনুৰোধ বুজি পালোঁ। আপুনি "খেল আৰম্ভ কৰক", "দৰবৰ সোঁৱৰণি", বা "স্মৃতি উদ্যান" ক’ব পাৰে! 🌟`,
      spokenText: 'মই আপোনাৰ অনুৰোধ বুজি পালোঁ।',
      detectedLanguage: 'as',
      action: { type: 'NONE' },
      quickSuggestions: ['খেল আৰম্ভ কৰক 🎮', 'দৰবৰ সোঁৱৰণি ⏰', 'স্মৃতি উদ্যান 🌸'],
    };
  } else if (lang === 'bn') {
    return {
      reply: `আমি আপনার বার্তা বুঝতে পেরেছি। আপনি "খেলা শুরু করো", "রিমাইন্ডার", বা "স্মৃতি বাগান" বলতে পারেন! 🌟`,
      spokenText: 'আমি আপনার বার্তা বুঝতে পেরেছি।',
      detectedLanguage: 'bn',
      action: { type: 'NONE' },
      quickSuggestions: ['খেলা শুরু করো 🎮', 'ওষুধের রিমাইন্ডার ⏰', 'স্মৃতি বাগান 🌸'],
    };
  } else {
    return {
      reply: `I heard: "${input}". You can directly say or type commands like "Open game", "Show reminders", or "Open memories"! 🌟`,
      spokenText: 'I understand. You can say open game or show reminders.',
      detectedLanguage: 'en',
      action: { type: 'NONE' },
      quickSuggestions: ['Open Game 🎮', 'Daily Reminders ⏰', 'Memory Garden 🌸', 'Help 💡'],
    };
  }
}

/**
 * POST /api/assistant/chat
 * Body: { message: string, language?: string, patientId?: string, currentTab?: string }
 */
router.post('/chat', (req: Request, res: Response) => {
  const { message, language } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Missing message parameter' });
  }

  const result = detectIntentAndRespond(message, language);
  return res.json(result);
});

export default router;

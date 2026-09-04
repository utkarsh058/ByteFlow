/**
 * backend/src/modules/translation/translationRoutes.ts
 * ------------------------------------------------------
 * Backend for All-NER Language Support.
 * Connects with Bhashini API (Govt. of India multilingual platform)
 * with robust offline fallback dictionaries for Northeast Indian languages.
 */

import { Router, Request, Response } from 'express';

const router = Router();

const BHASHINI_API_KEY = process.env.BHASHINI_API_KEY || null;
const BHASHINI_ENDPOINT = 'https://bhashini.gov.in/api/v1/pipeline';

export const FALLBACK_TRANSLATIONS: Record<string, Record<string, string>> = {
  as: {
    memoryMatch: 'স্মৃতি মিলন',
    myDay: 'আজিৰ দিন',
    howFeel: 'মই কেনে অনুভৱ কৰোঁ',
    reminders: 'স্মাৰকসমূহ',
    timeline: 'জীৱন ৰেখা',
    welcome: 'স্মৃতি সেতু লৈ স্বাগতম',
  },
  ne: {
    memoryMatch: 'सम्झना मिलान',
    myDay: 'आजको दिन',
    howFeel: 'म कस्तो महसुस गर्छु',
    reminders: 'सम्झनाहरू',
    timeline: 'जीवन रेखा',
    welcome: 'स्मृति सेतुमा स्वागत छ',
  },
  brx: {
    memoryMatch: 'गोसोखांथाव गोरोबनाय',
    myDay: 'दिनैनि सान',
    howFeel: 'आं माबायदि मोनदों',
    reminders: 'गोसोखांथि',
    timeline: 'जिउ फारिलाइ',
    welcome: 'स्मृति सेतुआव बरायबाय',
  },
  mni: {
    memoryMatch: 'নিংথিংবা য়াম্বা',
    myDay: 'ঙসিগী নুমিৎ',
    howFeel: 'ঐনা করম্না ফাউরি',
    reminders: 'নিংশিংচে',
    timeline: 'পুন্সি খোঙচৎ',
    welcome: 'স্মৃতি সেতুদা তরাম্না ওকচরি',
  },
};

/**
 * POST /api/translate/text
 * Body: { text: string, targetLanguage: string }
 */
router.post('/text', async (req: Request, res: Response) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res.status(400).json({ error: 'Missing text or targetLanguage' });
  }

  // Check fallback dictionary first for quick local hit
  const langDict = FALLBACK_TRANSLATIONS[targetLanguage];
  if (langDict && langDict[text]) {
    return res.json({
      translated: langDict[text],
      source: 'local_ner_dictionary',
      language: targetLanguage,
    });
  }

  if (!BHASHINI_API_KEY) {
    return res.json({
      translated: text,
      note: 'Bhashini API key not configured — returned default text',
      language: targetLanguage,
    });
  }

  try {
    const response = await fetch(BHASHINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BHASHINI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        sourceLanguage: 'en',
        targetLanguage,
      }),
    });

    const result = (await response.json()) as any;
    return res.json({
      translated: result.translatedText || text,
      source: 'bhashini_ner_api',
      language: targetLanguage,
    });
  } catch (err) {
    console.error('Bhashini API call failed:', err);
    return res.status(500).json({ error: 'Translation service unavailable' });
  }
});

/**
 * GET /api/translate/ui-strings/:languageCode
 * Returns pre-translated UI labels for app static text
 */
router.get('/ui-strings/:languageCode', (req: Request, res: Response) => {
  const lang = req.params.languageCode as string;
  const strings = FALLBACK_TRANSLATIONS[lang] || FALLBACK_TRANSLATIONS['as'];
  res.json({
    language: lang,
    strings,
    availableLanguages: Object.keys(FALLBACK_TRANSLATIONS),
    connectedModule: 'translation',
  });
});

export default router;

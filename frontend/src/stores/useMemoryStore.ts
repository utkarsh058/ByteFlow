import { create } from 'zustand';
import { MemoryEntry, MemoryCategory } from '../types';
import { memoryApi } from '../services/api';

interface MemoryState {
  memories: MemoryEntry[];
  selectedCategory: MemoryCategory | 'All';
  fetchMemories: (patientId?: string) => Promise<void>;
  addMemory: (memory: Omit<MemoryEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
  setCategory: (cat: MemoryCategory | 'All') => void;
}

const initialMemories: MemoryEntry[] = [
  {
    id: 'mem-1',
    patientId: 'pat-ner-001',
    title: 'आँगन में परिवार का जमावड़ा और त्योहार की रौनक',
    titleHi: 'आँगन में परिवार का जमावड़ा और त्योहार की रौनक',
    titleEn: 'Family Courtyard Gathering & Festival Celebration',
    titleAs: 'চোতালত পৰিয়ালৰ মিলন আৰু বিহুৰ আনন্দ',
    year: 1984,
    person: 'अनन्या और पूरा परिवार (Ananya & Family)',
    location: 'गुवाहाटी, असम (Guwahati, Assam)',
    category: 'Family',
    story: 'रंगाली बिहू और दीवाली के पावन अवसर पर घर के आँगन में नीम के पेड़ के नीचे पूरा परिवार एक साथ इकट्ठा हुआ था। ढोल की मधुर थाप, ताज़ा बने नारियल के पीठा और गुड़ की खुशबू, और सबने मिलकर पारंपरिक गीत गाए थे। वह दिन आज भी दिल को सुकून और अपनेपन से भर देता है।',
    storyHi: 'रंगाली बिहू और दीवाली के पावन अवसर पर घर के आँगन में नीम के पेड़ के नीचे पूरा परिवार एक साथ इकट्ठा हुआ था। ढोल की मधुर थाप, ताज़ा बने नारियल के पीठा और गुड़ की खुशबू, और सबने मिलकर पारंपरिक गीत गाए थे। वह दिन आज भी दिल को सुकून और अपनेपन से भर देता है।',
    storyEn: 'During the festive Bihu celebration, the whole family gathered under the courtyard neem tree. We enjoyed the rhythmic beats of traditional dhols, shared fresh homemade sweet pithas, and sang joyful folk songs together.',
    storyAs: 'ৰঙালী বিহুৰ পবিত্ৰ সময়ত ঘৰৰ চোতালত নিম গছৰ তলত সকলো পৰিয়াল একলগ হৈছিল। ঢোলৰ মধুৰ চাপ, নাৰিকলৰ পিঠা আৰু লাড়ুৰ সোৱাদ আৰু সকলোৱে মিলি গোৱা বিহু গীতৰ সেই মিঠা দিনটো আজিও মনত সতেজ হৈ আছে।',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-01T10:00:00Z',
    tags: ['Family', 'Bihu', 'Tradition', 'Guwahati', 'परिवार', 'পৰিয়াল'],
    featured: true,
  },
  {
    id: 'mem-2',
    patientId: 'pat-ner-001',
    title: 'बचपन की सुनहरी धूप और नदी किनारे की शैतानियां',
    titleHi: 'बचपन की सुनहरी धूप और नदी किनारे की शैतानियां',
    titleEn: 'Golden Sunshine of Childhood & Riverbank Memories',
    titleAs: 'শৈশৱৰ সোণালী ৰোদ আৰু ব্ৰহ্মপুত্ৰৰ পাৰৰ ধেমালি',
    year: 1958,
    person: 'बाल सखा मोंटू और रंजन (Montu & Ranjan)',
    location: 'तेजपुर, ब्रह्मपुत्र तट (Tezpur)',
    category: 'Childhood',
    story: 'बचपन के वो दिन जब हम स्कूल की छुट्टी के बाद ब्रह्मपुत्र नदी के किनारे पतंग उड़ाते और मिट्टी के खिलौने बनाते थे। माँ की बनाई गरम-गरम गुड़ की रोटी और शाम को लालटेन की रोशनी में दादाजी से पहाड़ों की लोककथाएं सुनना हमारे बचपन की सबसे अनमोल धरोहर है।',
    storyHi: 'बचपन के वो दिन जब हम स्कूल की छुट्टी के बाद ब्रह्मपुत्र नदी के किनारे पतंग उड़ाते और मिट्टी के खिलौने बनाते थे। माँ की बनाई गरम-गरम गुड़ की रोटी और शाम को लालटेन की रोशनी में दादाजी से पहाड़ों की लोककथाएं सुनना हमारे बचपन की सबसे अनमोल धरोहर है।',
    storyEn: 'Carefree childhood days running towards the sandy shores of the river right after school. Flying colorful kites, enjoying hot jaggery flatbreads made by mother, and listening to bedtime folk tales by grandfather.',
    storyAs: 'শৈশৱৰ সেই দিনবোৰ যেতিয়া স্কুল ছুটীৰ পিছত ব্ৰহ্মপুত্ৰৰ বালিময় পাৰত চিলা উৰুৱাইছিলোঁ। মাৰ হাতৰ গৰম গুড়ৰ পিঠা আৰু সন্ধিয়া লেমৰ পোহৰত ককাদেউতাৰ মুখত শুনা সাধুকথা আমাৰ জীৱনৰ আটাইতকৈ মূল্যৱান স্মৃতি।',
    imageUrl: 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-03T11:00:00Z',
    tags: ['Childhood', 'Tezpur', 'Brahmaputra', 'बचपन', 'শৈশৱ'],
  },
  {
    id: 'mem-3',
    patientId: 'pat-ner-001',
    title: 'कॉटन कॉलेज और पुराने सहपाठियों की यादें',
    titleHi: 'कॉटन कॉलेज और पुराने सहपाठियों की यादें',
    titleEn: 'College Hall Graduation & Street Chai with Friends',
    titleAs: 'কটন কলেজ আৰু পুৰণি সতীৰ্থসকলৰ স্মৃতি',
    year: 1972,
    person: 'सहपाठी और प्रोफ़ेसर सैकिया (Professor Saikia & Friends)',
    location: 'पानबाज़ार, गुवाहाटी (Panbazar, Guwahati)',
    category: 'School',
    story: 'कॉटन कॉलेज के ऐतिहासिक हॉल में जब हमें स्नातक की उपाधि मिली थी, तो सबने खुशी से टोपियां हवा में उछाली थीं। कॉलेज के बाद पानबाज़ार की नुक्कड़ वाली दुकान पर दोस्तों के साथ गरमा-गरम कड़क चाय और समोसे पर लंबी चर्चाएं होती थीं। वह दोस्ती आज भी दिल में ज़िंदा है।',
    storyHi: 'कॉटन कॉलेज के ऐतिहासिक हॉल में जब हमें स्नातक की उपाधि मिली थी, तो सबने खुशी से टोपियां हवा में उछाली थीं। कॉलेज के बाद पानबाज़ार की नुक्कड़ वाली दुकान पर दोस्तों के साथ गरमा-गरम कड़क चाय और समोसे पर लंबी चर्चाएं होती थीं। वह दोस्ती आज भी दिल में ज़िंदा है।',
    storyEn: 'Receiving our graduation degree in the historic college hall. Afterward, walking along the bustling streets with dear friends, sipping hot ginger chai in clay cups, and sharing big dreams for the future.',
    storyAs: 'কটন কলেজৰ ঐতিহাসিক হলত যেতিয়া আমি স্নাতক ডিগ্ৰী লাভ কৰিছিলোঁ, আনন্দতে সকলোৱে টুপী ওপৰলৈ দলিয়াইছিলোঁ। পানবজাৰৰ দোকানত বন্ধুসকলৰ লগত গৰম চাহ আৰু চমুচা খাই ভৱিষ্যতৰ সপোন দেখা সেই দিনবোৰ চিৰস্মৰণীয়।',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-06T14:15:00Z',
    tags: ['School', 'College', 'Graduation', 'Friends', 'विद्यालय', 'বিদ্যালয়'],
  },
  {
    id: 'mem-4',
    patientId: 'pat-ner-001',
    title: 'डिब्रूगढ़ के चाय बागानों में सुबह की पहली ओस',
    titleHi: 'डिब्रूगढ़ के चाय बागानों में सुबह की पहली ओस',
    titleEn: 'Morning Dew in Dibrugarh Lush Tea Gardens',
    titleAs: 'ডিব্ৰুগড়ৰ চাহ বাগিচাত পুৱাৰ কুঁৱলী আৰু প্ৰথম কৰ্মজীৱন',
    year: 1976,
    person: 'सहयोगी सुरेश बरुआ (Colleague Suresh Barua)',
    location: 'डिब्रूगढ़, असम (Dibrugarh)',
    category: 'Career',
    story: 'जब मैंने डिब्रूगढ़ के विशाल हरे-भरे चाय बागानों में सहायक प्रबंधक के रूप में अपना कार्यजीवन शुरू किया था। सुबह की ताज़ी ओस से भीगी हरी पत्तियां, टोकरी लेकर मुस्कुराती महिलाएं और हवा में ताज़ी बनी चाय की भीनी खुशबू आज भी मन को तरोताज़ा कर देती है।',
    storyHi: 'जब मैंने डिब्रूगढ़ के विशाल हरे-भरे चाय बागानों में सहायक प्रबंधक के रूप में अपना कार्यजीवन शुरू किया था। सुबह की ताज़ी ओस से भीगी हरी पत्तियां, टोकरी लेकर मुस्कुराती महिलाएं और हवा में ताज़ी बनी चाय की भीनी खुशबू आज भी मन को तरोताज़ा कर देती है।',
    storyEn: 'Beginning my career journey across the emerald-green rolling hills of tea estates. Waking up to fresh morning mist, the gentle rustle of leaves, and the unforgettable fragrance of freshly brewed tea.',
    storyAs: 'ডিব্ৰুগড়ৰ বিশাল সেউজীয়া চাহ বাগিচাত যেতিয়া মই সহকাৰী প্ৰবন্ধক হিচাপে কাম আৰম্ভ কৰিছিলোঁ। পুৱাৰ নিয়ৰসিক্ত সেউজীয়া পাত, চাহ তোলা মহিলাসকলৰ হাঁহি আৰু বতাহত ভাঁহি অহা সতেজ চাহৰ সুবাসে আজিও মন আনন্দিত কৰে।',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-10T09:30:00Z',
    tags: ['Career', 'Tea Garden', 'Dibrugarh', 'कर्मक्षेत्र', 'কৰ্মজীৱন'],
  },
  {
    id: 'mem-5',
    patientId: 'pat-ner-001',
    title: 'सात फेरों का पावन बंधन और शहनाई की गूंज',
    titleHi: 'सात फेरों का पावन बंधन और शहनाई की गूंज',
    titleEn: 'Sacred Wedding Ceremony & Lifelong Vows',
    titleAs: 'সাত পাকৰ পবিত্ৰ বন্ধন আৰু সুমধুৰ সানাইৰ সুৰ',
    year: 1978,
    person: 'धर्मपत्नी अनन्या (Wife Ananya)',
    location: 'जोरहट, असम (Jorhat, Assam)',
    category: 'Marriage',
    story: 'पारंपरिक रीति-रिवाजों, शंख की पवित्र ध्वनि और मांगलिक मंत्रोच्चार के बीच अनन्या के साथ जीवन का नया सफ़र शुरू हुआ था। रेशमी पाट-मुगा की पोशाक और सिंदूर के रंगों से सजा वह विवाह मंडप हमारे पूरे परिवार के लिए सबसे मंगलकारी और सुखद दिन था।',
    storyHi: 'पारंपरिक रीति-रिवाजों, शंख की पवित्र ध्वनि और मांगलिक मंत्रोच्चार के बीच अनन्या के साथ जीवन का नया सफ़र शुरू हुआ था। रेशमी पाट-मुगा की पोशाक और सिंदूर के रंगों से सजा वह विवाह मंडप हमारे पूरे परिवार के लिए सबसे मंगलकारी और सुखद दिन था।',
    storyEn: 'Commencing a blessed life journey with Ananya amidst traditional rituals, sacred conch sounds, and auspicious chants. The silk garments, marigold garlands, and family blessings made it the most memorable day.',
    storyAs: 'পৰম্পৰাগত ৰীতি-নীতি, শঙ্খৰ পবিত্ৰ ধ্বনি আৰু মাংগলিক মন্ত্ৰোচ্চাৰৰ মাজত অনন্যাৰ লগত জীৱনৰ নতুন যাত্ৰা আৰম্ভ হৈছিল। পাট-মুগাৰ কাপোৰ আৰু সেন্দূৰৰ ৰঙেৰে সজোৱা বিবাহ মণ্ডপ আমাৰ পৰিয়ালৰ আটাইতকৈ আনন্দৰ দিন আছিল।',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-12T15:00:00Z',
    tags: ['Marriage', 'Wedding', 'Tradition', 'विवाह', 'বিবাহ'],
  },
  {
    id: 'mem-6',
    patientId: 'pat-ner-001',
    title: 'पोती प्रियांशी का जन्मदिन और आँगन में किलकारियाँ',
    titleHi: 'पोती प्रियांशी का जन्मदिन और आँगन में किलकारियाँ',
    titleEn: "Granddaughter Priyanshi's 5th Birthday Joy",
    titleAs: 'নাতিনী প্ৰিয়াংশীৰ ৫ম জন্মদিন আৰু চোতালৰ হাঁহি',
    year: 2018,
    person: 'पोती प्रियांशी और बेटी प्रिया (Priyanshi & Priya)',
    location: 'दिसपुर, गुवाहाटी (Dispur, Guwahati)',
    category: 'Grandchildren',
    story: 'हमारी नन्ही पोती प्रियांशी का पांचवां जन्मदिन था। उसने पीले रंग की सुंदर रेशमी फ्रॉक पहनी थी और पूरे घर में दौड़-दौड़ कर सबको गुब्बारे और मिठाइयां बांट रही थी। उसकी खिलखिलाती मासूम हंसी ने पूरे घर को अपार खुशियों और रौनक से भर दिया था।',
    storyHi: 'हमारी नन्ही पोती प्रियांशी का पांचवां जन्मदिन था। उसने पीले रंग की सुंदर रेशमी फ्रॉक पहनी थी और पूरे घर में दौड़-दौड़ कर सबको गुब्बारे और मिठाइयां बांट रही थी। उसकी खिलखिलाती मासूम हंसी ने पूरे घर को अपार खुशियों और रौनक से भर दिया था।',
    storyEn: 'Our little granddaughter Priyanshi celebrating her 5th birthday in her golden yellow silk dress. Her joyful laughter, innocent rhymes, and gentle hugs filled every corner of our home with happiness.',
    storyAs: 'আমাৰ মৰমৰ নাতিনী প্ৰিয়াংশীৰ পঞ্চম জন্মদিন আছিল। তাই ধুনীয়া হালধীয়া পাটৰ ফ্ৰক পিন্ধি গোটেই ঘৰটোত দৌৰি সকলোকে বেলুন আৰু মিঠাই বিলাইছিল। তাইৰ নিষ্পাপ হাঁহিয়ে গোটেই ঘৰটো আনন্দৰে ভৰাই তুলিছিল।',
    imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-15T10:20:00Z',
    tags: ['Grandchildren', 'Birthday', 'Priyanshi', 'पोते-पोतियाँ', 'নাতিনী'],
  },
  {
    id: 'mem-7',
    patientId: 'pat-ner-001',
    title: 'काजीरंगा के घने जंगलों में सपरिवार हाथी सफारी',
    titleHi: 'काजीरंगा के घने जंगलों में सपरिवार हाथी सफारी',
    titleEn: 'Kaziranga Wildlife Safari with Family',
    titleAs: 'কাজিৰঙাৰ অৰণ্যত পৰিয়ালৰ সৈতে হাতী চাফাৰী',
    year: 2012,
    person: 'सपरिवार बच्चे और नाती-पोते (Entire Family)',
    location: 'काजीरंगा राष्ट्रीय उद्यान (Kaziranga National Park)',
    category: 'Important Events',
    story: 'सर्दियों की सुबह जब हल्की धूप और कोहरे की चादर के बीच हम सबने काजीरंगा में हाथी सफारी की थी। सामने घास के मैदान में शांत खड़े विशाल एक सींग वाले गैंडे को देखकर बच्चे खुशी से उछल पड़े थे। प्रकृति का वह अद्भुत दृश्य आज भी आँखों के सामने जीवंत है।',
    storyHi: 'सर्दियों की सुबह जब हल्की धूप और कोहरे की चादर के बीच हम सबने काजीरंगा में हाथी सफारी की थी। सामने घास के मैदान में शांत खड़े विशाल एक सींग वाले गैंडे को देखकर बच्चे खुशी से उछल पड़े थे। प्रकृति का वह अद्भुत दृश्य आज भी आँखों के सामने जीवंत है।',
    storyEn: 'An early winter morning safari through the mist-covered grasslands of Kaziranga. Spotting the majestic one-horned rhinoceros in its tranquil natural habitat alongside our excited children and grandchildren.',
    storyAs: 'শীতকালৰ এটি সুন্দৰ পুৱাত কুঁৱলীৰ মাজত আমি সকলোৱে মিলি কাজিৰঙাত হাতী চাফাৰী কৰিছিলোঁ। ঘাঁহনিত শান্তভাৱে চৰি থকা এশিঙীয়া গঁড় দেখি ল’ৰা-ছোৱালীবোৰ আনন্দত আত্মহাৰা হৈ পৰিছিল।',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-20T16:45:00Z',
    tags: ['Important Events', 'Kaziranga', 'Safari', 'महत्वपूर्ण घटनाएँ', 'গুৰুত্বপূৰ্ণ ঘটনা'],
  },
];

export const useMemoryStore = create<MemoryState>((set, get) => ({
  memories: initialMemories,
  selectedCategory: 'All',

  fetchMemories: async (patientId = 'pat-ner-001') => {
    try {
      const data = await memoryApi.getMemories(patientId);
      if (Array.isArray(data) && data.length > 0) {
        set({ memories: data });
      }
    } catch (err) {
      console.warn('Backend unavailable, using local memory state', err);
    }
  },

  addMemory: async (newMem) => {
    const tempId = `mem-${Date.now()}`;
    const localEntry: MemoryEntry = {
      ...newMem,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    set((state) => ({ memories: [localEntry, ...state.memories] }));

    // Sync with backend API
    try {
      const created = await memoryApi.createMemory(newMem);
      if (created && created.id) {
        set((state) => ({
          memories: state.memories.map((m) => (m.id === tempId ? created : m)),
        }));
      }
    } catch (err) {
      console.warn('Memory saved locally (offline mode)', err);
    }
  },

  deleteMemory: async (id) => {
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    }));

    try {
      await memoryApi.deleteMemory(id);
    } catch (err) {
      console.warn('Memory deleted locally (offline mode)', err);
    }
  },

  setCategory: (cat) => set({ selectedCategory: cat }),
}));

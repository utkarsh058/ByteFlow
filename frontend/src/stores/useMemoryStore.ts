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
    year: 1984,
    person: 'अनन्या और पूरा परिवार (Ananya & Family)',
    location: 'गुवाहाटी, असम (Guwahati, Assam)',
    category: 'Family',
    story: 'रंगाली बिहू और दीवाली के पावन अवसर पर घर के आँगन में नीम के पेड़ के नीचे पूरा परिवार एक साथ इकट्ठा हुआ था। ढोल की मधुर थाप, ताज़ा बने नारियल के पीठा और गुड़ की खुशबू, और सबने मिलकर पारंपरिक गीत गाए थे। वह दिन आज भी दिल को सुकून और अपनेपन से भर देता है।',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-01T10:00:00Z',
    tags: ['Family', 'Bihu', 'Tradition', 'Guwahati', 'परिवार'],
    featured: true,
  },
  {
    id: 'mem-2',
    patientId: 'pat-ner-001',
    title: 'बचपन की सुनहरी धूप और नदी किनारे की शैतानियां',
    year: 1958,
    person: 'बाल सखा मोंटू और रंजन',
    location: 'तेजपुर, ब्रह्मपुत्र तट (Tezpur)',
    category: 'Childhood',
    story: 'बचपन के वो दिन जब हम स्कूल की छुट्टी के बाद ब्रह्मपुत्र नदी के किनारे पतंग उड़ाते और मिट्टी के खिलौने बनाते थे। माँ की बनाई गरम-गरम गुड़ की रोटी और शाम को लालटेन की रोशनी में दादाजी से पहाड़ों की लोककथाएं सुनना हमारे बचपन की सबसे अनमोल धरोहर है।',
    imageUrl: 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-03T11:00:00Z',
    tags: ['Childhood', 'Tezpur', 'Brahmaputra', 'बचपन'],
  },
  {
    id: 'mem-3',
    patientId: 'pat-ner-001',
    title: 'कॉटन कॉलेज और पुराने सहपाठियों की यादें',
    year: 1972,
    person: 'सहपाठी और प्रोफ़ेसर सैकिया',
    location: 'पानबाज़ार, गुवाहाटी (Panbazar, Guwahati)',
    category: 'School',
    story: 'कॉटन कॉलेज के ऐतिहासिक हॉल में जब हमें स्नातक की उपाधि मिली थी, तो सबने खुशी से टोपियां हवा में उछाली थीं। कॉलेज के बाद पानबाज़ार की नुक्कड़ वाली दुकान पर दोस्तों के साथ गरमा-गरम कड़क चाय और समोसे पर लंबी चर्चाएं होती थीं। वह दोस्ती आज भी दिल में ज़िंदा है।',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-06T14:15:00Z',
    tags: ['School', 'College', 'Graduation', 'Friends', 'विद्यालय'],
  },
  {
    id: 'mem-4',
    patientId: 'pat-ner-001',
    title: 'डिब्रूगढ़ के चाय बागानों में सुबह की पहली ओस',
    year: 1976,
    person: 'सहयोगी सुरेश बरुआ',
    location: 'डिब्रूगढ़, असम (Dibrugarh)',
    category: 'Career',
    story: 'जब मैंने डिब्रूगढ़ के विशाल हरे-भरे चाय बागानों में सहायक प्रबंधक के रूप में अपना कार्यजीवन शुरू किया था। सुबह की ताज़ी ओस से भीगी हरी पत्तियां, टोकरी लेकर मुस्कुराती महिलाएं और हवा में ताज़ी बनी चाय की भीनी खुशबू आज भी मन को तरोताज़ा कर देती है।',
    imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-10T09:30:00Z',
    tags: ['Career', 'Tea Garden', 'Dibrugarh', 'कर्मक्षेत्र'],
  },
  {
    id: 'mem-5',
    patientId: 'pat-ner-001',
    title: 'सात फेरों का पावन बंधन और शहनाई की गूंज',
    year: 1978,
    person: 'धर्मपत्नी अनन्या (Wife Ananya)',
    location: 'जोरहट, असम (Jorhat, Assam)',
    category: 'Marriage',
    story: 'पारंपरिक रीति-रिवाजों, शंख की पवित्र ध्वनि और मांगलिक मंत्रोच्चार के बीच अनन्या के साथ जीवन का नया सफ़र शुरू हुआ था। रेशमी पाट-मुगा की पोशाक और सिंदूर के रंगों से सजा वह विवाह मंडप हमारे पूरे परिवार के लिए सबसे मंगलकारी और सुखद दिन था।',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-12T15:00:00Z',
    tags: ['Marriage', 'Wedding', 'Tradition', 'विवाह'],
  },
  {
    id: 'mem-6',
    patientId: 'pat-ner-001',
    title: 'पोती प्रियांशी का जन्मदिन और आँगन में किलकारियाँ',
    year: 2018,
    person: 'पोती प्रियांशी और बेटी प्रिया (Priyanshi & Priya)',
    location: 'दिसपुर, गुवाहाटी (Dispur, Guwahati)',
    category: 'Grandchildren',
    story: 'हमारी नन्ही पोती प्रियांशी का पांचवां जन्मदिन था। उसने पीले रंग की सुंदर रेशमी फ्रॉक पहनी थी और पूरे घर में दौड़-दौड़ कर सबको गुब्बारे और मिठाइयां बांट रही थी। उसकी खिलखिलाती मासूम हंसी ने पूरे घर को अपार खुशियों और रौनक से भर दिया था।',
    imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-15T10:20:00Z',
    tags: ['Grandchildren', 'Birthday', 'Priyanshi', 'पोते-पोतियाँ'],
  },
  {
    id: 'mem-7',
    patientId: 'pat-ner-001',
    title: 'काजीरंगा के घने जंगलों में सपरिवार हाथी सफारी',
    year: 2012,
    person: 'सपरिवार बच्चे और नाती-पोते',
    location: 'काजीरंगा राष्ट्रीय उद्यान (Kaziranga National Park)',
    category: 'Important Events',
    story: 'सर्दियों की सुबह जब हल्की धूप और कोहरे की चादर के बीच हम सबने काजीरंगा में हाथी सफारी की थी। सामने घास के मैदान में शांत खड़े विशाल एक सींग वाले गैंडे को देखकर बच्चे खुशी से उछल पड़े थे। प्रकृति का वह अद्भुत दृश्य आज भी आँखों के सामने जीवंत है।',
    imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    createdAt: '2026-08-20T16:45:00Z',
    tags: ['Important Events', 'Kaziranga', 'Safari', 'महत्वपूर्ण घटनाएँ'],
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

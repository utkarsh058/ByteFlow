import React, { useState } from 'react';
import { 
  ImageIcon, 
  Plus, 
  Calendar, 
  MapPin, 
  User, 
  Sparkles,
  Heart,
  Volume2,
  Camera,
  Upload,
  Languages,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMemoryStore } from '../../stores/useMemoryStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../common/Button';
import { VoiceButton } from '../common/VoiceButton';
import { Modal } from '../common/Modal';
import { MemoryEntry, MemoryCategory } from '../../types';

export const MemoryGardenView: React.FC = () => {
  const { t } = useTranslation();
  const { memories, selectedCategory, setCategory, addMemory } = useMemoryStore();
  const { selectedPatient } = useAuthStore();
  
  // 2-Language State for Memory Stories (English / Hindi)
  const [storyLang, setStoryLang] = useState<'hi' | 'en'>('hi');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSelectedMemory, setActiveSelectedMemory] = useState<MemoryEntry | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('1980');
  const [category, setCategoryForm] = useState<MemoryCategory>('Family');
  const [person, setPerson] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const categories: Array<MemoryCategory | 'All'> = [
    'All',
    'Family',
    'Childhood',
    'School',
    'Career',
    'Marriage',
    'Grandchildren',
    'Important Events',
  ];

  const categoryLabels: Record<string, { en: string; hi: string }> = {
    All: { en: 'All Memories', hi: 'सभी यादें' },
    Family: { en: 'Family', hi: 'परिवार' },
    Childhood: { en: 'Childhood', hi: 'बचपन' },
    School: { en: 'School', hi: 'विद्यालय' },
    Career: { en: 'Career', hi: 'कर्मक्षेत्र' },
    Marriage: { en: 'Marriage', hi: 'विवाह' },
    Grandchildren: { en: 'Grandchildren', hi: 'पोते-पोतियाँ' },
    'Important Events': { en: 'Important Events', hi: 'महत्वपूर्ण घटनाएँ' },
  };

  const getMemoryTitle = (mem: MemoryEntry) => {
    if (storyLang === 'hi') return mem.titleHi || mem.title;
    return mem.titleEn || mem.title;
  };

  const getMemoryStory = (mem: MemoryEntry) => {
    if (storyLang === 'hi') return mem.storyHi || mem.story;
    return mem.storyEn || mem.story;
  };

  const filteredMemories = selectedCategory === 'All'
    ? memories
    : memories.filter((m) => m.category === selectedCategory);

  const featuredMemory = filteredMemories.find((m) => m.featured) || filteredMemories[0];
  const secondaryMemories = filteredMemories.filter((m) => m.id !== featuredMemory?.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !story) return;

    addMemory({
      patientId: selectedPatient.id,
      title,
      titleHi: title,
      titleEn: title,
      year: parseInt(year) || 1980,
      category,
      story,
      storyHi: story,
      storyEn: story,
      person,
      location,
      imageUrl:
        uploadPreview ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=80',
    });

    setTitle('');
    setStory('');
    setPerson('');
    setLocation('');
    setUploadPreview(null);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-10 md:space-y-12 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-ivory-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-800 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-gold-500 stroke-forest-800" /> {storyLang === 'hi' ? 'स्मृति उद्यान (Personalized Family Timeline)' : 'Memory Garden & Family Timeline'}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-charcoal-900 mt-1">
            {storyLang === 'hi' ? 'जीवन की अनमोल यादें और कहानियाँ' : 'Cherished Memories & Lifelong Stories'}
          </h2>
          <p className="text-charcoal-600 text-base mt-2 max-w-2xl font-medium">
            {storyLang === 'hi'
              ? `${selectedPatient.name} के परिवार और जीवन के 7 प्रमुख अध्यायों (परिवार, बचपन, विद्यालय, करियर, विवाह, पोते-पोतियाँ, महत्वपूर्ण घटनाएँ) की वास्तविक स्मृतियाँ।`
              : `A realistic visual memory album across 7 life chapters (Family, Childhood, School, Career, Marriage, Grandchildren, Important Events) for ${selectedPatient.name}.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 2-Language Switcher (English & Hindi) */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300 shadow-xs">
            <span className="text-xs font-black text-slate-700 px-2 flex items-center gap-1">
              <Languages className="w-4 h-4 text-[#004085]" /> {storyLang === 'hi' ? 'कहानी भाषा:' : 'Language:'}
            </span>
            <button
              type="button"
              onClick={() => setStoryLang('hi')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                storyLang === 'hi'
                  ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>🇮🇳 हिंदी (Hindi)</span>
            </button>
            <button
              type="button"
              onClick={() => setStoryLang('en')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                storyLang === 'en'
                  ? 'bg-[#004085] text-amber-300 shadow-md ring-2 ring-blue-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <span>🇬🇧 English</span>
            </button>
          </div>

          <Button
            variant="primary"
            icon={<Camera className="w-5 h-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            {storyLang === 'hi' ? 'नई याद जोड़ें (Add Memory)' : 'Add Photo Memory'}
          </Button>
        </div>
      </div>

      {/* Category Filter Pills (All 7 Categories + All Memories) */}
      <div className="flex flex-wrap items-center gap-2 pb-1 overflow-x-auto">
        {categories.map((cat) => {
          const label = categoryLabels[cat] || { en: cat, hi: cat };
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#004085] text-amber-300 shadow-md ring-2 ring-blue-300'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              <span>{storyLang === 'hi' ? label.hi : label.en}</span>
              <span className="text-[10px] opacity-70">
                ({storyLang === 'hi' ? label.en : label.hi})
              </span>
            </button>
          );
        })}
      </div>

      {/* FEATURED HERO MEMORY (Immersive Large Realistic Photograph) */}
      {featuredMemory && (
        <section
          onClick={() => setActiveSelectedMemory(featuredMemory)}
          className="relative rounded-4xl overflow-hidden shadow-photo cursor-pointer group bg-forest-950 border-4 border-white min-h-[400px] md:min-h-[480px] flex items-end"
        >
          <img
            src={featuredMemory.imageUrl}
            alt={getMemoryTitle(featuredMemory)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/50 to-transparent" />

          <div className="relative z-10 p-6 md:p-12 text-white space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-gold-500 text-charcoal-950 font-black text-xs">
                ⭐ {storyLang === 'hi' ? 'प्रमुख स्मृति (Featured)' : 'Featured Memory'} · {featuredMemory.year}
              </span>
              <span className="text-xs font-bold text-ivory-200 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                {featuredMemory.category}
              </span>
              {featuredMemory.location && (
                <span className="text-xs font-medium text-amber-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {featuredMemory.location}
                </span>
              )}
            </div>

            <h3 className="text-2xl md:text-4xl font-serif font-bold text-ivory-50 leading-tight">
              {getMemoryTitle(featuredMemory)}
            </h3>

            <p className="text-ivory-200 text-sm md:text-base line-clamp-3 leading-relaxed">
              {getMemoryStory(featuredMemory)}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <VoiceButton
                textToSpeak={`${getMemoryTitle(featuredMemory)}। ${getMemoryStory(featuredMemory)}`}
                label={storyLang === 'hi' ? 'कहानी सुनें (Listen in Hindi)' : 'Listen to Story (English)'}
                size="md"
              />
              <span className="text-xs font-bold text-amber-300 group-hover:underline">
                {storyLang === 'hi' ? 'पूरी कहानी और तस्वीर देखें →' : 'View Full Memory & Photo →'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* SECONDARY MEMORY GALLERY (Realistic Photographic Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secondaryMemories.map((mem) => (
          <div
            key={mem.id}
            onClick={() => setActiveSelectedMemory(mem)}
            className="rounded-3xl bg-white border-2 border-slate-200 shadow-soft hover:shadow-xl hover:border-amber-400 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group"
          >
            {/* Memory Photograph */}
            {mem.imageUrl && (
              <div className="relative h-60 overflow-hidden bg-slate-100">
                <img
                  src={mem.imageUrl}
                  alt={getMemoryTitle(mem)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#004085]/90 backdrop-blur-md text-amber-300 text-xs font-black px-3 py-1 rounded-full shadow-sm">
                  {mem.category}
                </div>
                <div className="absolute top-3 right-3 bg-amber-400 text-slate-900 text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
                  {mem.year}
                </div>
              </div>
            )}

            {/* Memory Details */}
            <div className="p-6 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-xl text-slate-900 group-hover:text-[#004085] transition-colors leading-snug">
                  {getMemoryTitle(mem)}
                </h4>
                <p className="text-slate-700 text-sm line-clamp-3 leading-relaxed font-medium">
                  {getMemoryStory(mem)}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {(mem.person || mem.location) && (
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    {mem.person && (
                      <span className="flex items-center gap-1 text-[#004085]">
                        <User className="w-3.5 h-3.5" /> {mem.person}
                      </span>
                    )}
                    {mem.location && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5" /> {mem.location}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between">
                  <VoiceButton
                    textToSpeak={`${getMemoryTitle(mem)}। ${getMemoryStory(mem)}`}
                    label={storyLang === 'hi' ? 'कहानी सुनें' : 'Listen Story'}
                    size="sm"
                  />
                  <span className="text-xs font-extrabold text-blue-800 group-hover:underline">
                    {storyLang === 'hi' ? 'विवरण देखें →' : 'View Details →'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULL MEMORY READER MODAL */}
      {activeSelectedMemory && (
        <Modal
          isOpen={!!activeSelectedMemory}
          onClose={() => setActiveSelectedMemory(null)}
          title={getMemoryTitle(activeSelectedMemory)}
        >
          <div className="space-y-6">
            {activeSelectedMemory.imageUrl && (
              <img
                src={activeSelectedMemory.imageUrl}
                alt={getMemoryTitle(activeSelectedMemory)}
                className="w-full h-80 object-cover rounded-3xl shadow-photo border-2 border-ivory-200"
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ivory-200 pb-3">
              <span className="px-3.5 py-1 rounded-full bg-forest-800 text-ivory-50 text-xs font-bold">
                {activeSelectedMemory.category} · {activeSelectedMemory.year}
              </span>

              {activeSelectedMemory.person && (
                <span className="text-sm font-bold text-forest-800 flex items-center gap-1">
                  <User className="w-4 h-4" /> {activeSelectedMemory.person} ({activeSelectedMemory.location})
                </span>
              )}
            </div>

            <p className="text-charcoal-800 text-lg leading-relaxed font-sans">
              {getMemoryStory(activeSelectedMemory)}
            </p>

            <div className="pt-2 flex justify-between items-center">
              <VoiceButton
                textToSpeak={`${getMemoryTitle(activeSelectedMemory)}। ${getMemoryStory(activeSelectedMemory)}`}
                label={storyLang === 'hi' ? 'स्मृति कहानी सुनें' : 'Listen to Memory Story'}
                size="md"
              />
              <Button variant="outline" size="sm" onClick={() => setActiveSelectedMemory(null)}>
                {storyLang === 'hi' ? 'बंद करें' : 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD MEMORY MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Memory Entry">
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Photo Upload Zone */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1 flex items-center justify-between">
              <span>Memory Photograph</span>
              <span className="text-xs text-purple-600 font-bold">Upload Custom Image</span>
            </label>

            {uploadPreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500 max-h-48 bg-black/5 flex items-center justify-center group">
                <img src={uploadPreview} alt="Upload preview" className="w-full h-44 object-cover" />
                <button
                  type="button"
                  onClick={() => setUploadPreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-all"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 rounded-2xl p-4 cursor-pointer flex flex-col items-center justify-center transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm mb-1.5">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Click or Drag & Drop Family Photo
                </span>
                <span className="text-[11px] text-slate-500">
                  Supports JPEG, PNG, WebP
                </span>
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1">Memory Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rongali Bihu Courtyard Gathering"
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategoryForm(e.target.value as MemoryCategory)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-white"
              >
                {['Childhood', 'School', 'Career', 'Marriage', 'Family', 'Grandchildren', 'Important Events'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Familiar Person</label>
              <input
                type="text"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                placeholder="e.g. Ananya Borthakur"
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Guwahati, Assam"
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1">Story & Reflection</label>
            <textarea
              required
              rows={3}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Describe this cherished family memory..."
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:ring-4 focus:ring-forest-500/20 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Memory Entry</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

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
      year: parseInt(year) || 1980,
      category,
      story,
      person,
      location,
      imageUrl:
        uploadPreview ||
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80',
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
            <Heart className="w-3.5 h-3.5 fill-gold-500 stroke-forest-800" /> Personalized Family Timeline
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-charcoal-900 mt-1">
            Memories worth revisiting.
          </h2>
          <p className="text-charcoal-600 text-base mt-2 max-w-2xl">
            A visual memory album curated by {selectedPatient.name}'s family to stimulate peaceful recognition and warm reflections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            icon={<Camera className="w-5 h-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Upload Photo Memory
          </Button>
          <Button
            variant="outline"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            {t('memoryGarden.addMemory')}
          </Button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-1 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-forest-800 text-ivory-50 shadow-soft'
                : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200 border border-ivory-200'
            }`}
          >
            {cat === 'All' ? 'All Memories' : cat}
          </button>
        ))}
      </div>

      {/* FEATURED HERO MEMORY (Immersive Large Photograph) */}
      {featuredMemory && (
        <section
          onClick={() => setActiveSelectedMemory(featuredMemory)}
          className="relative rounded-4xl overflow-hidden shadow-photo cursor-pointer group bg-forest-950 border-4 border-white min-h-[380px] md:min-h-[460px] flex items-end"
        >
          <img
            src={featuredMemory.imageUrl}
            alt={featuredMemory.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />

          <div className="relative z-10 p-6 md:p-12 text-white space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-gold-500 text-charcoal-950 font-bold text-xs">
                Featured Memory · {featuredMemory.year}
              </span>
              <span className="text-xs font-semibold text-ivory-200">
                {featuredMemory.category}
              </span>
            </div>

            <h3 className="text-2xl md:text-4xl font-serif font-bold text-ivory-50 leading-tight">
              {featuredMemory.title}
            </h3>

            <p className="text-ivory-200 text-sm md:text-base line-clamp-2">
              {featuredMemory.story}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <VoiceButton
                textToSpeak={`${featuredMemory.title}. ${featuredMemory.story}`}
                label="Listen to Story"
                size="md"
              />
              <span className="text-xs font-bold text-gold-300 group-hover:underline">
                View Full Memory Photo →
              </span>
            </div>
          </div>
        </section>
      )}

      {/* SECONDARY MEMORY GALLERY (Photographic Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secondaryMemories.map((mem) => (
          <div
            key={mem.id}
            onClick={() => setActiveSelectedMemory(mem)}
            className="rounded-3xl bg-white border border-ivory-200/80 shadow-soft hover:shadow-photo transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between group"
          >
            {/* Memory Photograph */}
            {mem.imageUrl && (
              <div className="relative h-56 overflow-hidden bg-ivory-200">
                <img
                  src={mem.imageUrl}
                  alt={mem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-charcoal-900/80 backdrop-blur-md text-ivory-50 text-xs font-bold px-3 py-1 rounded-full">
                  {mem.category}
                </div>
                <div className="absolute top-3 right-3 bg-gold-500 text-charcoal-950 text-xs font-bold px-2.5 py-1 rounded-full">
                  {mem.year}
                </div>
              </div>
            )}

            {/* Memory Details */}
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-xl text-charcoal-900 group-hover:text-forest-800 transition-colors">
                  {mem.title}
                </h4>
                <p className="text-charcoal-600 text-sm line-clamp-3 leading-relaxed">
                  {mem.story}
                </p>
              </div>

              {(mem.person || mem.location) && (
                <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs font-semibold text-charcoal-600">
                  {mem.person && (
                    <span className="flex items-center gap-1 text-forest-800">
                      <User className="w-3.5 h-3.5" /> {mem.person}
                    </span>
                  )}
                  {mem.location && (
                    <span className="flex items-center gap-1 text-charcoal-500">
                      <MapPin className="w-3.5 h-3.5" /> {mem.location}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FULL MEMORY READER MODAL */}
      {activeSelectedMemory && (
        <Modal
          isOpen={!!activeSelectedMemory}
          onClose={() => setActiveSelectedMemory(null)}
          title={activeSelectedMemory.title}
        >
          <div className="space-y-6">
            {activeSelectedMemory.imageUrl && (
              <img
                src={activeSelectedMemory.imageUrl}
                alt={activeSelectedMemory.title}
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
              {activeSelectedMemory.story}
            </p>

            <div className="pt-2 flex justify-between items-center">
              <VoiceButton
                textToSpeak={`${activeSelectedMemory.title}. ${activeSelectedMemory.story}`}
                label="Listen to Memory Story"
                size="md"
              />
              <Button variant="outline" size="sm" onClick={() => setActiveSelectedMemory(null)}>
                Close
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

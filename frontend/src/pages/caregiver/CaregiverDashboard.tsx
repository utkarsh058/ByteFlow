import React, { useState } from 'react';
import { 
  Heart, 
  Calendar, 
  Clock, 
  Plus, 
  Image as ImageIcon, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  AlertCircle,
  Pill,
  Droplet,
  User,
  ArrowRight,
  Camera,
  Upload,
  X,
  Layers,
  Puzzle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import { useMemoryStore } from '../../stores/useMemoryStore';
import { useReminderStore } from '../../stores/useReminderStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useActivityStore } from '../../stores/useActivityStore';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { MemoryCategory, ReminderType } from '../../types';

export const CaregiverDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedPatient } = useAuthStore();
  const { memories, addMemory } = useMemoryStore();
  const { reminders, addReminder, updateReminderState } = useReminderStore();
  const { device } = useDeviceStore();
  const { sessionHistory, currentDifficulty } = useActivityStore();

  // Modal States
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);

  // Form States - Memory
  const [memTitle, setMemTitle] = useState('');
  const [memYear, setMemYear] = useState('1985');
  const [memCategory, setMemCategory] = useState<MemoryCategory>('Family');
  const [memStory, setMemStory] = useState('');
  const [memPerson, setMemPerson] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

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

  // Form States - Reminder
  const [remTitle, setRemTitle] = useState('');
  const [remType, setRemType] = useState<ReminderType>('medicine');
  const [remTime, setRemTime] = useState('09:00 AM');
  const [remNotes, setRemNotes] = useState('');

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memTitle || !memStory) return;

    addMemory({
      patientId: selectedPatient.id,
      title: memTitle,
      year: parseInt(memYear) || 1985,
      category: memCategory,
      story: memStory,
      person: memPerson,
      imageUrl:
        uploadPreview ||
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80',
    });

    setMemTitle('');
    setMemStory('');
    setMemPerson('');
    setUploadPreview(null);
    setIsAddMemoryOpen(false);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle) return;

    addReminder({
      patientId: selectedPatient.id,
      title: remTitle,
      type: remType,
      scheduledTime: remTime,
      state: 'upcoming',
      notes: remNotes,
      voicePromptText: `Reminder for ${selectedPatient.name.split(' ')[0]}: ${remTitle}`,
    });

    setRemTitle('');
    setRemNotes('');
    setIsAddReminderOpen(false);
  };

  return (
    <div className="space-y-10 md:space-y-12 animate-in fade-in duration-500">
      
      {/* 1. MOST IMPORTANT INFORMATION: Patient Summary Hero Section */}
      <section className="bg-ivory-100/90 rounded-4xl p-6 md:p-10 border border-ivory-200 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={selectedPatient.avatarUrl}
              alt={selectedPatient.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-photo shrink-0"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                {t('roles.caregiver', 'Caregiver Monitoring Portal')}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-charcoal-900 mt-0.5">
                {selectedPatient.name}
              </h2>
              <p className="text-sm text-charcoal-600 font-medium mt-1">
                {selectedPatient.age} · {selectedPatient.hierarchy.district}, {selectedPatient.hierarchy.state}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-white border border-ivory-300 text-xs font-bold text-charcoal-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-forest-700" />
              <span>{t('hardware.title', 'ESP32 Console')}: <strong className="uppercase">{device.status}</strong></span>
            </div>

            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddMemoryOpen(true)}>
              {t('memoryGarden.addMemory', 'Add Memory')}
            </Button>
          </div>
        </div>
      </section>

      {/* 2. CLINICAL INSIGHTS & AI OBSERVATIONS */}
      <section className="bg-gradient-to-r from-forest-900 to-forest-800 text-white rounded-3xl p-6 md:p-8 shadow-photo space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-400" />
          <h3 className="font-serif font-bold text-xl text-ivory-50">{t('reports.aiObservationTitle', 'AI-assisted Observation — Care Summary')}</h3>
        </div>
        <p className="text-ivory-200 text-base leading-relaxed max-w-4xl">
          {selectedPatient.name.split(' ')[0]} has completed <strong>{sessionHistory.length} cognitive game sessions</strong> with <strong>{sessionHistory.length > 0 ? Math.round(sessionHistory.reduce((s, x) => s + x.accuracyPercentage, 0) / sessionHistory.length) : 85}% overall accuracy</strong> and an average response time of <strong>{sessionHistory.length > 0 ? (sessionHistory.reduce((s, x) => s + (x.avgResponseTimeMs || 3000), 0) / sessionHistory.length / 1000).toFixed(1) : '3.1'}s</strong>. Current cognitive calibration is active on <strong>{currentDifficulty.toUpperCase()}</strong>.
        </p>
        <p className="text-xs font-semibold text-gold-300 flex items-center gap-1 pt-1">
          <AlertCircle className="w-4 h-4 text-gold-400" />
          <span>AI-assisted observation from live gameplay telemetry — not a medical diagnosis.</span>
        </p>
      </section>

      {/* 3. MEMORY GARDEN HIGHLIGHTS & REMINDERS SUITE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Memory Garden Photo Highlights (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-serif font-bold text-2xl text-charcoal-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-terracotta-600" />
              <span>{t('memoryGarden.title', 'Recent Family Memories')}</span>
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Camera className="w-4 h-4" />}
                onClick={() => setIsAddMemoryOpen(true)}
              >
                {t('memoryGarden.addMemory', 'Upload Photo')}
              </Button>
              <span className="text-xs font-bold text-forest-800 hidden sm:inline">
                {memories.length} {t('common.all', 'Total')}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {memories.slice(0, 3).map((mem) => (
              <div
                key={mem.id}
                className="bg-white rounded-3xl p-5 border border-ivory-200/80 shadow-soft flex flex-col sm:flex-row gap-5 items-center group"
              >
                {mem.imageUrl && (
                  <img
                    src={mem.imageUrl}
                    alt={mem.title}
                    className="w-full sm:w-32 h-28 object-cover rounded-2xl border shrink-0"
                  />
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-terracotta-700 bg-terracotta-50 px-2.5 py-0.5 rounded-full">
                      {mem.category}
                    </span>
                    <span className="text-xs font-bold text-charcoal-500">{mem.year}</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-charcoal-900 group-hover:text-forest-800 transition-colors">
                    {mem.title}
                  </h4>
                  <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">{mem.story}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminders Manager (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-2xl text-charcoal-900 flex items-center gap-2">
              <Clock className="w-6 h-6 text-forest-800" />
              <span>{t('reminders.title', 'Daily Reminders')}</span>
            </h3>
            <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsAddReminderOpen(true)}>
              {t('common.save', 'Add')}
            </Button>
          </div>

          <div className="space-y-3">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-white p-4 rounded-2xl border border-ivory-200 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
                    {rem.type} · {rem.scheduledTime}
                  </span>
                  <h4 className="font-semibold text-charcoal-900 text-sm">{rem.title}</h4>
                </div>

                <div>
                  {rem.state === 'completed' ? (
                    <span className="text-xs font-bold text-forest-700 flex items-center gap-1 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('reminders.completed', 'Done')}
                    </span>
                  ) : (
                    <button
                      onClick={() => updateReminderState(rem.id, 'completed')}
                      className="text-xs font-bold text-forest-800 hover:underline px-3 py-1 bg-ivory-100 rounded-full"
                    >
                      {t('reminders.markComplete', 'Mark Done')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Memory Modal */}
      <Modal isOpen={isAddMemoryOpen} onClose={() => setIsAddMemoryOpen(false)} title="Add Memory Entry">
        <form onSubmit={handleCreateMemory} className="space-y-4">
          {/* Photo Upload Zone */}
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1 flex items-center justify-between">
              <span>Memory Photograph</span>
              <span className="text-xs text-purple-600 font-bold">Upload Custom Photo</span>
            </label>

            {uploadPreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500 max-h-44 bg-black/5 flex items-center justify-center group">
                <img src={uploadPreview} alt="Upload preview" className="w-full h-40 object-cover" />
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
                  Click or Drag & Drop Patient Photo
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
              value={memTitle}
              onChange={(e) => setMemTitle(e.target.value)}
              placeholder="e.g. Bihu Festival Celebration"
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Year</label>
              <input
                type="number"
                value={memYear}
                onChange={(e) => setMemYear(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Category</label>
              <select
                value={memCategory}
                onChange={(e) => setMemCategory(e.target.value as MemoryCategory)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-white"
              >
                {['Childhood', 'School', 'Career', 'Marriage', 'Family', 'Grandchildren', 'Important Events'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1">Story & Reflection</label>
            <textarea
              required
              rows={3}
              value={memStory}
              onChange={(e) => setMemStory(e.target.value)}
              placeholder="Describe this memory..."
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsAddMemoryOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Memory</Button>
          </div>
        </form>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal isOpen={isAddReminderOpen} onClose={() => setIsAddReminderOpen(false)} title="Create Daily Reminder">
        <form onSubmit={handleCreateReminder} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal-800 mb-1">Reminder Title</label>
            <input
              type="text"
              required
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              placeholder="e.g. Afternoon Medication"
              className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Category</label>
              <select
                value={remType}
                onChange={(e) => setRemType(e.target.value as ReminderType)}
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-white"
              >
                <option value="medicine">Medicine</option>
                <option value="hydration">Hydration</option>
                <option value="activity">Cognitive Activity</option>
                <option value="appointment">Medical Appointment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal-800 mb-1">Scheduled Time</label>
              <input
                type="text"
                value={remTime}
                onChange={(e) => setRemTime(e.target.value)}
                placeholder="02:30 PM"
                className="w-full px-4 py-3 rounded-2xl border border-ivory-300 focus:outline-none bg-ivory-50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsAddReminderOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Reminder</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

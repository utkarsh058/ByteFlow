import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Pill, 
  Droplet, 
  Calendar, 
  CheckCircle2, 
  Volume2 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReminderStore } from '../../stores/useReminderStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { VoiceButton } from '../common/VoiceButton';
import { Modal } from '../common/Modal';
import { ReminderType } from '../../types';

export const RemindersManagerView: React.FC = () => {
  const { t } = useTranslation();
  const { reminders, addReminder, updateReminderState } = useReminderStore();
  const { selectedPatient } = useAuthStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('medicine');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addReminder({
      patientId: selectedPatient.id,
      title,
      type,
      scheduledTime,
      state: 'upcoming',
      notes,
      voicePromptText: `Reminder for ${selectedPatient.name.split(' ')[0]}: ${title}`,
    });

    setTitle('');
    setNotes('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Patient Care Schedule</span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Clock className="w-7 h-7 text-brand-600" />
            <span>{t('reminders.title')}</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Medicine, hydration, cognitive activities, and medical appointment notifications for {selectedPatient.name}.
          </p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsAddOpen(true)}>
          Create Reminder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reminders.map((rem) => (
          <Card key={rem.id} className="flex flex-col justify-between space-y-4 border-slate-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    rem.type === 'medicine'
                      ? 'terracotta'
                      : rem.type === 'hydration'
                      ? 'info'
                      : rem.type === 'appointment'
                      ? 'warning'
                      : 'neutral'
                  }
                  size="md"
                  icon={
                    rem.type === 'medicine' ? (
                      <Pill className="w-3.5 h-3.5" />
                    ) : rem.type === 'hydration' ? (
                      <Droplet className="w-3.5 h-3.5" />
                    ) : (
                      <Calendar className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {rem.type.toUpperCase()}
                </Badge>
                
                <span className="text-xs font-bold text-slate-500">{rem.scheduledTime}</span>
              </div>

              <h3 className="font-bold text-xl text-slate-900">{rem.title}</h3>

              {rem.notes && <p className="text-sm text-slate-600">{rem.notes}</p>}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              {rem.voicePromptText && (
                <VoiceButton textToSpeak={rem.voicePromptText} label="Listen Reminder" size="sm" />
              )}

              {rem.state === 'completed' ? (
                <Badge variant="success" size="md" icon={<CheckCircle2 className="w-4 h-4" />}>
                  Completed
                </Badge>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => updateReminderState(rem.id, 'completed')}>
                  Mark Done
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Daily Reminder">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Reminder Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Afternoon Medication"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ReminderType)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-brand-500/20 focus:outline-none bg-white"
              >
                <option value="medicine">Medicine</option>
                <option value="hydration">Hydration</option>
                <option value="activity">Cognitive Activity</option>
                <option value="appointment">Medical Appointment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Scheduled Time</label>
              <input
                type="text"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                placeholder="02:30 PM"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-brand-500/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notes / Instructions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take 1 tablet with warm water"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-4 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Reminder</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

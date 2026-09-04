import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Calendar, Pill, Droplet, BrainCircuit, Heart } from 'lucide-react';

export const DailyTimelineSection: React.FC = () => {
  const scheduleItems = [
    {
      time: '08:00 AM',
      title: 'Morning Medicine & Breakfast',
      category: 'Medicine',
      status: 'Completed',
      notes: 'Blood pressure medication with morning Assam tea & warm breakfast.',
      icon: <Pill className="w-5 h-5 text-emerald-600" />,
      statusBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      time: '11:00 AM',
      title: 'Hydration & Short Walk Check',
      category: 'Hydration',
      status: 'Upcoming',
      notes: '1 glass of warm water & 10 min garden porch stroll.',
      icon: <Droplet className="w-5 h-5 text-blue-600" />,
      statusBg: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      time: '04:00 PM',
      title: 'Daily Memory & Picture Activity',
      category: 'Cognitive Activity',
      status: 'Upcoming',
      notes: 'Remember the Picture (5 min visual recognition exercise).',
      icon: <BrainCircuit className="w-5 h-5 text-forest-800" />,
      statusBg: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      time: '07:00 PM',
      title: 'Evening Family Routine & Rest',
      category: 'Routine',
      status: 'Upcoming',
      notes: 'Family dinner, light devotional music, and comfortable rest.',
      icon: <Heart className="w-5 h-5 text-terracotta" />,
      statusBg: 'bg-slate-100 text-slate-800 border-slate-300',
    },
  ];

  return (
    <section className="py-14 md:py-20 bg-cream border-b border-cream-border">
      <div className="max-w-content mx-auto px-4 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-forest-800 inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-forest-800" /> Daily Support & Routines
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-charcoal">
            Predictable Daily Schedule & Reminders
          </h2>
          <p className="text-charcoal-muted text-sm md:text-base leading-relaxed">
            Consistent routine presentation reduces anxiety and provides predictable daily cues for medicine, hydration, memory activities, and evening rest.
          </p>
        </div>

        {/* Vertical Timeline Container */}
        <div className="max-w-3xl mx-auto space-y-4 relative before:absolute before:inset-0 before:left-8 md:before:left-32 before:w-0.5 before:bg-cream-border">
          {scheduleItems.map((item, idx) => (
            <div key={idx} className="relative flex flex-col md:flex-row items-start gap-4 md:gap-8 group">
              
              {/* Time Label Column */}
              <div className="w-28 text-left md:text-right shrink-0 pt-1">
                <span className="font-serif font-bold text-sm md:text-base text-forest-800">
                  {item.time}
                </span>
              </div>

              {/* Timeline Point Badge */}
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-forest-800 flex items-center justify-center shrink-0 z-10 shadow-xs">
                {item.icon}
              </div>

              {/* Schedule Item Content Card */}
              <div className="bg-white p-5 rounded-2xl border border-cream-border shadow-xs hover:border-forest-400 transition-all flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif font-bold text-base md:text-lg text-charcoal">
                    {item.title}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${item.statusBg}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted leading-relaxed font-medium">
                  {item.notes}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { 
  Stethoscope, 
  TrendingUp, 
  AlertCircle, 
  Sparkles, 
  Activity, 
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import { useActivityStore } from '../../stores/useActivityStore';
import { RegionalState } from '../../types';
import { formatDate } from '../../utils/formatters';

export const ClinicianDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedPatient } = useAuthStore();
  const { sessionHistory } = useActivityStore();

  const [selectedState, setSelectedState] = useState<RegionalState>('Assam');

  const trendData = [
    { session: 'Aug 20', accuracy: 78, responseTimeSec: 4.2 },
    { session: 'Aug 22', accuracy: 82, responseTimeSec: 3.8 },
    { session: 'Aug 24', accuracy: 85, responseTimeSec: 3.5 },
    { session: 'Aug 26', accuracy: 85, responseTimeSec: 3.1 },
    { session: 'Aug 27', accuracy: 92, responseTimeSec: 2.9 },
    { session: 'Aug 28', accuracy: 88, responseTimeSec: 3.4 },
  ];

  return (
    <div className="space-y-10 md:space-y-12 animate-in fade-in duration-500">
      
      {/* Header & Regional State Filter */}
      <div className="bg-ivory-100/90 p-6 md:p-8 rounded-4xl border border-ivory-200 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
              Clinical Progress & Engagement Analytics
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-charcoal-900 mt-1 flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-forest-800" />
              <span>North Eastern Region Clinical Review</span>
            </h2>
          </div>

          <span className="bg-forest-100 text-forest-900 border border-forest-300 text-xs font-bold px-3.5 py-1.5 rounded-full">
            Guwahati Regional Cognitive Care Center
          </span>
        </div>

        {/* Regional State Selector */}
        <div className="pt-3 flex flex-wrap items-center gap-2 border-t border-ivory-200">
          <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Regional State Node:
          </span>
          {['Assam', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh', 'Sikkim'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st as RegionalState)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedState === st
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-ivory-200 text-charcoal-700 hover:bg-ivory-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* AI-Assisted Clinical Observations Banner */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-800 text-white rounded-3xl p-6 md:p-8 shadow-photo space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-400" />
          <h3 className="font-serif font-bold text-xl text-ivory-50">AI-assisted Observation — Patient Profile</h3>
        </div>
        <p className="text-ivory-200 text-sm md:text-base leading-relaxed">
          Patient <strong>{selectedPatient.name}</strong> maintains consistent cognitive performance in visual photo recognition. Response time improved from 4.2s to 3.1s over 6 sessions. Adaptive difficulty automatically raised to medium with smooth accuracy preservation.
        </p>
        <p className="text-xs font-semibold text-gold-300 flex items-center gap-1 pt-1">
          <AlertCircle className="w-4 h-4 text-gold-400" />
          <span>AI-assisted observation — not a medical diagnosis.</span>
        </p>
      </div>

      {/* Analytics Charts & Patient Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recharts Performance Trend */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-ivory-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-xl text-charcoal-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-forest-800" />
                <span>Accuracy & Response Time Trends</span>
              </h3>
              <p className="text-xs text-charcoal-500">Historical performance metrics across completed cognitive sessions</p>
            </div>
            <span className="text-xs font-bold text-forest-800 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
              Last 6 Sessions
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E4925" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1E4925" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE2D3" />
                <XAxis dataKey="session" stroke="#58615E" fontSize={12} />
                <YAxis stroke="#58615E" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#112C16', borderRadius: '16px', color: '#fff', border: 'none' }}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy (%)"
                  stroke="#1E4925"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAccuracy)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assigned Patients Summary */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-ivory-200/80 shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-xl text-charcoal-900">Assigned Patients</h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-forest-50 border-2 border-forest-700/40 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-charcoal-900 text-base">{selectedPatient.name}</h4>
                <span className="text-xs font-bold text-forest-800 bg-white px-2.5 py-0.5 rounded-full border border-forest-200">
                  Stable Engagement
                </span>
              </div>
              <p className="text-xs text-charcoal-600">Age {selectedPatient.age} · Assam</p>
              <div className="pt-2 text-xs font-semibold text-forest-900 flex items-center justify-between">
                <span>Recent Score: 88%</span>
                <span>Diff: Easy → Medium</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-charcoal-900 text-base">Hemanta Saikia</h4>
                <span className="text-xs font-bold text-terracotta-700 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
                  Needs Review
                </span>
              </div>
              <p className="text-xs text-charcoal-600">Age 78 · Kamrup Metropolitan</p>
              <div className="pt-2 text-xs font-semibold text-charcoal-700 flex items-center justify-between">
                <span>Recent Score: 62%</span>
                <span>Diff: Simplified to Easy</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Session History Table */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-ivory-200/80 shadow-soft space-y-4">
        <h3 className="font-serif font-bold text-xl text-charcoal-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-forest-800" />
          <span>Session History & Adaptive Difficulty Log</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory-100 text-charcoal-700 border-b border-ivory-200">
              <tr>
                <th className="py-3 px-4 font-bold">Date & Time</th>
                <th className="py-3 px-4 font-bold">Activity Type</th>
                <th className="py-3 px-4 font-bold">Accuracy Score</th>
                <th className="py-3 px-4 font-bold">Avg Response Time</th>
                <th className="py-3 px-4 font-bold">Difficulty Level</th>
                <th className="py-3 px-4 font-bold">Adaptive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {sessionHistory.map((sess) => (
                <tr key={sess.id} className="hover:bg-ivory-50">
                  <td className="py-3.5 px-4 font-medium text-charcoal-900">{formatDate(sess.timestamp)}</td>
                  <td className="py-3.5 px-4 capitalize font-bold text-forest-800">{sess.activityType.replace('_', ' ')}</td>
                  <td className="py-3.5 px-4 font-bold text-forest-900">{sess.accuracyPercentage}%</td>
                  <td className="py-3.5 px-4 text-charcoal-700">{(sess.avgResponseTimeMs / 1000).toFixed(1)}s</td>
                  <td className="py-3.5 px-4 capitalize font-medium">{sess.difficultyLevel}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-bold text-charcoal-800 bg-ivory-200 px-2.5 py-1 rounded-full">
                      Activity difficulty adjusted
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import { Heart, Sparkles, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { RoleSwitcher } from './RoleSwitcher';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useTranslation();
  const { role, selectedPatient } = useAuthStore();
  const { elderlyMode } = useAccessibilityStore();

  const patientNav = [
    { id: 'home', labelKey: 'navigation.home' },
    { id: 'memories', labelKey: 'navigation.memories' },
    { id: 'reminders', labelKey: 'navigation.reminders' },
  ];

  const caregiverNav = [
    { id: 'home', labelKey: 'navigation.home' },
    { id: 'memories', labelKey: 'navigation.memories' },
    { id: 'reminders', labelKey: 'navigation.reminders' },
    { id: 'device', labelKey: 'navigation.deviceCenter' },
  ];

  const clinicianNav = [
    { id: 'analytics', labelKey: 'navigation.analytics' },
    { id: 'device', labelKey: 'navigation.deviceCenter' },
  ];

  const adminNav = [
    { id: 'facility', labelKey: 'navigation.facility' },
    { id: 'device', labelKey: 'navigation.deviceCenter' },
    { id: 'analytics', labelKey: 'navigation.analytics' },
  ];

  const navItems = {
    patient: patientNav,
    caregiver: caregiverNav,
    clinician: clinicianNav,
    facility_admin: adminNav,
  }[role];

  return (
    <header className="bg-white border-b-2 border-slate-300 sticky top-0 z-40 transition-all shadow-xs">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
        
        {/* Main Single Row Header */}
        <div className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200">
          
          {/* Logo & Regional Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#004085] flex items-center justify-center text-white shadow-xs">
              <Heart className="w-6 h-6 fill-amber-400 stroke-[#004085]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-2xl tracking-tight text-slate-900 font-serif">
                  SMRITI-SETU
                </h1>
                <span className="bg-blue-50 text-[#004085] text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                  {selectedPatient.hierarchy.state} Care Node
                </span>
              </div>
              <p className="text-xs font-bold text-slate-600">
                North Eastern Region Cognitive Health & Memory Assistance
              </p>
            </div>
          </div>

          {/* Controls: Role Switcher & Language Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <RoleSwitcher />
            <LanguageSelector />
          </div>
        </div>

        {/* Clean Editorial Navigation Bar */}
        <div className="py-2.5 flex items-center justify-between overflow-x-auto">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-full font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#004085] text-amber-300 shadow-xs font-extrabold'
                      : 'text-slate-700 hover:text-[#004085] hover:bg-slate-100'
                  } ${elderlyMode ? 'px-6 py-2.5 text-lg font-bold' : 'text-sm'}`}
                >
                  <span>{t(item.labelKey)}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-300">
            <Navigation className="w-3.5 h-3.5 text-[#004085]" />
            <span>
              Patient: {selectedPatient.name} ({selectedPatient.hierarchy.district})
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};

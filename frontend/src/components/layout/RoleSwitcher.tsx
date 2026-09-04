import React from 'react';
import { UserCheck, HeartPulse, Stethoscope, Building2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '../../types';
import { useTranslation } from 'react-i18next';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

export const RoleSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { role, setRole } = useAuthStore();
  const { elderlyMode } = useAccessibilityStore();

  const roleOptions: Array<{ id: UserRole; labelKey: string; icon: React.ReactNode }> = [
    { id: 'patient', labelKey: 'roles.patient', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'caregiver', labelKey: 'roles.caregiver', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'clinician', labelKey: 'roles.clinician', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'facility_admin', labelKey: 'roles.facility_admin', icon: <Building2 className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 bg-ivory-200/80 p-1 rounded-full border border-ivory-300">
      {roleOptions.map((opt) => {
        const active = role === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setRole(opt.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all text-xs ${
              active
                ? 'bg-white text-forest-950 shadow-xs font-bold'
                : 'text-charcoal-700 hover:text-forest-900 hover:bg-ivory-300/50'
            } ${elderlyMode ? 'py-2 px-3.5 text-sm font-bold' : ''}`}
          >
            <span className={active ? 'text-forest-700' : 'text-charcoal-500'}>{opt.icon}</span>
            <span>{t(opt.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
};

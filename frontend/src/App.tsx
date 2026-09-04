import React, { useState } from 'react';
import { PublicPortalPage } from './pages/PublicPortalPage';
import { AppShell } from './components/layout/AppShell';
import { useAuthStore } from './stores/useAuthStore';
import { UserRole } from './types';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { CaregiverDashboard } from './pages/caregiver/CaregiverDashboard';
import { ClinicianDashboard } from './pages/clinician/ClinicianDashboard';
import { FacilityDashboard } from './pages/facility/FacilityDashboard';
import { ActivityContainer } from './components/activities/ActivityContainer';
import { ActivityType } from './types';
import { MemoryGardenView } from './components/memory/MemoryGardenView';
import { RemindersManagerView } from './components/reminders/RemindersManagerView';
import { ArrowLeft } from 'lucide-react';

export const App: React.FC = () => {
  const { role, setRole } = useAuthStore();
  const [viewMode, setViewMode] = useState<'public_portal' | 'authenticated_app'>('public_portal');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  const handleStartActivity = (type: ActivityType) => {
    setSelectedActivity(type);
  };

  const handleBackFromActivity = () => {
    setSelectedActivity(null);
  };

  const handleOpenAppAuth = (selectedRole?: UserRole) => {
    if (selectedRole) setRole(selectedRole);
    setViewMode('authenticated_app');
  };

  // If viewing the Public NER Government Healthcare Portal:
  if (viewMode === 'public_portal') {
    return <PublicPortalPage onOpenAppAuth={handleOpenAppAuth} />;
  }

  // If inside the Authenticated Smriti-Setu Application:
  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* Return to Public Government Portal Banner Strip */}
      <div className="bg-govNavy-dark text-white py-2 px-4 text-xs font-bold flex items-center justify-between border-b border-slate-700 sticky top-0 z-50 shadow-md">
        <button
          onClick={() => setViewMode('public_portal')}
          className="hover:underline flex items-center gap-1.5 text-amber-300 font-extrabold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Official Government Health Portal
        </button>
        <div className="flex items-center gap-3">
          <span className="text-slate-200 font-semibold hidden sm:inline bg-govNavy px-3 py-0.5 rounded-full border border-slate-600">
            Authenticated Role: <strong className="text-white uppercase">{role}</strong>
          </span>
        </div>
      </div>

      <AppShell>
        {(activeTab, setActiveTab) => {
          if (selectedActivity) {
            return (
              <ActivityContainer
                initialActivityType={selectedActivity}
                onBack={handleBackFromActivity}
              />
            );
          }

          if (role === 'patient') {
            if (activeTab === 'activities') {
              return (
                <ActivityContainer
                  initialActivityType="memory_match"
                  onBack={() => setActiveTab('home')}
                />
              );
            }
            if (activeTab === 'memories') return <MemoryGardenView />;
            if (activeTab === 'reminders') return <RemindersManagerView />;
            return <PatientDashboard onStartActivity={handleStartActivity} />;
          }

          if (role === 'caregiver') {
            if (activeTab === 'memories') return <MemoryGardenView />;
            if (activeTab === 'reminders') return <RemindersManagerView />;
            if (activeTab === 'device') return <FacilityDashboard />;
            return <CaregiverDashboard />;
          }

          if (role === 'clinician') {
            if (activeTab === 'activities') {
              return (
                <ActivityContainer
                  initialActivityType="picture_recognition"
                  onBack={() => setActiveTab('analytics')}
                />
              );
            }
            if (activeTab === 'device') return <FacilityDashboard />;
            return <ClinicianDashboard />;
          }

          if (role === 'facility_admin') {
            if (activeTab === 'analytics') return <ClinicianDashboard />;
            if (activeTab === 'device') return <FacilityDashboard />;
            return <FacilityDashboard />;
          }

          return <PatientDashboard onStartActivity={handleStartActivity} />;
        }}
      </AppShell>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { AccessibilityToolbar } from '../common/AccessibilityToolbar';
import { OfflineBanner } from './OfflineBanner';
import { Header } from './Header';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface AppShellProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  children: (activeTab: string, setActiveTab: (tab: string) => void) => React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab: controlledTab,
  setActiveTab: controlledSetTab,
  children,
}) => {
  const [internalTab, setInternalTab] = useState('home');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = controlledSetTab !== undefined ? controlledSetTab : setInternalTab;
  const { reducedMotion } = useAccessibilityStore();

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-all bg-slate-50 text-slate-900 ${
        reducedMotion ? 'motion-reduce' : ''
      }`}
    >
      <AccessibilityToolbar />
      <OfflineBanner />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 w-full px-4 sm:px-8 md:px-12 lg:px-16 py-6 md:py-10">
        {children(activeTab, setActiveTab)}
      </main>

      <footer className="bg-[#07243C] text-slate-200 py-8 border-t-4 border-amber-400 text-sm font-sans">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="font-serif font-bold text-white">SMRITI-SETU</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">North Eastern Region Cognitive Health Ecosystem</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Encrypted Patient Profile & Regional Healthcare Node Management
          </p>
        </div>
      </footer>
    </div>
  );
};

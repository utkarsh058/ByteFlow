import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

export const GovTicker: React.FC = () => {
  return (
    <div className="bg-[#FAF3E5] border-y border-[#C89B3C]/40 py-2 flex items-center overflow-hidden">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 flex items-center gap-3 text-xs font-semibold">
        
        {/* Yellow Latest Updates Badge */}
        <div className="bg-[#004085] text-white px-3 py-1 rounded-md font-extrabold flex items-center gap-1.5 shrink-0 shadow-xs uppercase tracking-wider text-[11px]">
          <Bell className="w-3.5 h-3.5 text-amber-300" />
          <span>Govt Circulars & Notices</span>
        </div>

        {/* Scrolling News Marquee Text */}
        <div className="overflow-hidden relative flex-1 text-slate-900 font-medium">
          <div className="animate-marquee whitespace-nowrap space-x-12">
            <span>
              📋 <strong>Ref No. Z.28015/01/2026-NPHCE (01/09/2026):</strong> Deployment of Smriti-Setu AI Cognitive Assessment Module in 65 District Hospitals across 8 NER States.
            </span>
            <span>
              ☎️ <strong>Tele-MANAS & Elder Line (Toll-Free 14416 / 14567):</strong> 24x7 Multilingual Geriatric Mental Health Counseling active in Assamese, Bengali, Khasi, Mizo & Hindi.
            </span>
            <span>
              🆔 <strong>ABDM Integration:</strong> Link your 14-digit ABHA Health ID for seamless cognitive health record tracking at AIIMS Guwahati, NEIGRIHMS Shillong & RIMS Imphal.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

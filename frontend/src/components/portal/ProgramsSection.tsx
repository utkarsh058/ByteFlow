import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { sampleProgramsData } from '../../data/programsData';

export const ProgramsSection: React.FC = () => {
  return (
    <section id="programs-section" className="py-12 md:py-16 bg-slate-50 border-b border-slate-200">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-8">
        
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-govNavy-dark">
            Government Health Schemes
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-1">
            Programs & Initiatives
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-1">
            National and regional health initiatives focused on elderly care, digital health, and community wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleProgramsData.map((prog) => (
            <div key={prog.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="px-2.5 py-1 bg-govNavy-soft text-govNavy-dark font-extrabold text-[11px] rounded-md uppercase tracking-wider">
                  {prog.coverage}
                </span>
                <h3 className="font-serif font-bold text-lg text-slate-900 mt-1">
                  {prog.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500">{prog.department}</p>
                <p className="text-slate-600 text-xs leading-relaxed pt-1">
                  {prog.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-govNavy">
                <span>{prog.targetAudience}</span>
                <span className="hover:underline flex items-center gap-1">
                  {prog.linkText} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

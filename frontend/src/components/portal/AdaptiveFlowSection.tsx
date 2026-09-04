import React from 'react';
import { BrainCircuit, Activity, Sliders, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const AdaptiveFlowSection: React.FC = () => {
  return (
    <section className="py-14 md:py-20 bg-white border-b border-cream-border">
      <div className="max-w-content mx-auto px-4 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-terracotta inline-flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-terracotta" /> AI-Assisted Personalization
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-charcoal">
            Care that adapts to the person.
          </h2>
          <p className="text-charcoal-muted text-sm md:text-base leading-relaxed">
            Smriti-Setu continuously evaluates activity performance, response time, and interaction patterns to automatically fine-tune game difficulty — ensuring tasks remain encouraging, never frustrating.
          </p>
        </div>

        {/* Visual Process Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          {/* Step 1: Patient Activity */}
          <div className="bg-cream p-6 rounded-2xl border border-cream-border text-center space-y-3 relative">
            <div className="w-12 h-12 bg-forest-800 text-white rounded-xl flex items-center justify-center mx-auto shadow-xs font-bold text-lg">
              1
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Patient Activity</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Patient completes daily cognitive game sessions (e.g. Memory Match).
            </p>
          </div>

          {/* Step 2: Performance Signals */}
          <div className="bg-cream p-6 rounded-2xl border border-cream-border text-center space-y-3 relative">
            <div className="w-12 h-12 bg-forest-800 text-white rounded-xl flex items-center justify-center mx-auto shadow-xs font-bold text-lg">
              2
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Performance Signals</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              System records score accuracy %, completion time ms, and error frequency.
            </p>
          </div>

          {/* Step 3: Adaptive Difficulty Engine */}
          <div className="bg-cream p-6 rounded-2xl border border-cream-border text-center space-y-3 relative">
            <div className="w-12 h-12 bg-terracotta text-white rounded-xl flex items-center justify-center mx-auto shadow-xs font-bold text-lg">
              3
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Adaptive Engine</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Algorithmic check shifts level (`easy` $\leftrightarrow$ `medium` $\leftrightarrow$ `challenging`).
            </p>
          </div>

          {/* Step 4: Personalized Next Activity */}
          <div className="bg-cream p-6 rounded-2xl border border-cream-border text-center space-y-3 relative">
            <div className="w-12 h-12 bg-forest-800 text-white rounded-xl flex items-center justify-center mx-auto shadow-xs font-bold text-lg">
              4
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Personalized Next Session</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Patient receives next activity calibrated to their exact cognitive comfort zone.
            </p>
          </div>

        </div>

        {/* Realistic Demo Example Card */}
        <div className="bg-cream-surface rounded-3xl p-6 md:p-8 border border-cream-border shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-terracotta">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span>Real-World Adaptive Insight Example (Demo Record)</span>
            </div>
            <h4 className="font-serif font-bold text-xl text-charcoal">
              "Ranjit's visual-memory activities are performing consistently better this week."
            </h4>
            <p className="text-xs md:text-sm text-charcoal-muted leading-relaxed">
              Based on 3 consecutive sessions with accuracy $\ge 85\%$, the adaptive engine automatically shifted next week's session from `Easy` to `Medium` picture-recall activities.
            </p>
          </div>

          <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-cream-border space-y-2 text-xs font-bold text-charcoal text-center shadow-xs">
            <span className="text-[10px] text-forest-800 uppercase tracking-wider block font-extrabold">
              AI Adaptation Status
            </span>
            <span className="text-lg font-serif font-extrabold text-forest-800 block">
              Level Adjusted: Medium
            </span>
            <span className="text-[11px] text-charcoal-muted font-semibold block">
              AI-assisted observation — not a medical diagnosis.
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};

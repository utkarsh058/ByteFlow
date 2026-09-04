import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface RoutineRecallProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

const routineSteps = [
  { id: 'step-1', order: 1, title: 'Wake up peacefully & stretch' },
  { id: 'step-2', order: 2, title: 'Drink 1 glass of fresh warm water' },
  { id: 'step-3', order: 3, title: 'Take morning health medication' },
  { id: 'step-4', order: 4, title: 'Enjoy morning tea & family chat' },
];

export const RoutineRecall: React.FC<RoutineRecallProps> = ({ onComplete, onBack }) => {
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const handleStepClick = (stepId: string) => {
    if (selectedSteps.includes(stepId) || isFinished) return;
    const nextSteps = [...selectedSteps, stepId];
    setSelectedSteps(nextSteps);

    if (nextSteps.length === routineSteps.length) {
      // Evaluate ordering accuracy
      const correctOrder = ['step-1', 'step-2', 'step-3', 'step-4'];
      const matches = nextSteps.filter((id, index) => id === correctOrder[index]).length;
      const accuracy = Math.round((matches / routineSteps.length) * 100);
      const elapsed = Date.now() - startTime;

      setIsFinished(true);
      onComplete(accuracy, 1, elapsed);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <h3 className="font-bold text-xl text-slate-900">Daily Routine Recall</h3>
          <p className="text-xs text-slate-500">Click the morning routine steps in their natural order from 1 to 4.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>Back</Button>
      </div>

      {!isFinished && (
        <Card className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-slate-900">Selected Step Order:</h4>
            <div className="flex flex-wrap items-center gap-2 min-h-[50px] p-3 bg-slate-50 rounded-xl border border-slate-200">
              {selectedSteps.length === 0 ? (
                <span className="text-slate-400 text-sm italic">Click steps below to order them...</span>
              ) : (
                selectedSteps.map((id, index) => {
                  const stepObj = routineSteps.find((s) => s.id === id);
                  return (
                    <div key={id} className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-brand-600 text-white font-bold rounded-lg text-sm">
                        {index + 1}. {stepObj?.title}
                      </span>
                      {index < selectedSteps.length - 1 && <ArrowRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {routineSteps
              .sort(() => Math.random() - 0.5)
              .map((s) => {
                const isChosen = selectedSteps.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => handleStepClick(s.id)}
                    disabled={isChosen}
                    className={`p-5 rounded-2xl text-left font-semibold text-base transition-all border-2 ${
                      isChosen
                        ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-300 text-slate-900 hover:border-brand-600 hover:shadow-md'
                    }`}
                  >
                    {s.title}
                  </button>
                );
              })}
          </div>
        </Card>
      )}

      {isFinished && (
        <Card className="bg-sage-50 border-2 border-sage-500 text-center space-y-4 p-8">
          <CheckCircle2 className="w-16 h-16 text-sage-600 mx-auto" />
          <h3 className="text-3xl font-bold text-slate-900">Routine Completed!</h3>
          <p className="text-slate-700 font-medium text-lg">
            You organized your peaceful morning steps smoothly.
          </p>
          <Button variant="primary" size="lg" onClick={onBack}>
            Return to Schedule
          </Button>
        </Card>
      )}

    </div>
  );
};

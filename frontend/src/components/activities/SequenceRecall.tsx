import React, { useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface SequenceRecallProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

const colors = [
  { id: 'red', name: 'Terracotta Red', bg: 'bg-terracotta-600' },
  { id: 'green', name: 'Bamboo Green', bg: 'bg-sage-600' },
  { id: 'gold', name: 'Assam Gold', bg: 'bg-amber-500' },
  { id: 'blue', name: 'Brahmaputra Blue', bg: 'bg-navy-700' },
];

export const SequenceRecall: React.FC<SequenceRecallProps> = ({ onComplete, onBack }) => {
  const [sequence] = useState<string[]>(['green', 'gold', 'red']);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());

  const handlePlaySequence = () => {
    setIsShowingSequence(true);
    setUserSequence([]);

    sequence.forEach((color, idx) => {
      setTimeout(() => {
        setActiveHighlight(color);
      }, (idx + 1) * 800);

      setTimeout(() => {
        setActiveHighlight(null);
        if (idx === sequence.length - 1) {
          setIsShowingSequence(false);
        }
      }, (idx + 1) * 800 + 500);
    });
  };

  const handleColorClick = (colorId: string) => {
    if (isShowingSequence || isFinished) return;

    const nextUserSeq = [...userSequence, colorId];
    setUserSequence(nextUserSeq);

    const currentIdx = nextUserSeq.length - 1;
    if (nextUserSeq[currentIdx] !== sequence[currentIdx]) {
      // Wrong sequence step -> reset
      setUserSequence([]);
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      // Completed successfully!
      const elapsed = Date.now() - startTime;
      setIsFinished(true);
      onComplete(100, 1, elapsed);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <h3 className="font-bold text-xl text-slate-900">Sequence Recall</h3>
          <p className="text-xs text-slate-500">Watch the pattern lights and repeat the order.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>Back</Button>
      </div>

      {!isFinished && (
        <Card className="space-y-6 text-center">
          <Button
            variant="primary"
            size="elderly"
            icon={<Sparkles className="w-5 h-5 text-amber-300" />}
            onClick={handlePlaySequence}
            disabled={isShowingSequence}
          >
            {isShowingSequence ? 'Watching Sequence Pattern...' : 'Start Color Pattern'}
          </Button>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
            {colors.map((c) => {
              const isLit = activeHighlight === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleColorClick(c.id)}
                  disabled={isShowingSequence}
                  className={`aspect-square rounded-2xl font-bold text-white text-lg transition-all transform shadow-md ${c.bg} ${
                    isLit ? 'ring-8 ring-amber-300 scale-105 opacity-100' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {isFinished && (
        <Card className="bg-sage-50 border-2 border-sage-500 text-center space-y-4 p-8">
          <CheckCircle2 className="w-16 h-16 text-sage-600 mx-auto" />
          <h3 className="text-3xl font-bold text-slate-900">Sequence Recalled!</h3>
          <p className="text-slate-700 font-medium text-lg">
            You accurately remembered the full 3-step color sequence.
          </p>
          <Button variant="primary" size="lg" onClick={onBack}>
            Return to Schedule
          </Button>
        </Card>
      )}

    </div>
  );
};

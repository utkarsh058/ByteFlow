import React, { useState, useEffect } from 'react';
import { CheckCircle2, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';
import { useActivityStore } from '../../stores/useActivityStore';
import { useAccessibilityStore } from '../../stores/useAccessibilityStore';

interface MemoryMatchProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

interface MatchCard {
  id: number;
  pairId: string;
  name: string;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const cardItems = [
  { pairId: 'bihu', name: 'Bihu Festival', imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80' },
  { pairId: 'tea', name: 'Assam Tea Garden', imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80' },
  { pairId: 'river', name: 'Brahmaputra Sunset', imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80' },
  { pairId: 'flowers', name: 'Orchid Bloom', imageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80' },
];

export const MemoryMatch: React.FC<MemoryMatchProps> = ({ onComplete, onBack }) => {
  const { elderlyMode } = useAccessibilityStore();
  const { currentDifficulty } = useActivityStore();

  const [cards, setCards] = useState<MatchCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const doubled = [...cardItems, ...cardItems];
    const shuffled = doubled
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        id: idx,
        pairId: item.pairId,
        name: item.name,
        imageUrl: item.imageUrl,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            )
          );
          setFlippedCards([]);
          setMatchedPairs((prev) => {
            const nextCount = prev + 1;
            if (nextCount === cardItems.length) {
              const elapsed = Date.now() - startTime;
              const accuracy = Math.max(60, Math.min(100, Math.round((cardItems.length / Math.max(attempts + 1, cardItems.length)) * 100)));
              setIsFinished(true);
              onComplete(accuracy, attempts + 1, elapsed);
            }
            return nextCount;
          });
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      
      {/* Clean Top Navigation */}
      <div className="flex items-center justify-between border-b border-ivory-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-forest-800 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Schedule
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
          Matched: {matchedPairs} / {cardItems.length}
        </span>
      </div>

      {!isFinished && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-serif font-bold text-2xl md:text-3xl text-charcoal-900">
              Remember the Picture
            </h3>
            <p className="text-charcoal-600 text-sm">
              Click cards to reveal matching pairs of familiar photos.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {cards.map((card, idx) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`aspect-square rounded-3xl border-4 cursor-pointer transition-all duration-300 transform flex items-center justify-center p-2 text-center shadow-soft select-none ${
                  card.isFlipped || card.isMatched
                    ? 'bg-white border-forest-600'
                    : 'bg-forest-800 border-forest-900 hover:scale-105'
                }`}
              >
                {card.isFlipped || card.isMatched ? (
                  <div className="space-y-2">
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-24 h-24 object-cover rounded-2xl mx-auto shadow-xs"
                    />
                    <span className="font-serif font-bold text-xs text-charcoal-900 block">{card.name}</span>
                  </div>
                ) : (
                  <div className="text-ivory-100 space-y-1">
                    <Sparkles className="w-8 h-8 mx-auto text-gold-400 opacity-80" />
                    <span className="font-serif font-bold text-xs block tracking-widest uppercase">SMRITI</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Screen */}
      {isFinished && (
        <div className="bg-ivory-100 border-2 border-forest-600 text-center space-y-6 p-10 md:p-14 rounded-4xl shadow-photo max-w-2xl mx-auto">
          <CheckCircle2 className="w-20 h-20 text-forest-700 mx-auto" />
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-charcoal-900">Wonderful Job!</h3>
          <p className="text-charcoal-700 font-medium text-xl">
            You matched all photo pairs smoothly.
          </p>
          <Button variant="primary" size="elderly" onClick={onBack}>
            Return to Schedule
          </Button>
        </div>
      )}

    </div>
  );
};

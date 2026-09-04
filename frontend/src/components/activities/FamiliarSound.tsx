import React, { useState, useEffect } from 'react';
import { Volume2, Music, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { VoiceButton } from '../common/VoiceButton';
import { speakText } from '../../utils/speech';
import { gameApi } from '../../services/api';
import { GameQuestion } from '../../types';

interface FamiliarSoundProps {
  onComplete: (accuracy: number, attempts: number, responseTimeMs: number) => void;
  onBack: () => void;
}

const defaultSoundPrompts: Array<Omit<GameQuestion, 'activityType' | 'difficulty'> & { id: string | number }> = [
  {
    id: 'sq-1',
    question: 'Sound Challenge #1: Listen to the acoustic rain sound and choose the matching ambiance.',
    audioText: 'Pitter patter rainfall sound over lush green bamboo groves in Assam',
    options: ['Lush Rain on Bamboo Leaves', 'Train Horn', 'Busy City Traffic', 'Dog Barking'],
    correctOption: 0,
    explanation: 'Rainfall over bamboo groves is a calming, familiar regional acoustic sound.',
  },
  {
    id: 'sq-2',
    question: 'Sound Challenge #2: Listen to this traditional melodic horn and identify the folk instrument.',
    audioText: 'Melodious festive Pepa horn melody played during Rongali Bihu celebrations in Assam',
    options: ['Assamese Pepa Horn', 'Classical Violin', 'Electric Guitar', 'Grand Piano'],
    correctOption: 0,
    explanation: 'The Pepa is an indigenous hornpipe made from buffalo horn, played in Bihu celebrations.',
  },
  {
    id: 'sq-3',
    question: 'Sound Challenge #3: Listen to the evening spiritual sounds echoing from the Nilachal hill.',
    audioText: 'Resonating deep brass temple bells and evening Shankha conch shell blown at Kamakhya Temple in Guwahati',
    options: ['Kamakhya Temple Brass Bells & Conch', 'Clock Tower Alarm', 'Automobile Horns', 'Airport Loudspeaker'],
    correctOption: 0,
    explanation: 'Temple bells and conch shells provide calming, familiar auditory orientation for seniors.',
  },
  {
    id: 'sq-4',
    question: 'Sound Challenge #4: Listen to the morning birds welcoming the sunrise over the valley.',
    audioText: 'Sweet chirping of morning sparrows, mynas, and cuckoos singing over the misty green tea garden bushes',
    options: ['Misty Tea Garden Birdsong', 'Steam Train Engine', 'Construction Hammer', 'Thunderstorm Rumble'],
    correctOption: 0,
    explanation: 'Morning birdsong stimulates auditory orientation and helps patients start their morning routine.',
  },
  {
    id: 'sq-5',
    question: 'Sound Challenge #5: Listen to the energetic rhythm of this festive two-headed folk drum.',
    audioText: 'Vibrant rhythmic beating of the traditional Assamese Dhol drum accompanied by Kanshi bell cymbals',
    options: ['Traditional Bihu Dhol Drum', 'Rock Drumkit', 'Police Siren', 'Telephone Ringing'],
    correctOption: 0,
    explanation: 'The Bihu Dhol produces an unmistakable lively rhythm that sparks fond memories of community festivals.',
  },
];

export const FamiliarSound: React.FC<FamiliarSoundProps> = ({ onComplete, onBack }) => {
  const [prompts, setPrompts] = useState(defaultSoundPrompts);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState<number>(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const loadSoundQuestions = async () => {
      try {
        const data = await gameApi.getQuestions('familiar_sound');
        if (Array.isArray(data) && data.length > 0) {
          setPrompts(data);
        }
      } catch (err) {
        console.warn('Using default sound questions', err);
      }
    };
    loadSoundQuestions();
  }, []);

  const currentSound = prompts[currentIdx] || defaultSoundPrompts[0];

  const handlePlaySound = () => {
    if (currentSound.audioText) {
      speakText(currentSound.audioText, 'en');
    }
  };

  const handleSelectOption = (idx: number) => {
    if (showFeedback) return;
    setSelectedOpt(idx);
    setShowFeedback(true);

    const isCorrect = idx === currentSound.correctOption;
    if (isCorrect) setScore((prev) => prev + 1);

    setTimeout(() => {
      if (currentIdx + 1 < prompts.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOpt(null);
        setShowFeedback(false);
      } else {
        const elapsed = Date.now() - startTime;
        const finalScore = isCorrect ? score + 1 : score;
        const accuracy = Math.round((finalScore / prompts.length) * 100);
        setIsFinished(true);
        onComplete(accuracy, prompts.length, elapsed);
      }
    }, 1600);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      
      <div className="flex items-center justify-between border-b border-ivory-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-bold text-forest-800 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Schedule
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
          Sound {currentIdx + 1} of {prompts.length}
        </span>
      </div>

      {!isFinished && (
        <Card className="space-y-6 text-center py-8">
          
          <div className="w-24 h-24 rounded-full bg-forest-100 flex items-center justify-center mx-auto text-forest-800 shadow-soft">
            <Volume2 className="w-12 h-12" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl font-serif font-bold text-charcoal-900">
              {currentSound.question}
            </h3>
            <p className="text-sm text-charcoal-600">
              Click the button below to listen to the sound prompt, then choose the answer.
            </p>
          </div>

          <div>
            <Button
              variant="primary"
              size="lg"
              onClick={handlePlaySound}
              className="inline-flex items-center gap-2 text-lg shadow-photo"
            >
              <Music className="w-5 h-5" /> Listen to Regional Sound
            </Button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-4">
            {currentSound.options.map((opt, i) => {
              const isSelected = selectedOpt === i;
              const isCorrect = i === currentSound.correctOption;

              let btnStyle = 'bg-white border-2 border-ivory-300 text-charcoal-900 hover:border-forest-700 shadow-soft';
              if (showFeedback) {
                if (isCorrect) btnStyle = 'bg-forest-800 border-forest-900 text-white font-bold';
                else if (isSelected) btnStyle = 'bg-terracotta-600 border-terracotta-700 text-white font-bold';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-2xl text-center font-serif font-bold text-lg transition-all duration-200 select-none cursor-pointer ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback Explanation */}
          {showFeedback && currentSound.explanation && (
            <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl text-forest-900 text-xs font-medium max-w-lg mx-auto">
              {currentSound.explanation}
            </div>
          )}

        </Card>
      )}

      {isFinished && (
        <Card className="text-center space-y-6 py-10">
          <CheckCircle2 className="w-16 h-16 text-forest-700 mx-auto" />
          <h3 className="text-2xl font-serif font-bold text-charcoal-900">Wonderful Listening, Ranjit ji!</h3>
          <p className="text-charcoal-600">
            You accurately recognized {score} out of {prompts.length} familiar sounds.
          </p>
          <Button variant="primary" size="elderly" onClick={onBack}>
            Return to Schedule
          </Button>
        </Card>
      )}

    </div>
  );
};

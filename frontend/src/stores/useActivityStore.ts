import { create } from 'zustand';
import { CognitiveActivity, GameSession, DifficultyLevel, ActivityType } from '../types';
import { calculateNextDifficulty } from '../utils/adaptiveDifficulty';
import { gameApi } from '../services/api';

interface ActivityState {
  activities: CognitiveActivity[];
  activeSession: GameSession | null;
  sessionHistory: GameSession[];
  currentDifficulty: DifficultyLevel;
  difficultyAdjustmentNotice: string | null;
  startSession: (type: ActivityType) => void;
  completeSession: (accuracy: number, attempts: number, responseTimeMs: number, activityType?: ActivityType) => void;
  fetchSessionHistory: (patientId?: string) => Promise<void>;
  clearNotice: () => void;
}

const availableActivities: CognitiveActivity[] = [
  {
    id: 'act-1',
    type: 'memory_match',
    title: 'Remember the Picture',
    subtitle: 'Match pairs of familiar regional photos and cultural heritage symbols.',
    description: 'Strengthen visual recall through familiar family photographs and tea garden scenes.',
    estimatedMinutes: 5,
    difficulty: 'easy',
    iconName: 'LayoutGrid',
    category: 'Memory & Recall',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-3',
    type: 'picture_recognition',
    title: 'Who Is This?',
    subtitle: 'Identify familiar family members and regional landmark places.',
    description: 'Recognize familiar faces, Assam tea estates, and historical landmarks.',
    estimatedMinutes: 5,
    difficulty: 'easy',
    iconName: 'Image',
    category: 'Person & Object Recognition',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-5',
    type: 'routine_recall',
    title: 'Remember Your Morning',
    subtitle: 'Sequence your peaceful daily habits and morning wellness routine.',
    description: 'Order your morning steps from stretching to taking morning tea with family.',
    estimatedMinutes: 4,
    difficulty: 'easy',
    iconName: 'CalendarCheck',
    category: 'Daily Routine Memory',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-4',
    type: 'familiar_sound',
    title: 'Listen to Familiar Sounds',
    subtitle: 'Listen to regional acoustic sounds (rain on bamboo, Bihu flute, birdsong).',
    description: 'Match peaceful auditory sounds from nature and traditional instruments.',
    estimatedMinutes: 5,
    difficulty: 'easy',
    iconName: 'Volume2',
    category: 'Auditory Recognition',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-2',
    type: 'sequence_recall',
    title: 'Pattern & Color Recall',
    subtitle: 'Remember visual pattern sequences in a calm cadence.',
    description: 'Follow and repeat color patterns to train focus and attention span.',
    estimatedMinutes: 4,
    difficulty: 'easy',
    iconName: 'ListOrdered',
    category: 'Attention & Focus',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'act-6',
    type: 'photo_puzzle',
    title: 'Personalized Photo Puzzle',
    subtitle: 'Upload any family photo, slice it into pieces, and reconstruct it.',
    description: 'Upload your own cherished photos or choose cultural memories to reconstruct visually.',
    estimatedMinutes: 5,
    difficulty: 'easy',
    iconName: 'Puzzle',
    category: 'Visual Reminiscence',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=600&q=80',
  },
];

const initialHistory: GameSession[] = [
  {
    id: 'sess-106',
    patientId: 'pat-ner-001',
    activityType: 'memory_match',
    timestamp: '2026-08-28T09:30:00Z',
    accuracyPercentage: 88,
    attemptsCount: 6,
    avgResponseTimeMs: 3400,
    completed: true,
    difficultyLevel: 'medium',
    difficultyAdjusted: true,
  },
  {
    id: 'sess-105',
    patientId: 'pat-ner-001',
    activityType: 'picture_recognition',
    timestamp: '2026-08-27T10:15:00Z',
    accuracyPercentage: 92,
    attemptsCount: 5,
    avgResponseTimeMs: 2900,
    completed: true,
    difficultyLevel: 'medium',
    difficultyAdjusted: true,
  },
  {
    id: 'sess-104',
    patientId: 'pat-ner-001',
    activityType: 'sequence_recall',
    timestamp: '2026-08-26T11:00:00Z',
    accuracyPercentage: 85,
    attemptsCount: 7,
    avgResponseTimeMs: 3100,
    completed: true,
    difficultyLevel: 'easy',
    difficultyAdjusted: false,
  },
  {
    id: 'sess-103',
    patientId: 'pat-ner-001',
    activityType: 'familiar_sound',
    timestamp: '2026-08-24T14:20:00Z',
    accuracyPercentage: 85,
    attemptsCount: 6,
    avgResponseTimeMs: 3500,
    completed: true,
    difficultyLevel: 'easy',
    difficultyAdjusted: false,
  },
  {
    id: 'sess-102',
    patientId: 'pat-ner-001',
    activityType: 'photo_puzzle',
    timestamp: '2026-08-22T16:00:00Z',
    accuracyPercentage: 82,
    attemptsCount: 8,
    avgResponseTimeMs: 3800,
    completed: true,
    difficultyLevel: 'easy',
    difficultyAdjusted: false,
  },
  {
    id: 'sess-101',
    patientId: 'pat-ner-001',
    activityType: 'memory_match',
    timestamp: '2026-08-20T09:00:00Z',
    accuracyPercentage: 78,
    attemptsCount: 9,
    avgResponseTimeMs: 4200,
    completed: true,
    difficultyLevel: 'easy',
    difficultyAdjusted: false,
  },
];

const LOCAL_STORAGE_SESSIONS_KEY = 'smriti_setu_game_sessions';

const loadPersistedSessions = (): GameSession[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local session history', e);
  }
  return initialHistory;
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: availableActivities,
  activeSession: null,
  sessionHistory: loadPersistedSessions(),
  currentDifficulty: 'medium',
  difficultyAdjustmentNotice: null,

  fetchSessionHistory: async (patientId = 'pat-ner-001') => {
    try {
      const backendHistory = await gameApi.getSessionHistory(patientId);
      if (Array.isArray(backendHistory) && backendHistory.length > 0) {
        const local = get().sessionHistory;
        // Merge without duplicates based on id
        const map = new Map<string, GameSession>();
        [...backendHistory, ...local].forEach((item) => map.set(item.id, item));
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(merged));
        set({ sessionHistory: merged });
      }
    } catch (err) {
      console.warn('Using local session history (offline mode)', err);
    }
  },

  startSession: (type) => {
    const newSession: GameSession = {
      id: `sess-${Date.now()}`,
      patientId: 'pat-ner-001',
      activityType: type,
      timestamp: new Date().toISOString(),
      accuracyPercentage: 0,
      attemptsCount: 0,
      avgResponseTimeMs: 0,
      completed: false,
      difficultyLevel: get().currentDifficulty,
      difficultyAdjusted: false,
    };
    set({ activeSession: newSession });
  },

  completeSession: async (accuracy, attempts, responseTimeMs, activityType) => {
    const { activeSession, sessionHistory, currentDifficulty } = get();
    
    const fallbackType = activityType || (activeSession ? activeSession.activityType : 'memory_match');
    
    const completedSession: GameSession = {
      id: activeSession?.id || `sess-${Date.now()}`,
      patientId: activeSession?.patientId || 'pat-ner-001',
      activityType: fallbackType,
      timestamp: activeSession?.timestamp || new Date().toISOString(),
      accuracyPercentage: accuracy,
      attemptsCount: attempts,
      avgResponseTimeMs: responseTimeMs,
      completed: true,
      difficultyLevel: currentDifficulty,
      difficultyAdjusted: false,
    };

    const updatedHistory = [completedSession, ...sessionHistory.filter((s) => s.id !== completedSession.id)];
    const adaptResult = calculateNextDifficulty(currentDifficulty, updatedHistory);
    
    completedSession.difficultyLevel = adaptResult.nextDifficulty;
    completedSession.difficultyAdjusted = adaptResult.adjusted;

    let notice: string | null = null;
    if (adaptResult.adjusted) {
      notice = `Activity difficulty adjusted to ${adaptResult.nextDifficulty.toUpperCase()} based on your performance trends.`;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(updatedHistory));
    } catch {
      // LocalStorage quota safety
    }

    set({
      activeSession: completedSession,
      sessionHistory: updatedHistory,
      currentDifficulty: adaptResult.nextDifficulty,
      difficultyAdjustmentNotice: notice,
    });

    try {
      const backendResult = await gameApi.submitSessionResult(completedSession);
      if (backendResult?.nextDifficulty) {
        set({
          currentDifficulty: backendResult.nextDifficulty as DifficultyLevel,
          difficultyAdjustmentNotice: backendResult.adjusted
            ? `Activity difficulty adjusted to ${backendResult.nextDifficulty.toUpperCase()} based on your performance trends.`
            : notice,
        });
      }
    } catch (err) {
      console.warn('Game session recorded locally (offline mode)', err);
    }
  },

  clearNotice: () => set({ difficultyAdjustmentNotice: null }),
}));

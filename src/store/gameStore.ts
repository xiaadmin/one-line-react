import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cell, LevelData, PlayerProgress, GameSettings } from '../types/game';

interface GameState {
  progress: PlayerProgress;
  settings: GameSettings;
  currentLevel: LevelData | null;
  path: Cell[];
  attemptsLeft: number;
  status: 'idle' | 'playing' | 'success' | 'failed';
  
  // Actions
  unlockNextLevel: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startLevel: (level: LevelData) => void;
  addCellToPath: (cell: Cell) => void;
  setPath: (path: Cell[]) => void;
  resetPath: () => void;
  setStatus: (status: 'idle' | 'playing' | 'success' | 'failed') => void;
  decreaseAttempt: () => void;
  resetProgress: () => void;
}

const initialProgress: PlayerProgress = {
  unlockedLevel: 1,
  completedLevels: [],
  bestRecords: {},
  dailyChallenge: {
    date: new Date().toISOString().split('T')[0],
    completed: false,
    attemptsLeft: 3,
  }
};

const initialSettings: GameSettings = {
  bgmEnabled: true,
  bgmVolume: 0.03,
  sfxEnabled: true,
  vibrationEnabled: true,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,
      settings: initialSettings,
      currentLevel: null,
      path: [],
      attemptsLeft: 0,
      status: 'idle',

      unlockNextLevel: () => set((state) => {
        const currentLevelId = state.currentLevel?.id;
        if (!currentLevelId) return state;
        
        const isCompleted = state.progress.completedLevels.includes(currentLevelId);
        const newCompleted = isCompleted 
          ? state.progress.completedLevels 
          : [...state.progress.completedLevels, currentLevelId];
          
        return {
          progress: {
            ...state.progress,
            unlockedLevel: Math.max(state.progress.unlockedLevel, currentLevelId + 1),
            completedLevels: newCompleted,
          }
        };
      }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      startLevel: (level) => set({
        currentLevel: level,
        path: [level.startCell],
        attemptsLeft: level.maxAttempts,
        status: 'playing',
      }),

      addCellToPath: (cell) => set((state) => ({
        path: [...state.path, cell]
      })),

      setPath: (path) => set({ path }),

      resetPath: () => set((state) => {
        if (!state.currentLevel) return state;
        return {
          path: [state.currentLevel.startCell],
          status: 'playing',
        };
      }),

      setStatus: (status) => set({ status }),

      decreaseAttempt: () => set((state) => {
        const newAttempts = Math.max(0, state.attemptsLeft - 1);
        return {
          attemptsLeft: newAttempts,
          status: newAttempts === 0 ? 'failed' : state.status,
        };
      }),

      resetProgress: () => set({
        progress: initialProgress
      }),
    }),
    {
      name: 'one-line-storage',
      partialize: (state) => ({
        progress: state.progress,
        settings: state.settings,
      }),
    }
  )
);

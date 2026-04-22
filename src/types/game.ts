export type Cell = {
  x: number;
  y: number;
};

export type LevelData = {
  id: number;
  mode: 'campaign' | 'daily';
  width: number;
  height: number;
  walkableCells: Cell[];
  startCell: Cell;
  endCell?: Cell;
  difficulty: number;
  maxAttempts: number;
  timeLimit?: number;
  hintPath?: Cell[];
};

export type PlayerProgress = {
  unlockedLevel: number;
  completedLevels: number[];
  bestRecords: Record<number, {
    time: number;
    attemptsLeft: number;
  }>;
  dailyChallenge: {
    date: string;
    completed: boolean;
    attemptsLeft: number;
  };
};

export type GameSettings = {
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  vibrationEnabled: boolean;
};

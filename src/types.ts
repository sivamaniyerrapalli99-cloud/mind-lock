export type GameMode = 
  | 'ENDLESS'
  | 'DAILY'
  | 'QUICK_10'
  | 'TIME_ATTACK'
  | 'PERFECT_RUN'
  | 'PRACTICE';

export type ChallengeCategory = 
  | 'MEMORY'
  | 'LOGIC'
  | 'ATTENTION'
  | 'REACTION'
  | 'IMPULSE'
  | 'SEQUENCE'
  | 'COMPARISON';

export type ChallengeType = 
  | 'MEM_NUMBER'
  | 'MEM_2DIGIT'
  | 'MEM_3DIGIT'
  | 'MEM_SYMBOL'
  | 'MEM_SEQUENCE'
  | 'MEM_POSITION'
  | 'LOGIC_GREATER'
  | 'LOGIC_NEXT_NUM'
  | 'LOGIC_ODD_EVEN'
  | 'ATTN_COUNT_DOTS'
  | 'ATTN_DIFFERENT_SYMBOL'
  | 'ATTN_WHICH_SIDE'
  | 'REACT_PRESS_NOW'
  | 'REACT_WHEN_GREEN'
  | 'IMPULSE_WAIT'
  | 'IMPULSE_IGNORE_SIGNAL'
  | 'COMP_SAME_AS_LAST'
  | 'COMP_HIGHER_LOWER';

export interface ChallengeOption {
  id: string;
  label: string;
  subLabel?: string;
  icon?: string;
  isCorrect: boolean;
}

export type ChallengePhase = 'MEMORIZE' | 'ACTION' | 'FEEDBACK';

export interface Challenge {
  id: string;
  category: ChallengeCategory;
  type: ChallengeType;
  instruction: string;       // e.g. "REMEMBER THIS NUMBER" or "COUNT THE GREEN DOTS"
  question: string;          // e.g. "WHAT WAS IT?" or "HOW MANY?"
  presentationContent?: {
    type: 'text' | 'number' | 'symbols' | 'dots' | 'grid' | 'flash';
    value: string | number | string[] | number[];
    meta?: Record<string, any>;
  };
  options: ChallengeOption[];
  memorizeDurationMs: number; // Duration to show memorize phase
  actionTimeLimitMs: number;  // Max duration for action phase
  correctOptionIndex: number;
  isReactionWait?: boolean;   // If true, player must NOT press until timer expires
  reactionTargetTimeMs?: number; // For press now trigger
}

export interface UserSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  glowIntensity: 'low' | 'normal' | 'high';
  tutorialCompleted: boolean;
}

export interface UserStatistics {
  bestScoreEndless: number;
  bestScoreDaily: number;
  bestScoreQuick: number;
  bestScoreTimeAttack: number;
  bestScorePerfect: number;
  highestRound: number;
  highestCombo: number;
  totalGames: number;
  totalRounds: number;
  totalCorrect: number;
  totalMistakes: number;
  avgReactionTimeMs: number;
  totalReactionSamples: number;
  lastDailyDate: string;
  dailyStreak: number;
}

export interface GameScoreResult {
  score: number;
  round: number;
  combo: number;
  bestCombo: number;
  accuracy: number;
  avgReactionTime: number;
  isNewBest: boolean;
  mode: GameMode;
  date: string;
}

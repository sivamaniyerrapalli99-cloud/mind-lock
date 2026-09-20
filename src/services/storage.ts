import { UserSettings, UserStatistics, GameMode } from '../types';

const SETTINGS_KEY = 'mind_lock_settings_v1';
const STATS_KEY = 'mind_lock_stats_v1';

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  reducedMotion: false,
  glowIntensity: 'normal',
  tutorialCompleted: false,
};

const DEFAULT_STATS: UserStatistics = {
  bestScoreEndless: 0,
  bestScoreDaily: 0,
  bestScoreQuick: 0,
  bestScoreTimeAttack: 0,
  bestScorePerfect: 0,
  highestRound: 0,
  highestCombo: 0,
  totalGames: 0,
  totalRounds: 0,
  totalCorrect: 0,
  totalMistakes: 0,
  avgReactionTimeMs: 0,
  totalReactionSamples: 0,
  lastDailyDate: '',
  dailyStreak: 0,
};

export const storage = {
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  },

  getStats(): UserStatistics {
    try {
      const data = localStorage.getItem(STATS_KEY);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  },

  saveStats(stats: UserStatistics): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {}
  },

  recordGameResult(
    mode: GameMode,
    score: number,
    round: number,
    combo: number,
    correctCount: number,
    mistakesCount: number,
    reactionTimes: number[]
  ): { isNewBest: boolean; prevBest: number } {
    const stats = this.getStats();
    let isNewBest = false;
    let prevBest = 0;

    switch (mode) {
      case 'ENDLESS':
        prevBest = stats.bestScoreEndless;
        if (score > stats.bestScoreEndless) {
          stats.bestScoreEndless = score;
          isNewBest = true;
        }
        break;
      case 'DAILY':
        prevBest = stats.bestScoreDaily;
        if (score > stats.bestScoreDaily) {
          stats.bestScoreDaily = score;
          isNewBest = true;
        }
        const todayStr = new Date().toISOString().split('T')[0];
        if (stats.lastDailyDate !== todayStr) {
          stats.dailyStreak += 1;
          stats.lastDailyDate = todayStr;
        }
        break;
      case 'QUICK_10':
        prevBest = stats.bestScoreQuick;
        if (score > stats.bestScoreQuick) {
          stats.bestScoreQuick = score;
          isNewBest = true;
        }
        break;
      case 'TIME_ATTACK':
        prevBest = stats.bestScoreTimeAttack;
        if (score > stats.bestScoreTimeAttack) {
          stats.bestScoreTimeAttack = score;
          isNewBest = true;
        }
        break;
      case 'PERFECT_RUN':
        prevBest = stats.bestScorePerfect;
        if (score > stats.bestScorePerfect) {
          stats.bestScorePerfect = score;
          isNewBest = true;
        }
        break;
      default:
        break;
    }

    stats.totalGames += 1;
    stats.totalRounds += round;
    stats.totalCorrect += correctCount;
    stats.totalMistakes += mistakesCount;

    if (round > stats.highestRound) {
      stats.highestRound = round;
    }
    if (combo > stats.highestCombo) {
      stats.highestCombo = combo;
    }

    if (reactionTimes.length > 0) {
      const sumRecent = reactionTimes.reduce((a, b) => a + b, 0);
      const totalSamples = stats.totalReactionSamples + reactionTimes.length;
      const prevTotalSum = stats.avgReactionTimeMs * stats.totalReactionSamples;
      stats.avgReactionTimeMs = Math.round((prevTotalSum + sumRecent) / totalSamples);
      stats.totalReactionSamples = totalSamples;
    }

    this.saveStats(stats);
    return { isNewBest, prevBest };
  },

  getBestScoreForMode(mode: GameMode): number {
    const stats = this.getStats();
    switch (mode) {
      case 'ENDLESS': return stats.bestScoreEndless;
      case 'DAILY': return stats.bestScoreDaily;
      case 'QUICK_10': return stats.bestScoreQuick;
      case 'TIME_ATTACK': return stats.bestScoreTimeAttack;
      case 'PERFECT_RUN': return stats.bestScorePerfect;
      case 'PRACTICE': return 0;
    }
  },

  resetAllData(): void {
    try {
      localStorage.removeItem(STATS_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch {}
  }
};

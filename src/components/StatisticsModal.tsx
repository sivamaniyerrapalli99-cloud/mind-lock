import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Target, Zap, Clock, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { UserStatistics } from '../types';
import { storage } from '../services/storage';
import { sound } from '../services/sound';

interface StatisticsModalProps {
  onClose: () => void;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({ onClose }) => {
  const [stats, setStats] = useState<UserStatistics>(storage.getStats());

  useEffect(() => {
    setStats(storage.getStats());
  }, []);

  const totalAttempts = stats.totalCorrect + stats.totalMistakes;
  const accuracy = totalAttempts > 0 ? Math.round((stats.totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm max-h-[90vh] flex flex-col rounded-2xl bg-[#041407] border border-[#0F471B] box-glow-green overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-[#0C3814]">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-[#00FF66]" />
            <h2 className="text-base font-black font-display tracking-widest text-white uppercase">
              PLAYER STATISTICS
            </h2>
          </div>
          <button
            id="btn_close_stats"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1 rounded-md text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {/* HIGH SCORES BENTO */}
          <div className="p-3.5 rounded-xl bg-[#061C0B] border border-[#0F471B] space-y-2">
            <span className="text-[10px] font-bold text-[#00FF66]/80 tracking-widest uppercase block">
              BEST SCORES BY MODE
            </span>
            <div className="grid grid-cols-2 gap-2 text-neutral-300">
              <div className="flex justify-between items-center py-1 border-b border-[#0C3814]">
                <span>ENDLESS:</span>
                <span className="font-mono-num font-bold text-white">
                  {stats.bestScoreEndless.toString().padStart(5, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#0C3814]">
                <span>DAILY:</span>
                <span className="font-mono-num font-bold text-white">
                  {stats.bestScoreDaily.toString().padStart(5, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#0C3814]">
                <span>QUICK TEST:</span>
                <span className="font-mono-num font-bold text-white">
                  {stats.bestScoreQuick.toString().padStart(5, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#0C3814]">
                <span>TIME ATTACK:</span>
                <span className="font-mono-num font-bold text-white">
                  {stats.bestScoreTimeAttack.toString().padStart(5, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* PERFORMANCE METRICS */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#051608] border border-[#0C3814] flex flex-col">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">HIGHEST ROUND</span>
              <span className="text-2xl font-black font-mono-num text-white mt-1">
                {stats.highestRound}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#051608] border border-[#0C3814] flex flex-col">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">MAX COMBO</span>
              <span className="text-2xl font-black font-mono-num text-[#00FF66] mt-1">
                x{stats.highestCombo}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#051608] border border-[#0C3814] flex flex-col">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">AVG REACTION</span>
              <span className="text-xl font-black font-mono-num text-white mt-1">
                {stats.avgReactionTimeMs > 0 ? `${stats.avgReactionTimeMs}ms` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#051608] border border-[#0C3814] flex flex-col">
              <span className="text-[10px] font-bold text-neutral-400 uppercase">ACCURACY</span>
              <span className="text-xl font-black font-mono-num text-white mt-1">
                {accuracy}%
              </span>
            </div>
          </div>

          {/* AGGREGATE STATS */}
          <div className="p-3.5 rounded-xl bg-[#051608] border border-[#0C3814] space-y-1.5 text-neutral-300">
            <div className="flex justify-between">
              <span>TOTAL GAMES PLAYED:</span>
              <span className="font-mono-num font-bold text-white">{stats.totalGames}</span>
            </div>
            <div className="flex justify-between">
              <span>TOTAL CORRECT ANSWERS:</span>
              <span className="font-mono-num font-bold text-[#00FF66]">{stats.totalCorrect}</span>
            </div>
            <div className="flex justify-between">
              <span>TOTAL MISTAKES:</span>
              <span className="font-mono-num font-bold text-red-400">{stats.totalMistakes}</span>
            </div>
            <div className="flex justify-between">
              <span>DAILY STREAK:</span>
              <span className="font-mono-num font-bold text-emerald-300">{stats.dailyStreak} days</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

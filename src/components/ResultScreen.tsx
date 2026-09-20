import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCw, Home, Zap, Clock, Target, Share2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameMode, GameScoreResult } from '../types';
import { storage } from '../services/storage';
import { sound } from '../services/sound';

interface ResultScreenProps {
  result: GameScoreResult;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onPlayAgain,
  onGoHome,
}) => {
  const bestScore = storage.getBestScoreForMode(result.mode);

  useEffect(() => {
    if (result.isNewBest) {
      sound.playNewBest();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00FF66', '#55FFAA', '#ffffff', '#009933'],
        });
      } catch {}
    }
  }, [result.isNewBest]);

  const handleShare = () => {
    sound.playTap();
    const shareText = `🧠 MIND LOCK [${result.mode}]\nScore: ${result.score}\nRound: ${result.round}\nCombo: x${result.combo}\nCan you break the lock?`;
    if (navigator.share) {
      navigator.share({
        title: 'MIND LOCK Score',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col justify-between p-5 bg-[#030804] text-white overflow-hidden select-none">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#00FF66]/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <header className="relative z-20 text-center pt-4">
        {result.isNewBest ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#00FF66]/20 border border-[#00FF66] text-[#00FF66] text-xs font-bold font-display tracking-widest uppercase mb-2 shadow-[0_0_12px_#00FF66]"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>NEW PERSONAL BEST!</span>
          </motion.div>
        ) : (
          <span className="text-xs font-bold tracking-widest text-[#00FF66]/70 uppercase">
            CHALLENGE COMPLETE
          </span>
        )}

        <h1 className="text-3xl font-black font-display tracking-widest text-white text-glow-white uppercase">
          GAME OVER
        </h1>
        <p className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase mt-0.5">
          {result.mode.replace('_', ' ')}
        </p>
      </header>

      {/* SCORE DISPLAY CARD */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto space-y-4 py-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full p-6 rounded-2xl bg-[#061B0B] border border-[#0F471B] box-glow-green text-center relative overflow-hidden"
        >
          <div className="text-[11px] font-bold tracking-widest text-[#00FF66]/80 uppercase">
            FINAL SCORE
          </div>
          <div className="text-5xl font-black font-mono-num text-white text-glow-white my-1">
            {result.score.toString().padStart(5, '0')}
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-neutral-300 mt-2 pt-2 border-t border-[#0F471B]/60">
            <Trophy className="w-4 h-4 text-[#00FF66]" />
            <span>BEST:</span>
            <span className="font-mono-num font-bold text-white">
              {bestScore.toString().padStart(5, '0')}
            </span>
          </div>
        </motion.div>

        {/* METRICS GRID */}
        <div className="w-full grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-[#051608] border border-[#0C3814] text-center">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              ROUNDS
            </span>
            <span className="text-xl font-bold font-mono-num text-white mt-0.5 block">
              {result.round}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#051608] border border-[#0C3814] text-center">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              BEST COMBO
            </span>
            <span className="text-xl font-bold font-mono-num text-[#00FF66] mt-0.5 block">
              x{result.bestCombo}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#051608] border border-[#0C3814] text-center">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              AVG SPEED
            </span>
            <span className="text-xl font-bold font-mono-num text-white mt-0.5 block">
              {result.avgReactionTime > 0 ? `${result.avgReactionTime}ms` : '-'}
            </span>
          </div>
        </div>
      </main>

      {/* FOOTER ACTIONS */}
      <footer className="relative z-20 space-y-2.5 pb-4">
        <motion.button
          id="btn_play_again"
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sound.playTap();
            onPlayAgain();
          }}
          className="w-full py-4 rounded-xl bg-[#00FF66] hover:bg-[#18FF74] text-black font-black font-display tracking-widest text-lg flex items-center justify-center space-x-2 box-glow-green cursor-pointer transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          <span>PLAY AGAIN</span>
        </motion.button>

        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn_share_score"
            onClick={handleShare}
            className="py-3 rounded-xl bg-[#061C0B] hover:bg-[#092B12] border border-[#0F471B] text-neutral-200 text-xs font-bold font-display tracking-wider flex items-center justify-center space-x-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-[#00FF66]" />
            <span>SHARE SCORE</span>
          </button>

          <button
            id="btn_return_home"
            onClick={() => {
              sound.playTap();
              onGoHome();
            }}
            className="py-3 rounded-xl bg-[#061C0B] hover:bg-[#092B12] border border-[#0F471B] text-neutral-200 text-xs font-bold font-display tracking-wider flex items-center justify-center space-x-2 transition-colors"
          >
            <Home className="w-4 h-4 text-[#00FF66]" />
            <span>HOME</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-2.8-6.2l-2.1 2.1M5.9 18.1l2.1-2.1M18.1 18.1l-2.1-2.1M5.9 5.9l2.1 2.1" />
  </svg>
);

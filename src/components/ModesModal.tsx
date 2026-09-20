import React from 'react';
import { motion } from 'motion/react';
import { X, Flame, Calendar, FastForward, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { GameMode } from '../types';
import { sound } from '../services/sound';
import { storage } from '../services/storage';

interface ModesModalProps {
  onClose: () => void;
  onSelectMode: (mode: GameMode) => void;
}

interface ModeInfo {
  id: GameMode;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  bestScoreKey: GameMode;
}

const MODES: ModeInfo[] = [
  {
    id: 'ENDLESS',
    name: 'ENDLESS MIND LOCK',
    badge: 'CORE MODE',
    description: 'Survive as long as possible with 3 lives. Difficulty scales indefinitely.',
    icon: Flame,
    bestScoreKey: 'ENDLESS',
  },
  {
    id: 'DAILY',
    name: 'DAILY LOCK',
    badge: 'DAILY SEED',
    description: 'One deterministic puzzle challenge per calendar day. Equal for all players globally.',
    icon: Calendar,
    bestScoreKey: 'DAILY',
  },
  {
    id: 'QUICK_10',
    name: 'QUICK TEST (10 RDS)',
    badge: 'BITE-SIZED',
    description: 'A swift 10-round brain drill. Test your speed and precision under 1 minute.',
    icon: FastForward,
    bestScoreKey: 'QUICK_10',
  },
  {
    id: 'TIME_ATTACK',
    name: 'TIME ATTACK (60s)',
    badge: 'RUSH',
    description: 'Solve as many challenges as you can in 60 seconds. Speed is everything.',
    icon: Clock,
    bestScoreKey: 'TIME_ATTACK',
  },
  {
    id: 'PERFECT_RUN',
    name: 'PERFECT RUN',
    badge: 'HARDCORE',
    description: 'Zero margin for error. Exactly 1 chance — 1 mistake ends the run.',
    icon: ShieldAlert,
    bestScoreKey: 'PERFECT_RUN',
  },
  {
    id: 'PRACTICE',
    name: 'PRACTICE LAB',
    badge: 'RELAXED',
    description: 'Infinite lives without score pressure. Hone your memory and reaction reflexes.',
    icon: Cpu,
    bestScoreKey: 'PRACTICE',
  },
];

export const ModesModal: React.FC<ModesModalProps> = ({ onClose, onSelectMode }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-[#041407] border border-[#0F471B] box-glow-green overflow-hidden"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-[#0C3814]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_6px_#00FF66]" />
            <h2 className="text-lg font-black font-display tracking-widest text-white uppercase">
              SELECT CHALLENGE MODE
            </h2>
          </div>
          <button
            id="btn_close_modes"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1.5 rounded-lg border border-[#0D3B16] bg-[#061C0B] hover:bg-[#0A2F13] text-neutral-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODES LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const best = storage.getBestScoreForMode(mode.bestScoreKey);

            return (
              <motion.button
                key={mode.id}
                id={`btn_mode_${mode.id.toLowerCase()}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sound.playTap();
                  onSelectMode(mode.id);
                }}
                className="w-full p-3.5 rounded-xl bg-[#061C0B] hover:bg-[#0A2E13] active:bg-[#0E3E1A] border border-[#10471D] hover:border-[#00FF66]/50 text-left transition-all flex items-start space-x-3 group"
              >
                <div className="p-2.5 rounded-lg bg-[#041307] border border-[#0F431B] text-[#00FF66] group-hover:text-white group-hover:border-[#00FF66] transition-colors shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-display tracking-wider text-white group-hover:text-[#00FF66] transition-colors">
                      {mode.name}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]">
                      {mode.badge}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {mode.description}
                  </p>

                  {mode.id !== 'PRACTICE' && (
                    <div className="text-[10px] font-mono-num text-emerald-400/80 mt-1.5 flex items-center space-x-1">
                      <span>BEST:</span>
                      <span className="text-white font-bold">{best.toString().padStart(5, '0')}</span>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

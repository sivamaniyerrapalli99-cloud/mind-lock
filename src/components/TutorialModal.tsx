import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { sound } from '../services/sound';
import { storage } from '../services/storage';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0); // 0: Intro, 1: Memory drill, 2: Impulse drill, 3: Success
  const [drillStage, setDrillStage] = useState<'SHOW' | 'GUESS'>('SHOW');
  const [drillFeedback, setDrillFeedback] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');

  const startMemoryDrill = () => {
    setStep(1);
    setDrillStage('SHOW');
    setDrillFeedback('IDLE');
    setTimeout(() => {
      setDrillStage('GUESS');
    }, 1500);
  };

  const handleMemoryChoice = (choice: number) => {
    sound.playTap();
    if (choice === 42) {
      sound.playCorrect(1);
      setDrillFeedback('CORRECT');
      setTimeout(() => {
        setStep(2);
        setDrillStage('SHOW');
        setDrillFeedback('IDLE');
      }, 700);
    } else {
      sound.playWrong();
      setDrillFeedback('WRONG');
      setTimeout(() => setDrillFeedback('IDLE'), 800);
    }
  };

  const handleImpulsePress = () => {
    sound.playTap();
    sound.playCorrect(2);
    setDrillFeedback('CORRECT');
    setTimeout(() => {
      const settings = storage.getSettings();
      settings.tutorialCompleted = true;
      storage.saveSettings(settings);
      setStep(3);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl bg-[#041407] border border-[#0F471B] box-glow-green overflow-hidden p-5 text-center space-y-4"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-2 border-b border-[#0D3B16]">
          <span className="text-xs font-bold font-display tracking-widest text-[#00FF66] uppercase">
            HOW TO PLAY
          </span>
          <button
            id="btn_close_tutorial"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1 rounded-md text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 0: INTRO */}
        {step === 0 && (
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#00FF66]/10 border border-[#00FF66] flex items-center justify-center text-[#00FF66] box-glow-green">
              <Zap className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black font-display tracking-wider text-white">
                THE 3 PRINCIPLES
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                MIND LOCK challenges your focus through 3 core instincts:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold font-display">
              <div className="p-2 rounded-lg bg-[#061C0B] border border-[#0F471B] text-[#00FF66]">
                1. REMEMBER
              </div>
              <div className="p-2 rounded-lg bg-[#061C0B] border border-[#0F471B] text-white">
                2. OBSERVE
              </div>
              <div className="p-2 rounded-lg bg-[#061C0B] border border-[#0F471B] text-[#00FF66]">
                3. REACT
              </div>
            </div>

            <button
              id="btn_start_interactive_drill"
              onClick={startMemoryDrill}
              className="w-full py-3 rounded-xl bg-[#00FF66] text-black font-bold font-display tracking-wider hover:bg-[#15FF75] transition-colors"
            >
              START 15-SEC DRILL
            </button>
          </div>
        )}

        {/* STEP 1: MEMORY DRILL */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <span className="text-[10px] font-bold tracking-widest text-[#00FF66]/80 uppercase">
              DRILL 1 OF 2 — SHORT-TERM MEMORY
            </span>

            {drillStage === 'SHOW' ? (
              <div className="p-6 rounded-2xl bg-[#061C0B] border border-[#00FF66]/50 box-glow-green space-y-2">
                <span className="text-xs font-semibold text-neutral-300">REMEMBER THIS:</span>
                <div className="text-5xl font-black font-mono-num text-white text-glow-white">
                  42
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="text-sm font-bold text-white">WHAT WAS THE NUMBER?</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    id="btn_drill_choice_42"
                    onClick={() => handleMemoryChoice(42)}
                    className="py-3 rounded-xl bg-[#07240E] hover:bg-[#00FF66] hover:text-black border border-[#114F21] text-lg font-bold font-mono-num transition-all"
                  >
                    42
                  </button>
                  <button
                    id="btn_drill_choice_24"
                    onClick={() => handleMemoryChoice(24)}
                    className="py-3 rounded-xl bg-[#07240E] hover:bg-[#00FF66] hover:text-black border border-[#114F21] text-lg font-bold font-mono-num transition-all"
                  >
                    24
                  </button>
                </div>
              </div>
            )}

            {drillFeedback === 'CORRECT' && (
              <p className="text-xs font-bold text-[#00FF66] animate-pulse">PERFECT! PROCEEDING...</p>
            )}
            {drillFeedback === 'WRONG' && (
              <p className="text-xs font-bold text-red-400">TRY AGAIN!</p>
            )}
          </div>
        )}

        {/* STEP 2: REACTION DRILL */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <span className="text-[10px] font-bold tracking-widest text-[#00FF66]/80 uppercase">
              DRILL 2 OF 2 — REACTION CONTROL
            </span>

            <div className="p-4 rounded-xl bg-[#061C0B] border border-[#0F471B] space-y-2">
              <p className="text-xs text-neutral-300">
                Some challenges ask you to <span className="text-[#FF5555] font-bold">WAIT</span> and then strike instantly!
              </p>
            </div>

            <motion.button
              id="btn_drill_press_now"
              whileTap={{ scale: 0.95 }}
              onClick={handleImpulsePress}
              className="w-full py-4 rounded-xl bg-[#00FF66] text-black font-black font-display tracking-widest text-lg box-glow-green-strong cursor-pointer"
            >
              LOCK NOW!
            </motion.button>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#00FF66]/20 border border-[#00FF66] flex items-center justify-center text-[#00FF66]">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black font-display tracking-wider text-white">
                YOU ARE READY
              </h3>
              <p className="text-xs text-neutral-300">
                Trust your instincts, avoid impulse errors, and break your personal best score!
              </p>
            </div>

            <button
              id="btn_finish_tutorial"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-[#00FF66] text-black font-bold font-display tracking-wider hover:bg-[#15FF75] transition-colors"
            >
              ENTER GAME
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

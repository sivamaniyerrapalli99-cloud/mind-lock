import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Heart, Zap, RefreshCw, XCircle, Trophy, Sparkles } from 'lucide-react';
import { GameMode, Challenge, ChallengePhase, UserSettings } from '../types';
import { challengeGen } from '../services/challengeGenerator';
import { sound } from '../services/sound';
import { storage } from '../services/storage';
import { CircularRing } from './CircularRing';

interface GameBoardProps {
  mode: GameMode;
  settings: UserSettings;
  onGameOver: (result: {
    score: number;
    round: number;
    combo: number;
    bestCombo: number;
    accuracy: number;
    avgReactionTime: number;
    isNewBest: boolean;
    mode: GameMode;
    date: string;
  }) => void;
  onExitHome: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  mode,
  settings,
  onGameOver,
  onExitHome,
}) => {
  // Game states
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(mode === 'PERFECT_RUN' ? 1 : 3);
  const [timeAttackSeconds, setTimeAttackSeconds] = useState(60);
  const [isPaused, setIsPaused] = useState(false);

  // Challenge execution states
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [phase, setPhase] = useState<ChallengePhase>('MEMORIZE');
  const [ringStatus, setRingStatus] = useState<'idle' | 'success' | 'error' | 'countdown'>('idle');
  const [timeRatio, setTimeRatio] = useState(1);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Performance & Stats metrics
  const reactionTimesRef = useRef<number[]>([]);
  const correctCountRef = useRef(0);
  const mistakesCountRef = useRef(0);
  const actionStartTimeRef = useRef<number>(0);
  const isTransitioningRef = useRef(false);

  // Timers
  const timerRafRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize PRNG seed for Daily Challenge
  useEffect(() => {
    if (mode === 'DAILY') {
      const todayNum = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''), 10);
      challengeGen.setSeed(todayNum);
    } else {
      challengeGen.resetSeed();
    }
    loadNewRound(1);

    return () => {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [mode]);

  // Handle Time Attack 60s global countdown
  useEffect(() => {
    if (mode !== 'TIME_ATTACK' || isPaused) return;

    const interval = setInterval(() => {
      setTimeAttackSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, isPaused]);

  // Load and setup next round challenge
  const loadNewRound = useCallback((roundNum: number) => {
    isTransitioningRef.current = false;
    setSelectedOptionId(null);
    setRingStatus('idle');

    if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);

    // End condition for QUICK_10
    if (mode === 'QUICK_10' && roundNum > 10) {
      finishGame();
      return;
    }

    const challenge = challengeGen.generateChallenge(roundNum);
    setCurrentChallenge(challenge);

    sound.playRoundTransition();

    if (challenge.memorizeDurationMs > 0) {
      setPhase('MEMORIZE');
      const start = performance.now();
      const duration = challenge.memorizeDurationMs;

      const step = () => {
        const elapsed = performance.now() - start;
        const remainingRatio = Math.max(0, 1 - elapsed / duration);
        setTimeRatio(remainingRatio);

        if (elapsed < duration) {
          timerRafRef.current = requestAnimationFrame(step);
        } else {
          startActionPhase(challenge);
        }
      };
      timerRafRef.current = requestAnimationFrame(step);
    } else {
      startActionPhase(challenge);
    }
  }, [mode]);

  // Switch to ACTION phase
  const startActionPhase = (challenge: Challenge) => {
    setPhase('ACTION');
    actionStartTimeRef.current = performance.now();
    const duration = challenge.actionTimeLimitMs;
    const start = performance.now();

    const step = () => {
      const elapsed = performance.now() - start;
      const remainingRatio = Math.max(0, 1 - elapsed / duration);
      setTimeRatio(remainingRatio);

      if (remainingRatio < 0.25 && remainingRatio > 0.05 && Math.random() < 0.05) {
        sound.playTick();
      }

      if (elapsed < duration) {
        timerRafRef.current = requestAnimationFrame(step);
      } else {
        handleTimeExpired(challenge);
      }
    };
    timerRafRef.current = requestAnimationFrame(step);
  };

  // Timeout handling
  const handleTimeExpired = (challenge: Challenge) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);

    if (challenge.isReactionWait) {
      // SUCCESS: Player held back impulse and did not press!
      handleCorrectAnswer(true);
    } else {
      // FAILED: Timed out without answer
      handleMistake('TIMEOUT');
    }
  };

  // Process Option Click or Button Action
  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    if (phase !== 'ACTION' || isTransitioningRef.current || isPaused) return;

    isTransitioningRef.current = true;
    setSelectedOptionId(optionId);
    if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);

    const reactionTime = performance.now() - actionStartTimeRef.current;
    reactionTimesRef.current.push(Math.round(reactionTime));

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleMistake('WRONG_CHOICE');
    }
  };

  // Handle Correct Answer
  const handleCorrectAnswer = (isImpulseSuccess = false) => {
    correctCountRef.current += 1;
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    if (nextCombo > maxCombo) {
      setMaxCombo(nextCombo);
    }

    // Combo multiplier calculation
    let comboMultiplier = 1.0;
    if (nextCombo >= 20) comboMultiplier = 2.0;
    else if (nextCombo >= 10) comboMultiplier = 1.5;
    else if (nextCombo >= 5) comboMultiplier = 1.2;

    const basePoints = 100;
    const reactionBonus = Math.max(0, Math.round((1 - (1 - timeRatio)) * 50));
    const roundScore = Math.round((basePoints + reactionBonus) * comboMultiplier);

    setScore((prev) => prev + roundScore);
    setRingStatus('success');
    sound.playCorrect(nextCombo);

    setTimeout(() => {
      setRound((prev) => {
        const nextRound = prev + 1;
        loadNewRound(nextRound);
        return nextRound;
      });
    }, 320);
  };

  // Handle Mistake / Lost Life
  const handleMistake = (reason: string) => {
    mistakesCountRef.current += 1;
    setCombo(0);
    setRingStatus('error');
    sound.playWrong();

    if (mode === 'PRACTICE') {
      // Practice mode: continue without losing lives
      setTimeout(() => {
        setRound((prev) => {
          const next = prev + 1;
          loadNewRound(next);
          return next;
        });
      }, 500);
      return;
    }

    const nextLives = lives - 1;
    setLives(nextLives);

    if (nextLives <= 0) {
      setTimeout(() => {
        sound.playGameOver();
        finishGame();
      }, 550);
    } else {
      setTimeout(() => {
        setRound((prev) => {
          const next = prev + 1;
          loadNewRound(next);
          return next;
        });
      }, 450);
    }
  };

  // Finish Game & Record Result
  const finishGame = () => {
    const totalAnswers = correctCountRef.current + mistakesCountRef.current;
    const accuracy = totalAnswers > 0 ? Math.round((correctCountRef.current / totalAnswers) * 100) : 0;
    const avgReaction =
      reactionTimesRef.current.length > 0
        ? Math.round(
            reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length
          )
        : 0;

    const { isNewBest } = storage.recordGameResult(
      mode,
      score,
      round,
      maxCombo,
      correctCountRef.current,
      mistakesCountRef.current,
      reactionTimesRef.current
    );

    onGameOver({
      score,
      round,
      combo: maxCombo,
      bestCombo: maxCombo,
      accuracy,
      avgReactionTime: avgReaction,
      isNewBest,
      mode,
      date: new Date().toLocaleDateString(),
    });
  };

  // Render Presentation Content in Center of Ring
  const renderCenterContent = () => {
    if (!currentChallenge) return null;

    if (phase === 'MEMORIZE') {
      return (
        <div className="flex flex-col items-center justify-center space-y-2">
          <span className="text-[11px] font-semibold tracking-wider text-[#00FF66]/80 uppercase text-glow-green">
            {currentChallenge.instruction}
          </span>

          {currentChallenge.presentationContent?.type === 'number' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black tracking-tight text-white font-mono-num text-glow-white my-1"
            >
              {currentChallenge.presentationContent.value}
            </motion.div>
          )}

          {currentChallenge.presentationContent?.type === 'symbols' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black text-[#00FF66] text-glow-green my-1"
            >
              {currentChallenge.presentationContent.value}
            </motion.div>
          )}

          {currentChallenge.presentationContent?.type === 'text' && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xl font-bold tracking-wide text-white text-glow-white my-1 max-w-[200px]"
            >
              {currentChallenge.presentationContent.value}
            </motion.div>
          )}

          {currentChallenge.presentationContent?.type === 'grid' && (
            <div className="grid grid-cols-2 gap-3 my-2">
              {[0, 1, 2, 3].map((posIdx) => {
                const isActive = currentChallenge.presentationContent?.value === posIdx;
                return (
                  <div
                    key={posIdx}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      isActive
                        ? 'bg-[#00FF66] border-white shadow-[0_0_12px_#00FF66]'
                        : 'bg-[#06180B] border-[#0E3D1A]'
                    }`}
                  />
                );
              })}
            </div>
          )}

          {currentChallenge.presentationContent?.type === 'dots' && (
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-[150px] my-2">
              {Array.from({ length: currentChallenge.presentationContent.value as number }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-4 h-4 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]"
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // ACTION Phase Center content
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <span className="text-[11px] font-semibold tracking-wider text-[#00FF66]/90 uppercase text-glow-green">
          {currentChallenge.question}
        </span>

        {currentChallenge.type === 'REACT_PRESS_NOW' && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-2xl font-black text-[#00FF66] text-glow-green"
          >
            NOW!
          </motion.div>
        )}

        {currentChallenge.type === 'IMPULSE_WAIT' && (
          <div className="text-xl font-bold tracking-widest text-[#FF5555] drop-shadow-[0_0_10px_rgba(255,80,80,0.7)]">
            HOLD...
          </div>
        )}

        {currentChallenge.type === 'COMP_HIGHER_LOWER' && (
          <div className="text-4xl font-black font-mono-num text-white text-glow-white">
            {currentChallenge.presentationContent?.value}
          </div>
        )}

        {currentChallenge.type === 'LOGIC_ODD_EVEN' && (
          <div className="text-4xl font-black font-mono-num text-white text-glow-white">
            {currentChallenge.presentationContent?.value}
          </div>
        )}

        {currentChallenge.type === 'LOGIC_GREATER' && (
          <div className="text-2xl font-bold font-mono-num text-white text-glow-white">
            {currentChallenge.presentationContent?.value}
          </div>
        )}

        {currentChallenge.type === 'LOGIC_NEXT_NUM' && (
          <div className="text-lg font-bold font-mono-num text-white text-glow-white max-w-[200px]">
            {currentChallenge.presentationContent?.value}
          </div>
        )}

        {currentChallenge.type === 'ATTN_DIFFERENT_SYMBOL' && (
          <div className="flex items-center justify-center gap-2 text-2xl text-[#00FF66] text-glow-green my-1">
            {(currentChallenge.presentationContent?.value as string[])?.map((sym, idx) => (
              <span key={idx} className="p-1 bg-[#051A0A] rounded border border-[#0D3B17]">
                {sym}
              </span>
            ))}
          </div>
        )}

        {currentChallenge.category === 'MEMORY' && (
          <div className="text-sm font-semibold tracking-wider text-emerald-400/80">
            CHOOSE ANSWER
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col justify-between p-4 bg-[#030804] text-white overflow-hidden select-none">
      {/* Background ambient neon glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FF66]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00FF66]/5 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER: Round, Score, Combo, Lives, Pause */}
      <header className="relative z-20 flex items-center justify-between pt-2 pb-1 border-b border-[#0A2610]">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#00FF66]/70">
            {mode === 'TIME_ATTACK' ? 'TIME REMAINING' : `ROUND ${round < 10 ? `0${round}` : round}`}
          </span>
          <span className="text-xl font-black font-display tracking-wide text-white text-glow-white">
            {mode === 'TIME_ATTACK' ? `${timeAttackSeconds}s` : `SCORE ${score.toString().padStart(5, '0')}`}
          </span>
        </div>

        {/* Combo & Lives Center */}
        <div className="flex items-center space-x-3">
          {combo >= 2 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/40 text-[#00FF66] text-xs font-bold font-mono-num"
            >
              <Zap className="w-3.5 h-3.5 text-[#00FF66] fill-[#00FF66]" />
              <span>x{combo >= 20 ? '2.0' : combo >= 10 ? '1.5' : combo >= 5 ? '1.2' : combo}</span>
            </motion.div>
          )}

          {mode !== 'PRACTICE' && (
            <div className="flex items-center space-x-1">
              {Array.from({ length: mode === 'PERFECT_RUN' ? 1 : 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                    i < lives
                      ? 'border-[#00FF66] bg-[#00FF66]/20 shadow-[0_0_8px_#00FF66]'
                      : 'border-[#1A3820] bg-transparent opacity-30'
                  }`}
                >
                  <Heart
                    className={`w-2.5 h-2.5 ${
                      i < lives ? 'text-[#00FF66] fill-[#00FF66]' : 'text-neutral-600'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            id="btn_pause_game"
            onClick={() => {
              sound.playTap();
              setIsPaused(true);
            }}
            className="p-1.5 rounded-lg border border-[#0F3817] bg-[#061A0C] hover:bg-[#0A2914] text-[#00FF66] transition-colors"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CENTER HERO: CIRCULAR SEGMENTED RING */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-auto py-2">
        <CircularRing
          totalSegments={36}
          countdownRatio={timeRatio}
          ringStatus={ringStatus}
          glowIntensity={settings.glowIntensity}
          size={310}
        >
          {renderCenterContent()}
        </CircularRing>

        {/* Phase indicator text */}
        <div className="mt-4 flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#00FF66]/70">
          <span
            className={`w-2 h-2 rounded-full ${
              phase === 'MEMORIZE' ? 'bg-[#00FF66] animate-ping' : 'bg-white'
            }`}
          />
          <span>{phase === 'MEMORIZE' ? 'MEMORIZE' : 'SELECT RESPONSE'}</span>
        </div>
      </main>

      {/* BOTTOM CONTROLS & ANSWER OPTIONS */}
      <footer className="relative z-20 pb-4 pt-2">
        {phase === 'MEMORIZE' ? (
          <div className="w-full h-24 flex items-center justify-center rounded-xl bg-[#041407] border border-[#0B3314] text-neutral-400 text-xs tracking-widest uppercase">
            <span>OBSERVE AND PREPARE...</span>
          </div>
        ) : (
          <div
            className={`w-full grid gap-2.5 ${
              currentChallenge?.options && currentChallenge.options.length > 2
                ? 'grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            {currentChallenge?.options.map((option, idx) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <motion.button
                  key={option.id}
                  id={`btn_option_${idx}`}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    sound.playTap();
                    handleOptionSelect(option.id, option.isCorrect);
                  }}
                  className={`relative min-h-[58px] px-4 py-3 rounded-xl font-bold font-display tracking-wider text-base transition-all flex items-center justify-center space-x-2 ${
                    currentChallenge.type === 'REACT_PRESS_NOW'
                      ? 'bg-[#00FF66] text-black border-2 border-white shadow-[0_0_25px_#00FF66] text-lg font-black'
                      : isSelected
                      ? option.isCorrect
                        ? 'bg-[#00FF66] text-black border-2 border-white shadow-[0_0_20px_#00FF66]'
                        : 'bg-[#FF3333] text-white border-2 border-red-300 shadow-[0_0_20px_#FF3333]'
                      : 'bg-[#071F0C] hover:bg-[#0B3013] active:bg-[#0F3F19] text-white border border-[#135022] box-glow-green-sm'
                  }`}
                >
                  <span>{option.label}</span>
                  {option.subLabel && <span className="text-xl">{option.subLabel}</span>}
                </motion.button>
              );
            })}
          </div>
        )}
      </footer>

      {/* PAUSE MODAL */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="w-full max-w-xs p-6 rounded-2xl bg-[#051608] border border-[#00FF66]/40 box-glow-green text-center space-y-4"
            >
              <h2 className="text-2xl font-black font-display tracking-widest text-white text-glow-white uppercase">
                PAUSED
              </h2>
              <p className="text-xs text-emerald-400/80">Take a breath. Keep your mind locked.</p>

              <div className="space-y-2 pt-2">
                <button
                  id="btn_resume"
                  onClick={() => {
                    sound.playTap();
                    setIsPaused(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#00FF66] text-black font-bold font-display tracking-wider hover:bg-[#15FF75] transition-colors shadow-[0_0_15px_#00FF66]"
                >
                  RESUME
                </button>
                <button
                  id="btn_exit_pause"
                  onClick={() => {
                    sound.playTap();
                    onExitHome();
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#0F3F19] bg-[#071F0D] hover:bg-[#0C2D14] text-neutral-300 text-xs font-semibold tracking-wider transition-colors"
                >
                  EXIT TO HOME
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

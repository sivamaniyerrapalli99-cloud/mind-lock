import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Calendar, Layers, BarChart2, HelpCircle, Settings, Smartphone, Award, ShieldCheck } from 'lucide-react';
import { GameMode, UserSettings } from '../types';
import { storage } from '../services/storage';
import { sound } from '../services/sound';
import { CircularRing } from './CircularRing';

interface HomeScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenModes: () => void;
  onOpenStats: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onOpenAndroidKit: () => void;
  settings: UserSettings;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onOpenModes,
  onOpenStats,
  onOpenTutorial,
  onOpenSettings,
  onOpenAndroidKit,
  settings,
}) => {
  const [bestScore, setBestScore] = useState(0);
  const [dailyPlayed, setDailyPlayed] = useState(false);

  useEffect(() => {
    const stats = storage.getStats();
    setBestScore(stats.bestScoreEndless);

    const todayStr = new Date().toISOString().split('T')[0];
    setDailyPlayed(stats.lastDailyDate === todayStr);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col justify-between p-5 bg-[#030804] text-white overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#00FF66]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#00FF66]/6 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR */}
      <header className="relative z-20 flex items-center justify-between pt-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse" />
          <span className="text-[11px] font-bold tracking-widest text-[#00FF66]/80 uppercase">
            SYSTEM READY
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn_android_kit"
            onClick={() => {
              sound.playTap();
              onOpenAndroidKit();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#051A0A] hover:bg-[#092B12] border border-[#00FF66]/30 text-[#00FF66] text-xs font-semibold tracking-wider transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>PLAY STORE KIT</span>
          </button>
        </div>
      </header>

      {/* CENTER HERO: LOGO & SIGNATURE RING */}
      <main className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
        <div className="relative mb-2">
          <CircularRing
            totalSegments={36}
            activeSegments={36}
            ringStatus="idle"
            glowIntensity={settings.glowIntensity}
            size={280}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-black font-display tracking-widest text-white text-glow-white uppercase"
              >
                MIND LOCK
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] font-semibold tracking-widest text-[#00FF66] text-glow-green uppercase max-w-[150px] leading-tight"
              >
                TEST MEMORY. CONTROL REACTION.
              </motion.div>
            </div>
          </CircularRing>
        </div>

        {/* BEST SCORE DISPLAY */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#051A0B] border border-[#0D4018] mt-2 text-xs font-semibold tracking-wider text-emerald-300"
        >
          <Award className="w-4 h-4 text-[#00FF66]" />
          <span>BEST SCORE:</span>
          <span className="font-mono-num font-bold text-white text-glow-white">
            {bestScore.toString().padStart(5, '0')}
          </span>
        </motion.div>
      </main>

      {/* BOTTOM ACTION BUTTONS */}
      <footer className="relative z-20 space-y-3 pb-4">
        {/* MAIN PLAY BUTTON */}
        <motion.button
          id="btn_play_main"
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sound.playTap();
            onStartGame('ENDLESS');
          }}
          className="w-full py-4 rounded-2xl bg-[#00FF66] hover:bg-[#18FF74] text-black font-black font-display tracking-widest text-xl flex items-center justify-center space-x-3 box-glow-green-strong transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-black" />
          <span>PLAY NOW</span>
        </motion.button>

        {/* SECONDARY ROW 1: DAILY CHALLENGE & GAME MODES */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="btn_daily_challenge"
            onClick={() => {
              sound.playTap();
              onStartGame('DAILY');
            }}
            className="py-3 px-3 rounded-xl bg-[#061C0B] hover:bg-[#0A2F13] border border-[#114F21] flex items-center justify-center space-x-2 text-xs font-bold font-display tracking-wider text-white transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#00FF66]" />
            <div className="flex flex-col text-left">
              <span>DAILY LOCK</span>
              <span className="text-[9px] text-[#00FF66]/70 uppercase">
                {dailyPlayed ? 'COMPLETED' : "TODAY'S SEED"}
              </span>
            </div>
          </button>

          <button
            id="btn_game_modes"
            onClick={() => {
              sound.playTap();
              onOpenModes();
            }}
            className="py-3 px-3 rounded-xl bg-[#061C0B] hover:bg-[#0A2F13] border border-[#114F21] flex items-center justify-center space-x-2 text-xs font-bold font-display tracking-wider text-white transition-colors"
          >
            <Layers className="w-4 h-4 text-[#00FF66]" />
            <div className="flex flex-col text-left">
              <span>ALL MODES</span>
              <span className="text-[9px] text-neutral-400 uppercase">5 CHALLENGES</span>
            </div>
          </button>
        </div>

        {/* SECONDARY ROW 2: STATS, HOW TO PLAY, SETTINGS */}
        <div className="grid grid-cols-3 gap-2">
          <button
            id="btn_stats"
            onClick={() => {
              sound.playTap();
              onOpenStats();
            }}
            className="py-2.5 rounded-xl bg-[#041407] hover:bg-[#07240D] border border-[#0B3314] flex flex-col items-center justify-center space-y-1 text-[10px] font-bold tracking-wider text-neutral-300 transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-[#00FF66]" />
            <span>STATS</span>
          </button>

          <button
            id="btn_how_to_play"
            onClick={() => {
              sound.playTap();
              onOpenTutorial();
            }}
            className="py-2.5 rounded-xl bg-[#041407] hover:bg-[#07240D] border border-[#0B3314] flex flex-col items-center justify-center space-y-1 text-[10px] font-bold tracking-wider text-neutral-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#00FF66]" />
            <span>HOW TO PLAY</span>
          </button>

          <button
            id="btn_settings"
            onClick={() => {
              sound.playTap();
              onOpenSettings();
            }}
            className="py-2.5 rounded-xl bg-[#041407] hover:bg-[#07240D] border border-[#0B3314] flex flex-col items-center justify-center space-y-1 text-[10px] font-bold tracking-wider text-neutral-300 transition-colors"
          >
            <Settings className="w-4 h-4 text-[#00FF66]" />
            <span>SETTINGS</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

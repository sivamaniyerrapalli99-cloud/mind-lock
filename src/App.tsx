/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { GameMode, GameScoreResult, UserSettings } from './types';
import { storage } from './services/storage';
import { sound } from './services/sound';
import { HomeScreen } from './components/HomeScreen';
import { GameBoard } from './components/GameBoard';
import { ResultScreen } from './components/ResultScreen';
import { ModesModal } from './components/ModesModal';
import { StatisticsModal } from './components/StatisticsModal';
import { TutorialModal } from './components/TutorialModal';
import { SettingsModal } from './components/SettingsModal';
import { AndroidReleaseModal } from './components/AndroidReleaseModal';

type AppScreen = 'HOME' | 'GAME' | 'RESULT';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('HOME');
  const [selectedMode, setSelectedMode] = useState<GameMode>('ENDLESS');
  const [lastGameResult, setLastGameResult] = useState<GameScoreResult | null>(null);

  // Settings & Preferences
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());

  // Modals
  const [showModes, setShowModes] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAndroidKit, setShowAndroidKit] = useState(false);

  // Auto-launch tutorial on very first launch
  useEffect(() => {
    const loadedSettings = storage.getSettings();
    setSettings(loadedSettings);
    sound.setSoundEnabled(loadedSettings.soundEnabled);
    sound.setHapticsEnabled(loadedSettings.hapticsEnabled);

    if (!loadedSettings.tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  const handleStartGame = (mode: GameMode) => {
    setSelectedMode(mode);
    setShowModes(false);
    setCurrentScreen('GAME');
  };

  const handleGameOver = (result: GameScoreResult) => {
    setLastGameResult(result);
    setCurrentScreen('RESULT');
  };

  const handlePlayAgain = () => {
    setCurrentScreen('GAME');
  };

  const handleGoHome = () => {
    setCurrentScreen('HOME');
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030804] text-white flex items-center justify-center overflow-hidden font-sans bg-cyber-grid bg-radial-vignette">
      {/* SCREEN ROUTING */}
      {currentScreen === 'HOME' && (
        <HomeScreen
          onStartGame={handleStartGame}
          onOpenModes={() => setShowModes(true)}
          onOpenStats={() => setShowStats(true)}
          onOpenTutorial={() => setShowTutorial(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenAndroidKit={() => setShowAndroidKit(true)}
          settings={settings}
        />
      )}

      {currentScreen === 'GAME' && (
        <GameBoard
          mode={selectedMode}
          settings={settings}
          onGameOver={handleGameOver}
          onExitHome={handleGoHome}
        />
      )}

      {currentScreen === 'RESULT' && lastGameResult && (
        <ResultScreen
          result={lastGameResult}
          onPlayAgain={handlePlayAgain}
          onGoHome={handleGoHome}
        />
      )}

      {/* OVERLAY MODALS */}
      <AnimatePresence>
        {showModes && (
          <ModesModal
            onClose={() => setShowModes(false)}
            onSelectMode={(mode) => handleStartGame(mode)}
          />
        )}

        {showStats && (
          <StatisticsModal onClose={() => setShowStats(false)} />
        )}

        {showTutorial && (
          <TutorialModal onClose={() => setShowTutorial(false)} />
        )}

        {showSettings && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={(newSet) => setSettings(newSet)}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showAndroidKit && (
          <AndroidReleaseModal onClose={() => setShowAndroidKit(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

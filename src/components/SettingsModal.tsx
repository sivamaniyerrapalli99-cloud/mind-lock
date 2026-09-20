import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Volume2, VolumeX, Smartphone, Eye, Sparkles, Trash2, Check } from 'lucide-react';
import { UserSettings } from '../types';
import { storage } from '../services/storage';
import { sound } from '../services/sound';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const [current, setCurrent] = useState<UserSettings>({ ...settings });
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleSound = () => {
    sound.playTap();
    const updated = { ...current, soundEnabled: !current.soundEnabled };
    setCurrent(updated);
    sound.setSoundEnabled(updated.soundEnabled);
    storage.saveSettings(updated);
    onUpdateSettings(updated);
  };

  const toggleHaptics = () => {
    sound.playTap();
    const updated = { ...current, hapticsEnabled: !current.hapticsEnabled };
    setCurrent(updated);
    sound.setHapticsEnabled(updated.hapticsEnabled);
    storage.saveSettings(updated);
    onUpdateSettings(updated);
  };

  const toggleReducedMotion = () => {
    sound.playTap();
    const updated = { ...current, reducedMotion: !current.reducedMotion };
    setCurrent(updated);
    storage.saveSettings(updated);
    onUpdateSettings(updated);
  };

  const setGlow = (intensity: 'low' | 'normal' | 'high') => {
    sound.playTap();
    const updated = { ...current, glowIntensity: intensity };
    setCurrent(updated);
    storage.saveSettings(updated);
    onUpdateSettings(updated);
  };

  const handleResetData = () => {
    sound.playTap();
    storage.resetAllData();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm rounded-2xl bg-[#041407] border border-[#0F471B] box-glow-green overflow-hidden p-5 space-y-4"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-2 border-b border-[#0C3814]">
          <h2 className="text-base font-black font-display tracking-widest text-white uppercase">
            SETTINGS
          </h2>
          <button
            id="btn_close_settings"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1 rounded-md text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTROLS LIST */}
        <div className="space-y-3 text-xs">
          {/* SOUND */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#061C0B] border border-[#0F471B]">
            <div className="flex items-center space-x-2.5">
              {current.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#00FF66]" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-500" />
              )}
              <span className="font-bold text-white">SOUND EFFECTS</span>
            </div>
            <button
              id="btn_toggle_sound"
              onClick={toggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                current.soundEnabled ? 'bg-[#00FF66]' : 'bg-[#0D2E14]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  current.soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* HAPTICS */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#061C0B] border border-[#0F471B]">
            <div className="flex items-center space-x-2.5">
              <Smartphone className={`w-4 h-4 ${current.hapticsEnabled ? 'text-[#00FF66]' : 'text-neutral-500'}`} />
              <span className="font-bold text-white">HAPTIC VIBRATION</span>
            </div>
            <button
              id="btn_toggle_haptics"
              onClick={toggleHaptics}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                current.hapticsEnabled ? 'bg-[#00FF66]' : 'bg-[#0D2E14]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  current.hapticsEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* REDUCED MOTION */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#061C0B] border border-[#0F471B]">
            <div className="flex items-center space-x-2.5">
              <Eye className={`w-4 h-4 ${current.reducedMotion ? 'text-[#00FF66]' : 'text-neutral-500'}`} />
              <span className="font-bold text-white">REDUCED MOTION</span>
            </div>
            <button
              id="btn_toggle_reduced_motion"
              onClick={toggleReducedMotion}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                current.reducedMotion ? 'bg-[#00FF66]' : 'bg-[#0D2E14]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  current.reducedMotion ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* NEON GLOW INTENSITY */}
          <div className="p-3 rounded-xl bg-[#061C0B] border border-[#0F471B] space-y-2">
            <div className="flex items-center space-x-2 text-white font-bold">
              <Sparkles className="w-4 h-4 text-[#00FF66]" />
              <span>NEON BLOOM INTENSITY</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(['low', 'normal', 'high'] as const).map((level) => (
                <button
                  key={level}
                  id={`btn_glow_${level}`}
                  onClick={() => setGlow(level)}
                  className={`py-1.5 rounded-lg font-bold font-display uppercase tracking-wider text-[10px] transition-all ${
                    current.glowIntensity === level
                      ? 'bg-[#00FF66] text-black shadow-[0_0_10px_#00FF66]'
                      : 'bg-[#041407] border border-[#0C3814] text-neutral-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* RESET DATA */}
          <div className="pt-2">
            {showConfirmReset ? (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-center space-y-2">
                <p className="text-[11px] text-red-200 font-semibold">
                  Erase all high scores, stats and daily streaks?
                </p>
                <div className="flex space-x-2">
                  <button
                    id="btn_confirm_reset"
                    onClick={handleResetData}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700"
                  >
                    CONFIRM RESET
                  </button>
                  <button
                    id="btn_cancel_reset"
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-[#061C0B] border border-[#0F471B] text-white text-xs"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="btn_open_reset_confirm"
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 rounded-xl border border-red-900/50 hover:border-red-600 bg-red-950/20 text-red-400 text-xs font-bold tracking-wider flex items-center justify-center space-x-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>RESET ALL SAVED DATA</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

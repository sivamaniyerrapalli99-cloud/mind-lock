import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check, Smartphone, ShieldCheck, FileText, Code2, Download } from 'lucide-react';
import { sound } from '../services/sound';

interface AndroidReleaseModalProps {
  onClose: () => void;
}

export const AndroidReleaseModal: React.FC<AndroidReleaseModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'LISTING' | 'SAFETY' | 'PRIVACY' | 'KOTLIN_CODE'>('LISTING');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    sound.playTap();
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const storeListing = {
    title: "MIND LOCK",
    shortDescription: "A simple brain challenge that tests memory, focus and reaction.",
    category: "Puzzle / Brain Training",
    targetAudience: "Everyone (PEGI 3 / ESRB Everyone)",
    tags: "Brain Training, Memory Game, Reaction Test, Attention, Minimalist Puzzle, Offline Games",
    fullDescription: `MIND LOCK is an original, minimalist brain challenge designed to test short-term memory, observation, simple logic, and reaction control under time pressure.

Centered around a glowing circular interface, every challenge presents quick information followed by a simple question or impulse decision. 

FEATURES:
• 7 CORE COGNITIVE CATEGORIES: Short-term memory, sequence tracking, pattern comparison, node counting, impulse control, speed reaction, and logic.
• 6 GAME MODES:
  - Endless Mind Lock: Survive as long as you can with 3 lives.
  - Daily Lock: A deterministic global challenge seeded for each calendar day.
  - Quick Test: A swift 10-round cognitive checkup.
  - Time Attack: Solve maximum challenges in 60 seconds.
  - Perfect Run: 1 mistake and you're out.
  - Practice Lab: Train your brain with infinite lives.
• CIRCULAR SEGMENTED INTERFACE: Clean, dark aesthetic with 36 glowing neon green segments and tactile haptic feedback.
• 100% OFFLINE & PRIVACY-FIRST: No accounts, no personal data collection, zero network permissions required.
• PROGRESSIVE DIFFICULTY: Difficulty scales dynamically through reaction windows, sequence length, and deceptive stimuli.

Train your mind. Hold your impulse. Break your best score.`
  };

  const dataSafety = {
    dataCollected: "NO DATA COLLECTED. The app does not collect, store, or transmit any user data to external servers.",
    dataShared: "NO DATA SHARED. Zero third parties receive user information.",
    securityPractices: "Data Stored Locally: All statistics, settings, and high scores reside strictly inside the local device storage.",
    accountCreation: "No account or login required.",
    targetApi: "Android 16 (API Level 36 target)"
  };

  const privacyPolicy = `PRIVACY POLICY FOR MIND LOCK

Last Updated: September 1, 2026

1. INTRODUCTION
MIND LOCK ("the Game") is built as an offline-first cognitive puzzle application. We respect your privacy and are committed to maintaining zero data collection practices.

2. INFORMATION COLLECTION AND USE
MIND LOCK does not collect, transmit, or sell any personally identifiable information (PII). We do not collect names, email addresses, device identifiers, geolocation, contacts, or camera/microphone inputs.

3. LOCAL STORAGE
All game progression, high scores, custom settings (audio/haptic toggles), and statistics are stored solely on your local device. This data is never transferred to any remote server or third-party cloud service.

4. PERMISSIONS
The Game requires NO sensitive permissions. It operates with standard local vibration access for haptic feedback.

5. THIRD-PARTY SDKs
The current release version contains zero third-party tracking, advertising, or analytics SDKs.

6. CHILDREN'S PRIVACY
Because MIND LOCK collects no personal information whatsoever, it is fully compliant with COPPA and global child privacy regulations.

7. CONTACT
For any privacy inquiries regarding MIND LOCK, contact: support@mindlockgame.com`;

  const kotlinCode = `// MainActivity.kt — Jetpack Compose Android 16 (API 36) Implementation
package com.mindlock.game

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MindLockTheme {
                MindLockGameScreen()
            }
        }
    }
}

@Composable
fun MindLockGameScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF030804)),
        contentAlignment = Alignment.Center
    ) {
        // 36 Segmented Ring Rendering
        Canvas(modifier = Modifier.size(300.dp)) {
            val radius = size.minDimension / 2 * 0.85f
            val strokeWidth = 14f
            val segments = 36
            val gapDeg = 2.5f
            val sweepDeg = (360f / segments) - gapDeg

            for (i in 0 until segments) {
                val startAngle = i * (360f / segments) - 90f
                drawArc(
                    color = Color(0xFF00FF66),
                    startAngle = startAngle,
                    sweepAngle = sweepDeg,
                    useCenter = false,
                    style = Stroke(width = strokeWidth)
                )
            }
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = "MIND LOCK", color = Color.White, fontSize = 28.sp)
            Text(text = "REMEMBER: 74", color = Color(0xFF00FF66), fontSize = 16.sp)
        }
    }
}

@Composable
fun MindLockTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF00FF66),
            background = Color(0xFF030804),
            surface = Color(0xFF061C0B)
        ),
        content = content
    )
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-[#041407] border border-[#0F471B] box-glow-green overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-[#0C3814]">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-[#00FF66]" />
            <h2 className="text-base font-black font-display tracking-widest text-white uppercase">
              GOOGLE PLAY RELEASE KIT
            </h2>
          </div>
          <button
            id="btn_close_android_kit"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-1 rounded-md text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-[#020B04] border-b border-[#0C3814] text-[10px] font-bold font-display">
          <button
            id="tab_listing"
            onClick={() => setActiveTab('LISTING')}
            className={`py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              activeTab === 'LISTING'
                ? 'bg-[#00FF66] text-black font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            STORE
          </button>
          <button
            id="tab_safety"
            onClick={() => setActiveTab('SAFETY')}
            className={`py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              activeTab === 'SAFETY'
                ? 'bg-[#00FF66] text-black font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            SAFETY
          </button>
          <button
            id="tab_privacy"
            onClick={() => setActiveTab('PRIVACY')}
            className={`py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              activeTab === 'PRIVACY'
                ? 'bg-[#00FF66] text-black font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            POLICY
          </button>
          <button
            id="tab_kotlin"
            onClick={() => setActiveTab('KOTLIN_CODE')}
            className={`py-1.5 rounded-lg uppercase tracking-wider transition-all ${
              activeTab === 'KOTLIN_CODE'
                ? 'bg-[#00FF66] text-black font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ANDROID
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {activeTab === 'LISTING' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white uppercase">STORE METADATA</span>
                <button
                  id="btn_copy_listing"
                  onClick={() =>
                    copyToClipboard(
                      `APP NAME: ${storeListing.title}\nSHORT DESCRIPTION: ${storeListing.shortDescription}\nCATEGORY: ${storeListing.category}\nTAGS: ${storeListing.tags}\n\nFULL DESCRIPTION:\n${storeListing.fullDescription}`,
                      'listing'
                    )
                  }
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#061C0B] border border-[#0F471B] text-[#00FF66] text-[10px]"
                >
                  {copiedKey === 'listing' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'listing' ? 'COPIED' : 'COPY ALL'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#061C0B] border border-[#0F471B] space-y-2">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold">APP NAME:</span>
                  <div className="text-sm font-bold text-white font-display">{storeListing.title}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold">SHORT DESCRIPTION:</span>
                  <div className="text-xs text-neutral-200">{storeListing.shortDescription}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold">FULL STORE DESCRIPTION:</span>
                  <pre className="text-[11px] text-neutral-300 font-sans whitespace-pre-wrap mt-1 leading-relaxed bg-[#030E05] p-2.5 rounded border border-[#0B3314]">
                    {storeListing.fullDescription}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SAFETY' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
                <span>GOOGLE PLAY DATA SAFETY DECLARATION</span>
              </div>
              <div className="p-3 rounded-xl bg-[#061C0B] border border-[#0F471B] space-y-2.5 text-neutral-200">
                <div className="p-2 rounded bg-[#030E05] border border-[#0A2E12]">
                  <span className="text-[10px] text-[#00FF66] font-bold block">DATA COLLECTION</span>
                  <span>{dataSafety.dataCollected}</span>
                </div>
                <div className="p-2 rounded bg-[#030E05] border border-[#0A2E12]">
                  <span className="text-[10px] text-[#00FF66] font-bold block">DATA SHARING</span>
                  <span>{dataSafety.dataShared}</span>
                </div>
                <div className="p-2 rounded bg-[#030E05] border border-[#0A2E12]">
                  <span className="text-[10px] text-[#00FF66] font-bold block">SECURITY & COMPLIANCE</span>
                  <span>{dataSafety.securityPractices}</span>
                </div>
                <div className="p-2 rounded bg-[#030E05] border border-[#0A2E12]">
                  <span className="text-[10px] text-[#00FF66] font-bold block">TARGET API LEVEL</span>
                  <span>{dataSafety.targetApi}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PRIVACY' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white uppercase">OFFLINE PRIVACY POLICY</span>
                <button
                  id="btn_copy_privacy"
                  onClick={() => copyToClipboard(privacyPolicy, 'privacy')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#061C0B] border border-[#0F471B] text-[#00FF66] text-[10px]"
                >
                  {copiedKey === 'privacy' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'privacy' ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <pre className="text-[11px] text-neutral-300 font-mono whitespace-pre-wrap bg-[#030E05] p-3 rounded-xl border border-[#0B3314] leading-relaxed max-h-80 overflow-y-auto">
                {privacyPolicy}
              </pre>
            </div>
          )}

          {activeTab === 'KOTLIN_CODE' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white uppercase">KOTLIN / COMPOSE ARCHITECTURE</span>
                <button
                  id="btn_copy_kotlin"
                  onClick={() => copyToClipboard(kotlinCode, 'kotlin')}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#061C0B] border border-[#0F471B] text-[#00FF66] text-[10px]"
                >
                  {copiedKey === 'kotlin' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'kotlin' ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
              <pre className="text-[10px] text-emerald-300 font-mono whitespace-pre-wrap bg-[#030E05] p-3 rounded-xl border border-[#0B3314] leading-relaxed max-h-80 overflow-y-auto">
                {kotlinCode}
              </pre>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

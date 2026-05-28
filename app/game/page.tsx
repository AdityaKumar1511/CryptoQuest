"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useGameStore } from "@/src/store/useGameStore";
import { synthSound } from "@/src/utils/audio";
import TerminalConsole from "@/src/components/TerminalConsole";
import InteractionZone from "@/src/components/InteractionZone";
import ToolWrapper from "@/src/components/CyberLab/ToolWrapper";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Clipboard,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GamePage() {
  const {
    levels,
    currentLevelIndex,
    score,
    hintsUsed,
    isMuted,
    isLoading,
    hasFailed,
    isGameCompleted,
    toggleMute,
    resetGame,
    fetchLevels
  } = useGameStore();

  const [copiedChallenge, setCopiedChallenge] = useState(false);

  // Fetch levels from Supabase (or fallback) on load
  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const currentLevel = levels[currentLevelIndex];
  const levelNumDisplay = String(currentLevelIndex + 1).padStart(2, "0");
  const totalLevelsDisplay = String(levels.length).padStart(2, "0");

  const handleCopyChallenge = () => {
    const text = `🏆 CryptoQuest OS - Mission Accomplished!
🔓 Levels Cleared: ${levels.length}/${levels.length}
🔥 Final Score: ${score}
💡 Hints Used: ${hintsUsed}
Can you crack the code faster?
Play CryptoQuest now!`;
    navigator.clipboard.writeText(text);
    setCopiedChallenge(true);
    synthSound.playSuccess();
    setTimeout(() => setCopiedChallenge(false), 2000);
  };

  const handleMuteClick = () => {
    toggleMute();
  };

  return (
    <div className="min-h-screen h-screen w-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono relative overflow-hidden select-none">
      {/* Background Matrix/Grid Aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0e_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0e_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-20" />
      <div className="absolute inset-0 bg-radial-gradient from-emerald-500/[0.015] via-transparent to-transparent pointer-events-none" />

      {/* Cyberpunk Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,16,16,0)+50%,rgba(0,0,0,0.15)+50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />

      {/* OS Header Panel */}
      <header className="h-14 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-6 z-20 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div
              onClick={() => synthSound.playClick()}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">TERMINATE_SESSION</span>
            </div>
          </Link>
          <div className="h-4 w-px bg-zinc-900 hidden sm:block" />
          <span className="text-emerald-400 font-bold text-xs tracking-widest uppercase hidden md:inline-block">
            🕵️‍♂️ CRYPTOQUEST_OS v1.07
          </span>
        </div>

        {/* Global Stats */}
        {!isGameCompleted && !hasFailed && (
          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <div className="flex gap-2">
              <span className="text-zinc-600">LEVEL:</span>
              <span className="text-emerald-400 font-bold tracking-wider">
                {levelNumDisplay}/{totalLevelsDisplay}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-zinc-600">SCORE:</span>
              <span className="text-amber-400 font-bold tracking-wider">{score}</span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              synthSound.playClick();
              if (confirm("Reset current mission progress?")) {
                resetGame();
              }
            }}
            className="p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
            title="Reset Mission Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMuteClick}
            className="p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
            title={isMuted ? "Unmute audio feedback" : "Mute audio feedback"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main content grid */}
      <main className="flex-1 min-h-0 relative z-10 p-4">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-30">
            <span className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="font-mono text-xs text-emerald-400 animate-pulse tracking-wider">
              FETCHINGSECURE_LEVEL_LOGS...
            </span>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {/* 1. FAILURE SCREEN */}
          {hasFailed && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-4 z-20 bg-zinc-950/95 border border-red-500/30 rounded flex flex-col items-center justify-center p-6 text-center shadow-[0_0_30px_rgba(239,68,68,0.05)]"
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-red-500" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-red-500" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-red-500" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-red-500" />

              <AlertTriangle className="w-16 h-16 text-red-500 animate-bounce mb-4" />
              <h2 className="text-xl font-bold text-red-500 tracking-widest uppercase mb-2">
                SYSTEM LOCKOUT INITIATED
              </h2>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed mb-6 font-mono">
                CRITICAL WARNING: The alert countdown reached zero. Network intrusion detection has isolated
                your workstation node. Encryption keys are purged.
              </p>
              
              <button
                onClick={resetGame}
                className="px-6 py-2.5 border border-red-500/40 bg-red-500/10 text-red-400 rounded font-bold text-xs tracking-widest uppercase hover:bg-red-500/25 transition-all cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.1)] active:scale-95"
              >
                REBOOT WORKSTATION
              </button>
            </motion.div>
          )}

          {/* 2. VICTORY SCREEN */}
          {isGameCompleted && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-4 z-20 bg-zinc-950/95 border border-emerald-500/30 rounded flex flex-col items-center justify-center p-6 text-center shadow-[0_0_30px_rgba(16,185,129,0.05)]"
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-emerald-500" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-emerald-500" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-emerald-500" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-emerald-500" />

              <ShieldCheck className="w-16 h-16 text-emerald-400 animate-pulse mb-4" />
              <h2 className="text-xl font-bold text-emerald-400 tracking-widest uppercase mb-2">
                MISSION ACCOMPLISHED // SYSTEM EXFILTRATED
              </h2>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed mb-6 font-mono">
                Excellent work, Agent. All cryptographic gateways have been decrypted and bypassed. The target
                database is fully secured. Decrypted telemetry has been routed to headquarters.
              </p>

              {/* Copy Challenge Panel */}
              <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded p-4 mb-6 text-left relative overflow-hidden">
                <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono tracking-wider mb-2">
                  <span>DAILY CHALLENGE EXPORTED STATS</span>
                  <button
                    onClick={handleCopyChallenge}
                    className="text-zinc-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>{copiedChallenge ? "COPIED" : "COPY_STATS"}</span>
                  </button>
                </div>
                <pre className="text-[11px] text-emerald-400 font-bold leading-normal font-mono select-all">
                  🏆 CryptoQuest OS - Mission Accomplished!{"\n"}
                  🔓 Levels Cleared: {levels.length}/{levels.length}{"\n"}
                  🔥 Final Score: {score}{"\n"}
                  💡 Hints Used: {hintsUsed}
                </pre>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 rounded font-bold text-xs tracking-widest uppercase hover:bg-emerald-500/25 transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.1)] active:scale-95"
                >
                  REPLAY MISSION
                </button>
                <Link href="/">
                  <button
                    onClick={() => synthSound.playClick()}
                    className="px-6 py-2.5 border border-zinc-800 bg-zinc-900/40 text-zinc-300 rounded font-bold text-xs tracking-widest uppercase hover:bg-zinc-900 transition-all cursor-pointer active:scale-95"
                  >
                    RETURN TO ROOT
                  </button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* 3. CORE 3-PANEL INTERFACE */}
          {!hasFailed && !isGameCompleted && (
            <motion.div
              key="gameplay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex flex-col md:flex-row gap-4"
            >
              {/* PANEL 1: MISSION CONSOLE (40% Width) */}
              <div className="flex-1 md:flex-[4] h-full min-h-0">
                <TerminalConsole />
              </div>

              {/* PANEL 2: INTERACTION ZONE (30% Width) */}
              <div className="flex-1 md:flex-[3] h-full min-h-0">
                <InteractionZone />
              </div>

              {/* PANEL 3: THE CYBER LAB (30% Width) */}
              <div className="flex-1 md:flex-[3] h-full min-h-0">
                <ToolWrapper />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useGameStore } from "@/src/store/useGameStore";
import { synthSound } from "@/src/utils/audio";
import { Terminal, Shield, Play, HelpCircle, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { isMuted, toggleMute, resetGame } = useGameStore();
  const [bootStep, setBootStep] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  const bootLogs = [
    "INITIALIZING CRYPTOQUEST_OS v1.07...",
    "ESTABLISHING SECURE CONNECTION TO AGENCY SHADOW_NET...",
    "LOADING DECRYPTION MODULES (CAESAR, HEX, VIGENERE)... SUCCESS",
    "VERIFYING FIREWALL BYPASS STRATEGY... ACTIVE",
    "DECRYPTING MISSION BRIEFING PARAMETERS...",
    "AGENT ACCESS LEVEL: CERTIFIED [LEVEL_9]",
    "SYSTEM STATUS: ONLINE. READY FOR INFILTRATION."
  ];

  // Simulating a boot loading sequence
  useEffect(() => {
    if (bootStep < bootLogs.length) {
      const timeout = setTimeout(() => {
        setBootStep((prev) => prev + 1);
        synthSound.playKeyPress();
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [bootStep]);

  const handleStartClick = () => {
    synthSound.playUnlock();
    resetGame(); // reset progress
  };

  const handleInstructionsToggle = () => {
    setShowInstructions(!showInstructions);
    synthSound.playClick();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-mono p-4 relative overflow-hidden select-none">
      {/* Background Matrix/Grid Aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />
      <div className="absolute inset-0 bg-radial-gradient from-emerald-500/[0.03] via-transparent to-transparent pointer-events-none" />

      {/* Cyberpunk Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,16,16,0)+50%,rgba(0,0,0,0.2)+50%)] bg-[size:100%_4px] pointer-events-none opacity-30 animate-pulse" />

      {/* Settings bar */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => {
            toggleMute();
          }}
          className="p-2 border border-zinc-800 rounded bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-emerald-400 cursor-pointer transition-colors"
          title={isMuted ? "Unmute sound synthesis" : "Mute sound synthesis"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-2xl bg-zinc-950/80 border border-zinc-900 rounded p-6 shadow-2xl relative z-10 space-y-8 backdrop-blur-sm">
        {/* Border corner markers */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-emerald-500" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-emerald-500" />
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-emerald-500" />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-emerald-500" />

        {/* Title */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldAlert className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-widest text-emerald-400 relative">
              CRYPTOQUEST_OS
              <span className="absolute -top-2 -right-4 text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">
                v1.07
              </span>
            </h1>
          </motion.div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Tactical Cryptographic Hack Simulator
          </p>
        </div>

        {/* Boot Terminal Log Output */}
        <div className="bg-zinc-950 border border-zinc-900 rounded p-4 h-48 flex flex-col justify-start text-[11px] text-emerald-500/90 leading-relaxed overflow-hidden font-mono shadow-inner">
          <div className="space-y-1">
            {bootLogs.slice(0, bootStep).map((log, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-emerald-700">~</span>
                <span>{log}</span>
              </div>
            ))}
            {bootStep < bootLogs.length ? (
              <div className="flex items-center gap-1">
                <span className="text-emerald-700 animate-pulse">&gt;</span>
                <span className="h-3 w-1.5 bg-emerald-500 animate-pulse" />
              </div>
            ) : null}
          </div>
        </div>

        {/* Buttons / Actions */}
        {bootStep >= bootLogs.length && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 items-center"
          >
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link href="/game" className="flex-1 max-w-xs">
                <button
                  onClick={handleStartClick}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 rounded font-bold text-xs tracking-widest uppercase cursor-pointer transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <Play className="w-4 h-4" />
                  <span>START MISSION</span>
                </button>
              </Link>
              <button
                onClick={handleInstructionsToggle}
                className="flex-1 max-w-xs flex items-center justify-center gap-2 py-3 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded font-bold text-xs tracking-widest uppercase cursor-pointer transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                <span>INSTRUCTIONS</span>
              </button>
            </div>

            {/* Instruction Panel */}
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border border-zinc-900 bg-zinc-900/20 p-4 rounded text-left text-[11px] text-zinc-400 leading-relaxed space-y-2 mt-2 w-full"
              >
                <div className="text-emerald-400 font-bold border-b border-zinc-900 pb-1.5 uppercase tracking-wider text-xs">
                  MISSION INTELLIGENCE BREIFING
                </div>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                  <li>
                    <strong className="text-zinc-200">The Console:</strong> Watch the Left Panel logs for level briefing. Decrypt the glowing intercepted block.
                  </li>
                  <li>
                    <strong className="text-zinc-200">The Cyber Lab:</strong> Use the sliders, hex lookup matrices, and key parameters in the Right Panel to reverse the encryption.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Submit:</strong> Insert the correct decrypted text in the Middle Panel to pass the lock.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Tension:</strong> A 5-minute security alert counter ticks down on each level. Running out of time triggers network lockouts.
                  </li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <div className="absolute bottom-4 text-[9px] text-zinc-700 tracking-wider">
        SECURE TERMINAL LOGOUT // AGENCY SECURITY COMPLIANT
      </div>
    </div>
  );
}

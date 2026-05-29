"use client";

import React from "react";
import { Wrench, Terminal, Cpu, Radar, Shield, ShieldAlert, ChevronRight, Binary, Activity, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";
import { useGameStore } from "@/src/store/useGameStore";

interface ModeSelectionProps {
  onSelectMode: (mode: "tutorial" | "story") => void;
}

export default function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const { isMuted, toggleMute } = useGameStore();

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center font-mono overflow-hidden p-6 selection:bg-emerald-500/30 select-none">
      
      {/* BACKGROUND GRAPHICS & RETRO TERMINAL SCANLINES */}
      {/* 1. Cyberpunk grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0e_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0e_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />
      
      {/* 2. Pulsing scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none opacity-40 z-10" />
      
      {/* 3. Radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(6,182,212,0.03)_0%,transparent_60%)] pointer-events-none" />

      {/* FIXED RETRO HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-black/80 backdrop-blur-md border-b border-zinc-900 py-3 px-6 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
        {/* Terminal Scanline overlay inside header */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.03)_0%,transparent_100%)] pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
            CryptoQuest OS Terminal v2.0.26
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-6 text-[10px] text-zinc-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5 hidden md:flex">
            <span className="text-zinc-700">SYS_SEC:</span>
            <span className="text-emerald-500">ENCRYPTED</span>
          </div>
          <div className="flex items-center gap-1.5 hidden md:flex">
            <span className="text-zinc-700">NET_STAT:</span>
            <span className="text-cyan-400">SECURE_LINK</span>
          </div>
          
          {/* Mute Toggle */}
          <button
            onClick={() => toggleMute()}
            className="p-1.5 border border-zinc-800 rounded bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-emerald-400 cursor-pointer transition-colors"
            title={isMuted ? "Unmute sound synthesis" : "Mute sound synthesis"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-12 z-20 mt-16 pb-8">
        
        {/* TITLE SECTION */}
        <div className="text-center space-y-3 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3"
          >
            <Shield className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse" />
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-[0.3em] bg-gradient-to-r from-emerald-400 via-zinc-200 to-cyan-400 bg-clip-text text-transparent">
              SELECT OPERATION MODE
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[11px] md:text-xs text-zinc-500 tracking-wider leading-relaxed"
          >
            Prepare your terminal. Establish baseline parameters or engage in live-fire story operations. Decryption protocols await authorization.
          </motion.p>
        </div>

        {/* TWO LARGE INTERACTIVE MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4 md:px-0">
          
          {/* MODULE 1: TOOL TRAINING (TUTORIAL MODE) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.015, y: -4 }}
            className="group relative cursor-pointer flex flex-col justify-between h-[450px] bg-zinc-950/70 border-2 border-emerald-500/20 hover:border-emerald-500/60 rounded-lg p-6 md:p-8 transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.7)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
            onClick={() => onSelectMode("tutorial")}
          >
            {/* Embedded glowing ring effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Corner retro bracket accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />

            {/* Glowing Accent Ring (Backlight) */}
            <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-emerald-500/30 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity blur duration-1000 -z-10" />

            {/* TOP CARD CONTENT */}
            <div className="space-y-6">
              {/* Header inside Card */}
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                    <Wrench className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400 group-hover:text-emerald-300 transition-colors">
                      TOOL TRAINING
                    </h3>
                    <p className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-mono">
                      Safe Testing Grid
                    </p>
                  </div>
                </div>
                
                <span className="text-[9px] font-mono px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/5 text-emerald-400/80 rounded uppercase tracking-wider">
                  SANDBOX
                </span>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-zinc-200 text-sm font-semibold tracking-wide">
                  🔧 Sandbox Simulator & Practice Lab
                </h4>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                  Welcome to the agency&apos;s isolated firing range. This sandbox playground is specifically configured to test your decryption scripts and cryptographic tools without any countdown penalties, network lockout risks, or severe stress scenarios.
                </p>
              </div>

              {/* Interactive High-Tech Simulation Grid inside Tutorial Card */}
              <div className="bg-zinc-950 border border-emerald-500/10 rounded p-4 h-32 flex flex-col justify-between font-mono text-[10px] text-emerald-400/70 overflow-hidden relative group-hover:border-emerald-500/30 transition-colors">
                <div className="absolute right-2 top-2 text-[8px] text-emerald-500/40 uppercase tracking-widest flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 animate-pulse" />
                  <span>MATRIX_READY</span>
                </div>
                
                <div className="space-y-1 select-none">
                  <div className="flex gap-2">
                    <span className="text-emerald-600/50">&gt;</span>
                    <span className="text-emerald-400 font-bold">INIT_SANDBOX_DECRYPT()</span>
                  </div>
                  <div className="flex gap-2 text-emerald-500/50">
                    <span className="text-emerald-600/50">&gt;</span>
                    <span>No active alert timer detected. Sandbox bypass active.</span>
                  </div>
                  <div className="flex gap-2 text-zinc-500">
                    <span className="text-emerald-600/50">&gt;</span>
                    <span>KEY: 0x4F92A &rarr; CIPHER: [HEX DECRYPT READY]</span>
                  </div>
                </div>
                
                <div className="border-t border-emerald-500/10 pt-2 flex items-center justify-between text-[9px] text-emerald-500/50">
                  <span>PENALTY SCORE: 0.00%</span>
                  <span className="text-emerald-400 font-bold animate-pulse">NO_LOCKOUT_SECURED</span>
                </div>
              </div>
            </div>

            {/* BUTTON / CTA */}
            <div className="pt-6">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/40 group-hover:border-emerald-500 text-emerald-400 group-hover:text-white rounded font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span>INITIALIZE TRAINING GRID</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* MODULE 2: CAMPAIGN OPERATIONS (STORY MODE) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            whileHover={{ scale: 1.015, y: -4 }}
            className="group relative cursor-pointer flex flex-col justify-between h-[450px] bg-zinc-950/70 border-2 border-cyan-500/20 hover:border-cyan-500/60 rounded-lg p-6 md:p-8 transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.7)] hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
            onClick={() => onSelectMode("story")}
          >
            {/* Embedded glowing ring effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Corner retro bracket accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500 opacity-40 group-hover:opacity-100 transition-opacity" />

            {/* Glowing Accent Ring (Backlight) */}
            <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-cyan-500/30 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity blur duration-1000 -z-10" />

            {/* TOP CARD CONTENT */}
            <div className="space-y-6">
              {/* Header inside Card */}
              <div className="flex items-center justify-between border-b border-cyan-500/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/25 rounded text-cyan-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                    <Radar className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      CAMPAIGN OPERATIONS
                    </h3>
                    <p className="text-[9px] text-cyan-500/60 uppercase tracking-widest font-mono">
                      Multi-Stage Deployment
                    </p>
                  </div>
                </div>
                
                <span className="text-[9px] font-mono px-2 py-0.5 border border-cyan-500/30 bg-cyan-500/5 text-cyan-400/80 rounded uppercase tracking-wider">
                  CLASSIFIED
                </span>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-zinc-200 text-sm font-semibold tracking-wide">
                  🎬 Immersive Real-Time Field Assignment
                </h4>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                  Engage in an immersive, multi-stage tactical hack operation. Navigate high-pressure network blocks complete with active security alert sirens, decryption forensic modules, and real-time network back-tracing arrays.
                </p>
              </div>

              {/* Interactive Visual Radar/Forensics Simulation Grid inside Campaign Card */}
              <div className="bg-zinc-950 border border-cyan-500/10 rounded p-4 h-32 flex items-center justify-between font-mono text-[10px] text-cyan-400/70 overflow-hidden relative group-hover:border-cyan-500/30 transition-colors">
                
                <div className="space-y-1 select-none flex-1">
                  <div className="flex items-center gap-1.5 text-rose-500 font-bold animate-pulse text-[9px] mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>SIREN_ALERT_TIMER_ACTIVE</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-cyan-600/50">&gt;</span>
                    <span>SECURE CORRUPT NODES: 5/5</span>
                  </div>
                  <div className="flex gap-2 text-cyan-500/50">
                    <span className="text-cyan-600/50">&gt;</span>
                    <span>RADAR_SWEEP: [COMPROMISED]</span>
                  </div>
                </div>

                {/* Rotating Cyber Radar Array */}
                <div className="relative w-20 h-20 flex items-center justify-center border border-cyan-500/20 rounded-full bg-cyan-950/10 ml-2">
                  <div className="absolute inset-2 border border-cyan-500/10 rounded-full" />
                  <div className="absolute inset-4 border border-cyan-500/5 rounded-full" />
                  
                  {/* Radar sweep hand */}
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent to-cyan-400/60 origin-center animate-spin-radar" />
                  
                  {/* Blip dots */}
                  <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <div className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* BUTTON / CTA */}
            <div className="pt-6">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/40 group-hover:border-cyan-500 text-cyan-400 group-hover:text-white rounded font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.05)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <span>AUTHORIZE STORY OPERATIONS</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

        </div>

        {/* COMPLIANCE FOOTER */}
        <div className="text-[10px] text-zinc-600 uppercase tracking-widest text-center mt-4">
          🔓 AGENCY DECRYPTION HANDBOOK IN USE // CONFIDENTIAL CLASSIFICATION-4
        </div>

      </div>

      {/* ADDITIONAL STYLES FOR THE ANIMATIONS AND DESIGN */}
      <style jsx global>{`
        @keyframes spin-radar {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-radar {
          animation: spin-radar 4s linear infinite;
        }
        .animate-spin-slow {
          animation: spin-radar 12s linear infinite;
        }
      `}</style>
    </div>
  );
}

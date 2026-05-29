"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Radio, RefreshCw } from "lucide-react";
import { synthSound } from "@/src/utils/audio";

export default function CctvFilter() {
  const [red, setRed] = useState<boolean>(false);
  const [green, setGreen] = useState<boolean>(false);
  const [blue, setBlue] = useState<boolean>(false);

  const handleToggle = (channel: "red" | "green" | "blue") => {
    synthSound.playClick?.();
    if (channel === "red") setRed(!red);
    if (channel === "green") setGreen(!green);
    if (channel === "blue") setBlue(!blue);
  };

  const isGreenOnly = green && !red && !blue;

  return (
    <div className="h-full flex flex-col bg-zinc-950 border border-zinc-900 rounded p-4 relative overflow-hidden select-none font-mono">
      {/* Corner Bracket Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/50" />

      {/* Grid Scanline CRT feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.02)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
            FORENSIC_CCTV_SCREEN // MISSION_3
          </span>
        </div>
        <Radio className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
      </div>

      <div className="text-[10px] text-zinc-500 mb-3 uppercase tracking-wider">
        Isolate the green matrix frequency channel to restore corrupt CCTV feeds.
      </div>

      {/* Aspect-Ratio Locked Terminal Viewport */}
      <div 
        className={`flex-1 bg-black border border-zinc-900 rounded relative overflow-hidden flex flex-col justify-center items-center transition-all duration-500 min-h-[140px] ${
          isGreenOnly ? "border-emerald-500/40 bg-emerald-950/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]" : ""
        }`}
      >
        {/* Dynamic CCTV Screen Overlays */}
        {red && <div className="absolute inset-0 bg-rose-500/10 pointer-events-none transition-opacity duration-300 mix-blend-screen" />}
        {green && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none transition-opacity duration-300 mix-blend-screen" />}
        {blue && <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none transition-opacity duration-300 mix-blend-screen" />}

        {/* Static Static/Noise overlay when no correct filters applied */}
        {!isGreenOnly && (
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)] pointer-events-none animate-pulse bg-repeat" />
        )}

        {/* Viewport UI lines */}
        <div className="absolute top-2 left-2 text-[8px] text-zinc-600">
          REC [CH: {red ? "R" : "_"}{green ? "G" : "_"}{blue ? "B" : "_"}]
        </div>
        <div className="absolute top-2 right-2 text-[8px] text-zinc-600">
          CAM_03B // RECOVERY_MODE
        </div>

        {/* Screen center visual: Secret Key or Static Text */}
        <div className="text-center z-10 p-4">
          {isGreenOnly ? (
            <div className="space-y-1">
              <span className="text-[8px] text-emerald-500/50 uppercase tracking-widest font-mono">
                FREQUENCY_MATCH_SUCCESS
              </span>
              <div className="text-xl md:text-2xl font-black text-emerald-400 tracking-[0.3em] font-mono drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse">
                CLYNSU
              </div>
              <span className="text-[7px] text-emerald-500/40 uppercase tracking-widest block mt-1">
                DECRYPT_KEY_RECOVERED
              </span>
            </div>
          ) : (
            <div className="space-y-1 opacity-40 flex flex-col items-center">
              <EyeOff className="w-8 h-8 text-zinc-600 animate-pulse mb-1" />
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest">
                [SIGNAL_CORRUPTED]
              </span>
              <span className="text-[7px] text-zinc-600 uppercase tracking-widest">
                Adjust channel settings below...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Button Channel Toggles */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          onClick={() => handleToggle("red")}
          className={`py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border ${
            red
              ? "bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
              : "bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400 hover:border-zinc-800"
          }`}
        >
          RED: {red ? "ON" : "OFF"}
        </button>
        <button
          onClick={() => handleToggle("green")}
          className={`py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border ${
            green
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
              : "bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400 hover:border-zinc-800"
          }`}
        >
          GREEN: {green ? "ON" : "OFF"}
        </button>
        <button
          onClick={() => handleToggle("blue")}
          className={`py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border ${
            blue
              ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              : "bg-zinc-950 border-zinc-900 text-zinc-600 hover:text-zinc-400 hover:border-zinc-800"
          }`}
        >
          BLUE: {blue ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Radar, Crosshair, HelpCircle, MapPin, Send } from "lucide-react";
import { synthSound } from "@/src/utils/audio";

export default function RadarTrack() {
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handlePing = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (latNum === 28 && lngNum === 77) {
      if (synthSound.playSuccess) synthSound.playSuccess();
      else synthSound.playClick?.();
      setIsLocked(true);
      setMessage("");
    } else {
      synthSound.playKeyPress?.();
      setIsLocked(false);
      setMessage("COORDINATES NOT BOUND // REFLEX_RETRY");
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 border border-zinc-900 rounded p-4 relative overflow-hidden select-none font-mono">
      {/* Corner Bracket Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50" />

      {/* Grid Scanline CRT feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,182,212,0.02)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
            RADAR_GRID_TRACKER // MISSION_4
          </span>
        </div>
        <Crosshair className="w-3.5 h-3.5 text-zinc-600 animate-spin-slow" />
      </div>

      {isLocked ? (
        /* Target Transponder Locked Success Screen */
        <div className="flex-1 bg-emerald-950/20 border border-emerald-500/40 rounded p-4 flex flex-col justify-center items-center relative overflow-hidden animate-pulse select-none min-h-[140px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_100%)]" />
          
          <MapPin className="w-8 h-8 text-emerald-400 mb-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          
          <span className="text-[9px] text-emerald-500/80 uppercase tracking-widest font-bold font-mono">
            SUCCESS_TELEMETRY_LINKED
          </span>
          <h4 className="text-sm font-black text-emerald-400 tracking-wider text-center uppercase font-mono mt-1">
            TARGET TRANSPONDER LOCKED
          </h4>

          <div className="mt-4 bg-zinc-950/90 border border-emerald-500/30 px-4 py-2 rounded text-center">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest block font-mono">
              CIPHER_EXPOSED
            </span>
            <span className="text-base font-black text-emerald-400 tracking-[0.25em] font-mono">
              SKYFALL
            </span>
          </div>

          <button
            onClick={() => {
              synthSound.playClick?.();
              setIsLocked(false);
              setLat("");
              setLng("");
            }}
            className="mt-4 text-[9px] text-zinc-500 hover:text-zinc-300 font-mono tracking-widest uppercase underline cursor-pointer"
          >
            DISCONNECT_TRANS
          </button>
        </div>
      ) : (
        /* Tracking Coordinates Input Screen */
        <div className="flex-1 flex flex-col justify-between min-h-[140px]">
          <div className="text-[10px] text-zinc-500 mb-3 uppercase tracking-wider">
            Enter target GPS coordinates. Hint: Check Drone Metadata offsets.
          </div>

          {/* Coordinate Inputs */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase tracking-widest block">
                Latitude (LAT)
              </label>
              <input
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="e.g. 28"
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-cyan-500/50 font-mono transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] text-zinc-500 uppercase tracking-widest block">
                Longitude (LNG)
              </label>
              <input
                type="number"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="e.g. 77"
                className="w-full bg-zinc-950 border border-zinc-900 rounded p-2 text-xs text-zinc-300 placeholder-zinc-700 outline-none focus:border-cyan-500/50 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Error Message */}
          {message && (
            <div className="text-[9px] text-rose-500 font-bold tracking-widest mb-3 flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>{message}</span>
            </div>
          )}

          {/* Ping Button */}
          <button
            onClick={handlePing}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/40 hover:border-cyan-500 text-cyan-400 hover:text-white rounded font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_12px_rgba(6,182,212,0.05)] cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ping Grid Coordinate</span>
          </button>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between text-[9px] text-zinc-500 uppercase tracking-widest shrink-0">
        <span>Transponder Status:</span>
        <span className={`font-bold ${isLocked ? "text-emerald-400" : "text-zinc-600 animate-pulse"}`}>
          {isLocked ? "LOCKED" : "WAITING_COORDS"}
        </span>
      </div>
    </div>
  );
}

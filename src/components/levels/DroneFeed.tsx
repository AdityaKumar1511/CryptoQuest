"use client";

import React, { useState } from "react";
import { Camera, FileText, Database, ShieldAlert, Crosshair } from "lucide-react";
import { synthSound } from "@/src/utils/audio";

export default function DroneFeed() {
  const [viewMode, setViewMode] = useState<"image" | "metadata">("image");

  const handleToggle = (mode: "image" | "metadata") => {
    setViewMode(mode);
    synthSound.playClick?.();
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
          <Camera className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
            SATELLITE_LINK // MISSION_2
          </span>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex gap-1 bg-zinc-900/50 border border-zinc-800 p-0.5 rounded">
          <button
            onClick={() => handleToggle("image")}
            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              viewMode === "image"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            IMAGE
          </button>
          <button
            onClick={() => handleToggle("metadata")}
            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              viewMode === "metadata"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            METADATA
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 bg-black border border-zinc-900 rounded relative overflow-hidden flex flex-col justify-center items-center min-h-[140px]">
        {viewMode === "image" ? (
          /* Simulated Drone Viewfinder */
          <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
            {/* Viewfinder Top Stats */}
            <div className="flex justify-between text-[8px] text-cyan-400/80 font-mono">
              <span>ALT: 4,820M // VEL: 0KM/H</span>
              <span className="animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                RECORDING_STREAM
              </span>
            </div>

            {/* Viewfinder Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <Crosshair className="w-12 h-12 text-cyan-400 animate-spin-slow" />
              <div className="w-36 h-36 border border-dashed border-cyan-500/20 rounded-full absolute" />
            </div>

            {/* Visual satellite image simulation layout */}
            <div className="w-full h-full flex flex-col items-center justify-center opacity-30 mt-1.5">
              <div className="w-full flex items-center justify-between px-10 text-[9px] text-zinc-600">
                <span>[NORTH_QUADRANT]</span>
                <span>[GRID_59]</span>
              </div>
              <div className="w-3/4 border-y border-zinc-900 h-6 flex justify-between px-4 items-center mt-1">
                <span className="h-2 w-0.5 bg-zinc-800" />
                <span className="h-2 w-0.5 bg-zinc-800" />
                <span className="h-2 w-0.5 bg-zinc-800" />
              </div>
            </div>

            {/* Viewfinder Bottom Stats */}
            <div className="flex justify-between text-[8px] text-cyan-400/80 font-mono mt-auto">
              <span>LAT: 39.9042 // LNG: 116.4074</span>
              <span>ZOOM: 16.0X</span>
            </div>
          </div>
        ) : (
          /* Simulated Metadata raw text view */
          <div className="w-full h-full p-3 font-mono text-[9px] text-zinc-400 flex flex-col justify-start overflow-y-auto leading-normal space-y-1 bg-black">
            <div className="text-cyan-500 border-b border-zinc-900 pb-1 flex justify-between">
              <span>METADATA_DUMP_FILE: shadow_feed.log</span>
              <span className="text-zinc-600">OFFSET: 0x90F2</span>
            </div>
            <div className="space-y-0.5 select-text pt-1 font-mono">
              <div className="flex justify-between hover:bg-cyan-500/5 px-1 py-0.5 rounded transition-colors">
                <span className="text-zinc-600">0x0001:</span>
                <span>SYS_INIT = TRUE</span>
                <span className="text-zinc-700">CHECKSUM_OK</span>
              </div>
              <div className="flex justify-between hover:bg-cyan-500/5 px-1 py-0.5 rounded transition-colors text-cyan-400 bg-cyan-950/15 border border-cyan-500/10 font-bold">
                <span className="text-cyan-600">0x004F:</span>
                <span>CIPHER_HEX_STRING = &quot;46 4c 41 47&quot;</span>
                <span className="text-cyan-400 flex items-center gap-1 animate-pulse">
                  <ShieldAlert className="w-3 h-3" />
                  KEY_EXPOSED
                </span>
              </div>
              <div className="flex justify-between hover:bg-cyan-500/5 px-1 py-0.5 rounded transition-colors">
                <span className="text-zinc-600">0x009C:</span>
                <span>ROUTING_IP = 192.168.99.112</span>
                <span className="text-zinc-700">DISCONNECTED</span>
              </div>
              <div className="flex justify-between hover:bg-cyan-500/5 px-1 py-0.5 rounded transition-colors">
                <span className="text-zinc-600">0x011A:</span>
                <span>GPS_LOC = [28.0122, 77.2913]</span>
                <span className="text-zinc-700">STABLE</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info bar footer */}
      <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between text-[9px] text-zinc-500 uppercase tracking-widest shrink-0">
        <span>Active Feed:</span>
        <span className="text-cyan-400 font-bold">
          {viewMode === "image" ? "GPS_IMAGE_PROJECTION" : "RAW_METADATA_DUMP"}
        </span>
      </div>

      <style jsx global>{`
        @keyframes spin-radar {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-radar 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

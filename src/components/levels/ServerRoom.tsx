"use client";

import React, { useState } from "react";
import { Server, Cpu, Database, AlertCircle } from "lucide-react";
import { synthSound } from "@/src/utils/audio";

export default function ServerRoom() {
  const [clickedRack, setClickedRack] = useState<boolean>(false);
  const [highlighted, setHighlighted] = useState<boolean>(false);

  const handleRackClick = (rackId: number) => {
    if (rackId === 4) {
      if (synthSound.playSuccess) synthSound.playSuccess();
      else synthSound.playClick?.();
      setClickedRack(true);
      setHighlighted(true);
    } else {
      synthSound.playKeyPress?.();
      setHighlighted(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 border border-zinc-900 rounded p-4 relative overflow-hidden select-none font-mono">
      {/* Corner Bracket Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/50" />

      {/* Grid Scanline CRT feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.02)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none" />

      <div className="flex items-center gap-2 mb-3 border-b border-zinc-900 pb-2">
        <Server className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
          SECURE_SERVER_GRID // MISSION_1
        </span>
      </div>

      <div className="text-[10px] text-zinc-500 mb-3 uppercase tracking-wider leading-relaxed">
        Locate the anomalous server cabinet to intercept the database payload.
      </div>

      {/* 6 Server Racks Grid */}
      <div className="grid grid-cols-3 gap-3 flex-1 min-h-[140px]">
        {[1, 2, 3, 4, 5, 6].map((id) => {
          const isTarget = id === 4;
          return (
            <div
              key={id}
              onClick={() => handleRackClick(id)}
              className={`relative border rounded p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                isTarget
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                  : "border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 hover:bg-zinc-900/30"
              }`}
            >
              {/* Rack Header */}
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold ${isTarget ? "text-emerald-400" : "text-zinc-600"}`}>
                  CABINET_0{id}
                </span>
                {isTarget ? (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                )}
              </div>

              {/* Server Racks Internals Visual Representation */}
              <div className="space-y-1.5 my-2">
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden flex">
                  <div className={`h-full w-2/3 ${isTarget ? "bg-emerald-500 animate-pulse" : "bg-zinc-700"}`} />
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden flex">
                  <div className={`h-full w-1/2 ${isTarget ? "bg-emerald-500" : "bg-zinc-700"}`} />
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden flex">
                  <div className={`h-full w-4/5 ${isTarget ? "bg-emerald-500 animate-pulse" : "bg-zinc-700"}`} />
                </div>
              </div>

              {/* Target Banish Glitch Alert / Normal Status */}
              {isTarget ? (
                <div className="text-[8px] font-bold text-emerald-400 tracking-widest flex items-center gap-1 mt-auto animate-pulse">
                  <AlertCircle className="w-2.5 h-2.5" />
                  <span>PAYLOAD_LINK</span>
                </div>
              ) : (
                <div className="text-[8px] text-zinc-600 tracking-wider mt-auto font-mono">
                  SYS_OK
                </div>
              )}

              {/* Glitch Overlay effect for Cabinet 4 */}
              {isTarget && (
                <div className="absolute inset-0 bg-emerald-500/[0.02] border border-emerald-500/20 rounded pointer-events-none animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Flag / Cipher Output display */}
      <div className="mt-3 pt-3 border-t border-zinc-900 min-h-[38px] flex items-center justify-between">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest">
          INTERCEPTED_DATA:
        </span>
        {highlighted ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-bold text-xs tracking-[0.25em] shadow-[0_0_12px_rgba(16,185,129,0.15)] animate-pulse">
            <Database className="w-3.5 h-3.5" />
            <span>MXTVO</span>
          </div>
        ) : (
          <span className="text-[10px] text-zinc-600 italic">
            Select the active cabinet node to decrypt...
          </span>
        )}
      </div>
    </div>
  );
}

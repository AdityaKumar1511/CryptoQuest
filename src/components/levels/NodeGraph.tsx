"use client";

import React, { useState } from "react";
import { Cpu, ShieldAlert, CheckCircle2, Zap } from "lucide-react";
import { synthSound } from "@/src/utils/audio";

export default function NodeGraph() {
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);

  const handleNodeClick = (nodeVal: number) => {
    synthSound.playClick?.();
    if (selectedNodes.includes(nodeVal)) {
      setSelectedNodes(selectedNodes.filter((n) => n !== nodeVal));
    } else {
      setSelectedNodes([...selectedNodes, nodeVal]);
    }
  };

  // Determine if prime numbers (2, 3, and 5) are exclusively cut
  const primes = [2, 3, 5];
  const isCutSuccessfully =
    selectedNodes.length === 3 &&
    primes.every((p) => selectedNodes.includes(p));

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
          <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
            MAINFRAME_NODE_GRAPH // MISSION_5
          </span>
        </div>
        <Zap className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
      </div>

      {isCutSuccessfully ? (
        /* Success Screen */
        <div className="flex-1 bg-emerald-950/20 border border-emerald-500/40 rounded p-3 flex flex-col justify-center items-center relative overflow-hidden select-none min-h-[140px] animate-pulse">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_100%)]" />
          
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          
          <h4 className="text-[10px] font-black text-emerald-400 tracking-wider text-center uppercase font-mono max-w-xs leading-normal">
            FINAL RECON BLOCK UNLOCKED: Flag string is TERMINATED
          </h4>

          <div className="mt-3 bg-zinc-950/90 border border-emerald-500/30 px-3 py-1.5 rounded text-center">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest block font-mono">
              CIPHER_EXPOSED
            </span>
            <span className="text-sm font-black text-emerald-400 tracking-[0.25em] font-mono">
              TERMINATED
            </span>
          </div>

          <button
            onClick={() => {
              synthSound.playClick?.();
              setSelectedNodes([]);
            }}
            className="mt-3 text-[9px] text-zinc-500 hover:text-zinc-300 font-mono tracking-widest uppercase underline cursor-pointer"
          >
            RESET_CIRCUITS
          </button>
        </div>
      ) : (
        /* Node Selection / Circuit Cutting Screen */
        <div className="flex-1 flex flex-col justify-between min-h-[140px]">
          <div className="text-[10px] text-zinc-500 mb-3 uppercase tracking-wider">
            Cut the connection nodes corresponding exclusively to all prime numbers (2, 3, 5) to short-circuit the primary firewall lock.
          </div>

          {/* Grid of Clickable Button Panels */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const isSelected = selectedNodes.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => handleNodeClick(num)}
                  className={`py-3 rounded border font-bold text-sm tracking-widest transition-all cursor-pointer ${
                    isSelected
                      ? "bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.15)] scale-[0.98]"
                      : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800"
                  }`}
                >
                  <div className="text-[9px] text-zinc-600 block leading-none mb-1 font-mono">
                    NODE_0{num}
                  </div>
                  {isSelected ? "CUT" : "LIVE"}
                </button>
              );
            })}
          </div>

          {/* Status Alert Info */}
          <div className="text-[9px] text-zinc-500 font-bold tracking-widest text-center flex items-center justify-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${selectedNodes.length > 0 ? "bg-rose-500 animate-ping" : "bg-zinc-700"}`} />
            <span>NODES SEVERED: {selectedNodes.length} / 3 REQUIRED</span>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-zinc-900 flex items-center justify-between text-[9px] text-zinc-500 uppercase tracking-widest shrink-0">
        <span>Firewall Core Status:</span>
        <span className={`font-bold ${isCutSuccessfully ? "text-emerald-400" : "text-rose-400 animate-pulse"}`}>
          {isCutSuccessfully ? "BYPASSED" : "ARMED"}
        </span>
      </div>
    </div>
  );
}

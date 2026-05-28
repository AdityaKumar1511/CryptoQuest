"use client";

import React, { useState, useEffect } from "react";
import { useCrypto } from "@/src/hooks/useCrypto";
import { synthSound } from "@/src/utils/audio";
import { ArrowLeftRight, RefreshCw } from "lucide-react";

interface CaesarToolProps {
  defaultText?: string;
}

export default function CaesarTool({ defaultText = "" }: CaesarToolProps) {
  const { caesar } = useCrypto();
  const [text, setText] = useState(defaultText);
  const [shift, setShift] = useState(5);
  const [isDecrypt, setIsDecrypt] = useState(true);

  // Sync with level changes
  useEffect(() => {
    setText(defaultText);
  }, [defaultText]);

  const result = caesar(text, shift, isDecrypt);

  const handleShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setShift(val);
      synthSound.playKeyPress();
    }
  };

  const toggleMode = () => {
    setIsDecrypt(!isDecrypt);
    synthSound.playClick();
  };

  const handleReset = () => {
    setText(defaultText);
    setShift(5);
    setIsDecrypt(true);
    synthSound.playClick();
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-4 text-xs font-mono text-zinc-300">
      <div className="space-y-4">
        {/* Header / Mode Indicator */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-emerald-400 font-semibold tracking-wider">CAESAR SHIFT TOOL</span>
          <button
            onClick={toggleMode}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{isDecrypt ? "DECRYPT MODE" : "ENCRYPT MODE"}</span>
          </button>
        </div>

        {/* Input Text Area */}
        <div className="space-y-1.5">
          <label className="text-zinc-500 text-[10px] uppercase tracking-wider">Source Code / Text</label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              synthSound.playKeyPress();
            }}
            placeholder="Enter cipher text..."
            rows={3}
            className="w-full bg-zinc-950/70 border border-zinc-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 text-zinc-100 placeholder-zinc-700 resize-none font-mono scrollbar-thin transition-colors"
          />
        </div>

        {/* Shift Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider">
            <span>Shift Key Value</span>
            <span className="text-emerald-400 font-bold text-xs">{shift}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-zinc-600">1</span>
            <input
              type="range"
              min="1"
              max="25"
              value={shift}
              onChange={handleShiftChange}
              className="flex-1 accent-emerald-500 cursor-pointer bg-zinc-900 h-1.5 rounded-lg appearance-none"
            />
            <span className="text-[10px] text-zinc-600">25</span>
          </div>
        </div>

        {/* Dynamic Decrypted Output Container */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-zinc-500 text-[10px] uppercase tracking-wider">Live Preview</label>
            <button
              onClick={handleReset}
              title="Reset tool variables"
              className="text-zinc-600 hover:text-emerald-400 hover:rotate-180 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-full bg-zinc-950/90 border border-emerald-500/20 rounded p-3 min-h-[70px] text-sm text-emerald-400 font-bold break-all shadow-inner relative overflow-hidden select-all">
            {/* Holographic matrix scan effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent pointer-events-none animate-pulse" />
            {result || <span className="text-zinc-800 italic text-xs font-normal">No text decoded.</span>}
          </div>
        </div>
      </div>

      {/* Educational info */}
      <div className="text-[10px] text-zinc-600 border-t border-zinc-900 pt-3 leading-relaxed">
        INFO: The Caesar Cipher shifts each character by the key shift. To decrypt, we shift in reverse. Space and special symbols are skipped in alignment with original tactical protocols.
      </div>
    </div>
  );
}

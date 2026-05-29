"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/src/store/useGameStore";
import { synthSound } from "@/src/utils/audio";
import { Clipboard, FastForward } from "lucide-react";

export default function TerminalConsole() {
  const { levels, currentLevelIndex, gameMode } = useGameStore();
  const currentLevel = levels[currentLevelIndex];
  
  const [typedStory, setTypedStory] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const rawStory = currentLevel?.story || "";
  const cipherText = currentLevel?.cipherText || "";

  // Trigger typewriter effect on level or story change
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const timeout = setTimeout(() => {
      setTypedStory("");
      setIsTyping(true);
      
      let currentIndex = 0;
      const speed = 20; // ms per character

      timerRef.current = setInterval(() => {
        if (currentIndex < rawStory.length) {
          const char = rawStory[currentIndex];
          if (char !== undefined) {
            setTypedStory((prev) => prev + char);
          }
          
          // Play keyboard click sound at periodic intervals to simulate typing
          if (currentIndex % 3 === 0) {
            synthSound.playKeyPress();
          }
          
          currentIndex++;
        } else {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsTyping(false);
        }
      }, speed);
    }, 0);

    return () => {
      clearTimeout(timeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [rawStory]);

  const handleSkipTyping = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTypedStory(rawStory);
    setIsTyping(false);
    synthSound.playClick();
  };

  const handleCopyCipher = () => {
    navigator.clipboard.writeText(cipherText);
    setCopied(true);
    synthSound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded p-4 relative overflow-hidden select-none">
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.005] to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,16,16,0)+50%,rgba(0,0,0,0.25)+50%),linear-gradient(to_right,rgba(255,0,0,0.06)+33%,rgba(0,255,0,0.02)+33%,rgba(0,0,255,0.06)+66%)] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-20" />

      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-2 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-bold text-xs tracking-wider uppercase font-mono">
            MISSION_CONSOLE v1.07
          </span>
        </div>
        
        {isTyping && (
          <button
            onClick={handleSkipTyping}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-500/70 hover:text-emerald-400 hover:border-emerald-500/40 text-[10px] font-mono cursor-pointer transition-all hover:bg-emerald-500/10"
          >
            <FastForward className="w-3 h-3" />
            <span>SKIP_LOG</span>
          </button>
        )}
      </div>

      {/* Mission Text Log */}
      <div className="flex-1 font-mono text-xs text-zinc-300 overflow-y-auto scrollbar-thin pr-1 space-y-4 z-10 leading-relaxed mb-4 min-h-[150px]">
        <div className="whitespace-pre-wrap select-text">
          {typedStory}
          {isTyping && <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-0.5 animate-pulse" />}
        </div>
      </div>

      {/* Encrypted Data Block */}
      {gameMode === "story" ? (
        <div className="mt-auto border-t border-zinc-900 pt-4 shrink-0 z-10 space-y-2">
          <div className="text-center font-mono text-[9px] tracking-widest text-emerald-500/40 py-3.5 border border-zinc-900 rounded bg-zinc-950/40 select-none animate-pulse uppercase">
            🔒 [SYS_ALERT: DECRYPT SOURCE DATA IN LIVE_MONITOR TAB]
          </div>
        </div>
      ) : (
        <div className="mt-auto border-t border-zinc-900 pt-4 shrink-0 z-10 space-y-2">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono tracking-wider">
            <span>INTERCEPTED_ENCRYPTED_BLOCK</span>
            <button
              onClick={handleCopyCipher}
              className="text-zinc-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Clipboard className="w-3 h-3" />
              <span>{copied ? "COPIED" : "COPY_CIPHER"}</span>
            </button>
          </div>

          <div className="bg-zinc-950/90 border border-emerald-500/30 rounded p-4 relative group overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.03)]">
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-emerald-500" />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-emerald-500" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-emerald-500" />
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-emerald-500" />
            
            <div className="text-center font-mono text-base font-black tracking-widest text-emerald-400 select-all py-1.5">
              {cipherText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

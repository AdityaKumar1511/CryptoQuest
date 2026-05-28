"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/src/store/useGameStore";
import { synthSound } from "@/src/utils/audio";
import { 
  AlertCircle, 
  KeyRound, 
  HelpCircle as HelpIcon, 
  CheckCircle2, 
  ChevronRight, 
  BookOpen, 
  X 
} from "lucide-react";
import { motion } from "framer-motion";

export default function InteractionZone() {
  const {
    levels,
    currentLevelIndex,
    timeLeft,
    submitFlag,
    revealHint,
    tickTimer,
    hasFailed,
    isLevelCleared,
    advanceLevel,
    currentLevelHintsRevealed
  } = useGameStore();

  const currentLevel = levels[currentLevelIndex];
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "none"; message: string }>({
    type: "none",
    message: ""
  });
  
  const [isShaking, setIsShaking] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  const hintsContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the hints container to the bottom when a new hint is revealed
  useEffect(() => {
    if (hintsContainerRef.current) {
      // Small timeout to allow the newly added DOM element to render before scrolling
      setTimeout(() => {
        if (hintsContainerRef.current) {
          hintsContainerRef.current.scrollTo({
            top: hintsContainerRef.current.scrollHeight,
            behavior: "smooth"
          });
        }
      }, 50);
    }
  }, [currentLevelHintsRevealed]);

  // Tick the timer every second using a useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [tickTimer]);

  // Reset local panel states on level changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      setInputValue("");
      setFeedback({ type: "none", message: "" });
      setShowExplanationModal(false);
    }, 0);
    return () => clearTimeout(timeout);
  }, [currentLevelIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || hasFailed || isLevelCleared) return;

    const isCorrect = submitFlag(inputValue);
    
    if (isCorrect) {
      setFeedback({
        type: "success",
        message: "SYSTEM: SIGNATURE VERIFIED. GATEWAY OPEN."
      });
      setInputValue("");
    } else {
      setFeedback({
        type: "error",
        message: "CRITICAL: DECRYPTION FAILED. SIGNATURE MISMATCH."
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleHintClick = () => {
    const maxHints = currentLevel?.hints?.length || 0;

    if (currentLevelHintsRevealed >= maxHints) {
      synthSound.playBeep(180, 0.25, "sawtooth", 0.05); // low rejection beep
      return;
    }

    revealHint();
  };

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const timeColorClass =
    timeLeft <= 30
      ? "text-red-500 animate-pulse border-red-500/40 bg-red-500/5 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
      : timeLeft <= 90
      ? "text-amber-500 border-amber-500/40 bg-amber-500/5 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
      : "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";

  return (
    <div className="flex flex-col h-auto md:h-full bg-zinc-950 border border-zinc-900 rounded p-3.5 relative overflow-hidden select-none justify-between space-y-3">
      {/* Timer & Status Panel */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2 shrink-0 z-10">
        <span className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase">DECRYPTION_TIMER</span>
        <div className={`font-mono text-base font-extrabold tracking-widest px-3 py-1 rounded border transition-all duration-300 ${timeColorClass}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Flag submission / Success Gate */}
      {isLevelCleared ? (
        <div className="flex-1 flex flex-col justify-center py-2 z-10 space-y-4 text-center">
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-2"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce mb-1" />
            <h3 className="font-mono text-emerald-400 font-extrabold text-xs tracking-widest uppercase">
              SIGNATURE VERIFIED // SYSTEM OVERPASS
            </h3>
            <p className="font-mono text-[10px] text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
              Decryption sequence successfully verified. The secure interface gateway is bypassed.
            </p>
          </motion.div>

          <div className="space-y-3 px-4">
            <button
              onClick={() => {
                synthSound.playClick();
                setShowExplanationModal(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 rounded font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.03)] animate-pulse"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>DECRYPTION PROTOCOLS</span>
            </button>

            <button
              onClick={() => {
                synthSound.playUnlock();
                advanceLevel();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-emerald-500 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded font-black text-xs tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-98"
            >
              <span>NEXT LEVEL</span>
              <ChevronRight className="w-4 h-4 text-zinc-950" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center py-2 z-10 space-y-4">
          <div className="text-center space-y-2">
            <KeyRound className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
            <h3 className="font-mono text-zinc-300 font-bold text-xs tracking-wider uppercase">
              ENTER DECRYPTED FLAG
            </h3>
            <p className="font-mono text-[10px] text-zinc-600">
              Submit the plaintext response to override system locks.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              animate={isShaking ? { x: [-8, 8, -8, 8, -4, 4, -2, 2, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  synthSound.playKeyPress();
                }}
                disabled={hasFailed}
                placeholder="e.g. PASSWORD"
                className={`w-full bg-zinc-950/80 border ${
                  feedback.type === "error"
                    ? "border-red-500 focus:border-red-400 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                    : feedback.type === "success"
                    ? "border-emerald-500 focus:border-emerald-400 text-emerald-400"
                    : "border-zinc-800 focus:border-emerald-500 text-zinc-200"
                } rounded px-4 py-2 text-center font-mono font-bold tracking-widest text-sm focus:outline-none transition-all uppercase placeholder-zinc-800`}
              />
            </motion.div>

            <button
              type="submit"
              disabled={hasFailed}
              onClick={() => synthSound.playClick()}
              className={`w-full font-mono py-2 rounded text-xs font-bold tracking-widest uppercase transition-all border cursor-pointer
                ${
                  hasFailed
                    ? "border-zinc-900 bg-zinc-950 text-zinc-700 cursor-not-allowed"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-98 shadow-[0_0_12px_rgba(16,185,129,0.08)] hover:shadow-[0_0_16px_rgba(16,185,129,0.15)]"
                }
              `}
            >
              SUBMIT SIGNATURE
            </button>
          </form>

          {/* Feedback logs */}
          <div className="min-h-[22px] flex items-center justify-center font-mono text-[10px] text-center mt-2">
            {feedback.type !== "none" ? (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-1.5 p-1.5 rounded bg-zinc-900/40 w-full border ${
                  feedback.type === "success"
                    ? "text-emerald-400 border-emerald-500/20"
                    : "text-red-400 border-red-500/20"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="text-left leading-normal">{feedback.message}</span>
              </motion.div>
            ) : (
              <span className="text-zinc-700 text-[9px] tracking-widest uppercase">SYS_STATUS // AWAITING_FLAG</span>
            )}
          </div>
        </div>
      )}

      {/* Hint avatar bubble system */}
      <div className="border-t border-zinc-900 pt-2.5 shrink-0 z-10 h-[155px] flex flex-col">
        <div className="flex-1 bg-zinc-900/30 border border-zinc-900/80 rounded p-2.5 relative flex flex-col overflow-hidden justify-between">
          
          {/* Header Row */}
          <div className="shrink-0 flex justify-between items-center text-zinc-500 text-[8px] uppercase tracking-wider mb-1.5 font-bold">
            <span className="flex items-center gap-1.5">
              <HelpIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>SUPPORT_INTEL // AGENT_V</span>
            </span>
            <span className="text-amber-500 text-[8px] font-bold">
              DECRYPTED: {currentLevelHintsRevealed}/{currentLevel?.hints?.length || 0}
            </span>
          </div>

          {/* Hints Scrollable Content */}
          <div 
            ref={hintsContainerRef}
            className="flex-1 overflow-y-auto scrollbar-thin space-y-1.5 pr-1 mb-1.5 text-[10px]"
          >
            {currentLevelHintsRevealed === 0 ? (
              <p className="text-zinc-500 italic text-[10px] leading-relaxed">
                &quot;Agent, need progressive cryptographic intelligence to solve this protocol lock?&quot;
              </p>
            ) : (
              currentLevel?.hints.slice(0, currentLevelHintsRevealed).map((hint, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-amber-400 select-text leading-relaxed bg-amber-500/5 border border-amber-500/10 p-1.5 rounded"
                >
                  <span className="text-amber-500/60 font-bold mr-1">[{idx + 1}]</span>
                  {hint}
                </motion.div>
              ))
            )}
          </div>

          {/* Button / Exceeded Zone */}
          <div className="shrink-0">
            {currentLevelHintsRevealed >= (currentLevel?.hints?.length || 0) ? (
              <div className="w-full text-center py-2 bg-zinc-950/60 border border-zinc-900 text-zinc-600 rounded font-black text-[9px] tracking-widest uppercase">
                ⚡ ALL HINTS DECRYPTED — NO MORE HINTS
              </div>
            ) : (
              <button
                onClick={handleHintClick}
                className={`w-full flex items-center justify-center gap-1.5 py-1.5 border rounded font-bold text-[10px] tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.02)]
                  ${currentLevelHintsRevealed === 0 
                    ? "border-amber-500/55 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 animate-pulse" 
                    : "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
                  }`}
              >
                ⚡ GIVE HINT ({currentLevelHintsRevealed + 1}/{currentLevel?.hints?.length || 0}) (-100 PTS)
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. EXPLANATION MODAL */}
      {showExplanationModal && (
        <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded p-6 shadow-2xl relative space-y-6 font-mono leading-relaxed text-zinc-300"
          >
            {/* Border corner markers */}
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-emerald-500 rounded-tl" />
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-emerald-500 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l border-emerald-500 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-emerald-500 rounded-br" />

            <button
              onClick={() => {
                synthSound.playClick();
                setShowExplanationModal(false);
              }}
              className="absolute top-4 right-4 p-1.5 border border-zinc-900 rounded bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-emerald-400 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="space-y-1.5 border-b border-zinc-900 pb-3 text-left">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-3 bg-emerald-500 animate-pulse" />
                <h2 className="text-emerald-400 font-extrabold text-sm tracking-widest uppercase">
                  DECRYPTION BRIEFING // TERMINAL_REPORT
                </h2>
              </div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-widest">
                Level {currentLevelIndex + 1} cryptographic telemetry declassification
              </p>
            </div>

            {/* Stats matrix */}
            <div className="grid grid-cols-2 gap-3 bg-zinc-950 border border-zinc-900 rounded p-3 text-[10px] text-zinc-400 text-left">
              <div className="space-y-1">
                <span className="text-zinc-600 uppercase block tracking-wider">INTERCEPTED PAYLOAD</span>
                <span className="text-emerald-400 font-bold select-all tracking-widest uppercase">{currentLevel?.cipherText}</span>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-600 uppercase block tracking-wider">DECRYPTED TELEMETRY</span>
                <span className="text-amber-400 font-bold select-all tracking-widest uppercase">{currentLevel?.answer}</span>
              </div>
            </div>

            {/* Explanation Content */}
            <div className="space-y-2 text-left">
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold block">
                STEP-BY-STEP DECRYPTION TELEMETRY
              </span>
              <p className="text-[11px] text-zinc-300 bg-zinc-900/10 border border-zinc-900/50 p-4 rounded max-h-60 overflow-y-auto scrollbar-thin leading-relaxed select-text">
                {currentLevel?.explanation}
              </p>
            </div>

            {/* Confirmation buttons */}
            <button
              onClick={() => {
                synthSound.playClick();
                setShowExplanationModal(false);
              }}
              className="w-full py-2.5 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 rounded font-bold text-xs tracking-wider uppercase cursor-pointer transition-all shadow-[0_0_12px_rgba(16,185,129,0.05)]"
            >
              CONFIRM & SECURE MISSION DATA
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

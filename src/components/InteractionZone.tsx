"use client";

import React, { useState, useEffect } from "react";
import { useGameStore } from "@/src/store/useGameStore";
import { synthSound } from "@/src/utils/audio";
import { AlertCircle, HelpCircle, KeyRound, Play, Terminal, HelpCircle as HelpIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function InteractionZone() {
  const {
    levels,
    currentLevelIndex,
    score,
    timeLeft,
    hintsUsed,
    submitFlag,
    useHint,
    tickTimer,
    hasFailed
  } = useGameStore();

  const currentLevel = levels[currentLevelIndex];
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "none"; message: string }>({
    type: "none",
    message: ""
  });
  
  const [showHintMsg, setShowHintMsg] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Tick the timer every second using a useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [tickTimer]);

  // Reset local panel states on level changes
  useEffect(() => {
    setInputValue("");
    setFeedback({ type: "none", message: "" });
    setShowHintMsg(false);
  }, [currentLevelIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || hasFailed) return;

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
    if (showHintMsg) {
      setShowHintMsg(false);
      synthSound.playClick();
    } else {
      if (confirm("Decrypt hint? (Warning: This will invoke a -100 point score penalty)")) {
        useHint();
        setShowHintMsg(true);
      }
    }
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
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded p-4 relative overflow-hidden select-none justify-between space-y-4">
      {/* Timer & Status Panel */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2 shrink-0 z-10">
        <span className="text-zinc-500 font-mono text-[10px] tracking-wider uppercase">DECRYPTION_TIMER</span>
        <div className={`font-mono text-base font-extrabold tracking-widest px-3 py-1 rounded border transition-all duration-300 ${timeColorClass}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Flag submission Form */}
      <div className="flex-1 flex flex-col justify-center py-4 z-10 space-y-6">
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
        <div className="h-12 flex items-center justify-center font-mono text-[10px] text-center">
          {feedback.type !== "none" && (
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-1.5 p-2 rounded bg-zinc-900/40 w-full border ${
                feedback.type === "success"
                  ? "text-emerald-400 border-emerald-500/20"
                  : "text-red-400 border-red-500/20"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-left leading-normal">{feedback.message}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hint avatar bubble system */}
      <div className="border-t border-zinc-900 pt-4 shrink-0 z-10">
        <div className="flex items-start gap-3 bg-zinc-900/30 border border-zinc-900/80 rounded p-3 relative overflow-hidden">
          {/* Avatar Icon */}
          <div
            onClick={handleHintClick}
            className="flex-shrink-0 w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/20 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group"
            title="Ask agent for a decrypted hint hint"
          >
            <HelpIcon className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />
          </div>

          {/* Hint speech bubble */}
          <div className="flex-1 font-mono text-[10px] text-zinc-400 leading-normal">
            <div className="flex justify-between items-center text-zinc-500 text-[8px] uppercase tracking-wider mb-1 font-bold">
              <span>SUPPORT_INTEL // AGENT_V</span>
              {showHintMsg && <span className="text-amber-500 text-[8px] font-bold">PENALTY_APPLIED</span>}
            </div>
            
            {showHintMsg ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-amber-400 select-text leading-relaxed bg-amber-500/5 border border-amber-500/10 p-1.5 rounded"
              >
                {currentLevel?.hint}
              </motion.div>
            ) : (
              <div className="text-zinc-500 italic">
                "Agent, need technical intelligence to solve this protocol lock? Click the query node to request decryption details."
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

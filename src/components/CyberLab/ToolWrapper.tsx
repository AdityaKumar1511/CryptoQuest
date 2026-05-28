"use client";

import React, { useState, useEffect } from "react";
import { useGameStore } from "@/src/store/useGameStore";
import { synthSound } from "@/src/utils/audio";
import CaesarTool from "./CaesarTool";
import HexTool from "./HexTool";
import VigenereTool from "./VigenereTool";
import { Lock, Cpu, Eye, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ToolTab {
  id: string;
  name: string;
  colorClass: string;
  glowClass: string;
  icon: React.ReactNode;
}

export default function ToolWrapper() {
  const { levels, currentLevelIndex, unlockedTools } = useGameStore();
  const currentLevel = levels[currentLevelIndex];
  
  // Available tools configurations
  const tabs: ToolTab[] = [
    {
      id: "caesar",
      name: "CAESAR",
      colorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
      glowClass: "shadow-[0_0_12px_rgba(16,185,129,0.15)] border-emerald-500/50",
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
    {
      id: "hex",
      name: "HEX REF",
      colorClass: "text-amber-400 border-amber-500/30 bg-amber-500/5",
      glowClass: "shadow-[0_0_12px_rgba(245,158,11,0.15)] border-amber-500/50",
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    {
      id: "vigenere",
      name: "VIGENERE",
      colorClass: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
      glowClass: "shadow-[0_0_12px_rgba(6,182,212,0.15)] border-cyan-500/50",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    },
  ];

  const [activeTab, setActiveTab] = useState("caesar");
  
  // Keep track of which tools have been unlocked to trigger sound effects
  const [previouslyUnlocked, setPreviouslyUnlocked] = useState<string[]>(["caesar"]);

  // Detect when new tools unlock and play an unlock chime
  useEffect(() => {
    const newUnlocks = unlockedTools.filter((t) => !previouslyUnlocked.includes(t));
    if (newUnlocks.length > 0) {
      synthSound.playUnlock();
      setPreviouslyUnlocked(unlockedTools);
      // Auto switch to the newly unlocked tab
      setActiveTab(newUnlocks[0]);
    }
  }, [unlockedTools, previouslyUnlocked]);

  // Ensure active tab is always one of the unlocked ones
  useEffect(() => {
    if (!unlockedTools.includes(activeTab) && unlockedTools.length > 0) {
      setActiveTab(unlockedTools[0]);
    }
  }, [unlockedTools, activeTab]);

  const handleTabClick = (tabId: string, isLocked: boolean) => {
    if (isLocked) {
      synthSound.playBeep(180, 0.25, "sawtooth", 0.05); // low rejection beep
      return;
    }
    setActiveTab(tabId);
    synthSound.playClick();
  };

  const renderActiveTool = () => {
    const cipherText = currentLevel?.cipherText || "";
    switch (activeTab) {
      case "caesar":
        return <CaesarTool defaultText={cipherText} />;
      case "hex":
        return <HexTool defaultText={cipherText} />;
      case "vigenere":
        return <VigenereTool defaultText={cipherText} />;
      default:
        return <CaesarTool defaultText={cipherText} />;
    }
  };

  const activeTabConfig = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded p-4 relative overflow-hidden select-none">
      {/* Background Matrix/Grid Aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0e_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0e_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

      {/* Panel title */}
      <div className="flex items-center gap-2 mb-3.5 shrink-0 z-10">
        <div className="w-1.5 h-3 bg-emerald-500 animate-pulse" />
        <h2 className="text-zinc-400 font-bold text-xs tracking-widest uppercase">
          CYBER LAB: MODULE_DECODER_OS
        </h2>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 mb-4 shrink-0 z-10">
        {tabs.map((tab) => {
          const isUnlocked = unlockedTools.includes(tab.id);
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, !isUnlocked)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 border rounded font-mono text-[10px] tracking-wider transition-all duration-300 relative cursor-pointer
                ${
                  !isUnlocked
                    ? "border-zinc-900/60 bg-zinc-950/40 text-zinc-700 cursor-not-allowed"
                    : isActive
                    ? tab.colorClass + " " + tab.glowClass
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/80"
                }
              `}
            >
              {isUnlocked ? (
                <>
                  {tab.icon}
                  <span>{tab.name}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-zinc-800" />
                  <span className="text-zinc-800">LOCKED</span>
                </>
              )}

              {/* Glowing underscore indicator for active tab */}
              {isActive && isUnlocked && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tool Container */}
      <div className="flex-1 bg-zinc-950/80 border border-zinc-900/80 rounded p-4 z-10 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
        {/* Border corner glows */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-800" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-800" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-800" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-800" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-hidden"
          >
            {renderActiveTool()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

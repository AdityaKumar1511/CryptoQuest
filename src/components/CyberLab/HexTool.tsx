"use client";

import React, { useState, useEffect } from "react";
import { useCrypto } from "@/src/hooks/useCrypto";
import { synthSound } from "@/src/utils/audio";
import { Clipboard, RefreshCw } from "lucide-react";

interface HexToolProps {
  defaultText?: string;
}

// Generate printable character list from ASCII 0x30 to 0x7E for quick ref
const REFERENCE_ASCII_CHARACTERS = Array.from({ length: 79 }, (_, i) => {
  const code = 0x30 + i;
  return {
    char: String.fromCharCode(code),
    hex: code.toString(16).toUpperCase(),
    dec: code,
  };
});

export default function HexTool({ defaultText = "" }: HexToolProps) {
  const { hexToAscii, asciiToHex } = useCrypto();
  const [hexInput, setHexInput] = useState(defaultText);
  const [asciiInput, setAsciiInput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHexInput(defaultText);
  }, [defaultText]);

  const asciiResult = hexToAscii(hexInput);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    synthSound.playKeyPress();
  };

  const handleAsciiChange = (val: string) => {
    setAsciiInput(val);
    synthSound.playKeyPress();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(asciiResult);
    setCopied(true);
    synthSound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setHexInput(defaultText);
    setAsciiInput("");
    synthSound.playClick();
  };

  return (
    <div className="flex flex-col h-full space-y-4 text-xs font-mono text-zinc-300 overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin pr-1 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-amber-400 font-semibold tracking-wider">HEX CONVERTER & REFERENCE</span>
          <button
            onClick={handleReset}
            className="text-zinc-600 hover:text-amber-400 hover:rotate-180 transition-all cursor-pointer"
            title="Reset text fields"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Decoder Input */}
        <div className="space-y-1.5">
          <label className="text-zinc-500 text-[10px] uppercase tracking-wider">Hex Input (e.g. 46 4c 41 47)</label>
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="Type hex bytes..."
            className="w-full bg-zinc-950/70 border border-zinc-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-zinc-100 placeholder-zinc-700 font-mono text-xs transition-colors"
          />
        </div>

        {/* Decoder Output */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider">
            <span>ASCII Text Output</span>
            {asciiResult && (
              <button
                onClick={handleCopy}
                className="text-zinc-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
              >
                <Clipboard className="w-3 h-3" />
                <span>{copied ? "COPIED" : "COPY"}</span>
              </button>
            )}
          </div>
          <div className="w-full bg-zinc-950/90 border border-amber-500/20 rounded p-2.5 min-h-[50px] text-xs font-bold text-amber-400 break-all select-all flex items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.01] to-transparent pointer-events-none" />
            {asciiResult || <span className="text-zinc-800 italic font-normal text-[11px]">Decoded text prints here...</span>}
          </div>
        </div>

        {/* Interactive reference table */}
        <div className="space-y-2">
          <div className="text-zinc-500 text-[10px] uppercase tracking-wider border-t border-zinc-900 pt-3">
            ASCII Hex Reference Sheet
          </div>
          <div className="grid grid-cols-5 gap-1.5 max-h-[140px] overflow-y-auto border border-zinc-900 bg-zinc-950/50 p-1.5 rounded scrollbar-thin">
            {REFERENCE_ASCII_CHARACTERS.map((item) => (
              <div
                key={item.dec}
                onClick={() => {
                  setHexInput((prev) => (prev ? `${prev.trim()} ${item.hex}` : item.hex));
                  synthSound.playClick();
                }}
                title={`Decimal: ${item.dec} | Char: "${item.char}"`}
                className="flex flex-col items-center py-1 rounded bg-zinc-900/60 border border-zinc-800/40 hover:bg-amber-500/10 hover:border-amber-500/40 text-center select-none cursor-pointer transition-all active:scale-95"
              >
                <span className="text-[10px] text-zinc-600">0x{item.hex}</span>
                <span className="text-zinc-300 font-bold text-xs">{item.char === " " ? "SPC" : item.char}</span>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-zinc-600 text-right">
            * Click any hex block to append it to the decode input box.
          </div>
        </div>
      </div>

      {/* Educational info */}
      <div className="text-[10px] text-zinc-600 border-t border-zinc-900 pt-2 leading-relaxed shrink-0">
        INFO: Computers represent text in hex bytes using ASCII mappings. For instance, hex "46" corresponds to 70 in decimal, which is mapped to the character "F".
      </div>
    </div>
  );
}

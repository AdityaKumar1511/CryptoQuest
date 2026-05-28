"use client";

import React, { useState, useEffect } from "react";
import { useCrypto } from "@/src/hooks/useCrypto";
import { synthSound } from "@/src/utils/audio";
import { ArrowLeftRight, RefreshCw } from "lucide-react";

interface VigenereToolProps {
  defaultText?: string;
}

export default function VigenereTool({ defaultText = "" }: VigenereToolProps) {
  const { vigenere } = useCrypto();
  const [text, setText] = useState(defaultText);
  const [key, setKey] = useState("KEY");
  const [isDecrypt, setIsDecrypt] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setText(defaultText);
      setKey("KEY");
    }, 0);
    return () => clearTimeout(timeout);
  }, [defaultText]);

  const result = vigenere(text, key, isDecrypt);

  const toggleMode = () => {
    setIsDecrypt(!isDecrypt);
    synthSound.playClick();
  };

  const handleReset = () => {
    setText(defaultText);
    setKey("KEY");
    setIsDecrypt(true);
    synthSound.playClick();
  };

  // Generate alignment trace table data
  const getTraceData = () => {
    if (!key || !text) return [];
    const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, "");
    if (cleanKey.length === 0) return [];
    
    let keyIdx = 0;
    return text.split("").slice(0, 12).map((char) => {
      const code = char.charCodeAt(0);
      let keyChar = "";
      let shift = 0;
      let outChar = "";

      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;

      if (isUpper || isLower) {
        keyChar = cleanKey[keyIdx % cleanKey.length];
        shift = keyChar.charCodeAt(0) - 65;
        keyIdx++;
        
        const base = isUpper ? 65 : 97;
        const actualShift = isDecrypt ? (26 - shift) % 26 : shift;
        outChar = String.fromCharCode(((code - base + actualShift) % 26) + base);
      } else {
        keyChar = "-";
        shift = 0;
        outChar = char;
      }

      return {
        in: char,
        key: keyChar,
        shift: isDecrypt ? `-${shift}` : `+${shift}`,
        out: outChar,
      };
    });
  };

  const traces = getTraceData();

  return (
    <div className="flex flex-col h-auto md:h-full space-y-4 text-xs font-mono text-zinc-300 md:overflow-hidden">
      <div className="flex-1 space-y-4 md:overflow-y-auto scrollbar-thin pr-1 pb-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-cyan-400 font-semibold tracking-wider">VIGENERE POLYALPHABETIC TOOL</span>
          <button
            onClick={toggleMode}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all cursor-pointer text-[10px]"
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>{isDecrypt ? "DECRYPT" : "ENCRYPT"}</span>
          </button>
        </div>

        {/* Text Input */}
        <div className="space-y-1.5">
          <label className="text-zinc-500 text-[10px] uppercase tracking-wider">Input Cipher Text</label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              synthSound.playKeyPress();
            }}
            placeholder="Enter encrypted text..."
            rows={2}
            className="w-full bg-zinc-950/70 border border-zinc-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-zinc-100 placeholder-zinc-700 font-mono resize-none transition-colors"
          />
        </div>

        {/* Key Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider">
            <span>Security Cipher Key (Letters Only)</span>
            <span className="text-cyan-400 font-bold">{key.toUpperCase().replace(/[^A-Z]/g, "")}</span>
          </div>
          <input
            type="text"
            value={key}
            onChange={(e) => {
              setKey(e.target.value.replace(/[^a-zA-Z]/g, ""));
              synthSound.playKeyPress();
            }}
            placeholder="Enter key..."
            className="w-full bg-zinc-950/70 border border-zinc-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-zinc-100 placeholder-zinc-700 font-mono transition-colors"
          />
        </div>

        {/* Output Preview */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-zinc-500 text-[10px] uppercase tracking-wider">Decrypted Output</label>
            <button
              onClick={handleReset}
              className="text-zinc-600 hover:text-cyan-400 hover:rotate-180 transition-all cursor-pointer"
              title="Reset fields"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-full bg-zinc-950/90 border border-cyan-500/20 rounded p-2.5 min-h-[50px] text-sm text-cyan-400 font-bold break-all shadow-inner relative overflow-hidden select-all flex items-center">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.01] to-transparent pointer-events-none" />
            {result || <span className="text-zinc-800 italic font-normal text-xs">No text output.</span>}
          </div>
        </div>

        {/* Shifting trace visualization */}
        {traces.length > 0 && (
          <div className="space-y-2">
            <span className="text-zinc-500 text-[10px] uppercase tracking-wider border-t border-zinc-900 pt-3 block">
              Character Shift Alignment (First 12 Chars)
            </span>
            <div className="overflow-x-auto scrollbar-thin border border-zinc-900 bg-zinc-950/40 p-2 rounded">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[9px]">
                    <th className="pb-1 px-1 font-normal">IN</th>
                    <th className="pb-1 px-1 font-normal">KEY</th>
                    <th className="pb-1 px-1 font-normal">SHIFT</th>
                    <th className="pb-1 px-1 font-normal">OUT</th>
                  </tr>
                </thead>
                <tbody>
                  {traces.map((t, idx) => (
                    <tr key={idx} className="border-b border-zinc-900/40 text-[11px] text-zinc-400">
                      <td className="py-1 px-1 text-zinc-500 font-semibold">{t.in}</td>
                      <td className="py-1 px-1 text-cyan-400">{t.key}</td>
                      <td className="py-1 px-1 text-zinc-600 text-[9px]">{t.shift}</td>
                      <td className="py-1 px-1 text-emerald-400 font-bold">{t.out}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="text-[10px] text-zinc-600 border-t border-zinc-900 pt-2 leading-relaxed shrink-0">
        INFO: Vigenere is a method of encrypting alphabetic text using a series of interwoven Caesar ciphers based on the letters of a keyword.
      </div>
    </div>
  );
}

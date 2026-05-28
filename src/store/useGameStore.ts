import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/src/utils/supabaseClient";
import { synthSound } from "@/src/utils/audio";

export interface Level {
  id: string;
  title: string;
  story: string;
  cipherText: string;
  answer: string;
  hint: string;
  unlockedTools?: string[];
}

export interface GameStoreState {
  // State
  currentLevelIndex: number;
  score: number;
  levels: Level[];
  timeLeft: number; // in seconds
  hintsUsed: number;
  isMuted: boolean;
  isLoading: boolean;
  hasFailed: boolean;
  isGameCompleted: boolean;
  unlockedTools: string[];

  // Actions
  submitFlag: (input: string) => boolean;
  useHint: () => void;
  tickTimer: () => void;
  resetGame: () => void;
  toggleMute: () => void;
  fetchLevels: () => Promise<void>;
  setTimeLeft: (time: number) => void;
}

const DEFAULT_LEVELS: Level[] = [
  {
    id: "1",
    title: "Caesar Cipher",
    story: "LOG ENTRY: SECURE NODE 01\nWe intercepted an encrypted frequency from the syndicate commander. The cipher is a classical Caesar shift. Decrypt the message to locate their hideout.",
    cipherText: "MXTVO",
    answer: "HOTEL",
    hint: "Julius Caesar shifts characters. Try shifting letters backward by 5 positions (A-Z).",
    unlockedTools: ["caesar"]
  },
  {
    id: "2",
    title: "Hex Code",
    story: "LOG ENTRY: DATA DUMP 02\nA network trace captured a burst of raw data bytes in hex code. Translate the binary payload into plaintext ASCII to find the security token.",
    cipherText: "46 4c 41 47",
    answer: "FLAG",
    hint: "Convert each 2-digit hex byte to ASCII character (e.g. 46 is 'F').",
    unlockedTools: ["caesar", "hex"]
  },
  {
    id: "3",
    title: "Vigenere Cipher",
    story: "LOG ENTRY: SHADOW PROTOCOL 03\nOur agents extracted an encrypted password from a high-security vault. It uses a Vigenere polyalphabetic cipher with the security key 'KEY'. Decrypt it to unlock the network gateway.",
    cipherText: "CLYNSU",
    answer: "SHADOW",
    hint: "Use the Vigenere Tool with keyword 'KEY' in decrypt mode.",
    unlockedTools: ["caesar", "hex", "vigenere"]
  }
];

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Initial State
  currentLevelIndex: 0,
  score: 0,
  levels: DEFAULT_LEVELS,
  timeLeft: 300, // 5 minutes default per level
  hintsUsed: 0,
  isMuted: false,
  isLoading: false,
  hasFailed: false,
  isGameCompleted: false,
  unlockedTools: ["caesar"],

  // Fetch levels from Supabase or use default fallback
  fetchLevels: async () => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("levels")
          .select("*")
          .order("level_number", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedLevels: Level[] = data.map((item: any) => ({
            id: item.id || String(item.level_number),
            title: item.title,
            story: item.story_text,
            cipherText: item.encrypted_payload,
            answer: item.correct_flag,
            hint: item.hint_text || "Search the database for clues.",
            unlockedTools: item.unlocked_tools || ["caesar"]
          }));
          set({ levels: mappedLevels });
        }
      }
    } catch (e) {
      console.warn("Failed to fetch levels from Supabase, running with local ciphers.", e);
    } finally {
      set({ isLoading: false });
    }
  },

  // Submit flag verification
  submitFlag: (input: string): boolean => {
    const { currentLevelIndex, levels, hasFailed, isGameCompleted } = get();

    if (hasFailed || isGameCompleted || currentLevelIndex >= levels.length) {
      return false;
    }

    const currentLevel = levels[currentLevelIndex];
    const cleanInput = input.trim().toUpperCase();
    const cleanAnswer = currentLevel.answer.trim().toUpperCase();

    if (cleanInput === cleanAnswer) {
      synthSound.playSuccess();
      const nextIndex = currentLevelIndex + 1;
      const finished = nextIndex >= levels.length;
      
      set((state) => {
        // Calculate unlocked tools for next level
        const nextLevel = state.levels[nextIndex];
        const nextTools = nextLevel?.unlockedTools || 
                           (nextIndex === 1 ? ["caesar", "hex"] : ["caesar", "hex", "vigenere"]);
        
        return {
          currentLevelIndex: nextIndex,
          score: state.score + 500,
          timeLeft: finished ? state.timeLeft : 300, // reset timer for next level
          unlockedTools: nextTools,
          isGameCompleted: finished
        };
      });

      // Save progress to Supabase if logged in (simulate/mock or live)
      if (isSupabaseConfigured && supabase) {
        const client = supabase;
        // Run update query in background
        client.auth.getUser().then(({ data }) => {
          if (data?.user) {
            client
              .from("user_progress")
              .upsert({
                user_id: data.user.id,
                current_level: nextIndex + 1,
                current_score: get().score,
                completed_at: finished ? new Date().toISOString() : null
              })
              .then();
          }
        });
      }

      return true;
    } else {
      synthSound.playFailure();
      return false;
    }
  },

  // Use hint action
  useHint: () => {
    const { isMuted } = get();
    synthSound.playBeep(400, 0.15, "triangle", 0.04);
    set((state) => ({
      hintsUsed: state.hintsUsed + 1,
      score: Math.max(0, state.score - 100) // 100 pt penalty for hint usage
    }));
  },

  // Timer Tick (called every 1s by interval in layout)
  tickTimer: () => {
    const { hasFailed, isGameCompleted } = get();
    if (hasFailed || isGameCompleted) return;

    set((state) => {
      const nextTime = state.timeLeft - 1;
      if (nextTime <= 0) {
        synthSound.playFailure();
        return {
          timeLeft: 0,
          hasFailed: true
        };
      }
      
      // Play low tick beep warning when time is low (< 10 seconds)
      if (nextTime <= 10) {
        synthSound.playBeep(220, 0.05, "sine", 0.05);
      }
      
      return { timeLeft: nextTime };
    });
  },

  // Reset Game progress
  resetGame: () => {
    synthSound.playUnlock();
    set({
      currentLevelIndex: 0,
      score: 0,
      timeLeft: 300,
      hintsUsed: 0,
      hasFailed: false,
      isGameCompleted: false,
      unlockedTools: ["caesar"]
    });
  },

  // Toggle Mute
  toggleMute: () => {
    const nextMute = !get().isMuted;
    synthSound.setMute(nextMute);
    set({ isMuted: nextMute });
    if (!nextMute) {
      synthSound.playBeep(520, 0.08, "sine");
    }
  },

  // Set explicit time left (useful for debug or customized timers)
  setTimeLeft: (time: number) => {
    set({ timeLeft: time });
  }
}));

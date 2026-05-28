import { create } from "zustand";
import { 
  supabase, 
  isSupabaseConfigured,
  getOrCreateAnonymousUser,
  fetchLevelsFromDB,
  saveUserProgress,
  getUserProgress
} from "@/src/utils/supabaseClient";
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
    cipherText: "MTYJQ",
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
  },
  {
    id: "4",
    title: "Double Threat",
    story: "LOG ENTRY: SECURE PACKET 04\nWe captured a double-wrapped database token. The packet is encoded in hex bytes. Translate the hex string to ASCII characters, then apply a Caesar shift backward by 3 positions to reveal the true intelligence agent's codename.",
    cipherText: "44 4a 48 51 57",
    answer: "AGENT",
    hint: "Convert hex bytes to ASCII first (e.g., '44' is 'D'), then slide Caesar shift to 3 in Decrypt mode.",
    unlockedTools: ["caesar", "hex", "vigenere"]
  },
  {
    id: "5",
    title: "Vigenere Hex",
    story: "LOG ENTRY: ENCRYPTED TELEMETRY 05\nOur deep network sniffer intercepted a high-priority telemetry dump. The database records are hex-encoded, but reversing the hex reveals a Vigenere-encrypted token. Convert the hex payload to ASCII, then decrypt it with key 'KEY' to find the syndicate database password.",
    cipherText: "4d 43 5a 4f 56",
    answer: "CYBER",
    hint: "Translate the hex bytes to ASCII characters first. Then, load the resulting text in the Vigenere tool with key 'KEY'.",
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
        // 1. Fetch levels from database
        const dbLevels = await fetchLevelsFromDB();
        if (dbLevels && dbLevels.length > 0) {
          const mappedLevels: Level[] = dbLevels.map((item: any) => {
            let cipherText = item.encrypted_payload;
            // Hotfix: Correct legacy incorrect Level 1 Caesar ciphertext manually
            if (item.level_number === 1 && (cipherText === "MXTVO" || !cipherText)) {
              cipherText = "MTYJQ";
            }
            return {
              id: item.id || String(item.level_number),
              title: item.title,
              story: item.story_text,
              cipherText: cipherText,
              answer: item.correct_flag,
              hint: item.hint_text || "Search the database for clues.",
              unlockedTools: item.unlocked_tools || ["caesar"]
            };
          });
          set({ levels: mappedLevels });

          // Silent DB repair in case they executed the incorrect seed insert from legacy schema
          const legacyRow = dbLevels.find(item => item.level_number === 1 && item.encrypted_payload === "MXTVO");
          if (legacyRow) {
            supabase
              .from("levels")
              .update({ encrypted_payload: "MTYJQ" })
              .eq("level_number", 1)
              .then();
          }

          // Auto-seed Level 4 and Level 5 if database level count is outdated
          if (dbLevels.length < 5) {
            const newLevelsToSeed = [
              {
                level_number: 4,
                title: "Double Threat",
                story_text: "LOG ENTRY: SECURE PACKET 04\nWe captured a double-wrapped database token. The packet is encoded in hex bytes. Translate the hex string to ASCII characters, then apply a Caesar shift backward by 3 positions to reveal the true intelligence agent's codename.",
                encrypted_payload: "44 4a 48 51 57",
                correct_flag: "AGENT",
                hint_text: "Convert hex bytes to ASCII first (e.g., '44' is 'D'), then slide Caesar shift to 3 in Decrypt mode.",
                unlocked_tools: ["caesar", "hex", "vigenere"]
              },
              {
                level_number: 5,
                title: "Vigenere Hex",
                story_text: "LOG ENTRY: ENCRYPTED TELEMETRY 05\nOur deep network sniffer intercepted a high-priority telemetry dump. The database records are hex-encoded, but reversing the hex reveals a Vigenere-encrypted token. Convert the hex payload to ASCII, then decrypt it with key 'KEY' to find the syndicate database password.",
                encrypted_payload: "4d 43 5a 4f 56",
                correct_flag: "CYBER",
                hint_text: "Translate the hex bytes to ASCII characters first. Then, load the resulting text in the Vigenere tool with key 'KEY'.",
                unlocked_tools: ["caesar", "hex", "vigenere"]
              }
            ];

            for (const lvl of newLevelsToSeed) {
              const alreadyExists = dbLevels.some(x => x.level_number === lvl.level_number);
              if (!alreadyExists) {
                supabase.from("levels").insert(lvl).then();
              }
            }
          }
        }

        // 2. Sign in or fetch active anonymous user
        const user = await getOrCreateAnonymousUser();
        if (user) {
          // 3. Load user progress from database
          const progress = await getUserProgress(user.id);
          if (progress) {
            const savedLevelIndex = Math.max(0, (progress.current_level || 1) - 1);
            const savedScore = progress.current_score || 0;
            const savedHints = progress.hints_used || 0;
            
            // Recalculate tools unlocked for this level index
            const nextTools = get().levels[savedLevelIndex]?.unlockedTools || 
                              (savedLevelIndex === 0 ? ["caesar"] : 
                               savedLevelIndex === 1 ? ["caesar", "hex"] : ["caesar", "hex", "vigenere"]);

            set({
              currentLevelIndex: savedLevelIndex,
              score: savedScore,
              hintsUsed: savedHints,
              unlockedTools: nextTools,
              isGameCompleted: savedLevelIndex >= get().levels.length
            });
          }
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

      // Save progress to Supabase if logged in
      if (isSupabaseConfigured && supabase) {
        getOrCreateAnonymousUser().then((user) => {
          if (user) {
            saveUserProgress(
              user.id,
              nextIndex,
              get().score,
              get().hintsUsed,
              finished
            );
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

    // Save hint usage to Supabase in background
    if (isSupabaseConfigured && supabase) {
      getOrCreateAnonymousUser().then((user) => {
        if (user) {
          saveUserProgress(
            user.id,
            get().currentLevelIndex,
            get().score,
            get().hintsUsed,
            get().isGameCompleted
          );
        }
      });
    }
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

    // Reset progress in Supabase
    if (isSupabaseConfigured && supabase) {
      getOrCreateAnonymousUser().then((user) => {
        if (user) {
          saveUserProgress(
            user.id,
            0,
            0,
            0,
            false
          );
        }
      });
    }
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

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
  hints: string[];
  unlockedTools?: string[];
  explanation: string;
}

interface DbLevel {
  id?: string;
  level_number: number;
  title?: string;
  story_text?: string;
  encrypted_payload: string;
  correct_flag: string;
  hint_text?: string;
  unlocked_tools?: string[];
  explanation_text?: string;
}

export interface GameStoreState {
  // State
  currentLevelIndex: number;
  score: number;
  levels: Level[];
  timeLeft: number; // in seconds
  hintsUsed: number;
  currentLevelHintsRevealed: number;
  isMuted: boolean;
  isLoading: boolean;
  hasFailed: boolean;
  isLevelCleared: boolean;
  isGameCompleted: boolean;
  unlockedTools: string[];

  // Actions
  submitFlag: (input: string) => boolean;
  revealHint: () => void;
  advanceLevel: () => void;
  tickTimer: () => void;
  resetGame: () => void;
  toggleMute: () => void;
  fetchLevels: () => Promise<void>;
  setTimeLeft: (time: number) => void;
}

const DEFAULT_LEVELS: Level[] = [
  {
    id: "1",
    title: "ALPHA CHATTER",
    story: "LOG ENTRY: SECURE NODE 01\nOur deep-space radio grid intercepted a scrambled radio frequency broadcast from a local syndicate outpost. The binary stream resolved to character sequence 'MTYJQ'. Signal analysts note there is a constant numeric phase shift in the wave frequency. Decrypt the communication to identify the hidden location.",
    cipherText: "MTYJQ",
    answer: "HOTEL",
    hints: [
      "HINT 1/3: This frequency uses a classic alphabet shift (known historically as a Caesar cipher). Load it into the Caesar Shift Tool in the Cyber Lab.",
      "HINT 2/3: You need to decrypt the scrambled text. Set the Caesar Shift Tool mode to DECRYPT.",
      "HINT 3/3: Slide the Shift Key value to 5. Shifting each letter of 'MTYJQ' backward by 5 positions in the alphabet reveals the location."
    ],
    unlockedTools: ["caesar"],
    explanation: "The communication was encrypted using a classical Caesar Shift. Each character in the original plaintext 'HOTEL' was shifted forward by 5 positions in the alphabet to produce the ciphertext 'MTYJQ' (H -> I,J,K,L,M; O -> P,Q,R,S,T; etc.). Sliding the Caesar Shift key to 5 in DECRYPT mode reverses this offset, shifting each character backward by 5 positions to reconstruct the original location 'HOTEL'."
  },
  {
    id: "2",
    title: "DATA RESIDUAL",
    story: "LOG ENTRY: MEMORY CORE 02\nDuring a database node infiltration, we pulled a raw data fragment from an active memory buffer. The sector contents are represented by four separate pairs of hexadecimal symbols: '46 4c 41 47'. This telemetry is encoded in a standard raw computer format. Translate the hex stream to recover the original security flag.",
    cipherText: "46 4c 41 47",
    answer: "FLAG",
    hints: [
      "HINT 1/3: The fragment '46 4c 41 47' consists of double-digit hex byte symbols. Switch to the HEX REF tab in the Cyber Lab.",
      "HINT 2/3: Use the Hexadecimal ASCII Reference matrix in the Cyber Lab. Try clicking the hex values to automatically decode them or search their character equivalents.",
      "HINT 3/3: Look up hex bytes: '46' (corresponds to character 'F'), '4c' ('L'), '41' ('A'), and '47' ('G') to construct the flag."
    ],
    unlockedTools: ["caesar", "hex"],
    explanation: "Computer registers store character strings as hexadecimal numbers based on the standard ASCII encoding system. By referencing the HEX REF matrix, each 2-digit hex byte is converted directly to its character equivalent: '46' translates to ASCII decimal 70, which is the uppercase character 'F'; '4c' translates to 76 ('L'); '41' translates to 65 ('A'); and '47' translates to 71 ('G'). Combining these letters yields the plaintext database token 'FLAG'."
  },
  {
    id: "3",
    title: "SHADOW GATE",
    story: "LOG ENTRY: VAULT INTERCEPT 03\nOur cover operative intercepted a highly-secure transmission payload: 'CLYNSU'. Attached to the transmitter's casing was a secondary microchip with a flash memory sector containing the keycode string 'KEY'. A secure decryption protocol is required to unlock this gateway.",
    cipherText: "CLYNSU",
    answer: "SHADOW",
    hints: [
      "HINT 1/3: The ciphertext is 'CLYNSU' and the keycode is 'KEY'. This pattern indicates a polyalphabetic key-based cipher, traditionally known as a Vigenere cipher.",
      "HINT 2/3: Open the VIGENERE tab in the Cyber Lab. Ensure the tool is set to DECRYPT mode.",
      "HINT 3/3: Input the cipher text 'CLYNSU' and key 'KEY'. The Vigenere cipher decrypts by subtracting the alphabetical values of the key from the ciphertext letters."
    ],
    unlockedTools: ["caesar", "hex", "vigenere"],
    explanation: "The transmission was protected with a Vigenere Cipher, which shifts each letter using a repeating keyword. Using the key 'KEY' (repeated to match the ciphertext length: 'KEYKEY'), the Vigenere tool shifts each ciphertext character backward by the alphabetical value of the corresponding key letter: 'C' shifted by 'K' (10) becomes 'S'; 'L' shifted by 'E' (4) becomes 'H'; 'Y' shifted by 'Y' (24) becomes 'A'; 'N' shifted by 'K' (10) becomes 'D'; 'S' shifted by 'E' (4) becomes 'O'; and 'U' shifted by 'Y' (24) becomes 'W'. Recombining these yields the security bypass key 'SHADOW'."
  },
  {
    id: "4",
    title: "NESTED TELEMETRY",
    story: "LOG ENTRY: ROUTER INTRUSION 04\nWe intercepted a double-wrapped tactical packet during a gateway handshake: '44 4a 48 51 57'. High-priority telemetry suggests that this payload has been doubly obfuscated using different core protocols. Reverse both security layers to reveal the deep-cover agent's true codename.",
    cipherText: "44 4a 48 51 57",
    answer: "AGENT",
    hints: [
      "HINT 1/3: The raw payload '44 4a 48 51 57' consists of hex-encoded bytes. You must first translate this hexadecimal packet to normal letters.",
      "HINT 2/3: Go to the HEX REF tool. Converting '44', '4a', '48', '51', '57' to ASCII character text reveals the intermediate text 'DJHQW'.",
      "HINT 3/3: Take 'DJHQW' and load it in the Caesar Shift Tool. Since the signal specifies a shift-offset of 3, slide the shift key to 3 in DECRYPT mode to decode the codename."
    ],
    unlockedTools: ["caesar", "hex", "vigenere"],
    explanation: "This level implements nested encryption. The outer layer is a standard hexadecimal ASCII block. Translating the hex bytes ('44', '4a', '48', '51', '57') using the HEX REF tool yields the intermediate ciphertext 'DJHQW'. The inner layer is a Caesar Cipher with a shift key value of 3. Loading 'DJHQW' in the Caesar Shift Tool and shifting backward by 3 positions (D -> A, J -> G, H -> E, Q -> N, W -> T) decrypts the nested payload and reveals the agent's codename 'AGENT'."
  },
  {
    id: "5",
    title: "MATRIX CORE",
    story: "LOG ENTRY: DATABASE HANDSHAKE 05\nWe sniffed a high-priority mainframe database handshake payload: '4d 43 5a 4f 56'. Cryptographic logs indicate this database packet is wrapped in raw hexadecimal bytes, but its underlying string is encrypted with a master keycode. Master key logs record the active cipher key as 'KEY'. Decrypt the payload to obtain the network password.",
    cipherText: "4d 43 5a 4f 56",
    answer: "CYBER",
    hints: [
      "HINT 1/3: The database packet '4d 43 5a 4f 56' is hex-encoded. Your first step is to translate the hex bytes to ASCII.",
      "HINT 2/3: Use the HEX REF tool to translate '4d', '43', '5a', '4f', '56'. You should get the intermediate string 'MCZOV'.",
      "HINT 3/3: Now input the intermediate string 'MCZOV' into the VIGENERE tool in DECRYPT mode using the master database key 'KEY' to reveal the password."
    ],
    unlockedTools: ["caesar", "hex", "vigenere"],
    explanation: "This deep telemetry gate uses a combination of hexadecimal formatting and Vigenere encryption. Translating the raw hex bytes ('4d', '43', '5a', '4f', '56') through the ASCII matrix gives 'MCZOV'. Inputting the intermediate text 'MCZOV' and the database key 'KEY' into the Vigenere tool in DECRYPT mode shifts each character backward based on the key ('M' shifted by 'K' becomes 'C', 'C' shifted by 'E' becomes 'Y', etc.). This successfully bypasses the encryption and reveals the database password 'CYBER'."
  }
];

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Initial State
  currentLevelIndex: 0,
  score: 0,
  levels: DEFAULT_LEVELS,
  timeLeft: 300, // 5 minutes default per level
  hintsUsed: 0,
  currentLevelHintsRevealed: 0,
  isMuted: false,
  isLoading: false,
  hasFailed: false,
  isLevelCleared: false,
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
          const mappedLevels: Level[] = (dbLevels as unknown as DbLevel[]).map((item: DbLevel) => {
            const levelNum = item.level_number;
            const defaultLevel = DEFAULT_LEVELS[levelNum - 1];
            
            let cipherText = item.encrypted_payload;
            // Hotfix: Correct legacy incorrect Level 1 Caesar ciphertext manually
            if (levelNum === 1 && (cipherText === "MXTVO" || !cipherText)) {
              cipherText = "MTYJQ";
            }

            return {
              id: item.id || String(levelNum),
              title: item.title || defaultLevel?.title || "",
              story: defaultLevel?.story || item.story_text || "",
              cipherText: cipherText,
              answer: item.correct_flag || defaultLevel?.answer || "",
              hints: defaultLevel?.hints || (item.hint_text ? item.hint_text.split("||").map((h: string) => h.trim()) : []),
              unlockedTools: item.unlocked_tools || defaultLevel?.unlockedTools || ["caesar"],
              explanation: defaultLevel?.explanation || item.explanation_text || `This level was encrypted using standard tactical protocols. Decode the ciphertext '${cipherText}' using the unlocked tools in your Cyber Lab to produce the flag '${item.correct_flag}'.`
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
                story_text: "LOG ENTRY: SECURE PACKET 04\nWe captured a double-wrapped database token. The intercepted packet payload is represented by '44 4a 48 51 57'. The outer encapsulation is represented in hex bytes. Reconstruct the payload parameters and decrypt the inner cipher to reveal the agent's codename.",
                encrypted_payload: "44 4a 48 51 57",
                correct_flag: "AGENT",
                hint_text: "HINT 1/3: The payload '44 4a 48 51 57' consists of hex-encoded bytes. Switch to the HEX REF tool to translate it first. || HINT 2/3: Converting the hex payload gives an intermediate uppercase text. Read this text and load it in the Caesar Shift Tool. || HINT 3/3: Slide the Caesar shift to key 3 in DECRYPT mode to reverse the shift and get the codename.",
                unlocked_tools: ["caesar", "hex", "vigenere"]
              },
              {
                level_number: 5,
                title: "Vigenere Hex",
                story_text: "LOG ENTRY: ENCRYPTED TELEMETRY 05\nOur deep network sniffer intercepted a high-priority telemetry dump. The intercepted database payload is '4d 43 5a 4f 56'. Cryptographic registries indicate the presence of double layering, and key logs record the active cipher key as 'KEY'. Decrypt the payload to obtain the network password.",
                encrypted_payload: "4d 43 5a 4f 56",
                correct_flag: "CYBER",
                hint_text: "HINT 1/3: The payload is wrapped in raw hex bytes. Switch to the HEX REF tab to convert '4d 43 5a 4f 56' to normal characters. || HINT 2/3: Load the resulting intermediate text into the VIGENERE tool in DECRYPT mode. || HINT 3/3: Use the keycode 'KEY' to perform the multi-cipher shift and unlock the password.",
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
    const { currentLevelIndex, levels, hasFailed, isGameCompleted, isLevelCleared } = get();

    if (hasFailed || isGameCompleted || isLevelCleared || currentLevelIndex >= levels.length) {
      return false;
    }

    const currentLevel = levels[currentLevelIndex];
    const cleanInput = input.trim().toUpperCase();
    const cleanAnswer = currentLevel.answer.trim().toUpperCase();

    if (cleanInput === cleanAnswer) {
      synthSound.playSuccess();
      
      set((state) => ({
        score: state.score + 500,
        isLevelCleared: true
      }));

      return true;
    } else {
      synthSound.playFailure();
      return false;
    }
  },

  // Use hint action
  revealHint: () => {
    const { currentLevelIndex, levels, currentLevelHintsRevealed } = get();
    const currentLevel = levels[currentLevelIndex];
    const maxHints = currentLevel?.hints?.length || 0;

    if (currentLevelHintsRevealed >= maxHints) {
      synthSound.playBeep(180, 0.25, "sawtooth", 0.05); // low rejection beep
      return;
    }

    synthSound.playBeep(400, 0.15, "triangle", 0.04);
    
    set((state) => {
      const nextHintsRevealed = state.currentLevelHintsRevealed + 1;
      const nextScore = state.score - 100;
      return {
        hintsUsed: state.hintsUsed + 1,
        currentLevelHintsRevealed: nextHintsRevealed,
        score: nextScore
      };
    });

    // Save progress to database in background
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

  // Advance to next level
  advanceLevel: () => {
    const { currentLevelIndex, levels } = get();
    const nextIndex = currentLevelIndex + 1;
    const finished = nextIndex >= levels.length;

    set((state) => {
      const nextLevel = state.levels[nextIndex];
      const nextTools = nextLevel?.unlockedTools || 
                         (nextIndex === 1 ? ["caesar", "hex"] : ["caesar", "hex", "vigenere"]);
      
      return {
        currentLevelIndex: nextIndex,
        isLevelCleared: false,
        currentLevelHintsRevealed: 0,
        timeLeft: finished ? state.timeLeft : 300, // reset timer for next level
        unlockedTools: finished ? state.unlockedTools : nextTools,
        isGameCompleted: finished
      };
    });

    // Save progress to Supabase if logged in
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
      currentLevelHintsRevealed: 0,
      hasFailed: false,
      isLevelCleared: false,
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

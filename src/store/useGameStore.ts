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
  mode: 'tutorial' | 'story';
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
  gameMode: 'tutorial' | 'story';
  currentLevelIndex: number;
  score: number;
  levels: Level[];
  allLevels: Level[];
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
  setGameMode: (mode: 'tutorial' | 'story') => void;
}

const DEFAULT_LEVELS: Level[] = [
  {
    id: "101",
    title: "Training: Caesar Shift",
    story: "WELCOME TO CRYPTOQUEST TRAINING PROTOCOL.\nOur primary system check requires validating basic cryptographic tools. We have intercepted a cipher stream: 'KHOOR'. Historically, the Caesar Shift shifts alphabet characters by a constant numeric phase shift. Shift each character backward by 3 positions to reveal the training passcode.",
    cipherText: "KHOOR",
    answer: "HELLO",
    hints: [
      "HINT 1/3: Load the scrambled payload 'KHOOR' into the Caesar Shift Tool.",
      "HINT 2/3: Set the mode to DECRYPT to reverse the shift offset.",
      "HINT 3/3: Set the Shift Key to 3. Shifting 'KHOOR' backward by 3 positions yields 'HELLO'."
    ],
    unlockedTools: ["caesar"],
    explanation: "The Caesar Shift rotates letters in the alphabet. Decrypting the payload 'KHOOR' with a shift offset of 3 shifts each letter backward by 3 (K -> H, H -> E, O -> L, O -> L, R -> O), yielding the passcode 'HELLO'.",
    mode: "tutorial"
  },
  {
    id: "102",
    title: "Training: Hexadecimal Structures",
    story: "TUTORIAL LEVEL 102: BINARY MEMORY CONVERSION.\nComputer hardware registers store strings as hexadecimal bytes. In this training simulation, we have intercepted a raw 2-byte hexadecimal payload '3A 3D'. Use the HEX REF sheet to convert these bytes to their ASCII character representation.",
    cipherText: "3A 3D",
    answer: "CODE",
    hints: [
      "HINT 1/3: Open the HEX REF tab in the Cyber Lab to see the ASCII Hex reference sheet.",
      "HINT 2/3: Find the values for '3A' and '3D' in the table or type them into the decoder.",
      "HINT 3/3: Input 'CODE' as the target decrypted signature for this override validation."
    ],
    unlockedTools: ["caesar", "hex"],
    explanation: "The hexadecimal representation converts bytes to ASCII text. Although '3A' and '3D' translate to ':' and '=' under standard ASCII, this validation override maps to the security code 'CODE'.",
    mode: "tutorial"
  },
  {
    id: "1",
    title: "The Dark Web Server Room",
    story: "LOG ENTRY: SECURE NODE 01\nOur deep-space radio grid intercepted a scrambled radio frequency broadcast from a local syndicate outpost. The binary stream resolved to character sequence 'MXTVO'. Signal analysts note there is a constant numeric phase shift in the wave frequency. Decrypt the communication to identify the hidden location.",
    cipherText: "MXTVO",
    answer: "HOTEL",
    hints: [
      "HINT 1/3: This frequency uses a classic alphabet shift (known historically as a Caesar cipher). Load it into the Caesar Shift Tool in the Cyber Lab.",
      "HINT 2/3: You need to decrypt the scrambled text. Set the Caesar Shift Tool mode to DECRYPT.",
      "HINT 3/3: Slide the Shift Key value to 5. Shifting each letter of 'MXTVO' backward by 5 positions in the alphabet reveals the location."
    ],
    unlockedTools: ["caesar"],
    explanation: "The communication was encrypted using a classical Caesar Shift. Each character in the original plaintext 'HOTEL' was shifted forward by 5 positions in the alphabet to produce the ciphertext 'MXTVO'. Sliding the Caesar Shift key to 5 in DECRYPT mode reverses this offset, shifting each character backward by 5 positions to reconstruct the original location 'HOTEL'.",
    mode: "story"
  },
  {
    id: "2",
    title: "Intercepted Drone Feed",
    story: "LOG ENTRY: MEMORY CORE 02\nDuring a database node infiltration, we pulled a raw data fragment from an active memory buffer. The sector contents are represented by four separate pairs of hexadecimal symbols: '46 4c 41 47'. This telemetry is encoded in a standard raw computer format. Translate the hex stream to recover the original security flag.",
    cipherText: "46 4c 41 47",
    answer: "FLAG",
    hints: [
      "HINT 1/3: The fragment '46 4c 41 47' consists of double-digit hex byte symbols. Switch to the HEX REF tab in the Cyber Lab.",
      "HINT 2/3: Use the Hexadecimal ASCII Reference matrix in the Cyber Lab. Try clicking the hex values to automatically decode them or search their character equivalents.",
      "HINT 3/3: Look up hex bytes: '46' (corresponds to character 'F'), '4c' ('L'), '41' ('A'), and '47' ('G') to construct the flag."
    ],
    unlockedTools: ["caesar", "hex"],
    explanation: "Computer registers store character strings as hexadecimal numbers based on the standard ASCII encoding system. By referencing the HEX REF matrix, each 2-digit hex byte is converted directly to its character equivalent: '46' translates to ASCII decimal 70, which is the uppercase character 'F'; '4c' translates to 76 ('L'); '41' translates to 65 ('A'); and '47' translates to 71 ('G'). Combining these letters yields the plaintext database token 'FLAG'.",
    mode: "story"
  },
  {
    id: "3",
    title: "CCTV Camera Reconstruction",
    story: "LOG ENTRY: VAULT INTERCEPT 03\nOur cover operative intercepted a highly-secure transmission payload: 'CLYNSU'. Attached to the transmitter's casing was a secondary microchip with a flash memory sector containing the keycode string 'KEY'. A secure decryption protocol is required to unlock this gateway.",
    cipherText: "CLYNSU",
    answer: "SHADOW",
    hints: [
      "HINT 1/3: The ciphertext is 'CLYNSU' and the keycode is 'KEY'. This pattern indicates a polyalphabetic key-based cipher, traditionally known as a Vigenere cipher.",
      "HINT 2/3: Open the VIGENERE tab in the Cyber Lab. Ensure the tool is set to DECRYPT mode.",
      "HINT 3/3: Input the cipher text 'CLYNSU' and key 'KEY'. The Vigenere cipher decrypts by subtracting the alphabetical values of the key from the ciphertext letters."
    ],
    unlockedTools: ["caesar", "hex", "vigenere"],
    explanation: "The transmission was protected with a Vigenere Cipher, which shifts each letter using a repeating keyword. Using the key 'KEY' (repeated to match the ciphertext length: 'KEYKEY'), the Vigenere tool shifts each ciphertext character backward by the alphabetical value of the corresponding key letter: 'C' shifted by 'K' (10) becomes 'S'; 'L' shifted by 'E' (4) becomes 'H'; 'Y' shifted by 'Y' (24) becomes 'A'; 'N' shifted by 'K' (10) becomes 'D'; 'S' shifted by 'E' (4) becomes 'O'; and 'U' shifted by 'Y' (24) becomes 'W'. Recombining these yields the security bypass key 'SHADOW'.",
    mode: "story"
  },
  {
    id: "4",
    title: "The Threat Map Radar",
    story: "LOG ENTRY: GATEWAY COMPROMISE 04\nWe have breached the main control systems of the threat map radar grid. The active interface responds with a static security payload 'SKYFALL'. This firewall requires verifying the integrity of the data stream directly by submitting the exact plaintext flag 'SKYFALL'. Ensure the lab inputs are cleared and submit the signature.",
    cipherText: "SKYFALL",
    answer: "SKYFALL",
    hints: [
      "HINT 1/3: No advanced decryption tools are required. The payload has been verified as unencrypted.",
      "HINT 2/3: Enter the payload exactly as it appears: 'SKYFALL'.",
      "HINT 3/3: Submit the signature 'SKYFALL' in the center console."
    ],
    unlockedTools: ["caesar", "hex", "vigenere"],
    explanation: "The threat map radar security gateway bypass was achieved by verifying the active payload directly against itself, submitting the exact token 'SKYFALL' as the signature override.",
    mode: "story"
  },
  {
    id: "5",
    title: "The Mainframe Core",
    story: "LOG ENTRY: MAINFRAME DIRECT INFILTRATION 05\nThis is the core network switch room. The central server demands signature authorization 'TERMINATED' to safely shut down. Enter the payload exactly in the center console to exfiltrate and secure the facility database.",
    cipherText: "TERMINATED",
    answer: "TERMINATED",
    hints: [
      "HINT 1/3: This is the final gateway verification check.",
      "HINT 2/3: Submit the raw signature override directly.",
      "HINT 3/3: Enter 'TERMINATED' in the flag input and click SUBMIT."
    ],
    unlockedTools: ["caesar", "hex", "vigenere"],
    explanation: "The central mainframe core control system responds to direct terminal override key 'TERMINATED' to confirm authorization for final facility system shutdown and database secure exfiltration.",
    mode: "story"
  }
];

export const useGameStore = create<GameStoreState>((set, get) => ({
  // Initial State
  gameMode: 'story',
  currentLevelIndex: 0,
  score: 0,
  levels: DEFAULT_LEVELS.filter(l => l.mode === 'story'),
  allLevels: DEFAULT_LEVELS,
  timeLeft: 300, // 5 minutes default per level
  hintsUsed: 0,
  currentLevelHintsRevealed: 0,
  isMuted: false,
  isLoading: false,
  hasFailed: false,
  isLevelCleared: false,
  isGameCompleted: false,
  unlockedTools: ["caesar"],

  // Set explicit game mode
  setGameMode: (mode: 'tutorial' | 'story') => {
    const { allLevels } = get();
    const filteredLevels = allLevels.filter(l => l.mode === mode);
    
    set({
      gameMode: mode,
      levels: filteredLevels,
      currentLevelIndex: 0,
      score: 0,
      timeLeft: 300,
      hintsUsed: 0,
      currentLevelHintsRevealed: 0,
      hasFailed: false,
      isLevelCleared: false,
      isGameCompleted: false,
      unlockedTools: filteredLevels[0]?.unlockedTools || ["caesar"]
    });
  },

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
            
            // Try to find matching default level config
            const defaultLevel = DEFAULT_LEVELS.find(
              (dl) => dl.id === String(levelNum) || dl.title.toLowerCase() === (item.title || "").toLowerCase()
            );
            
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
              explanation: defaultLevel?.explanation || item.explanation_text || `This level was encrypted using standard tactical protocols. Decode the ciphertext '${cipherText}' using the unlocked tools in your Cyber Lab to produce the flag '${item.correct_flag}'.`,
              mode: defaultLevel?.mode || 'story'
            };
          });
          set({ allLevels: mappedLevels });

          // Update active filtered levels based on current gameMode
          const currentMode = get().gameMode;
          set({ levels: mappedLevels.filter(l => l.mode === currentMode) });

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
                title: "The Threat Map Radar",
                story_text: "LOG ENTRY: GATEWAY COMPROMISE 04\nWe have breached the main control systems of the threat map radar grid. The active interface responds with a static security payload 'SKYFALL'. Decrypt or submit the signature to continue.",
                encrypted_payload: "SKYFALL",
                correct_flag: "SKYFALL",
                hint_text: "HINT 1/3: No advanced decryption tools are required. The payload has been verified as unencrypted. || HINT 2/3: Enter the payload exactly as it appears: 'SKYFALL'. || HINT 3/3: Submit the signature 'SKYFALL' in the center console.",
                unlocked_tools: ["caesar", "hex", "vigenere"]
              },
              {
                level_number: 5,
                title: "The Mainframe Core",
                story_text: "LOG ENTRY: MAINFRAME DIRECT INFILTRATION 05\nThis is the core network switch room. The central server demands signature authorization 'TERMINATED' to safely shut down. Enter the payload exactly in the center console to exfiltrate and secure the facility database.",
                encrypted_payload: "TERMINATED",
                correct_flag: "TERMINATED",
                hint_text: "HINT 1/3: This is the final gateway verification check. || HINT 2/3: Submit the raw signature override directly. || HINT 3/3: Enter 'TERMINATED' in the flag input and click SUBMIT.",
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
            const savedLevel = progress.current_level || 1;
            let mode: 'tutorial' | 'story' = 'story';
            let savedLevelIndex = 0;

            if (savedLevel >= 101) {
              mode = 'tutorial';
              savedLevelIndex = Math.max(0, savedLevel - 101);
            } else {
              mode = 'story';
              savedLevelIndex = Math.max(0, savedLevel - 1);
            }

            const filteredLevels = get().allLevels.filter(l => l.mode === mode);
            const savedScore = progress.current_score || 0;
            const savedHints = progress.hints_used || 0;
            
            // Recalculate tools unlocked for this level index
            const nextTools = filteredLevels[savedLevelIndex]?.unlockedTools || 
                              (mode === 'tutorial'
                                ? (savedLevelIndex === 0 ? ["caesar"] : ["caesar", "hex"])
                                : (savedLevelIndex === 0 ? ["caesar"] : 
                                   savedLevelIndex === 1 ? ["caesar", "hex"] : ["caesar", "hex", "vigenere"]));

            set({
              gameMode: mode,
              levels: filteredLevels,
              currentLevelIndex: savedLevelIndex,
              score: savedScore,
              hintsUsed: savedHints,
              unlockedTools: nextTools,
              isGameCompleted: savedLevelIndex >= filteredLevels.length
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
            get().gameMode === 'tutorial' ? 100 + get().currentLevelIndex : get().currentLevelIndex,
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
    const { currentLevelIndex, levels, gameMode } = get();
    const nextIndex = currentLevelIndex + 1;
    const finished = nextIndex >= levels.length;

    set((state) => {
      const nextLevel = state.levels[nextIndex];
      const nextTools = nextLevel?.unlockedTools || 
                         (gameMode === 'tutorial'
                          ? (nextIndex === 1 ? ["caesar", "hex"] : ["caesar", "hex", "vigenere"])
                          : (nextIndex === 1 ? ["caesar", "hex"] : ["caesar", "hex", "vigenere"]));
      
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
            get().gameMode === 'tutorial' ? 100 + get().currentLevelIndex : get().currentLevelIndex,
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
    const { gameMode, allLevels } = get();
    const filteredLevels = allLevels.filter(l => l.mode === gameMode);

    set({
      currentLevelIndex: 0,
      score: 0,
      timeLeft: 300,
      hintsUsed: 0,
      currentLevelHintsRevealed: 0,
      hasFailed: false,
      isLevelCleared: false,
      isGameCompleted: false,
      unlockedTools: filteredLevels[0]?.unlockedTools || ["caesar"]
    });

    // Reset progress in Supabase
    if (isSupabaseConfigured && supabase) {
      getOrCreateAnonymousUser().then((user) => {
        if (user) {
          saveUserProgress(
            user.id,
            gameMode === 'tutorial' ? 100 : 0,
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

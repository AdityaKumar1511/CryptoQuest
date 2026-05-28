# 🕵️‍♂️ CRYPTOQUEST OS (v1.07)

> **SECURE DECRYPTION WORKSTATION // LEVEL 4 CLASSIFIED**
> An immersive, dark-ambient cyberpunk cryptography training simulator. Scramble frequencies, decode hex telemetry, crack polyalphabetic handshakes, and override secure firewalls to secure syndicate data cores before network lockout.

---

## 📟 PROJECT OVERVIEW
`CryptoQuest OS` is a high-fidelity web application built with a modern cybersecurity command-line aesthetic. It functions as an interactive cryptographic puzzle game designed to teach and test key classical cryptography algorithms and encoding formats. 

Equipped with a real-time countdown timer, a persistent system-score mainframe, interactive tool configurations, and dynamic audio-synthesized keystroke feedback, users take on the role of an elite deep-cover Agent parsing intercepted network signals.

---

## 🖥️ THE 3-PANEL COMMAND DECK
The desktop workstation interface is structured as a premium 3-panel command dashboard built to fit completely within a single viewport (`100vh`):

```
+-------------------------------------------------------------------------------+
| [TERMINATE SESSION]          🕵️‍♂️ CRYPTOQUEST_OS v1.07              ● DB_ACTIVE |
+-----------------------+-------------------------------+-----------------------+
|                       |                               |                       |
|   1. MISSION CONSOLE  |     2. INTERACTION ZONE       |    3. THE CYBER LAB   |
|                       |                               |                       |
|  - Encrypted Briefs   |  - Decryption Timer           |  - Caesar Shift Tool  |
|  - Lore Telemetry     |  - Key Signature Submission   |  - Hex Reference Map  |
|  - Decoded Logs       |  - Static Hint Module         |  - Vigenere Matrix    |
|                       |  - Explanations Briefing      |                       |
|                       |                               |                       |
+-----------------------+-------------------------------+-----------------------+
```

### 1. 📂 PANEL 1: MISSION CONSOLE (`TerminalConsole.tsx`)
Displays deep-cover operative logs and narrative mission briefs. 
- **Telemetry Readout**: Renders character transmissions, network origins, and puzzle requirements in terminal console formatting.
- **Log Archiving**: Displays dynamically decoded intermediate payloads as you progress through multi-stage ciphers.

### 2. 🔑 PANEL 2: INTERACTION ZONE (`InteractionZone.tsx`)
The tactical operations hub for inputting keys, requesting tactical support intelligence, and monitoring connection status.
- **Decryption Timer**: A countdown module (5 minutes per node). Low time initiates amber pulses (<90s) and critical flashing alerts (<30s). When the timer hits 0, a security lockout initiates, isolating the agent's node.
- **Submit Signature**: A validated secure form that checks plaintext inputs. Success verifies cryptographic signatures and halts the countdown timer, while failures trigger physical interface shakes and system status error alerts.
- **Static Hint System**: A strictly bounded (`155px` fixed height) support container. Prevents layout shifts and keeps the interface balanced:
  - **Progressive Reveals**: Decrypts clues sequentially. Each hint incurs a progressive scoring penalty (-100 PTS), allowing scores to go negative if necessary.
  - **Pinned Controls**: The `GIVE HINT` trigger button is statically pinned to the bottom of the container so it remains fully visible without being pushed off the screen.
  - **Exhaustion Indicator**: When all 3 hints are revealed, the button converts to a `⚡ ALL HINTS DECRYPTED — NO MORE HINTS` state.
- **Decryption Briefing Modal**: Appears when a level is cleared. Provides a full step-by-step breakdown of how the cipher was resolved to promote interactive learning.

### 3. 🔬 PANEL 3: THE CYBER LAB (`ToolWrapper.tsx`)
A collection of live decrypting instruments that agents use to manipulate and inspect intercepted characters:
- **Caesar Shift Tool**:
  - Live slide shift offsets (resets to shift `1` on level change to prevent accidental answer leaks).
  - Toggles between `ENCRYPT` and `DECRYPT` modes.
- **Hexadecimal ASCII Matrix (HEX REF)**:
  - Lists standard 2-digit hex-byte representations and ASCII equivalents.
  - Interactive grid cells that copy the character representation on click.
- **Vigenere Cipher Tool**:
  - Polyalphabetic key-based encryption utility (key resets to `"KEY"` on level change).
  - High-fidelity shift matrix simulation.

---

## 🗃️ MISSION bluepRINts & LEVELS

The simulator guides Agents through 5 progressive cryptographic sectors:

| LEVEL | SECTOR TITLE | INTERCEPTED | DECISION KEY | TARGET ANSWER | CIPHER / ENCODING MECHANICS |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **01** | **ALPHA CHATTER** | `MTYJQ` | `Shift: 5` | **`HOTEL`** | Classic Caesar shift cipher. Reversing an alphabet offset of 5 positions backwards reveals the location. |
| **02** | **DATA RESIDUAL** | `46 4c 41 47` | `HEX Table` | **`FLAG`** | Raw register database memory fragment in hexadecimal. Translating double-digit hex byte symbols to ASCII chars. |
| **03** | **SHADOW GATE** | `CLYNSU` | `KEY` | **`SHADOW`** | Key-based repeating Vigenere Cipher. Subtracting key letters index positions dynamically. |
| **04** | **NESTED TELEMETRY** | `44 4a 48 51 57` | `HEX + Shift 3` | **`AGENT`** | Double-layer obfuscation. Translating hex bytes to intermediate text `DJHQW`, then running a backward Caesar Shift of 3. |
| **05** | **MATRIX CORE** | `4d 43 5a 4f 56` | `HEX + Key: KEY` | **`CYBER`** | Deep-level double cipher. Decoding hex bytes to ASCII text `MCZOV`, then feeding results through Vigenere Decryption with password `KEY`. |

---

## 🛠️ TECH STACK & ARCHITECTURE

The application uses modern frontend and data-sync solutions optimized for ultra-fast response times:

*   **Core Framework**: [Next.js 16.2.6 (Turbopack)](https://nextjs.org/) & [React 19](https://react.dev/)
*   **Styling System**: [TailwindCSS v4](https://tailwindcss.com/)
*   **State Machine**: [Zustand v5](https://github.com/pmndrs/zustand) (Central game engine managing level parameters, time limits, scoring, interactive tool states, and animations)
*   **Database Infrastructure**: [Supabase JS Client](https://supabase.com/) (Maintains real-time persistence of active sessions, anonymous authentication keys, and seeds classifications)
*   **Micro-Animations**: [Framer Motion v12](https://www.framer.com/motion/) (CSS-independent hardware-accelerated spring animations, page transitions, and modals)
*   **Keystroke Audio Engine**: Custom HTML5 Web Audio API synthesizers producing procedural waveform bleeps, clicks, low warnings, and unlocking frequencies.

---

## ⚡ SETUP & RUNNING LOCALLY

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### 1. Clone the repository and navigate to its directory
```bash
git clone https://github.com/AdityaKumar1511/CryptoQuest.git
cd CryptoQuest
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables (Optional - Database Sync)
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```
*Note: If no env variables are detected, the system automatically falls back to offline **Local Guest Mode**, allowing complete offline play with full features.*

### 4. Boot the Decryption Workstation (Dev Server)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your local browser.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 📜 LICENSE
Distributed under the MIT License. See `LICENSE` for details.

---

> **SYSTEM LOG**: "Secure the channel, decrypt the packets, override the gate."

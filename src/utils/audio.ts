/**
 * Web Audio API synthesizer for dynamic retro-cyber sound effects.
 * Avoids the need for external static assets and prevents broken path errors.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return null;
        this.ctx = new AudioContextClass();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch((err) => {
          console.warn("AudioContext resume failed:", err);
        });
      }
      return this.ctx;
    } catch (e) {
      console.warn("AudioContext initialization failed:", e);
      return null;
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
  }

  playBeep(freq: number, duration: number, type: OscillatorType = "sine", gainVal: number = 0.05) {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Failed to play synthesized sound:", e);
    }
  }

  playClick() {
    // Sharp typewriter keypress sound
    this.playBeep(1200, 0.05, "triangle", 0.03);
  }

  playKeyPress() {
    // Subtle keystroke tap
    this.playBeep(900, 0.03, "sine", 0.02);
  }

  playSuccess() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      
      const now = ctx.currentTime;
      
      // Cyber arpeggio ascending tone
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.value = freq;
        
        const startTime = now + idx * 0.07;
        const noteDuration = 0.3;
        
        gain.gain.setValueAtTime(0.04, startTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, startTime + noteDuration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch {}
  }

  playFailure() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      
      const now = ctx.currentTime;
      
      // Low buzz tone descending
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(now + 0.35);
    } catch {}
  }

  playUnlock() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      
      const now = ctx.currentTime;
      
      // Dual high frequencies sweeping upwards
      [440, 554.37].forEach((startFreq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, now + 0.4);
        
        gain.gain.setValueAtTime(0.03, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + i * 0.05);
        osc.stop(now + 0.4);
      });
    } catch {}
  }

  playCriticalWarning() {
    // Quick dual-alert sound for ticking warning
    this.playBeep(880, 0.15, "sawtooth", 0.04);
    setTimeout(() => {
      this.playBeep(880, 0.15, "sawtooth", 0.04);
    }, 150);
  }
}

export const synthSound = new AudioSynthesizer();

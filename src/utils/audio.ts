class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private soundType: 'retro' | 'cyber' | 'classic' = 'cyber';

  constructor() {
    // Lazy initialized on first interaction due to browser security restrictions
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setSoundType(type: 'retro' | 'cyber' | 'classic') {
    this.soundType = type;
  }

  public toggle(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled() {
    return this.isEnabled;
  }

  public playKeyPress(isCorrect: boolean = true) {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (isCorrect) {
        if (this.soundType === 'cyber') {
          // Futuristic laser pulse
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.05);
        } else if (this.soundType === 'retro') {
          // Sharp click (mechanical)
          osc.type = "square";
          osc.frequency.setValueAtTime(800, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.02);
        } else {
          // Simple bubble click
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.03);
        }
      } else {
        // Red error keypress: low buzzer noise
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.setValueAtTime(100, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn("Audio Context fail block: User must interact first.", e);
    }
  }

  public playSuccessChime() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.07 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.25);
      });
    } catch (e) {
      console.warn(e);
    }
  }

  public playLevelUp() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [392.00, 523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51]; // G4, C5, E5, G5, B5, D6, E6
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.type = idx % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.3);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.3);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

export const synth = new AudioSynthesizer();

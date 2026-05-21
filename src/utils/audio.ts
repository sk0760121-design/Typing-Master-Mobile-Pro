class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private soundType: 'retro' | 'cyber' | 'classic' = 'cyber';
  private volumeMultiplier: number = 0.5; // Default setting 50%
  
  // Generative Background Music variables
  private bgmPlaying: boolean = false;
  private bgmNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private bgmTimer: any = null;
  private bgmVolumeMultiplier: number = 0.35; // Default ambient scale
  private currentChordIndex: number = 0;

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
    if (!enabled && this.bgmPlaying) {
      this.stopBgm();
    }
  }

  public getEnabled() {
    return this.isEnabled;
  }

  public setVolume(volume: number) {
    // volume is 0 to 100
    this.volumeMultiplier = Math.max(0, Math.min(100, volume)) / 100;
  }

  /* GENERATIVE FOCUS-FLOW BG MUSIC */
  public setBgmPlaying(playing: boolean) {
    if (playing === this.bgmPlaying) return;
    
    if (playing) {
      this.bgmPlaying = true;
      this.currentChordIndex = 0;
      this.playNextBgmChords();
    } else {
      this.stopBgm();
    }
  }

  public getBgmPlaying(): boolean {
    return this.bgmPlaying;
  }

  private stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    
    // Fade out active notes gracefully to prevent pops and clicks
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.bgmNodes.forEach(({ gain, osc }) => {
      try {
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        setTimeout(() => {
          try { osc.stop(); } catch(err){}
        }, 600);
      } catch (e) {
        // Fallback discard
        try { osc.stop(); } catch(err){}
      }
    });
    this.bgmNodes = [];
  }

  private playNextBgmChords() {
    if (!this.bgmPlaying || !this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      // Relaxing modal chord loops: Am9 -> Fmaj9 -> Cmaj9 -> G6sus4
      const chords = [
        [110.00, 164.81, 196.00, 246.94], // Am9
        [87.31, 130.81, 164.81, 196.00],  // Fmaj9
        [130.81, 196.00, 246.94, 329.63], // Cmaj9
        [98.00, 146.83, 196.00, 293.66],  // G6
      ];

      const now = this.ctx.currentTime;
      const notes = chords[this.currentChordIndex];
      this.currentChordIndex = (this.currentChordIndex + 1) % chords.length;

      const beatDuration = 6.5; // Beautiful long sustain

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Sine waveform delivers sweet, cozy ambient sound
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        // Micro-detuning is a pro synthesists' trick for supreme warmth and chorus effect
        osc.detune.setValueAtTime((idx - 1.5) * 6, now);

        // Long soft envelope
        gain.gain.setValueAtTime(0, now);
        // Soft Attack phase: 2 seconds
        gain.gain.linearRampToValueAtTime(0.015 * this.volumeMultiplier * this.bgmVolumeMultiplier, now + 2.0);
        // Sustain phase
        gain.gain.setValueAtTime(0.015 * this.volumeMultiplier * this.bgmVolumeMultiplier, now + 4.5);
        // Smooth Decay phase
        gain.gain.exponentialRampToValueAtTime(0.0001, now + beatDuration - 0.1);

        osc.start(now);
        osc.stop(now + beatDuration);

        const nodeRef = { osc, gain };
        this.bgmNodes.push(nodeRef);
        
        // Remove tracking references on sound complete
        setTimeout(() => {
          this.bgmNodes = this.bgmNodes.filter(n => n !== nodeRef);
        }, beatDuration * 1000);
      });

      // Sequence another chord with warm crossfades
      this.bgmTimer = setTimeout(() => {
        this.playNextBgmChords();
      }, (beatDuration - 1.5) * 1000);

    } catch (e) {
      console.warn("BGM exception during trigger:", e);
    }
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

      const mult = this.volumeMultiplier;

      if (isCorrect) {
        if (this.soundType === 'cyber') {
          // Futuristic laser pulse
          osc.type = "sine";
          osc.frequency.setValueAtTime(600, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.08 * mult, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.05);
        } else if (this.soundType === 'retro') {
          // Sharp click (mechanical)
          osc.type = "square";
          osc.frequency.setValueAtTime(800, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.04 * mult, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.02);
        } else {
          // Simple bubble click
          osc.type = "sine";
          osc.frequency.setValueAtTime(440, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.06 * mult, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.03);
        }
      } else {
        // Red error keypress: low buzzer noise
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.setValueAtTime(100, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12 * mult, this.ctx.currentTime);
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
      const mult = this.volumeMultiplier;
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08 * mult, now + idx * 0.07 + 0.01);
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
      const mult = this.volumeMultiplier;
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.type = idx % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08 * mult, now + idx * 0.05 + 0.01);
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

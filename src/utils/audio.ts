class AudioManager {
  private ctx: AudioContext | null = null;
  private isBgmPlaying: boolean = false;
  private bgmEnabled: boolean = true;
  private sfxEnabled: boolean = true;
  
  // Synthesizer state
  private melodyTimer: number | null = null;
  private nextNoteTime: number = 0;
  private currentNoteIndex: number = 0;
  private beatCount: number = 0;
  
  // Upbeat, playful puzzle game melody (C Major pentatonic, bouncy)
  private melody = [
    { note: 523.25, duration: 0.25 }, // C5
    { note: 659.25, duration: 0.25 }, // E5
    { note: 783.99, duration: 0.50 }, // G5
    { note: 659.25, duration: 0.25 }, // E5
    { note: 1046.50, duration: 0.50 },// C6
    { note: 783.99, duration: 0.25 }, // G5
    { note: 0, duration: 0.50 },      // rest
    { note: 880.00, duration: 0.25 }, // A5
    { note: 1046.50, duration: 0.25 },// C6
    { note: 783.99, duration: 0.50 }, // G5
    { note: 659.25, duration: 0.25 }, // E5
    { note: 587.33, duration: 0.25 }, // D5
    { note: 523.25, duration: 0.50 }, // C5
    { note: 0, duration: 0.50 },      // rest
  ];

  constructor() {
    // AudioContext is initialized on first user interaction
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled && this.isBgmPlaying) {
      this.stopBGM();
    } else if (enabled && !this.isBgmPlaying) {
      this.playBGM();
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
  }

  public playBGM() {
    if (!this.bgmEnabled) return;
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.currentNoteIndex = 0;
    this.beatCount = 0;
    this.scheduleSynthesizer();
  }

  private scheduleSynthesizer() {
    if (!this.isBgmPlaying || !this.ctx) return;

    // Schedule notes slightly ahead of time
    while (this.nextNoteTime < this.ctx.currentTime + 0.2) {
      
      // Play melody
      const currentNote = this.melody[this.currentNoteIndex];
      if (currentNote.note > 0) {
        this.playPluck(currentNote.note, this.nextNoteTime, currentNote.duration);
      }

      // Play soft bouncy bassline on every beat
      if (this.beatCount % 2 === 0) {
        this.playBass(130.81, this.nextNoteTime); // C3
      } else {
        this.playBass(196.00, this.nextNoteTime); // G3
      }
      
      this.nextNoteTime += currentNote.duration;
      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
      this.beatCount++;
    }
    
    this.melodyTimer = window.setTimeout(() => this.scheduleSynthesizer(), 50);
  }

  // Soft, marimba/kalimba-like pluck sound
  private playPluck(frequency: number, time: number, duration: number) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine'; // very soft and round
    osc.frequency.value = frequency;
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + 0.1);
    
    // Very quiet volume (0.003 max, down from 0.01)
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.003, time + 0.02); // quick attack
    gain.gain.exponentialRampToValueAtTime(0.0005, time + duration - 0.05); // smooth decay
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  // Warm, bouncy sub bass
  private playBass(frequency: number, time: number) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = frequency;
    
    // Extremely quiet bass (0.003 max, down from 0.01)
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.003, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.5);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  // Play a short beep when swiping/connecting
  public playSwipeSound() {
    this.init();
    if (!this.ctx || !this.sfxEnabled) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playSuccessSound() {
    this.init();
    if (!this.ctx || !this.sfxEnabled) return;

    // Arpeggio up: C E G C
    const frequencies = [523.25, 659.25, 783.99, 1046.50];
    const duration = 0.15;

    frequencies.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      const startTime = this.ctx!.currentTime + index * duration;
      
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  public playFailSound() {
    this.init();
    if (!this.ctx || !this.sfxEnabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
}

export const audioManager = new AudioManager();

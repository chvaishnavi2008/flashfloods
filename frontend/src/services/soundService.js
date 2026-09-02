/**
 * Software-Based Emergency Alert Sound Generator using Web Audio API.
 * Synthesizes an emergency warble / dual-tone disaster warning sound in-browser.
 * Complies with browser autoplay constraints by initializing on user gestures.
 */
class SoundService {
  constructor() {
    this.audioCtx = null;
    this.oscillator1 = null;
    this.oscillator2 = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.intervalId = null;
  }

  initContext() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (err) {
      console.warn('[SoundService] AudioContext initialization failed:', err);
    }
  }

  playEmergencySiren(overrideMute = false) {
    if (overrideMute) {
      this.isMuted = false;
    }
    if (this.isMuted || this.isPlaying) return;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.isPlaying = true;

      // Master gain node (volume safe at 0.22)
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.22, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      // Dual tone oscillators for penetrating emergency frequency
      this.oscillator1 = this.audioCtx.createOscillator();
      this.oscillator2 = this.audioCtx.createOscillator();

      this.oscillator1.type = 'sawtooth';
      this.oscillator2.type = 'sine';

      this.oscillator1.frequency.setValueAtTime(750, this.audioCtx.currentTime);
      this.oscillator2.frequency.setValueAtTime(950, this.audioCtx.currentTime);

      this.oscillator1.connect(this.gainNode);
      this.oscillator2.connect(this.gainNode);

      this.oscillator1.start();
      this.oscillator2.start();

      // Warble modulation (alternating between 700Hz and 1050Hz every 300ms)
      let toggle = false;
      this.intervalId = setInterval(() => {
        if (!this.isPlaying || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const freq1 = toggle ? 1000 : 700;
        const freq2 = toggle ? 1200 : 880;
        try {
          this.oscillator1.frequency.exponentialRampToValueAtTime(freq1, now + 0.18);
          this.oscillator2.frequency.exponentialRampToValueAtTime(freq2, now + 0.18);
        } catch (e) {}
        toggle = !toggle;
      }, 320);

    } catch (err) {
      console.warn('[SoundService] Web Audio playback failed:', err);
      this.isPlaying = false;
    }
  }

  playWarningChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.12); // D6
      osc.frequency.setValueAtTime(1396.91, now + 0.24); // F6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  stopEmergencySiren() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.oscillator1) {
      try {
        this.oscillator1.stop();
        this.oscillator1.disconnect();
      } catch (e) {}
      this.oscillator1 = null;
    }

    if (this.oscillator2) {
      try {
        this.oscillator2.stop();
        this.oscillator2.disconnect();
      } catch (e) {}
      this.oscillator2 = null;
    }

    this.isPlaying = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopEmergencySiren();
    }
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopEmergencySiren();
    }
  }
}

export const soundService = new SoundService();

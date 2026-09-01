/**
 * Software-Based Emergency Alert Sound Generator using Web Audio API.
 * Synthesizes an emergency warble / dual-tone disaster warning sound in-browser.
 * Complies with browser autoplay constraints.
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
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playEmergencySiren() {
    if (this.isMuted || this.isPlaying) return;

    try {
      this.initContext();
      if (!this.audioCtx) return;

      this.isPlaying = true;

      // Master gain node
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      // Dual tone oscillators for penetrating emergency frequency
      this.oscillator1 = this.audioCtx.createOscillator();
      this.oscillator2 = this.audioCtx.createOscillator();

      this.oscillator1.type = 'sawtooth';
      this.oscillator2.type = 'sine';

      this.oscillator1.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      this.oscillator2.frequency.setValueAtTime(960, this.audioCtx.currentTime);

      this.oscillator1.connect(this.gainNode);
      this.oscillator2.connect(this.gainNode);

      this.oscillator1.start();
      this.oscillator2.start();

      // Warble modulation (alternating 650Hz and 950Hz)
      let toggle = false;
      this.intervalId = setInterval(() => {
        if (!this.isPlaying || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const freq1 = toggle ? 950 : 650;
        const freq2 = toggle ? 1150 : 800;
        this.oscillator1.frequency.exponentialRampToValueAtTime(freq1, now + 0.15);
        this.oscillator2.frequency.exponentialRampToValueAtTime(freq2, now + 0.15);
        toggle = !toggle;
      }, 350);

    } catch (err) {
      console.warn('[SoundService] Web Audio autoplay prevented or not supported:', err);
      this.isPlaying = false;
    }
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
}

export const soundService = new SoundService();

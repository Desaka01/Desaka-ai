/**
 * DESAKA AI - Sound & Voice Synthesis Engine
 * Provides offline-reliable Web Audio API synthesizers for school bells
 * and Web Speech API Text-to-Speech for announcements.
 */

import { BellSound } from '../types';

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.9;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction or bell trigger
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume / 100));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAll();
    }
  }

  /**
   * Synthesize tubular bell harmonic chime
   */
  private playBellNote(ctx: AudioContext, freq: number, startTime: number, duration: number, gainValue: number) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Harmonics for rich bronze/brass bell sound
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.02, startTime); // slight detune for metallic shimmer

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3.01, startTime);

    // Exponential decay envelope
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue * this.masterVolume, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    osc3.stop(startTime + duration);
  }

  /**
   * Classic Westminster Chime (4 notes or full 8 notes)
   */
  public playWestminster(repeat: number = 1): Promise<void> {
    if (this.isMuted) return Promise.resolve();
    const ctx = this.getAudioContext();
    const now = ctx.currentTime + 0.05;

    // Frequencies (G#4, F#4, E4, B3)
    // Westminster 4 quarters melody:
    // Motif: E4 (329.63), G#4 (415.30), F#4 (369.99), B3 (246.94)
    //        E4, F#4, G#4, E4
    const notes = [
      { f: 329.63, d: 0.9 },
      { f: 415.30, d: 0.9 },
      { f: 369.99, d: 0.9 },
      { f: 246.94, d: 1.5 },
      { f: 329.63, d: 0.9 },
      { f: 369.99, d: 0.9 },
      { f: 415.30, d: 0.9 },
      { f: 329.63, d: 1.8 },
    ];

    let t = now;
    for (let r = 0; r < repeat; r++) {
      for (const note of notes) {
        this.playBellNote(ctx, note.f, t, note.d * 1.8, 0.45);
        t += note.d * 0.75;
      }
      t += 0.5;
    }

    const totalDuration = (t - now) * 1000;
    return new Promise((resolve) => setTimeout(resolve, totalDuration));
  }

  /**
   * Electric rapid ringing bell (Lonceng Listrik Kring-kring)
   */
  public playElectricBell(durationSeconds: number = 3.5): Promise<void> {
    if (this.isMuted) return Promise.resolve();
    const ctx = this.getAudioContext();
    const startTime = ctx.currentTime;

    // Carrier oscillator + Tremolo amplitude modulation (striker hits bell gong 30 times/sec)
    const carrier = ctx.createOscillator();
    const carrier2 = ctx.createOscillator();
    const tremolo = ctx.createOscillator();
    const tremoloGain = ctx.createGain();
    const mainGain = ctx.createGain();

    carrier.type = 'triangle';
    carrier.frequency.setValueAtTime(1250, startTime);

    carrier2.type = 'sine';
    carrier2.frequency.setValueAtTime(2450, startTime);

    tremolo.type = 'square';
    tremolo.frequency.setValueAtTime(26, startTime); // 26 strikes per second

    tremoloGain.gain.setValueAtTime(0.5, startTime);
    tremolo.connect(tremoloGain.gain);

    mainGain.gain.setValueAtTime(0.001, startTime);
    mainGain.gain.linearRampToValueAtTime(0.5 * this.masterVolume, startTime + 0.05);
    mainGain.gain.setValueAtTime(0.5 * this.masterVolume, startTime + durationSeconds - 0.2);
    mainGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

    carrier.connect(mainGain);
    carrier2.connect(mainGain);
    tremolo.connect(mainGain.gain);
    mainGain.connect(ctx.destination);

    carrier.start(startTime);
    carrier2.start(startTime);
    tremolo.start(startTime);

    carrier.stop(startTime + durationSeconds);
    carrier2.stop(startTime + durationSeconds);
    tremolo.stop(startTime + durationSeconds);

    return new Promise((resolve) => setTimeout(resolve, durationSeconds * 1000));
  }

  /**
   * Soft Modern Chime (Ding-Dong)
   */
  public playSoftChime(repeat: number = 1): Promise<void> {
    if (this.isMuted) return Promise.resolve();
    const ctx = this.getAudioContext();
    const now = ctx.currentTime + 0.05;

    // Notes: High tone (E5: 659.25 Hz) then Low tone (C5: 523.25 Hz)
    let t = now;
    for (let r = 0; r < repeat; r++) {
      this.playBellNote(ctx, 659.25, t, 1.4, 0.4);
      t += 0.55;
      this.playBellNote(ctx, 523.25, t, 1.8, 0.45);
      t += 1.2;
    }

    return new Promise((resolve) => setTimeout(resolve, (t - now) * 1000));
  }

  /**
   * Digital Marimba / Indonesian Traditional chime
   */
  public playDigitalMarimba(repeat: number = 1): Promise<void> {
    if (this.isMuted) return Promise.resolve();
    const ctx = this.getAudioContext();
    const now = ctx.currentTime + 0.05;

    // Pentatonic Indonesian Pelog chime: 523.25 (C5), 587.33 (D5), 659.25 (E5), 783.99 (G5), 880 (A5)
    const seq = [523.25, 659.25, 783.99, 880, 1046.5];
    let t = now;
    for (let r = 0; r < repeat; r++) {
      seq.forEach((f) => {
        this.playBellNote(ctx, f, t, 1.2, 0.4);
        t += 0.28;
      });
      t += 0.6;
    }

    return new Promise((resolve) => setTimeout(resolve, (t - now) * 1000));
  }

  /**
   * Exam Alert Tone (Calm triple chime)
   */
  public playExamAlert(): Promise<void> {
    if (this.isMuted) return Promise.resolve();
    const ctx = this.getAudioContext();
    const now = ctx.currentTime + 0.05;

    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    let t = now;
    notes.forEach((f) => {
      this.playBellNote(ctx, f, t, 1.6, 0.35);
      t += 0.45;
    });

    return new Promise((resolve) => setTimeout(resolve, (t - now) * 1000));
  }

  /**
   * Emergency Evacuation Siren
   */
  public playEmergencySiren(durationSeconds: number = 5): Promise<void> {
    if (this.isMuted) return Promise.resolve();
    const ctx = this.getAudioContext();
    const startTime = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency modulation 650Hz to 1100Hz cycling every 1 second
    osc.frequency.setValueAtTime(650, startTime);
    for (let t = 0; t < durationSeconds; t += 1.2) {
      osc.frequency.linearRampToValueAtTime(1100, startTime + t + 0.6);
      osc.frequency.linearRampToValueAtTime(650, startTime + t + 1.2);
    }

    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.6 * this.masterVolume, startTime + 0.1);
    gain.gain.setValueAtTime(0.6 * this.masterVolume, startTime + durationSeconds - 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + durationSeconds);

    return new Promise((resolve) => setTimeout(resolve, durationSeconds * 1000));
  }

  /**
   * Master Bell Sound dispatcher
   */
  public async playSound(soundType: BellSound, repeat: number = 1): Promise<void> {
    switch (soundType) {
      case 'westminster':
        await this.playWestminster(repeat);
        break;
      case 'electric':
        await this.playElectricBell(3.5);
        break;
      case 'soft_chime':
        await this.playSoftChime(repeat);
        break;
      case 'digital_marimba':
        await this.playDigitalMarimba(repeat);
        break;
      case 'exam_alert':
        await this.playExamAlert();
        break;
      case 'siren':
        await this.playEmergencySiren(6);
        break;
      default:
        await this.playWestminster(repeat);
    }
  }

  /**
   * Speech Synthesis (Text-to-Speech)
   */
  public speakText(
    text: string,
    options?: {
      lang?: 'id' | 'jv' | 'en';
      rate?: number;
      pitch?: number;
      volume?: number;
      voiceGender?: 'male' | 'female';
      onEnd?: () => void;
    }
  ): Promise<void> {
    if (this.isMuted || !text.trim() || !('speechSynthesis' in window)) {
      if (options?.onEnd) options.onEnd();
      return Promise.resolve();
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      utterance.rate = options?.rate || 0.95; // slightly relaxed for clear school announcement
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = (options?.volume ?? 1.0) * this.masterVolume;

      // Detect Indonesian voice
      const voices = window.speechSynthesis.getVoices();
      const targetLang = options?.lang === 'en' ? 'en-US' : 'id-ID';
      
      let matchedVoice = voices.find((v) => v.lang.startsWith(targetLang.split('-')[0]));
      
      // Try to match gender preference if available
      if (options?.voiceGender && matchedVoice) {
        const genderVoice = voices.find(
          (v) =>
            v.lang.startsWith(targetLang.split('-')[0]) &&
            (options.voiceGender === 'female'
              ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('gadis') || v.name.toLowerCase().includes('putri') || v.name.toLowerCase().includes('indonesia')
              : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('pria'))
        );
        if (genderVoice) matchedVoice = genderVoice;
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.lang = targetLang;

      utterance.onend = () => {
        this.currentUtterance = null;
        if (options?.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis event:', e);
        this.currentUtterance = null;
        if (options?.onEnd) options.onEnd();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Combined Bell Chime + AI Voice Announcer sequence
   */
  public async playBellWithAnnouncement(
    sound: BellSound,
    announcementText?: string,
    options?: {
      lang?: 'id' | 'jv' | 'en';
      voiceGender?: 'male' | 'female';
      rate?: number;
    }
  ): Promise<void> {
    // 1. Play Bell Tone
    await this.playSound(sound, 1);

    // 2. Pause 500ms
    await new Promise((r) => setTimeout(r, 600));

    // 3. Play Speech Announcement if present
    if (announcementText && announcementText.trim().length > 0) {
      await this.speakText(announcementText, options);
    }
  }

  /**
   * Stop all playing sounds and speech
   */
  public stopAll(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend();
    }
    this.currentUtterance = null;
  }

  /**
   * Audio Hardware Output Test (Short 440Hz test beep)
   */
  public testSpeakerOutput(): Promise<void> {
    const ctx = this.getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5 pleasant confirmation beep

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3 * this.masterVolume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);

    return new Promise((r) => setTimeout(r, 600));
  }
}

export const soundEngine = new SoundEngine();

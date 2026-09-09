/**
 * PureDrop Audio Chimes & Haptic Feedback Engine
 * Synthesizes luxurious audio feedback using native Web Audio API (no external asset dependencies)
 */

export interface PureDropSoundConfig {
  soundEffectsEnabled: boolean; // Master toggle for completion & error sounds
  buttonClicksSoundEnabled: boolean; // Toggle for button click tactile feedback
}

const STORAGE_KEY = 'puredrop_audio_preferences';

const defaultSoundConfig: PureDropSoundConfig = {
  soundEffectsEnabled: true,
  buttonClicksSoundEnabled: true,
};

function loadStoredConfig(): PureDropSoundConfig {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSoundConfig, ...JSON.parse(stored) };
      }
    }
  } catch {
    // fallback
  }
  return { ...defaultSoundConfig };
}

let soundConfig: PureDropSoundConfig = loadStoredConfig();

export function getSoundConfig(): PureDropSoundConfig {
  return soundConfig;
}

export function updateSoundConfig(newConfig: Partial<PureDropSoundConfig>): PureDropSoundConfig {
  soundConfig = { ...soundConfig, ...newConfig };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(soundConfig));
    }
  } catch {
    // fallback
  }
  return soundConfig;
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Ultra-crisp, tactile click sound played when clicking any button or interactive element.
 * Soft, elegant, ~20ms sine sweep with rapid exponential decay.
 */
export function playButtonClickSound(force = false) {
  if (!force && !soundConfig.buttonClicksSoundEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Swift frequency sweep from 950Hz to 480Hz gives a crisp mechanical tactile feel
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.022);

    // Subtle volume (0.035) so it is pleasant and never intrusive
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.026);
  } catch {
    // silent fallback
  }
}

/**
 * Prestigious, harmonious ascending chime played upon successful completion of file transfer.
 * Sparkling 3-tone harmonic arpeggio (C5 -> E5 -> G5 -> C6).
 */
export function playTransferCompleteSound(force = false) {
  if (!force && !soundConfig.soundEffectsEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Frequencies: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.28 },
      { freq: 659.25, time: 0.09, dur: 0.28 },
      { freq: 783.99, time: 0.18, dur: 0.35 },
      { freq: 1046.50, time: 0.27, dur: 0.55 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.0001, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.065, now + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur + 0.01);
    });
  } catch {
    // silent fallback
  }
}

/**
 * Gentle, dignified warning chime played upon connection error or transfer failure.
 * Dual descending warm minor tone (F4 -> D4) designed to be polite rather than harsh.
 */
export function playConnectionErrorSound(force = false) {
  if (!force && !soundConfig.soundEffectsEnabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { freq: 392.00, time: 0.00, dur: 0.16 }, // G4
      { freq: 329.63, time: 0.14, dur: 0.28 }, // E4
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // warmer, softer harmonic timbre
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.0001, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.055, now + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur + 0.01);
    });
  } catch {
    // silent fallback
  }
}

/**
 * Play a subtle notification chime when a new system directive message arrives
 */
export function playDirectiveChime() {
  if (!soundConfig.soundEffectsEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.04);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch {
    // audio fallback silent
  }
}

/**
 * Subtle feedback on selecting media from gallery
 */
export function playSelectChime() {
  if (!soundConfig.buttonClicksSoundEnabled && !soundConfig.soundEffectsEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch {
    // silent
  }
}

/**
 * Subtle tactile click when swiping between media in gallery preview
 */
export function playSwipeTick() {
  if (!soundConfig.buttonClicksSoundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.035);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // silent
  }
}

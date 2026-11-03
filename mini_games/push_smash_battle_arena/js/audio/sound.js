import { SOUNDS } from '../../data_model/audio.js';
import { settings } from '../core/settings.js';
import { state } from '../core/state.js';

// --- ÁUDIO PROCEDURAL E SOUND DESIGN SINTETIZADO ---
export const AudioCtx = window.AudioContext || window.webkitAudioContext;

export function initAudio() {
    if (!state.audioCtx) state.audioCtx = new AudioCtx();
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
}

export function tone(wave, f0, f1, dur, vol, delay = 0) {
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(state.audioCtx.destination);
    const t = state.audioCtx.currentTime + delay;
    osc.type = wave;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.linearRampToValueAtTime(0.01, t + dur);
    osc.start(t);
    osc.stop(t + dur);
}

export function playSound(type) {
    if (!state.audioCtx || !settings.sfx) return;
    (SOUNDS[type] || []).forEach(args => tone(...args));
}

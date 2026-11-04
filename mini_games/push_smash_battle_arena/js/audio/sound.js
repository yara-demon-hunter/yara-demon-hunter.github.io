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

// Chiado: ruído branco passando por um filtro que varre de f0 a f1
let noiseBuffer = null;
export function noise(_, f0, f1, dur, vol, delay = 0) {
    const ctx = state.audioCtx;
    if (!noiseBuffer) {
        noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const d = noiseBuffer.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime + delay;
    filter.frequency.setValueAtTime(f0, t);
    filter.frequency.exponentialRampToValueAtTime(f1, t + dur);
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(vol, t + dur * 0.15);
    gain.gain.linearRampToValueAtTime(0.01, t + dur);
    src.start(t);
    src.stop(t + dur);
}

export function playSound(type) {
    if (!state.audioCtx || !settings.sfx) return;
    (SOUNDS[type] || []).forEach(args => (args[0] === 'noise' ? noise : tone)(...args));
}

// --- SONS CONTÍNUOS (ex.: assobio do SKY DROP) ---
// O jogo chama setLoop a cada frame com a frequência e o volume atuais; se parar de chamar (pausa, fim do
// round), stopAllLoops corta. Assim nada fica tocando sozinho.
const loops = new Map();
export function setLoop(id, wave, freq, vol, vibratoHz = 0, vibratoDepth = 0) {
    if (!state.audioCtx || !settings.sfx) return stopLoop(id);
    const ctx = state.audioCtx;
    const t = ctx.currentTime;
    let l = loops.get(id);
    if (!l) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0, t);
        lfo.frequency.value = vibratoHz;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        lfo.start(t);
        l = { osc, gain, lfo, lfoGain };
        loops.set(id, l);
    }
    l.osc.frequency.setTargetAtTime(freq, t, 0.03);
    l.lfoGain.gain.setTargetAtTime(freq * vibratoDepth, t, 0.03);
    l.gain.gain.setTargetAtTime(vol, t, 0.05);
}

export function stopLoop(id) {
    const l = loops.get(id);
    if (!l) return;
    const t = state.audioCtx.currentTime;
    l.gain.gain.setTargetAtTime(0, t, 0.02);
    l.osc.stop(t + 0.15);
    l.lfo.stop(t + 0.15);
    loops.delete(id);
}

export function stopAllLoops() {
    [...loops.keys()].forEach(stopLoop);
}

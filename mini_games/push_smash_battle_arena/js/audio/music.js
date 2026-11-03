import { settings } from '../core/settings.js';
import { state } from '../core/state.js';
import { MUSIC } from '../../data_model/audio.js';

// --- MÚSICA PROCEDURAL (loop simples, baixo + arpejo) ---
export const music = {
    timer: null,
    step: 0,
    next: 0,
    start() {
        if (!state.audioCtx || !settings.music || this.timer) return;
        this.next = state.audioCtx.currentTime + 0.1;
        this.timer = setInterval(() => this.schedule(), 100);
    },
    stop() {
        clearInterval(this.timer);
        this.timer = null;
    },
    note(wave, f, t, dur, vol) {
        const o = state.audioCtx.createOscillator();
        const g = state.audioCtx.createGain();
        o.type = wave;
        o.frequency.value = f;
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g);
        g.connect(state.audioCtx.destination);
        o.start(t);
        o.stop(t + dur);
    },
    schedule() {
        const beat = MUSIC.beatSeconds;
        while (this.next < state.audioCtx.currentTime + 0.3) {
            const i = this.step % 8;
            if (i % 2 === 0) this.note('triangle', MUSIC.bass[i], this.next, beat * 1.8, MUSIC.bassVolume);
            this.note('square', MUSIC.arp[(i + (this.step >> 3) * 3) % 8], this.next, beat * 0.8, MUSIC.arpVolume);
            this.next += beat;
            this.step++;
        }
    }
};

export function syncMusic() {
    if (settings.music && state.gameState !== 'MENU') music.start();
    else music.stop();
}


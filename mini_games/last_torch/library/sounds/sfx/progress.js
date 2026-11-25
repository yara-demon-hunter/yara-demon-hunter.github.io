// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/sounds/sfx/progress.js e rode o sync.
import { SCALE } from '../core/engine.js';

export const progressSfx = {
    // Moeda: em sequência, cada uma um tom acima
    playCoin() {
        if (!this.ctx || this.throttled('coin', 0.06)) return;
        const now = this.ctx.currentTime;
        this.coinChain = now - this.coinTime < 0.5 ? this.coinChain + 1 : 0;
        this.coinTime = now;
        const step = SCALE[Math.min(SCALE.length - 1, this.coinChain >> 1)];
        const freq = 987.77 * Math.pow(2, step / 24);
        this.tone({ type: 'sine', freq, vary: 0.004, decay: 0.05, gain: 0.07 });
        this.tone({ type: 'sine', freq: freq * 1.335, at: 0.04, decay: 0.08, gain: 0.07 });
    },

    playLevelUp() {
        if (!this.ctx) return;
        this.duck({ depth: 0.55, hold: 0.25, release: 0.6 });
        [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
            this.tone({ type: 'triangle', freq, at: i * 0.06, decay: 0.34, gain: 0.13 });
        });
    },

    playCardShow() {
        if (!this.ctx) return;
        [0, 0.07, 0.14].forEach((at, i) => {
            this.burst({ filter: 'bandpass', freq: 2200 + i * 500, q: 3, at, decay: 0.06, gain: 0.16 });
        });
    },

    playCardPick(rarity = 'common') {
        if (!this.ctx) return;
        const big = rarity === 'epic' || rarity === 'legendary' || rarity === 'evolution';
        const notes = big ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : rarity === 'rare' ? [523.25, 783.99, 1046.5] : [659.25, 987.77];
        notes.forEach((freq, i) => this.tone({ type: 'triangle', freq, at: i * 0.055, decay: 0.3, gain: 0.13 }));
    },

    playChest() {
        if (!this.ctx) return;
        [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((freq, i) => {
            this.tone({ type: 'triangle', freq, at: i * 0.07, decay: 0.4, gain: 0.12 });
        });
        this.burst({ filter: 'highpass', freq: 5000, attack: 0.1, decay: 0.5, gain: 0.08 });
    },

    playPickup(type) {
        if (!this.ctx) return;
        if (type === 'CHEST') {
            this.tone({ type: 'sine', freq: 90, to: 50, decay: 0.3, gain: 0.3 });
            this.tone({ type: 'triangle', freq: 880, decay: 0.3, gain: 0.12 });
        } else if (type === 'NOVA') {
            this.playBlast();
            this.tone({ type: 'sine', freq: 1400, to: 300, decay: 0.5, gain: 0.14 });
        } else {
            this.tone({ type: 'triangle', freq: 660, to: 1320, decay: 0.16, gain: 0.14 });
        }
    },

    playPurchase() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 1318.5, decay: 0.08, gain: 0.1 });
        this.tone({ type: 'sine', freq: 1975.5, at: 0.06, decay: 0.22, gain: 0.1 });
        this.burst({ filter: 'highpass', freq: 4000, decay: 0.05, gain: 0.08 });
    },

    playStreakTier(index) {
        if (!this.ctx) return;
        const root = 392 * Math.pow(2, (index * 2) / 12);
        [1, 1.25, 1.5, 2].forEach((k, i) => this.tone({ type: 'sawtooth', freq: root * k, at: i * 0.04, decay: 0.3, gain: 0.05 }));
    },

    playRevive() {
        if (!this.ctx) return;
        [392, 523.25, 783.99, 1046.5].forEach((freq, i) => {
            this.tone({ type: 'sine', freq, at: i * 0.1, attack: 0.03, decay: 0.8, gain: 0.14 });
        });
    }
};

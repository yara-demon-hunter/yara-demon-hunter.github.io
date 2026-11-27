export const nightSfx = {
    playHourClear() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 70, to: 36, decay: 0.8, gain: 0.34 });
        this.burst({ filter: 'lowpass', freq: 400, to: 3200, attack: 0.08, decay: 0.8, gain: 0.26 });
        [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((freq, i) => {
            this.tone({ type: 'triangle', freq, at: 0.1 + i * 0.08, decay: 0.7, gain: 0.11 });
        });
    },

    playHorn() {
        if (!this.ctx || this.throttled('horn', 1)) return;
        [110, 164.8].forEach(freq => {
            this.tone({ type: 'sawtooth', freq, attack: 0.12, decay: 1, gain: 0.08 });
        });
    },

    playBossWarning() {
        if (!this.ctx) return;
        this.duck({ depth: 0.3, hold: 2, release: 1.2 });
        [0, 0.55, 1.1, 1.65].forEach(at => {
            this.sub({ freq: 70, to: 44, at, decay: 0.42, gain: 0.38 });      // com harmônicos: no celular o aviso do boss também se ouve
            this.burst({ filter: 'lowpass', freq: 320, at, decay: 0.3, gain: 0.3 });
        });
    },

    playBossRoar() {
        if (!this.ctx) return;
        this.duck({ depth: 0.25, hold: 1.2, release: 1.2 });
        [55, 58.3, 82.4].forEach(freq => {
            this.tone({ type: 'sawtooth', freq: freq * 1.6, to: freq, attack: 0.08, decay: 1.2, gain: 0.15 });
        });
        this.burst({ filter: 'lowpass', freq: 900, to: 200, attack: 0.06, decay: 1.1, gain: 0.3 });
    },

    playBossAttack() {
        if (!this.ctx || this.throttled('bossAttack', 0.2)) return;
        // Três timbres em rodízio (e variação de tom): o boss ataca dezenas de vezes por luta, e o mesmo som cansa
        this.bossAttackIndex = ((this.bossAttackIndex ?? -1) + 1) % 3;
        if (this.bossAttackIndex === 0) {
            this.tone({ type: 'sawtooth', freq: 190, to: 85, vary: 0.07, decay: 0.3, gain: 0.14 });
            this.burst({ filter: 'bandpass', freq: 520, q: 0.8, vary: 0.08, decay: 0.26, gain: 0.2 });
        } else if (this.bossAttackIndex === 1) {
            this.tone({ type: 'square', freq: 300, to: 120, vary: 0.07, decay: 0.22, gain: 0.07 });
            this.burst({ filter: 'bandpass', freq: 1200, to: 400, q: 1.4, vary: 0.08, decay: 0.24, gain: 0.2 });
        } else {
            this.tone({ type: 'triangle', freq: 150, to: 230, vary: 0.07, attack: 0.05, decay: 0.28, gain: 0.14 });
            this.burst({ filter: 'lowpass', freq: 1100, to: 300, vary: 0.08, decay: 0.3, gain: 0.2 });
        }
    },

    // Elite chegando: dois tons em segunda menor (desconfortável) e um "ting" de tesouro. Diferente da corneta da horda
    playElite() {
        if (!this.ctx || this.throttled('elite', 1)) return;
        [220, 233.08].forEach(freq => this.tone({ type: 'sawtooth', freq, attack: 0.02, decay: 0.55, gain: 0.08 }));
        this.burst({ filter: 'bandpass', freq: 600, to: 1500, q: 1.2, attack: 0.04, decay: 0.3, gain: 0.12 });
        this.tone({ type: 'sine', freq: 1760, at: 0.18, decay: 0.45, gain: 0.07 });
        this.tone({ type: 'sine', freq: 2349, at: 0.24, decay: 0.4, gain: 0.05 });
    },

    // Risadinha do Goblin do Baú: "hi-hi-hi-hi" (quatro bipes agudos que sobem e descem rápido)
    playGiggle() {
        if (!this.ctx || this.throttled('giggle', 0.9)) return;
        [880, 1175, 988, 1319].forEach((freq, i) => this.tone({ type: 'triangle', freq, at: i * 0.075, attack: 0.005, decay: 0.07, gain: 0.07, vary: 0.04 }));
    },

    // Blink (some ou aparece): um estalo agudo com um sopro rápido
    playBlink() {
        if (!this.ctx || this.throttled('blink', 0.15)) return;
        this.tone({ type: 'sine', freq: 1400, to: 380, attack: 0.005, decay: 0.16, gain: 0.07 });
        this.burst({ filter: 'bandpass', freq: 2200, to: 700, q: 1.4, attack: 0.01, decay: 0.14, gain: 0.07 });
    },

    // Sino de igreja: parciais desafinadas como um sino de bronze (hum, prima, terça, quinta, nominal), com cauda longa
    playBell(echo = false) {
        if (!this.ctx) return;
        const f = echo ? 247 : 196;
        const gain = echo ? 0.07 : 0.1;
        [[0.5, 1, 2.6], [1, 0.9, 2.2], [1.19, 0.45, 1.6], [1.5, 0.35, 1.4], [2, 0.5, 1.8], [2.74, 0.22, 1.0]].forEach(([ratio, g, decay]) => {
            this.tone({ type: 'sine', freq: f * ratio, attack: 0.005, decay, gain: gain * g });
        });
        this.burst({ filter: 'bandpass', freq: 2400, to: 1200, q: 2, decay: 0.08, gain: 0.05 });
    },

    playBossDeath() {
        if (!this.ctx) return;
        this.tone({ type: 'sawtooth', freq: 200, to: 28, attack: 0.02, decay: 1.6, gain: 0.2 });
        this.tone({ type: 'sine', freq: 90, to: 24, decay: 1.8, gain: 0.4 });
        this.burst({ filter: 'lowpass', freq: 3000, to: 90, decay: 1.8, gain: 0.4 });
    },

    playGameOver() {
        if (!this.ctx) return;
        [293.66, 246.94, 220, 146.83].forEach((freq, i) => {
            this.tone({ type: 'triangle', freq, at: i * 0.26, attack: 0.02, decay: 0.8, gain: 0.12 });
        });
        this.playRetryInvite?.(1.7);      // depois da queda, uma brasa que convida a tentar de novo
    }
};

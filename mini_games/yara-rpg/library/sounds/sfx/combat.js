// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/sounds/sfx/combat.js e rode o sync.
import { SCALE } from '../core/engine.js';

export const combatSfx = {
    playSwordSlash(comboIndex = 1) {
        if (!this.ctx || this.throttled('slash', 0.06)) return;
        const base = comboIndex === 1 ? 2400 : comboIndex === 2 ? 3000 : 1800;
        this.burst({ filter: 'bandpass', freq: base, to: base * 0.3, q: 1.4, vary: 0.06, decay: 0.1, gain: comboIndex === 3 ? 0.32 : 0.22 });
        this.tone({ type: 'triangle', freq: 620 + comboIndex * 90, to: 150, decay: 0.08, gain: 0.05 });
    },

    // Impacto: batida grave curta + estalo. Quanto mais alvos, mais gordo
    playHit(targets = 1) {
        if (!this.ctx || this.throttled('hit', 0.06)) return;
        // Tick curto (cerca de 30 ms) nos médios e agudos: confirma o golpe sem pôr grave em algo que toca o tempo todo
        this.tone({ type: 'triangle', freq: 560, to: 260, vary: 0.07, decay: 0.03, gain: 0.12 });
        this.burst({ filter: 'highpass', freq: 1900, vary: 0.08, decay: 0.02, gain: 0.1 });
        if (targets > 1) this.tone({ type: 'sine', freq: 190, to: 110, vary: 0.05, decay: 0.04, gain: Math.min(0.12, 0.03 * targets) });
    },

    // Shatter Strike (Blade): o monstro é LANÇADO. Um estalo seco do golpe e o sopro grave que passa voando (do grave para o agudo, como algo que corta o ar)
    playShatterLaunch() {
        if (!this.ctx || this.throttled('shatterLaunch', 0.4)) return;
        this.tone({ type: 'square', freq: 220, to: 70, attack: 0.002, decay: 0.12, gain: 0.1 });
        this.burst({ filter: 'bandpass', freq: 350, to: 2600, q: 0.9, attack: 0.02, decay: 0.45, gain: 0.16 });
        this.tone({ type: 'sine', freq: 90, to: 50, attack: 0.002, decay: 0.2, gain: 0.14 });
    },

    // Shatter Strike: a pancada (o monstro lançado bate em algo). Impacto pesado com o craque de ossos e madeira
    playShatterImpact(wall = false) {
        if (!this.ctx || this.throttled('shatterImpact', 0.12)) return;
        this.tone({ type: 'sine', freq: wall ? 120 : 150, to: 38, attack: 0.001, decay: 0.28, gain: 0.22 });
        this.tone({ type: 'square', freq: 320, to: 90, attack: 0.001, decay: 0.08, gain: 0.08 });
        this.burst({ filter: 'bandpass', freq: wall ? 900 : 1500, q: 1.3, attack: 0.001, decay: 0.16, gain: 0.2 });
        this.burst({ filter: 'highpass', freq: 3200, attack: 0.001, decay: 0.05, gain: 0.1 });
    },

    // Freezing Breath: o sopro gelado. Um "fffuuu" longo e agudo (ruído filtrado que sobe e desce) com cintilar de gelo no fim
    playIceBreath() {
        if (!this.ctx || this.throttled('iceBreath', 0.5)) return;
        this.burst({ filter: 'bandpass', freq: 1800, to: 5200, q: 0.8, attack: 0.04, decay: 0.55, gain: 0.16 });
        this.burst({ filter: 'highpass', freq: 3500, attack: 0.08, decay: 0.4, gain: 0.07 });
        [2637, 3136, 3951].forEach((freq, i) => this.tone({ type: 'sine', freq, at: 0.12 + i * 0.08, attack: 0.003, decay: 0.18, gain: 0.04 }));
    },

    playCrit() {
        if (!this.ctx || this.throttled('crit', 0.05)) return;
        this.tone({ type: 'square', freq: 1760, to: 880, decay: 0.09, gain: 0.05 });
        this.tone({ type: 'sine', freq: 2640, decay: 0.14, gain: 0.05 });
    },

    // Morte: a nota sobe com a sequência. É o som que faz querer manter a sequência viva
    playKill(streak = 0) {
        if (!this.ctx || this.throttled('kill', 0.05)) return;
        const step = Math.min(SCALE.length - 1, Math.floor(streak / 3));
        const freq = 220 * Math.pow(2, SCALE[step] / 12);
        this.tone({ type: 'triangle', freq, vary: 0.012, decay: 0.12, gain: 0.13 });
        this.tone({ type: 'sine', freq: freq * 2, decay: 0.08, gain: 0.05 });
        // Estalo médio-agudo de quebra (sem grave): a nota é o prêmio, o crunch só marca a morte
        this.burst({ filter: 'bandpass', freq: 2200, to: 800, q: 1.2, vary: 0.1, decay: 0.07, gain: 0.12 });
    },

    playExplode() {
        if (!this.ctx || this.throttled('explode', 0.05)) return;
        this.sub({ freq: 120, to: 50, vary: 0.04, decay: 0.2, gain: 0.26 });
        this.burst({ filter: 'lowpass', freq: 1400, to: 200, vary: 0.05, decay: 0.2, gain: 0.26 });
    },

    playBlast() {
        if (!this.ctx || this.throttled('blast', 0.06)) return;
        this.sub({ freq: 100, to: 45, vary: 0.04, decay: 0.26, gain: 0.3 });
        this.burst({ filter: 'lowpass', freq: 2000, to: 160, vary: 0.05, decay: 0.28, gain: 0.3 });
    },

    playUltSound() {
        if (!this.ctx) return;
        this.tone({ type: 'sawtooth', freq: 130, to: 900, attack: 0.02, decay: 0.42, gain: 0.2 });
        this.tone({ type: 'sine', freq: 65, to: 40, decay: 0.5, gain: 0.34 });
        this.burst({ filter: 'bandpass', freq: 500, to: 4000, q: 1, attack: 0.05, decay: 0.42, gain: 0.26 });
    },

    playHurt() {
        if (!this.ctx || this.throttled('hurt', 0.08)) return;
        this.tone({ type: 'sawtooth', freq: 320, to: 110, vary: 0.06, decay: 0.16, gain: 0.18 });
        this.burst({ filter: 'lowpass', freq: 900, vary: 0.08, decay: 0.1, gain: 0.2 });
    },

    playTorchHit() {
        if (!this.ctx || this.throttled('torch', 0.1)) return;
        this.tone({ type: 'sine', freq: 200, to: 70, decay: 0.26, gain: 0.3 });
        this.burst({ filter: 'bandpass', freq: 800, to: 300, q: 0.7, decay: 0.3, gain: 0.26 });
    },

    playAlarm() {
        if (!this.ctx) return;
        [0, 0.26].forEach(at => {
            this.tone({ type: 'square', freq: 523, at, decay: 0.2, gain: 0.08 });
            this.tone({ type: 'square', freq: 554, at, decay: 0.2, gain: 0.08 });
        });
    },

    playDash() {
        if (!this.ctx || this.throttled('dash', 0.05)) return;
        this.burst({ filter: 'bandpass', freq: 700, to: 2800, q: 1.6, vary: 0.08, attack: 0.02, decay: 0.15, gain: 0.3 });
    },

    // Lodo (área 🐌 Lento): ao entrar, um "chlop" molhado (chiado médio que sobe) e duas bolhas que sobem de tom. Fica nos médios (300 a 900 Hz) de propósito:
    // graves de 100 a 200 Hz somem em alto-falante de notebook e de celular. Curto e com intervalo mínimo entre repetições.
    playMud() {
        if (!this.ctx || this.throttled('mud', 0.8)) return;
        // O "chlop" arrastado: chiado médio que sobe devagar (como a bota saindo da lama), com três bolhas subindo de tom depois
        this.burst({ filter: 'bandpass', freq: 260, to: 1050, q: 2, attack: 0.03, decay: 0.5, gain: 0.7 });
        this.tone({ type: 'sine', freq: 340, to: 640, attack: 0.02, decay: 0.2, gain: 0.26 });
        this.tone({ type: 'sine', freq: 460, to: 820, at: 0.14, attack: 0.015, decay: 0.16, gain: 0.2 });
        this.tone({ type: 'sine', freq: 400, to: 720, at: 0.3, attack: 0.015, decay: 0.14, gain: 0.14 });
    },

    playPerfect() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 1046, decay: 0.2, gain: 0.12 });
        this.tone({ type: 'sine', freq: 1568, at: 0.05, decay: 0.26, gain: 0.12 });
    },

    // Rebate (Mirror Ward): "ting" metálico que sobe de tom
    playReflect() {
        if (!this.ctx) return;
        [1320, 1980].forEach((freq, i) => {
            this.tone({ type: i === 0 ? 'triangle' : 'sine', freq: freq * 0.8, to: freq, decay: 0.35, gain: 0.16 });
        });
    }
};

// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/sounds/sfx/retention.js e rode o sync.
// Sons feitos para dar vontade de continuar jogando (metodologia: sounds/README.md).
// Início de partida, início de onda, o corte da morte, o convite para tentar de novo, recorde, clique de interface e o coração do perigo.
export const retentionSfx = {
    // Início de partida: impacto grave + riser curto + "clack" metálico de engatilhar. Passa do passivo ao alerta sem arrastar
    playRunStart() {
        if (!this.ctx) return;
        this.sub({ freq: 95, to: 48, decay: 0.32, gain: 0.3 });
        this.burst({ filter: 'bandpass', freq: 300, to: 3200, q: 1, attack: 0.18, decay: 0.14, gain: 0.16 });
        this.burst({ filter: 'highpass', freq: 3600, at: 0.3, decay: 0.04, gain: 0.2 });
        this.tone({ type: 'square', freq: 780, to: 420, at: 0.3, decay: 0.05, gain: 0.07 });
        this.tone({ type: 'triangle', freq: 392, at: 0.36, decay: 0.3, gain: 0.1 });
        this.tone({ type: 'triangle', freq: 587.33, at: 0.4, decay: 0.34, gain: 0.1 });
    },

    // Início de onda: grave curto + sweep que sobe + dois pulsos. Quanto mais avançada a noite, mais tenso (progress 0 a 1)
    playWaveStart(progress = 0) {
        if (!this.ctx || this.throttled('waveStart', 1)) return;
        this.duck({ depth: 0.55, hold: 0.25, release: 0.7 });
        this.sub({ freq: 78 + progress * 12, to: 46, decay: 0.45, gain: 0.26 });
        this.burst({ filter: 'bandpass', freq: 250, to: 1800 + progress * 1200, q: 1.2, attack: 0.25, decay: 0.2, gain: 0.14 });
        [0.34, 0.5].forEach((at, i) => this.tone({ type: 'sawtooth', freq: 165 * (1 + progress * 0.2), at, decay: 0.12, gain: 0.07 + i * 0.02 }));
    },

    // Morte: o mundo abafa de repente, um instante de silêncio e só então o grave seco. Sem ruído caótico ao perder
    playDeath() {
        if (!this.ctx) return;
        this.muffle({ freq: 380, hold: 1.1, release: 0.9 });
        this.sub({ freq: 150, to: 40, at: 0.16, attack: 0.01, decay: 1.1, gain: 0.34 });
        this.burst({ filter: 'lowpass', freq: 700, to: 70, at: 0.16, decay: 0.7, gain: 0.26 });
    },

    // Convite para a próxima tentativa: depois da queda, uma brasa quente que sobe (quinta ascendente, sem pressa)
    playRetryInvite(delay = 1.7) {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 293.66, at: delay, attack: 0.06, decay: 0.9, gain: 0.1 });
        this.tone({ type: 'sine', freq: 440, at: delay + 0.22, attack: 0.06, decay: 1.2, gain: 0.1 });
        this.tone({ type: 'triangle', freq: 880, at: delay + 0.22, attack: 0.04, decay: 0.8, gain: 0.03 });
    },

    // Recorde batido: arpejo brilhante com cintilar no fim
    playRecord() {
        if (!this.ctx) return;
        this.duck({ depth: 0.4, hold: 1, release: 1 });
        [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((freq, i) => {
            this.tone({ type: 'triangle', freq, at: i * 0.07, decay: 0.5, gain: 0.12 });
            this.tone({ type: 'sine', freq: freq * 2, at: i * 0.07, decay: 0.3, gain: 0.03 });
        });
        [0.5, 0.58, 0.67].forEach((at, i) => this.tone({ type: 'sine', freq: 2093 + i * 330, at, decay: 0.3, gain: 0.05 }));
    },

    // Clique de interface: curto e discreto, com variação para não cansar
    playClick() {
        if (!this.ctx || this.throttled('click', 0.04)) return;
        this.tone({ type: 'triangle', freq: 880, to: 620, decay: 0.04, gain: 0.07, vary: 0.05 });
        this.burst({ filter: 'highpass', freq: 3500, decay: 0.015, gain: 0.04 });
    },

    // Coração do perigo: dois baques surdos. Chamar com intervalo, só enquanto a vida estiver baixa
    playHeartbeat() {
        if (!this.ctx || this.throttled('heart', 0.9)) return;
        this.sub({ freq: 70, to: 46, decay: 0.12, gain: 0.18 });
        this.sub({ freq: 62, to: 44, at: 0.17, decay: 0.14, gain: 0.13 });
    },

    // Troca de clima da música: um respiro curto que sobe, para o corte não ser seco. Quem chama é o MusicEngine
    playMoodChange(name) {
        if (!this.ctx || name === 'silent' || this.throttled('mood', 1)) return;
        if (name === 'dawn') {
            [523.25, 783.99].forEach((freq, i) => this.tone({ type: 'sine', freq, at: i * 0.12, attack: 0.02, decay: 0.7, gain: 0.05 }));
        } else if (name === 'boss') {
            this.burst({ filter: 'bandpass', freq: 200, to: 1600, q: 1.2, attack: 0.3, decay: 0.12, gain: 0.1 });
        } else {
            this.burst({ filter: 'bandpass', freq: 400, to: 2600, q: 1, attack: 0.2, decay: 0.1, gain: 0.07 });
        }
    }
};

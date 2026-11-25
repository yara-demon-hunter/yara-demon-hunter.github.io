export const skillsSfx = {
    // Earthbreaker: pancada grave com pedras. scale < 1 nos abalos seguintes
    // Corte rápido de lâmina no ar ("shiink"): chiado agudo que sobe + um fio metálico
    playSlice() {
        if (!this.ctx) return;
        this.burst({ filter: 'highpass', freq: 2600, to: 7500, attack: 0.004, decay: 0.09, gain: 0.32 });
        this.burst({ filter: 'bandpass', freq: 5200, to: 9000, q: 4, attack: 0.002, decay: 0.12, gain: 0.18 });
        this.tone({ type: 'sawtooth', freq: 1900, to: 3400, decay: 0.07, gain: 0.06 });
    },

    playSlam(scale = 1) {
        if (!this.ctx) return;
        this.sub({ freq: 130, to: 52, vary: 0.04, decay: 0.42, gain: 0.45 * scale });
        this.burst({ filter: 'lowpass', freq: 900, to: 160, vary: 0.05, decay: 0.34, gain: 0.5 * scale });
        this.burst({ filter: 'bandpass', freq: 2400, to: 500, q: 1, at: 0.03, decay: 0.16, gain: 0.14 * scale });
    },

    // War Cry: grito rouco que sobe e cai
    playRoar() {
        if (!this.ctx) return;
        this.tone({ type: 'sawtooth', freq: 120, to: 240, attack: 0.08, decay: 0.3, gain: 0.2 });
        this.tone({ type: 'sawtooth', freq: 181, to: 330, attack: 0.08, decay: 0.3, gain: 0.14 });
        this.burst({ filter: 'bandpass', freq: 500, to: 1400, q: 0.8, attack: 0.06, decay: 0.42, gain: 0.3 });
    },

    // Parry: aço batendo em aço. Estalo metálico agudo, anel que fica no ar e um baque grave de quem foi desviado
    playParry() {
        if (!this.ctx || this.throttled('parry', 0.08)) return;
        this.burst({ filter: 'highpass', freq: 3800, to: 6500, attack: 0.001, decay: 0.05, gain: 0.34 });
        this.tone({ type: 'square', freq: 1480, to: 1180, attack: 0.001, decay: 0.07, gain: 0.1 });
        this.tone({ type: 'triangle', freq: 2217, to: 2100, at: 0.004, decay: 0.34, gain: 0.13 });
        this.tone({ type: 'sine', freq: 3322, at: 0.01, decay: 0.42, gain: 0.07 });
        this.sub({ freq: 150, to: 70, decay: 0.16, gain: 0.3 });
    },

    // Sacred Pendant: pancada branca que empurra tudo. Baque grave, estouro de ar e um brilho de sinos que sobe
    playPendant() {
        if (!this.ctx || this.throttled('pendant', 0.15)) return;
        this.sub({ freq: 110, to: 42, decay: 0.45, gain: 0.5 });
        this.burst({ filter: 'bandpass', freq: 700, to: 2600, q: 0.7, attack: 0.01, decay: 0.34, gain: 0.34 });
        this.tone({ type: 'sine', freq: 1568, to: 2093, at: 0.03, decay: 0.5, gain: 0.1 });
        this.tone({ type: 'sine', freq: 2349, to: 3136, at: 0.08, decay: 0.55, gain: 0.07 });
    },

    // Guardian Angel: o cajado solta uma bolinha de luz. Chiado curto que sobe, depois um "ting" macio quando estoura
    playAngelBolt() {
        if (!this.ctx || this.throttled('angelBolt', 0.07)) return;
        this.tone({ type: 'sine', freq: 880, to: 1760, decay: 0.16, gain: 0.09 });
        this.tone({ type: 'triangle', freq: 1320, to: 2640, at: 0.02, decay: 0.12, gain: 0.05 });
    },
    playAngelHit() {
        if (!this.ctx || this.throttled('angelHit', 0.06)) return;
        this.tone({ type: 'sine', freq: 1976, to: 1480, decay: 0.22, gain: 0.1 });
        this.burst({ filter: 'highpass', freq: 3500, decay: 0.05, gain: 0.12 });
    },

    // Archangel: o raio de luz sagrada. Um acorde que sobe e abre (coro de seno), um zumbido grave e o estalo de luz no começo
    playAngelBeam() {
        if (!this.ctx || this.throttled('angelBeam', 0.4)) return;
        this.sub({ freq: 98, to: 64, attack: 0.02, decay: 0.9, gain: 0.34 });
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => this.tone({ type: 'sine', freq, to: freq * 1.5, at: i * 0.04, attack: 0.06, decay: 0.9, gain: 0.09 }));
        this.burst({ filter: 'bandpass', freq: 1800, to: 5200, q: 0.8, attack: 0.02, decay: 0.7, gain: 0.2 });
        this.burst({ filter: 'highpass', freq: 4200, decay: 0.08, gain: 0.26 });
    },

    // Rose Whip: o estalo do chicote (hit = false: sai da mão; true: pega no monstro, com o baque e o brilho de pétalas)
    playRoseWhip(hit = false) {
        if (!this.ctx || this.throttled(hit ? 'roseWhipHit' : 'roseWhip', 0.1)) return;
        if (!hit) {
            this.burst({ filter: 'highpass', freq: 3200, to: 9000, attack: 0.002, decay: 0.07, gain: 0.3 });
            this.tone({ type: 'sawtooth', freq: 900, to: 240, decay: 0.09, gain: 0.07 });
            return;
        }
        this.burst({ filter: 'bandpass', freq: 2600, to: 900, q: 1, attack: 0.001, decay: 0.12, gain: 0.34 });
        this.sub({ freq: 120, to: 60, decay: 0.2, gain: 0.3 });
        this.tone({ type: 'sine', freq: 1568, to: 2093, at: 0.04, decay: 0.3, gain: 0.07 });
    },

    // Briar Coil: a energia vermelha. Sai da mão (hit = false): zumbido que sobe, rápido; chega (true): estouro grave com brilho
    playBriarPulse(hit = false) {
        if (!this.ctx || this.throttled(hit ? 'briarHit' : 'briar', 0.12)) return;
        if (!hit) {
            this.tone({ type: 'sawtooth', freq: 180, to: 760, attack: 0.02, decay: 0.34, gain: 0.1 });
            this.burst({ filter: 'bandpass', freq: 900, to: 3200, q: 1.2, attack: 0.03, decay: 0.34, gain: 0.14 });
            return;
        }
        this.sub({ freq: 150, to: 52, decay: 0.34, gain: 0.5 });
        this.burst({ filter: 'lowpass', freq: 1600, to: 220, attack: 0.002, decay: 0.3, gain: 0.45 });
        this.tone({ type: 'sine', freq: 1046, to: 523, decay: 0.3, gain: 0.08 });
    },

    // Rose Petals: o furacão de pétalas se forma. Um vento que sobe e gira (ruído em varredura) com um acorde suave de sinos por cima
    playRosePetals() {
        if (!this.ctx || this.throttled('rosePetals', 0.3)) return;
        this.burst({ filter: 'bandpass', freq: 500, to: 2600, q: 0.7, attack: 0.12, decay: 0.9, gain: 0.3 });
        this.burst({ filter: 'highpass', freq: 3000, to: 6500, attack: 0.2, decay: 0.7, gain: 0.1 });
        [659.25, 830.61, 987.77].forEach((freq, i) => this.tone({ type: 'sine', freq, at: 0.08 + i * 0.07, attack: 0.01, decay: 0.8, gain: 0.06 }));
    },

    // Executioner: corte seco
    playExecute() {
        if (!this.ctx || this.throttled('execute', 0.06)) return;
        this.burst({ filter: 'highpass', freq: 2600, to: 900, decay: 0.08, gain: 0.3 });
        this.tone({ type: 'square', freq: 220, to: 70, decay: 0.09, gain: 0.14 });
    },

    // Death Mark: "ting" seco; com o dash, mais alto e com um brilho depois
    playMark(big = false) {
        if (!this.ctx || this.throttled('mark', 0.05)) return;
        this.tone({ type: 'triangle', freq: big ? 1760 : 1320, to: 660, decay: 0.16, gain: 0.16 });
        if (big) this.tone({ type: 'sine', freq: 2637, at: 0.05, decay: 0.24, gain: 0.1 });
        this.burst({ filter: 'highpass', freq: 3200, decay: 0.05, gain: 0.16 });
    },

    playSmoke() {
        if (!this.ctx) return;
        this.burst({ filter: 'lowpass', freq: 1400, to: 300, attack: 0.02, decay: 0.3, gain: 0.16 });
    },

    // Torch Ward: escudo sobe e estoura
    playShield() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 330, to: 660, decay: 0.26, gain: 0.12 });
        this.tone({ type: 'sine', freq: 495, to: 990, at: 0.04, decay: 0.26, gain: 0.08 });
    },

    playShieldBreak() {
        if (!this.ctx) return;
        this.burst({ filter: 'bandpass', freq: 3000, to: 700, q: 0.8, decay: 0.22, gain: 0.34 });
        this.tone({ type: 'triangle', freq: 880, to: 220, decay: 0.2, gain: 0.16 });
    },

    playPhoenix() {
        if (!this.ctx) return;
        this.burst({ filter: 'bandpass', freq: 300, to: 3200, q: 0.7, attack: 0.05, decay: 0.7, gain: 0.34 });
        [392, 523, 784].forEach((freq, i) => this.tone({ type: 'triangle', freq, at: i * 0.1, decay: 0.5, gain: 0.14 }));
    },

    // Corrente: chicote metálico ao lançar; ao prender, um baque seco com tilintar
    playShackle(bound) {
        if (!this.ctx) return;
        if (!bound) {
            this.burst({ filter: 'bandpass', freq: 1800, to: 3600, q: 1.4, decay: 0.2, gain: 0.14 });
            return;
        }
        this.burst({ filter: 'lowpass', freq: 500, to: 160, q: 0.8, decay: 0.2, gain: 0.26 });
        [1760, 2350].forEach((freq, i) => this.tone({ type: 'triangle', freq, at: 0.03 + i * 0.05, decay: 0.16, gain: 0.05 }));
    },

    // Corvo bicando: grasnido curto e áspero
    playCaw() {
        if (!this.ctx || this.throttled('caw', 0.25)) return;
        this.burst({ filter: 'bandpass', freq: 1100, to: 520, q: 1.6, attack: 0.01, decay: 0.16, gain: 0.12 });
        this.tone({ type: 'sawtooth', freq: 540, to: 300, decay: 0.15, gain: 0.05 });
    },

    // Fênix renascendo: canto curto que sobe
    playPhoenixRise() {
        if (!this.ctx) return;
        this.burst({ filter: 'bandpass', freq: 500, to: 2200, q: 1.2, attack: 0.04, decay: 0.35, gain: 0.14 });
        [659, 880, 1175].forEach((freq, i) => this.tone({ type: 'triangle', freq, to: freq * 1.12, at: i * 0.08, decay: 0.3, gain: 0.08 }));
    },

    // Maldição pulando: sussurro que desce
    playHex() {
        if (!this.ctx || this.throttled('hex', 0.09)) return;
        this.tone({ type: 'sawtooth', freq: 620, to: 180, decay: 0.16, gain: 0.05 });
        this.burst({ filter: 'bandpass', freq: 1800, to: 700, q: 2, decay: 0.14, gain: 0.08 });
    },

    // Void Rift: sucção subindo e, depois, o colapso
    playRift() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 70, to: 240, attack: 0.3, decay: 0.7, gain: 0.26 });
        this.burst({ filter: 'bandpass', freq: 300, to: 1400, q: 2.4, attack: 0.3, decay: 0.7, gain: 0.2 });
    },

    playRiftCollapse() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 240, to: 40, decay: 0.3, gain: 0.42 });
        this.burst({ filter: 'lowpass', freq: 1800, to: 160, decay: 0.3, gain: 0.36 });
    },

    // Juramento: acorde grave que abre
    playOath() {
        if (!this.ctx) return;
        [110, 165, 220, 330].forEach((freq, i) => this.tone({ type: 'sawtooth', freq, at: i * 0.06, attack: 0.04, decay: 0.9, gain: 0.08 }));
        this.burst({ filter: 'bandpass', freq: 200, to: 2400, q: 0.8, attack: 0.06, decay: 0.7, gain: 0.26 });
    },

    playZap() {
        if (!this.ctx || this.throttled('zap', 0.08)) return;
        this.burst({ filter: 'highpass', freq: 3000, decay: 0.08, gain: 0.22 });
        this.tone({ type: 'sawtooth', freq: 1400, to: 300, decay: 0.08, gain: 0.08 });
    },

    playNova() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 180, to: 520, decay: 0.28, gain: 0.2 });
        this.burst({ filter: 'bandpass', freq: 400, to: 2600, q: 0.8, decay: 0.3, gain: 0.18 });
    },

    playBolt() {
        if (!this.ctx || this.throttled('bolt', 0.08)) return;
        this.burst({ filter: 'bandpass', freq: 1200, to: 500, q: 1, vary: 0.08, decay: 0.12, gain: 0.14 });
    },

    // Jato de fogo (o sopro da Flaming Phoenix): um sopro grave em pulsos
    playFlame() {
        if (!this.ctx || this.throttled('flame', 0.1)) return;
        this.burst({ filter: 'lowpass', freq: 900, to: 350, q: 0.7, decay: 0.2, gain: 0.1 });
    },

    playSummon() {
        if (!this.ctx) return;
        this.tone({ type: 'sawtooth', freq: 300, to: 90, attack: 0.05, decay: 0.5, gain: 0.1 });
        this.tone({ type: 'sine', freq: 450, to: 135, attack: 0.05, decay: 0.5, gain: 0.1 });
    },

    playSeedLaunch() {
        if (!this.ctx) return;
        this.burst({ filter: 'bandpass', freq: 1800, to: 700, q: 1.2, decay: 0.12, gain: 0.12 });
        this.tone({ type: 'triangle', freq: 520, to: 260, decay: 0.11, gain: 0.07 });
    }
};

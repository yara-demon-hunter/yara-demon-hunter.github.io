// --- MÚSICA PROCEDURAL ---
// Um sequenciador simples em cima da Web Audio: agenda notas um pouco à frente do relógio do áudio
// e troca de clima conforme o momento da noite. A trilha sobe com a hora e com o boss em campo.
// Climas: menu, hunt, boss, camp, dawn, silent. Tudo em ré menor, tirando o boss (mi frígio).
const LOOKAHEAD_SECONDS = 0.18;
const TICK_MS = 50;

const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

// Baixo por compasso e notas do arpejo: Dm - Bb - Gm - A
const HUNT_BARS = [
    { bass: 38, chord: [62, 65, 69, 74] },
    { bass: 34, chord: [58, 62, 65, 70] },
    { bass: 31, chord: [55, 58, 62, 67] },
    { bass: 33, chord: [57, 61, 64, 69] }
];
// Frígio: a segunda menor deixa tudo mais ameaçador
const BOSS_BARS = [
    { bass: 28, chord: [64, 67, 71, 76] },
    { bass: 29, chord: [65, 68, 72, 77] },
    { bass: 28, chord: [64, 67, 71, 76] },
    { bass: 26, chord: [62, 65, 69, 74] }
];
const CAMP_BARS = [
    { bass: 38, chord: [62, 69, 74, 77] },
    { bass: 41, chord: [65, 72, 77, 81] },
    { bass: 34, chord: [62, 65, 70, 74] },
    { bass: 33, chord: [61, 64, 69, 73] }
];
const DAWN_BARS = [
    { bass: 38, chord: [62, 66, 69, 74] },
    { bass: 43, chord: [62, 67, 71, 74] },
    { bass: 40, chord: [64, 67, 71, 76] },
    { bass: 45, chord: [61, 64, 69, 73] }
];

const MOODS = {
    silent: null,
    menu: { bpm: 54, bars: CAMP_BARS, pad: 0.05, bass: 0, kick: 0, snare: 0, hat: 0, arp: 0.05, arpEvery: 4, bell: 0.05 },
    hunt: { bpm: 104, bars: HUNT_BARS, pad: 0.035, bass: 0.16, kick: 0.5, snare: 0.1, hat: 0.03, arp: 0.045, arpEvery: 2, bell: 0 },
    boss: { bpm: 142, bars: BOSS_BARS, pad: 0.05, bass: 0.2, kick: 0.62, snare: 0.18, hat: 0.05, arp: 0.055, arpEvery: 1, bell: 0 },
    camp: { bpm: 66, bars: CAMP_BARS, pad: 0.05, bass: 0.05, kick: 0, snare: 0, hat: 0, arp: 0.08, arpEvery: 2, bell: 0 },
    dawn: { bpm: 72, bars: DAWN_BARS, pad: 0.08, bass: 0.06, kick: 0, snare: 0, hat: 0, arp: 0.08, arpEvery: 2, bell: 0.05 }
};

export class MusicEngine {
    constructor(audio) {
        this.audio = audio;
        this.ctx = audio.ctx;
        this.mood = null;
        this.intensity = 0;
        this.step = 0;
        this.nextTime = 0;

        // Filtro na saída: abre com a intensidade e abafa na pausa
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 9000;
        this.filter.connect(audio.musicBus);

        // Eco leve no arpejo
        this.delay = this.ctx.createDelay(1);
        this.delay.delayTime.value = 0.28;
        const feedback = this.ctx.createGain();
        feedback.gain.value = 0.32;
        this.delay.connect(feedback);
        feedback.connect(this.delay);
        this.delay.connect(this.filter);

        setInterval(() => this.tick(), TICK_MS);
    }

    setMood(name) {
        const next = MOODS[name] ?? null;
        if (next === this.mood) return;
        this.mood = next;
        this.step = 0;
        this.nextTime = this.ctx.currentTime + 0.1;
    }

    setIntensity(value) {
        this.intensity = Math.max(0, Math.min(1, value));
    }

    setMuffled(muffled) {
        this.filter.frequency.setTargetAtTime(muffled ? 500 : 9000, this.ctx.currentTime, 0.08);
    }

    tick() {
        if (!this.mood || this.ctx.state !== 'running') return;
        // Aba em segundo plano: não acumula notas atrasadas
        if (this.nextTime < this.ctx.currentTime - 0.3) this.nextTime = this.ctx.currentTime;
        while (this.nextTime < this.ctx.currentTime + LOOKAHEAD_SECONDS) {
            this.playStep(this.step, this.nextTime);
            const bpm = this.mood.bpm * (this.mood.kick ? 1 + this.intensity * 0.22 : 1);
            this.nextTime += 60 / bpm / 4;      // semicolcheia
            this.step++;
        }
    }

    note({ type, freq, time, attack, decay, gain, cutoff = null, out = null }) {
        const osc = this.ctx.createOscillator();
        const amp = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        amp.gain.setValueAtTime(0.0001, time);
        amp.gain.exponentialRampToValueAtTime(gain, time + attack);
        amp.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);
        let last = osc;
        if (cutoff) {
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = cutoff;
            osc.connect(filter);
            last = filter;
        }
        last.connect(amp);
        amp.connect(out ?? this.filter);
        osc.start(time);
        osc.stop(time + attack + decay + 0.03);
    }

    drum({ freq, to, time, decay, gain }) {
        const osc = this.ctx.createOscillator();
        const amp = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(to, time + decay);
        amp.gain.setValueAtTime(gain, time);
        amp.gain.exponentialRampToValueAtTime(0.0001, time + decay);
        osc.connect(amp);
        amp.connect(this.filter);
        osc.start(time);
        osc.stop(time + decay + 0.02);
    }

    hit({ time, freq, decay, gain, filter = 'highpass' }) {
        const src = this.ctx.createBufferSource();
        const shape = this.ctx.createBiquadFilter();
        const amp = this.ctx.createGain();
        src.buffer = this.audio.noise;
        shape.type = filter;
        shape.frequency.value = freq;
        amp.gain.setValueAtTime(gain, time);
        amp.gain.exponentialRampToValueAtTime(0.0001, time + decay);
        src.connect(shape);
        shape.connect(amp);
        amp.connect(this.filter);
        src.start(time, Math.random() * 0.8);
        src.stop(time + decay + 0.02);
    }

    playStep(step, time) {
        const M = this.mood;
        const I = this.intensity;
        const sixteenth = step % 16;
        const bar = M.bars[Math.floor(step / 16) % M.bars.length];
        const beat = 60 / M.bpm;

        // Tapete: acorde longo no início de cada compasso
        if (sixteenth === 0 && M.pad) {
            bar.chord.slice(0, 3).forEach((n, i) => {
                this.note({ type: 'sawtooth', freq: midi(n - 12) * (1 + i * 0.0015), time, attack: beat * 1.2, decay: beat * 3.2, gain: M.pad, cutoff: 500 + I * 900 });
            });
        }

        // Baixo: ostinato que fica mais denso com a intensidade
        if (M.bass) {
            const pattern = I > 0.45 ? [0, 3, 6, 8, 11, 14] : [0, 6, 8, 14];
            if (pattern.includes(sixteenth)) {
                this.note({ type: 'sawtooth', freq: midi(bar.bass), time, attack: 0.008, decay: beat * 0.42, gain: M.bass, cutoff: 260 + I * 700 });
            }
        }

        // Percussão
        if (M.kick) {
            const kicks = I > 0.55 ? [0, 6, 8, 10] : [0, 8];
            if (kicks.includes(sixteenth)) this.drum({ freq: 130, to: 42, time, decay: 0.2, gain: M.kick });
        }
        if (M.snare && (I > 0.2 || M === MOODS.boss) && (sixteenth === 4 || sixteenth === 12)) {
            this.hit({ time, freq: 1500, decay: 0.12, gain: M.snare, filter: 'bandpass' });
        }
        if (M.hat && I > 0.35 && sixteenth % 2 === 0) {
            this.hit({ time, freq: 7000, decay: 0.03, gain: M.hat * (sixteenth % 4 === 2 ? 1 : 0.5) });
        }

        // Arpejo com eco
        if (M.arp && sixteenth % M.arpEvery === 0 && (M.kick === 0 || I > 0.15 || M === MOODS.boss)) {
            const index = Math.floor(sixteenth / M.arpEvery) % bar.chord.length;
            const octave = Math.floor(step / 32) % 2 === 1 ? 12 : 0;
            this.note({ type: 'triangle', freq: midi(bar.chord[index] + octave), time, attack: 0.004, decay: beat * 0.9, gain: M.arp, out: this.delay });
        }

        // Sino distante
        if (M.bell && sixteenth === 0 && Math.floor(step / 16) % 2 === 0) {
            this.note({ type: 'sine', freq: midi(bar.chord[3] + 12), time, attack: 0.006, decay: beat * 3, gain: M.bell, out: this.delay });
            this.note({ type: 'sine', freq: midi(bar.chord[3] + 19), time, attack: 0.006, decay: beat * 1.4, gain: M.bell * 0.4, out: this.delay });
        }
    }
}

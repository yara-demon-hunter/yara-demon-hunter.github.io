// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/sounds/core/engine.js e rode o sync.
// Motor de som: tudo sintetizado na hora com a Web Audio API, sem arquivo de áudio.
// É genérico: não sabe nada de nenhum jogo. Cada jogo passa as próprias configurações (volumes salvos) e as próprias músicas.
//
// Caminhos do som:
//   efeitos  -> sfxFilter (abafa o mundo na morte) -> compressor -> master
//   música   -> musicIn (ducking) -> musicBus (volume da opção) -> compressor -> master
//
// Regras de retenção que o motor garante para todo efeito (ver sounds/README.md):
//   - variação de tom (vary): o mesmo som repetido nunca soa idêntico;
//   - limite de vozes: em enxame, sons curtos novos são descartados em vez de virar parede de ruído;
//   - ducking: a música abaixa um instante para o som importante aparecer;
//   - muffle: o mundo abafa de repente (morte), para o silêncio seguinte pesar.
import { MusicEngine } from './music.js';

const MAX_SHORT_VOICES = 40;        // sons curtos (decay <= SHORT_DECAY) param de entrar acima disso
const SHORT_DECAY = 0.2;

export const SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27, 29, 31];     // pentatônica menor: a sequência sobe bonito

export class SoundEngineBase {
    // options.getSettings: () => ({ muted, sfx, music })   options.moods: as músicas do jogo (ver music.js)
    constructor({ getSettings = () => ({ muted: false, sfx: true, music: true }), moods = {}, firstMood = 'menu' } = {}) {
        this.getSettings = getSettings;
        this.moods = moods;
        this.ctx = null;
        this.master = null;
        this.sfx = null;
        this.sfxFilter = null;
        this.musicBus = null;
        this.musicIn = null;
        this.noise = null;
        this.music = null;
        this.voices = 0;
        this.last = {};             // último instante de cada som (limita repetição)
        this.coinChain = 0;
        this.coinTime = 0;
        this.pendingMood = firstMood;
        this.pendingIntensity = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            this.ctx = new AudioCtx();
            const compressor = this.ctx.createDynamicsCompressor();
            compressor.threshold.value = -16;
            compressor.ratio.value = 6;
            compressor.attack.value = 0.004;
            compressor.release.value = 0.16;
            this.master = this.ctx.createGain();
            this.sfx = this.ctx.createGain();
            this.sfxFilter = this.ctx.createBiquadFilter();
            this.sfxFilter.type = 'lowpass';
            this.sfxFilter.frequency.value = 20000;
            this.musicIn = this.ctx.createGain();
            this.musicBus = this.ctx.createGain();
            this.sfx.connect(this.sfxFilter);
            this.sfxFilter.connect(compressor);
            this.musicIn.connect(this.musicBus);
            this.musicBus.connect(compressor);
            compressor.connect(this.master);
            this.master.connect(this.ctx.destination);

            // Ruído branco reaproveitado por batidas, golpes e fogo
            const length = this.ctx.sampleRate;
            this.noise = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
            const data = this.noise.getChannelData(0);
            for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

            this.music = new MusicEngine(this, this.moods);
            this.applySettings();
            this.music.setIntensity(this.pendingIntensity);
            this.music.setMood(this.pendingMood);
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    applySettings() {
        if (!this.ctx) return;
        const { muted, sfx, music } = this.getSettings();
        const now = this.ctx.currentTime;
        this.master.gain.setTargetAtTime(muted ? 0 : 1, now, 0.02);
        this.sfx.gain.setTargetAtTime(sfx ? 0.85 : 0, now, 0.02);
        this.musicBus.gain.setTargetAtTime(music ? 0.5 : 0, now, 0.05);
    }

    setMood(mood) {
        this.pendingMood = mood;
        if (this.music) this.music.setMood(mood);
    }

    setIntensity(value) {
        this.pendingIntensity = value;
        if (this.music) this.music.setIntensity(value);
    }

    // Pausa: abafa a música sem parar o compasso
    setPaused(paused) {
        if (this.music) this.music.setMuffled(paused);
    }

    // Aba em segundo plano: desliga o áudio de vez e poupa bateria
    setHidden(hidden) {
        if (!this.ctx) return;
        if (hidden) this.ctx.suspend();
        else this.ctx.resume();
    }

    // true se este som tocou há menos de gap segundos
    throttled(key, gap) {
        const now = this.ctx.currentTime;
        if (now - (this.last[key] ?? -1) < gap) return true;
        this.last[key] = now;
        return false;
    }

    // Variação aleatória de ±pct (0.05 = ±5%). Faz o mesmo efeito repetido soar vivo
    jitter(value, pct) {
        return pct ? value * (1 + (Math.random() * 2 - 1) * pct) : value;
    }

    // Sons curtos cedem lugar quando já há vozes demais
    crowded(decay) {
        return decay <= SHORT_DECAY && this.voices >= MAX_SHORT_VOICES;
    }

    // Ducking: a música abaixa para depth (0 a 1), segura por hold e volta em cerca de release segundos
    duck({ depth = 0.45, hold = 0.35, release = 0.9 } = {}) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const gain = this.musicIn.gain;
        gain.cancelScheduledValues(now);
        gain.setTargetAtTime(depth, now, 0.03);
        gain.setTargetAtTime(1, now + hold, release / 3);
    }

    // Abafa o mundo de repente (efeitos e música) e devolve devagar: é o "corte" da morte
    muffle({ freq = 420, hold = 0.5, release = 0.7 } = {}) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        for (const param of [this.sfxFilter.frequency, this.music?.filter.frequency]) {
            if (!param) continue;
            param.cancelScheduledValues(now);
            param.setTargetAtTime(freq, now, 0.02);
            param.setTargetAtTime(param === this.sfxFilter.frequency ? 20000 : 9000, now + hold, release / 3);
        }
    }

    // Oscilador com envelope. o: { type, freq, to (glide), at, attack, decay, gain, vary, out }
    tone({ type = 'sine', freq, to = null, at = 0, attack = 0.002, decay = 0.15, gain = 0.2, vary = 0, out = null }) {
        if (!this.ctx || this.crowded(decay)) return;
        const start = this.ctx.currentTime + at;
        const shift = this.jitter(1, vary);
        const osc = this.ctx.createOscillator();
        const amp = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq * shift, start);
        if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to * shift), start + attack + decay);
        amp.gain.setValueAtTime(0.0001, start);
        amp.gain.exponentialRampToValueAtTime(gain, start + attack);
        amp.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
        osc.connect(amp);
        amp.connect(out ?? this.sfx);
        this.voices++;
        osc.onended = () => { this.voices--; };
        osc.start(start);
        osc.stop(start + attack + decay + 0.02);
    }

    // Grave que se ouve no celular: o fundamental (sine) mais o 2º e o 3º harmônicos, que o ouvido usa para "completar" a nota
    // mesmo quando o alto-falante não reproduz abaixo de ~150 Hz. Use no lugar de uma sine solta em freq < 150.
    sub({ freq, to = null, at = 0, attack = 0.004, decay = 0.3, gain = 0.3, vary = 0 }) {
        this.tone({ type: 'sine', freq, to, at, attack, decay, gain, vary });
        this.tone({ type: 'triangle', freq: freq * 2, to: to && to * 2, at, attack, decay: decay * 0.8, gain: gain * 0.45, vary });
        this.tone({ type: 'triangle', freq: freq * 3, to: to && to * 3, at, attack, decay: decay * 0.5, gain: gain * 0.22, vary });
    }

    // Ruído filtrado com envelope. o: { filter, freq, to, q, at, attack, decay, gain, vary, out }
    burst({ filter = 'lowpass', freq = 1200, to = null, q = 0.8, at = 0, attack = 0.002, decay = 0.12, gain = 0.2, vary = 0, out = null }) {
        if (!this.ctx || this.crowded(decay)) return;
        const start = this.ctx.currentTime + at;
        const shift = this.jitter(1, vary);
        const src = this.ctx.createBufferSource();
        const shape = this.ctx.createBiquadFilter();
        const amp = this.ctx.createGain();
        src.buffer = this.noise;
        shape.type = filter;
        shape.Q.value = q;
        shape.frequency.setValueAtTime(freq * shift, start);
        if (to) shape.frequency.exponentialRampToValueAtTime(Math.max(20, to * shift), start + attack + decay);
        amp.gain.setValueAtTime(0.0001, start);
        amp.gain.exponentialRampToValueAtTime(gain, start + attack);
        amp.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
        src.connect(shape);
        shape.connect(amp);
        amp.connect(out ?? this.sfx);
        this.voices++;
        src.onended = () => { this.voices--; };
        src.start(start, Math.random() * 0.8);
        src.stop(start + attack + decay + 0.02);
    }
}

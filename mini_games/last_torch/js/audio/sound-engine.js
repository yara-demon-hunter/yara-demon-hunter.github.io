import { save } from '../core/save.js';
import { MusicEngine } from './music.js';

// --- SINTETIZADOR DE ÁUDIO SINTÉTICO (Web Audio API) ---
// Tudo é gerado na hora, sem arquivos. Saídas: efeitos e música têm volumes próprios e passam por um
// compressor, que evita estourar quando muitos sons tocam juntos.
const SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27, 29, 31];     // pentatônica menor, para a sequência subir bonito

export class SoundEngine {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.sfx = null;
        this.musicBus = null;
        this.noise = null;
        this.music = null;
        this.last = {};             // último instante de cada som (limita repetição)
        this.coinChain = 0;
        this.coinTime = 0;
        this.pendingMood = 'menu';
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
            this.musicBus = this.ctx.createGain();
            this.sfx.connect(compressor);
            this.musicBus.connect(compressor);
            compressor.connect(this.master);
            this.master.connect(this.ctx.destination);

            // Ruído branco reaproveitado por batidas, golpes e fogo
            const length = this.ctx.sampleRate;
            this.noise = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
            const data = this.noise.getChannelData(0);
            for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

            this.music = new MusicEngine(this);
            this.applySettings();
            this.music.setIntensity(this.pendingIntensity);
            this.music.setMood(this.pendingMood);
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    applySettings() {
        if (!this.ctx) return;
        const { muted, sfx, music } = save.settings;
        const now = this.ctx.currentTime;
        this.master.gain.setTargetAtTime(muted ? 0 : 1, now, 0.02);
        this.sfx.gain.setTargetAtTime(sfx ? 0.85 : 0, now, 0.02);
        this.musicBus.gain.setTargetAtTime(music ? 0.5 : 0, now, 0.05);
    }

    toggleMute() {
        save.settings.muted = !save.settings.muted;
        this.applySettings();
        return save.settings.muted;
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

    // Oscilador com envelope. o: { type, freq, to (glide), at, attack, decay, gain, out }
    tone({ type = 'sine', freq, to = null, at = 0, attack = 0.002, decay = 0.15, gain = 0.2, out = null }) {
        if (!this.ctx) return;
        const start = this.ctx.currentTime + at;
        const osc = this.ctx.createOscillator();
        const amp = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + attack + decay);
        amp.gain.setValueAtTime(0.0001, start);
        amp.gain.exponentialRampToValueAtTime(gain, start + attack);
        amp.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
        osc.connect(amp);
        amp.connect(out ?? this.sfx);
        osc.start(start);
        osc.stop(start + attack + decay + 0.02);
    }

    // Ruído filtrado com envelope. o: { filter, freq, to, q, at, attack, decay, gain, out }
    burst({ filter = 'lowpass', freq = 1200, to = null, q = 0.8, at = 0, attack = 0.002, decay = 0.12, gain = 0.2, out = null }) {
        if (!this.ctx) return;
        const start = this.ctx.currentTime + at;
        const src = this.ctx.createBufferSource();
        const shape = this.ctx.createBiquadFilter();
        const amp = this.ctx.createGain();
        src.buffer = this.noise;
        shape.type = filter;
        shape.Q.value = q;
        shape.frequency.setValueAtTime(freq, start);
        if (to) shape.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + attack + decay);
        amp.gain.setValueAtTime(0.0001, start);
        amp.gain.exponentialRampToValueAtTime(gain, start + attack);
        amp.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
        src.connect(shape);
        shape.connect(amp);
        amp.connect(out ?? this.sfx);
        src.start(start, Math.random() * 0.8);
        src.stop(start + attack + decay + 0.02);
    }

    // --- COMBATE ---
    playSwordSlash(comboIndex = 1) {
        if (!this.ctx || this.throttled('slash', 0.06)) return;
        const base = comboIndex === 1 ? 2400 : comboIndex === 2 ? 3000 : 1800;
        this.burst({ filter: 'bandpass', freq: base, to: base * 0.3, q: 1.4, decay: 0.1, gain: comboIndex === 3 ? 0.32 : 0.22 });
        this.tone({ type: 'triangle', freq: 620 + comboIndex * 90, to: 150, decay: 0.08, gain: 0.05 });
    }

    // Impacto: batida grave curta + estalo. Quanto mais alvos, mais gordo
    playHit(targets = 1) {
        if (!this.ctx || this.throttled('hit', 0.06)) return;
        this.tone({ type: 'sine', freq: 170, to: 60, decay: 0.07, gain: Math.min(0.3, 0.16 + targets * 0.03) });
        this.burst({ filter: 'highpass', freq: 1500, decay: 0.03, gain: 0.1 });
    }

    playCrit() {
        if (!this.ctx || this.throttled('crit', 0.05)) return;
        this.tone({ type: 'square', freq: 1760, to: 880, decay: 0.09, gain: 0.05 });
        this.tone({ type: 'sine', freq: 2640, decay: 0.14, gain: 0.05 });
    }

    // Morte: a nota sobe com a sequência. É o som que faz querer manter a sequência viva
    playKill(streak = 0) {
        if (!this.ctx || this.throttled('kill', 0.05)) return;
        const step = Math.min(SCALE.length - 1, Math.floor(streak / 3));
        const freq = 220 * Math.pow(2, SCALE[step] / 12);
        this.tone({ type: 'triangle', freq, decay: 0.12, gain: 0.13 });
        this.tone({ type: 'sine', freq: freq * 2, decay: 0.08, gain: 0.05 });
        this.burst({ filter: 'lowpass', freq: 900, to: 200, decay: 0.14, gain: 0.16 });
    }

    playExplode() {
        if (!this.ctx || this.throttled('explode', 0.05)) return;
        this.tone({ type: 'sine', freq: 120, to: 34, decay: 0.2, gain: 0.3 });
        this.burst({ filter: 'lowpass', freq: 1400, to: 160, decay: 0.2, gain: 0.26 });
    }

    playBlast() {
        if (!this.ctx || this.throttled('blast', 0.06)) return;
        this.tone({ type: 'sine', freq: 95, to: 30, decay: 0.26, gain: 0.34 });
        this.burst({ filter: 'lowpass', freq: 2000, to: 120, decay: 0.28, gain: 0.3 });
    }

    playUltSound() {
        if (!this.ctx) return;
        this.tone({ type: 'sawtooth', freq: 130, to: 900, attack: 0.02, decay: 0.42, gain: 0.2 });
        this.tone({ type: 'sine', freq: 65, to: 40, decay: 0.5, gain: 0.34 });
        this.burst({ filter: 'bandpass', freq: 500, to: 4000, q: 1, attack: 0.05, decay: 0.42, gain: 0.26 });
    }

    playHurt() {
        if (!this.ctx || this.throttled('hurt', 0.08)) return;
        this.tone({ type: 'sawtooth', freq: 240, to: 60, decay: 0.16, gain: 0.2 });
        this.burst({ filter: 'lowpass', freq: 700, decay: 0.1, gain: 0.2 });
    }

    playTorchHit() {
        if (!this.ctx || this.throttled('torch', 0.1)) return;
        this.tone({ type: 'sine', freq: 200, to: 70, decay: 0.26, gain: 0.3 });
        this.burst({ filter: 'bandpass', freq: 800, to: 300, q: 0.7, decay: 0.3, gain: 0.26 });
    }

    playAlarm() {
        if (!this.ctx) return;
        [0, 0.26].forEach(at => {
            this.tone({ type: 'square', freq: 523, at, decay: 0.2, gain: 0.08 });
            this.tone({ type: 'square', freq: 554, at, decay: 0.2, gain: 0.08 });
        });
    }

    playDash() {
        if (!this.ctx || this.throttled('dash', 0.05)) return;
        this.burst({ filter: 'bandpass', freq: 700, to: 2800, q: 1.6, attack: 0.02, decay: 0.15, gain: 0.3 });
    }

    playPerfect() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 1046, decay: 0.2, gain: 0.12 });
        this.tone({ type: 'sine', freq: 1568, at: 0.05, decay: 0.26, gain: 0.12 });
    }

    // Rebate (Mirror Ward): "ting" metálico que sobe de tom
    playReflect() {
        if (!this.ctx) return;
        [1320, 1980].forEach((freq, i) => {
            this.tone({ type: i === 0 ? 'triangle' : 'sine', freq: freq * 0.8, to: freq, decay: 0.35, gain: 0.16 });
        });
    }

    // --- SKILLS DOS RAMOS ---
    // Earthbreaker: pancada grave com pedras. scale < 1 nos abalos seguintes
    playSlam(scale = 1) {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 130, to: 34, decay: 0.42, gain: 0.5 * scale });
        this.burst({ filter: 'lowpass', freq: 900, to: 120, decay: 0.34, gain: 0.5 * scale });
        this.burst({ filter: 'bandpass', freq: 2400, to: 500, q: 1, at: 0.03, decay: 0.16, gain: 0.14 * scale });
    }

    // War Cry: grito rouco que sobe e cai
    playRoar() {
        if (!this.ctx) return;
        this.tone({ type: 'sawtooth', freq: 120, to: 240, attack: 0.08, decay: 0.3, gain: 0.2 });
        this.tone({ type: 'sawtooth', freq: 181, to: 330, attack: 0.08, decay: 0.3, gain: 0.14 });
        this.burst({ filter: 'bandpass', freq: 500, to: 1400, q: 0.8, attack: 0.06, decay: 0.42, gain: 0.3 });
    }

    // Executioner: corte seco
    playExecute() {
        if (!this.ctx || this.throttled('execute', 0.06)) return;
        this.burst({ filter: 'highpass', freq: 2600, to: 900, decay: 0.08, gain: 0.3 });
        this.tone({ type: 'square', freq: 220, to: 70, decay: 0.09, gain: 0.14 });
    }

    // Death Mark: "ting" seco; com o dash, mais alto e com um brilho depois
    playMark(big = false) {
        if (!this.ctx || this.throttled('mark', 0.05)) return;
        this.tone({ type: 'triangle', freq: big ? 1760 : 1320, to: 660, decay: 0.16, gain: 0.16 });
        if (big) this.tone({ type: 'sine', freq: 2637, at: 0.05, decay: 0.24, gain: 0.1 });
        this.burst({ filter: 'highpass', freq: 3200, decay: 0.05, gain: 0.16 });
    }

    playSmoke() {
        if (!this.ctx) return;
        this.burst({ filter: 'lowpass', freq: 1400, to: 300, attack: 0.02, decay: 0.3, gain: 0.16 });
    }

    // Vigil: escudo sobe e estoura
    playShield() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 330, to: 660, decay: 0.26, gain: 0.12 });
        this.tone({ type: 'sine', freq: 495, to: 990, at: 0.04, decay: 0.26, gain: 0.08 });
    }

    playShieldBreak() {
        if (!this.ctx) return;
        this.burst({ filter: 'bandpass', freq: 3000, to: 700, q: 0.8, decay: 0.22, gain: 0.34 });
        this.tone({ type: 'triangle', freq: 880, to: 220, decay: 0.2, gain: 0.16 });
    }

    playPhoenix() {
        if (!this.ctx) return;
        this.burst({ filter: 'bandpass', freq: 300, to: 3200, q: 0.7, attack: 0.05, decay: 0.7, gain: 0.34 });
        [392, 523, 784].forEach((freq, i) => this.tone({ type: 'triangle', freq, at: i * 0.1, decay: 0.5, gain: 0.14 }));
    }

    // Maldição pulando: sussurro que desce
    playHex() {
        if (!this.ctx || this.throttled('hex', 0.09)) return;
        this.tone({ type: 'sawtooth', freq: 620, to: 180, decay: 0.16, gain: 0.05 });
        this.burst({ filter: 'bandpass', freq: 1800, to: 700, q: 2, decay: 0.14, gain: 0.08 });
    }

    // Void Rift: sucção subindo e, depois, o colapso
    playRift() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 70, to: 240, attack: 0.3, decay: 0.7, gain: 0.26 });
        this.burst({ filter: 'bandpass', freq: 300, to: 1400, q: 2.4, attack: 0.3, decay: 0.7, gain: 0.2 });
    }

    playRiftCollapse() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 240, to: 40, decay: 0.3, gain: 0.42 });
        this.burst({ filter: 'lowpass', freq: 1800, to: 160, decay: 0.3, gain: 0.36 });
    }

    // Juramento: acorde grave que abre
    playOath() {
        if (!this.ctx) return;
        [110, 165, 220, 330].forEach((freq, i) => this.tone({ type: 'sawtooth', freq, at: i * 0.06, attack: 0.04, decay: 0.9, gain: 0.08 }));
        this.burst({ filter: 'bandpass', freq: 200, to: 2400, q: 0.8, attack: 0.06, decay: 0.7, gain: 0.26 });
    }

    // --- PODERES ---
    playZap() {
        if (!this.ctx || this.throttled('zap', 0.08)) return;
        this.burst({ filter: 'highpass', freq: 3000, decay: 0.08, gain: 0.22 });
        this.tone({ type: 'sawtooth', freq: 1400, to: 300, decay: 0.08, gain: 0.08 });
    }

    playNova() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 180, to: 520, decay: 0.28, gain: 0.2 });
        this.burst({ filter: 'bandpass', freq: 400, to: 2600, q: 0.8, decay: 0.3, gain: 0.18 });
    }

    playBolt() {
        if (!this.ctx || this.throttled('bolt', 0.08)) return;
        this.burst({ filter: 'bandpass', freq: 1200, to: 500, q: 1, decay: 0.12, gain: 0.14 });
    }

    // --- PROGRESSO ---
    // Moeda: em sequência, cada uma um tom acima
    playCoin() {
        if (!this.ctx || this.throttled('coin', 0.06)) return;
        const now = this.ctx.currentTime;
        this.coinChain = now - this.coinTime < 0.5 ? this.coinChain + 1 : 0;
        this.coinTime = now;
        const step = SCALE[Math.min(SCALE.length - 1, this.coinChain >> 1)];
        const freq = 987.77 * Math.pow(2, step / 24);
        this.tone({ type: 'sine', freq, decay: 0.05, gain: 0.07 });
        this.tone({ type: 'sine', freq: freq * 1.335, at: 0.04, decay: 0.08, gain: 0.07 });
    }

    playLevelUp() {
        if (!this.ctx) return;
        [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
            this.tone({ type: 'triangle', freq, at: i * 0.06, decay: 0.34, gain: 0.13 });
        });
    }

    playCardShow() {
        if (!this.ctx) return;
        [0, 0.07, 0.14].forEach((at, i) => {
            this.burst({ filter: 'bandpass', freq: 2200 + i * 500, q: 3, at, decay: 0.06, gain: 0.16 });
        });
    }

    playCardPick(rarity = 'common') {
        if (!this.ctx) return;
        const big = rarity === 'epic' || rarity === 'legendary' || rarity === 'evolution';
        const notes = big ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : rarity === 'rare' ? [523.25, 783.99, 1046.5] : [659.25, 987.77];
        notes.forEach((freq, i) => this.tone({ type: 'triangle', freq, at: i * 0.055, decay: 0.3, gain: 0.13 }));
    }

    playChest() {
        if (!this.ctx) return;
        [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((freq, i) => {
            this.tone({ type: 'triangle', freq, at: i * 0.07, decay: 0.4, gain: 0.12 });
        });
        this.burst({ filter: 'highpass', freq: 5000, attack: 0.1, decay: 0.5, gain: 0.08 });
    }

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
    }

    playPurchase() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 1318.5, decay: 0.08, gain: 0.1 });
        this.tone({ type: 'sine', freq: 1975.5, at: 0.06, decay: 0.22, gain: 0.1 });
        this.burst({ filter: 'highpass', freq: 4000, decay: 0.05, gain: 0.08 });
    }

    playStreakTier(index) {
        if (!this.ctx) return;
        const root = 392 * Math.pow(2, (index * 2) / 12);
        [1, 1.25, 1.5, 2].forEach((k, i) => this.tone({ type: 'sawtooth', freq: root * k, at: i * 0.04, decay: 0.3, gain: 0.05 }));
    }

    // --- EVENTOS DA NOITE ---
    playHourClear() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 70, to: 36, decay: 0.8, gain: 0.34 });
        this.burst({ filter: 'lowpass', freq: 400, to: 3200, attack: 0.08, decay: 0.8, gain: 0.26 });
        [261.63, 329.63, 392, 523.25, 659.25, 783.99].forEach((freq, i) => {
            this.tone({ type: 'triangle', freq, at: 0.1 + i * 0.08, decay: 0.7, gain: 0.11 });
        });
    }

    playHorn() {
        if (!this.ctx || this.throttled('horn', 1)) return;
        [110, 164.8].forEach(freq => {
            this.tone({ type: 'sawtooth', freq, attack: 0.12, decay: 1, gain: 0.08 });
        });
    }

    playBossWarning() {
        if (!this.ctx) return;
        [0, 0.55, 1.1, 1.65].forEach(at => {
            this.tone({ type: 'sine', freq: 62, to: 40, at, decay: 0.42, gain: 0.42 });
            this.burst({ filter: 'lowpass', freq: 240, at, decay: 0.3, gain: 0.3 });
        });
    }

    playBossRoar() {
        if (!this.ctx) return;
        [55, 58.3, 82.4].forEach(freq => {
            this.tone({ type: 'sawtooth', freq: freq * 1.6, to: freq, attack: 0.08, decay: 1.2, gain: 0.15 });
        });
        this.burst({ filter: 'lowpass', freq: 900, to: 200, attack: 0.06, decay: 1.1, gain: 0.3 });
    }

    playBossAttack() {
        if (!this.ctx || this.throttled('bossAttack', 0.2)) return;
        this.tone({ type: 'sawtooth', freq: 160, to: 70, decay: 0.3, gain: 0.14 });
        this.burst({ filter: 'bandpass', freq: 500, q: 0.8, decay: 0.26, gain: 0.2 });
    }

    playSummon() {
        if (!this.ctx) return;
        this.tone({ type: 'sawtooth', freq: 300, to: 90, attack: 0.05, decay: 0.5, gain: 0.1 });
        this.tone({ type: 'sine', freq: 450, to: 135, attack: 0.05, decay: 0.5, gain: 0.1 });
    }

    playBossDeath() {
        if (!this.ctx) return;
        this.tone({ type: 'sawtooth', freq: 200, to: 28, attack: 0.02, decay: 1.6, gain: 0.2 });
        this.tone({ type: 'sine', freq: 90, to: 24, decay: 1.8, gain: 0.4 });
        this.burst({ filter: 'lowpass', freq: 3000, to: 90, decay: 1.8, gain: 0.4 });
    }

    playRevive() {
        if (!this.ctx) return;
        [392, 523.25, 783.99, 1046.5].forEach((freq, i) => {
            this.tone({ type: 'sine', freq, at: i * 0.1, attack: 0.03, decay: 0.8, gain: 0.14 });
        });
    }

    playDeath() {
        if (!this.ctx) return;
        this.tone({ type: 'sine', freq: 180, to: 30, decay: 1.2, gain: 0.34 });
        this.burst({ filter: 'lowpass', freq: 1600, to: 80, decay: 1.2, gain: 0.34 });
    }

    playGameOver() {
        if (!this.ctx) return;
        [293.66, 246.94, 220, 146.83].forEach((freq, i) => {
            this.tone({ type: 'triangle', freq, at: i * 0.26, attack: 0.02, decay: 0.8, gain: 0.12 });
        });
    }
}

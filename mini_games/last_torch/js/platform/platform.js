// --- CAMADA DE PLATAFORMA ---
// O jogo só fala com `platform`; cada portal (GameMonetize, CrazyGames...) tem um adaptador em ./adapters. Quem escolhe o adaptador é o
// build: ele grava window.PLATFORM_NAME no index.html (ver build-standalone.rb e BUILDSTANDALONE.md). Sem isso vale "none": nada acontece.
import crazygames from './adapters/crazygames.js';
import gamemonetize from './adapters/gamemonetize.js';
import none from './adapters/none.js';

const ADAPTERS = { none, gamemonetize, crazygames };
const name = ADAPTERS[window.PLATFORM_NAME] ? window.PLATFORM_NAME : 'none';
const adapter = ADAPTERS[name];

// Tempo mínimo entre dois anúncios (e antes do primeiro): o jogador nunca vê anúncio logo que abre o jogo
const AD_GAP_MS = 120000;
let lastAd = Date.now();
let playing = false;
let paused = false;
let started = false;
let adRunning = false;
const pauseHandlers = [];
const resumeHandlers = [];

// Idempotente: o SDK e o nosso código podem pedir a mesma pausa duas vezes
function setPaused(value) {
    if (paused === value) return;
    paused = value;
    (value ? pauseHandlers : resumeHandlers).forEach((fn) => { try { fn(); } catch { } });
}

export const platform = {
    name,
    get isPortal() { return name !== 'none'; },
    // Chamada uma vez, quando o jogo já pode ser jogado
    init() {
        if (started) return;
        started = true;
        try { adapter.init({ pause: () => setPaused(true), resume: () => setPaused(false) }); } catch { }
    },
    loadingDone() { try { adapter.loadingDone(); } catch { } },
    // A caçada começou / terminou (menu, derrota, vitória). Os portais usam isso nas métricas e para não pôr anúncio durante o jogo
    gameplayStart() {
        if (playing) return;
        playing = true;
        try { adapter.gameplayStart(); } catch { }
    },
    gameplayStop() {
        if (!playing) return;
        playing = false;
        try { adapter.gameplayStop(); } catch { }
    },
    onPause(fn) { pauseHandlers.push(fn); },
    onResume(fn) { resumeHandlers.push(fn); },
    // Anúncio entre uma noite e outra. Só chame depois de uma ação do jogador (ex.: HUNT AGAIN), nunca por tempo.
    // Sempre resolve (o jogo segue mesmo se o anúncio falhar); respeita o intervalo mínimo entre anúncios.
    async showInterstitial() {
        if (name === 'none') return false;
        const wait = Math.ceil((AD_GAP_MS - (Date.now() - lastAd)) / 1000);
        // No console (F12) dá para ver por que o anúncio não saiu
        if (adRunning || wait > 0) { console.info(`[platform] anúncio pulado: ${adRunning ? 'outro em andamento' : `faltam ${wait}s do intervalo mínimo`}`); return false; }
        adRunning = true;
        this.gameplayStop();
        setPaused(true);
        let ran = false;
        try { ran = await adapter.showInterstitial(); } catch { }
        console.info(`[platform] ${name}: ${ran ? 'anúncio exibido' : 'o portal não entregou anúncio (sem SDK, fora do portal ou sem anúncio agora)'}`);
        setPaused(false);
        adRunning = false;
        if (ran) lastAd = Date.now();
        return ran;
    }
};

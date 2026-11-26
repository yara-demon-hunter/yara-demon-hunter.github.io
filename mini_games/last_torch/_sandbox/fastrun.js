// Aba "Fast run" do sandbox: começa uma partida normal (herói e hora à escolha) e a acelera em vários níveis, para testar o jogo
// inteiro em poucos minutos. Opcionalmente joga sozinha (piloto automático): anda perto da tocha, ataca quem chega, gasta os pontos
// de skill, atravessa as conversas e o acampamento. Roda por cima do jogo de verdade, sem alterar nenhum arquivo dele.
// Acelerar = rodar update() mais vezes por quadro de tela (o jogo continua desenhando uma vez por quadro).
import { ACTIVE_HEROES, HEROES } from '/data_model/heroes.js';
import { save } from '/js/core/save.js';
import { audio, joystick, player, state } from '/js/core/state.js';
import { update } from '/js/game.js';
import { buyNode, getBuyableNodes } from '/js/systems/tree.js';
import { leaveCamp } from '/js/ui/camp.js';
import { continueRun, startGame } from '/js/ui/screens.js';
import { loadRun, runPlace } from '/js/core/run_save.js';

const SPEEDS = [1, 2, 4, 10, 20, 50];           // trocáveis a qualquer momento, pela barra sobre o jogo
const STEP = 1 / 60;

const waves = [];                       // tempo de jogo de cada onda terminada (segundos do jogo, não do relógio)
const mmss = (sec) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
let prevState = null;
const FAST_KEY = 'sbFastRun';           // a última configuração da aba (herói, imortal, velocidade, piloto): fica no localStorage do sandbox
const run = { active: false, speed: 1, auto: true, autoCamp: false, mute: true, over: null, heroMods: null };

export function mountFastRun(host, { hidePanel, showPanel, onStart }) {
    host.innerHTML = `
      <button id="sbFastReset" class="sb-opt" title="Put the Fast run settings back to how they start (first hero, never die on, speed ×1, autopilot on)">↺ Reset Fast run to defaults</button>
      <p class="note">Pick a hero and start a normal run, then speed it up. The bar at the bottom-left sets the speed and turns the autopilot (the run plays itself) on or off.</p>
      <h3>Hero</h3><div class="sb-row" id="sbFastHeroes"></div>
      <label class="sb-field">Never die (hero and torch) <input id="sbFastGod" type="checkbox" checked></label>
      <h3>Speed</h3><div class="sb-row" id="sbFastSpeeds"></div>
      <div class="sb-fast-actions">
        <button id="sbFastGo">⏩ START RUN<small>from wave 1</small></button>
        <button id="sbFastContinue" disabled>▶ CONTINUE<small>nothing saved</small></button>
      </div>
      `;
    const choice = { hero: ACTIVE_HEROES[0] };
    const q = (s) => host.querySelector(s);

    // Guarda a configuração a cada mudança (só o que o jogador escolhe: a velocidade que o fim da partida força de volta a ×1 não conta)
    function saveFast() {
        try { localStorage.setItem(FAST_KEY, JSON.stringify({ hero: choice.hero, god: q('#sbFastGod').checked, speed: run.speed, auto: run.auto })); } catch { /* sem armazenamento: só não lembra */ }
    }
    run.saveFast = saveFast;
    function applyFast(d) {
        choice.hero = ACTIVE_HEROES.includes(d.hero) ? d.hero : ACTIVE_HEROES[0];
        q('#sbFastGod').checked = d.god !== false;
        run.speed = SPEEDS.includes(d.speed) ? d.speed : 1;
        run.auto = d.auto !== false;
        bar.querySelector('#sbBarAuto').checked = run.auto;
    }
    q('#sbFastGod').onchange = saveFast;

    const heroHost = q('#sbFastHeroes');
    function fillHeroes() {
        heroHost.innerHTML = '';
        ACTIVE_HEROES.forEach((key) => {
            const b = document.createElement('button');
            b.className = 'sb-opt' + (choice.hero === key ? ' on' : '');
            b.innerHTML = `${HEROES[key].name}<small>${HEROES[key].tagline ?? ''}</small>`;
            b.onclick = () => { choice.hero = key; fillHeroes(); saveFast(); refreshContinue?.(); };
            heroHost.appendChild(b);
        });
    }
    fillHeroes();

    const speedHost = q('#sbFastSpeeds');
    function fillSpeeds() {
        speedHost.innerHTML = '';
        SPEEDS.forEach((s) => {
            const b = document.createElement('button');
            b.className = 'sb-opt' + (run.speed === s ? ' on' : '');
            b.textContent = `×${s}`;
            b.onclick = () => { setSpeed(s); fillSpeeds(); saveFast(); };
            speedHost.appendChild(b);
        });
    }
    run.onSpeed = fillSpeeds;
    fillSpeeds();
    try { const saved = JSON.parse(localStorage.getItem(FAST_KEY)); if (saved) { applyFast(saved); fillHeroes(); fillSpeeds(); } } catch { /* nada guardado */ }
    q('#sbFastReset').onclick = () => {
        applyFast({ hero: ACTIVE_HEROES[0], god: true, speed: 1, auto: true });
        try { localStorage.removeItem(FAST_KEY); } catch { /* sem armazenamento */ }
        fillHeroes();
        fillSpeeds();
    };

    function go(continuing = false) {
        onStart?.();
        // Herói: só na memória desta página (o save não é gravado)
        if (!save.unlockedHeroes.includes(choice.hero)) save.unlockedHeroes.push(choice.hero);
        save.hero = choice.hero;
        if (run.heroMods) { HEROES[run.heroMods.key].mods = run.heroMods.mods; run.heroMods = null; }
        if (q('#sbFastGod').checked) {
            const h = HEROES[choice.hero];
            run.heroMods = { key: choice.hero, mods: h.mods };
            h.mods = { ...h.mods, damageTaken: -0.9 };
        }
        run.god = q('#sbFastGod').checked;
        run.godTorch = run.god;
        run.over = null;
        waves.length = 0;
        run.autoCamp = false;
        bar.querySelector('#sbBarCamp').checked = false;
        if (!(continuing && continueRun(false))) startGame();           // Continue: volta ao ponto onde parou (o registro do herói escolhido); sem registro, começa do zero
        setSpeed(run.speed);             // a velocidade escolhida (ou lembrada da última vez) vale desde o começo
        run.active = true;
        run.startedAt = performance.now();
        bar.classList.remove('hidden');
        bar.querySelector('#sbBarAuto').checked = run.auto;
        hidePanel();
    }
    q('#sbFastGo').onclick = () => go(false);
    // Continue: o jogo guarda a noite de cada herói ao chegar ao acampamento e ao sair dele; o botão mostra onde parou
    const contBtn = q('#sbFastContinue');
    contBtn.onclick = () => go(true);
    function refreshContinue() {
        const saved = loadRun(choice.hero);
        contBtn.disabled = !saved;
        contBtn.innerHTML = saved ? `▶ CONTINUE<small>${HEROES[choice.hero].name} · ${runPlace(saved)}</small>` : '▶ CONTINUE<small>nothing saved for this hero</small>';
    }
    refreshContinue();
    const poll = setInterval(() => { if (!host.isConnected) clearInterval(poll); else refreshContinue(); }, 1500);
    if (!run.onShow) run.onShow = showPanel;
    return {};
}

// --- barra de velocidade (sempre à vista durante a partida) ---
const bar = document.createElement('div');
bar.id = 'sbSpeed';
bar.className = 'hidden';
bar.innerHTML = `
  <div class="sb-speed-row" id="sbBarSpeeds"></div>
  <div class="sb-speed-info"><span id="sbBarInfo"></span></div>
  <div class="sb-speed-times" id="sbBarTimes" title="Game time of each finished wave (m:ss, in game seconds, not real time)"></div>
  <div class="sb-speed-info">
    <label><input type="checkbox" id="sbBarAuto" checked> autopilot</label>
    <label title="The autopilot also leaves the camp by itself"><input type="checkbox" id="sbBarCamp"> auto camp</label>
    <button id="sbBarStop" title="Stop the fast run bar">✕</button></div>`;
document.body.appendChild(bar);
const barSpeeds = bar.querySelector('#sbBarSpeeds');
SPEEDS.forEach((s) => {
    const b = document.createElement('button');
    b.dataset.speed = s;
    b.textContent = `×${s}`;
    b.onclick = () => { setSpeed(s); run.saveFast?.(); };
    barSpeeds.appendChild(b);
});
bar.querySelector('#sbBarAuto').onchange = (e) => { run.auto = e.target.checked; run.saveFast?.(); };
bar.querySelector('#sbBarCamp').onchange = (e) => { run.autoCamp = e.target.checked; };
bar.querySelector('#sbBarStop').onclick = () => { run.active = false; setSpeed(1); bar.classList.add('hidden'); };

function setSpeed(s) {
    run.speed = s;
    barSpeeds.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.speed === String(s)));
    run.onSpeed?.();
    // Som: em velocidade alta vira um chiado; o contexto de áudio é suspenso enquanto isso
    try {
        if (run.mute && s !== 1) audio.ctx?.suspend?.(); else audio.ctx?.resume?.();
    } catch { /* sem áudio: segue */ }
}
setSpeed(1);

// --- piloto automático ---
let buyTimer = 0;
let dialogueTimer = 0;
function autopilot() {
    if (state.gameState === 'GAMEOVER') {
        if (!run.over) {
            run.over = { wave: state.turn, kills: state.run?.kills ?? 0, seconds: Math.round((performance.now() - run.startedAt) / 1000) };
            setSpeed(1);
        }
        return;
    }
    if (state.gameState === 'DIALOGUE') {
        if ((dialogueTimer += 1) > 20) {
            dialogueTimer = 0;
            document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true, cancelable: true }));
        }
        return;
    }
    if (state.gameState === 'CAMP') {
        // Acampamento (relíquias, loja): por padrão é você quem passa por ele; "auto camp" na barra faz o piloto sair sozinho
        if (run.autoCamp) {
            spendPoints(40);
            leaveCamp();
        }
        return;
    }
    if (state.gameState !== 'PLAYING') return;
    if ((buyTimer += 1) > 30) {
        buyTimer = 0;
        if (state.skillPoints > 0) spendPoints(3);
    }
    // Adaga: dispara como o toque no botão (stick.fire): a mira automática escolhe o monstro mais perto. Só com monstros em campo
    if (state.enemies.length > 0) state.knifeInput.stick.fire = true;
    // Anda: sai para atacar quem chega perto da tocha; senão volta para ela
    let best = null, bd = 1e9;
    for (const e of state.enemies) {
        const d = Math.hypot(e.x - state.coreX, e.y - state.coreY);
        if (e.hp > 0 && d < bd) { bd = d; best = e; }
    }
    if (best && bd < 240) {
        const dx = best.x - player.x, dy = best.y - player.y, d = Math.hypot(dx, dy) || 1;
        joystick.x = d > 70 ? dx / d : 0;
        joystick.y = d > 70 ? dy / d : 0;
    } else {
        const dx = state.coreX - player.x, dy = state.coreY - player.y, d = Math.hypot(dx, dy) || 1;
        joystick.x = d > 60 ? dx / d : 0;
        joystick.y = d > 60 ? dy / d : 0;
    }
}

function spendPoints(max) {
    for (let i = 0; i < max && state.skillPoints > 0; i++) {
        const options = getBuyableNodes();
        if (!options.length) return;
        buyNode(options[Math.floor(Math.random() * options.length)].id);
    }
}

// --- laço: atualizações extras por quadro ---
function tick() {
    requestAnimationFrame(tick);
    if (!run.active) return;
    // Onda terminada: ao entrar no acampamento a onda que acabou é a anterior ao turno atual
    if (state.gameState === 'CAMP' && prevState !== 'CAMP') waves.push({ wave: state.turn - 1, seconds: state.waveTime });
    prevState = state.gameState;
    if (run.god && state.gameState === 'PLAYING' && player.hp > 0) player.hp = player.maxHp;
    if (run.godTorch && state.gameState === 'PLAYING' && state.coreHp > 0) state.coreHp = state.coreHpMax;
    if (run.auto) autopilot();
    if (state.gameState === 'PLAYING' && run.speed !== 1) {
        const steps = run.speed - 1;
        for (let i = 0; i < steps && state.gameState === 'PLAYING'; i++) {
            update(STEP);
            if (run.auto && i % 12 === 11) autopilot();
        }
    }
    updateInfo();
}

let lastInfo = 0;
function updateInfo() {
    const now = performance.now();
    if (now - lastInfo < 250) return;
    lastInfo = now;
    const times = bar.querySelector('#sbBarTimes');
    times.textContent = waves.length ? waves.map((w) => `W${w.wave} ${mmss(w.seconds)}`).join(' · ') + `  (total ${mmss(waves.reduce((a, w) => a + w.seconds, 0))})` : 'Finished waves: (none yet)';
    const info = bar.querySelector('#sbBarInfo');
    if (run.over) {
        info.textContent = `☠ Run over: wave ${run.over.wave}, ${run.over.kills} kills, ${run.over.seconds}s real time`;
        return;
    }
    const state_ = state.gameState === 'PLAYING' ? '' : ` (${state.gameState.toLowerCase()})`;
    info.textContent = `Wave ${state.turn} · ${mmss(state.waveTime)} · ${state.run?.kills ?? 0} kills · lvl ${state.playerLevel}${state_}`;
}
requestAnimationFrame(tick);

// O mapa entre as telas aparece depois do chefe: com o piloto ligado, ele segue sozinho (espera a caminhada acabar e continua)
setInterval(() => {
    if (!run.active || !(run.auto || run.autoCamp)) return;
    const map = document.getElementById('mapScreen');
    if (!map || map.classList.contains('hidden')) return;
    const go = document.getElementById('btnMapContinue');
    if (go && !go.disabled) go.click();
}, 400);

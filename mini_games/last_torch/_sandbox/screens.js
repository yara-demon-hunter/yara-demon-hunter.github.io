// Aba "Screens" do sandbox: abre as telas do jogo direto, com os números que você escolher, sem jogar até lá.
// Morrer (herói ou tocha), amanhecer (zerar o jogo), fim de onda (resultado com estrelas + acampamento), menu, presente, Ranks, Altar...
// Usa as funções reais do jogo (triggerGameOver, openCamp...), então o que aparece é exatamente o que o jogador vê. Roda por cima
// do jogo de verdade, sem alterar nenhum arquivo dele; o save do sandbox é separado do do jogo (outra porta = outro localStorage).
import { ACTIVE_HEROES, HEROES } from '/data_model/heroes.js';
import { WAVE_SPOILS } from '/data_model/night.js';
import { ACHIEVEMENTS } from '/data_model/sanctuary.js';
import { save, persist } from '/js/core/save.js';
import { player, state } from '/js/core/state.js';
import { buyNode, getBuyableNodes } from '/js/systems/tree.js';
import { grantWaveSpoils, openCamp } from '/js/ui/camp.js';
import { openAltar } from '/js/ui/altar.js';
import { openRanks } from '/js/ui/sanctuary.js';
import { openGift, returnToMenu, startGame, triggerGameOver } from '/js/ui/screens.js';
import { CAMPAIGN, TOTAL_WAVES, effectiveTurn } from '/data_model/campaign.js';
import { showMapTransition } from '/js/ui/map_screen.js';

export function mountScreens(host, { hidePanel, showPanel }) {
    const v = { hero: ACTIVE_HEROES[0], wave: 4, score: 12400, kills: 260, bosses: 1, stars: 3, darkness: 1 };
    host.innerHTML = `
      <p class="note">Open any screen right now, with the numbers below. After a screen opens, press <b>🧪 Sandbox</b> (bottom-left) to come back here.</p>
      <h3>Hero</h3><div class="sb-row" id="scHeroes"></div>
      <h3>The night so far</h3>
      <label class="sb-field">Wave reached <input id="scWave" type="number" min="1" max="18" value="${v.wave}"></label>
      <label class="sb-field">Score <input id="scScore" type="number" min="0" step="500" value="${v.score}"></label>
      <label class="sb-field">Monsters slain <input id="scKills" type="number" min="0" value="${v.kills}"></label>
      <label class="sb-field">Bosses beaten <input id="scBosses" type="number" min="0" max="18" value="${v.bosses}"></label>
      <label class="sb-field">Stars on the wave (0 to 3) <input id="scStars" type="number" min="0" max="3" value="${v.stars}"></label>
      <label class="sb-field">Darkness level <input id="scDark" type="number" min="1" max="8" value="${v.darkness}"></label>
      <label class="sb-field">Hide the "new hero unlocked" popup (it would cover the screen) <input id="scNoUnlock" type="checkbox" checked></label>
      <h3>End of the night</h3>
      <div class="sb-row" id="scEnd"></div>
      <h3>Between waves</h3>
      <div class="sb-row" id="scWaveBtns"></div>
      <h3>World map (between screens)</h3>
      <div class="sb-row" id="scMap"></div>
      <h3>Menus</h3>
      <div class="sb-row" id="scMenus"></div>
      <h3>Save of this sandbox</h3>
      <div class="sb-row" id="scSave"></div>
      <p class="note" id="scNote"></p>`;
    const q = (s) => host.querySelector(s);

    // O sandbox esconde a tela inicial (a arena abre direto: sandbox.css). Aqui o menu precisa aparecer quando o JOGO o abre (botão MENU
    // da vitória, Start menu, Gift...): enquanto a tela inicial não tem a classe "hidden", uma regra a mostra por cima da do sandbox
    const menuStyle = document.createElement('style');
    document.head.appendChild(menuStyle);
    const startEl = document.getElementById('startScreen');
    const syncMenu = () => { menuStyle.textContent = startEl.classList.contains('hidden') ? '' : '#startScreen { display: flex !important; }'; };
    new MutationObserver(syncMenu).observe(startEl, { attributes: true, attributeFilter: ['class'] });
    setInterval(syncMenu, 250);   // a classe pode já estar sem "hidden" (menu "aberto" por baixo) e então nada muda
    const num = (id, min, max) => Math.max(min, Math.min(max, +q(id).value || 0));
    const note = (text) => { q('#scNote').textContent = text; };

    const heroHost = q('#scHeroes');
    function fillHeroes() {
        heroHost.innerHTML = '';
        ACTIVE_HEROES.forEach(key => {
            const b = document.createElement('button');
            b.className = 'sb-opt' + (v.hero === key ? ' on' : '');
            b.textContent = HEROES[key].name;
            b.onclick = () => { v.hero = key; fillHeroes(); };
            heroHost.appendChild(b);
        });
    }
    fillHeroes();

    // Herói e noite no estado do jogo: começa uma partida de verdade (para tudo existir) e ajusta os números pedidos
    function prepare() {
        if (!save.unlockedHeroes.includes(v.hero)) save.unlockedHeroes.push(v.hero);
        save.hero = v.hero;
        // Passar da onda 1 liberaria o Rowan e o prêmio de herói cobriria a tela: marca esses troféus como já ganhos (desmarque a caixa
        // para ver o prêmio de verdade)
        if (q('#scNoUnlock').checked) {
            ACHIEVEMENTS.filter(a => a.hero).forEach(a => {
                save.achievements[a.id] = true;
                (save.achievementPaid ??= {})[a.id] = true;
                if (!save.unlockedHeroes.includes(a.hero) && HEROES[a.hero] && !HEROES[a.hero].shelved) save.unlockedHeroes.push(a.hero);
            });
        }
        save.darkness = Math.min(num('#scDark', 1, 8), 8);
        save.maxDarkness = Math.max(save.maxDarkness, save.darkness);
        startGame();
        state.enemies.length = 0;
        state.turn = num('#scWave', 1, 18);
        state.totalScore = num('#scScore', 0, 99999999);
        state.run.kills = num('#scKills', 0, 99999);
        state.run.bosses = num('#scBosses', 0, 18);
        state.playerLevel = 3 + state.turn * 2;
    }

    // Faz o resultado da onda render N estrelas (0 a 3): as regras são as do jogo (data_model/night.js > WAVE_SPOILS), na ordem: nenhum monstro
    // consumido pela tocha, herói com dano ≤ 50% e o Rush da onda
    function setWaveStars(wave, n) {
        const rush = n >= 3 ? Math.round(WAVE_SPOILS.rushGoalBase + WAVE_SPOILS.rushGoalPerWave * effectiveTurn(wave)) + 2 : 4;
        state.waveStats = {
            kills0: 0, gold0: 0, rush, consumed: n >= 1 ? 0 : 3,
            torchDamage: state.coreHpMax * (n >= 1 ? 0.3 : 0.9), heroDamage: player.maxHp * (n >= 2 ? 0.3 : 0.9)
        };
    }

    const go = (fn, what) => () => {
        prepare();
        fn();
        hidePanel();
        persist();
        note(`Opened: ${what}. Press 🧪 Sandbox to come back.`);
    };
    const add = (hostId, label, sub, fn) => {
        const b = document.createElement('button');
        b.className = 'sb-opt';
        b.innerHTML = `${label}<small>${sub}</small>`;
        b.onclick = fn;
        q(hostId).appendChild(b);
    };

    // Fim da noite: as três telas finais do jogo
    add('#scEnd', '💀 The hero fell', 'game over screen', go(() => triggerGameOver('PLAYER'), 'the hero fell'));
    add('#scEnd', '🔥 The torch went out', 'game over screen', go(() => triggerGameOver('CORE'), 'the torch went out'));
    add('#scEnd', '🏆 Fall with ALL new records', 'NEW RECORD + every NEW BEST line', go(() => {
        // Finge que os recordes anteriores eram mínimos e que esta noite foi enorme; devolve o recorde de pontuação real depois
        const oldBest = save.stats.bestScore;
        save.stats.bestScore = 1;
        state.run.startBests = { hour: 1, kills: 1, stars: 1, embers: 1, streak: 1 };
        state.run.kills = 400; state.run.stars = 30; state.run.bestStreak = 60;
        state.turn = Math.max(state.turn, 9);
        state.totalScore = Math.max(state.totalScore, 50000);
        triggerGameOver('PLAYER');
        save.stats.bestScore = Math.max(oldBest, state.totalScore);
    }, 'the game over screen with every record broken'));
    add('#scEnd', '🌅 Dawn: you finished the game', 'victory screen', go(() => {
        let oldBest = 0;
        const forceRecord = false;
        // Como no jogo: o resultado da última onda (com as estrelas escolhidas) aparece durante o amanhecer, e a tela de vitória vem depois
        state.turn = TOTAL_WAVES;
        state.run.victory = true;
        // Uma noite "vivida": estrelas variadas nas ondas 1 a 17 e algumas skills compradas, para a tela de vitória ter o que mostrar
        const pick = num('#scStars', 0, 3);
        state.run.waveStars = Object.fromEntries(Array.from({ length: TOTAL_WAVES - 1 }, (_, i) => [i + 1, Math.max(0, Math.min(3, pick + ((i * 7) % 3) - 1))]));
        state.skillPoints = 20;
        for (let i = 0; i < 10; i++) { const b = getBuyableNodes(); if (b.length) buyNode(b[i % b.length].id); }
        state.run.bestStreak = 48;
        if (forceRecord) {
            // Recorde forçado: os recordes anteriores viram mínimos; a pontuação real volta ao normal depois da tela
            oldBest = save.stats.bestScore;
            save.stats.bestScore = 1;
            state.run.startBests = { hour: 1, kills: 1, stars: 1, embers: 1, streak: 1 };
            state.totalScore = Math.max(state.totalScore, 50000);
        }
        setWaveStars(TOTAL_WAVES, num('#scStars', 0, 3));
        grantWaveSpoils(TOTAL_WAVES);
        // O resumo da noite espera o cartão fechar (como no jogo: uma tela de cada vez)
        const t0 = performance.now();
        const wait = setInterval(() => {
            if (performance.now() - t0 < 4500 || document.querySelector('.wave-results')) return;
            clearInterval(wait);
            triggerGameOver('DAWN');
            if (forceRecord) save.stats.bestScore = Math.max(oldBest, state.totalScore);
        }, 200);
    }, 'the dawn (results card first; the victory screen comes after you close it)'));

    add('#scEnd', '🏆 Dawn with a NEW RECORD', 'victory screen + record confetti', go(() => {
        let oldBest = 0;
        const forceRecord = true;
        // Como no jogo: o resultado da última onda (com as estrelas escolhidas) aparece durante o amanhecer, e a tela de vitória vem depois
        state.turn = TOTAL_WAVES;
        state.run.victory = true;
        // Uma noite "vivida": estrelas variadas nas ondas 1 a 17 e algumas skills compradas, para a tela de vitória ter o que mostrar
        const pick = num('#scStars', 0, 3);
        state.run.waveStars = Object.fromEntries(Array.from({ length: TOTAL_WAVES - 1 }, (_, i) => [i + 1, Math.max(0, Math.min(3, pick + ((i * 7) % 3) - 1))]));
        state.skillPoints = 20;
        for (let i = 0; i < 10; i++) { const b = getBuyableNodes(); if (b.length) buyNode(b[i % b.length].id); }
        state.run.bestStreak = 48;
        if (forceRecord) {
            // Recorde forçado: os recordes anteriores viram mínimos; a pontuação real volta ao normal depois da tela
            oldBest = save.stats.bestScore;
            save.stats.bestScore = 1;
            state.run.startBests = { hour: 1, kills: 1, stars: 1, embers: 1, streak: 1 };
            state.totalScore = Math.max(state.totalScore, 50000);
        }
        setWaveStars(TOTAL_WAVES, num('#scStars', 0, 3));
        grantWaveSpoils(TOTAL_WAVES);
        // O resumo da noite espera o cartão fechar (como no jogo: uma tela de cada vez)
        const t0 = performance.now();
        const wait = setInterval(() => {
            if (performance.now() - t0 < 4500 || document.querySelector('.wave-results')) return;
            clearInterval(wait);
            triggerGameOver('DAWN');
            if (forceRecord) save.stats.bestScore = Math.max(oldBest, state.totalScore);
        }, 200);
    }, 'the dawn (results card first; the victory screen comes after you close it)'));

    // Entre as ondas: o resultado (estrelas, prêmio) e o acampamento
    add('#scWaveBtns', '⭐ Wave cleared', 'results card, then the camp', go(() => {
        const wave = state.turn;
        state.turn = wave + 1;
        state.phase = 'CLEAR';
        setWaveStars(wave, num('#scStars', 0, 3));
        setTimeout(() => openCamp(), 60);
    }, 'the wave results and the camp'));
    add('#scWaveBtns', '🏕️ Camp only', 'no results card', go(() => { state.turn += 1; state.phase = 'CLEAR'; openCamp(true); }, 'the camp'));

    // Mapa entre as telas: o retrato do herói escolhido anda pelo caminho até a tela seguinte (a mesma animação que toca depois de cada chefe)
    CAMPAIGN.screens.slice(0, -1).forEach((s, i) => {
        const to = CAMPAIGN.screens[i + 1];
        add('#scMap', `🗺️ ${s.name} ▶ ${to.name}`, 'plays the walk on the map', () => {
            save.hero = v.hero;                                   // o retrato do herói escolhido acima (só na memória do sandbox)
            hidePanel();
            showMapTransition(i, i + 1, () => { showPanel?.(); note(`Played: ${s.name} to ${to.name}.`); });
        });
    });
    // Menus
    add('#scMenus', '🏠 Start menu', 'with this save', () => { hidePanel(); returnToMenu(); note('Opened: the start menu.'); });
    add('#scMenus', '🎁 Daily gift', 'the popup', () => { hidePanel(); returnToMenu(); openGift(); note('Opened: the daily gift.'); });
    add('#scMenus', '🏆 Ranks', 'top nights, heroes, stars', () => { hidePanel(); returnToMenu(); openRanks(); note('Opened: Ranks.'); });
    add('#scMenus', '🔥 Altar after a fall', '"try again, but stronger"', go(() => { triggerGameOver('PLAYER'); openAltar({ retry: true }); }, 'the Altar after a fall'));

    // Save do sandbox
    add('#scSave', '🔥 +500 embers', 'to test buying', () => { save.embers += 500; persist(); note(`Embers: ${save.embers}.`); });
    add('#scSave', '🔓 Unlock all heroes', '', () => { ACTIVE_HEROES.forEach(k => { if (!save.unlockedHeroes.includes(k)) save.unlockedHeroes.push(k); }); persist(); note('All heroes unlocked.'); });
    add('#scSave', '🆕 Brand new player', 'wipes this sandbox save and reloads', () => {
        if (!confirm('Wipe the sandbox save and reload?')) return;
        localStorage.clear();
        location.reload();
    });
}

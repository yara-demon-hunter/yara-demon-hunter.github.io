import { hideTreeHand } from './hints.js';
import { clearBattleEffects } from '../systems/spawner.js';
import { CAMP } from '../../data_model/passives.js';
import { BOSS_MODELS, chooseBossType, isBossTurn } from '../../data_model/bosses.js';
import { WAVE_SPOILS, getHourName } from '../../data_model/night.js';
import { showWaveResults } from './wave_results.js';
import { persist, save } from '../core/save.js';
import { saveRun } from '../core/run_save.js';
import { audio, player, state } from '../core/state.js';
import { collectAllGold } from '../systems/gold.js';
import { startHour } from '../systems/night.js';
import { NIGHT } from '../../data_model/night.js';
import { effectiveTurn } from '../../data_model/campaign.js';
import { getMaxPlayerHp } from '../systems/stats.js';
import { getHero } from '../systems/modifiers.js';
import { feedTorch } from '../systems/torch.js';
import { hasBuyableNode } from '../systems/tree.js';
import { updateHUD } from './hud.js';
import { reportProgress } from './screens.js';
import { resetStreak } from '../systems/streak.js';
import { openStatus } from './status.js';
import { relicTree } from './tree.js';

// --- ACAMPAMENTO ---
// Fim de cada hora: o ouro compra relíquias na árvore (js/ui/tree.js) ou alimenta a tocha. A próxima hora
// fica à vista, para o jogador decidir sabendo o que vem.
let fuelUses = 0;
let restUses = 0;

function fuelCost() {
    return CAMP.fuel.cost + CAMP.fuel.costPerHour * state.turn + CAMP.fuel.costPerUse * fuelUses;
}

function restCost() {
    return CAMP.rest.cost + CAMP.rest.costPerHour * state.turn + CAMP.rest.costPerUse * restUses;
}

function renderServices() {
    const torchFull = state.coreHp >= state.coreHpMax;
    const heroFull = player.hp >= player.maxHp;
    const fuel = fuelCost();
    const rest = restCost();

    document.getElementById('campTorchBar').style.transform = `scaleX(${state.coreHp / state.coreHpMax})`;
    document.getElementById('campTorchText').innerText = `${Math.ceil(state.coreHp)}/${state.coreHpMax}`;
    document.getElementById('campHeroBar').style.transform = `scaleX(${player.hp / player.maxHp})`;
    document.getElementById('campHeroText').innerText = `${Math.ceil(player.hp)}/${player.maxHp}`;

    const btnFuel = document.getElementById('btnFuel');
    btnFuel.innerHTML = torchFull ? 'FULL' : `+${CAMP.fuel.heal} 🪙 ${fuel}`;
    btnFuel.disabled = torchFull || state.coins < fuel;
    const btnRest = document.getElementById('btnRest');
    btnRest.innerHTML = heroFull ? 'FULL' : `+50% 🪙 ${rest}`;
    btnRest.disabled = heroFull || state.coins < rest;
}

// Ouro e serviços (a árvore se redesenha sozinha)
function renderWallet() {
    document.getElementById('campCoins').innerText = state.coins;
    document.getElementById('campPoints').innerText = state.skillPoints;
    document.getElementById('btnCampSkills').classList.toggle('hidden', !hasBuyableNode());
    renderServices();
}

function renderCamp() {
    renderWallet();
    relicTree.render();
}

export function setupCamp() {
    relicTree.setup();
    relicTree.onChange = renderWallet;
    document.getElementById('btnCampSkills').addEventListener('click', () => openStatus('CAMP', renderCamp));
}

// O que vem na próxima hora
function renderNext() {
    const hour = state.turn;
    document.getElementById('campNextHour').innerText = `WAVE ${hour} · ${getHourName(hour)}`;
    const threat = document.getElementById('campNextThreat');
    if (isBossTurn(hour, getHero().model)) {
        threat.innerText = `☠️ ${BOSS_MODELS[chooseBossType(hour, getHero().model)].name} awaits`;
    } else if (state.nextOmen) {
        threat.innerText = `${state.nextOmen.icon} ${state.nextOmen.name}: ${state.nextOmen.desc}`;
    } else {
        threat.innerText = 'The night is quiet. For now.';
    }
}

// Resultado do fim da onda (data_model/night.js > WAVE_SPOILS): 3 metas = 3 estrelas, ouro e (★★★) ponto de skill, e a pontuação
// da onda, comparada com o recorde daquela onda. Devolve as estrelas, que vão para o título do acampamento; a contagem aparece por cima.
export function grantWaveSpoils(wave, onClose = null) {
    const W = WAVE_SPOILS;
    const ws = state.waveStats ?? { kills0: 0, gold0: 0, rush: 0, torchDamage: 0, heroDamage: 0, consumed: 0 };
    const torchDmg = Math.min(100, Math.round(ws.torchDamage / Math.max(1, state.coreHpMax) * 100));
    const heroDmg = Math.min(100, Math.round(ws.heroDamage / Math.max(1, player.maxHp) * 100));
    const rushGoal = Math.round(W.rushGoalBase + W.rushGoalPerWave * effectiveTurn(wave));       // curva de 12 ondas esticada para a campanha
    const kills = state.run.kills - ws.kills0;
    const gold = Math.max(0, Math.round(state.run.goldEarned - ws.gold0));
    // Cada linha diz quantas estrelas ganhou (stars) e de quantas é capaz (goals); só as 3 regras valem estrela
    const rows = [
        { key: 'kills', label: 'Kills', value: kills, points: kills * W.score.kills },
        { key: 'burned', label: 'Monsters burned by the torch', value: ws.consumed ?? 0, points: 0, need: '0', goals: 1, stars: (ws.consumed ?? 0) === 0 ? 1 : 0 },
        { key: 'hero', label: 'Hero damage', value: heroDmg, suffix: '%', points: (100 - heroDmg) * W.score.hero, need: `≤${W.heroDamageGoal * 100}%`, goals: 1, stars: heroDmg <= W.heroDamageGoal * 100 ? 1 : 0 },
        { key: 'rush', label: 'Best Rush', value: ws.rush, points: ws.rush * W.score.rush, need: `${rushGoal}+`, goals: 1, stars: ws.rush >= rushGoal ? 1 : 0 },
        { key: 'gold', label: 'Gold', value: gold, points: gold * W.score.gold },
        { key: 'torch', label: 'Torch damage', value: torchDmg, suffix: '%', points: (100 - torchDmg) * W.score.torch }
    ];
    const count = rows.reduce((sum, r) => sum + (r.stars ?? 0), 0);
    const score = rows.reduce((sum, r) => sum + r.points, 0);
    const spoilsGold = Math.round((W.goldBase + W.goldPerWave * wave) * W.starGold[count]);
    const points = count === 3 ? W.perfectSkillPoints : 0;
    state.coins += spoilsGold;
    state.run.goldEarned += spoilsGold;
    state.skillPoints += points;
    // Recorde da onda: guardado no save (vale entre partidas)
    save.waveBests ??= {};
    const best = save.waveBests[wave] ?? null;
    const record = { score: Math.max(score, best?.score ?? 0), stars: Math.max(count, best?.stars ?? 0) };
    save.waveBests[wave] = record;
    state.run.stars = (state.run.stars ?? 0) + count;
    // Estrelas de cada onda desta noite: aparecem nas marcas da barra de ondas do HUD (js/ui/hud.js)
    (state.run.waveStars ??= {})[wave] = count;
    // Conquistas do Santuário: em quantas ondas diferentes já tirou ★★★
    save.stats.threeStarWaves = Object.values(save.waveBests).filter(b => b.stars >= 3).length;
    persist();
    showWaveResults({ wave, rows, stars: count, score, best, spoilsGold, points, onClose });
    return '★'.repeat(count) + '☆'.repeat(3 - count);
}

// resumed: voltando de um CONTINUE, o acampamento já aconteceu (ouro recolhido, tocha alimentada): não repete
export function openCamp(resumed = false, doneStars = null) {
    state.gameState = 'CAMP';
    clearBattleEffects();                  // o acampamento começa limpo: sem manchas, respingos nem pedaços da onda que acabou
    hideTreeHand();            // fim da onda 1: a mãozinha do medalhão não fica atrás do acampamento
    resetStreak();
    let stars = '';
    if (!resumed) {
        if (doneStars === null) {
            collectAllGold();
            stars = grantWaveSpoils(state.turn - 1);
        } else stars = doneStars;                       // o resultado já foi mostrado antes do mapa (fim da tela)
        feedTorch(CAMP.freeTorchHeal);
    }
    fuelUses = 0;
    restUses = 0;
    // Com estrelas o título fica curto (cabe numa linha no celular): "WAVE 3 ★★☆"
    document.getElementById('campEyebrow').innerText = stars ? `WAVE ${state.turn - 1} ${stars}` : `WAVE ${state.turn - 1} SURVIVED`;
    renderWallet();
    renderNext();
    updateHUD();
    document.getElementById('campScreen').classList.remove('hidden');
    relicTree.open();
    audio.setMood('camp');
    reportProgress();
    saveRun('camp');
}

export function buyFuel() {
    const cost = fuelCost();
    if (state.coins < cost || state.coreHp >= state.coreHpMax) return;
    state.coins -= cost;
    fuelUses++;
    feedTorch(CAMP.fuel.heal);
    updateHUD();
    renderWallet();
    audio.playPurchase();
}

export function buyRest() {
    const cost = restCost();
    if (state.coins < cost || player.hp >= player.maxHp) return;
    state.coins -= cost;
    restUses++;
    player.hp = Math.min(player.maxHp, player.hp + getMaxPlayerHp() * CAMP.rest.healRatio);
    updateHUD();
    renderWallet();
    audio.playPurchase();
}

export function leaveCamp() {
    if (state.gameState !== 'CAMP') return;
    document.getElementById('campScreen').classList.add('hidden');
    state.knifeInput.stick.fire = false;
    persist();
    state.gameState = 'PLAYING';
    saveRun('hunt');
    startHour();
}

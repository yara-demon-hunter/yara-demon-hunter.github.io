import { CAMP } from '../../data_model/passives.js';
import { BOSS_MODELS, chooseBossType, isBossTurn } from '../../data_model/bosses.js';
import { getHourName } from '../../data_model/night.js';
import { persist } from '../core/save.js';
import { audio, player, state } from '../core/state.js';
import { collectAllGold } from '../systems/gold.js';
import { startHour } from '../systems/night.js';
import { getMaxPlayerHp } from '../systems/stats.js';
import { feedTorch } from '../systems/torch.js';
import { updateHUD } from './hud.js';
import { reportProgress } from './screens.js';
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
    renderServices();
}

function renderCamp() {
    renderWallet();
    relicTree.render();
}

export function setupCamp() {
    relicTree.setup();
    relicTree.onChange = renderWallet;
}

// O que vem na próxima hora
function renderNext() {
    const hour = state.turn;
    document.getElementById('campNextHour').innerText = `HOUR ${hour} · ${getHourName(hour)}`;
    const threat = document.getElementById('campNextThreat');
    if (isBossTurn(hour)) {
        threat.innerText = `☠️ ${BOSS_MODELS[chooseBossType(hour)].name} awaits`;
    } else if (state.nextOmen) {
        threat.innerText = `${state.nextOmen.icon} ${state.nextOmen.name}: ${state.nextOmen.desc}`;
    } else {
        threat.innerText = 'The night is quiet. For now.';
    }
}

export function openCamp() {
    state.gameState = 'CAMP';
    collectAllGold();
    fuelUses = 0;
    restUses = 0;
    document.getElementById('campEyebrow').innerText = `HOUR ${state.turn - 1} SURVIVED`;
    renderWallet();
    renderNext();
    updateHUD();
    document.getElementById('campScreen').classList.remove('hidden');
    relicTree.open();
    audio.setMood('camp');
    reportProgress();
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
    state.gameState = 'PLAYING';
    persist();
    startHour();
}

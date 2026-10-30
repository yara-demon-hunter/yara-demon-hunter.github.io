import { CAMP } from '../../data_model/passives.js';
import { BOSS_MODELS, chooseBossType, isBossTurn } from '../../data_model/bosses.js';
import { getHourName } from '../../data_model/night.js';
import { persist } from '../core/save.js';
import { audio, passives, player, state } from '../core/state.js';
import { collectAllGold } from '../systems/gold.js';
import { refreshModifiers } from '../systems/modifiers.js';
import { startHour } from '../systems/night.js';
import { getMaxPlayerHp } from '../systems/stats.js';
import { feedTorch, syncMaxHp } from '../systems/torch.js';
import { updateBuildStrip, updateHUD } from './hud.js';
import { reportProgress } from './screens.js';

// --- ACAMPAMENTO ---
// Fim de cada hora: o ouro compra relíquias do mercador ou alimenta a tocha. A próxima hora fica à
// vista, para o jogador decidir sabendo o que vem.
let offers = [];
let rerollCost = 0;
let fuelUses = 0;
let restUses = 0;

function priceOf(skill) {
    return Math.round(skill.cost * CAMP.costMultiplier * (1 + CAMP.costGrowthPerHour * (state.turn - 1)));
}

function rollOffers() {
    const available = Object.keys(passives).filter(key => passives[key].lvl < passives[key].maxLvl);
    offers = [];
    for (let i = 0; i < CAMP.offers && available.length > 0; i++) {
        offers.push(available.splice(Math.floor(Math.random() * available.length), 1)[0]);
    }
}

function fuelCost() {
    return CAMP.fuel.cost + CAMP.fuel.costPerHour * state.turn + CAMP.fuel.costPerUse * fuelUses;
}

function restCost() {
    return CAMP.rest.cost + CAMP.rest.costPerHour * state.turn + CAMP.rest.costPerUse * restUses;
}

function renderOffers() {
    const list = document.getElementById('campOffers');
    list.innerHTML = '';
    if (offers.length === 0) {
        list.innerHTML = '<p class="camp-empty">The trader has nothing left to sell.</p>';
    }
    offers.forEach((key, i) => {
        const skill = passives[key];
        const sold = skill.lvl > 0;
        const price = priceOf(skill);
        const item = document.createElement('div');
        item.className = `relic${sold ? ' is-sold' : state.coins >= price ? ' is-ready' : ''}`;
        item.innerHTML = `
            <span class="relic-icon"></span>
            <span class="relic-name"></span>
            <span class="relic-desc"></span>
            ${sold ? '<span class="relic-sold">✔ YOURS</span>'
                : `<button data-offer="${i}" class="shop-row-btn" ${state.coins >= price ? '' : 'disabled'}>🪙 ${price}</button>`}
        `;
        item.querySelector('.relic-icon').textContent = skill.icon;
        item.querySelector('.relic-name').textContent = skill.name;
        item.querySelector('.relic-desc').textContent = skill.desc;
        list.appendChild(item);
    });
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

    const btnReroll = document.getElementById('btnCampReroll');
    btnReroll.innerHTML = `🎲 New wares 🪙 ${rerollCost}`;
    btnReroll.disabled = state.coins < rerollCost;
}

function renderCamp() {
    document.getElementById('campCoins').innerText = state.coins;
    renderOffers();
    renderServices();
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
    state.campPending = false;
    state.gameState = 'CAMP';
    collectAllGold();
    fuelUses = 0;
    restUses = 0;
    rerollCost = CAMP.rerollCost;
    rollOffers();
    document.getElementById('campEyebrow').innerText = `HOUR ${state.turn - 1} SURVIVED`;
    renderCamp();
    renderNext();
    updateHUD();
    document.getElementById('campScreen').classList.remove('hidden');
    audio.setMood('camp');
    reportProgress();
}

export function buyOffer(index) {
    const key = offers[index];
    const skill = passives[key];
    if (!skill || skill.lvl > 0) return;
    const price = priceOf(skill);
    if (state.coins < price) return;
    state.coins -= price;
    skill.lvl = 1;
    refreshModifiers();
    syncMaxHp();
    state.revives += skill.mods?.revives ?? 0;
    state.rerolls += skill.mods?.rerolls ?? 0;
    updateBuildStrip();
    updateHUD();
    renderCamp();
    audio.playPurchase();
}

export function buyFuel() {
    const cost = fuelCost();
    if (state.coins < cost || state.coreHp >= state.coreHpMax) return;
    state.coins -= cost;
    fuelUses++;
    feedTorch(CAMP.fuel.heal);
    updateHUD();
    renderCamp();
    audio.playPurchase();
}

export function buyRest() {
    const cost = restCost();
    if (state.coins < cost || player.hp >= player.maxHp) return;
    state.coins -= cost;
    restUses++;
    player.hp = Math.min(player.maxHp, player.hp + getMaxPlayerHp() * CAMP.rest.healRatio);
    updateHUD();
    renderCamp();
    audio.playPurchase();
}

export function rerollOffers() {
    if (state.coins < rerollCost) return;
    state.coins -= rerollCost;
    rerollCost += CAMP.rerollCostGrowth;
    rollOffers();
    updateHUD();
    renderCamp();
    audio.playCardShow();
}

export function leaveCamp() {
    if (state.gameState !== 'CAMP') return;
    document.getElementById('campScreen').classList.add('hidden');
    state.knifeInput.stick.fire = false;
    state.gameState = 'PLAYING';
    persist();
    startHour();
}

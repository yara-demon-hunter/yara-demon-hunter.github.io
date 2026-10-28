import { attributes, audio, player, state } from '../core/state.js';
import {
    getAtkCooldown, getAtkDamage, getAtkRadius, getKnockback,
    getMaxPlayerHp, getPlayerMaxSpeed, getSlashArcDegree
} from '../systems/stats.js';
import { collectAllGold } from '../systems/gold.js';
import { updateHUD } from './hud.js';
import { renderPassiveSkills } from './passives.js';

// --- LOJA DE UPGRADES ---
// Valor atual de cada stat, mostrado no próprio card de upgrade.
const STAT_VALUES = {
    damage: () => getAtkDamage(),
    radius: () => `${Math.round(getAtkRadius())}px`,
    slashArc: () => `${getSlashArcDegree()}°`,
    atkSpeed: () => `${getAtkCooldown().toFixed(2)}s`,
    moveSpeed: () => Math.round(getPlayerMaxSpeed()),
    frenzyNova: () => `Lv. ${attributes.frenzyNova.lvl}`,
    playerHp: () => getMaxPlayerHp(),
    knockback: () => Math.round(getKnockback())
};

function getUpgradeCost(attr) {
    return Math.floor(attr.baseCost * Math.pow(attr.costMult, attr.lvl - 1));
}

export function openShop() {
    state.gameState = 'SHOP';
    collectAllGold();
    document.getElementById('shopCoinsText').innerText = state.coins;
    renderShopItems();
    renderPassiveSkills();
    updateHUD();
    document.getElementById('shopScreen').classList.remove('hidden');
}

export function resumeGame() {
    document.getElementById('shopScreen').classList.add('hidden');
    state.gameState = 'PLAYING';
}

export function renderShopItems() {
    const list = document.getElementById('shopList');
    list.innerHTML = '';

    Object.keys(attributes).forEach(key => {
        const attr = attributes[key];
        const isMax = attr.lvl >= attr.maxLvl;
        const cost = isMax ? 0 : getUpgradeCost(attr);

        const value = STAT_VALUES[key] ? STAT_VALUES[key]() : '';
        const item = document.createElement('div');
        item.className = 'bg-slate-900/60 border border-slate-800 p-2 rounded-lg flex flex-col gap-1.5';
        item.innerHTML = `
            <div class="flex items-center justify-between gap-1 text-[11px] text-slate-300">
                <span class="truncate" title="${attr.desc}">${attr.icon} ${attr.name}</span>
                <span class="text-[10px] text-amber-400 whitespace-nowrap">${isMax ? 'MAX' : 'Lv. ' + attr.lvl}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
                <b class="text-base text-cyan-300">${value}</b>
                <button data-upgrade="${key}" aria-label="Upgrade ${attr.name}" class="px-2 py-1 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow whitespace-nowrap" ${isMax || state.coins < cost ? 'disabled' : ''}>
                    ${isMax ? 'MAX' : `+ 🪙 ${cost}`}
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

export function buyUpgrade(key) {
    const attr = attributes[key];
    if (!attr || attr.lvl >= attr.maxLvl) return;

    const cost = getUpgradeCost(attr);

    if (state.coins >= cost) {
        state.coins -= cost;
        attr.lvl++;

        if (key === 'playerHp') {
            const oldMax = player.maxHp;
            player.maxHp = getMaxPlayerHp();
            player.hp += (player.maxHp - oldMax);
        }

        document.getElementById('shopCoinsText').innerText = state.coins;
        updateHUD();
        renderShopItems();
        audio.playCoin();
    }
}

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
    document.getElementById('statsPanel').classList.toggle('has-upgrade',
        Object.values(attributes).some(a => a.lvl < a.maxLvl && state.coins >= getUpgradeCost(a)));

    Object.keys(attributes).forEach(key => {
        const attr = attributes[key];
        const isMax = attr.lvl >= attr.maxLvl;
        const cost = isMax ? 0 : getUpgradeCost(attr);

        const value = STAT_VALUES[key] ? STAT_VALUES[key]() : '';
        const item = document.createElement('div');
        item.className = 'shop-row';
        item.title = attr.desc;
        item.innerHTML = `
            <span class="shop-row-name"><span>${attr.icon}</span><span>${attr.name}</span><em>${isMax ? 'MAX' : 'Lv. ' + attr.lvl}</em></span>
            <b class="shop-row-value">${value}</b>
            <button data-upgrade="${key}" aria-label="Upgrade ${attr.name}" class="shop-row-btn" ${isMax || state.coins < cost ? 'disabled' : ''}>
                ${isMax ? 'MAX' : `+ 🪙 ${cost}`}
            </button>
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

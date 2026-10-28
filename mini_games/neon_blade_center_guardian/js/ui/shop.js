import { attributes, audio, player, state } from '../core/state.js';
import { getMaxPlayerHp } from '../systems/stats.js';
import { collectAllGold } from '../systems/gold.js';
import { updateHUD } from './hud.js';
import { renderPassiveSkills } from './passives.js';

// --- LOJA DE UPGRADES ---
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

        const item = document.createElement('div');
        item.className = 'bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl flex items-center justify-between gap-2';
        item.innerHTML = `
            <div class="flex items-center gap-2.5">
                <span class="text-xl">${attr.icon}</span>
                <div>
                    <div class="font-bold text-xs text-cyan-300">${attr.name} <span class="text-amber-400">${isMax ? 'MAX' : 'Lv. ' + attr.lvl}</span></div>
                    <div class="text-[10px] text-slate-400">${attr.desc}</div>
                </div>
            </div>
            <button data-upgrade="${key}" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow" ${isMax || state.coins < cost ? 'disabled' : ''}>
                ${isMax ? 'MAX' : `<span>🪙</span> ${cost}`}
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

import { STAT_UPGRADE_COST } from '../../data_model/skills.js';
import { attributes, audio, player, state } from '../core/state.js';
import {
    getAtkCooldown, getAtkDamage, getAtkRadius, getKnockback,
    getMaxPlayerHp, getPlayerMaxSpeed, getSlashArcDegree
} from '../systems/stats.js';
import { collectAllGold } from '../systems/gold.js';
import { updateHUD } from './hud.js';
import { renderPassiveSkills } from './passives.js';

// --- LOJA DE UPGRADES ---
// Stats: comprados com pontos de skill (1 por nível do herói). As passivas usam ouro (./passives.js).
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
    // Um dedo solto do botão da adaga enquanto a loja estava aberta não arremessa ao voltar
    state.knifeInput.stick.fire = false;
    state.gameState = 'PLAYING';
}

export function renderShopItems() {
    const list = document.getElementById('shopList');
    list.innerHTML = '';
    document.getElementById('skillPointsText').innerText = state.skillPoints;
    const canSpend = state.skillPoints >= STAT_UPGRADE_COST;
    document.getElementById('statsPanel').classList.toggle('has-upgrade',
        canSpend && Object.values(attributes).some(a => a.lvl < a.maxLvl));

    Object.keys(attributes).forEach(key => {
        const attr = attributes[key];
        const isMax = attr.lvl >= attr.maxLvl;

        const value = STAT_VALUES[key] ? STAT_VALUES[key]() : '';
        const item = document.createElement('div');
        item.className = 'shop-row';
        item.title = attr.desc;
        item.innerHTML = `
            <span class="shop-row-name"><span>${attr.icon}</span><span>${attr.name}</span><em>${isMax ? 'MAX' : 'Lv. ' + attr.lvl}</em></span>
            <b class="shop-row-value">${value}</b>
            <button data-upgrade="${key}" aria-label="Upgrade ${attr.name}" class="shop-row-btn shop-row-btn-points" ${isMax || !canSpend ? 'disabled' : ''}>
                ${isMax ? 'MAX' : `+ ⚡ ${STAT_UPGRADE_COST}`}
            </button>
        `;
        list.appendChild(item);
    });
}

export function buyUpgrade(key) {
    const attr = attributes[key];
    if (!attr || attr.lvl >= attr.maxLvl) return;

    if (state.skillPoints >= STAT_UPGRADE_COST) {
        state.skillPoints -= STAT_UPGRADE_COST;
        attr.lvl++;

        if (key === 'playerHp') {
            const oldMax = player.maxHp;
            player.maxHp = getMaxPlayerHp();
            player.hp += (player.maxHp - oldMax);
        }

        updateHUD();
        renderShopItems();
        audio.playPowerup();
    }
}

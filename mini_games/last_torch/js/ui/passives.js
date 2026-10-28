import { audio, passives, state } from '../core/state.js';
import { updateHUD } from './hud.js';

// --- SKILLS PASSIVAS (compradas com pontos de skill) ---
export function renderPassiveSkills() {
    document.getElementById('skillPointsText').innerText = state.skillPoints;

    const canBuy = Object.values(passives).some(sk => sk.lvl < sk.maxLvl && state.skillPoints >= sk.cost);
    document.getElementById('passiveBadge').classList.toggle('hidden', !canBuy);
    document.getElementById('passivesPanel').classList.toggle('has-upgrade', canBuy);

    const list = document.getElementById('passiveList');
    list.innerHTML = '';

    Object.keys(passives).forEach(key => {
        const skill = passives[key];
        const isMax = skill.lvl >= skill.maxLvl;

        const item = document.createElement('div');
        item.className = 'shop-row shop-row-passive';
        item.title = skill.desc;
        item.innerHTML = `
            <span class="shop-row-name"><span>${skill.icon}</span><span>${skill.name}</span></span>
            <b class="shop-row-value">${isMax ? 'ACQUIRED' : ''}</b>
            <button data-passive="${key}" class="shop-row-btn shop-row-btn-passive" ${isMax || state.skillPoints < skill.cost ? 'disabled' : ''}>
                ${isMax ? '✔' : `⚡ ${skill.cost}`}
            </button>
        `;
        list.appendChild(item);
    });
}

export function buyPassiveSkill(key) {
    const skill = passives[key];
    if (!skill || skill.lvl >= skill.maxLvl || state.skillPoints < skill.cost) return;

    state.skillPoints -= skill.cost;
    skill.lvl++;
    renderPassiveSkills();
    updateHUD();
    audio.playPowerup();
}

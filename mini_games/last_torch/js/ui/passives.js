import { audio, passives, state } from '../core/state.js';
import { updateHUD } from './hud.js';

// --- SKILLS PASSIVAS (compradas com ouro) ---
export function renderPassiveSkills() {
    document.getElementById('shopCoinsText').innerText = state.coins;

    const canBuy = Object.values(passives).some(sk => sk.lvl < sk.maxLvl && state.coins >= sk.cost);
    document.getElementById('passivesPanel').classList.toggle('has-upgrade', canBuy);

    const list = document.getElementById('passiveList');
    list.innerHTML = '';

    Object.keys(passives).forEach(key => {
        const skill = passives[key];
        const isMax = skill.lvl >= skill.maxLvl;

        const affordable = !isMax && state.coins >= skill.cost;
        const item = document.createElement('div');
        item.className = `passive-card${isMax ? ' is-acquired' : affordable ? ' is-ready' : ''}`;
        item.innerHTML = `
            <span class="passive-card-icon">${skill.icon}</span>
            <span class="passive-card-name">${skill.name}</span>
            <span class="passive-card-desc">${skill.desc}</span>
            ${isMax
                ? '<span class="passive-card-owned">✔ ACQUIRED</span>'
                : `<button data-passive="${key}" class="shop-row-btn" ${affordable ? '' : 'disabled'}>🪙 ${skill.cost}</button>`}
        `;
        list.appendChild(item);
    });
}

export function buyPassiveSkill(key) {
    const skill = passives[key];
    if (!skill || skill.lvl >= skill.maxLvl || state.coins < skill.cost) return;

    state.coins -= skill.cost;
    skill.lvl++;
    renderPassiveSkills();
    updateHUD();
    audio.playCoin();
}

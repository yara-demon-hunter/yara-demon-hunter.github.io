import { audio, passives, state } from '../core/state.js';

// --- SKILLS PASSIVAS (compradas com pontos de skill) ---
export function renderPassiveSkills() {
    document.getElementById('skillPointsText').innerText = state.skillPoints;

    const list = document.getElementById('passiveList');
    list.innerHTML = '';

    Object.keys(passives).forEach(key => {
        const skill = passives[key];
        const isMax = skill.lvl >= skill.maxLvl;

        const item = document.createElement('div');
        item.className = 'bg-slate-800/80 border border-violet-500/30 p-2.5 rounded-xl flex items-center justify-between gap-2';
        item.innerHTML = `
            <div class="flex items-center gap-2.5">
                <span class="text-xl">${skill.icon}</span>
                <div>
                    <div class="font-bold text-xs text-violet-300">${skill.name} <span class="text-amber-400">${isMax ? 'ADQUIRIDA' : ''}</span></div>
                    <div class="text-[10px] text-slate-400">${skill.desc}</div>
                </div>
            </div>
            <button data-passive="${key}" class="px-3 py-1.5 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow whitespace-nowrap" ${isMax || state.skillPoints < skill.cost ? 'disabled' : ''}>
                ${isMax ? '✔' : `<span>✦</span> ${skill.cost}`}
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
    audio.playPowerup();
}

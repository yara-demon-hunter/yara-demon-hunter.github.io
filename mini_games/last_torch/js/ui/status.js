import { EVOLUTIONS } from '../../data_model/powers.js';
import { save, persist } from '../core/save.js';
import { attributes, audio, passives, state } from '../core/state.js';
import { getOwnedPowers } from '../systems/cards.js';
import {
    getAtkCooldown, getAtkDamage, getAtkRadius, getCritChance, getKnockback,
    getMaxPlayerHp, getPlayerMaxSpeed, getSlashArcDegree
} from '../systems/stats.js';
import { getHero } from '../systems/modifiers.js';
import { getHourName } from '../../data_model/night.js';

// --- STATUS ---
// O medalhão pausa a partida e mostra a build: stats, poderes, relíquias e as opções de som e tela.
const STAT_VALUES = {
    damage: () => Math.round(getAtkDamage()),
    radius: () => `${Math.round(getAtkRadius())}px`,
    slashArc: () => `${getSlashArcDegree()}°`,
    atkSpeed: () => `${getAtkCooldown().toFixed(2)}s`,
    moveSpeed: () => Math.round(getPlayerMaxSpeed()),
    frenzyNova: () => `Lv. ${attributes.frenzyNova.lvl}`,
    playerHp: () => getMaxPlayerHp(),
    knockback: () => Math.round(getKnockback())
};

export function getStatText(key) {
    return STAT_VALUES[key] ? STAT_VALUES[key]() : '';
}

function renderStats() {
    const list = document.getElementById('shopList');
    list.innerHTML = '';
    Object.keys(attributes).forEach(key => {
        const attr = attributes[key];
        const item = document.createElement('div');
        item.className = 'shop-row';
        item.title = attr.desc;
        item.innerHTML = `
            <span class="shop-row-name"><span>${attr.icon}</span><span>${attr.name}</span><em>Lv. ${attr.lvl}</em></span>
            <b class="shop-row-value">${getStatText(key)}</b>
        `;
        list.appendChild(item);
    });
    const crit = document.createElement('div');
    crit.className = 'shop-row';
    crit.innerHTML = `<span class="shop-row-name"><span>🎲</span><span>Crit Chance</span></span><b class="shop-row-value">${Math.round(getCritChance() * 100)}%</b>`;
    list.appendChild(crit);
}

function renderBuildList(id, items, emptyText) {
    const list = document.getElementById(id);
    list.innerHTML = '';
    if (items.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'build-empty';
        empty.textContent = emptyText;
        list.appendChild(empty);
    }
    items.forEach(({ icon, name, desc, level }) => {
        const item = document.createElement('div');
        item.className = 'build-row';
        item.innerHTML = '<span class="build-row-icon"></span><div><b></b><span></span></div>';
        item.querySelector('.build-row-icon').textContent = icon;
        item.querySelector('b').textContent = level ? `${name} · Lv. ${level}` : name;
        item.querySelector('b + span').textContent = desc;
        list.appendChild(item);
    });
}

function renderSettings() {
    const { settings } = save;
    document.querySelectorAll('[data-setting]').forEach(button => {
        button.classList.toggle('is-on', settings[button.dataset.setting]);
    });
}

export function openStatus() {
    if (state.gameState !== 'PLAYING') return;
    state.gameState = 'PAUSED';
    document.getElementById('statusLevel').innerText = `LEVEL ${state.playerLevel}`;
    document.getElementById('shopCoinsText').innerText = state.coins;
    document.getElementById('statusHour').innerText = `Hour ${state.turn} · ${getHourName(state.turn)} · ${getHero().name}`;
    renderStats();
    renderBuildList('powerList', getOwnedPowers().map(p => ({
        icon: p.evolved ? EVOLUTIONS[p.key].icon : p.icon,
        name: p.evolved ? `${EVOLUTIONS[p.key].name} ✦` : p.name,
        desc: !p.evolved && EVOLUTIONS[p.key] ? `${p.desc} Evolves at max level with ${EVOLUTIONS[p.key].needText}.` : p.desc,
        level: p.lvl
    })), 'No powers yet. Level up to earn them.');
    renderBuildList('passiveList', Object.values(passives).filter(p => p.lvl > 0).map(p => ({
        icon: p.icon, name: p.name, desc: p.desc, level: 0
    })), 'No relics yet. The trader waits at the end of each hour.');
    renderSettings();
    document.getElementById('shopScreen').classList.remove('hidden');
    audio.setPaused(true);
}

export function resumeGame() {
    if (state.gameState !== 'PAUSED') return;
    document.getElementById('shopScreen').classList.add('hidden');
    // Um dedo solto do botão da adaga enquanto a tela estava aberta não arremessa ao voltar
    state.knifeInput.stick.fire = false;
    state.gameState = 'PLAYING';
    audio.setPaused(false);
}

export function toggleSetting(key) {
    save.settings[key] = !save.settings[key];
    persist();
    audio.applySettings();
    renderSettings();
}

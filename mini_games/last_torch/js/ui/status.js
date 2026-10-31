import { EVOLUTIONS } from '../../data_model/powers.js';
import { save, persist } from '../core/save.js';
import { attributes, audio, passives, state } from '../core/state.js';
import { getOwnedPowers } from '../systems/tree.js';
import { skillTree } from './tree.js';
import {
    getAtkCooldown, getAtkDamage, getAtkRadius, getCritChance, getFrenzyDamageBonus, getFrenzyDuration, getKnockback,
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
    frenzyNova: () => `${getFrenzyDuration().toFixed(1)}s, +${Math.round(getFrenzyDamageBonus() * 100)}% dmg`,
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
        item.dataset.note = `${attr.name}: ${attr.desc}`;
        item.innerHTML = `
            <span class="shop-row-name"><span>${attr.icon}</span><span>${attr.name}</span><em>Lv. ${attr.lvl}</em></span>
            <b class="shop-row-value">${getStatText(key)}</b>
        `;
        list.appendChild(item);
    });
    const crit = document.createElement('div');
    crit.className = 'shop-row';
    crit.dataset.note = 'Crit Chance: how often a hit lands as a critical.';
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
        item.dataset.note = `${name}: ${desc}`;
        item.innerHTML = '<span class="build-row-icon"></span><div><b></b><span></span></div><em></em>';
        item.querySelector('.build-row-icon').textContent = icon;
        item.querySelector('b').textContent = name;
        item.querySelector('b + span').textContent = desc;
        item.querySelector('em').textContent = level ? `Lv. ${level}` : '';
        list.appendChild(item);
    });
}

// Celular: as linhas mostram só o nome; a descrição aparece aqui ao tocar
const BUILD_NOTE_HINT = 'Tap anything to read what it does.';

export function showBuildNote(row) {
    document.querySelectorAll('#tabBuild .is-selected').forEach(r => r.classList.remove('is-selected'));
    row?.classList.add('is-selected');
    document.getElementById('buildNote').textContent = row?.dataset.note ?? BUILD_NOTE_HINT;
}

function renderSettings() {
    const { settings } = save;
    document.querySelectorAll('[data-setting]').forEach(button => {
        button.classList.toggle('is-on', settings[button.dataset.setting]);
    });
}

const TABS = ['tree', 'build', 'options'];
let currentTab = 'tree';

function showTab(name) {
    currentTab = name;
    TABS.forEach(tab => {
        const id = `tab${tab[0].toUpperCase()}${tab.slice(1)}`;
        document.getElementById(id).classList.toggle('hidden', tab !== name);
    });
    document.querySelectorAll('[data-status-tab]').forEach(b => b.classList.toggle('is-on', b.dataset.statusTab === name));
    if (name === 'tree') skillTree.open();
}

export function setStatusTab(name) {
    showTab(name);
}

// Pontos e ouro no cabeçalho
function renderHeader() {
    document.getElementById('statusPoints').innerText = state.skillPoints;
    document.getElementById('shopCoinsText').innerText = state.coins;
}

skillTree.onChange = renderHeader;

export function openStatus() {
    if (state.gameState !== 'PLAYING') return;
    state.gameState = 'PAUSED';
    document.getElementById('statusLevel').innerText = `LEVEL ${state.playerLevel}`;
    document.getElementById('statusHour').innerText = `Hour ${state.turn} · ${getHourName(state.turn)}`;
    document.getElementById('statusHero').innerText = ` · ${getHero().name}`;
    renderHeader();
    renderStats();
    const skills = Object.values(passives).filter(p => p.type === 'skill' && p.lvl > 0)
        .map(p => ({ icon: p.icon, name: p.name, desc: p.desc, level: 0 }));
    renderBuildList('powerList', [...getOwnedPowers().map(p => ({
        icon: p.evolved ? EVOLUTIONS[p.key].icon : p.icon,
        name: p.evolved ? `${EVOLUTIONS[p.key].name} ✦` : p.name,
        desc: !p.evolved && EVOLUTIONS[p.key] ? `${p.desc} Can evolve in the skill tree at max level.` : p.desc,
        level: p.lvl
    })), ...skills], 'No powers yet. Learn them in the skill tree.');
    renderBuildList('passiveList', Object.values(passives).filter(p => p.type !== 'skill' && p.lvl > 0).map(p => ({
        icon: p.icon, name: p.name, desc: p.desc, level: 0
    })), 'No relics yet. Buy them at the camp, between hours.');
    showBuildNote(null);
    renderSettings();
    document.getElementById('shopScreen').classList.remove('hidden');
    showTab(currentTab);
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

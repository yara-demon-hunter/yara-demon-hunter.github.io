import { ACHIEVEMENTS, META_UPGRADES, getMetaUpgradeCost } from '../../data_model/meta.js';
import { HEROES } from '../../data_model/heroes.js';
import { save, persist } from '../core/save.js';
import { audio } from '../core/state.js';
import { renderStartScreen } from './screens.js';

// --- HEARTH ---
// Onde as brasas viram progresso permanente: melhorias, heróis e a lista de Trials.
let tab = 'upgrades';

function renderEmbers() {
    document.getElementById('hearthEmbers').innerText = save.embers;
}

function renderUpgrades(list) {
    Object.entries(META_UPGRADES).forEach(([key, model]) => {
        const lvl = save.upgrades[key] ?? 0;
        const isMax = lvl >= model.maxLvl;
        const cost = isMax ? 0 : getMetaUpgradeCost(model, lvl);
        const can = !isMax && save.embers >= cost;
        const item = document.createElement('div');
        item.className = `hearth-item${can ? ' is-ready' : ''}${isMax ? ' is-max' : ''}`;
        item.innerHTML = `
            <span class="hearth-icon"></span>
            <div class="hearth-text">
                <b></b><span></span>
                <i class="pips">${'<u class="on"></u>'.repeat(lvl)}${'<u></u>'.repeat(model.maxLvl - lvl)}</i>
            </div>
            <button data-upgrade="${key}" class="hearth-buy" ${can ? '' : 'disabled'}>${isMax ? 'MAX' : `🔥 ${cost}`}</button>
        `;
        item.querySelector('.hearth-icon').textContent = model.icon;
        item.querySelector('b').textContent = model.name;
        item.querySelector('.hearth-text span').textContent = model.desc;
        list.appendChild(item);
    });
}

function renderHeroes(list) {
    Object.entries(HEROES).forEach(([key, hero]) => {
        const owned = save.unlockedHeroes.includes(key);
        const picked = save.hero === key;
        const trial = ACHIEVEMENTS.find(a => a.reward.hero === key);
        const item = document.createElement('div');
        item.className = `hearth-item${picked ? ' is-picked' : ''}${owned ? '' : ' is-locked'}`;
        item.innerHTML = `
            <span class="hearth-portrait"></span>
            <div class="hearth-text"><b></b><span></span></div>
            ${picked ? '<span class="hearth-tag">IN USE</span>'
                : owned ? `<button data-hero="${key}" class="hearth-buy">CHOOSE</button>`
                : '<span class="hearth-tag">🔒</span>'}
        `;
        item.querySelector('.hearth-portrait').style.filter = hero.portrait;
        item.querySelector('b').textContent = owned ? hero.name : '???';
        item.querySelector('.hearth-text span').textContent = owned ? hero.trait : `Trial: ${trial?.desc ?? ''}`;
        list.appendChild(item);
    });
}

function renderTrials(list) {
    ACHIEVEMENTS.forEach(a => {
        const done = save.achievements[a.id];
        const value = Math.min(a.target, save.stats[a.stat] ?? 0);
        const item = document.createElement('div');
        item.className = `hearth-item${done ? ' is-done' : ''}`;
        item.innerHTML = `
            <span class="hearth-icon"></span>
            <div class="hearth-text"><b></b><span></span></div>
            <span class="hearth-tag"></span>
        `;
        item.querySelector('.hearth-icon').textContent = done ? '🏆' : '🔒';
        item.querySelector('b').textContent = a.name;
        item.querySelector('.hearth-text span').textContent = a.desc;
        item.querySelector('.hearth-tag').textContent = done ? 'DONE' : `${value.toLocaleString('en-US')}/${a.target.toLocaleString('en-US')}`;
        list.appendChild(item);
    });
}

const TABS = { upgrades: renderUpgrades, heroes: renderHeroes, trials: renderTrials };

function renderHearth() {
    renderEmbers();
    document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('is-on', b.dataset.tab === tab));
    const list = document.getElementById('hearthList');
    list.innerHTML = '';
    TABS[tab](list);
}

export function openHearth() {
    document.getElementById('hearthScreen').classList.remove('hidden');
    tab = 'upgrades';
    renderHearth();
    audio.init();
    audio.setMood('camp');
}

export function closeHearth() {
    document.getElementById('hearthScreen').classList.add('hidden');
    renderStartScreen();
    audio.setMood('menu');
}

export function setHearthTab(name) {
    tab = name;
    renderHearth();
}

export function buyMetaUpgrade(key) {
    const model = META_UPGRADES[key];
    const lvl = save.upgrades[key] ?? 0;
    if (!model || lvl >= model.maxLvl) return;
    const cost = getMetaUpgradeCost(model, lvl);
    if (save.embers < cost) return;
    save.embers -= cost;
    save.upgrades[key] = lvl + 1;
    persist();
    renderHearth();
    audio.playPurchase();
}

export function chooseHero(key) {
    if (!save.unlockedHeroes.includes(key)) return;
    save.hero = key;
    persist();
    renderHearth();
    audio.playCardPick('rare');
}

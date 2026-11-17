import { ALTAR, ALTAR_KEYS, altarCost, altarLevel, altarMaxLevel } from '../../data_model/embers.js';
import { save, persist } from '../core/save.js';
import { audio } from '../core/state.js';
import { renderStartScreen } from './screens.js';
import { showToast } from './banner.js';

// --- ALTAR (tela) ---
// Quatro melhorias permanentes, pagas com Brasas (data_model/embers.js). Uma tela só, sem abas: cada cartão mostra o nível,
// o que a melhoria faz e o botão de compra. O efeito vale a partir da próxima noite (js/systems/modifiers.js).

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function renderAltar() {
    document.getElementById('altarEmbers').textContent = save.embers;
    const list = document.getElementById('altarList');
    list.replaceChildren();
    ALTAR_KEYS.forEach(key => {
        const model = ALTAR[key];
        const level = altarLevel(save, key);
        const max = altarMaxLevel(key);
        const cost = altarCost(save, key);
        const card = el('div', `altar-card${cost !== null && save.embers >= cost ? ' is-ready' : ''}${cost === null ? ' is-max' : ''}`);

        const pips = el('span', 'altar-pips');
        for (let i = 0; i < max; i++) pips.append(el('i', i < level ? 'is-on' : ''));

        const text = el('div', 'altar-text');
        text.append(el('b', '', model.name), el('span', '', model.desc), pips);

        const buy = el('button', 'altar-buy', cost === null ? 'MAX' : `🔥 ${cost}`);
        buy.dataset.key = key;
        buy.disabled = cost === null || save.embers < cost;
        card.append(el('span', 'altar-icon', model.icon), text, buy);
        list.appendChild(card);
    });
}

export function buyUpgrade(key) {
    const cost = altarCost(save, key);
    if (cost === null || save.embers < cost) return;
    save.embers -= cost;
    save.altar[key] = altarLevel(save, key) + 1;
    persist();
    audio.playLevelUp?.();
    renderAltar();
    showToast(ALTAR[key].icon, `${ALTAR[key].name} ${save.altar[key]}/${altarMaxLevel(key)}`, 'Active from the next night');
}

export function openAltar() {
    document.getElementById('altarScreen').classList.remove('hidden');
    renderAltar();
    audio.init();
    audio.setMood('camp');
}

export function closeAltar() {
    document.getElementById('altarScreen').classList.add('hidden');
    renderStartScreen();
    audio.setMood('menu');
}

export function setupAltar() {
    document.getElementById('altarList').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-key]');
        if (button && !button.disabled) buyUpgrade(button.dataset.key);
    });
}

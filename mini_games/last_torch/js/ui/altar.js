import { ALTAR, ALTAR_KEYS, altarCost, altarLevel, altarMaxLevel } from '../../data_model/embers.js';
import { save, persist } from '../core/save.js';
import { audio, state } from '../core/state.js';
import { renderStartScreen } from './screens.js';
import { showToast } from './banner.js';
import { ICON_IMAGES } from '../../data_model/icon_images.js';
import { paintIcon } from '../../data_model/tree_images.js';

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
        const icon = el('span', 'altar-icon');
        paintIcon(icon, ICON_IMAGES[`altar_${key}`], model.icon);
        card.append(icon, text, buy);
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

// retry: o Altar abre por cima da tela de fim da noite ("tente de novo, mais forte"): tem o botão HUNT AGAIN e, ao fechar,
// volta ao resumo em vez de ir ao menu
let retry = false;
const $ = (id) => document.getElementById(id);

export function openAltar({ retry: afterNight = false } = {}) {
    retry = afterNight;
    const won = state.run?.victory;
    $('altarEyebrow').textContent = afterNight ? (won ? 'THE LIGHT HOLDS' : 'THE FLAME REMEMBERS') : 'THE FLAME REMEMBERS';
    $('altarTitle').textContent = afterNight ? (won ? 'COME BACK STRONGER' : 'TRY AGAIN, BUT STRONGER') : 'ALTAR';
    $('altarSub').textContent = afterNight
        ? 'Spend your embers on upgrades that last, then hunt again.'
        : 'Every night earns embers, even the ones you lose. Spend them on upgrades that last.';
    $('altarRetryRow').classList.toggle('hidden', !afterNight);
    // Como na tela de derrota: com noite salva, CONTINUE ocupa o lugar do HUNT AGAIN (que recomeçaria do zero sem querer)
    const canContinue = afterNight && !$('btnDeathContinue').classList.contains('hidden');
    $('btnAltarContinue').classList.toggle('hidden', !canContinue);
    $('btnAltarRetry').classList.toggle('hidden', canContinue);
    $('altarScreen').classList.remove('hidden');
    renderAltar();
    audio.init();
    audio.setMood('camp');
}

export function closeAltar() {
    $('altarScreen').classList.add('hidden');
    if (retry) {
        retry = false;
        return;
    }
    renderStartScreen();
    audio.setMood('menu');
}

// HUNT AGAIN: usa o mesmo botão da tela de fim da noite (recomeça com as melhorias novas)
function huntAgain() {
    $('altarScreen').classList.add('hidden');
    retry = false;
    $('btnRestart').click();
}

// MENU: sai do Altar e usa o mesmo botão MENU da tela de fim da noite
function backToMenu() {
    $('altarScreen').classList.add('hidden');
    retry = false;
    $('btnMenu').click();
}

export function setupAltar() {
    $('btnAltarMenu').addEventListener('click', backToMenu);
    $('btnAltarRetry').addEventListener('click', huntAgain);
    // O mesmo CONTINUE da tela de derrota (confirma manter a build, e o anúncio entre noites entra lá); o Altar fecha quando a partida recomeça (buttons.js)
    $('btnAltarContinue').addEventListener('click', () => $('btnDeathContinue').click());
    document.getElementById('altarList').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-key]');
        if (button && !button.disabled) buyUpgrade(button.dataset.key);
    });
}

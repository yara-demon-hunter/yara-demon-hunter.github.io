import { TREE_BRANCHES } from '../../data_model/tree.js';
import { TREE_IMAGES, paintIcon } from '../../data_model/tree_images.js';
import { save } from '../core/save.js';
import { audio, state } from '../core/state.js';
import { buyNode, getBuyableNodes, getNextText, getNodeInfo, getNodeState } from '../systems/tree.js';
import { openStatus, resumeGame } from './status.js';
import { updateHUD } from './hud.js';

// --- ESCOLHA RÁPIDA ---
// Ao ganhar pontos: três skills da árvore, de ramos diferentes. Um toque gasta os pontos ali e a caça volta.
// A árvore completa continua no medalhão e, daqui, em FULL SKILL TREE. Vem desligada: quem quiser liga em Settings.
const CARDS = 3;
const OPEN_DELAY_SECONDS = 0.35;    // o herói ainda mostra a animação do nível antes de pausar
const CLICK_GUARD_MS = 300;         // o dedo que estava atacando não escolhe sem querer

const el = (id) => document.getElementById(id);
let openAt = null;
let openedTime = 0;
let cards = [];

export function resetQuickPick() {
    openAt = null;
}

export function requestQuickPick() {
    if (save.settings.quickPick && openAt === null) openAt = state.runTime + OPEN_DELAY_SECONDS;
}

export function isPicking() {
    return !el('pickScreen').classList.contains('hidden');
}

// Quantos níveis os pontos pagam neste nó
function levelsFor(node) {
    const st = getNodeState(node);
    return Math.min(st.max - st.level, Math.floor(state.skillPoints / st.cost));
}

// Sorteia um nó por ramo; se faltarem ramos, completa com o que sobrou
function rollCards() {
    const shuffled = getBuyableNodes().sort(() => Math.random() - 0.5);
    const seen = new Set();
    const firsts = shuffled.filter(node => !seen.has(node.branch) && seen.add(node.branch));
    const rest = shuffled.filter(node => !firsts.includes(node));
    return [...firsts, ...rest].slice(0, CARDS);
}

function renderCard(node, index) {
    const info = getNodeInfo(node);
    const levels = levelsFor(node);
    const branch = TREE_BRANCHES[node.branch];
    const card = document.createElement('button');
    card.className = 'pick-card';
    card.dataset.pick = index;
    card.style.setProperty('--tone', branch.color);
    card.innerHTML = '<span class="pick-icon"></span><b></b><span class="pick-text"></span><em></em>';
    paintIcon(card.querySelector('.pick-icon'), TREE_IMAGES[node.id], info.icon);
    card.querySelector('b').textContent = info.name;
    card.querySelector('.pick-text').textContent = info.desc;
    card.querySelector('em').textContent = levels > 1 ? `${branch.name} · +${levels} LEVELS` : branch.name;
    return card;
}

function openPick() {
    cards = rollCards();
    if (cards.length === 0) return;
    state.gameState = 'PAUSED';
    openedTime = performance.now();
    el('pickTitle').textContent = `LEVEL ${state.playerLevel}`;
    el('pickCards').replaceChildren(...cards.map(renderCard));
    el('pickScreen').classList.remove('hidden');
    audio.setPaused(true);
}

// Chamado no fim do quadro da partida. Só abre na caçada: o fim da hora não pode ser interrompido.
export function updateQuickPick() {
    if (openAt === null || state.runTime < openAt) return;
    if (state.gameState !== 'PLAYING' || state.phase !== 'HUNT') return;
    openAt = null;
    openPick();
}

export function choosePick(index) {
    const node = cards[index];
    if (!node || performance.now() - openedTime < CLICK_GUARD_MS) return;
    for (let levels = levelsFor(node); levels > 0; levels--) buyNode(node.id);
    updateHUD();
    resumeGame();
}

export function setupQuickPick() {
    el('pickCards').addEventListener('click', (e) => {
        const card = e.target.closest('button[data-pick]');
        if (card) choosePick(Number(card.dataset.pick));
    });
    el('btnPickTree').addEventListener('click', () => {
        resumeGame();
        openStatus();
    });
}

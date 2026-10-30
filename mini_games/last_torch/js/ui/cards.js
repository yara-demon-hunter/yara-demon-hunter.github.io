import { audio, state } from '../core/state.js';
import { applyCard, describeCard, rollCards } from '../systems/cards.js';
import { openCamp } from './camp.js';

// --- ESCOLHA DE CARTAS ---
// Level up e baú pausam a partida e oferecem cartas. A primeira fração de segundo ignora o clique: quem
// estava apertando a tela no meio da luta não escolhe sem querer.
const INPUT_LOCK_MS = 420;

let current = [];
let openedAt = 0;
let mode = 'level';

function renderCards() {
    const row = document.getElementById('cardRow');
    row.innerHTML = '';
    current.forEach((card, i) => {
        const text = describeCard(card);
        const item = document.createElement('button');
        item.className = `card card-${card.rarity.key}`;
        item.dataset.card = i;
        item.style.setProperty('--delay', `${i * 70}ms`);
        item.setAttribute('aria-label', `${text.name}. ${text.line}`);
        item.innerHTML = `
            <span class="card-rarity"></span>
            <span class="card-icon"></span>
            <span class="card-name"></span>
            <span class="card-tag"></span>
            <span class="card-line"></span>
            <span class="card-detail"></span>
            <kbd>${i + 1}</kbd>
        `;
        item.querySelector('.card-rarity').textContent = card.rarity.label;
        item.querySelector('.card-icon').textContent = text.icon;
        item.querySelector('.card-name').textContent = text.name;
        item.querySelector('.card-tag').textContent = text.tag;
        item.querySelector('.card-line').textContent = text.line;
        item.querySelector('.card-detail').textContent = text.detail;
        row.appendChild(item);
    });
    updateRerollButton();
}

function updateRerollButton() {
    const button = document.getElementById('btnReroll');
    button.classList.toggle('hidden', state.rerolls <= 0);
    document.getElementById('rerollCount').innerText = state.rerolls;
}

export function openCards() {
    mode = state.pendingCards.shift();
    state.gameState = 'CARDS';
    current = rollCards(mode);
    openedAt = performance.now();

    const chest = mode === 'chest';
    document.getElementById('cardEyebrow').innerText = chest ? 'TREASURE' : `LEVEL ${state.playerLevel}`;
    document.getElementById('cardTitle').innerText = chest ? 'CLAIM YOUR PRIZE' : 'CHOOSE YOUR POWER';
    document.getElementById('cardScreen').classList.toggle('is-chest', chest);
    document.getElementById('cardScreen').classList.remove('hidden');
    renderCards();
    if (chest) audio.playChest();
    else audio.playCardShow();
}

function closeCards() {
    document.getElementById('cardScreen').classList.add('hidden');
    if (state.pendingCards.length > 0) {
        openCards();
    } else if (state.campPending) {
        openCamp();
    } else {
        // Um dedo solto do botão da adaga durante a escolha não arremessa ao voltar
        state.knifeInput.stick.fire = false;
        state.gameState = 'PLAYING';
    }
}

export function chooseCard(index) {
    if (state.gameState !== 'CARDS' || performance.now() - openedAt < INPUT_LOCK_MS) return;
    const card = current[index];
    if (!card) return;
    const { name } = describeCard(card);
    applyCard(card);
    state.levelUpFx = { age: 0, label: name };
    audio.playCardPick(card.rarity.key);
    closeCards();
}

export function rerollCards() {
    if (state.gameState !== 'CARDS' || state.rerolls <= 0) return;
    state.rerolls--;
    current = rollCards(mode);
    renderCards();
    audio.playCardShow();
}

import { ACHIEVEMENTS } from '../../data_model/sanctuary.js';
import { HEROES } from '../../data_model/heroes.js';
import { save, persist } from '../core/save.js';
import { audio } from '../core/state.js';
import { renderStartScreen } from './screens.js';

// --- ESCOLHA DO HERÓI ---
// Uma fileira de cartões, tudo à vista. Tocar num herói liberado escolhe e já volta para a tela inicial.
const CLOSE_DELAY_MS = 260;

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function renderHeroes() {
    const roster = document.getElementById('heroRoster');
    roster.replaceChildren();
    Object.entries(HEROES).forEach(([key, hero]) => {
        const owned = save.unlockedHeroes.includes(key);
        const picked = save.hero === key;
        const trial = ACHIEVEMENTS.find(a => a.hero === key);
        const card = el('button', `hero-card${picked ? ' is-picked' : ''}${owned ? '' : ' is-locked'}`);
        card.dataset.hero = key;
        card.disabled = !owned;

        const portrait = el('span', 'hero-portrait');
        portrait.style.filter = owned ? hero.portrait : '';
        card.append(
            portrait,
            el('b', '', owned ? hero.name : '???'),
            el('em', '', owned ? hero.tagline : ''),
            el('span', 'hero-trait', owned ? hero.trait : `${trial?.icon ?? '🔒'} ${trial?.name ?? ''}: ${trial?.desc ?? ''}`),
            el('span', 'hero-tag', picked ? 'IN USE' : owned ? 'CHOOSE' : '🔒 LOCKED')
        );
        roster.appendChild(card);
    });
}

export function openHeroes() {
    renderHeroes();
    document.getElementById('heroScreen').classList.remove('hidden');
    audio.init();
}

export function closeHeroes() {
    document.getElementById('heroScreen').classList.add('hidden');
    renderStartScreen();
}

export function chooseHero(key) {
    if (!save.unlockedHeroes.includes(key)) return;
    save.hero = key;
    persist();
    renderHeroes();
    audio.playCardPick('rare');
    setTimeout(() => {
        if (!document.getElementById('heroScreen').classList.contains('hidden')) closeHeroes();
    }, CLOSE_DELAY_MS);
}

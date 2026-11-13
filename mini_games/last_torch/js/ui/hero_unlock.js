import { HEROES } from '../../data_model/heroes.js';
import { audio, state } from '../core/state.js';
import { chooseHero } from './heroes.js';

// --- PRÊMIO DE PERSONAGEM LIBERADO ---
// Quando uma conquista libera um herói, a tela escurece, raios de luz giram atrás, confete cai e o cartão dele aparece com a
// foto e um clarão: "NEW HERO UNLOCKED". Durante a caçada o prêmio espera (não atrapalha a luta) e aparece no acampamento,
// no fim da noite ou no menu. Entre as noites dá para jogar com ele agora; no meio da noite fica para a próxima.
// Estilo e animações: css/components/hero_unlock.css.
const HUNTER_IMAGE = 'images/characters/demon-hunter-small.webp';
const CONFETTI = 34;
const queue = [];            // { key, achievement } esperando a vez
let root = null;

const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
};

// Chamado por js/systems/sanctuary.js quando uma conquista libera o herói
export function queueHeroUnlock(key, achievement) {
    if (!HEROES[key] || HEROES[key].shelved) return;
    if (queue.some(q => q.key === key) || root?.dataset.hero === key) return;
    queue.push({ key, achievement });
}

// Mostra o próximo prêmio, se der: nunca no meio da caçada (nem de um diálogo) e um de cada vez
let waiting = false;
export function flushHeroUnlocks() {
    if (root || queue.length === 0) return;
    if (state.gameState === 'PLAYING' || state.gameState === 'DIALOGUE') return;
    // Na tela final o prêmio espera o resumo da noite aparecer e o jogador respirar
    if (state.gameState === 'GAMEOVER' && !waiting) {
        waiting = true;
        setTimeout(() => {
            waiting = false;
            if (state.gameState === 'GAMEOVER' && !root && queue.length > 0) show(queue.shift());
        }, 1500);
        return;
    }
    if (state.gameState === 'GAMEOVER') return;
    show(queue.shift());
}

function show({ key, achievement }) {
    const hero = HEROES[key];
    const midRun = state.gameState === 'CAMP';
    root = el('div', 'hero-unlock');
    root.dataset.hero = key;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', `${hero.name} unlocked`);

    const confetti = el('div', 'hu-confetti');
    for (let i = 0; i < CONFETTI; i++) {
        const piece = el('span');
        piece.style.setProperty('--x', `${Math.round(Math.random() * 100)}%`);
        piece.style.setProperty('--delay', `${(Math.random() * 1.6).toFixed(2)}s`);
        piece.style.setProperty('--fall', `${(2.4 + Math.random() * 2.2).toFixed(2)}s`);
        piece.style.setProperty('--hue', `${Math.round(30 + Math.random() * 40)}`);
        piece.style.setProperty('--spin', `${Math.round(240 + Math.random() * 600)}deg`);
        confetti.appendChild(piece);
    }

    const card = el('div', 'hu-card');
    const portrait = el('div', 'hu-portrait');
    const img = el('img');
    img.src = hero.portraitImage ?? HUNTER_IMAGE;
    img.alt = hero.name;
    if (!hero.portraitImage && hero.portrait) img.style.filter = hero.portrait;
    portrait.append(img, el('span', 'hu-shine'));

    const text = el('div', 'hu-text');
    text.append(el('div', 'hu-kicker', 'NEW HERO UNLOCKED'), el('div', 'hu-name', hero.name), el('div', 'hu-tagline', hero.tagline));
    if (hero.perk) text.appendChild(el('div', 'hu-perk', `${hero.perk.name}: ${hero.perk.text}`));
    if (achievement) text.appendChild(el('div', 'hu-earned', `${achievement.icon} ${achievement.name}`));

    const actions = el('div', 'hu-actions');
    const later = el('button', 'hu-later', midRun ? 'KEEP GOING' : 'LATER');
    if (!midRun) {
        const play = el('button', 'hu-play', `PLAY AS ${hero.name.toUpperCase()}`);
        play.addEventListener('click', () => close(() => chooseHero(key)));
        actions.appendChild(play);
    } else {
        text.appendChild(el('div', 'hu-note', 'Pick him from the hero menu for your next night.'));
    }
    later.addEventListener('click', () => close());
    actions.appendChild(later);
    card.append(portrait, text, actions);

    root.append(el('div', 'hu-rays'), confetti, card);
    document.body.appendChild(root);
    audio.playLevelUp();
    setTimeout(() => audio.playCardPick('legendary'), 260);
    setTimeout(() => audio.playChest?.(), 620);
    requestAnimationFrame(() => root?.classList.add('is-in'));
    document.addEventListener('keydown', onKey, true);
}

function onKey(event) {
    if (event.key !== 'Escape' && event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    close();
}

function close(after) {
    if (!root) return;
    document.removeEventListener('keydown', onKey, true);
    const gone = root;
    root = null;
    gone.classList.remove('is-in');
    gone.classList.add('is-out');
    setTimeout(() => {
        gone.remove();
        after?.();
        flushHeroUnlocks();             // mais um herói na fila? aparece em seguida
    }, 320);
}

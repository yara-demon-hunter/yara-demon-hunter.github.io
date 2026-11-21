import { ACHIEVEMENTS } from '../../data_model/sanctuary.js';
import { ACTIVE_HEROES, HEROES, ORDERED_HEROES } from '../../data_model/heroes.js';
import { save, persist } from '../core/save.js';
import { audio } from '../core/state.js';
import { paintHeroPortrait, renderStartScreen } from './screens.js';
import { flushHeroUnlocks, queueHeroUnlock } from './hero_unlock.js';
import { previewHero, setPreviewHero, unlockRequirements, unlockProgressLabel } from './hero_stats.js';

// Herói liberado: por conquista do Santuário, comprado com Brasas (emberPrice) ou de graça (free em data_model/heroes.js)
export function isOwned(key) {
    return HEROES[key].free === true || save.unlockedHeroes.includes(key);
}

// Herói à venda por Brasas e ainda bloqueado: { price, have, ready }
export function heroOffer(key) {
    const price = HEROES[key]?.emberPrice;
    if (!price || HEROES[key].shelved || isOwned(key)) return null;
    return { price, have: save.embers, ready: save.embers >= price };
}

// Compra: desconta as Brasas, libera e mostra o mesmo prêmio de herói novo das conquistas
export function buyHero(key) {
    const offer = heroOffer(key);
    if (!offer?.ready) return;
    save.embers -= offer.price;
    save.unlockedHeroes.push(key);
    setPreviewHero(null);
    persist();
    renderStartScreen();
    queueHeroUnlock(key, null);
    flushHeroUnlocks();
}

// --- ESCOLHA NA TELA INICIAL ---
// Um cartão por herói ativo, lado a lado. O escolhido fica aceso; tocar em outro troca na hora.
export function renderHeroPicker() {
    const picker = document.getElementById('heroPicker');
    const current = isOwned(save.hero) ? save.hero : 'hunter';
    picker.replaceChildren(...ACTIVE_HEROES.map(key => {
        const hero = HEROES[key];
        const owned = isOwned(key);
        const offer = heroOffer(key);
        const picked = owned && key === current;
        const viewing = !owned && previewHero() === key;
        // Bloqueado também é clicável: o toque mostra, no lugar das barras, o que falta para desbloquear (js/ui/hero_stats.js)
        const card = el('button', `hero-pick${picked ? ' is-picked' : ''}${owned ? '' : ' is-locked'}${offer?.ready ? ' is-buyable' : ''}${viewing ? ' is-viewing' : ''}`);
        card.dataset.hero = key;
        card.setAttribute('role', 'radio');
        card.setAttribute('aria-checked', String(picked));
        const portrait = el('span', 'hero-portrait');
        paintHeroPortrait(portrait, hero);
        card.title = owned ? hero.tagline : offer ? `Unlock with ${offer.price} embers` : `Locked: ${hero.unlockHint ?? ''}`;
        // Herói de conquista: o cartão mostra o quanto falta (ex.: 0%), no mesmo lugar do preço dos heróis de Brasas
        const goal = !owned && !offer ? unlockProgressLabel(key) : null;
        const label = offer ? (offer.ready ? `🔥${offer.price}` : `🔥${Math.min(offer.have, offer.price)}/${offer.price}`) : goal?.chip;
        if (!owned) {
            const lock = el('span', 'hero-pick-lock', '🔒');
            // Na tela deitada a dica some (falta altura): o preço vai dentro do cadeado (css/components/start-screen.css)
            if (label) lock.append(el('em', `hero-pick-lock-price${goal ? ' is-goal' : ''}`, label));
            portrait.append(lock);
        }
        card.append(portrait, el('span', 'hero-pick-name', hero.name.toUpperCase()));
        if (offer) card.append(el('span', 'hero-pick-hint is-price', label));
        else if (goal) card.append(el('span', 'hero-pick-hint is-goal', goal.chip));
        else if (!owned && hero.unlockHint) card.append(el('span', 'hero-pick-hint', hero.unlockHint));
        return card;
    }));
}

export function pickHeroOnStart(key) {
    if (!HEROES[key] || HEROES[key].shelved) return;
    // Bloqueado: mostra os requisitos (a compra fica no botão do painel)
    if (!isOwned(key)) {
        setPreviewHero(key);
        audio.init();
        audio.playCardPick?.('common');
        renderStartScreen();
        return;
    }
    if (previewHero()) setPreviewHero(null);
    if (save.hero === key) return renderStartScreen();
    save.hero = key;
    persist();
    audio.init();
    audio.playCardPick('rare');
    renderStartScreen();
}

// --- ESCOLHA DO HERÓI (tela antiga, guardada: nenhum botão a abre agora) ---
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
    ORDERED_HEROES.map(key => [key, HEROES[key]]).forEach(([key, hero]) => {
        const owned = isOwned(key);
        const picked = save.hero === key;
        const trial = ACHIEVEMENTS.find(a => a.hero === key);
        const card = el('button', `hero-card${picked ? ' is-picked' : ''}${owned ? '' : ' is-locked'}`);
        card.dataset.hero = key;
        card.disabled = !owned;

        const portrait = el('span', 'hero-portrait');
        if (owned) paintHeroPortrait(portrait, hero);
        card.append(
            portrait,
            el('b', '', owned ? hero.name : '???'),
            el('em', '', owned ? hero.tagline : ''),
            el('span', 'hero-trait', owned ? hero.trait : `${trial?.icon ?? '🔒'} ${trial?.name ?? ''}: ${trial?.desc ?? ''}`),
            el('span', 'hero-progress', owned || !trial ? '' : `${Math.min(save.stats[trial.stat] ?? 0, trial.target)}/${trial.target}`),
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
    if (!HEROES[key] || !isOwned(key)) return;
    save.hero = key;
    persist();
    renderHeroes();
    audio.playCardPick('rare');
    setTimeout(() => {
        if (!document.getElementById('heroScreen').classList.contains('hidden')) closeHeroes();
    }, CLOSE_DELAY_MS);
}

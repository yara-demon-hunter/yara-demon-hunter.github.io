import { CARD_CHOICES, CARD_WEIGHTS, FALLBACK_CARDS, RARITIES } from '../../data_model/cards.js';
import { EVOLUTIONS, POWER_MODELS, POWER_SLOTS } from '../../data_model/powers.js';
import { save, persist } from '../core/save.js';
import { attributes, passives, player, powers, state } from '../core/state.js';
import { updateBuildStrip, updateHUD } from '../ui/hud.js';
import { getStatText } from '../ui/status.js';
import { mod, refreshModifiers } from './modifiers.js';
import { celebrateEvolution } from './powers.js';
import { syncMaxHp } from './torch.js';

// --- CARTAS ---
// Monta as ofertas de level up e baú, e aplica a carta escolhida. Os pesos ficam em data_model/cards.js.
export function isPowerUnlocked(key) {
    return !POWER_MODELS[key].unlock || save.unlockedPowers.includes(key);
}

export function getOwnedPowers() {
    return Object.values(powers).filter(p => p.lvl > 0);
}

function meetsNeed(need) {
    if (need.power) return powers[need.power].lvl >= need.lvl;
    if (need.stat) return attributes[need.stat].lvl >= need.lvl;
    return passives[need.passive]?.lvl > 0;
}

// Evoluções liberadas agora: poder no máximo + requisito cumprido
function getReadyEvolutions() {
    return Object.keys(EVOLUTIONS).filter(key => {
        const p = powers[key];
        return p.lvl >= p.maxLvl && !p.evolved && meetsNeed(EVOLUTIONS[key].need);
    });
}

function rollRarity(minimum) {
    const luck = mod('luck') * CARD_WEIGHTS.luckToRare;
    const options = RARITIES.slice(minimum);
    const weights = options.map((r, i) => r.weight * (i === 0 ? 1 : 1 + luck * 2));
    let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
    for (let i = 0; i < options.length; i++) {
        roll -= weights[i];
        if (roll < 0) return options[i];
    }
    return options[0];
}

function buildPool() {
    const owned = getOwnedPowers().length;
    const pool = [];
    for (const key of Object.keys(powers)) {
        const p = powers[key];
        if (p.lvl >= p.maxLvl) continue;
        if (p.lvl > 0) {
            pool.push({ kind: 'power', key, weight: CARD_WEIGHTS.ownedPower });
        } else if (owned < POWER_SLOTS && isPowerUnlocked(key)) {
            const boost = owned < CARD_WEIGHTS.fewPowersBelow ? CARD_WEIGHTS.fewPowersBoost : 1;
            pool.push({ kind: 'power', key, weight: CARD_WEIGHTS.newPower * boost });
        }
    }
    for (const key of Object.keys(attributes)) {
        if (attributes[key].lvl < attributes[key].maxLvl) pool.push({ kind: 'stat', key, weight: CARD_WEIGHTS.stat });
    }
    return pool;
}

function takeWeighted(pool) {
    let roll = Math.random() * pool.reduce((sum, c) => sum + c.weight, 0);
    for (let i = 0; i < pool.length; i++) {
        roll -= pool[i].weight;
        if (roll < 0) return pool.splice(i, 1)[0];
    }
    return pool.pop();
}

function finishCard(entry, minimumRarity) {
    const rarity = rollRarity(minimumRarity);
    const room = entry.kind === 'power'
        ? powers[entry.key].maxLvl - powers[entry.key].lvl
        : attributes[entry.key].maxLvl - attributes[entry.key].lvl;
    return { ...entry, rarity, levels: Math.min(rarity.levels, room) };
}

// mode: 'level' (cartas comuns) ou 'chest' (a partir de Rare)
export function rollCards(mode) {
    const count = CARD_CHOICES + mod('cardChoices');
    const minimumRarity = mode === 'chest' ? 1 : 0;
    const cards = getReadyEvolutions().slice(0, count).map(key => ({ kind: 'evolution', key, rarity: { key: 'evolution', label: 'Evolution' } }));

    const pool = buildPool();
    while (cards.length < count && pool.length > 0) cards.push(finishCard(takeWeighted(pool), minimumRarity));

    // Nível 2 sempre oferece um poder: o jogador vê logo do que o jogo é capaz
    if (getOwnedPowers().length === 0 && !cards.some(c => c.kind === 'power')) {
        const offer = pool.find(c => c.kind === 'power');
        if (offer) cards[0] = finishCard(offer, 0);
    }

    if (cards.length < count) {
        cards.push({ kind: 'fallback', key: 'gold', rarity: RARITIES[0] });
        if (cards.length < count) cards.push({ kind: 'fallback', key: 'heal', rarity: RARITIES[0] });
    }
    return cards;
}

// Texto da carta: { icon, name, tag, line, detail }
export function describeCard(card) {
    if (card.kind === 'evolution') {
        const evo = EVOLUTIONS[card.key];
        return { icon: evo.icon, name: evo.name, tag: 'EVOLUTION', line: evo.desc, detail: `${POWER_MODELS[card.key].name} evolves` };
    }
    if (card.kind === 'fallback') {
        const fb = FALLBACK_CARDS[card.key];
        const text = card.key === 'gold' ? `+${fb.gold} gold` : fb.desc;
        return { icon: fb.icon, name: fb.name, tag: '', line: text, detail: '' };
    }
    if (card.kind === 'power') {
        const p = powers[card.key];
        const next = p.lvl + card.levels;
        const isNew = p.lvl === 0;
        const evolution = EVOLUTIONS[card.key];
        const maxed = next >= p.maxLvl && evolution;
        return {
            icon: p.icon,
            name: p.name,
            tag: isNew ? 'NEW POWER' : `LV ${p.lvl} → ${next}`,
            line: isNew ? p.desc : p.upgrades[next - 1],
            detail: maxed ? `Evolves with ${evolution.needText}` : isNew ? p.upgrades[next - 1] : ''
        };
    }
    const attr = attributes[card.key];
    const before = getStatText(card.key);
    attr.lvl += card.levels;
    const after = getStatText(card.key);
    attr.lvl -= card.levels;
    return { icon: attr.icon, name: attr.name, tag: `LV ${attr.lvl} → ${attr.lvl + card.levels}`, line: attr.desc, detail: `${before} → ${after}` };
}

export function applyCard(card) {
    if (card.kind === 'evolution') {
        powers[card.key].evolved = true;
        state.run.evolutions++;
        save.stats.evolutions++;
        persist();
        celebrateEvolution();
    } else if (card.kind === 'power') {
        powers[card.key].lvl += card.levels;
    } else if (card.kind === 'stat') {
        attributes[card.key].lvl += card.levels;
    } else if (card.key === 'gold') {
        state.coins += FALLBACK_CARDS.gold.gold;
    } else {
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * FALLBACK_CARDS.heal.healRatio);
    }
    refreshModifiers();
    syncMaxHp();
    updateBuildStrip();
    updateHUD();
}

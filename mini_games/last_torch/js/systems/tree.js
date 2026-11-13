import { CAMP } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS } from '../../data_model/powers.js';
import { RELIC_BY_ID } from '../../data_model/relics.js';
import { TREE_BY_ID, TREE_COSTS, TREE_NODES } from '../../data_model/tree.js';
import { save, persist } from '../core/save.js';
import { attributes, audio, passives, powers, state } from '../core/state.js';
import { prepareRaven } from '../render/raven.js';
import { preparePhoenix } from '../render/phoenix.js';
import { prepareShackle } from '../render/shackle.js';
import { showToast } from '../ui/banner.js';
import { updateHUD } from '../ui/hud.js';
import { getStatText } from '../ui/status.js';
import { getHero, mod, refreshModifiers } from './modifiers.js';
import { celebrateEvolution } from './powers.js';
import { syncMaxHp, syncTorchMax } from './torch.js';

// --- ÁRVORES (regras) ---
// Duas árvores com as mesmas regras: skills (pontos, tela de status, data_model/tree.js) e relíquias
// (ouro, acampamento, data_model/relics.js). O desenho fica em js/ui/tree.js. Um nó guarda o nível no
// próprio sistema que ele muda (atributo, poder, passiva) ou em state.tree (efeitos simples), então o
// resto do jogo continua lendo `attributes`, `powers` e `passives` como antes.
const NODE_BY_ID = { ...TREE_BY_ID, ...RELIC_BY_ID };
const DEFAULT_MAX = 5;

// Quem evolui: um poder, ou uma passiva (Shadow Clone). Os dois guardam `evolved`
function evolvable(node) {
    return powers[node.key] ?? passives[node.key];
}

export function getOwnedPowers() {
    return Object.values(powers).filter(p => p.lvl > 0);
}

export function getNodeLevel(node) {
    if (node.kind === 'passive' || node.kind === 'relic') return passives[node.key].lvl;
    if (node.kind === 'stat') return attributes[node.key].lvl - 1;
    if (node.kind === 'power') return powers[node.key].lvl;
    if (node.kind === 'evolve') return evolvable(node).evolved ? 1 : 0;
    return state.tree[node.id] ?? 0;
}

export function getNodeMax(node) {
    if (node.kind === 'passive' || node.kind === 'relic') return passives[node.key].maxLvl;
    if (node.kind === 'evolve') return 1;
    if (node.kind === 'stat') return Math.min(node.maxLvl ?? DEFAULT_MAX, attributes[node.key].maxLvl - 1);
    if (node.kind === 'power') return Math.min(node.maxLvl ?? DEFAULT_MAX, powers[node.key].maxLvl);
    return node.maxLvl ?? DEFAULT_MAX;
}

// Relíquias se pagam com ouro; o resto, com pontos de skill
export function getNodeCurrency(node) {
    return node.kind === 'relic' ? 'gold' : 'points';
}

// Relíquia: preço base, corrigido pela hora. Quanto mais tarde, mais cara
export function getRelicPrice(node) {
    return Math.round(passives[node.key].cost * CAMP.costMultiplier * (1 + CAMP.costGrowthPerHour * (state.turn - 1)));
}

export function getNodeCost(node) {
    if (node.kind === 'relic') return getRelicPrice(node);
    if (node.cost) return node.cost;
    const costs = TREE_COSTS[node.branch];
    if (node.kind === 'power') return costs.power;
    return node.kind === 'passive' || node.kind === 'evolve' ? costs.special : costs.basic;
}

// Nome, ícone e descrição de um nó, vindos de onde ele mora
export function getNodeInfo(node) {
    if (node.kind === 'passive' || node.kind === 'relic') {
        const p = passives[node.key];
        return { name: p.name, icon: p.icon, desc: p.desc };
    }
    if (node.kind === 'stat') {
        const a = attributes[node.key];
        return { name: a.name, icon: a.icon, desc: a.desc };
    }
    if (node.kind === 'power') {
        const p = POWER_MODELS[node.key];
        return { name: p.name, icon: p.icon, desc: p.desc };
    }
    if (node.kind === 'evolve') {
        const evo = EVOLUTIONS[node.key];
        return { name: evo.name, icon: evo.icon, desc: evo.desc };
    }
    return { name: node.name, icon: node.icon, desc: node.desc };
}

// Texto do que o próximo nível faz
export function getNextText(node) {
    if (node.kind === 'passive' || node.kind === 'relic') return '';
    if (node.kind === 'power') return POWER_MODELS[node.key].upgrades[powers[node.key].lvl] ?? '';
    if (node.kind === 'evolve') return `${evolvable(node).name} evolves`;
    if (node.kind === 'mod') return typeof node.levelText === 'function' ? node.levelText(node.mods) : node.levelText;
    const attr = attributes[node.key];
    const before = getStatText(node.key);
    attr.lvl++;
    const after = getStatText(node.key);
    attr.lvl--;
    const levelText = typeof node.levelText === 'function' ? node.levelText(node.mods) : node.levelText;
    return levelText ? `${before} → ${after}; ${levelText}` : `${before} → ${after}`;
}

const isSingle = (node) => node.kind === 'passive' || node.kind === 'relic' || node.kind === 'evolve';

// Skill que só funciona com adaga (needs: 'knives') e o jogador não lança adaga (mod noKnives): o nó fica selado.
// Não se compra, e conta como cumprido para quem o pede (passe livre). Vale para o herói que não tem adaga (Captain
// Brutos) e para quem jurou o Oath of Slaughter; níveis já comprados ficam, só não sobem mais.
export function isRestricted(node) {
    // hero: skill de um herói só (Dark Roses): fica selada para os outros
    if (node.hero && getHero().id !== node.hero) return true;
    // notFor: skill que um herói não pode usar (o druida não usa Fireballs: as rosas dele não queimam)
    if (node.notFor?.includes(getHero().id)) return true;
    return node.needs === 'knives' && mod('noKnives') > 0;
}

// Por que está selado, para a tela: de quem é a escolha (o herói ou o Juramento)
export function getRestrictionText(node) {
    if (node?.hero && getHero().id !== node.hero) return `Only ${node.hero[0].toUpperCase()}${node.hero.slice(1)} can learn this skill.`;
    if (node?.notFor?.includes(getHero().id)) return `${getHero().name} cannot use this skill: his roses do not burn.`;
    const hero = getHero();
    return (hero.mods?.noKnives ?? 0) > 0
        ? `${hero.name} fights without daggers: this skill is not for him.`
        : 'The Oath of Slaughter sealed your daggers: this skill can no longer be used.';
}

// Lista completa do que um nó pede, com o que o jogador já tem: { label, have, need, met }.
// Fica toda visível de uma vez: quem cumpriu os pedidos do nó anterior nunca esbarra num pedido novo escondido.
export function getRequirementChecks(node) {
    const checks = node.requires.map(({ id, lvl }) => {
        const parent = NODE_BY_ID[id];
        const name = getNodeInfo(parent).name;
        const have = getNodeLevel(parent);
        // Passe livre: pedir um nó selado (sem adaga) não segura ninguém
        if (isRestricted(parent)) return { label: `${name} (sealed: free pass)`, have: lvl, need: lvl, met: true, showCount: false, skipped: true };
        return { label: isSingle(parent) ? name : `${name} Lv. ${lvl}`, have: Math.min(have, lvl), need: lvl, met: have >= lvl, showCount: lvl > 1 && !isSingle(parent) };
    });
    if (node.oath) {
        const free = !state.oath || state.oath === node.key;
        checks.push({ label: 'One oath per night', have: free ? 1 : 0, need: 1, met: free, showCount: false });
    }
    return checks;
}

// Estado de um nó, para desenho e compra
export function getNodeState(node) {
    const level = getNodeLevel(node);
    const max = getNodeMax(node);
    const cost = getNodeCost(node);
    const checks = getRequirementChecks(node);
    // O herói que já começa com o poder abre o nó sem passar pelos requisitos
    const reached = level > 0 || checks.every(c => c.met);
    const restricted = isRestricted(node);
    const maxed = level >= max;
    const open = reached && !maxed && !restricted;
    const currency = getNodeCurrency(node);
    const balance = currency === 'gold' ? state.coins : state.skillPoints;
    // Relíquias só se compram no acampamento
    const atCamp = node.kind !== 'relic' || state.gameState === 'CAMP';
    return { level, max, cost, currency, checks, reached: reached || restricted, maxed, open, restricted, canBuy: open && atCamp && balance >= cost };
}

// Um Juramento acabou de abrir: é a decisão da noite, não pode passar despercebida
function announceOath() {
    if (state.oath || state.oathAnnounced) return;
    const open = TREE_NODES.find(node => node.oath && getNodeState(node).reached);
    if (!open) return;
    state.oathAnnounced = true;
    showToast('⬢', 'An oath can be sworn', `${getNodeInfo(open).name}. Only one per night.`);
}

// Nós que dá para comprar agora
export function getBuyableNodes() {
    return TREE_NODES.filter(node => getNodeState(node).canBuy);
}

// Algum nó que o jogador pode comprar agora? Faz o medalhão pulsar
export function hasBuyableNode() {
    if (state.skillPoints <= 0) return false;
    return TREE_NODES.some(node => getNodeState(node).canBuy);
}

export function buyNode(id) {
    const node = NODE_BY_ID[id];
    const st = node ? getNodeState(node) : null;
    if (!st?.canBuy) return false;

    if (st.currency === 'gold') state.coins -= st.cost;
    else state.skillPoints -= st.cost;

    if (node.kind === 'passive' || node.kind === 'relic') {
        passives[node.key].lvl++;
        // O sprite da fênix leva um instante para montar: melhor agora, com a tela de skills aberta, do que no meio da luta
        if (node.key === 'phoenixPact') preparePhoenix();
        if (node.key === 'shadowRaven') prepareRaven();
        if (node.key === 'shadowShackle') prepareShackle();
        state.revives += passives[node.key].mods?.revives ?? 0;
        state.skillPoints += passives[node.key].grantPoints ?? 0;
        if (node.oath) {
            state.oath = node.key;
            state.oathCeremony = node.key;
        }
    } else if (node.kind === 'stat') attributes[node.key].lvl++;
    else if (node.kind === 'power') powers[node.key].lvl++;
    else if (node.kind === 'mod') state.tree[node.id] = st.level + 1;
    else {
        evolvable(node).evolved = true;
        state.run.evolutions++;
        save.stats.evolutions++;
        persist();
        celebrateEvolution();
    }

    refreshModifiers();
    syncMaxHp();
    syncTorchMax();
    announceOath();
    updateHUD();
    if (st.currency === 'gold') audio.playPurchase();
    else audio.playCardPick(node.kind === 'evolve' ? 'evolution' : node.kind === 'power' || node.kind === 'passive' ? 'rare' : 'common');
    return true;
}

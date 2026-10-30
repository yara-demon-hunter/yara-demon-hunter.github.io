import { ACHIEVEMENTS } from '../../data_model/meta.js';
import { CAMP } from '../../data_model/passives.js';
import { EVOLUTIONS, POWER_MODELS } from '../../data_model/powers.js';
import { RELIC_BY_ID } from '../../data_model/relics.js';
import { TREE_BY_ID, TREE_NODES } from '../../data_model/tree.js';
import { save, persist } from '../core/save.js';
import { attributes, audio, passives, powers, state } from '../core/state.js';
import { updateBuildStrip, updateHUD } from '../ui/hud.js';
import { getStatText } from '../ui/status.js';
import { refreshModifiers } from './modifiers.js';
import { celebrateEvolution } from './powers.js';
import { syncMaxHp, syncTorchMax } from './torch.js';

// --- ÁRVORES (regras) ---
// Duas árvores com as mesmas regras: skills (pontos, tela de status, data_model/tree.js) e relíquias
// (ouro, acampamento, data_model/relics.js). O desenho fica em js/ui/tree.js. Um nó guarda o nível no
// próprio sistema que ele muda (atributo, poder, passiva) ou em state.tree (efeitos simples), então o
// resto do jogo continua lendo `attributes`, `powers` e `passives` como antes.
const NODE_BY_ID = { ...TREE_BY_ID, ...RELIC_BY_ID };
const DEFAULT_MAX = 5;
const EVOLVE_COST = 3;

export function getOwnedPowers() {
    return Object.values(powers).filter(p => p.lvl > 0);
}

export function getNodeLevel(node) {
    if (node.kind === 'passive' || node.kind === 'relic') return passives[node.key].lvl;
    if (node.kind === 'stat') return attributes[node.key].lvl - 1;
    if (node.kind === 'power') return powers[node.key].lvl;
    if (node.kind === 'evolve') return powers[node.key].evolved ? 1 : 0;
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
    return node.cost ?? (node.kind === 'evolve' ? EVOLVE_COST : 1);
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
    if (node.kind === 'evolve') return `${POWER_MODELS[node.key].name} evolves`;
    if (node.kind === 'mod') return node.levelText;
    const attr = attributes[node.key];
    const before = getStatText(node.key);
    attr.lvl++;
    const after = getStatText(node.key);
    attr.lvl--;
    return `${before} → ${after}`;
}

function meetsNeed(need) {
    if (need.power) return powers[need.power].lvl >= need.lvl;
    return attributes[need.stat].lvl >= need.lvl;
}

// Poderes de Trial só aparecem depois de ganhos; nós extras, depois de comprados no Hearth
export function isNodeUnlocked(node) {
    if (node.lock?.embers) return save.unlockedNodes.includes(node.id);
    if (node.kind === 'power' || node.kind === 'evolve') {
        return !POWER_MODELS[node.key].unlock || save.unlockedPowers.includes(node.key);
    }
    return true;
}

export function getLockText(node) {
    if (node.lock?.embers) return `Unlock in the Hearth for ${node.lock.embers} embers`;
    const trial = ACHIEVEMENTS.find(a => a.reward.power === node.key);
    return trial ? `Trial: ${trial.name}. ${trial.desc}` : 'Locked';
}

// Condição extra de uma evolução (poder no máximo e o requisito dele). ok = pode comprar
function checkEvolution(node) {
    const power = powers[node.key];
    if (power.lvl < power.maxLvl) return { ok: false, text: `Max out ${power.name} first` };
    const evo = EVOLUTIONS[node.key];
    if (!meetsNeed(evo.need)) return { ok: false, text: `Needs ${evo.needText}` };
    return { ok: true, text: '' };
}

// Estado de um nó, para desenho e compra
export function getNodeState(node) {
    const level = getNodeLevel(node);
    const max = getNodeMax(node);
    const cost = getNodeCost(node);
    const unlocked = isNodeUnlocked(node);
    // O herói que já começa com o poder abre o nó sem passar pelos anteriores
    const reached = level > 0 || node.requires.every(id => getNodeLevel(NODE_BY_ID[id]) > 0);
    const extra = node.kind === 'evolve' ? checkEvolution(node) : { ok: true, text: '' };
    const maxed = level >= max;
    const open = unlocked && reached && extra.ok && !maxed;
    const currency = getNodeCurrency(node);
    const balance = currency === 'gold' ? state.coins : state.skillPoints;
    // Relíquias só se compram no acampamento
    const atCamp = node.kind !== 'relic' || state.gameState === 'CAMP';
    return { level, max, cost, currency, unlocked, reached, extra, maxed, open, canBuy: open && atCamp && balance >= cost };
}

// Por que um nó fechado está fechado (vazio se estiver aberto)
export function getBlockText(node, st = getNodeState(node)) {
    if (!st.unlocked) return getLockText(node);
    if (!st.reached) {
        const missing = node.requires.map(id => NODE_BY_ID[id]).filter(n => getNodeLevel(n) === 0).map(n => getNodeInfo(n).name);
        return `Learn first: ${missing.join(', ')}`;
    }
    return st.extra.text;
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
        state.revives += passives[node.key].mods?.revives ?? 0;
    } else if (node.kind === 'stat') attributes[node.key].lvl++;
    else if (node.kind === 'power') powers[node.key].lvl++;
    else if (node.kind === 'mod') state.tree[node.id] = st.level + 1;
    else {
        powers[node.key].evolved = true;
        state.run.evolutions++;
        save.stats.evolutions++;
        persist();
        celebrateEvolution();
    }

    refreshModifiers();
    syncMaxHp();
    syncTorchMax();
    updateBuildStrip();
    updateHUD();
    if (st.currency === 'gold') audio.playPurchase();
    else audio.playCardPick(node.kind === 'evolve' ? 'evolution' : node.kind === 'power' || node.kind === 'passive' ? 'rare' : 'common');
    return true;
}

// Compra de um nó extra no Hearth
export function unlockNode(id) {
    const node = NODE_BY_ID[id];
    const cost = node?.lock?.embers;
    if (!cost || save.unlockedNodes.includes(id) || save.embers < cost) return false;
    save.embers -= cost;
    save.unlockedNodes.push(id);
    persist();
    audio.playPurchase();
    return true;
}

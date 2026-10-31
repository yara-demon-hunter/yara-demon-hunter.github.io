// --- ÁRVORE DE RELÍQUIAS ---
// Aparece no acampamento. Cada nó é uma relíquia de data_model/passives.js (kind 'relic'), comprada com OURO
// (preço base em passives.js, corrigido pela hora em data_model/passives.js > CAMP). Os pré-requisitos
// seguram as relíquias mais fortes para depois das mais simples. Mesmas coordenadas e mesmo formato de
// requisitos da árvore de skills.
import { req } from './tree.js';

export const RELIC_LAYOUT = {
    labelWidth: 1.5,
    tiers: 4,
    branchGap: 0.15
};

export const RELIC_BRANCHES = {
    fortune: { name: 'FORTUNE', icon: '💰', color: '#fcd34d' },
    ward: { name: 'WARD', icon: '🛡️', color: '#6ee7b7' },
    wrath: { name: 'WRATH', icon: '😈', color: '#fb7185' }
};

export const RELIC_NODES = [
    // --- FORTUNA ---
    { id: 'greedyIdol', branch: 'fortune', kind: 'relic', key: 'greedyIdol', x: 0, y: 0, requires: [] },
    { id: 'luckyCoin', branch: 'fortune', kind: 'relic', key: 'luckyCoin', x: 1, y: 0, requires: [req('greedyIdol')] },
    { id: 'witchEye', branch: 'fortune', kind: 'relic', key: 'witchEye', x: 2, y: 0, requires: [req('luckyCoin')] },
    { id: 'huntersNotes', branch: 'fortune', kind: 'relic', key: 'huntersNotes', x: 3, y: 0, requires: [req('witchEye')] },
    { id: 'coinPurse', branch: 'fortune', kind: 'relic', key: 'coinPurse', x: 0, y: 1, requires: [] },
    { id: 'hunterLore', branch: 'fortune', kind: 'relic', key: 'hunterLore', x: 1, y: 1, requires: [req('coinPurse')] },
    { id: 'treasureSense', branch: 'fortune', kind: 'relic', key: 'treasureSense', x: 2, y: 1, requires: [req('hunterLore')] },
    // Mãos de ladrão: o ouro do chão vem até você, cada morte rende mais, cada moeda acelera, e o dash rouba
    { id: 'lightFingers', branch: 'fortune', kind: 'relic', key: 'lightFingers', x: 0, y: 2, requires: [] },
    { id: 'pickpocket', branch: 'fortune', kind: 'relic', key: 'pickpocket', x: 1, y: 2, requires: [req('lightFingers')] },
    { id: 'coinRush', branch: 'fortune', kind: 'relic', key: 'coinRush', x: 2, y: 2, requires: [req('pickpocket')] },
    { id: 'thiefNose', branch: 'fortune', kind: 'relic', key: 'thiefNose', x: 3, y: 2, requires: [req('coinRush')] },
    { id: 'masterThief', branch: 'fortune', kind: 'relic', key: 'masterThief', x: 3, y: 1, requires: [req('thiefNose')] },

    // --- PROTEÇÃO ---
    { id: 'emberFlask', branch: 'ward', kind: 'relic', key: 'emberFlask', x: 0, y: 0, requires: [] },
    { id: 'warmCloak', branch: 'ward', kind: 'relic', key: 'warmCloak', x: 1, y: 0, requires: [req('emberFlask')] },
    { id: 'ironHeart', branch: 'ward', kind: 'relic', key: 'ironHeart', x: 2, y: 0, requires: [req('warmCloak')] },
    { id: 'secondPrayer', branch: 'ward', kind: 'relic', key: 'secondPrayer', x: 3, y: 0, requires: [req('ironHeart')] },
    { id: 'hearthstone', branch: 'ward', kind: 'relic', key: 'hearthstone', x: 0, y: 1, requires: [] },
    { id: 'oldScars', branch: 'ward', kind: 'relic', key: 'oldScars', x: 1, y: 1, requires: [req('hearthstone')] },
    { id: 'lastPrayer', branch: 'ward', kind: 'relic', key: 'lastPrayer', x: 2, y: 1, requires: [req('oldScars')] },

    // --- FÚRIA ---
    { id: 'berserkDraught', branch: 'wrath', kind: 'relic', key: 'berserkDraught', x: 0, y: 0, requires: [] },
    { id: 'thornCrown', branch: 'wrath', kind: 'relic', key: 'thornCrown', x: 1, y: 0, requires: [req('berserkDraught')] },
    { id: 'furyStone', branch: 'wrath', kind: 'relic', key: 'furyStone', x: 2, y: 0, requires: [req('thornCrown')] },
    { id: 'smolderingRage', branch: 'wrath', kind: 'relic', key: 'smolderingRage', x: 3, y: 0, requires: [req('furyStone')] },
    { id: 'whetstone', branch: 'wrath', kind: 'relic', key: 'whetstone', x: 0, y: 1, requires: [] },
    { id: 'hunterMark', branch: 'wrath', kind: 'relic', key: 'hunterMark', x: 1, y: 1, requires: [req('whetstone')] },
    { id: 'boneCharm', branch: 'wrath', kind: 'relic', key: 'boneCharm', x: 2, y: 1, requires: [req('hunterMark')] },
    { id: 'wornBoots', branch: 'wrath', kind: 'relic', key: 'wornBoots', x: 3, y: 1, requires: [req('boneCharm')] }
];

export const RELIC_BY_ID = Object.fromEntries(RELIC_NODES.map(node => [node.id, node]));

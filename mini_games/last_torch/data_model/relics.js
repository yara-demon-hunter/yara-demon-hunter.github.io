// --- ÁRVORE DE RELÍQUIAS ---
// Aparece no acampamento. Cada nó é uma relíquia de data_model/passives.js (kind 'relic'), comprada com OURO
// (preço base em passives.js, corrigido pela hora em data_model/passives.js > CAMP). Os pré-requisitos
// seguram as relíquias mais fortes para depois das mais simples. Mesmas coordenadas da árvore de skills.
export const RELIC_LAYOUT = {
    labelWidth: 1.5,
    tiers: 4,
    rows: 2,
    branchGap: 0.45
};

export const RELIC_BRANCHES = {
    fortune: { name: 'FORTUNE', icon: '💰', color: '#fcd34d' },
    ward: { name: 'WARD', icon: '🛡️', color: '#6ee7b7' },
    wrath: { name: 'WRATH', icon: '😈', color: '#fb7185' }
};

export const RELIC_NODES = [
    // --- FORTUNA ---
    { id: 'greedyIdol', branch: 'fortune', kind: 'relic', key: 'greedyIdol', x: 0, y: 0, requires: [] },
    { id: 'luckyCoin', branch: 'fortune', kind: 'relic', key: 'luckyCoin', x: 1, y: 0, requires: ['greedyIdol'] },
    { id: 'witchEye', branch: 'fortune', kind: 'relic', key: 'witchEye', x: 2, y: 0, requires: ['luckyCoin'] },

    // --- PROTEÇÃO ---
    { id: 'emberFlask', branch: 'ward', kind: 'relic', key: 'emberFlask', x: 0, y: 0, requires: [] },
    { id: 'warmCloak', branch: 'ward', kind: 'relic', key: 'warmCloak', x: 1, y: 0, requires: ['emberFlask'] },
    { id: 'ironHeart', branch: 'ward', kind: 'relic', key: 'ironHeart', x: 2, y: 0, requires: ['warmCloak'] },
    { id: 'secondPrayer', branch: 'ward', kind: 'relic', key: 'secondPrayer', x: 3, y: 0, requires: ['ironHeart'] },

    // --- FÚRIA ---
    { id: 'berserkDraught', branch: 'wrath', kind: 'relic', key: 'berserkDraught', x: 0, y: 0, requires: [] },
    { id: 'thornCrown', branch: 'wrath', kind: 'relic', key: 'thornCrown', x: 1, y: 0, requires: ['berserkDraught'] },
    { id: 'furyStone', branch: 'wrath', kind: 'relic', key: 'furyStone', x: 2, y: 0, requires: ['thornCrown'] },
    { id: 'hunterMark', branch: 'wrath', kind: 'relic', key: 'hunterMark', x: 1, y: 1, requires: ['berserkDraught'] },
    { id: 'boneCharm', branch: 'wrath', kind: 'relic', key: 'boneCharm', x: 2, y: 1, requires: ['hunterMark'] }
];

export const RELIC_BY_ID = Object.fromEntries(RELIC_NODES.map(node => [node.id, node]));

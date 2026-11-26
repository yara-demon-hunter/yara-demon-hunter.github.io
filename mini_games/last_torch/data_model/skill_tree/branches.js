// --- RAMOS (caminhos) DA ÁRVORE: nome, cor, ícone, layout da tela e afinidade dos heróis ---
export const TREE_LAYOUT = {
    labelWidth: 1.5,            // coluna do nome do ramo, em células
    tiers: 6,
    branchGap: 0.3
};

// Afinidade do herói (affinity no arquivo dele): as skills desse ramo dão este tanto a mais de dano
export const AFFINITY_BONUS = 0.05;
// Quem tem affinityMods (o Rowan: raízes seguram mais) troca o +5% de dano por esses modificadores; affinityLabel é o texto curto dele
export const affinityLabel = (hero) => hero.affinityLabel ?? `+${Math.round(AFFINITY_BONUS * 100)}%`;

export const TREE_BRANCHES = {
    blade: { name: 'BLADE', path: 'BLADE PATH', icon: '🤺', color: '#f87171', style: 'Warrior: raw strength, kill everything.' },
    shadow: { name: 'SHADOW', path: 'SHADOW PATH', icon: '🌑', color: '#a5b4fc', style: 'Thief: technical and cheap, takes skill.' },
    flame: { name: 'FLAME', path: 'FLAME PATH', icon: '🕯️', color: '#fb923c', style: 'Keeper: defensive, calm and cautious.' },
    curse: { name: 'CURSE', path: 'CURSE PATH', icon: '🌙', color: '#e879f9', style: 'Sorcerer: spells, area and distance.' },
    nature: { name: 'NATURE', path: 'NATURE PATH', icon: '🌿', color: '#4ade80', style: 'Druid: roots, life drain and living cover.' },
    light: { name: 'LIGHT', path: 'LIGHT PATH', icon: '✝️', color: '#fde68a', style: 'Priest: holy ground, blessed water and divine wrath.' }
};

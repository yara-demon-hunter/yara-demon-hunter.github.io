// --- ATRIBUTOS E UPGRADES DA LOJA ---
// skill 'slashArc' agora é upável até Nível 6 (180 graus max)
const ATTRIBUTE_MODELS = {
    damage: { name: 'Dano da Lâmina', icon: '⚔️', lvl: 1, maxLvl: 99, baseCost: 10, costMult: 1.5, desc: 'Aumenta o dano base de cada golpe.' },
    radius: { name: 'Alcance do Ataque', icon: '⭕', lvl: 1, maxLvl: 99, baseCost: 12, costMult: 1.6, desc: 'Aumenta o raio de detecção de alvos.' },
    slashArc: { name: 'Amplitude do Corte', icon: '📐', lvl: 1, maxLvl: 6, baseCost: 15, costMult: 1.8, desc: 'Aumenta a abertura do corte (Nv. 1: 40° até Nv. Max: 180°).' },
    atkSpeed: { name: 'Velocidade de Ataque', icon: '⚡', lvl: 1, maxLvl: 99, baseCost: 15, costMult: 1.5, desc: 'Reduz o tempo de recarga entre golpes.' },
    moveSpeed: { name: 'Velocidade de Movimento', icon: '🚀', lvl: 1, maxLvl: 99, baseCost: 10, costMult: 1.4, desc: 'Acelera a movimentação do personagem.' },
    frenzyNova: { name: 'Frenzy Nova (Skill)', icon: '🔥', lvl: 1, maxLvl: 99, baseCost: 20, costMult: 1.8, desc: 'Aumenta a duração e o dano do especial automático.' },
    playerHp: { name: 'Vida do Herói', icon: '❤️', lvl: 1, maxLvl: 99, baseCost: 12, costMult: 1.5, desc: 'Aumenta a vida máxima e cura o personagem.' },
    knockback: { name: 'Força de Empurrão', icon: '💥', lvl: 1, maxLvl: 99, baseCost: 10, costMult: 1.4, desc: 'Aumenta o empurrão ao acertar os alvos.' }
};


export function createAttributes() {
    return Object.fromEntries(
        Object.entries(ATTRIBUTE_MODELS).map(([key, attribute]) => [key, { ...attribute }])
    );
}

export function createPlayerState() {
    return {
        x: 0, y: 0,
        targetX: 0, targetY: 0,
        angle: 0,
        attackTimer: 0,
        hp: 100,
        maxHp: 100,
        iFrames: 0,
        comboStep: 1,
        shieldTimer: 0,
        doubleDmgTimer: 0,
        trail: []
    };
}

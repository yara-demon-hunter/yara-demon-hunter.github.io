// --- A NOITE ---
// Uma partida é uma noite de `hours` horas. Cada hora fecha ao somar os pontos da hora (ou ao matar
// o boss dela) e termina no acampamento. Sobreviver à última hora traz o amanhecer (vitória).
export const NIGHT = {
    hours: 12,
    lastStandSeconds: 25,       // cota fechada: tempo para matar os monstros que sobraram; depois a onda de fogo apaga o resto
    clearSeconds: 4,            // tela limpa: tempo máximo para pegar os itens do chão antes do acampamento
    clearMinSeconds: 1.6,       // sem itens no chão, a transição acaba aqui (a onda e o título precisam desse tempo)
    clearWaveSpeed: 1250,       // velocidade da onda que sai da tocha (unidades por segundo)
    dawnSeconds: 5.5,           // animação do amanhecer antes da tela de vitória
    openingMonsters: 3,         // monstros que já nascem perto no início da hora (a ação começa na hora)
    openingRadius: 300,         // distância da tocha em que eles nascem
    bossDelaySeconds: 2.4       // tempo entre o aviso do boss e ele surgir
};

export const HOUR_NAMES = [
    'Dusk', 'First Dark', 'The Hush', 'Blood Hour',
    'Cold Hour', 'Deep Dark', 'Witching Hour', 'The Long Dark',
    'Dead Hour', 'Hollow Hour', 'Last Dark', 'Before Dawn'
];

export function getHourName(hour) {
    return HOUR_NAMES[hour - 1] ?? 'Endless Dark';
}

// --- HORDAS ---
// Eventos dentro da hora, para quebrar o ritmo. kind: ring (círculo fechando em volta do herói),
// wall (parede vindo de um lado), swarm (bando apertado de um canto), grave (brotam do chão perto do herói).
export const HORDES = {
    boneWall: { kind: 'wall', type: 'SKELETON', minHour: 1, baseCount: 3, perHour: 0.6, banner: 'THE DEAD MARCH' },
    batRing: { kind: 'ring', type: 'BAT', minHour: 2, baseCount: 5, perHour: 0.7, banner: 'THE SKY IS MOVING' },
    mothSwarm: { kind: 'swarm', type: 'MOTH', minHour: 5, baseCount: 3, perHour: 0.4, banner: 'MOTHS TO THE FLAME' },
    graveRise: { kind: 'grave', type: 'SKELETON', minHour: 3, baseCount: 3, perHour: 0.45, banner: 'THE GROUND OPENS' },
    plague: { kind: 'wall', type: 'BLOATER', minHour: 7, baseCount: 2, perHour: 0.2, banner: 'PLAGUE ON THE WIND' },
    coven: { kind: 'ring', type: 'WITCH', minHour: 7, baseCount: 2, perHour: 0.2, banner: 'A COVEN GATHERS' }
};

// Momentos da hora (fração dos pontos) em que entram as hordas e os elites
export const HOUR_EVENTS = {
    hordeMoments: [[0.5], [0.35, 0.75], [0.25, 0.55, 0.8]],     // 1 horda, 2 ou 3, conforme a hora avança
    twoHordesFromHour: 3,
    threeHordesFromHour: 8,
    eliteMoment: 0.6,
    firstEliteHour: 2,
    secondEliteHour: 7,
    secondEliteMoment: 0.3
};

// --- PRESSÁGIOS ---
// Mudam a hora seguinte (mostrados no acampamento): um risco com recompensa, para nenhuma noite ser igual.
// mods: mesmas chaves de js/systems/modifiers.js
export const OMENS = {
    bloodMoon: { name: 'Blood Moon', icon: '🌕', desc: 'Monsters move 15% faster. +40% gold.', mods: { enemySpeed: 0.15, gold: 0.4 } },
    harvestMoon: { name: 'Harvest Moon', icon: '🌾', desc: 'Monsters have +20% health. +50% XP.', mods: { enemyHp: 0.2, xp: 0.5 } },
    theSwarm: { name: 'The Swarm', icon: '🦇', desc: '+40% monsters, but with -25% health.', mods: { spawnRate: 0.4, enemyHp: -0.25 } },
    fallingEmbers: { name: 'Falling Embers', icon: '🌠', desc: 'Pickups drop twice as often.', mods: { pickupRate: 1 } },
    sharpNight: { name: 'Sharp Night', icon: '🗡️', desc: 'Everyone hits 25% harder.', mods: { damage: 0.25, enemyDamage: 0.25 } },
    stillAir: { name: 'Still Air', icon: '🍃', desc: 'Monsters move 12% slower.', mods: { enemySpeed: -0.12 } }
};
export const OMEN_SPAWNING = { firstHour: 3, chance: 0.6 };

// --- NÍVEIS DE ESCURIDÃO ---
// Liberados ao vencer a noite: tudo fica mais duro e as brasas valem mais.
export const DARKNESS = {
    maxLevel: 8,
    enemyHpPerLevel: 0.28,
    enemyDamagePerLevel: 0.12,
    enemySpeedPerLevel: 0.03,
    embersPerLevel: 0.3
};

// Sorteia as hordas da hora (uma de cada tipo, entre as já liberadas)
export function rollHourHordes(hour, random = Math.random) {
    const moments = HOUR_EVENTS.hordeMoments[hour >= HOUR_EVENTS.threeHordesFromHour ? 2 : hour >= HOUR_EVENTS.twoHordesFromHour ? 1 : 0];
    const available = Object.keys(HORDES).filter(key => HORDES[key].minHour <= hour);
    return moments.map(at => {
        const key = available.splice(Math.floor(random() * available.length), 1)[0] ?? 'boneWall';
        const horde = HORDES[key];
        return { at, key, ...horde, count: Math.round(horde.baseCount + (hour - horde.minHour) * horde.perHour), fired: false };
    });
}

export function rollOmen(hour, random = Math.random) {
    if (hour < OMEN_SPAWNING.firstHour || random() > OMEN_SPAWNING.chance) return null;
    const keys = Object.keys(OMENS);
    return OMENS[keys[Math.floor(random() * keys.length)]];
}

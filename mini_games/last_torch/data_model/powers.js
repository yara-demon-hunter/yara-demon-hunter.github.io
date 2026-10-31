// --- PODERES ---
// Aprendidos na árvore de skills (data_model/tree.js). Cada um tem 5 níveis.
// damage = fração do dano da lâmina. Os dados de cada nível ficam em `levels`.
// O ramo de cada poder está em data_model/tree.js; o conceito, em SKILLS.md.
export const POWER_MODELS = {
    orbitBlades: {
        name: 'Spectral Blades', icon: '🗡️', maxLvl: 5,
        desc: 'Ghost daggers circle you and cut whatever they touch.',
        upgrades: ['2 orbiting blades', '+1 blade', '+35% damage', '+1 blade', '+1 blade, wider orbit'],
        levels: [
            { count: 2, damage: 0.55, radius: 66 },
            { count: 3, damage: 0.55, radius: 66 },
            { count: 3, damage: 0.75, radius: 72 },
            { count: 4, damage: 0.75, radius: 72 },
            { count: 5, damage: 0.85, radius: 86 }
        ],
        spin: 3.4, hitCooldown: 0.42, bladeRadius: 12, knockback: 70
    },
    emberTrail: {
        name: 'Ember Steps', icon: '👣', maxLvl: 5,
        desc: 'Your footsteps catch fire. Monsters that cross them burn.',
        upgrades: ['Burning footprints', '+40% burn', 'Fires last longer', '+40% burn', 'Wider flames'],
        levels: [
            { dps: 0.35, life: 2.2, radius: 20 },
            { dps: 0.5, life: 2.2, radius: 20 },
            { dps: 0.5, life: 3.2, radius: 22 },
            { dps: 0.7, life: 3.2, radius: 22 },
            { dps: 0.7, life: 3.6, radius: 30 }
        ],
        dropEvery: 34, tickSeconds: 0.3, maxFires: 22
    },
    bloodEdge: {
        name: 'Blood Edge', icon: '🩸', maxLvl: 5,
        desc: 'Every kill feeds you.',
        upgrades: ['Heal 1 per kill', 'Heal 1.5 per kill', 'Heal 2 per kill', 'Heal 2.5 per kill', 'Heal 3 per kill'],
        levels: [{ heal: 1 }, { heal: 1.5 }, { heal: 2 }, { heal: 2.5 }, { heal: 3 }]
    },
    keenEye: {
        name: 'Keen Eye', icon: '👁️', maxLvl: 5,
        desc: 'You see the weak point. +7% crit chance, +25% crit damage per level.',
        upgrades: ['+7% crit, +25% crit damage', 'Sharper', 'Sharper', 'Sharper', 'Lethal'],
        levels: [{}, {}, {}, {}, {}],
        mods: { critChance: 0.07, critDamage: 0.25 }
    },
    ricochet: {
        name: 'Ricochet', icon: '🎯', maxLvl: 5,
        desc: 'Daggers bounce to the next monster after a hit.',
        upgrades: ['1 bounce', '2 bounces', '+25% dagger damage', '3 bounces', '4 bounces'],
        levels: [
            { bounces: 1, damage: 0 },
            { bounces: 2, damage: 0 },
            { bounces: 2, damage: 0.25 },
            { bounces: 3, damage: 0.25 },
            { bounces: 4, damage: 0.25 }
        ],
        bounceRange: 240
    },
    deathMark: {
        name: 'Death Mark', icon: '❌', maxLvl: 5,
        desc: 'Daggers mark monsters. Your blade detonates the mark. Dashing through it hits harder and gives the dash back.',
        upgrades: ['Marks detonate for 160% damage', '220% damage', 'Blast hits nearby monsters', '300% damage', '360% damage, wider blast'],
        levels: [
            { seconds: 4, damage: 1.6, splash: 0 },
            { seconds: 4, damage: 2.2, splash: 0 },
            { seconds: 5, damage: 2.2, splash: 80 },
            { seconds: 5, damage: 3, splash: 80 },
            { seconds: 6, damage: 3.6, splash: 110 }
        ],
        dashMultiplier: 1.6     // detonar com o dash em vez da lâmina
    },
    soulLance: {
        name: 'Soul Lance', icon: '🌟', maxLvl: 5,
        desc: 'Hold the dagger button to charge. The longer you hold, the harder it hits and the more monsters it pierces.',
        upgrades: ['Up to +100% damage, pierces 2', '+50% charged damage', 'Pierces 3', 'Charges faster', '+100% damage, pierces 5'],
        // seconds = tempo até a carga cheia; damage = bônus de dano na carga cheia; pierces = monstros atravessados
        levels: [
            { seconds: 1.2, damage: 1, pierces: 2 },
            { seconds: 1.2, damage: 1.5, pierces: 2 },
            { seconds: 1.2, damage: 1.5, pierces: 3 },
            { seconds: 0.85, damage: 1.5, pierces: 3 },
            { seconds: 0.85, damage: 2.5, pierces: 5 }
        ],
        minCharge: 0.25,        // abaixo desta fração é um arremesso normal (toque rápido)
        maxScale: 1.7           // tamanho da adaga na carga cheia
    },
    torchBolts: {
        name: 'Flame Sentinel', icon: '🔥', maxLvl: 5,
        desc: 'The torch itself fires at whatever comes close.',
        upgrades: ['One bolt', 'Fires faster', '2 bolts at once', '+40% damage', '3 bolts at once'],
        levels: [
            { cooldown: 2.1, count: 1, damage: 1 },
            { cooldown: 1.5, count: 1, damage: 1 },
            { cooldown: 1.5, count: 2, damage: 1 },
            { cooldown: 1.5, count: 2, damage: 1.4 },
            { cooldown: 1.3, count: 3, damage: 1.4 }
        ],
        range: 360, speed: 420, turnRate: 7, radius: 6
    },
    soulNova: {
        name: 'Soul Nova', icon: '💫', maxLvl: 5,
        desc: 'A pulse of force bursts from you, hurling monsters away.',
        upgrades: ['Pulse every 7s', '+30% radius', 'Every 5.5s', '+50% damage', 'Every 4.5s'],
        levels: [
            { cooldown: 7, radius: 130, damage: 1.2 },
            { cooldown: 7, radius: 170, damage: 1.2 },
            { cooldown: 5.5, radius: 170, damage: 1.2 },
            { cooldown: 5.5, radius: 170, damage: 1.8 },
            { cooldown: 4.5, radius: 200, damage: 1.8 }
        ],
        knockback: 520
    },
    corpseBurst: {
        name: 'Corpse Burst', icon: '💥', maxLvl: 5,
        desc: 'Slain monsters may explode, and explosions can chain.',
        upgrades: ['20% chance', '30% chance', 'Bigger blasts', '40% chance', '50% chance, bigger blasts'],
        levels: [
            { chance: 0.2, radius: 62, damage: 1 },
            { chance: 0.3, radius: 62, damage: 1 },
            { chance: 0.3, radius: 80, damage: 1.2 },
            { chance: 0.4, radius: 80, damage: 1.2 },
            { chance: 0.5, radius: 96, damage: 1.5 }
        ],
        knockback: 240
    },
    chainLightning: {
        name: 'Storm Sigil', icon: '⚡', maxLvl: 5,
        desc: 'Lightning leaps from monster to monster.',
        upgrades: ['Strikes 3 targets', 'Strikes 5 targets', 'Strikes faster', '+40% damage', 'Strikes 8 targets'],
        levels: [
            { cooldown: 3, jumps: 3, damage: 0.9 },
            { cooldown: 3, jumps: 5, damage: 0.9 },
            { cooldown: 2.2, jumps: 5, damage: 0.9 },
            { cooldown: 2.2, jumps: 5, damage: 1.25 },
            { cooldown: 1.9, jumps: 8, damage: 1.25 }
        ],
        range: 300, jumpRange: 170
    },
    chillAura: {
        name: 'Cold Moon', icon: '❄️', maxLvl: 5,
        desc: 'Monsters near you slow down and freeze over.',
        upgrades: ['25% slow nearby', '+30% radius', '35% slow', '+30% radius', '45% slow'],
        levels: [
            { slow: 0.25, radius: 120, dps: 0.12 },
            { slow: 0.25, radius: 155, dps: 0.12 },
            { slow: 0.35, radius: 155, dps: 0.2 },
            { slow: 0.35, radius: 195, dps: 0.2 },
            { slow: 0.45, radius: 195, dps: 0.3 }
        ]
    },
    starfall: {
        name: 'Starfall', icon: '🌠', maxLvl: 5,
        desc: 'Stars fall on the monsters, crushing everything around the impact.',
        upgrades: ['1 star every 5s', '2 stars', 'Bigger impact', '3 stars', '4 stars, heavier'],
        levels: [
            { cooldown: 5, count: 1, radius: 74, damage: 2.4 },
            { cooldown: 5, count: 2, radius: 74, damage: 2.4 },
            { cooldown: 5, count: 2, radius: 96, damage: 2.4 },
            { cooldown: 4.5, count: 3, radius: 96, damage: 2.4 },
            { cooldown: 4, count: 4, radius: 104, damage: 3.2 }
        ],
        fallSeconds: 0.6, knockback: 200
    },
    bloodlust: {
        name: 'Bloodlust', icon: '🐺', maxLvl: 5,
        desc: 'Every kill feeds the hunger: your blade hits harder and faster until the killing stops.',
        upgrades: ['6 stacks: +3% damage, +2% speed each', '8 stacks', '+4% damage per stack', '11 stacks, they last longer', '+5% damage, +3% speed per stack'],
        levels: [
            { stacks: 6, damage: 0.03, speed: 0.02, seconds: 3 },
            { stacks: 8, damage: 0.03, speed: 0.02, seconds: 3 },
            { stacks: 8, damage: 0.04, speed: 0.02, seconds: 3 },
            { stacks: 11, damage: 0.04, speed: 0.02, seconds: 4 },
            { stacks: 11, damage: 0.05, speed: 0.03, seconds: 4 }
        ],
        decaySeconds: 0.4       // tempo acabou: perde uma carga a cada decaySeconds
    },
    earthbreaker: {
        name: 'Earthbreaker', icon: '🔨', maxLvl: 5,
        desc: 'When monsters get close you leap and smash the ground, crushing and stunning everything around you.',
        upgrades: ['Slam every 9s', '+25% radius', 'Every 7.5s', '+50% damage', 'Every 6s, wider'],
        levels: [
            { cooldown: 9, radius: 105, damage: 2.4 },
            { cooldown: 9, radius: 130, damage: 2.4 },
            { cooldown: 7.5, radius: 130, damage: 2.4 },
            { cooldown: 7.5, radius: 130, damage: 3.6 },
            { cooldown: 6, radius: 155, damage: 3.6 }
        ],
        stunSeconds: 0.7, knockback: 420
    },
    fireRing: {
        name: 'Hearth Ring', icon: '🔆', maxLvl: 5,
        desc: 'A circle of fire guards the torch. Monsters that cross it burn and slow down.',
        upgrades: ['Burns and slows 30%', '+50% burn', 'Wider, slows 40%', '+45% burn', 'Widest, slows 50%'],
        levels: [
            { radius: 150, dps: 0.35, slow: 0.3 },
            { radius: 150, dps: 0.5, slow: 0.3 },
            { radius: 170, dps: 0.5, slow: 0.4 },
            { radius: 170, dps: 0.75, slow: 0.4 },
            { radius: 190, dps: 1, slow: 0.5 }
        ],
        width: 24, tickSeconds: 0.3
    },
    graveWisp: {
        name: 'Grave Wisp', icon: '💀', maxLvl: 5,
        desc: 'A burning skull floats at your shoulder and shoots monsters from far away.',
        upgrades: ['One bolt every 1.8s', 'Every 1.4s', '2 bolts at once', '+35% damage', '3 bolts, every 1.2s'],
        levels: [
            { cooldown: 1.8, count: 1, damage: 1.2 },
            { cooldown: 1.4, count: 1, damage: 1.2 },
            { cooldown: 1.4, count: 2, damage: 1.2 },
            { cooldown: 1.4, count: 2, damage: 1.6 },
            { cooldown: 1.2, count: 3, damage: 1.6 }
        ],
        range: 460, speed: 380, turnRate: 6
    },
    creepingHex: {
        name: 'Creeping Hex', icon: '🕸️', maxLvl: 5,
        desc: 'A curse eats a monster alive. When it dies, the curse jumps to the ones around it.',
        upgrades: ['Jumps to 2 monsters', '+40% curse damage', 'Jumps to 3, lasts longer', 'Casts faster, +40% damage', 'Jumps to 4, casts faster'],
        levels: [
            { cooldown: 5, dps: 0.9, seconds: 5, spread: 2 },
            { cooldown: 5, dps: 1.25, seconds: 5, spread: 2 },
            { cooldown: 5, dps: 1.25, seconds: 6, spread: 3 },
            { cooldown: 4, dps: 1.75, seconds: 6, spread: 3 },
            { cooldown: 3.5, dps: 2.2, seconds: 7, spread: 4 }
        ],
        range: 380, spreadRange: 170, tickSeconds: 0.5
    },
    voidRift: {
        name: 'Void Rift', icon: '🕳️', maxLvl: 5,
        desc: 'A rift opens in the thickest part of the horde, drags everything in and collapses.',
        upgrades: ['Rift every 10s', '+30% pull', 'Every 8s', '+50% damage', 'Every 6.5s, wider'],
        levels: [
            { cooldown: 10, radius: 125, pull: 150, damage: 3, seconds: 1.3 },
            { cooldown: 10, radius: 125, pull: 195, damage: 3, seconds: 1.3 },
            { cooldown: 8, radius: 125, pull: 195, damage: 3, seconds: 1.3 },
            { cooldown: 8, radius: 125, pull: 195, damage: 4.5, seconds: 1.3 },
            { cooldown: 6.5, radius: 150, pull: 220, damage: 4.5, seconds: 1.3 }
        ],
        reach: 1.7,             // atrai até reach x radius do centro
        knockback: 110
    },
    phantomDash: {
        name: 'Phantom Rush', icon: '👻', maxLvl: 5,
        desc: 'Your dash cuts through everything in its path.',
        upgrades: ['Dash deals damage', '-15% dash cooldown', '+1 dash charge', '+60% damage', '-15% dash cooldown'],
        levels: [
            { damage: 1.5 },
            { damage: 1.5, mods: { dashCooldown: 0.15 } },
            { damage: 1.5, mods: { dashCooldown: 0.15, dashCharges: 1 } },
            { damage: 2.4, mods: { dashCooldown: 0.15, dashCharges: 1 } },
            { damage: 2.4, mods: { dashCooldown: 0.3, dashCharges: 1 } }
        ]
    }
};

// --- EVOLUÇÕES ---
// Poder no nível máximo + requisitos do nó de evolução (data_model/tree.js) = transforma o poder.
export const EVOLUTIONS = {
    orbitBlades: {
        name: 'Blade Tempest', icon: '🌪️',
        desc: 'Eight blades in a wide storm, and they hit far harder.',
        levels: { count: 8, damage: 1.1, radius: 104 }
    },
    emberTrail: {
        name: 'Hellwalker', icon: '☄️',
        desc: 'Great pillars of fire rise from every step you take.',
        levels: { dps: 1.3, life: 4.5, radius: 42 }
    },
    bloodlust: {
        name: 'Crimson Tide', icon: '🌊',
        desc: 'With the hunger high, every swing throws a crescent of blood through the horde.',
        levels: { stacks: 14, damage: 0.05, speed: 0.03, seconds: 5 },
        crescent: { minStacks: 5, damage: 0.7, speed: 560, range: 340, radius: 26 }
    },
    earthbreaker: {
        name: 'Cataclysm', icon: '🌋',
        desc: 'Each slam splits the earth: aftershocks roll out and lava bursts through the cracks.',
        levels: { cooldown: 5, radius: 180, damage: 4.5 },
        aftershocks: 2, aftershockSeconds: 0.24, aftershockStep: 70, aftershockDamage: 0.5,
        lava: { count: 7, life: 3, radius: 24, dps: 1 }
    },
    fireRing: {
        name: 'Solar Wall', icon: '🌅',
        desc: 'The ring becomes a wall of white fire that flares every few seconds, hurling monsters back.',
        levels: { radius: 200, dps: 1.3, slow: 0.55 },
        flare: { seconds: 4.5, damage: 1.5, knockback: 520, reach: 46 }
    },
    voidRift: {
        name: 'Event Horizon', icon: '🌌',
        desc: 'The rift swallows far more, and tears open a second time where it fell.',
        levels: { cooldown: 7, radius: 190, pull: 280, damage: 4.5, seconds: 1.5 },
        secondRift: { seconds: 0.7, damage: 0.6 }
    },
    phantomDash: {
        name: 'Night Reaper', icon: '🌘',
        desc: 'Your shadow runs after every dash and cuts the same path again.',
        levels: { damage: 3 },
        echo: { delaySeconds: 0.28, seconds: 0.16, damage: 0.8, hitRadius: 26 }
    },
    soulLance: {
        name: 'Soul Spear', icon: '✨',
        desc: 'Charges in a blink. A full charge pierces everything in its path.',
        levels: { seconds: 0.6, damage: 2.6, pierces: 99 }
    },
    corpseBurst: {
        name: 'Red Harvest', icon: '🥀',
        desc: 'Every kill explodes. Every blast heals you.',
        levels: { chance: 1, radius: 110, damage: 1.7 }
    },
    chainLightning: {
        name: 'Wrath of Heaven', icon: '🌩️',
        desc: 'Lightning strikes on every critical hit.',
        levels: { cooldown: 1.9, jumps: 8, damage: 1.3 }
    },
    soulNova: {
        name: 'Absolute Zero', icon: '🧊',
        desc: 'Your pulse freezes everything it touches solid.',
        levels: { cooldown: 4, radius: 250, damage: 2.2 },
        freezeSeconds: 1.6
    },
    torchBolts: {
        name: 'Sun Spire', icon: '☀️',
        desc: 'The torch becomes a sun, raining fire across the clearing.',
        levels: { cooldown: 0.8, count: 5, damage: 1.7 }
    }
};

export function createPowers() {
    return Object.fromEntries(
        Object.entries(POWER_MODELS).map(([key, model]) => [key, { ...model, key, lvl: 0, evolved: false }])
    );
}

// Dados do nível atual de um poder (já com a evolução, se tiver)
export function getPowerLevel(power) {
    if (power.lvl <= 0) return null;
    const base = POWER_MODELS[power.key].levels[power.lvl - 1];
    return power.evolved ? { ...base, ...EVOLUTIONS[power.key].levels } : base;
}

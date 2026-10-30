// --- PODERES ---
// Aprendidos na árvore de skills (data_model/tree.js). Cada um tem 5 níveis.
// Os que têm `unlock` só entram no sorteio depois de ganhos nos Trials (data_model/achievements.js).
// damage = fração do dano da lâmina. Os dados de cada nível ficam em `levels`.
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
    soulMagnet: {
        name: 'Soul Lure', icon: '🧲', maxLvl: 5,
        desc: 'Gold rushes to you from farther away. +7% XP per level.',
        upgrades: ['+60% pickup range', '+60% pickup range', '+60% pickup range', '+60% pickup range', 'Everything comes to you'],
        levels: [{}, {}, {}, {}, {}],
        mods: { magnet: 0.6, xp: 0.07 }
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
        name: 'Soul Nova', icon: '💫', maxLvl: 5, unlock: true,
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
        name: 'Corpse Burst', icon: '💥', maxLvl: 5, unlock: true,
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
        name: 'Storm Sigil', icon: '⚡', maxLvl: 5, unlock: true,
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
        name: 'Cold Moon', icon: '❄️', maxLvl: 5, unlock: true,
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
        name: 'Starfall', icon: '🌠', maxLvl: 5, unlock: true,
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
    phantomDash: {
        name: 'Phantom Rush', icon: '👻', maxLvl: 5, unlock: true,
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
// Poder no nível máximo + requisito = carta dourada garantida, que transforma o poder.
// need: { power: key, lvl } exige outro poder; { stat: key, lvl } exige um stat; { passive: key } exige uma relíquia.
export const EVOLUTIONS = {
    orbitBlades: {
        name: 'Blade Tempest', icon: '🌪️', need: { stat: 'damage', lvl: 5 }, needText: 'Blade Damage Lv. 5',
        desc: 'Eight blades in a wide storm, and they hit far harder.',
        levels: { count: 8, damage: 1.1, radius: 104 }
    },
    emberTrail: {
        name: 'Hellwalker', icon: '☄️', need: { stat: 'moveSpeed', lvl: 4 }, needText: 'Move Speed Lv. 4',
        desc: 'Great pillars of fire rise from every step you take.',
        levels: { dps: 1.3, life: 4.5, radius: 42 }
    },
    corpseBurst: {
        name: 'Red Harvest', icon: '🥀', need: { power: 'bloodEdge', lvl: 3 }, needText: 'Blood Edge Lv. 3',
        desc: 'Every kill explodes. Every blast heals you.',
        levels: { chance: 1, radius: 110, damage: 1.7 }
    },
    chainLightning: {
        name: 'Wrath of Heaven', icon: '🌩️', need: { power: 'keenEye', lvl: 3 }, needText: 'Keen Eye Lv. 3',
        desc: 'Lightning strikes on every critical hit.',
        levels: { cooldown: 1.4, jumps: 12, damage: 1.5 }
    },
    soulNova: {
        name: 'Absolute Zero', icon: '🧊', need: { power: 'chillAura', lvl: 3 }, needText: 'Cold Moon Lv. 3',
        desc: 'Your pulse freezes everything it touches solid.',
        levels: { cooldown: 4, radius: 250, damage: 2.2 },
        freezeSeconds: 1.6
    },
    torchBolts: {
        name: 'Sun Spire', icon: '☀️', need: { stat: 'frenzyNova', lvl: 4 }, needText: 'Fury Lv. 4',
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

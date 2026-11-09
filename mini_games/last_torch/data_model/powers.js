// --- PODERES ---
// Aprendidos na árvore de skills (data_model/tree.js). Cada um tem 5 níveis.
// damage = fração do dano da lâmina. Os dados de cada nível ficam em `levels`.
// O ramo de cada poder está em data_model/tree.js; o conceito, em SKILLS.md.
const formatPercent = (value) => `${Number((value * 100).toFixed(1))}%`;
const formatNumber = (value) => String(Number(value.toFixed(2)));
const formatMultiplier = (value) => `${formatNumber(value)}×`;

export const POWER_MODELS = {
    orbitBlades: {
        name: 'Spectral Blades', icon: '🗡️', maxLvl: 5,
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `${level.count} ghost daggers circle you, dealing ${formatMultiplier(level.damage)} blade damage within ${level.radius} range.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} blades · ${formatMultiplier(level.damage)} blade damage · ${level.radius} orbit range`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `Your footsteps leave fire that burns monsters for ${formatMultiplier(level.dps)} blade damage per second for ${formatNumber(level.life)}s. Inside the torch's warmth, your blade deals ${formatPercent(level.warmthDamage)} more damage.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${formatMultiplier(level.dps)} burn damage for ${formatNumber(level.life)}s · +${formatPercent(level.warmthDamage)} blade damage in the warmth · ${level.radius} fire radius`
            );
        },
        // warmthDamage = bônus de dano do herói dentro do calor da tocha (antigo Sacred Ground)
        levels: [
            { dps: 0.2, life: 2.2, radius: 20, warmthDamage: 0.08 },
            { dps: 0.3, life: 2.2, radius: 20, warmthDamage: 0.16 },
            { dps: 0.3, life: 3.2, radius: 22, warmthDamage: 0.24 },
            { dps: 0.4, life: 3.2, radius: 22, warmthDamage: 0.32 },
            { dps: 0.4, life: 3.6, radius: 30, warmthDamage: 0.4 }
        ],
        dropEvery: 34, tickSeconds: 0.3, maxFires: 22
    },
    bloodEdge: {
        name: 'Blood Edge', icon: '🩸', maxLvl: 5,
        get desc() {
            return `Each kill restores ${formatNumber(this.levels[this.levels.length - 1].heal)} health at max level.`;
        },
        get upgrades() {
            return this.levels.map(level => `Restore ${formatNumber(level.heal)} health per kill`);
        },
        levels: [{ heal: 0.4 }, { heal: 0.6 }, { heal: 0.8 }, { heal: 1 }, { heal: 1.2 }]
    },
    keenEye: {
        name: 'Keen Eye', icon: '👁️', maxLvl: 5,
        get desc() {
            return `Each level adds ${formatPercent(this.mods.critChance)} critical chance and ${formatPercent(this.mods.critDamage)} critical damage.`;
        },
        get upgrades() {
            return this.levels.map(() =>
                `+${formatPercent(this.mods.critChance)} critical chance · +${formatPercent(this.mods.critDamage)} critical damage`
            );
        },
        levels: [{}, {}, {}, {}, {}],
        mods: { critChance: 0.07, critDamage: 0.25 }
    },
    ricochet: {
        name: 'Ricochet', icon: '🎯', maxLvl: 5,
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `Your daggers bounce between up to ${level.bounces} monsters. At max level, they also deal ${formatPercent(level.damage)} more damage.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `Up to ${level.bounces} bounces · +${formatPercent(level.damage)} dagger damage`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `Daggers mark monsters for ${formatNumber(level.seconds)}s. Your blade detonates the mark for ${formatMultiplier(level.damage)} blade damage; dashing through deals ${formatMultiplier(this.dashMultiplier)} damage and restores the dash. At max level, the blast reaches ${level.splash}.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${formatMultiplier(level.damage)} blade damage · ${formatNumber(level.seconds)}s mark · ${level.splash ? `${level.splash} blast radius` : 'no splash'}`
            );
        },
        levels: [
            { seconds: 4, damage: 1.6, splash: 0 },
            { seconds: 4, damage: 2.2, splash: 0 },
            { seconds: 5, damage: 2.2, splash: 80 },
            { seconds: 5, damage: 3, splash: 80 },
            { seconds: 6, damage: 3.6, splash: 110 }
        ],
        dashMultiplier: 1.6     // detonar com o dash em vez da lâmina
    },
    shadowBond: {
        name: 'Umbral Bond', icon: '🖤', maxLvl: 5,
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `At max level, shadows gain ${formatPercent(level.hp)} health, ${formatPercent(level.damage)} damage, and ${level.area} more guard area around the torch.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `+${formatPercent(level.hp)} shadow health · +${formatPercent(level.damage)} damage · +${level.area} guard area`
            );
        },
        // Valores acumulados: hp e damage são bônus (fração), area soma ao raio de guarda (unidades do mundo)
        levels: [
            { hp: 0.25, damage: 0.3, area: 25 },
            { hp: 0.5, damage: 0.6, area: 50 },
            { hp: 0.75, damage: 0.9, area: 75 },
            { hp: 1, damage: 1.2, area: 100 },
            { hp: 1.25, damage: 1.5, area: 125 }
        ]
    },
    chargedThrow: {
        name: 'Charged Dagger Throw', icon: '🌟', maxLvl: 5,
        get desc() {
            const level = this.levels[this.levels.length - 1];
            const pierceText = level.pierces >= 99 ? 'all targets' : `${level.pierces} targets`;
            return `Hold the dagger button to charge it for up to ${formatNumber(level.seconds)}s. A fully charged dagger deals ${formatPercent(level.damage)} bonus damage and pierces ${pierceText}.`;
        },
        get upgrades() {
            return this.levels.map(level => {
                const pierceText = level.pierces >= 99 ? 'all targets' : `${level.pierces} targets`;
                return `${formatNumber(level.seconds)}s full charge · +${formatPercent(level.damage)} charged damage · pierces ${pierceText}`;
            });
        },
        // seconds = tempo até a carga cheia; damage = bônus de dano na carga cheia; pierces = monstros atravessados
        levels: [
            { seconds: 1.2, damage: 1, pierces: 2 },
            { seconds: 1.2, damage: 1.5, pierces: 2 },
            { seconds: 1.2, damage: 1.5, pierces: 3 },
            { seconds: 0.85, damage: 1.5, pierces: 3 },
            { seconds: 0.6, damage: 2.6, pierces: 99 }
        ],
        minCharge: 0.25,        // abaixo desta fração é um arremesso normal (toque rápido)
        maxScale: 1.7           // tamanho da adaga na carga cheia
    },
    torchBolts: {
        name: 'Flame Sentinel', icon: '🔥', maxLvl: 5,
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `The torch fires ${level.count} bolts every ${formatNumber(level.cooldown)}s, each dealing ${formatMultiplier(level.damage)} spell damage.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} bolts · every ${formatNumber(level.cooldown)}s · ${formatMultiplier(level.damage)} spell damage`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `A pulse bursts from you every ${formatNumber(level.cooldown)}s, dealing ${formatMultiplier(level.damage)} spell damage and hurling monsters within ${level.radius} range away.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `Pulse every ${formatNumber(level.cooldown)}s · ${level.radius} radius · ${formatMultiplier(level.damage)} spell damage`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `Slain monsters have a ${formatPercent(level.chance)} chance to explode, dealing ${formatMultiplier(level.damage)} spell damage within ${level.radius} range. Explosions can chain.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${formatPercent(level.chance)} chance · ${level.radius} blast radius · ${formatMultiplier(level.damage)} spell damage`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `Lightning strikes every ${formatNumber(level.cooldown)}s, leaping to ${level.jumps} targets and dealing ${formatMultiplier(level.damage)} spell damage.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${level.jumps} targets · every ${formatNumber(level.cooldown)}s · ${formatMultiplier(level.damage)} spell damage`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `Monsters within ${level.radius} range are slowed by ${formatPercent(level.slow)} and take ${formatMultiplier(level.dps)} spell damage per second.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${formatPercent(level.slow)} slow · ${level.radius} radius · ${formatMultiplier(level.dps)} spell damage per second`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `${level.count} stars fall every ${formatNumber(level.cooldown)}s, each crushing enemies within ${level.radius} range for ${formatMultiplier(level.damage)} spell damage.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} stars · every ${formatNumber(level.cooldown)}s · ${level.radius} impact radius · ${formatMultiplier(level.damage)} spell damage`
            );
        },
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
        get desc() {
            const strongest = this.levels[this.levels.length - 1];
            return `Every kill adds a stack, up to ${strongest.stacks}. At max level, each stack grants ${formatPercent(strongest.damage)} blade damage and ${formatPercent(strongest.speed)} attack speed. Stacks decay every ${formatNumber(this.decaySeconds)}s after the last kill.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${level.stacks} stacks max · +${formatPercent(level.damage)} blade damage and +${formatPercent(level.speed)} attack speed per stack`
            );
        },
        levels: [
            { stacks: 6, damage: 0.025, speed: 0.015, seconds: 2 },
            { stacks: 8, damage: 0.025, speed: 0.015, seconds: 2 },
            { stacks: 8, damage: 0.03, speed: 0.015, seconds: 2 },
            { stacks: 11, damage: 0.03, speed: 0.015, seconds: 2.5 },
            { stacks: 11, damage: 0.04, speed: 0.02, seconds: 2.5 }
        ],
        decaySeconds: 0.4       // tempo acabou: perde uma carga a cada decaySeconds
    },
    earthbreaker: {
        name: 'Earthbreaker', icon: '🔨', maxLvl: 5,
        get desc() {
            const strongest = this.levels[this.levels.length - 1];
            return `When monsters get close, you leap and smash the ground, dealing up to ${formatMultiplier(strongest.damage)} your blade damage within ${strongest.radius} range and stunning enemies for ${formatNumber(this.stunSeconds)}s.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `Slam every ${formatNumber(level.cooldown)}s · ${formatMultiplier(level.damage)} blade damage · ${level.radius} range`
            );
        },
        levels: [
            { cooldown: 9, radius: 105, damage: 2.4 },
            { cooldown: 9, radius: 130, damage: 2.4 },
            { cooldown: 7.5, radius: 130, damage: 2.4 },
            { cooldown: 7.5, radius: 130, damage: 3.2 },
            { cooldown: 6, radius: 155, damage: 3.2 }
        ],
        stunSeconds: 0.7, knockback: 420
    },
    fireRing: {
        name: 'Hearth Ring', icon: '🔆', maxLvl: 5,
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `A ring of fire protects the torch, burning enemies within ${level.radius} range for ${formatMultiplier(level.dps)} spell damage per second and slowing them by ${formatPercent(level.slow)}.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${level.radius} radius · ${formatMultiplier(level.dps)} spell damage per second · ${formatPercent(level.slow)} slow`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `A burning skull fires ${level.count} bolts every ${formatNumber(level.cooldown)}s from up to ${this.range} range, each dealing ${formatMultiplier(level.damage)} spell damage.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} bolts · every ${formatNumber(level.cooldown)}s · ${formatMultiplier(level.damage)} spell damage`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `A curse deals ${formatMultiplier(level.dps)} spell damage per second for ${formatNumber(level.seconds)}s. When its target dies, it spreads to ${level.spread} nearby monsters. Casts every ${formatNumber(level.cooldown)}s.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `${level.spread} spreads · ${formatMultiplier(level.dps)} spell damage per second · ${formatNumber(level.seconds)}s duration · every ${formatNumber(level.cooldown)}s`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `A rift opens every ${formatNumber(level.cooldown)}s, pulling enemies within ${level.radius} range with force ${level.pull} before collapsing for ${formatMultiplier(level.damage)} spell damage.`;
        },
        get upgrades() {
            return this.levels.map(level =>
                `Every ${formatNumber(level.cooldown)}s · ${level.radius} radius · ${level.pull} pull · ${formatMultiplier(level.damage)} spell damage · ${formatNumber(level.seconds)}s duration`
            );
        },
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
        get desc() {
            const level = this.levels[this.levels.length - 1];
            return `Your dash deals ${formatMultiplier(level.damage)} blade damage to enemies in its path.`;
        },
        get upgrades() {
            return this.levels.map(level => {
                const mods = level.mods ?? {};
                const details = [`${formatMultiplier(level.damage)} blade damage`];
                if (mods.dashCooldown) details.push(`${formatPercent(mods.dashCooldown)} shorter dash cooldown`);
                if (mods.dashCharges) details.push(`+${mods.dashCharges} dash charge`);
                return details.join(' · ');
            });
        },
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
    // Passiva que evolui (passives.shadowClone.evolved): count = sombras em guarda
    shadowClone: {
        name: 'Shadow Legion', icon: '🥷',
        get desc() {
            return `${this.levels.count} shadows guard the torch, each watching a different monster.`;
        },
        levels: { count: 3 }
    },
    orbitBlades: {
        name: 'Blade Tempest', icon: '🌪️',
        get desc() {
            const { count, damage, radius } = this.levels;
            return `${count} blades circle you, each dealing ${formatMultiplier(damage)} blade damage within ${radius} range.`;
        },
        levels: { count: 8, damage: 1.1, radius: 104 }
    },
    emberTrail: {
        name: 'Hellwalker', icon: '☄️',
        get desc() {
            const { dps, life, radius } = this.levels;
            return `Pillars of fire rise from your steps, burning enemies for ${formatMultiplier(dps)} blade damage per second for ${formatNumber(life)}s within ${radius} range.`;
        },
        levels: { dps: 0.7, life: 4, radius: 42 }
    },
    bloodlust: {
        name: 'Crimson Tide', icon: '🌊',
        get desc() {
            const { minStacks, damage, speed, range } = this.crescent;
            const { stacks, damage: stackDamage, speed: stackSpeed } = this.levels;
            return `At ${minStacks} or more stacks, every swing throws a blood crescent through the horde. At max level, each crescent deals ${formatMultiplier(damage)} blade damage; each stack grants ${formatPercent(stackDamage)} damage and ${formatPercent(stackSpeed)} attack speed, up to ${stacks} stacks. Range: ${range}.`;
        },
        levels: { stacks: 10, damage: 0.03, speed: 0.015, seconds: 3 },
        crescent: { minStacks: 5, damage: 0.55, speed: 560, range: 340, radius: 26 }
    },
    earthbreaker: {
        name: 'Cataclysm', icon: '🌋',
        get desc() {
            const { cooldown, radius, damage } = this.levels;
            return `Each slam every ${formatNumber(cooldown)}s deals ${formatMultiplier(damage)} blade damage within ${radius} range, followed by ${this.aftershocks} aftershocks at ${formatMultiplier(damage * this.aftershockDamage)} blade damage each. It also opens ${this.lava.count} lava cracks that burn for ${formatNumber(this.lava.life)}s.`;
        },
        levels: { cooldown: 5, radius: 180, damage: 3.8 },
        aftershocks: 2, aftershockSeconds: 0.24, aftershockStep: 70, aftershockDamage: 0.4,
        lava: { count: 7, life: 3, radius: 24, dps: 1 }
    },
    fireRing: {
        name: 'Solar Wall', icon: '🌅',
        get desc() {
            const { radius, dps, slow } = this.levels;
            return `The ring becomes a wall of white fire, burning for ${formatMultiplier(dps)} spell damage per second and slowing by ${formatPercent(slow)}. Every ${formatNumber(this.flare.seconds)}s it flares for ${formatMultiplier(this.flare.damage)} spell damage and knocks monsters back. Range: ${radius}.`;
        },
        levels: { radius: 200, dps: 1.3, slow: 0.55 },
        flare: { seconds: 4.5, damage: 1.5, knockback: 520, reach: 46 }
    },
    voidRift: {
        name: 'Event Horizon', icon: '🌌',
        get desc() {
            const { cooldown, radius, pull, damage, seconds } = this.levels;
            return `Every ${formatNumber(cooldown)}s, the rift pulls enemies within ${radius} range with force ${pull}, then collapses for ${formatMultiplier(damage)} spell damage. A second rift opens after ${formatNumber(this.secondRift.seconds)}s for ${formatMultiplier(this.secondRift.damage)} spell damage. The rift lasts ${formatNumber(seconds)}s.`;
        },
        levels: { cooldown: 7, radius: 190, pull: 280, damage: 4.5, seconds: 1.5 },
        secondRift: { seconds: 0.7, damage: 0.6 }
    },
    phantomDash: {
        name: 'Night Reaper', icon: '🌘',
        get desc() {
            return `After each dash, your shadow repeats the path after ${formatNumber(this.echo.delaySeconds)}s, dealing ${formatMultiplier(this.echo.damage)} blade damage to enemies within ${this.echo.hitRadius} range.`;
        },
        levels: { damage: 3 },
        echo: { delaySeconds: 0.28, seconds: 0.16, damage: 0.8, hitRadius: 26 }
    },
    corpseBurst: {
        name: 'Red Harvest', icon: '🥀',
        get desc() {
            const { chance, radius, damage } = this.levels;
            return `Every kill has a ${formatPercent(chance)} chance to trigger an explosion, dealing ${formatMultiplier(damage)} spell damage within ${radius} range.`;
        },
        levels: { chance: 1, radius: 110, damage: 1.7 }
    },
    chainLightning: {
        name: 'Wrath of Heaven', icon: '🌩️',
        get desc() {
            const { cooldown, jumps, damage } = this.levels;
            return `Lightning strikes every ${formatNumber(cooldown)}s, leaping to ${jumps} targets for ${formatMultiplier(damage)} spell damage.`;
        },
        levels: { cooldown: 1.9, jumps: 8, damage: 1.3 }
    },
    soulNova: {
        name: 'Absolute Zero', icon: '🧊',
        get desc() {
            const { cooldown, radius, damage } = this.levels;
            return `Your pulse bursts every ${formatNumber(cooldown)}s, dealing ${formatMultiplier(damage)} spell damage within ${radius} range and freezing enemies for ${formatNumber(this.freezeSeconds)}s.`;
        },
        levels: { cooldown: 4, radius: 250, damage: 2.2 },
        freezeSeconds: 1.6
    },
    torchBolts: {
        name: 'Sun Spire', icon: '☀️',
        get desc() {
            const { cooldown, count, damage } = this.levels;
            return `The torch rains ${count} bolts every ${formatNumber(cooldown)}s, each dealing ${formatMultiplier(damage)} spell damage.`;
        },
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

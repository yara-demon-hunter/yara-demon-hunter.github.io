// --- PODERES ---
// Aprendidos na árvore de skills (data_model/skill_tree). Cada um tem 5 níveis.
// damage = fração do dano da lâmina. Os dados de cada nível ficam em `levels`.
// O ramo de cada poder está em data_model/skill_tree; o conceito, em SKILLS.md.
const formatPercent = (value) => `${Number((value * 100).toFixed(1))}%`;
const formatNumber = (value) => String(Number(value.toFixed(2)));
const formatMultiplier = (value) => `${formatNumber(value)}×`;

// As skills de GELO do Curse Path (o que a skill Blizzard aumenta: dano até 5x). Chave interna -> nome mostrado nas descrições
export const ICE_POWERS = ['chillAura', 'absoluteZero'];

export const POWER_MODELS = {
    emberTrail: {
        name: 'Ember Steps', icon: '👣', maxLvl: 5,
        desc: "Your footsteps leave fire that burns monsters. Inside the torch's warmth, your blade deals extra damage.",
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
        desc: "Every kill restores a little health.",
        get upgrades() {
            return this.levels.map(level => `Restore ${formatNumber(level.heal)} health per kill`);
        },
        levels: [{ heal: 0.4 }, { heal: 0.6 }, { heal: 0.8 }, { heal: 1 }, { heal: 1.2 }]
    },
    keenEye: {
        name: 'Keen Eye', icon: '👁️', maxLvl: 5,
        desc: "Raises your critical chance and critical damage.",
        get upgrades() {
            return this.levels.map(() =>
                `+${formatPercent(this.mods.critChance)} critical chance · +${formatPercent(this.mods.critDamage)} critical damage`
            );
        },
        levels: [{}, {}, {}, {}, {}],
        mods: { critChance: 0.05, critDamage: 0.18 }
    },
    ricochet: {
        name: 'Ricochet', icon: '🎯', maxLvl: 5,
        desc: "Your daggers bounce between several monsters. At max level they also deal more damage.",
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
        desc: "Daggers mark monsters. Hitting a marked monster with your blade detonates the mark; dashing through it deals damage and restores your dash. At max level the blast is wider.",
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
        desc: "Your shadows gain health, damage and a wider guard area around the torch.",
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
    torchBolts: {
        name: 'Flame Sentinel', icon: '🔥', maxLvl: 5,
        desc: "The torch fires bolts of spell damage at the monsters around it.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} bolts · every ${formatNumber(level.cooldown)}s · ${formatMultiplier(level.damage)} spell damage`
            );
        },
        levels: [
            { cooldown: 5.5, count: 1, damage: 1.5 },
            { cooldown: 5.0, count: 1, damage: 1.5 },
            { cooldown: 4.5, count: 2, damage: 1.5 },
            { cooldown: 4.0, count: 2, damage: 2.1 },
            { cooldown: 3.5, count: 3, damage: 2.1 }
        ],
        range: 360, speed: 420, turnRate: 7, radius: 6
    },
    torchWard: {
        name: 'Torch Ward', icon: '🛡️', maxLvl: 5,
        desc: "A shield of flame guards the torch and renews over time, storing charges. It absorbs a hit meant for the torch, stunning and throwing back nearby monsters, and sends one enemy projectile back at the monsters.",
        get upgrades() {
            return this.levels.map(level =>
                `Shield every ${level.cooldown}s · holds ${level.charges} · ${level.radius} repel range · ${formatNumber(level.stun)}s stun`
            );
        },
        levels: [
            { cooldown: 10, charges: 1, radius: 110, knockback: 380, stun: 0.5 },
            { cooldown: 9, charges: 1, radius: 130, knockback: 440, stun: 0.7 },
            { cooldown: 8, charges: 2, radius: 150, knockback: 500, stun: 0.9 },
            { cooldown: 7, charges: 2, radius: 175, knockback: 560, stun: 1.1 },
            { cooldown: 6, charges: 2, radius: 200, knockback: 640, stun: 1.4 }
        ]
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
            { cooldown: 15, radius: 130, damage: 1.2 },
            { cooldown: 14, radius: 170, damage: 1.2 },
            { cooldown: 13, radius: 170, damage: 1.2 },
            { cooldown: 12, radius: 170, damage: 1.8 },
            { cooldown: 11, radius: 200, damage: 1.8 }
        ],
        knockback: 520
    },
    // Freezing Breath (a chave interna continua absoluteZero: era o Absolute Zero, um pulso de frio em área; 27/11/2026 virou uma baforada): quando um monstro chega perto o
    // bastante, o herói solta pela boca um sopro gelado em CONE que DURA `breathSeconds` e ACOMPANHA para onde ele vira (o cone gira com o herói). Quem está dentro leva dano
    // de feitiço a cada instante e fica congelado enquanto o sopro o pega; ao sair do cone ainda fica congelado por `freeze` segundos. Chefe também congela, mas por metade do tempo.
    // A recarga conta depois que o sopro acaba. Cada nível encurta a recarga, alonga e alarga o cone, e congela por mais tempo.
    absoluteZero: {
        name: 'Freezing Breath', icon: '🌬️', maxLvl: 5,
        desc: "When a monster gets close, you breathe freezing air in a cone that follows the nearest monster. Monsters in it take damage and stay frozen, even after they leave the cone. Bosses freeze for half as long. The breath leaves ice on the ground.",
        get upgrades() {
            return this.levels.map(level =>
                `Cone ${level.range} long, ${Math.round(level.halfAngle * 2 * 180 / Math.PI)}° wide · ${formatMultiplier(level.dps)} spell damage/s · +${formatNumber(level.freeze)}s frozen · ready ${formatNumber(level.cooldown)}s after`
            );
        },
        // range: o comprimento do cone (e a distância em que o sopro dispara); halfAngle: metade da abertura (radianos); dps: dano de feitiço por segundo
        levels: [
            { cooldown: 8, range: 150, halfAngle: 0.52, dps: 0.5, freeze: 1.0 },
            { cooldown: 7.5, range: 165, halfAngle: 0.58, dps: 0.55, freeze: 1.3 },
            { cooldown: 7, range: 180, halfAngle: 0.64, dps: 0.6, freeze: 1.6 },
            { cooldown: 6.5, range: 195, halfAngle: 0.7, dps: 0.7, freeze: 1.9 },
            { cooldown: 6, range: 210, halfAngle: 0.78, dps: 0.8, freeze: 2.2 }
        ],
        knockback: 25,
        breathSeconds: 3,        // quanto dura o sopro
        tickSeconds: 0.25,       // de quanto em quanto tempo ele fere e renova o gelo
        turnSpeed: 7,            // o cone vira para onde o herói olha (radianos por segundo)
        holdFreeze: 0.5,         // o gelo que cada instante do sopro renova em quem está dentro
        bossFreezeRatio: 0.5,    // chefe congela por esta fração do tempo (metade)
        // O gelo no chão que o sopro deixa por onde passa (só o VISUAL, desde o começo; o Permafrost acrescenta a lentidão e o dano): quanto dura, quantas camadas ao mesmo tempo e de quanto em quanto tempo nasce uma
        frost: { seconds: 8, maxPatches: 8, patchEvery: 0.5 }
    },
    // Rune Shield (Curse Path, qualquer herói): era o clique do Gudran até 27/11/2026, agora uma skill. Sozinho, quando um monstro chega perto, runas azuis giram em volta do herói por
    // `seconds` s: quem encosta numa runa leva dano de magia e é jogado para fora. Cada nível encurta a recarga, dura mais, ganha runas e bate mais forte.
    runeShield: {
        name: 'Rune Shield', icon: '🔷', maxLvl: 5,
        desc: "When monsters come close, blue runes spin around you for a while. Monsters that touch one take damage and are thrown away.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.runes} runes · ${formatNumber(level.seconds)}s · ${formatMultiplier(level.damage)} spell damage per touch · every ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 15, seconds: 4, runes: 3, damage: 0.5 },
            { cooldown: 13, seconds: 6, runes: 4, damage: 0.6 },
            { cooldown: 12, seconds: 8, runes: 4, damage: 0.8 },
            { cooldown: 11, seconds: 10, runes: 5, damage: 1.0 },
            { cooldown: 10, seconds: 12, runes: 6, damage: 1.5 }
        ],
        // O que não muda de nível (o desenho das runas e o toque)
        base: { radius: 62, runeRadius: 9, spin: 3.2, hitSeconds: 0.45, knockback: 280 }
    },
    // Spectral Blade (Blade Path, no lugar do Cataclysm; 27/11/2026): sozinha, quando monstros chegam perto, lâminas fantasmas APARECEM em volta do herói, giram por `duration` s
    // (dano de LÂMINA em quem toca), SOMEM, e só então a recarga corre. Cada nível: mais lâminas, mais tempo, mais dano e menos recarga.
    spectralBlade: {
        name: 'Spectral Blade', icon: '🗡️', maxLvl: 5,
        desc: "When monsters come close, ghost blades appear and spin around you for a while, hurting every monster they touch. Then they vanish and the skill recharges.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} blades · ${formatNumber(level.duration)}s · ${formatMultiplier(level.damage)} blade damage · ${level.radius} range · recharge ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 14, duration: 4, count: 3, damage: 0.8, radius: 70 },
            { cooldown: 13, duration: 4.5, count: 4, damage: 0.9, radius: 75 },
            { cooldown: 12, duration: 5, count: 4, damage: 1.0, radius: 80 },
            { cooldown: 11, duration: 5.5, count: 5, damage: 1.1, radius: 85 },
            { cooldown: 10, duration: 6, count: 6, damage: 1.3, radius: 92 }
        ],
        base: { spin: 4.2, hitCooldown: 0.35, bladeRadius: 13, knockback: 80, appearSeconds: 0.3, vanishSeconds: 0.4 }
    },
    // Summon Skeletons (Curse Path; 27/11/2026): sozinho, quando monstros chegam perto, esqueletos ALIADOS levantam do chão em volta do herói, lutam por `life` s e desmoronam. Usam a mesma IA dos
    // convertidos do Avgustino (js/systems/conversion.js): vão no monstro mais perto, batem nele e PROVOCAM os monstros comuns (eles vão atrás dos esqueletos). Cada mordida = dano de feitiço x damage.
    summonSkeletons: {
        name: 'Summon Skeletons', icon: '💀', maxLvl: 5,
        desc: "When monsters come close, 2 random skeletons (skeleton, crawler or archer) rise and fight for you until they fall, drawing monsters away from you. Keep summoning up to 6 at once. Their health and bite damage grow with your Magic. Monster shots and explosions can kill them, and bosses kill them fast.",
        get upgrades() {
            return this.levels.map(level =>
                `${formatMultiplier(level.damage)} spell damage per bite · ${formatNumber(level.hpPerMagic)} health per point of spell damage · every ${formatNumber(level.cooldown)}s`
            );
        },
        // damage: dano da mordida = dano de MAGIA x isto. hpPerMagic: vida do esqueleto = dano de MAGIA do herói (getSpellDamage: magicDamage do herói x bônus de feitiço) x isto x o `hp` do tipo.
        // Os dois crescem com a magia do herói: quem não tem magia (magicDamage 0) invoca esqueletos que não aguentam nada, e o Gudran (magia 52) os faz ~2,6x mais firmes que o Caçador (20).
        // Eles NÃO somem pelo tempo: ficam até morrer.
        levels: [
            { cooldown: 18, damage: 0.5, hpPerMagic: 8 },
            { cooldown: 17, damage: 0.6, hpPerMagic: 10 },
            { cooldown: 16, damage: 0.7, hpPerMagic: 12.5 },
            { cooldown: 15, damage: 0.8, hpPerMagic: 15.5 },
            { cooldown: 14, damage: 1.0, hpPerMagic: 19 }
        ],
        // Cada invocação levanta base.perCast esqueletos, cada um de um tipo sorteado (base.types). O arqueiro é frágil, o rastejante um pouco mais firme.
        // Cada esqueleto escolhe um monstro DIFERENTE para enfrentar (js/systems/conversion.js, stickyTarget)
        base: {
            triggerRange: 420, spawnDistance: 60,
            maxAlive: 6,                  // quantos vivos ao mesmo tempo (a skill continua invocando até chegar neste número)
            bossDamageMultiplier: 10,
            bossMinHitRatio: 0.5,         // e um golpe de chefe tira no mínimo esta fração da vida MÁXIMA do esqueleto (2 golpes derrubam qualquer um): eles não podem atrapalhar a luta
                 // o chefe fere os esqueletos 3x mais (tiros, explosões e golpes em área dele)
            perCast: 2,                   // quantos levantam por invocação: sorteados entre os tipos abaixo (weight = chance relativa; hp = multiplicador da vida do tipo)
            types: [
                { type: 'SKELETON', weight: 1, hp: 1 },
                { type: 'SKELETON_CRAWLER', weight: 1, hp: 1.1 },
                { type: 'SKELETON_ARCHER', weight: 1, hp: 0.7 }
            ]
        }
    },
    chainLightning: {
        name: 'Storm Sigil', icon: '⚡', maxLvl: 5,
        desc: "Lightning strikes and leaps between monsters.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.jumps} targets · every ${formatNumber(level.cooldown)}s · ${formatMultiplier(level.damage)} spell damage`
            );
        },
        levels: [
            { cooldown: 4, jumps: 3, damage: 1.2 },
            { cooldown: 4, jumps: 5, damage: 1.2 },
            { cooldown: 3, jumps: 5, damage: 1.2 },
            { cooldown: 3, jumps: 5, damage: 1.6 },
            { cooldown: 2.6, jumps: 8, damage: 1.6 }
        ],
        range: 300, jumpRange: 170
    },
    chillAura: {
        name: 'Cold Moon', icon: '❄️', maxLvl: 5,
        desc: "A cold aura around you slows monsters and damages them over time.",
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
        desc: "Stars fall on the monsters around you, crushing everything in their area.",
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
        desc: "Each swing that hits adds a stack of blade damage and attack speed. Stacks fade shortly after you stop hitting.",
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
        desc: "When monsters get close, you leap and smash the ground, damaging and stunning everything around the impact.",
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
        desc: "A ring of fire protects the torch, burning and slowing the enemies inside it.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.radius} radius · ${formatMultiplier(level.dps)} spell damage per second · ${formatPercent(level.slow)} slow`
            );
        },
        levels: [
            { radius: 150, dps: 0.3, slow: 0.3 },
            { radius: 150, dps: 0.4, slow: 0.3 },
            { radius: 170, dps: 0.5, slow: 0.4 },
            { radius: 170, dps: 0.6, slow: 0.4 },
            { radius: 190, dps: 0.8, slow: 0.5 }
        ],
        width: 24, tickSeconds: 0.3
    },
    graveWisp: {
        name: 'Grave Wisp', icon: '💀', maxLvl: 5,
        desc: "A burning skull follows you and fires bolts of spell damage at nearby monsters.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} bolts · every ${formatNumber(level.cooldown)}s · ${formatMultiplier(level.damage)} spell damage`
            );
        },
        levels: [
            { cooldown: 2.7, count: 1, damage: 1.7 },
            { cooldown: 2.1, count: 1, damage: 1.7 },
            { cooldown: 2.1, count: 2, damage: 1.7 },
            { cooldown: 2.1, count: 2, damage: 2.2 },
            { cooldown: 1.8, count: 3, damage: 2.2 }
        ],
        range: 460, speed: 380, turnRate: 6
    },
    creepingHex: {
        name: 'Creeping Hex', icon: '🕸️', maxLvl: 5,
        desc: "A curse deals damage over time. When its target dies, it spreads to nearby monsters.",
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
        desc: "A rift opens, pulling monsters in before collapsing for heavy damage.",
        get upgrades() {
            return this.levels.map(level =>
                `Every ${formatNumber(level.cooldown)}s · ${level.radius} radius · ${level.pull} pull · ${formatMultiplier(level.damage)} spell damage · ${formatNumber(level.seconds)}s duration`
            );
        },
        levels: [
            { cooldown: 20, radius: 125, pull: 150, damage: 3, seconds: 1.3 },
            { cooldown: 19, radius: 125, pull: 195, damage: 3, seconds: 1.3 },
            { cooldown: 18, radius: 125, pull: 195, damage: 3, seconds: 1.3 },
            { cooldown: 17, radius: 125, pull: 195, damage: 4.5, seconds: 1.3 },
            { cooldown: 16, radius: 150, pull: 220, damage: 4.5, seconds: 1.3 }
        ],
        reach: 1.7,             // atrai até reach x radius do centro
        knockback: 110
    },
    // --- LUZ (js/systems/skills_light.js). O dano é de feitiço: o que fortalece feitiços fortalece a luz ---
    holyGround: {
        name: 'Sacred Ground', icon: '✝️', maxLvl: 5,
        desc: "A circle of holy light opens where the most monsters stand, burning and slowing everything inside.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.radius} radius · ${formatMultiplier(level.dps)} spell damage per second · ${formatPercent(level.slow)} slow · lasts ${formatNumber(level.seconds)}s · every ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 9, radius: 70, dps: 0.6, slow: 0.25, seconds: 4 },
            { cooldown: 8.5, radius: 76, dps: 0.7, slow: 0.28, seconds: 4.5 },
            { cooldown: 8, radius: 82, dps: 0.85, slow: 0.3, seconds: 5 },
            { cooldown: 7.5, radius: 88, dps: 1, slow: 0.33, seconds: 5.5 },
            { cooldown: 7, radius: 96, dps: 1.15, slow: 0.36, seconds: 6 }
        ],
        range: 320,             // só abre o círculo com monstro a esta distância do herói
        tickSeconds: 0.5
    },
    holyWater: {
        name: 'Holy Water', icon: '💧', maxLvl: 5,
        desc: "You hurl a vial of holy water at the nearest monster. It bursts, soaks the ground (monsters walking through it burn) and blesses what it touches: blessed monsters take extra damage from everything.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} vial${level.count > 1 ? 's' : ''} · ${formatMultiplier(level.damage)} spell damage · ${level.radius} burst · blessed ${formatNumber(level.seconds)}s · every ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 6.5, count: 1, radius: 54, damage: 1.1, seconds: 4, puddleSeconds: 3, puddleDps: 0.35 },
            { cooldown: 6, count: 1, radius: 58, damage: 1.3, seconds: 4.5, puddleSeconds: 3.5, puddleDps: 0.4 },
            { cooldown: 5.5, count: 1, radius: 62, damage: 1.5, seconds: 5, puddleSeconds: 4, puddleDps: 0.45 },
            { cooldown: 5.5, count: 1, radius: 64, damage: 1.8, seconds: 5.5, puddleSeconds: 4.5, puddleDps: 0.5 },
            { cooldown: 5, count: 1, radius: 68, damage: 2.2, seconds: 6, puddleSeconds: 5, puddleDps: 0.55 }
        ],
        range: 340,
        puddleRatio: 0.9,       // tamanho da poça = raio do estouro x este número
        puddleTickSeconds: 0.5,
        maxPuddles: 8,
        blessBonus: 0.2,        // o monstro abençoado leva mais de tudo
        knockback: 90,
        flightSeconds: 0.95        // o frasco no ar: devagar, para dar para ver que é um frasco (antes 0.45)
    },
    smite: {
        name: 'Holy Smite', icon: '⚡', maxLvl: 5,
        desc: "A bolt of divine light strikes the strongest monster in reach, damaging and stunning it. Bosses are only staggered.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} bolt${level.count > 1 ? 's' : ''} · ${formatMultiplier(level.damage)} spell damage · stun ${formatNumber(level.stun)}s · every ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 7, count: 1, damage: 2.4, stun: 0.8 },
            { cooldown: 6.5, count: 1, damage: 2.8, stun: 0.9 },
            { cooldown: 6, count: 2, damage: 2.8, stun: 1 },
            { cooldown: 5.5, count: 2, damage: 3.2, stun: 1.1 },
            { cooldown: 5, count: 3, damage: 3.6, stun: 1.2 }
        ],
        range: 360,
        radius: 34,
        bossStunRatio: 0.3
    },
    // Sacred Pendant (js/systems/skills_light.js, updatePendant): o colar sagrado no peito do herói. Quando há monstros em cima dele,
    // solta uma onda de luz branca que os joga para longe e os atordoa. Chefe: empurrão e atordoamento bem menores.
    sacredPendant: {
        name: 'Sacred Pendant', icon: '⚜️', maxLvl: 5,
        desc: "When monsters crowd you, your holy pendant flares: a wave of light flings them away, stuns and hurts them. Bosses barely budge.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.radius} range · ${level.knockback} push · stun ${formatNumber(level.stun)}s · ${formatMultiplier(level.damage)} spell damage · every ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 11, radius: 105, knockback: 430, stun: 0.8, damage: 0.5 },
            { cooldown: 10, radius: 112, knockback: 480, stun: 0.9, damage: 0.65 },
            { cooldown: 9.5, radius: 120, knockback: 530, stun: 1, damage: 0.8 },
            { cooldown: 9, radius: 128, knockback: 580, stun: 1.15, damage: 1 },
            { cooldown: 8, radius: 140, knockback: 650, stun: 1.3, damage: 1.2 }
        ],
        wakeRatio: 0.85,        // acorda quando há monstro a esta fração do alcance
        bossStunRatio: 0.3,
        bossKnockbackRatio: 0.25
    },
    // Guardian Angel (js/systems/skills_light.js, updateGuardianAngel): um anjo guarda a tocha como as sombras do Shadow Clone: espera
    // no posto e, quando um monstro se aproxima, voa até ficar entre ele e a chama, a `castDistance` do monstro, e lança bolas de luz
    // com o cajado. Depois volta ao posto. Provoca: os monstros comuns por perto (provokeRadius) vão bater nele em vez de ir ao herói ou à
    // tocha (como o convertido do Avgustino), e podem derrubá-lo; cai e volta ao posto depois de respawnSeconds. A vida é uma fração da
    // vida máxima do herói (hpRatio, por nível). Cada bola estoura em área (burst) com dano de magia.
    guardianAngel: {
        name: 'Guardian Angel', icon: '👼', maxLvl: 5,
        desc: "An angel guards the torch. When monsters close in, it flies out and hurls orbs of light at the ones nearest the flame. Monsters go for the angel instead of you; if it falls, it returns to its post after a while.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} orb${level.count > 1 ? 's' : ''} · ${formatMultiplier(level.damage)} spell damage · ${level.burst} burst · ${formatPercent(level.hpRatio)} of your health · every ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 4.4, count: 1, damage: 1.2, burst: 34, hpRatio: 0.6 },
            { cooldown: 4.1, count: 1, damage: 1.5, burst: 38, hpRatio: 0.7 },
            { cooldown: 3.8, count: 2, damage: 1.5, burst: 40, hpRatio: 0.8 },
            { cooldown: 3.5, count: 2, damage: 1.8, burst: 44, hpRatio: 0.9 },
            { cooldown: 3.2, count: 3, damage: 2, burst: 48, hpRatio: 1 }
        ],
        range: 330,             // alcance do cajado, contado a partir do anjo
        shotSeconds: 0.3,       // tempo da bola no ar
        castSeconds: 0.95,      // o gesto do cajado (a bola sai em 58% dele): mais lento, mais solene
        provokeRadius: 190,     // monstros comuns a esta distância do anjo vão bater nele
        radius: 12,             // corpo do anjo (para o contato dos monstros)
        respawnSeconds: 12,     // volta ao posto depois de cair
        guard: {
            radius: 250,        // área em volta da tocha de onde o anjo não sai
            minRadius: 62,      // nunca fica mais perto da tocha que isto: voa num raio em volta dela, não em cima
            engage: 130,        // enfrenta monstros até esta distância além da área
            post: { angle: -2.55, distance: 78 },   // o posto: em cima e à esquerda da tocha (radianos, px)
            castDistance: 150,  // fica a esta distância do monstro, do lado da tocha
            moveSpeed: 200,     // px/s: voando até o monstro
            returnSpeed: 130,   // px/s: voltando ao posto
            height: 34          // altura do voo acima do chão, px
        }
    },
    churchBell: {
        name: 'Church Bell', icon: '🔔', maxLvl: 5,
        desc: "A holy bell tolls over the torch: a ring of sound pushes monsters away, damages and stuns them. Bosses are only staggered.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.radius} range · ${formatMultiplier(level.damage)} spell damage · stun ${formatNumber(level.stun)}s · every ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 9, radius: 120, damage: 0.9, stun: 0.5, knockback: 260 },
            { cooldown: 8.5, radius: 130, damage: 1.05, stun: 0.55, knockback: 280 },
            { cooldown: 8, radius: 140, damage: 1.2, stun: 0.6, knockback: 300 },
            { cooldown: 7.5, radius: 150, damage: 1.35, stun: 0.7, knockback: 320 },
            { cooldown: 7, radius: 160, damage: 1.5, stun: 0.8, knockback: 340 }
        ],
        tolls: 1,               // badaladas por toque (a evolução faz 3)
        gapSeconds: 0.45,       // tempo entre uma badalada e a próxima
        growth: 0.25,           // cada badalada seguinte alcança mais longe (x 1 + growth por badalada)
        wakeRatio: 1.4,         // só toca com monstro a até radius x wakeRatio da tocha (não gasta o toque à toa)
        bossStunRatio: 0.3
    },
    // --- NATUREZA (js/systems/skills_nature.js). O dano é de feitiço: o que fortalece feitiços fortalece a floresta ---
    graspingRoots: {
        name: 'Grasping Roots', icon: '🌿', maxLvl: 5,
        desc: "Roots burst under the nearest monsters and pin them to the ground, crushing them over time. Bosses are held only briefly.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.count} monsters · pinned ${formatNumber(level.seconds)}s · ${formatMultiplier(level.dps)} spell damage per second · every ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 13, count: 2, seconds: 1.0, dps: 0.5 },
            { cooldown: 12, count: 3, seconds: 1.25, dps: 0.6 },
            { cooldown: 11, count: 3, seconds: 1.50, dps: 0.7 },
            { cooldown: 10, count: 4, seconds: 1.75, dps: 0.8 },
            { cooldown: 9, count: 5, seconds: 2.0, dps: 0.9 }
        ],
        range: 300,             // até onde as raízes alcançam, a partir do herói
        tickSeconds: 0.5,
        bossRatio: 0.35         // fração do tempo que um boss fica preso
    },
    leechVine: {
        name: 'Leech Vine', icon: '🩸', maxLvl: 5,
        desc: "Vines grow from your oaks, latch onto the nearest monsters and drain them. Part of what they drain heals the oak. Needs an oak.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.targets} vine${level.targets > 1 ? 's' : ''} per oak · ${formatMultiplier(level.dps)} spell damage per second · ${formatPercent(level.heal)} heals the oak`
            );
        },
        levels: [
            { targets: 1, dps: 0.5, heal: 0.3 },
            { targets: 1, dps: 0.55, heal: 0.35 },
            { targets: 1, dps: 0.7, heal: 0.4 },
            { targets: 1, dps: 0.85, heal: 0.45 },
            { targets: 1, dps: 1, heal: 0.5 }
        ],
        range: 150,             // a videira agarra até aqui do carvalho
        breakRange: 200,        // e solta além daqui
        tickSeconds: 0.25
    },
    shelterOak: {
        name: 'Wicked Oak', icon: '🌳', maxLvl: 5,
        desc: "A seed is thrown at the nearby monster with the most health, draining it. If it dies, a sapling grows there and heals you while you stand near it. It grows into a walking oak that lashes nearby monsters and grips the strongest monster on screen; kills speed up its growth. You have only one tree: it stays all night and can be destroyed (plant a new seed if it falls).",
        get upgrades() {
            return this.levels.map(level =>
                `${level.hp} oak health · ${level.reach} reach · ${formatMultiplier(level.damage)} lash every ${formatNumber(level.lashSeconds)}s · new seed ${formatNumber(level.cooldown)}s after it falls`
            );
        },
        levels: [
            // grow: segundos de muda e até a árvore adulta (a que anda) e o quanto cada morte adianta; mais nível = cresce mais rápido.
            // No nível 1 a árvore leva ~1 onda e meia para andar; no 5, menos de uma (2026-11-18: antes era 20 s / 100 s e 1,5 s por morte em
            // qualquer nível, e com as ondas cheias ela já andava no meio da onda 1)
            { count: 1, cooldown: 16, seconds: 10, hp: 140, reach: 80, damage: 0.85, lashSeconds: 0.95, grow: { sapling: 50, adult: 320, perKill: 0.25 } },
            { count: 1, cooldown: 15, seconds: 11, hp: 180, reach: 86, damage: 1, lashSeconds: 0.9, grow: { sapling: 42, adult: 260, perKill: 0.3 } },
            { count: 1, cooldown: 14, seconds: 12, hp: 230, reach: 92, damage: 1.15, lashSeconds: 0.9, grow: { sapling: 34, adult: 200, perKill: 0.35 } },
            { count: 1, cooldown: 13, seconds: 13, hp: 280, reach: 100, damage: 1.35, lashSeconds: 0.85, grow: { sapling: 27, adult: 150, perKill: 0.4 } },
            { count: 1, cooldown: 12, seconds: 14, hp: 340, reach: 108, damage: 1.55, lashSeconds: 0.8, grow: { sapling: 20, adult: 110, perKill: 0.5 } }
        ],
        plantRange: 300,        // só planta com monstro a esta distância do herói (não gasta a árvore à toa)
        seedDamage: 0.12,       // drena pouco a pouco a vida do monstro marcado, em dano de feitiço por segundo
        seedTickSeconds: 0.5,
        // O tempo de crescimento (muda → árvore pequena → adulta, a que anda) vem do nível: `grow` em cada nível acima.
        // O estágio seguinte (o carvalho ancestral) só vem comprando a evolução Ancient Grove.
        healingRadius: 58,
        healingPerSecond: 1,
        wakeRatio: 1.5,         // acorda com monstro a até wakeRatio x reach da árvore e volta a dormir sem ninguém por perto
        lureRadius: 220,        // provoca monstros comuns a longa distância para atacarem a árvore crescida
        trunkRadius: 16,        // onde os monstros batem
        hitSeconds: 0.7,        // intervalo entre golpes de um mesmo monstro na árvore
        growSeconds: 0.45,
        waveHealRatio: 0.5,     // na virada da onda a árvore recupera esta parte da vida máxima
        // Quarto estágio, o carvalho FURIOSO: depois de adulto ele segue crescendo (tempo + mortes) até `seconds` de crescimento;
        // fica um pouco maior (scale), com a cara de quando ataca, e alcança e bate mais
        elder: { seconds: 220, scale: 1.25, reach: 1.15, damage: 1.25, walk: 1.2 },
        // A árvore adulta anda, bem devagar: até o monstro mais perto (dentro de reach x seekRatio) que ainda não está ao alcance
        // dos galhos; sem monstros, volta para perto do herói (se estiver a mais de heroDistance)
        walk: { speed: 9, seekRatio: 3, heroDistance: 160 },
        // Raízes que prendem: a árvore adulta agarra o monstro MAIS FORTE da tela (maior vida) e o segura no chão por bem mais tempo que as raízes comuns,
        // como o Shadow Shackle. O bônus de raízes do druida (ROOTS +50%, mod rootSeconds) vale aqui também; chefe segura menos (bossRatio das raízes)
        grip: { cooldownSeconds: 15, seconds: 6.5, firstDelay: 5, dps: 0.6 }
    },
    sporePods: {
        name: 'Spore Pods', icon: '🍄', maxLvl: 5,
        desc: "Mushrooms sprout behind you. Only the druid eats them, and only when injured: Rowan walking over one heals. The first monster to step on one is poisoned and slowed.",
        get upgrades() {
            return this.levels.map(level =>
                `${level.max} mushrooms · Rowan heals ${formatNumber(level.heal)} on one · ${formatMultiplier(level.dps)} poison per second · ${formatPercent(level.slow)} slow · ${level.radius} cloud · one every ${formatNumber(level.cooldown)}s`
            );
        },
        levels: [
            { cooldown: 5, max: 2, radius: 70, dps: 0.6, seconds: 3, slow: 0.25, heal: 5 },
            { cooldown: 4.5, max: 3, radius: 74, dps: 0.7, seconds: 3, slow: 0.3, heal: 6 },
            { cooldown: 4.5, max: 3, radius: 80, dps: 0.85, seconds: 3.5, slow: 0.3, heal: 7.5 },
            { cooldown: 4, max: 4, radius: 84, dps: 1, seconds: 3.5, slow: 0.35, heal: 9 },
            { cooldown: 3.5, max: 5, radius: 90, dps: 1.1, seconds: 4, slow: 0.4, heal: 10 }
        ],
        armSeconds: 0.6,        // o cogumelo leva este tempo para ficar pronto
        triggerRadius: 24,      // monstro a esta distância o estoura; o Rowan (só ele; depois de se afastar do cogumelo que plantou) o come com a mesma distância
        tickSeconds: 0.5,
        minGap: 46              // distância mínima entre dois cogumelos
    },
    spiritWolves: {
        name: 'Shadow Wolf', icon: '🐺', maxLvl: 5,
        desc: "A shadow wolf hunts on its own, running at the nearest monster and biting it (harder on monsters pinned by roots). Monsters that reach it hit back; if it falls, it returns after a while.",
        get upgrades() {
            return this.levels.map(level =>
                `${formatMultiplier(level.damage)} spell damage per bite · a bite every ${formatNumber(level.biteSeconds)}s · ${level.hp} health`
            );
        },
        levels: [
            { damage: 0.9, biteSeconds: 1.1, hp: 70 },
            { damage: 1.2, biteSeconds: 1, hp: 85 },
            { damage: 1.45, biteSeconds: 0.95, hp: 100 },
            { damage: 1.7, biteSeconds: 0.9, hp: 120 },
            { damage: 2, biteSeconds: 0.85, hp: 145 }
        ],
        runSpeed: 300,          // a corrida atrás da presa e a volta ao herói
        huntRange: 280,         // procura presa até aqui do lobo
        leash: 340,             // não se afasta mais que isto do herói
        biteRange: 16,
        bodyRadius: 11,         // alcance em que os monstros batem no lobo
        homeRadius: 52,         // onde fica ao lado do herói sem presa (um ponto fixo)
        followFar: 40,          // passando disto do ponto, o lobo começa a seguir o herói
        followNear: 10,         // ao chegar a isto, para
        hitSeconds: 0.8,        // cada monstro bate no lobo neste ritmo
        damageTaken: 0.55,      // fração do dano do monstro que o lobo leva
        regen: 0.03,            // cura por segundo (fração da vida) quando está solto perto do herói
        respawnSeconds: 12,     // o lobo caído volta depois disto
        rootedBonus: 1.6        // mordida em monstro preso por raízes
    },
    phantomDash: {
        name: 'Phantom Rush', icon: '👻', maxLvl: 5,
        desc: "Your dash damages the enemies in its path.",
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
// Poder no nível máximo + requisitos do nó de evolução (data_model/skill_tree) = transforma o poder.
export const EVOLUTIONS = {
    // Sovereign Rune (a evolução do Rune Shield, chave runeShield; 27/11/2026): as runas giram como antes e, a cada boltEvery s, CADA runa lança uma bola de energia (a mesma do clique do Gudran)
    // para fora, em várias direções (a direção de cada runa a partir do herói). Dano de feitiço x boltDamage por bola.
    runeShield: {
        name: 'Sovereign Rune', icon: '🔷',
        desc: "Your runes also hurl balls of blue energy outward in every direction.",
        levels: { boltEvery: 0.9, boltDamage: 0.7, boltRange: 280, boltSpeed: 520 }
    },
    // Permafrost (a evolução do Freezing Breath, chave absoluteZero; 27/11/2026): o gelo no chão (que o sopro já deixa, só visual) passa a valer: os monstros nele ficam MAIS LENTOS (iceSlow) e as
    // skills de gelo (ICE_POWERS) dão mais dano (iceDamage). O desenho do gelo é do próprio sopro (POWER_MODELS.absoluteZero.frost)
    absoluteZero: {
        name: 'Permafrost', icon: '🧊',
        desc: "The ice your breath leaves turns solid and slows monsters standing on it. Your ice skills deal more damage.",
        levels: { iceSlow: 0.5 },
        iceDamage: 0.2          // bônus de dano em TODAS as skills de gelo (ICE_POWERS) enquanto o Permafrost está evoluído (somado em js/systems/modifiers.js)
    },
    holyGround: {
        name: 'Consecrated Earth', icon: '⛪',
        desc: "A wider circle that burns harder. Elites and bosses take extra damage, you heal while standing in it, and when it fades a cross of light bursts.",
        levels: { cooldown: 6, radius: 120, dps: 1.5, slow: 0.4, seconds: 7 },
        demonBonus: 0.35,
        healPerSecond: 2,
        finale: { radiusRatio: 1.15, damage: 2.2 }
    },
    holyWater: {
        name: 'Blessed Rain', icon: '🌧️',
        desc: "Your vials keep flying, and a holy rain now falls over the whole field: every monster burns and stays blessed, and big drops soak the ground. Baptism: a blessed monster that dies explodes in light.",
        // Os frascos continuam na evolução (com os números do nível comprado); a chuva vem por cima. levels: o que a chuva usa das poças e da bênção
        levels: { cooldown: 16, count: 0, radius: 70, damage: 1.7, seconds: 3, puddleSeconds: 4, puddleDps: 0.5 },
        // A chuva: a cada `every` segundos, por `seconds`. Todo monstro na tela leva `dps` (dano de magia por segundo, de
        // tickSeconds em tickSeconds) e fica abençoado; uma gota grande estoura em cima de um monstro a cada `dropSeconds`
        rain: { every: 40, seconds: 9, tickSeconds: 0.5, dps: 0.6, dropSeconds: 0.22, radius: 44, damage: 0.6 },
        baptism: { radius: 70, damage: 1.2 }
    },
    smite: {
        name: 'Divine Wrath', icon: '☀️',
        desc: "More bolts, hitting harder. Judgment: a monster struck below a low health threshold is banished on the spot (bosses are not).",
        levels: { cooldown: 4.5, count: 4, damage: 4, stun: 1.4 },
        judgment: 0.25
    },
    churchBell: {
        name: 'Cathedral Toll', icon: '⛪',
        desc: "The bell tolls several times in a row, each ring wider than the last. Blessed monsters take double damage from it, and every toll mends the torch.",
        levels: { cooldown: 8, radius: 160, damage: 1.5, stun: 0.8, knockback: 340 },
        tolls: 3,
        blessedMultiplier: 2,
        torchHeal: 4
    },
    // Archangel (evolução do Guardian Angel; js/systems/skills_light.js, fireAngelBeam): de tempos em tempos o anjo ergue o cajado e solta
    // um raio de luz branca na direção em que ele olha (vira para a maior fila de monstros antes de disparar), que cruza a tela toda, como o
    // Lord's Decree do Gudran (mesmo desenho, em branco), ferindo e atordoando tudo no caminho em pulsos. Bem mais fraco que o do Gudran:
    // só alguns pulsos, direção travada e recarga longa.
    guardianAngel: {
        name: 'Archangel', icon: '🌟',
        desc: "The angel is sturdier and now looses a white beam of holy light across the whole screen, in the direction it faces, stunning everything in its path.",
        levels: { hpRatio: 1.25, beamEvery: 15, beamDamage: 0.8, beamPulses: 5, beamPulseSeconds: 0.25, beamWidth: 30, beamLength: 2400, beamStun: 0.5 },
        bossStunRatio: 0.3,
        beamCastSeconds: 1.1    // o gesto longo do cajado antes do raio (sai no meio dele)
    },
    // Crimson Surge (evolução do Rose Whip, que é passiva: passives.roseWhip.evolved; js/systems/skills_nature.js, updateRoseWhip): com o monstro enrolado,
    // uma energia vermelha corre do herói por DENTRO do chicote e explode nele (pulseDamage, bastante). Repete a cada pulseSeconds enquanto ele
    // estiver preso; se sobreviver, continua preso. O chicote também segura mais tempo.
    roseWhip: {
        name: 'Crimson Surge', icon: '⚡',
        desc: "Red energy flows through the whip and bursts on the wrapped monster again and again while it is pinned. The whip holds longer.",
        levels: { pulseSeconds: 1.6, pulseDamage: 3.5, travelSeconds: 0.4, holdSeconds: 7 }
    },
    // Bloodbud Vine (evolução do Leech Vine; js/systems/skills_nature.js, updateLeechVine): cada carvalho solta UM cipó, no monstro MAIS FORTE ao alcance (ou no
    // enrolado no Rose Whip), que o espreme e drena. Enquanto drena, um botão de sangue cresce no cipó; a cada budSeconds ele amadurece e estoura: dano em área
    // em volta da vítima e uma cura fixa e pequena para o herói (budHeroHeal, fração da vida máxima). Limitado pelo tempo, não pelo número de cipós.
    leechVine: {
        name: 'Bloodbud Vine', icon: '🌺',
        desc: "Each oak sends one vine after the strongest monster in reach (the one wrapped in your Rose Whip first), squeezing it. A blood bud swells on the vine and bursts now and then, hurting everything around the victim and healing you.",
        levels: { targets: 1, dps: 1.2, heal: 0.5, budSeconds: 5, budDamage: 2, budRadius: 60, budHeroHeal: 0.03 }
    },
    // Briar Garden (evolução do Thorn Burst, que é passiva: passives.thornBurst.evolved; js/systems/skills_nature.js, thornBurstConfig): mais Caquitos, espinhos
    // mais numerosos e mais fortes, e quem leva espinho fica lento por um tempo (assim o chicote e os cactos se completam).
    thornBurst: {
        name: 'Briar Garden', icon: '🌸',
        desc: "More Cactlings, each bursting into more thorns that also slow what they hit.",
        levels: { maxCacti: 5, needles: 16, needleDamage: 0.9, slowSeconds: 2 }
    },
    graspingRoots: {
        name: 'Strangling Grove', icon: '🪴',
        desc: "Roots pin more monsters, for longer, and crush harder. Pinned monsters take extra damage from every hit; when one dies, its roots leap to the nearest monster.",
        levels: { cooldown: 8, count: 7, seconds: 2.5, dps: 1.2 },
        rootedDamage: 0.3,      // o que era a Barbed Roots: preso por raízes leva mais de tudo
        spreadRange: 160
    },
    shelterOak: {
        name: 'Ancient Grove', icon: '🌲',
        desc: "A huge oak that never withers with time: it only falls if monsters destroy it. When it falls, its roots pin every monster around it and hurt them. Thorn bark: a monster that strikes the oak takes damage and is pinned for a moment.",
        levels: { count: 1, cooldown: 11, seconds: 18, hp: 400, reach: 110, damage: 1.5, lashSeconds: 0.85 },
        burst: { radiusRatio: 1.6, seconds: 3, damage: 2 },
        thornBark: { damage: 0.6, rootSeconds: 1 }      // o que era o nó Thorn Bark: quem bate na árvore leva dano e fica preso
    },
    spiritWolves: {
        name: 'The White Wolf', icon: '🌕',
        desc: "The wolf turns white: stronger, tougher and faster, and it returns sooner. Every bite hamstrings: the monster is pinned for a moment.",
        levels: { damage: 2.4, biteSeconds: 0.75, hp: 200 },
        damageBonus: 0.12,      // o que era o Pack Instinct, agora do lobo branco
        speedBonus: 0.06,
        healthBonus: 0.15,
        respawnSeconds: 7,
        hamstringSeconds: 0.7
    },
    sporePods: {
        name: 'Plague Garden', icon: '☣️',
        desc: "More mushrooms and thicker spores. A monster that dies inside a cloud leaves a new mushroom.",
        levels: { max: 7, dps: 1.8 }       // dps com o que era o Toxic Bloom (+30% de veneno)
    },
    // Passiva que evolui (passives.shadowClone.evolved): count = sombras em guarda
    shadowClone: {
        name: 'Shadow Legion', icon: '🥷',
        desc: "Three shadows guard the torch, each watching a different monster.",
        levels: { count: 3 }
    },
    emberTrail: {
        name: 'Hellwalker', icon: '☄️',
        desc: "Pillars of fire rise from your steps and burn the enemies around them.",
        levels: { dps: 0.7, life: 4, radius: 42 }
    },
    bloodlust: {
        name: 'Crimson Tide', icon: '🌊',
        desc: "With enough stacks, every swing throws a blood crescent through the horde. Stacks also grow stronger.",
        levels: { stacks: 10, damage: 0.03, speed: 0.015, seconds: 3 },
        crescent: { minStacks: 5, damage: 0.2, speed: 560, range: 340, radius: 26 }
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
        desc: "The ring becomes a wall of white fire that burns and slows harder, and flares now and then to knock monsters back.",
        levels: { radius: 200, dps: 1.1, slow: 0.55 },
        flare: { seconds: 4.5, damage: 1.5, knockback: 520, reach: 46 }
    },
    voidRift: {
        name: 'Event Horizon', icon: '🌌',
        get desc() {
            const { cooldown, radius, pull, damage, seconds } = this.levels;
            return `Every ${formatNumber(cooldown)}s, the rift pulls enemies within ${radius} range with force ${pull}, then collapses for ${formatMultiplier(damage)} spell damage. A second rift opens after ${formatNumber(this.secondRift.seconds)}s for ${formatMultiplier(this.secondRift.damage)} spell damage. The rift lasts ${formatNumber(seconds)}s.`;
        },
        levels: { cooldown: 15, radius: 190, pull: 280, damage: 4, seconds: 1.5 },
        secondRift: { seconds: 0.7, damage: 0.6 }
    },
    phantomDash: {
        name: 'Night Reaper', icon: '🌘',
        desc: "After each dash, your shadow repeats the path and damages the enemies along it.",
        levels: { damage: 3 },
        echo: { delaySeconds: 0.28, seconds: 0.16, damage: 0.8, hitRadius: 26 }
    },
    chainLightning: {
        name: 'Wrath of Heaven', icon: '🌩️',
        desc: "Lightning leaps to more monsters and hits harder.",
        levels: { cooldown: 2.6, jumps: 8, damage: 1.7 }
    },
    soulNova: {
        name: 'Absolute Zero', icon: '🧊',
        get desc() {
            const { cooldown, radius, damage } = this.levels;
            return `Your pulse bursts every ${formatNumber(cooldown)}s, dealing ${formatMultiplier(damage)} spell damage within ${radius} range and freezing enemies for ${formatNumber(this.freezeSeconds)}s.`;
        },
        levels: { cooldown: 10, radius: 250, damage: 2.2 },
        freezeSeconds: 2.5
    },
    torchBolts: {
        name: 'Sun Spire', icon: '☀️',
        desc: "The torch rains more bolts, much faster and harder.",
        levels: { cooldown: 3, count: 5, damage: 4.6 }
    }
};

export function createPowers() {
    return Object.fromEntries(
        Object.entries(POWER_MODELS).map(([key, model]) => [key, { ...model, key, lvl: 0, evolved: false }])
    );
}

// Dados do nível atual de um poder (já com a evolução, se tiver)
// Bônus de dano por poder (afinidade do herói com o ramo dele): chave do poder -> +x. Preenchido em js/systems/modifiers.js
export const POWER_BOOST = {};

export function getPowerLevel(power) {
    if (power.lvl <= 0) return null;
    const base = POWER_MODELS[power.key].levels[power.lvl - 1];
    const level = power.evolved ? { ...base, ...EVOLUTIONS[power.key].levels } : base;
    const boost = POWER_BOOST[power.key];
    if (!boost) return level;
    const out = { ...level };
    for (const k of ['damage', 'dps', 'burnDamage', 'tickDamage']) if (typeof out[k] === 'number') out[k] *= 1 + boost;
    return out;
}

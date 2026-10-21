window.YaraRpgData = window.YaraRpgData || {};

// BASE_CHARACTER_STATS define os valores iniciais de um novo jogo.
// skillPoints vem de progression.startingSkillPoints (3) — não edite aqui.
// Se quiser mudar o inicial, altere só em js/data/progression-rules.js → progression.startingSkillPoints
const BASE_CHARACTER_STATS = Object.freeze({
    level: 1,
    hp: 100,
    maxHp: 100,
    foco: 50,
    maxFoco: 50,
    atk: 10,
    def: 5,
    evasion: 5,
    parry: 5,
    stunChance: 5,
    fury: 0,
    maxFury: 100,
    criticalChance: 5,
    criticalDamage: 200,// piercing 50% of enemy defense
    gold: 100,
    // fallback: se progression-rules.js não carregou ainda, começa com 3
    skillPoints: (window.YaraRpgData?.rules?.progression?.startingSkillPoints ?? 3),
    xp: 0,
    maxXp: 30
});

const STARTING_PASSIVE_SKILLS = Object.freeze([
    "mist-blade",
    "vital-reservoir",
    "deep-reserve",
    "electric-shock",
    "sure-aim",
    "stone-skin",
    "swift-step",
    "spectral-parry"
]);

const STARTING_MONSTER_PACTS = Object.freeze([
    "frail-monsters",
    "weakened-monsters",
    "dulled-monsters",
    "sluggish-monsters",
    "unsteady-monsters"
]);

window.YaraRpgData.characters = Object.freeze([
    {
        id: "zeph",
        name: "Zeph",
        unlocked: true,
        startingEquipment: ["hunter-dagger", "leather-armor", "rope","swift-boots"],
        startingEquipmentInventory: [],
        startingPassiveSkills: [],
        startingMonsterPacts: [],
        image: "images/characters/zeph.webp",
        icon: "🌿",
        baseStats: BASE_CHARACTER_STATS,
        description: {
            pt: "Sobrevivente atento, acostumado a resistir aos perigos da floresta.",
            en: "A watchful survivor, used to enduring the forest's dangers."
        },
        passive: {
            id: "zeph-inner-reserve",
            icon: "🔷",
            name: { pt: "Reserva interior", en: "Inner Reserve" },
            description: { pt: "+15% de Foco máximo.", en: "+15% maximum Focus." },
            statBonusPercent: { maxFoco: 15 }
        },
        basicStats: {
            evasion: 5,
            maxFoco: 30,
            stunChance: 2,
        },
        // Each levelup
        progression: {
            maxHp: 20,
            maxFoco: 15,
            maxPotions: 1,
            atk: 0,
            def: 0,
            evasion: 2,
            parry: 0,
            stunChance: 1,
            criticalChance: 1
        },
        skills: {
            heavyAttack: { focoCost: 10, attackMultiplier: 1.5 },
            dodge: { focoCost: 5, bonus: 15 }
        },
        limits: {
            maxEvasion: 70,
            maxParry: 45,
            maxStunChance: 40,
            minFuryThreshold: 50,
            maxPotions: 10,
            maxCriticalChance: 30
        }
    },
    {
        id: "oskar",
        name: "Oskar",
        unlocked: true,
        startingEquipment: ["hunter-axe", "wooden-shield", "leather-armor"],
        startingEquipmentInventory: ["double-headed-axe"],
        startingPassiveSkills: [],
        startingMonsterPacts: [],
        image: "images/characters/oskar.webp",
        icon: "🪓",
        baseStats: BASE_CHARACTER_STATS,
        description: {
            pt: "Caçador implacável que prefere encerrar uma luta com um golpe forte.",
            en: "A relentless hunter who prefers to end a fight with a powerful blow."
        },
        passive: {
            id: "oskar-predator-strength",
            icon: "💪",
            name: { pt: "Força predadora", en: "Predator Strength" },
            description: { pt: "+5% de Ataque total.", en: "+5% total Attack." },
            statBonusPercent: { atk: 5 }
        },
        basicStats: {
            atk: 3,
            def: 1,
            parry: 4,
        },
        progression: {
            maxHp: 25,
            maxFoco: 5,
            maxPotions: 1,
            atk: 0.5,
            def: 0.5,
            evasion: 0,
            parry: 1,
            stunChance: 0,
            criticalChance: 0
        },
        skills: {
            heavyAttack: { focoCost: 25, attackMultiplier: 1.8 },
            parry: { focoCost: 10, bonus: 15 }
        },
        limits: {
            maxEvasion: 40,
            maxParry: 65,
            maxStunChance: 30,
            minFuryThreshold: 60,
            maxPotions: 5,
            maxCriticalChance: 35
        }
    },
    {
        id: "yara",
        name: "Yara",
        unlocked: true,
        startingEquipment: ["hunter-bow", "night-cloak", "fury-seal","swift-boots"],
        startingEquipmentInventory: ["hunter-dagger","wooden-shield"],
        startingPassiveSkills: [],
        startingMonsterPacts: [],
        image: "images/characters/yara.webp",
        icon: "🗡️",
        baseStats: BASE_CHARACTER_STATS,
        description: {
            pt: "Caçadora de demônios mestiça, dividida entre sua natureza humana e o poder demoníaco.",
            en: "A half-demon hunter, caught between her human nature and demonic power."
        },
        passive: {
            id: "yara-evasive-fury",
            icon: "🌪️",
            name: { pt: "Fúria evasiva", en: "Evasive Fury" },
            description: { pt: "+5 de Fúria cada vez que esquiva de um ataque.", en: "+5 Fury each time she evades an attack." },
            furyPerDodgeBonus: 5
        },
        basicStats: {
            evasion: 5,
            parry: 2,
            stunChance:2,
        },
        progression: {
            maxHp: 10,
            maxFoco: 10,
            maxPotions: 1,
            atk: 0,
            def: 0,
            evasion: 1,
            parry: 1,
            stunChance: 2,
            criticalChance: 0.5
        },
        skills: {
            heavyAttack: { focoCost: 15, attackMultiplier: 2.0 },
            parry: { focoCost: 10, bonus: 10 },
            dodge: { focoCost: 10, bonus: 10 }
        },
        limits: {
            maxEvasion: 65,
            maxParry: 65,
            maxStunChance: 45,
            minFuryThreshold: 40,
            maxPotions: 10,
            maxCriticalChance: 35
        }
    },
    {
        id: "demon-hunter",
        name: "Demon Hunter",
        unlocked: false,
        startingEquipment: ["demon-hunter-sword", "demon-hunter-cloak","demon-hunter-mask"],
        startingEquipmentInventory: [],
        startingPassiveSkills: [],
        startingMonsterPacts: [],
        image: "images/characters/demon-hunter.webp",
        icon: "⚔️",
        baseStats: BASE_CHARACTER_STATS,
        description: {
            pt: "Caçador lendário que transforma a força dos demônios contra eles mesmos.",
            en: "A legendary hunter who turns demonic strength against the demons themselves."
        },
        passive: {
            id: "demon-hunter-hunters-edge",
            icon: "🔥",
            name: { pt: "Lâmina do Caçador", en: "Hunter's Edge" },
            description: { pt: "+10% de Ataque total.", en: "+10% total Attack." },
            statBonusPercent: { atk: 10 }
        },
        basicStats: {
            atk: 5,
            evasion: 4,
            criticalChance: 2
        },
        progression: {
            maxHp: 10,
            maxFoco: 10,
            maxPotions: 1,
            atk: 2,
            def: 0,
            evasion: 1.5,
            parry: 0.5,
            stunChance: 0.5,
            criticalChance: 1.5
        },
        skills: {
            heavyAttack: { focoCost: 20, attackMultiplier: 2.3 },
            dodge: { focoCost: 10, bonus: 20 }
        },
        limits: {
            maxEvasion: 65,
            maxParry: 50,
            maxStunChance: 50,
            minFuryThreshold: 30,
            maxPotions: 5,
            maxCriticalChance: 50
        }
    },
    {
        id: "mysterious-creature",
        name: "Mysterious Creature",
        unlocked: false,
        startingEquipment: ["spirit-sword", "bandana", "demonic-flute"],
        startingEquipmentInventory: [],
        startingPassiveSkills: [],
        startingMonsterPacts: [],
        image: "images/characters/mysterious_creature.webp",
        icon: "👁️",
        baseStats: BASE_CHARACTER_STATS,
        description: {
            pt: "Uma criatura enigmática que canaliza energia espiritual em sua espada.",
            en: "An enigmatic creature that channels spirit energy through its sword."
        },
        passive: {
            id: "mysterious-creature-spirit-siphon",
            icon: "🩸",
            name: { pt: "Dreno espiritual", en: "Spirit Siphon" },
            description: {
                pt: "Drena 10% do dano causado e converte em HP.",
                en: "Drains 10% of damage dealt and converts it to HP."
            },
            lifeStealPercent: 10
        },
        basicStats: {
            atk: 4,
            maxFoco: 30,
            criticalChance: 2,
            stunChance: 5
        },
        progression: {
            maxHp: 25,
            maxFoco: 10,
            maxPotions: 1,
            atk: 1,
            def: 0.5,
            evasion: 1,
            parry: 0.5,
            stunChance: 1,
            criticalChance: 1
        },
        skills: {
            heavyAttack: { focoCost: 10, attackMultiplier: 1.8 },
            dodge: { focoCost: 10, bonus: 15 }
        },
        limits: {
            maxEvasion: 60,
            maxParry: 35,
            maxStunChance: 60,
            minFuryThreshold: 50,
            maxPotions: 5,
            maxCriticalChance: 35
        }
    }
]);

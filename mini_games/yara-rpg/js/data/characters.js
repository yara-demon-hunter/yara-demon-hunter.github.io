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
    parry: 10,
    stunChance: 5,
    fury: 0,
    maxFury: 100,
    gold: 200,
    // fallback: se progression-rules.js não carregou ainda, começa com 3
    skillPoints: (window.YaraRpgData?.rules?.progression?.startingSkillPoints ?? 3),
    xp: 0,
    maxXp: 30
});

window.YaraRpgData.characters = Object.freeze([
    {
        id: "zeph",
        name: "Zeph",
        icon: "🌿",
        baseStats: BASE_CHARACTER_STATS,
        description: {
            pt: "Sobrevivente atento, acostumado a resistir aos perigos da floresta.",
            en: "A watchful survivor, used to enduring the forest's dangers."
        },
        specialty: {
            evasion: 10,
            maxFoco: 50,
            stunChance: 5
        },
        // Ajuste estes valores para definir como Zeph evolui a cada nível.
        levelUp: {
            maxHp: 15,
            maxFoco: 15,
            maxPotions: 1,
            atk: 1,
            def: 1,
            evasion: 3,
            parry: 1,
            stunChance: 2
        },
        skills: {
            heavyAttack: { focoCost: 10, attackMultiplier: 1.5 },
            parry: { focoCost: 15, bonus: 5 },
            dodge: { focoCost: 5, bonus: 10 },
            maxEvasion: 70,
            maxParry: 45
        }
    },
    {
        id: "oskar",
        name: "Oskar",
        icon: "🪓",
        baseStats: BASE_CHARACTER_STATS,
        description: {
            pt: "Caçador implacável que prefere encerrar uma luta com um golpe forte.",
            en: "A relentless hunter who prefers to end a fight with a powerful blow."
        },
        specialty: {
            atk: 10,
            def: 5,
            parry: 15
        },
        // Ajuste estes valores para definir como Oskar evolui a cada nível.
        levelUp: {
            maxHp: 25,
            maxFoco: 5,
            maxPotions: 1,
            atk: 2,
            def: 2,
            evasion: 1,
            parry: 2,
            stunChance: 1
        },
        skills: {
            heavyAttack: { focoCost: 25, attackMultiplier: 1.7 },
            parry: { focoCost: 10, bonus: 10 },
            dodge: { focoCost: 30, bonus: 5 },
            maxEvasion: 40,
            maxParry: 60
        }
    }
]);

window.YaraRpgData = window.YaraRpgData || {};

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
            maxHp: 200,
            evasion: 10,
            maxFoco: 50,
            stunChance: 5
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
            atk: 15,
            def: 5,
            parry: 15
        }
    }
]);

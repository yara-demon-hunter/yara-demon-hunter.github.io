window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.hero = Object.freeze({
    name: "Zeph",
    initial: {
        level: 1,
        hp: 100,
        maxHp: 100,
        foco: 50,
        maxFoco: 50,
        atk: 14,
        def: 6,
        evasion: 8,
        parry: 15,
        stunChance: 5,
        fury: 0,
        maxFury: 100,
        gold: 200,
        xp: 0,
        maxXp: 30
    },
    levelUp: {
        maxHp: 25,
        maxFoco: 15,
        maxPotions: 1,
        atk: 4,
        def: 2,
        evasion: 2,
        evasionLimit: 40,
        parry: 2,
        stunChance: 2
    }
});
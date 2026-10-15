window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.specialMonsters = Object.freeze([
    {
        id: "undead-brute",
        name: { pt: "Brutamontes Morto-Vivo", en: "Undead Brute" },
        icon: "💀",
        minLevel: 3,
        suggestedLevel: 4,
        hp: 230,
        atk: 32,
        def: 15,
        parry: 32,
        evasion: 8,
        xpReward: 95,
        goldReward: 75
    },
    {
        id: "death-soldier",
        name: { pt: "Soldado da Morte", en: "Death Soldier" },
        icon: "💀",
        minLevel: 2,
        suggestedLevel: 3,
        hp: 155,
        atk: 24,
        def: 10,
        parry: 30,
        evasion: 12,
        xpReward: 65,
        goldReward: 48
    },
    {
        id: "mist-dragon",
        name: { pt: "Dragão da Névoa", en: "Mist Dragon" },
        icon: "🐉",
        minLevel: 5,
        suggestedLevel: 6,
        hp: 360,
        atk: 46,
        def: 20,
        parry: 35,
        evasion: 16,
        xpReward: 180,
        goldReward: 140
    },
    {
        id: "abyssal-herald",
        name: { pt: "Arauto do Abismo", en: "Abyssal Herald" },
        icon: "👹",
        minLevel: 1,
        suggestedLevel: 8,
        hp: 760,
        atk: 72,
        def: 40,
        parry: 42,
        evasion: 18,
        xpReward: 360,
        goldReward: 400
    }
]);

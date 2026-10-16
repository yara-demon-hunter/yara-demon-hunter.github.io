window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.specialMonsters = Object.freeze([
    {
        id: "undead",
        name: { pt: "Morto-Vivo", en: "Undead" },
        icon: "💀",
        image: "images/special_monsters/undead.png",
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
        id: "death",
        name: { pt: "Morte", en: "Death" },
        icon: "💀",
        image: "images/special_monsters/death.png",
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
        image: "images/special_monsters/mist-dragon.png",
        minLevel: 5,
        suggestedLevel: 6,
        hp: 300,
        atk: 46,
        def: 20,
        parry: 35,
        evasion: 16,
        xpReward: 180,
        goldReward: 140
    },
    {
        id: "abyssal-demon",
        name: { pt: "Demônio do Abismo", en: "Abyssal Demon" },
        icon: "👹",
        image: "images/special_monsters/abyssal-demon.png",
        minLevel: 1,
        suggestedLevel: 8,
        hp: 500,
        atk: 50,
        def: 20,
        parry: 42,
        evasion: 18,
        xpReward: 360,
        goldReward: 400
    },
    {
        id: "brutos",
        name: { pt: "Brutos", en: "Brutos" },
        icon: "👹",
        image: "images/special_monsters/brutos.png",
        minLevel: 5,
        suggestedLevel: 9,
        hp: 750,
        atk: 58,
        def: 32,
        parry: 38,
        evasion: 10,
        xpReward: 280,
        goldReward: 240
    }
]);

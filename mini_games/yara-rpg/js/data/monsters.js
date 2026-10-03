window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.monsters = Object.freeze({
    minimumRolledAttribute: 1,
    variation: {
        minimum: 0.85,
        maximum: 1.30
    },
    byRegion: {
        "dark-forest": [
            { name: { pt: "Lobo Sombriço", en: "Shadow Wolf" }, icon: "🐺", hp: 35, atk: 10, def: 2, parry: 15, evasion: 8, xpReward: 15, goldReward: 8 },
            { name: { pt: "Espírito do Rio", en: "River Spirit" }, icon: "👻", hp: 42, atk: 12, def: 3, parry: 18, evasion: 12, xpReward: 20, goldReward: 12 },
            { name: { pt: "Bruxa de Feições Cadavéricas", en: "Corpse-faced Witch" }, icon: "🧙‍♀️", hp: 50, atk: 14, def: 4, parry: 22, evasion: 10, xpReward: 30, goldReward: 20 },
            { name: { pt: "Criatura Corrompida das Sombras", en: "Corrupted Shadow Creature" }, icon: "👤", hp: 90, atk: 15, def: 5, parry: 25, evasion: 15, xpReward: 45, goldReward: 35 }
        ],
        "ashen-portal": [
            { name: { pt: "Guardião do Portal", en: "Portal Guardian" }, icon: "🗿", hp: 120, atk: 17, def: 6, parry: 24, evasion: 8, xpReward: 38, goldReward: 24 },
            { name: { pt: "Espectro das Cinzas", en: "Ash Wraith" }, icon: "🌫️", hp: 95, atk: 19, def: 7, parry: 27, evasion: 18, xpReward: 42, goldReward: 28 }
        ],
        "ruined-village": [
            { name: { pt: "Saqueador da Névoa", en: "Mist Marauder" }, icon: "🪓", hp: 185, atk: 31, def: 20, parry: 30, evasion: 12, xpReward: 50, goldReward: 38 },
            { name: { pt: "Cavaleiro Possuído", en: "Possessed Knight" }, icon: "⚔️", hp: 250, atk: 44, def: 10, parry: 35, evasion: 10, xpReward: 60, goldReward: 45 }
        ],
        "gudran-castle": [
            { name: { pt: "Cavaleiro de Gudran", en: "Knight of Gudran" }, icon: "🛡️", hp: 300, atk: 56, def: 11, parry: 38, evasion: 12, xpReward: 75, goldReward: 55 },
            { name: { pt: "Sentinela das Catacumbas", en: "Catacomb Sentinel" }, icon: "💀", hp: 250, atk: 48, def: 20, parry: 40, evasion: 10, xpReward: 90, goldReward: 68 },
            { name: { pt: "Manticora de Pedra", en: "Stone Manticore" }, icon: "🦂", hp: 155, atk: 30, def: 70, parry: 38, evasion: 16, xpReward: 110, goldReward: 82 }
        ]
    }
});
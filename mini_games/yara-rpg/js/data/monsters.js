window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.monsters = Object.freeze({
    minimumRolledAttribute: 1,
    variation: {
        minimum: 0.70,
        maximum: 1.80
    },
    byRegion: {
        "dark-forest": [
            { name: { pt: "Lobo Sombriço", en: "Shadow Wolf" }, icon: "🐺", image: "images/monsters/shadow-wolf.png", hp: 35, atk: 10, def: 2, parry: 15, evasion: 8, xpReward: 15, goldReward: 8 },
            { name: { pt: "Demônio do Rio", en: "River Demon" }, icon: "👻", image: "images/monsters/river-demon.png", hp: 42, atk: 12, def: 3, parry: 18, evasion: 12, xpReward: 20, goldReward: 12 },
            { name: { pt: "Bruxa", en: "Witch" }, icon: "🧙‍♀️", image: "images/monsters/witch.png", hp: 50, atk: 14, def: 4, parry: 22, evasion: 10, xpReward: 30, goldReward: 20 },
            { name: { pt: "Criatura das Sombras", en: "Shadow Creature" }, icon: "👤", image: "images/monsters/shadow-creature.png", hp: 90, atk: 15, def: 5, parry: 25, evasion: 15, xpReward: 45, goldReward: 35 }
        ],
        "river-crossing": [
            { name: { pt: "Demônio do Rio", en: "River Demon" }, icon: "👻", image: "images/monsters/river-demon.png", hp: 90, atk: 19, def: 7, parry: 27, evasion: 18, xpReward: 42, goldReward: 28 },
            { name: { pt: "Golem do Rio", en: "River Golem" }, icon: "🗿", image: "images/monsters/river-golem.png", hp: 120, atk: 17, def: 6, parry: 24, evasion: 8, xpReward: 38, goldReward: 24 }
        ],
        "blue-torch-village": [
            { name: { pt: "Saqueador da Névoa", en: "Mist Marauder" }, icon: "🪓", image: "images/monsters/mist-maruader.png", hp: 185, atk: 28, def: 20, parry: 30, evasion: 12, xpReward: 80, goldReward: 75 },
            { name: { pt: "Cavaleiro Possuído", en: "Possessed Knight" }, icon: "⚔️", image: "images/monsters/possessed-knight.png", hp: 250, atk: 32, def: 15, parry: 35, evasion: 10, xpReward: 70, goldReward: 85 }
        ],
        "gudran-castle": [
            { name: { pt: "Soldado de Gudran", en: "Gudran's Soldier" }, icon: "🛡️", image: "images/monsters/gudran-soldier.png", hp: 300, atk: 30, def: 30, parry: 38, evasion: 12, xpReward: 100, goldReward: 55 },
            { name: { pt: "Criatura Corrompida", en: "Corrupted Creature" }, icon: "💀", image: "images/monsters/corrupted-creature.png", hp: 280, atk: 35, def: 20, parry: 20, evasion: 30, xpReward: 120, goldReward: 68 },
            { name: { pt: "Golem", en: "Golem" }, icon: "🗿", image: "images/monsters/golem.png", hp: 400, atk: 50, def: 10, parry: 0, evasion: 0, xpReward: 200, goldReward: 150 }

        ]
    }
});

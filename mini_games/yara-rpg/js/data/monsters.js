window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.monsters = Object.freeze({
    minimumRolledAttribute: 1,
    variation: {
        minimum: 0.70,
        maximum: 1.60
    },
    byRegion: {
        "dark-forest": [
            { name: { pt: "Lobo Sombriço", en: "Shadow Wolf" }, icon: "🐺", image: "images/monsters/shadow-wolf.webp", hp: 35, atk: 10, def: 2, parry: 15, evasion: 8, xpReward: 8, goldReward: 5 },
            { name: { pt: "Demônio do Rio", en: "River Demon" }, icon: "👻", image: "images/monsters/river-demon.webp", hp: 42, atk: 12, def: 3, parry: 18, evasion: 12, xpReward: 9, goldReward: 8 },
            { name: { pt: "Bruxa", en: "Witch" }, icon: "🧙‍♀️", image: "images/monsters/witch.webp", hp: 50, atk: 14, def: 4, parry: 22, evasion: 10, xpReward: 15, goldReward: 12 },
        ],
        "river-crossing": [
            { name: { pt: "Demônio do Rio", en: "River Demon" }, icon: "👻", image: "images/monsters/river-demon.webp", hp: 90, atk: 19, def: 7, parry: 27, evasion: 18, xpReward: 23, goldReward: 20 },
            { name: { pt: "Golem do Rio", en: "River Golem" }, icon: "🗿", image: "images/monsters/river-golem.webp", hp: 75, atk: 17, def: 6, parry: 24, evasion: 8, xpReward: 28, goldReward: 24 },
            { name: { pt: "Criatura das Sombras", en: "Shadow Creature" }, icon: "👤", image: "images/monsters/shadow-creature.webp", hp: 110, atk: 18, def: 13, parry: 25, evasion: 15, xpReward: 35, goldReward: 30 }
        ],
        "blue-torch-village": [
            { name: { pt: "Saqueador da Névoa", en: "Mist Marauder" }, icon: "🪓", image: "images/monsters/mist-maruader.webp", hp: 130, atk: 28, def: 20, parry: 30, evasion: 12, xpReward: 50, goldReward: 55 },
            { name: { pt: "Cavaleiro Possuído", en: "Possessed Knight" }, icon: "⚔️", image: "images/monsters/possessed-knight.webp", hp: 150, atk: 28, def: 15, parry: 35, evasion: 10, xpReward: 55, goldReward: 75 },
            { name: { pt: "Cavaleiro sem Cabeça", en: "Headless Horseman" }, icon: "⚔️", image: "images/monsters/headless-horseman.webp", hp: 180, atk: 32, def: 25, parry: 35, evasion: 10, xpReward: 70, goldReward: 90 }
            
        ],
        "gudran-castle": [
            { name: { pt: "Soldado de Gudran", en: "Gudran's Soldier" }, icon: "🛡️", image: "images/monsters/gudran-soldier.webp", hp: 220, atk: 30, def: 30, parry: 38, evasion: 12, xpReward: 110, goldReward: 100 },
            { name: { pt: "Criatura Corrompida", en: "Corrupted Creature" }, icon: "💀", image: "images/monsters/corrupted-creature.webp", hp: 250, atk: 35, def: 20, parry: 20, evasion: 30, xpReward: 120, goldReward: 90 },
            { name: { pt: "Golem", en: "Golem" }, icon: "🗿", image: "images/monsters/golem.webp", hp: 270, atk: 40, def: 10, parry: 0, evasion: 0, xpReward: 160, goldReward: 120 }
        ]
    }
});

window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.items = Object.freeze({
    healingPotion: {
        startingCount: 1,
        startingCapacity: 1,
        healAmount: 45,
        healFoco:20
    },
    equipment: Object.freeze([
        { id: "iron-sword", slot: "mainHand", handUsage: "one-handed", itemType: "weapon", icon: "🗡️", image: "images/items/iron-sword.webp", name: { pt: "Espada de Ferro", en: "Iron Sword" }, stats: { atk: 3, def: 1, evasion: 2 }, starter: true },
        { id: "hunter-axe", slot: "mainHand", handUsage: "one-handed", itemType: "weapon", icon: "🪓", image: "images/items/hunter-axe.webp", name: { pt: "Machado do Caçador", en: "Hunter's Axe" }, stats: { atk: 5, parry: 1, criticalChance: 1 }, starter: true },
        { id: "hunter-bow", slot: "mainHand", handUsage: "two-handed", itemType: "weapon", icon: "🏹", image: "images/items/hunter-bow.webp", name: { pt: "Arco e Flecha", en: "Bow and Arrows" }, stats: { atk: 1, evasion: 2, stunChance: 1, maxFury: -5 }, starter: true },
        { id: "hunter-dagger", slot: "mainHand", handUsage: "one-handed", itemType: "weapon", icon: "🔪", image: "images/items/hunter-dagger.webp", name: { pt: "Faca do Caçador", en: "Hunter's Dagger" }, stats: { atk: 1, evasion: 4, criticalChance: 3 }, starter: true },
        { id: "wooden-shield", slot: "offHand", itemType: "shield", icon: "🛡️", image: "images/items/wooden-shield.webp", name: { pt: "Escudo de Madeira", en: "Wooden Shield" }, stats: { def: 5, parry: 5 }, starter: true },
        { id: "leather-cap", slot: "head", icon: "⛑️", image: "images/items/leather-cap.webp", name: { pt: "Capuz de Couro", en: "Leather Hood" }, stats: { def: 1, evasion: 3 }, starter: true },
        { id: "leather-armor", slot: "body", icon: "🦺", image: "images/items/leather-armor.webp", name: { pt: "Armadura de Couro", en: "Leather Armor" }, stats: { def: 1, maxHp: 30 }, starter: true },
        { id: "night-cloak", slot: "cloak", icon: "🧥", image: "images/items/night-cloak.webp", name: { pt: "Capa Noturna", en: "Night Cloak" }, stats: { evasion: 3, parry: 1 }, starter: true  },
        { id: "trail-trousers", slot: "legs", icon: "👖", image: "images/items/trail-trousers.webp", name: { pt: "Calças de Trilha", en: "Trail Trousers" }, stats: { def: 1, maxHp: 30 }, starter: true },
        { id: "swift-boots", slot: "boots", icon: "🥾", image: "images/items/swift-boots.webp", name: { pt: "Botas Ligeiras", en: "Swift Boots" }, stats: { evasion: 4 }, starter: true },
        { id: "river-charm", slot: "necklace", icon: "📿", image: "images/items/river-charm.webp",name: { pt: "Amuleto do Rio", en: "River Charm" }, stats: { maxFoco: 30, parry: 1 }, starter: true },
        { id: "forest-ring", slot: "ring", icon: "💍", image: "images/items/forest-ring.webp", name: { pt: "Anel da Floresta", en: "Forest Ring" }, stats: { atk: 2, evasion: 2 }, starter: true },
        { id: "forest-dog", slot: "pet", icon: "🐕", image: "images/items/forest-dog.webp", name: { pt: "Cão da Trilha", en: "Trail Hound" }, stats: { atk: 1, evasion: 2, parry: 1 }, starter: true },
        { id: "shadow-cat", slot: "pet", icon: "🐈", image: "images/items/shadow-cat.webp", name: { pt: "Gato Sombrio", en: "Shadow Cat" }, stats: { evasion: 3, stunChance: 1 }, starter: true },
        { id: "wild-horse", slot: "pet", icon: "🐎", image: "images/items/wild-horse.webp", name: { pt: "Cavalo Selvagem", en: "Wild Horse" }, stats: { maxHp: 20, maxFoco: 10, evasion: 1 }, starter: true },
        { id: "fury-seal", slot: "accessory", icon: "🩸", name: { pt: "Selo da Fúria", en: "Fury Seal" }, stats: { maxFury: -10, criticalChance: 5 }, starter: true },
        // Starter False below
        { id: "raven", slot: "pet", icon: "🐦‍⬛", image: "images/items/raven.webp", name: { pt: "Corvo", en: "Raven" }, stats: { evasion: 2, stunChance: 2 }, starter: false  },
        { id: "demonic-flute", slot: "accessory", icon: "🪈", image: "images/items/demonic-flute.webp", name: { pt: "Flauta Demoníaca", en: "Demonic Flute" }, stats: { atk: 1, stunChance: 3 }, starter: false },
        { id: "rune-of-impact", slot: "accessory", icon: "🔮", image: "images/items/rune-of-impact.webp", name: { pt: "Runa do Impacto", en: "Impact Rune" }, stats: { maxFoco: 20 ,stunChance: 2 }, starter: false },
        { id: "forest-wolf", slot: "pet", icon: "🐺", image: "images/items/forest-wolf.webp", name: { pt: "Lobo da Floresta", en: "Forest Wolf" }, stats: { atk: 3, evasion: 1 }, starter: false },
        { id: "iron-boots", slot: "boots", icon: "👢", image: "images/items/iron-boots.webp", name: { pt: "Botas de Ferro", en: "Iron Boots" }, stats: { def: 3, evasion: 1 }, starter: false },
        { id: "stunning-blade", slot: "mainHand", handUsage: "one-handed", itemType: "weapon", icon: "⚡", image: "images/items/stunning-blade.webp", name: { pt: "Lâmina Deslumbrante", en: "Stunning Blade" }, stats: { atk: 2, stunChance: 2 }, starter: false },
        { id: "iron-shield", slot: "offHand", itemType: "shield", icon: "🛡️", image: "images/items/iron-shield.webp", name: { pt: "Escudo de Ferro", en: "Iron Shield" }, stats: { def: 7, maxHp: 60 }, starter: false },
        { id: "iron-greaves", slot: "legs", icon: "🦵", image: "images/items/iron-leggings.webp", name: { pt: "Grevas de Ferro", en: "Iron Greaves" }, stats: { def: 3, maxFoco: 10 }, starter: false },
        { id: "iron-helm", slot: "head", icon: "🪖", image: "images/items/iron-helmet.webp", name: { pt: "Elmo de Ferro", en: "Iron Helm" }, stats: { def: 3, maxHp: 10 } , starter: false },
        { id: "watchful-eagle", slot: "pet", icon: "🦅", image: "images/items/watchful-eagle.webp", name: { pt: "Águia Vigilante", en: "Watchful Eagle" }, stats: { evasion: 1, parry: 1, stunChance: 2 }, starter: false },
        { id: "double-headed-axe", slot: "mainHand", handUsage: "two-handed", itemType: "weapon", icon: "🪓", image: "images/items/double-headed-axe.webp", name: { pt: "Machado de Duas Lâminas", en: "Double Headed Axe" }, stats: { atk: 9, parry: 3, criticalChance: 5 }, starter: false },
        { id: "mist-ring", slot: "ring", icon: "💍", image: "images/items/mist-ring.webp", name: { pt: "Anel da Névoa", en: "Mist Ring" }, stats: { atk: 1, evasion: 5, stunChance: 1 }, starter: false },
        { id: "lumen-necklace", slot: "necklace", icon: "📿", image: "images/items/lumen-necklace.webp",name: { pt: "Colar Reluzente", en: "Lumen Necklace" }, stats: { def: 1, parry: 3, stunChance: 2 }, starter: false },
        { id: "rope", slot: "accessory", icon: "🪢", image: "images/items/rope.webp", name: { pt: "Corda", en: "Rope" }, stats: { stunChance: 3, evasion: 2 }, starter: false },
        // Exclusives
        { id: "demon-hunter-sword", slot: "mainHand", handUsage: "one-handed", itemType: "weapon", icon: "⚔️", image: "images/items/demon-hunter-sword.webp", name: { pt: "Espada Demon Hunter", en: "Demon Hunter Sword" }, stats: { atk: 8, criticalChance: 4, maxFury: -10 }, characterExclusive: "demon-hunter" },
        { id: "demon-hunter-cloak", slot: "cloak", icon: "🧥", image: "images/items/demon-hunter-cloak.webp", name: { pt: "Capa Demon Hunter", en: "Demon Hunter Cloak" }, stats: { evasion: 5, stunChance: 2, maxFury: -10 }, characterExclusive: "demon-hunter" },

    ])
});

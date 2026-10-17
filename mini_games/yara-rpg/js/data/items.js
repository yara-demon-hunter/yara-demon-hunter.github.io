window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.items = Object.freeze({
    healingPotion: {
        startingCount: 1,
        startingCapacity: 1,
        maxCapacity: 5,
        healAmount: 45,
        healFoco:20
    },
    equipment: Object.freeze([
        { id: "iron-sword", slot: "rightHand", icon: "🗡️", image: "images/items/iron-sword.png", name: { pt: "Espada de Ferro", en: "Iron Sword" }, stats: { atk: 2, def: 1, evasion: 1 }, starter: true },
        { id: "hunter-axe", slot: "rightHand", icon: "🪓", image: "images/items/hunter-axe.png", name: { pt: "Machado do Caçador", en: "Hunter's Axe" }, stats: { atk: 3, parry: 1 }, starter: true },
        { id: "hunter-bow", slot: "rightHand", icon: "🏹", image: "images/items/hunter-bow.png", name: { pt: "Arco e Flecha", en: "Bow and Arrows" }, stats: { atk: 2, evasion: 1, stunChance: 1 }, starter: true },
        { id: "hunter-dagger", slot: "rightHand", icon: "🔪", image: "images/items/hunter-dagger.png", name: { pt: "Faca do Caçador", en: "Hunter's Dagger" }, stats: { atk: 1, evasion: 3 }, starter: true },
        { id: "wooden-shield", slot: "leftHand", icon: "🛡️", image: "images/items/wooden-shield.png", name: { pt: "Escudo de Madeira", en: "Wooden Shield" }, stats: { def: 2, parry: 2 }, starter: true },
        { id: "leather-cap", slot: "head", icon: "⛑️", image: "images/items/leather-cap.png", name: { pt: "Capuz de Couro", en: "Leather Hood" }, stats: { def: 1, evasion: 3 }, starter: true },
        { id: "leather-armor", slot: "body", icon: "🦺", image: "images/items/leather-armor.png", name: { pt: "Armadura de Couro", en: "Leather Armor" }, stats: { def: 1, maxHp: 30 }, starter: true },
        { id: "night-cloak", slot: "body", icon: "🧥", image: "images/items/night-cloak.png", name: { pt: "Capa Noturna", en: "Night Cloak" }, stats: { evasion: 3, parry: 1 }, starter: true  },
        { id: "trail-trousers", slot: "legs", icon: "👖", image: "images/items/trail-trousers.png", name: { pt: "Calças de Trilha", en: "Trail Trousers" }, stats: { def: 1, maxHp: 30 }, starter: true },
        { id: "swift-boots", slot: "boots", icon: "🥾", image: "images/items/swift-boots.png", name: { pt: "Botas Ligeiras", en: "Swift Boots" }, stats: { evasion: 4 }, starter: true },
        { id: "river-charm", slot: "necklace", icon: "📿", image: "images/items/river-charm.png",name: { pt: "Amuleto do Rio", en: "River Charm" }, stats: { maxFoco: 30, parry: 1 }, starter: true },
        { id: "forest-ring", slot: "ring", icon: "💍", image: "images/items/forest-ring.png", name: { pt: "Anel da Floresta", en: "Forest Ring" }, stats: { atk: 2, evasion: 2 }, starter: true },
        { id: "forest-dog", slot: "pet", icon: "🐕", image: "images/items/forest-dog.png", name: { pt: "Cão da Trilha", en: "Trail Hound" }, stats: { atk: 1, evasion: 2, parry: 1 }, starter: true },
        { id: "shadow-cat", slot: "pet", icon: "🐈", image: "images/items/shadow-cat.png", name: { pt: "Gato Sombrio", en: "Shadow Cat" }, stats: { evasion: 3, stunChance: 1 }, starter: true },
        { id: "wild-horse", slot: "pet", icon: "🐎", image: "images/items/wild-horse.png", name: { pt: "Cavalo Selvagem", en: "Wild Horse" }, stats: { maxHp: 20, maxFoco: 10, evasion: 1 }, starter: true },
        { id: "fury-seal", slot: "accessory", icon: "🩸", name: { pt: "Selo da Fúria", en: "Fury Seal" }, stats: { maxFury: -10 }, starter: true },
        { id: "raven", slot: "pet", icon: "🐦‍⬛", image: "images/items/raven.png", name: { pt: "Corvo", en: "Raven" }, stats: { evasion: 2, stunChance: 2 }, starter: false  },
        { id: "demonic-flute", slot: "accessory", icon: "🪈", image: "images/items/demonic-flute.png", name: { pt: "Flauta Demoníaca", en: "Demonic Flute" }, stats: { atk: 1, stunChance: 3 }, starter: false },
        { id: "rune-of-impact", slot: "accessory", icon: "🔮", image: "images/items/rune-of-impact.png", name: { pt: "Runa do Impacto", en: "Impact Rune" }, stats: { maxFoco: 20 ,stunChance: 2 }, starter: false },
        { id: "forest-wolf", slot: "pet", icon: "🐺", image: "images/items/forest-wolf.png", name: { pt: "Lobo da Floresta", en: "Forest Wolf" }, stats: { atk: 3, evasion: 1 }, starter: false },
        { id: "iron-boots", slot: "boots", icon: "👢", image: "images/items/iron-boots.png", name: { pt: "Botas de Ferro", en: "Iron Boots" }, stats: { def: 3, evasion: 1 }, starter: false },
        { id: "stunning-blade", slot: "rightHand", icon: "⚡", image: "images/items/stunning-blade.png", name: { pt: "Lâmina Deslumbrante", en: "Stunning Blade" }, stats: { atk: 2, stunChance: 2 }, starter: false },
        { id: "iron-shield", slot: "leftHand", icon: "🛡️", image: "images/items/iron-shield.png", name: { pt: "Escudo de Ferro", en: "Iron Shield" }, stats: { def: 2, maxHp: 20 }, starter: false },
        { id: "iron-greaves", slot: "legs", icon: "🦵", image: "images/items/iron-leggings.png", name: { pt: "Grevas de Ferro", en: "Iron Greaves" }, stats: { def: 3, maxFoco: 10 }, starter: false },
        { id: "iron-helm", slot: "head", icon: "🪖", image: "images/items/iron-helmet.png", name: { pt: "Elmo de Ferro", en: "Iron Helm" }, stats: { def: 3, maxHp: 10 } , starter: false },
        { id: "watchful-eagle", slot: "pet", icon: "🦅", image: "images/items/watchful-eagle.png", name: { pt: "Águia Vigilante", en: "Watchful Eagle" }, stats: { evasion: 1, parry: 1, stunChance: 2 }, starter: false },
    ])
});

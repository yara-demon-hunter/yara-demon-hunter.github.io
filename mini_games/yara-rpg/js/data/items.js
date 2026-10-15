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
        { id: "iron-sword", slot: "rightHand", icon: "🗡️", image: "images/iron-sword.png", name: { pt: "Espada de Ferro", en: "Iron Sword" }, stats: { atk: 3, def: 2, evasion: 2 }, starter: true },
        { id: "hunter-axe", slot: "rightHand", icon: "🪓", image: "images/hunter-axe.png", name: { pt: "Machado do Caçador", en: "Hunter's Axe" }, stats: { atk: 7, parry: 2 }, starter: true },
        { id: "hunter-bow", slot: "rightHand", icon: "🏹", image: "images/hunter-bow.png", name: { pt: "Arco e Flecha", en: "Bow and Arrows" }, stats: { atk: 2, evasion: 2, stunChance: 2 }, starter: true },
        { id: "hunter-dagger", slot: "rightHand", icon: "🔪", image: "images/hunter-dagger.png", name: { pt: "Faca do Caçador", en: "Hunter's Dagger" }, stats: { atk: 1, evasion: 6 }, starter: true },
        { id: "wooden-shield", slot: "leftHand", icon: "🛡️", image: "images/wooden-shield.png", name: { pt: "Escudo de Madeira", en: "Wooden Shield" }, stats: { def: 2, parry: 5 }, starter: true },
        { id: "iron-shield", slot: "leftHand", icon: "🛡️", image: "images/iron-shield.png", name: { pt: "Escudo de Ferro", en: "Iron Shield" }, stats: { def: 5, maxHp: 30 }, starter: true },
        { id: "leather-cap", slot: "head", icon: "⛑️", image: "images/leather-cap.png", name: { pt: "Capuz de Couro", en: "Leather Hood" }, stats: { def: 1, evasion: 3 }, starter: true },
        { id: "iron-helm", slot: "head", icon: "🪖", image: "images/iron-helmet.png", name: { pt: "Elmo de Ferro", en: "Iron Helm" }, stats: { def: 4, maxHp: 40 } , starter: true },
        { id: "leather-armor", slot: "body", icon: "🦺", image: "images/leather-armor.png", name: { pt: "Armadura de Couro", en: "Leather Armor" }, stats: { def: 2, maxHp: 50 }, starter: true },
        { id: "night-cloak", slot: "body", icon: "🧥", image: "images/night-cloak.png", name: { pt: "Capa Noturna", en: "Night Cloak" }, stats: { def: 1, evasion: 3, parry: 3 }, starter: true  },
        { id: "iron-greaves", slot: "legs", icon: "🦵", image: "images/iron-leggings.png", name: { pt: "Grevas de Ferro", en: "Iron Greaves" }, stats: { def: 3, maxFoco: 30 }, starter: true },
        { id: "trail-trousers", slot: "legs", icon: "👖", image: "images/trail-trousers.png", name: { pt: "Calças de Trilha", en: "Trail Trousers" }, stats: { def: 1, maxHp: 30 }, starter: true },
        { id: "swift-boots", slot: "boots", icon: "🥾", image: "images/swift-boots.png", name: { pt: "Botas Ligeiras", en: "Swift Boots" }, stats: { evasion: 7 }, starter: true },
        { id: "iron-boots", slot: "boots", icon: "👢", image: "images/iron-boots.png", name: { pt: "Botas de Ferro", en: "Iron Boots" }, stats: { def: 3, evasion: 2 }, starter: true },
        { id: "river-charm", slot: "necklace", icon: "📿", image: "images/river-charm.png",name: { pt: "Amuleto do Rio", en: "River Charm" }, stats: { maxFoco: 30, parry: 5 }, starter: true },
        { id: "forest-ring", slot: "ring", icon: "💍", image: "images/forest-ring.png", name: { pt: "Anel da Floresta", en: "Forest Ring" }, stats: { atk: 2, evasion: 2 }, starter: true },
        { id: "stunning-blade", slot: "rightHand", icon: "⚡", name: { pt: "Lâmina Trovejante", en: "Thunderous Blade" }, stats: { atk: 3, stunChance: 2 } },
        { id: "storm-circlet", slot: "accessory", icon: "🌩️", name: { pt: "Diadema da Tempestade", en: "Storm Circlet" }, stats: { def: 2, stunChance: 2 } },
        { id: "forest-dog", slot: "pet", icon: "🐕", image: "images/forest-dog.png", name: { pt: "Cão da Trilha", en: "Trail Hound" }, stats: { atk: 1, evasion: 2, parry: 1 }, starter: true },
        { id: "mist-wolf", slot: "pet", icon: "🐺", name: { pt: "Lobo da Névoa", en: "Mist Wolf" }, stats: { atk: 3, evasion: 3 } },
        { id: "watchful-eagle", slot: "pet", icon: "🦅", name: { pt: "Águia Vigilante", en: "Watchful Eagle" }, stats: { evasion: 4, parry: 2, stunChance: 1 } },
        { id: "shadow-cat", slot: "pet", icon: "🐈", image: "images/shadow-cat.png", name: { pt: "Gato Sombrio", en: "Shadow Cat" }, stats: { evasion: 3, stunChance: 1 }, starter: true },
        { id: "mist-horse", slot: "pet", icon: "🐎", name: { pt: "Cavalo da Névoa", en: "Mist Horse" }, stats: { maxHp: 50, maxFoco: 15, evasion: 4 } },
        { id: "mist-raven", slot: "pet", icon: "🐦‍⬛", name: { pt: "Corvo da Névoa", en: "Mist Raven" }, stats: { evasion: 3, parry: 2, stunChance: 2 } },
        { id: "demonic-flute", slot: "accessory", icon: "🪈", image: "images/demonic-flute.png", name: { pt: "Flauta Demoníaca", en: "Demonic Flute" }, stats: { atk: 1, stunChance: 5 }, starter: true },
        { id: "rune-of-impact", slot: "accessory", icon: "🔮", image: "images/rune-of-impact.png", name: { pt: "Runa do Impacto", en: "Impact Rune" }, stats: { maxFoco: 20 ,stunChance: 2 }, starter: true },
    ])
});

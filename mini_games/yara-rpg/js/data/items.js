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
        { id: "iron-sword", slot: "rightHand", icon: "🗡️", name: { pt: "Espada de Ferro", en: "Iron Sword" }, stats: { atk: 3 } },
        { id: "hunter-axe", slot: "rightHand", icon: "🪓", name: { pt: "Machado do Caçador", en: "Hunter's Axe" }, stats: { atk: 5 } },
        { id: "wooden-shield", slot: "leftHand", icon: "🛡️", name: { pt: "Escudo de Madeira", en: "Wooden Shield" }, stats: { def: 2 } },
        { id: "iron-shield", slot: "leftHand", icon: "🛡️", name: { pt: "Escudo de Ferro", en: "Iron Shield" }, stats: { def: 4 } },
        { id: "leather-cap", slot: "head", icon: "⛑️", name: { pt: "Capuz de Couro", en: "Leather Hood" }, stats: { def: 1, evasion: 2 } },
        { id: "iron-helm", slot: "head", icon: "🪖", name: { pt: "Elmo de Ferro", en: "Iron Helm" }, stats: { def: 3 } },
        { id: "leather-armor", slot: "body", icon: "🦺", name: { pt: "Armadura de Couro", en: "Leather Armor" }, stats: { def: 2, maxHp: 15 } },
        { id: "mist-cloak", slot: "body", icon: "🧥", name: { pt: "Manto da Névoa", en: "Mist Cloak" }, stats: { def: 1, evasion: 3 } },
        { id: "iron-greaves", slot: "legs", icon: "🦵", name: { pt: "Grevas de Ferro", en: "Iron Greaves" }, stats: { def: 3 } },
        { id: "trail-trousers", slot: "legs", icon: "👖", name: { pt: "Calças de Trilha", en: "Trail Trousers" }, stats: { def: 1, maxHp: 10 } },
        { id: "swift-boots", slot: "boots", icon: "🥾", name: { pt: "Botas Ligeiras", en: "Swift Boots" }, stats: { evasion: 3 } },
        { id: "iron-boots", slot: "boots", icon: "👢", name: { pt: "Botas de Ferro", en: "Iron Boots" }, stats: { def: 2, evasion: 1 } },
        { id: "river-charm", slot: "accessory", icon: "📿", name: { pt: "Amuleto do Rio", en: "River Charm" }, stats: { maxFoco: 10, parry: 2 } },
        { id: "mist-ring", slot: "accessory", icon: "💍", name: { pt: "Anel da Névoa", en: "Mist Ring" }, stats: { atk: 1, evasion: 2 } }
    ])
});
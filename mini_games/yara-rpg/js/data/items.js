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
        { id: "iron-sword", slot: "rightHand", icon: "🗡️", name: { pt: "Espada de Ferro", en: "Iron Sword" }, stats: { atk: 3, def: 2, evasion: 2 }, starter: true },
        { id: "hunter-axe", slot: "rightHand", icon: "🪓", name: { pt: "Machado do Caçador", en: "Hunter's Axe" }, stats: { atk: 8 }, starter: true },
        { id: "mist-dagger", slot: "rightHand", icon: "🔪", name: { pt: "Faca da Névoa", en: "Mist Dagger" }, stats: { atk: 1, evasion: 6 }, starter: true },
        { id: "wooden-shield", slot: "leftHand", icon: "🛡️", name: { pt: "Escudo de Madeira", en: "Wooden Shield" }, stats: { def: 2, parry: 5 }, starter: true },
        { id: "iron-shield", slot: "leftHand", icon: "🛡️", name: { pt: "Escudo de Ferro", en: "Iron Shield" }, stats: { def: 5, maxHp: 30 } },
        { id: "leather-cap", slot: "head", icon: "⛑️", name: { pt: "Capuz de Couro", en: "Leather Hood" }, stats: { def: 1, evasion: 3 }, starter: true },
        { id: "iron-helm", slot: "head", icon: "🪖", name: { pt: "Elmo de Ferro", en: "Iron Helm" }, stats: { def: 4, maxHp: 40 } , starter: true },
        { id: "leather-armor", slot: "body", icon: "🦺", name: { pt: "Armadura de Couro", en: "Leather Armor" }, stats: { def: 2, maxHp: 50 }, starter: true },
        { id: "mist-cloak", slot: "body", icon: "🧥", name: { pt: "Manto da Névoa", en: "Mist Cloak" }, stats: { def: 1, evasion: 3, parry: 3 }, starter: true  },
        { id: "iron-greaves", slot: "legs", icon: "🦵", name: { pt: "Grevas de Ferro", en: "Iron Greaves" }, stats: { def: 3, maxFoco: 30 }, starter: true },
        { id: "trail-trousers", slot: "legs", icon: "👖", name: { pt: "Calças de Trilha", en: "Trail Trousers" }, stats: { def: 1, maxHp: 30 } },
        { id: "swift-boots", slot: "boots", icon: "🥾", name: { pt: "Botas Ligeiras", en: "Swift Boots" }, stats: { evasion: 7 }, starter: true },
        { id: "iron-boots", slot: "boots", icon: "👢", name: { pt: "Botas de Ferro", en: "Iron Boots" }, stats: { def: 3, evasion: 2 } },
        { id: "river-charm", slot: "accessory", icon: "📿", name: { pt: "Amuleto do Rio", en: "River Charm" }, stats: { maxFoco: 30, parry: 5 }, starter: true },
        { id: "mist-ring", slot: "accessory", icon: "💍", name: { pt: "Anel da Névoa", en: "Mist Ring" }, stats: { atk: 1, evasion: 2 }, starter: true },
        { id: "stunning-blade", slot: "rightHand", icon: "⚡", name: { pt: "Lâmina Trovejante", en: "Thunderous Blade" }, stats: { atk: 3, stunChance: 4 } },
        { id: "rune-of-impact", slot: "accessory", icon: "🔮", name: { pt: "Runa do Impacto", en: "Impact Rune" }, stats: { stunChance: 3 } },
        { id: "storm-circlet", slot: "head", icon: "🌩️", name: { pt: "Diadema da Tempestade", en: "Storm Circlet" }, stats: { def: 2, stunChance: 2 } }
    ])
});

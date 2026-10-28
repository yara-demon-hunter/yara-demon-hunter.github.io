window.YaraRpgData = window.YaraRpgData || {};

// Vendedor ambulante. A frequência com que ele aparece fica em exploration-rules.js (campo "vendor");
// a lógica (sorteio, compra e venda) fica em ../systems/vendor.js.
window.YaraRpgData.vendor = Object.freeze({
    // Retrato opcional exibido na loja. Sem o arquivo, a loja mostra um emoji.
    image: "images/mist_contacts/wandering-vendor.webp",
    // Quantas mercadorias a loja sorteia por visita e qual delas sempre aparece.
    offersPerVisit: 4,
    guaranteedOfferId: "potion",
    // O preço base sobe com o índice da região e varia um pouco a cada visita.
    pricing: { regionScale: 0.35, variationMinimum: 0.9, variationMaximum: 1.1 },
    // Compra de itens da mochila: valor por raridade (mesma ordem de equipmentRarities em equipment-rules.js),
    // adicional por nível de aprimoramento e a partir de qual raridade pede confirmação.
    sell: { byRarity: [6, 12, 22, 35, 55, 85, 130, 200], perUpgradeLevel: 5, confirmFromRarityIndex: 4 },
    // Evento de exploração que apresenta o vendedor. Os efeitos "vendor" e "vendor-leave" são tratados em resolveStoryEvent.
    event: {
        id: "wandering-vendor",
        title: { pt: "O vendedor ambulante", en: "The wandering vendor" },
        description: { pt: "Um vendedor encapuzado surge da névoa puxando uma carroça cheia de tralhas. \"Ouro por sobrevivência, caçador. Dê uma olhada.\"", en: "A hooded vendor steps out of the mist pulling a cart full of odds and ends. \"Gold for survival, hunter. Have a look.\"" },
        choices: [
            { label: { pt: "Ver as mercadorias", en: "Browse the wares" }, effect: "vendor" },
            { label: { pt: "Seguir viagem", en: "Move on" }, effect: "vendor-leave" }
        ]
    },
    // Mercadorias. effect.type: potion | restore | stat | maxStat | cappedStat | skillPoints | treasureMap.
    offers: [
        {
            id: "potion", icon: "🧪", price: 40, stock: 2,
            name: { pt: "Poção de cura", en: "Healing potion" },
            description: { pt: "+1 poção (se houver espaço)", en: "+1 potion (if there is room)" },
            effect: { type: "potion" }
        },
        {
            id: "elixir", icon: "🍶", price: 75, stock: 1,
            name: { pt: "Elixir restaurador", en: "Restorative elixir" },
            description: { pt: "Recupera todo o HP e Foco agora", en: "Restores all HP and Focus now" },
            effect: { type: "restore" }
        },
        {
            id: "whetstone", icon: "🪨", price: 90, stock: 1,
            name: { pt: "Pedra de afiar", en: "Whetstone" },
            description: { pt: "+1 ATQ permanente", en: "+1 permanent ATK" },
            effect: { type: "stat", stat: "atk", amount: 1 }
        },
        {
            id: "iron-charm", icon: "🔩", price: 90, stock: 1,
            name: { pt: "Talismã de ferro", en: "Iron talisman" },
            description: { pt: "+1 DEF permanente", en: "+1 permanent DEF" },
            effect: { type: "stat", stat: "def", amount: 1 }
        },
        {
            id: "tonic", icon: "🍷", price: 80, stock: 1,
            name: { pt: "Tônico vital", en: "Vital tonic" },
            description: { pt: "+10 HP máximo (e cura 10)", en: "+10 max HP (and heals 10)" },
            effect: { type: "maxStat", stat: "maxHp", currentStat: "hp", amount: 10 }
        },
        {
            id: "focus-draught", icon: "💧", price: 70, stock: 1,
            name: { pt: "Infusão de foco", en: "Focus infusion" },
            description: { pt: "+10 Foco máximo (e recupera 10)", en: "+10 max Focus (and restores 10)" },
            effect: { type: "maxStat", stat: "maxFoco", currentStat: "foco", amount: 10 }
        },
        {
            id: "eagle-eye", icon: "🦅", price: 110, stock: 1,
            name: { pt: "Lente do falcão", en: "Falcon's lens" },
            description: { pt: "+1% de chance crítica permanente", en: "+1% permanent critical chance" },
            effect: { type: "cappedStat", stat: "criticalChance", amount: 1, limitKey: "maxCriticalChance" }
        },
        {
            id: "scroll", icon: "📜", price: 120, stock: 1,
            name: { pt: "Pergaminho de treino", en: "Training scroll" },
            description: { pt: "+1 Ponto de Habilidade", en: "+1 Skill Point" },
            effect: { type: "skillPoints", amount: 1 }
        },
        {
            id: "map", icon: "🗺️", price: 60, stock: 1,
            name: { pt: "Mapa do tesouro", en: "Treasure map" },
            description: { pt: "+10% de chance de baú na próxima descoberta", en: "+10% chest chance on the next discovery" },
            effect: { type: "treasureMap" }
        },
    ]
});

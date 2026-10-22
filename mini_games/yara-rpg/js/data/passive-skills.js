window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.passiveSkills = Object.freeze({
    pacts: [
        {
            id: "frail-monsters",
            icon: "🫀",
            name: { pt: "Pacto da Carne Frágil", en: "Pact of Frail Flesh" },
            description: { pt: "Todos os monstros começam com 10% menos HP.", en: "All monsters start with 10% less HP." },
            monsterStat: "hp",
            amount: -10,
            percent: true
        },
        {
            id: "weakened-monsters",
            icon: "🛡️",
            name: { pt: "Pacto da Guarda Partida", en: "Pact of the Broken Guard" },
            description: { pt: "Todos os monstros têm 5 pontos a menos de Defesa.", en: "All monsters have 5 less Defense." },
            monsterStat: "def",
            amount: -5
        },
        {
            id: "dulled-monsters",
            icon: "⚔️",
            name: { pt: "Pacto das Garras Cegas", en: "Pact of Blunted Claws" },
            description: { pt: "Todos os monstros têm 5 pontos a menos de Ataque.", en: "All monsters have 5 less Attack." },
            monsterStat: "atk",
            amount: -5
        },
        {
            id: "sluggish-monsters",
            icon: "⛓️",
            name: { pt: "Pacto dos Reflexos Presos", en: "Pact of Bound Reflexes" },
            description: { pt: "Todos os monstros têm 10 pontos percentuais a menos de Esquiva.", en: "All monsters have 10 percentage points less Evasion." },
            monsterStat: "evasion",
            amount: -10
        },
        {
            id: "unsteady-monsters",
            icon: "🔔",
            name: { pt: "Pacto do Ritmo Quebrado", en: "Pact of Broken Rhythm" },
            description: { pt: "Todos os monstros têm 10 pontos percentuais a menos de Aparo.", en: "All monsters have 10 percentage points less Parry." },
            monsterStat: "parry",
            amount: -10
        }
    ],
    skills: [
        {
            id: "mist-blade",
            icon: "🗡️",
            name: { pt: "Lâmina da Névoa", en: "Mist Blade" },
            description: { pt: "+3 de Ataque", en: "+3 Attack" },
            stat: "atk",
            amount: 3
        },
        {
            id: "vital-reservoir",
            icon: "❤️",
            name: { pt: "Reservatório Vital", en: "Vital Reservoir" },
            description: { pt: "+100 de HP máximo e recupera 100 HP", en: "+100 maximum HP and restores 100 HP" },
            stat: "maxHp",
            amount: 100,
            currentStat: "hp"
        },
        {
            id: "deep-reserve",
            icon: "💚",
            name: { pt: "Reserva Profunda", en: "Deep Reserve" },
            description: { pt: "+100 de Foco máximo e recupera 100 Foco", en: "+100 maximum Focus and restores 100 Focus" },
            stat: "maxFoco",
            amount: 100,
            currentStat: "foco"
        },
        {
            id: "electric-shock",
            icon: "⚡",
            name: { pt: "Choque Elétrico", en: "Electric Shock" },
            description: { pt: "+5% de chance de atordoar o monstro.", en: "+5% chance to stun the monster." },
            stat: "stunChance",
            amount: 5
        },
        {
            id: "sure-aim",
            icon: "🎯",
            name: { pt: "Mira Certeira", en: "Sure Aim" },
            description: { pt: "+5% de chance de acerto crítico.", en: "+5% critical hit chance." },
            stat: "criticalChance",
            amount: 5
        },
        {
            id: "stone-skin",
            icon: "🪨",
            name: { pt: "Pele de Pedra", en: "Stone Skin" },
            description: { pt: "+2 de Defesa", en: "+2 Defense" },
            stat: "def",
            amount: 2
        },
        {
            id: "swift-step",
            icon: "💨",
            name: { pt: "Passo Veloz", en: "Swift Step" },
            description: { pt: "+3% de Esquiva", en: "+3% Evasion" },
            stat: "evasion",
            amount: 3,
            max: 65
        },
        {
            id: "spectral-parry",
            icon: "🛡️",
            name: { pt: "Aparo Espectral", en: "Spectral Parry" },
            description: { pt: "+3% de Aparo", en: "+3% Parry" },
            stat: "parry",
            amount: 3,
            max: 65
        }
    ],
    spiritEye: {
        id: "spirit-eye-treasure-sense",
        iconImage: "images/exploration_icons/spirit-eye-open.webp",
        name: { pt: "Olho Espiritual", en: "Spirit Eye" },
        description: {
            pt: "+5 pontos percentuais na chance de encontrar um baú.",
            en: "+5 percentage points to the chance of finding a chest."
        }
    }
});

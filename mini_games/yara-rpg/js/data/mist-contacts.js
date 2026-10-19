window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.mistContacts = Object.freeze({
    contacts: [
        {
            id: "river-spirit",
            icon: "🌊",
            image: "images/mist_contacts/river-spirit.webp",
            name: {
                pt: "Espírito do Rio",
                en: "River Spirit"
            },
            message: {
                pt: "Uma voz úmida sussurra entre as árvores: “Viajante, aceite minha oferenda. A névoa sempre cobra algo em troca...”",
                en: "A damp voice whispers through the trees: “Traveler, accept my offering. The mist always asks for something in return...”"
            },
            minLevel: 1
        },
        {
            id: "lost-scout",
            icon: "💀",
            image: "images/mist_contacts/lost-scout.webp",
            name: {
                pt: "Batedor Perdido",
                en: "Lost Scout"
            },
            message: {
                pt: "Uma silhueta ferida aponta para a trilha: “Posso mostrar o caminho... mas algo está caçando quem atravessa a névoa.”",
                en: "A wounded silhouette points down the trail: “I can show you the way... but something is hunting everyone who crosses the mist.”"
            },
            minLevel: 2
        },
        {
            id: "specter",
            icon: "🔔",
            image: "images/mist_contacts/specter.webp",
            name: {
                pt: "Espectro",
                en: "Specter"
            },
            message: {
                pt: "O som de um sino ecoa sem origem. Um espectro oferece um pacto: “Prossiga e prove que merece sair daqui.”",
                en: "A bell rings from nowhere. A specter offers a pact: “Go on and prove you deserve to leave this place.”"
            },
            minLevel: 3
        },
        {
            id: "witch-hunter",
            icon: "🧙‍♀️",
            image: "images/mist_contacts/witch-hunter.webp",

            name: {
                pt: "Bruxa Caçadora",
                en: "Hunter Witch"
            },
            message: {
                pt: "Uma bruxa ergue o cajado: “Derrote o morto-vivo que ronda estas árvores e provarei que você merece minha ajuda.”",
                en: "A witch raises her staff: “Defeat the undead stalking these woods, and I will prove you deserve my help.”"
            },
            minLevel: 3,
            onAccept: {
                type: "boss",
                bossId: "undead"
            }
        },
        {
            id: "old-witch",
            icon: "👵",
            image: "images/mist_contacts/old-witch.webp",
            name: {
                pt: "Bruxa Velha",
                en: "Old Witch"
            },
            message: {
                pt: "Uma velha bruxa oferece uma bebida escura: “Beba tudo. Vai custar sua força, mas pagarei muito bem.”",
                en: "An old witch offers a dark drink: “Drink it all. It will drain your strength, but I will pay you well.”"
            },
            minLevel: 1,
            onAccept: {
                type: "drink",
                gold: 150,
                hpPercent: 20
            }
        },
        {
            id: "pact-broker",
            icon: "🩸",
            name: { pt: "Negociante de Pactos", en: "Pact Broker" },
            message: {
                pt: "A figura oferece um pacto: você receberá uma penalidade aleatória — ficar com 1 HP, perder todo o Foco, perder os itens da mochila ou um equipamento vestido — e, em troca, ganhará uma skill passiva que enfraquece todos os monstros. Aceitar é permanente.",
                en: "The figure offers a pact: you will receive a random penalty — be left at 1 HP, lose all Focus, lose your backpack items, or lose one equipped item — and in return gain a passive skill that weakens every monster. Accepting is permanent."
            },
            minLevel: 1,
            onAccept: { type: "pact" }
        },
        {
            id: "spirit-surgeon",
            icon: "🧙‍♂️",
            name: { pt: "Cirurgião Espiritual", en: "Spirit Surgeon" },
            message: {
                pt: "O cirurgião toca sua testa e purifica sua alma. Você sente que pode aperfeiçoar uma habilidade: recebe 1 Ponto de Habilidade para distribuir.",
                en: "The surgeon touches your forehead and purifies your soul. You feel able to improve a skill: gain 1 Skill Point to spend."
            },
            minLevel: 1,
            onAccept: { type: "skill-point", amount: 1 }
        }
    ],
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
    passiveSkills: [
        {
            id: "mist-blade",
            icon: "🗡️",
            name: {
                pt: "Lâmina da Névoa",
                en: "Mist Blade"
            },
            description: {
                pt: "+3 de Ataque",
                en: "+3 Attack"
            },
            stat: "atk",
            amount: 3
        },
        {
            id: "vital-reservoir",
            icon: "❤️",
            name: { pt: "Reservatório Vital", en: "Vital Reservoir" },
            description: {
                pt: "+100 de HP máximo e recupera 100 HP",
                en: "+100 maximum HP and restores 100 HP"
            },
            stat: "maxHp",
            amount: 100,
            currentStat: "hp"
        },
        {
            id: "deep-reserve",
            icon: "💚",
            name: { pt: "Reserva Profunda", en: "Deep Reserve" },
            description: {
                pt: "+100 de Foco máximo e recupera 100 Foco",
                en: "+100 maximum Focus and restores 100 Focus"
            },
            stat: "maxFoco",
            amount: 100,
            currentStat: "foco"
        },
        {
            id: "electric-shock",
            icon: "⚡",
            name: { pt: "Choque Elétrico", en: "Electric Shock" },
            description: {
                pt: "+5% de chance de atordoar o monstro.",
                en: "+5% chance to stun the monster."
            },
            stat: "stunChance",
            amount: 5
        },
        {
            id: "sure-aim",
            icon: "🎯",
            name: { pt: "Mira Certeira", en: "Sure Aim" },
            description: {
                pt: "+5% de chance de acerto crítico.",
                en: "+5% critical hit chance."
            },
            stat: "criticalChance",
            amount: 5
        },
        {
            id: "stone-skin",
            icon: "🪨",
            name: {
                pt: "Pele de Pedra",
                en: "Stone Skin"
            },
            description: {
                pt: "+2 de Defesa",
                en: "+2 Defense"
            },
            stat: "def",
            amount: 2
        },
        {
            id: "swift-step",
            icon: "💨",
            name: {
                pt: "Passo Veloz",
                en: "Swift Step"
            },
            description: {
                pt: "+3% de Esquiva",
                en: "+3% Evasion"
            },
            stat: "evasion",
            amount: 3,
            max: 65
        },
        {
            id: "spectral-parry",
            icon: "🛡️",
            name: {
                pt: "Aparo Espectral",
                en: "Spectral Parry"
            },
            description: {
                pt: "+3% de Aparo",
                en: "+3% Parry"
            },
            stat: "parry",
            amount: 3,
            max: 65
        }
    ]
});

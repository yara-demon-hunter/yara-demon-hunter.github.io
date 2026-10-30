window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.mistContacts = Object.freeze({
    // Weights among eligible contacts after a mist encounter triggers.
    // Set one contact to 100 to force its selection for testing; other weights are ignored.
    contacts: [
        {
            id: "river-spirit",
            soul: -3,
            chancePercent: 15,
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
            soul: 2,
            chancePercent: 12,
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
            soul: -4,
            chancePercent: 12,
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
            soul: 4,
            chancePercent: 10,
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
            soul: -4,
            chancePercent: 16,
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
            soul: -15,
            chancePercent: 12,
            icon: "🩸",
            image: "images/mist_contacts/pact-broker.webp",
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
            chancePercent: 5,
            icon: "🧙‍♂️",
            image: "images/mist_contacts/spirit-surgeon.webp",
            name: { pt: "Cirurgião Espiritual", en: "Spirit Surgeon" },
            message: {
                pt: "O Cirurgião Espiritual faz uma proposta misteriosa. Ninguém sabe o que acontecerá se você aceitar.",
                en: "The Spirit Surgeon makes a mysterious offer. No one knows what will happen if you accept."
            },
            minLevel: 1,
            oncePerGame: true,
            onAccept: { type: "spirit-surgery" }
        },
        {
            id: "spirit-purifier",
            soul: 10,
            chancePercent: 12,
            icon: "✨",
            image: "images/mist_contacts/spirit-purifier.webp",
            name: { pt: "Espírito Purificador", en: "Purifying Spirit" },
            message: {
                pt: "Um espírito toca sua testa e purifica sua alma. Você sente que pode aperfeiçoar uma habilidade: recebe 1 Ponto de Habilidade para distribuir.",
                en: "A spirit touches your forehead and purifies your soul. You feel able to improve a skill: gain 1 Skill Point to spend."
            },
            minLevel: 1,
            onAccept: { type: "skill-point", amount: 1 }
        }
    ]
});

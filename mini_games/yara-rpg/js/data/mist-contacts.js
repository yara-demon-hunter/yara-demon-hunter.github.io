window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.mistContacts = Object.freeze({
    contacts: [
        {
            id: "river-spirit",
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
            id: "bell-keeper",
            name: {
                pt: "Guardião do Sino",
                en: "Bell Keeper"
            },
            message: {
                pt: "O som de um sino ecoa sem origem. Um guardião espectral oferece um pacto: “Prossiga e prove que merece sair daqui.”",
                en: "A bell rings from nowhere. A spectral keeper offers a pact: “Go on and prove you deserve to leave this place.”"
            },
            minLevel: 3
        }
    ],
    bosses: [
        {
            id: "death-soldier",
            name: {
                pt: "Soldado da Morte",
                en: "Death Soldier"
            },
            icon: "💀",
            minLevel: 2,
            suggestedLevel: 3,
            hp: 155,
            atk: 24,
            def: 10,
            parry: 30,
            evasion: 12,
            xpReward: 65,
            goldReward: 48
        },
        {
            id: "mist-dragon",
            name: {
                pt: "Dragão da Névoa",
                en: "Mist Dragon"
            },
            icon: "🐉",
            minLevel: 5,
            suggestedLevel: 6,
            hp: 360,
            atk: 46,
            def: 20,
            parry: 35,
            evasion: 16,
            xpReward: 180,
            goldReward: 140
        }
    ],
    powers: [
        {
            id: "mist-blade",
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
            id: "iron-heart",
            name: {
                pt: "Coração de Ferro",
                en: "Iron Heart"
            },
            description: {
                pt: "+25 de HP máximo e recupera 25 HP",
                en: "+25 maximum HP and restores 25 HP"
            },
            stat: "maxHp",
            amount: 25,
            currentStat: "hp"
        },
        {
            id: "stone-skin",
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

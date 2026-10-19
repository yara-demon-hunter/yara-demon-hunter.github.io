window.YaraRpgData = window.YaraRpgData || {};

window.YaraRpgData.spiritRegions = Object.freeze([
    {
        id: "spirit-world",
        sceneIcon: "👁️",
        sceneImage: "images/regions/spirit-world.webp",
        title: { pt: "Mundo Espiritual", en: "Spirit World" },
        description: {
            pt: "Por trás do olho espiritual, um lugar oculto se revela entre a névoa e as estrelas.",
            en: "Beyond the spiritual eye, a hidden place emerges between the mist and the stars."
        },
        objectives: {
            title: { pt: "Explore o Mundo Espiritual", en: "Explore the Spirit World" },
            description: {
                pt: "Encontre seu caminho por este lugar além do mundo físico.",
                en: "Find your way through this place beyond the physical world."
            },
            tasks: [
                { id: "exploration", required: 5, title: { pt: "Explore em silêncio.", en: "Explore in silence." } },
                { id: "story", title: { pt: "Encontre uma presença espiritual.", en: "Encounter a spiritual presence." } }
            ]
        },
        event: [
            {
                id: "spirit-world-fleeting-shadow",
                title: { pt: "Uma forma entre os véus", en: "A Shape Beyond the Veil" },
                description: {
                    pt: "Uma silhueta aparece ao longe. Por um instante, parece observar você.",
                    en: "A silhouette appears in the distance. For a moment, it seems to watch you."
                },
                choices: [
                    {
                        label: { pt: "Chamar por ela", en: "Call out to it" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldSpiritFled"
                    },
                    {
                        label: { pt: "Continuar em silêncio", en: "Continue in silence" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldNoAnswer"
                    }
                ]
            },
            {
                id: "spirit-world-distant-voice",
                title: { pt: "Um eco distante", en: "A Distant Echo" },
                description: {
                    pt: "Uma voz baixa atravessa a névoa, mas as palavras se perdem antes de chegar até você.",
                    en: "A faint voice crosses the mist, but its words fade before they reach you."
                },
                choices: [
                    {
                        label: { pt: "Responder ao eco", en: "Answer the echo" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldEchoFades"
                    },
                    {
                        label: { pt: "Escutar", en: "Listen" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldOnlySilence"
                    }
                ]
            },
            {
                id: "spirit-world-fading-light",
                title: { pt: "Uma luz passageira", en: "A Passing Light" },
                description: {
                    pt: "Uma pequena luz flutua entre as árvores distantes. O lugar permanece imóvel e quieto.",
                    en: "A small light drifts among distant trees. The place remains still and quiet."
                },
                choices: [
                    {
                        label: { pt: "Seguir a luz", en: "Follow the light" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldLightFades"
                    },
                    {
                        label: { pt: "Esperar", en: "Wait" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldNothingMoves"
                    }
                ]
            }
        ]
    },
    {
        id: "spirit-world-sea",
        sceneIcon: "🌊",
        sceneImage: "images/regions/spirit-world-sea.webp",
        title: { pt: "Mar dos Espíritos", en: "Spirit Sea" },
        description: {
            pt: "Um mar silencioso se estende sob estrelas refletidas. Ondas de névoa escondem tudo o que repousa abaixo.",
            en: "A silent sea stretches beneath reflected stars. Waves of mist hide everything resting below."
        },
        objectives: {
            title: { pt: "Explore o Mar dos Espíritos", en: "Explore the Spirit Sea" },
            description: {
                pt: "Siga as luzes sobre a água e escute os ecos vindos das profundezas.",
                en: "Follow the lights across the water and listen for echoes from the deep."
            },
            tasks: [
                { id: "exploration", required: 5, title: { pt: "Explore as águas espirituais.", en: "Explore the spirit waters." } },
                { id: "story", title: { pt: "Encontre uma presença no mar.", en: "Encounter a presence at sea." } }
            ]
        },
        event: [
            {
                id: "spirit-sea-bell",
                title: { pt: "O sino sob as ondas", en: "The Bell Beneath the Waves" },
                description: {
                    pt: "Um sino toca sob a superfície. Círculos de luz se afastam pelo mar, embora a água permaneça imóvel.",
                    en: "A bell rings beneath the surface. Rings of light drift across the sea, though the water remains still."
                },
                choices: [
                    {
                        label: { pt: "Acompanhar o som", en: "Follow the sound" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldSeaBellFades"
                    },
                    {
                        label: { pt: "Observar as luzes", en: "Watch the lights" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldSeaLightsFade"
                    }
                ]
            },
            {
                id: "spirit-sea-drifting-boat",
                title: { pt: "O barco à deriva", en: "The Drifting Boat" },
                description: {
                    pt: "Um pequeno barco passa sem remos nem tripulação. Uma lanterna azul balança na proa.",
                    en: "A small boat drifts by without oars or crew. A blue lantern sways at its bow."
                },
                choices: [
                    {
                        label: { pt: "Acender a lanterna", en: "Light the lantern" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldSeaLanternFades"
                    },
                    {
                        label: { pt: "Deixar o barco seguir", en: "Let the boat pass" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldSeaBoatFades"
                    }
                ]
            }
        ]
    }
]);


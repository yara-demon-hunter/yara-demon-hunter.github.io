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
                        effect: "spirit-potion",
                        foundMessageKey: "spiritWorldShadowPotionFound",
                        fullMessageKey: "spiritWorldShadowPotionFull"
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
                        effect: "spirit-potion"
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
                title: { 
                    pt: "O Barco à Deriva", 
                    en: "The Drifting Boat" 
                },
                description: {
                    pt: "Um pequeno barco passa pelo oceano de almas.",
                    en: "A small boat drifts through the ocean of souls."
                },
                choices: [
                    {
                        label: { 
                            pt: "Acenar", 
                            en: "Wave at it" 
                        },
                        effect: "spirit-message",
                        messageKey: "spiritWorldSeaLanternFades"
                    },
                    {
                        label: { 
                            pt: "Deixar o barco seguir", 
                            en: "Let the boat pass" 
                        },
                        effect: "spirit-message",
                        messageKey: "spiritWorldSeaBoatFades"
                    }
                ]
            },
            {
                id: "spirit-sea-grim-reaper-boat",
                image: "images/special_monsters/death.webp",
                title: { pt: "O Barqueiro do Além", en: "The Ferryman of Beyond" },
                description: {
                    pt: "Um barco desgastado desliza sobre a névoa. Uma figura encapuzada segura uma foice cuja lâmina se estende em um remo, impulsionando a embarcação sobre um oceano de almas murmurantes.",
                    en: "A worn boat glides over the fog. A hooded figure holds a scythe whose blade extends into an oar, propelling the vessel over an ocean of whispering souls."
                },
                choices: [
                    {
                        label: { pt: "Observar em silêncio", en: "Watch in silence" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperObserves"
                    },
                    {
                        label: { pt: "Desviar o olhar", en: "Look away" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperPasses"
                    }
                ]
            },
            {
                id: "spirit-sea-reaper-question-eye",
                image: "images/special_monsters/death.webp",
                title: { pt: "O Olhar do Barqueiro", en: "The Ferryman's Gaze" },
                description: {
                    pt: "A embarcação para abruptamente. O esqueleto encapuzado vira a caveira em sua direção e sussurra com uma voz oca: 'O que faz neste domínio? Como obteve esse olho?'",
                    en: "The boat comes to a sudden halt. The hooded skeleton turns its skull toward you and hollowly whispers: 'What brings you to this realm? How did you acquire that eye?'"
                },
                choices: [
                    {
                        label: { pt: "Explicar sua jornada", en: "Explain your journey" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperEyeExplained"
                    },
                    {
                        label: { pt: "Manter o segredo", en: "Keep the secret" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperEyeHidden"
                    }
                ]
            },
            {
                id: "spirit-sea-reaper-enigmatic-request",
                image: "images/special_monsters/death.webp",
                title: { pt: "A Busca Esquecida", en: "The Forgotten Search" },
                description: {
                    pt: "A figura detém o remo por um instante. 'Eu busco aquilo que foi levado antes da hora... uma relíquia sem nome, perdida entre os vivos. Se a encontrar e me entregar, a maré responderá a você.'",
                    en: "The figure pauses its oar for a moment. 'I seek that which was taken before its time... a nameless relic lost among the living. Bring it to me, and the tide shall answer to you.'"
                },
                choices: [
                    {
                        label: { pt: "Aceitar o pacto", en: "Accept the pact" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperPactAccepted"
                    },
                    {
                        label: { pt: "Recusar a oferta", en: "Decline the offer" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperPactRefused"
                    }
                ]
            },
            {
                id: "spirit-sea-reaper-soul-devourer",
                image: "images/special_monsters/death.webp",
                title: { pt: "O Devorador de Almas", en: "The Soul Devourer" },
                description: {
                    pt: "'O fluxo das águas está perturbado', murmura a entidade. 'No mundo dos vivos, há uma aberração que devora o que não lhe pertence e recusa a morte. A ordem precisa ser restaurada.'",
                    en: "'The flow of the waters is disturbed,' the entity whispers. 'In the realm of the living, there is an abomination that devours what is not its own and defies death. Order must be restored.'"
                },
                choices: [
                    {
                        label: { pt: "Perguntar sobre a entidade", en: "Ask about the entity" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperDevourerInfo"
                    },
                    {
                        label: { pt: "Oferecer-se para caçá-la", en: "Offer to hunt it" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperDevourerQuest"
                    }
                ]
            },
            {
                id: "spirit-sea-reaper-line-irony",
                image: "images/special_monsters/death.webp",
                title: { pt: "A Fila das Almas", en: "The Queue of Souls" },
                description: {
                    pt: "A Morte aponta a foice para a procissão de sombras agonizantes que a seguem. 'Tantos esperam pacientemente pelo seu fim... Diga-me, errante, você quer fazer parte dessa fila também?'",
                    en: "Death points its scythe toward the procession of agonizing shadows behind it. 'So many wait patiently for their end... Tell me, wanderer, do you wish to join this line as well?'"
                },
                choices: [
                    {
                        label: { pt: "Recuar com cuidado", en: "Step back carefully" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperLineStepBack"
                    },
                    {
                        label: { pt: "Responder com arrogância", en: "Respond with arrogance" },
                        effect: "spirit-message",
                        messageKey: "spiritWorldReaperLineDefy"
                    }
                ]
            }
        ]
    }
]);


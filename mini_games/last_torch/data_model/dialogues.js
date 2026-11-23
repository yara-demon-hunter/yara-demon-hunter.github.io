// --- DIÁLOGOS DOS DUELOS E DAS PROVOCAÇÕES ---
// Curtos e diretos: cada cena tem 3 falas, e a última deixa no ar que a PRÓXIMA tela será impossível (para o jogador querer ir ver).
// A história: o Demon Hunter quer parar o Azael. Azael, que não mede as palavras, foge para o castelo e faz de tudo para atrapalhar o caminho.
// DUEL_DIALOGUES (js/ui/dialogue.js): o duelo com o rival, quando ele surge (before) e quando ele cai (after). first: onda 3; final: revanche, onda 18.
// Chave: o rival. byHero: falas próprias de um herói (chave = model de data_model/heroes.js); sem ele, valem as de cima.
// who: 'rival' (o boss do duelo, ou quem provoca), 'hero' (quem o jogador controla) ou 'boss' (o chefe que chega nas provocações; o retrato dele
// toma o lugar do rival enquanto fala).
export const DUEL_DIALOGUES = {
    // Jogando com o Demon Hunter, contra o Azael
    AZAEL: {
        first: {
            before: [
                { who: 'rival', text: 'A hunter. Come to die in my forest?' },
                { who: 'hero', text: 'Your days of evil are over, Azael.' },
                { who: 'rival', text: 'Over? I am only beginning!' }
            ],
            after: [
                { who: 'rival', text: 'Curse you! Come to my castle... if you can reach it.' },
                { who: 'hero', text: 'Run. I will find you.' },
                { who: 'rival', text: 'You will never cross that river alive!' }
            ]
        },
        final: {
            before: [
                { who: 'rival', text: 'Impossible... You reached my throne.' },
                { who: 'hero', text: 'No more running, Azael.' },
                { who: 'rival', text: 'Then die here!' }
            ],
            after: [
                { who: 'rival', text: 'How... can a mere human beat me?' },
                { who: 'hero', text: 'I fought for the light.' },
                { who: 'rival', text: '...Then take your dawn.' }
            ]
        },
        byHero: {
            gudran: {
                first: {
                    before: [
                        { who: 'rival', text: 'An old man with a stick? The dark will eat you!' },
                        { who: 'hero', text: 'I buried better demons than you, boy.' },
                        { who: 'rival', text: 'Then bleed like a king!' }
                    ],
                    after: [
                        { who: 'rival', text: 'Damn you, old man! My castle awaits... if you survive the road.' },
                        { who: 'hero', text: 'A king hunts what flees him.' },
                        { who: 'rival', text: 'You will never cross that river alive!' }
                    ]
                },
                final: {
                    before: [
                        { who: 'rival', text: 'You reached my castle? Old fool!' },
                        { who: 'hero', text: 'This kingdom is mine.' },
                        { who: 'rival', text: 'Then die in it!' }
                    ],
                    after: [
                        { who: 'rival', text: 'A king without a crown... and I cannot break you.' },
                        { who: 'hero', text: 'A crown is only metal.' },
                        { who: 'rival', text: '...The night is yours, my lord.' }
                    ]
                }
            },
            brutos: {
                first: {
                    before: [
                        { who: 'rival', text: 'A captain with an axe? Brave... or stupid.' },
                        { who: 'hero', text: 'Azael. Come closer.' },
                        { who: 'rival', text: 'Gladly. I will carve you!' }
                    ],
                    after: [
                        { who: 'rival', text: 'You hit like a falling wall! My castle awaits, Captain... if you reach it.' },
                        { who: 'hero', text: 'Then I will knock the gate down.' },
                        { who: 'rival', text: 'You will never cross that river alive!' }
                    ]
                },
                final: {
                    before: [
                        { who: 'rival', text: 'You made it to my castle, Captain?!' },
                        { who: 'hero', text: 'I end it here.' },
                        { who: 'rival', text: 'Then die at my gate!' }
                    ],
                    after: [
                        { who: 'rival', text: 'A wall that walks... How do I break you?' },
                        { who: 'hero', text: 'You do not.' },
                        { who: 'rival', text: '...The night is yours, Captain.' }
                    ]
                }
            },
            rowan: {
                first: {
                    before: [
                        { who: 'rival', text: 'A druid? Go home and water your flowers!' },
                        { who: 'hero', text: 'Azael. Leave the forest in peace.' },
                        { who: 'rival', text: 'Peace is for the dead!' }
                    ],
                    after: [
                        { who: 'rival', text: 'Roots and roses... Curse you! My castle awaits, druid, if you survive the road.' },
                        { who: 'hero', text: 'I will come. Only to stop you.' },
                        { who: 'rival', text: 'You will never cross that river alive!' }
                    ]
                },
                final: {
                    before: [
                        { who: 'rival', text: 'You reached my castle, druid?!' },
                        { who: 'hero', text: 'It does not have to end in blood.' },
                        { who: 'rival', text: 'It will!' }
                    ],
                    after: [
                        { who: 'rival', text: 'How does something so gentle keep winning?' },
                        { who: 'hero', text: 'Patience. Rest now.' },
                        { who: 'rival', text: '...The night is yours, druid.' }
                    ]
                }
            },
            avgustino: {
                first: {
                    before: [
                        { who: 'rival', text: 'A priest? Save your sermon for the grave!' },
                        { who: 'hero', text: 'I know what you are, Azael.' },
                        { who: 'rival', text: 'Then pray, father!' }
                    ],
                    after: [
                        { who: 'rival', text: 'Impossible... A priest?! Find me at my castle, if you survive the road.' },
                        { who: 'hero', text: 'Whatever it costs me, I will.' },
                        { who: 'rival', text: 'You will never cross that river alive!' }
                    ]
                },
                final: {
                    before: [
                        { who: 'rival', text: 'You reached my castle, priest?!' },
                        { who: 'hero', text: 'I will stop you. At any cost.' },
                        { who: 'rival', text: 'Even your soul?' }
                    ],
                    after: [
                        { who: 'rival', text: 'I laughed at you... I was wrong.' },
                        { who: 'hero', text: 'I already paid the price.' },
                        { who: 'rival', text: '...Keep your flame, priest.' }
                    ]
                }
            }
        }
    },
    // Jogando com o Azael, contra o Demon Hunter
    DEMON_HUNTER: {
        first: {
            before: [
                { who: 'rival', text: 'A demon with a torch? Lies!' },
                { who: 'hero', text: 'I hunt my own kind. Move.' },
                { who: 'rival', text: 'My blade will decide.' }
            ],
            after: [
                { who: 'rival', text: 'Curse you, demon...' },
                { who: 'hero', text: 'You hunt the wrong enemy.' },
                { who: 'rival', text: 'A demon is a demon. We are not done!' }
            ]
        },
        final: {
            before: [
                { who: 'rival', text: 'I came back, demon.' },
                { who: 'hero', text: 'You still do not see the enemy.' },
                { who: 'rival', text: 'Then show me.' }
            ],
            after: [
                { who: 'rival', text: 'A demon... guarding the flame?' },
                { who: 'hero', text: 'We hunt the same darkness.' },
                { who: 'rival', text: '...Go. I will be watching.' }
            ]
        }
    }
};

// Segundos por letra no efeito de máquina de escrever
export const DIALOGUE_TYPE_SECONDS = 0.01;

// --- PROVOCAÇÕES ANTES DOS CHEFES ---
// Nas horas de boss que não são o duelo, quando a onda fecha, a caçada congela e o rival provoca antes de soltar o monstro (js/ui/dialogue.js,
// playBossIntro). Chave: quem fala (o rival do herói, RIVAL_OF em bosses.js) e depois o boss que vem. default: boss sem fala própria.
// A última fala de cada cena aponta para a PRÓXIMA tela e a faz parecer impossível.
export const BOSS_INTROS = {
    // Jogando com o Demon Hunter: o Azael foge para o castelo e solta o que tem pelo caminho
    AZAEL: {
        LAKE_SPIRIT: [
            { who: 'rival', text: 'The lake drowns every hunter!' },
            { who: 'boss', text: 'Stay... with me...' },
            { who: 'rival', text: 'And beyond it, the swamp finishes what is left!' }
        ],
        SLIZORK: [
            { who: 'rival', text: 'This swamp swallowed armies. You are a snack!' },
            { who: 'hero', text: 'Then it will choke.' },
            { who: 'rival', text: 'And the graveyard ahead? Nobody walks out!' }
        ],
        GRAVE_KING: [
            { who: 'rival', text: 'Every grave here was dug for you!' },
            { who: 'hero', text: 'I will not lie in one.' },
            { who: 'rival', text: 'And the village gate will crush what is left!' }
        ],
        BRUTOS: [
            { who: 'rival', text: 'Brutos! Break him! Beyond you waits my castle, and nobody enters alive!' },
            { who: 'boss', text: 'I will break him.' },
            { who: 'hero', text: 'Come, Captain.' }
        ],
        LONG_NIGHT: [
            { who: 'rival', text: 'You cannot cut the night, hunter!' },
            { who: 'hero', text: 'Dawn is coming.' },
            { who: 'rival', text: 'Not for you. Never for you!' }
        ],
        BLOOD_COUNTESS: [
            { who: 'rival', text: 'Welcome to my castle... and to your grave!' },
            { who: 'hero', text: 'Show yourself, Azael!' },
            { who: 'rival', text: 'First my Countess. Then the night itself!' }
        ],
        default: [
            { who: 'rival', text: 'Still on my trail? Do you ever die?' },
            { who: 'hero', text: 'Not before you.' },
            { who: 'rival', text: 'Then meet this one!' }
        ],
        // Cada herói tem a sua voz (nunca as falas de outro): o Azael chama cada um pelo apelido que escolheu para ele
        byHero: {
            // Rowan: calmo, gentil, fala da floresta e da paz, mas não recua
            rowan: {
                LAKE_SPIRIT: [
                    { who: 'rival', text: 'The lake drowns every druid, too!' },
                    { who: 'hero', text: 'Water remembers kindness. Please, rest.' },
                    { who: 'rival', text: 'And the swamp beyond rots every root you love!' }
                ],
                SLIZORK: [
                    { who: 'rival', text: 'Water your flowers in my swamp, druid!' },
                    { who: 'hero', text: 'Even the mire is alive. I will not hate it.' },
                    { who: 'rival', text: 'The graveyard ahead buries gentle fools!' }
                ],
                GRAVE_KING: [
                    { who: 'rival', text: 'No tree grows here, druid. Only bones!' },
                    { who: 'hero', text: 'Then I will plant one for you.' },
                    { who: 'rival', text: 'The village gate will burn your forest down!' }
                ],
                BRUTOS: [
                    { who: 'rival', text: 'Brutos! Snap this druid! My castle is next!' },
                    { who: 'boss', text: 'A flower picker? I will break him.' },
                    { who: 'hero', text: 'Please, Captain. Walk away.' }
                ],
                LONG_NIGHT: [
                    { who: 'rival', text: 'Even your forest dies in the dark!' },
                    { who: 'hero', text: 'Every night ends, Azael.' },
                    { who: 'rival', text: 'Not this one. Never this one!' }
                ],
                BLOOD_COUNTESS: [
                    { who: 'rival', text: 'My castle, druid. No forest here! Meet my Countess!' },
                    { who: 'hero', text: 'Then I bring one with me.' },
                    { who: 'rival', text: 'And then the endless night!' }
                ],
                default: [
                    { who: 'rival', text: 'Still alive, druid?!' },
                    { who: 'hero', text: 'The forest wants me to stay.' },
                    { who: 'rival', text: 'Then the forest dies with you!' }
                ]
            },
            // Avgustino: padre contido, fala pouco, fé e um preço que nunca explica
            avgustino: {
                LAKE_SPIRIT: [
                    { who: 'rival', text: 'The lake will drown your prayers, priest!' },
                    { who: 'hero', text: 'Then I will pray underwater.' },
                    { who: 'rival', text: 'And the swamp will bury your God!' }
                ],
                SLIZORK: [
                    { who: 'rival', text: 'Say a prayer for this swamp, priest!' },
                    { who: 'hero', text: 'I already said one. For you.' },
                    { who: 'rival', text: 'The graveyard ahead has no priest left!' }
                ],
                GRAVE_KING: [
                    { who: 'rival', text: 'Bury yourself, priest. They are waiting!' },
                    { who: 'hero', text: 'Not yet. Not for you.' },
                    { who: 'rival', text: 'The village gate will close on your God!' }
                ],
                BRUTOS: [
                    { who: 'rival', text: 'Brutos! Silence this priest! My castle is next!' },
                    { who: 'boss', text: 'A priest? I will break him.' },
                    { who: 'hero', text: 'I do not break, Captain. I paid for that.' }
                ],
                LONG_NIGHT: [
                    { who: 'rival', text: 'No prayer reaches the Long Night!' },
                    { who: 'hero', text: 'I do not need it to reach. Only to burn.' },
                    { who: 'rival', text: 'Then burn alone!' }
                ],
                BLOOD_COUNTESS: [
                    { who: 'rival', text: 'My castle, priest. God is not home! Meet my Countess!' },
                    { who: 'hero', text: 'I did not come for Him. I came for you.' },
                    { who: 'rival', text: 'And then the endless night!' }
                ],
                default: [
                    { who: 'rival', text: 'Still standing, priest?!' },
                    { who: 'hero', text: 'Until the last of you falls.' },
                    { who: 'rival', text: 'Then fall with this one!' }
                ]
            },
            // Gudran: velho senhor do castelo, arrogante, acostumado a ser obedecido
            gudran: {
                LAKE_SPIRIT: [
                    { who: 'rival', text: 'The lake drowns old kings, too!' },
                    { who: 'hero', text: 'Water bends to the crown, boy.' },
                    { who: 'rival', text: 'And the swamp swallows your whole court!' }
                ],
                SLIZORK: [
                    { who: 'rival', text: 'Kneel to the swamp, old man!' },
                    { who: 'hero', text: 'I kneel to nothing.' },
                    { who: 'rival', text: 'The graveyard ahead has your name!' }
                ],
                GRAVE_KING: [
                    { who: 'rival', text: 'Your throne is a grave, old king!' },
                    { who: 'hero', text: 'Then I rule it.' },
                    { who: 'rival', text: 'The village gate will not open for you!' }
                ],
                BRUTOS: [
                    { who: 'rival', text: 'Brutos! Drag this old man down! My castle is next!' },
                    { who: 'boss', text: 'An old man? I will break him.' },
                    { who: 'hero', text: 'Kneel, Captain. I am your king.' }
                ],
                LONG_NIGHT: [
                    { who: 'rival', text: 'Even kings die in the dark!' },
                    { who: 'hero', text: 'Kings outlast it.' },
                    { who: 'rival', text: 'Not this night. Never this one!' }
                ],
                BLOOD_COUNTESS: [
                    { who: 'rival', text: 'My castle now, old man. Meet my Countess!' },
                    { who: 'hero', text: 'It was mine first.' },
                    { who: 'rival', text: 'And then the endless night!' }
                ],
                default: [
                    { who: 'rival', text: 'Still standing, old fool?!' },
                    { who: 'hero', text: 'I do not fall in front of boys.' },
                    { who: 'rival', text: 'Then fall behind this one!' }
                ]
            },
            // Brutos: capitão bruto, pouco papo, vai direto ao ponto (nunca enfrenta a si mesmo: na onda 15 vem a Countess)
            brutos: {
                LAKE_SPIRIT: [
                    { who: 'rival', text: 'The lake drowns captains, too!' },
                    { who: 'hero', text: 'I do not swim. I walk.' },
                    { who: 'rival', text: 'And the swamp swallows your whole axe!' }
                ],
                SLIZORK: [
                    { who: 'rival', text: 'Swing your axe at the swamp, Captain!' },
                    { who: 'hero', text: 'Gladly.' },
                    { who: 'rival', text: 'The graveyard ahead has no exit!' }
                ],
                GRAVE_KING: [
                    { who: 'rival', text: 'Dead men do not fear axes, Captain!' },
                    { who: 'hero', text: 'Then I chop them twice.' },
                    { who: 'rival', text: 'The village gate will not open for you!' }
                ],
                BRUTOS: [
                    { who: 'rival', text: 'Captain, meet the Captain!' },
                    { who: 'boss', text: 'Move.' },
                    { who: 'hero', text: 'You move.' }
                ],
                LONG_NIGHT: [
                    { who: 'rival', text: 'Your axe cannot cut the night!' },
                    { who: 'hero', text: 'Wait and see.' },
                    { who: 'rival', text: 'Not this one. Never this one!' }
                ],
                BLOOD_COUNTESS: [
                    { who: 'rival', text: 'My castle, Captain. Meet my Countess!' },
                    { who: 'hero', text: 'Hungry? Come eat.' },
                    { who: 'rival', text: 'And then the endless night!' }
                ],
                DEMON_LORD: [
                    { who: 'rival', text: 'The village gate is yours, Captain. Meet the Lord of the First Fire!' },
                    { who: 'hero', text: 'Watch me.' },
                    { who: 'rival', text: 'Beyond him, my castle. Nobody enters alive!' }
                ],
                default: [
                    { who: 'rival', text: 'Still standing, Captain?!' },
                    { who: 'hero', text: 'Still swinging.' },
                    { who: 'rival', text: 'Swing at this one!' }
                ]
            }
        }
    },
    // Jogando com o Azael: o Demon Hunter assiste e desafia
    DEMON_HUNTER: {
        LAKE_SPIRIT: [
            { who: 'rival', text: 'The lake is waking, demon. It wants you.' },
            { who: 'hero', text: 'Let it try.' },
            { who: 'rival', text: 'And the swamp beyond will not be kinder.' }
        ],
        SLIZORK: [
            { who: 'rival', text: 'The swamp itself is rising, demon.' },
            { who: 'hero', text: 'Let it come.' },
            { who: 'rival', text: 'The graveyard ahead has no exit.' }
        ],
        GRAVE_KING: [
            { who: 'rival', text: 'The dead follow their king, demon.' },
            { who: 'hero', text: 'Back into the ground, then.' },
            { who: 'rival', text: 'And the village beyond will not open for you.' }
        ],
        BRUTOS: [
            { who: 'rival', text: 'Captain Brutos! Do not let him pass!' },
            { who: 'boss', text: 'He will not.' },
            { who: 'hero', text: 'Move, or be moved.' }
        ],
        LONG_NIGHT: [
            { who: 'rival', text: 'The darkness itself is waking.' },
            { who: 'hero', text: 'Stand back and watch.' },
            { who: 'rival', text: 'If you fall, I finish what is left.' }
        ],
        BLOOD_COUNTESS: [
            { who: 'rival', text: 'The castle is ahead, demon. Its Countess is thirsty.' },
            { who: 'hero', text: 'Then she will choke on it.' },
            { who: 'rival', text: 'Prove it.' }
        ],
        default: [
            { who: 'rival', text: 'Another one crawls out of the dark.' },
            { who: 'hero', text: 'And another falls.' },
            { who: 'rival', text: 'Do not expect my help.' }
        ]
    }
};

// --- DIÁLOGOS DOS DUELOS ---
// Mostrados quando o rival surge e quando ele cai (js/ui/dialogue.js): o retrato de quem fala acende e o texto vem embaixo.
// Chave: o rival (BOSS_MODELS). first: o duelo da hora 1; final: a revanche da hora 12.
// Cada duelo tem before (quando o rival surge, antes da luta) e after (quando ele cai).
// byHero: falas próprias de um herói (chave = model de data_model/heroes.js) contra esse rival; sem ele, valem as de cima.
// who: 'rival' (o boss do duelo, ou quem provoca), 'hero' (quem o jogador controla) ou 'boss' (o boss que chega nas
// provocações, ex.: Captain Brutos; o retrato dele toma o lugar do rival enquanto fala).
export const DUEL_DIALOGUES = {
    // Jogando com o Demon Hunter, contra o Azael
    AZAEL: {
        first: {
            before: [
                { who: 'rival', text: 'A hunter, guarding a little flame in the dark. How touching.' },
                { who: 'hero', text: 'Azael. I have been waiting for you.' },
                { who: 'rival', text: 'Then let us see if your blade is as sharp as your tongue.' }
            ],
            after: [
                { who: 'rival', text: 'You beat me this time, hunter... but I will come back stronger.' },
                { who: 'hero', text: 'Then come back. The torch will still be burning.' },
                { who: 'rival', text: 'Before dawn. Count on it.' }
            ]
        },
        final: {
            before: [
                { who: 'rival', text: 'I told you I would return, hunter. The night is almost over.' },
                { who: 'hero', text: 'Then this is the last time we cross blades.' },
                { who: 'rival', text: 'Yes. One of us will not see the dawn.' }
            ],
            after: [
                { who: 'rival', text: 'Again... How does a mere human keep beating me?' },
                { who: 'hero', text: 'I am not fighting for myself. I am fighting for the light.' },
                { who: 'rival', text: 'Then keep your little flame, hunter. This night is yours.' }
            ]
        },
        // Falas próprias de outros heróis contra o Azael (byHero[model], com a mesma forma de first e final)
        byHero: {
            brutos: {
                first: {
                    before: [
                        { who: 'rival', text: 'A captain with an axe, guarding a little flame. Brave... or foolish.' },
                        { who: 'hero', text: 'Azael. Come closer.' },
                        { who: 'rival', text: 'Gladly. Let us see how hard that axe really hits.' }
                    ],
                    after: [
                        { who: 'rival', text: 'You hit like a falling wall... I will be back, Captain.' },
                        { who: 'hero', text: 'Bring a bigger blade.' },
                        { who: 'rival', text: 'Before dawn. Count on it.' }
                    ]
                },
                final: {
                    before: [
                        { who: 'rival', text: 'I told you I would return, Captain. The night is almost over.' },
                        { who: 'hero', text: 'Then I end it here.' },
                        { who: 'rival', text: 'One of us will not see the dawn.' }
                    ],
                    after: [
                        { who: 'rival', text: 'Again... A wall that walks. How do I break you?' },
                        { who: 'hero', text: 'You do not. Keep to the dark.' },
                        { who: 'rival', text: '...This night is yours, Captain.' }
                    ]
                }
            }
        }
    },
    // Jogando com o Azael, contra o Demon Hunter
    DEMON_HUNTER: {
        first: {
            before: [
                { who: 'rival', text: 'A demon tending a torch? You will not fool me.' },
                { who: 'hero', text: 'I hunt my own kind, hunter. Step aside.' },
                { who: 'rival', text: 'Every demon says that. My blade will decide.' }
            ],
            after: [
                { who: 'rival', text: 'You beat me this time, demon... but I will come back stronger.' },
                { who: 'hero', text: 'Come back as often as you like. You are not the one I hunt.' },
                { who: 'rival', text: 'A demon is a demon. Before dawn, I will prove it.' }
            ]
        },
        final: {
            before: [
                { who: 'rival', text: 'I came back, demon. Stronger, as I promised.' },
                { who: 'hero', text: 'You still have not learned who the real enemy is.' },
                { who: 'rival', text: 'Then teach me. With your blade.' }
            ],
            after: [
                { who: 'rival', text: 'Again... A demon who guards the flame?' },
                { who: 'hero', text: 'I told you. We hunt the same darkness.' },
                { who: 'rival', text: '...Go, then. But I will be watching you, Azael.' }
            ]
        }
    }
};

// Segundos por letra no efeito de máquina de escrever
export const DIALOGUE_TYPE_SECONDS = 0.022;

// --- PROVOCAÇÃO ANTES DE CADA BOSS ---
// Nas horas de boss que não são o duelo (Demon Lord, Blood Countess, The Long Night e os do modo sem fim), quando a
// onda fecha, a caçada congela e o rival aparece provocando antes de soltar o monstro (js/ui/dialogue.js, playBossIntro).
// Chave: quem fala (o rival do herói, RIVAL_OF em bosses.js) e depois o boss que vem. default: boss sem fala própria.
export const BOSS_INTROS = {
    // Jogando com o Demon Hunter: o Azael solta os monstros dele
    AZAEL: {
        DEMON_LORD: [
            { who: 'rival', text: 'You seem to be holding up well, hunter...' },
            { who: 'hero', text: 'Show yourself, Azael. Stop hiding in the dark.' },
            { who: 'rival', text: 'Not yet. First, let us see if you can destroy my beast.' }
        ],
        BLOOD_COUNTESS: [
            { who: 'rival', text: 'Still standing? The night is growing tired of you.' },
            { who: 'hero', text: 'Then send whatever you have left.' },
            { who: 'rival', text: 'Gladly. My Countess is thirsty... try not to bleed too fast.' }
        ],
        // Semi-boss do meio da noite: o Azael o chama e o capitão responde com uma frase curta
        BRUTOS: [
            { who: 'rival', text: 'Enough games. Captain Brutos! This hunter is yours.' },
            { who: 'boss', text: 'I will break him.' },
            { who: 'hero', text: 'Then come and try, Captain.' }
        ],
        LONG_NIGHT: [
            { who: 'rival', text: 'Impressive. But not even you can fight the night itself.' },
            { who: 'hero', text: 'Dawn is close. I can feel it.' },
            { who: 'rival', text: 'Then meet the Long Night... and pray the dawn still comes.' }
        ],
        default: [
            { who: 'rival', text: 'Dawn came and went, and still you fight.' },
            { who: 'hero', text: 'As long as the torch burns.' },
            { who: 'rival', text: 'Then let us see how long it burns against this one.' }
        ]
    },
    // Jogando com o Azael: o Demon Hunter assiste e desafia
    DEMON_HUNTER: {
        DEMON_LORD: [
            { who: 'rival', text: 'You cut down your own kind well, demon...' },
            { who: 'hero', text: 'Watching from the shadows now, hunter?' },
            { who: 'rival', text: 'Their lord is coming for you. Let us see whose side you are really on.' }
        ],
        BLOOD_COUNTESS: [
            { who: 'rival', text: 'Something old is coming, Azael. It can smell your blood.' },
            { who: 'hero', text: 'Then it will choke on it.' },
            { who: 'rival', text: 'Prove it. I will be right here, blade ready.' }
        ],
        // Semi-boss do meio da noite: o Demon Hunter o chama e o capitão responde com uma frase curta
        BRUTOS: [
            { who: 'rival', text: 'Captain Brutos! The demon is yours. Do not let him pass.' },
            { who: 'boss', text: 'He will not.' },
            { who: 'hero', text: 'Move, then, or be moved.' }
        ],
        LONG_NIGHT: [
            { who: 'rival', text: 'The darkness itself is waking. Not even I can stop it.' },
            { who: 'hero', text: 'Then stand back and watch, hunter.' },
            { who: 'rival', text: 'If you fall, I will finish what is left of you both.' }
        ],
        default: [
            { who: 'rival', text: 'Another one crawls out of the dark, demon.' },
            { who: 'hero', text: 'And another one falls.' },
            { who: 'rival', text: 'We will see. Do not expect my help.' }
        ]
    }
};

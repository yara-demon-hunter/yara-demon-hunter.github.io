// --- DIÁLOGOS DOS DUELOS ---
// Mostrados quando o rival surge e quando ele cai (js/ui/dialogue.js): o retrato de quem fala acende e o texto vem embaixo.
// Chave: o rival (BOSS_MODELS). first: o duelo da hora 1; final: a revanche da hora 12.
// Cada duelo tem before (quando o rival surge, antes da luta) e after (quando ele cai).
// who: 'rival' (o boss) ou 'hero' (quem o jogador controla).
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

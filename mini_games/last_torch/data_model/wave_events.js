// --- EVENTOS DE ONDA ---
// A 2ª onda de cada tela (a do meio, entre a de aquecimento e a do chefe) traz UM evento que muda a regra da caçada, para a noite não ser
// sempre "mate até bater a cota". Quem sorteia e dispara é js/systems/wave_events.js; os valores abaixo são todos ajustáveis aqui.
// A 1ª tela (Dark Forest) sempre abre com o Goblin do Baú (o evento mais amigável: perseguir vale baú). Depois o sorteio nunca repete o evento anterior.
//   at: fração da onda (waveProgress: 0 a 1) em que o evento começa
export const WAVE_EVENTS = {
    goblin: {
        name: 'CATCH THE GOBLIN', sub: 'He carries a treasure chest. Catch him before he vanishes!', banner: 'goblin', at: 0.3,
        staySeconds: 20,          // quanto tempo ele fica na tela; depois dá a última risada e some (com o baú)
        hpMultiplier: 1,          // vida extra em cima da do modelo CHEST_GOBLIN (data_model/monsters.js): ele tem bastante vida de propósito
        orbitX: 360, orbitY: 260, // elipse em volta da tocha em que ele roda (maior = mais longe da tocha; o jogo limita ao tamanho da tela)
        orbitSpeed: 0.5,          // radianos por segundo
        visibleSeconds: [2.9, 4.1],   // quanto tempo fica à vista antes de dar blink (20% a mais que antes: 2,4 a 3,4)
        // Se a órbita bate numa área que bloqueia (rio, parede, prédio: áreas de contato do cenário), ele dá blink na hora para um ponto livre
        fadeSeconds: 0.3,         // some (blink out)
        goneSeconds: [0.6, 1.0],  // invisível e sem poder ser atingido; depois reaparece em outro ponto da órbita
        jumpAngle: [1.0, 2.4],    // quanto da órbita ele salta a cada blink (radianos)
        // O tesouro (se for morto): o baú dá skillPoints garantidos e uma CHUVA de moedas (coins moedas visuais dividindo o ouro). Cada moeda
        // coletada toca o som de moeda, que sobe de tom em sequência: o barulho de "ganhei muito"
        treasure: { skillPoints: 2, coins: 28, goldBase: 150, goldPerCurveTurn: 40, scatterSpeed: [120, 330] }
    },
    flank: {
        name: 'THEY COME FOR THE FLAME', sub: 'A wave from the {side}: protect the torch!', at: 0.45,
        baseCount: 7, perCurveTurn: 0.6
    },
    dark: {
        name: 'THE LIGHT FAILS', sub: 'Stay in the torchlight', at: 0.4,
        seconds: 14, strength: 0.8, innerRadius: 90, outerRadius: 260
    },
    meteors: {
        name: 'STARFALL', sub: 'Watch the red circles', at: 0.25, until: 0.85,
        everySeconds: 6.5, baseCount: 3, perCurveTurn: 0.25, maxCount: 6,
        radius: 56, warnSeconds: 1.35, damage: 22          // damage x multiplicador de dano da onda
    }
};

// Primeira tela: sempre o Goblin do Baú
export const FIRST_SCREEN_EVENT = 'goblin';

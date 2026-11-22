import { MAP_LAYOUT } from './map_layout.js';

// --- A CAMPANHA: 6 TELAS ---
// A partida percorre 6 telas, na ordem do mapa (images/map/map.webp): Dark Forest -> River Crossing -> Swamp -> Graveyard -> Village -> Castle.
// Cada tela tem `wavesPerScreen` ondas; a última é a do chefe (data_model/bosses.js, BOSS_SPAWNING). Matou o chefe: o mapa aparece, o retrato do herói
// anda pelo caminho até a tela seguinte (js/ui/map_screen.js) e a próxima tela começa. Depois do Castle (onda 30) vem o amanhecer.
//
// node: onde a tela fica no mapa; leg: o caminho (pontos) daqui até a PRÓXIMA tela (em map_layout.js, em pixels da imagem do mapa).
export const CAMPAIGN = {
    wavesPerScreen: 5,
    map: { src: 'images/map/map.webp', size: [1375, 767] },
    // Nomes, nós e caminhos das telas moram em map_layout.js (o editor do mapa grava lá)
    screens: MAP_LAYOUT.screens
};

// O sandbox escolhe o cenário à mão: ele desliga a troca automática por tela
export const CAMPAIGN_RUNTIME = { enabled: true };

export const TOTAL_WAVES = CAMPAIGN.screens.length * CAMPAIGN.wavesPerScreen;

// Índice da tela de uma onda (depois da última, fica no Castle: modo sem fim)
export const screenIndexOf = (turn) => Math.max(0, Math.min(CAMPAIGN.screens.length - 1, Math.floor((turn - 1) / CAMPAIGN.wavesPerScreen)));
export const screenOfTurn = (turn) => CAMPAIGN.screens[screenIndexOf(turn)];
// Onda dentro da tela (1 a 5)
export const waveInScreen = (turn) => ((turn - 1) % CAMPAIGN.wavesPerScreen) + 1;
// Esta onda abre uma tela nova (e não é a primeira da partida)?
export const startsNewScreen = (turn) => turn > 1 && turn <= TOTAL_WAVES && (turn - 1) % CAMPAIGN.wavesPerScreen === 0;

// A curva de dificuldade (vida, dano, velocidade, pontos da onda, quando cada monstro libera) foi feita para uma noite de 12 ondas. Com 30 ondas ela é
// ESTICADA: a onda 30 pesa como pesava a 12. effectiveTurn converte a onda de agora na "onda da curva". Depois da 30 (sem fim) a curva segue subindo.
const OLD_NIGHT = 12;
export const effectiveTurn = (turn) => 1 + (Math.max(1, turn) - 1) * ((OLD_NIGHT - 1) / (TOTAL_WAVES - 1));

// --- MONSTROS DA TELA: River Crossing ---
// Quem pode nascer nesta tela (e só nesta). Edite à vontade; as zonas de nascimento ficam no Ateliê de cenários.
// QUEM nasce aqui é definido pelas zonas verdes da tela no Ateliê (campo "tipos" de cada zona): não liste monstros novos neste arquivo.
// Aqui só se ajusta o que as zonas não dizem:
//   monsters: { type, from, weight }  from = a partir de qual onda DA TELA (1 a 3) o monstro entra (padrão 1; Treant/Golem/Bone Colossus: 3);
//             weight = chance (padrão: o spawnWeight do monstro). Esta lista é a das zonas verdes de hoje: serve de reserva (tela sem zonas com tipos) e para preparar os sprites da tela.
//   elites:   tipos que podem virar elite aqui (só os que existem nas zonas)
//   hordes:   tipos das hordas quando a sorteada não pertence à tela
export const SCREEN = {
    id: 'river_crossing_2',
    monsters: [
        { type: 'BAT', from: 1 },
        { type: 'DROWNED', from: 2 },
        { type: 'MOTH', from: 2 },
        { type: 'RIVER_EEL', from: 1 },
        { type: 'SHADOW_WOLF', from: 3 },
        { type: 'VAMPIRE', from: 1 },
        { type: 'WITCH', from: 1 },
        { type: 'WRAITH', from: 1 }
    ],
    elites: ['DROWNED', 'RIVER_EEL'],
    hordes: ['DROWNED', 'BAT']
};

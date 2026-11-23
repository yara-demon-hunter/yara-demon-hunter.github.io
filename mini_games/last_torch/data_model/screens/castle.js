// --- MONSTROS DA TELA: Castle ---
// Quem pode nascer nesta tela (e só nesta). Edite à vontade; as zonas de nascimento ficam no Ateliê de cenários.
// QUEM nasce aqui é definido pelas zonas verdes da tela no Ateliê (campo "tipos" de cada zona): não liste monstros novos neste arquivo.
// Aqui só se ajusta o que as zonas não dizem:
//   monsters: { type, from, weight }  from = a partir de qual onda DA TELA (1 a 3) o monstro entra (padrão 1; Treant/Golem/Bone Colossus: 3);
//             weight = chance (padrão: o spawnWeight do monstro). Esta lista é a das zonas verdes de hoje: serve de reserva (tela sem zonas com tipos) e para preparar os sprites da tela.
//   elites:   tipos que podem virar elite aqui (só os que existem nas zonas)
//   hordes:   tipos das hordas quando a sorteada não pertence à tela
export const SCREEN = {
    id: 'castle_gate_2',
    monsters: [
        { type: 'BAT', from: 1 },
        { type: 'BLOATER', from: 1 },
        { type: 'BONE_COLOSSUS', from: 3 },
        { type: 'DEMON', from: 2 },
        { type: 'GOLEM', from: 3 },
        { type: 'HEADLESS_KNIGHT', from: 2 },
        { type: 'LANCER', from: 1 },
        { type: 'MOTH', from: 1 },
        { type: 'NECROMANCER', from: 3 },
        { type: 'PLATE_KNIGHT', from: 1 },
        { type: 'SHADOW_WOLF', from: 1 },
        { type: 'SKELETON', from: 1 },
        { type: 'SKELETON_CRAWLER', from: 1 },
        { type: 'TREANT', from: 3 },
        { type: 'VAMPIRE', from: 1 },
        { type: 'WITCH', from: 1 },
        { type: 'WRAITH', from: 2 },
        { type: 'ZOMBIE_WOLF', from: 1 }
    ],
    elites: ['LANCER', 'HEADLESS_KNIGHT'],
    hordes: ['LANCER', 'DEMON']
};

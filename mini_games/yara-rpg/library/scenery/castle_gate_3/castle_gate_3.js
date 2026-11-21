// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/castle_gate_3/castle_gate_3.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../castle_gate/castle_gate.js';
import { CASTLE_GATE_3_VISUALS as F } from './castle_gate_3_visual.js';

// --- CENÁRIO: PÁTIO REAL ILUMINADO (castle_gate_3) ---
// Variante 3 de `castle_gate`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'castle_gate_3', name: 'Pátio Real Iluminado', visual: F, paintBase }));

import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../castle_gate/castle_gate.js';
import { CASTLE_GATE_2_VISUALS as F } from './castle_gate_2_visual.js';

// --- CENÁRIO: PÁTIO DO CASTELO EM RUÍNAS (castle_gate_2) ---
// Variante 2 de `castle_gate`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'castle_gate_2', name: 'Pátio do Castelo em Ruínas', visual: F, paintBase }));

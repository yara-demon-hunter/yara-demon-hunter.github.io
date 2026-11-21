import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../village_gate/village_gate.js';
import { VILLAGE_GATE_2_VISUALS as F } from './village_gate_2_visual.js';

// --- CENÁRIO: ENTRADA DA VILA EM CHAMAS (village_gate_2) ---
// Variante 2 de `village_gate`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'village_gate_2', name: 'Entrada da Vila em Chamas', visual: F, paintBase }));

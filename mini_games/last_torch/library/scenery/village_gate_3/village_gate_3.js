// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/village_gate_3/village_gate_3.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../village_gate/village_gate.js';
import { VILLAGE_GATE_3_VISUALS as F } from './village_gate_3_visual.js';

// --- CENÁRIO: ENTRADA DA VILA SOB A CHUVA (village_gate_3) ---
// Variante 3 de `village_gate`: o chão vem do mesmo desenho, o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'village_gate_3', name: 'Entrada da Vila sob a Chuva', visual: F, paintBase }));

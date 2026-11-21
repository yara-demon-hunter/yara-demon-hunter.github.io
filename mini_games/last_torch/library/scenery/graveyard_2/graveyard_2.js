// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/graveyard_2/graveyard_2.js e rode o sync.
import { registerScenery } from '../scenery.js';
import { composeScenery } from '../compose.js';
import { paintBase } from '../graveyard/graveyard.js';
import { GRAVEYARD_2_VISUALS as F } from './graveyard_2_visual.js';

// --- CENÁRIO: CEMITÉRIO SOB A LUA CHEIA (graveyard_2) ---
// Variante 2 de `graveyard`: o chão vem do mesmo desenho; o clima e a receita de peças são daqui. Ficha: art_reference/scenery.md.
registerScenery(composeScenery({ id: 'graveyard_2', name: 'Cemitério sob a Lua Cheia', visual: F, paintBase }));

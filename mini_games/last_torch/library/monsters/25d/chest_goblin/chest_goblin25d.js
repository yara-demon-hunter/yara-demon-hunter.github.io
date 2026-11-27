// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/chest_goblin/chest_goblin25d.js e rode o sync.
import { CHEST_GOBLIN_25D_VISUALS as S } from './chest_goblin25d_visual.js';
import { registerHuman, renderHuman25D } from '../human25d.js';

// --- GOBLIN DO BAÚ 2.5D ---
// Goblin pequeno e sorridente com o baú do Treasure amarrado nas costas. Não ataca: dá risada, roda em volta da tocha e some e reaparece (a regra fica no jogo).
// Uso: renderChestGoblin25D(e). Medidas e cores: chest_goblin25d_visual.js.
registerHuman('chest_goblin', S);

export function renderChestGoblin25D(e) {
    renderHuman25D(e, 'chest_goblin', S);
}

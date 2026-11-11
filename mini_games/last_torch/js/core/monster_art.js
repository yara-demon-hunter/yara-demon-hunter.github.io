import { MONSTER_ART } from '../../data_model/visuals/monsters/sprites_visual.js';
import { knightHeadPosition } from '../../library/monsters/topdown/headless_knight/headless_knight.js';
import { knightHeadPosition25D } from '../../library/monsters/25d/index.js';

// --- QUAL ARTE OS MONSTROS USAM ---
// A escolha ('25d' ou 'topdown') fica em data_model/visuals/monsters/sprites_visual.js (MONSTER_ART). O que muda de
// lugar de uma arte para a outra e a lógica do jogo usa também (de onde sai o tiro do cavaleiro) passa por aqui.
export const USE_25D = MONSTER_ART === '25d';

// Posição do elmo flutuante do Cavaleiro Sem Cabeça no mundo: de onde sai o tiro e o brilho da mira
export const knightHeadOf = USE_25D ? knightHeadPosition25D : knightHeadPosition;

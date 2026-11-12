// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/index.js e rode o sync.
// Importa todos os cenários, que se registram sozinhos (registerScenery). O jogo importa este arquivo e escolhe um
// por id com createScenery(id). Cenário novo: uma linha aqui.
import './dark_forest/dark_forest.js';
import './dark_forest_2/dark_forest_2.js';

export { createScenery, registerScenery, sceneryIds } from './scenery.js';

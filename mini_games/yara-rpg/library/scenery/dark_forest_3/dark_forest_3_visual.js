// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/dark_forest_3/dark_forest_3_visual.js e rode o sync.
// --- DADOS VISUAIS: cenário Floresta da Névoa (dark_forest_3) ---
// Variação de leitura da floresta 2: mais contraste suave no chão e menos névoa sobre o centro de combate.
import { DARK_FOREST_2_VISUALS } from '../dark_forest_2/dark_forest_2_visual.js';

export const DARK_FOREST_3_VISUALS = {
    ...DARK_FOREST_2_VISUALS,
    seed: 7341,
    ground: ['#17343a', '#0b1c22', '#050e12'],
    clearingRadiusRatio: 0.76,
    portal: { ...DARK_FOREST_2_VISUALS.portal, color: 'rgba(200, 240, 245, 0.12)' },
    props: DARK_FOREST_2_VISUALS.props.map((item) => ({ ...item })),
    fogLayers: DARK_FOREST_2_VISUALS.fogLayers.map((layer) => ({ ...layer, alpha: layer.alpha * 0.82 })),
    fogAlphaCenter: 0.065,
    fogAlphaEdge: 0.26,
    vignetteInnerRatio: 0.48
};

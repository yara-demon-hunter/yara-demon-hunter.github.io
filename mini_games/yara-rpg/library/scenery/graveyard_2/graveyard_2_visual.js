// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/graveyard_2/graveyard_2_visual.js e rode o sync.
// --- DADOS VISUAIS: Cemitério sob a Lua Cheia (graveyard_2) ---
// Variante 2 de `graveyard`: mesmo desenho de base, outro clima. Luz azul-prateada, mais lápides, menos ossos, fogos-fátuos brancos.
import { GRAVEYARD_VISUALS as BASE } from '../graveyard/graveyard_visual.js';

export const GRAVEYARD_2_VISUALS = {
    ...BASE,
    seed: 9612,
    nightTint: 'rgba(14, 24, 50, 0.3)',
    ground: ['#3a4452', '#262e3a', '#10151c'],
    portal: { ...BASE.portal, color: 'rgba(210, 225, 255, 0.2)' },
    path: { ...BASE.path, gravel: ['#6a6e78', '#4a4e58'] },
    props: BASE.props.map(p => p.prop === 'tombstone' ? { ...p, per100kPx: 3.4, palette: { stone: '#6a707c', light: 'rgba(235, 242, 255, 0.35)' } }
        : p.prop === 'bones' ? { ...p, per100kPx: 0.2 }
        : p.prop === 'wisp' ? { ...p, palette: { glow: '230, 240, 255' } } : p),
    fogColor: '200, 215, 240',
    fogAlphaCenter: 0.1,
    fireflyGlow: 'rgba(230, 240, 255, 0.9)'
};

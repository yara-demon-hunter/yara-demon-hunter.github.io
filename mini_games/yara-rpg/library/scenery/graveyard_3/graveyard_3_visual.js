// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/scenery/graveyard_3/graveyard_3_visual.js e rode o sync.
// --- DADOS VISUAIS: Cemitério Profanado (graveyard_3) ---
// Variante 3 de `graveyard`: mesmo desenho de base, outro clima. Tom roxo, muitos ossos e raízes, lápides quebradas, fogos-fátuos e cogumelos roxos em dobro.
import { GRAVEYARD_VISUALS as BASE } from '../graveyard/graveyard_visual.js';

export const GRAVEYARD_3_VISUALS = {
    ...BASE,
    seed: 9713,
    nightTint: 'rgba(26, 8, 28, 0.42)',
    ground: ['#2e262e', '#1e181f', '#0c080d'],
    portal: { ...BASE.portal, color: 'rgba(200, 90, 220, 0.16)' },
    path: { ...BASE.path, gravel: ['#3c3238', '#2a2227'] },
    props: BASE.props.map(p => p.prop === 'tombstone' ? { ...p, per100kPx: 2.2, palette: { stone: '#3e3a44', moss: 'rgba(90, 60, 100, 0.5)' } }
        : p.prop === 'bones' ? { ...p, per100kPx: 2.2 }
        : p.prop === 'root' ? { ...p, per100kPx: 2.2 }
        : p.prop === 'wisp' ? { ...p, per100kPx: p.per100kPx.map(v => v * 2), palette: { glow: '220, 120, 255' } }
        : p.prop === 'mushroom' ? { ...p, per100kPx: p.per100kPx.map(v => v * 2.5) } : p),
    fogColor: '190, 150, 200',
    fogAlphaCenter: 0.1,
    fogAlphaEdge: 0.34,
    fireflyGlow: 'rgba(230, 140, 255, 0.85)'
};

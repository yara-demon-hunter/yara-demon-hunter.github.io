// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/bat/bat25d_visual.js e rode o sync.
import { BAT_VISUALS } from '../../topdown/bat/bat_visual.js';
import { CREATURE_DEFAULTS, BASE_COLORS } from '../creature25d.js';

// --- DADOS VISUAIS: Morcego 2.5D (bat25d.js) ---
// O Morcego de topdown/bat (corpo pequeno e peludo, asas de membrana que batem rápido, orelhas pontudas, olhos
// vermelhos e presinhas) voando no boneco 2.5D. As cores são as de topdown/bat/bat_visual.js.
// Medidas em unidades do boneco (o herói tem ~25 de altura). Só afeta o desenho.
export const BAT_25D_VISUALS = {
    ...CREATURE_DEFAULTS,
    colors: { ...BASE_COLORS, ...BAT_VISUALS.colors },
    strideSpeed: 8,

    // Voo
    flyHeight: 12,             // altura do corpo
    bob: 0.9,                  // o corpo sobe quando as asas descem
    flapHz: BAT_VISUALS.flapHz * 0.5,
    flapAngle: 0.75,           // quanto a asa sobe e desce (radianos)
    wobble: 0.8,               // zigue-zague de lado (unidades)
    wobbleHz: BAT_VISUALS.wobbleHz,

    // Corpo e cabeça
    bodyLength: 4.6,
    bodyRadius: 2.1,
    headRadius: 2.0,
    headForward: 2.6,
    earLength: 2.6,
    earSpread: 1.3,
    eyeGlow: 1.6,

    // Asas
    wingSpan: 9.5,
    wingChord: 5.2,            // largura da asa junto ao corpo
    wingSweep: 2.4,            // quanto a ponta fica para trás
    wingScallops: BAT_VISUALS.wingScallops,
    wingBones: BAT_VISUALS.wingBoneCount,

    auraRadius: 20,
    auraAlpha: BAT_VISUALS.auraAlpha,
    // Tuner: para onde as vistas de rosto olham
    focusZ: 12.5,
    focusA: 2,
    scalePerRadius: 0.2
};

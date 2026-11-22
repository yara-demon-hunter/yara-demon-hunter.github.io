// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/monsters/25d/human25d_visual.js e rode o sync.
import { CREATURE_DEFAULTS, BASE_COLORS } from './creature25d.js';

// --- DADOS COMUNS DOS MONSTROS COM CORPO DE GENTE (human25d.js) ---
// Medidas e cores-base; cada monstro (miliciano, cavaleiro, lanceiro, afogado, demônio) junta as suas por cima.
// Medidas em unidades do boneco (o herói tem ~25 de altura).
export const HUMAN_DEFAULTS = {
    ...CREATURE_DEFAULTS,
    strideSpeed: 7,
    bodyScale: 1,
    // Corpo
    armWidth: 1.8,
    legWidth: 2.2,
    handRadius: 1.1,
    headRadius: 2.3,
    chestWiden: 1,
    shoulderScale: 1,
    pauldronRadius: 2.4,
    // Detalhes
    clawLength: 1.4,
    weaponLength: 10,
    shieldRadius: 4.2,
    plumeLength: 4,
    hairLength: 5,
    tailLength: 7,
    wingSpan: 7,
    wingHeight: 7,
    armReach: 6,           // (armsForward) quanto o braço se estica à frente
    armSpread: 0.5,
    armDrop: 1.5,
    armSwing: 1.2,
    slouch: 1.2,
    limp: 0,               // (armsForward) quanto o corpo desce a cada passo (manca)
    dragSide: 1,           // (dragLeg) qual perna arrasta: 1 = direita, -1 = esquerda           // (armsForward) quanto o corpo se curva para a frente
    wounds: null,
    chestGlow: 0,
    eyeGlow: 0,
    openMouth: false,
    fangs: false,
    hurtFlashSeconds: 0.12,
    // Câmera e tamanho no jogo
    auraRadius: 19,
    auraAlpha: 0.2,
    focusZ: 17,
    focusA: 1,
    scalePerRadius: 0.14,
    // Altura (em unidades do boneco) do centro do corpo: o jogo põe esse ponto em cima do centro de colisão do monstro
    center: 11
};

// Cores que todo monstro de gente precisa; o monstro troca o que for diferente
export const HUMAN_COLORS = {
    ...BASE_COLORS,
    outline: '#10131a', ink: '#0b0d12',
    skin: '#d8a982', skinShade: '#a97a58',
    cloth: '#6a5a44', clothDark: '#463a2c', clothLight: '#8a7658',
    gambeson: '#b59b6a',
    armor: '#8f98a6', armorDark: '#555d6b', armorLight: '#c5cdda',
    belt: '#2b2118', buckle: '#c8a24a', boot: '#2d231a', patch: '#6c5636',
    eye: '#fef9c3', glow: '#fbbf24', hair: '#3a2a1c', hairLight: '#5a4430',
    horn: '#2a2018', claw: '#e5e0d0', fang: '#f1f5f9',
    wing: '#5a1f1f', wingBone: '#2a1010',
    shield: '#7a5a34', shieldRim: '#2d2113', shieldMark: '#c2410c', shieldBoss: '#9aa3b2',
    metal: '#b9c2cf', metalDark: '#566070', metalLight: '#eef2f7',
    wood: '#8a6840', woodDark: '#4a3820', grip: '#2b2118',
    plume: '#b91c1c', pennant: null, tabardTrim: '#e5e7eb', wound: '#5a1f2a', rust: null,
    aura: 'rgba(255, 200, 120, 0.4)',
    cape: '#3a2a22', capeFold: '#2a1c16', capeEdge: '#5a4030', capeInner: '#1f1410'
};

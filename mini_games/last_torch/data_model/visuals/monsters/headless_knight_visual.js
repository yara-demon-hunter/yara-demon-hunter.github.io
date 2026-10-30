// --- DADOS VISUAIS: Cavaleiro Sem Cabeça. ---
// Referência de arte: art_reference/headless_knight. Vista de cima: ombreiras enormes, o gorjal oco com a chama
// azul no lugar da cabeça, a capa cobrindo as costas (os pés só aparecem na frente), a espada arrastando de um
// lado e o elmo flutuando do outro.
// Só afeta o desenho; colisão e velocidade ficam em MONSTER_MODELS.HEADLESS_KNIGHT.
export const HEADLESS_KNIGHT_VISUALS = {
    scale: 1.15,
    colors: {
        steel: '#4f576b',
        steelDark: '#2b3140',
        steelLight: '#8a96ab',
        ink: '#090b10',
        rust: '#7a4a2a',
        gold: '#b08a3e',
        cloth: '#2a1740',
        clothDark: '#1a0e2a',
        clothMid: '#4c2a78',
        clothEdge: '#6b46a3',
        flame: '#38bdf8',
        flameMid: '#a5f3fc',
        flameTip: '#f0fdff',
        flameGlow: 'rgba(56, 189, 248, 0.6)',
        eye: '#fb923c',
        eyeGlow: 'rgba(251, 146, 60, 0.95)',
        blade: '#6b7280',
        edge: '#a3aab8',
        spark: '#fde68a',
        aura: 'rgba(29, 78, 216, 0.5)'
    },
    // Posição do elmo flutuante, em múltiplos do raio desenhado (+x é a frente, +y a direita)
    head: { x: 0.75, y: -1.55, radius: 0.42 },
    stepHz: 1,                  // tudo anima em múltiplos do passo: o ciclo do sprite fecha sem salto
    chargeSeconds: 0.6,
    auraRadius: 2.2,
    auraAlpha: 0.18,
    shadowAlpha: 0.34,
    healthBarOffset: 14
};

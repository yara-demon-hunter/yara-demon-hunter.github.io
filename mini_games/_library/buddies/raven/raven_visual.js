// --- DADOS VISUAIS: o Corvo (buddy) ---
// Lidos por raven.js. Só afeta o desenho: tamanho, quadros, cores das penas, brilho e penas soltas.
export const RAVEN_VISUALS = {
    scale: 0.62,                // tamanho no mundo em relação à arte (pequeno: do tamanho de uma sombra no ombro)
    frames: 12,                 // quadros de uma batida de asa
    framesPerSecond: 15,
    // Pixels do sprite por unidade da arte: { desktop, celular }
    pixels: { desktop: 3, mobile: 2 },
    // Área da arte guardada em cada quadro, com a origem no peito da ave
    bounds: { left: -50, top: -50, width: 100, height: 92 },
    glow: 'rgba(139, 92, 246, 0.45)',
    glowHot: 'rgba(196, 181, 253, 0.8)',
    feathers: 3,                // penas soltas no rastro do mergulho

    // Pena: da raiz à ponta, com o brilho violeta das penas de corvo
    near: ['#0b0a14', '#1e1a38', '#3b3170', '#7c6fd0'],
    far: ['#07060e', '#14112a', '#272053', '#51459a'],
    covert: ['#0f0d1d', '#241f47', '#463b8a'],
    vein: 'rgba(196, 181, 253, 0.28)',

    body: { head: '#2a2450', neck: '#1c1838', back: '#0f0d1e', belly: '#2c2556', sheen: 'rgba(167, 139, 250, 0.45)' },
    beak: { light: '#cbd5e1', dark: '#475569' },
    eye: { iris: '#fde68a', pupil: '#0b0a14', glint: '#ffffff' },
    leg: '#3b3552'
};

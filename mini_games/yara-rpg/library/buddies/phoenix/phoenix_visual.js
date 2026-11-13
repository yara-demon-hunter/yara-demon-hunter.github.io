// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/buddies/phoenix/phoenix_visual.js e rode o sync.
// --- DADOS VISUAIS: a Fênix (buddy) ---
// Lidos por phoenix.js. Só afeta o desenho: tamanho, quadros, cores das penas, brilho e fagulhas.
export const PHOENIX_VISUALS = {
    scale: 0.48,                // tamanho no mundo em relação à arte
    frames: 16,                 // quadros de uma batida de asa
    framesPerSecond: 19,
    // Pixels do sprite por unidade da arte: { desktop, celular }
    pixels: { desktop: 2, mobile: 1.5 },
    // Área da arte guardada em cada quadro, com a origem no peito da ave
    bounds: { left: -112, top: -100, width: 180, height: 214 },
    glow: 'rgba(249, 115, 22, 0.5)',
    glowHot: 'rgba(253, 224, 71, 0.75)',
    embers: 7,

    // Pena: da raiz à ponta
    near: ['#991b1b', '#ea580c', '#fbbf24', '#fff7d6'],
    far: ['#5f1414', '#9a3412', '#d97706', '#fcd34d'],
    covert: ['#c2410c', '#f59e0b', '#fde68a'],
    vein: 'rgba(127, 29, 29, 0.55)',
    flame: ['rgba(251, 146, 60, 0)', 'rgba(253, 186, 116, 0.75)', 'rgba(255, 244, 200, 0.95)'],

    body: { head: '#fff1b8', neck: '#fcd34d', chest: '#f97316', rump: '#b91c1c', scale: 'rgba(153, 27, 27, 0.5)', belly: 'rgba(255, 244, 200, 0.75)' },
    beak: { light: '#fff7d6', dark: '#b45309' },
    eye: { socket: '#7f1d1d', iris: '#fff7ae', pupil: '#3b0a0a' },
    crest: ['#ea580c', '#fbbf24', '#fff7d6'],

    // Pluma da cauda: raiz, meio e ponta, com a lágrima de fogo perto do fim
    tail: ['#b91c1c', '#f97316', '#fde047'],
    tailEye: { ring: '#fff1b8', mid: '#fbbf24', core: '#ea580c' }
};

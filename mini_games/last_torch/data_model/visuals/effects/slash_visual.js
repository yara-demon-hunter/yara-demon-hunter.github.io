// --- DADOS VISUAIS: Golpes da lâmina. ---
// Cores, tamanhos e ritmos de animação lidos pelos renderizadores em js/render/.

// --- EFEITO DO GOLPE (arco neon da lâmina) ---
// Cada passo do combo tem um visual próprio. Só afeta o desenho, não o dano.
export const SLASH_VISUALS = {
    1: { lifeSeconds: 0.2, from: 1, to: -1, color: '#06b6d4', lineWidth: 6, glow: 20, tail: 0.65, lines: 1 },
    2: { lifeSeconds: 0.22, from: -1, to: 1, color: '#38bdf8', lineWidth: 7, glow: 24, tail: 0.75, lines: 2 },
    3: { lifeSeconds: 0.26, from: 1, to: -1, color: '#a855f7', lineWidth: 10, glow: 28, tail: 0.85, lines: 1 },
    whirl: { lifeSeconds: 0.3, spin: true, color: '#a855f7', lineWidth: 9, glow: 30, tail: 1, lines: 1, shockwave: true },
    frenzyColor: '#f0abfc',
    frenzyExtraWidth: 3,
    coreColor: '#ffffff',
    coreWidth: 2.2,
    doubleLineGap: 7,
    // Onda de ar cortante: meia-lua que sai da lâmina e viaja até o círculo de alcance
    wave: {
        startRatio: 0.2,          // onde nasce (fração do raio de alcance)
        thicknessScale: 2.2,      // espessura no meio = lineWidth do golpe x este valor
        alpha: 0.45,              // opacidade do corpo da onda
        edgeAlpha: 0.9,           // opacidade do fio branco na frente da onda
        segments: 18,             // pontos do contorno (mais = mais suave)
        // Rastro de riscos atrás da onda (preenche o caminho até a borda do alcance)
        trailSpacing: 10,         // distância (px) entre um risco e outro; menor = mais riscos
        trailMaxLines: 14,        // limite de riscos por golpe
        trailAlpha: 0.55,         // opacidade do risco mais perto da onda (os de trás vão sumindo)
        trailWidth: 2.5           // espessura do risco mais perto da onda
    }
};

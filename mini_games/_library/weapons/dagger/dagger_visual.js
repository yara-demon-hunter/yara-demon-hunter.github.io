// --- DADOS VISUAIS: adaga de arremesso (o desenho da adaga em voo e na mão do herói) ---
// Só a ARMA: cores e formato. Voo, altura, sombra, rastro e a animação da mão ficam no jogo (KNIFE_VISUALS).
export const DAGGER_VISUALS = {
    colors: {
        bladeLight: '#e8f1fb',      // metade da lâmina que pega luz
        bladeShade: '#94a3b8',      // metade na sombra
        ridge: '#ffffff',           // nervura central
        edge: '#67e8f9',            // fio brilhante
        runes: '#67e8f9',
        guard: '#d4a72c',           // guarda e pomo (dourado)
        guardShade: '#8a6d12',
        grip: '#3b2417',            // cabo de couro
        wrap: '#8b5a34',            // tiras do cabo
        gem: '#22d3ee',
        glow: 'rgba(103, 232, 249, 0.45)',
        trail: 'rgba(165, 243, 252, 0.9)',
        shadow: 'rgba(0, 0, 0, 0.35)'
    },

    // Formato ao longo de +x, origem no meio do cabo (unidades da adaga)
    shape: {
        pommelX: -4.6,
        pommelRadius: 1.1,
        gripStart: -3.8,
        gripEnd: -0.6,
        gripHalf: 0.85,
        wraps: 3,
        guardX: 0,
        guardHalf: 2.6,
        guardCurl: 0.9,
        guardThickness: 1,
        bladeStart: 0.4,
        bladeEnd: 11,
        bladeBaseHalf: 1.1,
        bladeMaxHalf: 1.4,
        bladeMaxX: 3.5,
        runeCount: 3,
        centerX: 3               // ponto de equilíbrio (centro do desenho em voo)
    }
};

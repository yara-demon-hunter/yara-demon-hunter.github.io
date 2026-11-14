// GERADO por mini_games/_library/sync.rb. NÃO EDITE: altere mini_games/_library/weapons/cross/cross_visual.js e rode o sync.
// --- DADOS VISUAIS: o crucifixo de arremesso (Father Avgustino) ---
// Só a ARMA: cores e formato. Voo, altura, sombra, rastro e a animação da mão ficam no jogo (KNIFE_VISUALS).
export const CROSS_VISUALS = {
    colors: {
        silver: '#d5d9e2', silverShade: '#8e929d', silverLight: '#f4f6fb', outline: '#2a2733',
        gem: '#fde68a',
        glow: 'rgba(254, 243, 199, 0.55)', trail: 'rgba(254, 249, 231, 0.9)', shadow: 'rgba(0, 0, 0, 0.35)', edge: '#fef3c7'
    },
    // Formato ao longo de +x (a haste longa aponta para onde voa), origem no centro do cruzamento (unidades da arma, como a adaga)
    shape: {
        back: -6.5,            // ponta de trás da haste longa
        front: 3.6,            // ponta da frente (cabeça da cruz)
        armX: 0,               // onde passa a travessa
        armHalf: 3.6,          // meia largura da travessa
        thick: 1.15,           // espessura das barras
        centerX: -1.4          // ponto de equilíbrio (centro do desenho em voo)
    }
};

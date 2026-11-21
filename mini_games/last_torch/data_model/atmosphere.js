// --- ATMOSFERA: luz da tocha, sombras longas e vinheta (js/render/atmosphere.js) ---
// Tudo é acabamento por cima da arte, sem mudar nenhum personagem. Para comparar com e sem: abra a página com ?atmos=0.
export const ATMOSPHERE = {
    // Luz quente da tocha: um clarão aditivo que acende o chão e quem passa perto
    torchLight: {
        radius: 330,            // alcance (px do mundo)
        alpha: 0.09,            // força no centro
        flicker: 0.07,          // quanto a chama oscila (fração do alpha)
        color: [255, 160, 70]
    },
    // Sombras que fogem da tocha: mais longas e fortes perto dela, somem na borda da luz
    castShadows: {
        reach: 380,             // distância da tocha até onde a sombra aparece
        alpha: 0.5,
        length: 2.1,            // comprimento da sombra em múltiplos do raio do corpo
        width: 0.95,            // largura em múltiplos do raio do corpo
        maxActors: 60           // teto por quadro (os mais próximos da tocha)
    },
    // Luz rebatida: o lado do personagem virado para a tocha fica mais claro (clarão pequeno, aditivo, só perto da tocha)
    rimLight: {
        alpha: 0.14,
        size: 1.5,              // tamanho do clarão em múltiplos do raio do corpo
        shift: 0.45             // quanto ele se desloca para o lado da tocha (múltiplos do raio)
    },
    // Brasas que sobem da tocha e se perdem no ar
    embers: {
        count: 0,               // 0 = desligadas (o dono não gostou); na qualidade 1 vira a metade; na 2 não há
        rise: 150,              // altura que sobem antes de sumir (px)
        drift: 38,              // quanto o vento as leva para o lado (px)
        life: 3.2,              // segundos de vida
        color: [255, 190, 90]
    },
    // Bordas escuras e frias, para o olhar ir ao centro
    vignette: {
        strength: 0.55,
        inner: 0.45,            // onde começa o escurecimento (0 = centro, 1 = canto)
        color: [2, 6, 14]
    }
};

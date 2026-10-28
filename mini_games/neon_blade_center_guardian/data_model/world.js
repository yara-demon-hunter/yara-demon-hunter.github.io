// --- MUNDO DO JOGO (tamanho padronizado) ---
// O jogo roda num "mundo" de tamanho fixo (unidades do jogo) que é escalado para caber na
// tela. Assim todos têm a mesma área de combate, o mesmo alcance e a mesma distância dos
// monstros, em qualquer monitor ou celular. Só a proporção (largura x altura) varia um pouco.
export const WORLD = {
    // Telas com o menor lado menor que isso (em px do navegador) usam o perfil "mobile"
    mobileMaxShortSide: 600,

    // shortSide: lado menor do mundo (altura no modo paisagem, largura no retrato)
    // minAspect/maxAspect: limites da proporção lado maior / lado menor; fora deles sobram faixas
    desktop: { shortSide: 720, minAspect: 1.3, maxAspect: 1.9 },
    // No celular o mundo é menor: o herói e os monstros ficam maiores na tela
    mobile: { shortSide: 480, minAspect: 1.3, maxAspect: 2.3 },

    // Cor das faixas que sobram quando a proporção da tela passa dos limites
    letterboxColor: '#01040a',
    // Largura (unidades do mundo) do degradê que funde a borda do mundo com as faixas
    letterboxFadeWidth: 70
};

// --- MUNDO DO JOGO (tamanho padronizado) ---
// O jogo roda num "mundo" de tamanho fixo (unidades do jogo) que é escalado para caber na
// tela. Assim todos têm a mesma área de combate, o mesmo alcance e a mesma distância dos
// monstros, em qualquer monitor ou celular. Só a proporção (largura x altura) varia um pouco.
export const WORLD = {
    // Telas com o menor lado menor que isso (em px do navegador) usam o perfil "mobile"
    mobileMaxShortSide: 600,

    // shortSide: lado menor do mundo na escala 1 (altura no modo paisagem, largura no retrato)
    // areaScale: ZOOM DO JOGO. Multiplica o mundo inteiro (os dois lados, mantendo a proporção).
    //   1   = padrão
    //   1.3 = 30% mais área visível; herói, monstros e cenário ficam ~23% menores na tela
    //   0.8 = mais "perto": menos área, tudo maior na tela
    //   Os objetos mantêm suas proporções entre si; só o espaço ao redor muda.
    // minAspect/maxAspect: limites da proporção lado maior / lado menor; fora deles sobram faixas
    desktop: { shortSide: 720, areaScale: 1.3, minAspect: 1.3, maxAspect: 1.9 },
    // No celular o mundo é menor: o herói e os monstros ficam maiores na tela
    mobile: { shortSide: 480, areaScale: 1.3, minAspect: 1.3, maxAspect: 2.3 },

    // Cor das faixas que sobram quando a proporção da tela passa dos limites
    letterboxColor: '#01040a',
    // Largura (unidades do mundo) do degradê que funde a borda do mundo com as faixas
    letterboxFadeWidth: 70
};

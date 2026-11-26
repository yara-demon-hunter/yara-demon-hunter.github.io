// --- MUNDO DO JOGO (tamanho padronizado) ---
// O jogo roda num "mundo" de tamanho fixo (unidades do jogo) que é escalado para caber na
// tela. Assim todos têm a mesma área de combate, o mesmo alcance e a mesma distância dos
// monstros, em qualquer monitor ou celular. Só a proporção (largura x altura) varia um pouco.
export const WORLD = {
    // Cenário do chão e da névoa: o id de um cenário da biblioteca (mini_games/_library/scenery/<id>/)
    scenery: 'dark_forest_2',

    // Telas com o menor lado menor que isso (em px do navegador) usam o perfil "mobile"
    mobileMaxShortSide: 600,

    // shortSide: lado menor do mundo na escala 1 (altura no modo paisagem, largura no retrato)
    // areaScale: ZOOM DO JOGO. Multiplica o mundo inteiro (os dois lados, mantendo a proporção).
    //   1   = padrão
    //   1.3 = 30% mais área visível; herói, monstros e cenário ficam ~23% menores na tela
    //   0.8 = mais "perto": menos área, tudo maior na tela
    //   Os objetos mantêm suas proporções entre si; só o espaço ao redor muda.
    // minAspect/maxAspect: limites da proporção lado maior / lado menor; fora deles sobram faixas.
    //   O DESKTOP TRAVA em 16:9 (mundo sempre 1664x936, o do Ateliê): as áreas de contato dos cenários (o rio, a ponte...) são desenhadas nesse mundo; com a largura
    //   variando, a água e a ponte (que não esticam igual) saíam do lugar e o herói entrava na água. Outras proporções ganham faixas escuras nas laterais ou em cima/embaixo.
    // maxPixelRatio / maxCanvasPixels: teto da resolução interna do canvas. A tela estica a imagem e o
    // HUD continua nítido; pintar menos pixels é o que mais alivia celulares e notebooks.
    desktop: { shortSide: 720, areaScale: 1.3, minAspect: 16 / 9, maxAspect: 16 / 9, maxPixelRatio: 1.25, maxCanvasPixels: 1100000 },
    // No celular o mundo é menor: o herói e os monstros ficam maiores na tela
    mobile: { shortSide: 480, areaScale: 1.3, minAspect: 1.3, maxAspect: 2.3, maxPixelRatio: 1, maxCanvasPixels: 420000 },

    // Nível de detalhe inicial e resolução em cada nível (js/game.js desce sozinho se o aparelho não acompanhar)
    startQuality: { desktop: 0, mobile: 1 },
    qualityPixelScale: [1, 0.9, 0.72],

    // Quem passa ATRÁS de um prédio (casa, catedral: objetos que escondem): o prédio é redesenhado por cima do herói e uma cópia dele aparece
    // translúcida por cima do prédio. ghostAlpha = quão visível (0 some, 1 opaco).
    occlusion: { ghostAlpha: 0.42 },

    // Cor das faixas que sobram quando a proporção da tela passa dos limites
    letterboxColor: '#01040a',
    // Largura (unidades do mundo) do degradê que funde a borda do mundo com as faixas
    letterboxFadeWidth: 70
};

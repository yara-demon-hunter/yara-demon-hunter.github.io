// --- DADOS VISUAIS: Tocha 2,5D (objeto torch25d) ---
// Cores e medidas lidas por torch25d.js, já na câmera do jogo (quase de cima, como os bonecos 2.5D: o que é alto aparece
// encurtado e o que é redondo no chão vira uma elipse). Unidades do mundo, origem na BASE do poste, y para cima negativo.
// A tocha inteira tem mais ou menos a altura do herói. Referência: art_reference/images/torch_referencia.png. Ficha: art_reference/object.md.
export const TORCH25D_VISUALS = {
    // Tamanho geral da tocha inteira (poste, gaiola, fogo e brilho juntos). As medidas abaixo são em size 1.
    size: 0.85,

    // O poste de madeira, fino e um pouco torto, com contorno escuro e uma faixa de luz descendo pelo meio (como na referência)
    pole: { height: 27, baseWidth: 4.8, topWidth: 3.8, crook: 0.8 },
    // A GAIOLA do fogo (não é uma tigela): 4 barras que sobem do colar e se abrem para fora no alto, um anel no meio (que de frente
    // faz a barra da cruz) e o poste central subindo até dentro do fogo, com um nó na ponta. Vista um pouco de cima.
    cage: { bottomR: 4.6, ringR: 6.6, tipR: 10.5, bottom: 29, ring: 36.5, top: 45, squash: 0.5, postTip: 1.5 },
    colors: {
        outline: '#1a1012',       // contorno escuro (estilo pixel art da referência)
        poleDark: '#3c2424',
        poleMid: '#603c3c',
        poleLit: '#a86c5c',       // a faixa de luz no meio do poste
        wood: '#6b4030',
        woodLight: '#c07a50',
        collar: '#4a2e22',
        fireHot: '#fcf084',       // o fogo visto pelos vãos da gaiola: miolo amarelo...
        fireWarm: '#e47848',      // ...laranja...
        fireEdge: '#a83a2a',      // ...e vermelho nas bordas
        shadow: 'rgba(0, 0, 0, 0.45)'
    },
    // O fogo: a mistura da fogueira antiga (línguas que giram rente à boca da gaiola, miolo claro, brasas que saem para os lados)
    // com a chama nova (camadas que sobem, do vermelho ao quase branco)
    flame: {
        swirl: 6,                 // línguas que giram rente à boca da gaiola (da fogueira antiga)
        swirlColors: ['rgba(234, 88, 12, 0.85)', 'rgba(251, 146, 60, 0.85)', 'rgba(253, 224, 71, 0.9)'],
        width: 14,                // meia largura da chama que sobe
        height: 44,
        colors: ['#e83329', '#ff7a1a', '#ffc13a', '#fff3b0'],     // da camada de fora para a de dentro
        scales: [1, 0.76, 0.52, 0.28],
        tongues: 4,
        sway: 0.3,                // quanto as pontas balançam para os lados (fração da largura)
        stretch: 0.28,            // quanto cada língua cresce e encolhe (fração da altura): é o que muda o formato
        breathe: 0.12,            // quanto a base da chama alarga e estreita
        embers: 8,
        emberColor: '#fdba74',
        cycleSeconds: 1.6         // duração de um ciclo (mais longo = mais formatos diferentes antes de repetir)
    },
    // O brilho no ar em volta do fogo (somado à cena), como o da fogueira antiga
    halo: { color: 'rgba(251, 146, 60, 0.9)', radius: 64, alpha: 0.7 },
    // Quadros do atlas do fogo, por nível de detalhe [0, 1, 2] (mais quadros = mais formatos; ~200 KB a mais no detalhe 0)
    frames: [20, 12, 8]
};

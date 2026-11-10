// --- O QUE OS DESENHOS PERGUNTAM AO JOGO ---
// A biblioteca não conhece o jogo que a usa. As poucas coisas que a arte precisa saber dele passam por aqui; o jogo
// preenche com setHost ao abrir. Sem isso, os valores padrão abaixo valem (anima sempre, sem alvo).
export const host = {
    // A animação anda? false congela as poses (jogo pausado, menu, acampamento)
    animating: () => true,
    // Quem os monstros perseguem ({ x, y }), para quem reage a ele (o Vampiro estica as mãos quando chega perto)
    target: () => null
};

export function setHost(values) {
    Object.assign(host, values);
}

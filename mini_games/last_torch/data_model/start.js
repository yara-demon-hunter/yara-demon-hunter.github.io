// --- ABERTURA DO JOGO ---
// skipMenuOnFirstVisit: quem nunca jogou cai direto na caçada, sem a tela inicial (a CrazyGames pede
// "jogador novo direto na partida"). Da segunda visita em diante (ou depois da primeira noite) o menu aparece normal.
// false = todo mundo começa pela tela inicial, com a escolha do herói, como antes.
// quickPickDefault: a escolha de skill que abre sozinha ao subir de nível (três cartas da árvore). Vem DESLIGADA: o
// dono do projeto não quer que a tela apareça sozinha (2026-11-13). Quem quiser liga em Settings. true = vem ligada.
// firstNightDuelLines: na PRIMEIRA noite do jogador (save.stats.runs === 0), o duelo da hora 1 com o rival (Azael) conta só
// esta quantidade de falas antes da luta e depois dela, porque cada fala para a caçada no primeiro minuto de quem acabou
// de chegar. Da segunda noite em diante o duelo vem inteiro. 0 = sem corte.
export const START = {
    firstNightDuelLines: 1,
    skipMenuOnFirstVisit: false,    // 19/11/2026: desligado a pedido do dono (a tela de seleção deixa o jogador curioso pelos outros heróis)
    quickPickDefault: false
};

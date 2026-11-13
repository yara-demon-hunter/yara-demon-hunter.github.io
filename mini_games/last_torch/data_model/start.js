// --- ABERTURA DO JOGO ---
// skipMenuOnFirstVisit: quem nunca jogou cai direto na caçada, sem a tela inicial (a CrazyGames pede
// "jogador novo direto na partida"). Da segunda visita em diante (ou depois da primeira noite) o menu aparece normal.
// false = todo mundo começa pela tela inicial, com a escolha do herói, como antes.
// quickPickDefault: a escolha de skill que abre sozinha ao subir de nível (três cartas da árvore). Vem DESLIGADA: o
// dono do projeto não quer que a tela apareça sozinha (2026-11-13). Quem quiser liga em Settings. true = vem ligada.
export const START = {
    skipMenuOnFirstVisit: true,
    quickPickDefault: false
};

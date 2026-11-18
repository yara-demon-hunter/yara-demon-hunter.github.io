// --- OURO (GOLD) DROPADO PELOS MONSTROS ---
// Ao morrer, o monstro solta moedas que pulam para os lados e ficam um tempo no chão, depois somem. Dentro do
// raio de atração do herói elas voam até ele; no fim da hora as que restam voam de uma vez.
export const GOLD_DROP = {
    maxCoinsPerKill: 2,          // quantidade máxima de moedas visuais por monstro (o valor total é dividido entre elas)
    maxActiveCoins: 48,          // limite de moedas na tela (acima disso, o valor entra direto)
    scatterSpeedMin: 60,         // velocidade do pulo inicial (px/s)
    scatterSpeedMax: 150,
    scatterDamping: 0.9,         // freio do pulo (por quadro)
    popSeconds: 0.32,            // tempo parada/pulando antes de ser atraída
    lifeSeconds: 12,             // some depois disso, se ninguém veio buscar
    blinkSeconds: 3,             // pisca nos últimos segundos
    homingAcceleration: 1400,    // aceleração em direção ao herói (px/s²)
    homingMaxSpeed: 650,
    vacuumAcceleration: 3200,    // fim da hora ou ímã: todas as moedas voando juntas
    vacuumMaxSpeed: 1500,
    pickupRadius: 16             // distância para coletar (somada ao raio do herói)
};

// Economia: o ouro por abate vale esta fração do valor dos monstros (goldBase). Junto com o preço das relíquias (passives.js, cada uma
// com preço fixo que sobe pela coluna na árvore de relíquias: 300 · 900 · 2.000 · 3.800 · 6.500), a meta é: o jogador compra algo quase
// toda onda (1 a 3 relíquias), mas ninguém completa a loja (45 relíquias, ~108 mil de ouro) numa partida inteira.
// Medido em 2026-11-18 com o piloto do sandbox (herói imortal, compra sempre a mais barata: o caso mais generoso): 1 a 4 compras
// por onda e ~29 das 45 relíquias na onda 11; jogador de verdade deve ficar bem abaixo disso.
export const GOLD_ECONOMY = {
    killGoldScale: 0.3
};

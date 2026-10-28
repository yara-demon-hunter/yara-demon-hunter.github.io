// --- OURO (GOLD) DROPADO PELOS MONSTROS ---
// Ao morrer, o monstro solta moedas que pulam para os lados e depois voam até o herói.
export const GOLD_DROP = {
    maxCoinsPerKill: 6,          // quantidade máxima de moedas visuais por monstro (o valor total é dividido entre elas)
    maxActiveCoins: 140,         // limite de moedas na tela (acima disso, o valor entra direto)
    scatterSpeedMin: 60,         // velocidade do pulo inicial (px/s)
    scatterSpeedMax: 150,
    scatterDamping: 0.9,         // freio do pulo (por quadro)
    popSeconds: 0.32,            // tempo parada/pulando antes de ser atraída
    homingAcceleration: 1400,    // aceleração em direção ao herói (px/s²)
    homingMaxSpeed: 650,
    pickupRadius: 16             // distância para coletar (somada ao raio do herói)
};

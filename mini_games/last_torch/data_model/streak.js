// --- SEQUÊNCIA DE MORTES (STREAK) ---
// Matar vários de uma vez (MULTI_KILL) fica em data_model/sanctuary.js.
// Cada morte renova o tempo; deixar o tempo acabar zera a sequência. Quanto maior, mais pontos e ouro.
export const STREAK = {
    windowSeconds: 3,           // tempo para a próxima morte
    showFrom: 3,                // aparece no HUD a partir daqui
    scorePerKill: 0.035,         // multiplicador de pontos por morte na sequência
    maxScoreMultiplier: 5,
    goldPerKill: 0.007,         // bônus de ouro por morte na sequência
    maxGoldBonus: 0.5,
    furyChargePerKill: 2.5,     // cada morte também carrega a Fúria
    // RUSH: o combo. Cada marco alcançado sobe um nível de Rush, que vale ENQUANTO a sequência durar: o herói ataca e
    // anda mais rápido a cada nível. Parou de matar, a sequência zera e o Rush some: é o que faz o jogador não parar.
    rush: { attackSpeedPerTier: 0.05, moveSpeedPerTier: 0.03 },
    // Marcos: texto no meio da tela e o prêmio na hora: heal (fração da vida máxima), gold (moedas que saltam do herói)
    // e points (pontos de skill; cada marco só paga pontos uma vez por onda).
    tiers: [
        { at: 10, label: 'SLAUGHTER', color: '#fde047', heal: 0.06, gold: 8 },
        { at: 20, label: 'CARNAGE', color: '#fb923c', heal: 0.08, gold: 14 },
        { at: 40, label: 'MASSACRE', color: '#f87171', heal: 0.1, gold: 24, points: 1 },
        { at: 70, label: 'UNSTOPPABLE', color: '#f472b6', heal: 0.12, gold: 40, points: 1 },
        { at: 100, label: 'DEMON SLAYER', color: '#c084fc', heal: 0.15, gold: 60, points: 2 },
        { at: 160, label: 'GOD OF THE HUNT', color: '#67e8f9', heal: 0.2, gold: 90, points: 2 }
    ]
};

// Nível de Rush de uma sequência: quantos marcos ela já passou
export function rushTier(streak) {
    let tier = 0;
    for (const t of STREAK.tiers) if (streak >= t.at) tier++;
    return tier;
}

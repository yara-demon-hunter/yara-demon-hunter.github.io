// --- SEQUÊNCIA DE MORTES (STREAK) ---
// Cada morte renova o tempo; deixar o tempo acabar zera a sequência. Quanto maior, mais pontos e ouro.
export const STREAK = {
    windowSeconds: 3,           // tempo para a próxima morte
    showFrom: 3,                // aparece no HUD a partir daqui
    scorePerKill: 0.02,         // multiplicador de pontos por morte na sequência
    maxScoreMultiplier: 5,
    goldPerKill: 0.004,         // bônus de ouro por morte na sequência
    maxGoldBonus: 0.5,
    furyChargePerKill: 1.5,     // cada morte também carrega a Fúria
    // Marcos: texto no meio da tela
    tiers: [
        { at: 15, label: 'SLAUGHTER', color: '#fde047' },
        { at: 30, label: 'CARNAGE', color: '#fb923c' },
        { at: 60, label: 'MASSACRE', color: '#f87171' },
        { at: 100, label: 'UNSTOPPABLE', color: '#f472b6' },
        { at: 150, label: 'DEMON SLAYER', color: '#c084fc' },
        { at: 250, label: 'GOD OF THE HUNT', color: '#67e8f9' }
    ]
};

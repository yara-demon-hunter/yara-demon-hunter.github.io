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
    // Marcos: texto no meio da tela
    tiers: [
        { at: 10, label: 'SLAUGHTER', color: '#fde047' },
        { at: 20, label: 'CARNAGE', color: '#fb923c' },
        { at: 40, label: 'MASSACRE', color: '#f87171' },
        { at: 70, label: 'UNSTOPPABLE', color: '#f472b6' },
        { at: 100, label: 'DEMON SLAYER', color: '#c084fc' },
        { at: 160, label: 'GOD OF THE HUNT', color: '#67e8f9' }
    ]
};

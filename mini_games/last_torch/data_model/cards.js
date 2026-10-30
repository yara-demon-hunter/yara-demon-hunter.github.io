// --- CARTAS DE LEVEL UP ---
// A cada nível o jogo pausa e oferece cartas: o jogador escolhe uma. Podem ser um stat, um poder novo
// ou o próximo nível de um poder. A raridade é sorteada por carta e aumenta quantos níveis ela dá.
export const CARD_CHOICES = 3;

export const RARITIES = [
    { key: 'common', label: 'Common', weight: 74, levels: 1 },
    { key: 'rare', label: 'Rare', weight: 20, levels: 2 },
    { key: 'epic', label: 'Epic', weight: 5.2, levels: 3 },
    { key: 'legendary', label: 'Legendary', weight: 0.8, levels: 4 }
];

export const CARD_WEIGHTS = {
    ownedPower: 3,              // próximo nível de um poder que o jogador já tem
    newPower: 2.6,              // poder novo
    fewPowersBoost: 3,          // multiplicador do poder novo enquanto tiver menos de fewPowersBelow poderes
    fewPowersBelow: 2,
    stat: 1,
    luckToRare: 1               // quanto a sorte (luck) empurra o sorteio para as raridades altas
};

// Cartas de consolo, quando não há mais nada para melhorar
export const FALLBACK_CARDS = {
    gold: { name: 'Pouch of Gold', icon: '🪙', desc: 'Gold for the trader.', gold: 40 },
    heal: { name: 'Second Wind', icon: '🍖', desc: 'Recover 30% of your health.', healRatio: 0.3 }
};

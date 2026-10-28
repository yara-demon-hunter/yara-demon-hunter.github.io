// --- SKILLS PASSIVAS ---
// Compradas com pontos de skill (ganhos ao subir de nível), não com moedas.
export const SKILL_POINTS_PER_LEVEL = 1;

export const PASSIVE_SKILL_MODELS = {
    shadowWhirl: {
        name: 'Giro Sombrio',
        icon: '🌀',
        cost: 2,
        maxLvl: 1,
        desc: 'O 3º golpe do combo vira um giro de 360° que acerta todos os inimigos no alcance.'
    }
};

export function createPassives() {
    return Object.fromEntries(
        Object.entries(PASSIVE_SKILL_MODELS).map(([key, model]) => [key, { ...model, lvl: 0 }])
    );
}

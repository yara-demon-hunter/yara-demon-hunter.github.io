// --- SKILLS PASSIVAS ---
// Compradas com pontos de skill (ganhos ao subir de nível), não com moedas.
export const SKILL_POINTS_PER_LEVEL = 1;

export const PASSIVE_SKILL_MODELS = {
    shadowWhirl: {
        name: 'Shadow Whirl',
        icon: '🌀',
        cost: 2,
        maxLvl: 1,
        desc: 'The 3rd combo hit becomes a 360° spin that strikes every enemy in range.'
    }
};

export function createPassives() {
    return Object.fromEntries(
        Object.entries(PASSIVE_SKILL_MODELS).map(([key, model]) => [key, { ...model, lvl: 0 }])
    );
}

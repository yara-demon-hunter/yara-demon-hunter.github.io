// --- SAVE (localStorage) ---
// Tudo que sobrevive entre partidas. Se o navegador bloquear o localStorage o jogo roda normalmente,
// só não guarda o progresso.
const SAVE_KEY = 'last_torch_save_v1';

function createSave() {
    return {
        unlockedHeroes: ['hunter'],
        achievements: {},           // id da conquista -> true
        bestiary: {},               // tipo de monstro -> { kills }
        hero: 'hunter',
        darkness: 1,                // nível de Escuridão escolhido
        maxDarkness: 1,
        stats: {
            runs: 0, kills: 0, bestHour: 0, bestScore: 0, bestStreak: 0, victories: 0,
            elites: 0, evolutions: 0, bestDarknessWon: 0, bosses: 0, chests: 0,
            bestMultiKill: 0, perfectDodges: 0, flawlessHours: 0
        },
        settings: { muted: false, music: true, sfx: true, shake: true, numbers: true, keyboard: false },
        seenTutorial: false,
        seenTreeHint: false
    };
}

function load() {
    const fresh = createSave();
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (!saved) return fresh;
        // Saves antigos: brasas e melhorias do Hearth não existem mais (o Hearth virou o Santuário)
        delete saved.embers;
        delete saved.upgrades;
        // Campos novos em versões futuras entram com o valor padrão
        return {
            ...fresh, ...saved,
            stats: { ...fresh.stats, ...saved.stats },
            bestiary: { ...saved.bestiary },
            // Setas do teclado: sempre começa desligado, quem quiser liga em Settings
            settings: { ...fresh.settings, ...saved.settings, keyboard: false }
        };
    } catch {
        return fresh;
    }
}

export const save = load();

export function persist() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {
        // Sem espaço ou bloqueado: segue sem salvar
    }
}

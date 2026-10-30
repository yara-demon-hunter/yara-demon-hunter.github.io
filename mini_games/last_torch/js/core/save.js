// --- SAVE (localStorage) ---
// Tudo que sobrevive entre partidas. Se o navegador bloquear o localStorage o jogo roda normalmente,
// só não guarda o progresso.
const SAVE_KEY = 'last_torch_save_v1';

function createSave() {
    return {
        embers: 0,
        upgrades: {},               // melhorias do Hearth: chave -> nível
        unlockedPowers: [],         // poderes ganhos nos Trials
        unlockedHeroes: ['hunter'],
        unlockedNodes: [],          // nós da árvore comprados com brasas no Hearth
        achievements: {},           // id do Trial -> true
        hero: 'hunter',
        darkness: 1,                // nível de Escuridão escolhido
        maxDarkness: 1,
        stats: {
            runs: 0, kills: 0, bestHour: 0, bestScore: 0, bestStreak: 0, victories: 0,
            elites: 0, evolutions: 0, bestDarknessWon: 0
        },
        settings: { muted: false, music: true, sfx: true, shake: true, numbers: true },
        seenTutorial: false,
        seenTreeHint: false
    };
}

function load() {
    const fresh = createSave();
    try {
        const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
        if (!saved) return fresh;
        // Campos novos em versões futuras entram com o valor padrão
        return {
            ...fresh, ...saved,
            stats: { ...fresh.stats, ...saved.stats },
            settings: { ...fresh.settings, ...saved.settings }
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

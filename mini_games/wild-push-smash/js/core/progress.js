import { BOT_LEVEL_ORDER } from '../../data_model/bot.js';
import { PROGRESS_STORAGE_KEY } from '../../data_model/match.js';

// --- PROGRESSO DO JOGADOR (contra o bot) ---
// Cada bicho ganha uma estrela por nível do bot vencido com ele (EASY, NORMAL, HARD):
// 3 estrelas x 10 bichos = o motivo para voltar e experimentar todos.
// Também guarda a sequência de vitórias seguidas contra o bot.
const progress = { stars: {}, streak: 0, bestStreak: 0 };
try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}');
    if (saved.stars && typeof saved.stars === 'object') progress.stars = saved.stars;
    progress.streak = saved.streak | 0;
    progress.bestStreak = saved.bestStreak | 0;
} catch (e) {}

function persist() {
    try { localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress)); } catch (e) {}
}

export function starsOf(charId) {
    return progress.stars[charId] || [];
}

export function totalStars() {
    return Object.values(progress.stars).reduce((n, levels) => n + levels.length, 0);
}

export function streak() {
    return progress.streak;
}

// Fim de uma partida contra o bot. Devolve se ganhou estrela nova e a sequência atual.
export function recordBotMatch(won, charId, level) {
    let newStar = false;
    if (won) {
        progress.streak++;
        progress.bestStreak = Math.max(progress.bestStreak, progress.streak);
        const have = starsOf(charId);
        if (!have.includes(level)) {
            progress.stars[charId] = BOT_LEVEL_ORDER.filter(l => l === level || have.includes(l));
            newStar = true;
        }
    } else {
        progress.streak = 0;
    }
    persist();
    return { newStar, streak: progress.streak };
}

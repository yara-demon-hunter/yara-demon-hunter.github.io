import { ACHIEVEMENTS, getBestiary } from '../../data_model/sanctuary.js';
import { HEROES } from '../../data_model/heroes.js';
import { save, persist } from '../core/save.js';
import { state } from '../core/state.js';
import { showToast } from '../ui/banner.js';

// --- SANTUÁRIO (registro) ---
// Tudo que vale para além da noite: recordes, façanhas e o bestiário. O desenho fica em js/ui/sanctuary.js.
// Os sistemas do jogo só chamam as funções daqui quando algo digno de nota acontece.
export function rewardText(a) {
    return a.hero ? `New hero: ${HEROES[a.hero].name}` : a.desc;
}

// Conquistas completadas agora. toast: avisa na tela (na tela final elas já aparecem na lista).
export function checkAchievements({ toast = true } = {}) {
    const done = [];
    ACHIEVEMENTS.forEach(a => {
        if (save.achievements[a.id] || (save.stats[a.stat] ?? 0) < a.target) return;
        save.achievements[a.id] = true;
        if (a.hero && !save.unlockedHeroes.includes(a.hero)) save.unlockedHeroes.push(a.hero);
        done.push(a);
    });
    if (done.length === 0) return done;
    persist();
    if (toast) done.forEach(a => showToast(a.icon, a.name, rewardText(a)));
    return done;
}

// Soma a partida no histórico do jogador. Chamado no acampamento e ao fim da noite.
export function pushStats() {
    const { stats } = save;
    stats.bestHour = Math.max(stats.bestHour, state.turn);
    stats.bestStreak = Math.max(stats.bestStreak, state.run.bestStreak);
    stats.bestScore = Math.max(stats.bestScore, state.totalScore);
}

export function bumpStat(key, amount = 1) {
    save.stats[key] = (save.stats[key] ?? 0) + amount;
    checkAchievements();
}

// Recorde pessoal: só vale se passou do anterior
export function noteBest(key, value) {
    if (value <= (save.stats[key] ?? 0)) return;
    save.stats[key] = value;
    checkAchievements();
}

// Monstro morto na caçada. A primeira vez de cada tipo entra no bestiário com um aviso.
export function recordBeast(type) {
    const entry = save.bestiary[type] ??= { kills: 0 };
    entry.kills++;
    if (entry.kills > 1) return;
    const info = getBestiary().find(b => b.key === type);
    if (info) showToast(info.icon, 'New in the bestiary', info.name);
    persist();
}

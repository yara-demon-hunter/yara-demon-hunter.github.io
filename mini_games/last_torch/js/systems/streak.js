import { MULTI_KILL } from '../../data_model/sanctuary.js';
import { STREAK, rushTier } from '../../data_model/streak.js';
import { audio, player, state } from '../core/state.js';
import { addNumber, addShockwave } from './effects.js';
import { dropGold } from './gold.js';
import { announcePoints } from './progression.js';
import { showCallout } from '../ui/banner.js';
import { chargeUlt } from './combat.js';
import { getFuryChargePerKill } from './stats.js';
import { noteBest } from './sanctuary.js';

// --- SEQUÊNCIA DE MORTES ---
export function addStreakKill() {
    state.streak++;
    state.streakTimer = STREAK.windowSeconds;
    if (state.streak > state.run.bestStreak) state.run.bestStreak = state.streak;
    noteBest('bestStreak', state.streak);
    addMultiKill();
    chargeUlt(getFuryChargePerKill());

    const tier = STREAK.tiers.find(t => t.at === state.streak);
    if (tier) {
        const index = STREAK.tiers.indexOf(tier);
        showCallout(`${tier.label} · RUSH ${ROMAN[index] ?? index + 1}`, tier.color);
        audio.playStreakTier(index);
        payTier(tier, index);
    }
}

// O combo acaba com a onda: ao abrir o acampamento e ao começar a próxima, ele recomeça do zero (a onda fechando estende o
// tempo dele só para a comemoração; sem isto o combo e o Rush voltavam junto com a onda seguinte). O recorde fica guardado.
export function resetStreak() {
    state.streak = 0;
    state.streakTimer = 0;
    state.multiKill = 0;
    state.multiTimer = 0;
}

// Prêmio do marco: cura, moedas e, nos marcos altos, pontos de skill (uma vez por onda cada marco)
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
function payTier(tier, index) {
    if (tier.heal && player.hp > 0) {
        const heal = Math.round(player.maxHp * tier.heal);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        addNumber(player.x, player.y - 40, heal, 1, 'heal');
    }
    if (tier.gold) dropGold(player.x, player.y, tier.gold);
    addShockwave(player.x, player.y, { radius: 110 + index * 20, color: tier.color, width: 5, seconds: 0.4 });
    const paid = state.rushPaid ??= {};
    if (tier.points && paid[index] !== state.turn) {
        paid[index] = state.turn;
        state.skillPoints += tier.points;
        announcePoints(tier.points);
    }
}

// Bônus do Rush enquanto a sequência durar (js/systems/stats.js)
export function getRushTier() {
    return rushTier(state.streak);
}

// Várias mortes quase juntas (um golpe, uma explosão): o contador sobe enquanto a janela estiver aberta
function addMultiKill() {
    state.multiKill = state.multiTimer > 0 ? state.multiKill + 1 : 1;
    state.multiTimer = MULTI_KILL.windowSeconds;
    noteBest('bestMultiKill', state.multiKill);

    const tier = MULTI_KILL.tiers.find(t => t.at === state.multiKill);
    if (tier) showCallout(tier.label, tier.color);
}

export function getScoreMultiplier() {
    return Math.min(STREAK.maxScoreMultiplier, 1 + state.streak * STREAK.scorePerKill);
}

export function getStreakGoldBonus() {
    return Math.min(STREAK.maxGoldBonus, state.streak * STREAK.goldPerKill);
}

export function updateStreak(dt) {
    if (state.multiTimer > 0) {
        state.multiTimer -= dt;
        if (state.multiTimer <= 0) state.multiKill = 0;
    }
    if (state.streak > 0) {
        state.streakTimer -= dt;
        if (state.streakTimer <= 0) {
            state.streak = 0;
            state.streakTimer = 0;
        }
    }
}

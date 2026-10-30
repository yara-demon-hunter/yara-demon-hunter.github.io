import { MULTI_KILL } from '../../data_model/sanctuary.js';
import { STREAK } from '../../data_model/streak.js';
import { audio, state } from '../core/state.js';
import { showCallout } from '../ui/banner.js';
import { chargeUlt } from './combat.js';
import { mod } from './modifiers.js';
import { noteBest } from './sanctuary.js';

// --- SEQUÊNCIA DE MORTES ---
export function addStreakKill() {
    state.streak++;
    state.streakTimer = STREAK.windowSeconds;
    if (state.streak > state.run.bestStreak) state.run.bestStreak = state.streak;
    noteBest('bestStreak', state.streak);
    addMultiKill();
    chargeUlt(STREAK.furyChargePerKill * (1 + mod('furyCharge')));

    const tier = STREAK.tiers.find(t => t.at === state.streak);
    if (tier) {
        showCallout(tier.label, tier.color);
        audio.playStreakTier(STREAK.tiers.indexOf(tier));
    }
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

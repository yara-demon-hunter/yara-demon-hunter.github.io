import { STREAK } from '../../data_model/streak.js';
import { audio, state } from '../core/state.js';
import { showCallout } from '../ui/banner.js';
import { chargeUlt } from './combat.js';
import { mod } from './modifiers.js';

// --- SEQUÊNCIA DE MORTES ---
export function addStreakKill() {
    state.streak++;
    state.streakTimer = STREAK.windowSeconds;
    if (state.streak > state.run.bestStreak) state.run.bestStreak = state.streak;
    chargeUlt(STREAK.furyChargePerKill * (1 + mod('furyCharge')));

    const tier = STREAK.tiers.find(t => t.at === state.streak);
    if (tier) {
        showCallout(tier.label, tier.color);
        audio.playStreakTier(STREAK.tiers.indexOf(tier));
    }
}

export function getScoreMultiplier() {
    return Math.min(STREAK.maxScoreMultiplier, 1 + state.streak * STREAK.scorePerKill);
}

export function getStreakGoldBonus() {
    return Math.min(STREAK.maxGoldBonus, state.streak * STREAK.goldPerKill);
}

export function updateStreak(dt) {
    if (state.streak > 0) {
        state.streakTimer -= dt;
        if (state.streakTimer <= 0) {
            state.streak = 0;
            state.streakTimer = 0;
        }
    }
}

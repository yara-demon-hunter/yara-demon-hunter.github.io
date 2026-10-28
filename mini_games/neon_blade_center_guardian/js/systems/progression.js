import { CHARACTER_MODEL } from '../../data_model/character.js';
import { player, state } from '../core/state.js';
import { updateHUD } from '../ui/hud.js';
import { createExplosion, shakeScreen } from './effects.js';
import { getMaxPlayerHp } from './stats.js';

// --- LEVEL & XP ---
export function gainXp(amount) {
    state.playerXp += amount;
    if (state.playerXp >= state.playerMaxXp) {
        state.playerXp -= state.playerMaxXp;
        state.playerLevel++;
        state.playerMaxXp = Math.floor(state.playerMaxXp * CHARACTER_MODEL.xpGrowthMultiplier);

        player.maxHp = getMaxPlayerHp();
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * CHARACTER_MODEL.levelUpHealRatio);

        createExplosion(player.x, player.y, '#38bdf8', 30);
        shakeScreen(8);
    }
    updateHUD();
}

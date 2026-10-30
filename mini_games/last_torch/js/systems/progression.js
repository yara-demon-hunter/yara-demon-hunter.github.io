import { CHARACTER_MODEL, getXpToNextLevel } from '../../data_model/character.js';
import { audio, player, state } from '../core/state.js';
import { pulseLevel, updateHUD } from '../ui/hud.js';
import { addShockwave } from './effects.js';

// --- LEVEL & XP ---
// Cada nível abre a escolha de cartas (js/ui/cards.js) e dá uma cura parcial.
export function gainXp(amount) {
    state.playerXp += amount;
    while (state.playerXp >= state.playerMaxXp) {
        state.playerXp -= state.playerMaxXp;
        state.playerLevel++;
        state.playerMaxXp = getXpToNextLevel(state.playerLevel);
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * CHARACTER_MODEL.levelUpHealRatio);
        state.pendingCards.push('level');

        addShockwave(player.x, player.y, { radius: 90, color: '#c084fc', width: 5, seconds: 0.45 });
        audio.playLevelUp();
        pulseLevel();
    }
    updateHUD();
}

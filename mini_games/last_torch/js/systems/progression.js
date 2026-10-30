import { CHARACTER_MODEL } from '../../data_model/character.js';
import { SKILL_POINTS_PER_LEVEL } from '../../data_model/skills.js';
import { audio, player, state } from '../core/state.js';
import { pulseSkillPoints, updateHUD } from '../ui/hud.js';

// --- LEVEL & XP ---
// Cada nível dá pontos de skill para o jogador gastar nos stats que quiser (loja)
export function gainXp(amount) {
    state.playerXp += amount;
    if (state.playerXp >= state.playerMaxXp) {
        state.playerXp -= state.playerMaxXp;
        state.playerLevel++;
        state.skillPoints += SKILL_POINTS_PER_LEVEL;
        state.playerMaxXp = Math.floor(state.playerMaxXp * CHARACTER_MODEL.xpGrowthMultiplier);

        // Não melhora stats: só o ponto de skill e uma cura parcial
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * CHARACTER_MODEL.levelUpHealRatio);

        // Dois níveis seguidos somam os pontos na mesma mensagem
        const pendingPoints = state.levelUpFx ? state.levelUpFx.points : 0;
        state.levelUpFx = { age: 0, points: pendingPoints + SKILL_POINTS_PER_LEVEL };
        audio.playLevelUp();
        pulseSkillPoints();
    }
    updateHUD();
}

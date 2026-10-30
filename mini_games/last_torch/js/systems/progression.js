import { CHARACTER_MODEL, getXpToNextLevel } from '../../data_model/character.js';
import { audio, player, state } from '../core/state.js';
import { showToast } from '../ui/banner.js';
import { pulseLevel, updateHUD } from '../ui/hud.js';
import { mod } from './modifiers.js';
import { save, persist } from '../core/save.js';
import { TREE_POINTS } from '../../data_model/tree.js';
import { addShockwave } from './effects.js';

// Pontos de um nível: o básico mais a fração das relíquias, que acumula até virar ponto inteiro
function grantLevelPoints() {
    state.levelPointsCarry += mod('levelPoints');
    const extra = Math.floor(state.levelPointsCarry);
    state.levelPointsCarry -= extra;
    const points = TREE_POINTS.perLevel + extra;
    state.skillPoints += points;
    return points;
}

// Aviso em cima do herói; na primeira vez, uma dica de onde gastar
export function announcePoints(points) {
    state.levelUpFx = { age: 0, label: `+${points} SKILL POINT${points === 1 ? '' : 'S'}` };
    if (save.seenTreeHint) return;
    save.seenTreeHint = true;
    persist();
    showToast('⚡', 'You earned a skill point', 'Tap the medal at the top to spend it');
}

// --- LEVEL & XP ---
// Cada nível dá pontos de skill (gastos na árvore, js/ui/tree.js) e uma cura parcial.
export function gainXp(amount) {
    state.playerXp += amount;
    let gained = 0;
    while (state.playerXp >= state.playerMaxXp) {
        state.playerXp -= state.playerMaxXp;
        state.playerLevel++;
        state.playerMaxXp = getXpToNextLevel(state.playerLevel);
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * CHARACTER_MODEL.levelUpHealRatio);
        gained += grantLevelPoints();

        addShockwave(player.x, player.y, { radius: 90, color: '#c084fc', width: 5, seconds: 0.45 });
        audio.playLevelUp();
        pulseLevel();
    }
    if (gained > 0) announcePoints(gained);
    updateHUD();
}

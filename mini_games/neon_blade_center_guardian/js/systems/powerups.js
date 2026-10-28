import { CHARACTER_MODEL } from '../../data_model/character.js';
import { POWERUP_MODELS } from '../../data_model/skills.js';
import { audio, player, state } from '../core/state.js';
import { createExplosion, shakeScreen } from './effects.js';

// --- POWERUPS ---
export function updatePowerups(dt) {
    for (let i = state.powerups.length - 1; i >= 0; i--) {
        const pw = state.powerups[i];
        pw.life -= dt;
        if (pw.life <= 0) { state.powerups.splice(i, 1); continue; }

        if (Math.hypot(player.x - pw.x, player.y - pw.y) < CHARACTER_MODEL.powerupPickupRadius) {
            audio.playPowerup();
            if (pw.type === 'SHIELD') player.shieldTimer = POWERUP_MODELS.SHIELD.durationSeconds;
            else if (pw.type === 'DOUBLE_DMG') player.doubleDmgTimer = POWERUP_MODELS.DOUBLE_DMG.durationSeconds;
            else if (pw.type === 'BOMB') {
                shakeScreen(16);
                state.enemies.forEach(e => {
                    e.hp -= POWERUP_MODELS.BOMB.damage;
                    createExplosion(e.x, e.y, '#f43f5e', 8);
                });
            }
            state.powerups.splice(i, 1);
        }
    }
}

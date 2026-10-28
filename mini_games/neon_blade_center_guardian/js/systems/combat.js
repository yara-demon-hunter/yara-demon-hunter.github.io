import { BLADE_SKILL, FRENZY_NOVA_SKILL } from '../../data_model/skills.js';
import { SLASH_VISUALS } from '../../data_model/visuals.js';
import { audio, maxUltEnergy, passives, player, state } from '../core/state.js';
import { updateHUD } from '../ui/hud.js';
import { createExplosion, shakeScreen } from './effects.js';
import {
    getAtkCooldown,
    getAtkDamage,
    getAtkRadius,
    getFrenzyDuration,
    getKnockback,
    getSlashArcRadian
} from './stats.js';

// --- SISTEMA DE CORTE COM A LÂMINA ---
// Amplitude configurável via upgrade (getSlashArcRadian)
export function executeBladeSlash(x, y, angle, radius, comboStep, spin = false) {
    const currentArc = getSlashArcRadian();
    const visualLife = (spin ? SLASH_VISUALS.whirl : SLASH_VISUALS[comboStep]).lifeSeconds;

    state.bladeSlashes.push({
        x, y, angle, radius, comboStep, spin,
        arcWidth: currentArc,
        life: visualLife, maxLife: visualLife
    });

    audio.playSwordSlash(comboStep);

    // Pequeno avanço (dash) direcional no 3º ataque
    if (comboStep === 3) {
        const dashDist = BLADE_SKILL.comboDashDistance;
        player.x += Math.cos(angle) * dashDist;
        player.y += Math.sin(angle) * dashDist;
        createExplosion(player.x, player.y, '#c084fc', 12);
    }
}

export function chargeUlt(amount) {
    if (state.ultEnergy < maxUltEnergy) {
        state.ultEnergy = Math.min(maxUltEnergy, state.ultEnergy + amount);
        updateHUD();

        // Ativação Automática do Especial ao Carregar
        if (state.ultEnergy >= maxUltEnergy && state.frenzyActiveTimer <= 0) {
            triggerFrenzyUlt();
        }
    }
}

// Ativação Automática da Skill Frenzy Nova
export function triggerFrenzyUlt() {
    state.ultEnergy = 0;
    state.frenzyActiveTimer = getFrenzyDuration();
    audio.playUltSound();
    shakeScreen(15);

    // Disparo de ondas de lâminas em várias direções no momento de ativação
    for (let i = 0; i < FRENZY_NOVA_SKILL.slashCount; i++) {
        const angle = (Math.PI * 2 / FRENZY_NOVA_SKILL.slashCount) * i;
        executeBladeSlash(
            player.x,
            player.y,
            angle,
            getAtkRadius() * FRENZY_NOVA_SKILL.slashRadiusMultiplier,
            3
        );
    }

    updateHUD();
}

// Ataque Direcional Direto
export function updateAutoAttack(dt) {
    if (state.frenzyActiveTimer > 0) state.frenzyActiveTimer -= dt;

    player.attackTimer -= dt;
    const attackRad = getAtkRadius();
    const currentArcHalf = getSlashArcRadian() / 2;

    if (player.attackTimer > 0) return;

    let targetEnemy = null;
    let minDist = attackRad;

    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < minDist) {
            minDist = d;
            targetEnemy = e;
        }
    });

    if (!targetEnemy) return;

    player.attackTimer = getAtkCooldown();
    const atkAngle = Math.atan2(targetEnemy.y - player.y, targetEnemy.x - player.x);
    player.angle = atkAngle;

    // Skill passiva Giro Sombrio: o 3º golpe vira um giro de 360°
    const whirl = player.comboStep === 3 && passives.shadowWhirl.lvl > 0;
    executeBladeSlash(player.x, player.y, atkAngle, attackRad, player.comboStep, whirl);

    const dmg = getAtkDamage() * (player.comboStep === 3 ? BLADE_SKILL.comboDamageMultiplier : 1.0);
    const kbForce = getKnockback() * (player.comboStep === 3 ? BLADE_SKILL.comboKnockbackMultiplier : 1.0);

    // Colisão de dano no arco do golpe
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d <= attackRad + e.radius) {
            const enemyAngle = Math.atan2(e.y - player.y, e.x - player.x);
            let diffAngle = Math.abs(atkAngle - enemyAngle);
            while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
            diffAngle = Math.abs(diffAngle);

            // Aplica dano se o inimigo está dentro da abertura angular atual do corte
            if (diffAngle <= currentArcHalf + 0.1 || state.frenzyActiveTimer > 0 || whirl) {
                e.hp -= dmg;
                chargeUlt(FRENZY_NOVA_SKILL.chargePerHit);

                const pushAngle = Math.atan2(e.y - player.y, e.x - player.x);
                e.vx += Math.cos(pushAngle) * kbForce;
                e.vy += Math.sin(pushAngle) * kbForce;
                createExplosion(e.x, e.y, e.color, 4);
            }
        }
    });

    player.comboStep = player.comboStep >= 3 ? 1 : player.comboStep + 1;
}

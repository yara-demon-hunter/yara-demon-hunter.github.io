import { BLADE_SKILL, FRENZY_NOVA_SKILL } from '../../data_model/skills.js';
import { SLASH_VISUALS } from '../../data_model/visuals/effects/slash_visual.js';
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
// Amplitude configurável via upgrade (getSlashArcRadian). attacker: herói (padrão) ou Shadow Clone,
// que golpeia em silêncio e tem o efeito pintado de sombra (shadow: true).
export function executeBladeSlash(x, y, angle, radius, comboStep, spin = false, attacker = player) {
    const currentArc = getSlashArcRadian();
    const visualLife = (spin ? SLASH_VISUALS.whirl : SLASH_VISUALS[comboStep]).lifeSeconds;
    const shadow = attacker !== player;

    state.bladeSlashes.push({
        x, y, angle, radius, comboStep, spin, shadow,
        arcWidth: currentArc,
        life: visualLife, maxLife: visualLife
    });

    if (!shadow) audio.playSwordSlash(comboStep);

    // Pequeno avanço (dash) direcional no 3º ataque
    if (comboStep === 3) {
        const dashDist = BLADE_SKILL.comboDashDistance;
        attacker.x += Math.cos(angle) * dashDist;
        attacker.y += Math.sin(angle) * dashDist;
        createExplosion(attacker.x, attacker.y, '#c084fc', 12);
    }
}

// Monstro mais perto de (x, y) a menos de maxDist (ou null)
export function findNearestEnemy(x, y, maxDist) {
    let target = null;
    let minDist = maxDist;
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d < minDist) {
            minDist = d;
            target = e;
        }
    });
    return target;
}

// Dano e empurrão em todo monstro dentro do alcance e da abertura do corte (ou em volta toda:
// giro e Fúria ativa). onHit é chamado a cada monstro atingido.
export function hitEnemiesInArc(x, y, atkAngle, radius, arcHalf, dmg, kbForce, allAround, onHit) {
    state.enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d <= radius + e.radius) {
            const enemyAngle = Math.atan2(e.y - y, e.x - x);
            let diffAngle = Math.abs(atkAngle - enemyAngle);
            while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
            diffAngle = Math.abs(diffAngle);

            // Aplica dano se o inimigo está dentro da abertura angular atual do corte
            if (diffAngle <= arcHalf + 0.1 || state.frenzyActiveTimer > 0 || allAround) {
                e.hp -= dmg;
                if (onHit) onHit(e);

                e.vx += Math.cos(enemyAngle) * kbForce;
                e.vy += Math.sin(enemyAngle) * kbForce;
                createExplosion(e.x, e.y, e.color, 4);
            }
        }
    });
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
    state.frenzyDuration = getFrenzyDuration();
    state.frenzyActiveTimer = state.frenzyDuration;
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

    const targetEnemy = findNearestEnemy(player.x, player.y, attackRad);
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
    hitEnemiesInArc(player.x, player.y, atkAngle, attackRad, currentArcHalf, dmg, kbForce, whirl,
        () => chargeUlt(FRENZY_NOVA_SKILL.chargePerHit));

    player.comboStep = player.comboStep >= 3 ? 1 : player.comboStep + 1;
}

import { SHADOW_CLONE } from '../../data_model/passives.js';
import { BLADE_SKILL, FRENZY_NOVA_SKILL } from '../../data_model/skills.js';
import { SHADOW_CLONE_VISUALS } from '../../data_model/visuals/characters/shadow_clone_visual.js';
import { audio, passives, player, shadowClone as clone, state } from '../core/state.js';
import { executeBladeSlash, findNearestEnemy, hitEnemiesInArc } from './combat.js';
import { createExplosion } from './effects.js';
import { getAtkCooldown, getAtkDamage, getAtkRadius, getKnockback, getMaxPlayerHp, getSlashArcRadian } from './stats.js';

// --- SHADOW CLONE (passiva) ---
// Reflexo de sombra do herói: fica sempre a SHADOW_CLONE.followDistance dele (no lado
// offsetAngleDegrees) e anda junto. A espada é própria: golpeia o monstro mais perto quando ele
// entra no círculo do clone. As adagas saem junto com as do herói (js/systems/knives.js).
// Leva dano de monstros e tiros (js/systems/enemies.js chama damageShadowClone); morto, volta
// depois de SHADOW_CLONE.respawnSeconds com a vida cheia.
function placeClone() {
    const angle = (SHADOW_CLONE.offsetAngleDegrees * Math.PI) / 180;
    clone.x = Math.max(15, Math.min(state.width - 15, player.x + Math.cos(angle) * SHADOW_CLONE.followDistance));
    clone.y = Math.max(15, Math.min(state.height - 15, player.y + Math.sin(angle) * SHADOW_CLONE.followDistance));
}

function getCloneMaxHp() {
    return Math.round(getMaxPlayerHp() * SHADOW_CLONE.hpRatio);
}

function spawnClone() {
    clone.active = true;
    clone.respawnTimer = 0;
    clone.maxHp = getCloneMaxHp();
    clone.hp = clone.maxHp;
    clone.iFrames = 0;
    clone.spawnTime = performance.now();
    clone.comboStep = 1;
    clone.attackTimer = 0;
    clone.frenzy = state.frenzyActiveTimer > 0;
    placeClone();
    createExplosion(clone.x, clone.y, SHADOW_CLONE_VISUALS.spawnBurstColor, 18);
}

// Golpe próprio: mira o monstro mais perto dentro do círculo do clone, com o combo dele
// (o 3º golpe vira giro com o Shadow Whirl, como no herói)
function updateCloneAttack(dt) {
    clone.attackTimer -= dt;
    if (clone.attackTimer > 0) return;

    const radius = getAtkRadius() * SHADOW_CLONE.radiusMultiplier;
    const target = findNearestEnemy(clone.x, clone.y, radius);
    if (!target) return;

    clone.attackTimer = getAtkCooldown() * SHADOW_CLONE.cooldownMultiplier;
    const angle = Math.atan2(target.y - clone.y, target.x - clone.x);
    clone.angle = angle;

    const step = clone.comboStep;
    const whirl = step === 3 && passives.shadowWhirl.lvl > 0;
    executeBladeSlash(clone.x, clone.y, angle, radius, step, whirl, clone);

    const combo = step === 3;
    const dmg = getAtkDamage() * SHADOW_CLONE.damageMultiplier * (combo ? BLADE_SKILL.comboDamageMultiplier : 1);
    const kbForce = getKnockback() * SHADOW_CLONE.knockbackMultiplier * (combo ? BLADE_SKILL.comboKnockbackMultiplier : 1);
    // Não carrega a Fúria (sem onHit)
    hitEnemiesInArc(clone.x, clone.y, angle, radius, getSlashArcRadian() / 2, dmg, kbForce, whirl);

    clone.comboStep = step >= 3 ? 1 : step + 1;
}

// Golpe recebido (contato com monstro ou tiro): mesmo empurrão visual e invulnerabilidade do herói
export function damageShadowClone(amount, fromX, fromY, invulnerableSeconds) {
    if (!clone.active || clone.iFrames > 0) return;
    clone.hp -= amount;
    clone.iFrames = invulnerableSeconds;
    const dx = clone.x - fromX;
    const dy = clone.y - fromY;
    const len = Math.hypot(dx, dy) || 1;
    clone.hitDirX = dx / len;
    clone.hitDirY = dy / len;
    clone.hitTime = performance.now();

    if (clone.hp <= 0) {
        clone.hp = 0;
        clone.active = false;
        clone.respawnTimer = SHADOW_CLONE.respawnSeconds;
        createExplosion(clone.x, clone.y, SHADOW_CLONE_VISUALS.deathBurstColor, 26);
        audio.playExplode();
    } else {
        createExplosion(clone.x, clone.y, SHADOW_CLONE_VISUALS.deathBurstColor, 8);
    }
}

// Lâminas em todas as direções quando a Fúria do herói começa (só visual, como as do herói)
function mirrorFrenzyNova() {
    const radius = getAtkRadius() * SHADOW_CLONE.radiusMultiplier * FRENZY_NOVA_SKILL.slashRadiusMultiplier;
    for (let i = 0; i < FRENZY_NOVA_SKILL.slashCount; i++) {
        const angle = (Math.PI * 2 / FRENZY_NOVA_SKILL.slashCount) * i;
        executeBladeSlash(clone.x, clone.y, angle, radius, 3, false, clone);
    }
}

// Chamado depois do ataque do herói no mesmo quadro (js/game.js)
export function updateShadowClone(dt) {
    if (passives.shadowClone.lvl <= 0) {
        clone.active = false;
        clone.respawnTimer = 0;
        return;
    }
    // Morto: o lugar do reflexo continua acompanhando o herói (anel de volta em js/render/shadow_clone.js)
    if (clone.respawnTimer > 0) {
        placeClone();
        clone.respawnTimer -= dt;
        if (clone.respawnTimer <= 0) spawnClone();
        return;
    }
    if (!clone.active) spawnClone();
    placeClone();
    if (clone.iFrames > 0) clone.iFrames -= dt;
    // Upgrade de vida do herói também aumenta a vida máxima do clone
    clone.maxHp = getCloneMaxHp();
    clone.hp = Math.min(clone.hp, clone.maxHp);

    updateCloneAttack(dt);

    const frenzy = state.frenzyActiveTimer > 0;
    if (frenzy && !clone.frenzy) mirrorFrenzyNova();
    clone.frenzy = frenzy;

    // O golpe 3 do clone dá o mesmo avanço do herói; a posição volta a ser a do reflexo
    placeClone();
}

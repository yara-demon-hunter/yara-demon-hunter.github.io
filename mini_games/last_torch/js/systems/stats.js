import { CHARACTER_MODEL } from '../../data_model/character.js';
import { BLADE_SKILL, DASH_SKILL, FRENZY_NOVA_SKILL, KNIFE_SKILL, SPELL_SKILL } from '../../data_model/skills.js';
import { WAR_CRY } from '../../data_model/passives.js';
import { getPowerLevel } from '../../data_model/powers.js';
import { attributes, passives, player, powers, state } from '../core/state.js';
import { mod } from './modifiers.js';

// --- FÓRMULAS DE ATRIBUTOS ---
// Só as cartas escolhidas contam; o nível do herói não muda os stats sozinho.
// mod(): bônus de herói, relíquias e presságios (js/systems/modifiers.js).
export function getAtkDamage() {
    let base = (BLADE_SKILL.baseDamage
        + (attributes.damage.lvl - 1) * BLADE_SKILL.damagePerUpgrade) * (1 + mod('damage'));
    if (state.frenzyActiveTimer > 0) base *= 1 + getFrenzyDamageBonus();
    if (mod('lowHpDamage') > 0 && player.hp < player.maxHp * 0.35) base *= 1 + mod('lowHpDamage');
    if (getWarmthDamage() > 0 && Math.hypot(player.x - state.coreX, player.y - state.coreY) < getWarmthRadius()) {
        base *= 1 + getWarmthDamage();
    }
    return base;
}
// Bônus de dano dentro do calor da tocha: vem do Ember Steps (e de quem mais der warmthDamage)
export function getWarmthDamage() {
    return mod('warmthDamage') + (getPowerLevel(powers.emberTrail)?.warmthDamage ?? 0);
}
// Golpes da lâmina: o dano base com o que só vale para ela (Juramentos, Bloodlust, War Cry)
export function getBladeDamage() {
    const hunger = getPowerLevel(powers.bloodlust);
    return getAtkDamage() * (1 + mod('bladeDamage'))
        * (1 + (hunger ? state.bloodlust.stacks * hunger.damage : 0))
        * (1 + (state.warCryTimer > 0 ? WAR_CRY.bladeBonus : 0))
        * (state.frenzyActiveTimer > 0 ? 1 + attributes.frenzyNova.lvl * FRENZY_NOVA_SKILL.damageBonusPerUpgradeLevel : 1);
}
// Feitiços e tudo que a chama faz sozinha
export function getSpellDamage() {
    return getAtkDamage() * SPELL_SKILL.damageMultiplier * (1 + mod('spellDamage'));
}
export function getSpellCooldown(seconds) {
    return seconds * Math.max(0.3, 1 - mod('spellHaste'));
}
export function getCritChance() {
    return BLADE_SKILL.baseCritChance + mod('critChance');
}
export function getCritMultiplier() {
    return BLADE_SKILL.baseCritMultiplier + mod('critDamage');
}
export function getAtkRadius() {
    return Math.min(
        state.width * BLADE_SKILL.maxRadiusScreenRatio,
        BLADE_SKILL.baseRadius
            + (attributes.radius.lvl - 1) * BLADE_SKILL.radiusPerUpgrade
    );
}

// Retorna a amplitude do corte em radianos (Nv 1: ~40° -> Nv 6: 180° = Math.PI radianos)
export function getSlashArcRadian() {
    const minDeg = BLADE_SKILL.minimumSlashArcDegrees;
    const maxDeg = BLADE_SKILL.maximumSlashArcDegrees;
    const currentDeg = minDeg + (attributes.slashArc.lvl - 1) * ((maxDeg - minDeg) / (attributes.slashArc.maxLvl - 1));
    return (currentDeg * Math.PI) / 180;
}
export function getSlashArcDegree() {
    return Math.round((getSlashArcRadian() * 180) / Math.PI);
}

export function getAtkCooldown() {
    let cd = (BLADE_SKILL.baseCooldownSeconds
        - (attributes.atkSpeed.lvl - 1) * BLADE_SKILL.cooldownReductionPerUpgrade) * (1 - mod('attackSpeed'));
    if (state.frenzyActiveTimer > 0) cd *= BLADE_SKILL.frenzyCooldownMultiplier;
    const hunger = getPowerLevel(powers.bloodlust);
    if (hunger) cd *= 1 - state.bloodlust.stacks * hunger.speed;
    if (mod('stillAttack') > 0 && player.stillTime > 0.3) cd *= 1 - mod('stillAttack');
    return Math.max(BLADE_SKILL.minimumCooldownSeconds, cd);
}
export function getPlayerMaxSpeed() {
    return (CHARACTER_MODEL.initialMoveSpeed
        + (attributes.moveSpeed.lvl - 1) * CHARACTER_MODEL.moveSpeedPerUpgrade) * (1 + mod('moveSpeed'));
}
export function getKnockback() {
    return BLADE_SKILL.baseKnockback
        + (attributes.knockback.lvl - 1) * BLADE_SKILL.knockbackPerUpgrade;
}
export function getMaxPlayerHp() {
    return Math.round((CHARACTER_MODEL.baseHp
        + (attributes.playerHp.lvl - 1) * CHARACTER_MODEL.hpPerUpgrade
        + mod('maxHpFlat')) * (1 + mod('maxHp')));
}
// Fração do golpe que chega no herói
export function getDamageTakenRatio() {
    return Math.max(0.1, 1 + mod('damageTaken'));
}
export function getKillHeal() {
    return (getPowerLevel(powers.bloodEdge)?.heal ?? 0) + mod('killHeal');
}
export function getWarmthRadius() {
    return CHARACTER_MODEL.warmthRadius * (1 + mod('warmth'));
}
// Pontos por segundo; zero sob o Oath of Slaughter
export function getWarmthHeal() {
    return mod('noWarmthHeal') > 0 ? 0 : CHARACTER_MODEL.warmthHealPerSecond * (1 + mod('warmth'));
}
export function getFrenzyDamageBonus() {
    return attributes.frenzyNova.lvl * FRENZY_NOVA_SKILL.damageBonusPerUpgradeLevel;
}
export function getFrenzyDuration() {
    return FRENZY_NOVA_SKILL.baseDurationSeconds
        + attributes.frenzyNova.lvl * FRENZY_NOVA_SKILL.durationPerUpgradeLevelSeconds
        + mod('furyDuration');
}
// Dano de uma adaga, antes da carga do Charged Dagger Throw
// Com Fireballs a adaga vira magia: tudo da adaga continua valendo e o dano mágico entra por cima
export function getKnifeDamage() {
    const ricochet = getPowerLevel(powers.ricochet);
    const magic = passives.fireballs.lvl > 0 ? 1 + mod('spellDamage') : 1;
    return getAtkDamage() * KNIFE_SKILL.damageMultiplier * (1 + mod('knifeDamage') + (ricochet?.damage ?? 0)) * magic;
}
export function getKnifeCooldown() {
    return KNIFE_SKILL.cooldownSeconds * (1 - mod('knifeCooldown'));
}
export function getDashCharges() {
    return DASH_SKILL.charges + mod('dashCharges');
}
export function getDashCooldown() {
    return DASH_SKILL.cooldownSeconds * Math.max(0.3, 1 - mod('dashCooldown'));
}
export function getMagnetRadius() {
    return CHARACTER_MODEL.magnetRadius * (1 + mod('magnet'));
}

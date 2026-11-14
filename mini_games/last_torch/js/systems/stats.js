import { CHARACTER_MODEL } from '../../data_model/character.js';
import { getCharacterBase } from '../../data_model/characters/index.js';
import { BLADE_SKILL } from '../../data_model/skills.js';
import { WAR_CRY } from '../../data_model/passives.js';
import { getPowerLevel } from '../../data_model/powers.js';
import { attributes, passives, player, powers, state } from '../core/state.js';
import { getHero, mod } from './modifiers.js';
import { STREAK, rushTier } from '../../data_model/streak.js';

function getCurrentCharacterBase() {
    return getCharacterBase(getHero().model ?? 'hunter');
}

// Um número do personagem escolhido (`stats` em data_model/characters/<id>.js)
export function characterStat(key) {
    return getCurrentCharacterBase().player.stats[key];
}

// --- FÓRMULAS DE ATRIBUTOS ---
// Só as cartas escolhidas contam; o nível do herói não muda os stats sozinho.
// mod(): bônus de herói, relíquias e presságios (js/systems/modifiers.js).
export function getAtkDamage() {
    let base = (getCurrentCharacterBase().player.attackDamage
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
        * (state.frenzyActiveTimer > 0 ? 1 + getFrenzyDamageBonus() : 1);
}
// DANO DE MAGIA: feitiços, tocha, fênix, bolas de fogo, luz, natureza... Vem do `magicDamage` do personagem (0 = ele não usa magia).
// Sai AZUL na tela (style 'spell'). O dano de LÂMINA (getBladeDamage) é o físico: golpes, adaga, sombras, Fúrias de lâmina.
// Feitiços e tudo que a chama faz sozinha
export function getSpellDamage() {
    return characterStat('magicDamage') * (1 + mod('spellDamage'));
}
export function getSpellCooldown(seconds) {
    return seconds * Math.max(0.3, 1 - mod('spellHaste'));
}
export function getCritChance() {
    return characterStat('baseCritChance') + mod('critChance');
}
export function getCritMultiplier() {
    return characterStat('critMultiplier') + mod('critDamage');
}
export function getAtkRadius() {
    return Math.min(
        state.width * BLADE_SKILL.maxRadiusScreenRatio,
        getCurrentCharacterBase().player.bladeRange
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
    let cd = (getCurrentCharacterBase().player.attackCooldown
        - (attributes.atkSpeed.lvl - 1) * BLADE_SKILL.cooldownReductionPerUpgrade) * (1 - mod('attackSpeed'));
    if (state.frenzyActiveTimer > 0) cd *= BLADE_SKILL.frenzyCooldownMultiplier;
    const hunger = getPowerLevel(powers.bloodlust);
    if (hunger) cd *= 1 - state.bloodlust.stacks * hunger.speed;
    if (mod('stillAttack') > 0 && player.stillTime > 0.3) cd *= 1 - mod('stillAttack');
    cd *= 1 - rushTier(state.streak) * STREAK.rush.attackSpeedPerTier;     // Rush: o combo da sequência de mortes
    return Math.max(BLADE_SKILL.minimumCooldownSeconds, cd);
}
export function getPlayerMaxSpeed() {
    const speed = (getCurrentCharacterBase().player.moveSpeed
        + (attributes.moveSpeed.lvl - 1) * CHARACTER_MODEL.moveSpeedPerUpgrade) * (1 + mod('moveSpeed'))
        * (1 + rushTier(state.streak) * STREAK.rush.moveSpeedPerTier);
    // Axe Quake em andamento (Captain Brutos): quase parado enquanto o machado sobe e desce
    return player.move?.kind === 'quake' ? speed * getAxeQuake().moveSpeed : speed;
}
export function getKnockback() {
    return characterStat('baseKnockback')
        + (attributes.knockback.lvl - 1) * BLADE_SKILL.knockbackPerUpgrade;
}
export function getMaxPlayerHp() {
    return Math.round((getCurrentCharacterBase().player.maxHp
        + (attributes.playerHp.lvl - 1) * CHARACTER_MODEL.hpPerUpgrade
        + mod('maxHpFlat')) * (1 + mod('maxHp')));
}
// Axe Quake do personagem escolhido (força, cooldown, alcance...: data_model/characters/); null se ele não tem
// A Fúria do personagem escolhido: { kind, name, ...números } (data_model/characters/<id>.js)
export function getFury() {
    return getCurrentCharacterBase().player.fury;
}

// Habilidade do druida (data_model/characters/rowan.js); null para quem não a tem
export function getRootSnare() {
    return getCurrentCharacterBase().player.rootSnare;
}

export function getAxeQuake() {
    return getCurrentCharacterBase().player.axeQuake;
}
// Alcance base da adaga: do personagem escolhido (cada um tem o seu)
export function getKnifeBaseRange() {
    return getCurrentCharacterBase().player.knifeRange;
}
// Fração do golpe que chega no herói
export function getDamageTakenRatio() {
    return Math.max(0.1, 1 + mod('damageTaken'));
}
export function getKillHeal() {
    return (getPowerLevel(powers.bloodEdge)?.heal ?? 0) + mod('killHeal');
}
export function getWarmthRadius() {
    return characterStat('warmthRadius') * (1 + mod('warmth'));
}
// Calor da tocha: o alcance (`warmthRadius`) e a cura por segundo (`warmthHeal`) são do personagem; relíquias e skills (mod 'warmth')
// somam por cima. A cura cresce com parte do bônus de alcance (WARMTH_HEAL_SHARE) e tem teto; zero sob o Oath of Slaughter.
const WARMTH_HEAL_SHARE = 0.3;
const WARMTH_HEAL_MAX_MULTIPLIER = 1.5;
export function getWarmthHeal() {
    if (mod('noWarmthHeal') > 0) return 0;
    const multiplier = Math.min(WARMTH_HEAL_MAX_MULTIPLIER, 1 + mod('warmth') * WARMTH_HEAL_SHARE);
    return characterStat('warmthHeal') * multiplier;
}
// Tudo da Fúria vem do `fury` do personagem escolhido (data_model/characters/<id>.js); o nível da skill Fury (frenzyNova) sobe por cima
export function getFrenzyDamageBonus() {
    return attributes.frenzyNova.lvl * getFury().damageBonusPerLevel;
}
export function getFrenzyDuration() {
    const fury = getFury();
    return fury.durationSeconds + Math.max(0, attributes.frenzyNova.lvl - 1) * fury.durationPerLevel + mod('furyDuration');
}
// Carga da barra por monstro atingido e por morte na sequência, já com o bônus de Fury Charge
export function getFuryChargePerHit() {
    return getFury().chargePerHit * (1 + mod('furyCharge'));
}
export function getFuryChargePerKill() {
    return getFury().chargePerKill * (1 + mod('furyCharge'));
}
// Dano de uma adaga, antes da carga do Charged Dagger Throw
// Com Fireballs a adaga vira magia: tudo da adaga continua valendo e o dano mágico entra por cima
export function getKnifeDamage() {
    const ricochet = getPowerLevel(powers.ricochet);
    // Com Fireballs, ou num personagem de arremesso mágico (magicKnife: a rosa do Rowan, a adaga benta do Avgustino), o dano base
    // passa a ser o da MAGIA (e não o da lâmina)
    const base = passives.fireballs.lvl > 0 || isMagicKnife() ? getSpellDamage() : getAtkDamage();
    return base * characterStat('knifeDamageRatio') * (1 + mod('knifeDamage') + (ricochet?.damage ?? 0));
}
// O arremesso deste personagem é magia (dano azul)?
export function isMagicKnife() {
    return mod('magicKnife') > 0;
}
export function getKnifeCooldown() {
    return characterStat('knifeCooldown') * (1 - mod('knifeCooldown'));
}
export function getDashCharges() {
    // Oath of Faith: o juramento tira o dash (noDash)
    if (mod('noDash') > 0) return 0;
    return characterStat('dashCharges') + mod('dashCharges');
}
export function getDashDistance() {
    return getCurrentCharacterBase().player.dash.distance;
}
export function getDashSeconds() {
    return getCurrentCharacterBase().player.dash.seconds;
}
export function getDashCooldown() {
    return characterStat('dashCooldown') * Math.max(0.3, 1 - mod('dashCooldown'));
}
export function getMagnetRadius() {
    return CHARACTER_MODEL.magnetRadius * (1 + mod('magnet'));
}

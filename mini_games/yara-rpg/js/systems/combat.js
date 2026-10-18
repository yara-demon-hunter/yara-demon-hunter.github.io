// Combat actions, enemy turns, upgrades, rewards, and journey endings.
// Loaded as a classic script before game.js; shares the RPG global state.

function showFloatingDamage(targetId, damage, targetType, delayMs = 0, verticalOffset = 0) {
    const target = document.getElementById(targetId);
    if (!target || damage <= 0) return;

    const damageNumber = document.createElement('span');
    damageNumber.className = `floating-damage floating-damage-${targetType}`;
    damageNumber.textContent = `−${damage}`;
    damageNumber.setAttribute('aria-hidden', 'true');
    damageNumber.style.animationDelay = `${delayMs}ms`;
    damageNumber.style.setProperty('--floating-damage-offset', `${verticalOffset}rem`);
    target.append(damageNumber);
    window.setTimeout(() => damageNumber.remove(), 1800 + delayMs);
}

function applyMonsterParry(damage) {
    if (Math.random() * GAME_RULES.probabilityScale >= currentMonster.parry) return damage;

    const reducedDamage = Math.max(
        GAME_RULES.combat.minimumDamageAfterParry,
        Math.ceil(damage * GAME_RULES.combat.monsterParryDamageMultiplier)
    );
    logMessage(t('monsterParries', { monster: currentMonster.name, damage: reducedDamage }), 'special');
    return reducedDamage;
}

function isDualWieldingWeapons() {
    const mainHand = hero.equipment.mainHand;
    const offHand = hero.equipment.offHand;
    return mainHand?.itemType === 'weapon'
        && offHand?.itemType === 'weapon'
        && mainHand.handUsage !== 'two-handed'
        && offHand.handUsage !== 'two-handed';
}

function getMainHandAttackStat() {
    const offHandWeaponBonus = isDualWieldingWeapons()
        ? Number(hero.equipment.offHand.stats.atk) || 0
        : 0;
    return getEffectiveStat('atk') - offHandWeaponBonus;
}

function getOffHandAttackDamage(attackMultiplier, randomBonusRange, minimumDamage) {
    if (!isDualWieldingWeapons()) return 0;
    const multiplier = GAME_RULES.combat.dualWieldDamageMultiplier;
    const mainHandWeaponBonus = Number(hero.equipment.mainHand.stats.atk) || 0;
    const offHandAttackStat = getEffectiveStat('atk') - mainHandWeaponBonus;
    return Math.max(
        Math.ceil(minimumDamage * multiplier),
        Math.floor(offHandAttackStat * attackMultiplier * multiplier)
            - currentMonster.def
            + Math.floor(Math.random() * randomBonusRange * multiplier)
    );
}

function resolveHeroAttack(damage, messageKey, criticalStunBonus = 0, furyMultiplier = 0, offHandDamage = 0) {
    if (!inCombat || !currentMonster) return;
    combatActionLocked = true;
    enemyTelegraphing = false;
    const encounterId = combatEncounterId;
    damage = applyMonsterParry(damage);
    if (!inCombat || !currentMonster || encounterId !== combatEncounterId) return;
    const damageDealt = Math.min(currentMonster.hp, damage);
    currentMonster.hp -= damageDealt;
    showFloatingDamage('monster-icon', damageDealt, 'monster');
    let offHandDamageDealt = 0;
    if (offHandDamage > 0 && currentMonster.hp > 0) {
        const reducedOffHandDamage = applyMonsterParry(offHandDamage);
        offHandDamageDealt = Math.min(currentMonster.hp, reducedOffHandDamage);
        currentMonster.hp -= offHandDamageDealt;
        showFloatingDamage('monster-icon', offHandDamageDealt, 'monster', 240, 0.75);
    }
    const totalDamageDealt = damageDealt + offHandDamageDealt;
    const furyGained = Math.min(getEffectiveFuryThreshold() - hero.fury, Math.floor(totalDamageDealt * furyMultiplier));
    hero.fury += furyGained;
    if (offHandDamageDealt > 0) {
        logMessage(t(furyMultiplier > 0 ? 'dualWieldQuickDamage' : 'dualWieldDamage', {
            damage: damageDealt,
            offhandDamage: offHandDamageDealt,
            fury: furyGained
        }), "combat-hero");
    } else {
        logMessage(t(messageKey, { damage: damageDealt, fury: furyGained }), "combat-hero");
    }

    const stunChance = Math.min(
        selectedCharacter.limits.maxStunChance,
        Math.min(selectedCharacter.limits.maxStunChance, getEffectiveStat('stunChance')) + criticalStunBonus
    );
    const stunned = currentMonster.hp > 0 && Math.random() * GAME_RULES.probabilityScale < stunChance;
    if (stunned) logMessage(t("stunLanded"), "special");
    checkCombatProgress(stunned);
    updateUI();
}

// NOVO GOLPE: Ataque Rápido (Mais preciso, dano moderado)
function combatQuickAttack() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    if (hero.fury >= getEffectiveFuryThreshold()) {
        combatCriticalAttack();
        return;
    }
    combatActionLocked = true;
    playSound('basicAttack');

    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const attackRules = GAME_RULES.combat.quickAttack;
    const damage = Math.max(
        attackRules.minimumDamage,
        Math.floor(getMainHandAttackStat() * attackRules.attackMultiplier)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    const offHandDamage = getOffHandAttackDamage(
        attackRules.attackMultiplier,
        attackRules.randomBonusRange,
        attackRules.minimumDamage
    );
    resolveHeroAttack(damage, "quickDamage", 0, FURY_PER_BASIC_ATTACK_DAMAGE, offHandDamage);
}

// NOVO GOLPE: Estocada Pesada (Gasta Foco, dano alto)
function combatHeavyAttack() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    const attackRules = { ...GAME_RULES.combat.heavyAttack, ...selectedCharacter.skills.heavyAttack };
    if (hero.foco < attackRules.focoCost) {
        logMessage(t("noFocus"));
        return;
    }
    combatActionLocked = true;
    hero.foco -= attackRules.focoCost;
    showFloatingDamage('hero-focus-anchor', attackRules.focoCost, 'focus');
    playSound('specialAttack');

    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const damage = Math.max(
        attackRules.minimumDamage,
        Math.floor(getMainHandAttackStat() * attackRules.attackMultiplier)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    const offHandDamage = getOffHandAttackDamage(
        attackRules.attackMultiplier,
        attackRules.randomBonusRange,
        attackRules.minimumDamage
    );
    resolveHeroAttack(damage, "heavyDamage", 0, 0, offHandDamage);
}

function combatCriticalAttack() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked || hero.fury < getEffectiveFuryThreshold()) return;
    combatActionLocked = true;
    hero.fury = 0;
    playSound('specialAttack');
    updateUI();
    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const attackRules = GAME_RULES.combat.criticalAttack;
    const damage = Math.max(
        attackRules.minimumDamage,
        Math.floor(getMainHandAttackStat() * CRITICAL_DAMAGE_MULTIPLIER)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    const offHandDamage = getOffHandAttackDamage(
        CRITICAL_DAMAGE_MULTIPLIER,
        attackRules.randomBonusRange,
        attackRules.minimumDamage
    );
    resolveHeroAttack(damage, "criticalDamage", CRITICAL_STUN_BONUS, 0, offHandDamage);
}

// NOVO GOLPE: Postura Firme (Aumenta defesa e recupera foco)
function combatDefend() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    const bonusGained = Math.min(
        selectedCharacter.skills.parry.bonus,
        selectedCharacter.limits.maxParry - getEffectiveStat('parry') - hero.parryBonus
    );
    if (bonusGained <= 0) {
        logMessage(t('parryMaxed', { max: selectedCharacter.limits.maxParry }));
        return;
    }
    if (hero.foco < selectedCharacter.skills.parry.focoCost) {
        logMessage(t('noParryFocus', { cost: selectedCharacter.skills.parry.focoCost }));
        return;
    }
    if (parrySkillUsedThisCombat) return;
    combatActionLocked = true;
    parrySkillUsedThisCombat = true;
    hero.foco -= selectedCharacter.skills.parry.focoCost;
    showFloatingDamage('hero-focus-anchor', selectedCharacter.skills.parry.focoCost, 'focus');
    hero.parryBonus += bonusGained;
    logMessage(t('defendMessage', { amount: bonusGained }), 'special');

    monsterAttackTurn();
    updateUI();
}

function combatDodge() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    const bonusGained = Math.min(
        selectedCharacter.skills.dodge.bonus,
        selectedCharacter.limits.maxEvasion - getEffectiveStat('evasion') - hero.evasionBonus
    );
    if (bonusGained <= 0) {
        logMessage(t("evasionMaxed", { max: selectedCharacter.limits.maxEvasion }));
        return;
    }
    if (hero.foco < selectedCharacter.skills.dodge.focoCost) {
        logMessage(t("noDodgeFocus", { cost: selectedCharacter.skills.dodge.focoCost }));
        return;
    }
    if (dodgeSkillUsedThisCombat) return;
    combatActionLocked = true;
    dodgeSkillUsedThisCombat = true;
    hero.foco -= selectedCharacter.skills.dodge.focoCost;
    showFloatingDamage('hero-focus-anchor', selectedCharacter.skills.dodge.focoCost, 'focus');
    hero.defending = false;
    hero.evasionBonus += bonusGained;
    logMessage(t("dodgeMessage", { amount: bonusGained }), "special");

    monsterAttackTurn();
    updateUI();
}

function checkCombatProgress(monsterStunned = false) {
    if (!inCombat || !currentMonster) return;
    updateMonsterUI();
    if (currentMonster.hp <= 0) {
        endCombatVictory();
        return;
    }
    if (monsterStunned) {
        combatActionLocked = false;
        updateUI();
        return;
    }
    monsterAttackTurn();
}

function monsterAttackTurn() {
    if (!inCombat || !currentMonster || !combatActionLocked) return;
    const encounterId = combatEncounterId;
    enemyTurnCount++;
    const wasTelegraphing = enemyTelegraphing;
    enemyTelegraphing = false;

    const evasionChance = Math.min(selectedCharacter.limits.maxEvasion, getEffectiveStat('evasion') + hero.evasionBonus);
    const evaded = Math.random() * GAME_RULES.probabilityScale < evasionChance;
    if (evaded) {
        playSound('dodge');
        hero.defending = false;
        const furyGained = Math.min(FURY_PER_DODGE, getEffectiveFuryThreshold() - hero.fury);
        hero.fury += furyGained;
        logMessage(t("heroDodges", { monster: currentMonster.name, amount: furyGained }), "special");
        if (encounterId !== combatEncounterId || !inCombat) return;
        combatActionLocked = false;
        updateUI();
        return;
    }

    const attackRules = GAME_RULES.combat.monsterAttack;
    let monsterDamage = Math.max(
        attackRules.minimumDamage,
        currentMonster.atk - getEffectiveStat('def') + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    if (wasTelegraphing) monsterDamage = Math.floor(monsterDamage * GAME_RULES.combat.enemyTelegraphDamageMultiplier);
    const parryChance = Math.min(selectedCharacter.limits.maxParry, getEffectiveStat('parry') + hero.parryBonus);
    const parried = Math.random() * GAME_RULES.probabilityScale < parryChance;
    if (parried) {
        playSound('parry');
        monsterDamage = Math.max(
            GAME_RULES.combat.minimumDamageAfterParry,
            Math.ceil(monsterDamage * GAME_RULES.combat.monsterParryDamageMultiplier)
        );
    }

    const damageTaken = Math.min(hero.hp, monsterDamage);
    hero.hp = Math.max(0, hero.hp - damageTaken);
    showFloatingDamage('hero-hp-anchor', damageTaken, 'hero');
    hero.fury = Math.min(getEffectiveFuryThreshold(), hero.fury + damageTaken * FURY_PER_DAMAGE);
    logMessage(parried
        ? t('heroParries', { damage: damageTaken })
        : t("monsterDamage", { monster: currentMonster.name, damage: damageTaken }), parried ? 'special' : 'combat-monster');
    if (encounterId !== combatEncounterId || !inCombat) return;
    updateUI();

    if (hero.hp <= 0) {
        endCombatDefeat();
        return;
    }
    if (enemyTurnCount % GAME_RULES.combat.telegraphEveryTurns === 0) {
        enemyTelegraphing = true;
        logMessage(t('enemyTelegraph', { monster: currentMonster.name }), 'combat-monster');
    }
    combatActionLocked = false;
    updateUI();
}

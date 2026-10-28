// Combat actions, enemy turns, upgrades, rewards, and journey endings.
// Loaded as a classic script before game.js; shares the RPG global state.

let pendingFuryAnimation = 0;

function queueFuryAnimation(amount) {
    pendingFuryAnimation += Math.max(0, Number(amount) || 0);
}

function flushFuryAnimation() {
    if (pendingFuryAnimation > 0) {
        showFloatingDamage('hero-fury-anchor', pendingFuryAnimation, 'fury', 0, 0, '+');
        pendingFuryAnimation = 0;
    }
}

function queueMonsterAttackTurn() {
    if (!inCombat || !currentMonster || !combatActionLocked) return;
    monsterAttackTurn();
}

function showFloatingDamage(targetId, damage, targetType, delayMs = 0, verticalOffset = 0, sign = '−') {
    const target = document.getElementById(targetId);
    if (!target || damage <= 0) return;

    const damageNumber = document.createElement('span');
    damageNumber.className = `floating-damage floating-damage-${targetType}`;
    damageNumber.textContent = `${sign}${damage}`;
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

function calculateAttackDamage(attackStat, attackMultiplier, randomBonusRange, minimumDamage, isCritical = false) {
    const defenseMultiplier = isCritical
        ? 1 - GAME_RULES.combat.criticalDefenseIgnoreFraction
        : 1;
    const defense = currentMonster.def * defenseMultiplier;
    const damageBeforeCritical = Math.max(
        minimumDamage,
        Math.floor(attackStat * attackMultiplier)
            - defense
            + Math.floor(Math.random() * randomBonusRange)
    );
    return isCritical
        ? Math.floor(damageBeforeCritical * getEffectiveCriticalDamage() / 100)
        : damageBeforeCritical;
}

function rollCriticalHit() {
    return Math.random() * GAME_RULES.probabilityScale < getEffectiveCriticalChance();
}

let criticalImpactTimeout = null;
let monsterStunTimeout = null;

function clearMonsterStunEffect() {
    window.clearTimeout(monsterStunTimeout);
    document.getElementById('monster-icon')?.classList.remove('monster-stunned');
}

function playCriticalImpact() {
    const target = document.getElementById('monster-icon');
    if (!target) return;
    window.clearTimeout(criticalImpactTimeout);
    target.classList.remove('critical-impact');
    void target.offsetWidth;
    target.classList.add('critical-impact');
    target.addEventListener('animationend', () => target.classList.remove('critical-impact'), { once: true });
    criticalImpactTimeout = window.setTimeout(() => {
        target.classList.remove('critical-impact');
    }, 500);
}

function playHeavyAttackImpact() {
    const target = document.getElementById('monster-icon');
    if (!target) return;
    target.classList.remove('heavy-attack-impact');
    void target.offsetWidth;
    target.classList.add('heavy-attack-impact');
    target.addEventListener('animationend', () => target.classList.remove('heavy-attack-impact'), { once: true });
    window.setTimeout(() => target.classList.remove('heavy-attack-impact'), 700);
}

function playMonsterStunEffect() {
    const target = document.getElementById('monster-icon');
    if (!target) return;
    clearMonsterStunEffect();
    void target.offsetWidth;
    target.classList.add('monster-stunned');
    monsterStunTimeout = window.setTimeout(() => {
        target.classList.remove('monster-stunned');
    }, 850);
    playSound('stun');
}

function playHeroBuffEffect(buffType) {
    const target = document.getElementById('hero-portrait-anchor');
    if (!target) return;
    const effectClass = buffType === 'dodge' ? 'hero-buff-dodge' : 'hero-buff-parry';
    target.classList.remove('hero-buff-dodge', 'hero-buff-parry');
    void target.offsetWidth;
    target.classList.add(effectClass);
    target.addEventListener('animationend', () => target.classList.remove(effectClass), { once: true });
    window.setTimeout(() => target.classList.remove(effectClass), 1500);
}

function healFromLifeSteal(damageDealt) {
    const lifeStealPercent = Number(selectedCharacter?.passive?.lifeStealPercent) || 0;
    if (lifeStealPercent <= 0 || damageDealt <= 0) return 0;

    const maxHp = getEffectiveStat('maxHp');
    if (hero.hp >= maxHp) {
        hero.lifeStealRemainder = 0;
        return 0;
    }

    const accumulatedHealing = Math.max(0, Number(hero.lifeStealRemainder) || 0)
        + damageDealt * lifeStealPercent / 100;
    const wholeHealing = Math.floor(accumulatedHealing);
    hero.lifeStealRemainder = accumulatedHealing - wholeHealing;
    const healed = Math.min(wholeHealing, maxHp - hero.hp);
    hero.hp += healed;
    if (hero.hp >= maxHp) hero.lifeStealRemainder = 0;
    return healed;
}

function resolveHeroAttack(damage, messageKey, criticalStunBonus = 0, furyMultiplier = 0, isCritical = false, isHeavyAttack = false) {
    if (!inCombat || !currentMonster) return;
    combatActionLocked = true;
    const interruptedTelegraph = enemyTelegraphing;
    enemyTelegraphing = false;
    const encounterId = combatEncounterId;
    damage = applyMonsterParry(damage);
    if (!inCombat || !currentMonster || encounterId !== combatEncounterId) return;
    const damageDealt = Math.min(currentMonster.hp, damage);
    currentMonster.hp -= damageDealt;
    showFloatingDamage('monster-icon', damageDealt, isCritical ? 'critical-monster' : 'monster');
    const lifeStealHealing = healFromLifeSteal(damageDealt);
    if (lifeStealHealing > 0) {
        showFloatingDamage('hero-hp-anchor', lifeStealHealing, 'heal', 0, 0, '+');
        logMessage(t('lifeStealHealed', { amount: lifeStealHealing }), 'special');
    }
    if (isCritical) playCriticalImpact();
    else if (isHeavyAttack) playHeavyAttackImpact();
    const furyGained = Math.min(getEffectiveFuryThreshold() - hero.fury, Math.floor(damageDealt * furyMultiplier));
    hero.fury += furyGained;
    queueFuryAnimation(furyGained);
    if (isCritical) {
        logMessage(t('criticalDamage', {
            damage: damageDealt,
            piercing: Math.round(GAME_RULES.combat.criticalDefenseIgnoreFraction * 100)
        }), "combat-hero");
    } else {
        logMessage(t(messageKey, { damage: damageDealt, fury: furyGained }), "combat-hero");
    }

    if (interruptedTelegraph && currentMonster.hp > 0) {
        const interruptFury = Math.min(GAME_RULES.combat.telegraphInterruptFury, getEffectiveFuryThreshold() - hero.fury);
        hero.fury += interruptFury;
        queueFuryAnimation(interruptFury);
        logMessage(window.YaraMeta.text('interrupted', { monster: currentMonster.name, fury: interruptFury }), 'combat-hero');
        window.YaraMeta?.onInterrupt();
    }

    const stunChance = Math.min(
        selectedCharacter.limits.maxStunChance,
        Math.min(selectedCharacter.limits.maxStunChance, getEffectiveStat('stunChance')) + criticalStunBonus
    );
    const stunned = currentMonster.hp > 0 && Math.random() * GAME_RULES.probabilityScale < stunChance;
    if (stunned) {
        logMessage(t("stunLanded"), "special");
        playMonsterStunEffect();
    }
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

    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const attackRules = GAME_RULES.combat.quickAttack;
    const isCritical = rollCriticalHit();
    playSound(isCritical ? 'criticalHit' : 'basicAttack');
    const damage = calculateAttackDamage(
        getEffectiveStat('atk'),
        attackRules.attackMultiplier,
        attackRules.randomBonusRange,
        attackRules.minimumDamage,
        isCritical
    );
    resolveHeroAttack(
        damage,
        isCritical ? "criticalDamage" : "quickDamage",
        0,
        isCritical ? 0 : FURY_PER_BASIC_ATTACK_DAMAGE,
        isCritical
    );
}

// NOVO GOLPE: Estocada Pesada (Gasta Foco, dano alto)
function combatHeavyAttack() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked || !selectedCharacter.skills.heavyAttack) return;
    const attackRules = { ...GAME_RULES.combat.heavyAttack, ...selectedCharacter.skills.heavyAttack };
    if (hero.foco < attackRules.focoCost) {
        logMessage(t("noFocus"));
        return;
    }
    combatActionLocked = true;
    hero.foco -= attackRules.focoCost;
    showFloatingDamage('hero-focus-anchor', attackRules.focoCost, 'focus');
    const isCritical = rollCriticalHit();
    playSound(isCritical ? 'criticalHit' : 'specialAttack');

    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const damage = calculateAttackDamage(
        getEffectiveStat('atk'),
        attackRules.attackMultiplier,
        attackRules.randomBonusRange,
        attackRules.minimumDamage,
        isCritical
    );
    resolveHeroAttack(
        damage,
        isCritical ? "criticalDamage" : "heavyDamage",
        0,
        0,
        isCritical,
        true
    );
}

function combatCriticalAttack() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked || hero.fury < getEffectiveFuryThreshold()) return;
    combatActionLocked = true;
    hero.fury = 0;
    playSound('criticalHit');
    updateUI();
    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const attackRules = GAME_RULES.combat.criticalAttack;
    const damage = calculateAttackDamage(
        getEffectiveStat('atk'),
        1,
        attackRules.randomBonusRange,
        attackRules.minimumDamage,
        true
    );
    resolveHeroAttack(damage, "criticalDamage", CRITICAL_STUN_BONUS, 0, true);
}

// NOVO GOLPE: Postura Firme (Aumenta defesa e recupera foco)
function combatDefend() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked || !selectedCharacter.skills.parry) return;
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
    playHeroBuffEffect('parry');
    logMessage(t('defendMessage', { amount: bonusGained }), 'special');

    queueMonsterAttackTurn();
    updateUI();
}

function combatDodge() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked || !selectedCharacter.skills.dodge) return;
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
    playHeroBuffEffect('dodge');
    logMessage(t("dodgeMessage", { amount: bonusGained }), "special");

    queueMonsterAttackTurn();
    updateUI();
}

function checkCombatProgress(monsterStunned = false) {
    if (!inCombat || !currentMonster) return;
    updateMonsterUI();
    if (currentMonster.hp <= 0) {
        flushFuryAnimation();
        endCombatVictory();
        return;
    }
    if (monsterStunned) {
        flushFuryAnimation();
        combatActionLocked = false;
        updateUI();
        return;
    }
    queueMonsterAttackTurn();
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
        const dodgeFuryBonus = Number(selectedCharacter.passive?.furyPerDodgeBonus) || 0;
        const furyGained = Math.min(FURY_PER_DODGE + dodgeFuryBonus, getEffectiveFuryThreshold() - hero.fury);
        hero.fury += furyGained;
        queueFuryAnimation(furyGained);
        flushFuryAnimation();
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
    const furyBeforeHit = hero.fury;
    hero.fury = Math.min(getEffectiveFuryThreshold(), hero.fury + damageTaken * FURY_PER_DAMAGE);
    const furyGained = hero.fury - furyBeforeHit;
    queueFuryAnimation(furyGained);
    logMessage(parried
        ? t('heroParries', { damage: damageTaken })
        : t("monsterDamage", { monster: currentMonster.name, damage: damageTaken }), parried ? 'special' : 'combat-monster');
    if (encounterId !== combatEncounterId || !inCombat) return;
    flushFuryAnimation();
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

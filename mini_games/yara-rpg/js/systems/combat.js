// Combat actions, enemy turns, upgrades, rewards, and journey endings.
// Loaded as a classic script before game.js; shares the RPG global state.

function applyMonsterParry(damage) {
    if (Math.random() * GAME_RULES.probabilityScale >= currentMonster.parry) return damage;

    const reducedDamage = Math.max(
        GAME_RULES.combat.minimumDamageAfterParry,
        Math.ceil(damage * GAME_RULES.combat.monsterParryDamageMultiplier)
    );
    logMessage(t('monsterParries', { monster: currentMonster.name, damage: reducedDamage }), 'special');
    return reducedDamage;
}

function resolveHeroAttack(damage, messageKey, criticalStunBonus = 0, furyMultiplier = 0) {
    if (!inCombat || !currentMonster) return;
    combatActionLocked = true;
    enemyTelegraphing = false;
    const encounterId = combatEncounterId;
    damage = applyMonsterParry(damage);
    if (!inCombat || !currentMonster || encounterId !== combatEncounterId) return;
    const damageDealt = Math.min(currentMonster.hp, damage);
    currentMonster.hp -= damageDealt;
    const furyGained = Math.min(hero.maxFury - hero.fury, Math.floor(damageDealt * furyMultiplier));
    hero.fury += furyGained;
    logMessage(t(messageKey, { damage: damageDealt, fury: furyGained }), "combat-hero");

    const stunChance = Math.min(
        GAME_RULES.probabilityScale,
        Math.min(GAME_RULES.probabilityScale, getEffectiveStat('stunChance')) + criticalStunBonus
    );
    const stunned = currentMonster.hp > 0 && Math.random() * GAME_RULES.probabilityScale < stunChance;
    if (stunned) logMessage(t("stunLanded"), "special");
    checkCombatProgress(stunned);
    updateUI();
}

// NOVO GOLPE: Ataque Rápido (Mais preciso, dano moderado)
function combatQuickAttack() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    if (hero.fury >= hero.maxFury) {
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
        Math.floor(getEffectiveStat('atk') * attackRules.attackMultiplier)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    resolveHeroAttack(damage, "quickDamage", 0, FURY_PER_BASIC_ATTACK_DAMAGE);
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
    playSound('specialAttack');

    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const damage = Math.max(
        attackRules.minimumDamage,
        Math.floor(getEffectiveStat('atk') * attackRules.attackMultiplier)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    resolveHeroAttack(damage, "heavyDamage");
}

function combatCriticalAttack() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked || hero.fury < hero.maxFury) return;
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
        Math.floor(getEffectiveStat('atk') * CRITICAL_DAMAGE_MULTIPLIER)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    resolveHeroAttack(damage, "criticalDamage", CRITICAL_STUN_BONUS);
}

// NOVO GOLPE: Postura Firme (Aumenta defesa e recupera foco)
function combatDefend() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    const bonusGained = Math.min(
        selectedCharacter.skills.parry.bonus,
        selectedCharacter.skills.maxParry - getEffectiveStat('parry') - hero.parryBonus
    );
    if (bonusGained <= 0) {
        logMessage(t('parryMaxed', { max: selectedCharacter.skills.maxParry }));
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
    hero.parryBonus += bonusGained;
    logMessage(t('defendMessage', { amount: bonusGained }), 'special');

    monsterAttackTurn();
    updateUI();
}

function combatDodge() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    const bonusGained = Math.min(
        selectedCharacter.skills.dodge.bonus,
        selectedCharacter.skills.maxEvasion - getEffectiveStat('evasion') - hero.evasionBonus
    );
    if (bonusGained <= 0) {
        logMessage(t("evasionMaxed", { max: selectedCharacter.skills.maxEvasion }));
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

    const evasionChance = Math.min(selectedCharacter.skills.maxEvasion, getEffectiveStat('evasion') + hero.evasionBonus);
    const evaded = Math.random() * GAME_RULES.probabilityScale < evasionChance;
    if (evaded) {
        playSound('dodge');
        hero.defending = false;
        const furyGained = Math.min(FURY_PER_DODGE, hero.maxFury - hero.fury);
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
    const parryChance = Math.min(selectedCharacter.skills.maxParry, getEffectiveStat('parry') + hero.parryBonus);
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
    if (damageTaken) {
        const panel = document.getElementById('game-panel');
        panel.classList.remove('is-hit'); void panel.offsetWidth; panel.classList.add('is-hit');
    }
    hero.fury = Math.min(hero.maxFury, hero.fury + damageTaken * FURY_PER_DAMAGE);
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

function isUpgradeMaxed(upgrade, overrideConfiguration = UPGRADE_CONFIG[upgrade]) {
    const configuration = overrideConfiguration;
    if (configuration?.max === undefined) return false;
    const currentValue = configuration.isPercentage
        ? getEffectiveStat(configuration.stat)
        : hero[configuration.stat];
    return currentValue >= configuration.max;
}

function getMaxUpgradeQuantity(upgrade, overrideConfiguration = UPGRADE_CONFIG[upgrade]) {
    const configuration = overrideConfiguration;
    if (!configuration || UPGRADE_COST <= 0) return 0;

    const affordableQuantity = Math.floor(hero.gold / UPGRADE_COST);
    if (configuration.max === undefined) return affordableQuantity;

    const currentValue = configuration.isPercentage
        ? getEffectiveStat(configuration.stat)
        : hero[configuration.stat];
    const remaining = Math.max(0, configuration.max - currentValue);
    return Math.min(affordableQuantity, Math.ceil(remaining / configuration.amount));
}

function getUpgradeConfiguration(upgrade) {
    const configuration = UPGRADE_CONFIG[upgrade];
    if (!configuration) return null;
    if (upgrade === 'parry') return { ...configuration, max: selectedCharacter.skills.maxParry };
    if (upgrade === 'evasion') return { ...configuration, max: selectedCharacter.skills.maxEvasion };
    return configuration;
}

function closeUpgradeOptions() {
    openUpgradeOptions = null;
    document.querySelectorAll('[data-upgrade-options]').forEach((options) => {
        options.hidden = true;
    });
    document.querySelectorAll('[data-upgrade]').forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
    });
}

function toggleUpgradeOptions(upgrade) {
    const configuration = getUpgradeConfiguration(upgrade);
    if (!configuration || inCombat || gameOver || campaignComplete || getMaxUpgradeQuantity(upgrade, configuration) < 1 || isUpgradeMaxed(upgrade, configuration)) return;

    openUpgradeOptions = openUpgradeOptions === upgrade ? null : upgrade;
    updateUI();
}

function purchaseUpgrade(upgrade, requestedQuantity) {
    const configuration = getUpgradeConfiguration(upgrade);
    if (!configuration) return;
    const maxQuantity = getMaxUpgradeQuantity(upgrade, configuration);
    const quantity = requestedQuantity === 'max'
        ? maxQuantity
        : Number(requestedQuantity);
    if (
        inCombat
        || gameOver
        || campaignComplete
        || !Number.isInteger(quantity)
        || quantity < 1
        || quantity > maxQuantity
        || isUpgradeMaxed(upgrade, configuration)
    ) return;

    const amount = configuration.max === undefined
        ? configuration.amount * quantity
        : Math.min(
            configuration.amount * quantity,
            configuration.max - (configuration.isPercentage
                ? getEffectiveStat(configuration.stat)
                : hero[configuration.stat])
        );
    const totalCost = quantity * UPGRADE_COST;
    const previousCurrentValue = configuration.currentStat
        ? hero[configuration.currentStat]
        : 0;
    hero.gold -= totalCost;
    hero[configuration.stat] = configuration.max === undefined
        ? hero[configuration.stat] + amount
        : Math.min(configuration.max, hero[configuration.stat] + amount);
    if (configuration.currentStat) {
        hero[configuration.currentStat] = Math.min(
            hero[configuration.currentMaxStat],
            hero[configuration.currentStat] + configuration.currentAmount * quantity
        );
    }
    const skill = t(configuration.nameKey);
    const recoveredAmount = configuration.currentStat
        ? hero[configuration.currentStat] - previousCurrentValue
        : 0;
    const recoveryMessage = recoveredAmount > 0
        ? t('upgradeRecovery', {
            amount: recoveredAmount,
            stat: t(configuration.currentStat === 'hp' ? 'hp' : 'focus')
        })
        : '';
    closeUpgradeOptions();
    logMessage(t('upgradeSuccess', {
        skill,
        amount,
        unit: configuration.isPercentage ? '%' : '',
        quantity,
        cost: totalCost
    }) + recoveryMessage, 'special');
    updateUI();
}

function updateMonsterUI() {
    document.getElementById('monster-hp').innerText = currentMonster.hp;
    const hpPercent = Math.max(0, Math.min(
        GAME_RULES.probabilityScale,
        (currentMonster.hp / currentMonster.maxHp) * GAME_RULES.probabilityScale
    ));
    document.getElementById('monster-hp-bar').style.width = hpPercent + '%';
}

function usePotion() {
    if (gameOver || campaignComplete) return;
    if (inCombat && combatActionLocked) return;
    if (hero.potions <= 0) {
        logMessage(t("noPotions"), "combat-monster");
        return;
    }
    if (hero.hp >= getEffectiveStat('maxHp') && hero.foco >= getEffectiveStat('maxFoco')) {
        logMessage(t("hpFull"));
        return;
    }

    hero.potions--;
    const heal = POTION_HEAL_AMOUNT_HP;
    const hpRecovered = Math.min(heal, getEffectiveStat('maxHp') - hero.hp);
    hero.hp += hpRecovered;
    const foco = POTION_HEAL_AMOUNT_FOCO;
    const focusRecovered = Math.min(foco, getEffectiveStat('maxFoco') - hero.foco);
    hero.foco += focusRecovered;
    logMessage(t("potionHeal", {
        amount_hp: hpRecovered,
        amount_foco: focusRecovered
    }), "discovery");
    updateUI();

    if (inCombat) {
        combatActionLocked = true;
        logMessage(t("potionOpening"));
        monsterAttackTurn();
        updateUI();
    }
}

function restAtCamp() {
    if (inCombat || gameOver || campaignComplete) return;
    if (hero.gold < CAMP_COST) {
        logMessage(t("noGold", { cost: CAMP_COST }));
        return;
    }
    const maxHp = getEffectiveStat('maxHp');
    const maxFoco = getEffectiveStat('maxFoco');
    if (hero.hp >= maxHp && hero.foco >= maxFoco) {
        logMessage(t("alreadyRested"));
        return;
    }
    hero.gold -= CAMP_COST;
    const hpRecovery = Math.max(
        1,
        Math.floor(maxHp * CAMP_HP_RECOVERY_PERCENT / GAME_RULES.probabilityScale)
    );
    const focusRecovery = Math.max(
        1,
        Math.floor(maxFoco * CAMP_FOCO_RECOVERY_PERCENT / GAME_RULES.probabilityScale)
    );
    const hpRecovered = Math.min(hpRecovery, maxHp - hero.hp);
    const focusRecovered = Math.min(focusRecovery, maxFoco - hero.foco);
    hero.hp += hpRecovered;
    hero.foco += focusRecovered;
    logMessage(t("rested", { cost: CAMP_COST, hp: hpRecovered, focus: focusRecovered }), "discovery");
    updateUI();
}

function combatRun() {
    if (!inCombat || campaignComplete || combatActionLocked) return;
    combatActionLocked = true;
    const success = Math.random() < GAME_RULES.combat.escapeSuccessChance;
    if (success) {
        logMessage(t("escaped"), "discovery");
        hero.fury = 0;
        hero.evasionBonus = 0;
        hero.parryBonus = 0;
        inCombat = false;
        combatEncounterId++;
        combatActionLocked = false;
        document.getElementById('rpg-log').dataset.combat = 'false';
        currentMonster = null;
        updateUI();
    } else {
        logMessage(t("escapeFailed", { monster: currentMonster.name }), "combat-monster");
        monsterAttackTurn();
    }
}

function endCombatVictory() {
    if (!inCombat || !currentMonster || currentMonster.hp > 0) return;
    const defeatedMonster = { ...currentMonster };
    const mercyChance = EXPLORATION_RULES.sparedMonster.chance;
    if (!defeatedMonster.isBoss
        && Math.random() * GAME_RULES.probabilityScale < mercyChance) {
        inCombat = false;
        combatEncounterId++;
        combatActionLocked = false;
        currentMonster = null;
        hero.fury = 0;
        hero.evasionBonus = 0;
        hero.parryBonus = 0;
        pendingStoryEvent = createMonsterFateEvent(defeatedMonster);
        document.getElementById('rpg-log').dataset.combat = 'false';
        updateUI();
        return;
    }
    awardCombatVictory(defeatedMonster);
}

function createMonsterFateEvent(monster) {
    const values = { monster: monster.name };
    return {
        id: `monster-fate-${monster.id || 'creature'}`,
        monsterFate: true,
        monster,
        title: {
            pt: translateForLanguage('pt', 'monsterFateTitle', values),
            en: translateForLanguage('en', 'monsterFateTitle', values)
        },
        description: {
            pt: translateForLanguage('pt', 'monsterFateDescription', values),
            en: translateForLanguage('en', 'monsterFateDescription', values)
        },
        choices: [
            {
                label: {
                    pt: translateForLanguage('pt', 'monsterFateFinish'),
                    en: translateForLanguage('en', 'monsterFateFinish')
                },
                effect: 'monster-final-blow'
            },
            {
                label: {
                    pt: translateForLanguage('pt', 'monsterFateSpare'),
                    en: translateForLanguage('en', 'monsterFateSpare')
                },
                effect: 'monster-spared'
            }
        ]
    };
}

function awardCombatVictory(monster) {
    const challengeRewardRarities = monster.challengeRewardRarities;
    logMessage(t("victory", { monster: monster.name }), "discovery");
    logMessage(t("rewards", { xp: monster.xpReward, gold: monster.goldReward }), "loot");

    hero.gold += monster.goldReward;
    hero.xp += monster.xpReward;
    hero.fury = 0;
    hero.evasionBonus = 0;
    hero.parryBonus = 0;

    const equipmentDrop = challengeRewardRarities
        ? createChallengeEquipmentDrop(challengeRewardRarities)
        : createEquipmentDrop();
    inCombat = false;
    combatEncounterId++;
    combatActionLocked = false;
    currentMonster = null;

    checkLevelUp();
    if (equipmentDrop) {
        if (challengeRewardRarities) {
            logMessage(t('abyssalChallengeReward', {
                rarity: getEquipmentRarity(equipmentDrop).name[gameLanguage]
            }), 'loot');
        }
        handleEquipmentDrop(equipmentDrop);
    }
    document.getElementById('rpg-log').dataset.combat = 'false';
    updateUI();
}

function endCombatDefeat() {
    logMessage(t("defeat"), "combat-monster");
    logMessage(t("defeatHelp"), "special");
    inCombat = false;
    combatEncounterId++;
    combatActionLocked = false;
    currentMonster = null;
    hero.hp = 0;
    hero.fury = 0;
    hero.evasionBonus = 0;
    hero.parryBonus = 0;
    gameOver = true;
    document.getElementById('rpg-log').dataset.combat = 'false';
    document.getElementById('campaign-ending-card').hidden = false;
    document.getElementById('campaign-ending-title').textContent = t('campaignDefeatTitle');
    document.getElementById('campaign-ending-description').textContent = t('campaignDefeatDescription');
    document.getElementById('campaign-ending-card').querySelector('[data-i18n="restartCampaign"]').textContent = t('restart');
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    updateUI();
}

function restartGame() {
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    window.location.reload();
}

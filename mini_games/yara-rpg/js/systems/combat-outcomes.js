// Potions, camp, escape, combat rewards, and journey endings.
// Load after combat.js.

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
        queueMonsterAttackTurn();
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
    if (currentMonster?.isUnescapable) {
        logMessage(t('finalBossNoEscape'), 'combat-monster');
        return;
    }
    combatActionLocked = true;
    const success = Math.random() < GAME_RULES.combat.escapeSuccessChance;
    if (success) {
        setBossMusic(false);
        logMessage(t("escaped"), "discovery");
        hero.evasionBonus = 0;
        hero.parryBonus = 0;
        inCombat = false;
        combatEncounterId++;
        combatActionLocked = false;
        document.getElementById('rpg-log').dataset.combat = 'false';
        currentMonster = null;
        completeRegionObjective('combat');
        updateUI();
    } else {
        logMessage(t("escapeFailed", { monster: currentMonster.name }), "combat-monster");
        queueMonsterAttackTurn();
    }
}

async function endCombatVictory() {
    if (!inCombat || !currentMonster || currentMonster.hp > 0) return;
    const defeatedMonster = { ...currentMonster };
    playSound('monsterDefeated');
    await animateMonsterDefeat();
    if (!inCombat || currentMonster?.id !== defeatedMonster.id) return;
    if (defeatedMonster.isBoss) setBossMusic(false);
    const mercyChance = EXPLORATION_RULES.sparedMonster.chance;
    if (!defeatedMonster.isBoss
        && Math.random() * GAME_RULES.probabilityScale < mercyChance) {
        inCombat = false;
        combatEncounterId++;
        combatActionLocked = false;
        currentMonster = null;
        hero.evasionBonus = 0;
        hero.parryBonus = 0;
        completeRegionObjective('combat', true);
        pendingStoryEvent = createMonsterFateEvent(defeatedMonster);
        document.getElementById('rpg-log').dataset.combat = 'false';
        updateUI();
        return;
    }
    awardCombatVictory(defeatedMonster);
}

function animateMonsterDefeat() {
    const encounterCard = document.getElementById('encounter-card');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reducedMotion ? 80 : 620;
    encounterCard.classList.remove('monster-defeat-transition');
    void encounterCard.offsetWidth;
    encounterCard.classList.add('monster-defeat-transition');
    return new Promise((resolve) => {
        window.setTimeout(() => {
            encounterCard.classList.remove('monster-defeat-transition');
            resolve();
        }, duration);
    });
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
    hero.evasionBonus = 0;
    hero.parryBonus = 0;

    const equipmentDrop = challengeRewardRarities
        ? createChallengeEquipmentDrop(challengeRewardRarities)
        : createEquipmentDrop();
    completeRegionObjective('monsters');
    inCombat = false;
    combatEncounterId++;
    combatActionLocked = false;
    currentMonster = null;

    checkLevelUp();
    if (monster.isFinalBoss) {
        campaignComplete = true;
        unlockCharactersAfterCampaign();
        logMessage(t('finalBossVictory'), 'discovery');
        try { localStorage.removeItem(SAVE_KEY); } catch {}
    }
    if (equipmentDrop) {
        if (challengeRewardRarities) {
            logMessage(t('abyssalChallengeReward', {
                rarity: getEquipmentRarity(equipmentDrop).name[gameLanguage]
            }), 'loot');
        }
        handleEquipmentDrop(equipmentDrop);
    }
    completeRegionObjective('combat');
    document.getElementById('rpg-log').dataset.combat = 'false';
    if (!campaignComplete) updateUI();
}

function endCombatDefeat() {
    if (currentMonster?.isBoss) setBossMusic(false);
    playSound('deathLaugh');
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
    const endingCard = document.getElementById('campaign-ending-card');
    endingCard.classList.add('campaign-ending-defeat');
    endingCard.querySelector('#campaign-defeat-image').hidden = false;
    endingCard.hidden = false;
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

// Exploration, regional discovery, story events, monster spawning, and mist contacts.
// Loaded as a classic script before game.js; shares the RPG global state.

let regionArrivalTimeout = null;

function exploreForest() {
    if (inCombat || gameOver || campaignComplete || pendingMistContact || pendingStoryEvent || pendingChest) return;
    if (hero.hp <= 0) {
            logMessage(t("injured"), "combat-monster");
        return;
    }

    explorationsSinceMistContact++;
    explorationCount++;
    explorationsSinceStoryEvent++;
    if (tryDiscoverRegion()) {
        updateUI();
        showRegionArrival(GAME_DATA.regions[currentRegion]);
        return;
    }

    const regionData = GAME_DATA.regions[currentRegion];
    const regionEvents = Array.isArray(regionData.event) ? regionData.event : [regionData.event].filter(Boolean);
    const unseenEvents = regionEvents.filter((event) =>
        !seenStoryEvents.has(`${regionData.id}:${event.id || event.title.pt}`)
    );
    if (unseenEvents.length
        && explorationsSinceStoryEvent >= EXPLORATION_RULES.storyEvents.cooldownExplorations
        && Math.random() * GAME_RULES.probabilityScale < EXPLORATION_RULES.storyEvents.chance) {
        pendingStoryEvent = unseenEvents[Math.floor(Math.random() * unseenEvents.length)];
        storyEventSeen.add(regionData.id);
        seenStoryEvents.add(`${regionData.id}:${pendingStoryEvent.id || pendingStoryEvent.title.pt}`);
        explorationsSinceStoryEvent = 0;
        updateUI();
        return;
    }

    const mistRules = GAME_RULES.mistContacts;
    if (MIST_CONTACT_SYSTEM.shouldTrigger(
        hero.level,
        mistRules,
        explorationsSinceMistContact,
        GAME_RULES.probabilityScale
    )) {
        pendingMistContact = MIST_CONTACT_SYSTEM.chooseContact(MIST_CONTACT_DATA.contacts, hero.level);
        if (pendingMistContact) {
            explorationsSinceMistContact = 0;
            logMessage(t('mistContactAppears', {
                contact: pendingMistContact.name[gameLanguage],
                icon: pendingMistContact.icon
            }), 'special');
            updateUI();
            return;
        }
    }

    const outcome = chooseExplorationOutcome();
    if (outcome === 'monster') {
        spawnMonster();
        return;
    }
    if (outcome === 'gold') {
        const rules = EXPLORATION_RULES.gold;
        const amount = rules.minimum + Math.floor(Math.random() * rules.range);
        hero.gold += amount;
        logMessage(t('goldFound', { amount }), 'loot');
    } else if (outcome === 'safeTrail') {
        const hp = Math.min(EXPLORATION_RULES.safeTrail.hp, getEffectiveStat('maxHp') - hero.hp);
        const focus = Math.min(EXPLORATION_RULES.safeTrail.focus, getEffectiveStat('maxFoco') - hero.foco);
        hero.hp += hp;
        hero.foco += focus;
        logMessage(t('safeTrail', { amount_hp: hp, amount_foco: focus }), 'special');
    } else if (outcome === 'potion') {
        hero.potions++;
        logMessage(t('potionFound', { potions: hero.potions, capacity: hero.maxPotions }), 'loot');
    } else if (outcome === 'trap') {
        const rules = EXPLORATION_RULES.trap;
        const rolledDamage = rules.damageMinimum + Math.floor(Math.random() * rules.damageRange);
        const damage = Math.min(rolledDamage, Math.max(0, hero.hp - 1));
        hero.hp -= damage;
        logMessage(t('explorationTrap', { damage }), 'combat-monster');
    } else if (outcome === 'focus') {
        const rules = EXPLORATION_RULES.focusFind;
        const foundFocus = rules.minimum + Math.floor(Math.random() * rules.range);
        const focus = Math.min(foundFocus, getEffectiveStat('maxFoco') - hero.foco);
        hero.foco += focus;
        logMessage(t('explorationFocus', { focus }), 'special');
    } else if (outcome === 'supplies') {
        const rules = EXPLORATION_RULES.supplies;
        const gold = rules.goldMinimum + Math.floor(Math.random() * rules.goldRange);
        const hp = Math.min(rules.hpRecovery, getEffectiveStat('maxHp') - hero.hp);
        hero.gold += gold;
        hero.hp += hp;
        logMessage(t('explorationSupplies', { gold, hp }), 'loot');
    } else if (outcome === 'chest') {
        pendingChest = true;
        hero.chestChanceBonus = 0;
        playSound('chestDiscovery');
        logMessage(t('chestFoundLog'), 'discovery');
    } else {
        logMessage(t('denseMist'));
    }
    updateUI();
}

function openFoundChest() {
    if (!pendingChest || inCombat || gameOver || campaignComplete) return;

    pendingChest = false;
    const rules = EXPLORATION_RULES.chest;
    if (Math.random() * GAME_RULES.probabilityScale < rules.itemChance) {
        const item = createChestEquipmentDrop();
        if (!item) throw new Error('Chest item chance is configured, but no equipment items exist.');
        logMessage(t('chestItemFound', {
            rarity: getEquipmentRarity(item).name[gameLanguage]
        }), 'loot');
        handleEquipmentDrop(item);
        return;
    }

    logMessage(t('chestEmpty'), 'normal');
    updateUI();
}

function chooseExplorationOutcome() {
    const availableOutcomes = EXPLORATION_RULES.outcomes.filter((outcome) => {
        if (outcome.type === 'potion') return hero.potions < hero.maxPotions;
        if (outcome.type === 'focus') return hero.foco < getEffectiveStat('maxFoco');
        if (outcome.type === 'safeTrail') {
            return hero.hp < getEffectiveStat('maxHp') || hero.foco < getEffectiveStat('maxFoco');
        }
        return true;
    });
    const totalWeight = availableOutcomes.reduce((total, outcome) => total + outcome.weight, 0);
    if (totalWeight <= 0) return null;

    const chestOutcome = availableOutcomes.find((outcome) => outcome.type === 'chest');
    const otherOutcomes = availableOutcomes.filter((outcome) => outcome.type !== 'chest');
    if (chestOutcome && hero.chestChanceBonus > 0) {
        const baseChestChance = chestOutcome.weight / totalWeight * GAME_RULES.probabilityScale;
        const boostedChestChance = Math.min(
            GAME_RULES.probabilityScale,
            baseChestChance + hero.chestChanceBonus
        );
        if (Math.random() * GAME_RULES.probabilityScale < boostedChestChance) {
            return chestOutcome.type;
        }
        const otherWeight = otherOutcomes.reduce((total, outcome) => total + outcome.weight, 0);
        if (otherWeight <= 0) return chestOutcome.type;
        let otherRoll = Math.random() * otherWeight;
        for (const outcome of otherOutcomes) {
            otherRoll -= outcome.weight;
            if (otherRoll < 0) return outcome.type;
        }
        return otherOutcomes[otherOutcomes.length - 1]?.type ?? null;
    }

    let roll = Math.random() * totalWeight;
    for (const outcome of availableOutcomes) {
        roll -= outcome.weight;
        if (roll < 0) return outcome.type;
    }
    return availableOutcomes[availableOutcomes.length - 1]?.type ?? null;
}

function resolveStoryEvent(choiceIndex) {
    if (!pendingStoryEvent || inCombat || gameOver || campaignComplete) return;
    const event = pendingStoryEvent;
    const choice = event.choices[choiceIndex];
    if (!choice) return;
    const effect = choice.effect;
    const eventSeenKey = `${GAME_DATA.regions[currentRegion].id}:${event.id || event.title.pt}`;
    pendingStoryEvent = null;
    if (effect === 'monster-final-blow') {
        awardCombatVictory(event.monster);
        return;
    } else if (effect === 'monster-spared') {
        const monster = event.monster;
        const rules = EXPLORATION_RULES.sparedMonster;
        const gold = Math.floor(monster.goldReward * rules.goldPercent / GAME_RULES.probabilityScale);
        hero.gold += gold;
        hero.fury = 0;
        hero.evasionBonus = 0;
        hero.parryBonus = 0;
        if (Math.random() * GAME_RULES.probabilityScale < rules.treasureOrStrikeChance) {
            const regionId = GAME_DATA.regions[currentRegion].id;
            const clues = rules.clues[regionId] || [];
            const clue = clues.length
                ? clues[Math.floor(Math.random() * clues.length)][gameLanguage]
                : t('denseMist');
            hero.chestChanceBonus = rules.treasureChanceBonus;
            logMessage(t('monsterSparedTreasure', {
                monster: monster.name,
                gold,
                clue,
                chance: rules.treasureChanceBonus
            }), 'special');
        } else {
            const rolledDamage = Math.max(
                GAME_RULES.combat.monsterAttack.minimumDamage,
                monster.atk * rules.strikeMultiplier - getEffectiveStat('def')
            );
            const damage = Math.min(rolledDamage, Math.max(0, hero.hp - 1));
            hero.hp -= damage;
            logMessage(t('monsterSparedStrike', {
                monster: monster.name,
                gold,
                damage
            }), 'combat-monster');
        }
        updateUI();
        return;
    } else if (effect === 'abyssal-challenge') {
        const boss = SPECIAL_MONSTERS.find((monster) => monster.id === 'abyssal-herald');
        if (!boss) {
            logMessage(t('denseMist'));
            updateUI();
            return;
        }
        const endgameRegionIndex = GAME_DATA.regions.findIndex((region) => region.id === 'gudran-castle');
        const challengeRewardRarities = currentRegion >= endgameRegionIndex
            ? ['demon', 'god']
            : ['epic', 'legendary'];
        logMessage(t('abyssalChallengeAccepted'), 'combat-monster');
        spawnMonster({ ...boss, challengeRewardRarities });
        return;
    } else if (effect === 'abyssal-challenge-retreat') {
        seenStoryEvents.delete(eventSeenKey);
        logMessage(t('abyssalChallengeRetreat'), 'special');
    } else if (effect === 'brutos-challenge') {
        const brutos = SPECIAL_MONSTERS.find((monster) => monster.id === 'brutos');
        if (!brutos) {
            logMessage(t('denseMist'));
            updateUI();
            return;
        }
        spawnMonster(brutos);
        return;
    } else if (effect === 'brutos-challenge-retreat') {
        seenStoryEvents.delete(eventSeenKey);
        logMessage(t('abyssalChallengeRetreat'), 'special');
    } else if (effect === 'animal-event-gold') {
        const lootRules = GAME_RULES.loot;
        const gold = lootRules.animalEventGoldMinimum
            + Math.floor(Math.random() * lootRules.animalEventGoldRange);
        hero.gold += gold;
        logMessage(t('eventAnimalGold', { gold }), 'loot');
    } else if (effect === 'animal-event-pet') {
        const pets = ITEM_DATA.equipment.filter((item) => item.slot === 'pet');
        const petTemplate = pets[Math.floor(Math.random() * pets.length)];
        if (!petTemplate) {
            logMessage(t('denseMist'));
        } else {
            logMessage(t('eventAnimalPet', { animal: petTemplate.name[gameLanguage] }), 'special');
            handleEquipmentDrop(createEquipmentInstance(petTemplate, rollEquipmentRarity()));
        }
    } else if (effect === 'loot') {
        const gold = 35 + Math.floor(Math.random() * 26); hero.gold += gold;
        logMessage(t('eventLoot', { gold }), 'loot');
    } else if (effect === 'heal') {
        const hp = Math.min(45, getEffectiveStat('maxHp') - hero.hp);
        const focus = Math.min(20, getEffectiveStat('maxFoco') - hero.foco);
        hero.hp += hp; hero.foco += focus;
        logMessage(t('eventHeal', { hp, focus }), 'special');
    } else if (effect === 'gold') {
        const gold = 55; const hp = Math.min(12, Math.max(0, hero.hp - 1));
        hero.gold += gold; hero.hp -= hp;
        logMessage(t('eventGold', { gold, hp }), 'loot');
    } else if (effect === 'power') {
        hero.atk += 4; logMessage(t('eventPower', { amount: 4 }), 'special');
    } else if (effect === 'river-crossing') {
        const gold = 30 + Math.floor(Math.random() * 21);
        const hp = Math.min(15, Math.max(0, hero.hp - 1));
        hero.gold += gold; hero.hp -= hp;
        logMessage(t('eventRiverCrossing', { gold, hp }), 'loot');
    } else if (effect === 'riverbank') {
        const hp = Math.min(20, getEffectiveStat('maxHp') - hero.hp);
        const focus = Math.min(12, getEffectiveStat('maxFoco') - hero.foco);
        hero.hp += hp; hero.foco += focus;
        logMessage(t('eventRiverbank', { hp, focus }), 'special');
    } else if (effect === 'potion') {
        if (hero.potions < hero.maxPotions) {
            hero.potions++;
            logMessage(t('eventPotion', { potions: hero.potions, capacity: hero.maxPotions }), 'loot');
        } else logMessage(t('eventPotionFull'), 'normal');
    } else if (effect === 'portal-treasure') {
        const gold = 65 + Math.floor(Math.random() * 36); hero.gold += gold;
        logMessage(t('eventPortalTreasure', { gold }), 'loot');
    } else if (effect === 'village-scout') {
        const focus = Math.min(18, getEffectiveStat('maxFoco') - hero.foco);
        hero.foco += focus; logMessage(t('eventScout', { focus }), 'special');
    } else if (effect === 'castle-cache') {
        const gold = 45;
        hero.gold += gold;
        if (hero.potions < hero.maxPotions) hero.potions++;
        logMessage(t('eventCastleCache', { gold }), 'loot');
    } else if (effect === 'combat') {
        spawnMonster(); return;
    }
    updateUI();
}

function getDiscoveryChance() {
    const explorationRules = EXPLORATION_RULES.discovery;
    if (
        currentRegion >= GAME_DATA.regions.length - 1
        || discoveredRegions.includes(currentRegion + 1)
    ) return 0;
    return Math.min(
        explorationRules.maximumChance,
        explorationRules.baseChance
            + (hero.level - 1) * explorationRules.chancePerLevel
            + currentRegion * explorationRules.chancePerRegion
    );
}

function tryDiscoverRegion() {
    if (Math.random() * GAME_RULES.probabilityScale >= getDiscoveryChance()) return false;

    currentRegion++;
    discoveredRegions.push(currentRegion);
    playSound('regionDiscovered');
    explorationsSinceStoryEvent = 0;
    logMessage(t("regionArrival", { region: GAME_DATA.regions[currentRegion].title[gameLanguage] }), "discovery");
    explorationCount = 0;
    return true;
}

function showRegionArrival(regionData) {
    const transition = document.getElementById('region-arrival-transition');
    document.getElementById('region-arrival-scene').dataset.region = regionData.id;
    const regionArt = document.getElementById('region-arrival-icon');
    regionArt.replaceChildren();
    if (regionData.sceneImage) {
        const image = document.createElement('img');
        image.src = new URL(`../../${regionData.sceneImage}`, document.querySelector('script[src*="/systems/exploration.js"]')?.src || window.location.href).href;
        image.alt = '';
        image.className = 'region-arrival-image';
        image.setAttribute('aria-hidden', 'true');
        image.addEventListener('error', () => {
            regionArt.textContent = regionData.sceneIcon || '';
        }, { once: true });
        regionArt.append(image);
    } else {
        regionArt.textContent = regionData.sceneIcon || '';
    }
    document.getElementById('region-arrival-kicker').textContent = t('regionArrivalKicker');
    document.getElementById('region-arrival-title').textContent = regionData.title[gameLanguage];
    document.getElementById('region-arrival-description').textContent = regionData.description[gameLanguage];
    const closeButton = document.getElementById('region-arrival-close');
    closeButton.setAttribute('aria-label', t('regionArrivalClose'));
    transition.hidden = false;

    if (regionArrivalTimeout !== null) clearTimeout(regionArrivalTimeout);
    regionArrivalTimeout = window.setTimeout(dismissRegionArrival, 5000);
}

function dismissRegionArrival() {
    if (regionArrivalTimeout !== null) clearTimeout(regionArrivalTimeout);
    regionArrivalTimeout = null;
    document.getElementById('region-arrival-transition').hidden = true;
}

function navigateRegion(direction) {
    if (inCombat || gameOver || campaignComplete || pendingMistContact || pendingStoryEvent || pendingChest) return;
    if (direction !== -1 && direction !== 1) {
        throw new Error(`Invalid region navigation direction: ${direction}`);
    }

    const targetRegion = currentRegion + direction;
    if (!discoveredRegions.includes(targetRegion)) return;

    currentRegion = targetRegion;
    updateUI();
    showRegionArrival(GAME_DATA.regions[currentRegion]);
}

function resolveFinalBossGate(shouldProceed) {
    if (currentRegion !== GAME_DATA.regions.length - 1 || inCombat || gameOver || campaignComplete) return;
    if (!shouldProceed) {
        currentRegion = Math.max(0, currentRegion - 1);
        logMessage(t('finalBossReturnMessage'), 'special');
        updateUI();
        showRegionArrival(GAME_DATA.regions[currentRegion]);
        return;
    }

    const gudran = SPECIAL_MONSTERS.find((monster) => monster.id === 'gudran');
    if (!gudran) {
        logMessage(t('denseMist'));
        updateUI();
        return;
    }
    finalBossChallengeAccepted = true;
    logMessage(t('finalBossAppears'), 'combat-monster');
    spawnMonster(gudran);
}

function spawnMonster(templateOverride = null) {
    if (templateOverride?.isFinalBoss
        && (!finalBossChallengeAccepted || currentRegion !== GAME_DATA.regions.length - 1)) {
        logMessage(t('denseMist'));
        return;
    }
    const regionId = GAME_DATA.regions[currentRegion].id;
    const regionMonsters = GAME_DATA.monsters.byRegion[regionId];
    const template = templateOverride ?? regionMonsters[Math.floor(Math.random() * regionMonsters.length)];
    const isMistBoss = Boolean(templateOverride);
    const variationRules = isMistBoss
        ? GAME_RULES.mistContacts.bossVariation
        : GAME_DATA.monsters.variation;
    const variation = variationRules.minimum
        + Math.random() * (variationRules.maximum - variationRules.minimum);
    const levelScale = isMistBoss
        ? Math.max(
            variationRules.minimumScale,
            Math.min(
                variationRules.maximumScale,
                1 + (hero.level - template.suggestedLevel) * variationRules.levelScale
            )
        )
        : 1;
    const vary = (value) => Math.max(
        GAME_DATA.monsters.minimumRolledAttribute,
        Math.round(value * variation * levelScale)
    );
    const monsterHp = vary(template.hp);

    currentMonster = {
        name: template.name[gameLanguage],
        icon: template.icon,
        image: template.image || null,
        isMistBoss,
        hp: monsterHp,
        maxHp: monsterHp,
        atk: vary(template.atk),
        def: vary(template.def),
        parry: vary(template.parry),
        evasion: vary(template.evasion),
        xpReward: vary(template.xpReward),
        goldReward: vary(template.goldReward),
        id: template.id || null,
        isBoss: isMistBoss,
        isFinalBoss: Boolean(template.isFinalBoss),
        isUnescapable: Boolean(template.isUnescapable),
        challengeRewardRarities: template.challengeRewardRarities || null
    };

    inCombat = true;
    combatEncounterId++;
    combatActionLocked = false;
    document.getElementById('rpg-log').dataset.combat = 'true';
    enemyTurnCount = 0; enemyTelegraphing = false;
    parrySkillUsedThisCombat = false;
    dodgeSkillUsedThisCombat = false;
    hero.parryBonus = 0;

    document.getElementById('monster-name').innerText = currentMonster.name;
    document.getElementById('monster-hp').innerText = currentMonster.hp;
    document.getElementById('monster-hp-max').innerText = currentMonster.maxHp;
    const monsterIcon = document.getElementById('monster-icon');
    monsterIcon.replaceChildren();
    if (currentMonster.image) {
        const image = document.createElement('img');
        image.src = new URL(`../../${currentMonster.image}`, document.querySelector('script[src*="/systems/exploration.js"]')?.src || window.location.href).href;
        image.alt = '';
        image.className = 'monster-icon-image';
        image.setAttribute('aria-hidden', 'true');
        image.addEventListener('error', () => {
            monsterIcon.textContent = currentMonster?.icon || '';
        }, { once: true });
        monsterIcon.append(image);
    } else {
        monsterIcon.textContent = currentMonster.icon;
    }
    document.getElementById('monster-hp-bar').style.width = '100%';
    document.getElementById('monster-atk').innerText = currentMonster.atk;
    document.getElementById('monster-def').innerText = currentMonster.def;
    document.getElementById('monster-parry').innerText = currentMonster.parry + '%';
    document.getElementById('monster-evasion').innerText = currentMonster.evasion + '%';

    logMessage(t(isMistBoss ? "mistBossAppears" : "monsterAppears", {
        monster: currentMonster.name
    }), "combat-monster");
    updateUI();
    setBossMusic(currentMonster.isBoss);
}

function acceptMistContact() {
    if (!pendingMistContact || inCombat || gameOver) return;

    const contact = pendingMistContact;
    pendingMistContact = null;
    logMessage(t('mistContactAccepted', { contact: contact.name[gameLanguage] }), 'special');

    if (contact.onAccept?.type === 'boss') {
        const missionBoss = SPECIAL_MONSTERS.find(
            (boss) => boss.id === contact.onAccept.bossId
        );
        if (!missionBoss) {
            throw new Error(`Mist contact "${contact.id}" references an unknown boss.`);
        }
        logMessage(t('witchQuestStarted', {
            monster: missionBoss.name[gameLanguage]
        }), 'special');
        spawnMonster(missionBoss);
        return;
    }

    if (contact.onAccept?.type === 'drink') {
        const drinkOffer = contact.onAccept;
        const hpAfterDrink = Math.max(
            1,
            Math.floor(getEffectiveStat('maxHp') * drinkOffer.hpPercent / GAME_RULES.probabilityScale)
        );
        hero.hp = Math.min(hero.hp, hpAfterDrink);
        hero.gold += drinkOffer.gold;
        logMessage(t('witchDrinkAccepted', {
            hp: hero.hp,
            gold: drinkOffer.gold
        }), 'loot');
        updateUI();
        return;
    }

    const boss = MIST_CONTACT_SYSTEM.chooseBoss(SPECIAL_MONSTERS, hero.level);
    const power = MIST_CONTACT_SYSTEM.choosePower(
        MIST_CONTACT_DATA.powers,
        hero.mistPowers,
        hero
    );
    const outcome = MIST_CONTACT_SYSTEM.chooseOutcome(
        GAME_RULES.mistContacts.outcomes,
        Boolean(boss),
        Boolean(power)
    );

    if (outcome?.type === 'combat' && boss) {
        spawnMonster(boss);
        return;
    }

    if (outcome?.type === 'power' && power) {
        const previousValue = hero[power.stat];
        hero[power.stat] = power.max === undefined
            ? previousValue + power.amount
            : Math.min(power.max, previousValue + power.amount);
        const amountGained = hero[power.stat] - previousValue;
        if (power.currentStat) {
            hero[power.currentStat] = Math.min(
                getEffectiveStat('maxHp'),
                hero[power.currentStat] + amountGained
            );
        }
        hero.mistPowers.push(power.id);
        logMessage(t('mistPowerGained', {
            power: power.name[gameLanguage],
            description: power.description[gameLanguage]
        }), 'special');
        updateUI();
        return;
    }

    const sacrificeRules = GAME_RULES.mistContacts.sacrifice;
    const goldGained = sacrificeRules.goldMinimum
        + Math.floor(Math.random() * sacrificeRules.goldRange);
    const hpPercent = sacrificeRules.hpLossMinimum
        + Math.floor(Math.random() * sacrificeRules.hpLossRange);
    const hpLost = Math.min(
        Math.max(0, hero.hp - 1),
        Math.floor(getEffectiveStat('maxHp') * hpPercent / GAME_RULES.probabilityScale)
    );
    hero.gold += goldGained;
    hero.hp -= hpLost;
    logMessage(t('mistSacrifice', { gold: goldGained, hp: hpLost }), 'loot');
    updateUI();
}

function declineMistContact() {
    if (!pendingMistContact || inCombat || gameOver) return;
    pendingMistContact = null;
    logMessage(t('mistContactDeclined'), 'normal');
    updateUI();
}

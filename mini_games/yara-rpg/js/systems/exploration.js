// Exploration, regional discovery, story events, monster spawning, and mist contacts.
// Loaded as a classic script before game.js; shares the RPG global state.

let regionArrivalTimeout = null;
let regionObjectiveToastTimeout = null;
const regionObjectiveToastQueue = [];
let foundMapToastTimeout = null;
let passiveRewardToastTimeout = null;

function getCurrentRegionData() {
    if (!isInSpiritWorld) return GAME_DATA.regions[currentRegion];
    return GAME_DATA.spiritRegions.find((region) => region.id === currentSpiritRegionId)
        || GAME_DATA.spiritRegions[0];
}

function exploreForest() {
    if (inCombat || gameOver || campaignComplete || pendingMistContact || pendingStoryEvent || pendingChest) return;
    if (hero.hp <= 0) {
            logMessage(t("injured"), "combat-monster");
        return;
    }

    explorationsSinceMistContact++;
    explorationsSinceStoryEvent++;

    const regionData = getCurrentRegionData();
    if (isInSpiritWorld) {
        exploreSpiritWorld(regionData);
        return;
    }
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

    if (window.YaraVendor?.shouldOffer()) {
        pendingStoryEvent = window.YaraVendor.createEvent();
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
        pendingMistContact = MIST_CONTACT_SYSTEM.chooseContact(
            MIST_CONTACT_DATA.contacts,
            hero.level,
            hero,
            PASSIVE_SKILL_DATA.pacts,
            [...seenMistContacts]
        );
        if (pendingMistContact) {
            if (pendingMistContact.oncePerGame) seenMistContacts.add(pendingMistContact.id);
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
        updateUI();
        return;
    } else if (outcome === 'map') {
        const region = getCurrentRegionData();
        foundMapsByRegion[region.id] = (foundMapsByRegion[region.id] || 0) + 1;
        const mapBonus = EXPLORATION_RULES.map.treasureChanceBonus;
        hero.chestChanceBonus = Math.max(hero.chestChanceBonus, mapBonus);
        logMessage(t('explorationMapFound', { chance: mapBonus }), 'discovery');
        showFoundMap(mapBonus);
    } else {
        logMessage(t('denseMist'));
    }
    completeRegionObjective('exploration');
    updateUI();
}

function exploreSpiritWorld(regionData) {
    const storyRules = EXPLORATION_RULES.storyEvents;
    const storySequence = Array.isArray(regionData.storySequence) ? regionData.storySequence : [];
    const nextStoryBeat = storySequence.find((beat) =>
        !seenStoryEvents.has(`${regionData.id}:${beat.id || beat.title.pt}`)
    );
    const sequenceCooldown = Math.max(
        1,
        Number(regionData.storySequenceCooldownExplorations) || storyRules.cooldownExplorations
    );

    if (nextStoryBeat && explorationsSinceStoryEvent >= sequenceCooldown) {
        pendingStoryEvent = nextStoryBeat;
        storyEventSeen.add(regionData.id);
        seenStoryEvents.add(`${regionData.id}:${nextStoryBeat.id || nextStoryBeat.title.pt}`);
        explorationsSinceStoryEvent = 0;
        updateUI();
        return;
    }

    const regionEvents = Array.isArray(regionData.event) ? regionData.event : [];
    const unseenEvents = regionEvents.filter((event) =>
        !seenStoryEvents.has(`${regionData.id}:${event.id || event.title.pt}`)
    );
    const encounterChance = Math.min(
        GAME_RULES.probabilityScale,
        Math.max(storyRules.chance, 35)
    );
    if (unseenEvents.length
        && explorationsSinceStoryEvent >= storyRules.cooldownExplorations
        && Math.random() * GAME_RULES.probabilityScale < encounterChance) {
        pendingStoryEvent = unseenEvents[Math.floor(Math.random() * unseenEvents.length)];
        storyEventSeen.add(regionData.id);
        seenStoryEvents.add(`${regionData.id}:${pendingStoryEvent.id || pendingStoryEvent.title.pt}`);
        explorationsSinceStoryEvent = 0;
        updateUI();
        return;
    }

    const quietMessage = Math.random() < 0.2
        ? 'spiritWorldSpiritFled'
        : 'spiritWorldNothingAppeared';
    logMessage(t(quietMessage), 'normal');
    completeRegionObjective('exploration');
    updateUI();
}

function openFoundChest() {
    if (!pendingChest || inCombat || gameOver || campaignComplete) return;

    pendingChest = false;
    window.YaraMeta?.onChest();
    const rules = EXPLORATION_RULES.chest;
    if (Math.random() * GAME_RULES.probabilityScale < rules.itemChance) {
        const item = createChestEquipmentDrop();
        if (!item) throw new Error('Chest item chance is configured, but no equipment items exist.');
        logMessage(t('chestItemFound', {
            rarity: getEquipmentRarity(item).name[gameLanguage]
        }), 'loot');
        handleEquipmentDrop(item);
    } else {
        logMessage(t('chestEmpty'), 'normal');
    }
    completeRegionObjective('chest');
    updateUI();
}

function chooseExplorationOutcome() {
    const availableOutcomes = EXPLORATION_RULES.outcomes.filter((outcome) => {
        if (outcome.type === 'map') {
            const regionId = getCurrentRegionData().id;
            return (foundMapsByRegion[regionId] || 0) < EXPLORATION_RULES.map.maxMaps;
        }
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
    const spiritEyeBonus = hero.spiritWorldUnlocked ? 5 : 0;
    const totalChestChanceBonus = hero.chestChanceBonus + spiritEyeBonus;
    if (chestOutcome && totalChestChanceBonus > 0) {
        const baseChestChance = chestOutcome.weight / totalWeight * GAME_RULES.probabilityScale;
        const boostedChestChance = Math.min(
            GAME_RULES.probabilityScale,
            baseChestChance + totalChestChanceBonus
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

function showFoundMap(chance) {
    const toast = document.getElementById('found-map-toast');
    const image = document.getElementById('found-map-image');
    image.src = EXPLORATION_RULES.map.image;
    image.alt = t('foundMapImageAlt');
    document.getElementById('found-map-kicker').textContent = t('foundMapKicker');
    document.getElementById('found-map-title').textContent = t('foundMapTitle');
    document.getElementById('found-map-description').textContent = t('foundMapDescription', { chance });
    document.getElementById('found-map-close').setAttribute('aria-label', t('foundMapClose'));
    toast.hidden = false;
    toast.classList.remove('found-map-toast-visible');
    void toast.offsetWidth;
    toast.classList.add('found-map-toast-visible');
    if (foundMapToastTimeout !== null) clearTimeout(foundMapToastTimeout);
    foundMapToastTimeout = window.setTimeout(() => {
        toast.classList.remove('found-map-toast-visible');
        toast.hidden = true;
        foundMapToastTimeout = null;
    }, 6000);
}

function dismissFoundMap() {
    const toast = document.getElementById('found-map-toast');
    if (foundMapToastTimeout !== null) clearTimeout(foundMapToastTimeout);
    foundMapToastTimeout = null;
    toast.classList.remove('found-map-toast-visible');
    toast.hidden = true;
}

function showPassiveReward(type, reward, penalty = '') {
    const toast = document.getElementById('passive-reward-toast');
    const penaltyElement = document.getElementById('passive-reward-penalty');
    document.getElementById('passive-reward-kicker').textContent = t(
        type === 'pact' ? 'passiveRewardPactKicker' : 'passiveRewardSkillKicker'
    );
    const rewardIcon = document.getElementById('passive-reward-icon');
    rewardIcon.replaceChildren();
    if (reward.iconImage) {
        const image = document.createElement('img');
        image.src = reward.iconImage;
        image.alt = '';
        rewardIcon.append(image);
    } else {
        rewardIcon.textContent = reward.icon || (type === 'pact' ? '🩸' : '✨');
    }
    document.getElementById('passive-reward-title').textContent = reward.name[gameLanguage];
    document.getElementById('passive-reward-description').textContent = reward.description[gameLanguage];
    document.getElementById('passive-reward-close').setAttribute('aria-label', t('passiveRewardClose'));
    penaltyElement.hidden = !penalty;
    penaltyElement.textContent = penalty ? t('passiveRewardPenalty', { penalty }) : '';
    toast.hidden = false;
    toast.classList.remove('passive-reward-toast-visible');
    void toast.offsetWidth;
    toast.classList.add('passive-reward-toast-visible');
    if (passiveRewardToastTimeout !== null) clearTimeout(passiveRewardToastTimeout);
    passiveRewardToastTimeout = window.setTimeout(dismissPassiveReward, 6000);
}

function dismissPassiveReward() {
    const toast = document.getElementById('passive-reward-toast');
    if (!toast) return;
    if (passiveRewardToastTimeout !== null) clearTimeout(passiveRewardToastTimeout);
    passiveRewardToastTimeout = null;
    toast.classList.remove('passive-reward-toast-visible');
    toast.hidden = true;
}

function toggleSpiritWorld() {
    if (!hero.spiritWorldUnlocked || inCombat || gameOver || campaignComplete || pendingStoryEvent) return;
    if (isInSpiritWorld) {
        const returnRegionIndex = GAME_DATA.regions.findIndex((region) => region.id === spiritWorldReturnRegionId);
        if (returnRegionIndex < 0) return;
        currentRegion = returnRegionIndex;
        isInSpiritWorld = false;
    } else {
        spiritWorldReturnRegionId = GAME_DATA.regions[currentRegion].id;
        currentSpiritRegionId ||= GAME_DATA.spiritRegions[0]?.id;
        if (!currentSpiritRegionId) return;
        isInSpiritWorld = true;
    }
    updateUI();
    showRegionArrival(getCurrentRegionData());
}

function resolveStoryEvent(choiceIndex) {
    if (!pendingStoryEvent || inCombat || gameOver || campaignComplete) return;
    const event = pendingStoryEvent;
    const choice = event.choices[choiceIndex];
    if (!choice) return;
    const effect = choice.effect;
    const eventSeenKey = `${getCurrentRegionData().id}:${event.id || event.title.pt}`;
    pendingStoryEvent = null;
    completeRegionObjective('story', true);
    if (effect === 'spirit-message') {
        logMessage(t(choice.messageKey), 'spirit-message');
        completeRegionObjective('story');
        updateUI();
        return;
    } else if (effect === 'spirit-god-reward') {
        const isWeapon = choice.itemCategory === 'weapon';
        const templates = ITEM_DATA.equipment.filter((item) =>
            !item.characterExclusive
            && (isWeapon ? item.itemType === 'weapon' : item.itemType !== 'weapon')
        );
        const godRarity = GAME_RULES.loot.equipmentRarities.find((rarity) => rarity.id === 'god');
        if (!templates.length || !godRarity) {
            logMessage(t('denseMist'));
            completeRegionObjective('story');
            updateUI();
            return;
        }
        const template = templates[Math.floor(Math.random() * templates.length)];
        const item = createEquipmentInstance(template, godRarity);
        logMessage(t('spiritWorldGodGift', {
            item: item.name[gameLanguage],
            rarity: godRarity.name[gameLanguage]
        }), 'special');
        handleEquipmentDrop(item);
        completeRegionObjective('story');
        updateUI();
        return;
    } else if (effect === 'spirit-potion') {
        if (hero.potions < hero.maxPotions) {
            hero.potions++;
            logMessage(t(choice.foundMessageKey || 'spiritWorldPotionFound', {
                potions: hero.potions,
                capacity: hero.maxPotions
            }), 'loot');
        } else {
            logMessage(t(choice.fullMessageKey || 'spiritWorldPotionFull'), 'normal');
        }
    } else if (effect === 'monster-final-blow') {
        awardCombatVictory(event.monster);
        return;
    } else if (effect === 'monster-spared') {
        const monster = event.monster;
        window.YaraMeta?.onSpare(monster);
        const rules = EXPLORATION_RULES.sparedMonster;
        const gold = Math.floor(monster.goldReward * rules.goldPercent / GAME_RULES.probabilityScale);
        hero.gold += gold;
        hero.evasionBonus = 0;
        hero.parryBonus = 0;
        const outcomes = Object.entries(rules.outcomeWeights);
        const totalWeight = outcomes.reduce((total, [, weight]) => total + weight, 0);
        let outcomeRoll = Math.random() * totalWeight;
        const outcome = outcomes.find(([, weight]) => (outcomeRoll -= weight) < 0)?.[0] || 'strike';

        if (outcome === 'treasure') {
            const regionId = getCurrentRegionData().id;
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
        } else if (outcome === 'strike') {
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
        } else if (outcome === 'recovery') {
            const hpRecovered = Math.min(
                Math.ceil(getEffectiveStat('maxHp') * rules.recoveryPercent / GAME_RULES.probabilityScale),
                Math.max(0, getEffectiveStat('maxHp') - hero.hp)
            );
            const focoRecovered = Math.min(
                Math.ceil(getEffectiveStat('maxFoco') * rules.recoveryPercent / GAME_RULES.probabilityScale),
                Math.max(0, getEffectiveStat('maxFoco') - hero.foco)
            );
            hero.hp += hpRecovered;
            hero.foco += focoRecovered;
            logMessage(t('monsterSparedRecovery', {
                monster: monster.name,
                hp: hpRecovered,
                foco: focoRecovered
            }), 'loot');
        } else if (outcome === 'missingSlotItem') {
            const emptySlots = Object.keys(hero.equipment).filter((slot) => !hero.equipment[slot]);
            const equipment = ITEM_DATA.equipment.filter((item) =>
                !item.characterExclusive && emptySlots.includes(item.slot)
            );
            if (equipment.length) {
                const template = equipment[Math.floor(Math.random() * equipment.length)];
                const item = createEquipmentInstance(template, rollEquipmentRarity());
                hero.equipment[item.slot] = item;
                logMessage(t('monsterSparedItem', {
                    monster: monster.name,
                    item: item.name[gameLanguage],
                    rarity: getEquipmentRarity(item).name[gameLanguage]
                }), 'loot');
            } else {
                const bonusGold = Math.floor(monster.goldReward * rules.bonusGoldPercent / GAME_RULES.probabilityScale);
                hero.gold += bonusGold;
                logMessage(t('monsterSparedBonusGold', { monster: monster.name, gold: bonusGold }), 'loot');
            }
        } else if (outcome === 'bonusGold') {
            const bonusGold = Math.floor(monster.goldReward * rules.bonusGoldPercent / GAME_RULES.probabilityScale);
            hero.gold += bonusGold;
            logMessage(t('monsterSparedBonusGold', { monster: monster.name, gold: bonusGold }), 'loot');
        }
        completeRegionObjective('story');
        updateUI();
        return;
    } else if (effect === 'abyssal-challenge') {
        const isFirstRegion = getCurrentRegionData().id === 'dark-forest';
        const bossId = isFirstRegion ? 'lesser-abyssal-demon' : 'abyssal-demon';
        const boss = SPECIAL_MONSTERS.find((monster) => monster.id === bossId);
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
    } else if (effect === 'gamble') {
        const rules = choice.gamble;
        if (Math.random() * GAME_RULES.probabilityScale < rules.winChance) {
            const gold = rules.gold + Math.floor(Math.random() * (rules.goldRange || 1));
            hero.gold += gold;
            logMessage(t('metaGambleWin', { gold }), 'loot');
        } else {
            const hp = Math.min(rules.hpLoss, Math.max(0, hero.hp - 1));
            hero.hp -= hp;
            logMessage(t('metaGambleLose', { hp }), 'combat-monster');
        }
    } else if (effect === 'vendor') {
        window.YaraVendor?.open();
    } else if (effect === 'vendor-leave') {
        logMessage(t('vendorLeft'));
    } else if (effect === 'combat') {
        spawnMonster(); return;
    }
    completeRegionObjective('story');
    updateUI();
}

function getRegionObjectiveProgress(regionIndex = null) {
    const region = Number.isInteger(regionIndex)
        ? GAME_DATA.regions[regionIndex]
        : getCurrentRegionData();
    if (!region) return 0;
    if (!isInSpiritWorld && Number.isInteger(regionIndex ?? currentRegion)
        && discoveredRegions.includes((regionIndex ?? currentRegion) + 1)) {
        return getRegionObjectiveRequirements(region).length;
    }
    return getRegionObjectiveRequirements(region).filter((task) =>
        getRegionObjectiveTaskProgress(task, region) >= task.required
    ).length;
}

function isRegionObjectiveComplete(objectiveId, region = getCurrentRegionData()) {
    if (Number.isInteger(region)) region = GAME_DATA.regions[region];
    if (!region) return false;
    const task = region.objectives.tasks.find((objective) => objective.id === objectiveId);
    if (!task) return false;
    if (objectiveId === 'exploration') {
        return getCompletedUninterruptedExplorations(region.id) >= getObjectiveRequirement(task);
    }
    if (objectiveId === 'monsters') {
        return getDefeatedMonsters(region.id) >= getObjectiveRequirement(task);
    }
    const completedIds = completedRegionObjectives[region.id]?.completedIds
        || completedRegionObjectives[region.id];
    return Array.isArray(completedIds) && completedIds.includes(objectiveId);
}

function getRegionObjectiveRequirements(region) {
    return region.objectives.tasks.map((task) => ({
        ...task,
        required: getObjectiveRequirement(task)
    }));
}

function getObjectiveRequirement(task) {
    return Math.max(1, Number(task.required) || 1);
}

function getCompletedUninterruptedExplorations(regionId) {
    return Math.max(0, Number(completedRegionObjectives[regionId]?.explorationCount) || 0);
}

function getDefeatedMonsters(regionId) {
    return Math.max(0, Number(completedRegionObjectives[regionId]?.monsterCount) || 0);
}

function getRegionObjectiveTaskProgress(task, region = getCurrentRegionData()) {
    if (Number.isInteger(region)) region = GAME_DATA.regions[region];
    if (!region) return 0;
    if (task.id === 'exploration') return getCompletedUninterruptedExplorations(region.id);
    if (task.id === 'monsters') return getDefeatedMonsters(region.id);
    return Number(isRegionObjectiveComplete(task.id, region));
}

function areCurrentRegionObjectivesComplete(region = getCurrentRegionData()) {
    return getRegionObjectiveRequirements(region).every((task) =>
        getRegionObjectiveTaskProgress(task, region) >= task.required
    );
}

function advanceSpiritRegionIfComplete() {
    if (!isInSpiritWorld || inCombat || gameOver || campaignComplete
        || pendingStoryEvent || pendingMistContact || pendingChest
        || !areCurrentRegionObjectivesComplete()) return false;

    const currentSpiritIndex = GAME_DATA.spiritRegions.findIndex(
        (region) => region.id === currentSpiritRegionId
    );
    const nextSpiritRegion = GAME_DATA.spiritRegions[currentSpiritIndex + 1];
    if (!nextSpiritRegion) return false;

    currentSpiritRegionId = nextSpiritRegion.id;
    regionEntryLevels[nextSpiritRegion.id] = hero.level;
    explorationsSinceStoryEvent = 0;
    explorationCount = 0;
    playSound('regionDiscovered');
    logMessage(t('regionArrival', { region: nextSpiritRegion.title[gameLanguage] }), 'discovery');
    showRegionArrival(nextSpiritRegion);
    updateUI();
    return true;
}

function completeRegionObjective(objectiveId, deferRegionUnlock = false) {
    completeRegionObjectives([objectiveId], deferRegionUnlock);
}

function completeRegionObjectives(objectiveIds, deferRegionUnlock = false) {
    const finalBossRegionIndex = GAME_DATA.regions.findIndex((region) => region.id === 'gudran-throne');
    if (!isInSpiritWorld && (currentRegion === finalBossRegionIndex || discoveredRegions.includes(currentRegion + 1))) return;
    const region = getCurrentRegionData();
    let regionProgress = completedRegionObjectives[region.id];
    if (!regionProgress) {
        regionProgress = { completedIds: [], explorationCount: 0, monsterCount: 0 };
        completedRegionObjectives[region.id] = regionProgress;
    }
    // Migrate progress from saves created before cumulative exploration objectives.
    const completedIds = Array.isArray(regionProgress) ? regionProgress : regionProgress.completedIds;
    if (Array.isArray(regionProgress)) {
        regionProgress = { completedIds, explorationCount: 0, monsterCount: 0 };
        completedRegionObjectives[region.id] = regionProgress;
    }
    for (const [objectiveId, progressKey] of [['exploration', 'explorationCount'], ['monsters', 'monsterCount']]) {
        const objectiveTask = region.objectives.tasks.find((task) => task.id === objectiveId);
        if (objectiveIds.includes(objectiveId) && objectiveTask) {
            const required = getObjectiveRequirement(objectiveTask);
            const previousCount = Math.max(0, Number(regionProgress[progressKey]) || 0);
            if (previousCount < required) {
                regionProgress[progressKey] = previousCount + 1;
                updateUI();
                if (previousCount + 1 >= required) showRegionObjectiveToast([objectiveTask]);
            }
            objectiveIds = objectiveIds.filter((id) => id !== objectiveId);
        }
    }
    const newlyCompleted = objectiveIds
        .map((id) => region.objectives.tasks.find((task) => task.id === id))
        .filter((task) => task && !completedIds.includes(task.id));
    if (newlyCompleted.length > 0) {
        completedIds.push(...newlyCompleted.map((task) => task.id));
        showRegionObjectiveToast(newlyCompleted);
    }
    const allTasksComplete = getRegionObjectiveRequirements(region).every((task) =>
        getRegionObjectiveTaskProgress(task, region) >= task.required
    );
    if (!allTasksComplete) return;
    if (isInSpiritWorld) {
        if (!deferRegionUnlock) advanceSpiritRegionIfComplete();
        return;
    }
    if (deferRegionUnlock || currentRegion >= GAME_DATA.regions.length - 1) return;

    currentRegion++;
    if (!discoveredRegions.includes(currentRegion)) discoveredRegions.push(currentRegion);
    regionEntryLevels[GAME_DATA.regions[currentRegion].id] = hero.level;
    window.YaraMeta?.onRegionChange();
    playSound('regionDiscovered');
    explorationsSinceStoryEvent = 0;
    logMessage(t("regionArrival", { region: GAME_DATA.regions[currentRegion].title[gameLanguage] }), "discovery");
    explorationCount = 0;
    showRegionArrival(GAME_DATA.regions[currentRegion]);
    updateUI();
}

function showRegionObjectiveToast(tasks) {
    regionObjectiveToastQueue.push(tasks);
    if (regionObjectiveToastTimeout === null) showNextRegionObjectiveToast();
}

function showNextRegionObjectiveToast() {
    const tasks = regionObjectiveToastQueue.shift();
    if (!tasks) {
        regionObjectiveToastTimeout = null;
        return;
    }
    const toast = document.getElementById('region-objective-toast');
    const heading = t(tasks.length === 1 ? 'regionObjectiveCompleted' : 'regionObjectivesCompleted');
    const taskNames = tasks.map((task) => `✓ ${task.title[gameLanguage]}`).join('\n');
    toast.textContent = `${heading}\n${taskNames}`;
    toast.hidden = false;
    toast.classList.remove('region-objective-toast-visible');
    void toast.offsetWidth;
    toast.classList.add('region-objective-toast-visible');
    regionObjectiveToastTimeout = window.setTimeout(() => {
        toast.classList.remove('region-objective-toast-visible');
        toast.hidden = true;
        regionObjectiveToastTimeout = null;
        showNextRegionObjectiveToast();
    }, 2800);
}

function showRegionArrival(regionData) {
    const transition = document.getElementById('region-arrival-transition');
    document.getElementById('region-arrival-scene').dataset.region = regionData.id;
    const regionArt = document.getElementById('region-arrival-icon');
    regionArt.replaceChildren();
    if (regionData.sceneImage) {
        const image = document.createElement('img');
        image.src = regionData.sceneImage;
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
    document.getElementById('region-arrival-kicker').textContent = t(
        GAME_DATA.spiritRegions.some((region) => region.id === regionData.id)
            ? 'spiritWorldArrivalKicker'
            : 'regionArrivalKicker'
    );
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

    if (isInSpiritWorld) {
        const currentSpiritIndex = GAME_DATA.spiritRegions.findIndex((region) => region.id === currentSpiritRegionId);
        if (direction === 1 && !areCurrentRegionObjectivesComplete(getCurrentRegionData())) return;
        const targetSpiritRegion = GAME_DATA.spiritRegions[currentSpiritIndex + direction];
        if (!targetSpiritRegion) return;
        currentSpiritRegionId = targetSpiritRegion.id;
        updateUI();
        showRegionArrival(targetSpiritRegion);
        return;
    }

    const targetRegion = currentRegion + direction;
    if (!discoveredRegions.includes(targetRegion)) return;

    currentRegion = targetRegion;
    updateUI();
    showRegionArrival(GAME_DATA.regions[currentRegion]);
}

function resolveFinalBossGate(shouldProceed) {
    const finalBossRegionIndex = GAME_DATA.regions.findIndex((region) => region.id === 'gudran-throne');
    if (currentRegion !== finalBossRegionIndex || inCombat || gameOver || campaignComplete) return;
    if (!shouldProceed) {
        currentRegion = Math.max(0, currentRegion - 1);
        isInSpiritWorld = false;
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
    const finalBossRegionIndex = GAME_DATA.regions.findIndex((region) => region.id === 'gudran-throne');
    if (templateOverride?.isFinalBoss
        && (!finalBossChallengeAccepted || currentRegion !== finalBossRegionIndex)) {
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
    const applyMonsterPacts = (stat, value) => {
        const adjusted = PASSIVE_SKILL_DATA.pacts
            .filter((pact) => hero.monsterPacts.includes(pact.id) && pact.monsterStat === stat)
            .reduce((total, pact) => pact.percent
                ? total * (1 + pact.amount / GAME_RULES.probabilityScale)
                : total + pact.amount, value);
        const minimum = ['def', 'parry', 'evasion'].includes(stat) ? 0 : 1;
        const maximum = ['parry', 'evasion'].includes(stat) ? GAME_RULES.probabilityScale : Infinity;
        return Math.max(minimum, Math.min(maximum, Math.round(adjusted)));
    };
    const monsterMaxHp = vary(template.hp);
    const monsterStartingHp = applyMonsterPacts('hp', monsterMaxHp);

    currentMonster = {
        name: template.name[gameLanguage],
        icon: template.icon,
        image: template.image || null,
        dialogues: template.dialogues || null,
        isMistBoss,
        hp: monsterStartingHp,
        maxHp: monsterMaxHp,
        atk: applyMonsterPacts('atk', vary(template.atk)),
        def: applyMonsterPacts('def', vary(template.def)),
        parry: applyMonsterPacts('parry', vary(template.parry)),
        evasion: applyMonsterPacts('evasion', vary(template.evasion)),
        xpReward: vary(template.xpReward),
        goldReward: vary(template.goldReward),
        id: template.id || null,
        bestiaryKey: template.id || template.name.en,
        isBoss: isMistBoss,
        isFinalBoss: Boolean(template.isFinalBoss),
        isUnescapable: Boolean(template.isUnescapable),
        challengeRewardRarities: template.challengeRewardRarities || null
    };

    window.YaraMeta?.onEncounter(currentMonster);

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
    const encounterCard = document.getElementById('encounter-card');
    encounterCard.classList.remove('monster-defeat-transition');
    encounterCard.classList.remove('mist-contact-monster');
    clearMonsterStunEffect();
    monsterIcon.classList.remove('critical-impact');
    monsterIcon.style.removeProperty('filter');
    const monsterDialogueBubble = document.getElementById('monster-dialogue-bubble');
    monsterIcon.replaceChildren();
    if (currentMonster.image) {
        const image = document.createElement('img');
        image.src = currentMonster.image;
        image.alt = '';
        image.className = 'monster-icon-image';
        image.setAttribute('aria-hidden', 'true');
        image.addEventListener('error', () => {
            image.replaceWith(document.createTextNode(currentMonster?.icon || ''));
        }, { once: true });
        monsterIcon.append(image);
    } else {
        monsterIcon.textContent = currentMonster.icon;
    }
    if (monsterDialogueBubble) monsterIcon.append(monsterDialogueBubble);
    document.getElementById('monster-hp-bar').style.width = '100%';
    document.getElementById('monster-atk').innerText = currentMonster.atk;
    document.getElementById('monster-def').innerText = currentMonster.def;
    document.getElementById('monster-parry').innerText = currentMonster.parry + '%';
    document.getElementById('monster-evasion').innerText = currentMonster.evasion + '%';

    startCombatDialogue();
    logMessage(t(isMistBoss ? "mistBossAppears" : "monsterAppears", {
        monster: currentMonster.name
    }), "combat-monster");
    updateUI();
    setBossMusic(currentMonster.isBoss);
}

function receiveSpiritPurificationPoint(amount) {
    hero.skillPoints = (Number(hero.skillPoints) || 0) + amount;
    logMessage(t('spiritPurificationPointReceived', { amount }), 'special');
    completeRegionObjective('story');
    updateUI();
}

function performSpiritEyeSurgery() {
    hero.hp = 1;
    hero.gold = 0;
    hero.foco = 0;
    hero.potions = 0;
    hero.spiritWorldUnlocked = true;
    logMessage(t('spiritEyeSurgeryAccepted'), 'special');
    logMessage(t('spiritWorldUnlocked'), 'discovery');
    showPassiveReward('skill', SPIRIT_EYE_PASSIVE);
    completeRegionObjective('story');
    updateUI();
}

function resolvePactOffer() {
    const availablePacts = PASSIVE_SKILL_DATA.pacts.filter((pact) =>
        !hero.monsterPacts.includes(pact.id)
    );
    if (!availablePacts.length) {
        logMessage(t('pactAlreadyKnown'), 'normal');
        updateUI();
        return;
    }

    const pact = availablePacts[Math.floor(Math.random() * availablePacts.length)];
    const equippedItems = Object.entries(hero.equipment).filter(([, item]) => item);
    const penalties = [
        { type: 'life' },
        { type: 'focus' },
        ...(hero.equipmentInventory.length ? [{ type: 'inventory' }] : []),
        ...(equippedItems.length ? [{ type: 'equipment' }] : [])
    ];
    const penalty = penalties[Math.floor(Math.random() * penalties.length)];
    let penaltyDescription;

    if (penalty.type === 'life') {
        hero.hp = 1;
        penaltyDescription = t('pactPenaltyLife');
    } else if (penalty.type === 'focus') {
        hero.foco = 0;
        penaltyDescription = t('pactPenaltyFocus');
    } else if (penalty.type === 'inventory') {
        const lostCount = hero.equipmentInventory.length;
        hero.equipmentInventory = [];
        selectedInventoryItems.clear();
        penaltyDescription = t('pactPenaltyInventory', { count: lostCount });
    } else {
        const [slot, item] = equippedItems[Math.floor(Math.random() * equippedItems.length)];
        hero.equipment[slot] = null;
        hero.hp = Math.min(hero.hp, getEffectiveStat('maxHp'));
        hero.foco = Math.min(hero.foco, getEffectiveStat('maxFoco'));
        hero.fury = Math.min(hero.fury, getEffectiveFuryThreshold());
        penaltyDescription = t('pactPenaltyEquippedItem', {
            item: getEquipmentDisplayName(item)
        });
    }

    hero.monsterPacts.push(pact.id);
    logMessage(t('pactReceived', {
        icon: pact.icon,
        pact: pact.name[gameLanguage],
        description: pact.description[gameLanguage],
        penalty: penaltyDescription
    }), 'special');
    showPassiveReward('pact', pact, penaltyDescription);
    completeRegionObjective('story');
    updateUI();
}

function acceptMistContact() {
    if (!pendingMistContact || inCombat || gameOver) return;

    const contact = pendingMistContact;
    pendingMistContact = null;
    logMessage(t('mistContactAccepted', { contact: contact.name[gameLanguage] }), 'special');

    if (contact.onAccept?.type === 'spirit-surgery') {
        performSpiritEyeSurgery();
        return;
    }

    if (contact.onAccept?.type === 'skill-point') {
        receiveSpiritPurificationPoint(contact.onAccept.amount);
        return;
    }

    if (contact.onAccept?.type === 'pact') {
        resolvePactOffer();
        return;
    }

    if (contact.onAccept?.type === 'boss') {
        completeRegionObjective('story', true);
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
        completeRegionObjective('story');
        updateUI();
        return;
    }

    const boss = MIST_CONTACT_SYSTEM.chooseBoss(SPECIAL_MONSTERS, hero.level);
    const passiveSkill = MIST_CONTACT_SYSTEM.choosePassiveSkill(
        PASSIVE_SKILL_DATA.skills,
        hero.passiveSkills,
        hero
    );
    const outcome = MIST_CONTACT_SYSTEM.chooseOutcome(
        GAME_RULES.mistContacts.outcomes,
        Boolean(boss),
        Boolean(passiveSkill)
    );

    if (outcome?.type === 'combat' && boss) {
        completeRegionObjective('story', true);
        spawnMonster(boss);
        return;
    }

    if (outcome?.type === 'passive-skill' && passiveSkill) {
        const previousValue = hero[passiveSkill.stat];
        hero[passiveSkill.stat] = passiveSkill.max === undefined
            ? previousValue + passiveSkill.amount
            : Math.min(passiveSkill.max, previousValue + passiveSkill.amount);
        const amountGained = hero[passiveSkill.stat] - previousValue;
        if (passiveSkill.currentStat) {
            const currentStatMax = passiveSkill.currentStat === 'hp' ? 'maxHp'
                : passiveSkill.currentStat === 'foco' ? 'maxFoco'
                    : null;
            if (currentStatMax) {
                hero[passiveSkill.currentStat] = Math.min(
                    getEffectiveStat(currentStatMax),
                    hero[passiveSkill.currentStat] + amountGained
                );
            }
        }
        hero.passiveSkills.push(passiveSkill.id);
        logMessage(t('passiveSkillGained', {
            skill: passiveSkill.name[gameLanguage],
            description: passiveSkill.description[gameLanguage]
        }), 'special');
        showPassiveReward('skill', passiveSkill);
        completeRegionObjective('story');
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
    completeRegionObjective('story');
    updateUI();
}

function declineMistContact() {
    if (!pendingMistContact || inCombat || gameOver) return;
    pendingMistContact = null;
    logMessage(t('mistContactDeclined'), 'normal');
    updateUI();
}

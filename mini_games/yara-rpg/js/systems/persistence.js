// Save snapshots, restore runs, and migrate saved equipment.
// Classic browser script; state is initialized by game.js before user actions run.

function saveGame() {
    if (!selectedCharacter || document.getElementById('game-main').hidden || campaignComplete) return;
    const snapshot = {
        version: 1, characterId: selectedCharacter.id, hero: JSON.parse(JSON.stringify(hero)), inCombat,
        currentRegion, isInSpiritWorld, currentSpiritRegionId, spiritWorldReturnRegionId, discoveredRegions, regionEntryLevels, completedRegionObjectives, explorationsSinceMistContact, explorationCount,
        explorationsSinceStoryEvent,
        storyEventSeen: [...storyEventSeen], pendingStoryEvent, pendingMistContact,
        seenStoryEvents: [...seenStoryEvents], seenMistContacts: [...seenMistContacts], pendingChest,
        foundMapsByRegion,
        pendingEquipment, equipmentInstanceId
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot)); } catch {}
}

function readSavedGame() {
    try {
        const snapshot = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
        if (!snapshot || snapshot.version !== 1 || !GAME_DATA.characters.some((character) => character.id === snapshot.characterId)) return null;
        return snapshot;
    } catch { return null; }
}

function loadSavedGame(snapshot = readSavedGame()) {
    if (!snapshot) return false;
    selectedCharacter = GAME_DATA.characters.find((character) => character.id === snapshot.characterId);
    selectedCharacterProgression = selectedCharacter.progression;
    Object.assign(hero, DEFAULT_CHARACTER.baseStats, snapshot.hero);
    hero.passiveSkills = Array.isArray(snapshot.hero?.passiveSkills)
        ? snapshot.hero.passiveSkills
        : Array.isArray(snapshot.hero?.mistPowers) ? snapshot.hero.mistPowers : [];
    hero.monsterPacts = Array.isArray(snapshot.hero?.monsterPacts) ? snapshot.hero.monsterPacts : [];
    delete hero.mistPowers;
    if (snapshot.hero?.criticalChance === undefined) {
        hero.criticalChance = DEFAULT_CHARACTER.baseStats.criticalChance
            + (Number(selectedCharacter.basicStats.criticalChance) || 0);
    }
    if (snapshot.hero?.criticalDamage === undefined) {
        hero.criticalDamage = DEFAULT_CHARACTER.baseStats.criticalDamage;
    }
    // Migração: saves antigos não têm skillPoints
    hero.skillPoints = Number(snapshot.hero?.skillPoints ?? DEFAULT_CHARACTER.baseStats.skillPoints ?? 0) || 0;
    const savedChestChanceBonus = Number(snapshot.hero?.chestChanceBonus) || 0;
    const allowedChestChanceBonuses = [
        EXPLORATION_RULES.sparedMonster.treasureChanceBonus,
        EXPLORATION_RULES.map.treasureChanceBonus
    ];
    hero.chestChanceBonus = allowedChestChanceBonuses.includes(savedChestChanceBonus)
        ? savedChestChanceBonus
        : 0;
    const savedEquipment = { ...(snapshot.hero?.equipment || {}) };
    if (!savedEquipment.mainHand && savedEquipment.rightHand) {
        savedEquipment.mainHand = savedEquipment.rightHand;
    }
    if (!savedEquipment.offHand && savedEquipment.leftHand) {
        savedEquipment.offHand = savedEquipment.leftHand;
    }
    delete savedEquipment.rightHand;
    delete savedEquipment.leftHand;
    const legacyAccessory = savedEquipment.accessory;
    if (legacyAccessory) {
        const migratedSlot = legacyAccessory.id === 'river-charm' ? 'necklace'
            : legacyAccessory.id === 'mist-ring' ? 'ring' : 'accessory';
        savedEquipment[migratedSlot] = { ...legacyAccessory, slot: migratedSlot };
        delete savedEquipment.accessory;
    }
    hero.equipment = Object.fromEntries(EQUIPMENT_SLOTS.map(({ id }) => [
        id,
        savedEquipment[id] ? hydrateItem(savedEquipment[id], id) : null
    ]));
    hero.equipmentInventory = Array.isArray(snapshot.hero?.equipmentInventory)
        ? snapshot.hero.equipmentInventory.map(hydrateItem) : [];
    if (hero.equipment.mainHand?.handUsage === 'two-handed' && hero.equipment.offHand) {
        // Saves from before hand usage was enforced could contain a two-handed weapon and an off-hand item.
        hero.equipmentInventory.push(hero.equipment.offHand);
        hero.equipment.offHand = null;
    }
    selectedInventoryItems.clear();
    const savedRegionIndex = Math.max(0, Number(snapshot.currentRegion) || 0);
    spiritWorldReturnRegionId = snapshot.spiritWorldReturnRegionId
        || (Number.isInteger(snapshot.spiritWorldReturnRegion)
            ? GAME_DATA.regions[snapshot.spiritWorldReturnRegion]?.id
            : null);
    isInSpiritWorld = Boolean(snapshot.isInSpiritWorld && hero.spiritWorldUnlocked);
    if (!GAME_DATA.regions.some((region) => region.id === spiritWorldReturnRegionId)) {
        spiritWorldReturnRegionId = GAME_DATA.regions[Math.min(savedRegionIndex, GAME_DATA.regions.length - 1)]?.id || null;
    }
    currentRegion = isInSpiritWorld
        ? Math.max(0, GAME_DATA.regions.findIndex((region) => region.id === spiritWorldReturnRegionId))
        : Math.max(0, Math.min(GAME_DATA.regions.length - 1, savedRegionIndex));
    currentSpiritRegionId = GAME_DATA.spiritRegions.some((region) => region.id === snapshot.currentSpiritRegionId)
        ? snapshot.currentSpiritRegionId
        : GAME_DATA.spiritRegions[0]?.id || null;
    discoveredRegions = Array.isArray(snapshot.discoveredRegions)
        ? snapshot.discoveredRegions.filter((regionIndex) => Number.isInteger(regionIndex)
            && regionIndex >= 0 && regionIndex < GAME_DATA.regions.length)
        : [0];
    regionEntryLevels = snapshot.regionEntryLevels && typeof snapshot.regionEntryLevels === 'object'
        ? snapshot.regionEntryLevels
        : Object.fromEntries(discoveredRegions.map((regionIndex) => [
            GAME_DATA.regions[regionIndex]?.id,
            hero.level
        ]).filter(([regionId]) => regionId));
    completedRegionObjectives = snapshot.completedRegionObjectives && typeof snapshot.completedRegionObjectives === 'object'
        ? Object.fromEntries(Object.entries(snapshot.completedRegionObjectives).filter(([, progress]) =>
            Array.isArray(progress)
            || (progress && typeof progress === 'object' && Array.isArray(progress.completedIds))
        ).map(([regionId, progress]) => [regionId, Array.isArray(progress)
            ? { completedIds: progress, explorationCount: 0, monsterCount: 0 }
            : {
                completedIds: progress.completedIds,
                explorationCount: Math.max(0, Number(progress.explorationCount) || 0),
                monsterCount: Math.max(0, Number(progress.monsterCount) || 0)
            }
        ]))
        : {};
    foundMapsByRegion = snapshot.foundMapsByRegion && typeof snapshot.foundMapsByRegion === 'object'
        ? Object.fromEntries(Object.entries(snapshot.foundMapsByRegion).map(([regionId, count]) => [regionId, Math.max(0, Number(count) || 0)]))
        : {};
    explorationsSinceMistContact = Number(snapshot.explorationsSinceMistContact) || 0;
    explorationCount = Number(snapshot.explorationCount) || 0;
    explorationsSinceStoryEvent = Number(snapshot.explorationsSinceStoryEvent) || 0;
    equipmentInstanceId = Number(snapshot.equipmentInstanceId) || 0;
    storyEventSeen.clear();
    (snapshot.storyEventSeen || []).forEach((id) => storyEventSeen.add(id));
    seenStoryEvents.clear();
    (snapshot.seenStoryEvents || []).forEach((id) => seenStoryEvents.add(id));
    seenMistContacts.clear();
    (snapshot.seenMistContacts || []).forEach((id) => seenMistContacts.add(id));
    pendingStoryEvent = snapshot.pendingStoryEvent || null;
    if (pendingStoryEvent && !pendingStoryEvent.choices) pendingStoryEvent = getCurrentRegionData().event?.[0] || null;
    pendingMistContact = snapshot.pendingMistContact || null;
    pendingChest = Boolean(snapshot.pendingChest);
    pendingEquipment = snapshot.pendingEquipment || null;
    if (pendingEquipment?.item) pendingEquipment.item = hydrateItem(pendingEquipment.item);
    const interruptedCombat = Boolean(snapshot.inCombat);
    inCombat = false;
    currentMonster = null;
    combatActionLocked = false;
    combatEncounterId++;
    campaignComplete = false;
    enemyTelegraphing = false;
    gameOver = hero.hp <= 0;
    document.getElementById('rpg-log').replaceChildren();
    logMessage(t('openingLog', { hero: hero.name }), 'special');
    if (interruptedCombat && !gameOver) logMessage(t('denseMist'), 'normal');
    document.getElementById('game-main').hidden = false;
    document.getElementById('character-setup').hidden = true;
    updateUI(); saveGame(); startGameMusic();
    return true;
}

function showContinueOption() {
    document.getElementById('continue-adventure-button').hidden = !readSavedGame();
}

function hydrateItem(savedItem, slotOverride = null) {
    const catalogItem = ITEM_DATA.equipment.find((item) => item.id === savedItem?.id);
    if (!catalogItem) return savedItem;
    const savedRarity = GAME_RULES.loot.equipmentRarities.find((rarity) => rarity.id === savedItem.rarity)
        || GAME_RULES.loot.equipmentRarities[0];
    const savedVersion = Number(savedItem.upgradeSystemVersion) || 0;
    const stats = savedVersion >= 2
        ? { ...savedItem.stats }
        : Object.fromEntries(Object.entries(catalogItem.stats).map(([stat, amount]) => [
            stat,
            amount + (amount < 0 ? -1 : 1) * getEquipmentRarityStatBonus(stat, savedRarity)
        ]));
    if (savedVersion === 2) {
        Object.keys(stats).forEach((stat) => {
            if (stat === 'maxHp' || stat === 'maxFoco') {
                stats[stat] += getEquipmentRarityStatBonus(stat, savedRarity) - savedRarity.statBonus;
            } else if (stat === 'maxFury') {
                stats[stat] -= getEquipmentRarityStatBonus(stat, savedRarity) - savedRarity.statBonus;
            }
        });
    }
    return {
        ...catalogItem,
        ...savedItem,
        stats,
        slot: slotOverride || catalogItem.slot,
        rarity: savedRarity.id,
        upgradeLevel: savedVersion >= 2 ? Math.min(
            GAME_RULES.equipmentUpgrade.maxLevel,
            Math.max(0, Number(savedItem.upgradeLevel) || 0)
        ) : 0,
        upgradeSystemVersion: 3
    };
}

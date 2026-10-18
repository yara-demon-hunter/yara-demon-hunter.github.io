// Equipment subsystem; shares the global RPG state initialized by game.js.

function getEquipmentDisplayName(item) {
    const level = Number(item.upgradeLevel) || 0;
    return `+${level} ${item.name[gameLanguage]}`;
}

function getEquipmentRarityClass(item) {
    return `equipment-rarity-${getEquipmentRarity(item).id}`;
}

function getEquipmentRarity(item) {
    const rarities = GAME_RULES.loot.equipmentRarities;
    return rarities.find((entry) => entry.id === item.rarity) || rarities[0];
}

function getEquipmentSlotLabel(item) {
    return item.handUsage === 'two-handed'
        ? `${t(item.slot)} · ${t('twoHanded')}`
        : t(item.slot);
}

function getEquipmentConflicts(item) {
    const conflictingSlots = new Set([item.slot]);
    if (item.slot === 'mainHand' && item.handUsage === 'two-handed') {
        conflictingSlots.add('offHand');
    }
    if (item.slot === 'offHand' && hero.equipment.mainHand?.handUsage === 'two-handed') {
        conflictingSlots.add('mainHand');
    }
    return [...conflictingSlots]
        .map((slot) => ({ slot, item: hero.equipment[slot] }))
        .filter(({ item: equippedItem }) => equippedItem);
}

function getEquipmentRarityStatBonus(stat, rarity) {
    const scale = stat === 'maxHp' || stat === 'maxFoco' || stat === 'maxFury' ? 5 : 1;
    return (Number(rarity?.statBonus) || 0) * scale;
}

function createEquipmentInstance(template, rarity = GAME_RULES.loot.equipmentRarities[0]) {
    const stats = Object.fromEntries(Object.entries(template.stats).map(([stat, amount]) => [
        stat,
        amount < 0
            ? amount - getEquipmentRarityStatBonus(stat, rarity)
            : amount + getEquipmentRarityStatBonus(stat, rarity)
    ]));
    return {
        ...template,
        name: { ...template.name },
        stats,
        rarity: rarity.id,
        upgradeLevel: 0,
        upgradeSystemVersion: 3,
        instanceId: ++equipmentInstanceId
    };
}

function getEquipmentUpgradeCost(item) {
    const rules = GAME_RULES.equipmentUpgrade;
    const level = Number(item.upgradeLevel) || 0;
    if (level >= rules.maxLevel) return null;
    return Math.round(rules.baseCost * rules.costMultiplier ** level);
}

function canAffordEquipmentUpgrade(item) {
    if (!item) return false;
    const cost = getEquipmentUpgradeCost(item);
    return cost !== null && (Number(hero.gold) || 0) >= cost;
}

function hasAffordableEquipmentUpgrade() {
    try {
        if (Object.values(hero.equipment).some((entry) => canAffordEquipmentUpgrade(entry))) return true;
        return hero.equipmentInventory.some((entry) => canAffordEquipmentUpgrade(entry));
    } catch {
        return false;
    }
}

function rollEquipmentRarity(allowedRarityIds = null, chanceOverrides = null, allowRegionExclusive = false) {
    const endgameRegionIndex = GAME_DATA.regions.findIndex((region) => region.id === 'gudran-castle');
    const isFinalRegion = currentRegion >= endgameRegionIndex;
    const finalRegionOnly = GAME_RULES.loot.finalRegionOnlyRarities || [];
    const rarities = GAME_RULES.loot.equipmentRarities.filter((rarity) =>
        (!allowedRarityIds || allowedRarityIds.includes(rarity.id))
        && (allowRegionExclusive || isFinalRegion || !finalRegionOnly.includes(rarity.id))
    );
    if (rarities.length === 0) return GAME_RULES.loot.equipmentRarities[0];
    const getChance = (rarity) => chanceOverrides?.[rarity.id] ?? rarity.chance;
    const totalChance = rarities.reduce((total, rarity) => total + getChance(rarity), 0);
    let remainingRoll = Math.random() * totalChance;
    return rarities.find((rarity) => {
        remainingRoll -= getChance(rarity);
        return remainingRoll < 0;
    }) || rarities[0];
}

function createEquipmentInstanceDrop(rarity) {
    const equipment = ITEM_DATA.equipment;
    if (equipment.length === 0) return null;
    const template = equipment[Math.floor(Math.random() * equipment.length)];
    return createEquipmentInstance(template, rarity);
}

function createChallengeEquipmentDrop(allowedRarityIds) {
    return createEquipmentInstanceDrop(rollEquipmentRarity(allowedRarityIds));
}

function createChestEquipmentDrop() {
    const chances = GAME_RULES.loot.chestRarityChances;
    return createEquipmentInstanceDrop(rollEquipmentRarity(Object.keys(chances), chances, true));
}

function getEquipmentBonus(stat) {
    return Object.values(hero.equipment).reduce(
        (total, item) => total + (item?.stats[stat] ?? 0),
        0
    );
}

function getEffectiveStat(stat) {
    return hero[stat] + getEquipmentBonus(stat);
}

function getEffectiveFuryThreshold() {
    return Math.max(selectedCharacter?.limits?.minFuryThreshold ?? 1, getEffectiveStat('maxFury'));
}

function getItemBonusText(item) {
    return Object.entries(item.stats)
        .map(([stat, amount]) => t(
            amount < 0
                ? (stat === "evasion" || stat === "parry" || stat === "stunChance" || stat === "maxFury"
                    ? "equipmentPercentagePenalty"
                    : "equipmentPenalty")
                : (stat === "evasion" || stat === "parry" || stat === "stunChance"
                    ? "equipmentPercentageBonus"
                    : "equipmentBonus"),
            { amount, stat: t(EQUIPMENT_STAT_KEYS[stat]) }
        ))
        .join(" · ");
}

function handleEquipmentDrop(item) {
    logMessage(t('itemFound', {
        item: getEquipmentDisplayName(item),
        slot: getEquipmentSlotLabel(item)
    }), 'loot');
    showEquipmentChoice(item, false);
}

function createEquipmentDrop() {
    const equipment = ITEM_DATA.equipment;
    if (Math.random() * GAME_RULES.probabilityScale >= GAME_RULES.loot.equipmentDropChance) {
        return null;
    }
    if (equipment.length === 0) {
        throw new Error('Equipment drop chance is configured, but no equipment items exist.');
    }

    const template = equipment[Math.floor(Math.random() * equipment.length)];
    return createEquipmentInstance(template, rollEquipmentRarity());
}

function equipItem(item, fromInventory, targetSlot = item.slot) {
    const equippedItem = targetSlot === item.slot ? item : { ...item, slot: targetSlot };
    let inventoryIndex = -1;
    if (fromInventory) {
        inventoryIndex = hero.equipmentInventory.indexOf(item);
        if (inventoryIndex === -1) return;
        hero.equipmentInventory.splice(inventoryIndex, 1);
        selectedInventoryItems.delete(item);
    }

    const conflicts = getEquipmentConflicts(equippedItem);
    if (hero.equipmentInventory.length + conflicts.length > EQUIPMENT_BAG_CAPACITY) {
        if (fromInventory) hero.equipmentInventory.splice(inventoryIndex, 0, item);
        logMessage(t('inventoryFull', { capacity: EQUIPMENT_BAG_CAPACITY }), 'loot');
        updateUI();
        return;
    }
    conflicts.forEach(({ slot, item: displacedItem }) => {
        hero.equipment[slot] = null;
        hero.equipmentInventory.push(displacedItem);
        logMessage(t('itemStored', { item: getEquipmentDisplayName(displacedItem) }), 'loot');
    });
    hero.equipment[equippedItem.slot] = equippedItem;
    hero.hp = Math.min(hero.hp, getEffectiveStat('maxHp'));
    hero.foco = Math.min(hero.foco, getEffectiveStat('maxFoco'));
    hero.fury = Math.min(hero.fury, getEffectiveFuryThreshold());
    logMessage(t('itemEquipped', {
        item: getEquipmentDisplayName(equippedItem),
        slot: getEquipmentSlotLabel(equippedItem)
    }), 'special');
    updateUI();
}

function equipInventoryItem(item, targetSlot = item.slot) {
    if (inCombat || gameOver || !hero.equipmentInventory.includes(item)) return;
    const candidate = targetSlot === item.slot ? item : { ...item, slot: targetSlot };
    if (getEquipmentConflicts(candidate).length) {
        document.getElementById('equipment-bag-dialog').close();
        showEquipmentChoice(item, true, targetSlot);
        return;
    }
    equipItem(item, true, targetSlot);
}

function unequipItem(slot) {
    if (inCombat || gameOver || pendingEquipment) return;
    const item = hero.equipment[slot];
    if (!item) return;
    if (hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY) {
        logMessage(t('inventoryFull', { capacity: EQUIPMENT_BAG_CAPACITY }), 'loot');
        return;
    }
    hero.equipment[slot] = null;
    hero.equipmentInventory.push(item);
    hero.hp = Math.min(hero.hp, getEffectiveStat('maxHp'));
    hero.foco = Math.min(hero.foco, getEffectiveStat('maxFoco'));
    hero.fury = Math.min(hero.fury, getEffectiveFuryThreshold());
    logMessage(t('itemStored', { item: getEquipmentDisplayName(item) }), 'loot');
    updateUI();
}

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

function createEquipmentInstance(template, rarity = GAME_RULES.loot.equipmentRarities[0]) {
    const statBonus = rarity.statBonus;
    const stats = Object.fromEntries(Object.entries(template.stats).map(([stat, amount]) => [
        stat,
        amount + statBonus
    ]));
    return {
        ...template,
        name: { ...template.name },
        stats,
        rarity: rarity.id,
        upgradeLevel: 0,
        upgradeSystemVersion: 2,
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
    const finalRegionIndex = GAME_DATA.regions.length - 1;
    const isFinalRegion = currentRegion === finalRegionIndex;
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

function getItemBonusText(item) {
    return Object.entries(item.stats)
        .map(([stat, amount]) => t(
            stat === "evasion" || stat === "parry" || stat === "stunChance"
                ? "equipmentPercentageBonus"
                : "equipmentBonus",
            { amount, stat: t(EQUIPMENT_STAT_KEYS[stat]) }
        ))
        .join(" · ");
}

function handleEquipmentDrop(item) {
    logMessage(t('itemFound', {
        item: getEquipmentDisplayName(item),
        slot: t(item.slot)
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

function equipItem(item, fromInventory) {
    let inventoryIndex = -1;
    if (fromInventory) {
        inventoryIndex = hero.equipmentInventory.indexOf(item);
        if (inventoryIndex === -1) return;
        hero.equipmentInventory.splice(inventoryIndex, 1);
        selectedInventoryItems.delete(item);
    }

    const previousItem = hero.equipment[item.slot];
    if (previousItem && hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY) {
        if (fromInventory) hero.equipmentInventory.splice(inventoryIndex, 0, item);
        logMessage(t('inventoryFull', { capacity: EQUIPMENT_BAG_CAPACITY }), 'loot');
        updateUI();
        return;
    }
    if (previousItem) {
        hero.equipmentInventory.push(previousItem);
        logMessage(t('itemStored', { item: getEquipmentDisplayName(previousItem) }), 'loot');
    }
    hero.equipment[item.slot] = item;
    hero.hp = Math.min(hero.hp, getEffectiveStat('maxHp'));
    hero.foco = Math.min(hero.foco, getEffectiveStat('maxFoco'));
    logMessage(t('itemEquipped', {
        item: getEquipmentDisplayName(item),
        slot: t(item.slot)
    }), 'special');
    updateUI();
}

function equipInventoryItem(item) {
    if (inCombat || gameOver || !hero.equipmentInventory.includes(item)) return;
    if (hero.equipment[item.slot]) {
        document.getElementById('equipment-bag-dialog').close();
        showEquipmentChoice(item, true);
        return;
    }
    equipItem(item, true);
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
    logMessage(t('itemStored', { item: getEquipmentDisplayName(item) }), 'loot');
    updateUI();
}

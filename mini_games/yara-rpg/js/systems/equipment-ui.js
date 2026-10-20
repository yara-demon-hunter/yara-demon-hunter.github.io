// Equipment panels, dialogs, and user actions.
// Load after equipment-core.js.

document.getElementById('equip-new-item-button').addEventListener('click', () => equipPendingInHand('mainHand'));
document.getElementById('keep-current-item-button').addEventListener('click', keepPendingEquipment);
document.getElementById('equip-other-hand-from-drop-button').addEventListener('click', () => equipPendingInHand('offHand'));
document.getElementById('open-equipment-bag-button').addEventListener('click', openEquipmentBag);
document.getElementById('open-bag-from-drop-button').addEventListener('click', openEquipmentBag);
document.getElementById('discard-pending-item-button').addEventListener('click', discardPendingEquipment);
document.getElementById('close-equipment-bag-button').addEventListener('click', closeEquipmentBag);
document.getElementById('discard-selected-items-button').addEventListener('click', discardSelectedInventoryItems);
document.getElementById('close-equipment-item-button').addEventListener('click', closeEquipmentItemDetails);
document.getElementById('equipment-item-equip-button').addEventListener('click', () => equipSelectedInventoryItem('mainHand'));
document.getElementById('equipment-item-equip-other-hand-button').addEventListener('click', () => equipSelectedInventoryItem('offHand'));
document.getElementById('equipment-item-unequip-button').addEventListener('click', unequipSelectedEquipment);
document.getElementById('equipment-item-discard-button').addEventListener('click', discardSelectedInventoryItem);
document.getElementById('equipment-item-upgrade-button').addEventListener('click', upgradeSelectedEquipment);
document.getElementById('equipment-item-dialog').addEventListener('close', () => {
    selectedEquipmentDetails = null;
});
document.getElementById('equipment-bag-dialog').addEventListener('cancel', (event) => {
    if (isPendingDropWaitingForSpace()) {
        event.preventDefault();
        openEquipmentBag();
    } else if (pendingEquipment && !pendingEquipment.fromInventory) {
        event.preventDefault();
        closeEquipmentBag();
    }
});
document.getElementById('item-drop-dialog').addEventListener('cancel', (event) => {
    event.preventDefault();
    if (isPendingDropBlocked()) {
        openEquipmentBag();
        return;
    }
    keepPendingEquipment();
});

function setEquipmentIcon(element, item) {
    element.replaceChildren();
    if (item.image) {
        const image = document.createElement('img');
        image.src = item.image;
        image.alt = '';
        image.className = 'equipment-icon-image';
        image.setAttribute('aria-hidden', 'true');
        image.addEventListener('error', () => {
            element.textContent = item.icon;
        }, { once: true });
        element.append(image);
        return;
    }
    element.textContent = item.icon;
}

function createEquipmentUpgradeTrigger(item, source, slot = null) {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'skill-upgrade-button equipment-upgrade-trigger';
    trigger.textContent = '+';
    trigger.setAttribute('aria-label', t('upgradeEquipmentAria', {
        item: getEquipmentDisplayName(item)
    }));
    trigger.title = t('equipmentUpgradeAvailable');
    trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        showEquipmentItemDetails(item, source, slot);
    });
    return trigger;
}

function renderEquipment() {
    const slotsContainer = document.getElementById('equipment-slots');
    const bagButton = document.getElementById('open-equipment-bag-button');
    slotsContainer.replaceChildren();
    const equippedCount = Object.values(hero.equipment).filter(Boolean).length;
    const equippedItemCount = document.getElementById('equipped-item-count');
    if (equippedItemCount) equippedItemCount.textContent = `${equippedCount}/${EQUIPMENT_SLOTS.length}`;
    document.getElementById('hero-equipment-toggle').setAttribute(
        'aria-label',
        t('equipmentSummary', { count: equippedCount })
    );
    const bagCount = hero.equipmentInventory.length;
    const bagCountText = `${bagCount}/${EQUIPMENT_BAG_CAPACITY}`;
    bagButton.querySelector('#equipment-bag-count').textContent = bagCountText;
    const affordableSlots = new Set(EQUIPMENT_SLOTS
        .filter(({ id }) => canAffordEquipmentUpgrade(hero.equipment[id]))
        .map(({ id }) => id));
    const affordableInventoryUpgrade = hero.equipmentInventory.some(canAffordEquipmentUpgrade);
    bagButton.classList.toggle('equipment-upgrade-available', affordableInventoryUpgrade);
    bagButton.setAttribute('aria-label', t('openEquipmentBag', {
        count: bagCount,
        capacity: EQUIPMENT_BAG_CAPACITY
    }) + (affordableInventoryUpgrade ? ` · ${t('equipmentUpgradeAvailable')}` : ''));

    EQUIPMENT_SLOTS.forEach(({ id, icon, image }) => {
        const item = hero.equipment[id];
        const slot = document.createElement('div');
        slot.className = `equipment-slot equipment-slot-${id} rounded-lg border border-fantasy-border/50 bg-forest-950/60`;
        slot.classList.toggle('equipment-upgrade-available', affordableSlots.has(id));
        slot.setAttribute('role', 'group');
        slot.setAttribute('aria-label', `${t(id)}: ${item ? getEquipmentDisplayName(item) : t('emptySlot')}`);
        if (item) slot.classList.add(getEquipmentRarityClass(item));

        if (item) {
            const itemButton = document.createElement('button');
            itemButton.type = 'button';
            itemButton.className = 'equipment-slot-item';
            itemButton.setAttribute('aria-label', t('viewEquipmentDetails', {
                item: getEquipmentDisplayName(item)
            }));

            const itemIcon = document.createElement('span');
            itemIcon.className = `equipment-slot-icon ${getEquipmentRarityClass(item)}`;
            setEquipmentIcon(itemIcon, item);
            itemIcon.setAttribute('aria-hidden', 'true');
            itemButton.append(itemIcon);
            itemButton.addEventListener('click', () => showEquipmentItemDetails(item, 'equipped', id));
            const rarityBadge = document.createElement('span');
            rarityBadge.className = `equipment-slot-rarity-badge ${getEquipmentRarityClass(item)}`;
            rarityBadge.textContent = `+${Number(item.upgradeLevel) || 0}`;
            rarityBadge.setAttribute('aria-hidden', 'true');
            slot.append(itemButton, rarityBadge);
            if (affordableSlots.has(id)) slot.append(createEquipmentUpgradeTrigger(item, 'equipped', id));
        } else {
            const placeholder = document.createElement('span');
            placeholder.className = 'equipment-slot-icon equipment-slot-placeholder';
            setEquipmentIcon(placeholder, { icon, image });
            placeholder.setAttribute('aria-hidden', 'true');
            slot.append(placeholder);
        }

        slotsContainer.append(slot);
    });

    bagButton.className = 'equipment-slot equipment-bag-button';
    bagButton.classList.toggle('equipment-upgrade-available', affordableInventoryUpgrade);
    bagButton.setAttribute('aria-haspopup', 'dialog');
    bagButton.setAttribute('aria-controls', 'equipment-bag-dialog');
    slotsContainer.append(bagButton);

    const inventoryContainer = document.getElementById('equipment-inventory-list');
    inventoryContainer.replaceChildren();
    const visibleBagSlots = Math.max(EQUIPMENT_BAG_CAPACITY, hero.equipmentInventory.length);
    for (let index = 0; index < visibleBagSlots; index++) {
        const item = hero.equipmentInventory[index];
        const slot = document.createElement('div');
        slot.className = `equipment-bag-slot${item ? ` has-item ${getEquipmentRarityClass(item)}` : ''}`;
        slot.setAttribute('role', 'listitem');
        slot.setAttribute('aria-label', item
            ? `${t('bagSlot', { slot: index + 1 })}: ${getEquipmentDisplayName(item)}`
            : `${t('bagSlot', { slot: index + 1 })}: ${t('emptyBagSlot')}`);

        const position = document.createElement('span');
        position.className = 'equipment-bag-slot-number';
        position.textContent = String(index + 1).padStart(2, '0');

        if (item) {
            const selectItem = document.createElement('input');
            selectItem.type = 'checkbox';
            selectItem.className = 'equipment-bag-select';
            selectItem.checked = selectedInventoryItems.has(item);
            selectItem.disabled = gameOver;
            selectItem.setAttribute('aria-label', t('selectInventoryItem', {
                item: getEquipmentDisplayName(item)
            }));
            selectItem.addEventListener('change', () => {
                if (selectItem.checked) selectedInventoryItems.add(item);
                else selectedInventoryItems.delete(item);
                updateBulkDiscardControls();
            });

            const itemButton = document.createElement('button');
            itemButton.type = 'button';
            itemButton.className = 'equipment-bag-item';
            itemButton.setAttribute('aria-label', t('viewEquipmentDetails', {
                item: getEquipmentDisplayName(item)
            }));
            const itemIcon = document.createElement('span');
            itemIcon.className = `equipment-bag-item-icon ${getEquipmentRarityClass(item)}`;
            setEquipmentIcon(itemIcon, item);
            itemIcon.setAttribute('aria-hidden', 'true');
            itemButton.append(itemIcon);
            itemButton.addEventListener('click', () => {
                if (pendingEquipment && !pendingEquipment.fromInventory) {
                    showEquipmentItemDetails(item, 'inventory');
                    return;
                }
                document.getElementById('equipment-bag-dialog').close();
                showEquipmentChoice(item, true);
            });
            const rarityBadge = document.createElement('span');
            rarityBadge.className = `equipment-rarity-badge ${getEquipmentRarityClass(item)}`;
            rarityBadge.textContent = `+${Number(item.upgradeLevel) || 0}`;
            rarityBadge.setAttribute('aria-hidden', 'true');
            slot.append(position, selectItem, itemButton, rarityBadge);
            if (canAffordEquipmentUpgrade(item)) {
                slot.append(createEquipmentUpgradeTrigger(item, 'inventory'));
            }
        } else {
            const empty = document.createElement('span');
            empty.className = 'equipment-bag-empty';
            empty.textContent = t('emptyBagSlot');
            slot.append(empty);
        }

        inventoryContainer.append(slot);
    }

    document.getElementById('equipment-bag-dialog-count').textContent = bagCountText;
    document.getElementById('equipment-bag-dialog-count').setAttribute(
        'aria-label',
        t('bagCapacity', { count: bagCount, capacity: EQUIPMENT_BAG_CAPACITY })
    );
    updateBulkDiscardControls();
    const pendingLabel = document.getElementById('equipment-bag-pending-item');
    pendingLabel.hidden = !pendingEquipment || pendingEquipment.fromInventory;
    if (!pendingLabel.hidden) {
        pendingLabel.textContent = t('pendingEquipment', {
            item: getEquipmentDisplayName(pendingEquipment.item)
        });
    }
}

function openEquipmentBag() {
    const dropDialog = document.getElementById('item-drop-dialog');
    if (dropDialog.open) dropDialog.close();
    const bagDialog = document.getElementById('equipment-bag-dialog');
    renderEquipment();
    if (!bagDialog.open) bagDialog.showModal();
}

function showEquipmentItemDetails(item, source, slot = null) {
    selectedEquipmentDetails = { item, source, slot };
    renderEquipmentItemDetails(item, source, slot);
    document.getElementById('equipment-item-dialog').showModal();
}

function renderEquipmentItemDetails(item, source, slot = null) {
    setEquipmentIcon(document.getElementById('equipment-item-icon'), item);
    const itemTitle = document.getElementById('equipment-item-title');
    itemTitle.textContent = getEquipmentDisplayName(item);
    itemTitle.className = `text-lg font-bold ${getEquipmentRarityClass(item)}`;
    const rarity = getEquipmentRarity(item);
    const itemSlot = document.getElementById('equipment-item-slot');
    itemSlot.textContent = `${rarity.name[gameLanguage]} · ${getEquipmentSlotLabel(item)}`;
    itemSlot.className = `mt-1 text-xs ${getEquipmentRarityClass(item)}`;

    const properties = document.getElementById('equipment-item-properties');
    properties.replaceChildren();
    const currentItem = hero.equipment[item.slot];
    const comparedStats = new Set([
        ...Object.keys(item.stats || {}),
        ...Object.keys(currentItem?.stats || {})
    ]);
    [...comparedStats].forEach((stat) => {
        const amount = Number(item.stats?.[stat]) || 0;
        const currentAmount = Number(currentItem?.stats?.[stat]) || 0;
        const difference = amount - currentAmount;
        const isMaxFury = stat === 'maxFury';
        const isBetter = isMaxFury ? difference < 0 : difference > 0;
        const isWorse = isMaxFury ? difference > 0 : difference < 0;
        const property = document.createElement('li');
        property.textContent = t(
            amount < 0
                ? (PERCENTAGE_EQUIPMENT_STATS.has(stat)
                    ? 'equipmentPercentagePenalty'
                    : 'equipmentPenalty')
                : (PERCENTAGE_EQUIPMENT_STATS.has(stat)
                    ? 'equipmentPercentageBonus'
                    : 'equipmentBonus'),
            { amount, stat: t(EQUIPMENT_STAT_KEYS[stat]) }
        );
        if (source === 'inventory' && currentItem) {
            property.classList.add('equipment-comparison-stat');
            property.classList.add(isBetter
                ? 'equipment-comparison-stat-better'
                : isWorse
                    ? 'equipment-comparison-stat-worse'
                    : 'equipment-comparison-stat-equal');
            if (difference !== 0) {
                const delta = document.createElement('span');
                delta.className = 'equipment-comparison-delta';
                delta.textContent = `${difference > 0 ? '+' : ''}${difference}`;
                property.append(' ', delta);
            }
        }
        properties.append(property);
    });

    const isInventoryItem = source === 'inventory';
    const upgradeButton = document.getElementById('equipment-item-upgrade-button');
    const upgradeCost = getEquipmentUpgradeCost(item);
    upgradeButton.textContent = upgradeCost === null
        ? t('upgradeEquipmentMaxed', { level: Number(item.upgradeLevel) || 0 })
        : t('upgradeEquipmentButton', { level: (Number(item.upgradeLevel) || 0) + 1, cost: upgradeCost });
    upgradeButton.disabled = gameOver || Boolean(pendingEquipment)
        || upgradeCost === null || hero.gold < upgradeCost;
    const equipButton = document.getElementById('equipment-item-equip-button');
    const equipOtherHandButton = document.getElementById('equipment-item-equip-other-hand-button');
    const unequipButton = document.getElementById('equipment-item-unequip-button');
    const discardButton = document.getElementById('equipment-item-discard-button');
    equipButton.hidden = !isInventoryItem;
    equipButton.disabled = gameOver || Boolean(pendingEquipment);
    equipButton.setAttribute('aria-label', t('equipItemAria', {
        item: getEquipmentDisplayName(item),
        slot: getEquipmentSlotLabel(item)
    }));
    const canSwitchHand = isInventoryItem
        && ['mainHand', 'offHand'].includes(item.slot)
        && item.itemType === 'weapon'
        && item.handUsage !== 'two-handed';
    equipButton.textContent = canSwitchHand ? t('equipRightHand') : t('equip');
    equipOtherHandButton.hidden = !canSwitchHand;
    equipOtherHandButton.textContent = t('equipLeftHand');
    equipOtherHandButton.disabled = gameOver || Boolean(pendingEquipment);
    unequipButton.hidden = isInventoryItem;
    unequipButton.disabled = gameOver || Boolean(pendingEquipment)
        || hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY;
    unequipButton.setAttribute('aria-label', t('unequipItemAria', {
        item: getEquipmentDisplayName(item),
        slot: getEquipmentSlotLabel(item)
    }));
    discardButton.hidden = !isInventoryItem;
    discardButton.disabled = inCombat || gameOver;
    discardButton.setAttribute('aria-label', t('discardItemAria', {
        item: getEquipmentDisplayName(item)
    }));
}

function upgradeSelectedEquipment() {
    const selection = selectedEquipmentDetails;
    if (!selection || gameOver || campaignComplete || pendingEquipment) return;
    const { item, source, slot } = selection;
    if (source === 'inventory' && !hero.equipmentInventory.includes(item)) return;
    if (source === 'equipped' && hero.equipment[slot] !== item) return;

    const cost = getEquipmentUpgradeCost(item);
    if (cost === null || hero.gold < cost) return;
    hero.gold -= cost;
    item.upgradeLevel = (Number(item.upgradeLevel) || 0) + 1;
    item.upgradeSystemVersion = 3;
    Object.keys(item.stats).forEach((stat) => {
        const statBonuses = GAME_RULES.equipmentUpgrade.statBonusPerLevel;
        item.stats[stat] += statBonuses[stat] ?? 0.5;
    });
    hero.fury = Math.min(hero.fury, getEffectiveFuryThreshold());
    logMessage(t('equipmentUpgradePurchased', {
        item: getEquipmentDisplayName(item),
        level: item.upgradeLevel,
        cost
    }), 'special');
    updateUI();
    renderEquipmentItemDetails(item, source, slot);
}

function closeEquipmentItemDetails() {
    const dialog = document.getElementById('equipment-item-dialog');
    if (dialog.open) dialog.close();
}

function equipSelectedInventoryItem(targetSlot = null) {
    const selection = selectedEquipmentDetails;
    if (!selection || selection.source !== 'inventory') return;
    const { item } = selection;
    const canChooseHand = item.itemType === 'weapon'
        && item.handUsage !== 'two-handed'
        && ['mainHand', 'offHand'].includes(item.slot);
    const slot = canChooseHand ? targetSlot : item.slot;
    closeEquipmentItemDetails();
    equipInventoryItem(item, slot);
}

function unequipSelectedEquipment() {
    const selection = selectedEquipmentDetails;
    if (!selection || selection.source !== 'equipped') return;
    closeEquipmentItemDetails();
    unequipItem(selection.slot);
}

function discardSelectedInventoryItem() {
    const selection = selectedEquipmentDetails;
    if (!selection || selection.source !== 'inventory') return;
    closeEquipmentItemDetails();
    discardInventoryItem(selection.item);
}

function closeEquipmentBag() {
    if (isPendingDropWaitingForSpace()) {
        openEquipmentBag();
        return;
    }
    document.getElementById('equipment-bag-dialog').close();
    if (pendingEquipment && !pendingEquipment.fromInventory) {
        showEquipmentChoice(pendingEquipment.item, false, pendingEquipment.targetSlot);
    }
}

function resumePendingEquipmentDrop() {
    if (!pendingEquipment || pendingEquipment.fromInventory || isPendingDropWaitingForSpace()) return;
    const waitingDrop = pendingEquipment;
    document.getElementById('equipment-bag-dialog').close();
    requestAnimationFrame(() => {
        if (pendingEquipment !== waitingDrop) return;
        showEquipmentChoice(waitingDrop.item, false, waitingDrop.targetSlot);
    });
}

function discardInventoryItem(item) {
    const inventoryIndex = hero.equipmentInventory.indexOf(item);
    if (inventoryIndex === -1 || gameOver || campaignComplete) return;
    hero.equipmentInventory.splice(inventoryIndex, 1);
    selectedInventoryItems.delete(item);
    logMessage(t('itemDiscarded', { item: getEquipmentDisplayName(item) }), 'loot');
    updateUI();
    resumePendingEquipmentDrop();
}

function updateBulkDiscardControls() {
    const selectedCount = [...selectedInventoryItems]
        .filter((item) => hero.equipmentInventory.includes(item)).length;
    document.getElementById('equipment-bag-selected-count').textContent =
        t('selectedItemsCount', { count: selectedCount });
    const discardButton = document.getElementById('discard-selected-items-button');
    discardButton.textContent = t('discardSelectedItems');
    discardButton.disabled = selectedCount === 0 || inCombat || gameOver;
}

function discardSelectedInventoryItems() {
    if (inCombat || gameOver) return;
    const selectedItems = hero.equipmentInventory.filter((item) => selectedInventoryItems.has(item));
    if (!selectedItems.length) {
        selectedInventoryItems.clear();
        updateBulkDiscardControls();
        return;
    }
    const hasWaitingDrop = Boolean(pendingEquipment && !pendingEquipment.fromInventory);
    hero.equipmentInventory = hero.equipmentInventory.filter((item) => !selectedInventoryItems.has(item));
    selectedInventoryItems.clear();
    logMessage(t('itemsDiscarded', { count: selectedItems.length }), 'loot');
    updateUI();

    if (hasWaitingDrop) resumePendingEquipmentDrop();
}

function showEquipmentChoice(item, fromInventory, targetSlot = item.slot) {
    pendingEquipment = { item, fromInventory, targetSlot };
    if (!fromInventory && hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY) {
        openEquipmentBag();
        return;
    }
    const candidate = targetSlot === item.slot ? item : { ...item, slot: targetSlot };
    const conflicts = getEquipmentConflicts(candidate);
    const currentItems = conflicts.map(({ item: equippedItem }) => equippedItem);
    const currentItem = currentItems[0] || null;
    document.getElementById('item-drop-title').textContent = t(
        fromInventory ? 'compareEquipmentTitle' : 'itemDropTitle'
    );
    document.getElementById('item-drop-message').textContent = fromInventory
        ? t('itemDropPrompt')
        : t(currentItem ? 'itemDropPrompt' : 'itemDropPromptNoCurrent');
    setEquipmentIcon(document.getElementById('item-drop-new-icon'), item);
    const newItemName = document.getElementById('item-drop-new-name');
    newItemName.textContent = getEquipmentDisplayName(item);
    newItemName.className = `equipment-comparison-name ${getEquipmentRarityClass(item)}`;
    document.querySelector('.equipment-comparison-new .equipment-comparison-label').textContent = t(
        fromInventory ? 'comparisonCandidateLabel' : 'newEquipmentLabel'
    );
    const newItemSlot = document.getElementById('item-drop-new-slot');
    newItemSlot.textContent = `${getEquipmentRarity(item).name[gameLanguage]} · ${getEquipmentSlotLabel(candidate)}`;
    newItemSlot.className = `equipment-comparison-slot ${getEquipmentRarityClass(item)}`;
    const comparison = document.querySelector('.equipment-comparison');
    const currentCard = document.querySelector('.equipment-comparison-current');
    const comparisonArrow = document.querySelector('.equipment-comparison-arrow');
    comparison.classList.toggle('equipment-comparison-single', !currentItem);
    comparison.classList.toggle('equipment-comparison-multiple', currentItems.length > 1);
    currentCard.hidden = !currentItem;
    comparisonArrow.hidden = !currentItem;
    const currentGroup = document.querySelector('.equipment-comparison-current-group');
    currentGroup.querySelectorAll('.equipment-comparison-current-extra').forEach((card) => card.remove());
    if (currentItem) {
        const cards = [currentCard];
        currentItems.slice(1).forEach(() => {
            const extraCard = currentCard.cloneNode(true);
            extraCard.classList.add('equipment-comparison-current-extra');
            extraCard.removeAttribute('aria-labelledby');
            extraCard.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
            currentGroup.append(extraCard);
            cards.push(extraCard);
        });
        currentItems.forEach((equippedItem, index) => {
            const card = cards[index];
            setEquipmentIcon(card.querySelector('.equipment-comparison-icon'), equippedItem);
            const name = card.querySelector('.equipment-comparison-name');
            name.textContent = getEquipmentDisplayName(equippedItem);
            name.className = `equipment-comparison-name ${getEquipmentRarityClass(equippedItem)}`;
            const slot = card.querySelector('.equipment-comparison-slot');
            slot.textContent = `${getEquipmentRarity(equippedItem).name[gameLanguage]} · ${getEquipmentSlotLabel(equippedItem)}`;
            slot.className = `equipment-comparison-slot ${getEquipmentRarityClass(equippedItem)}`;
            renderEquipmentBonuses(card.querySelector('.equipment-comparison-bonuses'), equippedItem);
        });
    }
    const currentTotals = currentItems.reduce((totals, equippedItem) => {
        Object.entries(equippedItem.stats || {}).forEach(([stat, amount]) => {
            totals[stat] = (totals[stat] || 0) + (Number(amount) || 0);
        });
        return totals;
    }, {});
    renderEquipmentBonuses(
        document.getElementById('item-drop-new-bonuses'),
        candidate,
        currentItem ? { stats: currentTotals } : null,
        true
    );
    const blockedByFullBag = isPendingDropBlocked();
    const blockedByStorageCapacity = !fromInventory
        && hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY;
    document.getElementById('item-drop-actions').classList.toggle(
        'item-drop-actions-blocked',
        blockedByFullBag || blockedByStorageCapacity
    );
    const choiceHelp = blockedByFullBag
        ? t('pendingEquipmentFullHelp')
        : conflicts.length > 1
            ? t('itemDropChoiceHelpMultiple', {
                items: conflicts.map(({ item: conflictItem }) => getEquipmentDisplayName(conflictItem)).join(', ')
            })
            : t(currentItem ? 'itemDropChoiceHelp' : 'itemDropChoiceHelpNoCurrent');
    document.getElementById('item-drop-choice-help').textContent = fromInventory
        ? conflicts.length > 1 ? choiceHelp : ''
        : choiceHelp;
    document.getElementById('equip-new-item-button').textContent = t(currentItem ? 'equipNewItem' : 'equipFoundItem');
    document.getElementById('keep-current-item-button').textContent = t(fromInventory
        ? 'cancelComparison'
        : currentItem ? 'keepCurrentItem' : 'storeFoundItem');
    document.getElementById('equip-new-item-button').disabled = blockedByFullBag;
    document.getElementById('equip-new-item-button').hidden = blockedByFullBag;
    document.getElementById('keep-current-item-button').disabled = fromInventory
        ? false
        : blockedByStorageCapacity;
    document.getElementById('keep-current-item-button').hidden = !fromInventory && blockedByStorageCapacity;
    const equipButton = document.getElementById('equip-new-item-button');
    const otherHandButton = document.getElementById('equip-other-hand-from-drop-button');
    const canChooseHand = ['mainHand', 'offHand'].includes(item.slot)
        && item.itemType === 'weapon'
        && item.handUsage !== 'two-handed';
    document.getElementById('item-drop-actions').classList.toggle('item-drop-actions-hand-choice', canChooseHand);
    equipButton.textContent = t(canChooseHand
        ? 'equipRightHand'
        : currentItem ? 'equipNewItem' : 'equipFoundItem');
    otherHandButton.hidden = !canChooseHand;
    otherHandButton.textContent = t('equipLeftHand');
    otherHandButton.disabled = blockedByFullBag;
    document.getElementById('open-bag-from-drop-button').hidden = fromInventory
        || (!blockedByFullBag && !blockedByStorageCapacity);
    const discardPendingButton = document.getElementById('discard-pending-item-button');
    discardPendingButton.hidden = fromInventory || (!blockedByFullBag && !blockedByStorageCapacity);
    discardPendingButton.textContent = t('discardPendingItem');
    document.getElementById('item-drop-dialog').showModal();
    renderEquipment();
}

function renderEquipmentBonuses(container, item, currentItem = null, compare = false) {
    container.replaceChildren();
    const statKeys = compare
        ? new Set([...Object.keys(item.stats || {}), ...Object.keys(currentItem?.stats || {})])
        : Object.keys(item.stats || {});
    const bonuses = [...statKeys].map((stat) => [stat, Number(item.stats?.[stat]) || 0]);
    if (!bonuses.length) {
        const empty = document.createElement('li');
        empty.textContent = t('noEquipmentBonuses');
        container.append(empty);
        return;
    }

    bonuses.forEach(([stat, amount]) => {
        const currentAmount = Number(currentItem?.stats?.[stat]) || 0;
        const difference = amount - currentAmount;
        const isMaxFury = stat === 'maxFury';
        const isBetter = isMaxFury ? difference < 0 : difference > 0;
        const isWorse = isMaxFury ? difference > 0 : difference < 0;
        const bonus = document.createElement('li');
        if (compare) {
            bonus.classList.add(isBetter
                ? 'equipment-comparison-stat-better'
                : isWorse
                    ? 'equipment-comparison-stat-worse'
                    : 'equipment-comparison-stat-equal');
        }
        bonus.textContent = t(
            amount < 0
                ? (PERCENTAGE_EQUIPMENT_STATS.has(stat)
                    ? 'equipmentPercentagePenalty'
                    : 'equipmentPenalty')
                : (PERCENTAGE_EQUIPMENT_STATS.has(stat)
                    ? 'equipmentPercentageBonus'
                    : 'equipmentBonus'),
            { amount, stat: t(EQUIPMENT_STAT_KEYS[stat]) }
        );
        if (compare && difference !== 0) {
            const delta = document.createElement('span');
            delta.className = 'equipment-comparison-delta';
            delta.textContent = `${difference > 0 ? '+' : ''}${difference}`;
            bonus.append(' ', delta);
        }
        container.append(bonus);
    });
}

function isPendingDropBlocked() {
    if (!pendingEquipment) return false;
    const inventoryAfterEquip = hero.equipmentInventory.length - (pendingEquipment.fromInventory ? 1 : 0);
    const candidate = pendingEquipment.targetSlot === pendingEquipment.item.slot
        ? pendingEquipment.item
        : { ...pendingEquipment.item, slot: pendingEquipment.targetSlot };
    return inventoryAfterEquip + getEquipmentConflicts(candidate).length > EQUIPMENT_BAG_CAPACITY;
}

function isPendingDropWaitingForSpace() {
    if (!pendingEquipment || pendingEquipment.fromInventory) return false;
    return hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY
        || isPendingDropBlocked();
}


function equipPendingEquipment() {
    if (!pendingEquipment || gameOver || campaignComplete || isPendingDropBlocked()) return;
    const { item, fromInventory, targetSlot = item.slot } = pendingEquipment;
    if (fromInventory && !hero.equipmentInventory.includes(item)) {
        pendingEquipment = null;
        document.getElementById('item-drop-dialog').close();
        updateUI();
        return;
    }
    pendingEquipment = null;
    if (!equipItem(item, fromInventory, targetSlot)) {
        pendingEquipment = { item, fromInventory, targetSlot };
        updateUI();
        return;
    }
    document.getElementById('item-drop-dialog').close();
}

function keepPendingEquipment() {
    if (!pendingEquipment) return;
    if (!pendingEquipment.fromInventory
        && hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY) {
        openEquipmentBag();
        return;
    }
    const { item, fromInventory } = pendingEquipment;
    pendingEquipment = null;
    document.getElementById('item-drop-dialog').close();
    if (!fromInventory) {
        hero.equipmentInventory.push(item);
        logMessage(t('itemStored', { item: getEquipmentDisplayName(item) }), 'loot');
    }
    updateUI();
    if (fromInventory) openEquipmentBag();
}

function equipPendingInHand(targetSlot) {
    if (!pendingEquipment || gameOver || campaignComplete) return;
    const { item } = pendingEquipment;
    if (item.itemType === 'weapon' && item.handUsage !== 'two-handed'
        && ['mainHand', 'offHand'].includes(item.slot)) {
        pendingEquipment.targetSlot = targetSlot;
    } else {
        pendingEquipment.targetSlot = item.slot;
    }
    equipPendingEquipment();
}

function discardPendingEquipment() {
    if (!pendingEquipment || pendingEquipment.fromInventory || inCombat || gameOver) return;
    const { item } = pendingEquipment;
    pendingEquipment = null;
    document.getElementById('item-drop-dialog').close();
    logMessage(t('itemDiscarded', { item: getEquipmentDisplayName(item) }), 'loot');
    updateUI();
}


function saveGame() {
    if (!selectedCharacter || document.getElementById('game-main').hidden || campaignComplete) return;
    const snapshot = {
        version: 1, characterId: selectedCharacter.id, hero: JSON.parse(JSON.stringify(hero)), inCombat,
        currentRegion, discoveredRegions, explorationsSinceMistContact, explorationCount,
        explorationsSinceStoryEvent,
        storyEventSeen: [...storyEventSeen], pendingStoryEvent, pendingMistContact,
        seenStoryEvents: [...seenStoryEvents],
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
    selectedCharacterProgression = selectedCharacter.levelUp;
    Object.assign(hero, DEFAULT_CHARACTER.baseStats, snapshot.hero);
    const savedEquipment = { ...(snapshot.hero?.equipment || {}) };
    const legacyAccessory = savedEquipment.accessory;
    if (legacyAccessory) {
        const migratedSlot = legacyAccessory.id === 'river-charm' ? 'necklace'
            : legacyAccessory.id === 'mist-ring' ? 'ring' : 'accessory';
        savedEquipment[migratedSlot] = { ...legacyAccessory, slot: migratedSlot };
        delete savedEquipment.accessory;
    }
    hero.equipment = Object.fromEntries(EQUIPMENT_SLOTS.map(({ id }) => [
        id,
        savedEquipment[id] ? hydrateItem(savedEquipment[id]) : null
    ]));
    hero.equipmentInventory = Array.isArray(snapshot.hero?.equipmentInventory)
        ? snapshot.hero.equipmentInventory.map(hydrateItem) : [];
    selectedInventoryItems.clear();
    currentRegion = Math.max(0, Math.min(GAME_DATA.regions.length - 1, Number(snapshot.currentRegion) || 0));
    discoveredRegions = Array.isArray(snapshot.discoveredRegions) ? snapshot.discoveredRegions : [0];
    explorationsSinceMistContact = Number(snapshot.explorationsSinceMistContact) || 0;
    explorationCount = Number(snapshot.explorationCount) || 0;
    explorationsSinceStoryEvent = Number(snapshot.explorationsSinceStoryEvent) || 0;
    equipmentInstanceId = Number(snapshot.equipmentInstanceId) || 0;
    storyEventSeen.clear();
    (snapshot.storyEventSeen || []).forEach((id) => storyEventSeen.add(id));
    seenStoryEvents.clear();
    (snapshot.seenStoryEvents || []).forEach((id) => seenStoryEvents.add(id));
    pendingStoryEvent = snapshot.pendingStoryEvent || null;
    if (pendingStoryEvent && !pendingStoryEvent.choices) pendingStoryEvent = GAME_DATA.regions[currentRegion].event?.[0] || null;
    pendingMistContact = snapshot.pendingMistContact || null;
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
    document.getElementById('game-start-screen').hidden = true;
    document.body.classList.remove('game-start-active');
    updateUI(); saveGame(); startGameMusic();
    return true;
}

function showContinueOption() {
    document.getElementById('continue-adventure-button').hidden = !readSavedGame();
}

function hydrateItem(savedItem) {
    const catalogItem = ITEM_DATA.equipment.find((item) => item.id === savedItem?.id);
    if (!catalogItem) return savedItem;
    const savedRarity = GAME_RULES.loot.equipmentRarities.find((rarity) => rarity.id === savedItem.rarity)
        || GAME_RULES.loot.equipmentRarities[0];
    const isCurrentUpgradeFormat = savedItem.upgradeSystemVersion === 2;
    const stats = isCurrentUpgradeFormat
        ? { ...savedItem.stats }
        : Object.fromEntries(Object.entries(catalogItem.stats).map(([stat, amount]) => [
            stat,
            amount + savedRarity.statBonus
        ]));
    return {
        ...catalogItem,
        ...savedItem,
        stats,
        slot: catalogItem.slot,
        rarity: savedRarity.id,
        upgradeLevel: isCurrentUpgradeFormat ? Math.min(
            GAME_RULES.equipmentUpgrade.maxLevel,
            Math.max(0, Number(savedItem.upgradeLevel) || 0)
        ) : 0,
        upgradeSystemVersion: 2
    };
}

const EQUIPMENT_SLOTS = Object.freeze([
    { id: "rightHand", icon: "🗡️" },
    { id: "leftHand", icon: "🛡️" },
    { id: "head", icon: "⛑️" },
    { id: "body", icon: "🦺" },
    { id: "legs", icon: "👖" },
    { id: "boots", icon: "🥾" },
    { id: "necklace", icon: "📿" },
    { id: "ring", icon: "💍" },
    { id: "accessory", icon: "🔮" },
    { id: "pet", icon: "🐾" }
]);
const EQUIPMENT_STAT_KEYS = Object.freeze({
    atk: "attackStat",
    def: "defenseStat",
    maxHp: "hpStat",
    maxFoco: "focusStat",
    evasion: "evasionStat",
    parry: "parryStat",
    stunChance: "stun"
});

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

function rollEquipmentRarity(allowedRarityIds = null) {
    const finalRegionIndex = GAME_DATA.regions.length - 1;
    const isFinalRegion = currentRegion === finalRegionIndex;
    const finalRegionOnly = GAME_RULES.loot.finalRegionOnlyRarities || [];
    const rarities = GAME_RULES.loot.equipmentRarities.filter((rarity) =>
        (!allowedRarityIds || allowedRarityIds.includes(rarity.id))
        && (isFinalRegion || !finalRegionOnly.includes(rarity.id))
    );
    if (rarities.length === 0) return GAME_RULES.loot.equipmentRarities[0];
    const totalChance = rarities.reduce((total, rarity) => total + rarity.chance, 0);
    let remainingRoll = Math.random() * totalChance;
    return rarities.find((rarity) => {
        remainingRoll -= rarity.chance;
        return remainingRoll < 0;
    }) || rarities[0];
}

function createChallengeEquipmentDrop(allowedRarityIds) {
    const equipment = ITEM_DATA.equipment;
    if (equipment.length === 0) return null;
    const template = equipment[Math.floor(Math.random() * equipment.length)];
    return createEquipmentInstance(template, rollEquipmentRarity(allowedRarityIds));
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

function applyLanguage() {
    document.documentElement.lang = gameLanguage === "en" ? "en" : "pt-BR";
    document.title = t("documentTitle");
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
        element.setAttribute("aria-label", t(element.dataset.i18nAria));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
        element.title = t(element.dataset.i18nTitle);
    });
    document.querySelector("#game-home").href = gameLanguage === "en" ? "/en/" : "/pt/";
    document.querySelectorAll("[data-game-language]").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.gameLanguage === gameLanguage));
    });
}

document.querySelectorAll("[data-game-language]").forEach((button) => {
    button.addEventListener("click", () => {
        if (button.dataset.gameLanguage === gameLanguage) return;
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("lang", button.dataset.gameLanguage);
        window.location.assign(nextUrl);
    });
});

const gameMusic = document.getElementById('game-music');
const musicToggle = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const SOUND_EFFECTS = Object.freeze({
    dodge: new Audio('audio/sfx/dodge.mp3'),
    parry: new Audio('audio/sfx/parry.mp3'),
    basicAttack: new Audio('audio/sfx/basic-attack.mp3'),
    specialAttack: new Audio('audio/sfx/special-attack.mp3'),
    levelUp: new Audio('audio/sfx/level-up.mp3')
});
Object.values(SOUND_EFFECTS).forEach((sound) => {
    sound.preload = 'none';
});

function playSound(effect) {
    const sound = SOUND_EFFECTS[effect];
    if (!sound) return;
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function updateMusicButton(isPlaying) {
    const label = t(isPlaying ? 'musicPause' : 'musicPlay');
    musicIcon.innerText = isPlaying ? '🔊' : '🔇';
    musicToggle.setAttribute('aria-label', label);
    musicToggle.title = label;
}

function setCombatMusic(isCombat) {
    if (!musicEnabled) return;
    if (isCombat) gameMusic.dataset.combat = 'true';
    else delete gameMusic.dataset.combat;
}

function startGameMusic() {
    musicEnabled = true;
    gameMusic.play()
        .then(() => updateMusicButton(true))
        .catch(() => updateMusicButton(false));
}

musicToggle.addEventListener('click', () => {
    if (gameMusic.paused) {
        musicEnabled = true;
        startGameMusic();
    } else { musicEnabled = false; gameMusic.pause(); }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        gameMusic.pause();
        return;
    }
    if (musicEnabled && document.getElementById('game-main').hidden === false) {
        gameMusic.play().catch(() => {});
    }
});

gameMusic.addEventListener('play', () => updateMusicButton(true));
gameMusic.addEventListener('pause', () => updateMusicButton(false));
gameMusic.addEventListener('error', () => updateMusicButton(false));

const GAME_DATA = window.YaraRpgData;
const GAME_RULES = GAME_DATA.rules;
const EXPLORATION_RULES = GAME_DATA.exploration;
const EQUIPMENT_BAG_CAPACITY = GAME_RULES.inventory.equipmentBagCapacity;
const ITEM_DATA = GAME_DATA.items;
const MIST_CONTACT_DATA = GAME_DATA.mistContacts;
const SPECIAL_MONSTERS = GAME_DATA.specialMonsters;
let selectedCharacter = GAME_DATA.characters[0];
let selectedCharacterProgression = selectedCharacter.levelUp;
const MIST_CONTACT_SYSTEM = window.YaraMistContactSystem;
const DEFAULT_CHARACTER = GAME_DATA.characters[0];
const hero = {
    name: DEFAULT_CHARACTER.name,
    ...DEFAULT_CHARACTER.baseStats,
    potions: ITEM_DATA.healingPotion.startingCount,
    maxPotions: ITEM_DATA.healingPotion.startingCapacity,
    evasionBonus: 0,
    parryBonus: 0,
    mistPowers: [],
    equipment: Object.fromEntries(EQUIPMENT_SLOTS.map(({ id }) => [id, null])),
    equipmentInventory: []
};

const CAMP_COST = GAME_RULES.camp.goldCost;
const CAMP_HP_RECOVERY_PERCENT = GAME_RULES.camp.hpRecoveryPercent;
const CAMP_FOCO_RECOVERY_PERCENT = GAME_RULES.camp.focoRecoveryPercent;
const POTION_HEAL_AMOUNT_HP = ITEM_DATA.healingPotion.healAmount;
const POTION_HEAL_AMOUNT_FOCO = ITEM_DATA.healingPotion.healFoco;
const UPGRADE_COST = GAME_RULES.upgrades.goldCost;
const FURY_PER_DAMAGE = GAME_RULES.combat.furyPerDamageTaken;
const FURY_PER_DODGE = GAME_RULES.combat.furyPerDodge;
const CRITICAL_DAMAGE_MULTIPLIER = GAME_RULES.combat.criticalDamageMultiplier;
const CRITICAL_STUN_BONUS = GAME_RULES.combat.criticalStunBonus;
const FURY_PER_BASIC_ATTACK_DAMAGE = GAME_RULES.combat.furyPerBasicAttackDamage;
const UPGRADE_CONFIG = GAME_RULES.upgrades.attributes;

let currentMonster = null;
let inCombat = false;
let combatActionLocked = false;
let combatEncounterId = 0;
let parrySkillUsedThisCombat = false;
let dodgeSkillUsedThisCombat = false;
let currentRegion = 0;
let discoveredRegions = [0];
let gameOver = false;
let openUpgradeOptions = null;
let pendingMistContact = null;
let pendingEquipment = null;
let selectedEquipmentDetails = null;
const selectedInventoryItems = new Set();
let equipmentInstanceId = 0;
let explorationsSinceMistContact = GAME_RULES.mistContacts.cooldownExplorations;
let pendingStoryEvent = null;
let explorationCount = 0;
let explorationsSinceStoryEvent = 0;
let campaignComplete = false;
let enemyTurnCount = 0;
let enemyTelegraphing = false;
let musicEnabled = false;
const SAVE_KEY = 'yara-rpg-save-v1';
const storyEventSeen = new Set();
const seenStoryEvents = new Set();
const RPG_LOG_MAX_ENTRIES = 100;

document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-upgrade-control]')) return;
    closeUpgradeOptions();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeUpgradeOptions();
});

document.getElementById('equip-new-item-button').addEventListener('click', equipPendingEquipment);
document.getElementById('keep-current-item-button').addEventListener('click', keepPendingEquipment);
document.getElementById('open-equipment-bag-button').addEventListener('click', openEquipmentBag);
document.getElementById('open-bag-from-drop-button').addEventListener('click', openEquipmentBag);
document.getElementById('close-equipment-bag-button').addEventListener('click', closeEquipmentBag);
document.getElementById('discard-selected-items-button').addEventListener('click', discardSelectedInventoryItems);
document.getElementById('close-equipment-item-button').addEventListener('click', closeEquipmentItemDetails);
document.getElementById('equipment-item-equip-button').addEventListener('click', equipSelectedInventoryItem);
document.getElementById('equipment-item-unequip-button').addEventListener('click', unequipSelectedEquipment);
document.getElementById('equipment-item-discard-button').addEventListener('click', discardSelectedInventoryItem);
document.getElementById('equipment-item-upgrade-button').addEventListener('click', upgradeSelectedEquipment);
document.getElementById('equipment-item-dialog').addEventListener('close', () => {
    selectedEquipmentDetails = null;
});
document.getElementById('equipment-bag-dialog').addEventListener('cancel', (event) => {
    if (isPendingDropBlocked()) {
        event.preventDefault();
        openEquipmentBag();
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

function renderEquipment() {
    const slotsContainer = document.getElementById('equipment-slots');
    const bagButton = document.getElementById('open-equipment-bag-button');
    const potionButton = document.getElementById('potion-button');
    slotsContainer.replaceChildren();
    const equippedCount = Object.values(hero.equipment).filter(Boolean).length;
    const equippedItemCount = document.getElementById('equipped-item-count');
    equippedItemCount.textContent = `${equippedCount}/${EQUIPMENT_SLOTS.length}`;
    document.getElementById('hero-equipment-toggle').setAttribute(
        'aria-label',
        t('equipmentSummary', { count: equippedCount })
    );
    const bagCount = hero.equipmentInventory.length;
    const bagCountText = `${bagCount}/${EQUIPMENT_BAG_CAPACITY}`;
    bagButton.querySelector('#equipment-bag-count').textContent = bagCountText;
    bagButton.setAttribute('aria-label', t('openEquipmentBag', {
        count: bagCount,
        capacity: EQUIPMENT_BAG_CAPACITY
    }));

    EQUIPMENT_SLOTS.forEach(({ id, icon }) => {
        const item = hero.equipment[id];
        const slot = document.createElement('div');
        slot.className = `equipment-slot equipment-slot-${id} rounded-lg border border-fantasy-border/50 bg-forest-950/60`;
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
            itemIcon.textContent = item.icon;
            itemIcon.setAttribute('aria-hidden', 'true');
            itemButton.append(itemIcon);
            itemButton.addEventListener('click', () => showEquipmentItemDetails(item, 'equipped', id));
            const rarityBadge = document.createElement('span');
            rarityBadge.className = `equipment-slot-rarity-badge ${getEquipmentRarityClass(item)}`;
            rarityBadge.textContent = `+${Number(item.upgradeLevel) || 0}`;
            rarityBadge.setAttribute('aria-hidden', 'true');
            slot.append(itemButton, rarityBadge);
        } else {
            const placeholder = document.createElement('span');
            placeholder.className = 'equipment-slot-icon equipment-slot-placeholder';
            placeholder.textContent = icon;
            placeholder.setAttribute('aria-hidden', 'true');
            slot.append(placeholder);
        }

        slotsContainer.append(slot);
    });

    bagButton.className = 'equipment-slot equipment-bag-button';
    bagButton.setAttribute('aria-haspopup', 'dialog');
    bagButton.setAttribute('aria-controls', 'equipment-bag-dialog');
    slotsContainer.append(bagButton);
    slotsContainer.append(potionButton);

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
            selectItem.disabled = inCombat || gameOver;
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
            itemIcon.textContent = item.icon;
            itemIcon.setAttribute('aria-hidden', 'true');
            itemButton.append(itemIcon);
            itemButton.addEventListener('click', () => showEquipmentItemDetails(item, 'inventory'));
            const rarityBadge = document.createElement('span');
            rarityBadge.className = `equipment-rarity-badge ${getEquipmentRarityClass(item)}`;
            rarityBadge.textContent = `+${Number(item.upgradeLevel) || 0}`;
            rarityBadge.setAttribute('aria-hidden', 'true');
            slot.append(position, selectItem, itemButton, rarityBadge);
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
    pendingLabel.hidden = !isPendingDropBlocked();
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
    document.getElementById('equipment-item-icon').textContent = item.icon;
    const itemTitle = document.getElementById('equipment-item-title');
    itemTitle.textContent = getEquipmentDisplayName(item);
    itemTitle.className = `text-lg font-bold ${getEquipmentRarityClass(item)}`;
    const rarity = getEquipmentRarity(item);
    const itemSlot = document.getElementById('equipment-item-slot');
    itemSlot.textContent = `${rarity.name[gameLanguage]} · ${t(item.slot)}`;
    itemSlot.className = `mt-1 text-xs ${getEquipmentRarityClass(item)}`;

    const properties = document.getElementById('equipment-item-properties');
    properties.replaceChildren();
    Object.entries(item.stats).forEach(([stat, amount]) => {
        const property = document.createElement('li');
        property.textContent = t(
            stat === 'evasion' || stat === 'parry' || stat === 'stunChance'
                ? 'equipmentPercentageBonus'
                : 'equipmentBonus',
            { amount, stat: t(EQUIPMENT_STAT_KEYS[stat]) }
        );
        properties.append(property);
    });

    const isInventoryItem = source === 'inventory';
    const upgradeButton = document.getElementById('equipment-item-upgrade-button');
    const upgradeCost = getEquipmentUpgradeCost(item);
    upgradeButton.textContent = upgradeCost === null
        ? t('upgradeEquipmentMaxed', { level: Number(item.upgradeLevel) || 0 })
        : t('upgradeEquipmentButton', { level: (Number(item.upgradeLevel) || 0) + 1, cost: upgradeCost });
    upgradeButton.disabled = inCombat || gameOver || Boolean(pendingEquipment)
        || upgradeCost === null || hero.gold < upgradeCost;
    const equipButton = document.getElementById('equipment-item-equip-button');
    const unequipButton = document.getElementById('equipment-item-unequip-button');
    const discardButton = document.getElementById('equipment-item-discard-button');
    equipButton.hidden = !isInventoryItem;
    equipButton.disabled = inCombat || gameOver || Boolean(pendingEquipment);
    equipButton.setAttribute('aria-label', t('equipItemAria', {
        item: getEquipmentDisplayName(item),
        slot: t(item.slot)
    }));
    unequipButton.hidden = isInventoryItem;
    unequipButton.disabled = inCombat || gameOver || Boolean(pendingEquipment)
        || hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY;
    unequipButton.setAttribute('aria-label', t('unequipItemAria', {
        item: getEquipmentDisplayName(item),
        slot: t(item.slot)
    }));
    discardButton.hidden = !isInventoryItem;
    discardButton.disabled = inCombat || gameOver;
    discardButton.setAttribute('aria-label', t('discardItemAria', {
        item: getEquipmentDisplayName(item)
    }));
}

function upgradeSelectedEquipment() {
    const selection = selectedEquipmentDetails;
    if (!selection || inCombat || gameOver || pendingEquipment) return;
    const { item, source, slot } = selection;
    if (source === 'inventory' && !hero.equipmentInventory.includes(item)) return;
    if (source === 'equipped' && hero.equipment[slot] !== item) return;

    const cost = getEquipmentUpgradeCost(item);
    if (cost === null || hero.gold < cost) return;
    hero.gold -= cost;
    item.upgradeLevel = (Number(item.upgradeLevel) || 0) + 1;
    item.upgradeSystemVersion = 2;
    Object.keys(item.stats).forEach((stat) => {
        item.stats[stat] += GAME_RULES.equipmentUpgrade.statBonusPerLevel;
    });
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

function equipSelectedInventoryItem() {
    const selection = selectedEquipmentDetails;
    if (!selection || selection.source !== 'inventory') return;
    closeEquipmentItemDetails();
    equipInventoryItem(selection.item);
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
    document.getElementById('equipment-bag-dialog').close();
    if (isPendingDropBlocked()) showEquipmentChoice(pendingEquipment.item, false);
}

function discardInventoryItem(item) {
    const inventoryIndex = hero.equipmentInventory.indexOf(item);
    if (inventoryIndex === -1 || inCombat || gameOver) return;
    hero.equipmentInventory.splice(inventoryIndex, 1);
    selectedInventoryItems.delete(item);
    logMessage(t('itemDiscarded', { item: getEquipmentDisplayName(item) }), 'loot');
    updateUI();
    if (pendingEquipment && !pendingEquipment.fromInventory) {
        document.getElementById('equipment-bag-dialog').close();
        showEquipmentChoice(pendingEquipment.item, false);
    }
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

    if (hasWaitingDrop && !isPendingDropBlocked()) {
        document.getElementById('equipment-bag-dialog').close();
        showEquipmentChoice(pendingEquipment.item, false);
    }
}

function showEquipmentChoice(item, fromInventory) {
    pendingEquipment = { item, fromInventory };
    const currentItem = hero.equipment[item.slot];
    document.getElementById('item-drop-message').textContent = t('itemDropPrompt');
    document.getElementById('item-drop-new-icon').textContent = item.icon;
    const newItemName = document.getElementById('item-drop-new-name');
    newItemName.textContent = getEquipmentDisplayName(item);
    newItemName.className = `equipment-comparison-name ${getEquipmentRarityClass(item)}`;
    const newItemSlot = document.getElementById('item-drop-new-slot');
    newItemSlot.textContent = `${getEquipmentRarity(item).name[gameLanguage]} · ${t(item.slot)}`;
    newItemSlot.className = `equipment-comparison-slot ${getEquipmentRarityClass(item)}`;
    document.getElementById('item-drop-current-icon').textContent = currentItem.icon;
    const currentItemName = document.getElementById('item-drop-current-name');
    currentItemName.textContent = getEquipmentDisplayName(currentItem);
    currentItemName.className = `equipment-comparison-name ${getEquipmentRarityClass(currentItem)}`;
    const currentItemSlot = document.getElementById('item-drop-current-slot');
    currentItemSlot.textContent = `${getEquipmentRarity(currentItem).name[gameLanguage]} · ${t(currentItem.slot)}`;
    currentItemSlot.className = `equipment-comparison-slot ${getEquipmentRarityClass(currentItem)}`;
    renderEquipmentBonuses(document.getElementById('item-drop-new-bonuses'), item);
    renderEquipmentBonuses(document.getElementById('item-drop-current-bonuses'), currentItem);
    const blockedByFullBag = isPendingDropBlocked();
    document.getElementById('item-drop-choice-help').textContent = blockedByFullBag
        ? t('pendingEquipmentFullHelp')
        : t('itemDropChoiceHelp');
    document.getElementById('equip-new-item-button').disabled = blockedByFullBag;
    document.getElementById('keep-current-item-button').disabled = blockedByFullBag;
    document.getElementById('open-bag-from-drop-button').hidden = !blockedByFullBag;
    document.getElementById('item-drop-dialog').showModal();
    renderEquipment();
}

function renderEquipmentBonuses(container, item) {
    container.replaceChildren();
    const bonuses = Object.entries(item.stats);
    if (!bonuses.length) {
        const empty = document.createElement('li');
        empty.textContent = t('noEquipmentBonuses');
        container.append(empty);
        return;
    }

    bonuses.forEach(([stat, amount]) => {
        const bonus = document.createElement('li');
        bonus.textContent = t(
            stat === 'evasion' || stat === 'parry' || stat === 'stunChance'
                ? 'equipmentPercentageBonus'
                : 'equipmentBonus',
            { amount, stat: t(EQUIPMENT_STAT_KEYS[stat]) }
        );
        container.append(bonus);
    });
}

function isPendingDropBlocked() {
    return Boolean(
        pendingEquipment
        && !pendingEquipment.fromInventory
        && hero.equipment[pendingEquipment.item.slot]
        && hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY
    );
}

function handleEquipmentDrop(item) {
    logMessage(t('itemFound', {
        item: getEquipmentDisplayName(item),
        slot: t(item.slot)
    }), 'loot');
    if (hero.equipment[item.slot]) {
        showEquipmentChoice(item, false);
        return;
    }

    equipItem(item, false);
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

function equipPendingEquipment() {
    if (!pendingEquipment || inCombat || gameOver || isPendingDropBlocked()) return;
    const { item, fromInventory } = pendingEquipment;
    pendingEquipment = null;
    document.getElementById('item-drop-dialog').close();
    equipItem(item, fromInventory);
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
}

function updateUI() {
    if (inCombat || gameOver) openUpgradeOptions = null;

    document.getElementById('hero-name').innerText = hero.name;
    document.getElementById('hero-level').innerText = hero.level;
    document.getElementById('hero-gold').innerText = hero.gold;
    document.getElementById('hero-xp').innerText = hero.xp;
    document.getElementById('hero-xp-max').innerText = hero.maxXp;
    document.getElementById('hero-hp').innerText = hero.hp;
    document.getElementById('hero-hp-max').innerText = getEffectiveStat('maxHp');
    document.getElementById('hero-foco').innerText = hero.foco;
    document.getElementById('hero-foco-max').innerText = getEffectiveStat('maxFoco');
    document.getElementById('hero-fury').innerText = hero.fury;
    document.getElementById('hero-fury-bar').style.width = Math.min(
        GAME_RULES.probabilityScale,
        hero.fury / hero.maxFury * GAME_RULES.probabilityScale
    ) + '%';
    const furyReady = hero.fury >= hero.maxFury;
    const quickAttackButton = document.getElementById('quick-attack-button');
    quickAttackButton.classList.toggle('fury-ready', furyReady);
    quickAttackButton.title = furyReady ? t('criticalRequirement') : '';
    document.getElementById('quick-attack-label').innerText = t(furyReady ? 'criticalAttack' : 'quickAttack');
    document.getElementById('hero-atk').innerText = getEffectiveStat('atk');
    document.getElementById('hero-def').innerText = getEffectiveStat('def');
    const effectiveEvasion = Math.min(selectedCharacter.skills.maxEvasion, getEffectiveStat('evasion'));
    const effectiveParry = Math.min(selectedCharacter.skills.maxParry, getEffectiveStat('parry'));
    const effectiveStunChance = Math.min(
        GAME_RULES.probabilityScale,
        getEffectiveStat('stunChance')
    );
    const evasionTotal = Math.min(selectedCharacter.skills.maxEvasion, effectiveEvasion + hero.evasionBonus);
    const evasionDisplay = document.getElementById('hero-evasion');
    const evasionBonusDisplay = document.getElementById('hero-evasion-bonus');
    document.getElementById('hero-evasion-base').innerText = effectiveEvasion + '%';
    evasionBonusDisplay.innerText = ` +${hero.evasionBonus}% = ${evasionTotal}%`;
    evasionBonusDisplay.classList.toggle('hidden', hero.evasionBonus === 0);
    evasionDisplay.classList.toggle('text-sm', hero.evasionBonus === 0);
    evasionDisplay.classList.toggle('text-[10px]', hero.evasionBonus > 0);
    evasionDisplay.setAttribute('aria-label', hero.evasionBonus
        ? `${effectiveEvasion}% + ${hero.evasionBonus}% = ${evasionTotal}%`
        : `${effectiveEvasion}%`);
    const parryTotal = Math.min(selectedCharacter.skills.maxParry, effectiveParry + hero.parryBonus);
    const parryDisplay = document.getElementById('hero-parry');
    const parryBonusDisplay = document.getElementById('hero-parry-bonus');
    document.getElementById('hero-parry-base').innerText = effectiveParry + '%';
    parryBonusDisplay.innerText = ` +${hero.parryBonus}% = ${parryTotal}%`;
    parryBonusDisplay.classList.toggle('hidden', hero.parryBonus === 0);
    parryDisplay.setAttribute('aria-label', hero.parryBonus
        ? `${effectiveParry}% + ${hero.parryBonus}% = ${parryTotal}%`
        : `${effectiveParry}%`);
    const stunBonus = hero.fury >= hero.maxFury ? CRITICAL_STUN_BONUS : 0;
    const stunChanceTotal = Math.min(GAME_RULES.probabilityScale, effectiveStunChance + stunBonus);
    const stunBonusDisplay = document.getElementById('hero-stun-bonus');
    const stunDisplay = document.getElementById('hero-stun');
    document.getElementById('hero-stun-base').innerText = effectiveStunChance + '%';
    stunBonusDisplay.innerText = ` +${stunBonus}% = ${stunChanceTotal}%`;
    stunBonusDisplay.classList.toggle('hidden', stunBonus === 0);
    stunDisplay.setAttribute('aria-label', stunBonus
        ? `${effectiveStunChance}% + ${stunBonus}% = ${stunChanceTotal}%`
        : `${effectiveStunChance}%`);
    document.querySelectorAll('.hero-potions-count').forEach((element) => {
        element.textContent = hero.potions;
    });
    document.querySelectorAll('.hero-potions-max').forEach((element) => {
        element.textContent = hero.maxPotions;
    });
    renderEquipment();
    const unlockedPowers = MIST_CONTACT_DATA.powers.filter((power) => hero.mistPowers.includes(power.id));
    const mistPowerList = document.getElementById('mist-power-list');
    mistPowerList.replaceChildren();
    if (!unlockedPowers.length) {
        const emptyState = document.createElement('li');
        emptyState.textContent = t('noMistPowers');
        mistPowerList.append(emptyState);
    } else {
        unlockedPowers.forEach((power) => {
            const entry = document.createElement('li');
            const name = document.createElement('strong');
            const description = document.createElement('span');
            name.className = 'text-purple-100';
            name.textContent = power.name[gameLanguage];
            description.className = 'ml-1 text-purple-200/70';
            description.textContent = `— ${power.description[gameLanguage]}`;
            entry.append(name, description);
            mistPowerList.append(entry);
        });
    }
    const currentRegionData = GAME_DATA.regions[currentRegion];
    document.body.classList.remove(...GAME_DATA.regions.map((region) => `region-${region.id}`));
    document.body.classList.add(`region-${currentRegionData.id}`);
    document.getElementById('exploration-title').innerText = currentRegionData.title[gameLanguage];
    document.getElementById('exploration-description').innerText = currentRegionData.description[gameLanguage];

    document.querySelectorAll('[data-region-stop]').forEach((stop) => {
        const regionIndex = Number(stop.dataset.regionStop);
        const isDiscovered = discoveredRegions.includes(regionIndex);
        const isCurrent = regionIndex === currentRegion;
        stop.querySelector('.region-stop-name').innerText = isDiscovered
            ? GAME_DATA.regions[regionIndex].title[gameLanguage]
            : '???';
        stop.querySelector('.region-stop-marker').innerText = isCurrent ? '●' : isDiscovered ? '✓' : '?';
        stop.classList.toggle('border-emerald-500/70', isCurrent);
        stop.classList.toggle('bg-emerald-950/50', isCurrent);
        stop.classList.toggle('text-emerald-200', isDiscovered);
        stop.classList.toggle('text-gray-500', !isDiscovered);
        if (isCurrent) stop.setAttribute('aria-current', 'step');
        else stop.removeAttribute('aria-current');
    });
    const nextDiscoveryChance = getDiscoveryChance();
    document.getElementById('discovery-chance').innerText = nextDiscoveryChance
        ? t('discoveryChance', { chance: nextDiscoveryChance })
        : t('journeyComplete');

    const hpPercent = Math.max(0, Math.min(
        GAME_RULES.probabilityScale,
        (hero.hp / getEffectiveStat('maxHp')) * GAME_RULES.probabilityScale
    ));
    document.getElementById('hero-hp-bar').style.width = hpPercent + '%';

    const focoPercent = Math.max(0, Math.min(
        GAME_RULES.probabilityScale,
        (hero.foco / getEffectiveStat('maxFoco')) * GAME_RULES.probabilityScale
    ));
    document.getElementById('hero-foco-bar').style.width = focoPercent + '%';

    const exploreControls = document.getElementById('controls-explore');
    const combatControls = document.getElementById('controls-combat');
    const encounterCard = document.getElementById('encounter-card');
    const explorationBanner = document.getElementById('exploration-banner');
    const mistContactCard = document.getElementById('mist-contact-card');
    const campButton = document.getElementById('camp-button');
    document.querySelector('[data-i18n="campCost"]').innerText = t('campCost', { cost: CAMP_COST });
    document.querySelector('[data-i18n="focusCost"]').innerText = t('focusCost', {
        cost: selectedCharacter.skills.heavyAttack.focoCost
    });
    document.querySelector('[data-i18n="parryBonus"]').innerText = t('parryBonus', {
        bonus: selectedCharacter.skills.parry.bonus,
        cost: selectedCharacter.skills.parry.focoCost
    });
    document.querySelector('[data-i18n="dodgeBonus"]').innerText = t('dodgeBonus', {
        bonus: selectedCharacter.skills.dodge.bonus,
        cost: selectedCharacter.skills.dodge.focoCost
    });
    document.querySelectorAll('[data-upgrade]').forEach((button) => {
        const upgrade = button.dataset.upgrade;
        const upgradeMax = upgrade === 'parry'
            ? selectedCharacter.skills.maxParry
            : upgrade === 'evasion'
                ? selectedCharacter.skills.maxEvasion
                : undefined;
        const upgradeConfiguration = upgradeMax === undefined
            ? UPGRADE_CONFIG[upgrade]
            : { ...UPGRADE_CONFIG[upgrade], max: upgradeMax };
        const skill = t(UPGRADE_CONFIG[upgrade].nameKey);
        const maximum = getMaxUpgradeQuantity(upgrade, upgradeConfiguration);
        const disabled = inCombat || gameOver || campaignComplete || maximum < 1 || isUpgradeMaxed(upgrade, upgradeConfiguration);
        button.disabled = disabled;
        button.setAttribute('aria-label', t('upgradeAria', { skill, cost: UPGRADE_COST }));
        button.title = t('upgradeAria', { skill, cost: UPGRADE_COST });
        button.setAttribute('aria-expanded', String(openUpgradeOptions === upgrade && !disabled));

        const options = document.querySelector(`[data-upgrade-options="${upgrade}"]`);
        options.hidden = openUpgradeOptions !== upgrade || disabled;
        options.querySelectorAll('[data-upgrade-quantity]').forEach((option) => {
            const quantity = option.dataset.upgradeQuantity === 'max'
                ? maximum
                : Number(option.dataset.upgradeQuantity);
            option.disabled = quantity < 1 || quantity > maximum;
            if (option.dataset.upgradeQuantity !== 'max') {
                option.setAttribute('aria-label', t('upgradeQuantityAria', {
                    skill,
                    amount: quantity
                }));
            } else {
                option.setAttribute('aria-label', t('upgradeQuantityAria', {
                    skill,
                    amount: maximum
                }));
            }
        });
    });
    document.getElementById('dodge-button').disabled = dodgeSkillUsedThisCombat
        || evasionTotal >= selectedCharacter.skills.maxEvasion
        || hero.foco < selectedCharacter.skills.dodge.focoCost;
    document.getElementById('parry-button').disabled = parrySkillUsedThisCombat
        || parryTotal >= selectedCharacter.skills.maxParry
        || hero.foco < selectedCharacter.skills.parry.focoCost;
    const restartButton = document.getElementById('restart-button');
    mistContactCard.classList.toggle('hidden', !pendingMistContact || inCombat || gameOver || pendingStoryEvent);
    const storyCard = document.getElementById('story-event-card');
    storyCard.hidden = !pendingStoryEvent || inCombat || gameOver;
    if (pendingStoryEvent) {
        document.getElementById('story-event-title').textContent = pendingStoryEvent.title[gameLanguage];
        document.getElementById('story-event-description').textContent = pendingStoryEvent.description[gameLanguage];
        const choices = document.getElementById('story-event-choices');
        choices.replaceChildren();
        pendingStoryEvent.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.type = 'button'; button.className = 'story-event-choice';
            button.textContent = choice.label[gameLanguage];
            button.addEventListener('click', () => resolveStoryEvent(index));
            choices.append(button);
        });
    }
    if (pendingMistContact) {
        document.getElementById('mist-contact-icon').textContent = pendingMistContact.icon;
        document.getElementById('mist-contact-name').textContent = pendingMistContact.name[gameLanguage];
        document.getElementById('mist-contact-message').textContent = pendingMistContact.message[gameLanguage];
    }
    campButton.disabled = inCombat || gameOver || campaignComplete || hero.gold < CAMP_COST || (
        hero.hp >= getEffectiveStat('maxHp') && hero.foco >= getEffectiveStat('maxFoco')
    );
    document.querySelectorAll('.potion-action-button').forEach((button) => {
        button.disabled = gameOver || campaignComplete || combatActionLocked;
    });
    document.querySelectorAll('#controls-combat button').forEach((button) => {
        const disabledByGameState = (button.id === 'dodge-button' && (
            dodgeSkillUsedThisCombat
            || evasionTotal >= selectedCharacter.skills.maxEvasion
            || hero.foco < selectedCharacter.skills.dodge.focoCost
        )) || (button.id === 'parry-button' && (
            parrySkillUsedThisCombat
            || parryTotal >= selectedCharacter.skills.maxParry
            || hero.foco < selectedCharacter.skills.parry.focoCost
        ));
        button.disabled = combatActionLocked || disabledByGameState;
    });

    document.getElementById('campaign-ending-card').hidden = !campaignComplete && !gameOver;
    if (campaignComplete || gameOver) {
        exploreControls.classList.add('hidden'); combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden'); mistContactCard.classList.add('hidden'); storyCard.hidden = true;
        explorationBanner.classList.add('hidden'); restartButton.classList.add('hidden');
        document.getElementById('campaign-ending-title').textContent = t(campaignComplete ? 'campaignVictoryTitle' : 'campaignDefeatTitle');
        document.getElementById('campaign-ending-description').textContent = t(campaignComplete ? 'campaignVictoryDescription' : 'campaignDefeatDescription');
        document.getElementById('campaign-ending-card').querySelector('[data-i18n="restartCampaign"]').textContent = t('restart');
    } else if (inCombat) {
        exploreControls.classList.add('hidden');
        combatControls.classList.remove('hidden');
        encounterCard.classList.remove('hidden');
        mistContactCard.classList.add('hidden');
        explorationBanner.classList.add('hidden');
        restartButton.classList.add('hidden');
    } else if (pendingStoryEvent) {
        exploreControls.classList.add('hidden'); combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden'); mistContactCard.classList.add('hidden');
        explorationBanner.classList.remove('hidden'); restartButton.classList.add('hidden');
    } else if (pendingMistContact) {
        exploreControls.classList.add('hidden');
        combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden');
        mistContactCard.classList.remove('hidden');
        explorationBanner.classList.remove('hidden');
        restartButton.classList.add('hidden');
    } else {
        exploreControls.classList.remove('hidden');
        combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden');
        mistContactCard.classList.add('hidden');
        explorationBanner.classList.remove('hidden');
        restartButton.classList.add('hidden');
    }
    saveGame();
}

function logMessage(message, type = 'normal') {
    const logBox = document.getElementById('rpg-log');
    const locale = gameLanguage === "en" ? "en-US" : "pt-BR";
    const time = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let colorClass = "text-gray-300 border-l-2 border-gray-600";
    if (type === 'combat-hero') colorClass = "text-emerald-400 border-l-2 border-emerald-500 font-semibold";
    if (type === 'combat-monster') colorClass = "text-red-400 border-l-2 border-red-500 font-semibold";
    if (type === 'discovery') colorClass = "text-amber-300 border-l-2 border-amber-500 font-semibold";
    if (type === 'loot') colorClass = "text-purple-300 border-l-2 border-purple-500 font-semibold";
    if (type === 'special') colorClass = "text-cyan-300 border-l-2 border-cyan-500 font-semibold";

    const div = document.createElement('div');
    div.className = `${colorClass} pl-2 py-0.5`;
    if (message.includes('<')) {
        div.innerHTML = `[${time}] ${message}`;
    } else {
        div.textContent = `[${time}] ${message}`;
    }
    
    logBox.appendChild(div);
    while (logBox.children.length > RPG_LOG_MAX_ENTRIES) {
        logBox.firstElementChild?.remove();
    }
    logBox.scrollTop = logBox.scrollHeight;
}



function startAdventure({ character, equipment }) {
    selectedCharacter = character;
    selectedCharacterProgression = character.levelUp;
    currentRegion = 0; discoveredRegions = [0];
    inCombat = false; currentMonster = null; gameOver = false; campaignComplete = false;
    pendingMistContact = null; pendingEquipment = null; pendingStoryEvent = null;
    selectedInventoryItems.clear();
    storyEventSeen.clear(); seenStoryEvents.clear(); explorationCount = 0;
    explorationsSinceStoryEvent = 0;
    explorationsSinceMistContact = GAME_RULES.mistContacts.cooldownExplorations;
    Object.assign(hero, character.baseStats, {
        name: character.name,
        potions: ITEM_DATA.healingPotion.startingCount,
        maxPotions: ITEM_DATA.healingPotion.startingCapacity,
        evasionBonus: 0,
        parryBonus: 0,
        fury: 0,
        mistPowers: [],
        equipment: Object.fromEntries(EQUIPMENT_SLOTS.map(({ id }) => [id, null])),
        equipmentInventory: []
    });
    combatActionLocked = false;
    combatEncounterId++;
    Object.entries(character.specialty).forEach(([stat, amount]) => {
        hero[stat] += amount;
    });
    equipment.forEach((item) => {
        hero.equipment[item.slot] = item;
    });
    hero.hp = getEffectiveStat('maxHp');
    hero.foco = getEffectiveStat('maxFoco');

    document.querySelector('#rpg-log [data-i18n="openingLog"]').textContent =
        t('openingLog', { hero: hero.name });
    document.getElementById('rpg-log').replaceChildren();
    logMessage(t('openingLog', { hero: hero.name }), 'special');
    document.getElementById('game-main').hidden = false;
    document.getElementById('game-start-screen').hidden = true;
    document.body.classList.remove('game-start-active');
    updateUI();
    saveGame();
    showContinueOption();
    startGameMusic();
}

function checkLevelUp() {
    while (hero.xp >= hero.maxXp) {
        const growth = selectedCharacterProgression;
        hero.level++;
        hero.xp -= hero.maxXp;
        hero.maxXp = Math.floor(hero.maxXp * GAME_RULES.progression.xpRequirementMultiplier);
        
        hero.maxHp += growth.maxHp;
        hero.hp = getEffectiveStat('maxHp');
        hero.maxFoco += growth.maxFoco;
        hero.foco = getEffectiveStat('maxFoco');
        hero.maxPotions = Math.min(
            ITEM_DATA.healingPotion.maxCapacity,
            hero.maxPotions + growth.maxPotions
        );
        hero.atk += growth.atk;
        hero.def += growth.def;
        hero.evasion = Math.min(selectedCharacter.skills.maxEvasion, hero.evasion + growth.evasion);
        hero.parry = Math.min(selectedCharacter.skills.maxParry, hero.parry + growth.parry);
        hero.stunChance = Math.min(
            GAME_RULES.probabilityScale,
            hero.stunChance + growth.stunChance
        );

        playSound('levelUp');
        logMessage(t("levelUp", { level: hero.level }), "discovery");
    }
}

window.onload = function() {
    applyLanguage();
    window.YaraRpgCharacterSetup.initialize({
        translate: t,
        describeEquipment: getItemBonusText,
        onStart: startAdventure
    });
    showContinueOption();
    document.getElementById('continue-adventure-button').addEventListener('click', () => loadSavedGame());
};

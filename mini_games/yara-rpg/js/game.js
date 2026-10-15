
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

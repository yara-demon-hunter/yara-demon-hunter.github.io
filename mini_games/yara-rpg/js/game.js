"use strict";

// ============================================================
// Yara RPG - game.js
// Estado global, criação do herói e bootstrap.
// Carregado POR ÚLTIMO (ver game.html). Todos os js/data/*
// populam window.YaraRpgData e os js/systems/* compartilham
// este escopo global (sem bundler / sem ES modules).
// ============================================================

// ---------- 1) Domínio: Equipamento ----------
const EQUIPMENT_SLOTS = Object.freeze([
    { id: "mainHand", icon: "🗡️" },
    { id: "offHand",  icon: "🛡️" },
    { id: "head",      icon: "⛑️", image: "images/items/leather-cap.webp" },
    { id: "body",      icon: "🦺", image: "images/items/leather-armor.webp" },
    { id: "legs",      icon: "👖", image: "images/items/trail-trousers.webp" },
    { id: "boots",     icon: "🥾", image: "images/items/swift-boots.webp" },
    { id: "necklace",  icon: "📿" },
    { id: "ring",      icon: "💍" },
    { id: "accessory", icon: "🔮" },
    { id: "pet",       icon: "🐾" },
]);

const EQUIPMENT_STAT_KEYS = Object.freeze({
    atk: "attackStat",
    def: "defenseStat",
    maxHp: "hpStat",
    maxFoco: "focusStat",
    evasion: "evasionStat",
    parry: "parryStat",
    stunChance: "stun",
    criticalChance: "criticalChance",
    criticalDamage: "criticalDamageStat",
    maxFury: "fury",
});
const PERCENTAGE_EQUIPMENT_STATS = new Set([
    "evasion", "parry", "stunChance", "criticalChance", "criticalDamage", "maxFury"
]);

function createEmptyEquipmentMap() {
    return Object.fromEntries(EQUIPMENT_SLOTS.map(s => [s.id, null]));
}

// ---------- 2) Aliases globais (usados por systems/*) ----------
// IMPORTANTE: todos são lidos via escopo global por outros sistemas.
// Não remova achando que estão "sem uso" neste arquivo.
const GAME_DATA = window.YaraRpgData;
const GAME_RULES = GAME_DATA.rules;
const EXPLORATION_RULES = GAME_DATA.exploration;
const ITEM_DATA = GAME_DATA.items;
const MIST_CONTACT_DATA = GAME_DATA.mistContacts;
const SPECIAL_MONSTERS = GAME_DATA.specialMonsters;
const MIST_CONTACT_SYSTEM = window.YaraMistContactSystem;

const EQUIPMENT_BAG_CAPACITY     = GAME_RULES.inventory.equipmentBagCapacity;
const CAMP_COST                  = GAME_RULES.camp.goldCost;
const CAMP_HP_RECOVERY_PERCENT   = GAME_RULES.camp.hpRecoveryPercent;
const CAMP_FOCO_RECOVERY_PERCENT = GAME_RULES.camp.focoRecoveryPercent;
const POTION_HEAL_AMOUNT_HP      = ITEM_DATA.healingPotion.healAmount;
const POTION_HEAL_AMOUNT_FOCO    = ITEM_DATA.healingPotion.healFoco;
const UPGRADE_COST               = GAME_RULES.upgrades.goldCost; // legado (não usado)
const UPGRADE_COST_PER_POINT     = GAME_RULES.upgrades.costPerPoint ?? 1;
// ── Pontos de Habilidade: controle central em js/data/progression-rules.js ──
//    startingSkillPoints = com quantos PH/SP o herói começa (você pediu 3)
//    skillPointsPerLevel = quantos ganha por level up
const STARTING_SKILL_POINTS      = GAME_RULES.progression.startingSkillPoints ?? 3;
const SKILL_POINTS_PER_LEVEL     = GAME_RULES.progression.skillPointsPerLevel ?? 3;
const UPGRADE_CONFIG             = GAME_RULES.upgrades.attributes;
const FURY_PER_DAMAGE            = GAME_RULES.combat.furyPerDamageTaken;
const FURY_PER_DODGE             = GAME_RULES.combat.furyPerDodge;
const FURY_PER_BASIC_ATTACK_DAMAGE = GAME_RULES.combat.furyPerBasicAttackDamage;
const CRITICAL_STUN_BONUS        = GAME_RULES.combat.criticalStunBonus;

// ---------- 3) Estado global ----------
const SAVE_KEY = "yara-rpg-save-v1";
const RPG_LOG_MAX_ENTRIES = 100;

const DEFAULT_CHARACTER = GAME_DATA.characters[0];
let selectedCharacter = DEFAULT_CHARACTER;
let selectedCharacterProgression = selectedCharacter.progression;

const hero = {
    name: DEFAULT_CHARACTER.name,
    ...DEFAULT_CHARACTER.baseStats,
    // Garante que o inicial reflita STARTING_SKILL_POINTS mesmo se baseStats vier cacheado
    skillPoints: STARTING_SKILL_POINTS,
    potions: ITEM_DATA.healingPotion.startingCount,
    maxPotions: ITEM_DATA.healingPotion.startingCapacity,
    evasionBonus: 0,
    parryBonus: 0,
    chestChanceBonus: 0,
    mistPowers: [],
    equipment: createEmptyEquipmentMap(),
    equipmentInventory: [],
};

// Combate
let currentMonster = null;
let inCombat = false;
let combatActionLocked = false;
let combatEncounterId = 0;
let parrySkillUsedThisCombat = false;
let dodgeSkillUsedThisCombat = false;
let enemyTurnCount = 0;
let enemyTelegraphing = false;

// Exploração / campanha
let currentRegion = 0;
let discoveredRegions = [0];
let regionEntryLevels = {};
let explorationCount = 0;
let explorationsSinceStoryEvent = 0;
let explorationsSinceMistContact = GAME_RULES.mistContacts.cooldownExplorations;
let pendingStoryEvent = null;
let pendingMistContact = null;
let pendingChest = false;
let pendingEquipment = null;
let campaignComplete = false;
let gameOver = false;
let finalBossChallengeAccepted = false;

// UI / diálogos
let openUpgradeOptions = null;
let selectedEquipmentDetails = null;
const selectedInventoryItems = new Set();
let equipmentInstanceId = 0;

// Persistência — storyEventSeen (legado, por região) + seenStoryEvents (chave composta)
const storyEventSeen = new Set();
const seenStoryEvents = new Set();

// Áudio
let musicEnabled = false;

// ---------- 4) Fluxo principal ----------
function startAdventure({ character, equipment }) {
    selectedCharacter = character;
    selectedCharacterProgression = character.progression;

    // Reset de campanha
    currentRegion = 0;
    discoveredRegions = [0];
    regionEntryLevels = {};
    inCombat = false;
    currentMonster = null;
    gameOver = false;
    campaignComplete = false;
    finalBossChallengeAccepted = false;
    pendingMistContact = null;
    pendingChest = false;
    pendingEquipment = null;
    pendingStoryEvent = null;
    selectedInventoryItems.clear();
    storyEventSeen.clear();
    seenStoryEvents.clear();
    explorationCount = 0;
    explorationsSinceStoryEvent = 0;
    explorationsSinceMistContact = GAME_RULES.mistContacts.cooldownExplorations;
    combatActionLocked = false;
    combatEncounterId++;
    enemyTurnCount = 0;
    enemyTelegraphing = false;
    parrySkillUsedThisCombat = false;
    dodgeSkillUsedThisCombat = false;
    openUpgradeOptions = null;
    selectedEquipmentDetails = null;

    Object.assign(hero, character.baseStats, {
        name: character.name,
        // Inicial de PH vem do controle central — use STARTING_SKILL_POINTS
        skillPoints: STARTING_SKILL_POINTS,
        potions: ITEM_DATA.healingPotion.startingCount,
        maxPotions: ITEM_DATA.healingPotion.startingCapacity,
        evasionBonus: 0,
        parryBonus: 0,
        chestChanceBonus: 0,
        fury: 0,
        mistPowers: [],
        equipment: createEmptyEquipmentMap(),
        equipmentInventory: [],
    });
    regionEntryLevels[GAME_DATA.regions[0].id] = hero.level;

    Object.entries(character.basicStats).forEach(([stat, amount]) => {
        hero[stat] += amount;
    });
    equipment.forEach((item) => { hero.equipment[item.slot] = item; });

    hero.hp = getEffectiveStat("maxHp");
    hero.foco = getEffectiveStat("maxFoco");

    document.getElementById("rpg-log").replaceChildren();
    window.logMessage(t("openingLog", { hero: hero.name }), "special");

    document.getElementById("game-main").hidden = false;
    document.getElementById("character-setup").hidden = true;

    updateUI();
    showRegionArrival(GAME_DATA.regions[currentRegion]);
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
        hero.hp = getEffectiveStat("maxHp");
        hero.maxFoco += growth.maxFoco;
        hero.foco = getEffectiveStat("maxFoco");
        hero.maxPotions = Math.min(selectedCharacter.limits.maxPotions, hero.maxPotions + growth.maxPotions);
        hero.atk += growth.atk;
        hero.def += growth.def;
        hero.evasion = Math.min(selectedCharacter.limits.maxEvasion, hero.evasion + growth.evasion);
        hero.parry = Math.min(selectedCharacter.limits.maxParry, hero.parry + growth.parry);
        hero.stunChance = Math.min(selectedCharacter.limits.maxStunChance, hero.stunChance + growth.stunChance);
        hero.criticalChance = Math.min(
            selectedCharacter.limits.maxCriticalChance,
            hero.criticalChance + (Number(growth.criticalChance) || 0)
        );

        hero.skillPoints = (Number(hero.skillPoints) || 0) + SKILL_POINTS_PER_LEVEL;

        const portraitAnchor = document.getElementById('hero-portrait-anchor');
        portraitAnchor.classList.remove('level-up-effect');
        void portraitAnchor.offsetWidth;
        portraitAnchor.classList.add('level-up-effect');
        window.setTimeout(() => portraitAnchor.classList.remove('level-up-effect'), 2400);

        playSound("levelUp");
        window.logMessage(t("levelUp", { level: hero.level }), "discovery");
        window.logMessage(t("skillPointsGained", { amount: SKILL_POINTS_PER_LEVEL, total: hero.skillPoints }), "special");
    }
}

// ---------- 5) Bootstrap ----------
window.onload = function () {
    applyLanguage();
    window.YaraRpgCharacterSetup.initialize({
        translate: t,
        describeEquipment: getItemBonusText,
        onStart: startAdventure,
    });
    showContinueOption();
    document.getElementById("continue-adventure-button").addEventListener("click", () => loadSavedGame());
};

// ---------- 6) Listeners globais ----------
document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("[data-upgrade-control]")) return;
    closeUpgradeOptions();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeUpgradeOptions();
});

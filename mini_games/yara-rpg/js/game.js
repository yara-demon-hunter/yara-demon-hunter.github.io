let gameLanguage = new URLSearchParams(window.location.search).get("lang");
if (gameLanguage !== "en" && gameLanguage !== "pt") {
    gameLanguage = document.documentElement.lang.startsWith("en") ? "en" : "pt";
}

const translations = {
    pt: {
        documentTitle: "Yara: A Regra do Sino - Mini RPG",
        gameNav: "Navegação do jogo",
        languageLabel: "Idioma do jogo",
        musicPlay: "Ativar música",
        musicPause: "Pausar música",
        backToSite: "Voltar ao site",
        gameLabel: "Mini RPG · Floresta Sombria",
        title: "YARA: A REGRA DO SINO",
        subtitle: "Crônicas de Sobrevivência na Floresta Sombria",
        level: "Nível",
        gold: "Ouro:",
        experience: "XP:",
        focus: "Foco (Estamina)",
        fury: "Fúria",
        attack: "Ataque",
        defense: "Defesa",
        attributes: "Atributos do personagem",
        stun: "Stun",
        hp: "HP",
        attackShort: "ATQ",
        defenseShort: "DEF",
        parryShort: "PAR",
        evasionShort: "ESQ",
        parry: "Aparo",
        evasion: "Esquiva",
        journey: "Jornada",
        discoveryChance: "Chance de descobrir a próxima área: {chance}%",
        journeyComplete: "Todas as áreas foram descobertas.",
        potions: "Poções de Cura",
        available: "disponíveis",
        drink: "Beber",
        danger: "Perigo na Névoa",
        explorationIntro: "🌲 O sino tocou tarde demais. A névoa esconde o espírito do rio, segredos sombrios e feras famintas. O que você fará?",
        openingLog: "[Início] Zeph avança sozinho pela Floresta Sombria. Mantenha sua arma em punho.",
        explore: "Explorar a Trilha na Névoa",
        camp: "Acampar e Recuperar Fôlego",
        campCost: "({cost} Ouro)",
        quickAttack: "Ataque Rápido",
        heavyAttack: "Estocada Pesada",
        criticalAttack: "Golpe Crítico",
        criticalRequirement: "100 Fúria",
        focusCost: "({cost} Foco)",
        defend: "Postura Firme",
        parryBonus: "+{bonus}% ({cost} Foco)",
        dodge: "Preparar Esquiva",
        dodgeBonus: "+{bonus}% ({cost} Foco)",
        restart: "Reiniciar jornada",
        run: "Fugir na Névoa",
        footer: "Yara Demon Hunter: A Vingança • Mini RPG Interativo de Navegador",
        injured: "Você está ferido demais! Descanse no acampamento.",
        noGold: "Você precisa de {cost} de ouro para descansar no acampamento.",
        goldFound: "Você vasculhou as margens e encontrou <span class=\"text-amber-300\">{amount} de ouro</span> esquecido na lama!",
        potionFound: "🧪 Você encontrou uma poção de cura! Estoque: <span class=\"text-emerald-300\">{potions}/{capacity}</span>.",
        safeTrail: "✨ Você encontrou um rastro seguro e recuperou <span class=\"text-emerald-300\">{amount_hp} de HP and {amount_foco} de fôlego</span>.",
        denseMist: "A névoa densa dificulta a visão. Apenas o som do vento e das risadas ecoam ao longe.",
        monsterAppears: "⚠ Um perigo surgiu na escuridão: <span class=\"text-red-400 font-bold\">{monster}</span> bloqueia o caminho!",
        quickDamage: "Você desferiu um <span class=\"text-emerald-400 font-bold\">Ataque Rápido</span> causando {damage} de dano e ganhou {fury} de Fúria.",
        noFocus: "Você está sem foco para uma Estocada Pesada! Recupere-se.",
        heavyDamage: "🗡️ Você executou uma <span class=\"text-amber-400 font-bold\">Estocada Pesada</span> com o machado causando {damage} de dano!",
        criticalDamage: "🗡️ Golpe Crítico! Zeph causou {damage} de dano!",
        stunLanded: "✨ O inimigo foi atordoado e perdeu o contra-ataque!",
        defendMessage: "⚔️ A chance de aparo aumentou em {amount}% e permanece até o fim da luta!",
        noParryFocus: "Você precisa de 10 de Foco para preparar um aparo.",
        parryMaxed: "A chance de aparo já está no limite de 65% nesta luta.",
        heroParries: "⚔️ Zeph aparou o golpe! O dano caiu pela metade: {damage} de dano.",
        monsterParries: "⚔️ {monster} aparou seu golpe! O dano causado caiu pela metade: {damage}.",
        monsterDamage: "O {monster} contra-atacou causando <span class=\"text-red-400 font-bold\">{damage} de dano</span>!",
        noPotions: "Você não tem poções restantes!",
        hpFull: "Seu HP já está no máximo!",
        potionHeal: "🧪 Você bebeu uma poção e recuperou <span class=\"text-emerald-400\">{amount_hp} HP and {amount_foco} Foco</span>.",
        potionOpening: "O monstro aproveitou o seu momento de distração!",
        alreadyRested: "Você já está com HP e Foco completos.",
        rested: "⛺ Você gastou {cost} de ouro no acampamento e recuperou {hp} HP e {focus} de Foco.",
        escaped: "💨 Você conseguiu escapar correndo pela névoa densa!",
        escapeFailed: "❌ A tentativa de fuga falhou! O {monster} cortou seu caminho.",
        victory: "🎉 Vitória! Você derrotou o <span class=\"text-amber-300 font-bold\">{monster}</span>!",
        rewards: "Recompensas: <span class=\"text-purple-300\">+{xp} XP</span> e <span class=\"text-amber-300\">+{gold} de Ouro</span>",
        defeat: "💀 Zeph caiu na Floresta Sombria...",
        defeatHelp: "A jornada de Zeph terminou na Floresta Sombria.",
        gameOverTitle: "Fim da jornada",
        levelUp: "⭐ <span class=\"text-amber-400 font-bold uppercase\">Subiu de Nível!</span> Zeph alcançou o Nível {level}! Ataque, defesa, esquiva, aparo e stun aprimorados!",
        monsterDodges: "💨 O {monster} desviou do seu golpe!",
        heroDodges: "💨 Zeph desviou do ataque do {monster} e ganhou {amount} de Fúria!",
        dodgeMessage: "💨 O bônus de esquiva aumentou em {amount}% e permanece até o fim da luta!",
        noDodgeFocus: "Você precisa de 15 de Foco para preparar uma esquiva.",
        evasionMaxed: "A chance de esquiva já está no limite de 65% nesta luta.",
        upgradeAria: "Melhorar {skill} por {cost} de ouro",
        hpUpgradeName: "HP máximo",
        staminaUpgradeName: "estamina máxima",
        upgradeChoicesLabel: "Opções de melhoria",
        upgradeQuantityAria: "Melhorar {skill} {amount} vezes",
        upgradeMax: "Máx",
        upgradeSuccess: "✨ {skill}: +{amount}{unit} ({quantity}x). Ouro gasto: {cost}.",
        upgradeRecovery: " Recuperou também +{amount} {stat}.",
        regionArrival: "✨ Nova área descoberta: <span class=\"text-amber-300 font-bold\">{region}</span>.",
    },
    en: {
        documentTitle: "Yara: The Bell's Rule - Mini RPG",
        gameNav: "Game navigation",
        languageLabel: "Game language",
        musicPlay: "Play music",
        musicPause: "Pause music",
        backToSite: "Back to website",
        gameLabel: "Mini RPG · Dark Forest",
        title: "YARA: THE BELL'S RULE",
        subtitle: "Survival Tales from the Dark Forest",
        level: "Level",
        gold: "Gold:",
        experience: "XP:",
        focus: "Focus (Stamina)",
        fury: "Fury",
        attack: "Attack",
        defense: "Defense",
        attributes: "Character attributes",
        stun: "Stun",
        hp: "HP",
        attackShort: "ATK",
        defenseShort: "DEF",
        parryShort: "PAR",
        evasionShort: "EVA",
        parry: "Parry",
        evasion: "Evasion",
        journey: "Journey",
        discoveryChance: "Chance to discover the next area: {chance}%",
        journeyComplete: "All areas have been discovered.",
        potions: "Healing Potions",
        available: "available",
        drink: "Drink",
        danger: "Danger in the Mist",
        explorationIntro: "🌲 The bell rang too late. The mist hides the river spirit, dark secrets, and hungry beasts. What will you do?",
        openingLog: "[Start] Zeph ventures alone into the Dark Forest. Keep your weapon ready.",
        explore: "Explore the Misty Trail",
        camp: "Rest and Recover",
        campCost: "({cost} Gold)",
        quickAttack: "Quick Attack",
        heavyAttack: "Heavy Strike",
        criticalAttack: "Critical Strike",
        criticalRequirement: "100 Fury",
        focusCost: "({cost} Focus)",
        defend: "Brace for Impact",
        parryBonus: "+{bonus}% ({cost} Focus)",
        dodge: "Prepare to Dodge",
        dodgeBonus: "+{bonus}% ({cost} Focus)",
        restart: "Restart journey",
        run: "Flee into the Mist",
        footer: "Yara Demon Hunter: The Vengeance • Browser Mini RPG",
        injured: "You are too badly hurt. Rest at camp.",
        noGold: "You need {cost} gold to rest at camp.",
        goldFound: "You searched the riverbank and found <span class=\"text-amber-300\">{amount} gold</span> buried in the mud!",
        potionFound: "🧪 You found a healing potion! Inventory: <span class=\"text-emerald-300\">{potions}/{capacity}</span>.",
        safeTrail: "✨ You found a safe trail and recovered <span class=\"text-emerald-300\">{amount_hp} HP and {amount_foco} Focus</span>.",
        denseMist: "The dense mist makes it hard to see. Only the wind and distant laughter answer.",
        monsterAppears: "⚠ A threat emerges from the dark: <span class=\"text-red-400 font-bold\">{monster}</span> blocks your path!",
        quickDamage: "You land a <span class=\"text-emerald-400 font-bold\">Quick Attack</span> for {damage} damage and gain {fury} Fury.",
        noFocus: "You do not have enough Focus for a Heavy Strike. Recover first.",
        heavyDamage: "🗡️ Your <span class=\"text-amber-400 font-bold\">Heavy Strike</span> deals {damage} damage!",
        criticalDamage: "🗡️ Critical Strike! Zeph deals {damage} damage!",
        stunLanded: "✨ The enemy is stunned and loses its counterattack!",
        defendMessage: "⚔️ Parry chance increased by {amount}% and will last until the fight ends!",
        noParryFocus: "You need 10 Focus to prepare a parry.",
        parryMaxed: "Parry chance is already at the 65% limit for this fight.",
        heroParries: "⚔️ Zeph parried the blow! Damage was halved to {damage}.",
        monsterParries: "⚔️ {monster} parried your attack! Damage dealt was halved to {damage}.",
        monsterDamage: "The {monster} counterattacks for <span class=\"text-red-400 font-bold\">{damage} damage</span>!",
        noPotions: "You have no potions left!",
        hpFull: "Your HP is already full!",
        potionHeal: "🧪 You drink a potion and recover <span class=\"text-emerald-400\">{amount} HP and {amount_foco} Focus</span>.",
        potionOpening: "The monster takes advantage of your distraction!",
        alreadyRested: "Your HP and Focus are already full.",
        rested: "⛺ You spent {cost} gold at camp and recovered {hp} HP and {focus} Focus.",
        escaped: "💨 You escape into the thick mist!",
        escapeFailed: "❌ You fail to escape! The {monster} cuts off your path.",
        victory: "🎉 Victory! You defeated <span class=\"text-amber-300 font-bold\">{monster}</span>!",
        rewards: "Rewards: <span class=\"text-purple-300\">+{xp} XP</span> and <span class=\"text-amber-300\">+{gold} Gold</span>",
        defeat: "💀 Zeph falls in the Dark Forest...",
        defeatHelp: "Zeph's journey ends in the Dark Forest.",
        gameOverTitle: "Journey's End",
        levelUp: "⭐ <span class=\"text-amber-400 font-bold uppercase\">Level Up!</span> Zeph reached Level {level}! Attack, defense, evasion, parry, and stun improved!",
        monsterDodges: "💨 The {monster} dodges your attack!",
        heroDodges: "💨 Zeph dodges the {monster}'s attack and gains {amount} Fury!",
        dodgeMessage: "💨 Evasion increased by {amount}% and will last until the fight ends!",
        noDodgeFocus: "You need 15 Focus to prepare a dodge.",
        evasionMaxed: "Evasion is already at the 65% limit for this fight.",
        upgradeAria: "Upgrade {skill} for {cost} gold",
        hpUpgradeName: "maximum HP",
        staminaUpgradeName: "maximum stamina",
        upgradeChoicesLabel: "Upgrade options",
        upgradeQuantityAria: "Upgrade {skill} {amount} times",
        upgradeMax: "Max",
        upgradeSuccess: "✨ {skill}: +{amount}{unit} ({quantity}x). Gold spent: {cost}.",
        upgradeRecovery: " Also recovered +{amount} {stat}.",
        regionArrival: "✨ New area discovered: <span class=\"text-amber-300 font-bold\">{region}</span>.",
    }
};

function t(key, values = {}) {
    return translations[gameLanguage][key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
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

function startGameMusic() {
    gameMusic.play()
        .then(() => updateMusicButton(true))
        .catch(() => updateMusicButton(false));
}

musicToggle.addEventListener('click', () => {
    if (gameMusic.paused) startGameMusic();
    else gameMusic.pause();
});

gameMusic.addEventListener('play', () => updateMusicButton(true));
gameMusic.addEventListener('pause', () => updateMusicButton(false));
gameMusic.addEventListener('error', () => updateMusicButton(false));

function startMusicAfterInteraction(event) {
    if (event.target instanceof Element && event.target.closest('#music-toggle')) return;
    startGameMusic();
    document.removeEventListener('pointerdown', startMusicAfterInteraction);
    document.removeEventListener('keydown', startMusicAfterInteraction);
}

document.addEventListener('pointerdown', startMusicAfterInteraction);
document.addEventListener('keydown', startMusicAfterInteraction);

const GAME_DATA = window.YaraRpgData;
const GAME_RULES = GAME_DATA.rules;
const ITEM_DATA = GAME_DATA.items;
const hero = {
    name: GAME_DATA.hero.name,
    ...GAME_DATA.hero.initial,
    potions: ITEM_DATA.healingPotion.startingCount,
    maxPotions: ITEM_DATA.healingPotion.startingCapacity,
    evasionBonus: 0,
    parryBonus: 0
};

const CAMP_COST = GAME_RULES.camp.goldCost;
const CAMP_HP_RECOVERY = GAME_RULES.camp.hpRecovery;
const CAMP_FOCO_RECOVERY = GAME_RULES.camp.focoRecovery;
const POTION_HEAL_AMOUNT_HP = ITEM_DATA.healingPotion.healAmount;
const POTION_HEAL_AMOUNT_FOCO = ITEM_DATA.healingPotion.healFoco;
const UPGRADE_COST = GAME_RULES.upgrades.goldCost;
const DODGE_COST = GAME_RULES.combat.dodgeCost;
const DODGE_BONUS = GAME_RULES.combat.dodgeBonus;
const MAX_EVASION = GAME_RULES.combat.maxEvasion;
const PARRY_COST = GAME_RULES.combat.parryCost;
const PARRY_BONUS = GAME_RULES.combat.parryBonus;
const MAX_PARRY = GAME_RULES.combat.maxParry;
const FURY_PER_DAMAGE = GAME_RULES.combat.furyPerDamageTaken;
const FURY_PER_DODGE = GAME_RULES.combat.furyPerDodge;
const CRITICAL_DAMAGE_MULTIPLIER = GAME_RULES.combat.criticalDamageMultiplier;
const CRITICAL_STUN_BONUS = GAME_RULES.combat.criticalStunBonus;
const FURY_PER_BASIC_ATTACK_DAMAGE = GAME_RULES.combat.furyPerBasicAttackDamage;
const UPGRADE_CONFIG = GAME_RULES.upgrades.attributes;

let currentMonster = null;
let inCombat = false;
let currentRegion = 0;
let discoveredRegions = [0];
let gameOver = false;
let openUpgradeOptions = null;

document.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-upgrade-control]')) return;
    closeUpgradeOptions();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeUpgradeOptions();
});

function updateUI() {
    if (inCombat || gameOver) openUpgradeOptions = null;

    document.getElementById('hero-name').innerText = hero.name;
    document.getElementById('hero-level').innerText = hero.level;
    document.getElementById('hero-gold').innerText = hero.gold;
    document.getElementById('hero-xp').innerText = hero.xp;
    document.getElementById('hero-xp-max').innerText = hero.maxXp;
    document.getElementById('hero-hp').innerText = hero.hp;
    document.getElementById('hero-hp-max').innerText = hero.maxHp;
    document.getElementById('hero-foco').innerText = hero.foco;
    document.getElementById('hero-foco-max').innerText = hero.maxFoco;
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
    document.getElementById('hero-atk').innerText = hero.atk;
    document.getElementById('hero-def').innerText = hero.def;
    const evasionTotal = Math.min(MAX_EVASION, hero.evasion + hero.evasionBonus);
    const evasionDisplay = document.getElementById('hero-evasion');
    const evasionBonusDisplay = document.getElementById('hero-evasion-bonus');
    document.getElementById('hero-evasion-base').innerText = hero.evasion + '%';
    evasionBonusDisplay.innerText = ` +${hero.evasionBonus}% = ${evasionTotal}%`;
    evasionBonusDisplay.classList.toggle('hidden', hero.evasionBonus === 0);
    evasionDisplay.classList.toggle('text-sm', hero.evasionBonus === 0);
    evasionDisplay.classList.toggle('text-[10px]', hero.evasionBonus > 0);
    evasionDisplay.setAttribute('aria-label', hero.evasionBonus
        ? `${hero.evasion}% + ${hero.evasionBonus}% = ${evasionTotal}%`
        : `${hero.evasion}%`);
    const parryTotal = Math.min(MAX_PARRY, hero.parry + hero.parryBonus);
    const parryDisplay = document.getElementById('hero-parry');
    const parryBonusDisplay = document.getElementById('hero-parry-bonus');
    document.getElementById('hero-parry-base').innerText = hero.parry + '%';
    parryBonusDisplay.innerText = ` +${hero.parryBonus}% = ${parryTotal}%`;
    parryBonusDisplay.classList.toggle('hidden', hero.parryBonus === 0);
    parryDisplay.setAttribute('aria-label', hero.parryBonus
        ? `${hero.parry}% + ${hero.parryBonus}% = ${parryTotal}%`
        : `${hero.parry}%`);
    const stunBonus = hero.fury >= hero.maxFury ? CRITICAL_STUN_BONUS : 0;
    const stunChanceTotal = Math.min(GAME_RULES.probabilityScale, hero.stunChance + stunBonus);
    const stunBonusDisplay = document.getElementById('hero-stun-bonus');
    const stunDisplay = document.getElementById('hero-stun');
    document.getElementById('hero-stun-base').innerText = hero.stunChance + '%';
    stunBonusDisplay.innerText = ` +${stunBonus}% = ${stunChanceTotal}%`;
    stunBonusDisplay.classList.toggle('hidden', stunBonus === 0);
    stunDisplay.setAttribute('aria-label', stunBonus
        ? `${hero.stunChance}% + ${stunBonus}% = ${stunChanceTotal}%`
        : `${hero.stunChance}%`);
    document.getElementById('hero-potions').innerText = hero.potions;
    document.getElementById('hero-potions-max').innerText = hero.maxPotions;
    const currentRegionData = GAME_DATA.regions[currentRegion];
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
        (hero.hp / hero.maxHp) * GAME_RULES.probabilityScale
    ));
    document.getElementById('hero-hp-bar').style.width = hpPercent + '%';

    const focoPercent = Math.max(0, Math.min(
        GAME_RULES.probabilityScale,
        (hero.foco / hero.maxFoco) * GAME_RULES.probabilityScale
    ));
    document.getElementById('hero-foco-bar').style.width = focoPercent + '%';

    const exploreControls = document.getElementById('controls-explore');
    const combatControls = document.getElementById('controls-combat');
    const encounterCard = document.getElementById('encounter-card');
    const explorationBanner = document.getElementById('exploration-banner');
    const campButton = document.getElementById('camp-button');
    const potionButton = document.getElementById('potion-button');
    document.querySelector('[data-i18n="campCost"]').innerText = t('campCost', { cost: CAMP_COST });
    document.querySelector('[data-i18n="focusCost"]').innerText = t('focusCost', {
        cost: GAME_RULES.combat.heavyAttack.focoCost
    });
    document.querySelector('[data-i18n="parryBonus"]').innerText = t('parryBonus', {
        bonus: PARRY_BONUS,
        cost: PARRY_COST
    });
    document.querySelector('[data-i18n="dodgeBonus"]').innerText = t('dodgeBonus', {
        bonus: DODGE_BONUS,
        cost: DODGE_COST
    });
    document.querySelectorAll('[data-upgrade]').forEach((button) => {
        const upgrade = button.dataset.upgrade;
        const skill = t(UPGRADE_CONFIG[upgrade].nameKey);
        const maximum = getMaxUpgradeQuantity(upgrade);
        const disabled = inCombat || gameOver || maximum < 1 || isUpgradeMaxed(upgrade);
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
    document.getElementById('dodge-button').disabled = evasionTotal >= MAX_EVASION;
    document.getElementById('parry-button').disabled = parryTotal >= MAX_PARRY || hero.foco < PARRY_COST;
    const restartButton = document.getElementById('restart-button');
    campButton.disabled = inCombat || gameOver || hero.gold < CAMP_COST || (hero.hp >= hero.maxHp && hero.foco >= hero.maxFoco);
    potionButton.disabled = gameOver;

    if (gameOver) {
        exploreControls.classList.add('hidden');
        combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden');
        explorationBanner.classList.remove('hidden');
        document.getElementById('exploration-title').innerText = t('gameOverTitle');
        document.getElementById('exploration-description').innerText = t('defeatHelp');
        restartButton.classList.remove('hidden');
    } else if (inCombat) {
        exploreControls.classList.add('hidden');
        combatControls.classList.remove('hidden');
        encounterCard.classList.remove('hidden');
        explorationBanner.classList.add('hidden');
        restartButton.classList.add('hidden');
    } else {
        exploreControls.classList.remove('hidden');
        combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden');
        explorationBanner.classList.remove('hidden');
        restartButton.classList.add('hidden');
    }
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
    div.innerHTML = `[${time}] ${message}`;
    
    logBox.appendChild(div);
    logBox.scrollTop = logBox.scrollHeight;
}

function exploreForest() {
    if (inCombat || gameOver) return;
    if (hero.hp <= 0) {
            logMessage(t("injured"), "combat-monster");
        return;
    }

    if (tryDiscoverRegion()) {
        updateUI();
        return;
    }

    const encounterRules = GAME_RULES.exploration.encounters;
    const roll = Math.floor(Math.random() * GAME_RULES.probabilityScale) + 1;

    if (roll <= encounterRules.monsterThreshold) {
        spawnMonster();
    } else if (roll <= encounterRules.goldThreshold) {
        const goldFound = Math.floor(Math.random() * encounterRules.foundGoldRange) + encounterRules.foundGoldMinimum;
        hero.gold += goldFound;
        logMessage(t("goldFound", { amount: goldFound }), "loot");
        updateUI();
    } else if (roll <= encounterRules.safeTrailThreshold) {
        const healAmountHp = encounterRules.safeTrailRecoveryHp;
        const healAmountFoco = encounterRules.safeTrailRecoveryFoco;

        hero.hp = Math.min(hero.maxHp, hero.hp + healAmountHp);
        hero.foco = Math.min(hero.maxFoco, hero.foco + healAmountFoco);
        logMessage(t("safeTrail", { amount_hp: healAmountHp, amount_foco: healAmountFoco }), "special");
        updateUI();
    } else if (hero.potions < hero.maxPotions) {
        hero.potions++;
        logMessage(t("potionFound", { potions: hero.potions, capacity: hero.maxPotions }), "loot");
        updateUI();
    } else {
        logMessage(t("denseMist"));
    }
}

function getDiscoveryChance() {
    const explorationRules = GAME_RULES.exploration;
    if (currentRegion >= GAME_DATA.regions.length - 1) return 0;
    return Math.min(
        explorationRules.maxDiscoveryChance,
        explorationRules.discoveryBaseChance
            + (hero.level - 1) * explorationRules.discoveryChancePerLevel
            + currentRegion * explorationRules.discoveryChancePerRegion
    );
}

function tryDiscoverRegion() {
    if (Math.random() * GAME_RULES.probabilityScale >= getDiscoveryChance()) return false;

    currentRegion++;
    discoveredRegions.push(currentRegion);
    logMessage(t("regionArrival", { region: GAME_DATA.regions[currentRegion].title[gameLanguage] }), "discovery");
    return true;
}

function spawnMonster() {
    const regionId = GAME_DATA.regions[currentRegion].id;
    const regionMonsters = GAME_DATA.monsters.byRegion[regionId];
    const template = regionMonsters[Math.floor(Math.random() * regionMonsters.length)];
    const variation = GAME_DATA.monsters.variation.minimum
        + Math.random() * (GAME_DATA.monsters.variation.maximum - GAME_DATA.monsters.variation.minimum);
    const vary = (value) => Math.max(GAME_DATA.monsters.minimumRolledAttribute, Math.round(value * variation));
    const monsterHp = vary(template.hp);

    currentMonster = {
        name: template.name[gameLanguage],
        icon: template.icon,
        hp: monsterHp,
        maxHp: monsterHp,
        atk: vary(template.atk),
        def: vary(template.def),
        parry: vary(template.parry),
        evasion: vary(template.evasion),
        xpReward: vary(template.xpReward),
        goldReward: vary(template.goldReward)
    };

    inCombat = true;
    hero.parryBonus = 0;

    document.getElementById('monster-name').innerText = currentMonster.name;
    document.getElementById('monster-hp').innerText = currentMonster.hp;
    document.getElementById('monster-hp-max').innerText = currentMonster.maxHp;
    document.getElementById('monster-icon').innerText = currentMonster.icon;
    document.getElementById('monster-hp-bar').style.width = '100%';
    document.getElementById('monster-atk').innerText = currentMonster.atk;
    document.getElementById('monster-def').innerText = currentMonster.def;
    document.getElementById('monster-parry').innerText = currentMonster.parry + '%';
    document.getElementById('monster-evasion').innerText = currentMonster.evasion + '%';

    logMessage(t("monsterAppears", { monster: currentMonster.name }), "combat-monster");
    updateUI();
}

function applyMonsterParry(damage) {
    if (Math.random() * GAME_RULES.probabilityScale >= currentMonster.parry) return damage;

    const reducedDamage = Math.max(
        GAME_RULES.combat.minimumDamageAfterParry,
        Math.ceil(damage * GAME_RULES.combat.monsterParryDamageMultiplier)
    );
    logMessage(t('monsterParries', { monster: currentMonster.name, damage: reducedDamage }), 'special');
    return reducedDamage;
}

function resolveHeroAttack(damage, messageKey, criticalStunBonus = 0, furyMultiplier = 0) {
    damage = applyMonsterParry(damage);
    const damageDealt = Math.min(currentMonster.hp, damage);
    currentMonster.hp -= damageDealt;
    const furyGained = Math.min(hero.maxFury - hero.fury, Math.floor(damageDealt * furyMultiplier));
    hero.fury += furyGained;
    logMessage(t(messageKey, { damage: damageDealt, fury: furyGained }), "combat-hero");

    const stunChance = Math.min(GAME_RULES.probabilityScale, hero.stunChance + criticalStunBonus);
    const stunned = currentMonster.hp > 0 && Math.random() * GAME_RULES.probabilityScale < stunChance;
    if (stunned) logMessage(t("stunLanded"), "special");
    checkCombatProgress(stunned);
}

// NOVO GOLPE: Ataque Rápido (Mais preciso, dano moderado)
function combatQuickAttack() {
    if (!inCombat || !currentMonster) return;
    if (hero.fury >= hero.maxFury) {
        combatCriticalAttack();
        return;
    }
    playSound('basicAttack');

    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const attackRules = GAME_RULES.combat.quickAttack;
    const damage = Math.max(
        attackRules.minimumDamage,
        Math.floor(hero.atk * attackRules.attackMultiplier)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    resolveHeroAttack(damage, "quickDamage", 0, FURY_PER_BASIC_ATTACK_DAMAGE);
}

// NOVO GOLPE: Estocada Pesada (Gasta Foco, dano alto)
function combatHeavyAttack() {
    if (!inCombat || !currentMonster) return;
    const attackRules = GAME_RULES.combat.heavyAttack;
    if (hero.foco < attackRules.focoCost) {
        logMessage(t("noFocus"));
        return;
    }
    hero.foco -= attackRules.focoCost;
    playSound('specialAttack');

    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const damage = Math.max(
        attackRules.minimumDamage,
        Math.floor(hero.atk * attackRules.attackMultiplier)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    resolveHeroAttack(damage, "heavyDamage");
}

function combatCriticalAttack() {
    if (!inCombat || !currentMonster || hero.fury < hero.maxFury) return;

    hero.fury = 0;
    playSound('specialAttack');
    updateUI();
    if (Math.random() * GAME_RULES.probabilityScale < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const attackRules = GAME_RULES.combat.criticalAttack;
    const damage = Math.max(
        attackRules.minimumDamage,
        Math.floor(hero.atk * CRITICAL_DAMAGE_MULTIPLIER)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    resolveHeroAttack(damage, "criticalDamage", CRITICAL_STUN_BONUS);
}

// NOVO GOLPE: Postura Firme (Aumenta defesa e recupera foco)
function combatDefend() {
    if (!inCombat || !currentMonster) return;
    const bonusGained = Math.min(PARRY_BONUS, MAX_PARRY - hero.parry - hero.parryBonus);
    if (bonusGained <= 0) {
        logMessage(t('parryMaxed'));
        return;
    }
    if (hero.foco < PARRY_COST) {
        logMessage(t('noParryFocus'));
        return;
    }
    hero.foco -= PARRY_COST;
    hero.parryBonus += bonusGained;
    logMessage(t('defendMessage', { amount: bonusGained }), 'special');

    setTimeout(() => {
        if (inCombat && currentMonster) monsterAttackTurn();
    }, GAME_RULES.combat.actionDelayMs);
    updateUI();
}

function combatDodge() {
    if (!inCombat || !currentMonster) return;
    const bonusGained = Math.min(DODGE_BONUS, MAX_EVASION - hero.evasion - hero.evasionBonus);
    if (bonusGained <= 0) {
        logMessage(t("evasionMaxed"));
        return;
    }
    if (hero.foco < DODGE_COST) {
        logMessage(t("noDodgeFocus"));
        return;
    }
    hero.foco -= DODGE_COST;
    hero.defending = false;
    hero.evasionBonus += bonusGained;
    logMessage(t("dodgeMessage", { amount: bonusGained }), "special");

    setTimeout(() => {
        if (inCombat && currentMonster) monsterAttackTurn();
    }, GAME_RULES.combat.actionDelayMs);
    updateUI();
}

function checkCombatProgress(monsterStunned = false) {
    updateMonsterUI();
    if (currentMonster.hp <= 0) {
        endCombatVictory();
        return;
    }
    if (monsterStunned) return;
    setTimeout(() => {
        if (inCombat && currentMonster) monsterAttackTurn();
    }, GAME_RULES.combat.responseDelayMs);
}

function monsterAttackTurn() {
    if (!inCombat || !currentMonster) return;

    const evasionChance = Math.min(MAX_EVASION, hero.evasion + hero.evasionBonus);
    const evaded = Math.random() * GAME_RULES.probabilityScale < evasionChance;
    if (evaded) {
        playSound('dodge');
        hero.defending = false;
        const furyGained = Math.min(FURY_PER_DODGE, hero.maxFury - hero.fury);
        hero.fury += furyGained;
        logMessage(t("heroDodges", { monster: currentMonster.name, amount: furyGained }), "special");
        updateUI();
        return;
    }

    const attackRules = GAME_RULES.combat.monsterAttack;
    let monsterDamage = Math.max(
        attackRules.minimumDamage,
        currentMonster.atk - hero.def + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    const parryChance = Math.min(MAX_PARRY, hero.parry + hero.parryBonus);
    const parried = Math.random() * GAME_RULES.probabilityScale < parryChance;
    if (parried) {
        playSound('parry');
        monsterDamage = Math.max(
            GAME_RULES.combat.minimumDamageAfterParry,
            Math.ceil(monsterDamage * GAME_RULES.combat.monsterParryDamageMultiplier)
        );
    }

    const damageTaken = Math.min(hero.hp, monsterDamage);
    hero.hp = Math.max(0, hero.hp - damageTaken);
    hero.fury = Math.min(hero.maxFury, hero.fury + damageTaken * FURY_PER_DAMAGE);
    logMessage(parried
        ? t('heroParries', { damage: damageTaken })
        : t("monsterDamage", { monster: currentMonster.name, damage: damageTaken }), parried ? 'special' : 'combat-monster');
    updateUI();

    if (hero.hp <= 0) {
        endCombatDefeat();
    }
}

function isUpgradeMaxed(upgrade) {
    const configuration = UPGRADE_CONFIG[upgrade];
    return configuration?.max !== undefined && hero[configuration.stat] >= configuration.max;
}

function getMaxUpgradeQuantity(upgrade) {
    const configuration = UPGRADE_CONFIG[upgrade];
    if (!configuration || UPGRADE_COST <= 0) return 0;

    const affordableQuantity = Math.floor(hero.gold / UPGRADE_COST);
    if (configuration.max === undefined) return affordableQuantity;

    const remaining = Math.max(0, configuration.max - hero[configuration.stat]);
    return Math.min(affordableQuantity, Math.ceil(remaining / configuration.amount));
}

function closeUpgradeOptions() {
    openUpgradeOptions = null;
    document.querySelectorAll('[data-upgrade-options]').forEach((options) => {
        options.hidden = true;
    });
    document.querySelectorAll('[data-upgrade]').forEach((button) => {
        button.setAttribute('aria-expanded', 'false');
    });
}

function toggleUpgradeOptions(upgrade) {
    const configuration = UPGRADE_CONFIG[upgrade];
    if (!configuration || inCombat || gameOver || getMaxUpgradeQuantity(upgrade) < 1 || isUpgradeMaxed(upgrade)) return;

    openUpgradeOptions = openUpgradeOptions === upgrade ? null : upgrade;
    updateUI();
}

function purchaseUpgrade(upgrade, requestedQuantity) {
    const configuration = UPGRADE_CONFIG[upgrade];
    if (!configuration) return;
    const maxQuantity = getMaxUpgradeQuantity(upgrade);
    const quantity = requestedQuantity === 'max'
        ? maxQuantity
        : Number(requestedQuantity);
    if (
        inCombat
        || gameOver
        || !Number.isInteger(quantity)
        || quantity < 1
        || quantity > maxQuantity
        || isUpgradeMaxed(upgrade)
    ) return;

    const amount = configuration.max === undefined
        ? configuration.amount * quantity
        : Math.min(configuration.amount * quantity, configuration.max - hero[configuration.stat]);
    const totalCost = quantity * UPGRADE_COST;
    const previousCurrentValue = configuration.currentStat
        ? hero[configuration.currentStat]
        : 0;
    hero.gold -= totalCost;
    hero[configuration.stat] = configuration.max === undefined
        ? hero[configuration.stat] + amount
        : Math.min(configuration.max, hero[configuration.stat] + amount);
    if (configuration.currentStat) {
        hero[configuration.currentStat] = Math.min(
            hero[configuration.currentMaxStat],
            hero[configuration.currentStat] + configuration.currentAmount * quantity
        );
    }
    const skill = t(configuration.nameKey);
    const recoveredAmount = configuration.currentStat
        ? hero[configuration.currentStat] - previousCurrentValue
        : 0;
    const recoveryMessage = recoveredAmount > 0
        ? t('upgradeRecovery', {
            amount: recoveredAmount,
            stat: t(configuration.currentStat === 'hp' ? 'hp' : 'focus')
        })
        : '';
    closeUpgradeOptions();
    logMessage(t('upgradeSuccess', {
        skill,
        amount,
        unit: configuration.isPercentage ? '%' : '',
        quantity,
        cost: totalCost
    }) + recoveryMessage, 'special');
    updateUI();
}

function updateMonsterUI() {
    document.getElementById('monster-hp').innerText = currentMonster.hp;
    const hpPercent = Math.max(0, Math.min(
        GAME_RULES.probabilityScale,
        (currentMonster.hp / currentMonster.maxHp) * GAME_RULES.probabilityScale
    ));
    document.getElementById('monster-hp-bar').style.width = hpPercent + '%';
}

function usePotion() {
    if (gameOver) return;
    if (hero.potions <= 0) {
        logMessage(t("noPotions"), "combat-monster");
        return;
    }
    if (hero.hp >= hero.maxHp) {
        logMessage(t("hpFull"));
        return;
    }

    hero.potions--;
    const heal = POTION_HEAL_AMOUNT_HP;
    hero.hp = Math.min(hero.maxHp, hero.hp + heal);
    const foco = POTION_HEAL_AMOUNT_FOCO;
    hero.foco = Math.min(hero.maxFoco, hero.foco + foco);
    logMessage(t("potionHeal", { amount_hp: heal, amount_foco: foco}), "discovery");
    updateUI();

    if (inCombat) {
        logMessage(t("potionOpening"));
        setTimeout(() => {
            if (inCombat && currentMonster) monsterAttackTurn();
        }, GAME_RULES.combat.actionDelayMs);
    }
}

function restAtCamp() {
    if (inCombat || gameOver) return;
    if (hero.gold < CAMP_COST) {
        logMessage(t("noGold", { cost: CAMP_COST }));
        return;
    }
    if (hero.hp >= hero.maxHp && hero.foco >= hero.maxFoco) {
        logMessage(t("alreadyRested"));
        return;
    }
    hero.gold -= CAMP_COST;
    const hpRecovered = Math.min(CAMP_HP_RECOVERY, hero.maxHp - hero.hp);
    const focusRecovered = Math.min(CAMP_FOCO_RECOVERY, hero.maxFoco - hero.foco);
    hero.hp += hpRecovered;
    hero.foco += focusRecovered;
    logMessage(t("rested", { cost: CAMP_COST, hp: hpRecovered, focus: focusRecovered }), "discovery");
    updateUI();
}

function combatRun() {
    if (!inCombat) return;
    const success = Math.random() < GAME_RULES.combat.escapeSuccessChance;
    if (success) {
        logMessage(t("escaped"), "discovery");
        hero.fury = 0;
        hero.evasionBonus = 0;
        hero.parryBonus = 0;
        inCombat = false;
        currentMonster = null;
        updateUI();
    } else {
        logMessage(t("escapeFailed", { monster: currentMonster.name }), "combat-monster");
        monsterAttackTurn();
    }
}

function endCombatVictory() {
    logMessage(t("victory", { monster: currentMonster.name }), "discovery");
    logMessage(t("rewards", { xp: currentMonster.xpReward, gold: currentMonster.goldReward }), "loot");

    hero.gold += currentMonster.goldReward;
    hero.xp += currentMonster.xpReward;
    hero.fury = 0;
    hero.evasionBonus = 0;
    hero.parryBonus = 0;

    inCombat = false;
    currentMonster = null;

    checkLevelUp();
    updateUI();
}

function endCombatDefeat() {
    logMessage(t("defeat"), "combat-monster");
    logMessage(t("defeatHelp"), "special");
    inCombat = false;
    currentMonster = null;
    hero.hp = 0;
    hero.fury = 0;
    hero.evasionBonus = 0;
    hero.parryBonus = 0;
    gameOver = true;
    updateUI();
}

function restartGame() {
    window.location.reload();
}

function checkLevelUp() {
    while (hero.xp >= hero.maxXp) {
        const growth = GAME_DATA.hero.levelUp;
        hero.level++;
        hero.xp -= hero.maxXp;
        hero.maxXp = Math.floor(hero.maxXp * GAME_RULES.progression.xpRequirementMultiplier);
        
        hero.maxHp += growth.maxHp;
        hero.hp = hero.maxHp;
        hero.maxFoco += growth.maxFoco;
        hero.foco = hero.maxFoco;
        hero.maxPotions = Math.min(
            ITEM_DATA.healingPotion.maxCapacity,
            hero.maxPotions + growth.maxPotions
        );
        hero.atk += growth.atk;
        hero.def += growth.def;
        hero.evasion = Math.min(growth.evasionLimit, hero.evasion + growth.evasion);
        hero.parry = Math.min(MAX_PARRY, hero.parry + growth.parry);
        hero.stunChance = Math.min(
            GAME_RULES.probabilityScale,
            hero.stunChance + growth.stunChance
        );

        playSound('levelUp');
        logMessage(t("levelUp", { level: hero.level }), "discovery");
    }
}

document.getElementById('hero-attributes').open = !window.matchMedia('(max-width: 640px)').matches;

window.onload = function() {
    applyLanguage();
    updateUI();
    startGameMusic();
};

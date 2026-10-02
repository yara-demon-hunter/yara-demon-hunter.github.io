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
        campCost: "(50 Ouro)",
        quickAttack: "Ataque Rápido",
        heavyAttack: "Estocada Pesada",
        criticalAttack: "Golpe Crítico",
        criticalRequirement: "100 Fúria",
        focusCost: "(15 Foco)",
        defend: "Postura Firme",
        parryBonus: "+5% (10 Foco)",
        dodge: "Preparar Esquiva",
        dodgeBonus: "+15% (15 Foco)",
        restart: "Reiniciar jornada",
        run: "Fugir na Névoa",
        footer: "Yara Demon Hunter: A Vingança • Mini RPG Interativo de Navegador",
        injured: "Você está ferido demais! Descanse no acampamento.",
        noGold: "Você precisa de 50 de ouro para descansar no acampamento.",
        goldFound: "Você vasculhou as margens e encontrou <span class=\"text-amber-300\">{amount} de ouro</span> esquecido na lama!",
        potionFound: "🧪 Você encontrou uma poção de cura! Estoque: <span class=\"text-emerald-300\">{potions}/{capacity}</span>.",
        safeTrail: "✨ Você encontrou um rastro seguro e recuperou <span class=\"text-emerald-300\">{amount} HP</span> de fôlego.",
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
        potionHeal: "🧪 Você bebeu uma poção e recuperou <span class=\"text-emerald-400\">{amount} HP</span>.",
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
        upgradeSuccess: "✨ {skill} melhorado por {cost} de ouro!",
        upgradeTitle: "Aprimorar habilidade",
        upgradeQuestion: "Deseja confirmar esta melhoria?",
        upgradeIncrease: "{skill} +{amount}{unit}",
        upgradeHpBenefit: "HP máximo +{amount}; recupera {currentAmount} HP agora.",
        upgradeStaminaBenefit: "Estamina máxima +{amount}; recupera {currentAmount} de Foco agora.",
        upgradeCostLabel: "Custo: {cost} ouro",
        upgradeBalanceLabel: "Ouro após a compra: {amount}",
        upgradeCancel: "Cancelar",
        upgradeConfirm: "Confirmar compra",
        regionArrival: "✨ Nova área descoberta: <span class=\"text-amber-300 font-bold\">{region}</span>.",
        regions: [
            { title: "Floresta Sombria", description: "🌲 O sino tocou tarde demais. A névoa esconde feras famintas e segredos antigos." },
            { title: "O Portal das Cinzas", description: "🌀 Um portal pulsa entre as árvores. Do outro lado, algo respira junto com a névoa." },
            { title: "Vilarejo em Ruínas", description: "🔥 O vilarejo foi invadido. Portas quebradas e marcas de batalha anunciam que os invasores ainda estão por perto." },
            { title: "Castelo de Gudran", description: "🏰 As muralhas de Gudran guardam criaturas antigas e cavaleiros que não aceitam intrusos." }
        ]
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
        campCost: "(50 Gold)",
        quickAttack: "Quick Attack",
        heavyAttack: "Heavy Strike",
        criticalAttack: "Critical Strike",
        criticalRequirement: "100 Fury",
        focusCost: "(15 Focus)",
        defend: "Brace for Impact",
        parryBonus: "+5% (10 Focus)",
        dodge: "Prepare to Dodge",
        dodgeBonus: "+15% (15 Focus)",
        restart: "Restart journey",
        run: "Flee into the Mist",
        footer: "Yara Demon Hunter: The Vengeance • Browser Mini RPG",
        injured: "You are too badly hurt. Rest at camp.",
        noGold: "You need 50 gold to rest at camp.",
        goldFound: "You searched the riverbank and found <span class=\"text-amber-300\">{amount} gold</span> buried in the mud!",
        potionFound: "🧪 You found a healing potion! Inventory: <span class=\"text-emerald-300\">{potions}/{capacity}</span>.",
        safeTrail: "✨ You found a safe trail and recovered <span class=\"text-emerald-300\">{amount} HP</span>.",
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
        potionHeal: "🧪 You drink a potion and recover <span class=\"text-emerald-400\">{amount} HP</span>.",
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
        upgradeSuccess: "✨ {skill} upgraded for {cost} gold!",
        upgradeTitle: "Skill upgrade",
        upgradeQuestion: "Confirm this improvement?",
        upgradeIncrease: "{skill} +{amount}{unit}",
        upgradeHpBenefit: "Maximum HP +{amount}; recover {currentAmount} HP now.",
        upgradeStaminaBenefit: "Maximum stamina +{amount}; recover {currentAmount} Focus now.",
        upgradeCostLabel: "Cost: {cost} gold",
        upgradeBalanceLabel: "Gold after purchase: {amount}",
        upgradeCancel: "Cancel",
        upgradeConfirm: "Confirm purchase",
        regionArrival: "✨ New area discovered: <span class=\"text-amber-300 font-bold\">{region}</span>.",
        regions: [
            { title: "Dark Forest", description: "🌲 The bell rang too late. The mist hides hungry beasts and ancient secrets." },
            { title: "The Ashen Portal", description: "🌀 A portal pulses between the trees. Something on the other side breathes with the mist." },
            { title: "The Ruined Village", description: "🔥 The village has been invaded. Broken doors and battle scars warn that the invaders are still nearby." },
            { title: "Gudran Castle", description: "🏰 Gudran's walls conceal ancient creatures and knights who suffer no intruders." }
        ]
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

const hero = {
    name: "Zeph",
    level: 1,
    hp: 100,
    maxHp: 100,
    foco: 50,
    maxFoco: 50,
    atk: 14,
    def: 6,
    evasion: 8,
    parry: 15,
    stunChance: 5,
    fury: 0,
    maxFury: 100,
    gold: 15,
    xp: 0,
    maxXp: 30,
    potions: 1,
    maxPotions: 1,
    evasionBonus: 0,
    parryBonus: 0
};

const CAMP_COST = 50;
const UPGRADE_COST = 100;
const DODGE_COST = 15;
const DODGE_BONUS = 15;
const MAX_EVASION = 65;
const PARRY_COST = 10;
const PARRY_BONUS = 5;
const MAX_PARRY = 65;
const FURY_PER_DAMAGE = 1;
const FURY_PER_DODGE = 2;
const CRITICAL_DAMAGE_MULTIPLIER = 2;
const CRITICAL_STUN_BONUS = 30;
const FURY_PER_BASIC_ATTACK_DAMAGE = 0.5;
const UPGRADE_CONFIG = Object.freeze({
    atk: { stat: 'atk', amount: 5, nameKey: 'attack' },
    def: { stat: 'def', amount: 5, nameKey: 'defense' },
    parry: { stat: 'parry', amount: 5, max: MAX_PARRY, nameKey: 'parry', isPercentage: true },
    evasion: { stat: 'evasion', amount: 5, max: MAX_EVASION, nameKey: 'evasion', isPercentage: true },
    hp: { stat: 'maxHp', amount: 30, currentStat: 'hp', currentMaxStat: 'maxHp', currentAmount: 10, nameKey: 'hpUpgradeName', benefitKey: 'upgradeHpBenefit' },
    foco: { stat: 'maxFoco', amount: 20, currentStat: 'foco', currentMaxStat: 'maxFoco', currentAmount: 10, nameKey: 'staminaUpgradeName', benefitKey: 'upgradeStaminaBenefit' },
    stun: { stat: 'stunChance', amount: 1, max: 100, nameKey: 'stun', isPercentage: true }
});

const monsterPool = [
    { region: 0, name: { pt: "Lobo Sombriço", en: "Shadow Wolf" }, icon: "🐺", hp: 35, atk: 12, def: 3, parry: 15, evasion: 8, xpReward: 15, goldReward: 8 },
    { region: 0, name: { pt: "Espírito do Rio", en: "River Spirit" }, icon: "👻", hp: 45, atk: 14, def: 4, parry: 18, evasion: 12, xpReward: 20, goldReward: 12 },
    { region: 0, name: { pt: "Bruxa de Feições Cadavéricas", en: "Corpse-faced Witch" }, icon: "🧙‍♀️", hp: 60, atk: 18, def: 6, parry: 22, evasion: 10, xpReward: 30, goldReward: 20 },
    { region: 0, name: { pt: "Criatura Corrompida das Sombras", en: "Corrupted Shadow Creature" }, icon: "👤", hp: 90, atk: 22, def: 8, parry: 25, evasion: 15, xpReward: 45, goldReward: 35 },
    { region: 1, name: { pt: "Guardião do Portal", en: "Portal Guardian" }, icon: "🗿", hp: 85, atk: 22, def: 10, parry: 28, evasion: 8, xpReward: 38, goldReward: 24 },
    { region: 1, name: { pt: "Espectro das Cinzas", en: "Ash Wraith" }, icon: "🌫️", hp: 70, atk: 19, def: 7, parry: 30, evasion: 22, xpReward: 36, goldReward: 28 },
    { region: 2, name: { pt: "Saqueador da Névoa", en: "Mist Marauder" }, icon: "🪓", hp: 105, atk: 26, def: 11, parry: 35, evasion: 12, xpReward: 50, goldReward: 38 },
    { region: 2, name: { pt: "Cavaleiro Possuído", en: "Possessed Knight" }, icon: "⚔️", hp: 125, atk: 29, def: 14, parry: 40, evasion: 10, xpReward: 60, goldReward: 45 },
    { region: 3, name: { pt: "Cavaleiro de Gudran", en: "Knight of Gudran" }, icon: "🛡️", hp: 175, atk: 38, def: 18, parry: 42, evasion: 12, xpReward: 75, goldReward: 55 },
    { region: 3, name: { pt: "Sentinela das Catacumbas", en: "Catacomb Sentinel" }, icon: "💀", hp: 210, atk: 42, def: 21, parry: 45, evasion: 10, xpReward: 90, goldReward: 68 },
    { region: 3, name: { pt: "Manticora de Pedra", en: "Stone Manticore" }, icon: "🦂", hp: 245, atk: 47, def: 24, parry: 38, evasion: 18, xpReward: 110, goldReward: 82 }
];

let currentMonster = null;
let inCombat = false;
let currentRegion = 0;
let discoveredRegions = [0];
let gameOver = false;
let pendingUpgrade = null;
const upgradeDialog = document.getElementById('upgrade-dialog');

document.getElementById('upgrade-cancel').addEventListener('click', () => {
    pendingUpgrade = null;
    upgradeDialog.close();
});
document.getElementById('upgrade-confirm').addEventListener('click', confirmUpgradePurchase);
upgradeDialog.addEventListener('cancel', () => {
    pendingUpgrade = null;
});

function updateUI() {
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
    document.getElementById('hero-fury-bar').style.width = Math.min(100, hero.fury / hero.maxFury * 100) + '%';
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
    const stunChanceTotal = Math.min(100, hero.stunChance + stunBonus);
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
    document.getElementById('exploration-title').innerText = translations[gameLanguage].regions[currentRegion].title;
    document.getElementById('exploration-description').innerText = translations[gameLanguage].regions[currentRegion].description;

    document.querySelectorAll('[data-region-stop]').forEach((stop) => {
        const regionIndex = Number(stop.dataset.regionStop);
        const isDiscovered = discoveredRegions.includes(regionIndex);
        const isCurrent = regionIndex === currentRegion;
        stop.querySelector('.region-stop-name').innerText = isDiscovered
            ? translations[gameLanguage].regions[regionIndex].title
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

    const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
    document.getElementById('hero-hp-bar').style.width = hpPercent + '%';

    const focoPercent = Math.max(0, Math.min(100, (hero.foco / hero.maxFoco) * 100));
    document.getElementById('hero-foco-bar').style.width = focoPercent + '%';

    const exploreControls = document.getElementById('controls-explore');
    const combatControls = document.getElementById('controls-combat');
    const encounterCard = document.getElementById('encounter-card');
    const explorationBanner = document.getElementById('exploration-banner');
    const campButton = document.getElementById('camp-button');
    const potionButton = document.getElementById('potion-button');
    document.querySelectorAll('[data-upgrade]').forEach((button) => {
        const upgrade = button.dataset.upgrade;
        const skill = t(UPGRADE_CONFIG[upgrade].nameKey);
        button.disabled = inCombat || gameOver || hero.gold < UPGRADE_COST || isUpgradeMaxed(upgrade);
        button.setAttribute('aria-label', t('upgradeAria', { skill, cost: UPGRADE_COST }));
        button.title = t('upgradeAria', { skill, cost: UPGRADE_COST });
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

    const roll = Math.floor(Math.random() * 100) + 1;

    if (roll <= 50) {
        spawnMonster();
    } else if (roll <= 75) {
        const goldFound = Math.floor(Math.random() * 10) + 5;
        hero.gold += goldFound;
        logMessage(t("goldFound", { amount: goldFound }), "loot");
        updateUI();
    } else if (roll <= 90) {
        const healAmount = 30;
        hero.hp = Math.min(hero.maxHp, hero.hp + healAmount);
        logMessage(t("safeTrail", { amount: healAmount }), "special");
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
    if (currentRegion >= translations[gameLanguage].regions.length - 1) return 0;
    return Math.min(45, 3 + (hero.level - 1) * 3 + currentRegion * 4);
}

function tryDiscoverRegion() {
    if (Math.random() * 100 >= getDiscoveryChance()) return false;

    currentRegion++;
    discoveredRegions.push(currentRegion);
    logMessage(t("regionArrival", { region: translations[gameLanguage].regions[currentRegion].title }), "discovery");
    return true;
}

function spawnMonster() {
    const availableMonsters = monsterPool.filter(m => m.region === currentRegion);
    const template = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    
    const scaleFactor = 1 + (hero.level - 1) * 0.2;
    currentMonster = {
        name: template.name[gameLanguage],
        icon: template.icon,
        hp: Math.floor(template.hp * scaleFactor),
        maxHp: Math.floor(template.hp * scaleFactor),
        atk: Math.floor(template.atk * scaleFactor),
        def: Math.floor(template.def * scaleFactor),
        parry: template.parry,
        evasion: template.evasion,
        xpReward: Math.floor(template.xpReward * scaleFactor),
        goldReward: Math.floor(template.goldReward * scaleFactor)
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
    if (Math.random() * 100 >= currentMonster.parry) return damage;

    const reducedDamage = Math.max(1, Math.ceil(damage / 2));
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

    const stunChance = Math.min(100, hero.stunChance + criticalStunBonus);
    const stunned = currentMonster.hp > 0 && Math.random() * 100 < stunChance;
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

    if (Math.random() * 100 < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    let damage = Math.max(4, Math.floor(hero.atk * 0.8) - currentMonster.def + Math.floor(Math.random() * 4));
    resolveHeroAttack(damage, "quickDamage", 0, FURY_PER_BASIC_ATTACK_DAMAGE);
}

// NOVO GOLPE: Estocada Pesada (Gasta Foco, dano alto)
function combatHeavyAttack() {
    if (!inCombat || !currentMonster) return;
    if (hero.foco < 15) {
        logMessage(t("noFocus"));
        return;
    }
    hero.foco -= 15;
    playSound('specialAttack');

    if (Math.random() * 100 < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    let damage = Math.max(8, Math.floor(hero.atk * 1.5) - currentMonster.def + Math.floor(Math.random() * 6));
    resolveHeroAttack(damage, "heavyDamage");
}

function combatCriticalAttack() {
    if (!inCombat || !currentMonster || hero.fury < hero.maxFury) return;

    hero.fury = 0;
    playSound('specialAttack');
    updateUI();
    if (Math.random() * 100 < currentMonster.evasion) {
        logMessage(t("monsterDodges", { monster: currentMonster.name }), "special");
        checkCombatProgress();
        return;
    }

    const damage = Math.max(8, Math.floor(hero.atk * CRITICAL_DAMAGE_MULTIPLIER) - currentMonster.def + Math.floor(Math.random() * 6));
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
    }, 400);
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
    }, 400);
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
    }, 500);
}

function monsterAttackTurn() {
    if (!inCombat || !currentMonster) return;

    const evasionChance = Math.min(MAX_EVASION, hero.evasion + hero.evasionBonus);
    const evaded = Math.random() * 100 < evasionChance;
    if (evaded) {
        playSound('dodge');
        hero.defending = false;
        const furyGained = Math.min(FURY_PER_DODGE, hero.maxFury - hero.fury);
        hero.fury += furyGained;
        logMessage(t("heroDodges", { monster: currentMonster.name, amount: furyGained }), "special");
        updateUI();
        return;
    }

    let monsterDamage = Math.max(2, currentMonster.atk - hero.def + Math.floor(Math.random() * 4));
    const parryChance = Math.min(MAX_PARRY, hero.parry + hero.parryBonus);
    const parried = Math.random() * 100 < parryChance;
    if (parried) {
        playSound('parry');
        monsterDamage = Math.max(1, Math.ceil(monsterDamage / 2));
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

function purchaseUpgrade(upgrade) {
    const configuration = UPGRADE_CONFIG[upgrade];
    if (!configuration || inCombat || gameOver || hero.gold < UPGRADE_COST || isUpgradeMaxed(upgrade)) return;

    pendingUpgrade = upgrade;
    const skill = t(configuration.nameKey);
    const amount = configuration.max === undefined
        ? configuration.amount
        : Math.min(configuration.amount, configuration.max - hero[configuration.stat]);
    const effect = configuration.benefitKey
        ? t(configuration.benefitKey, { amount: configuration.amount, currentAmount: configuration.currentAmount })
        : t('upgradeIncrease', {
            skill,
            amount,
            unit: configuration.isPercentage ? '%' : ''
        });
    document.getElementById('upgrade-dialog-skill').innerText = skill;
    document.getElementById('upgrade-dialog-effect').innerText = effect;
    document.getElementById('upgrade-dialog-question').innerText = t('upgradeQuestion');
    document.getElementById('upgrade-dialog-cost').innerText = t('upgradeCostLabel', { cost: UPGRADE_COST });
    document.getElementById('upgrade-dialog-balance').innerText = t('upgradeBalanceLabel', { amount: hero.gold - UPGRADE_COST });
    upgradeDialog.showModal();
}

function confirmUpgradePurchase() {
    const upgrade = pendingUpgrade;
    const configuration = UPGRADE_CONFIG[upgrade];
    if (!configuration) return;
    if (inCombat || gameOver || hero.gold < UPGRADE_COST || isUpgradeMaxed(upgrade)) {
        pendingUpgrade = null;
        upgradeDialog.close();
        updateUI();
        return;
    }

    const amount = configuration.max === undefined
        ? configuration.amount
        : Math.min(configuration.amount, configuration.max - hero[configuration.stat]);
    hero.gold -= UPGRADE_COST;
    hero[configuration.stat] = configuration.max === undefined
        ? hero[configuration.stat] + amount
        : Math.min(configuration.max, hero[configuration.stat] + amount);
    if (configuration.currentStat) {
        hero[configuration.currentStat] = Math.min(
            hero[configuration.currentMaxStat],
            hero[configuration.currentStat] + configuration.currentAmount
        );
    }
    const skill = t(configuration.nameKey);
    pendingUpgrade = null;
    upgradeDialog.close();
    logMessage(t('upgradeSuccess', { skill, cost: UPGRADE_COST }), 'special');
    updateUI();
}

function updateMonsterUI() {
    document.getElementById('monster-hp').innerText = currentMonster.hp;
    const hpPercent = Math.max(0, Math.min(100, (currentMonster.hp / currentMonster.maxHp) * 100));
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
    const heal = 45;
    hero.hp = Math.min(hero.maxHp, hero.hp + heal);
    logMessage(t("potionHeal", { amount: heal }), "discovery");
    updateUI();

    if (inCombat) {
        logMessage(t("potionOpening"));
        setTimeout(() => {
            if (inCombat && currentMonster) monsterAttackTurn();
        }, 400);
    }
}

function restAtCamp() {
    if (inCombat || gameOver) return;
    if (hero.gold < CAMP_COST) {
        logMessage(t("noGold"));
        return;
    }
    if (hero.hp >= hero.maxHp && hero.foco >= hero.maxFoco) {
        logMessage(t("alreadyRested"));
        return;
    }
    hero.gold -= CAMP_COST;
    const hpRecovered = Math.min(50, hero.maxHp - hero.hp);
    const focusRecovered = Math.min(25, hero.maxFoco - hero.foco);
    hero.hp += hpRecovered;
    hero.foco += focusRecovered;
    logMessage(t("rested", { cost: CAMP_COST, hp: hpRecovered, focus: focusRecovered }), "discovery");
    updateUI();
}

function combatRun() {
    if (!inCombat) return;
    const success = Math.random() < 0.7;
    if (success) {
        logMessage(t("escaped"), "discovery");
        hero.foco = hero.maxFoco;
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
    hero.foco = hero.maxFoco; // recarrega o foco
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
        hero.level++;
        hero.xp -= hero.maxXp;
        hero.maxXp = Math.floor(hero.maxXp * 1.5);
        
        hero.maxHp += 25;
        hero.hp = hero.maxHp;
        hero.maxFoco += 15;
        hero.foco = hero.maxFoco;
        hero.maxPotions = Math.min(5, hero.maxPotions + 1);
        hero.atk += 4;
        hero.def += 2;
        hero.evasion = Math.min(40, hero.evasion + 2);
        hero.parry = Math.min(MAX_PARRY, hero.parry + 2);
        hero.stunChance = Math.min(100, hero.stunChance + 2);

        playSound('levelUp');
        logMessage(t("levelUp", { level: hero.level }), "discovery");
    }
}

window.onload = function() {
    applyLanguage();
    updateUI();
    startGameMusic();
};

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
        startScreenLabel: "Tela de início do jogo",
        startKicker: "Uma aventura na névoa",
        startTitle: "A Regra do Sino",
        startStory: "Quando o sino toca, a floresta desperta. Escolha quem vai enfrentar a névoa — e prepare-se para sobreviver.",
        startPrompt: "Clique para começar",
        startHint: "Toque, clique ou pressione Enter",
        setupKicker: "Prepare sua jornada",
        setupTitle: "Escolha quem entrará na névoa",
        setupDescription: "Cada caçador tem uma força diferente. Depois, escolha três equipamentos para levar.",
        selectCharacter: "Personagem",
        selectStarterEquipment: "Escolha 3 equipamentos",
        starterEquipmentHelp: "Escolha equipamentos de espaços diferentes. Selecione novamente um espaço para trocar sua escolha.",
        characterSpecialty: "+{amount} {stat}",
        backToTitle: "Voltar",
        beginAdventure: "Iniciar aventura",
        level: "Nível",
        gold: "Ouro:",
        experience: "XP:",
        focus: "Foco",
        fury: "Fúria",
        attack: "Ataque",
        defense: "Defesa",
        attributes: "Atributos",
        equipment: "Equipamento",
        equipmentSummary: "Equipamento, {count} de 7 equipados",
        inventory: "Mochila",
        equipmentBagDescription: "Até 10 equipamentos guardados.",
        bagCapacity: "{count}/10 espaços usados",
        bagSlot: "Espaço {slot}",
        emptyBagSlot: "Vazio",
        openEquipmentBag: "Abrir mochila, {count} de 10 espaços usados",
        closeBag: "Fechar mochila",
        openBag: "Abrir mochila",
        discard: "Descartar",
        discardItemAria: "Descartar {item} da mochila",
        itemDiscarded: "🗑️ {item} descartado.",
        inventoryFull: "Mochila cheia (10/10). Libere um espaço antes de guardar outro equipamento.",
        pendingEquipment: "Equipamento encontrado aguardando espaço: {item}.",
        pendingEquipmentFullHelp: "A mochila está cheia. Descarte um item para liberar espaço; o item encontrado ficará aguardando.",
        emptySlot: "Vazio",
        viewEquipmentDetails: "Ver propriedades de {item}",
        closeItemDetails: "Fechar detalhes do equipamento",
        rightHand: "Mão direita",
        leftHand: "Mão esquerda",
        head: "Cabeça",
        body: "Corpo",
        legs: "Pernas",
        boots: "Botas",
        accessory: "Acessório",
        equip: "Equipar",
        unequip: "Desequipar",
        itemFound: "✨ Item encontrado: <span class=\"text-amber-300 font-bold\">{item}</span> ({slot}).",
        itemEquipped: "⚔️ {item} equipado em {slot}.",
        itemStored: "🎒 {item} guardado na mochila.",
        itemDropTitle: "Equipamento encontrado",
        itemDropPrompt: "{item} ocupa o slot {slot}, atualmente usado por {currentItem}.",
        itemDropChoiceHelp: "Equipar o novo guarda o atual na mochila; manter o atual guarda o item encontrado.",
        equipNewItem: "Equipar novo",
        keepCurrentItem: "Manter atual",
        equipItemAria: "Equipar {item} em {slot}",
        unequipItemAria: "Desequipar {item} de {slot}",
        equipmentBonus: "+{amount} {stat}",
        equipmentPercentageBonus: "+{amount}% {stat}",
        attackStat: "Ataque",
        defenseStat: "Defesa",
        hpStat: "HP máximo",
        focusStat: "Foco máximo",
        evasionStat: "Esquiva",
        parryStat: "Aparo",
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
        mistPowers: "Poderes da Névoa",
        noMistPowers: "Nenhum poder encontrado.",
        mistAccept: "Aceitar oferta",
        mistDecline: "Recusar e seguir",
        mistContactAppears: "{icon} {contact} surge entre as árvores e faz uma oferta.",
        mistContactDeclined: "Você recusa a oferta. A presença desaparece na névoa.",
        mistContactAccepted: "Você aceita a oferta de {contact}.",
        mistSacrifice: "🩸 O espírito entrega {gold} de ouro, mas cobra {hp} HP.",
        witchQuestStarted: "A bruxa aponta o alvo da missão: <span class=\"text-red-400 font-bold\">{monster}</span>.",
        witchDrinkAccepted: "🧪 Você bebe a mistura e fica com {hp} de HP. A bruxa entrega {gold} de ouro.",
        mistPowerGained: "✨ Novo poder desperto: <span class=\"text-cyan-300 font-bold\">{power}</span> — {description}.",
        mistBossAppears: "⚔️ Uma força antiga se manifesta na névoa: <span class=\"text-red-400 font-bold\">{monster}</span>!",
        drink: "Poção",
        potionActionAria: "Usar poção de cura",
        danger: "Perigo na Névoa",
        explorationIntro: "🌲 O sino tocou tarde demais. A névoa esconde o espírito do rio, segredos sombrios e feras famintas. O que você fará?",
        openingLog: "[Início] {hero} avança pela Floresta Sombria. Mantenha sua arma em punho.",
        explore: "Explorar",
        camp: "Descansar",
        campCost: "(🪙{cost})",
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
        criticalDamage: "🗡️ Golpe Crítico! Você causou {damage} de dano!",
        stunLanded: "✨ O inimigo foi atordoado e perdeu o contra-ataque!",
        defendMessage: "⚔️ A chance de aparo aumentou em {amount}% e permanece até o fim da luta!",
        noParryFocus: "Você precisa de 10 de Foco para preparar um aparo.",
        parryMaxed: "A chance de aparo já está no limite de 65% nesta luta.",
        heroParries: "⚔️ Você aparou o golpe! O dano caiu pela metade: {damage} de dano.",
        monsterParries: "⚔️ {monster} aparou seu golpe! O dano causado caiu pela metade: {damage}.",
        monsterDamage: "O {monster} contra-atacou causando <span class=\"text-red-400 font-bold\">{damage} de dano</span>!",
        noPotions: "Você não tem poções restantes!",
        hpFull: "Seu HP já está no máximo!",
        potionHeal: "🧪 Você bebeu uma poção e recuperou <span class=\"text-emerald-400\">{amount_hp} HP e {amount_foco} de Foco</span>.",
        potionOpening: "O monstro aproveitou o seu momento de distração!",
        alreadyRested: "Você já está com HP e Foco completos.",
        rested: "⛺ Você gastou {cost} de ouro no acampamento e recuperou {hp} HP e {focus} de Foco.",
        escaped: "💨 Você conseguiu escapar correndo pela névoa densa!",
        escapeFailed: "❌ A tentativa de fuga falhou! O {monster} cortou seu caminho.",
        victory: "🎉 Vitória! Você derrotou o <span class=\"text-amber-300 font-bold\">{monster}</span>!",
        rewards: "Recompensas: <span class=\"text-purple-300\">+{xp} XP</span> e <span class=\"text-amber-300\">+{gold} de Ouro</span>",
        defeat: "💀 Você caiu na Floresta Sombria...",
        defeatHelp: "Sua jornada terminou na Floresta Sombria.",
        gameOverTitle: "Fim da jornada",
        levelUp: "⭐ <span class=\"text-amber-400 font-bold uppercase\">Subiu de Nível!</span> Você alcançou o Nível {level}! Ataque, defesa, esquiva, aparo e stun aprimorados!",
        monsterDodges: "💨 O {monster} desviou do seu golpe!",
        heroDodges: "💨 Você desviou do ataque do {monster} e ganhou {amount} de Fúria!",
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
        startScreenLabel: "Game start screen",
        startKicker: "An adventure in the mist",
        startTitle: "The Bell's Rule",
        startStory: "When the bell rings, the forest awakens. Choose who will face the mist — and prepare to survive.",
        startPrompt: "Click to begin",
        startHint: "Tap, click, or press Enter",
        setupKicker: "Prepare for the journey",
        setupTitle: "Choose who will enter the mist",
        setupDescription: "Each hunter has a different strength. Then choose three pieces of equipment to take.",
        selectCharacter: "Character",
        selectStarterEquipment: "Choose 3 pieces of equipment",
        starterEquipmentHelp: "Choose equipment for different slots. Select another item for a slot to replace your choice.",
        characterSpecialty: "+{amount} {stat}",
        backToTitle: "Back",
        beginAdventure: "Begin adventure",
        level: "Level",
        gold: "Gold:",
        experience: "XP:",
        focus: "Focus",
        fury: "Fury",
        attack: "Attack",
        defense: "Defense",
        attributes: "Stats",
        equipment: "Equipment",
        equipmentSummary: "Equipment, {count} of 7 equipped",
        inventory: "Bag",
        equipmentBagDescription: "Store up to 10 pieces of equipment.",
        bagCapacity: "{count}/10 spaces used",
        bagSlot: "Slot {slot}",
        emptyBagSlot: "Empty",
        openEquipmentBag: "Open bag, {count} of 10 spaces used",
        closeBag: "Close bag",
        openBag: "Open bag",
        discard: "Discard",
        discardItemAria: "Discard {item} from the bag",
        itemDiscarded: "🗑️ {item} discarded.",
        inventoryFull: "Bag full (10/10). Free a slot before storing another item.",
        pendingEquipment: "Found equipment waiting for space: {item}.",
        pendingEquipmentFullHelp: "The bag is full. Discard an item to free a slot; the found item will remain here.",
        emptySlot: "Empty",
        viewEquipmentDetails: "View {item} properties",
        closeItemDetails: "Close equipment details",
        rightHand: "Right hand",
        leftHand: "Left hand",
        head: "Head",
        body: "Body",
        legs: "Legs",
        boots: "Boots",
        accessory: "Accessory",
        equip: "Equip",
        unequip: "Unequip",
        itemFound: "✨ Item found: <span class=\"text-amber-300 font-bold\">{item}</span> ({slot}).",
        itemEquipped: "⚔️ {item} equipped in {slot}.",
        itemStored: "🎒 {item} stored in your bag.",
        itemDropTitle: "Equipment found",
        itemDropPrompt: "{item} uses the {slot} slot, currently occupied by {currentItem}.",
        itemDropChoiceHelp: "Equipping the new item moves the current one to your bag; keeping the current item stores the find.",
        equipNewItem: "Equip new",
        keepCurrentItem: "Keep current",
        equipItemAria: "Equip {item} in {slot}",
        unequipItemAria: "Unequip {item} from {slot}",
        equipmentBonus: "+{amount} {stat}",
        equipmentPercentageBonus: "+{amount}% {stat}",
        attackStat: "Attack",
        defenseStat: "Defense",
        hpStat: "max HP",
        focusStat: "max Focus",
        evasionStat: "Evasion",
        parryStat: "Parry",
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
        mistPowers: "Mist Powers",
        noMistPowers: "No powers discovered yet.",
        mistAccept: "Accept the offer",
        mistDecline: "Refuse and move on",
        mistContactAppears: "{icon} {contact} appears between the trees with an offer.",
        mistContactDeclined: "You refuse the offer. The presence vanishes into the mist.",
        mistContactAccepted: "You accept {contact}'s offer.",
        mistSacrifice: "🩸 The spirit gives {gold} gold, but claims {hp} HP.",
        witchQuestStarted: "The witch points out the target of her quest: <span class=\"text-red-400 font-bold\">{monster}</span>.",
        witchDrinkAccepted: "🧪 You drink the mixture and are left with {hp} HP. The witch hands over {gold} gold.",
        mistPowerGained: "✨ New power awakened: <span class=\"text-cyan-300 font-bold\">{power}</span> — {description}.",
        mistBossAppears: "⚔️ An ancient force manifests in the mist: <span class=\"text-red-400 font-bold\">{monster}</span>!",
        drink: "Potion",
        potionActionAria: "Use healing potion",
        danger: "Danger in the Mist",
        explorationIntro: "🌲 The bell rang too late. The mist hides the river spirit, dark secrets, and hungry beasts. What will you do?",
        openingLog: "[Start] {hero} ventures into the Dark Forest. Keep your weapon ready.",
        explore: "Explore",
        camp: "Rest",
        campCost: "(🪙{cost})",
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
        criticalDamage: "🗡️ Critical Strike! You deal {damage} damage!",
        stunLanded: "✨ The enemy is stunned and loses its counterattack!",
        defendMessage: "⚔️ Parry chance increased by {amount}% and will last until the fight ends!",
        noParryFocus: "You need 10 Focus to prepare a parry.",
        parryMaxed: "Parry chance is already at the 65% limit for this fight.",
        heroParries: "⚔️ You parried the blow! Damage was halved to {damage}.",
        monsterParries: "⚔️ {monster} parried your attack! Damage dealt was halved to {damage}.",
        monsterDamage: "The {monster} counterattacks for <span class=\"text-red-400 font-bold\">{damage} damage</span>!",
        noPotions: "You have no potions left!",
        hpFull: "Your HP is already full!",
        potionHeal: "🧪 You drink a potion and recover <span class=\"text-emerald-400\">{amount_hp} HP and {amount_foco} Focus</span>.",
        potionOpening: "The monster takes advantage of your distraction!",
        alreadyRested: "Your HP and Focus are already full.",
        rested: "⛺ You spent {cost} gold at camp and recovered {hp} HP and {focus} Focus.",
        escaped: "💨 You escape into the thick mist!",
        escapeFailed: "❌ You fail to escape! The {monster} cuts off your path.",
        victory: "🎉 Victory! You defeated <span class=\"text-amber-300 font-bold\">{monster}</span>!",
        rewards: "Rewards: <span class=\"text-purple-300\">+{xp} XP</span> and <span class=\"text-amber-300\">+{gold} Gold</span>",
        defeat: "💀 You fall in the Dark Forest...",
        defeatHelp: "Your journey ends in the Dark Forest.",
        gameOverTitle: "Journey's End",
        levelUp: "⭐ <span class=\"text-amber-400 font-bold uppercase\">Level Up!</span> You reached Level {level}! Attack, defense, evasion, parry, and stun improved!",
        monsterDodges: "💨 The {monster} dodges your attack!",
        heroDodges: "💨 You dodge the {monster}'s attack and gain {amount} Fury!",
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

const EQUIPMENT_SLOTS = Object.freeze([
    { id: "rightHand", icon: "🗡️" },
    { id: "leftHand", icon: "🛡️" },
    { id: "head", icon: "⛑️" },
    { id: "body", icon: "🦺" },
    { id: "legs", icon: "👖" },
    { id: "boots", icon: "🥾" },
    { id: "accessory", icon: "💍" }
]);
const EQUIPMENT_BAG_CAPACITY = 10;
const EQUIPMENT_STAT_KEYS = Object.freeze({
    atk: "attackStat",
    def: "defenseStat",
    maxHp: "hpStat",
    maxFoco: "focusStat",
    evasion: "evasionStat",
    parry: "parryStat"
});

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
            stat === "evasion" || stat === "parry"
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

const GAME_DATA = window.YaraRpgData;
const GAME_RULES = GAME_DATA.rules;
const ITEM_DATA = GAME_DATA.items;
const MIST_CONTACT_DATA = GAME_DATA.mistContacts;
let selectedCharacterProgression = GAME_DATA.characters[0].levelUp;
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
let pendingMistContact = null;
let pendingEquipment = null;
let selectedEquipmentDetails = null;
let equipmentInstanceId = 0;
let explorationsSinceMistContact = GAME_RULES.mistContacts.cooldownExplorations;

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
document.getElementById('close-equipment-item-button').addEventListener('click', closeEquipmentItemDetails);
document.getElementById('equipment-item-equip-button').addEventListener('click', equipSelectedInventoryItem);
document.getElementById('equipment-item-unequip-button').addEventListener('click', unequipSelectedEquipment);
document.getElementById('equipment-item-discard-button').addEventListener('click', discardSelectedInventoryItem);
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
    bagButton.setAttribute('aria-label', t('openEquipmentBag', { count: bagCount }));

    EQUIPMENT_SLOTS.forEach(({ id, icon }) => {
        const item = hero.equipment[id];
        const slot = document.createElement('div');
        slot.className = `equipment-slot equipment-slot-${id} rounded-lg border border-fantasy-border/50 bg-forest-950/60`;
        slot.setAttribute('role', 'group');
        slot.setAttribute('aria-label', `${t(id)}: ${item ? item.name[gameLanguage] : t('emptySlot')}`);

        if (item) {
            const itemButton = document.createElement('button');
            itemButton.type = 'button';
            itemButton.className = 'equipment-slot-item';
            itemButton.setAttribute('aria-label', t('viewEquipmentDetails', {
                item: item.name[gameLanguage]
            }));

            const itemIcon = document.createElement('span');
            itemIcon.className = 'equipment-slot-icon text-amber-200';
            itemIcon.textContent = item.icon;
            itemIcon.setAttribute('aria-hidden', 'true');
            itemButton.append(itemIcon);
            itemButton.addEventListener('click', () => showEquipmentItemDetails(item, 'equipped', id));
            slot.append(itemButton);
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

    const inventoryContainer = document.getElementById('equipment-inventory-list');
    inventoryContainer.replaceChildren();
    for (let index = 0; index < EQUIPMENT_BAG_CAPACITY; index++) {
        const item = hero.equipmentInventory[index];
        const slot = document.createElement('div');
        slot.className = `equipment-bag-slot${item ? ' has-item' : ''}`;
        slot.setAttribute('role', 'listitem');
        slot.setAttribute('aria-label', item
            ? `${t('bagSlot', { slot: index + 1 })}: ${item.name[gameLanguage]}`
            : `${t('bagSlot', { slot: index + 1 })}: ${t('emptyBagSlot')}`);

        const position = document.createElement('span');
        position.className = 'equipment-bag-slot-number';
        position.textContent = String(index + 1).padStart(2, '0');

        if (item) {
            const itemButton = document.createElement('button');
            itemButton.type = 'button';
            itemButton.className = 'equipment-bag-item';
            itemButton.setAttribute('aria-label', t('viewEquipmentDetails', {
                item: item.name[gameLanguage]
            }));
            const itemIcon = document.createElement('span');
            itemIcon.className = 'equipment-bag-item-icon';
            itemIcon.textContent = item.icon;
            itemIcon.setAttribute('aria-hidden', 'true');
            itemButton.append(itemIcon);
            itemButton.addEventListener('click', () => showEquipmentItemDetails(item, 'inventory'));
            slot.append(position, itemButton);
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
        t('bagCapacity', { count: bagCount })
    );
    const pendingLabel = document.getElementById('equipment-bag-pending-item');
    pendingLabel.hidden = !isPendingDropBlocked();
    if (!pendingLabel.hidden) {
        pendingLabel.textContent = t('pendingEquipment', {
            item: pendingEquipment.item.name[gameLanguage]
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
    document.getElementById('equipment-item-icon').textContent = item.icon;
    document.getElementById('equipment-item-title').textContent = item.name[gameLanguage];
    document.getElementById('equipment-item-slot').textContent = t(item.slot);

    const properties = document.getElementById('equipment-item-properties');
    properties.replaceChildren();
    Object.entries(item.stats).forEach(([stat, amount]) => {
        const property = document.createElement('li');
        property.textContent = t(
            stat === 'evasion' || stat === 'parry'
                ? 'equipmentPercentageBonus'
                : 'equipmentBonus',
            { amount, stat: t(EQUIPMENT_STAT_KEYS[stat]) }
        );
        properties.append(property);
    });

    const isInventoryItem = source === 'inventory';
    const equipButton = document.getElementById('equipment-item-equip-button');
    const unequipButton = document.getElementById('equipment-item-unequip-button');
    const discardButton = document.getElementById('equipment-item-discard-button');
    equipButton.hidden = !isInventoryItem;
    equipButton.disabled = inCombat || gameOver || Boolean(pendingEquipment);
    equipButton.setAttribute('aria-label', t('equipItemAria', {
        item: item.name[gameLanguage],
        slot: t(item.slot)
    }));
    unequipButton.hidden = isInventoryItem;
    unequipButton.disabled = inCombat || gameOver || Boolean(pendingEquipment)
        || hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY;
    unequipButton.setAttribute('aria-label', t('unequipItemAria', {
        item: item.name[gameLanguage],
        slot: t(item.slot)
    }));
    discardButton.hidden = !isInventoryItem;
    discardButton.disabled = inCombat || gameOver;
    discardButton.setAttribute('aria-label', t('discardItemAria', {
        item: item.name[gameLanguage]
    }));
    document.getElementById('equipment-item-dialog').showModal();
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
    logMessage(t('itemDiscarded', { item: item.name[gameLanguage] }), 'loot');
    updateUI();
    if (pendingEquipment && !pendingEquipment.fromInventory) {
        document.getElementById('equipment-bag-dialog').close();
        showEquipmentChoice(pendingEquipment.item, false);
    }
}

function showEquipmentChoice(item, fromInventory) {
    pendingEquipment = { item, fromInventory };
    const currentItem = hero.equipment[item.slot];
    document.getElementById('item-drop-message').textContent = t('itemDropPrompt', {
        item: item.name[gameLanguage],
        slot: t(item.slot),
        currentItem: `${currentItem.icon} ${currentItem.name[gameLanguage]}`
    });
    const blockedByFullBag = isPendingDropBlocked();
    document.getElementById('item-drop-choice-help').textContent = blockedByFullBag
        ? t('pendingEquipmentFullHelp')
        : t('itemDropChoiceHelp');
    document.getElementById('item-drop-bonuses').textContent = getItemBonusText(item);
    document.getElementById('equip-new-item-button').disabled = blockedByFullBag;
    document.getElementById('keep-current-item-button').disabled = blockedByFullBag;
    document.getElementById('open-bag-from-drop-button').hidden = !blockedByFullBag;
    document.getElementById('item-drop-dialog').showModal();
    renderEquipment();
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
        item: item.name[gameLanguage],
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
    return {
        ...template,
        name: { ...template.name },
        stats: { ...template.stats },
        instanceId: ++equipmentInstanceId
    };
}

function equipItem(item, fromInventory) {
    let inventoryIndex = -1;
    if (fromInventory) {
        inventoryIndex = hero.equipmentInventory.indexOf(item);
        if (inventoryIndex === -1) return;
        hero.equipmentInventory.splice(inventoryIndex, 1);
    }

    const previousItem = hero.equipment[item.slot];
    if (previousItem && hero.equipmentInventory.length >= EQUIPMENT_BAG_CAPACITY) {
        if (fromInventory) hero.equipmentInventory.splice(inventoryIndex, 0, item);
        logMessage(t('inventoryFull'), 'loot');
        updateUI();
        return;
    }
    if (previousItem) {
        hero.equipmentInventory.push(previousItem);
        logMessage(t('itemStored', { item: previousItem.name[gameLanguage] }), 'loot');
    }
    hero.equipment[item.slot] = item;
    hero.hp = Math.min(hero.hp, getEffectiveStat('maxHp'));
    hero.foco = Math.min(hero.foco, getEffectiveStat('maxFoco'));
    logMessage(t('itemEquipped', {
        item: item.name[gameLanguage],
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
        logMessage(t('inventoryFull'), 'loot');
        return;
    }
    hero.equipment[slot] = null;
    hero.equipmentInventory.push(item);
    hero.hp = Math.min(hero.hp, getEffectiveStat('maxHp'));
    hero.foco = Math.min(hero.foco, getEffectiveStat('maxFoco'));
    logMessage(t('itemStored', { item: item.name[gameLanguage] }), 'loot');
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
        logMessage(t('itemStored', { item: item.name[gameLanguage] }), 'loot');
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
    const effectiveEvasion = Math.min(MAX_EVASION, getEffectiveStat('evasion'));
    const effectiveParry = Math.min(MAX_PARRY, getEffectiveStat('parry'));
    const effectiveStunChance = Math.min(
        GAME_RULES.probabilityScale,
        getEffectiveStat('stunChance')
    );
    const evasionTotal = Math.min(MAX_EVASION, effectiveEvasion + hero.evasionBonus);
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
    const parryTotal = Math.min(MAX_PARRY, effectiveParry + hero.parryBonus);
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
    document.getElementById('hero-potions').innerText = hero.potions;
    document.getElementById('hero-potions-max').innerText = hero.maxPotions;
    renderEquipment();
    const unlockedPowers = MIST_CONTACT_DATA.powers.filter((power) => hero.mistPowers.includes(power.id));
    document.getElementById('mist-power-list').textContent = unlockedPowers.length
        ? unlockedPowers.map((power) =>
            `${power.name[gameLanguage]} (${power.description[gameLanguage]})`
        ).join(' · ')
        : t('noMistPowers');
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
    mistContactCard.classList.toggle('hidden', !pendingMistContact || inCombat || gameOver);
    if (pendingMistContact) {
        document.getElementById('mist-contact-icon').textContent = pendingMistContact.icon;
        document.getElementById('mist-contact-name').textContent = pendingMistContact.name[gameLanguage];
        document.getElementById('mist-contact-message').textContent = pendingMistContact.message[gameLanguage];
    }
    campButton.disabled = inCombat || gameOver || hero.gold < CAMP_COST || (
        hero.hp >= getEffectiveStat('maxHp') && hero.foco >= getEffectiveStat('maxFoco')
    );
    potionButton.disabled = gameOver;

    if (gameOver) {
        exploreControls.classList.add('hidden');
        combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden');
        mistContactCard.classList.add('hidden');
        explorationBanner.classList.remove('hidden');
        document.getElementById('exploration-title').innerText = t('gameOverTitle');
        document.getElementById('exploration-description').innerText = t('defeatHelp');
        restartButton.classList.remove('hidden');
    } else if (inCombat) {
        exploreControls.classList.add('hidden');
        combatControls.classList.remove('hidden');
        encounterCard.classList.remove('hidden');
        mistContactCard.classList.add('hidden');
        explorationBanner.classList.add('hidden');
        restartButton.classList.add('hidden');
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
    if (inCombat || gameOver || pendingMistContact) return;
    if (hero.hp <= 0) {
            logMessage(t("injured"), "combat-monster");
        return;
    }

    explorationsSinceMistContact++;
    if (tryDiscoverRegion()) {
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
        pendingMistContact = MIST_CONTACT_SYSTEM.chooseContact(MIST_CONTACT_DATA.contacts, hero.level);
        if (pendingMistContact) {
            explorationsSinceMistContact = 0;
            logMessage(t('mistContactAppears', {
                contact: pendingMistContact.name[gameLanguage],
                icon: pendingMistContact.icon
            }), 'special');
            updateUI();
            return;
        }
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

        hero.hp = Math.min(getEffectiveStat('maxHp'), hero.hp + healAmountHp);
        hero.foco = Math.min(getEffectiveStat('maxFoco'), hero.foco + healAmountFoco);
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

function spawnMonster(templateOverride = null) {
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
    const monsterHp = vary(template.hp);

    currentMonster = {
        name: template.name[gameLanguage],
        icon: template.icon,
        isMistBoss,
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

    logMessage(t(isMistBoss ? "mistBossAppears" : "monsterAppears", {
        monster: currentMonster.name
    }), "combat-monster");
    updateUI();
}

function acceptMistContact() {
    if (!pendingMistContact || inCombat || gameOver) return;

    const contact = pendingMistContact;
    pendingMistContact = null;
    logMessage(t('mistContactAccepted', { contact: contact.name[gameLanguage] }), 'special');

    if (contact.onAccept?.type === 'boss') {
        const missionBoss = MIST_CONTACT_DATA.bosses.find(
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
        updateUI();
        return;
    }

    const boss = MIST_CONTACT_SYSTEM.chooseBoss(MIST_CONTACT_DATA.bosses, hero.level);
    const power = MIST_CONTACT_SYSTEM.choosePower(
        MIST_CONTACT_DATA.powers,
        hero.mistPowers,
        hero
    );
    const outcome = MIST_CONTACT_SYSTEM.chooseOutcome(
        GAME_RULES.mistContacts.outcomes,
        Boolean(boss),
        Boolean(power)
    );

    if (outcome?.type === 'combat' && boss) {
        spawnMonster(boss);
        return;
    }

    if (outcome?.type === 'power' && power) {
        const previousValue = hero[power.stat];
        hero[power.stat] = power.max === undefined
            ? previousValue + power.amount
            : Math.min(power.max, previousValue + power.amount);
        const amountGained = hero[power.stat] - previousValue;
        if (power.currentStat) {
            hero[power.currentStat] = Math.min(
                getEffectiveStat('maxHp'),
                hero[power.currentStat] + amountGained
            );
        }
        hero.mistPowers.push(power.id);
        logMessage(t('mistPowerGained', {
            power: power.name[gameLanguage],
            description: power.description[gameLanguage]
        }), 'special');
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
    updateUI();
}

function declineMistContact() {
    if (!pendingMistContact || inCombat || gameOver) return;
    pendingMistContact = null;
    logMessage(t('mistContactDeclined'), 'normal');
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

    const stunChance = Math.min(
        GAME_RULES.probabilityScale,
        Math.min(GAME_RULES.probabilityScale, getEffectiveStat('stunChance')) + criticalStunBonus
    );
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
        Math.floor(getEffectiveStat('atk') * attackRules.attackMultiplier)
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
        Math.floor(getEffectiveStat('atk') * attackRules.attackMultiplier)
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
        Math.floor(getEffectiveStat('atk') * CRITICAL_DAMAGE_MULTIPLIER)
            - currentMonster.def
            + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    resolveHeroAttack(damage, "criticalDamage", CRITICAL_STUN_BONUS);
}

// NOVO GOLPE: Postura Firme (Aumenta defesa e recupera foco)
function combatDefend() {
    if (!inCombat || !currentMonster) return;
    const bonusGained = Math.min(
        PARRY_BONUS,
        MAX_PARRY - getEffectiveStat('parry') - hero.parryBonus
    );
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
    const bonusGained = Math.min(
        DODGE_BONUS,
        MAX_EVASION - getEffectiveStat('evasion') - hero.evasionBonus
    );
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

    const evasionChance = Math.min(MAX_EVASION, getEffectiveStat('evasion') + hero.evasionBonus);
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
        currentMonster.atk - getEffectiveStat('def') + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    const parryChance = Math.min(MAX_PARRY, getEffectiveStat('parry') + hero.parryBonus);
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
    if (configuration?.max === undefined) return false;
    const currentValue = configuration.isPercentage
        ? getEffectiveStat(configuration.stat)
        : hero[configuration.stat];
    return currentValue >= configuration.max;
}

function getMaxUpgradeQuantity(upgrade) {
    const configuration = UPGRADE_CONFIG[upgrade];
    if (!configuration || UPGRADE_COST <= 0) return 0;

    const affordableQuantity = Math.floor(hero.gold / UPGRADE_COST);
    if (configuration.max === undefined) return affordableQuantity;

    const currentValue = configuration.isPercentage
        ? getEffectiveStat(configuration.stat)
        : hero[configuration.stat];
    const remaining = Math.max(0, configuration.max - currentValue);
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
        : Math.min(
            configuration.amount * quantity,
            configuration.max - (configuration.isPercentage
                ? getEffectiveStat(configuration.stat)
                : hero[configuration.stat])
        );
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
    if (hero.hp >= getEffectiveStat('maxHp') && hero.foco >= getEffectiveStat('maxFoco')) {
        logMessage(t("hpFull"));
        return;
    }

    hero.potions--;
    const heal = POTION_HEAL_AMOUNT_HP;
    const hpRecovered = Math.min(heal, getEffectiveStat('maxHp') - hero.hp);
    hero.hp += hpRecovered;
    const foco = POTION_HEAL_AMOUNT_FOCO;
    const focusRecovered = Math.min(foco, getEffectiveStat('maxFoco') - hero.foco);
    hero.foco += focusRecovered;
    logMessage(t("potionHeal", {
        amount_hp: hpRecovered,
        amount_foco: focusRecovered
    }), "discovery");
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
    const maxHp = getEffectiveStat('maxHp');
    const maxFoco = getEffectiveStat('maxFoco');
    if (hero.hp >= maxHp && hero.foco >= maxFoco) {
        logMessage(t("alreadyRested"));
        return;
    }
    hero.gold -= CAMP_COST;
    const hpRecovery = Math.max(
        1,
        Math.floor(maxHp * CAMP_HP_RECOVERY_PERCENT / GAME_RULES.probabilityScale)
    );
    const focusRecovery = Math.max(
        1,
        Math.floor(maxFoco * CAMP_FOCO_RECOVERY_PERCENT / GAME_RULES.probabilityScale)
    );
    const hpRecovered = Math.min(hpRecovery, maxHp - hero.hp);
    const focusRecovered = Math.min(focusRecovery, maxFoco - hero.foco);
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

    const equipmentDrop = createEquipmentDrop();
    inCombat = false;
    currentMonster = null;

    checkLevelUp();
    if (equipmentDrop) handleEquipmentDrop(equipmentDrop);
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

function startAdventure({ character, equipment }) {
    selectedCharacterProgression = character.levelUp;
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
    document.getElementById('game-main').hidden = false;
    document.getElementById('game-start-screen').hidden = true;
    document.body.classList.remove('game-start-active');
    updateUI();
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

window.onload = function() {
    applyLanguage();
    window.YaraRpgCharacterSetup.initialize({
        translate: t,
        describeEquipment: getItemBonusText,
        onStart: startAdventure
    });
};

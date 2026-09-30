let gameLanguage = new URLSearchParams(window.location.search).get("lang");
if (gameLanguage !== "en" && gameLanguage !== "pt") {
    gameLanguage = document.documentElement.lang.startsWith("en") ? "en" : "pt";
}

const translations = {
    pt: {
        documentTitle: "Yara: A Regra do Sino - Mini RPG",
        gameNav: "Navegação do jogo",
        languageLabel: "Idioma do jogo",
        backToSite: "Voltar ao site",
        gameLabel: "Mini RPG · Floresta Sombria",
        title: "YARA: A REGRA DO SINO",
        subtitle: "Crônicas de Sobrevivência na Floresta Sombria",
        level: "Nível",
        gold: "Ouro:",
        experience: "XP:",
        focus: "Foco (Estamina)",
        attack: "Ataque",
        defense: "Defesa",
        potions: "Poções de Cura",
        available: "disponíveis",
        drink: "Beber",
        danger: "Perigo na Névoa",
        explorationIntro: "🌲 O sino tocou tarde demais. A névoa esconde o espírito do rio, segredos sombrios e feras famintas. O que você fará?",
        openingLog: "[Início] Zeph avança sozinho pela Floresta Sombria. Mantenha sua arma em punho.",
        explore: "Explorar a Trilha na Névoa",
        camp: "Acampar e Recuperar Fôlego",
        quickAttack: "Ataque Rápido",
        heavyAttack: "Estocada Pesada",
        focusCost: "(15 Foco)",
        defend: "Postura Firme",
        run: "Fugir na Névoa",
        footer: "Yara Demon Hunter: A Vingança • Mini RPG Interativo de Navegador",
        injured: "Você está ferido demais! Descanse no acampamento.",
        goldFound: "Você vasculhou as margens e encontrou <span class=\"text-amber-300\">{amount} de ouro</span> esquecido na lama!",
        safeTrail: "✨ Você encontrou um rastro seguro e recuperou <span class=\"text-emerald-300\">{amount} HP</span> de fôlego.",
        denseMist: "A névoa densa dificulta a visão. Apenas o som do vento e das risadas ecoam ao longe.",
        monsterAppears: "⚠ Um perigo surgiu na escuridão: <span class=\"text-red-400 font-bold\">{monster}</span> bloqueia o caminho!",
        quickDamage: "Você desferiu um <span class=\"text-emerald-400 font-bold\">Ataque Rápido</span> causando {damage} de dano.",
        noFocus: "Você está sem foco para uma Estocada Pesada! Recupere-se.",
        heavyDamage: "💥 Você executou uma <span class=\"text-amber-400 font-bold\">Estocada Pesada</span> com o machado causando {damage} de dano!",
        defendMessage: "🛡️ Você adotou uma postura defensiva, blindando sua guarda e recuperando foco.",
        monsterDamage: "O {monster} contra-atacou causando <span class=\"text-red-400 font-bold\">{damage} de dano</span>!",
        noPotions: "Você não tem poções restantes!",
        hpFull: "Seu HP já está no máximo!",
        potionHeal: "🧪 Você bebeu uma poção e recuperou <span class=\"text-emerald-400\">{amount} HP</span>.",
        potionOpening: "O monstro aproveitou o seu momento de distração!",
        alreadyRested: "Você já está com HP e Foco completos.",
        rested: "⛺ Você descansou na segurança do acampamento. HP e Foco totalmente restaurados.",
        escaped: "💨 Você conseguiu escapar correndo pela névoa densa!",
        escapeFailed: "❌ A tentativa de fuga falhou! O {monster} cortou seu caminho.",
        victory: "🎉 Vitória! Você derrotou o <span class=\"text-amber-300 font-bold\">{monster}</span>!",
        rewards: "Recompensas: <span class=\"text-purple-300\">+{xp} XP</span> e <span class=\"text-amber-300\">+{gold} de Ouro</span>",
        defeat: "💀 Zeph caiu na Floresta Sombria...",
        defeatHelp: "Use o botão de Descanso no Acampamento para recuperar o fôlego.",
        levelUp: "⭐ <span class=\"text-amber-400 font-bold uppercase\">Subiu de Nível!</span> Zeph alcançou o Nível {level}! Atributos aprimorados!"
    },
    en: {
        documentTitle: "Yara: The Bell's Rule - Mini RPG",
        gameNav: "Game navigation",
        languageLabel: "Game language",
        backToSite: "Back to website",
        gameLabel: "Mini RPG · Dark Forest",
        title: "YARA: THE BELL'S RULE",
        subtitle: "Survival Tales from the Dark Forest",
        level: "Level",
        gold: "Gold:",
        experience: "XP:",
        focus: "Focus (Stamina)",
        attack: "Attack",
        defense: "Defense",
        potions: "Healing Potions",
        available: "available",
        drink: "Drink",
        danger: "Danger in the Mist",
        explorationIntro: "🌲 The bell rang too late. The mist hides the river spirit, dark secrets, and hungry beasts. What will you do?",
        openingLog: "[Start] Zeph ventures alone into the Dark Forest. Keep your weapon ready.",
        explore: "Explore the Misty Trail",
        camp: "Rest and Recover",
        quickAttack: "Quick Attack",
        heavyAttack: "Heavy Strike",
        focusCost: "(15 Focus)",
        defend: "Brace for Impact",
        run: "Flee into the Mist",
        footer: "Yara Demon Hunter: The Vengeance • Browser Mini RPG",
        injured: "You are too badly hurt. Rest at camp.",
        goldFound: "You searched the riverbank and found <span class=\"text-amber-300\">{amount} gold</span> buried in the mud!",
        safeTrail: "✨ You found a safe trail and recovered <span class=\"text-emerald-300\">{amount} HP</span>.",
        denseMist: "The dense mist makes it hard to see. Only the wind and distant laughter answer.",
        monsterAppears: "⚠ A threat emerges from the dark: <span class=\"text-red-400 font-bold\">{monster}</span> blocks your path!",
        quickDamage: "You land a <span class=\"text-emerald-400 font-bold\">Quick Attack</span> for {damage} damage.",
        noFocus: "You do not have enough Focus for a Heavy Strike. Recover first.",
        heavyDamage: "💥 Your <span class=\"text-amber-400 font-bold\">Heavy Strike</span> deals {damage} damage!",
        defendMessage: "🛡️ You brace yourself, strengthening your guard and recovering Focus.",
        monsterDamage: "The {monster} counterattacks for <span class=\"text-red-400 font-bold\">{damage} damage</span>!",
        noPotions: "You have no potions left!",
        hpFull: "Your HP is already full!",
        potionHeal: "🧪 You drink a potion and recover <span class=\"text-emerald-400\">{amount} HP</span>.",
        potionOpening: "The monster takes advantage of your distraction!",
        alreadyRested: "Your HP and Focus are already full.",
        rested: "⛺ You rest safely at camp. HP and Focus are fully restored.",
        escaped: "💨 You escape into the thick mist!",
        escapeFailed: "❌ You fail to escape! The {monster} cuts off your path.",
        victory: "🎉 Victory! You defeated <span class=\"text-amber-300 font-bold\">{monster}</span>!",
        rewards: "Rewards: <span class=\"text-purple-300\">+{xp} XP</span> and <span class=\"text-amber-300\">+{gold} Gold</span>",
        defeat: "💀 Zeph falls in the Dark Forest...",
        defeatHelp: "Use Rest at Camp to recover your strength.",
        levelUp: "⭐ <span class=\"text-amber-400 font-bold uppercase\">Level Up!</span> Zeph reached Level {level}! Your stats improved!"
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

const hero = {
    name: "Zeph",
    level: 1,
    hp: 100,
    maxHp: 100,
    foco: 50,
    maxFoco: 50,
    atk: 14,
    def: 6,
    gold: 15,
    xp: 0,
    maxXp: 30,
    potions: 3,
    defending: false
};

const monsterPool = [
    { name: { pt: "Lobo Sombriço", en: "Shadow Wolf" }, icon: "🐺", minLevel: 1, hp: 35, atk: 12, def: 3, xpReward: 15, goldReward: 8 },
    { name: { pt: "Espírito do Rio", en: "River Spirit" }, icon: "👻", minLevel: 1, hp: 45, atk: 14, def: 4, xpReward: 20, goldReward: 12 },
    { name: { pt: "Bruxa de Feições Cadavéricas", en: "Corpse-faced Witch" }, icon: "🧙‍♀️", minLevel: 2, hp: 60, atk: 18, def: 6, xpReward: 30, goldReward: 20 },
    { name: { pt: "Criatura Corrompida das Sombras", en: "Corrupted Shadow Creature" }, icon: "👤", minLevel: 3, hp: 90, atk: 22, def: 8, xpReward: 45, goldReward: 35 }
];

let currentMonster = null;
let inCombat = false;

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
    document.getElementById('hero-atk').innerText = hero.atk;
    document.getElementById('hero-def').innerText = hero.def;
    document.getElementById('hero-potions').innerText = hero.potions;

    const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
    document.getElementById('hero-hp-bar').style.width = hpPercent + '%';

    const focoPercent = Math.max(0, Math.min(100, (hero.foco / hero.maxFoco) * 100));
    document.getElementById('hero-foco-bar').style.width = focoPercent + '%';

    const exploreControls = document.getElementById('controls-explore');
    const combatControls = document.getElementById('controls-combat');
    const encounterCard = document.getElementById('encounter-card');
    const explorationBanner = document.getElementById('exploration-banner');

    if (inCombat) {
        exploreControls.classList.add('hidden');
        combatControls.classList.remove('hidden');
        encounterCard.classList.remove('hidden');
        explorationBanner.classList.add('hidden');
    } else {
        exploreControls.classList.remove('hidden');
        combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden');
        explorationBanner.classList.remove('hidden');
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
    if (hero.hp <= 0) {
            logMessage(t("injured"), "combat-monster");
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
    } else {
        logMessage(t("denseMist"));
    }
}

function spawnMonster() {
    const availableMonsters = monsterPool.filter(m => m.minLevel <= hero.level + 1);
    const template = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    
    const scaleFactor = 1 + (hero.level - 1) * 0.2;
    currentMonster = {
        name: template.name[gameLanguage],
        icon: template.icon,
        hp: Math.floor(template.hp * scaleFactor),
        maxHp: Math.floor(template.hp * scaleFactor),
        atk: Math.floor(template.atk * scaleFactor),
        def: Math.floor(template.def * scaleFactor),
        xpReward: Math.floor(template.xpReward * scaleFactor),
        goldReward: Math.floor(template.goldReward * scaleFactor)
    };

    inCombat = true;
    hero.defending = false;

    document.getElementById('monster-name').innerText = currentMonster.name;
    document.getElementById('monster-hp').innerText = currentMonster.hp;
    document.getElementById('monster-hp-max').innerText = currentMonster.maxHp;
    document.getElementById('monster-icon').innerText = currentMonster.icon;
    document.getElementById('monster-hp-bar').style.width = '100%';

    logMessage(t("monsterAppears", { monster: currentMonster.name }), "combat-monster");
    updateUI();
}

// NOVO GOLPE: Ataque Rápido (Mais preciso, dano moderado)
function combatQuickAttack() {
    if (!inCombat || !currentMonster) return;
    hero.defending = false;

    let damage = Math.max(4, Math.floor(hero.atk * 0.8) - currentMonster.def + Math.floor(Math.random() * 4));
    currentMonster.hp = Math.max(0, currentMonster.hp - damage);
    
    logMessage(t("quickDamage", { damage }), "combat-hero");
    checkCombatProgress();
}

// NOVO GOLPE: Estocada Pesada (Gasta Foco, dano alto)
function combatHeavyAttack() {
    if (!inCombat || !currentMonster) return;
    if (hero.foco < 15) {
        logMessage(t("noFocus"));
        return;
    }
    hero.foco -= 15;
    hero.defending = false;

    let damage = Math.max(8, Math.floor(hero.atk * 1.5) - currentMonster.def + Math.floor(Math.random() * 6));
    currentMonster.hp = Math.max(0, currentMonster.hp - damage);
    
    logMessage(t("heavyDamage", { damage }), "combat-hero");
    checkCombatProgress();
}

// NOVO GOLPE: Postura Firme (Aumenta defesa e recupera foco)
function combatDefend() {
    if (!inCombat || !currentMonster) return;
    hero.defending = true;
    hero.foco = Math.min(hero.maxFoco, hero.foco + 20);
    logMessage(t("defendMessage"), "special");
    
    setTimeout(() => {
        if (inCombat && currentMonster) monsterAttackTurn();
    }, 400);
    updateUI();
}

function checkCombatProgress() {
    updateMonsterUI();
    if (currentMonster.hp <= 0) {
        endCombatVictory();
        return;
    }
    setTimeout(() => {
        if (inCombat && currentMonster) monsterAttackTurn();
    }, 500);
}

function monsterAttackTurn() {
    if (!inCombat || !currentMonster) return;

    let mitigation = hero.defending ? hero.def * 2 : hero.def;
    let monsterDamage = Math.max(2, currentMonster.atk - mitigation + Math.floor(Math.random() * 4));
    
    hero.hp = Math.max(0, hero.hp - monsterDamage);
    hero.defending = false; // reseta a postura

    logMessage(t("monsterDamage", { monster: currentMonster.name, damage: monsterDamage }), "combat-monster");
    updateUI();

    if (hero.hp <= 0) {
        endCombatDefeat();
    }
}

function updateMonsterUI() {
    document.getElementById('monster-hp').innerText = currentMonster.hp;
    const hpPercent = Math.max(0, Math.min(100, (currentMonster.hp / currentMonster.maxHp) * 100));
    document.getElementById('monster-hp-bar').style.width = hpPercent + '%';
}

function usePotion() {
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
    if (inCombat) return;
    if (hero.hp >= hero.maxHp && hero.foco >= hero.maxFoco) {
        logMessage(t("alreadyRested"));
        return;
    }
    hero.hp = hero.maxHp;
    hero.foco = hero.maxFoco;
    logMessage(t("rested"), "discovery");
    updateUI();
}

function combatRun() {
    if (!inCombat) return;
    const success = Math.random() < 0.7;
    if (success) {
        logMessage(t("escaped"), "discovery");
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
    updateUI();
}

function checkLevelUp() {
    if (hero.xp >= hero.maxXp) {
        hero.level++;
        hero.xp -= hero.maxXp;
        hero.maxXp = Math.floor(hero.maxXp * 1.5);
        
        hero.maxHp += 25;
        hero.hp = hero.maxHp;
        hero.maxFoco += 15;
        hero.foco = hero.maxFoco;
        hero.atk += 4;
        hero.def += 2;

        logMessage(t("levelUp", { level: hero.level }), "discovery");
    }
}

window.onload = function() {
    applyLanguage();
    updateUI();
};

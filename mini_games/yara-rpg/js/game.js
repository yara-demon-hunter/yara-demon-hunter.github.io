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
        setupDescription: "Cada caçador tem uma força diferente. Depois, escolha os equipamentos iniciais para levar.",
        selectCharacter: "Personagem",
        selectStarterEquipment: "Escolha {count} equipamentos",
        starterEquipmentHelp: "Escolha equipamentos de espaços diferentes. Selecione novamente um espaço para trocar sua escolha.",
        characterSpecialty: "+{amount} {stat}",
        levelUpSummary: "Por nível",
        heavySkillSummary: "Estocada pesada: {cost} Foco, dano x{damage} ATQ",
        parrySkillSummary: "Postura firme: {cost} Foco, +{bonus}% aparo",
        dodgeSkillSummary: "Preparar esquiva: {cost} Foco, +{bonus}% esquiva",
        skillLimitsSummary: "Limites — esquiva {evasion}%, aparo {parry}%",
        backToTitle: "Voltar",
        beginAdventure: "Iniciar aventura",
        continueAdventure: "Continuar jornada salva",
        storyEventKicker: "Escolha seu caminho",
        enemyTelegraph: "⚠️ {monster} prepara um golpe devastador!",
        campaignVictoryTitle: "Jornada concluída",
        campaignVictoryDescription: "Você superou os desafios da floresta. A jornada termina aqui — por enquanto.",
        campaignDefeatTitle: "A névoa venceu esta vez",
        campaignDefeatDescription: "A floresta ainda guarda seu sino. Reúna forças e tente outra vez.",
        eventLoot: "Você encontra provisões e {gold} moedas.",
        eventHeal: "Você recupera {hp} HP e {focus} de Foco.",
        eventGold: "A troca rende {gold} moedas, mas custa {hp} HP.",
        eventPower: "O fragmento fortalece seu ataque em {amount}.",
        eventRiverCrossing: "🌊 Você atravessa a correnteza e encontra {gold} moedas presas entre as pedras, mas perde {hp} HP.",
        eventRiverbank: "🌿 Seguindo pela margem, você encontra uma trilha segura e recupera {hp} HP e {focus} de Foco.",
        eventPotion: "🧪 Você encontra uma poção escondida. Poções: {potions}/{capacity}.",
        eventPotionFull: "A cabana está vazia; sua mochila de poções já está cheia.",
        eventPortalTreasure: "💰 Você cruza a ponte em ruínas e apanha {gold} moedas antes que ela desabe.",
        eventScout: "👁️ Você observa os invasores sem ser visto e recupera {focus} de Foco antes de seguir.",
        eventCastleCache: "🛡️ Você desarma as armadilhas e encontra {gold} moedas e uma poção.",
        eventAnimalGold: "🌫️ Você ataca o esconderijo e encontra {gold} moedas entre os pertences deixados pelo animal.",
        eventAnimalPet: "🐾 Você se aproxima com cuidado e conquista a confiança de {animal}. Ele passa a acompanhar sua jornada.",
        level: "Nível",
        gold: "Ouro:",
        experience: "XP:",
        focus: "Foco",
        fury: "Fúria",
        attack: "Ataque",
        defense: "Defesa",
        attributes: "Atributos",
        equipment: "Equipamento",
        equipmentSummary: "Equipamento, {count} de 10 equipados",
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
        itemsDiscarded: "🗑️ {count} itens descartados da mochila.",
        selectedItemsCount: "{count} selecionados",
        discardSelectedItems: "Descartar selecionados",
        selectInventoryItem: "Selecionar {item} para descartar",
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
        necklace: "Colar",
        ring: "Anel",
        accessory: "Acessório",
        pet: "Companheiro",
        equip: "Equipar",
        unequip: "Desequipar",
        upgradeEquipmentButton: "Aprimorar +{level} · {cost} 🪙",
        upgradeEquipmentMaxed: "Nível máximo +{level}",
        equipmentUpgradePurchased: "🔧 {item} aprimorado para +{level} por {cost} moedas.",
        abyssalChallengeAccepted: "⚔️ Você aceita o desafio. O Arauto do Abismo avança para esmagar quem ousar enfrentá-lo!",
        abyssalChallengeRetreat: "Você recua da fenda e decide se preparar melhor antes de encarar o Arauto.",
        abyssalChallengeReward: "🏆 O Arauto caiu! Entre seus restos há um equipamento {rarity}.",
        itemFound: "✨ Item encontrado: <span class=\"text-amber-300 font-bold\">{item}</span> ({slot}).",
        itemEquipped: "⚔️ {item} equipado em {slot}.",
        itemStored: "🎒 {item} guardado na mochila.",
        itemDropTitle: "Equipamento encontrado",
        itemDropPrompt: "Compare os dois equipamentos e escolha qual quer usar.",
        itemDropChoiceHelp: "Equipar o novo guarda o atual na mochila; manter o atual guarda o item encontrado.",
        newEquipmentLabel: "Encontrado",
        equippedEquipmentLabel: "Equipado",
        noEquipmentBonuses: "Sem bônus de atributos",
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
        potions: "Poções",
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
        passiveSkill: "Passivas",
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
        noParryFocus: "Você precisa de {cost} de Foco para preparar um aparo.",
        parryMaxed: "A chance de aparo já está no limite de {max}% nesta luta.",
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
        noDodgeFocus: "Você precisa de {cost} de Foco para preparar uma esquiva.",
        evasionMaxed: "A chance de esquiva já está no limite de {max}% nesta luta.",
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
        setupDescription: "Each hunter has a different strength. Then choose your starting equipment.",
        selectCharacter: "Character",
        selectStarterEquipment: "Choose {count} pieces of equipment",
        starterEquipmentHelp: "Choose equipment for different slots. Select another item for a slot to replace your choice.",
        characterSpecialty: "+{amount} {stat}",
        levelUpSummary: "Per level",
        heavySkillSummary: "Heavy strike: {cost} Focus, x{damage} ATK damage",
        parrySkillSummary: "Firm stance: {cost} Focus, +{bonus}% parry",
        dodgeSkillSummary: "Prepare dodge: {cost} Focus, +{bonus}% evasion",
        skillLimitsSummary: "Limits — evasion {evasion}%, parry {parry}%",
        backToTitle: "Back",
        beginAdventure: "Begin adventure",
        continueAdventure: "Continue saved journey",
        storyEventKicker: "Choose your path",
        enemyTelegraph: "⚠️ {monster} is preparing a devastating strike!",
        campaignVictoryTitle: "Journey complete",
        campaignVictoryDescription: "You have overcome the forest's challenges. The journey ends here — for now.",
        campaignDefeatTitle: "The mist won this time",
        campaignDefeatDescription: "The forest still guards its bell. Gather your strength and try again.",
        eventLoot: "You find supplies and {gold} coins.",
        eventHeal: "You recover {hp} HP and {focus} Focus.",
        eventGold: "The trade earns {gold} coins but costs {hp} HP.",
        eventPower: "The shard strengthens your attack by {amount}.",
        eventRiverCrossing: "🌊 You cross the current and find {gold} coins caught between the stones, but lose {hp} HP.",
        eventRiverbank: "🌿 Following the riverbank, you find a safe trail and recover {hp} HP and {focus} Focus.",
        eventPotion: "🧪 You find a hidden potion. Potions: {potions}/{capacity}.",
        eventPotionFull: "The cabin is empty; your potion pack is already full.",
        eventPortalTreasure: "💰 You rush across the crumbling bridge and grab {gold} coins before it collapses.",
        eventScout: "👁️ You watch the invaders unseen and recover {focus} Focus before moving on.",
        eventCastleCache: "🛡️ You disarm the traps and find {gold} coins and a potion.",
        eventAnimalGold: "🌫️ You strike the hiding place and find {gold} coins among the animal's abandoned belongings.",
        eventAnimalPet: "🐾 You approach carefully and earn {animal}'s trust. It joins your journey.",
        level: "Level",
        gold: "Gold:",
        experience: "XP:",
        focus: "Focus",
        fury: "Fury",
        attack: "Attack",
        defense: "Defense",
        attributes: "Stats",
        equipment: "Equipment",
        equipmentSummary: "Equipment, {count} of 10 equipped",
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
        itemsDiscarded: "🗑️ {count} items discarded from your bag.",
        selectedItemsCount: "{count} selected",
        discardSelectedItems: "Discard selected",
        selectInventoryItem: "Select {item} to discard",
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
        necklace: "Necklace",
        ring: "Ring",
        accessory: "Accessory",
        pet: "Companion",
        equip: "Equip",
        unequip: "Unequip",
        upgradeEquipmentButton: "Upgrade +{level} · {cost} 🪙",
        upgradeEquipmentMaxed: "Max level +{level}",
        equipmentUpgradePurchased: "🔧 {item} upgraded to +{level} for {cost} gold.",
        abyssalChallengeAccepted: "⚔️ You accept the challenge. The Abyssal Herald advances to crush anyone who dares face it!",
        abyssalChallengeRetreat: "You withdraw from the rift and decide to prepare before facing the Herald.",
        abyssalChallengeReward: "🏆 The Herald has fallen! Its remains hold {rarity} equipment.",
        itemFound: "✨ Item found: <span class=\"text-amber-300 font-bold\">{item}</span> ({slot}).",
        itemEquipped: "⚔️ {item} equipped in {slot}.",
        itemStored: "🎒 {item} stored in your bag.",
        itemDropTitle: "Equipment found",
        itemDropPrompt: "Compare both pieces of equipment and choose which one to use.",
        itemDropChoiceHelp: "Equipping the new item moves the current one to your bag; keeping the current item stores the find.",
        newEquipmentLabel: "Found",
        equippedEquipmentLabel: "Equipped",
        noEquipmentBonuses: "No stat bonuses",
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
        potions: "Potions",
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
        passiveSkill: "Passive skills",
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
        noParryFocus: "You need {cost} Focus to prepare a parry.",
        parryMaxed: "Parry chance is already at the {max}% limit for this fight.",
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
        noDodgeFocus: "You need {cost} Focus to prepare a dodge.",
        evasionMaxed: "Evasion is already at the {max}% limit for this fight.",
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
    return (translations[gameLanguage][key] ?? key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function saveGame() {
    if (!selectedCharacter || document.getElementById('game-main').hidden || campaignComplete) return;
    const snapshot = {
        version: 1, characterId: selectedCharacter.id, hero: JSON.parse(JSON.stringify(hero)), inCombat,
        currentRegion, discoveredRegions, explorationsSinceMistContact, explorationCount,
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
const EQUIPMENT_BAG_CAPACITY = 10;
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
    bagButton.setAttribute('aria-label', t('openEquipmentBag', { count: bagCount }));

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
    for (let index = 0; index < EQUIPMENT_BAG_CAPACITY; index++) {
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
        t('bagCapacity', { count: bagCount })
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
        logMessage(t('inventoryFull'), 'loot');
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
        logMessage(t('inventoryFull'), 'loot');
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

function exploreForest() {
    if (inCombat || gameOver || campaignComplete || pendingMistContact || pendingStoryEvent) return;
    if (hero.hp <= 0) {
            logMessage(t("injured"), "combat-monster");
        return;
    }

    explorationsSinceMistContact++;
    explorationCount++;
    if (tryDiscoverRegion()) {
        updateUI();
        return;
    }

    const regionData = GAME_DATA.regions[currentRegion];
    const regionEvents = Array.isArray(regionData.event) ? regionData.event : [regionData.event].filter(Boolean);
    const unseenEvents = regionEvents.filter((event) =>
        !seenStoryEvents.has(`${regionData.id}:${event.id || event.title.pt}`)
    );
    if (unseenEvents.length && explorationCount >= 2) {
        pendingStoryEvent = unseenEvents[Math.floor(Math.random() * unseenEvents.length)];
        storyEventSeen.add(regionData.id);
        seenStoryEvents.add(`${regionData.id}:${pendingStoryEvent.id || pendingStoryEvent.title.pt}`);
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

function resolveStoryEvent(choiceIndex) {
    if (!pendingStoryEvent || inCombat || gameOver || campaignComplete) return;
    const event = pendingStoryEvent;
    const choice = event.choices[choiceIndex];
    if (!choice) return;
    const effect = choice.effect;
    const eventSeenKey = `${GAME_DATA.regions[currentRegion].id}:${event.id || event.title.pt}`;
    pendingStoryEvent = null;
    if (effect === 'abyssal-challenge') {
        const boss = SPECIAL_MONSTERS.find((monster) => monster.id === 'abyssal-herald');
        if (!boss) {
            logMessage(t('denseMist'));
            updateUI();
            return;
        }
        const finalRegionIndex = GAME_DATA.regions.length - 1;
        const challengeRewardRarities = currentRegion === finalRegionIndex
            ? ['demon', 'god']
            : ['epic', 'legendary'];
        logMessage(t('abyssalChallengeAccepted'), 'combat-monster');
        spawnMonster({ ...boss, challengeRewardRarities });
        return;
    } else if (effect === 'abyssal-challenge-retreat') {
        seenStoryEvents.delete(eventSeenKey);
        logMessage(t('abyssalChallengeRetreat'), 'special');
    } else if (effect === 'animal-event-gold') {
        const lootRules = GAME_RULES.loot;
        const gold = lootRules.animalEventGoldMinimum
            + Math.floor(Math.random() * lootRules.animalEventGoldRange);
        hero.gold += gold;
        logMessage(t('eventAnimalGold', { gold }), 'loot');
    } else if (effect === 'animal-event-pet') {
        const pets = ITEM_DATA.equipment.filter((item) => item.slot === 'pet');
        const petTemplate = pets[Math.floor(Math.random() * pets.length)];
        if (!petTemplate) {
            logMessage(t('denseMist'));
        } else {
            logMessage(t('eventAnimalPet', { animal: petTemplate.name[gameLanguage] }), 'special');
            handleEquipmentDrop(createEquipmentInstance(petTemplate, rollEquipmentRarity()));
        }
    } else if (effect === 'loot') {
        const gold = 35 + Math.floor(Math.random() * 26); hero.gold += gold;
        logMessage(t('eventLoot', { gold }), 'loot');
    } else if (effect === 'heal') {
        const hp = Math.min(45, getEffectiveStat('maxHp') - hero.hp);
        const focus = Math.min(20, getEffectiveStat('maxFoco') - hero.foco);
        hero.hp += hp; hero.foco += focus;
        logMessage(t('eventHeal', { hp, focus }), 'special');
    } else if (effect === 'gold') {
        const gold = 55; const hp = Math.min(12, Math.max(0, hero.hp - 1));
        hero.gold += gold; hero.hp -= hp;
        logMessage(t('eventGold', { gold, hp }), 'loot');
    } else if (effect === 'power') {
        hero.atk += 4; logMessage(t('eventPower', { amount: 4 }), 'special');
    } else if (effect === 'river-crossing') {
        const gold = 30 + Math.floor(Math.random() * 21);
        const hp = Math.min(15, Math.max(0, hero.hp - 1));
        hero.gold += gold; hero.hp -= hp;
        logMessage(t('eventRiverCrossing', { gold, hp }), 'loot');
    } else if (effect === 'riverbank') {
        const hp = Math.min(20, getEffectiveStat('maxHp') - hero.hp);
        const focus = Math.min(12, getEffectiveStat('maxFoco') - hero.foco);
        hero.hp += hp; hero.foco += focus;
        logMessage(t('eventRiverbank', { hp, focus }), 'special');
    } else if (effect === 'potion') {
        if (hero.potions < hero.maxPotions) {
            hero.potions++;
            logMessage(t('eventPotion', { potions: hero.potions, capacity: hero.maxPotions }), 'loot');
        } else logMessage(t('eventPotionFull'), 'normal');
    } else if (effect === 'portal-treasure') {
        const gold = 65 + Math.floor(Math.random() * 36); hero.gold += gold;
        logMessage(t('eventPortalTreasure', { gold }), 'loot');
    } else if (effect === 'village-scout') {
        const focus = Math.min(18, getEffectiveStat('maxFoco') - hero.foco);
        hero.foco += focus; logMessage(t('eventScout', { focus }), 'special');
    } else if (effect === 'castle-cache') {
        const gold = 45;
        hero.gold += gold;
        if (hero.potions < hero.maxPotions) hero.potions++;
        logMessage(t('eventCastleCache', { gold }), 'loot');
    } else if (effect === 'combat') {
        spawnMonster(); return;
    }
    updateUI();
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
    explorationCount = 0;
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
        goldReward: vary(template.goldReward),
        id: template.id || null,
        isBoss: isMistBoss,
        challengeRewardRarities: template.challengeRewardRarities || null
    };

    inCombat = true;
    combatEncounterId++;
    combatActionLocked = false;
    document.getElementById('rpg-log').dataset.combat = 'true';
    enemyTurnCount = 0; enemyTelegraphing = false;
    parrySkillUsedThisCombat = false;
    dodgeSkillUsedThisCombat = false;
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
    setCombatMusic(true);
}

function acceptMistContact() {
    if (!pendingMistContact || inCombat || gameOver) return;

    const contact = pendingMistContact;
    pendingMistContact = null;
    logMessage(t('mistContactAccepted', { contact: contact.name[gameLanguage] }), 'special');

    if (contact.onAccept?.type === 'boss') {
        const missionBoss = SPECIAL_MONSTERS.find(
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

    const boss = MIST_CONTACT_SYSTEM.chooseBoss(SPECIAL_MONSTERS, hero.level);
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
    if (!inCombat || !currentMonster) return;
    combatActionLocked = true;
    enemyTelegraphing = false;
    const encounterId = combatEncounterId;
    damage = applyMonsterParry(damage);
    if (!inCombat || !currentMonster || encounterId !== combatEncounterId) return;
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
    updateUI();
}

// NOVO GOLPE: Ataque Rápido (Mais preciso, dano moderado)
function combatQuickAttack() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    if (hero.fury >= hero.maxFury) {
        combatCriticalAttack();
        return;
    }
    combatActionLocked = true;
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
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    const attackRules = { ...GAME_RULES.combat.heavyAttack, ...selectedCharacter.skills.heavyAttack };
    if (hero.foco < attackRules.focoCost) {
        logMessage(t("noFocus"));
        return;
    }
    combatActionLocked = true;
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
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked || hero.fury < hero.maxFury) return;
    combatActionLocked = true;
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
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    const bonusGained = Math.min(
        selectedCharacter.skills.parry.bonus,
        selectedCharacter.skills.maxParry - getEffectiveStat('parry') - hero.parryBonus
    );
    if (bonusGained <= 0) {
        logMessage(t('parryMaxed', { max: selectedCharacter.skills.maxParry }));
        return;
    }
    if (hero.foco < selectedCharacter.skills.parry.focoCost) {
        logMessage(t('noParryFocus', { cost: selectedCharacter.skills.parry.focoCost }));
        return;
    }
    if (parrySkillUsedThisCombat) return;
    combatActionLocked = true;
    parrySkillUsedThisCombat = true;
    hero.foco -= selectedCharacter.skills.parry.focoCost;
    hero.parryBonus += bonusGained;
    logMessage(t('defendMessage', { amount: bonusGained }), 'special');

    monsterAttackTurn();
    updateUI();
}

function combatDodge() {
    if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
    const bonusGained = Math.min(
        selectedCharacter.skills.dodge.bonus,
        selectedCharacter.skills.maxEvasion - getEffectiveStat('evasion') - hero.evasionBonus
    );
    if (bonusGained <= 0) {
        logMessage(t("evasionMaxed", { max: selectedCharacter.skills.maxEvasion }));
        return;
    }
    if (hero.foco < selectedCharacter.skills.dodge.focoCost) {
        logMessage(t("noDodgeFocus", { cost: selectedCharacter.skills.dodge.focoCost }));
        return;
    }
    if (dodgeSkillUsedThisCombat) return;
    combatActionLocked = true;
    dodgeSkillUsedThisCombat = true;
    hero.foco -= selectedCharacter.skills.dodge.focoCost;
    hero.defending = false;
    hero.evasionBonus += bonusGained;
    logMessage(t("dodgeMessage", { amount: bonusGained }), "special");

    monsterAttackTurn();
    updateUI();
}

function checkCombatProgress(monsterStunned = false) {
    if (!inCombat || !currentMonster) return;
    updateMonsterUI();
    if (currentMonster.hp <= 0) {
        endCombatVictory();
        return;
    }
    if (monsterStunned) {
        combatActionLocked = false;
        updateUI();
        return;
    }
    monsterAttackTurn();
}

function monsterAttackTurn() {
    if (!inCombat || !currentMonster || !combatActionLocked) return;
    const encounterId = combatEncounterId;
    enemyTurnCount++;
    const wasTelegraphing = enemyTelegraphing;
    enemyTelegraphing = false;

    const evasionChance = Math.min(selectedCharacter.skills.maxEvasion, getEffectiveStat('evasion') + hero.evasionBonus);
    const evaded = Math.random() * GAME_RULES.probabilityScale < evasionChance;
    if (evaded) {
        playSound('dodge');
        hero.defending = false;
        const furyGained = Math.min(FURY_PER_DODGE, hero.maxFury - hero.fury);
        hero.fury += furyGained;
        logMessage(t("heroDodges", { monster: currentMonster.name, amount: furyGained }), "special");
        if (encounterId !== combatEncounterId || !inCombat) return;
        combatActionLocked = false;
        updateUI();
        return;
    }

    const attackRules = GAME_RULES.combat.monsterAttack;
    let monsterDamage = Math.max(
        attackRules.minimumDamage,
        currentMonster.atk - getEffectiveStat('def') + Math.floor(Math.random() * attackRules.randomBonusRange)
    );
    if (wasTelegraphing) monsterDamage = Math.floor(monsterDamage * GAME_RULES.combat.enemyTelegraphDamageMultiplier);
    const parryChance = Math.min(selectedCharacter.skills.maxParry, getEffectiveStat('parry') + hero.parryBonus);
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
    if (damageTaken) {
        const panel = document.getElementById('game-panel');
        panel.classList.remove('is-hit'); void panel.offsetWidth; panel.classList.add('is-hit');
    }
    hero.fury = Math.min(hero.maxFury, hero.fury + damageTaken * FURY_PER_DAMAGE);
    logMessage(parried
        ? t('heroParries', { damage: damageTaken })
        : t("monsterDamage", { monster: currentMonster.name, damage: damageTaken }), parried ? 'special' : 'combat-monster');
    if (encounterId !== combatEncounterId || !inCombat) return;
    updateUI();

    if (hero.hp <= 0) {
        endCombatDefeat();
        return;
    }
    if (enemyTurnCount % GAME_RULES.combat.telegraphEveryTurns === 0) {
        enemyTelegraphing = true;
        logMessage(t('enemyTelegraph', { monster: currentMonster.name }), 'combat-monster');
    }
    combatActionLocked = false;
    updateUI();
}

function isUpgradeMaxed(upgrade, overrideConfiguration = UPGRADE_CONFIG[upgrade]) {
    const configuration = overrideConfiguration;
    if (configuration?.max === undefined) return false;
    const currentValue = configuration.isPercentage
        ? getEffectiveStat(configuration.stat)
        : hero[configuration.stat];
    return currentValue >= configuration.max;
}

function getMaxUpgradeQuantity(upgrade, overrideConfiguration = UPGRADE_CONFIG[upgrade]) {
    const configuration = overrideConfiguration;
    if (!configuration || UPGRADE_COST <= 0) return 0;

    const affordableQuantity = Math.floor(hero.gold / UPGRADE_COST);
    if (configuration.max === undefined) return affordableQuantity;

    const currentValue = configuration.isPercentage
        ? getEffectiveStat(configuration.stat)
        : hero[configuration.stat];
    const remaining = Math.max(0, configuration.max - currentValue);
    return Math.min(affordableQuantity, Math.ceil(remaining / configuration.amount));
}

function getUpgradeConfiguration(upgrade) {
    const configuration = UPGRADE_CONFIG[upgrade];
    if (!configuration) return null;
    if (upgrade === 'parry') return { ...configuration, max: selectedCharacter.skills.maxParry };
    if (upgrade === 'evasion') return { ...configuration, max: selectedCharacter.skills.maxEvasion };
    return configuration;
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
    const configuration = getUpgradeConfiguration(upgrade);
    if (!configuration || inCombat || gameOver || campaignComplete || getMaxUpgradeQuantity(upgrade, configuration) < 1 || isUpgradeMaxed(upgrade, configuration)) return;

    openUpgradeOptions = openUpgradeOptions === upgrade ? null : upgrade;
    updateUI();
}

function purchaseUpgrade(upgrade, requestedQuantity) {
    const configuration = getUpgradeConfiguration(upgrade);
    if (!configuration) return;
    const maxQuantity = getMaxUpgradeQuantity(upgrade, configuration);
    const quantity = requestedQuantity === 'max'
        ? maxQuantity
        : Number(requestedQuantity);
    if (
        inCombat
        || gameOver
        || campaignComplete
        || !Number.isInteger(quantity)
        || quantity < 1
        || quantity > maxQuantity
        || isUpgradeMaxed(upgrade, configuration)
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
    if (gameOver || campaignComplete) return;
    if (inCombat && combatActionLocked) return;
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
        combatActionLocked = true;
        logMessage(t("potionOpening"));
        monsterAttackTurn();
        updateUI();
    }
}

function restAtCamp() {
    if (inCombat || gameOver || campaignComplete) return;
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
    if (!inCombat || campaignComplete || combatActionLocked) return;
    combatActionLocked = true;
    const success = Math.random() < GAME_RULES.combat.escapeSuccessChance;
    if (success) {
        logMessage(t("escaped"), "discovery");
        hero.fury = 0;
        hero.evasionBonus = 0;
        hero.parryBonus = 0;
        inCombat = false;
        combatEncounterId++;
        combatActionLocked = false;
        document.getElementById('rpg-log').dataset.combat = 'false';
        currentMonster = null;
        updateUI();
    } else {
        logMessage(t("escapeFailed", { monster: currentMonster.name }), "combat-monster");
        monsterAttackTurn();
    }
}

function endCombatVictory() {
    if (!inCombat || !currentMonster || currentMonster.hp > 0) return;
    const challengeRewardRarities = currentMonster.challengeRewardRarities;
    logMessage(t("victory", { monster: currentMonster.name }), "discovery");
    logMessage(t("rewards", { xp: currentMonster.xpReward, gold: currentMonster.goldReward }), "loot");

    hero.gold += currentMonster.goldReward;
    hero.xp += currentMonster.xpReward;
    hero.fury = 0;
    hero.evasionBonus = 0;
    hero.parryBonus = 0;

    const equipmentDrop = challengeRewardRarities
        ? createChallengeEquipmentDrop(challengeRewardRarities)
        : createEquipmentDrop();
    inCombat = false;
    combatEncounterId++;
    combatActionLocked = false;
    currentMonster = null;

    checkLevelUp();
    if (equipmentDrop) {
        if (challengeRewardRarities) {
            logMessage(t('abyssalChallengeReward', {
                rarity: getEquipmentRarity(equipmentDrop).name[gameLanguage]
            }), 'loot');
        }
        handleEquipmentDrop(equipmentDrop);
    }
    document.getElementById('rpg-log').dataset.combat = 'false';
    updateUI();
}

function endCombatDefeat() {
    logMessage(t("defeat"), "combat-monster");
    logMessage(t("defeatHelp"), "special");
    inCombat = false;
    combatEncounterId++;
    combatActionLocked = false;
    currentMonster = null;
    hero.hp = 0;
    hero.fury = 0;
    hero.evasionBonus = 0;
    hero.parryBonus = 0;
    gameOver = true;
    document.getElementById('rpg-log').dataset.combat = 'false';
    document.getElementById('campaign-ending-card').hidden = false;
    document.getElementById('campaign-ending-title').textContent = t('campaignDefeatTitle');
    document.getElementById('campaign-ending-description').textContent = t('campaignDefeatDescription');
    document.getElementById('campaign-ending-card').querySelector('[data-i18n="restartCampaign"]').textContent = t('restart');
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    updateUI();
}

function restartGame() {
    try { localStorage.removeItem(SAVE_KEY); } catch {}
    window.location.reload();
}

function startAdventure({ character, equipment }) {
    selectedCharacter = character;
    selectedCharacterProgression = character.levelUp;
    currentRegion = 0; discoveredRegions = [0];
    inCombat = false; currentMonster = null; gameOver = false; campaignComplete = false;
    pendingMistContact = null; pendingEquipment = null; pendingStoryEvent = null;
    selectedInventoryItems.clear();
    storyEventSeen.clear(); seenStoryEvents.clear(); explorationCount = 0;
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

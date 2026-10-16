// Character/game interface rendering and the scrolling event log.
// Classic browser script; state is initialized by game.js before user actions run.

function updateUI() {
    if (inCombat || gameOver) openUpgradeOptions = null;

    document.getElementById('hero-name').innerText = hero.name;
    const heroPortrait = document.getElementById('hero-portrait');
    const characterImage = selectedCharacter?.image;
    if (heroPortrait && characterImage) {
        heroPortrait.src = new URL(`../../${characterImage}`, document.querySelector('script[src*="/systems/hud.js"]')?.src || window.location.href).href;
    }
    document.getElementById('hero-level').innerText = hero.level;
    document.getElementById('hero-gold').innerText = hero.gold;
    // Pontos de Habilidade (verde) — fica à esquerda do ouro
    const sp = Number(hero.skillPoints) || 0;
    const spEl = document.getElementById('hero-skill-points');
    if (spEl) {
        spEl.innerText = sp;
        const spBadge = document.getElementById('hero-skill-points-badge');
        if (spBadge) {
            spBadge.classList.toggle('has-points', sp > 0);
            spBadge.classList.toggle('no-points', sp === 0);
            spBadge.setAttribute('aria-label', t('skillPointsAria', { count: sp }));
        }
    }
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
    const regionNavigationBlocked = inCombat || gameOver || campaignComplete
        || pendingMistContact || pendingStoryEvent || pendingChest;
    const previousRegionButton = document.getElementById('previous-region-button');
    const nextRegionButton = document.getElementById('next-region-button');
    previousRegionButton.disabled = regionNavigationBlocked || !discoveredRegions.includes(currentRegion - 1);
    nextRegionButton.disabled = regionNavigationBlocked || !discoveredRegions.includes(currentRegion + 1);
    previousRegionButton.setAttribute('aria-label', t('previousRegion'));
    previousRegionButton.title = t('previousRegion');
    nextRegionButton.setAttribute('aria-label', t('nextRegion'));
    nextRegionButton.title = t('nextRegion');

    const discoveryChanceDisplay = document.getElementById('discovery-chance');
    discoveryChanceDisplay.hidden = discoveredRegions.includes(currentRegion + 1);
    const nextDiscoveryChance = getDiscoveryChance();
    discoveryChanceDisplay.innerText = nextDiscoveryChance
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
        button.setAttribute('aria-label', t('upgradeAriaPoints', { skill, cost: UPGRADE_COST_PER_POINT }));
        button.title = t('upgradeAriaPoints', { skill, cost: UPGRADE_COST_PER_POINT });
        // Pinta o botão de verde quando tem pontos disponíveis
        button.classList.toggle('has-skill-points', !disabled);
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
    const chestCard = document.getElementById('chest-event-card');
    chestCard.hidden = !pendingChest || inCombat || gameOver || campaignComplete;
    mistContactCard.classList.toggle('hidden', !pendingMistContact || inCombat || gameOver || pendingStoryEvent || pendingChest);
    const storyCard = document.getElementById('story-event-card');
    storyCard.hidden = !pendingStoryEvent || inCombat || gameOver || pendingChest;
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
        encounterCard.classList.add('hidden'); mistContactCard.classList.add('hidden'); storyCard.hidden = true; chestCard.hidden = true;
        explorationBanner.classList.add('hidden'); restartButton.classList.add('hidden');
        document.getElementById('campaign-ending-title').textContent = t(campaignComplete ? 'campaignVictoryTitle' : 'campaignDefeatTitle');
        document.getElementById('campaign-ending-description').textContent = t(campaignComplete ? 'campaignVictoryDescription' : 'campaignDefeatDescription');
        document.getElementById('campaign-ending-card').querySelector('[data-i18n="restartCampaign"]').textContent = t('restart');
    } else if (inCombat) {
        exploreControls.classList.add('hidden');
        combatControls.classList.remove('hidden');
        encounterCard.classList.remove('hidden');
        mistContactCard.classList.add('hidden');
        chestCard.hidden = true;
        explorationBanner.classList.add('hidden');
        restartButton.classList.add('hidden');
    } else if (pendingStoryEvent) {
        exploreControls.classList.add('hidden'); combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden'); mistContactCard.classList.add('hidden');
        chestCard.hidden = true;
        explorationBanner.classList.remove('hidden'); restartButton.classList.add('hidden');
    } else if (pendingChest) {
        exploreControls.classList.add('hidden'); combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden'); mistContactCard.classList.add('hidden');
        storyCard.hidden = true;
        chestCard.hidden = false;
        explorationBanner.classList.remove('hidden'); restartButton.classList.add('hidden');
    } else if (pendingMistContact) {
        exploreControls.classList.add('hidden');
        combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden');
        mistContactCard.classList.remove('hidden');
        chestCard.hidden = true;
        explorationBanner.classList.remove('hidden');
        restartButton.classList.add('hidden');
    } else {
        exploreControls.classList.remove('hidden');
        combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden');
        mistContactCard.classList.add('hidden');
        chestCard.hidden = true;
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

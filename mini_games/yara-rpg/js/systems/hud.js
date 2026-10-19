// Character/game interface rendering and the scrolling event log.
// Classic browser script; state is initialized by game.js before user actions run.

document.addEventListener('click', (event) => {
    const shortcut = event.target instanceof Element
        ? event.target.closest('[data-open-panel]')
        : null;
    if (shortcut) {
        openMobileCharacterPanel(shortcut.dataset.openPanel);
        return;
    }
    if (event.target instanceof Element && event.target.closest('#mobile-open-equipment-bag-button')) {
        openEquipmentBag();
    }
});

function openMobileCharacterPanel(panelId) {
    if (!window.matchMedia('(max-width: 640px)').matches) {
        const panel = document.getElementById(panelId);
        if (!panel) return;
        panel.open = !panel.open;
        panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    const source = document.getElementById(panelId);
    const dialog = document.getElementById('mobile-character-panel-dialog');
    const content = document.getElementById('mobile-character-panel-content');
    const title = document.getElementById('mobile-character-panel-title');
    if (!source || !dialog || !content || !title) return;
    if (dialog.open && dialog.dataset.panel === panelId) return;
    if (dialog.open) dialog.close();
    const summary = source.querySelector(':scope > summary');
    title.textContent = summary?.querySelector('[data-i18n]')?.textContent || summary?.textContent.trim() || '';
    content.replaceChildren();
    if (panelId === 'hero-equipment') {
        content.classList.add('mobile-equipment-panel-content');
        const equipmentGrid = document.getElementById('equipment-slots');
        renderEquipment();
        const equipmentContent = source.querySelector('.hero-equipment-content');
        if (equipmentContent && equipmentGrid && equipmentGrid.parentElement !== content) content.append(equipmentGrid);
        content.onclick = (event) => {
            const button = event.target instanceof Element ? event.target.closest('button') : null;
            if (!button) return;
            if (button.matches('.equipment-slot-item, .equipment-upgrade-trigger')) {
                const slot = button.closest('.equipment-slot');
                const slotId = [...slot.classList].find((name) => name.startsWith('equipment-slot-'))?.slice('equipment-slot-'.length);
                const item = slotId && hero.equipment[slotId];
                if (item) showEquipmentItemDetails(item, 'equipped', slotId);
            }
        };
    } else {
        const panelContent = source.querySelector(':scope > div');
        const clone = panelContent.cloneNode(true);
        const passiveSkills = source.querySelector('.passive-skills-section');
        if (panelId === 'hero-attributes' && passiveSkills) clone.append(passiveSkills.cloneNode(true));
        clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
        clone.querySelectorAll('[data-upgrade-options]').forEach((element) => {
            const upgrade = element.dataset.upgradeOptions;
            element.hidden = !upgrade || openUpgradeOptions !== upgrade;
        });
        clone.querySelectorAll('[data-upgrade]').forEach((element) => {
            element.setAttribute('aria-expanded', String(element.closest('.skill-upgrade-control')
                ?.querySelector('[data-upgrade-options]')?.hidden === false));
        });
        content.replaceChildren(clone);
        content.classList.remove('mobile-equipment-panel-content');
        content.onclick = (event) => {
            const button = event.target instanceof Element ? event.target.closest('button') : null;
            if (!button) return;
            if (button.matches('[data-upgrade]')) {
                toggleUpgradeOptions(button.dataset.upgrade);
                openMobileCharacterPanel(panelId);
            } else if (button.matches('[data-upgrade-quantity]')) {
                const upgrade = button.closest('[data-upgrade-options]')?.dataset.upgradeOptions;
                if (upgrade) purchaseUpgrade(upgrade, button.dataset.upgradeQuantity === 'max' ? 'max' : Number(button.dataset.upgradeQuantity));
                openMobileCharacterPanel(panelId);
            } else if (button.matches('.passive-skill-icon-button')) {
                const skillIndex = [...button.parentElement.children].indexOf(button);
                document.querySelectorAll('#passive-skill-icons button')[skillIndex]?.click();
            }
        };
    }
    dialog.dataset.panel = panelId;
    if (!dialog.open) dialog.showModal();
}

function closeMobileCharacterPanel() {
    const dialog = document.getElementById('mobile-character-panel-dialog');
    if (dialog?.open) dialog.close();
    const grid = document.getElementById('equipment-slots');
    const equipmentContent = document.querySelector('#hero-equipment .hero-equipment-content');
    if (grid && equipmentContent && grid.parentElement !== equipmentContent) equipmentContent.append(grid);
    const mobileContent = document.getElementById('mobile-character-panel-content');
    mobileContent?.classList.remove('mobile-equipment-panel-content');
}

document.getElementById('mobile-character-panel-dialog')?.addEventListener('close', () => {
    const grid = document.getElementById('equipment-slots');
    const equipmentContent = document.querySelector('#hero-equipment .hero-equipment-content');
    if (grid && equipmentContent && grid.parentElement !== equipmentContent) equipmentContent.append(grid);
    document.getElementById('mobile-character-panel-content')?.classList.remove('mobile-equipment-panel-content');
});

function updateUI() {
    document.getElementById('hero-name').innerText = hero.name;
    const heroPortrait = document.getElementById('hero-portrait');
    const characterImage = selectedCharacter?.image;
    if (heroPortrait && characterImage) {
        heroPortrait.src = characterImage;
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
    const quickSkillPoints = document.getElementById('quick-skill-points');
    if (quickSkillPoints) {
        quickSkillPoints.textContent = sp;
        quickSkillPoints.hidden = sp === 0;
    }
    const mobileBagCount = document.getElementById('mobile-equipment-bag-count');
    if (mobileBagCount) mobileBagCount.textContent = `${hero.equipmentInventory.length}/${EQUIPMENT_BAG_CAPACITY}`;
    document.getElementById('hero-xp').innerText = hero.xp;
    document.getElementById('hero-xp-max').innerText = hero.maxXp;
    document.getElementById('hero-hp').innerText = hero.hp;
    document.getElementById('hero-hp-max').innerText = getEffectiveStat('maxHp');
    document.getElementById('hero-foco').innerText = hero.foco;
    document.getElementById('hero-foco-max').innerText = getEffectiveStat('maxFoco');
    document.getElementById('hero-fury').innerText = hero.fury;
    const furyThreshold = getEffectiveFuryThreshold();
    document.getElementById('hero-fury-max').innerText = furyThreshold;
    document.getElementById('hero-fury-bar').style.width = Math.min(
        GAME_RULES.probabilityScale,
        hero.fury / furyThreshold * GAME_RULES.probabilityScale
    ) + '%';
    const furyReady = hero.fury >= furyThreshold;
    document.getElementById('hero-fury-bar').classList.toggle('fury-bar-ready', furyReady);
    const quickAttackButton = document.getElementById('quick-attack-button');
    quickAttackButton.classList.toggle('fury-ready', furyReady);
    quickAttackButton.title = furyReady ? t('criticalRequirement', { amount: furyThreshold }) : '';
    document.getElementById('quick-attack-label').innerText = t(furyReady ? 'criticalAttack' : 'quickAttack');
    document.getElementById('hero-atk').innerText = getEffectiveStat('atk');
    document.getElementById('hero-def').innerText = getEffectiveStat('def');
    const effectiveEvasion = Math.min(selectedCharacter.limits.maxEvasion, getEffectiveStat('evasion'));
    const effectiveParry = Math.min(selectedCharacter.limits.maxParry, getEffectiveStat('parry'));
    const effectiveStunChance = Math.min(
        selectedCharacter.limits.maxStunChance,
        getEffectiveStat('stunChance')
    );
    const evasionTotal = Math.min(selectedCharacter.limits.maxEvasion, effectiveEvasion + hero.evasionBonus);
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
    const parryTotal = Math.min(selectedCharacter.limits.maxParry, effectiveParry + hero.parryBonus);
    const parryDisplay = document.getElementById('hero-parry');
    const parryBonusDisplay = document.getElementById('hero-parry-bonus');
    document.getElementById('hero-parry-base').innerText = effectiveParry + '%';
    parryBonusDisplay.innerText = ` +${hero.parryBonus}% = ${parryTotal}%`;
    parryBonusDisplay.classList.toggle('hidden', hero.parryBonus === 0);
    parryDisplay.setAttribute('aria-label', hero.parryBonus
        ? `${effectiveParry}% + ${hero.parryBonus}% = ${parryTotal}%`
        : `${effectiveParry}%`);
    const stunBonus = hero.fury >= furyThreshold ? CRITICAL_STUN_BONUS : 0;
    const stunChanceTotal = Math.min(selectedCharacter.limits.maxStunChance, effectiveStunChance + stunBonus);
    const stunBonusDisplay = document.getElementById('hero-stun-bonus');
    const stunDisplay = document.getElementById('hero-stun');
    document.getElementById('hero-stun-base').innerText = effectiveStunChance + '%';
    stunBonusDisplay.innerText = ` +${stunBonus}% = ${stunChanceTotal}%`;
    stunBonusDisplay.classList.toggle('hidden', stunBonus === 0);
    stunDisplay.setAttribute('aria-label', stunBonus
        ? `${effectiveStunChance}% + ${stunBonus}% = ${stunChanceTotal}%`
        : `${effectiveStunChance}%`);
    document.getElementById('hero-critical-chance').textContent = `${getEffectiveCriticalChance()}%`;
    document.querySelectorAll('.hero-potions-count').forEach((element) => {
        element.textContent = hero.potions;
    });
    document.querySelectorAll('.hero-potions-max').forEach((element) => {
        element.textContent = hero.maxPotions;
    });
    renderEquipment();
    const equipmentShortcut = document.querySelector('[data-open-panel="hero-equipment"]');
    const attributesShortcut = document.querySelector('[data-open-panel="hero-attributes"]');
    const hasEquipmentUpgrade = [...document.querySelectorAll('.equipment-upgrade-available')].length > 0;
    equipmentShortcut?.classList.toggle('has-upgrade', hasEquipmentUpgrade);
    attributesShortcut?.classList.toggle('has-upgrade', sp > 0);
    attributesShortcut?.classList.toggle('has-skill-points', sp > 0);
    document.querySelectorAll('.action-potion-button').forEach((button) => {
        button.disabled = hero.potions <= 0
            || (hero.hp >= getEffectiveStat('maxHp') && hero.foco >= getEffectiveStat('maxFoco'))
            || (inCombat && combatActionLocked)
            || gameOver || campaignComplete;
        button.setAttribute('aria-label', `${t('potionActionAria')} (${hero.potions}/${hero.maxPotions})`);
    });
    const unlockedPassiveSkills = MIST_CONTACT_DATA.passiveSkills.filter((skill) => hero.passiveSkills.includes(skill.id));
    const unlockedPacts = MIST_CONTACT_DATA.pacts.filter((pact) => hero.monsterPacts.includes(pact.id));
    const passiveSkills = [selectedCharacter.passive, ...unlockedPassiveSkills, ...unlockedPacts].filter(Boolean);
    const passiveSkillIcons = document.getElementById('passive-skill-icons');
    const passiveSkillsEmpty = document.getElementById('passive-skills-empty');
    passiveSkillIcons.replaceChildren();
    passiveSkillsEmpty.hidden = passiveSkills.length > 0;
    passiveSkills.forEach((skill) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'passive-skill-icon-button';
        button.textContent = skill.icon || '✧';
        button.setAttribute('aria-label', t('passiveButtonAria', {
            name: skill.name[gameLanguage],
            description: skill.description[gameLanguage]
        }));
        button.title = `${skill.name[gameLanguage]} — ${skill.description[gameLanguage]}`;
        button.setAttribute('aria-haspopup', 'dialog');
        button.addEventListener('click', () => showPassiveDetails(skill.id));
        passiveSkillIcons.append(button);
    });
    const currentRegionData = getCurrentRegionData();
    const finalBossGateActive = !isInSpiritWorld && GAME_DATA.regions[currentRegion].id === 'gudran-throne'
        && !inCombat && !gameOver && !campaignComplete
        && !pendingMistContact && !pendingStoryEvent && !pendingChest;
    document.body.classList.remove(...[...GAME_DATA.regions, ...GAME_DATA.spiritRegions].map((region) => `region-${region.id}`));
    document.body.classList.add(`region-${currentRegionData.id}`);
    const explorationBanner = document.getElementById('exploration-banner');
    document.getElementById('exploration-title').innerText = currentRegionData.title[gameLanguage];
    document.getElementById('exploration-description').innerText = currentRegionData.description[gameLanguage];
    explorationBanner.classList.toggle('spirit-world-active', isInSpiritWorld);
    if (explorationBanner) {
        const regionImageUrl = currentRegionData.sceneImage
            ? currentRegionData.sceneImage
            : '';
        explorationBanner.style.backgroundImage = currentRegionData.sceneImage
            ? `linear-gradient(90deg, rgba(8, 16, 12, .91), rgba(8, 16, 12, .72) 58%, rgba(8, 16, 12, .84)), url("${regionImageUrl}")`
            : '';
        explorationBanner.style.backgroundPosition = 'center 52%';
        explorationBanner.style.backgroundSize = currentRegionData.sceneImage ? 'cover' : '';
    }
    const regionNavigationBlocked = inCombat || gameOver || campaignComplete
        || pendingMistContact || pendingStoryEvent || pendingChest || finalBossGateActive;
    const previousRegionButton = document.getElementById('previous-region-button');
    const nextRegionButton = document.getElementById('next-region-button');
    previousRegionButton.hidden = false;
    nextRegionButton.hidden = false;
    if (isInSpiritWorld) {
        const spiritRegionIndex = GAME_DATA.spiritRegions.findIndex((region) => region.id === currentRegionData.id);
        previousRegionButton.disabled = regionNavigationBlocked || spiritRegionIndex <= 0;
        nextRegionButton.disabled = regionNavigationBlocked
            || spiritRegionIndex >= GAME_DATA.spiritRegions.length - 1
            || !areCurrentRegionObjectivesComplete(currentRegionData);
    } else {
        previousRegionButton.disabled = regionNavigationBlocked || !discoveredRegions.includes(currentRegion - 1);
        nextRegionButton.disabled = regionNavigationBlocked || !discoveredRegions.includes(currentRegion + 1);
    }
    previousRegionButton.setAttribute('aria-label', t('previousRegion'));
    previousRegionButton.title = t('previousRegion');
    nextRegionButton.setAttribute('aria-label', t('nextRegion'));
    nextRegionButton.title = t('nextRegion');

    const regionProgress = document.getElementById('region-progress');
    const regionProgressTrack = document.getElementById('region-progress-track');
    const objectivesRequired = currentRegionData.objectives.tasks.length;
    const objectiveProgress = getRegionObjectiveProgress();
    regionProgress.hidden = objectivesRequired <= 0;
    document.getElementById('region-progress-count').innerText = `${objectiveProgress}/${objectivesRequired}`;
    document.getElementById('region-progress-bar').style.width = objectivesRequired > 0
        ? `${objectiveProgress / objectivesRequired * 100}%`
        : '0%';
    regionProgressTrack.setAttribute('aria-valuemax', String(objectivesRequired));
    regionProgressTrack.setAttribute('aria-valuenow', String(objectiveProgress));
    const treasureChanceBonusDisplay = document.getElementById('treasure-chance-bonus');
    const spiritWorldButton = document.getElementById('spirit-world-button');
    const spiritWorldEye = spiritWorldButton.querySelector('img');
    spiritWorldButton.hidden = !hero.spiritWorldUnlocked;
    spiritWorldButton.disabled = inCombat || gameOver || campaignComplete || pendingStoryEvent;
    const spiritWorldButtonLabel = t(isInSpiritWorld ? 'returnToPhysicalWorld' : 'enterSpiritWorld');
    spiritWorldEye.src = isInSpiritWorld
        ? 'images/exploration_icons/spirit-eye-open.webp'
        : 'images/exploration_icons/spirit-eye-close.webp';
    spiritWorldButton.setAttribute('aria-label', spiritWorldButtonLabel);
    spiritWorldButton.title = spiritWorldButtonLabel;
    explorationBanner.classList.toggle('has-spirit-world-access', hero.spiritWorldUnlocked);
    treasureChanceBonusDisplay.hidden = hero.chestChanceBonus <= 0;
    treasureChanceBonusDisplay.innerText = hero.chestChanceBonus > 0
        ? t('treasureChanceBonus', { chance: hero.chestChanceBonus })
        : '';

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
    const mistContactCard = document.getElementById('mist-contact-card');
    const campButton = document.getElementById('camp-button');
    document.querySelector('[data-i18n="campCost"]').innerText = t('campCost', { cost: CAMP_COST });
    const heavyAttackSkill = selectedCharacter.skills.heavyAttack;
    const parrySkill = selectedCharacter.skills.parry;
    const dodgeSkill = selectedCharacter.skills.dodge;
    const heavyAttackButton = document.querySelector('[data-i18n="focusCost"]').closest('button');
    const parryButton = document.getElementById('parry-button');
    const dodgeButton = document.getElementById('dodge-button');
    heavyAttackButton.hidden = !heavyAttackSkill;
    parryButton.hidden = !parrySkill;
    dodgeButton.hidden = !dodgeSkill;
    if (heavyAttackSkill) {
        document.querySelector('[data-i18n="focusCost"]').innerText = t('focusCost', {
            cost: heavyAttackSkill.focoCost
        });
    }
    if (parrySkill) {
        document.querySelector('[data-i18n="parryBonus"]').innerText = t('parryBonus', {
            bonus: parrySkill.bonus,
            cost: parrySkill.focoCost
        });
    }
    if (dodgeSkill) {
        document.querySelector('[data-i18n="dodgeBonus"]').innerText = t('dodgeBonus', {
            bonus: dodgeSkill.bonus,
            cost: dodgeSkill.focoCost
        });
    }
    document.querySelectorAll('[data-upgrade]').forEach((button) => {
        const upgrade = button.dataset.upgrade;
        const upgradeConfiguration = getUpgradeConfiguration(upgrade);
        const skill = t(UPGRADE_CONFIG[upgrade].nameKey);
        const maximum = getMaxUpgradeQuantity(upgrade, upgradeConfiguration);
        const disabled = gameOver || campaignComplete || maximum < 1 || isUpgradeMaxed(upgrade, upgradeConfiguration);
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
    dodgeButton.disabled = !dodgeSkill || dodgeSkillUsedThisCombat
        || evasionTotal >= selectedCharacter.limits.maxEvasion
        || hero.foco < (dodgeSkill?.focoCost ?? 0);
    parryButton.disabled = !parrySkill || parrySkillUsedThisCombat
        || parryTotal >= selectedCharacter.limits.maxParry
        || hero.foco < (parrySkill?.focoCost ?? 0);
    const runButton = document.getElementById('run-button');
    if (runButton) {
        runButton.title = currentMonster?.isUnescapable ? t('finalBossNoEscape') : '';
    }
    const restartButton = document.getElementById('restart-button');
    const chestCard = document.getElementById('chest-event-card');
    document.getElementById('rpg-log').hidden = false;
    chestCard.hidden = !pendingChest || inCombat || gameOver || campaignComplete;
    mistContactCard.classList.toggle('hidden', !pendingMistContact || inCombat || gameOver || pendingStoryEvent || pendingChest);
    const storyCard = document.getElementById('story-event-card');
    storyCard.hidden = !pendingStoryEvent || inCombat || gameOver || pendingChest;
    if (pendingStoryEvent) {
        const eventImage = document.getElementById('story-event-image');
        eventImage.hidden = !pendingStoryEvent.image;
        eventImage.removeAttribute('src');
        eventImage.onerror = null;
        if (pendingStoryEvent.image) {
            eventImage.src = pendingStoryEvent.image;
            eventImage.onerror = () => { eventImage.hidden = true; };
        }
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
        const contactIcon = document.getElementById('mist-contact-icon');
        contactIcon.replaceChildren();
        if (pendingMistContact.image) {
            const image = document.createElement('img');
            image.src = pendingMistContact.image;
            image.alt = '';
            image.className = 'mist-contact-icon-image';
            image.setAttribute('aria-hidden', 'true');
            image.addEventListener('error', () => {
                contactIcon.textContent = pendingMistContact?.icon || '';
            }, { once: true });
            contactIcon.append(image);
        } else {
            contactIcon.textContent = pendingMistContact.icon;
        }
        document.getElementById('mist-contact-name').textContent = pendingMistContact.name[gameLanguage];
        document.getElementById('mist-contact-message').textContent = pendingMistContact.message[gameLanguage];
        document.getElementById('mist-contact-accept').textContent = t(
            pendingMistContact.onAccept?.type === 'spirit-surgery' ? 'acceptSpiritSurgery' : 'mistAccept'
        );
    }
    campButton.disabled = inCombat || gameOver || campaignComplete || hero.gold < CAMP_COST || (
        hero.hp >= getEffectiveStat('maxHp') && hero.foco >= getEffectiveStat('maxFoco')
    );
    document.querySelectorAll('.potion-action-button').forEach((button) => {
        button.disabled = gameOver || campaignComplete || combatActionLocked;
    });
    document.querySelectorAll('#controls-combat button').forEach((button) => {
        const disabledByGameState = (button.id === 'dodge-button' && (
            !selectedCharacter.skills.dodge
            ||
            dodgeSkillUsedThisCombat
            || evasionTotal >= selectedCharacter.limits.maxEvasion
            || hero.foco < (selectedCharacter.skills.dodge?.focoCost ?? 0)
        )) || (button.id === 'parry-button' && (
            !selectedCharacter.skills.parry
            ||
            parrySkillUsedThisCombat
            || parryTotal >= selectedCharacter.limits.maxParry
            || hero.foco < (selectedCharacter.skills.parry?.focoCost ?? 0)
        )) || (button.id === 'run-button' && currentMonster?.isUnescapable);
        button.disabled = combatActionLocked || disabledByGameState;
    });

    document.getElementById('campaign-ending-card').hidden = !campaignComplete && !gameOver;
    const finalBossGateCard = document.getElementById('final-boss-gate');
    finalBossGateCard.hidden = true;
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
    } else if (isInSpiritWorld) {
        exploreControls.classList.toggle('hidden', Boolean(pendingStoryEvent)); combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden'); mistContactCard.classList.add('hidden');
        storyCard.hidden = !pendingStoryEvent; chestCard.hidden = true;
        explorationBanner.classList.remove('hidden'); restartButton.classList.add('hidden');
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
    } else if (finalBossGateActive) {
        exploreControls.classList.add('hidden'); combatControls.classList.add('hidden');
        encounterCard.classList.add('hidden'); mistContactCard.classList.add('hidden');
        storyCard.hidden = true; chestCard.hidden = true;
        explorationBanner.classList.add('hidden'); restartButton.classList.add('hidden');
        finalBossGateCard.hidden = false;
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

function openRegionObjectives() {
    const region = getCurrentRegionData();
    const objectives = region.objectives;
    const dialog = document.getElementById('region-objectives-dialog');
    document.getElementById('region-objectives-title').textContent = objectives.title[gameLanguage];
    document.getElementById('region-objectives-description').textContent = objectives.description[gameLanguage];
    const objectiveCount = getRegionObjectiveProgress();
    document.getElementById('region-objectives-progress').textContent = t('regionObjectivesProgress', {
        current: objectiveCount,
        required: objectives.tasks.length
    });
    const list = document.getElementById('region-objectives-list');
    list.replaceChildren();
    getRegionObjectiveRequirements(region).forEach((task) => {
        const item = document.createElement('li');
        const completed = getRegionObjectiveTaskProgress(task, region) >= task.required;
        item.className = completed ? 'region-objective-complete' : 'region-objective-pending';
        const mark = document.createElement('span');
        mark.className = 'region-objective-check';
        mark.textContent = completed ? '✓' : '○';
        mark.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span');
        const progress = Math.min(task.required, getRegionObjectiveTaskProgress(task, region));
        label.textContent = ['exploration', 'monsters'].includes(task.id)
            ? `${task.title[gameLanguage]} (${progress}/${task.required})`
            : task.title[gameLanguage];
        item.append(mark, label);
        list.append(item);
    });
    if (!dialog.open) dialog.showModal();
}

function closeRegionObjectives() {
    const dialog = document.getElementById('region-objectives-dialog');
    if (dialog.open) dialog.close();
}

function showPassiveDetails(passiveId) {
    const characterPassive = selectedCharacter.passive?.id === passiveId
        ? selectedCharacter.passive
        : null;
    const mistSkill = MIST_CONTACT_DATA.passiveSkills.find((entry) =>
        entry.id === passiveId && hero.passiveSkills.includes(entry.id)
    );
    const pact = MIST_CONTACT_DATA.pacts.find((entry) =>
        entry.id === passiveId && hero.monsterPacts.includes(entry.id)
    );
    const skill = characterPassive || mistSkill || pact;
    if (!skill) return;
    document.getElementById('passive-detail-title').textContent = skill.name[gameLanguage];
    document.getElementById('passive-detail-icon').textContent = skill.icon || '✧';
    document.getElementById('passive-detail-description').textContent = skill.description[gameLanguage];
    const dialog = document.getElementById('passive-detail-dialog');
    if (!dialog.open) dialog.showModal();
}

function closePassiveDetails() {
    const dialog = document.getElementById('passive-detail-dialog');
    if (dialog.open) dialog.close();
}

window.logMessage = function logMessage(message, type = 'normal') {
    const logBox = document.getElementById('rpg-log');
    
    let colorClass = "text-gray-300 border-l-2 border-gray-600";
    if (type === 'combat-hero') colorClass = "text-emerald-400 border-l-2 border-emerald-500 font-semibold";
    if (type === 'combat-monster') colorClass = "text-red-400 border-l-2 border-red-500 font-semibold";
    if (type === 'discovery') colorClass = "text-amber-300 border-l-2 border-amber-500 font-semibold";
    if (type === 'loot') colorClass = "text-purple-300 border-l-2 border-purple-500 font-semibold";
    if (type === 'special') colorClass = "text-cyan-300 border-l-2 border-cyan-500 font-semibold";
    if (type === 'spirit-message') colorClass = "text-blue-200 border-l-2 border-blue-400 font-semibold";

    const div = document.createElement('div');
    div.className = `${colorClass} pl-2 py-0.5`;
    if (message.includes('<')) {
        div.innerHTML = message;
    } else {
        div.textContent = message;
    }
    
    logBox.appendChild(div);
    while (logBox.children.length > RPG_LOG_MAX_ENTRIES) {
        logBox.firstElementChild?.remove();
    }
    logBox.scrollTop = logBox.scrollHeight;
};

// Upgrade purchase rules and upgrade menu controls.
// Loaded before combat.js and game.js.

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

// Alma do herói: acumula as escolhas entre maligno e divino, mostra a aura e aplica os efeitos de cada nível.
// Valores e textos em ../data/soul-rules.js; rótulos de interface nas chaves "soul..." de translations-*.js.
// Classic browser script; carregado antes de game.js. Os demais sistemas só chamam `window.YaraSoul?.hook()`.
window.YaraSoul = (() => {
    const RULES = window.YaraRpgData.soul;
    const AURA_CLASSES = ['soul-burst-light', 'soul-burst-dark', 'soul-burst-clash'];
    let burstTimeout = null;

    const localized = (text) => text?.[gameLanguage] ?? text?.pt ?? '';
    const clamp = (soul) => Math.max(RULES.min, Math.min(RULES.max, soul));
    const value = () => clamp(Number(hero.soul) || 0);
    const tierOf = (soul) => RULES.tiers.find((tier) => soul >= tier.min && soul <= tier.max);
    const currentTier = () => tierOf(value());
    const effect = (key) => Number(currentTier().effects[key]) || 0;
    const scale = (amount, percent) => Math.max(0, Math.round(amount * (1 + percent / 100)));
    const formatShift = (amount) => `${amount > 0 ? '✦ +' : '☾ −'}${Math.abs(amount)}`;

    function statPercent(stat) {
        if (stat === 'atk') return effect('atkPercent');
        if (stat === 'def') return effect('defPercent');
        return 0;
    }
    const scaleHealing = (amount) => scale(amount, effect('healPercent'));
    const scaleGold = (amount) => scale(amount, effect('goldPercent'));
    const scaleXp = (amount) => scale(amount, effect('xpPercent'));

    function meets(requirement) {
        if (!requirement) return true;
        const soul = value();
        if (requirement.soulMin !== undefined && soul < requirement.soulMin) return false;
        if (requirement.soulMax !== undefined && soul > requirement.soulMax) return false;
        if (requirement.potions !== undefined && hero.potions < requirement.potions) return false;
        if (requirement.gold !== undefined && hero.gold < requirement.gold) return false;
        return true;
    }

    function describeRequirement(requirement) {
        if (requirement.soulMin !== undefined && value() < requirement.soulMin) {
            return t('soulRequires', { tier: localized(tierOf(requirement.soulMin).name) });
        }
        if (requirement.soulMax !== undefined && value() > requirement.soulMax) {
            return t('soulRequires', { tier: localized(tierOf(requirement.soulMax).name) });
        }
        if (requirement.potions !== undefined) return t('soulRequiresPotion', { count: requirement.potions });
        return t('soulRequiresGold', { gold: requirement.gold });
    }

    function shift(amount, reason = null) {
        const before = value();
        const after = clamp(before + amount);
        if (after === before) return;
        const previousTier = tierOf(before);
        hero.soul = after;
        hero.soulHistory = [
            { amount: after - before, reason },
            ...(hero.soulHistory || [])
        ].slice(0, RULES.historySize);

        const tier = tierOf(after);
        logMessage(t(amount > 0 ? 'soulShiftLight' : 'soulShiftDark', {
            amount: Math.abs(after - before),
            tier: localized(tier.name)
        }), amount > 0 ? 'special' : 'combat-monster');
        playShift(after - before, before);
        if (tier !== previousTier) announceTier(tier, previousTier);
        window.YaraMeta?.onSoul(after);
        render();
    }

    function playShift(amount, before) {
        showFloatingDamage(
            'hero-portrait-anchor',
            Math.abs(amount),
            amount > 0 ? 'soul-light' : 'soul-dark',
            0,
            0,
            amount > 0 ? '✦ +' : '☾ −'
        );
        const anchor = document.getElementById('hero-portrait-anchor');
        const opposesCurrentSide = before * amount < 0;
        anchor.classList.remove(...AURA_CLASSES);
        void anchor.offsetWidth;
        anchor.classList.add(opposesCurrentSide
            ? 'soul-burst-clash'
            : amount > 0 ? 'soul-burst-light' : 'soul-burst-dark');
        window.clearTimeout(burstTimeout);
        burstTimeout = window.setTimeout(() => anchor.classList.remove(...AURA_CLASSES), 1300);
    }

    function announceTier(tier, previousTier) {
        const movedDeeper = Math.abs(tier.level) > Math.abs(previousTier.level);
        playSound(tier.side === 'dark' && movedDeeper ? 'deathLaugh' : 'levelUp');
        logMessage(t('soulTierChanged', { tier: localized(tier.name) }), 'discovery');
        window.YaraMeta?.notify(tier.icon, t('soulTierToast'), localized(tier.name));
    }

    // Marca no botão para onde a escolha puxa a alma, ou o que falta para desbloqueá-la.
    function decorateChoice(button, choice) {
        const locked = !meets(choice.requires);
        const amount = Number(choice.soul) || 0;
        button.disabled = locked;
        button.classList.toggle('soul-choice-locked', locked);
        if (!locked && !amount) return;
        const tag = document.createElement('span');
        tag.className = `soul-choice-tag ${locked ? 'soul-choice-tag-locked' : amount > 0 ? 'soul-choice-tag-light' : 'soul-choice-tag-dark'}`;
        tag.textContent = locked ? `🔒 ${describeRequirement(choice.requires)}` : formatShift(amount);
        button.append(tag);
    }

    function applyDeal(deal) {
        const maxHp = () => getEffectiveStat('maxHp');
        const maxFoco = () => getEffectiveStat('maxFoco');
        hero.atk += Number(deal.atk) || 0;
        hero.def += Number(deal.def) || 0;
        hero.maxHp += Number(deal.maxHp) || 0;
        hero.skillPoints = (Number(hero.skillPoints) || 0) + (Number(deal.skillPoints) || 0);
        hero.gold = Math.max(0, hero.gold + (Number(deal.gold) || 0));
        hero.potions = Math.max(0, Math.min(hero.maxPotions, hero.potions + (Number(deal.potions) || 0)));
        hero.hp = Math.max(1, Math.min(maxHp(), hero.hp + (Number(deal.hp) || 0)));
        hero.foco = Math.max(0, Math.min(maxFoco(), hero.foco + (Number(deal.foco) || 0)));
        if (deal.chest) {
            hero.chestChanceBonus = Math.max(hero.chestChanceBonus, EXPLORATION_RULES.map.treasureChanceBonus);
        }
        logMessage(localized(deal.log), deal.tone || 'special');
    }

    // Frase que o mundo devolve ao herói em uma região, conforme o lado da alma.
    function regionEcho(region) {
        return localized(region?.soulEcho?.[currentTier().side]);
    }

    function dialogueLines(context) {
        return RULES.dialogues[currentTier().side]?.[context]?.[gameLanguage] || [];
    }

    function bossTaunt() {
        return localized(RULES.bossTaunts[currentTier().side]);
    }

    function ending() {
        return localized(RULES.endings[currentTier().side]);
    }

    function render() {
        const soul = value();
        const tier = tierOf(soul);
        const power = Math.abs(soul) / RULES.max;
        const anchor = document.getElementById('hero-portrait-anchor');
        anchor.dataset.soulSide = tier.side;
        anchor.dataset.soulLevel = String(tier.level);
        const shell = document.getElementById('game-main');
        shell.dataset.soulSide = tier.side;
        shell.style.setProperty('--soul-power', power.toFixed(2));

        document.getElementById('soul-meter-icon').textContent = tier.icon;
        document.getElementById('soul-meter-tier').textContent = localized(tier.name);
        document.getElementById('soul-meter-value').textContent = soul > 0 ? `+${soul}` : String(soul);
        const position = (soul - RULES.min) / (RULES.max - RULES.min) * 100;
        document.getElementById('soul-meter-marker').style.left = `${position}%`;
        const fill = document.getElementById('soul-meter-fill');
        fill.style.left = `${Math.min(50, position)}%`;
        fill.style.width = `${Math.abs(position - 50)}%`;
        const meter = document.getElementById('soul-meter');
        meter.dataset.soulSide = tier.side;
        meter.setAttribute('aria-label', t('soulMeterAria', { tier: localized(tier.name), value: soul }));
    }

    function openDialog() {
        const tier = currentTier();
        document.getElementById('soul-dialog-title').textContent = `${tier.icon} ${localized(tier.name)}`;
        document.getElementById('soul-dialog-description').textContent = localized(tier.description);
        const list = document.getElementById('soul-dialog-history');
        const history = hero.soulHistory || [];
        document.getElementById('soul-dialog-empty').hidden = history.length > 0;
        list.replaceChildren(...history.map(({ amount, reason }) => {
            const item = document.createElement('li');
            const label = document.createElement('span');
            label.textContent = localized(reason) || t('soulUnknownReason');
            const shiftLabel = document.createElement('b');
            shiftLabel.className = amount > 0 ? 'soul-choice-tag-light' : 'soul-choice-tag-dark';
            shiftLabel.textContent = formatShift(amount);
            item.append(label, shiftLabel);
            return item;
        }));
        document.getElementById('soul-dialog').showModal();
    }

    function closeDialog() {
        const dialog = document.getElementById('soul-dialog');
        if (dialog.open) dialog.close();
    }

    return {
        statPercent, scaleHealing, scaleGold, scaleXp, meets, shift, decorateChoice, applyDeal,
        regionEcho, dialogueLines, bossTaunt, ending, render, openDialog, closeDialog,
        currentTier, localized,
        get shifts() { return RULES.shifts; }
    };
})();

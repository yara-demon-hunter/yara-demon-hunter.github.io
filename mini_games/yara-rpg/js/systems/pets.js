// Companheiros: comando gratuito em combate, faro na exploração e presença ao lado do retrato do herói.
// Dados em ../data/pets.js; rótulos de interface nas chaves "pet..." de translations-*.js.
// Classic browser script; carregado antes de game.js. Os demais sistemas só chamam `window.YaraPets?.hook()`.
window.YaraPets = (() => {
    const DATA = window.YaraRpgData.pets;
    const blankCombat = () => ({ cooldown: 0, stunNext: false, dodgeNext: false, bleedTurns: 0, bleedDamage: 0 });
    let combat = blankCombat();
    let lastPetInstance;

    const localized = (text) => text?.[gameLanguage] ?? text?.pt ?? '';
    const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
    const activePet = () => hero.equipment?.pet || null;
    const abilityOf = (item) => DATA.abilities[item?.id] || null;

    function powerOf(item) {
        const rarityIndex = Math.max(0, GAME_RULES.loot.equipmentRarities.findIndex((rarity) => rarity.id === item.rarity));
        return 1 + rarityIndex * DATA.rarityPowerStep + (Number(item.upgradeLevel) || 0) * DATA.upgradePowerStep;
    }

    function resetForCombat() {
        combat = blankCombat();
    }

    function petName(item) {
        return item.name[gameLanguage];
    }

    // Foto do pet (ou o emoji do item, se a imagem faltar) dentro de `holder`.
    function fillPetImage(holder, item) {
        holder.replaceChildren();
        if (!item.image) { holder.textContent = item.icon; return; }
        const image = document.createElement('img');
        image.src = item.image;
        image.alt = '';
        image.addEventListener('error', () => { holder.textContent = item.icon; }, { once: true });
        holder.append(image);
    }

    function playSprite(item, targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;
        const sprite = document.createElement('span');
        sprite.className = 'pet-strike-sprite';
        sprite.setAttribute('aria-hidden', 'true');
        fillPetImage(sprite, item);
        target.append(sprite);
        window.setTimeout(() => sprite.remove(), 800);
    }

    function damageMonster(amount, floatingType = 'pet') {
        const dealt = Math.min(currentMonster.hp, amount);
        currentMonster.hp -= dealt;
        showFloatingDamage('monster-icon', dealt, floatingType);
        return dealt;
    }

    function grantFury(amount) {
        const gained = Math.min(amount, getEffectiveFuryThreshold() - hero.fury);
        if (gained <= 0) return;
        hero.fury += gained;
        queueFuryAnimation(gained);
        flushFuryAnimation();
    }

    function command() {
        if (!inCombat || !currentMonster || campaignComplete || combatActionLocked) return;
        const pet = activePet();
        const ability = abilityOf(pet)?.command;
        if (!ability || combat.cooldown > 0) return;

        const effects = ability.effects;
        const power = powerOf(pet);
        const name = petName(pet);
        combat.cooldown = ability.cooldown;
        window.YaraMeta?.onPetCommand();
        playSound('specialAttack');
        playSprite(pet, effects.damageMultiplier || effects.stun || effects.shredDefPercent ? 'monster-icon' : 'hero-portrait-anchor');
        logMessage(t('petCommandUsed', { pet: name, ability: localized(ability.name) }), 'combat-hero');

        if (effects.damageMultiplier) {
            const defense = currentMonster.def * (1 - (effects.pierce || 0));
            const damage = Math.max(
                DATA.minimumDamage,
                Math.floor(getEffectiveStat('atk') * effects.damageMultiplier * power - defense)
            );
            const dealt = damageMonster(damage);
            logMessage(t('petDamage', { pet: name, damage: dealt }), 'combat-hero');
        }
        if (effects.bleedTurns) {
            combat.bleedTurns = effects.bleedTurns;
            combat.bleedDamage = Math.max(1, Math.floor(getEffectiveStat('atk') * effects.bleedMultiplier * power));
        }
        if (effects.fury) grantFury(Math.round(effects.fury * power));
        if (effects.dodgeNext) combat.dodgeNext = true;
        if (effects.healHpPercent) {
            const hp = Math.min(
                Math.ceil(getEffectiveStat('maxHp') * effects.healHpPercent * power / GAME_RULES.probabilityScale),
                getEffectiveStat('maxHp') - hero.hp
            );
            const foco = Math.min(
                Math.ceil(getEffectiveStat('maxFoco') * effects.healFocoPercent * power / GAME_RULES.probabilityScale),
                getEffectiveStat('maxFoco') - hero.foco
            );
            hero.hp += hp;
            hero.foco += foco;
            showFloatingDamage('hero-hp-anchor', hp, 'heal', 0, 0, '+');
            logMessage(t('petHeal', { pet: name, hp, foco }), 'special');
        }
        if (effects.shredDefPercent) {
            const shred = Math.min(90, effects.shredDefPercent * power);
            currentMonster.def = Math.floor(currentMonster.def * (1 - shred / GAME_RULES.probabilityScale));
            document.getElementById('monster-def').innerText = currentMonster.def;
            logMessage(t('petShred', { pet: name, monster: currentMonster.name, def: currentMonster.def }), 'combat-hero');
        }
        if (effects.interrupt && enemyTelegraphing) {
            enemyTelegraphing = false;
            logMessage(t('petInterrupt', { pet: name, monster: currentMonster.name }), 'combat-hero');
            window.YaraMeta?.onInterrupt();
        }
        if (effects.stun) {
            combat.stunNext = true;
            enemyTelegraphing = false;
            playMonsterStunEffect();
        }

        if (currentMonster.hp <= 0) {
            combatActionLocked = true;
            checkCombatProgress();
            return;
        }
        updateMonsterUI();
        updateUI();
    }

    // Roda antes do turno do inimigo. Devolve true quando o turno terminou aqui.
    function beforeMonsterTurn() {
        tickCooldown();
        if (combat.bleedTurns > 0) {
            combat.bleedTurns--;
            const dealt = damageMonster(combat.bleedDamage, 'bleed');
            logMessage(t('petBleed', { monster: currentMonster.name, damage: dealt }), 'combat-hero');
            if (currentMonster.hp <= 0) {
                checkCombatProgress();
                return true;
            }
            updateMonsterUI();
        }
        if (combat.stunNext) {
            combat.stunNext = false;
            logMessage(t('petStunned', { monster: currentMonster.name }), 'special');
            combatActionLocked = false;
            updateUI();
            return true;
        }
        return false;
    }

    function tickCooldown() {
        combat.cooldown = Math.max(0, combat.cooldown - 1);
    }

    function consumeDodge() {
        const dodge = combat.dodgeNext;
        combat.dodgeNext = false;
        return dodge;
    }

    function onExplore() {
        hero.petScoutCooldown = Math.max(0, (Number(hero.petScoutCooldown) || 0) - 1);
    }

    function scout() {
        if (inCombat || gameOver || campaignComplete || pendingMistContact || pendingStoryEvent || pendingChest) return;
        const pet = activePet();
        const ability = abilityOf(pet)?.scout;
        if (!ability || (Number(hero.petScoutCooldown) || 0) > 0) return;

        const power = powerOf(pet);
        const values = { pet: petName(pet) };
        if (ability.gold) {
            const [minimum, range] = ability.gold;
            const regionBonus = 1 + currentRegion * DATA.scoutGoldRegionStep;
            values.gold = Math.round((minimum + Math.floor(Math.random() * range)) * power * regionBonus);
            hero.gold += values.gold;
        }
        if (ability.hpPercent) {
            values.hp = Math.min(
                Math.ceil(getEffectiveStat('maxHp') * ability.hpPercent * power / GAME_RULES.probabilityScale),
                getEffectiveStat('maxHp') - hero.hp
            );
            hero.hp += values.hp;
        }
        if (ability.focoPercent) {
            values.foco = Math.min(
                Math.ceil(getEffectiveStat('maxFoco') * ability.focoPercent * power / GAME_RULES.probabilityScale),
                getEffectiveStat('maxFoco') - hero.foco
            );
            hero.foco += values.foco;
        }
        if (ability.chest) {
            hero.chestChanceBonus = Math.max(hero.chestChanceBonus, EXPLORATION_RULES.map.treasureChanceBonus);
        }
        hero.petScoutCooldown = ability.cooldown;
        window.YaraMeta?.onPetCommand();
        playSprite(pet, 'hero-portrait-anchor');
        logMessage(fill(localized(ability.log), values), 'loot');
        updateUI();
    }

    function renderCompanion(pet) {
        const companion = document.getElementById('hero-pet-companion');
        companion.hidden = !pet;
        const key = pet ? `${pet.id}:${pet.instanceId}` : null;
        if (key === lastPetInstance) return;
        const isNewCompanion = Boolean(pet && lastPetInstance !== undefined);
        lastPetInstance = key;
        const avatar = document.getElementById('pet-command-avatar');
        companion.replaceChildren();
        avatar.replaceChildren();
        if (!pet) return;
        fillPetImage(companion, pet);
        fillPetImage(avatar, pet);
        if (isNewCompanion) logMessage(t('petJoined', { pet: petName(pet) }), 'special');
    }

    function render() {
        const pet = activePet();
        renderCompanion(pet);
        const button = document.getElementById('pet-command-button');
        const abilities = abilityOf(pet);
        const exploring = !document.getElementById('controls-explore').classList.contains('hidden') && !isInSpiritWorld;
        const ability = inCombat ? abilities?.command : exploring ? abilities?.scout : null;
        // O botão entra na grade ativa (exploração ou luta), logo antes da poção
        const grid = document.getElementById(inCombat ? 'controls-combat' : 'controls-explore');
        if (ability && button.parentElement !== grid) grid.insertBefore(button, grid.querySelector('.potion-action-button'));
        button.hidden = !ability;
        document.getElementById('controls-explore').classList.toggle('has-pet', Boolean(ability) && !inCombat);
        document.getElementById('controls-combat').classList.toggle('has-pet', Boolean(ability) && inCombat);
        if (!ability) return;

        const cooldown = inCombat ? combat.cooldown : Number(hero.petScoutCooldown) || 0;
        button.onclick = inCombat ? command : scout;
        button.disabled = cooldown > 0 || (inCombat && combatActionLocked);
        button.classList.toggle('pet-command-ready', !button.disabled);
        const badge = document.getElementById('pet-command-cooldown');
        badge.hidden = cooldown <= 0;
        badge.textContent = cooldown;
        button.title = `${petName(pet)} — ${localized(ability.name)}: ${inCombat ? localized(ability.description) : ''}`.replace(/: $/, '');
        document.getElementById('pet-command-name').textContent = localized(ability.name);
        document.getElementById('pet-command-detail').textContent = inCombat
            ? localized(ability.description)
            : petName(pet);
        document.getElementById('pet-command-status').textContent = cooldown > 0
            ? t(inCombat ? 'petCooldownTurns' : 'petCooldownExplorations', { count: cooldown })
            : t('petReady');
    }

    // Linhas usadas nos detalhes do item.
    function describe(item) {
        const abilities = abilityOf(item);
        if (!abilities) return [];
        const power = Math.round(powerOf(item) * 100);
        return [
            t('petItemCommand', {
                ability: localized(abilities.command.name),
                description: localized(abilities.command.description),
                cooldown: abilities.command.cooldown
            }),
            t('petItemScout', { ability: localized(abilities.scout.name), cooldown: abilities.scout.cooldown }),
            t('petItemPower', { power })
        ];
    }

    return { resetForCombat, beforeMonsterTurn, tickCooldown, consumeDodge, onExplore, command, scout, render, describe };
})();

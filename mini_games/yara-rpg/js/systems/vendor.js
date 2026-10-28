// Vendedor ambulante: evento de exploração com loja de compra e venda.
// Catálogo, preços e evento em ../data/vendor.js; frequência em ../data/exploration-rules.js (campo "vendor").
// Classic browser script; usa o estado global de game.js e é chamado por exploration.js.
window.YaraVendor = (() => {
    const VENDOR_DATA = window.YaraRpgData.vendor;
    let explorationsSinceVendor = 0;
    let stock = [];

    // ---------- Sorteio do encontro ----------
    function reset() { explorationsSinceVendor = 0; }

    // Chamado por exploreForest(): decide se o vendedor aparece nesta exploração.
    function shouldOffer() {
        // O vendedor só existe no mundo físico; o Mundo Espiritual tem encontros próprios.
        if (isInSpiritWorld) return false;
        const rules = EXPLORATION_RULES.vendor;
        explorationsSinceVendor++;
        if (explorationsSinceVendor < rules.cooldownExplorations) return false;
        if (Math.random() * GAME_RULES.probabilityScale >= rules.chance) return false;
        explorationsSinceVendor = 0;
        return true;
    }

    function createEvent() {
        logMessage(t('vendorAppears'), 'special');
        return structuredClone(VENDOR_DATA.event);
    }

    // ---------- Loja ----------
    function rollStock() {
        const pool = [...VENDOR_DATA.offers];
        const picked = [];
        const guaranteedIndex = pool.findIndex((offer) => offer.id === VENDOR_DATA.guaranteedOfferId);
        if (guaranteedIndex !== -1) picked.push(pool.splice(guaranteedIndex, 1)[0]);
        while (picked.length < VENDOR_DATA.offersPerVisit && pool.length) {
            picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
        const pricing = VENDOR_DATA.pricing;
        const regionScale = 1 + currentRegion * pricing.regionScale;
        stock = picked.map((offer) => ({
            offer,
            remaining: offer.stock,
            price: Math.round(offer.price * regionScale
                * (pricing.variationMinimum + Math.random() * (pricing.variationMaximum - pricing.variationMinimum)))
        }));
    }

    function open() {
        rollStock();
        render();
        const dialog = document.getElementById('vendor-dialog');
        if (!dialog.open) dialog.showModal();
    }

    function close() {
        const dialog = document.getElementById('vendor-dialog');
        if (dialog.open) dialog.close();
    }

    function makeElement(tag, className = '', text = '') {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== '') node.textContent = text;
        return node;
    }

    function makeIcon(source, className) {
        const box = makeElement('span', className);
        if (source.image) {
            const img = document.createElement('img');
            img.src = source.image;
            img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            img.addEventListener('error', () => img.replaceWith(document.createTextNode(source.icon || '❔')), { once: true });
            box.append(img);
        } else {
            box.textContent = source.icon || '❔';
        }
        return box;
    }

    function render() {
        document.getElementById('vendor-dialog-gold').textContent = `🪙 ${hero.gold}`;
        const portrait = makeIcon({ image: VENDOR_DATA.image, icon: '🧙' }, 'vendor-portrait');

        const buy = makeElement('div', 'meta-list');
        buy.append(makeElement('p', 'meta-progress', t('vendorIntro')), makeElement('h3', 'meta-section-title', `🛒 ${t('vendorBuyTitle')}`));
        stock.forEach((entry) => {
            const { offer } = entry;
            const row = makeElement('div', 'meta-row');
            row.append(makeElement('span', 'meta-row-icon', offer.icon));
            const text = makeElement('div', 'meta-row-text');
            text.append(
                makeElement('strong', '', offer.name[gameLanguage]),
                makeElement('span', '', `${offer.description[gameLanguage]} · ${t('vendorStock', { n: entry.remaining })}`)
            );
            row.append(text);
            const button = makeElement('button', 'meta-buy');
            button.type = 'button';
            if (entry.remaining <= 0) {
                button.textContent = t('vendorSoldOut');
                button.disabled = true;
            } else {
                button.textContent = `🪙${entry.price}`;
                button.disabled = hero.gold < entry.price;
                button.addEventListener('click', () => buyOffer(entry));
            }
            row.append(button);
            buy.append(row);
        });

        const sell = makeElement('div', 'meta-list');
        sell.append(makeElement('h3', 'meta-section-title', `💰 ${t('vendorSellTitle')}`));
        if (!hero.equipmentInventory.length) sell.append(makeElement('p', 'meta-progress', t('vendorSellEmpty')));
        hero.equipmentInventory.forEach((item) => {
            const price = getSellPrice(item);
            const row = makeElement('div', 'meta-row');
            row.append(makeIcon(item, 'meta-row-icon'));
            const text = makeElement('div', 'meta-row-text');
            text.append(
                makeElement('strong', getEquipmentRarityClass(item), getEquipmentDisplayName(item)),
                makeElement('span', '', getEquipmentRarity(item).name[gameLanguage])
            );
            row.append(text);
            const button = makeElement('button', 'meta-buy', `${t('vendorSell')} · 🪙${price}`);
            button.type = 'button';
            button.addEventListener('click', () => sellItem(item, price));
            row.append(button);
            sell.append(row);
        });
        document.getElementById('vendor-dialog-body').replaceChildren(portrait, buy, sell);
    }

    // ---------- Compra ----------
    function applyOfferEffect(effect) {
        const maxHp = getEffectiveStat('maxHp');
        const maxFoco = getEffectiveStat('maxFoco');
        switch (effect.type) {
            case 'potion':
                if (hero.potions >= hero.maxPotions) { logMessage(t('eventPotionFull')); return false; }
                hero.potions++;
                return true;
            case 'restore':
                if (hero.hp >= maxHp && hero.foco >= maxFoco) { logMessage(t('hpFull')); return false; }
                hero.hp = maxHp;
                hero.foco = maxFoco;
                return true;
            case 'stat':
                hero[effect.stat] += effect.amount;
                return true;
            case 'maxStat':
                hero[effect.stat] += effect.amount;
                hero[effect.currentStat] = Math.min(getEffectiveStat(effect.stat), hero[effect.currentStat] + effect.amount);
                return true;
            case 'cappedStat':
                hero[effect.stat] = Math.min(selectedCharacter.limits[effect.limitKey], hero[effect.stat] + effect.amount);
                return true;
            case 'skillPoints':
                hero.skillPoints = (Number(hero.skillPoints) || 0) + effect.amount;
                return true;
            case 'treasureMap':
                hero.chestChanceBonus = Math.max(hero.chestChanceBonus, EXPLORATION_RULES.map.treasureChanceBonus);
                return true;
            default:
                return false;
        }
    }

    function buyOffer(entry) {
        if (inCombat || gameOver || campaignComplete || entry.remaining <= 0 || hero.gold < entry.price) return;
        if (!applyOfferEffect(entry.offer.effect)) return;
        hero.gold -= entry.price;
        entry.remaining--;
        logMessage(t('vendorBoughtLog', { item: entry.offer.name[gameLanguage] }), 'loot');
        updateUI();
        saveGame();
        render();
    }

    // ---------- Venda ----------
    function getSellPrice(item) {
        const rarities = GAME_RULES.loot.equipmentRarities;
        const table = VENDOR_DATA.sell.byRarity;
        const index = Math.max(0, rarities.findIndex((rarity) => rarity.id === item.rarity));
        return (table[index] ?? table[table.length - 1])
            + (Number(item.upgradeLevel) || 0) * VENDOR_DATA.sell.perUpgradeLevel;
    }

    function sellItem(item, price) {
        if (inCombat || gameOver || campaignComplete) return;
        const index = hero.equipmentInventory.indexOf(item);
        if (index === -1) return;
        const rarityIndex = GAME_RULES.loot.equipmentRarities.findIndex((rarity) => rarity.id === item.rarity);
        // Itens raros pedem confirmação para evitar toque acidental.
        if (rarityIndex >= VENDOR_DATA.sell.confirmFromRarityIndex && !window.confirm(t('vendorSellConfirm', {
            item: getEquipmentDisplayName(item),
            rarity: getEquipmentRarity(item).name[gameLanguage],
            price
        }))) return;
        hero.equipmentInventory.splice(index, 1);
        selectedInventoryItems.delete(item);
        hero.gold += price;
        logMessage(t('vendorSoldLog', { item: getEquipmentDisplayName(item), price }), 'loot');
        updateUI();
        saveGame();
        render();
    }

    return { reset, shouldOffer, createEvent, open, close };
})();

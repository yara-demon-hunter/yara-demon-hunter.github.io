window.YaraMistContactSystem = Object.freeze({
    getEncounterChance(level, rules) {
        return Math.min(
            rules.maxChance,
            rules.baseChance + Math.max(0, level - 1) * rules.chancePerLevel
        );
    },

    shouldTrigger(level, rules, explorationsSinceContact, probabilityScale = 100) {
        if (explorationsSinceContact < rules.cooldownExplorations) return false;
        return Math.random() * probabilityScale < this.getEncounterChance(level, rules);
    },

    chooseContact(contacts, level) {
        const availableContacts = contacts.filter((contact) => level >= contact.minLevel);
        if (availableContacts.length === 0) return null;
        return availableContacts[Math.floor(Math.random() * availableContacts.length)];
    },

    chooseOutcome(outcomes, hasAvailableBoss, hasAvailablePower) {
        const availableOutcomes = outcomes.filter((outcome) =>
            (outcome.type !== "combat" || hasAvailableBoss)
            && (outcome.type !== "power" || hasAvailablePower)
        );
        const totalWeight = availableOutcomes.reduce((total, outcome) => total + outcome.weight, 0);
        if (totalWeight <= 0) return null;

        let roll = Math.random() * totalWeight;
        for (const outcome of availableOutcomes) {
            roll -= outcome.weight;
            if (roll < 0) return outcome;
        }
        return availableOutcomes[availableOutcomes.length - 1] ?? null;
    },

    chooseBoss(bosses, level) {
        const availableBosses = bosses.filter((boss) => level >= boss.minLevel);
        if (availableBosses.length === 0) return null;
        return availableBosses[Math.floor(Math.random() * availableBosses.length)];
    },

    choosePower(powers, unlockedPowerIds, hero) {
        const availablePowers = powers.filter((power) =>
            !unlockedPowerIds.includes(power.id)
            && (power.max === undefined || hero[power.stat] < power.max)
        );
        if (availablePowers.length === 0) return null;
        return availablePowers[Math.floor(Math.random() * availablePowers.length)];
    }
});

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

    chooseContact(contacts, level, hero, pactCatalog, seenContactIds = []) {
        const availablePactIds = pactCatalog
            .filter((pact) => !hero.monsterPacts.includes(pact.id))
            .map((pact) => pact.id);
        const availableContacts = contacts.filter((contact) =>
            level >= contact.minLevel
            && (!contact.oncePerGame || !seenContactIds.includes(contact.id))
            && (contact.onAccept?.type !== "pact" || availablePactIds.length > 0)
        );
        if (availableContacts.length === 0) return null;

        const forcedContacts = availableContacts.filter((contact) =>
            Number(contact.chancePercent) >= 100
        );
        if (forcedContacts.length) {
            return forcedContacts[Math.floor(Math.random() * forcedContacts.length)];
        }

        const weightedContacts = availableContacts.map((contact) => ({
            contact,
            weight: Math.max(0, Number(contact.chancePercent) || 0)
        }));
        const totalWeight = weightedContacts.reduce((total, entry) => total + entry.weight, 0);
        if (totalWeight <= 0) return null;

        let roll = Math.random() * totalWeight;
        for (const entry of weightedContacts) {
            roll -= entry.weight;
            if (roll < 0) return entry.contact;
        }
        return weightedContacts[weightedContacts.length - 1].contact;
    },

    chooseOutcome(outcomes, hasAvailableBoss, hasAvailablePassiveSkill) {
        const availableOutcomes = outcomes.filter((outcome) =>
            (outcome.type !== "combat" || hasAvailableBoss)
            && (outcome.type !== "passive-skill" || hasAvailablePassiveSkill)
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
        const availableBosses = bosses.filter((boss) => !boss.isFinalBoss && level >= boss.minLevel);
        if (availableBosses.length === 0) return null;
        return availableBosses[Math.floor(Math.random() * availableBosses.length)];
    },

    choosePassiveSkill(passiveSkills, unlockedPassiveSkillIds, hero) {
        const availableSkills = passiveSkills.filter((skill) =>
            !unlockedPassiveSkillIds.includes(skill.id)
            && (skill.max === undefined || hero[skill.stat] < skill.max)
        );
        if (availableSkills.length === 0) return null;
        return availableSkills[Math.floor(Math.random() * availableSkills.length)];
    }
});

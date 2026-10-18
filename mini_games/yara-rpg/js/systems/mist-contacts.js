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

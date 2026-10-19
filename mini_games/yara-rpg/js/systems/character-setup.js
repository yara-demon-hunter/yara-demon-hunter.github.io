window.YaraRpgCharacterSetup = (() => {
    const CHARACTER_DATA = window.YaraRpgData.characters;
    const EQUIPMENT_BY_ID = new Map(window.YaraRpgData.items.equipment.map((item) => [item.id, item]));
    const BASIC_STAT_KEYS = Object.freeze({
        maxHp: "hpStat",
        maxFoco: "focusStat",
        atk: "attackStat",
        def: "defenseStat",
        evasion: "evasionStat",
        parry: "parryStat",
        stunChance: "stun",
        criticalChance: "criticalChance",
        criticalDamage: "criticalDamageStat"
    });
    const PROGRESSION_STAT_KEYS = Object.freeze({
        maxHp: "hpStat",
        maxFoco: "focusStat",
        maxPotions: "potionCapacity",
        criticalChance: "criticalChance",
        atk: "attackStat",
        def: "defenseStat",
        evasion: "evasionStat",
        parry: "parryStat",
        stunChance: "stun"
    });
    const PERCENTAGE_SPECIALTY_STATS = new Set(["evasion", "parry", "stunChance", "criticalChance", "criticalDamage"]);
    const SKILL_PRESENTATION = Object.freeze({
        heavyAttack: { name: "heavyAttackName", description: "heavySkillDetails" },
        parry: { name: "parrySkillName", description: "parrySkillDetails" },
        dodge: { name: "dodgeSkillName", description: "dodgeSkillDetails" }
    });
    const LIMIT_PRESENTATION = Object.freeze({
        maxEvasion: { name: "evasionStat", suffix: "%" },
        maxParry: { name: "parryStat", suffix: "%" },
        maxStunChance: { name: "stun", suffix: "%" },
        minFuryThreshold: { name: "minimumFury", suffix: "" },
        maxPotions: { name: "maximumPotions", suffix: "" },
        maxCriticalChance: { name: "maximumCriticalChance", suffix: "%" }
    });
    let selectedCharacterId = null;
    let translate = (key) => key;
    let describeEquipment = () => "";
    let onStart = () => {};

    function renderCharacters() {
        const container = document.getElementById("character-options");
        container.replaceChildren();

        CHARACTER_DATA.forEach((character) => {
            const card = document.createElement("div");
            const selected = character.id === selectedCharacterId;
            card.className = `character-option${selected ? " is-selected" : ""}`;

            const selectButton = document.createElement("button");
            selectButton.type = "button";
            selectButton.className = "character-option-select";
            selectButton.dataset.characterId = character.id;
            selectButton.setAttribute("aria-pressed", String(selected));

            const portrait = document.createElement("span");
            portrait.className = "character-option-icon";
            portrait.setAttribute("aria-hidden", "true");
            if (character.image) {
                const image = document.createElement("img");
                image.src = character.image;
                image.alt = "";
                image.loading = "lazy";
                image.addEventListener("error", () => {
                    portrait.replaceChildren(document.createTextNode(character.icon));
                }, { once: true });
                portrait.append(image);
            } else {
                portrait.textContent = character.icon;
            }

            const name = document.createElement("span");
            name.className = "character-option-name";
            name.textContent = character.name;

            const description = document.createElement("span");
            description.className = "character-option-description";
            description.textContent = character.description[document.documentElement.lang.startsWith("en") ? "en" : "pt"];

            const progression = createDetailsSection("progressionSummary", "character-option-progression");
            appendStatList(progression, character.progression, PROGRESSION_STAT_KEYS);

            const skills = createDetailsSection("skillsSummary", "character-option-skills");
            const skillsList = document.createElement("ul");
            skillsList.className = "character-details-list character-skills-list";
            Object.entries(character.skills).forEach(([skill, values]) => {
                const presentation = SKILL_PRESENTATION[skill];
                if (!presentation) throw new Error(`Unknown character skill: ${skill}`);
                const item = document.createElement("li");
                const name = document.createElement("strong");
                name.textContent = translate(presentation.name);
                const description = document.createElement("span");
                description.textContent = translate(presentation.description, values);
                item.append(name, description);
                skillsList.append(item);
            });
            skills.append(skillsList);

            const limits = createDetailsSection("limitsSummary", "character-option-limits");
            const limitsList = document.createElement("ul");
            limitsList.className = "character-details-list character-limits-list";
            Object.entries(character.limits).forEach(([limit, amount]) => {
                const presentation = LIMIT_PRESENTATION[limit];
                if (!presentation) throw new Error(`Unknown character limit: ${limit}`);
                const item = document.createElement("li");
                const name = document.createElement("strong");
                name.textContent = translate(presentation.name);
                const value = document.createElement("span");
                value.textContent = `${amount}${presentation.suffix}`;
                item.append(name, value);
                limitsList.append(item);
            });
            limits.append(limitsList);

            const basicStatsSummary = document.createElement("p");
            basicStatsSummary.className = "character-option-specialty";
            basicStatsSummary.textContent = Object.entries(character.basicStats)
                .map(([stat, amount]) => {
                    const statKey = BASIC_STAT_KEYS[stat];
                    if (!statKey) throw new Error(`Unknown character basic stat: ${stat}`);
                    const formattedAmount = PERCENTAGE_SPECIALTY_STATS.has(stat) ? `${amount}%` : amount;
                    return translate("characterSpecialty", {
                        stat: translate(statKey),
                        amount: formattedAmount
                    });
                })
                .join(" · ");

            const passiveSummary = document.createElement("p");
            passiveSummary.className = "character-option-passive";
            if (character.passive) {
                const language = document.documentElement.lang.startsWith("en") ? "en" : "pt";
                const passiveLabel = translateForLanguage(language, language === "en" ? "Passive" : "Passiva");
                const passiveName = translateForLanguage(language, character.passive.name[language]);
                const passiveDescription = translateForLanguage(language, character.passive.description[language]);
                passiveSummary.textContent = `${passiveLabel}: ${character.passive.icon} ${passiveName} — ${passiveDescription}`;
            }

            const extraInfo = document.createElement("details");
            extraInfo.className = "character-option-extra";
            const extraInfoSummary = document.createElement("summary");
            extraInfoSummary.textContent = translate("characterExtraInfo");
            extraInfo.append(extraInfoSummary, progression, skills, limits);

            selectButton.append(portrait, name, description, basicStatsSummary, passiveSummary);
            selectButton.addEventListener("click", () => {
                selectedCharacterId = character.id;
                renderCharacters();
                document.getElementById("begin-adventure-button").disabled = false;
            });
            card.append(selectButton, extraInfo);
            container.append(card);
        });
    }

    function createDetailsSection(titleKey, className) {
        const section = document.createElement("section");
        section.className = `character-details-section ${className}`;
        const title = document.createElement("h4");
        title.className = "character-details-title";
        title.textContent = translate(titleKey);
        section.append(title);
        return section;
    }

    function appendStatList(section, stats, statKeys) {
        const list = document.createElement("ul");
        list.className = "character-details-list";
        Object.entries(stats).filter(([, amount]) => amount !== 0).forEach(([stat, amount]) => {
            const statKey = statKeys[stat];
            if (!statKey) throw new Error(`Unknown character stat: ${stat}`);
            const formattedAmount = PERCENTAGE_SPECIALTY_STATS.has(stat)
                ? `${amount}%`
                : amount;
            const item = document.createElement("li");
            item.textContent = translate("characterSpecialty", {
                stat: translate(statKey),
                amount: formattedAmount
            });
            list.append(item);
        });
        section.append(list);
    }

    function beginAdventure() {
        const character = CHARACTER_DATA.find(({ id }) => id === selectedCharacterId);
        if (!character) throw new Error(`Unknown starting character: ${selectedCharacterId}`);
        const equipment = (character.startingEquipment || []).map((id) => {
            const item = EQUIPMENT_BY_ID.get(id);
            if (!item) throw new Error(`Unknown starter equipment for ${character.id}: ${id}`);
            return item;
        });
        onStart({ character, equipment });
    }

    function initialize(options) {
        translate = options.translate;
        describeEquipment = options.describeEquipment;
        onStart = options.onStart;
        document.getElementById("begin-adventure-button").addEventListener("click", beginAdventure);
        renderCharacters();
    }

    return Object.freeze({ initialize });
})();

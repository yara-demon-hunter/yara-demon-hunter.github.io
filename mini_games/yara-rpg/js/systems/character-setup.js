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
    let viewedCharacterId = null;
    let translate = (key) => key;
    let describeEquipment = () => "";
    let isUnlocked = (character) => character.unlocked !== false;
    let onStart = () => {};

    function renderCharacters() {
        const container = document.getElementById("character-options");
        container.replaceChildren();

        CHARACTER_DATA.forEach((character) => {
            const unlocked = isUnlocked(character);
            const selected = character.id === viewedCharacterId;

            const tile = document.createElement("button");
            tile.type = "button";
            tile.className = `character-tile${selected ? " is-selected" : ""}${unlocked ? "" : " is-locked"}`;
            tile.dataset.characterId = character.id;
            tile.setAttribute("aria-pressed", String(selected));
            if (!unlocked) {
                tile.setAttribute("aria-label", `${character.name}. ${translate("characterLocked")}`);
                tile.title = translate("characterLocked");
            }

            const name = document.createElement("span");
            name.className = "character-tile-name";
            name.textContent = character.name;
            tile.append(createPortrait(character, "character-tile-portrait"), name);
            if (!unlocked) {
                const lock = document.createElement("span");
                lock.className = "character-tile-lock";
                lock.setAttribute("aria-hidden", "true");
                lock.textContent = "🔒";
                tile.append(lock);
            }

            tile.addEventListener("click", () => {
                viewedCharacterId = character.id;
                if (unlocked) selectedCharacterId = character.id;
                renderCharacters();
            });
            container.append(tile);
        });

        const viewed = CHARACTER_DATA.find(({ id }) => id === viewedCharacterId);
        document.getElementById("begin-adventure-button").disabled = !viewed || !isUnlocked(viewed);
        renderDetail(viewed);
    }

    function createPortrait(character, className) {
        const portrait = document.createElement("span");
        portrait.className = className;
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
        return portrait;
    }

    function renderDetail(character) {
        const panel = document.getElementById("character-detail");
        panel.replaceChildren();
        if (!character) return;
        const language = document.documentElement.lang.startsWith("en") ? "en" : "pt";

        const header = document.createElement("header");
        header.className = "character-detail-header";
        const title = document.createElement("div");
        const name = document.createElement("h3");
        name.className = "character-detail-name";
        name.textContent = character.name;
        const description = document.createElement("p");
        description.className = "character-detail-description";
        description.textContent = character.description[language];
        title.append(name, description);
        header.append(createPortrait(character, "character-detail-portrait"), title);

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

        panel.classList.toggle("is-locked", !isUnlocked(character));
        if (!isUnlocked(character)) {
            const lockedNotice = document.createElement("p");
            lockedNotice.className = "character-detail-lock";
            lockedNotice.textContent = `🔒 ${translate("characterLocked")}`;
            panel.append(header, lockedNotice);
            return;
        }
        panel.append(header, basicStatsSummary);

        if (character.passive) {
            const passiveSummary = document.createElement("p");
            passiveSummary.className = "character-option-passive";
            const passiveLabel = translateForLanguage(language, language === "en" ? "Passive" : "Passiva");
            const passiveName = translateForLanguage(language, character.passive.name[language]);
            const passiveDescription = translateForLanguage(language, character.passive.description[language]);
            passiveSummary.textContent = `${passiveLabel}: ${character.passive.icon} ${passiveName} — ${passiveDescription}`;
            panel.append(passiveSummary);
        }

        const progression = createDetailsSection("progressionSummary", "character-option-progression");
        appendStatList(progression, character.progression, PROGRESSION_STAT_KEYS);

        const skills = createDetailsSection("skillsSummary", "character-option-skills");
        const skillsList = document.createElement("ul");
        skillsList.className = "character-details-list character-skills-list";
        Object.entries(character.skills).forEach(([skill, values]) => {
            const presentation = SKILL_PRESENTATION[skill];
            if (!presentation) throw new Error(`Unknown character skill: ${skill}`);
            const item = document.createElement("li");
            const skillName = document.createElement("strong");
            skillName.textContent = translate(presentation.name);
            const skillDescription = document.createElement("span");
            skillDescription.textContent = translate(presentation.description, values);
            item.append(skillName, skillDescription);
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
            const limitName = document.createElement("strong");
            limitName.textContent = translate(presentation.name);
            const value = document.createElement("span");
            value.textContent = `${amount}${presentation.suffix}`;
            item.append(limitName, value);
            limitsList.append(item);
        });
        limits.append(limitsList);

        panel.append(progression, skills, limits);
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
        if (!character || !isUnlocked(character)) return;
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
        isUnlocked = options.isUnlocked || isUnlocked;
        onStart = options.onStart;
        document.getElementById("begin-adventure-button").addEventListener("click", beginAdventure);
        const firstUnlocked = CHARACTER_DATA.find(isUnlocked);
        if (firstUnlocked) {
            selectedCharacterId = firstUnlocked.id;
            viewedCharacterId = firstUnlocked.id;
        }
        renderCharacters();
    }

    return Object.freeze({ initialize });
})();

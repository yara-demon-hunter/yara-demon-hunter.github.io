window.YaraRpgCharacterSetup = (() => {
    const CHARACTER_DATA = window.YaraRpgData.characters;
    const EQUIPMENT_DATA = window.YaraRpgData.items.equipment.filter((item) => item.starter === true);
    const EQUIPMENT_BY_ID = new Map(EQUIPMENT_DATA.map((item) => [item.id, item]));
    const SELECTION_LIMIT = window.YaraRpgData.setup.starterEquipmentCount;
    const BASIC_STAT_KEYS = Object.freeze({
        maxHp: "hpStat",
        maxFoco: "focusStat",
        atk: "attackStat",
        def: "defenseStat",
        evasion: "evasionStat",
        parry: "parryStat",
        stunChance: "stun"
    });
    const PROGRESSION_STAT_KEYS = Object.freeze({
        maxHp: "hpStat",
        maxFoco: "focusStat",
        maxPotions: "potions",
        atk: "attackStat",
        def: "defenseStat",
        evasion: "evasionStat",
        parry: "parryStat",
        stunChance: "stun"
    });
    const PERCENTAGE_SPECIALTY_STATS = new Set(["evasion", "parry", "stunChance"]);
    let selectedCharacterId = CHARACTER_DATA[0].id;
    let selectedEquipmentIds = [];
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

            const basicStats = document.createElement("p");
            basicStats.className = "character-option-specialty";
            basicStats.textContent = `${translate("basicStatsSummary")}: ${Object.entries(character.basicStats)
                .map(([stat, amount]) => {
                    const statKey = BASIC_STAT_KEYS[stat];
                    if (!statKey) throw new Error(`Unknown character basic stat: ${stat}`);
                    const formattedAmount = PERCENTAGE_SPECIALTY_STATS.has(stat)
                        ? `${amount}%`
                        : amount;
                    return translate("characterSpecialty", {
                        stat: translate(statKey),
                        amount: formattedAmount
                    });
                })
                .join(" · ")}`;

            const progression = document.createElement("p");
            progression.className = "character-option-progression";
            progression.textContent = `${translate("progressionSummary")}: ${Object.entries(character.progression)
                .filter(([stat]) => stat !== "evasionLimit")
                .map(([stat, amount]) => {
                    const statKey = PROGRESSION_STAT_KEYS[stat];
                    if (!statKey) throw new Error(`Unknown level-up stat: ${stat}`);
                    const formattedAmount = PERCENTAGE_SPECIALTY_STATS.has(stat)
                        ? `${amount}%`
                        : amount;
                    return translate("characterSpecialty", {
                        stat: translate(statKey),
                        amount: formattedAmount
                    });
                })
                .join(" · ")}`;

            const skills = document.createElement("p");
            skills.className = "character-option-skills";
            skills.textContent = `${translate("skillsSummary")}: ${[
                translate("heavySkillSummary", {
                    cost: character.skills.heavyAttack.focoCost,
                    damage: character.skills.heavyAttack.attackMultiplier
                }),
                translate("parrySkillSummary", {
                    cost: character.skills.parry.focoCost,
                    bonus: character.skills.parry.bonus
                }),
                translate("dodgeSkillSummary", {
                    cost: character.skills.dodge.focoCost,
                    bonus: character.skills.dodge.bonus
                }),
            ].join(" · ")}`;

            const limits = document.createElement("p");
            limits.className = "character-option-limits";
            limits.textContent = translate("skillLimitsSummary", {
                evasion: character.limits.maxEvasion,
                parry: character.limits.maxParry,
                stun: character.limits.maxStunChance,
                fury: character.limits.minFuryThreshold
            });

            const extraInfo = document.createElement("details");
            extraInfo.className = "character-option-extra";
            const extraInfoSummary = document.createElement("summary");
            extraInfoSummary.textContent = translate("characterExtraInfo");
            extraInfo.append(extraInfoSummary, basicStats, progression, skills, limits);

            selectButton.append(portrait, name, description, basicStats.cloneNode(true));
            selectButton.addEventListener("click", () => {
                selectedCharacterId = character.id;
                renderCharacters();
                container.querySelector(`[data-character-id="${character.id}"]`).focus();
            });
            card.append(selectButton, extraInfo);
            container.append(card);
        });
    }

    function renderEquipment() {
        const container = document.getElementById("starter-equipment-options");
        container.replaceChildren();

        EQUIPMENT_DATA.forEach((item) => {
            const selectedIndex = selectedEquipmentIds.indexOf(item.id);
            const selected = selectedIndex !== -1;
            const card = document.createElement("button");
            card.type = "button";
            card.className = `starter-equipment-option${selected ? " is-selected" : ""}`;
            card.disabled = !selected
                && selectedEquipmentIds.length >= SELECTION_LIMIT;
            card.classList.toggle("is-unavailable", card.disabled);
            card.setAttribute("aria-pressed", String(selected));
            card.setAttribute("aria-label", `${item.name[document.documentElement.lang.startsWith("en") ? "en" : "pt"]}: ${describeEquipment(item)}`);

            const icon = document.createElement("span");
            icon.className = "starter-equipment-icon";
            icon.setAttribute("aria-hidden", "true");
            if (item.image) {
                const image = document.createElement("img");
                image.src = item.image;
                image.alt = "";
                image.className = "equipment-icon-image";
                image.addEventListener("error", () => {
                    icon.textContent = item.icon;
                }, { once: true });
                icon.append(image);
            } else {
                icon.textContent = item.icon;
            }

            const details = document.createElement("span");
            details.className = "starter-equipment-details";

            const name = document.createElement("span");
            name.className = "starter-equipment-name";
            name.textContent = item.name[document.documentElement.lang.startsWith("en") ? "en" : "pt"];

            const bonus = document.createElement("span");
            bonus.className = "starter-equipment-bonus";
            bonus.textContent = describeEquipment(item);

            const selection = document.createElement("span");
            selection.className = "starter-equipment-selection";
            selection.setAttribute("aria-hidden", "true");
            selection.textContent = selected ? String(selectedIndex + 1) : "+";

            details.append(name, bonus);
            card.append(icon, details, selection);
            card.addEventListener("click", () => toggleEquipment(item));
            container.append(card);
        });

        const selectionTitle = translate("selectStarterEquipment", { count: SELECTION_LIMIT });
        document.getElementById("equipment-selection-title").textContent = selectionTitle;
        document.getElementById("starter-equipment-count").textContent =
            `${selectedEquipmentIds.length}/${SELECTION_LIMIT}`;
        document.getElementById("starter-equipment-options").setAttribute("aria-label", selectionTitle);
        document.getElementById("begin-adventure-button").disabled =
            selectedEquipmentIds.length !== SELECTION_LIMIT;
    }

    function toggleEquipment(item) {
        const selectedIndex = selectedEquipmentIds.indexOf(item.id);
        if (selectedIndex !== -1) {
            selectedEquipmentIds.splice(selectedIndex, 1);
        } else {
            const conflictingIds = selectedEquipmentIds.filter((id) =>
                starterEquipmentConflicts(item, EQUIPMENT_BY_ID.get(id))
            );
            if (conflictingIds.length) {
                selectedEquipmentIds = selectedEquipmentIds.filter((id) => !conflictingIds.includes(id));
            }
            if (selectedEquipmentIds.length < SELECTION_LIMIT) {
                const candidateIds = [...selectedEquipmentIds, item.id];
                const candidateItems = candidateIds.map((id) => EQUIPMENT_BY_ID.get(id));
                if (getStarterEquipmentSlots(candidateItems)) selectedEquipmentIds = candidateIds;
            }
        }
        renderEquipment();
    }

    function starterEquipmentConflicts(first, second) {
        if (first.slot === second.slot) {
            const bothOneHandedWeapons = first.itemType === "weapon"
                && second.itemType === "weapon"
                && first.handUsage !== "two-handed"
                && second.handUsage !== "two-handed";
            if (bothOneHandedWeapons && first.slot === "mainHand") return false;
            return true;
        }
        return (first.slot === "mainHand" && first.handUsage === "two-handed" && second.slot === "offHand")
            || (second.slot === "mainHand" && second.handUsage === "two-handed" && first.slot === "offHand");
    }

    function getStarterEquipmentSlots(items) {
        const occupiedSlots = new Set();
        const assignments = [];
        for (const item of items) {
            let slot = item.slot;
            if (item.itemType === "weapon" && item.handUsage !== "two-handed" && occupiedSlots.has(slot)) {
                slot = slot === "mainHand" ? "offHand" : "mainHand";
            }
            const requiredSlots = item.handUsage === "two-handed" ? ["mainHand", "offHand"] : [slot];
            if (requiredSlots.some((requiredSlot) => occupiedSlots.has(requiredSlot))) return null;
            requiredSlots.forEach((requiredSlot) => occupiedSlots.add(requiredSlot));
            assignments.push({ item, slot });
        }
        return assignments;
    }

    function beginAdventure() {
        if (selectedEquipmentIds.length !== SELECTION_LIMIT) return;
        const selectedItems = selectedEquipmentIds.map((id) => {
            const item = EQUIPMENT_BY_ID.get(id);
            if (!item) throw new Error(`Unknown starter equipment: ${id}`);
            return item;
        });
        const equipmentSlots = getStarterEquipmentSlots(selectedItems);
        if (!equipmentSlots) return;
        const equipment = equipmentSlots.map(({ item, slot }) =>
            slot === item.slot ? item : { ...item, slot }
        );
        const character = CHARACTER_DATA.find(({ id }) => id === selectedCharacterId);
        if (!character) throw new Error(`Unknown starting character: ${selectedCharacterId}`);
        onStart({ character, equipment });
    }

    function initialize(options) {
        const availableStarterSlots = new Set(EQUIPMENT_DATA.map((item) => item.slot)).size;
        if (!Number.isInteger(SELECTION_LIMIT) || SELECTION_LIMIT < 1 || SELECTION_LIMIT > availableStarterSlots) {
            throw new Error(`Starter equipment count must be between 1 and ${availableStarterSlots}.`);
        }
        translate = options.translate;
        describeEquipment = options.describeEquipment;
        onStart = options.onStart;
        document.getElementById("begin-adventure-button").addEventListener("click", beginAdventure);
        renderCharacters();
        renderEquipment();
    }

    return Object.freeze({ initialize });
})();

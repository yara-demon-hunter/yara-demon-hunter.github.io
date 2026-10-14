window.YaraRpgCharacterSetup = (() => {
    const CHARACTER_DATA = window.YaraRpgData.characters;
    const EQUIPMENT_DATA = window.YaraRpgData.items.equipment.filter((item) => item.starter === true);
    const EQUIPMENT_BY_ID = new Map(EQUIPMENT_DATA.map((item) => [item.id, item]));
    const SPECIALTY_STAT_KEYS = Object.freeze({
        maxHp: "hpStat",
        maxFoco: "focusStat",
        atk: "attackStat",
        def: "defenseStat",
        evasion: "evasionStat",
        parry: "parryStat",
        stunChance: "stun"
    });
    const LEVEL_UP_STAT_KEYS = Object.freeze({
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
    const SELECTION_LIMIT = 3;

    let selectedCharacterId = CHARACTER_DATA[0].id;
    let selectedEquipmentIds = [];
    let translate = (key) => key;
    let describeEquipment = () => "";
    let onStart = () => {};

    function renderCharacters() {
        const container = document.getElementById("character-options");
        container.replaceChildren();

        CHARACTER_DATA.forEach((character) => {
            const card = document.createElement("button");
            const selected = character.id === selectedCharacterId;
            card.type = "button";
            card.className = `character-option${selected ? " is-selected" : ""}`;
            card.dataset.characterId = character.id;
            card.setAttribute("aria-pressed", String(selected));

            const portrait = document.createElement("span");
            portrait.className = "character-option-icon";
            portrait.setAttribute("aria-hidden", "true");
            portrait.textContent = character.icon;

            const name = document.createElement("span");
            name.className = "character-option-name";
            name.textContent = character.name;

            const description = document.createElement("span");
            description.className = "character-option-description";
            description.textContent = character.description[document.documentElement.lang.startsWith("en") ? "en" : "pt"];

            const specialty = document.createElement("span");
            specialty.className = "character-option-specialty";
            specialty.textContent = Object.entries(character.specialty)
                .map(([stat, amount]) => {
                    const statKey = SPECIALTY_STAT_KEYS[stat];
                    if (!statKey) throw new Error(`Unknown character specialty stat: ${stat}`);
                    const formattedAmount = PERCENTAGE_SPECIALTY_STATS.has(stat)
                        ? `${amount}%`
                        : amount;
                    return translate("characterSpecialty", {
                        stat: translate(statKey),
                        amount: formattedAmount
                    });
                })
                .join(" · ");

            const progression = document.createElement("span");
            progression.className = "character-option-progression";
            progression.textContent = `${translate("levelUpSummary")}: ${Object.entries(character.levelUp)
                .filter(([stat]) => stat !== "evasionLimit")
                .map(([stat, amount]) => {
                    const statKey = LEVEL_UP_STAT_KEYS[stat];
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

            const skills = document.createElement("span");
            skills.className = "character-option-skills";
            skills.textContent = [
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
                translate("skillLimitsSummary", {
                    evasion: character.skills.maxEvasion,
                    parry: character.skills.maxParry
                })
            ].join(" · ");

            card.append(portrait, name, description, specialty, progression, skills);
            card.addEventListener("click", () => {
                selectedCharacterId = character.id;
                renderCharacters();
                container.querySelector(`[data-character-id="${character.id}"]`).focus();
            });
            container.append(card);
        });
    }

    function renderEquipment() {
        const container = document.getElementById("starter-equipment-options");
        container.replaceChildren();

        EQUIPMENT_DATA.forEach((item) => {
            const selectedIndex = selectedEquipmentIds.indexOf(item.id);
            const selected = selectedIndex !== -1;
            const replacesSameSlot = selectedEquipmentIds.some((id) =>
                EQUIPMENT_BY_ID.get(id).slot === item.slot
            );
            const card = document.createElement("button");
            card.type = "button";
            card.className = `starter-equipment-option${selected ? " is-selected" : ""}`;
            card.disabled = !selected
                && selectedEquipmentIds.length >= SELECTION_LIMIT
                && !replacesSameSlot;
            card.setAttribute("aria-pressed", String(selected));
            card.setAttribute("aria-label", `${item.name[document.documentElement.lang.startsWith("en") ? "en" : "pt"]}: ${describeEquipment(item)}`);

            const icon = document.createElement("span");
            icon.className = "starter-equipment-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = item.icon;

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

        document.getElementById("starter-equipment-count").textContent =
            `${selectedEquipmentIds.length}/${SELECTION_LIMIT}`;
        document.getElementById("begin-adventure-button").disabled =
            selectedEquipmentIds.length !== SELECTION_LIMIT;
    }

    function toggleEquipment(item) {
        const sameSlotIndex = selectedEquipmentIds.findIndex((id) =>
            EQUIPMENT_BY_ID.get(id).slot === item.slot
        );
        const selectedIndex = selectedEquipmentIds.indexOf(item.id);
        if (selectedIndex !== -1) {
            selectedEquipmentIds.splice(selectedIndex, 1);
        } else {
            if (sameSlotIndex !== -1) {
                selectedEquipmentIds[sameSlotIndex] = item.id;
            } else if (selectedEquipmentIds.length < SELECTION_LIMIT) {
                selectedEquipmentIds.push(item.id);
            }
        }
        renderEquipment();
    }

    function showSetup() {
        document.getElementById("title-splash").hidden = true;
        document.getElementById("character-setup").hidden = false;
        document.getElementById("character-options")
            .querySelector(`[data-character-id="${selectedCharacterId}"]`)?.focus();
    }

    function showTitle() {
        document.getElementById("character-setup").hidden = true;
        document.getElementById("title-splash").hidden = false;
        document.getElementById("show-character-setup-button").focus();
    }

    function beginAdventure() {
        if (selectedEquipmentIds.length !== SELECTION_LIMIT) return;
        const equipment = selectedEquipmentIds.map((id) => {
            const item = EQUIPMENT_BY_ID.get(id);
            if (!item) throw new Error(`Unknown starter equipment: ${id}`);
            return item;
        });
        const character = CHARACTER_DATA.find(({ id }) => id === selectedCharacterId);
        if (!character) throw new Error(`Unknown starting character: ${selectedCharacterId}`);
        onStart({ character, equipment });
    }

    function initialize(options) {
        translate = options.translate;
        describeEquipment = options.describeEquipment;
        onStart = options.onStart;
        document.body.classList.add("game-start-active");

        document.getElementById("show-character-setup-button").addEventListener("click", showSetup);
        document.getElementById("title-splash").addEventListener("click", (event) => {
            if (!event.target.closest("button")) showSetup();
        });
        document.addEventListener("keydown", (event) => {
            if (document.getElementById("title-splash").hidden) return;
            if (event.target instanceof Element && event.target.closest("button, a, input, select, textarea")) return;
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                showSetup();
            }
        });
        document.getElementById("back-to-title-button").addEventListener("click", showTitle);
        document.getElementById("begin-adventure-button").addEventListener("click", beginAdventure);
        renderCharacters();
        renderEquipment();
    }

    return Object.freeze({ initialize });
})();

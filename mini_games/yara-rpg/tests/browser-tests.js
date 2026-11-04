"use strict";

const gameFrame = document.getElementById("game-under-test");
const runButton = document.getElementById("run-tests");
const resultsList = document.getElementById("test-results");
const summary = document.getElementById("test-summary");

gameFrame.addEventListener("load", () => {
    runButton.disabled = false;
    runButton.textContent = "Executar testes";
});

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function evaluateInGame(expression) {
    return gameFrame.contentWindow.eval(expression);
}

function waitForFrameLoad() {
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("Timed out waiting for the game to reload.")), 10000);
        gameFrame.addEventListener("load", () => {
            window.clearTimeout(timeout);
            resolve();
        }, { once: true });
    });
}

async function runTests() {
    runButton.disabled = true;
    resultsList.replaceChildren();
    summary.textContent = "Executando…";
    const previousStorage = Object.fromEntries(
        Object.entries(localStorage).filter(([key]) => key.startsWith("yara-rpg-"))
    );
    const tests = [];
    const test = (name, callback) => tests.push({ name, callback });

    try {
        evaluateInGame(`startAdventure({
            character: GAME_DATA.characters[0],
            equipment: GAME_DATA.characters[0].startingEquipment.map(
                (id) => GAME_DATA.items.equipment.find((item) => item.id === id)
            )
        })`);

        test("Region requirements and exploration weights are paced and valid", () => {
            const result = evaluateInGame(`(() => {
                const regions = GAME_DATA.regions.slice(0, 4);
                const monsterTargets = regions.map((region) =>
                    region.objectives.tasks.find((task) => task.id === "monsters").required
                );
                const weights = EXPLORATION_RULES.outcomes;
                const monsterWeight = weights.find(({ type }) => type === "monster").weight;
                const chestWeight = weights.find(({ type }) => type === "chest").weight;
                const totalWeight = weights.reduce((sum, outcome) => sum + outcome.weight, 0);
                let seed = 0x59415241;
                const random = () => {
                    seed = (1664525 * seed + 1013904223) >>> 0;
                    return seed / 0x100000000;
                };
                let explorationTotal = 0;
                const trials = 1500;
                for (let trial = 0; trial < trials; trial++) {
                    for (const target of monsterTargets) {
                        let monsters = 0;
                        let chestFound = false;
                        let attempts = 0;
                        while ((!chestFound || monsters < target) && attempts < 1000) {
                            const roll = random() * totalWeight;
                            if (roll < monsterWeight) monsters++;
                            else if (roll < monsterWeight + chestWeight) chestFound = true;
                            attempts++;
                        }
                        explorationTotal += attempts;
                    }
                }
                return {
                    monsterTargets,
                    totalWeight,
                    averageExplorationsPerCampaign: explorationTotal / trials,
                    simulatedCampaigns: trials
                };
            })()`);
            assert(JSON.stringify(result.monsterTargets) === JSON.stringify([4, 6, 8, 10]),
                `Unexpected regional monster goals: ${result.monsterTargets}`);
            assert(result.totalWeight === 100, `Exploration weights total ${result.totalWeight}, not 100.`);
            assert(result.averageExplorationsPerCampaign < 120,
                `Pacing simulation averaged ${result.averageExplorationsPerCampaign.toFixed(1)} explorations.`);
        });

        test("Exploration outcome boundaries match configured percentages", () => {
            const counts = evaluateInGame(`(() => {
                const previousRandom = Math.random;
                const original = {
                    potions: hero.potions,
                    maxPotions: hero.maxPotions,
                    foco: hero.foco,
                    chestChanceBonus: hero.chestChanceBonus,
                    spiritWorldUnlocked: hero.spiritWorldUnlocked,
                    maps: foundMapsByRegion
                };
                try {
                    hero.potions = 0;
                    hero.maxPotions = 1;
                    hero.foco = 0;
                    hero.chestChanceBonus = 0;
                    hero.spiritWorldUnlocked = false;
                    foundMapsByRegion = {};
                    const counts = {};
                    for (let roll = 0; roll < 100; roll++) {
                        Math.random = () => (roll + 0.5) / 100;
                        const outcome = chooseExplorationOutcome();
                        counts[outcome] = (counts[outcome] || 0) + 1;
                    }
                    return counts;
                } finally {
                    Math.random = previousRandom;
                    Object.assign(hero, {
                        potions: original.potions,
                        maxPotions: original.maxPotions,
                        foco: original.foco,
                        chestChanceBonus: original.chestChanceBonus,
                        spiritWorldUnlocked: original.spiritWorldUnlocked
                    });
                    foundMapsByRegion = original.maps;
                }
            })()`);
            const configured = evaluateInGame(`EXPLORATION_RULES.outcomes`);
            configured.forEach(({ type, weight }) => {
                assert(counts[type] === weight, `${type} rolled ${counts[type] || 0} times; expected ${weight}.`);
            });
        });

        test("Combat damage calculation honors defense and minimum damage", () => {
            const damage = evaluateInGame(`(() => {
                const previousRandom = Math.random;
                const previousMonster = currentMonster;
                try {
                    Math.random = () => 0;
                    currentMonster = { def: 5 };
                    return [
                        calculateAttackDamage(20, 1, 1, 4),
                        calculateAttackDamage(2, 1, 1, 4)
                    ];
                } finally {
                    Math.random = previousRandom;
                    currentMonster = previousMonster;
                }
            })()`);
            assert(damage[0] === 15 && damage[1] === 4,
                `Expected damage [15, 4], received [${damage.join(", ")}].`);
        });

        test("Save data restores the current journey", () => {
            const restoredGold = evaluateInGame(`(() => {
                hero.gold = 432;
                if (!saveGame()) return null;
                hero.gold = 1;
                if (!loadSavedGame(readSavedGame())) return null;
                return hero.gold;
            })()`);
            assert(restoredGold === 432, `Expected restored gold to be 432, received ${restoredGold}.`);
        });

        test("Malformed saves are rejected with a visible status", () => {
            const result = evaluateInGame(`(() => {
                localStorage.setItem(SAVE_KEY, "{");
                const invalidJsonRejected = readSavedGame() === null;
                const invalidJsonVisible = !document.getElementById("save-status").hidden;
                localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, characterId: "zeph", hero: {} }));
                const snapshot = readSavedGame();
                return {
                    invalidJsonRejected,
                    invalidJsonVisible,
                    invalidShapeRejected: snapshot === null,
                    invalidShapeVisible: !document.getElementById("save-status").hidden
                };
            })()`);
            assert(result.invalidJsonRejected && result.invalidJsonVisible
                && result.invalidShapeRejected && result.invalidShapeVisible,
            "Malformed JSON or save structure was not rejected and reported.");
        });

        test("Storage write errors are reported and do not claim success", () => {
            const result = evaluateInGame(`(() => {
                const originalSetItem = Storage.prototype.setItem;
                try {
                    Storage.prototype.setItem = function (key, value) {
                        if (key === SAVE_KEY) throw new Error("simulated storage failure");
                        return originalSetItem.call(this, key, value);
                    };
                    return {
                        saved: saveGame(),
                        visible: !document.getElementById("save-status").hidden
                    };
                } finally {
                    Storage.prototype.setItem = originalSetItem;
                }
            })()`);
            assert(result.saved === false && result.visible, "A storage write failure was not reported.");
        });

        test("Setup labeling and non-modal reward announcements are accessible", () => {
            const result = evaluateInGame(`(() => {
                const setup = document.getElementById("character-setup");
                const label = document.getElementById(setup.getAttribute("aria-labelledby"));
                const mapToast = document.getElementById("found-map-toast");
                const rewardToast = document.getElementById("passive-reward-toast");
                return {
                    setupLabelExists: Boolean(label),
                    toastsAreNotModal: [mapToast, rewardToast].every(
                        (toast) => toast.getAttribute("role") === "region"
                            && !toast.hasAttribute("aria-modal")
                    )
                };
            })()`);
            assert(result.setupLabelExists, "The setup section has no accessible label target.");
            assert(result.toastsAreNotModal, "A transient announcement is incorrectly marked modal.");
        });

        for (const { name, callback } of tests) {
            const item = document.createElement("li");
            try {
                await callback();
                item.className = "pass";
                item.textContent = `PASS — ${name}`;
            } catch (error) {
                item.className = "fail";
                item.textContent = `FAIL — ${name}: ${error.message}`;
            }
            resultsList.append(item);
        }

        test("Changing language resumes the same saved journey", async () => {
            evaluateInGame("hero.gold = 987; updateUI()");
            const loaded = waitForFrameLoad();
            gameFrame.contentWindow.document.querySelector('[data-game-language="en"]').click();
            await loaded;
            const result = evaluateInGame(`({
                language: gameLanguage,
                gold: hero.gold,
                resumed: !document.getElementById("game-main").hidden,
                resumeFlagCleared: !new URLSearchParams(location.search).has("resume")
            })`);
            assert(result.language === "en" && result.gold === 987 && result.resumed && result.resumeFlagCleared,
                `Journey did not resume correctly: ${JSON.stringify(result)}.`);
        });
        const languageItem = document.createElement("li");
        languageItem.className = "pass";
        languageItem.textContent = "PASS — Changing language resumes the same saved journey";
        resultsList.append(languageItem);
    } catch (error) {
        const item = document.createElement("li");
        item.className = "fail";
        item.textContent = `FAIL — Test setup: ${error.message}`;
        resultsList.append(item);
    } finally {
        Object.keys(localStorage)
            .filter((key) => key.startsWith("yara-rpg-"))
            .forEach((key) => localStorage.removeItem(key));
        Object.entries(previousStorage).forEach(([key, value]) => localStorage.setItem(key, value));
        const passed = [...resultsList.children].filter((item) => item.className === "pass").length;
        const failed = [...resultsList.children].length - passed;
        summary.textContent = `${passed} passed, ${failed} failed.`;
        runButton.disabled = false;
        runButton.textContent = "Executar novamente";
    }
}

runButton.addEventListener("click", runTests);

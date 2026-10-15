# Yara RPG code map

Use this page to find the smallest relevant files before changing the game.

| Change | Open these files |
| --- | --- |
| Portuguese text | `js/systems/translations-pt.js` |
| English text | `js/systems/translations-en.js` |
| Language selector or translated HTML labels | `js/systems/language.js` |
| Explore, region discovery, story events, mist encounters | `js/systems/exploration.js`; relevant values in `js/data/exploration-rules.js` or `world-rules.js` |
| Monster, character, item, region, contact content | Matching file in `js/data/` |
| Player attack or enemy turn | `js/systems/combat.js`; values in `js/data/combat-rules.js` |
| Potion, camp, escape, rewards, combat ending | `js/systems/combat-outcomes.js`; values in `js/data/world-rules.js` or `combat-rules.js` |
| Attribute upgrades | `js/systems/upgrades.js`; values in `js/data/progression-rules.js` |
| Equipment stats, instances, rarity, equip/drop rules | `js/systems/equipment-core.js`; catalog in `js/data/items.js`; values in `js/data/equipment-rules.js` |
| Equipment panels, bag, item dialogs | `js/systems/equipment-ui.js` |
| Save format or restoring a run | `js/systems/persistence.js` |
| Music and sound effects | `js/systems/audio.js` |
| Character panel, journey display, game log | `js/systems/hud.js` |
| Title screen or starter selection | `js/systems/character-setup.js`; wiring in `js/game.js` |
| New run, global state, level growth, startup | `js/game.js` |

## Loading model

`game.html` lists classic scripts in dependency order. Data scripts populate `window.YaraRpgData`; system scripts share the global browser scope; `game.js` runs last to initialize shared state and startup. Keep that order when adding scripts. There is no bundler or ES module import graph.

For a small change, read this map, the named system, and only the directly related data file. Read `game.html` only when changing script loading or page wiring.
